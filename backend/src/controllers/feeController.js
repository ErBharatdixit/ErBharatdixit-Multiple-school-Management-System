import FeeStructure from "../models/FeeStructure.js";
import FeePayment from "../models/FeePayment.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const razorpay =
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
            ? new Razorpay({
                  key_id: process.env.RAZORPAY_KEY_ID,
                  key_secret: process.env.RAZORPAY_KEY_SECRET
            })
            : null;

if (!razorpay) {
      console.warn("Razorpay keys missing. Payment features will be disabled.");
}

// @desc    Create a new fee structure
// @route   POST /api/fees/structure
// @access  Private/Admin
export const createFeeStructure = async (req, res) => {
      try {
            const { classId, type, amount, dueDate, description, academicYear, isMonthly } = req.body;

            const feeStructure = await FeeStructure.create({
                  schoolId: req.user.schoolId,
                  classId,
                  type,
                  amount,
                  dueDate,
                  description,
                  academicYear,
                  isMonthly: isMonthly || false
            });

            res.status(201).json(feeStructure);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get fee structures for a class
// @route   GET /api/fees/structure
// @access  Private
export const getFeeStructures = async (req, res) => {
      try {
            const { classId } = req.query;
            let query = { schoolId: req.user.schoolId };

            if (classId) {
                  query.classId = classId;
            }

            const structures = await FeeStructure.find(query)
                  .populate("classId", "name section")
                  .sort({ dueDate: 1 });

            res.json(structures);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Create Razorpay Order
// @route   POST /api/fees/order
// @access  Private (Student)
export const createPaymentOrder = async (req, res) => {
      try {
            const { amount } = req.body;

            if (!razorpay) {
                  return res.status(503).json({ message: "Payment gateway not configured" });
            }

            const options = {
                  amount: amount * 100, // Amount in paise
                  currency: "INR",
                  receipt: `receipt_${Date.now()}`
            };

            const order = await razorpay.orders.create(options);

            res.json(order);
      } catch (error) {
            console.error("Razorpay order error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Record a fee payment (Verify & Save)
// @route   POST /api/fees/pay
// @access  Private
export const recordPayment = async (req, res) => {
      try {
            const { studentId, feeStructureId, amount, method, transactionId, remarks, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            // Verify Signature if Online/Razorpay
            if (method === "Online" && razorpay_signature) {
                  const body = razorpay_order_id + "|" + razorpay_payment_id;

                  const expectedSignature = crypto
                        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                        .update(body.toString())
                        .digest("hex");

                  if (expectedSignature !== razorpay_signature) {
                        return res.status(400).json({ message: "Invalid payment signature" });
                  }
            }

            const payment = await FeePayment.create({
                  schoolId: req.user.schoolId,
                  studentId,
                  feeStructureId,
                  amount,
                  method,
                  transactionId: razorpay_payment_id || transactionId,
                  remarks
            });

            res.status(201).json(payment);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update a fee structure
// @route   PUT /api/fees/structure/:id
// @access  Private/Admin
export const updateFeeStructure = async (req, res) => {
      try {
            const { classId, type, amount, dueDate, description, academicYear, isMonthly } = req.body;

            const feeStructure = await FeeStructure.findById(req.params.id);

            if (!feeStructure) {
                  return res.status(404).json({ message: "Fee structure not found" });
            }

            // Check if school matches (security)
            if (feeStructure.schoolId.toString() !== req.user.schoolId.toString()) {
                  return res.status(401).json({ message: "Not authorized" });
            }

            feeStructure.classId = classId || feeStructure.classId;
            feeStructure.type = type || feeStructure.type;
            feeStructure.amount = amount || feeStructure.amount;
            feeStructure.dueDate = dueDate || feeStructure.dueDate;
            feeStructure.description = description || feeStructure.description;
            feeStructure.academicYear = academicYear || feeStructure.academicYear;
            feeStructure.isMonthly = isMonthly !== undefined ? isMonthly : feeStructure.isMonthly;

            const updatedFeeStructure = await feeStructure.save();
            res.json(updatedFeeStructure);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete a fee structure
// @route   DELETE /api/fees/structure/:id
// @access  Private/Admin
export const deleteFeeStructure = async (req, res) => {
      try {
            const feeStructure = await FeeStructure.findById(req.params.id);

            if (!feeStructure) {
                  return res.status(404).json({ message: "Fee structure not found" });
            }

            if (feeStructure.schoolId.toString() !== req.user.schoolId.toString()) {
                  return res.status(401).json({ message: "Not authorized" });
            }

            // Optional: Check for existing payments
            const existingPayments = await FeePayment.findOne({ feeStructureId: req.params.id });
            if (existingPayments) {
                  return res.status(400).json({ message: "Cannot delete fee structure with existing payments." });
            }

            await feeStructure.deleteOne();
            res.json({ message: "Fee structure removed" });

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get fee status for a student
// @route   GET /api/fees/status/:studentId
// @access  Private
export const getStudentFeeStatus = async (req, res) => {
      try {
            const studentId = req.params.studentId;

            // Security Check: Students can only view their own status
            if (req.user.role === "student" && req.user._id.toString() !== studentId) {
                  return res.status(403).json({ message: "Not authorized to view another student's fees" });
            }

            const student = await User.findById(studentId);

            if (!student) {
                  return res.status(404).json({ message: "Student not found" });
            }

            // Get all fee structures for the student's class
            const feeStructures = await FeeStructure.find({
                  schoolId: student.schoolId,
                  classId: student.classId
            }).lean();

            // Get all payments made by the student
            const payments = await FeePayment.find({
                  studentId: studentId
            }).populate("feeStructureId", "type").lean();

            let totalFees = 0;
            feeStructures.forEach(structure => {
                  if (structure.isMonthly) {
                        totalFees += structure.amount * 12; // Annual calculation for monthly fees
                  } else {
                        totalFees += structure.amount;
                  }
            });

            const totalPaid = payments.reduce((acc, curr) => acc + curr.amount, 0);
            const pendingAmount = totalFees - totalPaid;

            // Optional: Map specific payments to structures if needed, but aggregate is fine for now.

            res.json({
                  studentName: student.name,
                  classId: student.classId,
                  totalFees,
                  totalPaid,
                  pendingAmount,
                  feeStructures,
                  payments
            });

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get fee status for all students in a class
// @route   GET /api/fees/class/:classId
// @access  Private/Admin
export const getClassFeeStatus = async (req, res) => {
      try {
            const { classId } = req.params;

            // 1. Get all students in the class
            const students = await User.find({
                  classId: classId,
                  role: "student"
            }).select("name email rollNo phone");

            // 2. Get all fee structures for the class
            const feeStructures = await FeeStructure.find({
                  classId: classId
            });

            let totalClassFees = 0;
            feeStructures.forEach(structure => {
                  if (structure.isMonthly) {
                        totalClassFees += structure.amount * 12; // Annual calculation for monthly fees
                  } else {
                        totalClassFees += structure.amount;
                  }
            });

            // 3. Get all payments for these students
            // Optimization: Fetch all payments for this class's students in one go
            const studentIds = students.map(s => s._id);
            const allPayments = await FeePayment.find({
                  studentId: { $in: studentIds }
            });

            // 4. Map payments to students
            const studentFeeStatuses = students.map(student => {
                  const studentPayments = allPayments.filter(p => p.studentId.toString() === student._id.toString());
                  const totalPaid = studentPayments.reduce((acc, curr) => acc + curr.amount, 0);
                  const pendingAmount = totalClassFees - totalPaid;

                  let status = "Pending";
                  if (pendingAmount <= 0) status = "Paid";
                  else if (totalPaid > 0) status = "Partial";

                  return {
                        _id: student._id,
                        name: student.name,
                        rollNo: student.rollNo,
                        email: student.email,
                        phone: student.phone,
                        totalFees: totalClassFees,
                        totalPaid: totalPaid,
                        pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
                        status
                  };
            });

            res.json(studentFeeStatuses);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

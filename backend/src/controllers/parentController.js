import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Marks from "../models/Marks.js";
import FeePayment from "../models/FeePayment.js";
import { Route, Vehicle } from "../models/Transport.js";
import School from "../models/School.js";
import Class from "../models/Class.js"; // Ensure registered
import Subject from "../models/Subject.js"; // Ensure registered
import FeeStructure from "../models/FeeStructure.js";
import Exam from "../models/Exam.js"; // Ensure registered

export const getChildren = async (req, res) => {
      try {
            const parent = await User.findById(req.user._id).populate({
                  path: "children",
                  populate: { path: "classId" }
            });



            if (!parent) {
                  return res.status(404).json({ message: "Parent not found" });
            }

            res.json(parent.children || []);
      } catch (error) {
            console.error("getChildren Error:", error);
            res.status(500).json({ message: "Server Error", error: error.message });
      }
}

export const getChildDashboard = async (req, res) => {
      try {
            const { studentId } = req.params;
            const parentId = req.user._id;

            const parent = await User.findById(parentId);

            // Check authorization
            // We cast objectIds to string for safe comparison
            const isChild = parent.children.some(child => child.toString() === studentId);

            // Allow if parent owns the child OR if user is admin/superadmin (optional, but good for flexibility)
            const isAdmin = ["admin", "superadmin"].includes(req.user.role);

            if (!isChild && !isAdmin) {
                  return res.status(403).json({ message: "Not authorized to view this student's data" });
            }


            const student = await User.findById(studentId)
                  .populate("classId")
                  .populate("schoolId")
                  .populate({
                        path: "transport.routeId",
                        model: "Route",
                        populate: {
                              path: "vehicleId",
                              model: "Vehicle"
                        }
                  });



            if (!student) return res.status(404).json({ message: "Student not found" });

            // 1. Attendance Stats
            const totalAttendance = await Attendance.countDocuments({ studentId });

            const presentCount = await Attendance.countDocuments({ studentId, status: "present" });
            const absentCount = await Attendance.countDocuments({ studentId, status: "absent" });
            const lateCount = await Attendance.countDocuments({ studentId, status: "late" });

            const attendancePercentage = totalAttendance > 0
                  ? ((presentCount / totalAttendance) * 100).toFixed(1)
                  : 0;

            const recentAttendance = await Attendance.find({ studentId })
                  .sort({ date: -1 })
                  .limit(5);

            // 2. Recent Marks
            let recentMarks = [];
            try {
                  recentMarks = await Marks.find({ studentId })
                        .populate("subjectId")
                        .populate("examId")
                        .sort({ createdAt: -1 })
                        .limit(5);
            } catch (err) {
                  console.warn("Marks fetch failed (possibly missing model/refs):", err.message);
            }

            // 3. Fee Status (Recent payments)
            let recentPayments = [];
            let feeStats = {
                  total: 0,
                  paid: 0,
                  due: 0,
                  status: "No Dues"
            };

            try {
                  // Fetch recent payments
                  recentPayments = await FeePayment.find({ studentId })
                        .sort({ paymentDate: -1 })
                        .limit(5);

                  // Calculate Total Fees based on Class Fee Structure
                  // Fetch all fee structures for this school and class
                  const feeStructures = await FeeStructure.find({
                        schoolId: student.schoolId._id,
                        classId: student.classId._id,
                        academicYear: "2024-2025" // TODO: Make this dynamic from system settings
                  });

                  const totalFees = feeStructures.reduce((sum, fee) => sum + fee.amount, 0);

                  // Calculate Total Paid
                  const allPayments = await FeePayment.find({ studentId, status: "Completed" });
                  const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);

                  const dueFees = totalFees - totalPaid;

                  feeStats = {
                        total: totalFees,
                        paid: totalPaid,
                        due: Math.max(0, dueFees),
                        status: dueFees <= 0 && totalFees > 0 ? "Paid" : (totalPaid > 0 ? "Partial" : "Unpaid") // Fixed status logic
                  };
                  if (totalFees === 0) feeStats.status = "No Dues";


            } catch (err) {
                  console.warn("Fee fetch failed:", err.message);
            }

            // 4. Transport Info
            // Already populated in student object if transport.routeId is valid.

            const dashboardData = {
                  student: {
                        _id: student._id,
                        name: student.name,
                        role: student.role,
                        class: student.classId && student.classId.name ? `${student.classId.name} ${student.classId.section || ""}` : "N/A",
                        school: student.schoolId && student.schoolId.name ? student.schoolId.name : "N/A",
                        rollNo: student.rollNo,
                        avatar: student.avatar || null // If avatar exists
                  },
                  attendance: {
                        stats: {
                              percentage: attendancePercentage,
                              present: presentCount,
                              absent: absentCount,
                              late: lateCount,
                              total: totalAttendance
                        },
                        recent: recentAttendance
                  },
                  marks: recentMarks,
                  fees: {
                        recentPayments,
                        stats: feeStats
                  },
                  transport: student.transport || null
            };

            res.json(dashboardData);

      } catch (error) {
            console.error("Dashboard Error Detailed:", error);
            res.status(500).json({ message: "Server Error", error: error.message });
      }
}

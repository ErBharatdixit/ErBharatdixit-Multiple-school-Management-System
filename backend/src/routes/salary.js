import express from "express";
import Salary from "../models/Salary.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Generate Salary for a specific Month & Year (Admin only)
router.post("/process", protect, authorize("admin", "superadmin"), async (req, res) => {
      const { month, year } = req.body;

      try {
            // Find all eligible users (Teacher and Staff)
            const employees = await User.find({
                  role: { $in: ["teacher", "staff"] },
                  isActive: true
            });

            const salaryRecords = [];

            for (const employee of employees) {
                  const { basicSalary, allowances, deductions } = employee.salaryDetails || { basicSalary: 0, allowances: 0, deductions: 0 };
                  const totalAmount = (basicSalary || 0) + (allowances || 0) - (deductions || 0);

                  // Check if record already exists
                  const exists = await Salary.findOne({ userId: employee._id, month, year });

                  if (!exists && totalAmount > 0) {
                        salaryRecords.push({
                              userId: employee._id,
                              month,
                              year,
                              amount: totalAmount,
                              breakdown: { basicSalary, allowances, deductions },
                              status: "Pending"
                        });
                  }
            }

            if (salaryRecords.length > 0) {
                  await Salary.insertMany(salaryRecords);
                  res.status(201).json({ message: `Generated salary for ${salaryRecords.length} employees.` });
            } else {
                  res.status(200).json({ message: "Salary records up to date or no eligible employees found." });
            }

      } catch (error) {
            res.status(500).json({ message: "Failed to process salary", error: error.message });
      }
});

// Get Salary History (Admin: All, Teacher/Staff: Own)
router.get("/history", protect, async (req, res) => {
      try {
            let query = {};
            if (req.user.role === "admin" || req.user.role === "superadmin") {
                  // Admin sees all, filter by query params if needed
                  if (req.query.month) query.month = req.query.month;
                  if (req.query.year) query.year = req.query.year;
            } else {
                  // Staff/Teacher sees only their own
                  query.userId = req.user._id;
            }

            const salaries = await Salary.find(query)
                  .populate("userId", "name email role designation")
                  .sort({ createdAt: -1 });

            res.json(salaries);
      } catch (error) {
            res.status(500).json({ message: "Failed to fetch salary history", error: error.message });
      }
});

// Mark as Paid
router.put("/:id/pay", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const salary = await Salary.findById(req.params.id);
            if (!salary) return res.status(404).json({ message: "Record not found" });

            salary.status = "Paid";
            salary.paymentDate = new Date();
            await salary.save();

            res.json({ message: "Salary marked as Paid", salary });
      } catch (error) {
            res.status(500).json({ message: "Update failed", error: error.message });
      }
});

export default router;

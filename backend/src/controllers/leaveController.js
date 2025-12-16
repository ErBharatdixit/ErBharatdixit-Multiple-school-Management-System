import Leave from "../models/Leave.js";
import User from "../models/User.js";

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Student/Teacher)
export const applyLeave = async (req, res) => {
      try {
            const { startDate, endDate, type, reason } = req.body;

            const leave = await Leave.create({
                  schoolId: req.user.schoolId,
                  applicantId: req.user._id,
                  role: req.user.role,
                  startDate,
                  endDate,
                  type,
                  reason,
            });

            res.status(201).json(leave);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get my leave history
// @route   GET /api/leaves/my
// @access  Private
export const getMyLeaves = async (req, res) => {
      try {
            const leaves = await Leave.find({ applicantId: req.user._id }).sort({ createdAt: -1 });
            res.json(leaves);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all leave requests (for Admin/Teacher)
// @route   GET /api/leaves
// @access  Private (Admin/Teacher)
export const getAllLeaves = async (req, res) => {
      try {
            let query = { schoolId: req.user.schoolId };

            // If teacher, restriction logic:
            // 1. Can only see leaves of students (role: "student")
            if (req.user.role === "teacher") {
                  query.role = "student";
            }

            // Allow filtering by status
            if (req.query.status) {
                  query.status = req.query.status;
            }

            const leaves = await Leave.find(query)
                  .populate({
                        path: "applicantId",
                        select: "name email role classId",
                        populate: {
                              path: "classId",
                              select: "name section"
                        }
                  })
                  .sort({ createdAt: -1 });

            res.json(leaves);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin/Teacher)
export const updateLeaveStatus = async (req, res) => {
      try {
            const { status, rejectionReason } = req.body;
            // Populate applicantId to get classId and role
            const leave = await Leave.findById(req.params.id).populate("applicantId");

            if (!leave) {
                  return res.status(404).json({ message: "Leave not found" });
            }

            leave.status = status;
            leave.approvedBy = req.user._id;
            if (status === "Rejected" && rejectionReason) {
                  leave.rejectionReason = rejectionReason;
            }

            await leave.save();

            // Auto-mark attendance if Approved
            if (status === "Approved" && leave.applicantId?.role === "student") {
                  // Dynamic import to avoid circular dependency issues
                  const { default: Attendance } = await import("../models/Attendance.js");

                  const startDate = new Date(leave.startDate);
                  const endDate = new Date(leave.endDate);

                  // Iterate through dates
                  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                        const attendanceDate = new Date(d);
                        attendanceDate.setHours(0, 0, 0, 0);

                        await Attendance.findOneAndUpdate(
                              {
                                    studentId: leave.applicantId._id,
                                    date: attendanceDate
                              },
                              {
                                    studentId: leave.applicantId._id,
                                    classId: leave.applicantId.classId,
                                    schoolId: leave.schoolId,
                                    date: attendanceDate,
                                    status: "leave",
                                    markedBy: req.user._id,
                                    remarks: "Leave Approved"
                              },
                              { upsert: true, new: true }
                        );
                  }
            }

            res.json(leave);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

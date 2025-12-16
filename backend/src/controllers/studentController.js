import Attendance from "../models/Attendance.js";
import Marks from "../models/Marks.js";
import Subject from "../models/Subject.js";

// @desc    Get logged-in student's attendance records
// @route   GET /api/student/attendance
// @access  Private/Student
export const getMyAttendance = async (req, res) => {
      try {
            const studentId = req.user._id;

            const attendance = await Attendance.find({ studentId }).sort({ date: -1 });

            // Calculate stats
            // Calculate stats
            const totalDays = attendance.length;
            const presentDays = attendance.filter(a => a.status === "present").length;
            const absentDays = attendance.filter(a => a.status === "absent").length;
            const lateDays = attendance.filter(a => a.status === "late").length;
            const percentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

            res.json({
                  stats: {
                        totalDays,
                        presentDays,
                        absentDays,
                        lateDays,
                        percentage: percentage.toFixed(2)
                  },
                  history: attendance
            });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get logged-in student's marks
// @route   GET /api/student/marks
// @access  Private/Student
export const getMyMarks = async (req, res) => {
      try {
            const studentId = req.user._id;

            const marks = await Marks.find({ studentId })
                  .populate("subjectId", "name code")
                  .sort({ createdAt: -1 });

            res.json(marks);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

import TeacherAttendance from "../models/TeacherAttendance.js";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// @desc    Mark Teacher Attendance (Admin)
// @route   POST /api/attendance/teacher
// @access  Private/Admin
export const markTeacherAttendance = async (req, res) => {
      try {
            const { date, records } = req.body;
            // records: [{ teacherId, status, remarks }]

            if (!date || !records || !Array.isArray(records)) {
                  return res.status(400).json({ message: "Date and records array are required" });
            }

            const schoolId = req.user.schoolId;

            const bulkOps = records.map((record) => ({
                  updateOne: {
                        filter: {
                              schoolId,
                              teacherId: record.teacherId,
                              date
                        },
                        update: {
                              $set: {
                                    status: record.status, // present, absent, half-day, leave
                                    remarks: record.remarks || ""
                              }
                        },
                        upsert: true
                  }
            }));

            if (bulkOps.length > 0) {
                  await TeacherAttendance.bulkWrite(bulkOps);
            }

            res.status(200).json({ message: "Teacher attendance saved successfully" });

      } catch (error) {
            console.error("Mark Attendance Error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Attendance for All Teachers on Date (Admin)
// @route   GET /api/attendance/teacher
// @access  Private/Admin
export const getTeacherAttendanceByDate = async (req, res) => {
      try {
            const { date } = req.query;
            if (!date) return res.status(400).json({ message: "Date is required" });

            const attendance = await TeacherAttendance.find({
                  schoolId: req.user.schoolId,
                  date
            }).populate("teacherId", "name email subject"); // Assuming User has subject for teachers

            res.json(attendance);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Teacher Attendance by Month (Admin)
// @route   GET /api/attendance/teacher/monthly
// @access  Private/Admin
export const getTeacherAttendanceByMonth = async (req, res) => {
      try {
            const { month } = req.query; // YYYY-MM
            if (!month) return res.status(400).json({ message: "Month is required (YYYY-MM)" });

            // Regex to match dates starting with YYYY-MM
            const attendance = await TeacherAttendance.find({
                  schoolId: req.user.schoolId,
                  date: { $regex: `^${month}` }
            }).populate("teacherId", "name email");

            res.json(attendance);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get My Attendance (Teacher)
// @route   GET /api/attendance/teacher/me
// @access  Private/Teacher
export const getMyAttendance = async (req, res) => {
      try {
            const { month } = req.query; // Optional filter YYYY-MM
            const query = {
                  teacherId: req.user._id,
                  schoolId: req.user.schoolId
            };

            if (month) {
                  // Filter by string comparison if stored as YYYY-MM-DD
                  query.date = { $regex: `^${month}` };
            }

            const attendance = await TeacherAttendance.find(query).sort({ date: -1 });
            res.json(attendance);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// ==================== STUDENT ATTENDANCE ====================

// @desc    Mark Student Attendance (Admin)
// @route   POST /api/attendance/student
// @access  Private/Admin
export const markStudentAttendance = async (req, res) => {
      try {
            const { date, classId, records } = req.body;
            // records: [{ studentId, status, remarks }]

            if (!date || !classId || !records || !Array.isArray(records)) {
                  return res.status(400).json({ message: "Date, classId, and records array are required" });
            }

            const schoolId = req.user.schoolId;
            const markedBy = req.user._id;

            const bulkOps = records.map((record) => ({
                  updateOne: {
                        filter: {
                              schoolId,
                              classId,
                              studentId: record.studentId,
                              date
                        },
                        update: {
                              $set: {
                                    status: record.status, // present, absent, late, excused
                                    remarks: record.remarks || "",
                                    markedBy
                              }
                        },
                        upsert: true
                  }
            }));

            if (bulkOps.length > 0) {
                  await Attendance.bulkWrite(bulkOps);
            }

            res.status(200).json({ message: "Student attendance saved successfully" });

      } catch (error) {
            console.error("Mark Student Attendance Error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Student Attendance by Date and Class (Admin)
// @route   GET /api/attendance/student
// @access  Private/Admin
export const getStudentAttendanceByDate = async (req, res) => {
      try {
            const { date, classId } = req.query;
            if (!date || !classId) {
                  return res.status(400).json({ message: "Date and classId are required" });
            }

            const attendance = await Attendance.find({
                  schoolId: req.user.schoolId,
                  classId,
                  date
            }).populate("studentId", "name email rollNumber");

            res.json(attendance);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get Student Attendance by Month (Admin)
// @route   GET /api/attendance/student/monthly
// @access  Private/Admin
export const getStudentAttendanceByMonth = async (req, res) => {
      try {
            const { month, classId } = req.query; // YYYY-MM
            if (!month || !classId) return res.status(400).json({ message: "Month and Class ID are required" });

            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            const attendance = await Attendance.find({
                  schoolId: req.user.schoolId,
                  classId,
                  date: {
                        $gte: startDate,
                        $lt: endDate
                  }
            }).populate("studentId", "name email rollNumber");

            res.json(attendance);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get My Attendance (Student)
// @route   GET /api/attendance/student/me
// @access  Private/Student
export const getMyStudentAttendance = async (req, res) => {
      try {
            const studentId = req.user._id;
            const schoolId = req.user.schoolId;

            // Get all attendance records for this student
            const attendance = await Attendance.find({
                  studentId,
                  schoolId
            }).sort({ date: -1 });

            // Calculate statistics
            const stats = {
                  totalDays: attendance.length,
                  presentDays: attendance.filter(a => a.status === "present").length,
                  absentDays: attendance.filter(a => a.status === "absent").length,
                  lateDays: attendance.filter(a => a.status === "late").length,
                  excusedDays: attendance.filter(a => a.status === "excused").length
            };

            // Calculate percentage (Present + Late considered as attended)
            const attendedDays = stats.presentDays + stats.lateDays;
            stats.percentage = stats.totalDays > 0
                  ? ((attendedDays / stats.totalDays) * 100).toFixed(2)
                  : "0.00";

            res.json({
                  stats,
                  history: attendance
            });

      } catch (error) {
            console.error("Get Student Attendance Error:", error);
            res.status(500).json({ message: error.message });
      }
};

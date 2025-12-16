import Attendance from "../models/Attendance.js";
import Marks from "../models/Marks.js";

// @desc    Mark attendance for a class (Bulk Update)
// @route   POST /api/teacher/attendance
// @access  Private/Teacher/Admin
export const markAttendance = async (req, res) => {
      try {
            const { classId, date, records } = req.body;
            // records: [{ studentId, status, remarks }]

            if (!records || records.length === 0) {
                  return res.status(400).json({ message: "No attendance records provided" });
            }

            const schoolId = req.user.schoolId;
            const markedBy = req.user._id;

            // Use bulkWrite for efficiency
            const operations = records.map(record => ({
                  updateOne: {
                        filter: {
                              studentId: record.studentId,
                              date: new Date(date),
                              classId: classId
                        },
                        update: {
                              $set: {
                                    status: record.status,
                                    remarks: record.remarks || "",
                                    schoolId,
                                    markedBy
                              }
                        },
                        upsert: true
                  }
            }));

            await Attendance.bulkWrite(operations);
            res.status(200).json({ message: "Attendance marked successfully" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get attendance for a class on a specific date
// @route   GET /api/teacher/attendance/:classId
// @access  Private/Teacher/Admin
export const getAttendance = async (req, res) => {
      try {
            const { classId } = req.params;
            const { date } = req.query;

            if (!date) {
                  return res.status(400).json({ message: "Date is required" });
            }

            // Parse date to ensure we match the start of the day or exact date stored
            // The schema stores Date object. Usually it's best to store normalized date (YYYY-MM-DD set to 00:00:00Z)
            // For now assuming the frontend sends a valid date string that matches how we save (or we query range).
            // Because we used `new Date(date)` in markAttendance, we should use the same here.

            const attendance = await Attendance.find({
                  classId,
                  date: new Date(date)
            }).populate("studentId", "name email");

            res.json(attendance);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Input marks for a student
// @route   POST /api/teacher/marks
// @access  Private/Teacher/Admin
export const updateMarks = async (req, res) => {
      try {
            const { studentId, subjectId, classId, examType, marksObtained, totalMarks, remarks } = req.body;

            const marks = await Marks.findOneAndUpdate(
                  { studentId, subjectId, examType }, // Compound key to identify the record
                  {
                        classId,
                        schoolId: req.user.schoolId,
                        marksObtained,
                        totalMarks,
                        remarks,
                        enteredBy: req.user._id
                  },
                  { new: true, upsert: true, runValidators: true }
            );

            res.json(marks);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get marks for a class/subject
// @route   GET /api/teacher/marks/:classId/:subjectId
// @access  Private/Teacher/Admin
export const getMarks = async (req, res) => {
      try {
            const { classId, subjectId } = req.params;
            const { examType } = req.query;

            const query = { classId, subjectId };
            if (examType) query.examType = examType;

            const marks = await Marks.find(query)
                  .populate("studentId", "name email");

            res.json(marks);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

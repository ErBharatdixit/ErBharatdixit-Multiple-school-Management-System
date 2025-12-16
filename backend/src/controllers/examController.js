import Exam from "../models/Exam.js";
import Mark from "../models/Mark.js";
import User from "../models/User.js";

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private/Admin/Teacher
export const createExam = async (req, res) => {
      try {
            const { name, examType, subjectId, classId, date, totalMarks, passingMarks, duration, instructions } = req.body;

            const exam = await Exam.create({
                  name,
                  examType,
                  subjectId,
                  classId,
                  schoolId: req.user.schoolId,
                  date,
                  totalMarks,
                  passingMarks,
                  duration,
                  instructions
            });

            const populatedExam = await Exam.findById(exam._id)
                  .populate("subjectId", "name code")
                  .populate("classId", "name grade section");

            res.status(201).json(populatedExam);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private/Admin/Teacher/Student
export const getExams = async (req, res) => {
      try {
            const { classId, subjectId } = req.query;
            const query = { schoolId: req.user.schoolId };

            if (classId) query.classId = classId;
            if (subjectId) query.subjectId = subjectId;

            const exams = await Exam.find(query)
                  .populate("subjectId", "name code")
                  .populate("classId", "name grade section")
                  .sort({ date: -1 });

            res.json(exams);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
export const getExamById = async (req, res) => {
      try {
            const exam = await Exam.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            })
                  .populate("subjectId", "name code")
                  .populate("classId", "name grade section");

            if (!exam) {
                  return res.status(404).json({ message: "Exam not found" });
            }

            res.json(exam);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private/Admin/Teacher
export const updateExam = async (req, res) => {
      try {
            const { name, examType, date, totalMarks, passingMarks, duration, instructions } = req.body;

            const exam = await Exam.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!exam) {
                  return res.status(404).json({ message: "Exam not found" });
            }

            exam.name = name || exam.name;
            exam.examType = examType || exam.examType;
            exam.date = date || exam.date;
            exam.totalMarks = totalMarks || exam.totalMarks;
            exam.passingMarks = passingMarks || exam.passingMarks;
            exam.duration = duration || exam.duration;
            exam.instructions = instructions !== undefined ? instructions : exam.instructions;

            await exam.save();

            const updatedExam = await Exam.findById(exam._id)
                  .populate("subjectId", "name code")
                  .populate("classId", "name grade section");

            res.json(updatedExam);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
export const deleteExam = async (req, res) => {
      try {
            const exam = await Exam.findOneAndDelete({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!exam) {
                  return res.status(404).json({ message: "Exam not found" });
            }

            // Also delete all marks for this exam
            await Mark.deleteMany({ examId: req.params.id });

            res.json({ message: "Exam deleted successfully" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Enter marks for students
// @route   POST /api/exams/:id/marks
// @access  Private/Teacher/Admin
export const enterMarks = async (req, res) => {
      try {
            const { marks } = req.body; // Array of { studentId, marksObtained, remarks }
            const examId = req.params.id;

            const exam = await Exam.findOne({
                  _id: examId,
                  schoolId: req.user.schoolId
            });

            if (!exam) {
                  return res.status(404).json({ message: "Exam not found" });
            }

            const markRecords = [];

            for (const markData of marks) {
                  const percentage = (markData.marksObtained / exam.totalMarks) * 100;
                  const markModel = new Mark();
                  const grade = markModel.calculateGrade(percentage);

                  const mark = await Mark.findOneAndUpdate(
                        { studentId: markData.studentId, examId },
                        {
                              marksObtained: markData.marksObtained,
                              grade,
                              percentage: percentage.toFixed(2),
                              remarks: markData.remarks || "",
                              schoolId: req.user.schoolId,
                              enteredBy: req.user._id
                        },
                        { upsert: true, new: true }
                  ).populate("studentId", "name email rollNumber");

                  markRecords.push(mark);
            }

            res.json(markRecords);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get marks for an exam
// @route   GET /api/exams/:id/marks
// @access  Private/Teacher/Admin
export const getExamMarks = async (req, res) => {
      try {
            const marks = await Mark.find({
                  examId: req.params.id,
                  schoolId: req.user.schoolId
            })
                  .populate("studentId", "name email rollNumber")
                  .populate("examId", "name totalMarks")
                  .sort({ marksObtained: -1 });

            res.json(marks);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get student's all marks
// @route   GET /api/students/:id/marks
// @access  Private/Student/Admin/Teacher
export const getStudentMarks = async (req, res) => {
      try {
            const studentId = req.params.id;

            // Verify student belongs to same school
            const student = await User.findOne({
                  _id: studentId,
                  schoolId: req.user.schoolId,
                  role: "student"
            });

            if (!student) {
                  return res.status(404).json({ message: "Student not found" });
            }

            const marks = await Mark.find({ studentId })
                  .populate({
                        path: "examId",
                        populate: {
                              path: "subjectId",
                              select: "name code"
                        }
                  })
                  .sort({ createdAt: -1 });

            // Calculate overall statistics
            const stats = {
                  totalExams: marks.length,
                  averagePercentage: marks.length > 0
                        ? (marks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / marks.length).toFixed(2)
                        : 0,
                  highestPercentage: marks.length > 0
                        ? Math.max(...marks.map(m => parseFloat(m.percentage)))
                        : 0,
                  lowestPercentage: marks.length > 0
                        ? Math.min(...marks.map(m => parseFloat(m.percentage)))
                        : 0
            };

            res.json({ marks, stats });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get my marks (for logged-in student)
// @route   GET /api/marks/me
// @access  Private/Student
export const getMyMarks = async (req, res) => {
      try {
            const marks = await Mark.find({ studentId: req.user._id })
                  .populate({
                        path: "examId",
                        populate: {
                              path: "subjectId",
                              select: "name code"
                        }
                  })
                  .sort({ createdAt: -1 });

            // Calculate overall statistics
            const stats = {
                  totalExams: marks.length,
                  averagePercentage: marks.length > 0
                        ? (marks.reduce((sum, m) => sum + parseFloat(m.percentage), 0) / marks.length).toFixed(2)
                        : 0,
                  highestPercentage: marks.length > 0
                        ? Math.max(...marks.map(m => parseFloat(m.percentage)))
                        : 0,
                  lowestPercentage: marks.length > 0
                        ? Math.min(...marks.map(m => parseFloat(m.percentage)))
                        : 0
            };

            res.json({ marks, stats });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

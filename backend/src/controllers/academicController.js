import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

// @desc    Create a new class
// @route   POST /api/academic/class
// @access  Private/Admin
export const createClass = async (req, res) => {
      try {
            const { name, grade, section, teacherId } = req.body;

            // Check if class with same grade and section exists in this school
            const existingClass = await Class.findOne({
                  schoolId: req.user.schoolId,
                  grade,
                  section
            });

            if (existingClass) {
                  return res.status(400).json({ message: "Class with this grade and section already exists" });
            }

            const newClass = await Class.create({
                  name,
                  grade,
                  section,
                  schoolId: req.user.schoolId,
                  teacherId: teacherId || null
            });

            res.status(201).json(newClass);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update a class
// @route   PUT /api/academic/class/:id
// @access  Private/Admin
export const updateClass = async (req, res) => {
      try {
            const { name, grade, section, teacherId } = req.body;

            const classToUpdate = await Class.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!classToUpdate) {
                  return res.status(404).json({ message: "Class not found" });
            }

            // Check duplicate if grade/section changed
            if ((grade && grade !== classToUpdate.grade) || (section && section !== classToUpdate.section)) {
                  const existingClass = await Class.findOne({
                        schoolId: req.user.schoolId,
                        grade: grade || classToUpdate.grade,
                        section: section || classToUpdate.section,
                        _id: { $ne: req.params.id }
                  });

                  if (existingClass) {
                        return res.status(400).json({ message: "Class with this grade and section already exists" });
                  }
            }

            classToUpdate.name = name || classToUpdate.name;
            classToUpdate.grade = grade || classToUpdate.grade;
            classToUpdate.section = section || classToUpdate.section;
            classToUpdate.teacherId = teacherId || classToUpdate.teacherId;

            await classToUpdate.save();

            res.json(classToUpdate);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all classes for a school
// @route   GET /api/academic/classes
// @access  Private/Admin/Teacher
export const getClasses = async (req, res) => {
      try {
            const classes = await Class.find({ schoolId: req.user.schoolId })
                  .populate("teacherId", "name email")
                  .populate("students", "name email rollNumber")
                  .sort({ grade: 1, section: 1 });
            res.json(classes);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete a class
// @route   DELETE /api/academic/class/:id
// @access  Private/Admin
export const deleteClass = async (req, res) => {
      try {
            // Check if class belongs to school
            const classToDelete = await Class.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!classToDelete) {
                  return res.status(404).json({ message: "Class not found" });
            }

            await Class.deleteOne({ _id: req.params.id });
            // Optional: Delete associated subjects? For now keep it simple.

            res.json({ message: "Class deleted successfully" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Create a new subject
// @route   POST /api/academic/subject
// @access  Private/Admin
export const createSubject = async (req, res) => {
      try {
            const { name, code, classId, teacherId } = req.body;

            const existingSubject = await Subject.findOne({
                  schoolId: req.user.schoolId,
                  code
            });

            if (existingSubject) {
                  return res.status(400).json({ message: "Subject with this code already exists" });
            }

            const newSubject = await Subject.create({
                  name,
                  code,
                  classId,
                  schoolId: req.user.schoolId,
                  teacherId: teacherId || null
            });

            res.status(201).json(newSubject);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update a subject
// @route   PUT /api/academic/subject/:id
// @access  Private/Admin
export const updateSubject = async (req, res) => {
      try {
            const { name, code, classId, teacherId } = req.body;

            const subject = await Subject.findOne({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!subject) {
                  return res.status(404).json({ message: "Subject not found" });
            }

            if (code && code !== subject.code) {
                  const existingSubject = await Subject.findOne({
                        schoolId: req.user.schoolId,
                        code,
                        _id: { $ne: req.params.id }
                  });
                  if (existingSubject) {
                        return res.status(400).json({ message: "Subject with this code already exists" });
                  }
            }

            subject.name = name || subject.name;
            subject.code = code || subject.code;
            subject.classId = classId || subject.classId;
            subject.teacherId = teacherId || subject.teacherId;

            await subject.save();

            res.json(subject);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get all subjects (can filter by classId in query)
// @route   GET /api/academic/subjects
// @access  Private/Admin/Teacher/Student
export const getSubjects = async (req, res) => {
      try {
            const query = { schoolId: req.user.schoolId };

            if (req.query.classId) {
                  query.classId = req.query.classId;
            }

            const subjects = await Subject.find(query)
                  .populate("classId", "name grade section")
                  .populate("teacherId", "name");

            res.json(subjects);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete a subject
// @route   DELETE /api/academic/subject/:id
// @access  Private/Admin
export const deleteSubject = async (req, res) => {
      try {
            const subject = await Subject.findOneAndDelete({
                  _id: req.params.id,
                  schoolId: req.user.schoolId
            });

            if (!subject) {
                  return res.status(404).json({ message: "Subject not found" });
            }

            res.json({ message: "Subject deleted successfully" });
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

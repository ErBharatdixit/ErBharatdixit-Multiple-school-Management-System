import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";
import Class from "../models/Class.js";

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
export const createAssignment = async (req, res) => {
      try {


            const { title, description, classId, subjectId, dueDate, totalPoints } = req.body;

            // Check if class exists
            const classExists = await Class.findById(classId);
            if (!classExists) {
                  console.log("Class not found:", classId);
                  return res.status(404).json({ message: "Class not found" });
            }

            // Handle file uploads
            let attachments = [];
            if (req.files && req.files.length > 0) {
                  attachments = req.files.map((file) => ({
                        url: file.path,
                        publicId: file.filename,
                        name: file.originalname,
                        type: file.mimetype.startsWith("image") ? "image" : "document"
                  }));
            }

            const assignment = await Assignment.create({
                  schoolId: req.user.schoolId,
                  teacherId: req.user._id,
                  classId,
                  subjectId,
                  title,
                  description,
                  dueDate,
                  totalPoints: totalPoints || 100,
                  attachments
            });

            console.log("Assignment Created:", assignment);
            res.status(201).json(assignment);

      } catch (error) {
            console.error("Create Assignment Error Detail:", error);
            res.status(500).json({ message: error.message, stack: error.stack });
      }
};

// @desc    Get assignments (Teacher: created by me, Student: for my class)
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
      try {
            const { role, _id, schoolId } = req.user;
            let query = { schoolId };

            if (role === "teacher") {
                  query.teacherId = _id;
            } else if (role === "student") {
                  // Assuming student user object has classId. If not, we might need to find it from Student profile or similar.
                  // Based on previous contexts, students might have classId directly or via profile. 
                  // Let's assume req.user.classId exists for now, or check how to get it. 
                  // If req.user doesn't have classId, we need to pass it as query param or fetch it.
                  // Safe bet: allow passing classId as query param or filter by user's enrolled class.

                  if (req.query.classId) {
                        query.classId = req.query.classId;
                  } else if (req.user.classId) {
                        query.classId = req.user.classId;
                  } else {
                        // If we can't determine class, strictly return nothing or error?
                        // For now, let's rely on query param if student model structure is uncertain in req.user
                        if (!req.query.classId) return res.status(400).json({ message: "Class ID required" });
                        query.classId = req.query.classId;
                  }
            }

            const assignments = await Assignment.find(query)
                  .populate("classId", "name section")
                  .populate("subjectId", "name")
                  .populate("teacherId", "name")
                  .sort({ createdAt: -1 });

            res.json(assignments);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res) => {
      try {
            const assignment = await Assignment.findById(req.params.id)
                  .populate("classId", "name section")
                  .populate("subjectId", "name")
                  .populate("teacherId", "name");

            if (!assignment) {
                  return res.status(404).json({ message: "Assignment not found" });
            }

            res.json(assignment);
      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
export const updateAssignment = async (req, res) => {
      try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                  return res.status(404).json({ message: "Assignment not found" });
            }

            // Verify ownership
            if (assignment.teacherId.toString() !== req.user._id.toString()) {
                  return res.status(403).json({ message: "Not authorized to update this assignment" });
            }

            const updatedAssignment = await Assignment.findByIdAndUpdate(
                  req.params.id,
                  req.body,
                  { new: true }
            );

            res.json(updatedAssignment);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
export const deleteAssignment = async (req, res) => {
      try {
            const assignment = await Assignment.findById(req.params.id);

            if (!assignment) {
                  return res.status(404).json({ message: "Assignment not found" });
            }

            // Verify ownership
            if (assignment.teacherId.toString() !== req.user._id.toString()) {
                  return res.status(403).json({ message: "Not authorized to delete this assignment" });
            }

            await assignment.deleteOne();

            // Also delete associated submissions
            await Submission.deleteMany({ assignmentId: req.params.id });

            res.json({ message: "Assignment removed" });

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

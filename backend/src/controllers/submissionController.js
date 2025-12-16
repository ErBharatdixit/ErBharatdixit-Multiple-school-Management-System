import Submission from "../models/Submission.js";
import Assignment from "../models/Assignment.js";

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = async (req, res) => {
      try {
            const assignmentId = req.params.id;
            const studentId = req.user._id;
            const { content } = req.body;

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                  return res.status(404).json({ message: "Assignment not found" });
            }

            // Check if already submitted
            const existingSubmission = await Submission.findOne({ assignmentId, studentId });
            if (existingSubmission) {
                  return res.status(400).json({ message: "You have already submitted this assignment" });
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

            // Check submission deadline (set due date to end of day)
            const dueDate = new Date(assignment.dueDate);
            dueDate.setHours(23, 59, 59, 999);
            const isLate = new Date() > dueDate;

            const submission = await Submission.create({
                  schoolId: req.user.schoolId,
                  assignmentId,
                  studentId,
                  content,
                  attachments,
                  status: isLate ? "late" : "submitted"
            });

            res.status(201).json(submission);

      } catch (error) {
            console.error("Submit Assignment Error:", error);
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
export const getSubmissions = async (req, res) => {
      try {
            const assignmentId = req.params.id;


            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                  return res.status(404).json({ message: "Assignment not found" });
            }

            // Verify teacher ownership
            if (assignment.teacherId.toString() !== req.user._id.toString()) {
                  console.log(`[DEBUG] Authorization Failed! Assignment Teacher: ${assignment.teacherId}, User: ${req.user._id}`);
                  return res.status(403).json({ message: "Not authorized to view these submissions" });
            }

            const submissions = await Submission.find({ assignmentId })
                  .populate("studentId", "name email rollNumber")
                  .sort({ submittedAt: 1 });

            console.log(`[DEBUG] Found ${submissions.length} submissions`);
            res.json(submissions);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Teacher
export const gradeSubmission = async (req, res) => {
      try {
            const { grade, feedback } = req.body;
            const submissionId = req.params.id;

            const submission = await Submission.findById(submissionId).populate("assignmentId");
            if (!submission) {
                  return res.status(404).json({ message: "Submission not found" });
            }

            // Verify teacher ownership of the assignment
            if (submission.assignmentId.teacherId.toString() !== req.user._id.toString()) {
                  return res.status(403).json({ message: "Not authorized to grade this submission" });
            }

            submission.grade = grade;
            submission.feedback = feedback;
            submission.status = "graded";

            await submission.save();

            res.json(submission);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

// @desc    Get my submission for an assignment
// @route   GET /api/assignments/:id/my-submission
// @access  Private/Student
export const getMySubmission = async (req, res) => {
      try {
            const assignmentId = req.params.id;
            const studentId = req.user._id;

            const submission = await Submission.findOne({ assignmentId, studentId });

            if (!submission) {
                  // Return null or 404? 
                  // 200 with null is often easier for frontend to handle "no submission yet"
                  return res.json(null);
            }

            res.json(submission);

      } catch (error) {
            res.status(500).json({ message: error.message });
      }
};

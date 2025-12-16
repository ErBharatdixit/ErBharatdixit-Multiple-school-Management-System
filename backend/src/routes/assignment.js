import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
      createAssignment,
      getAssignments,
      getAssignmentById,
      updateAssignment,
      deleteAssignment
} from "../controllers/assignmentController.js";
import {
      submitAssignment,
      getSubmissions,
      gradeSubmission,
      getMySubmission
} from "../controllers/submissionController.js";

const router = express.Router();

router.use(protect); // All routes protected

router.route("/")
      .get(getAssignments)
      .post(authorize("teacher"), upload.array("files", 5), createAssignment);

router.route("/submissions/:id/grade")
      .put(authorize("teacher"), gradeSubmission);

router.route("/:id")
      .get(getAssignmentById)
      .put(authorize("teacher"), updateAssignment)
      .delete(authorize("teacher"), deleteAssignment);

// Submission Routes
router.route("/:id/submit")
      .post(authorize("student"), upload.array("files", 5), submitAssignment);

router.route("/:id/my-submission")
      .get(authorize("student"), getMySubmission);

router.route("/:id/submissions")
      .get(authorize("teacher"), getSubmissions);




export default router;

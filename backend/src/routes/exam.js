import express from "express";
import {
      createExam,
      getExams,
      getExamById,
      updateExam,
      deleteExam,
      enterMarks,
      getExamMarks,
      getStudentMarks,
      getMyMarks
} from "../controllers/examController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Exam Routes
router.post("/", protect, authorize("admin", "teacher"), createExam);
router.get("/", protect, getExams);
router.get("/:id", protect, getExamById);
router.put("/:id", protect, authorize("admin", "teacher"), updateExam);
router.delete("/:id", protect, authorize("admin"), deleteExam);

// Marks Routes
router.post("/:id/marks", protect, authorize("admin", "teacher"), enterMarks);
router.get("/:id/marks", protect, authorize("admin", "teacher"), getExamMarks);

// Student Marks Routes
router.get("/student/:id/marks", protect, getStudentMarks);
router.get("/marks/me", protect, authorize("student"), getMyMarks);

export default router;

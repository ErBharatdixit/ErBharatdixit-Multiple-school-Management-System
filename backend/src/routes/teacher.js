import express from "express";
import {
      markAttendance,
      getAttendance,
      updateMarks,
      getMarks
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Attendance Routes
router.post("/attendance", protect, authorize("teacher", "admin"), markAttendance);
router.get("/attendance/:classId", protect, authorize("teacher", "admin"), getAttendance);

// Marks Routes
router.post("/marks", protect, authorize("teacher", "admin"), updateMarks);
router.get("/marks/:classId/:subjectId", protect, authorize("teacher", "admin", "student"), getMarks);

export default router;

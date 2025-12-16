import express from "express";
import { getMyAttendance, getMyMarks } from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected and for students only
router.use(protect);
router.use(authorize("student"));

router.get("/attendance", getMyAttendance);
router.get("/marks", getMyMarks);

export default router;

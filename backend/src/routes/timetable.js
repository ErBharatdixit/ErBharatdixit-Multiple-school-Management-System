import express from "express";
import {
      createOrUpdateTimetable,
      getTimetable,
      getTeacherSchedule
} from "../controllers/timetableController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), createOrUpdateTimetable);
router.get("/teacher/me", protect, authorize("teacher"), getTeacherSchedule);
router.get("/:classId", protect, getTimetable);

export default router;

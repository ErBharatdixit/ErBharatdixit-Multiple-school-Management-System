import express from "express";
import {
      markTeacherAttendance,
      getTeacherAttendanceByDate,
      getMyAttendance,
      markStudentAttendance,
      getStudentAttendanceByDate,
      getMyStudentAttendance,

      getTeacherAttendanceByMonth,
      getStudentAttendanceByMonth
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Teacher Attendance Routes (Admin)
router.post("/teacher", protect, authorize("admin"), markTeacherAttendance);
router.get("/teacher", protect, authorize("admin"), getTeacherAttendanceByDate);
router.get("/teacher/monthly", protect, authorize("admin"), getTeacherAttendanceByMonth);

// Teacher Routes (Teacher)
router.get("/teacher/me", protect, authorize("teacher"), getMyAttendance);

// Student Attendance Routes (Teacher & Admin)
router.post("/student", protect, authorize("teacher", "admin"), markStudentAttendance);
router.get("/student", protect, authorize("teacher", "admin"), getStudentAttendanceByDate);
router.get("/student/monthly", protect, authorize("teacher", "admin"), getStudentAttendanceByMonth);

// Student Routes (Student)
router.get("/student/me", protect, authorize("student"), getMyStudentAttendance);

export default router;

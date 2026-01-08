import express from "express";
import {
      createTeacher,
      createStudent,
      createStaff,
      getTeachers,
      getStudents,
      getStaff,
      updateTeacher,
      updateStudent,
      updateStaff,
      deleteUser,
      getParents,
      createParent,
      updateParent
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/teacher", protect, authorize("admin"), createTeacher);
router.post("/student", protect, authorize("admin"), createStudent);
router.post("/staff", protect, authorize("admin"), createStaff);

router.put("/teacher/:id", protect, authorize("admin"), updateTeacher);
router.put("/student/:id", protect, authorize("admin"), updateStudent);
router.put("/staff/:id", protect, authorize("admin"), updateStaff);

router.delete("/:id", protect, authorize("admin"), deleteUser);

router.get("/teachers", protect, authorize("admin", "teacher"), getTeachers);
router.get("/students", protect, authorize("admin", "teacher"), getStudents);
router.get("/staff", protect, authorize("admin"), getStaff);
router.get("/parents", protect, authorize("admin"), getParents);

router.post("/parent", protect, authorize("admin"), createParent);
router.put("/parent/:id", protect, authorize("admin"), updateParent);

export default router;

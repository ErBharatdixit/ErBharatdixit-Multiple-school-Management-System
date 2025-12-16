import express from "express";
import {
      createClass,
      getClasses,
      deleteClass,
      createSubject,
      getSubjects,
      deleteSubject,
      updateClass,
      updateSubject
} from "../controllers/academicController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Class Routes
router.post("/class", protect, authorize("admin"), createClass);
router.put("/class/:id", protect, authorize("admin"), updateClass);
router.get("/classes", protect, authorize("admin", "teacher"), getClasses);
router.delete("/class/:id", protect, authorize("admin"), deleteClass);

// Subject Routes
router.post("/subject", protect, authorize("admin"), createSubject);
router.put("/subject/:id", protect, authorize("admin"), updateSubject);
router.get("/subjects", protect, authorize("admin", "teacher", "student"), getSubjects);
router.delete("/subject/:id", protect, authorize("admin"), deleteSubject);

export default router;

import express from "express";
import {
      getSchools,
      getSchool,
      createSchool,
      updateSchool,
      deleteSchool,
      getSchoolList,
      getDashboardStats
} from "../controllers/schoolController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/list", getSchoolList);
router.get("/stats", protect, authorize("superadmin"), getDashboardStats);

router.route("/")
      .get(protect, authorize("superadmin"), getSchools)
      .post(protect, authorize("superadmin"), createSchool);

router.route("/:id")
      .get(protect, getSchool)
      .put(protect, authorize("superadmin"), updateSchool)
      .delete(protect, authorize("superadmin"), deleteSchool);

export default router;

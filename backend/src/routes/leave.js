import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
      applyLeave,
      getMyLeaves,
      getAllLeaves,
      updateLeaveStatus
} from "../controllers/leaveController.js";

const router = express.Router();

router.use(protect);

router.route("/")
      .post(applyLeave)
      .get(authorize("admin", "superadmin", "teacher"), getAllLeaves);

router.route("/my")
      .get(getMyLeaves);

router.route("/:id/status")
      .put(authorize("admin", "superadmin", "teacher"), updateLeaveStatus);

export default router;

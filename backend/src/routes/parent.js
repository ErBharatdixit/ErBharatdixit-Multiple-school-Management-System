import express from "express";
import { getChildren, getChildDashboard } from "../controllers/parentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("parent", "admin", "superadmin")); // Parent routes, but admins can access too for debugging

router.get("/children", getChildren);
router.get("/child/:studentId/dashboard", getChildDashboard);

export default router;

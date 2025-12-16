import express from "express";
import {
      upsertProfile,
      getMyProfile,
      getPendingProfiles,
      verifyProfile,
      getUserProfile,
      upload
} from "../controllers/profileController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public/Protected
router.get("/me", protect, getMyProfile);

// Update Profile (with files)
router.post("/", protect, upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "adharCard", maxCount: 1 },
      { name: "panCard", maxCount: 1 },
      { name: "marksheet", maxCount: 1 },
      { name: "fatherAdharCard", maxCount: 1 },
]), upsertProfile);

// Admin
router.get("/pending", protect, authorize("admin"), getPendingProfiles);
router.get("/user/:userId", protect, authorize("admin"), getUserProfile);
router.patch("/verify/:id", protect, authorize("admin"), verifyProfile);

export default router;

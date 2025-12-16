import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
      createNotice,
      getNotices,
      deleteNotice
} from "../controllers/noticeController.js";

const router = express.Router();

router.use(protect);

router.route("/")
      .post(authorize("admin", "superadmin"), createNotice)
      .get(getNotices);

router.route("/:id")
      .delete(authorize("admin", "superadmin"), deleteNotice);

export default router;

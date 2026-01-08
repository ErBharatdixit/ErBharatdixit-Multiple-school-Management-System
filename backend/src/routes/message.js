import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../config/multer.js";
import {
      sendMessage,
      getMessages,
      getConversations,
      markAsRead,
      searchUsers,
      deleteMessage,
      updateMessage
} from "../controllers/messageController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.post("/send", upload.array("files", 5), sendMessage);
router.get("/conversations", getConversations);
router.get("/search", searchUsers);
router.get("/:userId", getMessages);
router.put("/read/:userId", markAsRead);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId", updateMessage);

export default router;

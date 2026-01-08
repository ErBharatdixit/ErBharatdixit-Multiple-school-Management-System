import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a new message
// Send a new message
export const sendMessage = async (req, res) => {
      try {
            const { recipientId, content } = req.body;
            const senderId = req.user._id;
            let attachments = [];

            if (req.files && req.files.length > 0) {
                  attachments = req.files.map(file => ({
                        url: `/uploads/${file.filename}`,
                        fileType: file.mimetype.split('/')[0], // 'image', 'video', 'application'
                        originalName: file.originalname
                  }));
            }

            if ((!content || content.trim() === "") && attachments.length === 0) {
                  return res.status(400).json({ message: "Message content or attachment is required" });
            }

            const newMessage = new Message({
                  sender: senderId,
                  recipient: recipientId,
                  content: content || "",
                  attachments: attachments
            });

            await newMessage.save();

            // Populate sender details for immediate display on frontend if needed
            await newMessage.populate("sender", "name email role avatar");

            res.status(201).json(newMessage);
      } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).json({ message: "Server error sending message" });
      }
};

// Get conversation history with a specific user
export const getMessages = async (req, res) => {
      try {
            const { userId } = req.params;
            const currentUserId = req.user._id;

            const messages = await Message.find({
                  $or: [
                        { sender: currentUserId, recipient: userId },
                        { sender: userId, recipient: currentUserId }
                  ]
            })
                  .sort({ createdAt: 1 }) // Oldest first
                  .populate("sender", "name avatar");

            res.json(messages);
      } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ message: "Server error fetching messages" });
      }
};

// Get list of recent conversations
export const getConversations = async (req, res) => {
      try {
            const currentUserId = req.user._id;

            // Aggregation pipeline to find unique users communicated with
            // and get the last message
            const conversations = await Message.aggregate([
                  {
                        $match: {
                              $or: [{ sender: currentUserId }, { recipient: currentUserId }]
                        }
                  },
                  {
                        $sort: { createdAt: -1 }
                  },
                  {
                        $group: {
                              _id: {
                                    $cond: [
                                          { $eq: ["$sender", currentUserId] },
                                          "$recipient",
                                          "$sender"
                                    ]
                              },
                              lastMessage: { $first: "$$ROOT" }
                        }
                  },
                  {
                        $lookup: {
                              from: "users",
                              localField: "_id",
                              foreignField: "_id",
                              as: "userDetails"
                        }
                  },
                  {
                        $unwind: "$userDetails"
                  },
                  {
                        $project: {
                              _id: 1,
                              "userDetails.name": 1,
                              "userDetails.avatar": 1,
                              "userDetails.role": 1,
                              "userDetails._id": 1,
                              lastMessage: 1
                        }
                  },
                  {
                        $sort: { "lastMessage.createdAt": -1 }
                  }
            ]);

            res.json(conversations);
      } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(500).json({ message: "Server error fetching conversations" });
      }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
      try {
            const { userId } = req.params; // The other user in the conversation
            const currentUserId = req.user._id;

            // Update all messages sent by the other user to the current user as read
            await Message.updateMany(
                  { sender: userId, recipient: currentUserId, read: false },
                  { $set: { read: true } }
            );

            res.json({ message: "Messages marked as read" });
      } catch (error) {
            console.error("Error marking messages read:", error);
            res.status(500).json({ message: "Server error" });
      }
};

// Search users to start new chat
export const searchUsers = async (req, res) => {
      try {
            const { query } = req.query;
            if (!query) return res.json([]);

            const users = await User.find({
                  $or: [
                        { name: { $regex: query, $options: "i" } },
                        { email: { $regex: query, $options: "i" } }
                  ],
                  _id: { $ne: req.user._id } // Exclude self
            }).select("name email role avatar").limit(10);

            res.json(users);
      } catch (error) {
            console.error("Error searching users:", error);
            res.status(500).json({ message: "Server error" });
      }
};

// Delete a message
export const deleteMessage = async (req, res) => {
      try {
            const { messageId } = req.params;
            const message = await Message.findById(messageId);

            if (!message) {
                  return res.status(404).json({ message: "Message not found" });
            }

            // Check if user is the sender
            if (message.sender.toString() !== req.user._id.toString()) {
                  return res.status(401).json({ message: "Not authorized to delete this message" });
            }

            await Message.findByIdAndDelete(messageId);
            res.json({ message: "Message deleted" });
      } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ message: "Server error" });
      }
};

// Update a message
export const updateMessage = async (req, res) => {
      try {
            const { messageId } = req.params;
            const { content } = req.body;

            const message = await Message.findById(messageId);

            if (!message) {
                  return res.status(404).json({ message: "Message not found" });
            }

            // Check if user is the sender
            if (message.sender.toString() !== req.user._id.toString()) {
                  return res.status(401).json({ message: "Not authorized to edit this message" });
            }

            message.content = content;
            await message.save();

            // Populate sender to match getMessages structure
            await message.populate("sender", "name email role avatar");

            res.json(message);
      } catch (error) {
            console.error("Error updating message:", error);
            res.status(500).json({ message: "Server error" });
      }
};

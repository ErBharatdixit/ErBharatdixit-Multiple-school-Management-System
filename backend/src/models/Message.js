import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
      sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      content: {
            type: String,
            trim: true
      },
      attachments: [{
            url: String,
            fileType: String,
            originalName: String
      }],
      read: {
            type: Boolean,
            default: false
      }
}, { timestamps: true });

// Index for faster queries
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, sender: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;

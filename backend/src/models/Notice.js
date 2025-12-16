import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      title: {
            type: String,
            required: true,
            trim: true
      },
      content: {
            type: String,
            required: true
      },
      postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      targetAudience: {
            type: String,
            enum: ["all", "student", "teacher", "admin"],
            default: "all"
      },
      targetClassId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class"
      }
}, {
      timestamps: true
});

export default mongoose.model("Notice", noticeSchema);

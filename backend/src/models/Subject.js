import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true
      },
      code: {
            type: String,
            required: true,
            unique: true
      },
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
      },
      teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
      },
      isActive: {
            type: Boolean,
            default: true
      }
}, {
      timestamps: true
});

export default mongoose.model("Subject", subjectSchema);

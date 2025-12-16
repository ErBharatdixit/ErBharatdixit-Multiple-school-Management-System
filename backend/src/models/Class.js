import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true
      },
      grade: {
            type: String,
            required: true
      },
      section: {
            type: String,
            required: true
      },
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
      },
      students: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
      }],
      isActive: {
            type: Boolean,
            default: true
      }
}, {
      timestamps: true
});

export default mongoose.model("Class", classSchema);

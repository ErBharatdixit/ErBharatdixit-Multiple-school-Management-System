import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
      studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
      },
      schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true
      },
      date: {
            type: Date,
            required: true
      },
      status: {
            type: String,
            enum: ["present", "absent", "late", "excused", "leave"],
            required: true
      },
      markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
      },
      remarks: {
            type: String
      }
}, {
      timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);

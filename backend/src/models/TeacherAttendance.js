import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            teacherId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            date: {
                  type: String, // YYYY-MM-DD format
                  required: true,
            },
            status: {
                  type: String,
                  enum: ["present", "absent", "half-day", "leave"],
                  required: true,
            },
            remarks: {
                  type: String,
                  default: "",
            },
      },
      { timestamps: true }
);

// Compound index to ensure one record per teacher per date
teacherAttendanceSchema.index({ teacherId: 1, date: 1 }, { unique: true });

export default mongoose.model("TeacherAttendance", teacherAttendanceSchema);

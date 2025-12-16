import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            classId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Class",
                  required: true,
            },
            type: {
                  type: String, // Tuition, Exam, Transport, Lab, etc.
                  required: true,
            },
            amount: {
                  type: Number,
                  required: true,
            },
            dueDate: {
                  type: Date,
                  required: true,
            },
            description: {
                  type: String,
            },
            academicYear: {
                  type: String, // e.g., "2024-2025"
                  required: true,
            },
            isMonthly: {
                  type: Boolean,
                  default: false,
            }
      },
      { timestamps: true }
);

export default mongoose.model("FeeStructure", feeStructureSchema);

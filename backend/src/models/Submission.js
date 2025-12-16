import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            assignmentId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Assignment",
                  required: true,
            },
            studentId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            content: {
                  type: String, // Optional text submission
            },
            attachments: [
                  {
                        url: String,
                        publicId: String,
                        name: String,
                        type: { type: String },
                  },
            ],
            status: {
                  type: String,
                  enum: ["submitted", "late", "graded", "resubmit"],
                  default: "submitted",
            },
            grade: {
                  type: Number,
            },
            feedback: {
                  type: String,
            },
            submittedAt: {
                  type: Date,
                  default: Date.now,
            },
      },
      { timestamps: true }
);

// Prevent multiple submissions from same student for same assignment (unless we want to allow re-submissions as updates)
// For now, let's allow index but we can handle logic in controller
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Submission", submissionSchema);

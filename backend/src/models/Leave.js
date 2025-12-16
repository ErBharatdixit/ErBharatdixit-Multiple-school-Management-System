import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            applicantId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            role: {
                  type: String,
                  enum: ["student", "teacher"],
                  required: true,
            },
            startDate: {
                  type: Date,
                  required: true,
            },
            endDate: {
                  type: Date,
                  required: true,
            },
            type: {
                  type: String,
                  enum: ["Medical", "Casual", "Emergency", "Other"],
                  required: true,
            },
            reason: {
                  type: String,
                  required: true,
            },
            status: {
                  type: String,
                  enum: ["Pending", "Approved", "Rejected"],
                  default: "Pending",
            },
            approvedBy: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
            },
            rejectionReason: {
                  type: String,
            }
      },
      { timestamps: true }
);

export default mongoose.model("Leave", leaveSchema);

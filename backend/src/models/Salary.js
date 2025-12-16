import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
      {
            userId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            month: { type: String, required: true }, // e.g., "January"
            year: { type: Number, required: true }, // e.g., 2024
            amount: { type: Number, required: true },
            status: {
                  type: String,
                  enum: ["Pending", "Paid"],
                  default: "Pending",
            },
            paymentDate: { type: Date },
            breakdown: {
                  basicSalary: Number,
                  allowances: Number,
                  deductions: Number,
            }
      },
      { timestamps: true }
);

// Prevent duplicate salary records for the same month/year/user
salarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Salary", salarySchema);

import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
      {
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            studentId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
            },
            feeStructureId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "FeeStructure",
                  // Optional: if null, it's a general payment towards balance, 
                  // but usually better to link to a structure if possible.
                  // Let's make it optional for flexibility.
            },
            amount: {
                  type: Number,
                  required: true,
            },
            paymentDate: {
                  type: Date,
                  default: Date.now,
            },
            method: {
                  type: String,
                  enum: ["Cash", "Online", "Cheque", "Transfer"],
                  default: "Cash",
            },
            transactionId: {
                  type: String,
            },
            status: {
                  type: String,
                  enum: ["Completed", "Pending", "Failed"],
                  default: "Completed",
            },
            remarks: {
                  type: String,
            }
      },
      { timestamps: true }
);

export default mongoose.model("FeePayment", feePaymentSchema);

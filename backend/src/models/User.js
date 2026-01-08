import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
      {
            name: { type: String, required: true, trim: true },
            email: { type: String, required: true, unique: true, lowercase: true },
            password: { type: String, required: true },
            role: {
                  type: String,
                  enum: ["superadmin", "admin", "teacher", "student", "staff", "parent"],
                  required: true,
            },
            children: [{
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User"
            }],
            designation: { type: String }, // For staff (e.g., Driver, Peon)
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: function () {
                        return this.role !== "superadmin";
                  },
            },
            phone: { type: String },
            subject: { type: String }, // For teachers
            classId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Class",
                  required: function () {
                        return this.role === "student";
                  }
            },
            rollNo: { type: String },
            isActive: { type: Boolean, default: true },
            transport: {
                  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
                  stopId: { type: mongoose.Schema.Types.ObjectId }
            },
            salaryDetails: {
                  basicSalary: { type: Number, default: 0 },
                  allowances: { type: Number, default: 0 },
                  deductions: { type: Number, default: 0 }
            },
      },
      { timestamps: true }
);

userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();
      this.password = await bcrypt.hash(this.password, 10);
      next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);

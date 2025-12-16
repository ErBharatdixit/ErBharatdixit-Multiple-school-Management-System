import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            enum: ["Adhar Card", "Pan Card", "Marksheet", "Father's Adhar Card"],
      },
      url: {
            type: String, // Cloudinary URL
            required: true,
      },
      publicId: {
            type: String, // Cloudinary Public ID for deletion
            required: true,
      },
      status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
      },
      rejectionReason: {
            type: String,
      },
});

const profileSchema = new mongoose.Schema(
      {
            userId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User",
                  required: true,
                  unique: true,
            },
            schoolId: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "School",
                  required: true,
            },
            role: {
                  type: String,
                  enum: ["teacher", "student"],
                  required: true,
            },
            photo: {
                  url: String,
                  publicId: String,
            },
            address: {
                  type: String,
            },
            // Teacher Specific
            qualification: {
                  type: String,
            },
            experience: {
                  type: Number, // Years
            },
            // Student Specific
            fathersName: {
                  type: String,
            },
            mothersName: {
                  type: String,
            },
            dob: {
                  type: Date,
            },
            documents: [documentSchema],
            verificationStatus: {
                  type: String,
                  enum: ["Pending", "Approved", "Rejected", "Partial"],
                  default: "Pending",
            },
      },
      { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

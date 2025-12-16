import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
      name: {
            type: String,
            required: true,
            trim: true
      },
      address: {
            type: String,
            required: true
      },
      city: {
            type: String,
            required: true
      },
      state: {
            type: String,
            required: true
      },
      pincode: {
            type: String,
            required: true
      },
      phone: {
            type: String,
            required: true
      },
      email: {
            type: String,
            required: true,
            unique: true
      },
      isActive: {
            type: Boolean,
            default: true
      }
}, {
      timestamps: true
});

export default mongoose.model("School", schoolSchema);

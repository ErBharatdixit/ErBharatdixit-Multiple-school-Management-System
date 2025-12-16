import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
      vehicleNumber: { type: String, required: true, unique: true },
      driverName: { type: String, required: true },
      driverPhone: { type: String, required: true },
      capacity: { type: Number, required: true },
      gpsEnabled: { type: Boolean, default: false },
      status: { type: String, enum: ["Active", "Maintenance", "Inactive"], default: "Active" },
}, { timestamps: true });

const routeSchema = new mongoose.Schema({
      routeName: { type: String, required: true },
      startPoint: { type: String, required: true },
      endPoint: { type: String, required: true },
      vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
      stops: [{
            stopName: { type: String, required: true },
            fees: { type: Number, required: true }
      }],
}, { timestamps: true });

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export const Route = mongoose.model("Route", routeSchema);

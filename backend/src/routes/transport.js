import express from "express";
import { Vehicle, Route } from "../models/Transport.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// --- Vehicle Routes ---

// Get all vehicles
router.get("/vehicles", protect, async (req, res) => {
      try {
            const vehicles = await Vehicle.find();
            res.json(vehicles);
      } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
      }
});

// Add a vehicle (Admin only)
router.post("/vehicles", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const vehicle = new Vehicle(req.body);
            await vehicle.save();
            res.status(201).json(vehicle);
      } catch (error) {
            res.status(400).json({ message: "Invalid Data", error: error.message });
      }
});

// Update a vehicle (Admin only)
router.put("/vehicles/:id", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
            res.json(vehicle);
      } catch (error) {
            res.status(400).json({ message: "Invalid Data", error: error.message });
      }
});

// Delete a vehicle (Admin only)
router.delete("/vehicles/:id", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
            if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
            res.json({ message: "Vehicle deleted" });
      } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
      }
});

// --- Route Routes ---

// Get all routes
router.get("/routes", protect, async (req, res) => {
      try {
            const routes = await Route.find().populate("vehicleId");
            res.json(routes);
      } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
      }
});

// Add a route (Admin only)
router.post("/routes", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const route = new Route(req.body);
            await route.save();
            res.status(201).json(route);
      } catch (error) {
            res.status(400).json({ message: "Invalid Data", error: error.message });
      }
});

// Update a route (Admin only)
router.put("/routes/:id", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!route) return res.status(404).json({ message: "Route not found" });
            res.json(route);
      } catch (error) {
            res.status(400).json({ message: "Invalid Data", error: error.message });
      }
});

// Delete a route (Admin only)
router.delete("/routes/:id", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const route = await Route.findByIdAndDelete(req.params.id);
            if (!route) return res.status(404).json({ message: "Route not found" });
            res.json({ message: "Route deleted" });
      } catch (error) {
            res.status(500).json({ message: "Server Error", error: error.message });
      }
});

// Assign transport to a student
router.post("/assign", protect, authorize("admin", "superadmin"), async (req, res) => {
      try {
            const { studentId, routeId, stopId } = req.body;

            const student = await User.findById(studentId);
            if (!student) {
                  return res.status(404).json({ message: "Student not found" });
            }

            // Verify route and stop
            const route = await Route.findById(routeId);
            if (!route) {
                  return res.status(404).json({ message: "Route not found" });
            }

            const stop = route.stops.id(stopId);
            if (!stop) {
                  return res.status(404).json({ message: "Stop not found in this route" });
            }

            student.transport = {
                  routeId,
                  stopId
            };

            await student.save();
            res.status(200).json({ message: "Transport assigned successfully", student });
      } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
      }
});

// Get student's assigned transport
router.get("/student/me", protect, authorize("student"), async (req, res) => {
      try {
            const student = await User.findById(req.user._id).populate({
                  path: "transport.routeId",
                  populate: { path: "vehicleId" } // deeply populate vehicle info if needed
            });

            if (!student || !student.transport || !student.transport.routeId) {
                  return res.status(404).json({ message: "No transport assigned" });
            }

            const route = student.transport.routeId;
            const stop = route.stops.id(student.transport.stopId);

            res.json({
                  route,
                  stop,
                  vehicle: route.vehicleId
            });
      } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
      }
});

export default router;

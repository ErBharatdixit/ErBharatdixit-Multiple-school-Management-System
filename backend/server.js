import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

// Import routes
import authRoutes from "./src/routes/auth.js";
import schoolRoutes from "./src/routes/school.js";
import userRoutes from "./src/routes/user.js";
import academicRoutes from "./src/routes/academic.js";
import teacherRoutes from "./src/routes/teacher.js";
import studentRoutes from "./src/routes/student.js";
import attendanceRoutes from "./src/routes/attendance.js";
import profileRoutes from "./src/routes/profile.js";
import timetableRoutes from "./src/routes/timetable.js";
import examRoutes from "./src/routes/exam.js";
import assignmentRoutes from "./src/routes/assignment.js";
import feeRoutes from "./src/routes/fee.js";
import leaveRoutes from "./src/routes/leave.js";
import noticeRoutes from "./src/routes/notice.js";
import transportRoutes from "./src/routes/transport.js";
import salaryRoutes from "./src/routes/salary.js";
import parentRoutes from "./src/routes/parent.js";
import messageRoutes from "./src/routes/message.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
      cors({
            origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL].filter(Boolean),
            credentials: true,
      })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static("uploads"));

// Routes

app.get("/", (req, res) => {
      res.json({ message: "School Management System API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/users", userRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/messages", messageRoutes);

// Error handler
app.use(errorHandler);

const startServer = async () => {
      try {
            await connectDB();

            console.log("Testing MongoDB connection...");
            await mongoose.connection.db.admin().ping();
            console.log(" MongoDB ping successful");

            app.listen(PORT, () => {
                  console.log(`Server running at http://localhost:${PORT}`);
            });
      } catch (error) {
            console.error("Failed to start server:", error);
            process.exit(1);
      }
};

startServer();

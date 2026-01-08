import mongoose from "mongoose";
import dotenv from "dotenv";
import Attendance from "./src/models/Attendance.js";
import Marks from "./src/models/Marks.js";
import FeePayment from "./src/models/FeePayment.js";
import User from "./src/models/User.js";
import Class from "./src/models/Class.js";
import Subject from "./src/models/Subject.js";
import Exam from "./src/models/Exam.js";

dotenv.config();

const seedData = async () => {
      try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("Connected to MongoDB");

            // 1. Get the Parent and Child (assuming we created one recently)
            // Or find a student to seed
            const students = await User.find({ role: "student" }).sort({ createdAt: -1 }).limit(10);

            if (students.length === 0) {
                  console.log("No students found. Create a student first.");
                  process.exit(1);
            }
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            attendanceDocs.push({
                  studentId: student._id,
                  classId,
                  schoolId,
                  date,
                  status: Math.random() > 0.1 ? "present" : "absent",
                  markedBy: student._id, // Just using self for simplicity
                  remarks: "Auto-generated"
            });
      }
            // Use updateOne with upsert to avoid duplicates if running multiple times
            for (const doc of attendanceDocs) {
            await Attendance.updateOne(
                  { studentId: doc.studentId, date: doc.date },
                  { $set: doc },
                  { upsert: true }
            );
      }

      // 3. Seed Marks
      console.log("Seeding Marks...");
      // Need a subject and exam
      let subject = await Subject.findOne({ schoolId });
      if (!subject) {
            subject = await Subject.create({
                  name: "Mathematics",
                  code: "MATH101",
                  schoolId,
                  classIds: [classId]
            });
      }

      let exam = await Exam.findOne({ schoolId });
      if (!exam) {
            exam = await Exam.create({
                  name: "Mid Term 2025",
                  examType: "Term",
                  startDate: new Date(),
                  endDate: new Date(),
                  schoolId,
                  classId
            });
      }

      const markDoc = {
            studentId: student._id,
            subjectId: subject._id,
            classId,
            schoolId,
            examType: "midterm",
            marksObtained: 85,
            totalMarks: 100,
            enteredBy: student._id,
            examId: exam._id
      };
      await Marks.create(markDoc); // Append new mark

      // 4. Seed Fees
      console.log("Seeding Fees...");
      await FeePayment.create({
            studentId: student._id,
            schoolId,
            amount: 5000,
            paymentDate: new Date(),
            method: "Online",
            status: "Completed",
            remarks: "Tuition Fee"
      });

}

console.log("Data seeding complete!");
process.exit(0);

} catch (error) {
      console.error("Seeding failed:", error);
      process.exit(1);
}
};

seedData();

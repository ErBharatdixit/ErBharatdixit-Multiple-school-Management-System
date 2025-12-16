import mongoose from "mongoose";
import dotenv from "dotenv";
import Submission from "./src/models/Submission.js";
import Assignment from "./src/models/Assignment.js";

dotenv.config();

const connectDB = async () => {
      try {
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
      } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
      }
};

const debugSubmissions = async () => {
      await connectDB();

      try {
            console.log("\n--- Debugging Submissions ---");
            const count = await Submission.countDocuments();
            console.log(`Total Submissions in DB: ${count}`);

            const submissions = await Submission.find().sort({ createdAt: -1 }).limit(5);
            console.log("\nLast 5 Submissions:");
            submissions.forEach(sub => {
                  console.log(`- ID: ${sub._id}`);
                  console.log(`  AssignmentId: ${sub.assignmentId}`);
                  console.log(`  StudentId: ${sub.studentId}`);
                  console.log(`  Status: ${sub.status}`);
                  console.log(`  CreatedAt: ${sub.createdAt}`);
            });

            if (submissions.length > 0) {
                  const assignmentId = submissions[0].assignmentId;
                  console.log(`\nChecking Assignment ${assignmentId} for the most recent submission:`);

                  const assignment = await Assignment.findById(assignmentId);
                  if (assignment) {
                        console.log(`  Assignment Found: "${assignment.title}"`);
                        console.log(`  TeacherId: ${assignment.teacherId}`);
                  } else {
                        console.log("  Assignment NOT found!");
                  }

                  // Check strict query
                  const matchCount = await Submission.countDocuments({ assignmentId: assignmentId });
                  console.log(`  Query count matching assignmentId ${assignmentId}: ${matchCount}`);
            }

      } catch (error) {
            console.error("Debug Error:", error);
      } finally {
            mongoose.connection.close();
      }
};

debugSubmissions();

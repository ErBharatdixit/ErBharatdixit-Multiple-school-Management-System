import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const createParent = async () => {
      try {
            await connectDB();

            // Find a random student
            const student = await User.findOne({ role: "student" });
            if (!student) {
                  console.log("No student found to link.");
                  process.exit(1);
            }

            console.log(`Linking to student: ${student.name} (${student._id})`);

            // Check if parent already exists
            const email = "parent@test.com";
            let parent = await User.findOne({ email });

            if (parent) {
                  console.log("Test parent already exists. Updating children...");
                  if (!parent.children.includes(student._id)) {
                        parent.children.push(student._id);
                  }
                  parent.role = "parent";
                  if (!parent.schoolId) {
                        parent.schoolId = student.schoolId;
                  }
                  await parent.save();
                  console.log("Parent updated.");
            } else {
                  parent = await User.create({
                        name: "Test Parent",
                        email: email,
                        password: "password123", // Will be hashed by pre-save
                        role: "parent",
                        children: [student._id],
                        phone: "1234567890",
                        schoolId: student.schoolId
                  });
                  console.log("Parent created.");
            }

            console.log("-----------------------------------");
            console.log("Test Credentials:");
            console.log("Email: parent@test.com");
            console.log("Password: password123");
            console.log("-----------------------------------");

            process.exit(0);

      } catch (error) {
            console.error("Error:", error);
            process.exit(1);
      }
};

createParent();

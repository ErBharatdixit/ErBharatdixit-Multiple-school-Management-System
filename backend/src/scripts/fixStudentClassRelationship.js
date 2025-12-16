import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Class from "../models/Class.js";

dotenv.config();

const fixStudentClassRelationship = async () => {
      try {
            // Connect to MongoDB
            await mongoose.connect(process.env.MONGO_URI);
            console.log("✅ Connected to MongoDB");

            // Get all students
            const students = await User.find({ role: "student" });
            console.log(`📊 Found ${students.length} students`);

            let fixed = 0;
            let skipped = 0;

            for (const student of students) {
                  if (student.classId) {
                        // Check if student is already in class's students array
                        const classDoc = await Class.findById(student.classId);

                        if (classDoc) {
                              const isAlreadyInClass = classDoc.students.some(
                                    (id) => id.toString() === student._id.toString()
                              );

                              if (!isAlreadyInClass) {
                                    // Add student to class's students array
                                    await Class.findByIdAndUpdate(
                                          student.classId,
                                          { $addToSet: { students: student._id } }
                                    );
                                    console.log(`✅ Added ${student.name} to ${classDoc.name}`);
                                    fixed++;
                              } else {
                                    skipped++;
                              }
                        } else {
                              console.log(`⚠️  Class not found for student ${student.name}`);
                        }
                  }
            }

            console.log("\n📈 Migration Summary:");
            console.log(`   Fixed: ${fixed} students`);
            console.log(`   Skipped: ${skipped} students (already in class)`);
            console.log(`   Total: ${students.length} students`);
            console.log("\n✅ Migration completed successfully!");

            process.exit(0);
      } catch (error) {
            console.error("❌ Migration failed:", error);
            process.exit(1);
      }
};

fixStudentClassRelationship();

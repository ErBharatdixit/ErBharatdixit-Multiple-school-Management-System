import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually register models to ensure they exist
import './src/models/School.js';
import './src/models/Class.js';
import './src/models/User.js';
import FeeStructure from './src/models/FeeStructure.js';
import FeePayment from './src/models/FeePayment.js';
import User from './src/models/User.js';

dotenv.config();

const checkFees = async () => {
      try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('Connected to MongoDB');

            // 1. Find a student
            // Use lean() to avoid some hydration errors if schemas are slightly off
            const student = await User.findOne({ role: 'student', classId: { $ne: null } }).lean();

            if (!student) {
                  console.log('No student found with a class.');
                  return;
            }
            console.log(`Checking for student: ${student.name}`);
            console.log(` - ClassID: ${student.classId}`);
            console.log(` - SchoolID: ${student.schoolId}`);

            // 2. Check Fee Structures for this class/school
            // Query loosely to see if *anything* exists for this school, ignoring class/year for a moment
            const allStructuresForSchool = await FeeStructure.find({
                  schoolId: student.schoolId
            }).lean();

            console.log(`Total Fee Structures for School: ${allStructuresForSchool.length}`);

            const matchingStructures = allStructuresForSchool.filter(s =>
                  s.classId.toString() === student.classId.toString()
            );

            console.log(`Structures for Student's Class: ${matchingStructures.length}`);

            matchingStructures.forEach(s => {
                  console.log(` - Type: ${s.type}, Amount: ${s.amount}, Year: '${s.academicYear}'`);
            });

            // 3. Check Payments
            const payments = await FeePayment.find({ studentId: student._id }).lean();
            console.log(`Found ${payments.length} Payments for this student.`);

      } catch (error) {
            console.error('DEBUG ERROR:', error);
      } finally {
            await mongoose.disconnect();
      }
};

checkFees();

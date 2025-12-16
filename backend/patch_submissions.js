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

const patchSubmissions = async () => {
      await connectDB();

      try {
            console.log("\n--- Patching Submissions ---");
            const submissions = await Submission.find({ status: "late" });
            console.log(`Found ${submissions.length} late submissions.`);

            for (const sub of submissions) {
                  // Just blindly fix it for them for now to "submitted"
                  sub.status = "submitted";
                  await sub.save();
                  console.log(`Updated submission ${sub._id} to 'submitted'`);
            }

            console.log("\nDone!");

      } catch (error) {
            console.error("Patch Error:", error);
      } finally {
            mongoose.connection.close();
      }
};

patchSubmissions();

import mongoose from "mongoose";

export const connectDB = async () => {
      try {
            mongoose.set("strictQuery", false);

            const conn = await mongoose.connect(process.env.MONGO_URI, {
                  serverSelectionTimeoutMS: 30000,
                  socketTimeoutMS: 45000,
            });

            console.log(`✅ MongoDB connected: ${conn.connection.host}`);
            return conn;
      } catch (error) {
            console.error("❌ MongoDB connection error:", error.message);
            process.exit(1);
      }
};

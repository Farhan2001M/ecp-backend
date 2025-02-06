import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;

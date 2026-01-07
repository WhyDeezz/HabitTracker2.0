import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/habit-tracker");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error("-------------------------------------"); 
    console.error("💀 MONGODB CONNECTION ERROR DETAILS:");
    console.error("-------------------------------------");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    // JSON.stringify helps reveal nested objects or properties sometimes hidden in standard logs
    console.error("Full Error Object:", JSON.stringify(error, null, 2)); 
    if (error.stack) {
        console.error("Stack Trace:", error.stack);
    }
    console.error("-------------------------------------");
    process.exit(1);
  }
};

export default connectDB;

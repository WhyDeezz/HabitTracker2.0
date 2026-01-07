import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
import "./config/passport"; // Load passport config

// Database Connection
connectDB();

import authRoutes from "./routes/authRoutes";
app.use("/api/auth", authRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

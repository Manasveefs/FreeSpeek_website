// src/server.js
import express from "express";
import connectDB from "./db/config.js";
import allRoutes from "./routes/allRoutes.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// Connect to MongoDB
console.log("MongoDB URI:", process.env.MONGO_URI);
console.log("JWT Secret:", process.env.JWT_SECRET);
connectDB();

app.use(express.json());

// Serve static files from the uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", allRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

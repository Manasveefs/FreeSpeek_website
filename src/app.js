// src/server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import allRoutes from "./routes/allRoutes.js";
import connectDB from "./db/config.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware and routes
app.use(express.json());
app.use("/api", allRoutes);

// Serve static files from the uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

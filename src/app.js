// src/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // Import CORS
import allRoutes from "./routes/allRoutes.js";
import connectDB from "./db/config.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware and routes
app.use(
  cors({
    origin: "http://localhost:5173", // Update this to match your frontend's URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use("/api", allRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

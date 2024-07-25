import express from "express";
import authRoutes from "./authRoutes.js";
import postRoutes from "./postRoutes.js";
import neighborhoodRoutes from "./neighborhoodRoutes.js";
import commentRoutes from "./commentRoutes.js";
import listingRoutes from "./listingRoutes.js";
import connectionRequestRouter from "./connectionRequestRoutes.js";
import passwordRoutes from "./passwordRoutes.js";
import feedRoutes from "./feedRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import inviteRoutes from "./inviteRoutes.js";
import chatRoutes from "./chatRoutes.js";

const allRoutes = express.Router();

allRoutes.use("/auth", authRoutes);
allRoutes.use("/password", passwordRoutes);
allRoutes.use("/posts", postRoutes);
allRoutes.use("/neighborhoods", neighborhoodRoutes);
allRoutes.use("/comments", commentRoutes);
allRoutes.use("/listings", listingRoutes);
allRoutes.use("/connections", connectionRequestRouter);
allRoutes.use("/feed", feedRoutes);
allRoutes.use("/upload", uploadRoutes);
allRoutes.use("/invite", inviteRoutes);
allRoutes.use("/chat", chatRoutes);

export default allRoutes;

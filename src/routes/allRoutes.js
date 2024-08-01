import express from "express";
import authRouter from "./authRoutes.js";
import postRouter from "./postRoutes.js";
import neighborhoodRouter from "./neighborhoodRoutes.js";
import commentRouter from "./commentRoutes.js";
import listingRouter from "./listingRoutes.js";
import connectionRequestRouter from "./connectionRequestRoutes.js";
import passwordRouter from "./passwordRoutes.js";
import feedRouter from "./feedRoutes.js";
import uploadRouter from "./uploadRoutes.js";
import inviteRouter from "./inviteRoutes.js";
import chatRouter from "./chatRoutes.js";
import eventRouter from "./eventRoutes.js";
import pollRouter from "./pollRoutes.js";
import safetyRouter from "./safetyRoutes.js";
import privacyRouter from "./privacyRoutes.js";
import groupRouter from "./groupRoutes.js";

const allRoutes = express.Router();

allRoutes.use("/auth", authRouter);
allRoutes.use("/password", passwordRouter);
allRoutes.use("/posts", postRouter);
allRoutes.use("/neighborhoods", neighborhoodRouter);
allRoutes.use("/comments", commentRouter);
allRoutes.use("/listings", listingRouter);
allRoutes.use("/connections", connectionRequestRouter);
allRoutes.use("/feed", feedRouter);
allRoutes.use("/upload", uploadRouter);
allRoutes.use("/invite", inviteRouter);
allRoutes.use("/chat", chatRouter);
allRoutes.use("/events", eventRouter);
allRoutes.use("/polls", pollRouter);
allRoutes.use("/safety-posts", safetyRouter);
allRoutes.use("/privacy", privacyRouter);
allRoutes.use("/groups", groupRouter);

export default allRoutes;

import express from "express";
import feedController from "../controllers/feedController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const feedRouter = express.Router();

feedRouter.get("/recents", authMiddleware, feedController.getRecentPosts);
feedRouter.get("/foryou", authMiddleware, feedController.getForYouPosts);
feedRouter.get("/nearby", authMiddleware, feedController.getNearbyPosts);

export default feedRouter;

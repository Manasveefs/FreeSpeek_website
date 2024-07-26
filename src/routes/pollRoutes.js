import express from "express";
import pollController from "../controllers/pollController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const pollRouter = express.Router();

pollRouter.post("/create", authMiddleware, pollController.create);
pollRouter.post("/vote", authMiddleware, pollController.voteInPoll);
pollRouter.get("/:pollId/results", authMiddleware, pollController.getResults);

export default pollRouter;

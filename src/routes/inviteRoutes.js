import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import inviteController from "../controllers/inviteController.js";

const inviteRouter = express.Router();

inviteRouter.get("/neighbors", authMiddleware, inviteController.findNeighbors);
inviteRouter.post("/sendInvite", authMiddleware, inviteController.sendInvite);
inviteRouter.get("/getInvites", authMiddleware, inviteController.getInvites);
inviteRouter.post(
  "/respondToInvite",
  authMiddleware,
  inviteController.respondToInvite
);

export default inviteRouter;

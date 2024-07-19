import express from "express";
import connectionRequestController from "../controllers/connectionRequestController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/send",
  authMiddleware,
  connectionRequestController.sendRequest
);
connectionRequestRouter.post(
  "/accept",
  authMiddleware,
  connectionRequestController.acceptRequest
);
connectionRequestRouter.post(
  "/decline",
  authMiddleware,
  connectionRequestController.declineRequest
);
connectionRequestRouter.get(
  "/status/:receiverId",
  authMiddleware,
  connectionRequestController.getRequestStatus
);
connectionRequestRouter.get(
  "/receiver",
  authMiddleware,
  connectionRequestController.getReceivedRequests
);

export default connectionRequestRouter;

import express from "express";
import chatController from "../controllers/chatController.js";
import authMiddleware from "../middleware/adminMiddleware.js";

const chatRouter = express.Router();

chatRouter.post("/create", authMiddleware, chatController.createChat);
chatRouter.get("/", authMiddleware, chatController.getChatMessages);
chatRouter.get(
  "/:chatId/messages",
  authMiddleware,
  chatController.getChatMessages
);
chatRouter.post("/message", authMiddleware, chatController.sendMessage);

export default chatRouter;

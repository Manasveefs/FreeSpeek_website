import express from "express";
import commentController from "../controllers/commentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const commentRouter = express.Router();

// commentRouter to add a comment to a post
commentRouter.post("/add", authMiddleware, commentController.addComment);

commentRouter.put("/edit", authMiddleware, commentController.editComment);

commentRouter.delete(
  "/delete",
  authMiddleware,
  commentController.deleteComment
);

export default commentRouter;

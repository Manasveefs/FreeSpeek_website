import express from "express";
import likeController from "../controllers/likeController";
import authMiddleware from "../middleware/authMiddleware";

const likeRouter = express.Router();

likeRouter.post("/like", authMiddleware, likeController.addLike);
likeRouter.post("/unlike", authMiddleware, likeController.removeLike);
likeRouter.get(
  "/post/:postId/likes",
  authMiddleware,
  likeController.getLikeForPost
);

export default likeRouter;

import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import authController from "../controllers/authController";

const userRouter = express.Router();

userRouter.post("/block", authMiddleware, authController.blockUser);
userRouter.post("/unblock", authMiddleware, authController.unblockUser);
userRouter.get(
  "/blocked-users",
  authMiddleware,
  authController.getBlockedUsers
);

export default userRouter;

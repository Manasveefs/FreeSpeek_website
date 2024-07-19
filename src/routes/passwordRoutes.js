import express from "express";
import passwordController from "../controllers/passwordController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const passwordRouter = express.Router();

passwordRouter.post("/request-reset", passwordController.requestPasswordReset);
passwordRouter.post("/reset", passwordController.resetPassword);

passwordRouter.post(
  "/change",
  authMiddleware,
  passwordController.changePassword
);

export default passwordRouter;

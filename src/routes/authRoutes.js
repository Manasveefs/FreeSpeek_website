// src/routes/authRoutes.js
import express from "express";
import authController from "../controllers/authController.js";
import socialAuthController from "../controllers/socialAuthController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  registerValidation,
  loginValidation,
  updateUserValidation,
  validate,
} from "../middleware/validators.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  registerValidation,
  validate,
  authController.register
);
authRouter.post("/login", loginValidation, validate, authController.login);
authRouter.post("/oauth", socialAuthController.oauth);
authRouter.post("/apple-signin", socialAuthController.appleSignIn);
authRouter.post("/phone-signin", socialAuthController.phoneSignIn);
authRouter.post("/google-signin", socialAuthController.googleSignIn);
authRouter.post("/facebook-signin", socialAuthController.facebookSignIn);

authRouter.put(
  "/update",
  authMiddleware,
  updateUserValidation,
  validate,
  authController.updateUser
);
authRouter.delete("/delete", authMiddleware, authController.deleteUser);
authRouter.put("/suspend", authMiddleware, authController.suspendUser);
authRouter.put("/reactivate", authMiddleware, authController.reactivateUser);
authRouter.put(
  "/admin/reactivate",
  adminMiddleware,
  authController.adminReactivateUser
);

export default authRouter;

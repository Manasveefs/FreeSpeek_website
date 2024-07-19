import express from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  registerValidation,
  loginValidation,
  updateUserValidation,
  validate,
} from "../middleware/validators.js";
import adminMiddleware from "../middleware/adminMiddleware.js"; // Correctly import adminMiddleware

const authRouter = express.Router();

authRouter.post(
  "/register",
  registerValidation,
  validate,
  authController.register
);
authRouter.post("/login", loginValidation, validate, authController.login);
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

// Admin route for reactivation
authRouter.put(
  "/admin/reactivate",
  adminMiddleware,
  authController.adminReactivateUser
);

export default authRouter;

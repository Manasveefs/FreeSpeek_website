import express from "express";
import safetyPostController from "../controllers/safetyPostController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const safetyRouter = express.Router();

safetyRouter.post(
  "/create",
  authMiddleware,
  upload.single("poster"),
  safetyPostController.createSafetyPost
);
safetyRouter.put(
  "/update/:id",
  authMiddleware,
  upload.single("poster"),
  safetyPostController.updateSafetyPost
);
safetyRouter.get(
  "/getSafetyPosts",
  authMiddleware,
  safetyPostController.getSafetyPosts
);
safetyRouter.delete(
  "/delete/:id",
  authMiddleware,
  safetyPostController.deleteSafetyPost
);

export default safetyRouter;

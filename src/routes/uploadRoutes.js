import express from "express";
import multer from "multer";
import { uploadPicture } from "../controllers/uploadController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const uploadRouter = express.Router();

uploadRouter.post(
  "/upload",
  authMiddleware,
  upload.single("picture"),
  uploadPicture
);

export default uploadRouter;

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import privacyController from "../controllers/privacyController.js";

const privacyRouter = express.Router();

privacyRouter.get("/", authMiddleware, privacyController.getPrivacySettings);
privacyRouter.put("/", authMiddleware, privacyController.updatePrivacySettings);

export default privacyRouter;

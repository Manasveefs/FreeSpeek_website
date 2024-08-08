import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import reportController from "../controllers/reportController.js";

const reportRouter = express.Router();

reportRouter.post("/report", authMiddleware, reportController.reportUser);
reportRouter.get("/reports", authMiddleware, reportController.getReports);
reportRouter.delete(
  "/report/:reportId",
  authMiddleware,
  reportController.resolveReport
);

export default reportRouter;

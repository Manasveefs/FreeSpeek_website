import express from "express";
import neighborhoodController from "../controllers/neighborhoodController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  neighborhoodController.createNeighborhood
);
router.get("/", authMiddleware, neighborhoodController.getNeighborhoods);

export default router;

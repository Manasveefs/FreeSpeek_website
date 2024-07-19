import express from "express";
import listController from "../controllers/listingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const listingRouter = express.Router();

listingRouter.post("/create", authMiddleware, listController.createListing);
listingRouter.get("/", authMiddleware, listController.getListings);
listingRouter.get("/:id", authMiddleware, listController.getListingById);
listingRouter.put("/:id", authMiddleware, listController.updateListing);
listingRouter.delete("/:id", authMiddleware, listController.deleteListing);

export default listingRouter;

// src/routes/eventRoutes.js
import express from "express";
import eventController from "../controllers/eventController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
const eventRouter = express.Router();

eventRouter.post(
  "/create",
  authMiddleware,
  upload.single("picture"),
  eventController.createEvent
);
eventRouter.put(
  "/update/:eventId",
  authMiddleware,
  eventController.updateEvent
);
eventRouter.delete(
  "/delete/:eventId",
  authMiddleware,
  eventController.deleteEvent
);
eventRouter.put(
  "/updateStatus",
  authMiddleware,
  eventController.updateEventStatus
);
eventRouter.get(
  "/status/:eventId",
  authMiddleware,
  eventController.getEventStatus
);
eventRouter.get("/", authMiddleware, eventController.getEvents);

export default eventRouter;

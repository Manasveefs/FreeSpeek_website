// src/controllers/eventController.js
import Event from "../models/eventModel.js";
import { bucket } from "../services/firebase.js";
import { v4 as uuidv4 } from "uuid";

const eventController = {
  createEvent: async (req, res) => {
    const { name, start, end, location, description } = req.body;
    const userId = req.user.id;

    if (!name || !start || !end || !location) {
      return res.status(400).json({
        message: "Event name, start date, end date, and location are required",
      });
    }

    try {
      let pictureUrl = null;
      if (req.file) {
        const fileName = `${uuidv4()}-${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        blobStream.on("error", (error) => {
          console.error("Blob stream error:", error);
          return res
            .status(500)
            .json({ message: "Unable to upload picture", error });
        });

        blobStream.on("finish", async () => {
          pictureUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

          const event = new Event({
            name,
            start,
            end,
            location,
            description,
            picture: pictureUrl,
            user: userId,
          });

          await event.save();
          res.json({ message: "Event created successfully", event });
        });

        blobStream.end(req.file.buffer);
      } else {
        const event = new Event({
          name,
          start,
          end,
          location,
          description,
          user: userId,
        });

        await event.save();
        res.json({ message: "Event created successfully", event });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  updateEvent: async (req, res) => {
    const { eventId } = req.params;
    const { name, start, end, location, description } = req.body;
    const userId = req.user.id;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.user.toString() !== userId) {
        return res.status(403).json({ message: "User not authorized" });
      }

      event.name = name || event.name;
      event.start = start || event.start;
      event.end = end || event.end;
      event.location = location || event.location;
      event.description = description || event.description;

      await event.save();
      res.json({ message: "Event updated successfully", event });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  deleteEvent: async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.user.toString() !== userId) {
        return res.status(403).json({ message: "User not authorized" });
      }

      await event.remove();
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  updateEventStatus: async (req, res) => {
    const userId = req.user.id;

    try {
      const events = await Event.find({ user: userId });
      const now = new Date();

      for (const event of events) {
        if (now > event.end) {
          event.status = "Passed";
        } else if (now > event.start) {
          event.status = "Ongoing";
        } else {
          event.status = "Pending";
        }
        await event.save();
      }
      res.json({ message: "Event statuses updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  getEventStatus: async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.user.toString() !== userId) {
        return res.status(403).json({ message: "User not authorized" });
      }

      res.json({ status: event.status });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  getEvents: async (req, res) => {
    const userId = req.user.id;

    try {
      const events = await Event.find({ user: userId });
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default eventController;

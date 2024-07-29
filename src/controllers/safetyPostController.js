import SafetyPost from "../models/safetyPostModel.js";
import { bucket } from "../services/firebase.js";

const safetyPostController = {
  createSafetyPost: async (req, res) => {
    const { title, description, incidentDate, location } = req.body;

    if (!title || !description || !incidentDate || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      let postUrl = null;
      if (req.file) {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const fileUpload = bucket.file(filename);
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });
        blobStream.on("error", (error) => {
          return res
            .status(500)
            .json({ message: "Unable to upload poster", error });
        });
        blobStream.on("finish", async () => {
          postUrl = `https://storage.googleapis.com/${bucket.nam}/${fileUpload.name}`;

          const safetyPost = new SafetyPost({
            user: req.user.id,
            title,
            description,
            incidentDate,
            location,
            poster: postUrl,
          });

          await safetyPost.save();
          res
            .status(200)
            .json({ message: "Safety post create successfully", safetyPost });
        });

        blobStream.end(req.file.buffer);
      } else {
        const safetyPost = new SafetyPost({
          user: req.user.id,
          title,
          description,
          incidentDate,
          location,
        });
        await safetyPost.save();
        res
          .status(200)
          .json({ message: "Safety post created successfully", safetyPost });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
  updateSafetyPost: async (req, res) => {
    const { id } = req.params;
    const { title, description, incidentDate, location } = req.body;
    try {
      const safetyPost = await SafetyPost.findById(id);
      if (!safetyPost) {
        return res.status(404).json({ message: "Safety post not found" });
      }
      if (safetyPost.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }
      safetyPost.title = title || safetyPost.title;
      safetyPost.description = description || safetyPost.description;
      safetyPost.incidentDate = incidentDate || safetyPost.incidentDate;
      safetyPost.location = location || safetyPost.location;

      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
          metaData: {
            contentType: req.file.mimetype,
          },
        });
        blobStream.on("error", (error) => {
          return res
            .status(500)
            .json({ message: "Unable to upload poster", error });
        });
        blobStream.on("finish", async () => {
          safetyPost.poster = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
          await safetyPost.save();
          res
            .status(200)
            .json({ message: "Safety post updated successfully", safetyPost });
        });
        blobStream.end(req.file.buffer);
      } else {
        await safetyPost.save();
        req
          .status(200)
          .json({ message: "Safety post updated successfully", safetyPost });
      }
    } catch (error) {
      res.status(500).json({ message: "server error", error });
    }
  },
  getSafetyPosts: async (req, res) => {
    try {
      const safetyPosts = await SafetyPost.find().populate("user", ["name"]);
      res.status(200).json(safetyPosts);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  deleteSafetyPost: async (req, res) => {
    const { id } = req.params;

    try {
      const safetyPost = await SafetyPost.findById(id);
      if (!safetyPost) {
        return res.status(404).json({ message: "Safety post not found" });
      }
      if (safetyPost.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }
      await safetyPost.deleteOne();
      res.status(200).json({ message: "Safety post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default safetyPostController;

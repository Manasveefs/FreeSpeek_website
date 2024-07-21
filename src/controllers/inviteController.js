import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";

const inviteController = {
  findNeighbors: async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      console.log("Latitude and longitude are required");
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    try {
      const neighbors = await User.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: 3000,
          },
        },
      });
      console.log("Neighbors found:", neighbors);
      res.json({ neighbors });
    } catch (error) {
      console.error("Error finding neighbors:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  sendInvite: async (req, res) => {
    const fromUserId = req.user.id;
    const { toUserId } = req.body;

    try {
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingInvite = await Invite.findOne({
        fromUser: fromUserId,
        toUser: toUserId,
      });
      if (existingInvite) {
        if (existingInvite.status === "Pending") {
          return res
            .status(400)
            .json({ message: "Pending invite already exists", existingInvite });
        } else if (existingInvite.status === "Declined") {
          await Invite.deleteOne({ _id: existingInvite._id });
        }
      }
      const invite = new Invite({
        fromUser: fromUserId,
        toUser: toUserId,
        status: "Pending",
      });
      await invite.save();

      res.json({ message: "Invite sent successfully", invite });
    } catch (error) {
      console.error("Error sending invite:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  getInvites: async (req, res) => {
    try {
      const invites = await Invite.find({ toUser: req.user.id }).populate(
        "fromUser",
        ["email"]
      );
      console.log("Invites fetched:", invites);
      res.json({ invites });
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  respondToInvite: async (req, res) => {
    const { inviteId, status } = req.body;

    console.log("Responding to invite:", { inviteId, status });

    if (!inviteId || !status) {
      return res
        .status(400)
        .json({ message: "Invite ID and status are required" });
    }

    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid invite status" });
    }

    try {
      const invite = await Invite.findById(inviteId);

      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (invite.toUser.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }

      invite.status = status;
      invite.respondedAt = new Date();
      await invite.save();

      console.log("Invite responded successfully:", invite);

      res.json({ message: "Invite responded to successfully", invite });
    } catch (error) {
      console.error("Error responding to invite:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default inviteController;

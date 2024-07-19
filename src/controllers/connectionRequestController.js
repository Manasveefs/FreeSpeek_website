import ConnectionRequest from "../models/connectionRequestModel.js";
import User from "../models/userModel.js";

const connectionRequestController = {
  sendRequest: async (req, res) => {
    const { receiverId } = req.body;

    try {
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if a request already exists
      const existingRequest = await ConnectionRequest.findOne({
        sender: req.user._id,
        receiver: receiverId,
        status: "pending",
      });

      if (existingRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already sent" });
      }

      const connectionRequest = new ConnectionRequest({
        sender: req.user._id,
        receiver: receiverId,
      });

      await connectionRequest.save();
      res.status(201).json({
        message: "Connection request sent successfully",
        connectionRequest,
      });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  acceptRequest: async (req, res) => {
    const { requestId } = req.body;

    try {
      const connectionRequest = await ConnectionRequest.findById(requestId);
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      if (connectionRequest.receiver.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to accept this request" });
      }

      connectionRequest.status = "accepted";
      await connectionRequest.save();

      // Optionally, you can update the user's connections here

      res
        .status(200)
        .json({ message: "Connection request accepted", connectionRequest });
    } catch (error) {
      console.error("Error accepting connection request:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  declineRequest: async (req, res) => {
    const { requestId } = req.body;

    try {
      const connectionRequest = await ConnectionRequest.findById(requestId);
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }

      if (connectionRequest.receiver.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to decline this request" });
      }

      connectionRequest.status = "declined";
      await connectionRequest.save();

      res
        .status(200)
        .json({ message: "Connection request declined", connectionRequest });
    } catch (error) {
      console.error("Error declining connection request:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  getRequestStatus: async (req, res) => {
    const { receiverId } = req.params;

    try {
      const connectionRequest = await ConnectionRequest.findOne({
        sender: req.user._id,
        receiver: receiverId,
      });

      if (!connectionRequest) {
        return res.status(404).json({ message: "No connection request found" });
      }

      res.status(200).json({ connectionRequest });
    } catch (error) {
      console.error("Error fetching connection request status:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  getReceivedRequests: async (req, res) => {
    try {
      const receivedRequests = await ConnectionRequest.find({
        receiver: req.user._id,
        status: "pending",
      }).populate("sender", "name email");

      res.status(200).json({ receivedRequests });
    } catch (error) {
      console.error("Error fetching received connection requests:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default connectionRequestController;

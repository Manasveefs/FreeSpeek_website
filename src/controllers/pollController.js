import mongoose from "mongoose";
import Poll from "../models/pollModel.js";
import User from "../models/userModel.js";

const pollController = {
  create: async (req, res) => {
    const {
      question,
      options,
      startDate,
      endDate,
      isAnonymous,
      resultsVisibleBeforeEnd,
    } = req.body;
    const createdBy = req.user.id;

    const poll = new Poll({
      question,
      options: options.map((option) => ({ text: option })),
      createdBy,
      startDate,
      endDate,
      isAnonymous,
      resultsVisibleBeforeEnd,
    });

    try {
      await poll.save();
      res.status(200).json({ message: "Poll created successfully", poll });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  voteInPoll: async (req, res) => {
    const { pollId, optionId } = req.body;
    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(pollId) ||
      !mongoose.Types.ObjectId.isValid(optionId)
    ) {
      return res.status(400).json({ message: "Invalid poll or option ID" });
    }

    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }
      if (poll.endDate < new Date()) {
        return res.status(400).json({ message: "Poll has ended" });
      }
      if (
        (poll.isAnonymous && poll.anonymousParticipants.includes(userId)) ||
        (!poll.isAnonymous && poll.participants.includes(userId))
      ) {
        return res.status(400).json({ message: "You have already voted" });
      }

      const option = poll.options.id(optionId);
      if (!option) {
        return res.status(404).json({ message: "Option not found" });
      }

      option.votes += 1;
      if (poll.isAnonymous) {
        poll.anonymousParticipants.push(userId);
      } else {
        poll.participants.push(userId);
      }
      await poll.save();

      res.json({ message: "Vote cast successfully", poll });
    } catch (error) {
      console.error("Error voting in poll:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getResults: async (req, res) => {
    const { pollId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pollId)) {
      return res.status(400).json({ message: "Invalid poll ID" });
    }

    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ message: "Poll not found" });
      }

      res.json({ poll });
    } catch (error) {
      console.error("Error getting poll results:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default pollController;

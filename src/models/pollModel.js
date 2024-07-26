import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [pollOptionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  anonymousParticipants: [{ type: String }],
  isAnonymous: { type: Boolean, default: false },
  resultsVisibleBeforeEnd: { type: Boolean, default: false },
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;

// src/models/eventModel.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  picture: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Ongoing", "Completed", "Passed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;

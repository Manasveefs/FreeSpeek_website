import mongoose from "mongoose";

const safetyPostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: {
    type: String,
    required: true,
  },
  description: { type: String, required: true },
  incidentDate: { type: Date, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  poster: { type: String },
});

const SafetyPost = mongoose.model("SafetyPost", safetyPostSchema);

export default SafetyPost;

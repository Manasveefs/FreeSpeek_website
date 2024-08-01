// src/models/postModel.js
import mongoose, { mongo } from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  picture: { type: String },
  date: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tags: [{ type: String }],
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  contentType: { type: String, enum: ["text", "photo", "video", "link"] },
  taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  visibility: {
    type: String,
    enum: ["global", "local", "group"],
    default: "global",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: { type: [Number], required: false },
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  allowedViewers: {
    type: String,
    enum: ["anyone", "neighborhood", "connections"],
    default: "anyone",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

postSchema.index({ location: "2dsphere" });

const Post = mongoose.model("Post", postSchema);

export default Post;

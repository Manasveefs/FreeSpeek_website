import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["Pending", "approved", "declined"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  respondAt: { type: Date },
});
const Invite = mongoose.model("Invite", inviteSchema);

export default Invite;

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reportingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reportSchema.index({ reportingUser: 1, reportedUser: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

export default Report;

import mongoose from "mongoose";

const NeighborhoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Neighborhood = mongoose.model("Neighborhood", NeighborhoodSchema);

export default Neighborhood;

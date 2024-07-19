import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  pictures: [{ type: String, required: true }],
  price: { type: Number, String, required: true },
  category: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;

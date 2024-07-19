import Listing from "../models/listingModel.js";

const listController = {
  createListing: async (req, res) => {
    const { title, description, pictures, price, category, pickupLocation } =
      req.body;

    if (pictures.length > 6) {
      return res
        .status(400)
        .json({ message: "You can upload a maximum of 6 pictures" });
    }
    try {
      const listing = new Listing({
        user: req.user._id,
        title,
        description,
        pictures,
        price,
        category,
        pickupLocation,
      });

      await listing.save();
      res
        .status(201)
        .json({ message: "Listing created successfully", listing });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error", error });
    }
  },
  getListings: async (req, res) => {
    try {
      const listings = await Listing.find().populate("user", "name");
      res.status(200).json(listings);
    } catch (error) {
      res.status(500).send({ message: "server error", error });
    }
  },

  getListingById: async (req, res) => {
    const { id } = req.params;
    try {
      const listing = await Listing.findById(id).populate("user", "name");
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.status(200).json(listing);
    } catch (error) {
      console.error("Error fetching listing", error);
      res.status(500).send({ message: "Server Error", error });
    }
  },

  updateListing: async (req, res) => {
    const { id } = req.params;
    const { title, description, pictures, price, category, pickupLocation } =
      req.body;

    // Validate that no more than 6 pictures are provided
    if (pictures && pictures.length > 6) {
      return res
        .status(400)
        .json({ message: "You can upload a maximum of 6 pictures" });
    }

    try {
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Check if the user updating the listing is the owner
      if (listing.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to update this listing" });
      }

      listing.title = title || listing.title;
      listing.description = description || listing.description;
      listing.pictures = pictures || listing.pictures;
      listing.price = price || listing.price;
      listing.category = category || listing.category;
      listing.pickupLocation = pickupLocation || listing.pickupLocation;

      await listing.save();
      res
        .status(200)
        .json({ message: "Listing updated successfully", listing });
    } catch (error) {
      console.error("Error updating listing:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  deleteListing: async (req, res) => {
    const { id } = req.params;

    try {
      const listing = await Listing.findById(id);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Check if the user deleting the listing is the owner
      if (listing.user.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to delete this listing" });
      }

      await listing.deleteOne({ id });
      res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
      console.error("Error deleting listing:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default listController;

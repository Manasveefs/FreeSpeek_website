import Neighborhood from "../models/neighborhoodModel.js";

const neighborhoodController = {
  createNeighborhood: async (req, res) => {
    const { name, location } = req.body;

    if (!name || !location) {
      return res
        .status(400)
        .json({ message: "Name and location are required" });
    }

    try {
      const neighborhoodExists = await Neighborhood.findOne({ name, location });
      if (neighborhoodExists) {
        return res.status(400).json({ message: "Neighborhood already exists" });
      }

      const neighborhood = new Neighborhood({ name, location });
      await neighborhood.save();
      res
        .status(201)
        .json({ message: "Neighborhood created successfully", neighborhood });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Server error", error: err.message });
    }
  },

  getNeighborhoods: async (req, res) => {
    try {
      const neighborhoods = await Neighborhood.find();
      res.json({
        message: "Neighborhoods retrieved successfully",
        neighborhoods,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Server error", error: err.message });
    }
  },
};

export default neighborhoodController;

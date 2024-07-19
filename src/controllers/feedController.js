import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { calculateRelevanceScore } from "../utils/relevanceScore.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
const feedController = {
  getNearbyPosts: async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    const userId = req.user.id;

    if (!latitude || !longitude || !radius) {
      return res
        .status(400)
        .json({ message: "Latitude, longitude, and radius are required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      return res.status(400).json({
        message: "Latitude, longitude, and radius must be valid numbers",
      });
    }

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const posts = await Post.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lon, lat],
            },
            $maxDistance: rad * 1000, // Convert radius to meters
          },
        },
      }).lean();

      res.json(posts);
    } catch (error) {
      console.error("Error fetching nearby posts:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
  getRecentPosts: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const connections = user.connections || [];

      const posts = await Post.find({
        $or: [{ user: { $in: connections } }, { user: userId }],
      })
        .sort({ date: -1 })
        .limit(50)
        .lean();

      res.json(posts);
    } catch (error) {
      console.error("Error fetching recent posts", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getForYouPosts: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userPreference = ["text", "photo"];

      const posts = await Post.find().lean();
      const relevantPosts = posts.map((post) => ({
        ...post,
        relevanceScore: calculateRelevanceScore(post, userPreference),
      }));

      relevantPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

      res.json(posts);
    } catch (error) {
      console.error("Error fetching 'For You' posts:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default feedController;

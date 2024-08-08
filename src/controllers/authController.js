import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const authController = {
  register: async (req, res) => {
    const { email, password, location, firstName, lastName, username } =
      req.body;
    try {
      if (!email || !password || !firstName || !lastName || !username) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Ensure location is provided
      if (!location || (!location.coordinates && !location.address)) {
        return res.status(400).json({ message: "Location is required" });
      }

      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let coordinates = location.coordinates;
      let address = location.address || "Unknown address";

      if (!coordinates && address !== "Unknown address") {
        try {
          // Geocode the address to get coordinates
          const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json`,
            {
              params: {
                q: address,
                key: process.env.OPENCAGE_API_KEY,
              },
            }
          );

          if (response.data.results.length > 0) {
            const loc = response.data.results[0].geometry;
            coordinates = [loc.lng, loc.lat];
          } else {
            return res
              .status(400)
              .json({ message: "Invalid address", error: response.data });
          }
        } catch (error) {
          console.error("Error during geocoding request:", error);
          return res
            .status(500)
            .json({ message: "Geocoding request failed", error });
        }
      }

      if (!coordinates) {
        // If coordinates are not set, use reverse geocoding to get the address
        try {
          const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json`,
            {
              params: {
                q: `${coordinates[1]}+${coordinates[0]}`,
                key: process.env.OPENCAGE_API_KEY,
              },
            }
          );

          if (response.data.results.length > 0) {
            address = response.data.results[0].formatted;
          } else {
            address = "Unknown address";
          }
        } catch (error) {
          console.error("Error during reverse geocoding:", error);
        }
      }

      user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        location: {
          type: "Point",
          coordinates,
          address,
        },
        registeredWith: "email",
        lastLoginWith: "email",
      });

      await user.save();

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      res.json({ token });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).send({ message: "Internal Server error", error });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      if (user.isSuspended) {
        return res.status(403).json({ message: "User account is suspended" });
      }

      user.lastLoginWith = "email";
      await user.save();

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server error", error });
    }
  },

  updateUser: async (req, res) => {
    const {
      phoneNumber,
      firstName,
      lastName,
      preferredName,
      gender,
      preferredGender,
      dateOfBirth,
      homeLocation,
    } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.preferredName = preferredName || user.preferredName;
      user.gender = gender || user.gender;
      user.preferredGender = preferredGender || user.preferredGender;
      user.dateOfBirth = dateOfBirth || user.dateOfBirth;
      user.homeLocation = homeLocation || user.homeLocation;

      await user.save();

      res.json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  suspendUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.isSuspended = true;
      await user.save();

      res.json({ message: "User suspended successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  reactivateUser: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.isSuspended) {
        return res
          .status(400)
          .json({ message: "User account is not suspended" });
      }

      user.isSuspended = false;
      await user.save();

      res.json({ message: "User account reactivated successfully", user });
    } catch (error) {
      console.error("Error in reactivating user:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  adminReactivateUser: async (req, res) => {
    const { userId } = req.body; // Assume admin provides the user ID

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.isSuspended) {
        return res
          .status(400)
          .json({ message: "User account is not suspended" });
      }

      user.isSuspended = false;
      await user.save();

      res.json({ message: "User account reactivated successfully", user });
    } catch (error) {
      console.error("Error in reactivating user:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  blockUser: async (req, res) => {
    const { userIdToBlock } = req.body;
    const currentUserId = req.user._id;

    try {
      const currentUser = await User.findById(currentUserId);
      const userToBlock = await User.findById(userIdToBlock);

      if (!userToBlock) {
        return res.status(404).json({ message: "User to block not found" });
      }
      if (currentUser.blockedUsers.includes(userIdToBlock)) {
        return res.status(400).json({ message: "User is already blocked" });
      }
      currentUser.blockUsers.push(userIdToBlock);
      await currentUser.save();

      res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  unblockUser: async (req, res) => {
    const { userIdToUnblock } = req.body;
    const currentUserId = req.user.id;
    try {
      const currentUser = await User.findById(currentUserId);

      const index = currentUser.blockUsers.indexOf(userIdToUnblock);
      if (index === -1) {
        return res.status(400).json({ message: "User not blocked" });
      }
      currentUser.blockedUsers.splice(index, 1);
      await currentUser.save();

      res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getBlockedUsers: async (req, res) => {
    const currentUserId = req.user._id;
    try {
      const currentUser = await User.findById(currentUserId).populate(
        "blockedUsers",
        ["firstName", "lastName", "email"]
      );

      res.status(200).json({ blockedUsers: currentUser.blockedUsers });
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default authController;

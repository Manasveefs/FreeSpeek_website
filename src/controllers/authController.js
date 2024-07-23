import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

const authController = {
  register: async (req, res) => {
    const { email, password, location } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let coordinates;
      if (location.coordinates && location.coordinates.length === 2) {
        coordinates = location.coordinates;
      } else if (location.address) {
        try {
          const response = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json`,
            {
              params: {
                q: location.address,
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
      } else {
        return res.status(400).json({ message: "Location data is required" });
      }

      user = new User({
        email,
        password: hashedPassword,
        location: {
          type: "Point",
          coordinates,
          address: location.address,
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
};

export default authController;

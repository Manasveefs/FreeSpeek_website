import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import { admin } from "../services/firebase.js";

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
        // Convert address to coordinates using OpenCage Geocoding API
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
          coordinates: coordinates,
          address: location.address,
        },
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
  oauth: async (req, rs) => {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      // const email = decodedToken.email;
      const { uid, email, name, picture } = decodedToken;
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          password: uid,
          firstName: name,
          profilePicture: picture,
          location: {
            type: "Point",
            coordinates: [0, 0],
          },
        });
        await user.save();
      }
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expireIn: 3600,
      });

      res.json({ token });
    } catch (error) {
      res.status(500).send({ message: "Error verifying ID token", error });
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
    console.log("reactivateUser function called");

    try {
      console.log("req.user:", req.user); // Log the req.user object

      const user = await User.findById(req.user.id); // Use req.user.id
      if (!user) {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
      }

      // Log the entire user object
      console.log("User object:", JSON.stringify(user, null, 2));

      // Check and log the isSuspended field specifically
      console.log(`User isSuspended: ${user.isSuspended}`);

      if (!user.isSuspended) {
        return res
          .status(400)
          .json({ message: "User account is not suspended" });
      }

      user.isSuspended = false;
      await user.save();

      console.log("User account reactivated:", JSON.stringify(user, null, 2));
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

import User from "../models/userModel.js";
import { admin } from "../services/firebase.js";
import jwt from "jsonwebtoken";

const socialAuthController = {
  oauth: async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
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
          registeredWith: "google",
          lastLoginWith: "google",
        });
        await user.save();
      } else {
        user.lastLoginWith = "google";
        await user.save();
      }

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      res.json({ token });
    } catch (error) {
      res.status(500).send({ message: "Error verifying ID token", error });
    }
  },

  appleSignIn: async (req, res) => {
    const { idToken } = req.body;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email } = decodedToken;
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          password: uid,
          registeredWith: "apple",
          lastLoginWith: "apple",
        });
        await user.save();
      } else {
        user.lastLoginWith = "apple";
        await user.save();
      }

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  phoneSignIn: async (req, res) => {
    const { phoneNumber, verificationCode } = req.body;
    try {
      const decodedToken = await admin.auth().verifyIdToken(verificationCode);
      const { uid } = decodedToken;

      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = new User({
          phoneNumber,
          password: uid,
          registeredWith: "phone",
          lastLoginWith: "phone",
        });
        await user.save();
      } else {
        user.lastLoginWith = "phone";
        await user.save();
      }

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  googleSignIn: async (req, res) => {
    const { idToken } = req.body;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, picture, uid } = decodedToken;

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          firstName: name,
          provider: "google",
          password: "",
          registeredWith: "google",
          lastLoginWith: "google",
        });
        await user.save();
      } else {
        user.lastLoginWith = "google";
        await user.save();
      }

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      res.json({ token, user });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },

  facebookSignIn: async (req, res) => {
    const { idToken } = req.body;

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { email, name, picture, uid } = decodedToken;

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email,
          firstName: name,
          provider: "facebook",
          password: "",
          registeredWith: "facebook",
          lastLoginWith: "facebook",
        });
        await user.save();
      } else {
        user.lastLoginWith = "facebook";
        await user.save();
      }

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 3600,
      });

      res.json({ token, user });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },
};

export default socialAuthController;

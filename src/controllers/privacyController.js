import User from "../models/userModel.js";

const privacyController = {
  getPrivacySettings: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("privacySettings");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ privacySettings: user.privacySettings });
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  updatePrivacySettings: async (req, res) => {
    const { privacySettings } = req.body;
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      user.privacySettings = { ...user.privacySettings, ...privacySettings };
      await user.save();

      res.json({
        message: "Privacy settings update successfully",
        privacySettings: user.privacySettings,
      });
    } catch (error) {
      console.error("Error update privacy settings:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default privacyController;

import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

const passwordController = {
  requestPasswordReset: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      user.resetPasswordToken = token;
      user.resetPasswordExpires = tokenExpiry;

      await user.save();

      // Verify the token and expiry time were saved correctly
      const savedUser = await User.findOne({ email });
      console.log(`Saved token for ${email}: ${savedUser.resetPasswordToken}`);
      console.log(
        `Saved token expiry for ${email}: ${savedUser.resetPasswordExpires}`
      );

      console.log(`Password reset token for ${email}: ${token}`);
      console.log(`Token expiry time for ${email}: ${tokenExpiry}`);

      // Configure nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL,
        subject: "Password Reset",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               http://localhost:3000/reset/${token}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      transporter.sendMail(mailOptions, (err, response) => {
        if (err) {
          console.error("Error sending email:", err);
          return res.status(500).send({ message: "Error sending email" });
        }
        res
          .status(200)
          .json({ message: "Password reset email sent successfully" });
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  resetPassword: async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      console.log(`Token received: ${token}`);
      console.log(`Current time: ${new Date().toISOString()}`);

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        console.log(
          `Token is invalid or expired. Current time: ${new Date().toISOString()}`
        );
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      console.log(
        `User found: ${user.email}, token expiry: ${new Date(
          user.resetPasswordExpires
        ).toISOString()}`
      );

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  changePassword: async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();
      res
        .status(200)
        .json({ message: "Password has been changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default passwordController;

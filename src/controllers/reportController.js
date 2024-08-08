import User from "../models/userModel.js";
import Report from "../models/reportModel.js";

const reportController = {
  reportUser: async (req, res) => {
    const { reportedUserId, message } = req.body;
    const reportingUserId = req.user.id;

    try {
      const reportedUser = await User.findById(reportedUserId);

      if (!reportedUser) {
        return res.status(404).json({ message: "Reported user not found" });
      }

      const existingReport = await Report.findOne({
        reportingUser: reportingUserId,
        reportedUser: reportedUserId,
      });

      if (existingReport) {
        return res.status(400).json({
          message: "You have already reported this user.",
          reportId: existingReport._id,
        });
      }

      const report = new Report({
        reportingUser: reportingUserId,
        reportedUser: reportedUserId,
        message,
      });

      await report.save();

      res.status(201).json({
        message: "User reported successfully",
        report,
      });
    } catch (error) {
      console.error("Error reporting user:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getReports: async (Req, res) => {
    try {
      const reports = await Report.find()
        .populate("reportingUser", "name email")
        .populate("reportedUser", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({ reports });
    } catch (error) {
      console.error("error fetching reports:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  resolveReport: async (req, res) => {
    const { reportId } = req.params;

    try {
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      await report.deleteOne();

      res.status(200).json({ message: "Report resolved successfully" });
    } catch (error) {
      console.error("Error resolving report", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default reportController;

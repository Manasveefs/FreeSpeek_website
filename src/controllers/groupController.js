import Group from "../models/groupModel.js";
import User from "../models/userModel.js";

const groupController = {
  createGroup: async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    try {
      const newGroup = new Group({
        name,
        description,
        createdBy: req.user.id,
        members: [req.user.id],
      });
      await newGroup.save();

      res
        .status(201)
        .json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
      console.error("Error creating group", error);
      res.status(500).json({ message: "Sever error", error });
    }
  },
  getGroups: async (req, res) => {
    try {
      const groups = await Group.find()
        .populate("createdBy", ["name", "email"])
        .populate("members", ["name", "email"]);
      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getGroupsById: async (req, res) => {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId)
        .populate("createdBy", ["name"])
        .populate("member", ["name"]);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  updateGroup: async (req, res) => {
    const { groupId } = req.params;
    const { name, description } = req.body;

    if (!name && description) {
      return res.status(400).json(400)({ message: "Nothing to update" });
    }
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }
      group.name = name || group.name;
      group.description = description || group.description;
      group.updatedAt = Date.now();

      await group.save();
      res.json({ message: "Group updated successfully", group });
    } catch (error) {
      console.error("Error update group", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  deleteGroup: async (req, res) => {
    const { groupId } = req.params;
    try {
      const group = await Group.findById(groupId);
      if (!groupId) {
        return res.status(404).json({ message: "Group not found" });
      }
      if (group.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }
      await group.remove();
      res.json({ message: "Group delete successfully" });
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  addUserToGroup: async (req, res) => {
    const { groupId, userId } = req.body;

    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (group.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already register a member of this group" });
      }
      group.members.push(userId);
      await group.save();
      res.json({ message: "User added to group successfully", group });
    } catch (error) {
      console.error("Error adding user to group:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  removeUserFromGroup: async (req, res) => {
    const { groupId, userId } = req.body;
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      const userIndex = group.members.indexOf(userId);
      if (userIndex === -1) {
        return res
          .status(400)
          .json({ message: "User is not a member of this group" });
      }
      group.members.splice(userIndex, 1);
      await group.save();
      res.json({ message: "User remove from group successfully:", group });
    } catch (error) {
      console.error("Error removing user from group:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getGroupMembers: async (req, res) => {
    const { groupId } = req.params;

    try {
      const group = await Group.findById(groupId).populate("members", ["name"]);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json(group.members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default groupController;

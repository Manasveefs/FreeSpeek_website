import express from "express";

import groupController from "../controllers/groupController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const groupRouter = express.Router();

groupRouter.post("/create", authMiddleware, groupController.createGroup);
groupRouter.get("/", groupController.getGroups);
groupRouter.get("/:groupId", groupController.getGroupsById);
groupRouter.put("/:groupId", authMiddleware, groupController.updateGroup);
groupRouter.delete("/groupId", authMiddleware, groupController.deleteGroup);
groupRouter.post("/addUser", authMiddleware, groupController.addUserToGroup);
groupRouter.post(
  "/removeUser",
  authMiddleware,
  groupController.removeUserFromGroup
);
groupRouter.get(
  "/groupId/members",
  authMiddleware,
  groupController.getGroupMembers
);

export default groupRouter;

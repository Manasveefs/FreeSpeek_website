import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const chatController = {
  createChat: async (req, res) => {
    const { userIds } = req.body;
    try {
      const participants = [req.user.id, ...userIds];
      const chat = new Chat({ participants });
      await chat.save();
      res.json({ message: "Chat created successfully", chat });
    } catch (error) {
      console.error("Error created chat", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getUserChat: async (req, res) => {
    try {
      const chats = await Chat.find({
        participants: res.user.id,
      }).populate("participants", ["email"]);
      res.json(chats);
    } catch (error) {
      console.error("Error fetching user chat", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getChatMessages: async (req, res) => {
    const { chatId } = req.params;
    try {
      const messages = await Message.find({ chat: chatId })
        .populate("sender", [email])
        .sort({ createAt: 1 });
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  sendMessage: async (req, res) => {
    const { chatId, content } = req.body;
    try {
      const message = new Message({
        chat: chatId,
        sender: req.usr.id,
        content,
      });
      await message.save();
      await Chat.findByIdAndUpdate(chatId, { updateAth: Date.now() });
      res.json({ message: "Message send successfully", message });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default chatController;

import http from "http";
import { Server } from "socket.io";
import app from "../app.js";
import Message from "../models/messageModel.js"; // Adjust the import path if necessary

// Create HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO setup
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("sendMessage", async (message) => {
    // Save the message to the database
    const newMessage = new Message(message);
    await newMessage.save();
    io.to(message.chat).emit("newMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.set("io", io); // Set the io instance to be used in controllers

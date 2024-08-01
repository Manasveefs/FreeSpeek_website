import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { bucket } from "../services/firebase.js";
import { v4 as uuidv4 } from "uuid";

const postController = {
  createPost: async (req, res) => {
    const { title, content, tags, date, visibility, groups, allowedViewers } =
      req.body;

    let location = null;

    try {
      if (req.body.location) {
        const locationData = JSON.parse(req.body.location);
        location = {
          type: locationData.type,
          coordinates: [
            parseFloat(locationData.coordinates[0]),
            parseFloat(locationData.coordinates[1]),
          ],
        };
      }
    } catch (err) {
      console.error("Location parsing error:", err);
      return res.status(400).json({ message: "Invalid location data" });
    }

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    let pictureUrl = null;
    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname}`;
      try {
        const fileUpload = bucket.file(fileName);
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: req.file.mimetype,
          },
        });

        blobStream.on("error", (error) => {
          console.error("Blob stream error:", error);
          return res
            .status(500)
            .json({ message: "Unable to upload picture", error });
        });

        blobStream.on("finish", async () => {
          pictureUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

          const post = new Post({
            user: req.user.id,
            title,
            content,
            picture: pictureUrl,
            tags,
            date: date || Date.now(),
            location,
            groups,
            allowedViewers,
          });

          try {
            await post.save();
            res.json({ message: "Post created successfully", post });
          } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Server error", error });
          }
        });

        blobStream.end(req.file.buffer);
      } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Server error", error });
      }
    } else {
      const post = new Post({
        user: req.user.id,
        title,
        content,
        tags,
        date: date || Date.now(),
        location,
        visibility,
        groups,
        allowedViewers,
      });

      try {
        await post.save();
        res.json({ message: "Post created successfully", post });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error", error });
      }
    }
  },

  getPosts: async (req, res) => {
    try {
      const posts = await Post.find()
        .populate("user", ["name"])
        .populate("groups", ["name"]);
      res.json(posts);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  updatePost: async (req, res) => {
    const { title, content, visibility, groups, allowedViewers } = req.body;
    const { postId } = req.params;
    const picture = req.file ? req.file.path : null;

    if (
      !title &&
      !content &&
      !picture &&
      !visibility &&
      !groups &&
      !allowedViewers
    ) {
      return res.status(400).json({ message: "Title or content is required" });
    }

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }

      post.title = title || post.title;
      post.content = content || post.content;
      post.visibility = visibility || post.visibility;
      post.groups = groups || post.groups;
      post.allowedViewers = allowedViewers || post.allowedViewers;
      if (picture) post.picture = picture;

      await post.save();
      res.json({ message: "Post updated successfully", post });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  deletePost: async (req, res) => {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }

      await post.remove();
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  likePost: async (req, res) => {
    const { postId } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.likes.includes(req.user._id)) {
        return res
          .status(400)
          .json({ message: "You have already liked this post" });
      }

      post.likes.push(req.user._id);
      await post.save();

      res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  unlikePost: async (req, res) => {
    const { postId } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const likeIndex = post.likes.indexOf(req.user._id);
      if (likeIndex === -1) {
        return res
          .status(400)
          .json({ message: "You have not liked this post" });
      }

      post.likes.splice(likeIndex, 1);
      await post.save();

      res.status(200).json({ message: "Post unliked successfully", post });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  sharePost: async (req, res) => {
    const { postId } = req.body;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const sharedPost = new Post({
        user: req.user._id,
        title: post.title,
        content: post.content,
        picture: post.picture,
        date: Date.now(),
        isShared: true,
        originalPost: post._id,
      });

      await sharedPost.save();
      res.status(201).json({ message: "Post shared successfully", sharedPost });
    } catch (error) {
      console.error("Error sharing post:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },

  tagUserInPost: async (req, res) => {
    const { postId, userId } = req.body;
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!post.taggedUsers.includes(userId)) {
        post.taggedUsers.push(userId);
        await post.save();
      }
      res.json({ message: "User tagged in post successfully ", post });
    } catch (error) {
      console.error("Error tagged user in post:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  updatePostPicture: async (req, res) => {
    const { postId } = req.params;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "User not authorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No picture file provided" });
      }

      const fileName = `${uuidv4()}-${req.file.originalname}`;
      const fileUpload = bucket.file(fileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      blobStream.on("error", (error) => {
        console.error("Blob stream error:", error);
        return res
          .status(500)
          .json({ message: "Unable to upload picture", error });
      });

      blobStream.on("finish", async () => {
        const pictureUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        post.picture = pictureUrl;

        try {
          await post.save();
          res.json({ message: "Post picture updated successfully", post });
        } catch (error) {
          console.error(error);
          res.status(500).send({ message: "Server error", error });
        }
      });

      blobStream.end(req.file.buffer);
    } catch (error) {
      console.error("Error updating post picture:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
};

export default postController;

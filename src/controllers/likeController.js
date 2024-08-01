import Like from "../models/likeModel.js";
import Post from "../models/postModel.js";

const likeController = {
  addLike: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const existingLike = await Like.findOne({ postId, userId });
      if (existingLike) {
        return res
          .status(400)
          .json({ message: "You have already liked this post" });
      }

      const like = new Like({ userId, postId });
      await like.save();

      res.status(201).json({ message: "Post liked successfully", like });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },

  removeLike: async (req, res) => {
    const { postId } = req.body;
    const userId = req.user._id;

    try {
      const like = await Like.findByIdAndDelete({ postId, userId });
      if (!like) {
        return res.status(404).json({ message: "Like not found" });
      }

      const post = await Post.findById(postId);
      if (post) {
        post.likesCount -= 1;
        await post.save();
      }

      res.status(200).json({ message: "Like remove successfully" });
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  getLikeForPost: async (req, res) => {
    const { postId } = req.params;
    try {
      const likes = await Like.find({ postId }).populate("userId", [
        "name",
        "email",
      ]);
      res.status(200).json({ likes });
    } catch (error) {
      console.error("Error fetching likes", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default likeController;

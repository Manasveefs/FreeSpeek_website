import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";

const commentController = {
  addComment: async (req, res) => {
    const { postId, text } = req.body;
    const userId = req.user._id;

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = new Comment({
        postId,
        userId: req.user._id,
        text,
      });

      await comment.save();

      post.commentsCount += 1;
      await post.save();
      res.status(201).json({ message: "Comment added successfully", comment });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
  editComment: async (req, res) => {
    const { commentId, text } = req.body;
    const userId = res.user._id;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      if (comment.userId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to edit this comment" });
      }

      comment.text = text;
      comment.updateAt = Date.now();
      await comment.save();

      res.status(200).json({ message: "Comment edited successfully", comment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error });
    }
  },

  deleteComment: async (req, res) => {
    const { commentId } = req.body;
    const userId = req.user._id;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      if (comment.userId.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "User not authorized to delete this comment" });
      }

      await comment.deleteOne({ _id: commentId });

      const post = await Post.findById(comment.postId);
      if (post) {
        post.commentsCount -= 1;
        await post.save();
      }
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).send({ message: "Server error", error });
    }
  },
  getCommentForPost: async (req, res) => {
    const { postId } = req.params;

    try {
      const comments = await Comment.find({ post: postId }).populate("user", [
        "name",
        "email",
      ]);
      res.status(200).json({ comments });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
};

export default commentController;

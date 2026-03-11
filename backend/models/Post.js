const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  mediaUrl: String,
  mediaType: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  comments: [commentSchema],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
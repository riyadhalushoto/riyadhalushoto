const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  content: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
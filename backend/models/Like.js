const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }
});

module.exports = mongoose.model("Like", likeSchema);
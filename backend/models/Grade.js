const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  student_name: String,
  subject: String,
  grade: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Grade", gradeSchema);
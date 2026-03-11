const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  student_number: { type: String, required: true },
  password: { type: String, required: true },
  parent_email: String,
  class_name: String,
  role: { type: String, default: "student" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", studentSchema);
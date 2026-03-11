const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  student_name: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["present","absent"], default: "present" }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
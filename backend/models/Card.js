const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  qr_code_url: String,
  generated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Card", cardSchema);
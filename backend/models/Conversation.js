const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Met à jour automatiquement la date de modification
ConversationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
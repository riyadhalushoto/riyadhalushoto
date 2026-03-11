const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
{
sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
text: { type: String, default: "" },
fileUrl: { type: String, default: null },
fileType: { type: String, default: null },
edited: { type: Boolean, default: false },
deleted: { type: Boolean, default: false }, // soft delete
seen: { type: Boolean, default: false } // message lu ou non
},
{ timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({

  title: String,

  message: String,

  target: {
    type: String,
    default: "all"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Notification", NotificationSchema);
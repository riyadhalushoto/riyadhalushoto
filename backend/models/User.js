const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
firstName: { type: String },
middleName: { type: String },
lastName: { type: String },

username: { type: String },

studentNumber: {
type: String,
unique: true,
sparse: true
},

dob: { type: String },
nationality: { type: String },
idNumber: { type: String },
country: { type: String },
region: { type: String },
phone: { type: String },

email: { type: String, required: true, unique: true },

password: { type: String, required: true },

role: {
type: String,
enum: ["admin", "teacher", "student", "parent", "user"],
default: "student"
},

photoUrl: { type: String, default: null },

followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

refreshToken: { type: String }

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
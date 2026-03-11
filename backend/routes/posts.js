const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Multer configuration pour upload
const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, "uploads/"),
filename: (req, file, cb) =>
cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Helper pour vérifier ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ================= FEED GLOBAL (Affiche tout pour éviter les posts cachés) =================
router.get("/", async (req, res) => {
try {
const { page = 1, limit = 10 } = req.query;

// Suppression du filtre 'following' pour que tout le monde voie tout  
const posts = await Post.find()  
  .populate("createdBy", "username photoUrl")  
  .populate("comments.user", "username photoUrl")  
  .sort({ createdAt: -1 }) // Les plus récents en premier  
  .skip((page - 1) * Number(limit))  
  .limit(Number(limit));  

res.json(Array.isArray(posts) ? posts : []);

} catch (err) {
console.error("Erreur GET posts:", err);
res.status(500).json({ message: err.message });
}
});

// ================= EXPLORER (posts populaires) =================
router.get("/explore", async (req, res) => {
try {
const posts = await Post.find()
.sort({ "likes.length": -1 }) // Tri par nombre de likes
.limit(20)
.populate("createdBy", "username photoUrl")
.populate("comments.user", "username photoUrl");

res.json(Array.isArray(posts) ? posts : []);

} catch (err) {
console.error(err);
res.status(500).json({ message: err.message });
}
});

// ================= CREATE POST (Support Title + Content) =================
router.post("/", upload.single("media"), async (req, res) => {
try {
const { title, content, userId } = req.body;
const io = req.app.get("socketio"); // Récupère socket.io si configuré dans server.js

if (!userId || !isValidObjectId(userId)) {  
  return res.status(400).json({ message: "ID utilisateur manquant ou invalide" });  
}  

const post = await Post.create({  
  title: title || "",  
  content: content || "",  
  createdBy: new mongoose.Types.ObjectId(userId),  
  mediaUrl: req.file ? req.file.filename : null,  
  mediaType: req.file  
    ? req.file.mimetype.startsWith("video")  
      ? "video"  
      : "image"  
    : null  
});  

const populatedPost = await Post.findById(post._id)  
  .populate("createdBy", "username photoUrl");  

// Émettre via Socket.io pour mise à jour en temps réel  
if (io) io.emit("newPost", populatedPost);  

res.status(201).json(populatedPost);

} catch (err) {
console.error("Erreur création post:", err);
res.status(500).json({ message: "Erreur lors de la création de la publication" });
}
});

// ================= LIKE / UNLIKE =================
router.post("/:id/like", async (req, res) => {
try {
const { userId } = req.body;
const io = req.app.get("socketio");

if (!userId || !isValidObjectId(userId))  
  return res.status(400).json({ message: "userId invalide" });  

const post = await Post.findById(req.params.id);  
if (!post) return res.status(404).json({ message: "Post non trouvé" });  

const alreadyLiked = post.likes.includes(userId);  

if (alreadyLiked) {  
  post.likes = post.likes.filter(id => id.toString() !== userId);  
} else {  
  post.likes.push(userId);  

  if (post.createdBy.toString() !== userId) {  
    await Notification.create({  
      recipient: post.createdBy,  
      sender: userId,  
      type: "like",  
      postId: post._id  
    });  
  }  
}  

await post.save();  

const updatedPost = await Post.findById(post._id)  
  .populate("createdBy", "username photoUrl")  
  .populate("comments.user", "username photoUrl");  

if (io) io.emit("updatePost", updatedPost);  

res.json(updatedPost);

} catch (err) {
res.status(500).json({ message: err.message });
}
});

// ================= COMMENT =================
router.post("/:id/comment", async (req, res) => {
try {

const { userId, text } = req.body;  
const io = req.app.get("socketio");  

if (!userId || !text)  
  return res.status(400).json({ message: "Texte requis" });  

const post = await Post.findById(req.params.id);  

if (!post)  
  return res.status(404).json({ message: "Post non trouvé" });  

post.comments.unshift({  
  user: new mongoose.Types.ObjectId(userId),  
  text,  
  createdAt: new Date()  
});  

if (post.createdBy.toString() !== userId) {  
  await Notification.create({  
    recipient: post.createdBy,  
    sender: userId,  
    type: "comment",  
    postId: post._id  
  });  
}  

await post.save();  

const populatedPost = await Post.findById(post._id)  
  .populate("createdBy", "username photoUrl")  
  .populate("comments.user", "username photoUrl");  

if (io) io.emit("updatePost", populatedPost);  

res.json(populatedPost);

} catch (err) {
res.status(500).json({ message: err.message });
}
});
module.exports = router;
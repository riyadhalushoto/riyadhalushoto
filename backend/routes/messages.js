const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authenticate = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration Multer pour les fichiers
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
destination: uploadPath,
filename: (req, file, cb) =>
cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ================= ENVOYER UN MESSAGE TEXTE =================
router.post("/", authenticate, async (req, res) => {
try {
const { receiver, text } = req.body;

if (!receiver || (!text && text !== "")) {  
  return res.status(400).json({ message: "Receiver et text requis" });  
}  

const message = new Message({  
  sender: req.user.id,  
  receiver,  
  text  
});  

await message.save();  

const populated = await Message.findById(message._id)  
  .populate("sender", "username photoUrl")  
  .populate("receiver", "username photoUrl");  

res.json(populated);

} catch (err) {
console.error(err);
res.status(500).json({ message: "Erreur serveur" });
}
});

// ================= ENVOYER UN FICHIER (IMAGE/VIDÉO) =================
router.post("/file", authenticate, upload.single("file"), async (req, res) => {
try {
const { receiver, text } = req.body;

if (!receiver || !req.file) {  
  return res.status(400).json({ message: "Receiver et fichier requis" });  
}  

const message = new Message({  
  sender: req.user.id,  
  receiver,  
  text: text || "",  
  fileUrl: "/uploads/" + req.file.filename,  
  fileType: req.file.mimetype  
});  

await message.save();  

const populated = await Message.findById(message._id)  
  .populate("sender", "username photoUrl")  
  .populate("receiver", "username photoUrl");  

res.json(populated);

} catch (err) {
console.error(err);
res.status(500).json({ message: "Upload error" });
}
});

// ================= OBTENIR LES CONVERSATIONS D’UN UTILISATEUR =================
router.get("/conversations", authenticate, async (req, res) => {
try {
const userId = req.user.id;

const messages = await Message.find({  
  $or: [{ sender: userId }, { receiver: userId }]  
})  
  .populate("sender", "username photoUrl")  
  .populate("receiver", "username photoUrl")  
  .sort({ createdAt: 1 });  

const map = {};  

messages.forEach(msg => {  
  const other = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;  

  if (!map[other._id]) {  
    map[other._id] = { user: other, messages: [] };  
  }  

  // Masquer les messages supprimés  
  if (!msg.deleted) {  
    map[other._id].messages.push({  
      id: msg._id,  
      text: msg.text,  
      fileUrl: msg.fileUrl,  
      sender: msg.sender._id.toString() === userId ? "me" : "other",  
      createdAt: msg.createdAt,  
      edited: msg.edited  
    });  
  }  
});  

res.json(Object.values(map));

} catch (err) {
console.error(err);
res.status(500).json({ message: "Erreur serveur" });
}
});

// ================= MODIFIER UN MESSAGE =================
router.put("/:id", authenticate, async (req, res) => {
try {
const message = await Message.findById(req.params.id);
if (!message) return res.status(404).json({ message: "Message non trouvé" });

if (message.sender.toString() !== req.user.id)  
  return res.status(403).json({ message: "Non autorisé" });  

message.text = req.body.text;  
message.edited = true;  

await message.save();  
res.json(message);

} catch (err) {
console.error(err);
res.status(500).json({ message: "Erreur serveur" });
}
});

// ================= SUPPRIMER UN MESSAGE (soft delete) =================
router.delete("/:id", authenticate, async (req, res) => {
try {
const message = await Message.findById(req.params.id);
if (!message) return res.status(404).json({ message: "Message non trouvé" });

if (message.sender.toString() !== req.user.id)  
  return res.status(403).json({ message: "Non autorisé" });  

message.deleted = true;  
await message.save();  

res.json({ success: true });

} catch (err) {
console.error(err);
res.status(500).json({ message: "Erreur serveur" });
}
});

module.exports = router;
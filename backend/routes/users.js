const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/auth");

// ================= GET CURRENT USER PROFILE =================
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur profil" });
  }
});

// ================= GET ALL USERS =================
router.get("/", async (req, res) => {
  try {
    const { role, studentNumber } = req.query;
    let query = {};  
    if (role) query.role = role;  
    if (studentNumber) query.studentNumber = studentNumber;  
    const users = await User.find(query).select("-password -refreshToken");  
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= SEARCH USER =================
router.get("/search", authenticate, async (req, res) => {
  try {
    const query = req.query.query || "";
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("-password -refreshToken");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET USER BY USERNAME =================
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate("followers", "username")
      .populate("following", "username")
      .select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });  
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= UPDATE USER =================
router.put("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .select("-password -refreshToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= DELETE USER =================
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= FOLLOW / UNFOLLOW =================
router.post("/:id/follow", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow || !currentUser) return res.status(404).json({ message: "User not found" });  
    const isFollowing = currentUser.following.includes(userToFollow._id);  
    if (isFollowing) {  
      currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());  
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());  
    } else {  
      currentUser.following.push(userToFollow._id);  
      userToFollow.followers.push(currentUser._id);  
    }  
    await currentUser.save();  
    await userToFollow.save();  
    res.json({ message: "Follow updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET STUDENT BY NUMBER =================
router.get("/student/:number", authenticate, async (req, res) => {
  try {
    const student = await User.findOne({ studentNumber: req.params.number })
      .select("-password -refreshToken");
    if (!student) return res.status(404).json({ message: "Étudiant non trouvé" });  
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;

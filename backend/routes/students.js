const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/auth");

// ================= GET ALL STUDENTS =================
router.get("/", authenticate, async (req, res) => {
try {

const students = await User.find({ role: "student" })  
  .select("-password -refreshToken");  

res.json(students);

} catch (err) {

console.log(err);  
res.status(500).json({ message: "Erreur serveur" });

}
});

// ================= GET STUDENT BY NUMBER =================
router.get("/:number", authenticate, async (req, res) => {
try {

const student = await User.findOne({  
  studentNumber: req.params.number  
}).select("-password -refreshToken");  

if (!student) {  
  return res.status(404).json({  
    message: "Étudiant non trouvé"  
  });  
}  

res.json(student);

} catch (err) {

console.log(err);  
res.status(500).json({ message: "Erreur serveur" });

}
});

module.exports = router;

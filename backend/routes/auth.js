const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");


// ================= MULTER CONFIG =================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// ================= REGISTER =================

router.post("/register", upload.single("photo"), async (req, res) => {

  try {

    console.log("REGISTER BODY:", req.body);

    const {
      firstName,
      middleName,
      lastName,
      username,
      studentNumber,
      dob,
      nationality,
      idNumber,
      country,
      region,
      phone,
      email,
      password
    } = req.body;


    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis" });


    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "Email déjà utilisé" });


    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({

      firstName,
      middleName,
      lastName,
      username,
      studentNumber,

      dob,
      nationality,
      idNumber,
      country,
      region,
      phone,

      email,
      password: hashedPassword,

      photoUrl: req.file ? "/uploads/" + req.file.filename : null
    });


    await newUser.save();


    res.json({
      message: "Utilisateur créé avec succès",
      user: newUser
    });

  } catch (err) {

    console.error("REGISTER SERVER ERROR:", err);

    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });

  }

});

module.exports = router;
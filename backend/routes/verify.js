const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/:number", async (req, res) => {
  try {

    const student = await User.findOne({
      studentNumber: req.params.number,
      role: "student"
    }).select("-password -refreshToken");

    if (!student) {
      return res.status(404).json({
        message: "Étudiant non trouvé"
      });
    }

    res.json(student);

  } catch (err) {

    console.log(err);
    res.status(500).json({
      message: "Erreur serveur"
    });

  }
});

module.exports = router;
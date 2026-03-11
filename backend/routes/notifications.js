const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authenticate = require("../middleware/auth");


// créer notification (admin)
router.post("/", authenticate, async (req, res) => {

  try {

    const notification = new Notification({
      title: req.body.title,
      message: req.body.message
    });

    await notification.save();

    res.json(notification);

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }

});


// récupérer notifications
router.get("/", authenticate, async (req, res) => {

  try {

    const notifications = await Notification
      .find()
      .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }

});

module.exports = router;
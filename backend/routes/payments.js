const express = require("express");
const router = express.Router();
const axios = require("axios");

const Payment = require("../models/Payment");
const authenticate = require("../middlewares/auth");


// ================= PAYSTACK CONFIG =================

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;


// ================= INITIALIZE PAYMENT =================

router.post("/initialize", authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    const email = req.user.email; // maintenant email est défini

    if (!amount || !email) {
      console.log("PAYMENT INITIALIZE ERROR: req.user =", req.user);
      return res.status(400).json({
        status: false,
        message: "Amount et Email sont obligatoires"
      });
    }

    const reference = "PAY-" + Date.now();

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100, reference },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" } }
    );

    await Payment.create({ userId: req.user.id, amount, reference, provider: "paystack", status: "initialized" });

    res.json({ status: true, message: "Paiement initialisé", data: response.data.data });

  } catch (err) {
    console.error("PAYMENT INITIALIZE ERROR:", err.response?.data || err);
    res.status(500).json({ status: false, message: "Erreur Paystack" });
  }
});


// ================= EXPORT ROUTER =================

module.exports = router;
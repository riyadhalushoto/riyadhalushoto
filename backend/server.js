require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const User = require("./models/User");
const Message = require("./models/Message");
const Notification = require("./models/Notification");

const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const studentsRoutes = require("./routes/students");
const notificationsRoutes = require("./routes/notifications");
const messagesRoutes = require("./routes/messages");
const paymentsRoutes = require("./routes/payments");
const verifyRoutes = require("./routes/verify");

const authenticate = require("./middleware/auth");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Dossier upload pour fichiers
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadPath));

// Connexion MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// JWT Tokens
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d"
  });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* -------------------- AUTHENTICATION -------------------- */
// Register
app.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { firstName, middleName, lastName, username, email, password, phone, region, studentNumber } = req.body;

    if (!firstName || !lastName || !username || !email || !password)
      return res.status(400).json({ message: "Tous les champs obligatoires ne sont pas remplis" });

    if (await User.findOne({ username }))
      return res.status(400).json({ message: "Username déjà utilisé" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      region,
      studentNumber,
      password: hashedPassword,
      role: "student",
      photoUrl: req.file ? "/uploads/" + req.file.filename : null
    });

    await user.save();

    res.json({ message: "Compte créé avec succès", user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "Strict", maxAge: 15 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "Strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      token: accessToken,
      user: { id: user._id, username: user.username, role: user.role, photoUrl: user.photoUrl }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Profile
app.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ user: { id: user._id, email: user.email, role: user.role, photoUrl: user.photoUrl, username: user.username } });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/* -------------------- ROUTES -------------------- */
app.use("/posts", postsRoutes);
app.use("/users", usersRoutes);
app.use("/students", studentsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/messages", messagesRoutes);
app.use("/payments", paymentsRoutes);
app.use("/verify", verifyRoutes);

/* -------------------- SERVER -------------------- */
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", credentials: true } });
app.set("socketio", io);

// Online users
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  // Join
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("user_online", userId);
  });

  // Typing
  socket.on("typing", ({ sender, receiver }) => {
    const receiverSocket = onlineUsers[receiver];
    if (receiverSocket) io.to(receiverSocket).emit("typing", sender);
  });

  socket.on("stop_typing", ({ sender, receiver }) => {
    const receiverSocket = onlineUsers[receiver];
    if (receiverSocket) io.to(receiverSocket).emit("stop_typing", sender);
  });

  // Send message
  socket.on("send_message", (message) => {
    const receiverId = message.receiver?._id || message.receiver;
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receive_message", message);
      io.to(receiverSocket).emit("message_delivered", message._id);
    }
  });

  // Message seen
  socket.on("message_seen", ({ messageId, sender }) => {
    const senderSocket = onlineUsers[sender];
    if (senderSocket) io.to(senderSocket).emit("message_seen", messageId);
  });
  
  if (process.env.NODE_ENV === "production") {
  app.use(express.static("../frontend/dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

  // Disconnect
  socket.on("disconnect", () => {
    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        io.emit("user_offline", userId);
        break;
      }
    }
  });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

module.exports = { authenticate };
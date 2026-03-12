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
const http = require("http");
const { Server } = require("socket.io");

const User = require("./models/User");
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const studentsRoutes = require("./routes/students");
const notificationsRoutes = require("./routes/notifications");
const messagesRoutes = require("./routes/messages");
const paymentsRoutes = require("./routes/payments");
const verifyRoutes = require("./routes/verify");

const authenticate = require("./middleware/auth");

const app = express();

const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const allowedOrigins = [
  "https://riyadhalushoto.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadPath));

mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "access_secret",
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: "7d"
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/register", upload.single("photo"), async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, username, email, 
      password, phone, region, studentNumber,
      dob, nationality, idNumber, country 
    } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: "Username ou Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName, middleName, lastName, username, email, phone, region,
      studentNumber, dob, nationality, idNumber, country,
      password: hashedPassword,
      role: "student",
      photoUrl: req.file ? "/uploads/" + req.file.filename : null
    });

    await user.save();
    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, { 
        httpOnly: true, 
        secure: true, 
        sameSite: "None", 
        maxAge: 15 * 60 * 1000 
    });

    res.json({
      token: accessToken,
      user: { id: user._id, username: user.username, role: user.role, photoUrl: user.photoUrl }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.use("/posts", postsRoutes);
app.use("/users", usersRoutes);
app.use("/students", studentsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/messages", messagesRoutes);
app.use("/payments", paymentsRoutes);
app.use("/verify", verifyRoutes);

// ... (reste du code inchangé jusqu'à la création du serveur)

const server = http.createServer(app);

// CONFIGURATION SOCKET.IO AMÉLIORÉE
const io = new Server(server, { 
    cors: { 
        origin: "https://riyadhalushoto.vercel.app", 
        methods: ["GET", "POST"],
        credentials: true 
    },
    transports: ['websocket', 'polling'] // Force le support des deux modes
});

app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("⚡ Un utilisateur s'est connecté :", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 Utilisateur ${userId} a rejoint sa room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Déconnexion");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});

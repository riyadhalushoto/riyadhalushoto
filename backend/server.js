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
// Import des routes
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const studentsRoutes = require("./routes/students");
const notificationsRoutes = require("./routes/notifications");
const messagesRoutes = require("./routes/messages");
const paymentsRoutes = require("./routes/payments");
const verifyRoutes = require("./routes/verify");

const authenticate = require("./middleware/auth");

const app = express();

// --- CONFIGURATION DOSSIER UPLOADS ---
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// --- CONFIGURATION CORS (Production + Local) ---
const allowedOrigins = [
  "https://riyadhalushoto.vercel.app", // REMPLACE PAR TON URL VERCEL FINAL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS non autorisé'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadPath));

// --- CONNEXION MONGODB ---
mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// --- UTILITAIRES JWT ---
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret", {
    expiresIn: "7d"
  });

// --- CONFIGURATION MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* -------------------- AUTHENTICATION -------------------- */

// Dans server.js, remplace la route app.post("/register", ...) par celle-ci :
app.post("/register", upload.single("photo"), async (req, res) => {
  try {
    // On récupère TOUS les champs envoyés par le frontend
    const { 
      firstName, middleName, lastName, username, email, 
      password, phone, region, studentNumber,
      dob, nationality, idNumber, country // <-- Ajoute ces champs ici
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
      firstName,
      middleName,
      lastName,
      username,
      email,
      phone,
      region,
      studentNumber,
      dob,           // <-- N'oublie pas de les ajouter au modèle
      nationality,   // <-- N'oublie pas de les ajouter au modèle
      idNumber,      // <-- N'oublie pas de les ajouter au modèle
      country,       // <-- N'oublie pas de les ajouter au modèle
      password: hashedPassword,
      role: "student",
      photoUrl: req.file ? "/uploads/" + req.file.filename : null
    });

    await user.save();
    console.log("✅ Utilisateur créé :", username);
    res.status(201).json({ message: "Compte créé avec succès" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Erreur serveur : " + err.message });
  }
});


// Login
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
        secure: true, // Requis pour HTTPS sur Render/Vercel
        sameSite: "None", // Requis pour les cookies cross-origin
        maxAge: 15 * 60 * 1000 
    });

    res.json({
      token: accessToken,
      user: { id: user._id, username: user.username, role: user.role, photoUrl: user.photoUrl }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
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

/* -------------------- SERVER & SOCKET.IO -------------------- */
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: allowedOrigins, 
        credentials: true 
    } 
});

app.set("socketio", io);

const onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("user_online", userId);
  });

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

// Gestion du déploiement Frontend (si servi par le même serveur)
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

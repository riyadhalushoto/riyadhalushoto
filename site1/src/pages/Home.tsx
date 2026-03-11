import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const navigate = useNavigate();
  // 🔹 CORRECTION : On récupère 'user' ici
  const { user } = useAuth();

  useEffect(() => {
    // Si l'utilisateur est connecté, on le redirige automatiquement
    if (user) {
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "teacher":
          navigate("/teacher-dashboard");
          break;
        case "parent":
          navigate("/parent-dashboard");
          break;
        case "student":
        case "user":
          navigate("/student-dashboard");
          break;
        default:
          // Optionnel : ne rien faire ou rester sur Home
          break;
      }
    }
  }, [user, navigate]); // Ajout de navigate dans les dépendances pour éviter les avertissements

  return (
    <div style={page}>
      <h1 style={title}>Madrasa Riyadha System</h1>
      <p style={subtitle}>Plateforme sécurisée</p>
      <div style={btnContainer}>
        <button onClick={() => navigate("/login")} style={btn}>
          🔐 Connexion
        </button>
      </div>
    </div>
  );
}

// ==== STYLES (Inchangés) ====
const page: any = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg,#02140f,#063d2d)",
  color: "white",
  textAlign: "center",
  padding: 20
};
const title: any = { fontSize: 40, marginBottom: 15, color: "#d4af37" };
const subtitle: any = { marginBottom: 40, fontSize: 18 };
const btnContainer: any = { display: "flex", gap: 20 };
const btn: any = {
  padding: "14px 30px",
  borderRadius: 12,
  border: "none",
  background: "#d4af37",
  color: "#02140f",
  fontWeight: "bold",
  fontSize: 16,
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

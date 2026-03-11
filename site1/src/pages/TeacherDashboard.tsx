import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../AuthContext"; // Import nécessaire

export default function TeacherDashboard() {
  const [tab, setTab] = useState("grades");
  const { user } = useAuth(); // On récupère user pour sécuriser l'affichage

  // Sécurité : si l'utilisateur n'est pas encore chargé
  if (!user) {
    return (
      <div style={{ background: "#02140f", minHeight: "100vh", color: "#d4af37", padding: 40 }}>
        Vérification des accès...
      </div>
    );
  }

  // Optionnel : redirection si l'utilisateur n'est pas un prof
  if (user.role !== "teacher" && user.role !== "admin") {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2 style={{ color: "red" }}>Accès Refusé</h2>
          <p>Vous n'avez pas les permissions pour accéder à cet espace.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={container}>
        <h1 style={{ color: "#d4af37" }}>👨‍🏫 Teacher Panel</h1>
        
        <p style={{ color: "#ccc", marginBottom: 20 }}>
          Bienvenue, <b>{user.email}</b>
        </p>

        <div style={{ display: "flex", gap: 15, marginBottom: 30 }}>
          <button style={btn(tab === "grades")} onClick={() => setTab("grades")}>
            📝 Notes
          </button>
          <button style={btn(tab === "attendance")} onClick={() => setTab("attendance")}>
            📅 Attendance
          </button>
        </div>
      </div>
    </Layout>
  );
}

// ====== STYLES ======
const container: any = { padding: 40, maxWidth: 1000, margin: "auto" };

const btn = (active: boolean): any => ({
  padding: "12px 20px",
  borderRadius: 14,
  border: "1px solid #d4af37",
  background: active ? "#d4af37" : "#02140f",
  color: active ? "#02140f" : "#d4af37",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "all 0.3s ease"
});

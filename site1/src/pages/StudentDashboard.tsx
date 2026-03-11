import Layout from "../components/Layout";
import PostFeed from "../components/PostFeed"; 
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // 1. Gestion du chargement initial
  if (loading) {
    return (
      <div style={loadingContainer}>
        <div className="spinner"></div>
        <p style={{ color: "#d4af37", marginTop: 15 }}>Vérification de la session...</p>
      </div>
    );
  }

  // 2. Redirection si non connecté
  if (!user) {
    navigate("/login");
    return null;
  }

  const userName = user.email ? user.email.split('@')[0] : "Étudiant";

  return (
    <Layout>
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {user.photoUrl ? (
            <img 
              src={`https://riyadhalushoto.onrender.com${user.photoUrl}`} 
              style={avatarStyle} 
              alt="Profil"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40"; }}
            />
          ) : (
            <div style={avatarPlaceholder}>👤</div>
          )}
          
          <h2 style={{ color: "#d4af37", margin: 0 }}>
            🎓 Bienvenue, <span style={{ textTransform: 'capitalize' }}>{userName}</span>
          </h2>
        </div>
        
        <button onClick={logout} style={logoutBtn}>
          Déconnexion
        </button>
      </div>

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <PostFeed />
      </div>
    </Layout>
  );
}

// ====== STYLES (Inchangés mais gardés pour la complétude) ======
const loadingContainer: any = {
  background: "#02140f",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center"
};

const headerStyle: any = {
  padding: "15px 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#02140f",
  borderBottom: "1px solid #d4af37",
  position: "sticky",
  top: 0,
  zIndex: 10
};

const avatarStyle: any = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  border: "2px solid #d4af37",
  objectFit: "cover"
};

const avatarPlaceholder: any = {
  width: 45, height: 45, borderRadius: "50%",
  background: "#063d2d", display: "flex",
  justifyContent: "center", alignItems: "center",
  fontSize: "20px", border: "1px solid #d4af37", color: "#d4af37"
};

const logoutBtn: any = {
  background: "#8b0000", color: "white",
  border: "none", padding: "10px 20px",
  borderRadius: 10, cursor: "pointer", fontWeight: "bold"
};

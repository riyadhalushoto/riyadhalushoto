import { useState, type ReactNode } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  // 🔹 CORRECTION : On extrait user et logout du contexte
  const { user, logout } = useAuth(); 

  // On vérifie si l'utilisateur est présent (pendant le chargement de la session)
  if (!user) {
    return (
      <div style={{ 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        background: "#02140f", 
        color: "#d4af37" 
      }}>
        Chargement de la session...
      </div>
    );
  }

  // Fonction pour aller au dashboard selon rôle
  const goToDashboard = () => {
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
        navigate("/");
    }
    setOpen(false); 
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={container}>
      {/* BOUTON POUR OUVRIR MENU */}
      {!open && (
        <button onClick={() => setOpen(true)} style={menuButton}>
          ☰ Menu
        </button>
      )}

      {/* SIDEBAR */}
      {open && (
        <div style={sidebar}>
          {/* BOUTON FERMER */}
          <button onClick={() => setOpen(false)} style={closeButton}>
            ✖
          </button>
          
          <h2 style={logo}>📚 Riyadha</h2>
          
          {/* DASHBOARD DYNAMIQUE SELON RÔLE */}
          <button onClick={goToDashboard} style={linkBtn}>
            🏠 Dashboard
          </button>

          <Link to="/messages" style={link} onClick={() => setOpen(false)}>
            💬 Messages
          </Link>
          <Link to="/notifications" style={link} onClick={() => setOpen(false)}>
            🔔 Notifications
          </Link>
          <Link to="/payments" style={link} onClick={() => setOpen(false)}>
            💳 Payments
          </Link>

          <button onClick={handleLogout} style={logoutBtn}>
            🔓 Déconnexion
          </button>
        </div>
      )}

      {/* CONTENU PAGE */}
      <div style={main}>
        {children}
      </div>
    </div>
  );
}

// ====== STYLES (Corrigés pour la lisibilité) ======
const container: any = {
  minHeight: "100vh",
  background: "#02140f",
  color: "white",
};

const menuButton: any = {
  position: "fixed",
  top: 20,
  left: 20,
  padding: "10px 15px",
  background: "#d4af37",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  zIndex: 100,
};

const sidebar: any = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 250, // Augmenté pour que le texte soit lisible
  height: "100%",
  background: "#01251b",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  zIndex: 1000,
  boxShadow: "2px 0 10px rgba(0,0,0,0.5)",
};

const closeButton: any = {
  alignSelf: "flex-end",
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
};

const logo: any = {
  color: "#d4af37",
  marginBottom: 20,
};

const link: any = {
  textDecoration: "none",
  color: "white",
  background: "#03362b",
  padding: "12px",
  borderRadius: 6,
  display: "block",
};

const linkBtn: any = {
  ...link,
  border: "none",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "16px",
};

const logoutBtn: any = {
  ...linkBtn,
  background: "#330000",
  color: "#ff4444",
  marginTop: "auto",
};

const main: any = {
  width: "100%",
  paddingTop: "60px", // Pour ne pas être caché par le bouton menu
};

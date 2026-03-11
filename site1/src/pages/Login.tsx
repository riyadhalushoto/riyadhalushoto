import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
const { login } = useAuth();
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError("");
setLoading(true);

try {  
  // 1. On attend la fin du processus de login (qui écrit dans localStorage)  
  const user = await login(email.trim(), password);  

  if (user) {  
    // 2. Petit délai de sécurité ou vérification du rôle  
    const userRole = user.role;  

    // Redirection basée sur le rôle  
    switch (userRole) {  
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
  }  
} catch (err: any) {  
  console.error("Détails erreur login:", err);  
  setError(err.message || "Email ou mot de passe incorrect");  
} finally {  
  setLoading(false);  
}

};

return (
<div style={containerStyle}>
<div style={cardStyle}>
<h2 style={{ color: "#d4af37", marginBottom: 20 }}>
🔐 Connexion
</h2>

<form onSubmit={handleSubmit}>  
      <div style={{ marginBottom: 15 }}>  
        <input  
          type="email"  
          placeholder="Email"  
          value={email}  
          onChange={(e) => setEmail(e.target.value)}  
          style={inputStyle}  
          required  
        />  
      </div>  

      <div style={{ marginBottom: 20 }}>  
        <input  
          type="password"  
          placeholder="Mot de passe"  
          value={password}  
          onChange={(e) => setPassword(e.target.value)}  
          style={inputStyle}  
          required  
        />  
      </div>  

      <button  
        type="submit"  
        disabled={loading}  
        style={loading ? { ...buttonStyle, opacity: 0.7, cursor: "not-allowed" } : buttonStyle}  
      >  
        {loading ? "Connexion en cours..." : "Se connecter"}  
      </button>  

      {error && (  
        <div style={{   
          marginTop: 15,   
          padding: 10,   
          borderRadius: 8,   
          backgroundColor: "rgba(255, 0, 0, 0.1)",   
          border: "1px solid red"   
        }}>  
          <p style={{ color: "#ff4444", margin: 0, fontSize: 14 }}>  
            {error}  
          </p>  
        </div>  
      )}  
    </form>  
      
    <p style={{ marginTop: 20, color: "#ccc", fontSize: 14 }}>  
      Pas encore de compte ? <span style={{ color: "#d4af37", cursor: "pointer" }} onClick={() => navigate("/register")}>S'inscrire</span>  
    </p>  
  </div>  
</div>

);
}

// ==== STYLES (Inchangés) ====
const containerStyle: React.CSSProperties = {
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "linear-gradient(135deg, #02140f, #063d2d)",
};

const cardStyle: React.CSSProperties = {
padding: 40,
textAlign: "center",
width: "100%",
maxWidth: 380,
border: "1px solid #d4af37",
borderRadius: 15,
backgroundColor: "#020617",
boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
};

const inputStyle: React.CSSProperties = {
width: "100%",
padding: "12px 15px",
borderRadius: 8,
border: "1px solid #d4af37",
backgroundColor: "#0f172a",
color: "white",
fontSize: 16,
outline: "none",
boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
width: "100%",
padding: "12px",
borderRadius: 8,
border: "none",
backgroundColor: "#d4af37",
color: "#02140f",
fontWeight: "bold",
fontSize: 16,
cursor: "pointer",
transition: "background-color 0.3s ease",
};

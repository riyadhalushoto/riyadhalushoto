import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://riyadhalushoto.onrender.com";

  useEffect(() => {
    if (user) {
      loadChildren();
    }
  }, [user]);

  async function loadChildren() {
    if (!user) return;
    try {
      setLoading(true);
      // On appelle ton API Node.js qui interroge MongoDB
      const res = await fetch(`${API_URL}/parent/children?email=${user.email}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setChildren(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des enfants:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div style={{ padding: 40 }}>
        <h2 style={{ color: "#d4af37" }}>👨‍👩‍👧 Parent Dashboard</h2>
        
        {loading && <p style={{ color: "#d4af37" }}>Chargement...</p>}
        
        {!loading && children.length === 0 && (
          <p style={{ marginTop: 20, color: "#d4af37" }}>
            Aucun enfant trouvé lié à votre compte.
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {children.map((c) => (
            <div key={c._id || c.id} style={card}>
              <h3 style={{ color: "#d4af37", marginBottom: 10 }}>
                {c.first_name} {c.last_name}
              </h3>
              <p>🎓 Matricule: {c.student_number || "N/A"}</p>
              <p>📅 Classe: {c.class || "Non assignée"}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

const card: any = {
  background: "linear-gradient(145deg,#063d2d,#02140f)",
  padding: 25,
  marginTop: 20,
  borderRadius: 20,
  border: "1px solid #d4af37",
  boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
};

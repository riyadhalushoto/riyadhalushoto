import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

export default function Notifications() {
  const [list, setList] = useState<any[]>([]);
  const { user } = useAuth();
  const API_URL = "http://localhost:5000";

  useEffect(() => {
    if (user && user.id) {
      loadNotifications();
    }
  }, [user]);

  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications/${user?.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    }
  }

  return (
    <div style={wrapper}>
      <h3 style={title}>🔔 Notifications</h3>
      {list.length === 0 && (
        <p style={{ color: "#ccc", textAlign: "center" }}>Aucune notification pour le moment.</p>
      )}
      {list.map((n) => (
        <div key={n._id || n.id} style={card}>
          <h4 style={{ color: "#d4af37", marginBottom: 5 }}>{n.title}</h4>
          <p style={{ margin: 0 }}>{n.message}</p>
          <small style={{ color: "#888", fontSize: "0.8rem" }}>
            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
          </small>
        </div>
      ))}
    </div>
  );
}

// Styles inchangés...
const wrapper: any = { marginBottom: 30, padding: 25, background: "linear-gradient(145deg,#063d2d,#02140f)", borderRadius: 25, border: "1px solid #d4af37", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" };
const title: any = { color: "#d4af37", marginBottom: 20 };
const card: any = { background: "rgba(255, 255, 255, 0.05)", padding: 20, borderRadius: 20, marginTop: 15, border: "1px solid rgba(212, 175, 55, 0.3)", transition: "0.4s" };

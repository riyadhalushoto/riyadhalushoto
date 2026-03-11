import AdminNotifications from "../components/AdminNotifications";
import Layout from "../components/Layout";
import StudentsList from "../components/StudentsList";
import PostFeed from "../components/PostFeed";
import Register from "../pages/Register";
import CheckStudent from "../pages/CheckStudent";
import StudentCardBank from "../components/StudentCardBank";
import { useState } from "react";
export default function AdminDashboard() {
  const [tab, setTab] = useState("all");
  return (
    <Layout>
      <div style={pageContainer}>
        <h1 style={titleStyle}>
          🛠 ADMINISTRATEUR
        </h1>
        <div style={tabContainer}>
          <button onClick={() => setTab("all")} style={btnStyle(tab === "all")}>
            🎓 Étudiants
          </button>
          <button onClick={() => setTab("posts")} style={btnStyle(tab === "posts")}>
            📢 Publications
          </button>
          <button onClick={() => setTab("register")} style={btnStyle(tab === "register")}>
            📝 Inscription
          </button>
          {/* ===== Nouveaux boutons ===== */}
          <button onClick={() => setTab("check")} style={btnStyle(tab === "check")}>
            🔎 Vérifier Étudiant
          </button>
          <button onClick={() => setTab("card")} style={btnStyle(tab === "card")}>
            💳 Carte Étudiant
          </button>
          <button onClick={() => setTab("notifications")} style={btnStyle(tab==="notifications")}>
  🔔 Notifications
</button>
{tab==="notifications" && <AdminNotifications />}
        </div>
        <div style={contentCard}>
          {tab === "all" && <StudentsList />}
          {tab === "posts" && <PostFeed />}
          {tab === "register" && <Register />}
          {tab === "check" && <CheckStudent />}
          {tab === "card" && <StudentCardBank />}
        </div>
      </div>
    </Layout>
  );
}
const pageContainer: any = {
  width: "100%",
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  padding: 20,
  boxSizing: "border-box"
};
const titleStyle: any = {
  color: "#d4af37",
  marginBottom: 25,
  letterSpacing: 2
};
const tabContainer: any = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20
};
const contentCard: any = {
  flex: 1,
  width: "100%",
  display: "flex",
  flexDirection: "column"
};
const btnStyle = (active: boolean) => ({
  padding: "12px 22px",
  borderRadius: 14,
  border: "1px solid #d4af37",
  background: active ? "#d4af37" : "#02140f",
  color: active ? "#02140f" : "#d4af37",
  fontWeight: "bold",
  cursor: "pointer"
});
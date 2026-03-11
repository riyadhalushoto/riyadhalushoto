import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

interface UserType {
  _id: string; // Ce que l'API MongoDB renvoie
  username: string;
  email: string;
  photoUrl?: string;
}

interface Props {
  onSelect: (user: UserType) => void;
}

export default function UserSearch({ onSelect }: Props) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!query.trim() || !token) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/users`, {
          params: { username: query },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        
        // 🔹 CORRECTION : On utilise user.id (venant de AuthContext) 
        // pour comparer avec u._id (venant de l'API)
        const currentUserId = user?.id; 
        const filtered = res.data.filter((u: UserType) => u._id !== currentUserId);
        
        setResults(filtered);
      } catch (err) {
        console.error("Recherche utilisateur :", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, token, user]);

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un utilisateur..."
        style={{ padding: 12, borderRadius: 8, width: "100%", border: "1px solid #d4af37", background: "#03362b", color: "white" }}
      />
      
      {loading && <p style={{ color: "#d4af37", marginTop: 10 }}>Recherche en cours...</p>}
      
      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 10, background: "#01251b", borderRadius: 8 }}>
          {results.map((u) => (
            <li
              key={u._id}
              onClick={() => {
                onSelect(u);
                setQuery("");
                setResults([]);
              }}
              style={itemStyle}
            >
              {u.photoUrl ? (
                <img src={`http://localhost:5000${u.photoUrl}`} alt={u.username} style={avatarStyle} />
              ) : (
                <div style={placeholderStyle}>👤</div>
              )}
              <span style={{ color: "white" }}>{u.username}</span>
            </li>
          ))}
        </ul>
      )}
      
      {!loading && query.length > 1 && results.length === 0 && (
        <p style={{ marginTop: 10, color: "#d4af37" }}>Aucun utilisateur trouvé</p>
      )}
    </div>
  );
}

// Styles rapides pour la lisibilité
const itemStyle: any = { cursor: "pointer", padding: 12, borderBottom: "1px solid #03362b", display: "flex", alignItems: "center", gap: 10 };
const avatarStyle = { width: 35, height: 35, borderRadius: "50%", objectFit: "cover" as const };
const placeholderStyle = { width: 35, height: 35, borderRadius: "50%", background: "#d4af37", display: "flex", justifyContent: "center", alignItems: "center" };

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../AuthContext";

const API_URL = "https://riyadhalushoto.onrender.com";

// Configuration pour une connexion stable sur mobile
const socket = io(API_URL, { 
  transports: ["polling", "websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity
});

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<any>(null);
  
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // Synchronise la conversation sélectionnée avec la liste globale des conversations
  useEffect(() => {
    if (selectedConv) {
      const updated = conversations.find(c => c.user._id === selectedConv.user._id);
      if (updated) setSelectedConv(updated);
    }
  }, [conversations]);

  useEffect(() => {
    if (token) refreshConversations();
  }, [token]);

  useEffect(() => {
    scrollBottom();
  }, [selectedConv]);

  // TEMPS RÉEL : Réception automatique
  useEffect(() => {
    if (!user) return;
    socket.emit("join", user.id);

    socket.on("receive_message", (msg: any) => {
      setConversations(prev => {
        const senderId = msg.sender._id === user.id ? msg.receiver : msg.sender._id;
        const updated = [...prev];
        const convIndex = updated.findIndex(c => c.user._id === senderId);

        const newMessage = {
          id: msg._id,
          text: msg.text,
          fileUrl: msg.fileUrl,
          sender: msg.sender._id === user.id ? "me" : "other",
          createdAt: msg.createdAt
        };

        if (convIndex !== -1) {
          if (updated[convIndex].messages.some((m: any) => m.id === msg._id)) return prev;
          updated[convIndex] = { 
            ...updated[convIndex], 
            messages: [...updated[convIndex].messages, newMessage] 
          };
          const [item] = updated.splice(convIndex, 1);
          return [item, ...updated];
        }
        return [{ user: msg.sender, messages: [newMessage] }, ...prev];
      });
    });

    return () => { socket.off("receive_message"); };
  }, [user]);

  const refreshConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!selectedConv || (!text.trim() && !file)) return;
    const receiverId = selectedConv.user._id;

    // --- AJOUT OPTIMISTE ---
    const tempId = "temp-" + Date.now();
    const tempMsg = {
      id: tempId,
      text: text,
      fileUrl: file ? URL.createObjectURL(file) : null,
      sender: "me",
      createdAt: new Date().toISOString()
    };

    setConversations(prev => prev.map(c => 
      c.user._id === receiverId ? { ...c, messages: [...c.messages, tempMsg] } : c
    ));
    
    const savedText = text;
    const savedFile = file;
    setText(""); setFile(null); scrollBottom();

    try {
      let res;
      if (savedFile) {
        const form = new FormData();
        form.append("file", savedFile);
        form.append("receiver", receiverId);
        if (savedText) form.append("text", savedText);
        res = await axios.post(`${API_URL}/messages/file`, form, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
      } else {
        res = await axios.post(`${API_URL}/messages`, { 
            receiver: receiverId, 
            text: savedText 
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      setConversations(prev => prev.map(c => {
        if (c.user._id === receiverId) {
          return { ...c, messages: c.messages.map((m: any) => 
            m.id === tempId ? { ...res.data, id: res.data._id, sender: "me" } : m) 
          };
        }
        return c;
      }));

      socket.emit("send_message", { receiver: receiverId, messageId: res.data._id });
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#02140f" }}>
      {/* Colonne Gauche */}
      <div style={{ width: "350px", borderRight: "1px solid #0a3d2c", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", color: "#d4af37" }}>
          <h3 style={{ margin: 0 }}>Messages</h3>
          <button onClick={() => setShowSearch(!showSearch)} style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", marginTop: "10px" }}>
            {showSearch ? "✕ Fermer" : "🔍 Rechercher"}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map(conv => (
            <div key={conv.user._id} onClick={() => setSelectedConv(conv)} style={{ padding: "15px", cursor: "pointer", background: selectedConv?.user._id === conv.user._id ? "#0a3d2c" : "transparent", borderBottom: "1px solid #0a3d2c" }}>
              <div style={{ color: "#d4af37", fontWeight: "bold" }}>{conv.user.username}</div>
              <div style={{ color: "#aaa", fontSize: "0.8em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {conv.messages[conv.messages.length - 1]?.text || "Fichier envoyé"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Colonne Droite (Chat) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#010c09" }}>
        {selectedConv ? (
          <>
            <div style={{ padding: "15px", color: "#d4af37", background: "#02140f", borderBottom: "1px solid #0a3d2c", fontWeight: "bold" }}>
              {selectedConv.user.username}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {selectedConv.messages.map((m: any) => (
                <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "me" ? "flex-end" : "flex-start", marginBottom: "15px" }}>
                  <div style={{ padding: "10px 15px", borderRadius: "15px", background: m.sender === "me" ? "#d4af37" : "#0a3d2c", color: m.sender === "me" ? "#02140f" : "#fff", maxWidth: "70%" }}>
                    {m.fileUrl && (
                      <img src={m.fileUrl.startsWith('blob') ? m.fileUrl : API_URL + m.fileUrl} style={{ width: "100%", borderRadius: "10px", marginBottom: "5px" }} alt="Pièce jointe" />
                    )}
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>
            <div style={{ padding: "15px", display: "flex", gap: "10px", background: "#02140f" }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", fontSize: "20px", color: "#d4af37", cursor: "pointer" }}>📎</button>
              <input type="file" ref={fileInputRef} onChange={(e: any) => setFile(e.target.files[0])} style={{ display: "none" }} />
              <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} style={{ flex: 1, padding: "12px", borderRadius: "20px", background: "#010c09", color: "#fff", border: "1px solid #0a3d2c", outline: "none" }} placeholder="Votre message..." />
              <button onClick={handleSend} style={{ background: "#d4af37", border: "none", padding: "10px 20px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>➤</button>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", color: "#d4af37", textAlign: "center" }}>
            <div style={{ fontSize: "3rem" }}>💬</div>
            <p>Sélectionnez une discussion pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}

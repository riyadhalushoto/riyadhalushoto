import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../AuthContext";

// CONFIGURATION UNIFIÉE
const API_URL = "https://riyadhalushoto.onrender.com";

// Initialisation du socket avec les bons paramètres de transport pour éviter les déconnexions sur mobile
const socket = io(API_URL, { 
  transports: ["polling", "websocket"],
  withCredentials: true 
});

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: any } | null>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  /* FETCH CONVERSATIONS INITIALES */
  useEffect(() => {
    if (!token) return;
    refreshConversations();
  }, [token]);

  useEffect(() => {
    scrollBottom();
  }, [selectedConv]);

  useEffect(() => {
    if (!selectedConv) return;
    const updated = conversations.find(c => c.user._id === selectedConv.user._id);
    if (updated) setSelectedConv(updated);
  }, [conversations]);

  /* SOCKET TEMPS RÉEL CORRECTIF */
  useEffect(() => {
    if (!user) return;

    socket.emit("join", user.id);

    // ÉCOUTEUR UNIQUE POUR LA RÉCEPTION
    socket.on("receive_message", (msg: any) => {
      const newMessage = {
        id: msg._id,
        text: msg.text,
        fileUrl: msg.fileUrl,
        sender: msg.sender._id === user.id ? "me" : "other",
        createdAt: msg.createdAt
      };

      setConversations(prev => {
        const senderId = msg.sender._id === user.id ? msg.receiver : msg.sender._id;
        const convIndex = prev.findIndex(c => c.user._id === senderId);
        
        if (convIndex !== -1) {
          const updated = [...prev];
          const exists = updated[convIndex].messages.some((m: any) => m.id === msg._id);
          if (exists) return prev;

          updated[convIndex] = {
            ...updated[convIndex],
            messages: [...updated[convIndex].messages, newMessage]
          };
          const item = updated.splice(convIndex, 1)[0];
          return [item, ...updated];
        }
        
        const otherUser = msg.sender._id === user.id ? { _id: msg.receiver, username: "Destinataire" } : msg.sender;
        return [{ user: otherUser, messages: [newMessage] }, ...prev];
      });

      scrollBottom();
    });

    return () => {
      socket.off("receive_message");
    };
  }, [user]);

  const refreshConversations = () => {
    axios.get(`${API_URL}/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setConversations(res.data));
  };

  /* GESTION CLIC LONG */
  const handleStartPress = (e: any, msg: any) => {
    const coords = e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
    longPressTimer.current = setTimeout(() => {
      setContextMenu({ x: coords.x, y: coords.y, msg });
    }, 600);
  };

  const handleEndPress = () => clearTimeout(longPressTimer.current);

  const handleCopy = (txt: string) => {
    if (txt) navigator.clipboard.writeText(txt);
    setContextMenu(null);
  };

  const handleShare = async (msg: any) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Message", text: msg.text, url: msg.fileUrl ? API_URL + msg.fileUrl : undefined });
      } catch {}
    }
    setContextMenu(null);
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await axios.delete(`${API_URL}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(prev =>
        prev.map(conv => ({
          ...conv,
          messages: conv.messages.filter((m: any) => m.id !== id)
        }))
      );
    } catch (err) { console.error(err); }
    setContextMenu(null);
  };

  /* ENVOI MESSAGE */
  const handleSend = async () => {
    if (!selectedConv || (!text.trim() && !file)) return;
    try {
      if (editingMessageId) {
        await axios.put(
          `${API_URL}/messages/${editingMessageId}`,
          { text },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversations(prev =>
          prev.map(conv => ({
            ...conv,
            messages: conv.messages.map((m: any) =>
              m.id === editingMessageId ? { ...m, text } : m
            )
          }))
        );
        setEditingMessageId(null);
      } else {
        const receiver = selectedConv.user._id;
        let res;
        if (file) {
          const form = new FormData();
          form.append("file", file);
          form.append("receiver", receiver);
          if (text) form.append("text", text);
          res = await axios.post(`${API_URL}/messages/file`, form, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          res = await axios.post(
            `${API_URL}/messages`,
            { receiver, text },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        const newMessage = {
          id: res.data._id,
          text: res.data.text,
          fileUrl: res.data.fileUrl,
          sender: "me",
          createdAt: res.data.createdAt
        };

        setConversations(prev => {
            return prev.map(conv =>
              conv.user._id === receiver
                ? { ...conv, messages: [...conv.messages, newMessage] }
                : conv
            );
        });

        socket.emit("send_message", { receiver, messageId: res.data._id });
      }

      setText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      scrollBottom();
    } catch (err) {
      console.log(err);
    }
  };

  const searchUsers = async (value: string) => {
    setSearch(value);
    if (!value) return setSearchResults([]);
    try {
      const res = await axios.get(`${API_URL}/users/search?q=${value}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const openConversation = (u: any) => {
    const existing = conversations.find(c => c.user._id === u._id);
    if (existing) setSelectedConv(existing);
    else {
      const newConv = { user: u, messages: [] };
      setConversations([newConv, ...conversations]);
      setSelectedConv(newConv);
    }
    setShowSearch(false);
    setSearch("");
    setSearchResults([]);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#02140f", fontFamily: "sans-serif" }} onClick={() => setContextMenu(null)}>
      {/* LISTE GAUCHE */}
      <div style={{ width: "350px", borderRight: "1px solid #0a3d2c", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #0a3d2c" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ color: "#d4af37", margin: 0 }}>Messages</h3>
            <button onClick={() => setShowSearch(!showSearch)} style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer", fontSize: "20px" }}>
              {showSearch ? "✕" : "🔍"}
            </button>
          </div>
          {showSearch && (
            <div style={{ marginTop: "10px" }}>
              <input value={search} onChange={e => searchUsers(e.target.value)} placeholder="Rechercher utilisateur..." style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #0a3d2c", background: "#010c09", color: "#fff" }} />
              <div style={{ maxHeight: "200px", overflowY: "auto", marginTop: "10px" }}>
                {searchResults.map(u => (
                  <div key={u._id} onClick={() => openConversation(u)} style={{ padding: "10px", cursor: "pointer", color: "#d4af37", borderBottom: "1px solid #0a3d2c" }}>{u.username}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <div key={conv.user._id} onClick={() => setSelectedConv(conv)} style={{ padding: "15px", cursor: "pointer", borderBottom: "1px solid #0a3d2c", transition: "0.2s", background: selectedConv?.user._id === conv.user._id ? "#0a3d2c" : "transparent" }}>
                <div style={{ fontWeight: "bold", color: "#d4af37" }}>{conv.user.username}</div>
                {lastMsg && (
                  <div style={{ fontSize: "12px", color: "#8a9a95", marginTop: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lastMsg.sender === "me" ? "Vous : " : ""}{lastMsg.text || "📷 Fichier"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT DROITE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#010c09" }}>
        {selectedConv ? (
          <>
            <div style={{ padding: "15px 20px", borderBottom: "1px solid #0a3d2c", color: "#d4af37", fontWeight: "bold", background: "#02140f" }}>{selectedConv.user.username}</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {selectedConv.messages.map((m: any) => (
                <div key={m.id} onMouseDown={(e) => handleStartPress(e, m)} onMouseUp={handleEndPress} onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, msg: m }); }} style={{ display: "flex", justifyContent: m.sender === "me" ? "flex-end" : "flex-start", marginBottom: "15px" }}>
                  <div style={{ padding: "12px 16px", borderRadius: "18px", background: m.sender === "me" ? "#d4af37" : "#0a3d2c", color: m.sender === "me" ? "#02140f" : "#fff", maxWidth: "70%", boxShadow: "0 2px 5px rgba(0,0,0,0.2)", position: "relative" }}>
                    {m.fileUrl && (
                        <div style={{ marginBottom: "5px" }}>
                            {m.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img src={API_URL + m.fileUrl} style={{ maxWidth: "100%", borderRadius: "10px", display: "block" }} alt="upload" />
                            ) : (
                                <a href={API_URL + m.fileUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline", fontSize: "12px" }}>Voir le fichier</a>
                            )}
                        </div>
                    )}
                    <div style={{ wordBreak: "break-word" }}>{m.text}</div>
                    <div style={{ fontSize: "9px", opacity: 0.6, marginTop: "4px", textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>
            <div style={{ padding: "15px", borderTop: "1px solid #0a3d2c", background: "#02140f" }}>
              {file && (
                <div style={{ background: "#0a3d2c", color: "#d4af37", padding: "8px", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <span style={{ fontSize: "12px" }}>📎 {file.name}</span>
                   <button onClick={() => setFile(null)} style={{ background: "none", border: "none", color: "red", cursor: "pointer" }}>✕</button>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#d4af37" }}>📎</button>
                <input type="file" ref={fileInputRef} onChange={(e: any) => setFile(e.target.files[0])} style={{ display: "none" }} />
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder={editingMessageId ? "Modifier..." : "Écrire..."} style={{ flex: 1, padding: "12px", borderRadius: "25px", border: "1px solid #0a3d2c", background: "#010c09", color: "#fff", outline: "none" }} />
                <button onClick={handleSend} style={{ width: "45px", height: "45px", borderRadius: "50%", border: "none", background: "#d4af37", color: "#02140f", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>{editingMessageId ? "✓" : "➤"}</button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", color: "#d4af37", textAlign: "center" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>💬</div>
            <p>Sélectionnez une discussion pour commencer</p>
          </div>
        )}
      </div>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div style={{ position: "fixed", top: Math.min(contextMenu.y, window.innerHeight - 150), left: Math.min(contextMenu.x, window.innerWidth - 150), background: "#1a1a1a", border: "1px solid #d4af37", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.5)", zIndex: 1000, minWidth: "140px" }}>
          <div style={menuItemStyle} onClick={() => handleCopy(contextMenu.msg.text)}>Copier</div>
          <div style={menuItemStyle} onClick={() => handleShare(contextMenu.msg)}>Partager</div>
          {contextMenu.msg.sender === "me" && (
            <>
              <div style={menuItemStyle} onClick={() => { setEditingMessageId(contextMenu.msg.id); setText(contextMenu.msg.text); setContextMenu(null); }}>Modifier</div>
              <div style={{ ...menuItemStyle, color: "#ff4d4d", borderBottom: "none" }} onClick={() => deleteMessage(contextMenu.msg.id)}>Supprimer</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = { padding: "12px 15px", color: "#fff", cursor: "pointer", fontSize: "14px", borderBottom: "1px solid #333" };

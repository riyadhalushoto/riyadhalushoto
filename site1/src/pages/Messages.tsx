import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
[span_1](start_span)import { useAuth } from "../AuthContext";[span_1](end_span)

const API_URL = "https://riyadhalushoto.onrender.com";

// Configuration pour une connexion stable sur mobile
const socket = io(API_URL, { 
  transports: ["polling", "websocket"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity
[span_2](start_span)});[span_2](end_span)

export default function Messages() {
  [span_3](start_span)const { user } = useAuth();[span_3](end_span)
  [span_4](start_span)const [conversations, setConversations] = useState<any[]>([]);[span_4](end_span)
  [span_5](start_span)const [selectedConv, setSelectedConv] = useState<any>(null);[span_5](end_span)
  [span_6](start_span)const [text, setText] = useState("");[span_6](end_span)
  [span_7](start_span)const [file, setFile] = useState<any>(null);[span_7](end_span)
  [span_8](start_span)const [editingMessageId, setEditingMessageId] = useState<string | null>(null);[span_8](end_span)
  [span_9](start_span)const [contextMenu, setContextMenu] = useState<any>(null);[span_9](end_span)

  [span_10](start_span)const [search, setSearch] = useState("");[span_10](end_span)
  [span_11](start_span)const [searchResults, setSearchResults] = useState<any[]>([]);[span_11](end_span)
  [span_12](start_span)const [showSearch, setShowSearch] = useState(false);[span_12](end_span)

  [span_13](start_span)const bottomRef = useRef<HTMLDivElement>(null);[span_13](end_span)
  [span_14](start_span)const fileInputRef = useRef<HTMLInputElement>(null);[span_14](end_span)
  [span_15](start_span)const token = localStorage.getItem("token");[span_15](end_span)

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  [span_16](start_span)};[span_16](end_span)

  useEffect(() => {
    if (token) refreshConversations();
  [span_17](start_span)}, [token]);[span_17](end_span)

  useEffect(() => {
    scrollBottom();
  [span_18](start_span)}, [selectedConv, conversations]);[span_18](end_span)

  // TEMPS RÉEL : Réception automatique
  useEffect(() => {
    if (!user) return;
    [span_19](start_span)socket.emit("join", user.id);[span_19](end_span)

    socket.on("receive_message", (msg: any) => {
      setConversations(prev => {
        [span_20](start_span)const senderId = msg.sender._id === user.id ? msg.receiver : msg.sender._id;[span_20](end_span)
        const updated = [...prev];
        [span_21](start_span)const convIndex = updated.findIndex(c => c.user._id === senderId);[span_21](end_span)

        const newMessage = {
          id: msg._id,
          text: msg.text,
          fileUrl: msg.fileUrl,
          sender: msg.sender._id === user.id ? "me" : "other",
          createdAt: msg.createdAt
        [span_22](start_span)};[span_22](end_span)

        if (convIndex !== -1) {
          [span_23](start_span)if (updated[convIndex].messages.some((m: any) => m.id === msg._id)) return prev;[span_23](end_span)
          [span_24](start_span)updated[convIndex] = { ...updated[convIndex], messages: [...updated[convIndex].messages, newMessage] };[span_24](end_span)
          [span_25](start_span)const [item] = updated.splice(convIndex, 1);[span_25](end_span)
          [span_26](start_span)return [item, ...updated];[span_26](end_span)
        }
        [span_27](start_span)return [{ user: msg.sender, messages: [newMessage] }, ...prev];[span_27](end_span)
      });
    });

    return () => { socket.off("receive_message"); };
  [span_28](start_span)}, [user]);[span_28](end_span)

  const refreshConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      [span_29](start_span)setConversations(res.data);[span_29](end_span)
    } catch (e) { console.error(e); }
  [span_30](start_span)};[span_30](end_span)

  const handleSend = async () => {
    [span_31](start_span)if (!selectedConv || (!text.trim() && !file)) return;[span_31](end_span)
    [span_32](start_span)const receiverId = selectedConv.user._id;[span_32](end_span)

    // --- AJOUT OPTIMISTE (INSTANTANÉ) ---
    const tempId = "temp-" + Date.now();
    const tempMsg = {
      id: tempId,
      text: text,
      fileUrl: file ? URL.createObjectURL(file) : null,
      sender: "me",
      createdAt: new Date().toISOString()
    [span_33](start_span)};[span_33](end_span)

    setConversations(prev => prev.map(c => 
      c.user._id === receiverId ? { ...c, messages: [...c.messages, tempMsg] } : c
    [span_34](start_span)));[span_34](end_span)
    
    const savedText = text;
    const savedFile = file;
    [span_35](start_span)setText(""); setFile(null); scrollBottom();[span_35](end_span)

    try {
      let res;
      if (savedFile) {
        const form = new FormData();
        [span_36](start_span)form.append("file", savedFile);[span_36](end_span)
        [span_37](start_span)form.append("receiver", receiverId);[span_37](end_span)
        [span_38](start_span)if (savedText) form.append("text", savedText);[span_38](end_span)
        [span_39](start_span)res = await axios.post(`${API_URL}/messages/file`, form, { headers: { Authorization: `Bearer ${token}` } });[span_39](end_span)
      } else {
        [span_40](start_span)res = await axios.post(`${API_URL}/messages`, { receiver: receiverId, text: savedText }, { headers: { Authorization: `Bearer ${token}` } });[span_40](end_span)
      }

      // Remplacement du message temporaire par le vrai message du serveur
      setConversations(prev => prev.map(c => {
        if (c.user._id === receiverId) {
          return { ...c, messages: c.messages.map((m: any) => m.id === tempId ? { ...res.data, id: res.data._id, sender: "me" } : m) };
        }
        return c;
      [span_41](start_span)}));[span_41](end_span)

      [span_42](start_span)socket.emit("send_message", { receiver: receiverId, messageId: res.data._id });[span_42](end_span)
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#02140f" }}>
      {/* Colonne Gauche */}
      <div style={{ width: "350px", borderRight: "1px solid #0a3d2c", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", color: "#d4af37" }}>
          <h3>Messages</h3>
          <button onClick={() => setShowSearch(!showSearch)} style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer" }}>
            {showSearch ? "✕" : "🔍 Rechercher"}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.map(conv => (
            <div key={conv.user._id} onClick={() => setSelectedConv(conv)} style={{ padding: "15px", cursor: "pointer", background: selectedConv?.user._id === conv.user._id ? "#0a3d2c" : "transparent", borderBottom: "1px solid #0a3d2c" }}>
              <div style={{ color: "#d4af37", fontWeight: "bold" }}>{conv.user.username}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Colonne Droite (Chat) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#010c09" }}>
        {selectedConv ? (
          <>
            <div style={{ padding: "15px", color: "#d4af37", background: "#02140f", borderBottom: "1px solid #0a3d2c" }}>{selectedConv.user.username}</div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {selectedConv.messages.map((m: any) => (
                <div key={m.id} style={{ display: "flex", justifyContent: m.sender === "me" ? "flex-end" : "flex-start", marginBottom: "15px" }}>
                  <div style={{ padding: "10px 15px", borderRadius: "15px", background: m.sender === "me" ? "#d4af37" : "#0a3d2c", color: m.sender === "me" ? "#02140f" : "#fff", maxWidth: "70%" }}>
                    {m.fileUrl && (
                      <img src={m.fileUrl.startsWith('blob') ? m.fileUrl : API_URL + m.fileUrl} style={{ width: "100%", borderRadius: "10px", marginBottom: "5px" }} />
                    )}
                    <div>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>
            <div style={{ padding: "15px", display: "flex", gap: "10px", background: "#02140f" }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: "none", border: "none", fontSize: "20px", color: "#d4af37" }}>📎</button>
              <input type="file" ref={fileInputRef} onChange={(e: any) => setFile(e.target.files[0])} style={{ display: "none" }} />
              <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} style={{ flex: 1, padding: "10px", borderRadius: "20px", background: "#010c09", color: "#fff", border: "1px solid #0a3d2c" }} placeholder="Message..." />
              <button onClick={handleSend} style={{ background: "#d4af37", border: "none", padding: "10px 20px", borderRadius: "20px", cursor: "pointer" }}>➤</button>
            </div>
          </>
        ) : <div style={{ margin: "auto", color: "#d4af37" }}>Sélectionnez une discussion</div>}
      </div>
    </div>
  );
}

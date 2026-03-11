import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initialisation du socket
    const newSocket = io("https://riyadhalushoto.onrender.com", { withCredentials: true });
    setSocket(newSocket);

    // Chargement initial
    axios
      .get("http://localhost:5000/notifications", { withCredentials: true })
      .then(res => setNotifications(res.data));

    // Écoute des notifications
    newSocket.on("receive_notification", (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    // 🔹 CORRECTION : On retourne une fonction anonyme pour le nettoyage
    return () => {
      newSocket.off("receive_notification");
      newSocket.disconnect();
    };
  }, []);

  const sendNotification = () => {
    if (socket) {
      socket.emit("send_notification", {
        title,
        message,
        target: "all"
      });
      setTitle("");
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h3 style={{ color: "#d4af37" }}>Envoyer une notification</h3>
      <input
        style={inputStyle}
        placeholder="Titre"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        style={inputStyle}
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button style={btnStyle} onClick={sendNotification}>Envoyer</button>

      <h4 style={{ color: "#d4af37", marginTop: 20 }}>Notifications existantes</h4>
      <ul style={{ color: "white" }}>
        {notifications.map((n, i) => (
          <li key={i}>{n.title} - {n.message}</li>
        ))}
      </ul>
    </div>
  );
}

const inputStyle = { display: "block", width: "100%", marginBottom: 10, padding: 8, borderRadius: 5 };
const btnStyle = { background: "#d4af37", padding: "10px 20px", border: "none", borderRadius: 5, cursor: "pointer" };

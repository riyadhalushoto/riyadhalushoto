import { useState } from "react";

export default function Payments() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  // 🔹 CORRECTION : Ajout de l'état loading
  const [loading, setLoading] = useState(false);

  const handlePaystack = async () => {
    const email = localStorage.getItem("email");
    if (!amount || !email) {
      setMessage("Montant ou email manquant");
      return;
    }

    setLoading(true);
    setMessage(""); // Reset message
    try {
      const res = await fetch("http://localhost:5000/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ amount, email }) // On envoie aussi l'email au backend
      });
      
      const data = await res.json();
      
      if (data.status && data.data?.authorization_url) {
        setMessage("Redirection vers Paystack...");
        // Redirection automatique
        window.location.href = data.data.authorization_url;
      } else {
        setMessage("Erreur Paystack: " + (data.message || "Impossible d'initialiser le paiement"));
      }
    } catch (err) {
      console.error(err);
      setMessage("Erreur serveur : impossible de contacter Paystack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>💰 Paiement Paystack</h2>
        <p style={subtitle}>Entrez le montant à payer (en NGN/CFA selon config)</p>
        <input
          style={input}
          placeholder="Montant"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <button 
          style={{...button, opacity: loading ? 0.7 : 1}} 
          onClick={handlePaystack} 
          disabled={loading}
        >
          {loading ? "Traitement..." : "Payer avec Paystack"}
        </button>
        {message && <p style={messageStyle}>{message}</p>}
      </div>
    </div>
  );
}

// Styles inchangés (mais inclus pour la complétude)
const container: any = {
  minHeight: "100vh",
  background: "#02140f",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 20
};
const card: any = {
  background: "#01251b",
  padding: 40,
  borderRadius: 15,
  width: "100%",
  maxWidth: 360,
  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
  textAlign: "center",
  border: "1px solid #03362b"
};
const title: any = { color: "#d4af37", marginBottom: 10 };
const subtitle: any = { color: "#ccc", fontSize: 14, marginBottom: 25 };
const input: any = {
  width: "100%",
  padding: 12,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #d4af37",
  background: "#03362b",
  color: "white",
  fontSize: 15,
  outline: "none"
};
const button: any = {
  width: "100%",
  padding: 12,
  background: "#d4af37",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: "bold",
  color: "#02140f",
  fontSize: 16
};
const messageStyle: any = { marginTop: 15, color: "#ffcc00", fontSize: 13 };

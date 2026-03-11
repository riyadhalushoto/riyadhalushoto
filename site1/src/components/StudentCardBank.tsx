import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function StudentCardBank() {
  const [number, setNumber] = useState("");
  const [student, setStudent] = useState<any>(null);
  const [flip, setFlip] = useState(false);
  const [error, setError] = useState("");
  // 🔹 CORRECTION : Ajout de l'état loading qui manquait
  const [loading, setLoading] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const API_URL = "https://riyadhalushoto.onrender.com";
  const token = localStorage.getItem("token");

  async function search() {
    if (!number) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/users/student/${number}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStudent(data);
      } else {
        setError(data.message || "Étudiant non trouvé");
        setStudent(null);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur serveur");
      setStudent(null);
    } finally {
      setLoading(false);
    }
  }

  const verifyURL = `${window.location.origin}/verify?student=${student?.studentNumber || ""}`;
  
  const photoFullUrl = student?.photoUrl 
    ? `${API_URL}${student.photoUrl}?t=${new Date().getTime()}` 
    : "https://via.placeholder.com/150";

  async function downloadPNG() {
    if (!frontRef.current || !backRef.current) return;
    const frontCanvas = await html2canvas(frontRef.current, { scale: 4, useCORS: true });
    const backCanvas = await html2canvas(backRef.current, { scale: 4, useCORS: true });
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = frontCanvas.width;
    finalCanvas.height = frontCanvas.height * 2;
    const ctx = finalCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(frontCanvas, 0, 0);
    ctx.drawImage(backCanvas, 0, frontCanvas.height);
    const link = document.createElement("a");
    link.download = `carte_${student?.lastName || "student"}.png`;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
  }

  async function downloadPDF() {
    if (!frontRef.current || !backRef.current) return;
    const frontCanvas = await html2canvas(frontRef.current, { scale: 4, useCORS: true });
    const backCanvas = await html2canvas(backRef.current, { scale: 4, useCORS: true });
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [340, 240] });
    pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 0, 0, 340, 240);
    pdf.addPage();
    pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 0, 0, 340, 240);
    pdf.save(`carte_${student?.lastName || "student"}.pdf`);
  }

  if (!student) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#d4af37" }}>
        <h2>🔎 Recherche Étudiant</h2>
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="Numéro étudiant"
            style={{ padding: 12, width: 250, borderRadius: 8, border: "1px solid #d4af37", background: "#02140f", color: "white" }}
            onChange={(e) => setNumber(e.target.value)}
          />
          <button
            onClick={search}
            disabled={loading}
            style={{ marginLeft: 10, padding: "12px 20px", borderRadius: 8, background: "#d4af37", color: "#02140f", fontWeight: "bold", cursor: "pointer" }}
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>
        {error && <p style={{ color: "#ff4444", marginTop: 15 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40 }}>
      <p style={{color: "#d4af37", marginBottom: 15, fontSize: 14}}>Cliquez sur la carte pour la retourner</p>
      
      <div onClick={() => setFlip(!flip)} style={{ perspective: "1000px", cursor: "pointer" }}>
        <div style={{ width: 340, height: 240, position: "relative", transformStyle: "preserve-3d", transition: "0.8s", transform: flip ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          
          {/* RECTO */}
          <div ref={frontRef} style={cardSideStyle}>
             <div style={{ textAlign: "center", borderBottom: "1px solid #d4af37", paddingBottom: 5, marginBottom: 10 }}>
                <h3 style={{ margin: 0, color: "#d4af37", letterSpacing: 1 }}>ISLAMIC SCHOOL</h3>
                <span style={{ fontSize: 9 }}>Student ID Card</span>
             </div>
             <div style={photoBoxStyle}>
                <img src={photoFullUrl} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
             </div>
             <div style={{ marginTop: 10, fontSize: 11 }}>
                <h2 style={{ margin: 0, color: "#d4af37", fontSize: 16 }}>{student.firstName}</h2>
                <p style={{ margin: "2px 0", fontWeight: "bold" }}>{student.lastName}</p>
                <p style={{ margin: "5px 0" }}>ID: <span style={{color: "#d4af37"}}>{student.studentNumber}</span></p>
                <p style={{ margin: "2px 0" }}>Region: {student.region}</p>
             </div>
          </div>

          {/* VERSO */}
          <div ref={backRef} style={{ ...cardSideStyle, transform: "rotateY(180deg)" }}>
            <div style={{ background: "#000", padding: 5, borderRadius: 5, textAlign: "center", fontSize: 10, color: "#d4af37", marginBottom: 10 }}>INFORMATION</div>
            <p style={{ fontSize: 10 }}>Email: {student.email}</p>
            <div style={{ marginTop: 10, background: "white", padding: 5, borderRadius: 5, display: "inline-block" }}>
              <QRCodeCanvas value={verifyURL} size={60} />
            </div>
            <div style={{ position: "absolute", bottom: 15, right: 20, textAlign: "center" }}>
              <div style={{ color: "#d4af37", fontSize: 10, borderTop: "1px solid #d4af37", paddingTop: 3 }}>Directeur</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 15, marginTop: 30 }}>
        <button onClick={downloadPNG} style={btnStyle("#d4af37", "#02140f")}>PNG</button>
        <button onClick={downloadPDF} style={btnStyle("#145a32", "white")}>PDF</button>
        <button onClick={() => setStudent(null)} style={btnStyle("#333", "white")}>Retour</button>
      </div>
    </div>
  );
}

const cardSideStyle: any = { position: "absolute", width: "340px", height: "240px", backfaceVisibility: "hidden", borderRadius: 20, background: "linear-gradient(140deg,#030a10,#0b3d2e)", color: "#fff", padding: 20, fontFamily: "serif", border: "1px solid #d4af37", boxSizing: "border-box" };
const photoBoxStyle: any = { position: "absolute", top: 80, right: 20, width: 80, height: 90, borderRadius: 8, overflow: "hidden", border: "2px solid #d4af37" };
const btnStyle = (bg: string, col: string): any => ({ padding: "10px 17px", borderRadius: 10, border: "none", background: bg, color: col, fontWeight: "bold", cursor: "pointer" });

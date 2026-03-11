import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function VerifyStudent() {

  const { student_number } = useParams();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student_number) {
      verifyStudent();
    }
  }, [student_number]);

  const verifyStudent = async () => {
    try {
      const data = await apiFetch(`/verify/${student_number}`);
      setStudent(data);
    } catch (err) {
      console.error("Erreur verification :", err);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center", marginTop: 80 }}>
        🔎 Vérification...
      </h2>
    );
  }

  if (!student) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h1 style={{ color: "red" }}>❌ Carte invalide</h1>
        <p>Aucun étudiant trouvé</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h1 style={{ color: "#16a34a" }}>✅ Carte valide</h1>

      <h2>
        {student.firstName} {student.lastName}
      </h2>

      <p><strong>Numéro :</strong> {student.student_number}</p>
      <p><strong>Classe :</strong> {student.class_name}</p>
    </div>
  );
}
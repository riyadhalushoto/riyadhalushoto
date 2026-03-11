import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function CheckStudent() {
  const [number,setNumber] = useState("");
  const navigate = useNavigate();
  const handleVerify = (e:any) => {
    e.preventDefault();
    if(!number){
      alert("Entrez le numéro étudiant");
      return;
    }
    navigate(`/verify/${number}`);
  };
  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>🔎 Vérifier une carte étudiant</h2>
        <form onSubmit={handleVerify} style={form}>
          <input
            type="text"
            placeholder="Numéro étudiant"
            value={number}
            onChange={(e)=>setNumber(e.target.value)}
            style={input}
          />
          <button type="submit" style={button}>
            Vérifier
          </button>
        </form>
      </div>
    </div>
  );
}
const container:any={
minHeight:"50vh",
display:"flex",
justifyContent:"center",
alignItems:"center",
background:"linear-gradient(135deg,#02140f,#063d2d)"
}
const card:any={
background:"#02140f",
padding:10,
borderRadius:12,
width:350,
textAlign:"center",
border:"1px solid #d4af37"
}
const title:any={
color:"#d4af37",
marginBottom:20
}
const form:any={
display:"flex",
flexDirection:"column",
gap:15
}
const input:any={
padding:12,
borderRadius:8,
border:"1px solid #d4af37",
background:"#020617",
color:"white"
}
const button:any={
padding:12,
borderRadius:8,
border:"none",
background:"#d4af37",
color:"#02140f",
fontWeight:"bold",
cursor:"pointer"
}
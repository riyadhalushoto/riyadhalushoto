import { useEffect, useState } from "react";
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region: string;
  studentNumber?: string;
  photoUrl?: string;
}
export default function StudentsList() {
  const [students,setStudents] = useState<Student[]>([]);
  const [search,setSearch] = useState("");
  const [currentPage,setCurrentPage] = useState(1);
  const [editing,setEditing] = useState<Student | null>(null);
  const studentsPerPage = 5;
  const token = localStorage.getItem("token");
  const fetchStudents = async () => {
    try{
      const res = await fetch(
        "https://riyadhalushoto.onrender.com/users?role=student",
        {
          credentials:"include",
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );
      const data = await res.json();
      setStudents(data);
    }catch(err){
      console.error("Fetch students error:",err);
    }
  };
  useEffect(()=>{
    fetchStudents();
  },[]);
  // DELETE
  const handleDelete = async (id:string)=>{
    if(!window.confirm("Supprimer cet étudiant ?")) return;
    await fetch(`http://localhost:5000/users/${id}`,{
      method:"DELETE",
      credentials:"include",
      headers:{
        Authorization:`Bearer ${token}`
      }
    });
    fetchStudents();
  };
  // UPDATE
  const handleUpdate = async ()=>{
    if(!editing) return;
    await fetch(`http://localhost:5000/users/${editing._id}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${token}`
      },
      credentials:"include",
      body:JSON.stringify(editing)
    });
    setEditing(null);
    fetchStudents();
  };
  // FONCTION COPIER
  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`Numéro ${text} copié !`);
  };
  // SEARCH
  const filtered = students.filter((s)=>{
    const q = search.toLowerCase();
    return(
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.studentNumber?.toLowerCase().includes(q)
    );
  });
  // PAGINATION
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = filtered.slice(indexOfFirst,indexOfLast);
  const totalPages = Math.ceil(filtered.length / studentsPerPage);
  return(
  <div>
  <input
  type="text"
  placeholder="Rechercher nom, email ou numéro étudiant..."
  value={search}
  onChange={(e)=>{
    setSearch(e.target.value);
    setCurrentPage(1);
  }}
  style={searchInput}
  />
  <table style={tableStyle}>
  <thead>
  <tr>
  <th style={th}>Photo</th>
  <th style={th}>Nom</th>
 
  <th style={th}>N° Étudiant</th>
  <th style={th}>Actions</th>
  </tr>
  </thead>
  <tbody>
  {currentStudents.map((s)=>{
  const photo =
  s.photoUrl
  ? `http://localhost:5000${s.photoUrl}`
  : "https://via.placeholder.com/40";
  return(
  <tr key={s._id} style={tr}>
  <td style={td}>
  <img src={photo} style={photoStyle}/>
  </td>
  <td style={td}>
  {s.firstName} {s.lastName}
  </td>
  
  <td style={td}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {s.studentNumber || "-"}
      {s.studentNumber && (
        <button 
          onClick={() => handleCopy(s.studentNumber)}
          title="Copier le numéro"
          style={copyBtn}
        >
          📋
        </button>
      )}
    </div>
  </td>
  <td style={td}>
  <button
  onClick={()=>setEditing(s)}
  style={actionBtn}
  >
  Modifier
  </button>
  <button
  onClick={()=>handleDelete(s._id)}
  style={{...actionBtn,background:"#8b0000"}}
  >
  Supprimer
  </button>
  </td>
  </tr>
  )
  })}
  </tbody>
  </table>
  {currentStudents.length===0 && (
  <p style={{color:"#d4af37",marginTop:20}}>
  Aucun étudiant trouvé
  </p>
  )}
  <div style={{marginTop:20}}>
  {Array.from({length:totalPages},(_,i)=>(
  <button
  key={i}
  onClick={()=>setCurrentPage(i+1)}
  style={pageBtn(currentPage===i+1)}
  >
  {i+1}
  </button>
  ))}
  </div>
  {editing && (
  <div style={modalOverlay}>
  <div style={modalBox}>
  <h3 style={{color:"#d4af37"}}>Modifier Étudiant</h3>
  <input
  value={editing.firstName}
  onChange={(e)=>setEditing({...editing,firstName:e.target.value})}
  style={modalInput}
  />
  <input
  value={editing.lastName}
  onChange={(e)=>setEditing({...editing,lastName:e.target.value})}
  style={modalInput}
  />
  <button
  onClick={handleUpdate}
  style={saveBtn}
  >
  Sauvegarder
  </button>
  </div>
  </div>
  )}
  </div>
  );
}
/* ================= STYLES ================= */
const searchInput:any={
  padding:12,
  borderRadius:12,
  border:"1px solid #d4af37",
  marginBottom:20,
  width:"93%",
  background:"#02140f",
  color:"#d4af37"
};
const tableStyle:any={
  width:"100%",
  borderCollapse:"collapse",
  color:"#d4af37"
};
const th:any={
  borderBottom:"1px solid #d4af37",
  padding:12,
  textAlign:"left"
};
const td:any={
  padding:12,
  borderBottom:"1px solid #063d2d"
};
const tr:any={
  background:"transparent"
};
const photoStyle:any={
  width:40,
  height:40,
  borderRadius:"50%",
  objectFit:"cover"
};
const actionBtn:any={
  padding:"6px 12px",
  marginRight:8,
  borderRadius:8,
  border:"1px solid #d4af37",
  background:"#063d2d",
  color:"#d4af37",
  cursor:"pointer"
};
const copyBtn:any={
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
  padding: "2px 5px",
  borderRadius: "4px",
  display: "inline-flex",
  alignItems: "center"
};
const pageBtn=(active:boolean)=>({
  padding:"6px 12px",
  marginRight:6,
  borderRadius:8,
  border:"1px solid #d4af37",
  background:active?"#d4af37":"#02140f",
  color:active?"#02140f":"#d4af37",
  cursor:"pointer"
});
const modalOverlay:any={
  position:"fixed",
  top:0,
  left:0,
  right:0,
  bottom:0,
  background:"rgba(0,0,0,0.7)",
  display:"flex",
  justifyContent:"center",
  alignItems:"center"
};
const modalBox:any={
  background:"linear-gradient(145deg,#063d2d,#02140f)",
  padding:30,
  borderRadius:20,
  border:"1px solid #d4af37",
  width:350
};
const modalInput:any={
  width:"100%",
  padding:10,
  marginBottom:15,
  borderRadius:10,
  border:"1px solid #d4af37",
  background:"#02140f",
  color:"#d4af37"
};
const saveBtn:any={
  padding:"10px 18px",
  borderRadius:10,
  border:"1px solid #d4af37",
  background:"#d4af37",
  color:"#02140f",
  fontWeight:"bold",
  cursor:"pointer"
};

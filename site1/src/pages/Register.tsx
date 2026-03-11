import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {

const navigate = useNavigate();

const [firstName,setFirstName] = useState("");
const [middleName,setMiddleName] = useState("");
const [lastName,setLastName] = useState("");
const [username,setUsername] = useState("");
const [dob,setDob] = useState("");
const [nationality,setNationality] = useState("");
const [idNumber,setIdNumber] = useState("");
const [country,setCountry] = useState("");
const [region,setRegion] = useState("");
const [phone,setPhone] = useState("");
const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [photo,setPhoto] = useState<File | null>(null)
const [preview,setPreview] = useState<string | null>(null)

const [error,setError] = useState("")
const [success,setSuccess] = useState("")
const [studentNumber,setStudentNumber] = useState("")
const [loading,setLoading] = useState(false)

// Générer numéro étudiant
const generateStudentNumber = () => {
let num = ""
for(let i=0;i<14;i++){
num += Math.floor(Math.random()*10)
}
return num
}

// Copier numéro étudiant
const copyStudentNumber = () => {
navigator.clipboard.writeText(studentNumber)
alert("Numéro étudiant copié")
}

const handlePhoto = (file:File) => {
setPhoto(file)
setPreview(URL.createObjectURL(file))
}

const handleRegister = async (e:React.FormEvent) => {

e.preventDefault()  

setError("")  
setSuccess("")  
setLoading(true)  

try{  

  const number = generateStudentNumber()  
  setStudentNumber(number)  

  const formData = new FormData()  

  formData.append("firstName",firstName)  
  formData.append("middleName",middleName)  
  formData.append("lastName",lastName)  
  formData.append("username",username)  
  formData.append("dob",dob)  
  formData.append("nationality",nationality)  
  formData.append("idNumber",idNumber)  
  formData.append("country",country)  
  formData.append("region",region)  
  formData.append("phone",phone)  
  formData.append("email",email.trim())  
  formData.append("password",password)  
  formData.append("studentNumber",number)  

  if(photo){  
    formData.append("photo",photo)  
  }  

  const res = await fetch("http://localhost:5000/register",{  
    method:"POST",  
    body:formData  
  })  

  const data = await res.json()  

  if(!res.ok){  
    throw new Error(data.message || "Erreur serveur")  
  }  

  setSuccess("Compte créé avec succès")  

  setTimeout(()=>{  
    navigate("/login")  
  },2000)  

}catch(err:any){  

  console.error("REGISTER ERROR:",err)  
  setError(err.message)  

}finally{  
  setLoading(false)  
}

}

return(

<div style={container}>  

  <h2 style={title}>🕌 Inscription Élève</h2>  

  <form onSubmit={handleRegister} style={form}>  

    <input type="text" placeholder="Nom d’utilisateur" value={username} onChange={e=>setUsername(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Nom" value={lastName} onChange={e=>setLastName(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Post-nom" value={middleName} onChange={e=>setMiddleName(e.target.value)} style={input}/>  

    <input type="text" placeholder="Prénom" value={firstName} onChange={e=>setFirstName(e.target.value)} style={input} required/>  

    <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Nationalité" value={nationality} onChange={e=>setNationality(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Numéro national / Passeport" value={idNumber} onChange={e=>setIdNumber(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Pays" value={country} onChange={e=>setCountry(e.target.value)} style={input} required/>  

    <input type="text" placeholder="Région" value={region} onChange={e=>setRegion(e.target.value)} style={input} required/>  

    <input type="tel" placeholder="Téléphone" value={phone} onChange={e=>setPhone(e.target.value)} style={input} required/>  

    <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={input} required/>  

    <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} style={input} required/>  

    {/* Upload Photo */}  

    <input  
    type="file"  
    accept="image/*"  
    onChange={(e)=>{  
      if(e.target.files){  
        handlePhoto(e.target.files[0])  
      }  
    }}  
    style={input}  
    />  

    {preview && (  

      <div style={{marginTop:10}}>  

        <img  
        src={preview}  
        style={{  
          width:90,  
          height:90,  
          borderRadius:"50%",  
          objectFit:"cover",  
          border:"2px solid #d4af37"  
        }}  
        />  

      </div>  

    )}  

    <button type="submit" style={btn} disabled={loading}>  

      {loading ? "Inscription..." : "S'inscrire"}  

    </button>  

    {studentNumber && (  

      <div style={studentBox}>  

        <b>Numéro étudiant :</b>  

        <div style={studentNumberStyle}>  
          {studentNumber}  
        </div>  

        <button type="button" onClick={copyStudentNumber} style={copyBtn}>  
          Copier  
        </button>  

      </div>  

    )}  

    {error && <p style={errorStyle}>{error}</p>}  

    {success && <p style={successStyle}>{success}</p>}  

  </form>  

</div>

)

}

const container:any={
minHeight:"100vh",
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
background:"linear-gradient(145deg,#02140f,#063d2d)",
color:"white",
padding:20
}

const title:any={
fontSize:30,
marginBottom:20
}

const form:any={
display:"flex",
flexDirection:"column",
gap:15,
width:360
}

const input:any={
padding:12,
borderRadius:10,
border:"1px solid #d4af37",
background:"#020617",
color:"white"
}

const btn:any={
padding:12,
borderRadius:10,
border:"none",
background:"#d4af37",
color:"#02140f",
fontWeight:"bold",
cursor:"pointer"
}

const studentBox:any={
marginTop:20,
padding:15,
border:"1px solid #d4af37",
borderRadius:10
}

const studentNumberStyle:any={
fontSize:18,
marginTop:5,
letterSpacing:2
}

const copyBtn:any={
marginTop:10,
padding:"6px 12px",
borderRadius:6,
border:"none",
background:"#16a34a",
color:"white",
cursor:"pointer"
}

const errorStyle:any={
color:"red",
marginTop:10
}

const successStyle:any={
color:"#16a34a",
marginTop:10
}

import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import StudentDashboard from "./pages/StudentDashboard";

import Messages from "./pages/Messages";
import Notifications from "./components/Notifications";
import Payments from "./pages/Payments";
import VerifyStudent from "./pages/VerifyStudent";

import ProtectedRoute from "./ProtectedRoute";
import CheckStudent from "./pages/CheckStudent";

function App() {

return (

<AuthProvider>  

  <Routes>  

    {/* PUBLIC */}  

    <Route path="/" element={<Home />} />  

    <Route path="/login" element={<Login />} />  

    <Route path="/register" element={<Register />} />  

    {/* Vérification carte étudiant (publique) */}  
    <Route path="/verify/:student_number" element={<VerifyStudent />} />  


    {/* DASHBOARDS */}  

    <Route  
      path="/admin-dashboard"  
      element={  
        <ProtectedRoute role="admin">  
          <AdminDashboard/>  
        </ProtectedRoute>  
      }  
    />  

    <Route  
      path="/teacher-dashboard"  
      element={  
        <ProtectedRoute role="teacher">  
          <TeacherDashboard/>  
        </ProtectedRoute>  
      }  
    />  

    <Route  
      path="/parent-dashboard"  
      element={  
        <ProtectedRoute role="parent">  
          <ParentDashboard/>  
        </ProtectedRoute>  
      }  
    />  

    <Route  
      path="/student-dashboard"  
      element={  
        <ProtectedRoute role="student">  
          <StudentDashboard/>  
        </ProtectedRoute>  
      }  
    />  


    {/* AUTRES PAGES */}  

    <Route  
      path="/messages"  
      element={  
        <ProtectedRoute>  
          <Messages/>  
        </ProtectedRoute>  
      }  
    />  

    <Route  
      path="/notifications"  
      element={  
        <ProtectedRoute>  
          <Notifications/>  
        </ProtectedRoute>  
      }  
    />  

    <Route  
      path="/payments"  
      element={  
        <ProtectedRoute>  
          <Payments/>  
        </ProtectedRoute>  
      }  
    />  
    <Route path="/check-student" element={<CheckStudent />} />  

  </Routes>  

</AuthProvider>

);
}

export default App;

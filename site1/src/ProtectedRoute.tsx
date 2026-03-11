import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
role?: string; // ✔ optionnel
children: ReactNode;
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {

const { user, loading } = useAuth();

// attendre la vérification du token
if (loading) {
return (
<div style={{ color: "#d4af37", padding: "20px" }}>
Chargement de la session...
</div>
);
}

// pas connecté
if (!user) {
return <Navigate to="/login" />;
}

// si un rôle est exigé
if (role) {

// cas spécial student / user  
if (role === "student" && (user.role === "user" || user.role === "student")) {  
  return <>{children}</>;  
}  

if (user.role !== role) {  
  return <Navigate to="/login" />;  
}

}

return <>{children}</>;
}

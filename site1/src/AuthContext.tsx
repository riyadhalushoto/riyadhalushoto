import { createContext, useContext, useState, useEffect } from "react";

const API_URL = "https://riyadhalushoto.onrender.com";

interface UserType {
  id: string;
  email: string;
  role: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: UserType | null;
  login: (email: string, password: string) => Promise<UserType>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok && data.user) {
          const normalizedUser = {
            id: data.user.id || data.user._id,
            email: data.user.email,
            role: (data.user.role || "").toLowerCase(),
            photoUrl: data.user.photoUrl
          };
          setUser(normalizedUser);
        } else {
          // Token invalide
          localStorage.clear();
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false); // 🔹 Indispensable : libère l'écran de chargement
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserType> => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur de connexion");

    localStorage.setItem("token", data.token);
    
    const normalizedUser = {
      id: data.user.id || data.user._id,
      email: data.user.email,
      role: (data.user.role || "").toLowerCase(),
      photoUrl: data.user.photoUrl
    };

    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

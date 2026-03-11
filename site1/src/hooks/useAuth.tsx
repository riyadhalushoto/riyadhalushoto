import { useAuth } from "../AuthContext";
export default function useSecureAuth() {
  return useAuth();
}
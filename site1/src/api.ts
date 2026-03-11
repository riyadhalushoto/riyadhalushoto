const API_URL = "http://localhost:5000"; // ou ton IP serveur
export async function apiFetch(path: string, options: any = {}) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(API_URL + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!res.ok) {
      console.error("API ERROR RESPONSE:", data);
      throw new Error(data.message || "Erreur serveur");
    }
    return data;
  } catch (err: any) {
    console.error("API ERROR:", err.message);
    throw new Error(err.message || "Connexion au serveur impossible");
  }
}

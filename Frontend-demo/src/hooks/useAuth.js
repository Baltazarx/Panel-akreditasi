import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useAuth() {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { (async () => {
    try {
      const me = await apiFetch("/api/me");
      console.log("useAuth: /me response:", me);
      setUser({
        name: me.username, role: me.role, unit_id: me.id_unit_prodi ?? null,
        id_user: me.id_user, nama_unit: me.nama_unit ?? null,
      });
    } catch {}
  })(); }, []);

  const login = async (username, password) => {
    try {
      setLoading(true); setError("");
      await apiFetch("/api/login", { method: "POST", body: JSON.stringify({ username, password }) });
      const me = await apiFetch("/api/me");
      setUser({
        name: me.username, role: me.role, unit_id: me.id_unit_prodi ?? null,
        id_user: me.id_user, nama_unit: me.nama_unit ?? null,
      });
    } catch (e) { setError(e?.message || "Login gagal"); }
    finally { setLoading(false); }
  };

  const logout = async () => { try { await apiFetch("/api/logout", { method:"POST" }); } catch {} setUser(null); };

  return { user, loading, error, login, logout, setUser };
}

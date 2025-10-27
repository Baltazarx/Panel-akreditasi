// Helper API & util
export const BASE_URL = import.meta?.env?.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function apiFetch(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers, credentials: "include" });
  if (!res.ok) {
    const text = await res.text();
    try { const j = JSON.parse(text); throw new Error(j?.error || j?.message || `HTTP ${res.status}`); }
    catch { throw new Error(text || `HTTP ${res.status}`); }
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export function getIdField(row) {
  if (!row || typeof row !== "object") return "id";
  return ("id" in row && "id") || ("_id" in row && "_id") || Object.keys(row)[0] || "id";
}

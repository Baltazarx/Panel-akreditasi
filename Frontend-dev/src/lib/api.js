// src/lib/api.js

const BASE_URL = "http://localhost:3000/api";

// Helper API fetch dengan error handling
export async function apiFetch(path, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
    credentials: "include", // biar cookie ikut
    mode: "cors", // pastikan CORS mode
  });

  if (!res.ok) {
    const text = await res.text();
    // Hanya log error untuk status yang tidak diharapkan (bukan 404 atau 401 yang sudah ditangani)
    // Juga skip log untuk endpoint yang biasanya tidak ada (tendik, audit-mutu-internal, dll)
    const skipLogPaths = ['/tendik', '/audit-mutu-internal', '/ref-jabatan-struktural', '/ref-jabatan-fungsional'];
    const shouldSkipLog = skipLogPaths.some(skipPath => path.includes(skipPath));
    
    // Skip log untuk 404, 401, atau endpoint yang biasanya tidak ada
    // Juga skip log jika opts.silent = true (untuk error yang sudah ditangani)
    const shouldLog = res.status !== 404 && res.status !== 401 && !shouldSkipLog && !opts.silent;
    
    // Hanya log error yang benar-benar perlu perhatian (500, 403, dll)
    if (shouldLog && res.status >= 500) {
      console.error('API Error Response:', {
        url: `${BASE_URL}${path}`,
        status: res.status,
        statusText: res.statusText,
        body: text
      });
    }
    try {
      const j = JSON.parse(text);
      const errorMsg = j?.error || j?.message || `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.response = j;
      throw error;
    } catch (parseError) {
      const error = new Error(text || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.responseText = text;
      throw error;
    }
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Helper untuk ambil primary key ID (generic table)
export function getIdField(row) {
  if (!row || typeof row !== "object") return "id";
  
  // Check for common ID field patterns
  if ("id_pimpinan" in row) return "id_pimpinan";
  if ("id_dosen" in row) return "id_dosen";
  if ("id_pegawai" in row) return "id_pegawai";
  if ("id_user" in row) return "id_user";
  if ("id" in row) return "id";
  if ("_id" in row) return "_id";
  
  // Fallback to first key that looks like an ID
  const firstKey = Object.keys(row)[0];
  return firstKey || "id";
}

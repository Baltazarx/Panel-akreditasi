import { useMemo } from "react";
import { apiFetch } from "../lib/api";

export function useApi() {
  return useMemo(() => ({
    get: (path, opts) => apiFetch(`/api${path}`, { ...opts, method: "GET" }),
    post: (path, data, opts) => apiFetch(`/api${path}`, { ...opts, method: "POST", body: JSON.stringify(data) }),
    put: (path, data, opts) => apiFetch(`/api${path}`, { ...opts, method: "PUT", body: JSON.stringify(data) }),
    delete: (path, opts) => apiFetch(`/api${path}`, { ...opts, method: "DELETE" }),
  }), [apiFetch]);
}

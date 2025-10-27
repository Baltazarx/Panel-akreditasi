// hooks/useApi.js
import { apiFetch } from "../lib/api";

export function useApi() {
  return {
    get: (path, opts) =>
      apiFetch(path, { ...opts, method: "GET" }),
    post: (path, data, opts) =>
      apiFetch(path, {
        ...opts,
        method: "POST",
        body: JSON.stringify(data),
      }),
    put: (path, data, opts) =>
      apiFetch(path, {
        ...opts,
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (path, opts) =>
      apiFetch(path, { ...opts, method: "DELETE" }),
  };
}

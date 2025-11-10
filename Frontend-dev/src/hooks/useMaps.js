// src/hooks/useMaps.js
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";

const BASE_URL = "http://localhost:3000/api";

/**
 * Mengambil master data lalu membentuk "maps" (object by id) untuk dipakai di UI.
 * Endpoint yang dipakai mengikuti daftar routes backend:
 *  - /unit-kerja
 *  - /pegawai
 *  - /tahun-akademik
 *  - /ref-jabatan-struktural
 *  - /ref-jabatan-fungsional   <-- penting untuk dropdown JAFUNG
 *  - /tenaga-kependidikan
 *  - /audit-mutu-internal
 */
export function useMaps(authUser = true) {
  const [maps, setMaps] = useState({
    units: {},
    unit_kerja: {}, // Alias untuk kompatibilitas
    pegawai: {},
    tahun: {},
    tendik: {},
    audit_mutu_internal: {},
    ref_jabatan_struktural: {},
    ref_jabatan_fungsional: {},
  });
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (!authUser) {
      setReady(true);
      return () => { mounted.current = false; };
    }

    (async () => {
      try {
        // Helper untuk fetch dengan error handling yang lebih baik
        // Menggunakan fetch langsung untuk semua endpoint untuk menghindari console.error dari apiFetch
        const safeFetch = async (endpoint) => {
          try {
            const res = await fetch(`${BASE_URL}${endpoint}`, {
              credentials: "include",
              mode: "cors",
              headers: {
                "Content-Type": "application/json",
              },
            });
            
            if (!res.ok) {
              // Silent fail untuk semua endpoint di useMaps
              // Error sudah ditangani dengan return []
              return [];
            }
            
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              return await res.json();
            }
            return [];
          } catch (err) {
            // Silent fail untuk semua error di useMaps
            // Error sudah ditangani dengan return []
            return [];
          }
        };

        const [
          units,
          pegawai,
          tahun,
          refJabStruktural,
          refJabFungsional,
          tendik,
          ami,
        ] = await Promise.all([
          safeFetch("/unit-kerja"),
          safeFetch("/pegawai"),
          safeFetch("/tahun-akademik"),
          safeFetch("/ref-jabatan-struktural"),
          safeFetch("/ref-jabatan-fungsional"), // <-- ini yang bikin dropdown JAFUNG muncul
          safeFetch("/tendik"),
          safeFetch("/audit-mutu-internal"),
        ]);

        const toMap = (arr, keys) =>
          (Array.isArray(arr) ? arr : []).reduce((m, it) => {
            const idFromKeys = (Array.isArray(keys) ? keys : [keys])
              .map((k) => it?.[k])
              .find((v) => v != null);
            const id = idFromKeys ?? it?.id ?? it?._id;
            if (id != null) m[id] = it;
            return m;
          }, {});

        const next = {
          units: toMap(units, "id_unit"),
          unit_kerja: toMap(units, "id_unit"), // Alias untuk kompatibilitas
          pegawai: toMap(pegawai, "id_pegawai"),
          tahun: toMap(tahun, "id_tahun"),
          tendik: toMap(tendik, "id_tendik"),
          audit_mutu_internal: toMap(ami, ["id_audit_mutu", "id_ami", "id_audit"]),
          ref_jabatan_struktural: toMap(refJabStruktural, "id_jabatan"),
          ref_jabatan_fungsional: toMap(refJabFungsional, "id_jafung"),
        };

        if (mounted.current) {
          setMaps(next);
          setReady(true);
        }
      } catch (err) {
        console.error("useMaps error:", err);
        if (mounted.current) setReady(true);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [authUser]);

  // Helper untuk menampilkan teks tahun dari id
  const toYearText = (id) =>
    maps.tahun[id]?.nama ?? maps.tahun[id]?.tahun ?? id;

  return { maps, toYearText, ready };
}

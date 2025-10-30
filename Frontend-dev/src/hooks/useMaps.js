// src/hooks/useMaps.js
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";

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
        const [
          units,
          pegawai,
          tahun,
          refJabStruktural,
          refJabFungsional,
          tendik,
          ami,
        ] = await Promise.all([
          apiFetch("/unit-kerja").catch(() => []),
          apiFetch("/pegawai").catch(() => []),
          apiFetch("/tahun-akademik").catch(() => []),
          apiFetch("/ref-jabatan-struktural").catch(() => []),
          apiFetch("/ref-jabatan-fungsional").catch(() => []), // <-- ini yang bikin dropdown JAFUNG muncul
          apiFetch("/tendik").catch(() => []),
          apiFetch("/audit-mutu-internal").catch(() => []),
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

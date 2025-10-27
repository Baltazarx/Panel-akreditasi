import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useMaps(authUser) {
  const [maps, setMaps] = useState({ units:{}, pegawai:{}, tahun:{}, tendik:{}, ref_jabatan_struktural:{} });

  useEffect(() => { (async () => {
    if (!authUser) return;
    try {
      const [units, pegawai, tahun, ref_jabatan_struktural, tendik] = await Promise.all([
        apiFetch("/api/unit-kerja").catch(() => []),
        apiFetch("/api/pegawai").catch(() => []),
        apiFetch("/api/tahun-akademik").catch(() => []),
        apiFetch("/api/ref-jabatan-struktural").catch(() => []),
        apiFetch("/api/tendik").catch(() => []),
      ]);

      const toMap = (arr, key) => (Array.isArray(arr) ? arr : []).reduce((m, it) => {
        const k = it[key] ?? it.id ?? it._id; if (k != null) m[k]=it; return m;
      }, {});
      setMaps({
        units: toMap(units, "id_unit"),
        pegawai: toMap(pegawai, "id_pegawai"),
        tahun: toMap(tahun, "id_tahun"),
        tendik: toMap(tendik, "id_tendik"),
        ref_jabatan_struktural: toMap(ref_jabatan_struktural, "id_jabatan"),
      });
    } catch {}
  })(); }, [authUser]);

  const toYearText = (id) => maps.tahun[id]?.nama || maps.tahun[id]?.tahun || id;

  return { maps, toYearText };
}

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useMaps(authUser) {
  const [maps, setMaps] = useState({ units:{}, pegawai:{}, tahun:{}, tendik:{}, unit_spmi_jenis:{}, ref_jenis_penggunaan:{}, ref_jabatan_struktural:{} });

  useEffect(() => { (async () => {
    if (!authUser) return;
    try {
      const [units, pegawai, tahun, ref_jabatan_struktural] = await Promise.all([
        apiFetch("/api/unit-kerja").catch(() => []),
        apiFetch("/api/pegawai").catch(() => []),
        apiFetch("/api/tahun").catch(() => []),
        apiFetch("/api/ref-jabatan-struktural").catch(() => []),
      ]);
      const [tendik] = await Promise.all([ apiFetch("/api/tenaga-kependidikan").catch(() => []) ]);
      const [unit_spmi_jenis] = await Promise.all([ apiFetch("/api/ref-jenis-unit-spmi").catch(() => []) ]);
      const [ref_jenis_penggunaan] = await Promise.all([ apiFetch("/api/ref-jenis-penggunaan").catch(() => []) ]);

      const toMap = (arr, key) => (Array.isArray(arr) ? arr : []).reduce((m, it) => {
        const k = it[key] ?? it.id ?? it._id; if (k != null) m[k]=it; return m;
      }, {});
      setMaps({
        units: toMap(units, "id_unit"),
        pegawai: toMap(pegawai, "id_pegawai"),
        tahun: toMap(tahun, "id_tahun"),
        tendik: toMap(tendik, "id_tendik"),
        unit_spmi_jenis: toMap(unit_spmi_jenis, "id_jenis_unit_spmi"),
        ref_jenis_penggunaan: toMap(ref_jenis_penggunaan, "id_jenis_penggunaan"),
        ref_jabatan_struktural: toMap(ref_jabatan_struktural, "id_jabatan"),
      });
    } catch {}
  })(); }, [authUser]);

  const toYearText = (id) => maps.tahun[id]?.nama || maps.tahun[id]?.tahun || id;

  return { maps, toYearText };
}

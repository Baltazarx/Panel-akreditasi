import { useEffect, useMemo, useState } from "react";

const LS_KEY = "active_year_id";

export function useTsYear(allYearsMap) {
  // allYearsMap = maps.tahun (obj {id_tahun: {...}}) -> optional
  const [activeYear, setActiveYear] = useState(() => {
    const fromLS = localStorage.getItem(LS_KEY);
    return fromLS ? parseInt(fromLS, 10) : null;
  });

  // Auto-pilih tahun terbaru kalau belum ada
  const fallbackLatestId = useMemo(() => {
    if (!allYearsMap || !Object.keys(allYearsMap).length) return null;
    const list = Object.values(allYearsMap);
    // coba pakai field 'tahun' kalau format "2024/2025", fallback ke id_tahun
    const parsed = list
      .map((y) => {
        // ekstrak angka pertama untuk urutan kasar (2026/2027 -> 2026)
        const base = typeof y.tahun === "string" ? parseInt(y.tahun.split("/")[0], 10) : null;
        return { ...y, sortKey: Number.isFinite(base) ? base : (y.id_tahun ?? 0) };
      })
      .sort((a, b) => b.sortKey - a.sortKey);
    return parsed[0]?.id_tahun ?? null;
  }, [allYearsMap]);

  useEffect(() => {
    if (activeYear == null && fallbackLatestId != null) {
      setActiveYear(fallbackLatestId);
    }
  }, [activeYear, fallbackLatestId]);

  useEffect(() => {
    if (activeYear != null) localStorage.setItem(LS_KEY, String(activeYear));
  }, [activeYear]);

  return { activeYear, setActiveYear };
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { useMaps } from "../../../../hooks/useMaps";
import { roleCan } from "../../../../lib/role";

export default function Tabel2C({ role }) {
  const { maps } = useMaps(true);

  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bentukList, setBentukList] = useState([]); // {id_bentuk, nama_bentuk}
  const [dataByYear, setDataByYear] = useState({}); // { [id_tahun]: { aktif, link, counts:{[id_bentuk]: jumlah} } }

  const availableYears = useMemo(() => {
    const years = Object.values(maps.tahun || {})
      .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
      .filter((t) => t.id)
      .sort((a, b) => Number(b.id) - Number(a.id));
    return years;
  }, [maps.tahun]);

  // Default ke tahun sekarang jika ada
  useEffect(() => {
    if (!selectedYear && availableYears.length) {
      const now = new Date();
      const yr = now.getFullYear();
      const match = availableYears.find((y) => String(y.text).startsWith(String(yr)) || String(y.id) === String(yr));
      setSelectedYear((match?.id ?? availableYears[0].id) + "");
    }
  }, [availableYears, selectedYear]);

  const yearOrder = useMemo(() => {
    if (!selectedYear) return [];
    const idx = availableYears.findIndex((y) => String(y.id) === String(selectedYear));
    if (idx === -1) return [];
    const ts = availableYears[idx]?.id;
    const ts1 = availableYears[idx + 1]?.id;
    const ts2 = availableYears[idx + 2]?.id;
    return [ts2, ts1, ts].filter(Boolean); // urut: TS-2, TS-1, TS
  }, [availableYears, selectedYear]);

  // Fetch master bentuk + data per tahun
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        // Master bentuk pembelajaran
        const bentuk = await apiFetch("/tabel2c-bentuk-pembelajaran");
        setBentukList(Array.isArray(bentuk) ? bentuk : []);

        // Data per tahun (TS-2, TS-1, TS)
        const entries = await Promise.all(
          yearOrder.map(async (y) => {
            try {
              const res = await apiFetch(`/tabel2c-fleksibilitas?id_tahun=${y}`);
              // Normalisasi response
              const rec = Array.isArray(res) ? (res[0] || {}) : (res || {});
              const aktif = rec.jumlah_mahasiswa_aktif ?? rec.jumlah_mahasiswa ?? 0;
              const link = rec.link_bukti ?? rec.link ?? "";
              // Detail bisa berada di rec.details | rec.detail | rec.bentuk | rec.items
              const detailArr = rec.details || rec.detail || rec.bentuk || rec.items || [];
              const counts = (Array.isArray(detailArr) ? detailArr : []).reduce((m, it) => {
                const id = it.id_bentuk ?? it.bentuk_id ?? it.id;
                const j = it.jumlah_mahasiswa_ikut ?? it.jumlah ?? 0;
                if (id != null) m[id] = j;
                return m;
              }, {});
              return [y, { aktif, link, counts }];
            } catch (e) {
              return [y, { aktif: 0, link: "", counts: {} }];
            }
          })
        );
        const map = entries.reduce((m, [y, v]) => ((m[y] = v), m), {});
        setDataByYear(map);
      } catch (e) {
        setError(e?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, [yearOrder.join(",")]);

  const totalsByYear = useMemo(() => {
    const sums = {};
    yearOrder.forEach((y) => {
      const counts = dataByYear[y]?.counts || {};
      sums[y] = Object.values(counts).reduce((a, b) => a + Number(b || 0), 0);
    });
    return sums;
  }, [dataByYear, yearOrder]);

  const percentByYear = useMemo(() => {
    const pct = {};
    yearOrder.forEach((y) => {
      const total = totalsByYear[y] || 0;
      const aktif = Number(dataByYear[y]?.aktif || 0);
      pct[y] = aktif > 0 ? (total / aktif) * 100 : 0;
    });
    return pct;
  }, [totalsByYear, dataByYear, yearOrder]);

  const canRead = roleCan(role, "fleksibilitas_pembelajaran", "r");

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <header className="pb-6 mb-2 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran</h2>
        <p className="text-sm text-slate-600 mt-1">Menampilkan TS, TS-1, TS-2 berdasarkan tahun akademik terpilih.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${bentukList.length} bentuk`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Tahun (TS):</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
          >
            {availableYears.map((y) => (
              <option key={y.id} value={y.id}>{y.text}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>
      )}

      {!canRead ? (
        <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
          Anda tidak memiliki akses untuk membaca tabel ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Tahun Akademik</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-2</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-1</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Link Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white hover:bg-[#eaf4ff]">
                <td className="px-4 py-3 text-slate-800 border border-slate-200">Jumlah Mahasiswa Aktif</td>
                {yearOrder.map((y) => (
                  <td key={y} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">{dataByYear[y]?.aktif ?? 0}</td>
                ))}
                <td className="px-4 py-3 border border-slate-200">
                  {dataByYear[yearOrder[2]]?.link ? (
                    <a href={dataByYear[yearOrder[2]]?.link} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                      {dataByYear[yearOrder[2]]?.link}
                    </a>
                  ) : (
                    ""
                  )}
                </td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200" colSpan={5}>
                  Bentuk Pembelajaran — Jumlah mahasiswa untuk setiap bentuk pembelajaran
                </td>
              </tr>

              {bentukList.map((b) => (
                <tr key={b.id_bentuk} className="transition-colors bg-white hover:bg-[#eaf4ff]">
                  <td className="px-4 py-3 text-slate-800 border border-slate-200">{b.nama_bentuk}</td>
                  {yearOrder.map((y) => (
                    <td key={y} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">{dataByYear[y]?.counts?.[b.id_bentuk] ?? 0}</td>
                  ))}
                  <td className="px-4 py-3 border border-slate-200"></td>
                </tr>
              ))}

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 text-slate-800 font-semibold">Jumlah</td>
                {yearOrder.map((y) => (
                  <td key={y} className="px-4 py-3 border border-slate-200 text-center text-slate-800">{totalsByYear[y] ?? 0}</td>
                ))}
                <td className="px-4 py-3 border border-slate-200"></td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 text-slate-800 font-semibold">Persentase</td>
                {yearOrder.map((y) => (
                  <td key={y} className="px-4 py-3 border border-slate-200 text-center text-slate-800">{(percentByYear[y] ?? 0).toFixed(2)}%</td>
                ))}
                <td className="px-4 py-3 border border-slate-200"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-600">Memuat data...</div>
      )}
    </div>
  );
}



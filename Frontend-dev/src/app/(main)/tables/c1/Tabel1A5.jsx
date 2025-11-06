import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";

const ENDPOINT = "/kualifikasi-tendik";
const LABEL = "1.A.5 Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir";

const educationLevels = ["s3", "s2", "s1", "d4", "d3", "d2", "d1", "sma_smk"];

export default function Tabel1A5() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch(ENDPOINT);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Data jumlah tenaga kependidikan berdasarkan tingkat pendidikan.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.length} baris`}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              No.
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              Jenis Tenaga Kependidikan
            </th>
            <th colSpan={educationLevels.length} className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase border border-white/20">
              Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              Unit Kerja
            </th>
          </tr>
          <tr className="sticky top-0">
            {educationLevels.map((level) => (
              <th
                key={level}
                className="px-6 py-2 text-center text-xs font-semibold tracking-wide uppercase border border-white/20"
              >
                {level.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}
              >
                <td className="px-6 py-4 font-semibold text-slate-800 text-center border border-slate-200">
                  {i + 1}.
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">
                  {r.jenis_tenaga_kependidikan || "-"}
                </td>
                {educationLevels.map((level) => (
                  <td key={level} className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                    {r[level] || 0}
                  </td>
                ))}
                <td className="px-6 py-4 text-slate-700 border border-slate-200">
                  {r.unit_kerja || "-"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={educationLevels.length + 3} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">
                    Belum ada data yang tersedia untuk tabel ini.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

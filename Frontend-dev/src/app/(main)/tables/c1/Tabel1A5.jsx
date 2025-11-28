import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { FiRotateCw, FiDownload, FiTable, FiGrid } from 'react-icons/fi';
import Swal from 'sweetalert2';

const ENDPOINT = "/kualifikasi-tendik";
const LABEL = "1.A.5 Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir";

const educationLevels = ["s3", "s2", "s1", "d4", "d3", "d2", "d1", "sma_smk"];

export default function Tabel1A5() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"

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

  // Export Excel handler
  const handleExport = async () => {
    try {
      setLoading(true);
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
      const url = `${BASE_URL}${ENDPOINT}/export`;
      const response = await fetch(url, {
        credentials: 'include',
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Gagal mengekspor data';
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || json.message || errorMsg;
        } catch (e) {
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `Tabel_1A5_Kualifikasi_Tendik_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor ke Excel.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengekspor data',
        text: err.message || 'Terjadi kesalahan saat mengekspor data.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Data jumlah tenaga kependidikan berdasarkan tingkat pendidikan.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Tabel Data (Grid View):</span>
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "table"
                  ? "bg-[#0384d6] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FiTable className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "grid"
                  ? "bg-[#0384d6] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FiGrid className="w-4 h-4" />
              Grid
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRows}
            disabled={loading}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Refresh data"
          >
            <FiRotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={handleExport}
            disabled={loading || rows.length === 0}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            aria-label="Export to Excel"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
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
                    {r.jenis_tendik || "-"}
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
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.length === 0 ? (
            <div className="col-span-full p-16 text-center text-slate-500 border border-slate-200 rounded-lg bg-white">
              <p className="font-medium">Data tidak ditemukan</p>
              <p className="text-sm">
                Belum ada data yang tersedia untuk tabel ini.
              </p>
            </div>
          ) : (
            rows.map((r, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="mb-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">No.</span>
                    <span className="text-lg font-bold text-[#0384d6]">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    {r.jenis_tendik || "-"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Unit: <span className="font-semibold">{r.unit_kerja || "-"}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {educationLevels.map((level) => (
                      <div
                        key={level}
                        className="bg-slate-50 rounded-md p-2 border border-slate-200"
                      >
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-1">
                          {level}
                        </p>
                        <p className="text-lg font-bold text-[#0384d6]">
                          {r[level] || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

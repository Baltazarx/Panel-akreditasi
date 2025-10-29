"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import Swal from 'sweetalert2';

// ============================================================
// 2B.3 PETA PEMENUHAN CPL (LAPORAN)
// ============================================================
export default function Pemetaan2B3({ role, refreshTrigger }) {
  const [data, setData] = useState({ semesters: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const canRead = roleCan(role, "pemetaan2b3", "R");

  const fetchData = async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await apiFetch("/pemetaan-2b3");
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan 2B.3:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.3', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    try {
      const response = await fetch('/api/pemetaan-2b3/export', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_2B3_Peta_Pemenuhan_CPL.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');
      } else {
        throw new Error('Gagal mengunduh file');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengexport data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger, canRead]);

  if (!canRead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">🗺️ Peta Pemenuhan CPL</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPL</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPMK</th>
                {data.semesters.map((sem) => (
                  <th key={sem} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    Semester {sem}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpl}</td>
                  <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                  {data.semesters.map((sem) => (
                    <td key={sem} className="px-4 py-3 text-slate-700 border border-slate-200 text-center">
                      {row.semester_map && row.semester_map[sem] && row.semester_map[sem].length > 0
                        ? row.semester_map[sem].join(", ")
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
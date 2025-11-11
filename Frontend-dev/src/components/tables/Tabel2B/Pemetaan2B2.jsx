"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import Swal from 'sweetalert2';

// ============================================================
// 2B.2 PEMETAAN CPL vs PL (MATRIX EDITABLE)
// ============================================================
export default function Pemetaan2B2({ role, refreshTrigger, onDataChange }) {
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b2", "R");
  const canUpdate = roleCan(role, "pemetaan2b2", "U");

  const fetchData = async () => {
    if (!canRead) return;
    setLoading(true);
    try {
      const result = await apiFetch("/pemetaan-2b2");
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan 2B.2:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.2', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (cplIndex, plCode, checked) => {
    if (!canUpdate) return;
    
    // Buat salinan state yang mendalam agar React mendeteksi perubahan
    const newData = {
      ...data,
      rows: data.rows.map((row, idx) => {
        if (idx === cplIndex) {
          return {
            ...row,
            row: {
              ...row.row,
              [plCode]: checked
            }
          };
        }
        return row;
      })
    };
    setData(newData);
  };

  const handleSave = async () => {
    if (!canUpdate) return;
    
    try {
      await apiFetch("/pemetaan-2b2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data.rows })
      });
      
      Swal.fire('Success', 'Data pemetaan berhasil disimpan', 'success');
      
      // Tunggu sebentar sebelum refresh untuk memastikan backend selesai memproses
      setTimeout(async () => {
        await fetchData(); // Refresh data untuk Pemetaan2B2
        if (onDataChange) onDataChange(); // Trigger refresh untuk tab lain
      }, 500);
    } catch (err) {
      console.error('Error saving Pemetaan2B2:', err);
      Swal.fire('Error', `Gagal menyimpan data pemetaan: ${err.message}`, 'error');
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    try {
      const response = await fetch('/api/pemetaan-2b2/export', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_2B2_Pemetaan_CPL_vs_PL.xlsx';
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
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPL vs Profil Lulusan</h2>
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              💾 Simpan Perubahan
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
          >
            📥 Export Excel
          </button>
        </div>
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
                {data.columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpl}</td>
                  {data.columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-center border border-slate-200">
                      {canUpdate ? (
                        <input
                          type="checkbox"
                          checked={row.row[col] || false}
                          onChange={(e) => handleCellChange(idx, col, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      ) : (
                        row.row[col] ? "✅" : ""
                      )}
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
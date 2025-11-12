"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';

// ============================================================
// PEMETAAN CPMK vs CPL (MATRIX EDITABLE)
// ============================================================
export default function PemetaanCpmkCpl({ role, refreshTrigger, onDataChange }) {
  const { authUser } = useAuth();
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaanCpmkCpl", "R");
  const canUpdate = roleCan(role, "pemetaanCpmkCpl", "U");

  // Cek role SuperAdmin
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
  
  // State untuk filter prodi
  const [selectedProdi, setSelectedProdi] = useState("");

  // Set selectedProdi untuk user prodi
  useEffect(() => {
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi) {
      // Superadmin: default ke "Semua Prodi" (empty string)
      setSelectedProdi("");
    }
  }, [isSuperAdmin, userProdiId, selectedProdi]);

  const fetchData = async () => {
    if (!canRead) return;
    setLoading(true);
    
    // Tambahkan query parameter jika filter aktif
    const queryParams = new URLSearchParams();
    // Jika user prodi, filter berdasarkan prodi mereka
    if (!isSuperAdmin && userProdiId) {
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi) {
      queryParams.append("id_unit_prodi", selectedProdi);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    try {
      const result = await apiFetch(`/pemetaan-cpmk-cpl${queryString}`);
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan CPMK vs CPL:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan CPMK vs CPL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (cpmkIndex, cplCode, checked) => {
    if (!canUpdate) return;
    
    // Buat salinan state yang mendalam
    const newData = {
      ...data,
      rows: data.rows.map((row, idx) => {
        if (idx === cpmkIndex) {
          return {
            ...row,
            row: {
              ...row.row,
              [cplCode]: checked
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
    
    // Tambahkan query parameter jika filter aktif
    const queryParams = new URLSearchParams();
    // Jika user prodi, filter berdasarkan prodi mereka
    if (!isSuperAdmin && userProdiId) {
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi) {
      queryParams.append("id_unit_prodi", selectedProdi);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    try {
      await apiFetch(`/pemetaan-cpmk-cpl${queryString}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data.rows })
      });
      
      Swal.fire('Success', 'Data pemetaan CPMK vs CPL berhasil disimpan', 'success');
      
      setTimeout(async () => {
        await fetchData(); // Refresh data
        if (onDataChange) onDataChange(); // Trigger refresh tab lain
      }, 500);
    } catch (err) {
      console.error('Error saving PemetaanCpmkCpl:', err);
      Swal.fire('Error', `Gagal menyimpan data pemetaan CPMK vs CPL: ${err.message}`, 'error');
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    // Tambahkan query parameter jika filter aktif
    const queryParams = new URLSearchParams();
    // Jika user prodi, filter berdasarkan prodi mereka
    if (!isSuperAdmin && userProdiId) {
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi) {
      queryParams.append("id_unit_prodi", selectedProdi);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    try {
      const response = await fetch(`/api/pemetaan-cpmk-cpl/export${queryString}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_Pemetaan_CPMK_vs_CPL.xlsx';
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
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin (bisa fetch tanpa filter atau dengan filter)
    if ((!isSuperAdmin && userProdiId) || isSuperAdmin) {
      fetchData();
    }
  }, [refreshTrigger, canRead, selectedProdi, isSuperAdmin, userProdiId]);

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
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPMK vs CPL</h2>
        <div className="flex items-center gap-3">
          {/* Tampilkan filter HANYA jika superadmin */}
          {isSuperAdmin && (
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
            >
              <option value="">Semua Prodi</option>
              <option value="4">Teknik Informatika (TI)</option>
              <option value="5">Manajemen Informatika (MI)</option>
            </select>
          )}
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
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPMK</th>
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
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpmk}</td>
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
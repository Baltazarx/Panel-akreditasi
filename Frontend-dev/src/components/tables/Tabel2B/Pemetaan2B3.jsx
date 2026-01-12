"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiChevronDown, FiBriefcase, FiDownload } from 'react-icons/fi';
import CplCRUD from './CplCRUD';

// ============================================================
// 2B.3 PETA PEMENUHAN CPL (LAPORAN)
// ============================================================
export default function Pemetaan2B3({ role, refreshTrigger, maps }) {
  const { authUser } = useAuth();
  const [data, setData] = useState({ semesters: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const canRead = roleCan(role, "pemetaan2b3", "R");

  // Cek role SuperAdmin
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole?.toLowerCase());

  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;

  // State untuk filter prodi
  const [selectedProdi, setSelectedProdi] = useState("");

  // Dropdown state for filter
  const [openProdiFilterDropdown, setOpenProdiFilterDropdown] = useState(false);

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

  // Close filter dropdown when value changes
  useEffect(() => {
    setOpenProdiFilterDropdown(false);
  }, [selectedProdi]);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openProdiFilterDropdown && !event.target.closest('.prodi-filter-dropdown-container') && !event.target.closest('.prodi-filter-dropdown-menu')) {
        setOpenProdiFilterDropdown(false);
      }
    };

    if (openProdiFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openProdiFilterDropdown]);

  const fetchData = async () => {
    if (!canRead) return;
    setLoading(true);

    // Tambahkan query parameter jika filter aktif
    const queryParams = new URLSearchParams();

    // Database sudah menggunakan ID yang benar (6=TI, 7=MI), tidak perlu mapping
    if (!isSuperAdmin && userProdiId) {
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi) {
      queryParams.append("id_unit_prodi", selectedProdi);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    try {
      const result = await apiFetch(`/pemetaan-2b3${queryString}`);
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
      setLoading(true);

      if (!data || !data.rows || data.rows.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];

      // Tambahkan header
      const headers = ['CPL', 'CPMK', ...data.semesters.map(sem => `Semester ${sem}`)];
      exportData.push(headers);

      // Tambahkan data rows
      data.rows.forEach((row) => {
        const rowData = [
          row.kode_cpl || '',
          row.kode_cpmk || '',
          ...data.semesters.map(sem => {
            if (row.semester_map && row.semester_map[sem] && row.semester_map[sem].length > 0) {
              return row.semester_map[sem].join(", ");
            }
            return '';
          })
        ];
        exportData.push(rowData);
      });

      // Import xlsx library
      let XLSX;
      try {
        XLSX = await import('xlsx');
      } catch (importErr) {
        console.warn('xlsx library tidak tersedia, menggunakan CSV fallback:', importErr);
        // Fallback ke CSV
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };

        const csvRows = exportData.map(row =>
          row.map(cell => escapeCsv(cell)).join(',')
        );
        const csvContent = '\ufeff' + csvRows.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tabel_2B3_Peta_Pemenuhan_CPL_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil diekspor ke CSV. File dapat dibuka di Excel.',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }

      // Buat workbook baru
      const wb = XLSX.utils.book_new();

      // Buat worksheet dari array data
      const ws = XLSX.utils.aoa_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 15 },  // CPL
        { wch: 15 },  // CPMK
        ...data.semesters.map(() => ({ wch: 30 })) // Semester columns
      ];
      ws['!cols'] = colWidths;

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Peta Pemenuhan CPL');

      // Generate file dan download
      const fileName = `Tabel_2B3_Peta_Pemenuhan_CPL_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

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
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">🗺️ Peta Pemenuhan CPL</h2>

        <div className="flex items-center gap-3">
          {/* Tampilkan filter HANYA jika superadmin */}
          {isSuperAdmin && (
            <div className="relative prodi-filter-dropdown-container" style={{ minWidth: '200px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenProdiFilterDropdown(!openProdiFilterDropdown);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedProdi
                  ? 'border-[#0384d6] bg-white text-black'
                  : 'border-gray-300 bg-white text-slate-700 hover:border-gray-400'
                  }`}
                aria-label="Pilih prodi"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                  <span className={`truncate ${selectedProdi ? 'text-black' : 'text-gray-500'}`}>
                    {selectedProdi === "6"
                      ? "Teknik Informatika (TI)"
                      : selectedProdi === "7"
                        ? "Manajemen Informatika (MI)"
                        : "Semua Prodi"}
                  </span>
                </div>
                <FiChevronDown
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openProdiFilterDropdown ? 'rotate-180' : ''
                    }`}
                  size={16}
                />
              </button>
              {openProdiFilterDropdown && (
                <div
                  className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto prodi-filter-dropdown-menu mt-1 w-full"
                  style={{ minWidth: '200px' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProdi("");
                      setOpenProdiFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedProdi === ""
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                    <span>Semua Prodi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProdi("6");
                      setOpenProdiFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedProdi === "6"
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                    <span>Teknik Informatika (TI)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProdi("7");
                      setOpenProdiFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedProdi === "7"
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                    <span>Manajemen Informatika (MI)</span>
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={loading || !data || !data.rows || data.rows.length === 0}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">CPL</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">CPMK</th>
                {data.semesters.length > 0 && (
                  <th colSpan={data.semesters.length} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Semester</th>
                )}
              </tr>
              <tr>
                {data.semesters.map((sem) => (
                  <th key={sem} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                    Semester {sem}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={2 + data.semesters.length} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan.</p>
                  </td>
                </tr>
              ) : (
                data.rows.map((row, idx) => (
                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                    <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200 text-center">{row.kode_cpl || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.kode_cpmk || "-"}</td>
                    {data.semesters.map((sem) => (
                      <td key={sem} className="px-4 py-3 text-slate-700 border border-slate-200 text-center">
                        {row.semester_map && row.semester_map[sem] && row.semester_map[sem].length > 0
                          ? row.semester_map[sem].join(", ")
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-slate-200 my-10"></div>

      <h2 className="text-lg font-semibold text-slate-800 mb-6">Referensi Data (Read Only)</h2>

      {/* === REFERENCE TABLES (READ ONLY) === */}
      <div className="mb-8 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider">Data CPL</h3>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">Read Only</span>
          </div>
          <CplCRUD role={role} maps={maps} onDataChange={() => { }} readOnly={true} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
"use client";



import React, { useEffect, useState } from "react";

import { apiFetch } from "../../../lib/api"; // Path disesuaikan

import { roleCan } from "../../../lib/role"; // Path disesuaikan

import { useAuth } from "../../../context/AuthContext";

import Swal from 'sweetalert2';
import { FiChevronDown, FiBriefcase, FiDownload } from 'react-icons/fi';
import MataKuliahCRUD from "./MataKuliahCRUD";
import ProfilLulusanCRUD from "./ProfilLulusanCRUD";



// ============================================================

// 2B.1 PEMETAAN MK vs PL (LAPORAN)

// ============================================================

export default function Pemetaan2B1({ role, refreshTrigger, maps }) {

  const { authUser } = useAuth();

  const [data, setData] = useState({ columns: [], data: [] });

  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b1", "R");



  // === BARU: Cek role SuperAdmin ===

  const userRole = authUser?.role || role;

  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());



  // Ambil id_unit_prodi dari authUser jika user adalah prodi user

  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;





  // === BARU: State untuk filter prodi ===

  // Asumsi ID: 4 = TI, 5 = MI. "" = Semua Prodi

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



    // === MODIFIKASI: Tambahkan query parameter jika filter aktif ===

    const queryParams = new URLSearchParams();

    // Jika user prodi, filter berdasarkan prodi mereka
    let fetchId = null;
    if (!isSuperAdmin && userProdiId) {
      const pid = String(userProdiId);
      if (pid === '6') fetchId = '4';
      else if (pid === '7') fetchId = '5';
      else fetchId = pid;
    } else if (isSuperAdmin && selectedProdi) {
      if (selectedProdi === '6') fetchId = '4';
      else if (selectedProdi === '7') fetchId = '5';
      else fetchId = selectedProdi;
    }

    if (fetchId) {
      queryParams.append("id_unit_prodi", fetchId);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // =========================================================



    try {

      // === MODIFIKASI: Kirim request dengan query string ===

      const result = await apiFetch(`/pemetaan-2b1${queryString}`);

      setData(result);

    } catch (err) {

      console.error("Error fetching pemetaan 2B.1:", err);

      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.1', 'error');

    } finally {

      setLoading(false);

    }

  };



  const handleExport = async () => {
    if (!canRead) return;

    try {
      setLoading(true);

      if (!data || !data.data || data.data.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];

      // Ubah PL- menjadi PL-TI- (kecuali yang sudah PL-MI-) untuk header export
      const displayColumns = data.columns.map(col =>
        col.startsWith('PL-') && !col.startsWith('PL-MI-')
          ? col.replace(/^PL-/, 'PL-TI-')
          : col
      );

      // Tambahkan header
      const headers = ['Kode MK', 'Nama MK', 'SKS', 'Semester', ...displayColumns];
      exportData.push(headers);

      // Tambahkan data rows
      data.data.forEach((row) => {
        const rowData = [
          row.kode_mk || '',
          row.nama_mk || '',
          row.sks || '',
          row.semester || '',
          ...data.columns.map(col => row.profil_lulusan && row.profil_lulusan[col] ? '✅' : '')
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
        a.download = `Tabel_2B1_Pemetaan_MK_vs_PL_${new Date().toISOString().split('T')[0]}.csv`;
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
        { wch: 15 },  // Kode MK
        { wch: 40 },  // Nama MK
        { wch: 8 },   // SKS
        { wch: 12 },  // Semester
        ...data.columns.map(() => ({ wch: 12 })) // Profil Lulusan columns
      ];
      ws['!cols'] = colWidths;

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Pemetaan MK vs PL');

      // Generate file dan download
      const fileName = `Tabel_2B1_Pemetaan_MK_vs_PL_${new Date().toISOString().split('T')[0]}.xlsx`;
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



  // === MODIFIKASI: Tambahkan selectedProdi dan userProdiId sebagai dependency ===

  useEffect(() => {

    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin (bisa fetch tanpa filter atau dengan filter)
    if ((!isSuperAdmin && userProdiId) || isSuperAdmin) {

      fetchData();

    }

  }, [refreshTrigger, canRead, selectedProdi, isSuperAdmin, userProdiId]);

  // === BARU: useEffect khusus untuk memastikan refresh ketika refreshTrigger berubah ===
  // Ini memastikan bahwa ketika data di 2B.2 disimpan, 2B.1 langsung refresh
  useEffect(() => {
    if (refreshTrigger > 0 && canRead) {
      // Hanya fetch jika kondisi terpenuhi
      if ((!isSuperAdmin && userProdiId) || isSuperAdmin) {
        // Force refresh dengan sedikit delay untuk memastikan backend selesai memproses
        const timer = setTimeout(() => {
          fetchData();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [refreshTrigger]);

  // =========================================================



  if (!canRead) {

    return (

      <div className="text-center py-8">

        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>

      </div>

    );

  }



  return (
    <div>
      {/* === TABLE PEMETAAN (MAPPING) - SEKARANG DI ATAS === */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Tabel Pemetaan (Mapping)</h2>

        {/* === Wrapper untuk filter dan tombol export === */}
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
            disabled={loading || !data || !data.data || data.data.length === 0}
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
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Kode MK</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Nama MK</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">SKS</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Semester</th>
                {data.columns.length > 0 && (
                  <th colSpan={data.columns.length} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Profil Lulusan</th>
                )}
              </tr>
              <tr>
                {data.columns.map((col) => {
                  // Ubah PL- menjadi PL-TI- (kecuali yang sudah PL-MI-)
                  const displayCol = col.startsWith('PL-') && !col.startsWith('PL-MI-')
                    ? col.replace(/^PL-/, 'PL-TI-')
                    : col;

                  return (
                    <th key={col} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                      {displayCol}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.data.length === 0 ? (
                <tr>
                  <td colSpan={4 + data.columns.length} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan.</p>
                  </td>
                </tr>
              ) : (
                data.data.map((row, idx) => (
                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                    <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200 text-center">{row.kode_mk || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.sks || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.semester || "-"}</td>
                    {data.columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-center border border-slate-200">
                        {row.profil_lulusan && row.profil_lulusan[col] ? "✅" : ""}
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

      {/* === REFERENCE TABLES (READ ONLY) - SEKARANG DI BAWAH & TANPA CARD === */}
      <div className="mb-8 space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider">Data Mata Kuliah</h3>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">Read Only</span>
          </div>
          <MataKuliahCRUD role={role} maps={maps} onDataChange={() => { }} readOnly={true} refreshTrigger={refreshTrigger} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-slate-700 uppercase tracking-wider">Data Profil Lulusan</h3>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200">Read Only</span>
          </div>
          <ProfilLulusanCRUD role={role} maps={maps} onDataChange={() => { }} readOnly={true} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>

  );

}
"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiChevronDown, FiBriefcase, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// ============================================================
// CPMK CRUD
// ============================================================
export default function CpmkCRUD({ role, maps, onDataChange, refreshTrigger = 0 }) {
  const { authUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm', 'ketua'].includes(userRole?.toLowerCase());

  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;



  // === PERBAIKAN: State filter menyimpan id_unit_prodi ===
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

  // Fetch CPMK data
  const fetchRows = async () => {
    setLoading(true);
    try {
      let url = "/cpmk";

      // Data CPMK sudah menggunakan ID yang benar: 6 = TI, 7 = MI
      // Tidak perlu mapping lagi

      if (!isSuperAdmin && userProdiId) {
        // User prodi login - fetch data mereka
        url += `?id_unit_prodi=${userProdiId}`;
      } else if (selectedProdi) {
        // Superadmin filter dropdown - gunakan ID yang dipilih
        url += `?id_unit_prodi=${selectedProdi}`;
      } else {
        // Superadmin memilih "Semua Prodi" - fetch TI dan MI
        url += "?id_unit_prodi_in=6,7";
      }

      console.log('Fetching CPMK from:', url);
      const result = await apiFetch(url);
      console.log('CPMK data received:', result);
      setRows(result);
    } catch (err) {
      console.error("Error fetching CPMK:", err);
      Swal.fire('Error', 'Gagal memuat data CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin dan selectedProdi sudah di-set (bisa empty string untuk "Semua Prodi")
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi !== null && selectedProdi !== undefined)) {
      fetchRows();
    }
  }, [selectedProdi, isSuperAdmin, userProdiId, refreshTrigger]); // Fetch ulang ketika filter berubah atau trigger refresh

  // Ekstrak Prodi dari maps untuk filter - HANYA Prodi TI (6) dan MI (7)
  const prodiList = Object.values(maps?.units || {})
    .filter(uk => uk.id_unit === 6 || uk.id_unit === 7)
    .map(uk => ({
      ...uk,
      // Override nama unit untuk dropdown dengan singkatan dalam kurung
      nama_unit: uk.id_unit === 6 ? 'Teknik Informatika (TI)' : uk.id_unit === 7 ? 'Manajemen Informatika (MI)' : uk.nama_unit
    }));

  // Helper function untuk mendapatkan nama prodi yang benar berdasarkan id_unit_prodi
  // Helper function untuk mendapatkan nama prodi yang benar berdasarkan id_unit_prodi
  const getProdiName = (id_unit_prodi) => {
    if (!id_unit_prodi) return '-';
    // Mapping ID backend (4, 5) dan frontend (6, 7)
    // 4 & 6 -> TI
    // 5 & 7 -> MI
    const id = parseInt(id_unit_prodi);

    if (id === 4 || id === 6) return 'Teknik Informatika ( TI )';
    if (id === 5 || id === 7) return 'Manajemen Informatika ( MI )';

    // Fallback ke nama dari prodiList jika ada
    const found = prodiList.find(p => p.id_unit === id);
    return found ? found.nama_unit : `Unit ${id}`;
  };

  // Ambil daftar MK dari maps
  const mkList = Object.values(maps?.mata_kuliah || {});

  // Fungsi export Excel
  const handleExport = async () => {
    try {
      if (!rows || rows.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];

      // Tambahkan header
      const headers = ['ID', 'Kode CPMK', 'Deskripsi', 'Unit Prodi', 'Mata Kuliah'];
      exportData.push(headers);

      // Tambahkan data rows
      rows.forEach((row) => {
        const rowData = [
          row.id_cpmk || '',
          row.kode_cpmk || '',
          row.deskripsi_cpmk || '',
          getProdiName(row.id_unit_prodi) || '',
          row.nama_mk || ''
        ];
        exportData.push(rowData);
      });

      // Buat workbook baru
      const wb = XLSX.utils.book_new();

      // Buat worksheet dari array data
      const ws = XLSX.utils.aoa_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 8 },   // ID
        { wch: 15 },  // Kode CPMK
        { wch: 50 },  // Deskripsi
        { wch: 20 },  // Unit Prodi
        { wch: 30 }   // Mata Kuliah
      ];
      ws['!cols'] = colWidths;

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'CPMK');

      // Generate file dan download
      const fileName = `Data_CPMK_${new Date().toISOString().split('T')[0]}.xlsx`;
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

      // Fallback ke CSV jika xlsx gagal
      try {
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };

        const csvRows = [
          ['ID', 'Kode CPMK', 'Deskripsi', 'Unit Prodi', 'Mata Kuliah'],
          ...rows.map(row => [
            row.id_cpmk || '',
            row.kode_cpmk || '',
            row.deskripsi_cpmk || '',
            getProdiName(row.id_unit_prodi) || '',
            row.nama_mk || ''
          ])
        ].map(row => row.map(cell => escapeCsv(cell)).join(','));

        const csvContent = '\ufeff' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Data_CPMK_${new Date().toISOString().split('T')[0]}.csv`;
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
      } catch (csvErr) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengekspor data',
          text: err.message || 'Terjadi kesalahan saat mengekspor data.'
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={loading || !rows || rows.length === 0}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>

          {/* === Dropdown filter hanya untuk superadmin === */}
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
                    {selectedProdi
                      ? (() => {
                        const found = prodiList.find((p) => String(p.id_unit) === String(selectedProdi));
                        return found ? found.nama_unit : selectedProdi;
                      })()
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
                  {prodiList.map(prodi => (
                    <button
                      key={prodi.id_unit}
                      type="button"
                      onClick={() => {
                        setSelectedProdi(String(prodi.id_unit));
                        setOpenProdiFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedProdi === String(prodi.id_unit)
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                      <span>{prodi.nama_unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Info */}
      <div className="mb-3 text-sm text-slate-600">
        Menampilkan {rows.length} CPMK
        {selectedProdi && ` untuk ${prodiList.find(p => p.id_unit == selectedProdi)?.nama_unit || 'Prodi Terpilih'}`}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Kode CPMK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Mata Kuliah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={row.id_cpmk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{getProdiName(row.id_unit_prodi)}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
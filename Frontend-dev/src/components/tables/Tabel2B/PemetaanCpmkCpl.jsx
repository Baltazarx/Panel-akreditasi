"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiChevronDown, FiBriefcase, FiDownload } from 'react-icons/fi';

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

  // Ambil id_unit_prodi dari authUser (ini adalah id_unit_prodi untuk user prodi)
  // Fix: Gunakan fallback yang sama dengan komponen lain
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit || authUser?.id_unit;

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

    // Tentukan id_unit_prodi yang akan digunakan
    let targetProdiId = null;

    if (!isSuperAdmin) {
      // User prodi: gunakan id_unit_prodi dari authUser
      if (!userProdiId) {
        Swal.fire({
          icon: 'error',
          title: 'Unit/Prodi Tidak Ditemukan',
          html: `
            <p>Unit/Prodi tidak ditemukan dari data user Anda.</p>
            <p><strong>Solusi:</strong></p>
            <ol style="text-align: left; margin: 10px 0;">
              <li>Pastikan akun Anda memiliki Unit/Prodi di database</li>
              <li>Silakan <strong>logout</strong> dan <strong>login ulang</strong> untuk mendapatkan token baru</li>
              <li>Jika masih error, hubungi administrator untuk memastikan akun Anda memiliki Unit/Prodi</li>
            </ol>
          `,
          confirmButtonText: 'Mengerti'
        });
        return;
      }
      targetProdiId = userProdiId;
    } else {
      // Superadmin: harus memilih prodi di dropdown untuk bisa save
      if (!selectedProdi) {
        Swal.fire({
          icon: 'warning',
          title: 'Pilih Prodi Terlebih Dahulu',
          text: 'Silakan pilih Prodi di dropdown sebelum menyimpan data. Mode "Semua Prodi" hanya untuk melihat.',
          confirmButtonText: 'Mengerti'
        });
        return;
      }
      targetProdiId = selectedProdi;
    }

    // Map ID frontend (6/7) ke backend (4/5) untuk save
    let saveId = String(targetProdiId);
    if (saveId === '6') saveId = '4';
    else if (saveId === '7') saveId = '5';

    // Query parameter untuk filter (opsional, untuk konsistensi dengan fetch)
    const queryParams = new URLSearchParams();
    if (saveId) {
      queryParams.append("id_unit_prodi", saveId);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // Body request: kirim id_unit_prodi untuk semua user (backend akan menggunakan ini jika ada)
    const requestBody = {
      rows: data.rows
    };

    // Selalu kirim id_unit_prodi di body request jika ada targetProdiId
    if (saveId) {
      requestBody.id_unit_prodi = Number(saveId);
    }

    try {
      // Validasi: pastikan ada data rows yang akan disimpan
      if (!requestBody.rows || requestBody.rows.length === 0) {
        Swal.fire('Warning', 'Tidak ada data untuk disimpan', 'warning');
        return;
      }

      await apiFetch(`/pemetaan-cpmk-cpl${queryString}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      Swal.fire('Success', 'Data pemetaan CPMK vs CPL berhasil disimpan', 'success');

      // Trigger refresh untuk tab lain SEBELUM menampilkan success message
      if (onDataChange) {
        onDataChange(); // Trigger refresh untuk Pemetaan2B1, Pemetaan2B3, dll
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error saving PemetaanCpmkCpl:', err);
      const errorMessage = err.response?.error || err.message || 'Gagal menyimpan data pemetaan';
      Swal.fire('Error', errorMessage, 'error');
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

      // Ubah CPL- menjadi CPL-TI- (kecuali yang sudah CPL-MI-) untuk header export
      const displayColumns = data.columns.map(col =>
        col.startsWith('CPL-') && !col.startsWith('CPL-MI-')
          ? col.replace(/^CPL-/, 'CPL-TI-')
          : col
      );

      // Tambahkan header
      const headers = ['CPMK', ...displayColumns];
      exportData.push(headers);

      // Tambahkan data rows
      data.rows.forEach((row) => {
        const rowData = [
          row.kode_cpmk || '',
          ...data.columns.map(col => row.row && row.row[col] ? '✅' : '')
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
        a.download = `Tabel_Pemetaan_CPMK_vs_CPL_${new Date().toISOString().split('T')[0]}.csv`;
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
        { wch: 15 },  // CPMK
        ...data.columns.map(() => ({ wch: 12 })) // CPL columns
      ];
      ws['!cols'] = colWidths;

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Pemetaan CPMK vs CPL');

      // Generate file dan download
      const fileName = `Tabel_Pemetaan_CPMK_vs_CPL_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPMK vs CPL</h2>
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
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">CPMK</th>
                {data.columns.map((col) => {
                  // Ubah CPL- menjadi CPL-TI- (kecuali yang sudah CPL-MI-)
                  const displayCol = col.startsWith('CPL-') && !col.startsWith('CPL-MI-')
                    ? col.replace(/^CPL-/, 'CPL-TI-')
                    : col;

                  return (
                    <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white text-center">
                      {displayCol}
                    </th>
                  );
                })}
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
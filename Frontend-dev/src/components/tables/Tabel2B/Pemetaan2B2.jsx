"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiChevronDown, FiBriefcase } from 'react-icons/fi';

// ============================================================
// 2B.2 PEMETAAN CPL vs PL (MATRIX EDITABLE)
// ============================================================
export default function Pemetaan2B2({ role, refreshTrigger, onDataChange }) {
  const { authUser } = useAuth();
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b2", "R");
  const canUpdate = roleCan(role, "pemetaan2b2", "U");

  // Cek role SuperAdmin
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.id_unit || authUser?.unit;
  
  // State untuk filter prodi
  const [selectedProdi, setSelectedProdi] = useState("");
  
  // Dropdown state for filter
  const [openProdiFilterDropdown, setOpenProdiFilterDropdown] = useState(false);

  // Set selectedProdi untuk user prodi atau default untuk superadmin
  useEffect(() => {
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi) {
      // Superadmin: default ke "Semua Prodi"
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
    
    // Tambahkan query parameter untuk filter prodi
    const queryParams = new URLSearchParams();
    if (!isSuperAdmin && userProdiId) {
      // User prodi: filter berdasarkan prodi mereka
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi && selectedProdi !== "") {
      // Superadmin: filter berdasarkan prodi yang dipilih di dropdown
      // Hanya kirim query parameter jika bukan "Semua Prodi" (empty string)
      queryParams.append("id_unit_prodi", selectedProdi);
    }
    // Jika superadmin memilih "Semua Prodi" (empty string), tidak kirim query parameter
    // Backend akan menggunakan req.user.id_unit_prodi dari token
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    try {
      const result = await apiFetch(`/pemetaan-2b2${queryString}`);
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
    
    // Validasi: Pastikan id_unit_prodi tersedia
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
      // Superadmin: gunakan prodi yang dipilih di dropdown
      // Jika "Semua Prodi" dipilih, tidak bisa save (harus pilih prodi spesifik)
      if (!selectedProdi) {
        Swal.fire({
          icon: 'warning',
          title: 'Pilih Prodi Terlebih Dahulu',
          text: 'Silakan pilih Prodi spesifik (TI atau MI) di dropdown sebelum menyimpan data. Opsi "Semua Prodi" hanya untuk melihat data.',
          confirmButtonText: 'Mengerti'
        });
        return;
      }
      targetProdiId = selectedProdi;
    }
    
    // Query parameter untuk filter
    const queryParams = new URLSearchParams();
    queryParams.append("id_unit_prodi", String(targetProdiId));
    const queryString = `?${queryParams.toString()}`;
    
    // Body request
    const requestBody = {
      rows: data.rows,
      id_unit_prodi: Number(targetProdiId)
    };
    
    try {
      // Validasi: pastikan ada data rows yang akan disimpan
      if (!requestBody.rows || requestBody.rows.length === 0) {
        Swal.fire('Warning', 'Tidak ada data untuk disimpan', 'warning');
        return;
      }
      
      // Validasi: pastikan setiap row memiliki kode_cpl dan row
      const invalidRows = requestBody.rows.filter(row => !row.kode_cpl || !row.row);
      if (invalidRows.length > 0) {
        console.error('Invalid rows:', invalidRows);
        Swal.fire('Error', 'Format data tidak valid. Pastikan setiap baris memiliki kode_cpl dan row.', 'error');
        return;
      }
      
      await apiFetch(`/pemetaan-2b2${queryString}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      
      // Trigger refresh untuk tab lain (terutama 2B.1)
      if (onDataChange) {
        onDataChange();
      }
      
      // Refresh data
      await fetchData();
      
      Swal.fire('Success', 'Data pemetaan berhasil disimpan. Tabel 2B.1 akan otomatis ter-update.', 'success');
    } catch (err) {
      console.error('Error saving Pemetaan2B2:', err);
      const errorMessage = err.response?.error || err.message || 'Gagal menyimpan data pemetaan';
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    // Tambahkan query parameter jika filter aktif
    const queryParams = new URLSearchParams();
    if (!isSuperAdmin && userProdiId) {
      queryParams.append("id_unit_prodi", String(userProdiId));
    } else if (isSuperAdmin && selectedProdi) {
      queryParams.append("id_unit_prodi", selectedProdi);
    }
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    try {
      const response = await fetch(`/api/pemetaan-2b2/export${queryString}`, {
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
    // Fetch data ketika selectedProdi berubah atau refreshTrigger berubah
    // Untuk superadmin, fetch data jika selectedProdi sudah di-set (termasuk empty string untuk "Semua Prodi")
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi !== null && selectedProdi !== undefined)) {
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
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPL vs Profil Lulusan</h2>
          {!isSuperAdmin && userProdiId && (
            <p className="text-sm text-slate-600 mt-1">
              Prodi: {userProdiId === "4" || userProdiId === 4 ? "Teknik Informatika (TI)" : userProdiId === "5" || userProdiId === 5 ? "Manajemen Informatika (MI)" : userProdiId}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Tampilkan dropdown HANYA jika superadmin */}
          {isSuperAdmin && (
            <div className="relative prodi-filter-dropdown-container" style={{ minWidth: '200px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenProdiFilterDropdown(!openProdiFilterDropdown);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                  selectedProdi 
                    ? 'border-[#0384d6] bg-white text-black' 
                    : 'border-gray-300 bg-white text-slate-700 hover:border-gray-400'
                }`}
                aria-label="Pilih prodi"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                  <span className={`truncate ${selectedProdi ? 'text-black' : 'text-gray-500'}`}>
                    {selectedProdi === "4" 
                      ? "Teknik Informatika (TI)"
                      : selectedProdi === "5"
                      ? "Manajemen Informatika (MI)"
                      : "Semua Prodi"}
                  </span>
                </div>
                <FiChevronDown 
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openProdiFilterDropdown ? 'rotate-180' : ''
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
                      // fetchData akan dipanggil otomatis oleh useEffect ketika selectedProdi berubah
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                      selectedProdi === ""
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
                      setSelectedProdi("4");
                      setOpenProdiFilterDropdown(false);
                      // fetchData akan dipanggil otomatis oleh useEffect ketika selectedProdi berubah
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                      selectedProdi === "4"
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
                      setSelectedProdi("5");
                      setOpenProdiFilterDropdown(false);
                      // fetchData akan dipanggil otomatis oleh useEffect ketika selectedProdi berubah
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                      selectedProdi === "5"
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
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">CPL</th>
                {data.columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white text-center">
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
      
      {/* Peringatan untuk superadmin jika belum memilih prodi */}
      {isSuperAdmin && !selectedProdi && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 font-medium">
              Peringatan: Mode "Semua Prodi" hanya untuk melihat data. Jika ingin mencentang checkbox atau menyimpan data, silakan pilih Prodi spesifik (TI atau MI) di menu dropdown di atas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

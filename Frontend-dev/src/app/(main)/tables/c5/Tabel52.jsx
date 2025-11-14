"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus } from 'react-icons/fi';

const ENDPOINT = "/tabel-5-2-sarpras-pendidikan";
const TABLE_KEY = "tabel_5_2_sarpras_pendidikan";
const LABEL = "Tabel 5.2 Sarana dan Prasarana Pendidikan";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser }) {
  const [form, setForm] = useState({
    nama_sarpras: "",
    daya_tampung: "",
    luas_ruang_m2: "",
    kepemilikan: "",
    lisensi: "",
    perangkat_detail: "",
    link_bukti: ""
  });

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          nama_sarpras: initialData.nama_sarpras || "",
          daya_tampung: initialData.daya_tampung || "",
          luas_ruang_m2: initialData.luas_ruang_m2 || "",
          kepemilikan: initialData.kepemilikan || "",
          lisensi: initialData.lisensi || "",
          perangkat_detail: initialData.perangkat_detail || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        setForm({
          nama_sarpras: "",
          daya_tampung: "",
          luas_ruang_m2: "",
          kepemilikan: "",
          lisensi: "",
          perangkat_detail: "",
          link_bukti: ""
        });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sarana dan Prasarana Pendidikan" : "Tambah Sarana dan Prasarana Pendidikan"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Sarana dan Prasarana Pendidikan sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nama Prasarana */}
          <div>
            <label htmlFor="nama_sarpras" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Prasarana <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama_sarpras"
              value={form.nama_sarpras}
              onChange={(e) => handleChange("nama_sarpras", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Nama prasarana..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daya Tampung */}
            <div>
              <label htmlFor="daya_tampung" className="block text-sm font-medium text-slate-700 mb-1">
                Daya Tampung
              </label>
              <input
                type="number"
                id="daya_tampung"
                value={form.daya_tampung}
                onChange={(e) => handleChange("daya_tampung", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Jumlah daya tampung..."
                min="0"
              />
            </div>

            {/* Luas Ruang (m²) */}
            <div>
              <label htmlFor="luas_ruang_m2" className="block text-sm font-medium text-slate-700 mb-1">
                Luas Ruang (m²)
              </label>
              <input
                type="number"
                id="luas_ruang_m2"
                value={form.luas_ruang_m2}
                onChange={(e) => handleChange("luas_ruang_m2", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Luas dalam m²..."
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kepemilikan */}
            <div>
              <label htmlFor="kepemilikan" className="block text-sm font-medium text-slate-700 mb-1">
                Milik Sendiri (M)/Sewa (W)
              </label>
              <select
                id="kepemilikan"
                value={form.kepemilikan}
                onChange={(e) => handleChange("kepemilikan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              >
                <option value="">-- Pilih Kepemilikan --</option>
                <option value="M">Milik Sendiri (M)</option>
                <option value="W">Sewa (W)</option>
              </select>
            </div>

            {/* Lisensi */}
            <div>
              <label htmlFor="lisensi" className="block text-sm font-medium text-slate-700 mb-1">
                Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)
              </label>
              <select
                id="lisensi"
                value={form.lisensi}
                onChange={(e) => handleChange("lisensi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              >
                <option value="">-- Pilih Lisensi --</option>
                <option value="L">Berlisensi (L)</option>
                <option value="P">Public Domain (P)</option>
                <option value="T">Tidak Berlisensi (T)</option>
              </select>
            </div>
          </div>

          {/* Perangkat */}
          <div>
            <label htmlFor="perangkat_detail" className="block text-sm font-medium text-slate-700 mb-1">
              Perangkat
            </label>
            <textarea
              id="perangkat_detail"
              value={form.perangkat_detail}
              onChange={(e) => handleChange("perangkat_detail", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Detail perangkat..."
              rows="3"
            />
          </div>

          {/* Link Bukti */}
          <div>
            <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">
              Link Bukti
            </label>
            <input
              type="url"
              id="link_bukti"
              value={form.link_bukti}
              onChange={(e) => handleChange("link_bukti", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#043975] to-[#0384d6] text-white hover:opacity-90 transition-opacity font-medium"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tabel52({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);
  
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  const canHardDelete = roleCan(role, TABLE_KEY, "H");
  
  // Fetch data
  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      let url = ENDPOINT;
      if (showDeleted) {
        url += "?include_deleted=1";
      }
      const data = await apiFetch(url);
      setRows(Array.isArray(data) ? data : (data.items || []));
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [showDeleted]);

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container') && !event.target.closest('.fixed')) {
        setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdownId]);

  // Handle save (create/update)
  const handleSave = async (formData) => {
    try {
      if (editData) {
        await apiFetch(`${ENDPOINT}/${editData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Sarana dan Prasarana Pendidikan berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Sarana dan Prasarana Pendidikan berhasil ditambahkan.', 'success');
      }
      setShowForm(false);
      setEditData(null);
      fetchRows();
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal menyimpan data", 'error');
    }
  };

  // Handle delete
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan dihapus (soft delete).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}`, { method: 'DELETE' });
        Swal.fire('Berhasil!', 'Data berhasil dihapus.', 'success');
        fetchRows();
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle restore
  const handleRestore = async (row) => {
    try {
      await apiFetch(`${ENDPOINT}/${row.id}/restore`, { method: 'POST' });
      Swal.fire('Berhasil!', 'Data berhasil dipulihkan.', 'success');
      fetchRows();
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal memulihkan data", 'error');
    }
  };

  // Handle hard delete
  const handleHardDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: 'DELETE' });
        Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        fetchRows();
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${ENDPOINT}/export`, {
        credentials: 'include',
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tabel_5_2_Sarpras_Pendidikan.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Swal.fire('Berhasil!', 'Data berhasil diekspor.', 'success');
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal mengekspor data", 'error');
    }
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    if (showDeleted) {
      return rows.filter(r => r.deleted_at);
    }
    return rows.filter(r => !r.deleted_at);
  }, [rows, showDeleted]);

  // Helper function untuk format kepemilikan
  const formatKepemilikan = (kepemilikan) => {
    if (kepemilikan === 'M') return 'Milik Sendiri (M)';
    if (kepemilikan === 'W') return 'Sewa (W)';
    return kepemilikan || '-';
  };

  // Helper function untuk format lisensi
  const formatLisensi = (lisensi) => {
    if (lisensi === 'L') return 'Berlisensi (L)';
    if (lisensi === 'P') return 'Public Domain (P)';
    if (lisensi === 'T') return 'Tidak Berlisensi (T)';
    return lisensi || '-';
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Sarana dan Prasarana Pendidikan untuk tabel 5.2.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowDeleted(false)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data aktif"
            >
              Data
            </button>
            <button
              onClick={() => setShowDeleted(true)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data terhapus"
            >
              Data Terhapus
            </button>
          </div>

          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${filteredRows.length} baris`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors flex items-center gap-2"
            >
              <FiPlus size={18} />
              Tambah Data
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownload size={18} />
            Export Excel
          </button>
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
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Nama Prasarana</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Daya Tampung</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Luas Ruang (m²)</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Milik Sendiri (M)/Sewa (W)</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T)</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Perangkat</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={(canUpdate || canDelete) ? 9 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={(canUpdate || canDelete) ? 9 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((r, i) => {
                const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                const isDeleted = r.deleted_at;
                
                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_sarpras || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.daya_tampung || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.luas_ruang_m2 || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatKepemilikan(r.kepemilikan)}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatLisensi(r.lisensi)}</td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                      <div className="truncate" title={r.perangkat_detail || ""}>
                        {r.perangkat_detail || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">
                      {r.link_bukti ? (
                        <a 
                          href={r.link_bukti} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#0384d6] underline hover:text-[#043975]"
                        >
                          Lihat
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    {(canUpdate || canDelete) && (
                      <td className="px-6 py-4 border border-slate-200">
                        <div className="flex items-center justify-center dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownId !== rowId) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownWidth = 192;
                                setDropdownPosition({
                                  top: rect.bottom + 4,
                                  left: Math.max(8, rect.right - dropdownWidth)
                                });
                                setOpenDropdownId(rowId);
                              } else {
                                setOpenDropdownId(null);
                              }
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                            aria-label="Menu aksi"
                            aria-expanded={openDropdownId === rowId}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : r.id || idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        const isDeleted = currentRow.deleted_at;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditData(currentRow);
                  setShowForm(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label="Edit data"
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label="Hapus data"
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label="Pulihkan data"
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canHardDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label="Hapus permanen data"
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal Form */}
      <ModalForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSave={handleSave}
        initialData={editData}
        maps={maps}
        authUser={authUser}
      />
    </div>
  );
}


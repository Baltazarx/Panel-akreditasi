"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiSave } from 'react-icons/fi';

const ENDPOINT = "/tabel-6-kesesuaian-visi-misi";
const TABLE_KEY = "tabel_6_kesesuaian_visi_misi";
const LABEL = "Tabel 6. Kesesuaian Visi Misi";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedProdi, isSuperAdmin }) {
  const [form, setForm] = useState({
    id_unit_prodi: "",
    visi_pt: "",
    visi_upps: "",
    visi_keilmuan_ps: "",
    misi_pt: "",
    misi_upps: "",
    link_bukti: ""
  });

  const [prodiList, setProdiList] = useState([]);

  // Fetch prodi list
  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const data = await apiFetch("/unit-kerja");
        const list = Array.isArray(data) ? data : [];
        // Filter hanya TI (4) dan MI (5)
        const filtered = list.filter(uk => uk.id_unit === 4 || uk.id_unit === 5);
        setProdiList(filtered.sort((a, b) => a.id_unit - b.id_unit));
      } catch (err) {
        console.error("Error fetching prodi:", err);
        setProdiList([]);
      }
    };
    if (isOpen) fetchProdi();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          id_unit_prodi: initialData.id_unit_prodi || "",
          visi_pt: initialData.visi_pt || "",
          visi_upps: initialData.visi_upps || "",
          visi_keilmuan_ps: initialData.visi_keilmuan_ps || "",
          misi_pt: initialData.misi_pt || "",
          misi_upps: initialData.misi_upps || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        // Tambah data baru: untuk superadmin, set dari selectedProdi
        setForm({
          id_unit_prodi: (isSuperAdmin && selectedProdi) ? String(selectedProdi) : "",
          visi_pt: "",
          visi_upps: "",
          visi_keilmuan_ps: "",
          misi_pt: "",
          misi_upps: "",
          link_bukti: ""
        });
      }
    }
  }, [initialData, isOpen, selectedProdi, isSuperAdmin]);

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Kesesuaian Visi Misi" : "Tambah Kesesuaian Visi Misi"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Kesesuaian Visi Misi sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Program Studi */}
          <div>
            <label htmlFor="id_unit_prodi" className="block text-sm font-medium text-slate-700 mb-1">
              Program Studi <span className="text-red-500">*</span>
            </label>
            <select
              id="id_unit_prodi"
              value={form.id_unit_prodi}
              onChange={(e) => handleChange("id_unit_prodi", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={!!initialData || (isSuperAdmin && !initialData)}
            >
              <option value="">-- Pilih Program Studi --</option>
              {prodiList.map((p) => (
                <option key={p.id_unit} value={p.id_unit}>
                  {p.nama_unit || p.nama || p.id_unit}
                </option>
              ))}
            </select>
            {initialData && (
              <p className="mt-1 text-xs text-slate-500">Program Studi tidak dapat diubah setelah data dibuat.</p>
            )}
            {isSuperAdmin && !initialData && (
              <p className="mt-1 text-xs text-slate-500">Program Studi sudah dipilih dari dropdown filter di atas.</p>
            )}
          </div>

          {/* Visi Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Visi</h3>
            
            <div>
              <label htmlFor="visi_pt" className="block text-sm font-medium text-slate-700 mb-1">
                Visi PT
              </label>
              <textarea
                id="visi_pt"
                value={form.visi_pt}
                onChange={(e) => handleChange("visi_pt", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Perguruan Tinggi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="visi_upps" className="block text-sm font-medium text-slate-700 mb-1">
                Visi UPPS
              </label>
              <textarea
                id="visi_upps"
                value={form.visi_upps}
                onChange={(e) => handleChange("visi_upps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Unit Pengelola Program Studi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="visi_keilmuan_ps" className="block text-sm font-medium text-slate-700 mb-1">
                Visi Keilmuan PS
              </label>
              <textarea
                id="visi_keilmuan_ps"
                value={form.visi_keilmuan_ps}
                onChange={(e) => handleChange("visi_keilmuan_ps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Keilmuan Program Studi..."
                rows="3"
              />
            </div>
          </div>

          {/* Misi Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Misi</h3>
            
            <div>
              <label htmlFor="misi_pt" className="block text-sm font-medium text-slate-700 mb-1">
                Misi PT
              </label>
              <textarea
                id="misi_pt"
                value={form.misi_pt}
                onChange={(e) => handleChange("misi_pt", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Misi Perguruan Tinggi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="misi_upps" className="block text-sm font-medium text-slate-700 mb-1">
                Misi UPPS
              </label>
              <textarea
                id="misi_upps"
                value={form.misi_upps}
                onChange={(e) => handleChange("misi_upps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Misi Unit Pengelola Program Studi..."
                rows="3"
              />
            </div>
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

export default function Tabel6({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);
  
  const [rows, setRows] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit || authUser?.id_unit;
  
  // State filter menyimpan id_unit_prodi
  const [selectedProdi, setSelectedProdi] = useState("");
  
  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  const canHardDelete = roleCan(role, TABLE_KEY, "H");
  
  // Ekstrak Prodi dari maps untuk filter - hanya TI dan MI
  const prodiList = Object.values(maps?.units || {})
    .filter(uk => uk.id_unit === 4 || uk.id_unit === 5) // Hanya TI (4) dan MI (5)
    .sort((a, b) => a.id_unit - b.id_unit); // Sort berdasarkan id_unit (TI dulu, lalu MI)
  
  // Set selectedProdi untuk user prodi
  useEffect(() => {
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi && prodiList.length > 0) {
      // Superadmin: default ke Prodi TI (id_unit = 4)
      setSelectedProdi(String(prodiList[0].id_unit));
    }
  }, [isSuperAdmin, userProdiId, selectedProdi, prodiList]);
  
  // Fetch data
  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      let url = ENDPOINT;
      
      // Build query parameters
      const params = [];
      if (showDeleted) {
        params.push("include_deleted=1");
      }
      
      // Filter berdasarkan prodi
      if (!isSuperAdmin && userProdiId) {
        // User prodi: selalu filter berdasarkan prodi mereka
        params.push(`id_unit_prodi=${userProdiId}`);
      } else if (selectedProdi) {
        // Superadmin memilih prodi tertentu
        params.push(`id_unit_prodi=${selectedProdi}`);
      }
      
      if (params.length > 0) {
        url += "?" + params.join("&");
      }
      
      const data = await apiFetch(url);
      const dataArray = Array.isArray(data) ? data : (data.items || []);
      setRows(dataArray);
      
      // Set current data berdasarkan filter
      if (dataArray.length > 0) {
        if (selectedProdi) {
          // Jika ada filter prodi, tampilkan data prodi yang dipilih
          const filteredData = dataArray.find(r => String(r.id_unit_prodi) === String(selectedProdi) && !r.deleted_at);
          setCurrentData(filteredData || dataArray.find(r => !r.deleted_at) || dataArray[0]);
        } else if (!isSuperAdmin && userProdiId) {
          // User prodi: tampilkan data prodi mereka
          const userData = dataArray.find(r => String(r.id_unit_prodi) === String(userProdiId) && !r.deleted_at);
          setCurrentData(userData || dataArray.find(r => !r.deleted_at) || dataArray[0]);
        } else {
          // Fallback: tampilkan data pertama
          setCurrentData(dataArray.find(r => !r.deleted_at) || dataArray[0]);
        }
      } else {
        setCurrentData(null);
      }
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin dan selectedProdi sudah di-set
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi)) {
      fetchRows();
    }
  }, [showDeleted, selectedProdi, isSuperAdmin, userProdiId]);

  // Handle save (create/update)
  const handleSave = async (formData) => {
    try {
      if (editData) {
        await apiFetch(`${ENDPOINT}/${editData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Kesesuaian Visi Misi berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Kesesuaian Visi Misi berhasil ditambahkan.', 'success');
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
      a.download = `Tabel_6_Kesesuaian_Visi_Misi.xlsx`;
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

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Kesesuaian Visi Misi untuk tabel 6.
          </p>
          {!loading && currentData && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Prodi: <span className="ml-1 text-[#0384d6] font-bold text-base">{currentData.nama_prodi || "-"}</span>
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

           {/* Dropdown filter hanya untuk superadmin */}
           {isSuperAdmin && (
             <select
               value={selectedProdi}
               onChange={(e) => setSelectedProdi(e.target.value)}
               className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
             >
               {prodiList.map(prodi => (
                 <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
               ))}
             </select>
           )}

           <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
             {loading ? "Memuat..." : `${filteredRows.length} data`}
             {selectedProdi && ` - ${prodiList.find(p => p.id_unit == selectedProdi)?.nama_unit || 'Prodi Terpilih'}`}
           </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && !currentData && (
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
          {canUpdate && currentData && !currentData.deleted_at && (
            <button
              onClick={() => {
                setEditData(currentData);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors flex items-center gap-2"
            >
              <FiEdit2 size={18} />
              Edit Data
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

      {/* Table - Struktur Khusus sesuai Gambar */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            {/* Row 1: Header Visi */}
            <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Visi PT</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Visi UPPS</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Visi Keilmuan PS</th>
            </tr>
            
            {/* Row 2: Data Visi */}
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-16 text-center text-slate-500 border border-slate-200 bg-white">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : currentData ? (
              <tr className="transition-colors bg-white hover:bg-[#eaf4ff]">
                <td className="px-6 py-4 border border-slate-200 text-slate-700">{currentData.visi_pt || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-slate-700">{currentData.visi_upps || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-slate-700">{currentData.visi_keilmuan_ps || "-"}</td>
              </tr>
            ) : (
              <tr className="bg-white">
                <td colSpan="3" className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            )}

            {/* Row 3: Header Misi */}
            <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Misi PT</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Misi UPPS</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white"></th>
            </tr>
            
            {/* Row 4: Data Misi */}
            {loading ? (
              <tr>
                <td colSpan="3" className="px-6 py-16 text-center text-slate-500 border border-slate-200 bg-slate-50">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : currentData ? (
              <tr className="transition-colors bg-slate-50 hover:bg-[#eaf4ff]">
                <td className="px-6 py-4 border border-slate-200 text-slate-700">{currentData.misi_pt || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-slate-700">{currentData.misi_upps || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-slate-700">
                  {currentData.link_bukti ? (
                    <a 
                      href={currentData.link_bukti} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[#0384d6] underline hover:text-[#043975]"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ) : (
              <tr className="bg-slate-50">
                <td colSpan="3" className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
        selectedProdi={selectedProdi}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}


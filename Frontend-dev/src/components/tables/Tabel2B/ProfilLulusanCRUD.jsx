"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import Swal from 'sweetalert2';

// ============================================================
// PROFIL LULUSAN CRUD
// ============================================================
export default function ProfilLulusanCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // === PERBAIKAN: State filter menyimpan id_unit_prodi ===
  const [selectedProdi, setSelectedProdi] = useState(""); 

  const [formState, setFormState] = useState({
    kode_pl: "",
    deskripsi: "", // Frontend kirim 'deskripsi'
    id_unit_prodi: ""
  });

  const canCreate = roleCan(role, "profil_lulusan", "C");
  const canUpdate = roleCan(role, "profil_lulusan", "U");
  const canDelete = roleCan(role, "profil_lulusan", "D");
  
  // === PERBAIKAN: Logika filter disederhanakan ===
  const filteredRows = selectedProdi 
    ? rows.filter(row => row.id_unit_prodi == selectedProdi)
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/profil-lulusan");
      setRows(result);
    } catch (err) {
      console.error("Error fetching Profil Lulusan:", err);
      Swal.fire('Error', 'Gagal memuat data Profil Lulusan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Backend controller Anda sudah di-set untuk memetakan
    // 'deskripsi' -> 'deskripsi_pl'. Ini sudah benar.
    try {
      const url = editing ? `/profil-lulusan/${editing.id_pl}` : "/profil-lulusan";
      const method = editing ? "PUT" : "POST";
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      if (onDataChange) onDataChange();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data Profil Lulusan berhasil diperbarui.' : 'Data Profil Lulusan berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan yang tidak diketahui'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Profil Lulusan ${row.kode_pl} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/profil-lulusan/${row.id_pl}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data Profil Lulusan telah dihapus.', 'success');
        fetchRows();
        if (onDataChange) onDataChange();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_pl: editing.kode_pl || "",
        deskripsi: editing.deskripsi_pl || "", // Map dari 'deskripsi_pl' (DB) ke 'deskripsi' (Form)
        id_unit_prodi: editing.id_unit_prodi || ""
      });
    } else {
      setFormState({
        kode_pl: "",
        deskripsi: "",
        id_unit_prodi: ""
      });
    }
  }, [editing]);

  // Ekstrak Prodi dari maps untuk filter
  const prodiList = Object.values(maps?.units || {}).filter(
    uk => uk.id_unit === 4 || uk.id_unit === 5 // Asumsi hanya TI (4) dan MI (5)
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Profil Lulusan</h2>
        <div className="flex items-center gap-3">
          
          {/* === PERBAIKAN: Dropdown filter dinamis === */}
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">Semua Prodi</option>
            {prodiList.map(prodi => (
              <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
            ))}
          </select>
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setEditing(null);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah Profil Lulusan
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} profil lulusan
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode PL</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_pl} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => { setEditing(row); setShowModal(true); }}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Profil Lulusan (PL)' : 'Tambah Profil Lulusan (PL) Baru'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode PL</label>
                  <input
                    type="text"
                    placeholder="cth: PL-3"
                    value={formState.kode_pl}
                    onChange={(e) => setFormState({...formState, kode_pl: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                  <select
                    value={formState.id_unit_prodi}
                    onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  >
                    <option value="">Pilih Unit Prodi</option>
                    {prodiList.map(prodi => (
                      <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Profil Lulusan</label>
                  <textarea
                    placeholder="cth: Mampu menjadi Manajer Proyek IT"
                    value={formState.deskripsi} // Form menggunakan 'deskripsi'
                    onChange={(e) => setFormState({...formState, deskripsi: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
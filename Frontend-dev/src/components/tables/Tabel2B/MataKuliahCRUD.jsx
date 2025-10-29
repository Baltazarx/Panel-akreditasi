"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import Swal from 'sweetalert2';

// ============================================================
// MATA KULIAH CRUD
// ============================================================
export default function MataKuliahCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // === PERBAIKAN: State filter menyimpan id_unit_prodi ===
  const [selectedProdi, setSelectedProdi] = useState("");

  // === PERBAIKAN: Ubah state 'cpmk' menjadi array of object ===
  const [formState, setFormState] = useState({
    kode_mk: "",
    nama_mk: "",
    sks: "",
    semester: "",
    id_unit_prodi: "",
    cpmk: [{ kode_cpmk: "", deskripsi: "" }] // Default 1 baris
  });

  const canCreate = roleCan(role, "mata_kuliah", "C");
  const canUpdate = roleCan(role, "mata_kuliah", "U");
  const canDelete = roleCan(role, "mata_kuliah", "D");
  
  // === PERBAIKAN: Logika filter disederhanakan ===
  const filteredRows = selectedProdi 
    ? rows.filter(row => row.id_unit_prodi == selectedProdi)
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/mata-kuliah");
      setRows(result);
    } catch (err) {
      console.error("Error fetching Mata Kuliah:", err);
      Swal.fire('Error', 'Gagal memuat data Mata Kuliah', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editing ? `/mata-kuliah/${editing.id_mk}` : "/mata-kuliah";
      const method = editing ? "PUT" : "POST";
      
      // === PERBAIKAN: Payload 'cpmk' sekarang mengirim object utuh ===
      // Backend 'createMataKuliah' Anda akan menerima array 'cpmk' ini
      // dan memetakan 'deskripsi' -> 'deskripsi_cpmk'
      const payload = {
        kode_mk: formState.kode_mk,
        nama_mk: formState.nama_mk,
        sks: formState.sks,
        semester: formState.semester,
        id_unit_prodi: formState.id_unit_prodi,
        // Filter CPMK yang kode & deskripsinya tidak kosong
        cpmk: formState.cpmk.filter(c => c.kode_cpmk.trim() !== "" && c.deskripsi.trim() !== "")
      };
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      if (onDataChange) onDataChange();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data Mata Kuliah berhasil diperbarui.' : 'Data Mata Kuliah berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Mata Kuliah ${row.kode_mk} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/mata-kuliah/${row.id_mk}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data Mata Kuliah telah dihapus.', 'success');
        fetchRows();
        if (onDataChange) onDataChange();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  // === Helper fungsi untuk form CPMK dinamis ===
  const addCpmk = () => {
    setFormState({
      ...formState,
      cpmk: [...formState.cpmk, { kode_cpmk: "", deskripsi: "" }]
    });
  };

  const removeCpmk = (index) => {
    setFormState({
      ...formState,
      cpmk: formState.cpmk.filter((_, i) => i !== index)
    });
  };

  const updateCpmk = (index, field, value) => {
    const newCpmk = [...formState.cpmk];
    newCpmk[index][field] = value;
    setFormState({ ...formState, cpmk: newCpmk });
  };
  // === Akhir helper fungsi ===

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      // Saat mengedit, ambil data CPMK yang ada
      const existingCpmk = editing.cpmk_list 
        ? editing.cpmk_list.map(c => ({
            kode_cpmk: c.kode_cpmk || "",
            deskripsi: c.deskripsi_cpmk || "" // Map dari 'deskripsi_cpmk' (DB) ke 'deskripsi' (Form)
          })) 
        : [{ kode_cpmk: "", deskripsi: "" }];
        
      setFormState({
        kode_mk: editing.kode_mk || "",
        nama_mk: editing.nama_mk || "",
        sks: editing.sks || "",
        semester: editing.semester || "",
        id_unit_prodi: editing.id_unit_prodi || "",
        cpmk: existingCpmk.length > 0 ? existingCpmk : [{ kode_cpmk: "", deskripsi: "" }]
      });
    } else {
      // Reset form
      setFormState({
        kode_mk: "",
        nama_mk: "",
        sks: "",
        semester: "",
        id_unit_prodi: "",
        cpmk: [{ kode_cpmk: "", deskripsi: "" }]
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
        <h2 className="text-lg font-semibold text-slate-800">Mata Kuliah</h2>
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
              + Tambah Mata Kuliah
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} mata kuliah
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode MK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Nama MK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">SKS</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Semester</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_mk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.sks}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.semester}</td>
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

      {/* === PERBAIKAN BESAR: Modal Form untuk Mata Kuliah === */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Mata Kuliah (MK) & CPMK' : 'Tambah Mata Kuliah (MK) & CPMK'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Data Mata Kuliah */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Mata Kuliah</label>
                    <input
                      type="text"
                      value={formState.kode_mk}
                      onChange={(e) => setFormState({...formState, kode_mk: e.target.value})}
                      placeholder="cth: IF-202"
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Mata Kuliah</label>
                  <input
                    type="text"
                    value={formState.nama_mk}
                    onChange={(e) => setFormState({...formState, nama_mk: e.target.value})}
                    placeholder="cth: Rekayasa Perangkat Lunak"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS</label>
                    <input
                      type="number"
                      value={formState.sks}
                      onChange={(e) => setFormState({...formState, sks: e.target.value})}
                      placeholder="cth: 3"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      value={formState.semester}
                      onChange={(e) => setFormState({...formState, semester: e.target.value})}
                      placeholder="cth: 3"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                </div>
                
                {/* === PERBAIKAN: Bagian Form CPMK === */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">CPMK (Capaian Pembelajaran Mata Kuliah)</h3>
                    <p className="text-sm text-gray-600 mb-4">Definisikan kemampuan spesifik yang didapat dari mata kuliah ini.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {formState.cpmk.map((cpmk, index) => (
                      <div key={index} className="flex flex-col md:flex-row items-center gap-3">
                        <input
                          type="text"
                          value={cpmk.kode_cpmk}
                          onChange={(e) => updateCpmk(index, 'kode_cpmk', e.target.value)}
                          placeholder={`Kode CPMK ${index + 1}`}
                          className="w-full md:w-1/4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                        />
                        <input
                          type="text"
                          value={cpmk.deskripsi}
                          onChange={(e) => updateCpmk(index, 'deskripsi', e.target.value)}
                          placeholder={`Deskripsi CPMK ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                        />
                        {formState.cpmk.length > 1 && ( // Hanya tampilkan tombol hapus jika lebih dari 1
                          <button
                            type="button"
                            onClick={() => removeCpmk(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            ✕ Hapus
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addCpmk}
                      className="text-[#0384d6] hover:text-[#043975] transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <span className="text-lg">+</span> Tambah Baris CPMK
                    </button>
                  </div>
                </div>

                {/* Tombol Simpan dan Batal */}
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
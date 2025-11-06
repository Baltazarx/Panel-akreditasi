"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';

export default function TabelPegawai({ role }) {
  const table = { key: "pegawai", label: "Manajemen Data Pegawai", path: "/pegawai" };
  
  // State management
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const { maps } = useMaps(true);
  const [formState, setFormState] = useState({});

  // Cek hak akses
  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");
  const canRestore = roleCan(role, table.key, "H");
  
  // Debug permissions
  console.log('TabelPegawai permissions:', {
    role,
    roleType: typeof role,
    tableKey: table.key,
    canCreate,
    canUpdate,
    canDelete,
    canRestore,
    showModal,
    editing
  });
  

  // Fungsi fetchRows
  const fetchRows = async () => {
    setLoading(true);
    try {
      const url = showDeleted ? `${table.path}?include_deleted=1` : table.path;
      const result = await apiFetch(url);
      setRows(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // useEffects
  useEffect(() => { fetchRows(); }, []);
  useEffect(() => { fetchRows(); }, [showDeleted]);
  useEffect(() => {
    if (editing) {
      setFormState({
        nama_lengkap: editing.nama_lengkap || "",
        pendidikan_terakhir: editing.pendidikan_terakhir || "",
      });
    } else {
      setFormState({
        nama_lengkap: "",
        pendidikan_terakhir: "",
      });
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const idField = getIdField(editing);
      const url = editing ? `${table.path}/${editing[idField]}` : table.path;
      const method = editing ? "PUT" : "POST";
      
      console.log('Edit pegawai data:', {
        url,
        method,
        idField,
        editingId: editing ? editing[idField] : null,
        formState
      });
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      
      setShowModal(false);
      setEditing(null);
      fetchRows();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Edit pegawai error:', err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const doDelete = async (row) => {
    const idField = getIdField(row);
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Data ${row.nama_lengkap} akan dipindahkan ke daftar terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${table.path}/${row[idField]}`, { method: "DELETE" });
        await Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  const doRestore = async (row) => {
    const idField = getIdField(row);
    const result = await Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data ${row.nama_lengkap} akan dikembalikan ke daftar aktif.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${table.path}/${row[idField]}/restore`, { method: "POST" });
        await Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  const doHardDelete = async (row) => {
    const idField = getIdField(row);
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
        await apiFetch(`${table.path}/${row[idField]}/hard-delete`, { method: "DELETE" });
        await Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus permanen data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  // Render component
  if (loading && !rows.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data pegawai program studi.
        </p>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.length} baris`}
          </span>
          <button onClick={() => setShowDeleted(!showDeleted)} className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            showDeleted ? "bg-[#0384d6] text-white" : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
          }`} disabled={loading}>
            {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
          </button>
        </div>
        {canCreate && (
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            + Tambah Data
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr className="sticky top-0">
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">ID Pegawai</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Lengkap</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendidikan Terakhir</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows
              .filter(row => showDeleted ? row.deleted_at : !row.deleted_at)
              .map((row, index) => (
              <tr key={row.id_pegawai || index} className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{row.id_pegawai || '-'}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nama_lengkap || '-'}</td>
                <td className="px-6 py-4 text-slate-600 border border-slate-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {row.pendidikan_terakhir || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {!showDeleted && canUpdate && (
                      <button 
                        className="font-medium text-[#0384d6] hover:underline" 
                        onClick={() => {
                          console.log('Edit pegawai button clicked for row:', row);
                          setEditing(row);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {!showDeleted && !canUpdate && (
                      <span className="text-gray-400 text-xs">No edit permission</span>
                    )}
                    {!showDeleted && canDelete && (
                      <button className="font-medium text-red-600 hover:underline" onClick={() => doDelete(row)}>Hapus</button>
                    )}
                    {showDeleted && canDelete && (
                      <button className="font-medium text-red-600 hover:underline" onClick={() => doHardDelete(row)}>
                        Hapus Permanen
                      </button>
                    )}
                    {showDeleted && canUpdate && (
                      <button className="font-medium text-green-600 hover:underline" onClick={() => doRestore(row)}>
                        Pulihkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at).length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Data Pegawai' : 'Tambah Data Pegawai'}</h2>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data pegawai dengan lengkap.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formState.nama_lengkap || ""}
                      onChange={(e) => setFormState({...formState, nama_lengkap: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pendidikan Terakhir</label>
                    <select
                      value={formState.pendidikan_terakhir || ""}
                      onChange={(e) => setFormState({...formState, pendidikan_terakhir: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Pendidikan Terakhir</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => {setShowModal(false); setEditing(null);}} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white">{loading ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
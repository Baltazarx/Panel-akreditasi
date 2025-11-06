"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Impor SweetAlert2

/** Pretty table renderer */
function PrettyTable1A1({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, doRestore, showDeleted }) {
  const getUnitName = (row) =>
    row?.unit_kerja ||
    row?.unit?.nama ||
    row?.unit_nama ||
    row?.nama_unit ||
    maps.units[row?.id_unit]?.nama ||
    maps.units[row?.unit_id]?.nama ||
    maps.units[row?.id_unit]?.nama_unit ||
    maps.units[row?.unit_id]?.nama_unit ||
    row?.unit ||
    "";

  const getKetuaName = (row) =>
    row?.nama_ketua ||
    row?.nama_lengkap ||
    row?.ketua?.nama ||
    row?.ketua?.nama_ketua ||
    maps.pegawai[row?.id_pegawai]?.nama ||
    row?.ketua ||
    "";

  const getPeriode = (row) => {
    if (row?.periode_mulai && row?.periode_selesai) {
      const tahunMulai = row.periode_mulai.substring(0, 4);
      const tahunSelesai = row.periode_selesai.substring(0, 4);
      return `${tahunMulai}/${tahunSelesai}`;
    }
    return row?.periode || "";
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl">
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white sticky top-0 z-10">
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Unit Kerja</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Nama Ketua</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Periode Jabatan</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Pendidikan Terakhir</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Jabatan Struktural</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Tugas Pokok dan Fungsi</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800/80 dark:even:bg-gray-700/80 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition">
                <td className="px-4 py-3 align-top"><span className="font-medium">{getUnitName(r)}</span></td>
                <td className="px-4 py-3 align-top">{getKetuaName(r)}</td>
                <td className="px-4 py-3 align-top">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {getPeriode(r)}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">{r.pendidikan_terakhir || ""}</td>
                <td className="px-4 py-3 align-top">{r.jabatan_struktural || ""}</td>
                <td className="px-4 py-3 align-top whitespace-pre-wrap">{r.tupoksi || ""}</td>
                <td className="px-4 py-3 align-top">
                  {!showDeleted && canUpdate && (
                    <button className="mr-2 mb-1 px-3 py-1.5 rounded-lg font-semibold text-xs bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff] dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30 transition" onClick={() => setEditing(r)}>Edit</button>
                  )}
                  {!showDeleted && canDelete && (
                    <button className="mr-2 mb-1 px-3 py-1.5 rounded-lg font-semibold text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition" onClick={() => doDelete(r)}>Hapus</button>
                  )}
                  {showDeleted && canDelete && (
                    <button className="mr-2 mb-1 px-3 py-1.5 rounded-lg font-semibold text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-500/20 transition flex-shrink-0" onClick={() => doHardDelete(r)}>
                      Hapus Permanen
                    </button>
                  )}
                  {showDeleted && canUpdate && (
                    <button className="mb-1 px-3 py-1.5 rounded-lg font-semibold text-xs text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-500/20 transition flex-shrink-0" onClick={() => doRestore(r)}>
                      Pulihkan
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length === 0 && (
              <tr>
                <td className="px-4" colSpan={7}>
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default function Tabel1A1({ role }) {
  const table = { key: "tabel_1a1", label: "1.A.1 Pimpinan & Tupoksi UPPS/PS", path: "/pimpinan-upps-ps" };

  const { maps: mapsFromHook } = useMaps(true);
  const maps = mapsFromHook ?? { units: {}, pegawai: {}, tahun: {}, ref_jabatan_struktural: {} };

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relational] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showCreateModal, showEditModal]);

  const getUnitName = (row) =>
    row?.unit_kerja || row?.unit?.nama || row?.unit_nama || row?.nama_unit || maps.units[row?.id_unit]?.nama || maps.units[row?.unit_id]?.nama || maps.units[row?.id_unit]?.nama_unit || maps.units[row?.unit_id]?.nama_unit || row?.unit || "";
  const getKetuaName = (row) =>
    row?.nama_ketua || row?.nama_lengkap || row?.ketua?.nama || row?.ketua?.nama_ketua || maps.pegawai[row?.id_pegawai]?.nama || row?.ketua || "";
  const getPeriode = (row) => {
    if (row?.periode_mulai && row?.periode_selesai) {
      const tahunMulai = row.periode_mulai.substring(0, 4);
      const tahunSelesai = row.periode_selesai.substring(0, 4);
      return `${tahunMulai}/${tahunSelesai}`;
    }
    return row?.periode || "";
  };

  const [newIdUnit, setNewIdUnit] = useState("");
  const [newIdPegawai, setNewIdPegawai] = useState("");
  const [newPeriodeMulai, setNewPeriodeMulai] = useState("");
  const [newPeriodeSelesai, setNewPeriodeSelesai] = useState("");
  const [newTupoksi, setNewTupoksi] = useState("");
  const [newIdJabatan, setNewIdJabatan] = useState("");

  const [editIdUnit, setEditIdUnit] = useState("");
  const [editIdPegawai, setEditIdPegawai] = useState("");
  const [editPeriodeMulai, setEditPeriodeMulai] = useState("");
  const [editPeriodeSelesai, setEditPeriodeSelesai] = useState("");
  const [editTupoksi, setEditTupoksi] = useState("");
  const [editIdJabatan, setEditIdJabatan] = useState("");

  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (relational) {
        params.append("relasi", "1");
      }
      if (showDeleted) {
        params.append("include_deleted", "1");
      }
      const data = await apiFetch(`${table.path}?${params.toString()}`);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRows(); }, [showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdUnit(editing.id_unit ?? "");
      setEditIdPegawai(editing.id_pegawai ?? "");
      setEditPeriodeMulai(editing.periode_mulai?.split('T')[0] ?? "");
      setEditPeriodeSelesai(editing.periode_selesai?.split('T')[0] ?? "");
      setEditTupoksi(editing.tupoksi ?? "");
      setEditIdJabatan(editing.id_jabatan ?? "");
      setShowEditModal(true);
    }
  }, [editing]);

  const doDelete = (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: "Data akan dipindahkan ke daftar item yang dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}`, { method: "DELETE" });
            fetchRows();
            Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal menghapus data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doHardDelete = (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
            fetchRows();
            Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doRestore = (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}/restore`, { method: "POST" });
            fetchRows();
            Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        }
      }
    });
  };

  const renderModalForm = (isEdit = false) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        const payload = {
            id_unit: parseInt(isEdit ? editIdUnit : newIdUnit || 0),
            id_pegawai: parseInt(isEdit ? editIdPegawai : newIdPegawai || 0),
            periode_mulai: isEdit ? editPeriodeMulai : newPeriodeMulai,
            periode_selesai: isEdit ? editPeriodeSelesai : newPeriodeSelesai,
            tupoksi: (isEdit ? editTupoksi : newTupoksi || "").trim(),
            id_jabatan: parseInt(isEdit ? editIdJabatan : newIdJabatan || 0),
        };
        
        if (isEdit) {
            const idField = getIdField(editing);
            await apiFetch(`${table.path}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(payload) });
            setShowEditModal(false); 
            setEditing(null); 
        } else {
            await apiFetch(table.path, { method: "POST", body: JSON.stringify(payload) });
            setShowCreateModal(false);
            setNewIdUnit(""); setNewIdPegawai(""); setNewPeriodeMulai(""); setNewPeriodeSelesai(""); setNewTupoksi(""); setNewIdJabatan("");
        }

        fetchRows();
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: isEdit ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
            timer: 1500,
            showConfirmButton: false
        });
      } catch (e) {
        Swal.fire({
            icon: 'error',
            title: `Gagal ${isEdit ? 'memperbarui' : 'menambah'} data`,
            text: e.message
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <label htmlFor="id_unit" className="block text-sm font-semibold text-gray-700">Unit Kerja <span className="text-red-500">*</span></label>
                  <select id="id_unit" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editIdUnit : newIdUnit} onChange={(e)=> isEdit ? setEditIdUnit(e.target.value) : setNewIdUnit(e.target.value)} required>
                      <option value="">Pilih...</option>
                      {Object.values(maps.units).map(u=> <option key={u.id_unit} value={u.id_unit}>{u.nama_unit || u.nama}</option>)}
                  </select>
              </div>
              <div className="space-y-2">
                  <label htmlFor="id_pegawai" className="block text-sm font-semibold text-gray-700">Nama Pegawai <span className="text-red-500">*</span></label>
                  <select id="id_pegawai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editIdPegawai : newIdPegawai} onChange={(e)=> isEdit ? setEditIdPegawai(e.target.value) : setNewIdPegawai(e.target.value)} required>
                      <option value="">Pilih...</option>
                      {Object.values(maps.pegawai).map(p=> <option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_lengkap || p.nama}</option>)}
                  </select>
              </div>
              <div className="space-y-2">
                  <label htmlFor="periode_mulai" className="block text-sm font-semibold text-gray-700">Periode Mulai <span className="text-red-500">*</span></label>
                  <input type="date" id="periode_mulai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editPeriodeMulai : newPeriodeMulai} onChange={(e)=> isEdit ? setEditPeriodeMulai(e.target.value) : setNewPeriodeMulai(e.target.value)} required/>
              </div>
              <div className="space-y-2">
                  <label htmlFor="periode_selesai" className="block text-sm font-semibold text-gray-700">Periode Selesai <span className="text-red-500">*</span></label>
                  <input type="date" id="periode_selesai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editPeriodeSelesai : newPeriodeSelesai} onChange={(e)=> isEdit ? setEditPeriodeSelesai(e.target.value) : setNewPeriodeSelesai(e.target.value)} required/>
              </div>
              <div className="space-y-2 md:col-span-2">
                  <label htmlFor="id_jabatan" className="block text-sm font-semibold text-gray-700">Jabatan Struktural <span className="text-red-500">*</span></label>
                  <select id="id_jabatan" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editIdJabatan : newIdJabatan} onChange={(e)=> isEdit ? setEditIdJabatan(e.target.value) : setNewIdJabatan(e.target.value)} required>
                      <option value="">Pilih...</option>
                      {Object.values(maps.ref_jabatan_struktural).map(j=> <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>)}
                  </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                  <label htmlFor="tupoksi" className="block text-sm font-semibold text-gray-700">Tupoksi <span className="text-red-500">*</span></label>
                  <textarea id="tupoksi" rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editTupoksi : newTupoksi} onChange={(e)=> isEdit ? setEditTupoksi(e.target.value) : setNewTupoksi(e.target.value)} required/>
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                  className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                  type="button" 
                  onClick={()=> isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
              >
                  Batal
              </button>
              <button 
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2" 
                  disabled={loading} 
                  type="submit"
              >
                  {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
          </div>
      </form>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data pimpinan dan tupoksi UPPS/PS.
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
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit Kerja</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Ketua</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Periode Jabatan</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendidikan Terakhir</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jabatan Struktural</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tugas Pokok dan Fungsi</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => (
              <tr key={i} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{getUnitName(r)}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{getKetuaName(r)}</td>
                <td className="px-6 py-4 text-slate-600 border border-slate-200">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {getPeriode(r)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.pendidikan_terakhir || ""}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.jabatan_struktural || ""}</td>
                <td className="px-6 py-4 text-slate-700 whitespace-pre-wrap border border-slate-200">{r.tupoksi || ""}</td>
                <td className="px-6 py-4 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {!showDeleted && canUpdate && (
                      <button className="font-medium text-[#0384d6] hover:underline" onClick={() => setEditing(r)}>Edit</button>
                    )}
                    {!showDeleted && canDelete && (
                      <button className="font-medium text-red-600 hover:underline" onClick={() => doDelete(r)}>Hapus</button>
                    )}
                    {showDeleted && canDelete && (
                      <button className="font-medium text-red-600 hover:underline" onClick={() => doHardDelete(r)}>
                        Hapus Permanen
                      </button>
                    )}
                    {showDeleted && canUpdate && (
                      <button className="font-medium text-green-600 hover:underline" onClick={() => doRestore(r)}>
                        Pulihkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Pimpinan & Tupoksi UPPS/PS</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data pimpinan dan periode jabatan.</p>
            </div>
            <div className="p-8">
              {renderModalForm(false)}
            </div>
          </div>
        </div>
      )}

       {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Edit Data Pimpinan & Tupoksi UPPS/PS</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data pimpinan dan periode jabatan.</p>
            </div>
            <div className="p-8">
              {renderModalForm(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
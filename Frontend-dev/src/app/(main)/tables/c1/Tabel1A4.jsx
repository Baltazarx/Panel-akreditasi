// src/components/tables/Tabel1A4.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi

const ENDPOINT = "/beban-kerja-dosen";
const TABLE_KEY = "tabel_1a4";
const LABEL = "1.A.4 Rata-rata Beban DTPR (EWMP) TS";

const n = (v) => Number(v || 0);

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, doRestoreSingle, showDeleted }) {
  const getDosenName = (id) => maps.pegawai[id]?.nama_lengkap || id;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* header bertingkat */}
          <tr className="sticky top-0">
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama DTPR</th>
            <th colSpan={3} className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase border border-white/20">
              SKS Pengajaran<sup>1)</sup> Pada
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              SKS Penelitian<sup>2)</sup>
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              SKS Pengabdian kepada Masyarakat<sup>2)</sup>
            </th>
            <th colSpan={2} className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase border border-white/20">
              SKS Manajemen<sup>3)</sup>
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Total SKS</th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
          <tr className="sticky top-0">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PS Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PS Lain, PT Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Lain</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Lain</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
            {rows.map((r, i) => {
              const pengajaranTotal = n(r.sks_pengajaran);
              const pengajaranPsSendiri = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;
              const pengajaranPsLainPtSendiri = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;
              const pengajaranPtLain = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;

              const penelitian = n(r.sks_penelitian);
              const pkm = n(r.sks_pkm);

              const manajemenTotal = n(r.sks_manajemen);
              const manajemenPtSendiri = manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : 0;
              const manajemenPtLain = manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : 0;

              const total = (
                n(pengajaranPsSendiri) +
                n(pengajaranPsLainPtSendiri) +
                n(pengajaranPtLain) +
                n(penelitian) +
                n(pkm) +
                n(manajemenPtSendiri) +
                n(manajemenPtLain)
              ).toFixed(2);

              return (
                <tr key={i} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{i + 1}.</td>
                  <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">{getDosenName(r.id_dosen)}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPsSendiri}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPsLainPtSendiri}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPtLain}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{penelitian}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pkm}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{manajemenPtSendiri}</td>
                  <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{manajemenPtLain}</td>
                  <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">{total}</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <div className="flex items-center justify-center gap-2">
                      {!showDeleted && canUpdate && (
                        <button className="font-medium text-[#0384d6] hover:underline" onClick={() => setEditing(r)}>
                          Edit
                        </button>
                      )}
                      {!showDeleted && canDelete && (
                        <button className="font-medium text-red-600 hover:underline" onClick={() => doDelete(r)}>
                          Hapus
                        </button>
                      )}
                      {showDeleted && canUpdate && (
                        <button className="font-medium text-green-600 hover:underline" onClick={() => doRestoreSingle(r)}>
                          Pulihkan
                        </button>
                      )}
                      {showDeleted && canDelete && (
                        <button className="font-medium text-red-800 hover:underline" onClick={() => doHardDelete(r)}>
                          Hapus Permanen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}

export default function Tabel1A4({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');

  const [newIdTahun, setNewIdTahun] = useState("");
  const [newIdDosen, setNewIdDosen] = useState("");
  const [newPengajaranPsSendiri, setNewPengajaranPsSendiri] = useState("");
  const [newPengajaranPsLainPtSendiri, setNewPengajaranPsLainPtSendiri] = useState("");
  const [newPengajaranPtLain, setNewPengajaranPtLain] = useState("");
  const [newPenelitian, setNewPenelitian] = useState("");
  const [newPkm, setNewPkm] = useState("");
  const [newManajemenPtSendiri, setNewManajemenPtSendiri] = useState("");
  const [newManajemenPtLain, setNewManajemenPtLain] = useState("");

  const [editIdTahun, setEditIdTahun] = useState("");
  const [editIdDosen, setEditIdDosen] = useState("");
  const [editPengajaranPsSendiri, setEditPengajaranPsSendiri] = useState("");
  const [editPengajaranPsLainPtSendiri, setEditPengajaranPsLainPtSendiri] = useState("");
  const [editPengajaranPtLain, setEditPengajaranPtLain] = useState("");
  const [editPenelitian, setEditPenelitian] = useState("");
  const [editPkm, setEditPkm] = useState("");
  const [editManajemenPtSendiri, setEditManajemenPtSendiri] = useState("");
  const [editManajemenPtLain, setEditManajemenPtLain] = useState("");

  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      const deletedQs = showDeleted ? `&include_deleted=1` : "";
      const yearQs = selectedYear ? `&id_tahun=${selectedYear}` : "";
      const data = await apiFetch(`${ENDPOINT}?relasi=1${deletedQs}${yearQs}`);
      const filteredData = showDeleted
        ? data.filter((row) => row.deleted_at !== null)
        : data.filter((row) => row.deleted_at === null);
      setRows(Array.isArray(filteredData) ? filteredData : filteredData?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
    setSelectedRows([]);
  }, [showDeleted, selectedYear]);

  useEffect(() => {
    if (editing) {
      setEditIdTahun(editing.id_tahun || "");
      setEditIdDosen(editing.id_dosen || "");
      const pengajaranTotal = n(editing.sks_pengajaran);
      setEditPengajaranPsSendiri(pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : "");
      setEditPengajaranPsLainPtSendiri(pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : "");
      setEditPengajaranPtLain(pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : "");
      setEditPenelitian(editing.sks_penelitian ?? "");
      setEditPkm(editing.sks_pkm ?? "");
      const manajemenTotal = n(editing.sks_manajemen);
      setEditManajemenPtSendiri(manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : "");
      setEditManajemenPtLain(manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : "");
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
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}`, { 
            method: "DELETE",
            body: JSON.stringify({ 
              deleted_by: role?.user?.name || role?.user?.username || "Unknown User",
              deleted_at: new Date().toISOString()
            })
          });
          fetchRows();
          Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
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
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
          fetchRows();
          Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doRestoreSingle = (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}/restore`, { 
            method: "POST",
            body: JSON.stringify({
              restored_by: role?.user?.name || role?.user?.username || "Unknown User",
              restored_at: new Date().toISOString()
            })
          });
          fetchRows();
          Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const doRestoreMultiple = () => {
    if (!selectedRows.length) {
      Swal.fire('Perhatian', 'Pilih setidaknya satu baris untuk dipulihkan.', 'info');
      return;
    }
    Swal.fire({
        title: `Pulihkan ${selectedRows.length} Data?`,
        text: "Semua data yang dipilih akan dikembalikan ke daftar aktif.",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, pulihkan!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await apiFetch(`${ENDPOINT}/restore-multiple`, {
            method: "POST",
            body: JSON.stringify({ 
              ids: selectedRows,
              restored_by: role?.user?.name || role?.user?.username || "Unknown User",
              restored_at: new Date().toISOString()
            }),
          });
          setSelectedRows([]);
          fetchRows();
          Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const newTotal = (
    n(newPengajaranPsSendiri) +
    n(newPengajaranPsLainPtSendiri) +
    n(newPengajaranPtLain) +
    n(newPenelitian) +
    n(newPkm) +
    n(newManajemenPtSendiri) +
    n(newManajemenPtLain)
  ).toFixed(2);

  const editTotal = (
    n(editPengajaranPsSendiri) +
    n(editPengajaranPsLainPtSendiri) +
    n(editPengajaranPtLain) +
    n(editPenelitian) +
    n(editPkm) +
    n(editManajemenPtSendiri) +
    n(editManajemenPtLain)
  ).toFixed(2);
  
  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data beban kerja dosen dan distribusi SKS per tahun.
        </p>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-tahun" className="text-sm font-medium text-slate-700">Tahun:</label>
            <select
              id="filter-tahun"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
              disabled={loading}
            >
              <option value="" disabled>Pilih Tahun</option>
              {Object.values(maps.tahun).map((y) => (
                <option key={y.id_tahun} value={y.id_tahun} className="text-slate-700">{y.tahun}</option>
              ))}
            </select>
          </div>

          {canDelete && (
            <button
              onClick={() => setShowDeleted((prev) => !prev)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showDeleted
                  ? "bg-[#0384d6] text-white"
                  : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
              }`}
              disabled={loading}
            >
              {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
            </button>
          )}
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <button
              onClick={doRestoreMultiple}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Pulihkan ({selectedRows.length})
            </button>
          )}
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.length} baris`}
          </span>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            + Tambah Data
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <PrettyTable
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        doRestoreSingle={doRestoreSingle}
        showDeleted={showDeleted}
      />

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Beban Kerja Dosen</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data beban kerja dosen dan distribusi SKS.</p>
            </div>
            <div className="p-8">
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  const body = { id_tahun: parseInt(newIdTahun), id_dosen: parseInt(newIdDosen), sks_pengajaran: n(newPengajaranPsSendiri) + n(newPengajaranPsLainPtSendiri) + n(newPengajaranPtLain), sks_penelitian: n(newPenelitian), sks_pkm: n(newPkm), sks_manajemen: n(newManajemenPtSendiri) + n(newManajemenPtLain), created_by: role?.user?.name || role?.user?.username || "Unknown User", created_at: new Date().toISOString() };
                  await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
                  setShowCreateModal(false);
                  setNewIdTahun(""); setNewIdDosen(""); setNewPengajaranPsSendiri(""); setNewPengajaranPsLainPtSendiri(""); setNewPengajaranPtLain(""); setNewPenelitian(""); setNewPkm(""); setNewManajemenPtSendiri(""); setNewManajemenPtLain("");
                  fetchRows();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Menambah Data', text: e.message });
                } finally { setLoading(false); }
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={newIdTahun} onChange={(e) => setNewIdTahun(e.target.value)} required>
                    <option value="">Pilih Tahun...</option>
                    {Object.values(maps.tahun).map((y) => (<option key={y.id_tahun} value={y.id_tahun}>{y.tahun}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Dosen</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={newIdDosen} onChange={(e) => setNewIdDosen(e.target.value)} required>
                    <option value="">Pilih Dosen...</option>
                    {Object.values(maps.pegawai).map((p) => (<option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_lengkap}</option>))}
                </select>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold text-slate-700 mb-3">SKS Pengajaran<sup>1)</sup> Pada</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PS Sendiri</label>
                        <input type="number" step="0.01" min="0" value={newPengajaranPsSendiri} onChange={(e)=>setNewPengajaranPsSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PS Lain, PT Sendiri</label>
                        <input type="number" step="0.01" min="0" value={newPengajaranPsLainPtSendiri} onChange={(e)=>setNewPengajaranPsLainPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                        <input type="number" step="0.01" min="0" value={newPengajaranPtLain} onChange={(e)=>setNewPengajaranPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Penelitian</label>
                        <input type="number" step="0.01" min="0" value={newPenelitian} onChange={(e)=>setNewPenelitian(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Pengabdian kepada Masyarakat</label>
                        <input type="number" step="0.01" min="0" value={newPkm} onChange={(e)=>setNewPkm(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-slate-700 mb-3">SKS Manajemen<sup>3)</sup></p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Sendiri</label>
                        <input type="number" step="0.01" min="0" value={newManajemenPtSendiri} onChange={(e)=>setNewManajemenPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                        <input type="number" step="0.01" min="0" value={newManajemenPtLain} onChange={(e)=>setNewManajemenPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                   </div>
              </div>
              
              <div className="text-right font-semibold text-black">Total SKS: {newTotal}</div>

              <div className="flex justify-end gap-4">
                <button className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" type="button" onClick={() => setShowCreateModal(false)}>Batal</button>
                <button className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading} type="submit">Simpan</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Edit Data Beban Kerja Dosen</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data beban kerja dosen dan distribusi SKS.</p>
            </div>
            <div className="p-8">
              <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  const idField = getIdField(editing);
                  const body = { id_tahun: parseInt(editIdTahun), id_dosen: parseInt(editIdDosen), sks_pengajaran: n(editPengajaranPsSendiri) + n(editPengajaranPsLainPtSendiri) + n(editPengajaranPtLain), sks_penelitian: n(editPenelitian), sks_pkm: n(editPkm), sks_manajemen: n(editManajemenPtSendiri) + n(editManajemenPtLain), updated_by: role?.user?.name || role?.user?.username || "Unknown User", updated_at: new Date().toISOString() };
                  await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
                  setShowEditModal(false);
                  setEditing(null);
                  fetchRows();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Memperbarui Data', text: e.message });
                } finally { setLoading(false); }
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={editIdTahun} onChange={(e) => setEditIdTahun(e.target.value)} required>
                    <option value="">Pilih Tahun...</option>
                    {Object.values(maps.tahun).map((y) => (<option key={y.id_tahun} value={y.id_tahun}>{y.tahun}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Dosen</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={editIdDosen} onChange={(e) => setEditIdDosen(e.target.value)} required>
                    <option value="">Pilih Dosen...</option>
                    {Object.values(maps.pegawai).map((p) => (<option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_lengkap}</option>))}
                </select>
              </div>

              <div className="mb-4">
                   <p className="font-semibold text-slate-700 mb-3">SKS Pengajaran<sup>1)</sup> Pada</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PS Sendiri</label>
                        <input type="number" step="0.01" min="0" value={editPengajaranPsSendiri} onChange={(e)=>setEditPengajaranPsSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PS Lain, PT Sendiri</label>
                        <input type="number" step="0.01" min="0" value={editPengajaranPsLainPtSendiri} onChange={(e)=>setEditPengajaranPsLainPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                        <input type="number" step="0.01" min="0" value={editPengajaranPtLain} onChange={(e)=>setEditPengajaranPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Penelitian</label>
                        <input type="number" step="0.01" min="0" value={editPenelitian} onChange={(e)=>setEditPenelitian(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Pengabdian kepada Masyarakat</label>
                        <input type="number" step="0.01" min="0" value={editPkm} onChange={(e)=>setEditPkm(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-slate-700 mb-3">SKS Manajemen<sup>3)</sup></p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Sendiri</label>
                        <input type="number" step="0.01" min="0" value={editManajemenPtSendiri} onChange={(e)=>setEditManajemenPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                        <input type="number" step="0.01" min="0" value={editManajemenPtLain} onChange={(e)=>setEditManajemenPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                   </div>
              </div>

              <div className="text-right font-semibold text-black">Total SKS: {editTotal}</div>

              <div className="flex justify-end gap-4">
                <button className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" type="button" onClick={() => setShowEditModal(false)}>Batal</button>
                <button className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading} type="submit">Simpan</button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
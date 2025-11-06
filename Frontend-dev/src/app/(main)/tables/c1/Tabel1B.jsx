// src/components/tables/Tabel1B.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi

const ENDPOINT = "/audit-mutu-internal";
const TABLE_KEY = "tabel_1b";
const LABEL = "1.B Audit Mutu Internal";

const n = (v) => Number(v || 0);

/* ---------- Year Selector Component ---------- */
function YearSelector({ maps, activeYear, setActiveYear }) {
  const tahunData = Object.values(maps.tahun || {});
  
  return (
    <select
      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
      value={activeYear}
      onChange={(e) => setActiveYear(e.target.value)}
    >
      <option value="">Semua Tahun</option>
      {tahunData.map((y) => (
        <option key={y.id_tahun} value={y.id_tahun}>
          {y.tahun || y.nama}
        </option>
      ))}
    </select>
  );
}

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, showDeleted, doRestore, selectedRows, setSelectedRows, isAllSelected, handleSelectAll }) {
  const getUnitName = (id) => maps.units[id]?.nama_unit || id;
  const getYearName = (id) => maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            {showDeleted && (
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                />
              </th>
            )}
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Unit SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Dokumen SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Auditor Mutu Internal</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Certified</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Non Certified</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Frekuensi audit/monev per tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Bukti Certified Auditor</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Laporan Audit</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => {
                const totalAuditors = (r.jumlah_auditor_certified || 0) + (r.jumlah_auditor_noncertified || 0);
                return (
                  <tr key={i} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                    {showDeleted && (
                      <td className="px-6 py-4 text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(r.id_ami)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, r.id_ami]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== r.id_ami));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{i + 1}.</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{getYearName(r.id_tahun)}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.id_unit}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">{getUnitName(r.id_unit)}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.dokumen_spmi}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{totalAuditors}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.jumlah_auditor_certified}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.jumlah_auditor_noncertified}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.frekuensi_audit}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">
                      {r.bukti_certified_uri ? (
                        <a href={r.bukti_certified_uri} target="_blank" rel="noopener noreferrer" className="underline text-[#0384d6] hover:text-[#043975] transition">Lihat Bukti</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">
                      {r.laporan_audit_url ? (
                        <a href={r.laporan_audit_url} target="_blank" rel="noopener noreferrer" className="underline text-[#0384d6] hover:text-[#043975] transition">Lihat Laporan</a>
                      ) : (
                        "-"
                      )}
                    </td>
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
                        {showDeleted && canDelete && (
                          <button className="font-medium text-red-800 hover:underline" onClick={() => doHardDelete(r)}>
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
                );
              })}
            {rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 13 : 12} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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

export default function Tabel1B({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeYear, setActiveYear] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const [newIdUnit, setNewIdUnit] = useState("");
  const [newIdTahun, setNewIdTahun] = useState("");
  const [newFrekuensiAudit, setNewFrekuensiAudit] = useState("");
  const [newDokumenSpmi, setNewDokumenSpmi] = useState("");
  const [newLaporanAuditUrl, setNewLaporanAuditUrl] = useState("");
  const [newJumlahAuditorCertified, setNewJumlahAuditorCertified] = useState("");
  const [newJumlahAuditorNoncertified, setNewJumlahAuditorNoncertified] = useState("");
  const [newBuktiCertifiedUri, setNewBuktiCertifiedUri] = useState("");

  const [editIdUnit, setEditIdUnit] = useState("");
  const [editIdTahun, setEditIdTahun] = useState("");
  const [editFrekuensiAudit, setEditFrekuensiAudit] = useState("");
  const [editDokumenSpmi, setEditDokumenSpmi] = useState("");
  const [editLaporanAuditUrl, setEditLaporanAuditUrl] = useState("");
  const [editJumlahAuditorCertified, setEditJumlahAuditorCertified] = useState("");
  const [editJumlahAuditorNoncertified, setEditJumlahAuditorNoncertified] = useState("");
  const [editBuktiCertifiedUri, setEditBuktiCertifiedUri] = useState("");

  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.append("relasi", "1");
      if (activeYear) {
        params.append("id_tahun", activeYear);
      }
      if (showDeleted) {
        params.append("include_deleted", "1");
      }
      const data = await apiFetch(`${ENDPOINT}?${params.toString()}`);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
    setSelectedRows([]); // Reset selected rows saat filter berubah
  }, [showDeleted, activeYear]);

  useEffect(() => {
    if (editing) {
      setEditIdUnit(editing.id_unit || "");
      setEditIdTahun(editing.id_tahun || "");
      setEditFrekuensiAudit(editing.frekuensi_audit || "");
      setEditDokumenSpmi(editing.dokumen_spmi || "");
      setEditLaporanAuditUrl(editing.laporan_audit_url || "");
      setEditJumlahAuditorCertified(editing.jumlah_auditor_certified || "");
      setEditJumlahAuditorNoncertified(editing.jumlah_auditor_noncertified || "");
      setEditBuktiCertifiedUri(editing.bukti_certified_uri || "");
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

  const doRestore = (row) => {
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
            })
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

  const isAllSelected = rows.filter(r => r.deleted_at).length > 0 && selectedRows.length === rows.filter(r => r.deleted_at).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = rows.filter(r => r.deleted_at).map(r => r.id_ami);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  const renderModalForm = (isEdit = false) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        const body = {
          id_unit: parseInt(isEdit ? editIdUnit : newIdUnit),
          id_tahun: parseInt(isEdit ? editIdTahun : newIdTahun),
          frekuensi_audit: n(isEdit ? editFrekuensiAudit : newFrekuensiAudit),
          dokumen_spmi: isEdit ? editDokumenSpmi : newDokumenSpmi,
          laporan_audit_url: isEdit ? editLaporanAuditUrl : newLaporanAuditUrl,
          jumlah_auditor_certified: n(isEdit ? editJumlahAuditorCertified : newJumlahAuditorCertified),
          jumlah_auditor_noncertified: n(isEdit ? editJumlahAuditorNoncertified : newJumlahAuditorNoncertified),
          bukti_certified_uri: isEdit ? editBuktiCertifiedUri : newBuktiCertifiedUri,
          ...(isEdit ? {
            updated_by: role?.user?.name || role?.user?.username || "Unknown User",
            updated_at: new Date().toISOString()
          } : {
            created_by: role?.user?.name || role?.user?.username || "Unknown User",
            created_at: new Date().toISOString()
          })
        };

        if (isEdit) {
          const idField = getIdField(editing);
          await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
          setEditing(null);
          setShowEditModal(false);
        } else {
          await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
          setNewIdUnit(""); setNewIdTahun(""); setNewFrekuensiAudit("");
          setNewDokumenSpmi(""); setNewLaporanAuditUrl("");
          setNewJumlahAuditorCertified(""); setNewJumlahAuditorNoncertified("");
          setNewBuktiCertifiedUri("");
          setShowCreateModal(false);
        }
        fetchRows();
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Data berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Unit SPMI</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editIdUnit : newIdUnit} onChange={(e) => isEdit ? setEditIdUnit(e.target.value) : setNewIdUnit(e.target.value)} required>
              <option value="">Pilih Unit...</option>
              {Object.values(maps.units).map((u) => (<option key={u.id_unit} value={u.id_unit}>{u.nama_unit}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editIdTahun : newIdTahun} onChange={(e) => isEdit ? setEditIdTahun(e.target.value) : setNewIdTahun(e.target.value)} required>
              <option value="">Pilih Tahun...</option>
              {Object.values(maps.tahun).map((y) => (<option key={y.id_tahun} value={y.id_tahun}>{y.tahun}</option>))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Frekuensi audit/monev per tahun</label>
          <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editFrekuensiAudit : newFrekuensiAudit} onChange={(e) => isEdit ? setEditFrekuensiAudit(e.target.value) : setNewFrekuensiAudit(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen SPMI</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editDokumenSpmi : newDokumenSpmi} onChange={(e) => isEdit ? setEditDokumenSpmi(e.target.value) : setNewDokumenSpmi(e.target.value)} />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Laporan Audit URL</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editLaporanAuditUrl : newLaporanAuditUrl} onChange={(e) => isEdit ? setEditLaporanAuditUrl(e.target.value) : setNewLaporanAuditUrl(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Auditor Certified</label>
            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editJumlahAuditorCertified : newJumlahAuditorCertified} onChange={(e) => isEdit ? setEditJumlahAuditorCertified(e.target.value) : setNewJumlahAuditorCertified(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Auditor Non Certified</label>
            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editJumlahAuditorNoncertified : newJumlahAuditorNoncertified} onChange={(e) => isEdit ? setEditJumlahAuditorNoncertified(e.target.value) : setNewJumlahAuditorNoncertified(e.target.value)} required />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bukti Certified Auditor URL</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editBuktiCertifiedUri : newBuktiCertifiedUri} onChange={(e) => isEdit ? setEditBuktiCertifiedUri(e.target.value) : setNewBuktiCertifiedUri(e.target.value)} />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
           <button className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50" type="button" onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}>Batal</button>
           <button className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading} type="submit">Simpan</button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data audit mutu internal dan monitoring evaluasi per tahun.
        </p>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector 
            maps={maps} 
            activeYear={activeYear} 
            setActiveYear={setActiveYear}
          />
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length} baris`}
          </span>
          <button onClick={() => setShowDeleted(!showDeleted)} className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            showDeleted ? "bg-[#0384d6] text-white" : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
          }`} disabled={loading}>
            {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
          </button>
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <button
              onClick={doRestoreMultiple}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Pulihkan ({selectedRows.length})
            </button>
          )}
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

      <PrettyTable
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        showDeleted={showDeleted}
        doRestore={doRestore}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
      />
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Audit Mutu Internal</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data AMI termasuk auditor dan dokumen pendukung.</p>
            </div>
            <div className="p-8">{renderModalForm(false)}</div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Ubah Data Audit Mutu Internal</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data AMI termasuk auditor dan dokumen pendukung.</p>
            </div>
            <div className="p-8">{renderModalForm(true)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
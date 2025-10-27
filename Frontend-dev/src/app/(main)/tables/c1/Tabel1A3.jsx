// src/components/tables/Tabel1A3.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi

const ENDPOINT = "/penggunaan-dana";
const TABLE_KEY = "tabel_1a3";
const LABEL = "1.A.3 Penggunaan Dana UPPS/PS";

const n = (v) => Number(v || 0);

/* ---------- Year selector (TS filter) ---------- */
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

function PrettyTable1A3({
  rows,
  maps,
  canUpdate,
  canDelete,
  setEditing,
  doDelete,
  doHardDelete,
  doRestore,
  showDeleted,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  handleSelectAll,
}) {
  const getYearName = (id) =>
    maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

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
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jenis Penggunaan</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Dana</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows
            .filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at))
            .map((r, i) => (
              <tr
                key={i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-[#eaf4ff]`}
              >
                {showDeleted && (
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id_penggunaan_dana)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([
                            ...selectedRows,
                            r.id_penggunaan_dana,
                          ]);
                        } else {
                          setSelectedRows(
                            selectedRows.filter(
                              (id) => id !== r.id_penggunaan_dana
                            )
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                    />
                  </td>
                )}
                <td className="px-6 py-4 text-slate-700 border border-slate-200">
                  {getYearName(r.id_tahun)}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">
                  {r.jenis_penggunaan}
                </td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">
                  {r.jumlah_dana
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(n(r.jumlah_dana))
                    : "-"}
                </td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">
                  {r.link_bukti ? (
                    <a
                      href={r.link_bukti}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#0384d6] hover:text-[#043975] transition"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {!showDeleted && canUpdate && (
                      <button
                        className="font-medium text-[#0384d6] hover:underline"
                        onClick={() => setEditing(r)}
                      >
                        Edit
                      </button>
                    )}
                    {!showDeleted && canDelete && (
                      <button
                        className="font-medium text-red-600 hover:underline"
                        onClick={() => doDelete(r)}
                      >
                        Hapus
                      </button>
                    )}
                    {showDeleted && canDelete && (
                      <button
                        className="font-medium text-red-800 hover:underline"
                        onClick={() => doHardDelete(r)}
                      >
                        Hapus Permanen
                      </button>
                    )}
                    {showDeleted && canUpdate && (
                      <button
                        className="font-medium text-green-600 hover:underline"
                        onClick={() => doRestore(r)}
                      >
                        Pulihkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          {rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at))
            .length === 0 && (
            <tr>
              <td
                colSpan={showDeleted ? 6 : 5}
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">
                  Belum ada data yang ditambahkan atau data yang cocok dengan
                  filter.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PrettyTable1A3Summary({ summaryData }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            {[
              "Jenis Penggunaan",
              "TS-4",
              "TS-3",
              "TS-2",
              "TS-1",
              "TS",
              "Link Bukti",
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {summaryData.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors ${
                i % 2 === 0 ? "bg-white" : "bg-slate-50"
              } hover:bg-[#eaf4ff]`}
            >
              <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">
                {row.jenis_penggunaan}
              </td>
              <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_4))}
              </td>
              <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_3))}
              </td>
              <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_2))}
              </td>
              <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_1))}
              </td>
              <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts))}
              </td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">
                {row.link_bukti ? (
                  <a
                    href={row.link_bukti}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#0384d6] hover:text-[#043975] transition"
                  >
                    Lihat Bukti
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
          {summaryData.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data ringkasan tidak tersedia</p>
                <p className="text-sm">Belum ada data penggunaan dana.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export default function Tabel1A3({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeYear, setActiveYear] = useState("");

  const [newIdTahun, setNewIdTahun] = useState("");
  const [newJenis, setNewJenis] = useState("");
  const [newJumlah, setNewJumlah] = useState("");
  const [newLink, setNewLink] = useState("");

  const [editIdTahun, setEditIdTahun] = useState("");
  const [editJenis, setEditJenis] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [editLink, setEditLink] = useState("");

  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      let qs = "?relasi=1";
      if (activeYear) {
        qs += `&id_tahun=${encodeURIComponent(activeYear)}`;
      }
      if (showDeleted) {
        qs += `&include_deleted=1`;
      }
      const data = await apiFetch(`${ENDPOINT}${qs}`);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const data = await apiFetch(`${ENDPOINT}/summary`);
      setSummaryData(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      console.error("Gagal memuat summary:", e);
    }
  }

  useEffect(() => {
    fetchRows();
    fetchSummary();
    setSelectedRows([]);
  }, [showDeleted, activeYear]);

  useEffect(() => {
    if (editing) {
      setEditIdTahun(editing.id_tahun || "");
      setEditJenis(editing.jenis_penggunaan || "");
      setEditJumlah(editing.jumlah_dana || "");
      setEditLink(editing.link_bukti || "");
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
              deleted_at: new Date().toISOString(),
            }),
          });
          fetchRows();
          fetchSummary();
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
            setLoading(true);
            try {
                const idField = getIdField(row);
                await apiFetch(`${ENDPOINT}/${row?.[idField]}/hard-delete`, {
                    method: "DELETE",
                });
                fetchRows();
                fetchSummary();
                Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
            } catch (e) {
                Swal.fire('Gagal!', `Gagal menghapus data secara permanen: ${e.message}`, 'error');
            } finally {
                setLoading(false);
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
                        restored_at: new Date().toISOString(),
                    }),
                });
                fetchRows();
                fetchSummary();
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
                        restored_at: new Date().toISOString(),
                    }),
                });
                setSelectedRows([]);
                fetchRows();
                fetchSummary();
                Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
            } catch (e) {
                Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
            } finally {
                setLoading(false);
            }
        }
    });
  };

  const isAllSelected =
    rows.filter((r) => r.deleted_at).length > 0 &&
    selectedRows.length === rows.filter((r) => r.deleted_at).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = rows
        .filter((r) => r.deleted_at)
        .map((r) => r.id_penggunaan_dana);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data penggunaan dana UPPS/PS dan distribusi per tahun.
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
            {rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at)).length} baris
          </span>
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

      <PrettyTable1A3
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        doRestore={doRestore}
        showDeleted={showDeleted}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
      />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">
          Ringkasan Penggunaan Dana
        </h2>
        <PrettyTable1A3Summary summaryData={summaryData} />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Penggunaan Dana</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi jenis penggunaan, jumlah dan tahun.</p>
            </div>
            <form
              className="p-8 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const body = { id_tahun: parseInt(newIdTahun), jenis_penggunaan: newJenis, jumlah_dana: n(newJumlah), link_bukti: newLink, created_by: role?.user?.name || role?.user?.username || "Unknown User", created_at: new Date().toISOString() };
                  await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
                  setShowCreateModal(false);
                  setNewIdTahun(""); setNewJenis(""); setNewJumlah(""); setNewLink("");
                  fetchRows();
                  fetchSummary();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Menambah Data', text: e.message });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tahun
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={newIdTahun}
                  onChange={(e) => setNewIdTahun(e.target.value)}
                  required
                >
                  <option value="">Pilih...</option>
                  {Object.values(maps.tahun || {}).map((y) => (
                    <option key={y.id_tahun} value={y.id_tahun}>
                      {y.tahun || y.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Penggunaan
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  placeholder="mis. Operasional, Pengembangan, dll."
                  value={newJenis}
                  onChange={(e) => setNewJenis(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Dana
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={newJumlah}
                  onChange={(e) => setNewJumlah(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Bukti
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40"
                  disabled={loading}
                  type="submit"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Ubah Data Penggunaan Dana</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui jenis penggunaan, jumlah dan tahun.</p>
            </div>
            <form
              className="p-8 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  const idField = getIdField(editing);
                  const body = { id_tahun: parseInt(editIdTahun), jenis_penggunaan: editJenis, jumlah_dana: n(editJumlah), link_bukti: editLink, updated_by: role?.user?.name || role?.user?.username || "Unknown User", updated_at: new Date().toISOString() };
                  await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
                  setShowEditModal(false);
                  setEditing(null);
                  fetchRows();
                  fetchSummary();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Memperbarui Data', text: e.message });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tahun
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editIdTahun}
                  onChange={(e) => setEditIdTahun(e.target.value)}
                  required
                >
                  <option value="">Pilih...</option>
                  {Object.values(maps.tahun || {}).map((y) => (
                    <option key={y.id_tahun} value={y.id_tahun}>
                      {y.tahun || y.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Penggunaan
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editJenis}
                  onChange={(e) => setEditJenis(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Dana
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editJumlah}
                  onChange={(e) => setEditJumlah(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Bukti
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditing(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  type="submit"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
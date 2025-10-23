// src/components/tables/Tabel1A4.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../lib/api";
import { roleCan } from "../../lib/role";
import { useMaps } from "../../hooks/useMaps";
import { Badge, Button, Card, EmptyState, InputField, Modal, Checkbox, Select } from "../ui";
import { formatDecimal } from "../../lib/format";

const ENDPOINT = "/api/beban-kerja-dosen";
const TABLE_KEY = "tabel_1a4";
const LABEL = "1.A.4 Rata-rata Beban DTPR (EWMP) TS";

const n = (v) => Number(v || 0);

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, doRestoreSingle, selectedRows, setSelectedRows, showDeleted }) {
  const getDosenName = (id) => maps.pegawai[id]?.nama_lengkap || id;

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map((r) => r.id_beban_kerja));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* header bertingkat */}
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">No.</th>
              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">Nama DTPR</th>

              <th colSpan={3} className="px-4 py-3 text-center font-semibold border">
                SKS Pengajaran<sup>1)</sup> Pada
              </th>

              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">
                SKS Penelitian<sup>2)</sup>
              </th>
              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">
                SKS Pengabdian kepada Masyarakat<sup>2)</sup>
              </th>

              <th colSpan={2} className="px-4 py-3 text-center font-semibold border">
                SKS Manajemen<sup>3)</sup>
              </th>

              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">Total SKS</th>
              <th rowSpan={2} className="px-4 py-3 text-left font-semibold border">Aksi</th>
            </tr>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <th className="px-4 py-2 text-left font-semibold border">PS Sendiri</th>
              <th className="px-4 py-2 text-left font-semibold border">PS Lain, PT Sendiri</th>
              <th className="px-4 py-2 text-left font-semibold border">PT Lain</th>
              <th className="px-4 py-2 text-left font-semibold border">PT Sendiri</th>
              <th className="px-4 py-2 text-left font-semibold border">PT Lain</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => {
              const pengajaranTotal = n(r.sks_pengajaran);
              const pengajaranPsSendiri = pengajaranTotal > 0 ? pengajaranTotal / 3 : 0;
              const pengajaranPsLainPtSendiri = pengajaranTotal > 0 ? pengajaranTotal / 3 : 0;
              const pengajaranPtLain = pengajaranTotal > 0 ? pengajaranTotal / 3 : 0;

              const penelitian = n(r.sks_penelitian);
              const pkm = n(r.sks_pkm);

              const manajemenTotal = n(r.sks_manajemen);
              const manajemenPtSendiri = manajemenTotal > 0 ? manajemenTotal / 2 : 0;
              const manajemenPtLain = manajemenTotal > 0 ? manajemenTotal / 2 : 0;

              const total =
                pengajaranPsSendiri +
                pengajaranPsLainPtSendiri +
                pengajaranPtLain +
                penelitian +
                pkm +
                manajemenPtSendiri +
                manajemenPtLain;

              return (
                <tr
                  key={i}
                  className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
                >
                  <td className="px-4 py-3 align-middle border">{i + 1}.</td>
                  <td className="px-4 py-3 align-middle border">
                    <span className="font-medium">{getDosenName(r.id_dosen)}</span>
                  </td>

                  <td className="px-4 py-3 align-middle border">{formatDecimal(pengajaranPsSendiri)}</td>
                  <td className="px-4 py-3 align-middle border">{formatDecimal(pengajaranPsLainPtSendiri)}</td>
                  <td className="px-4 py-3 align-middle border">{formatDecimal(pengajaranPtLain)}</td>

                  <td className="px-4 py-3 align-middle border">{formatDecimal(penelitian)}</td>
                  <td className="px-4 py-3 align-middle border">{formatDecimal(pkm)}</td>

                  <td className="px-4 py-3 align-middle border">{formatDecimal(manajemenPtSendiri)}</td>
                  <td className="px-4 py-3 align-middle border">{formatDecimal(manajemenPtLain)}</td>

                  <td className="px-4 py-3 align-middle border font-semibold">{formatDecimal(total)}</td>

                  <td className="px-4 py-3 align-middle border whitespace-nowrap">
                    {!showDeleted && canUpdate && (
                      <Button variant="soft" className="mr-2" onClick={() => setEditing(r)}>
                        Edit
                      </Button>
                    )}
                    {!showDeleted && canDelete && (
                      <Button variant="ghost" onClick={() => doDelete(r)}>
                        Hapus
                      </Button>
                    )}
                    {canDelete && showDeleted && r.deleted_at && (
                      <Button
                        variant="outline"
                        className="mr-2 text-indigo-600"
                        onClick={() => doRestoreSingle(r)}
                      >
                        Pulihkan
                      </Button>
                    )}
                    {canDelete && showDeleted && (
                      <Button
                        variant="ghost"
                        className="ml-2 text-red-600"
                        onClick={() => doHardDelete(r)}
                      >
                        Hapus Permanen
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td className="px-4" colSpan={12}>
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
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

  // multi-select & soft-delete
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  // filter state
  const [selectedYear, setSelectedYear] = useState('');

  // create state
  const [newIdTahun, setNewIdTahun] = useState("");
  const [newIdDosen, setNewIdDosen] = useState("");
  // pengajaran split
  const [newPengajaranPsSendiri, setNewPengajaranPsSendiri] = useState("");
  const [newPengajaranPsLainPtSendiri, setNewPengajaranPsLainPtSendiri] = useState("");
  const [newPengajaranPtLain, setNewPengajaranPtLain] = useState("");
  // penelitian & pkm
  const [newPenelitian, setNewPenelitian] = useState("");
  const [newPkm, setNewPkm] = useState("");
  // manajemen split
  const [newManajemenPtSendiri, setNewManajemenPtSendiri] = useState("");
  const [newManajemenPtLain, setNewManajemenPtLain] = useState("");

  // edit state
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

  const doDelete = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const idField = getIdField(row);
    await apiFetch(`${ENDPOINT}/${row?.[idField]}`, { method: "DELETE" });
    fetchRows();
  };

  const doHardDelete = async (row) => {
    if (!confirm("Yakin hapus data ini secara permanen?")) return;
    const idField = getIdField(row);
    await apiFetch(`${ENDPOINT}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
    fetchRows();
  };

  const doRestoreSingle = async (row) => {
    if (!confirm("Yakin pulihkan data ini?")) return;
    try {
      setLoading(true);
      const idField = getIdField(row);
      await apiFetch(`${ENDPOINT}/${row?.[idField]}/restore`, {
        method: "POST",
      });
      fetchRows();
    } catch (e) {
      alert("Gagal memulihkan data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const doRestoreMultiple = async () => {
    if (!selectedRows.length) {
      alert("Pilih setidaknya satu baris untuk dipulihkan.");
      return;
    }
    if (!confirm(`Yakin pulihkan ${selectedRows.length} data ini?`)) return;

    try {
      setLoading(true);
      await apiFetch(`${ENDPOINT}/restore-multiple`, {
        method: "POST",
        body: JSON.stringify({ ids: selectedRows }),
      });
      setSelectedRows([]);
      fetchRows();
    } catch (e) {
      alert("Gagal memulihkan data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // helper total (create)
  const newTotal =
    n(newPengajaranPsSendiri) +
    n(newPengajaranPsLainPtSendiri) +
    n(newPengajaranPtLain) +
    n(newPenelitian) +
    n(newPkm) +
    n(newManajemenPtSendiri) +
    n(newManajemenPtLain);

  // helper total (edit)
  const editTotal =
    n(editPengajaranPsSendiri) +
    n(editPengajaranPsLainPtSendiri) +
    n(editPengajaranPtLain) +
    n(editPenelitian) +
    n(editPkm) +
    n(editManajemenPtSendiri) +
    n(editManajemenPtLain);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{LABEL}</h3>
        <div className="flex items-center gap-2 text-sm">
          {/* Filter Tahun */}
          <label htmlFor="filter-tahun" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter Tahun</label>
          <Select
            id="filter-tahun"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={[
              { value: '', label: 'Semua Tahun' },
              ...Object.values(maps.tahun).map((y) => ({ value: y.id_tahun, label: y.tahun }))
            ]}
            className="w-40"
          />

          {canDelete && (
            <Button
              variant="ghost"
              onClick={() => setShowDeleted((prev) => !prev)}
              className={showDeleted ? "bg-indigo-50 dark:bg-indigo-500/20" : ""}
            >
              {showDeleted ? "Sembunyikan yang Dihapus" : "Tampilkan yang Dihapus"}
            </Button>
          )}
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <Button variant="primary" onClick={doRestoreMultiple}>
              Pulihkan ({selectedRows.length})
            </Button>
          )}
          <Badge>{rows.length} baris</Badge>
          {canCreate && <Button variant="primary" onClick={() => setShowCreateModal(true)}>+ Buat Baru</Button>}
        </div>
      </div>

      {error && (
        <Card className="p-3 text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/30">
          {error}
        </Card>
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
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showDeleted={showDeleted}
      />

      {/* Create */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah Data EWMP">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const body = {
                id_tahun: parseInt(newIdTahun),
                id_dosen: parseInt(newIdDosen),

                // sks_pengajaran: (deprecated, gunakan split sks pengajaran)
                sks_pengajaran: n(newPengajaranPsSendiri) + n(newPengajaranPsLainPtSendiri) + n(newPengajaranPtLain),
                sks_penelitian: n(newPenelitian),
                sks_pkm: n(newPkm),
                // sks_manajemen: (deprecated, gunakan split sks manajemen)
                sks_manajemen: n(newManajemenPtSendiri) + n(newManajemenPtLain),
              };
              await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
              setShowCreateModal(false);
              // reset
              setNewIdTahun(""); setNewIdDosen("");
              setNewPengajaranPsSendiri(""); setNewPengajaranPsLainPtSendiri(""); setNewPengajaranPtLain("");
              setNewPenelitian(""); setNewPkm("");
              setNewManajemenPtSendiri(""); setNewManajemenPtLain("");
              fetchRows();
            } catch (e) {
              alert("Gagal menambah data: " + e.message);
            } finally { setLoading(false); }
          }}
        >
          <InputField
            label="Tahun"
            type="select"
            value={newIdTahun}
            onChange={(e) => setNewIdTahun(e.target.value)}
            options={Object.values(maps.tahun).map((y) => ({ value: y.id_tahun, label: y.tahun }))}
            required
          />
          <InputField
            label="Nama Dosen"
            type="select"
            value={newIdDosen}
            onChange={(e) => setNewIdDosen(e.target.value)}
            options={Object.values(maps.pegawai).map((p) => ({ value: p.id_pegawai, label: p.nama_lengkap }))}
            required
          />

          {/* Grid sesuai header tabel */}
          <Card className="p-3">
            <div className="text-sm font-semibold mb-2">SKS Pengajaran<sup>1)</sup> Pada</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InputField label="PS Sendiri" type="number" step="0.01" min="0"
                value={newPengajaranPsSendiri} onChange={(e)=>setNewPengajaranPsSendiri(e.target.value)} required />
              <InputField label="PS Lain, PT Sendiri" type="number" step="0.01" min="0"
                value={newPengajaranPsLainPtSendiri} onChange={(e)=>setNewPengajaranPsLainPtSendiri(e.target.value)} required />
              <InputField label="PT Lain" type="number" step="0.01" min="0"
                value={newPengajaranPtLain} onChange={(e)=>setNewPengajaranPtLain(e.target.value)} required />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="SKS Penelitian" type="number" step="0.01" min="0"
              value={newPenelitian} onChange={(e)=>setNewPenelitian(e.target.value)} required />
            <InputField label="SKS Pengabdian kepada Masyarakat" type="number" step="0.01" min="0"
              value={newPkm} onChange={(e)=>setNewPkm(e.target.value)} required />
          </div>

          <Card className="p-3">
            <div className="text-sm font-semibold mb-2">SKS Manajemen<sup>3)</sup></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputField label="PT Sendiri" type="number" step="0.01" min="0"
                value={newManajemenPtSendiri} onChange={(e)=>setNewManajemenPtSendiri(e.target.value)} required />
              <InputField label="PT Lain" type="number" step="0.01" min="0"
                value={newManajemenPtLain} onChange={(e)=>setNewManajemenPtLain(e.target.value)} required />
            </div>
          </Card>

          <div className="text-sm opacity-70">Total SKS (preview): <span className="font-medium">{formatDecimal(newTotal)}</span></div>

          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={loading}>Simpan</Button>
            <Button type="button" variant="soft" onClick={() => setShowCreateModal(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Data EWMP">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const idField = getIdField(editing);
              const body = {
                id_tahun: parseInt(editIdTahun),
                id_dosen: parseInt(editIdDosen),

                sks_pengajaran: n(editPengajaranPsSendiri) + n(editPengajaranPsLainPtSendiri) + n(editPengajaranPtLain),
                sks_penelitian: n(editPenelitian),
                sks_pkm: n(editPkm),
                sks_manajemen: n(editManajemenPtSendiri) + n(editManajemenPtLain),
              };
              await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, {
                method: "PUT",
                body: JSON.stringify(body),
              });
              setShowEditModal(false);
              setEditing(null);
              fetchRows();
            } catch (e) {
              alert("Gagal mengupdate data: " + e.message);
            } finally { setLoading(false); }
          }}
        >
          <InputField
            label="Tahun"
            type="select"
            value={editIdTahun}
            onChange={(e) => setEditIdTahun(e.target.value)}
            options={Object.values(maps.tahun).map((y) => ({ value: y.id_tahun, label: y.tahun }))}
            required
          />
          <InputField
            label="Nama Dosen"
            type="select"
            value={editIdDosen}
            onChange={(e) => setEditIdDosen(e.target.value)}
            options={Object.values(maps.pegawai).map((p) => ({ value: p.id_pegawai, label: p.nama_lengkap }))}
            required
          />

          <Card className="p-3">
            <div className="text-sm font-semibold mb-2">SKS Pengajaran<sup>1)</sup> Pada</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InputField label="PS Sendiri" type="number" step="0.01" min="0"
                value={editPengajaranPsSendiri} onChange={(e)=>setEditPengajaranPsSendiri(e.target.value)} required />
              <InputField label="PS Lain, PT Sendiri" type="number" step="0.01" min="0"
                value={editPengajaranPsLainPtSendiri} onChange={(e)=>setEditPengajaranPsLainPtSendiri(e.target.value)} required />
              <InputField label="PT Lain" type="number" step="0.01" min="0"
                value={editPengajaranPtLain} onChange={(e)=>setEditPengajaranPtLain(e.target.value)} required />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField label="SKS Penelitian" type="number" step="0.01" min="0"
              value={editPenelitian} onChange={(e)=>setEditPenelitian(e.target.value)} required />
            <InputField label="SKS Pengabdian kepada Masyarakat" type="number" step="0.01" min="0"
              value={editPkm} onChange={(e)=>setEditPkm(e.target.value)} required />
          </div>

          <Card className="p-3">
            <div className="text-sm font-semibold mb-2">SKS Manajemen<sup>3)</sup></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <InputField label="PT Sendiri" type="number" step="0.01" min="0"
                value={editManajemenPtSendiri} onChange={(e)=>setEditManajemenPtSendiri(e.target.value)} required />
              <InputField label="PT Lain" type="number" step="0.01" min="0"
                value={editManajemenPtLain} onChange={(e)=>setEditManajemenPtLain(e.target.value)} required />
            </div>
          </Card>

          <div className="text-sm opacity-70">Total SKS (preview): <span className="font-medium">{formatDecimal(editTotal)}</span></div>

          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={loading}>Simpan</Button>
            <Button type="button" variant="soft" onClick={() => setShowEditModal(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

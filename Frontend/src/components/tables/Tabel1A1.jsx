import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../lib/api";
import { roleCan } from "../../lib/role";
import { useMaps } from "../../hooks/useMaps";
import { Badge, Button, Card, EmptyState, Modal, SectionTitle } from "../ui";

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

  const toYearText = (id) => maps.tahun[id]?.nama || maps.tahun[id]?.tahun || id;

  const getPeriode = (row) => {
    if (row?.periode_mulai && row?.periode_selesai) {
      const tahunMulai = row.periode_mulai.substring(0, 4);
      const tahunSelesai = row.periode_selesai.substring(0, 4);
      return `${tahunMulai}/${tahunSelesai}`;
    }
    return row?.periode || "";
  };

  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0 z-10">
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-1/6">Unit Kerja</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-1/6">Nama Ketua</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-[120px]">Periode Jabatan</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-1/6">Pendidikan Terakhir</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-1/6">Jabatan Struktural</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-auto">Tugas Pokok dan Fungsi</th>
              <th className="px-2 py-2 text-left font-semibold tracking-wide w-[150px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition">
                <td className="px-2 py-2 align-middle w-1/6"><span className="font-medium">{getUnitName(r)}</span></td>
                <td className="px-2 py-2 align-middle w-1/6">{getKetuaName(r)}</td>
                <td className="px-2 py-2 align-middle w-[120px]"><Badge>{getPeriode(r)}</Badge></td>
                <td className="px-2 py-2 align-middle w-1/6">{r.pendidikan_terakhir || ""}</td>
                <td className="px-2 py-2 align-middle w-1/6">{r.jabatan_struktural || ""}</td>
                <td className="px-2 py-2 align-middle w-auto">{r.tupoksi || ""}</td>
                <td className="px-2 py-2 align-middle w-[150px]">
                  {!showDeleted && canUpdate && (
                    <Button variant="soft" className="mr-2 text-xs" onClick={() => setEditing(r)}>Edit</Button>
                  )}
                  {!showDeleted && canDelete && (
                    <Button variant="ghost" className="mr-2 text-xs" onClick={() => doDelete(r)}>Hapus</Button>
                  )}
                  {showDeleted && canDelete && (
                    <Button variant="danger" className="mr-2 text-xs flex-shrink-0" onClick={() => doHardDelete(r)}>
                      Hapus Permanen
                    </Button>
                  )}
                  {showDeleted && canUpdate && (
                    <Button variant="success" className="text-xs flex-shrink-0" onClick={() => doRestore(r)}>
                      Pulihkan
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (<tr><td className="px-4" colSpan={7}><EmptyState /></td></tr>)}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function Tabel1A1({ auth, role }) {
  const table = { key: "tabel_1a1", label: "1.A.1 Pimpinan & Tupoksi UPPS/PS", path: "/api/pimpinan-upps-ps" };

  // ⬇️ Paksa load master tanpa bergantung ke auth.user agar dropdown selalu terisi
  const { maps: mapsFromHook } = useMaps(true);
  const maps = mapsFromHook ?? { units: {}, pegawai: {}, tahun: {}, ref_jabatan_struktural: {} };

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relational] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false); // New state for toggling deleted items

  // form create
  const [newIdUnit, setNewIdUnit] = useState("");
  const [newIdPegawai, setNewIdPegawai] = useState("");
  const [newPeriodeMulai, setNewPeriodeMulai] = useState("");
  const [newPeriodeSelesai, setNewPeriodeSelesai] = useState("");
  const [newTupoksi, setNewTupoksi] = useState("");
  const [newIdJabatan, setNewIdJabatan] = useState(""); // Tambah state untuk id_jabatan

  // form edit
  const [editIdUnit, setEditIdUnit] = useState("");
  const [editIdPegawai, setEditIdPegawai] = useState("");
  const [editPeriodeMulai, setEditPeriodeMulai] = useState("");
  const [editPeriodeSelesai, setEditPeriodeSelesai] = useState("");
  const [editTupoksi, setEditTupoksi] = useState("");
  const [editIdJabatan, setEditIdJabatan] = useState(""); // Tambah state untuk id_jabatan

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

  useEffect(() => { fetchRows(); }, [showDeleted]); // Re-fetch when showDeleted changes

  useEffect(() => {
    if (editing) {
      setEditIdUnit(editing.id_unit ?? "");
      setEditIdPegawai(editing.id_pegawai ?? "");
      setEditPeriodeMulai(editing.periode_mulai ?? ""); // Pastikan menjadi string kosong jika null
      setEditPeriodeSelesai(editing.periode_selesai ?? ""); // Pastikan menjadi string kosong jika null
      setEditTupoksi(editing.tupoksi ?? "");
      setEditIdJabatan(editing.id_jabatan ?? ""); // Set id_jabatan
      setShowEditModal(true);
    }
  }, [editing]);

  const doDelete = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const idField = getIdField(row);
    await apiFetch(`${table.path}/${row?.[idField]}`, { method: "DELETE" });
    fetchRows();
  };

  const doHardDelete = async (row) => {
    if (!confirm("Yakin ingin MENGHAPUS PERMANEN data ini? Tindakan ini tidak dapat dibatalkan.")) return;
    const idField = getIdField(row);
    await apiFetch(`${table.path}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
    fetchRows();
  };

  const doRestore = async (row) => {
    if (!confirm("Yakin ingin memulihkan data ini?")) return;
    const idField = getIdField(row);
    await apiFetch(`${table.path}/${row?.[idField]}/restore`, { method: "POST" });
    fetchRows();
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        title={table.label}
        right={
          <div className="flex items-center gap-2 text-sm">
            <Badge>{rows.length} baris</Badge>
            <Button
              variant="soft"
              onClick={() => setShowDeleted(!showDeleted)}
              className={showDeleted ? "bg-indigo-500 text-white" : ""}
            >
              {showDeleted ? "Sembunyikan yang Dihapus" : "Tampilkan yang Dihapus"}
            </Button>
            {canCreate && <Button variant="primary" onClick={() => setShowCreateModal(true)}>+ Buat Baru</Button>}
          </div>
        }
      />

      {error && <Card className="p-3 text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/30">{error}</Card>}

      <PrettyTable1A1
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        doRestore={doRestore}
        showDeleted={showDeleted}
      />

      {/* Create */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah Data Pimpinan & Tupoksi UPPS/PS">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const payload = {
                id_unit: parseInt(newIdUnit || 0),
                id_pegawai: parseInt(newIdPegawai || 0),
                periode_mulai: newPeriodeMulai,
                periode_selesai: newPeriodeSelesai,
                tupoksi: (newTupoksi || "").trim(),
                id_jabatan: parseInt(newIdJabatan || 0), // Tambah id_jabatan
              };
              await apiFetch(table.path, { method: "POST", body: JSON.stringify(payload) });
              setShowCreateModal(false);
              setNewIdUnit(""); setNewIdPegawai(""); setNewPeriodeMulai(""); setNewPeriodeSelesai(""); setNewTupoksi(""); setNewIdJabatan("");
              fetchRows();
            } catch (e) {
              alert("Gagal menambah data: " + e.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Unit Kerja</label>
            <select className="w-full p-3 rounded-2xl border" value={newIdUnit} onChange={(e)=>setNewIdUnit(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.units).map(u=> <option key={u.id_unit} value={u.id_unit}>{u.nama_unit || u.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pegawai</label>
            <select className="w-full p-3 rounded-2xl border" value={newIdPegawai} onChange={(e)=>setNewIdPegawai(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.pegawai).map(p=> <option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_lengkap || p.nama}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Periode Mulai</label><input type="date" className="w-full p-3 rounded-2xl border" value={newPeriodeMulai} onChange={(e)=>setNewPeriodeMulai(e.target.value)} required/></div>
            <div><label className="block text-sm font-medium mb-1">Periode Selesai</label><input type="date" className="w-full p-3 rounded-2xl border" value={newPeriodeSelesai} onChange={(e)=>setNewPeriodeSelesai(e.target.value)} required/></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jabatan Struktural</label>
            <select className="w-full p-3 rounded-2xl border" value={newIdJabatan} onChange={(e)=>setNewIdJabatan(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.ref_jabatan_struktural).map(j=> <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Tupoksi</label><textarea className="w-full p-3 rounded-2xl border" value={newTupoksi} onChange={(e)=>setNewTupoksi(e.target.value)} required/></div>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 rounded-xl text-white bg-indigo-600" disabled={loading} type="submit">Simpan</button>
            <button className="px-3 py-2 rounded-xl border" type="button" onClick={()=>setShowCreateModal(false)}>Batal</button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Data Pimpinan & Tupoksi UPPS/PS">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const idField = getIdField(editing);
              const payload = {
                id_unit: parseInt(editIdUnit || 0),
                id_pegawai: parseInt(editIdPegawai || 0),
                periode_mulai: editPeriodeMulai,
                periode_selesai: editPeriodeSelesai,
                tupoksi: (editTupoksi || "").trim(),
                id_jabatan: parseInt(editIdJabatan || 0), // Tambah id_jabatan
              };
              await apiFetch(`${table.path}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(payload) });
              setShowEditModal(false); setEditing(null); fetchRows();
            } catch (e) {
              alert("Gagal mengupdate data: " + e.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Unit Kerja</label>
            <select className="w-full p-3 rounded-2xl border" value={editIdUnit} onChange={(e)=>setEditIdUnit(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.units).map(u=> <option key={u.id_unit} value={u.id_unit}>{u.nama_unit || u.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pegawai</label>
            <select className="w-full p-3 rounded-2xl border" value={editIdPegawai} onChange={(e)=>setEditIdPegawai(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.pegawai).map(p=> <option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_lengkap || p.nama}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Periode Mulai</label><input type="date" className="w-full p-3 rounded-2xl border" value={editPeriodeMulai} onChange={(e)=>setEditPeriodeMulai(e.target.value)} required/></div>
            <div><label className="block text-sm font-medium mb-1">Periode Selesai</label><input type="date" className="w-full p-3 rounded-2xl border" value={editPeriodeSelesai} onChange={(e)=>setEditPeriodeSelesai(e.target.value)} required/></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jabatan Struktural</label>
            <select className="w-full p-3 rounded-2xl border" value={editIdJabatan} onChange={(e)=>setEditIdJabatan(e.target.value)} required>
              <option value="">Pilih...</option>
              {Object.values(maps.ref_jabatan_struktural).map(j=> <option key={j.id_jabatan} value={j.id_jabatan}>{j.nama_jabatan}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Tupoksi</label><textarea className="w-full p-3 rounded-2xl border" value={editTupoksi} onChange={(e)=>setEditTupoksi(e.target.value)} required/></div>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 rounded-xl text-white bg-indigo-600" disabled={loading} type="submit">Simpan</button>
            <button className="px-3 py-2 rounded-xl border" type="button" onClick={()=>setShowEditModal(false)}>Batal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// src/components/tables/Tabel1A5.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../lib/api";
import { roleCan } from "../../lib/role";
import { useMaps } from "../../hooks/useMaps";
import { Badge, Button, Card, EmptyState, InputField, Modal } from "../ui";

const ENDPOINT = "/api/audit-mutu-internal";
const TABLE_KEY = "tabel_audit_mutu_internal";
const LABEL = "Audit Mutu Internal";

const n = (v) => Number(v || 0);

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, showDeleted, doRestore }) {
  const getUnitName = (id) => maps.units[id]?.nama_unit || id;
  const getTahunText = (id) => maps.tahun[id]?.tahun || id;

  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <th className="px-4 py-3 text-left font-semibold border">No.</th>
              <th className="px-4 py-3 text-left font-semibold border">Unit SPMI</th>
              <th className="px-4 py-3 text-left font-semibold border">Nama Unit SPMI</th>
              <th className="px-4 py-3 text-left font-semibold border">Dokumen SPMI</th>
              <th className="px-4 py-3 text-center font-semibold border">Jumlah Auditor Mutu Internal</th>
              <th className="px-4 py-3 text-center font-semibold border">Certified</th>
              <th className="px-4 py-3 text-center font-semibold border">Non Certified</th>
              <th className="px-4 py-3 text-left font-semibold border">Frekuensi audit/monev per tahun</th>
              <th className="px-4 py-3 text-left font-semibold border">Bukti Certified Auditor</th>
              <th className="px-4 py-3 text-left font-semibold border">Laporan Audit</th>
              <th className="px-4 py-3 text-left font-semibold border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => {
                const totalAuditors = (r.jumlah_auditor_certified || 0) + (r.jumlah_auditor_noncertified || 0);
                return (
                  <tr
                    key={i}
                    className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
                  >
                    <td className="px-4 py-3 align-middle border">{i + 1}.</td>
                    <td className="px-4 py-3 align-middle border">{r.id_unit}</td>
                    <td className="px-4 py-3 align-middle border">
                      <span className="font-medium">{getUnitName(r.id_unit)}</span>
                    </td>
                    <td className="px-4 py-3 align-middle border">{r.dokumen_spmi}</td>
                    <td className="px-4 py-3 align-middle border">{totalAuditors}</td>
                    <td className="px-4 py-3 align-middle border">{r.jumlah_auditor_certified}</td>
                    <td className="px-4 py-3 align-middle border">{r.jumlah_auditor_noncertified}</td>
                    <td className="px-4 py-3 align-middle border">{r.frekuensi_audit}</td>
                    <td className="px-4 py-3 align-middle border">
                      {r.bukti_certified_url ? (
                        <a href={r.bukti_certified_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lihat Bukti</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle border">
                      {r.laporan_audit_url ? (
                        <a href={r.laporan_audit_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lihat Laporan</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle border whitespace-nowrap">
                      {!showDeleted && canUpdate && (
                        <Button variant="soft" className="mr-2" onClick={() => setEditing(r)}>
                          Edit
                        </Button>
                      )}
                      {!showDeleted && canDelete && (
                        <Button variant="ghost" className="mr-2" onClick={() => doDelete(r)}>
                          Hapus
                        </Button>
                      )}
                      {showDeleted && canDelete && (
                        <Button variant="danger" className="mr-2" onClick={() => doHardDelete(r)}>
                          Hapus Permanen
                        </Button>
                      )}
                      {showDeleted && canUpdate && (
                        <Button variant="success" onClick={() => doRestore(r)}>
                          Pulihkan
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}

            {rows.length === 0 && (
              <tr>
                <td className="px-4" colSpan={11}>
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

export default function Tabel1B({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false); // New state for toggling deleted items

  // create state
  const [newIdUnit, setNewIdUnit] = useState("");
  const [newIdTahun, setNewIdTahun] = useState("");
  const [newFrekuensiAudit, setNewFrekuensiAudit] = useState("");
  const [newDokumenSpmi, setNewDokumenSpmi] = useState("");
  const [newLaporanAuditUrl, setNewLaporanAuditUrl] = useState("");
  const [newJumlahAuditorCertified, setNewJumlahAuditorCertified] = useState("");
  const [newJumlahAuditorNoncertified, setNewJumlahAuditorNoncertified] = useState("");
  const [newBuktiCertifiedUri, setNewBuktiCertifiedUri] = useState(""); // New state

  // edit state
  const [editIdUnit, setEditIdUnit] = useState("");
  const [editIdTahun, setEditIdTahun] = useState("");
  const [editFrekuensiAudit, setEditFrekuensiAudit] = useState("");
  const [editDokumenSpmi, setEditDokumenSpmi] = useState("");
  const [editLaporanAuditUrl, setEditLaporanAuditUrl] = useState("");
  const [editJumlahAuditorCertified, setEditJumlahAuditorCertified] = useState("");
  const [editJumlahAuditorNoncertified, setEditJumlahAuditorNoncertified] = useState("");
  const [editBuktiCertifiedUri, setEditBuktiCertifiedUri] = useState(""); // New state

  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  async function fetchRows() {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.append("relasi", "1");
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
  }, [showDeleted]); // Re-fetch when showDeleted changes

  useEffect(() => {
    if (editing) {
      setEditIdUnit(editing.id_unit || "");
      setEditIdTahun(editing.id_tahun || "");
      setEditFrekuensiAudit(editing.frekuensi_audit || "");
      setEditDokumenSpmi(editing.dokumen_spmi || "");
      setEditLaporanAuditUrl(editing.laporan_audit_url || "");
      setEditJumlahAuditorCertified(editing.jumlah_auditor_certified || "");
      setEditJumlahAuditorNoncertified(editing.jumlah_auditor_noncertified || "");
      setEditBuktiCertifiedUri(editing.bukti_certified_url || ""); // Set new state
      setShowEditModal(true);
    }
  }, [editing]);

  const doDelete = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const idField = getIdField(row);
    const deleteUrl = `${ENDPOINT}/${row?.[idField]}`;
    console.log("DELETE URL:", deleteUrl); // Added console.log
    await apiFetch(deleteUrl, { method: "DELETE" });
    fetchRows();
  };

  const doHardDelete = async (row) => {
    if (!confirm("Yakin ingin MENGHAPUS PERMANEN data ini? Tindakan ini tidak dapat dibatalkan.")) return;
    const idField = getIdField(row);
    const hardDeleteUrl = `${ENDPOINT}/${row?.[idField]}/hard-delete`;
    console.log("HARD DELETE URL:", hardDeleteUrl);
    await apiFetch(hardDeleteUrl, { method: "DELETE" });
    fetchRows();
  };

  const doRestore = async (row) => {
    if (!confirm("Yakin ingin memulihkan data ini?")) return;
    const idField = getIdField(row);
    const restoreUrl = `${ENDPOINT}/${row?.[idField]}/restore`;
    console.log("RESTORE URL:", restoreUrl);
    await apiFetch(restoreUrl, { method: "POST" }); // Restore is a POST request
    fetchRows();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{LABEL}</h3>
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
        showDeleted={showDeleted}
        doRestore={doRestore}
      />

      {/* Create */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tambah Data Audit Mutu Internal">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const body = {
                id_unit: parseInt(newIdUnit),
                id_tahun: parseInt(newIdTahun),
                frekuensi_audit: n(newFrekuensiAudit),
                dokumen_spmi: newDokumenSpmi,
                laporan_audit_url: newLaporanAuditUrl,
                jumlah_auditor_certified: n(newJumlahAuditorCertified),
                jumlah_auditor_noncertified: n(newJumlahAuditorNoncertified),
                bukti_certified_url: newBuktiCertifiedUri, // Include new state
              };
              await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
              setShowCreateModal(false);
              // reset
              setNewIdUnit(""); setNewIdTahun(""); setNewFrekuensiAudit("");
              setNewDokumenSpmi(""); setNewLaporanAuditUrl("");
              setNewJumlahAuditorCertified(""); setNewJumlahAuditorNoncertified("");
              setNewBuktiCertifiedUri(""); // Reset new state
              fetchRows();
            } catch (e) {
              alert("Gagal menambah data: " + e.message);
            } finally { setLoading(false); }
          }}
        >
          <InputField
            label="Unit SPMI"
            type="select"
            value={newIdUnit}
            onChange={(e) => setNewIdUnit(e.target.value)}
            options={Object.values(maps.units).map((u) => ({ value: u.id_unit, label: u.nama_unit }))}
            required
          />
          <InputField
            label="Tahun"
            type="select"
            value={newIdTahun}
            onChange={(e) => setNewIdTahun(e.target.value)}
            options={Object.values(maps.tahun).map((y) => ({ value: y.id_tahun, label: y.tahun }))}
            required
          />
          <InputField label="Frekuensi audit/monev per tahun" type="number" value={newFrekuensiAudit} onChange={(e) => setNewFrekuensiAudit(e.target.value)} required />
          <InputField label="Dokumen SPMI" type="text" value={newDokumenSpmi} onChange={(e) => setNewDokumenSpmi(e.target.value)} />
          <InputField label="Laporan Audit URL" type="text" value={newLaporanAuditUrl} onChange={(e) => setNewLaporanAuditUrl(e.target.value)} />
          <InputField label="Jumlah Auditor Certified" type="number" value={newJumlahAuditorCertified} onChange={(e) => setNewJumlahAuditorCertified(e.target.value)} required />
          <InputField label="Jumlah Auditor Non Certified" type="number" value={newJumlahAuditorNoncertified} onChange={(e) => setNewJumlahAuditorNoncertified(e.target.value)} required />
          <InputField label="Bukti Certified Auditor URL" type="text" value={newBuktiCertifiedUri} onChange={(e) => setNewBuktiCertifiedUri(e.target.value)} /> {/* New field */}

          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={loading}>Simpan</Button>
            <Button type="button" variant="soft" onClick={() => setShowCreateModal(false)}>Batal</Button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Data Audit Mutu Internal">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const idField = getIdField(editing);
              const body = {
                id_unit: parseInt(editIdUnit),
                id_tahun: parseInt(editIdTahun),
                frekuensi_audit: n(editFrekuensiAudit),
                dokumen_spmi: editDokumenSpmi,
                laporan_audit_url: editLaporanAuditUrl,
                jumlah_auditor_certified: n(editJumlahAuditorCertified),
                jumlah_auditor_noncertified: n(editJumlahAuditorNoncertified),
                bukti_certified_url: editBuktiCertifiedUri, // Include new state
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
            label="Unit SPMI"
            type="select"
            value={editIdUnit}
            onChange={(e) => setEditIdUnit(e.target.value)}
            options={Object.values(maps.units).map((u) => ({ value: u.id_unit, label: u.nama_unit }))}
            required
          />
          <InputField
            label="Tahun"
            type="select"
            value={editIdTahun}
            onChange={(e) => setEditIdTahun(e.target.value)}
            options={Object.values(maps.tahun).map((y) => ({ value: y.id_tahun, label: y.tahun }))}
            required
          />
          <InputField label="Frekuensi audit/monev per tahun" type="number" value={editFrekuensiAudit} onChange={(e) => setEditFrekuensiAudit(e.target.value)} required />
          <InputField label="Dokumen SPMI" type="text" value={editDokumenSpmi} onChange={(e) => setEditDokumenSpmi(e.target.value)} />
          <InputField label="Laporan Audit URL" type="text" value={editLaporanAuditUrl} onChange={(e) => setEditLaporanAuditUrl(e.target.value)} />
          <InputField label="Jumlah Auditor Certified" type="number" value={editJumlahAuditorCertified} onChange={(e) => setEditJumlahAuditorCertified(e.target.value)} required />
          <InputField label="Jumlah Auditor Non Certified" type="number" value={editJumlahAuditorNoncertified} onChange={(e) => setEditJumlahAuditorNoncertified(e.target.value)} required />
          <InputField label="Bukti Certified Auditor URL" type="text" value={editBuktiCertifiedUri} onChange={(e) => setEditBuktiCertifiedUri(e.target.value)} /> {/* New field */}

          <div className="flex gap-2 justify-end">
            <Button type="submit" variant="primary" disabled={loading}>Simpan</Button>
            <Button type="button" variant="soft" onClick={() => setShowEditModal(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// src/components/tables/Tabel1A2.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch, getIdField } from "../../lib/api";
import { roleCan } from "../../lib/role";
import { useMaps } from "../../hooks/useMaps";
import { Badge, Button, Card, EmptyState, Modal, SectionTitle, Checkbox } from "../ui";

/* ---------- Year selector (TS filter) ---------- */
function YearSelector({ maps, activeYear, setActiveYear }) {
  return (
    <select
      className="px-3 py-2 rounded-xl border"
      value={activeYear}
      onChange={(e) => setActiveYear(e.target.value)}
    >
      <option value="">Semua Tahun</option>
      {Object.values(maps.tahun).map((y) => (
        <option key={y.id_tahun} value={y.id_tahun}>
          {y.tahun || y.nama}
        </option>
      ))}
    </select>
  );
}

/* ---------- Tabel renderer ---------- */
function PrettyTable1A2({
  rows,
  maps,
  canUpdate,
  canDelete,
  setEditing,
  doDelete,
  doHardDelete,
  selectedRows,
  setSelectedRows,
  showDeleted,
}) {
  const toYearText = (id) => maps.tahun[id]?.nama || maps.tahun[id]?.tahun || id;
  const formatRupiah = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const numeric = Number(String(value).replace(/[^\d\-]/g, ""));
    if (Number.isNaN(numeric)) return String(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numeric);
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(rows.map((r) => r.id_sumber));
    }
  };

  const handleSelectRow = (id, isSelected) => {
    if (isSelected) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <th className="px-4 py-3 text-left font-semibold tracking-wide w-16">
                {showDeleted && (
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                )}
              </th>
              {[
                "Tahun",
                "Sumber Dana",
                "Jumlah Dana",
                "Link Bukti",
                "Aksi",
                showDeleted ? "Dihapus Pada" : null,
              ]
                .filter(Boolean)
                .map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
              >
                <td className="px-4 py-3 align-middle">
                  {showDeleted && r.deleted_at && (
                    <Checkbox
                      checked={selectedRows.includes(r.id_sumber)}
                      onChange={(e) => handleSelectRow(r.id_sumber, e.target.checked)}
                      className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                  )}
                </td>
                <td className="px-4 py-3 align-middle">
                  <Badge>{toYearText(r.id_tahun)}</Badge>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium">{r.sumber_dana || ""}</span>
                </td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.jumlah_dana)}</td>
                <td className="px-4 py-3 align-middle">
                  {r.link_bukti ? (
                    <a
                      href={r.link_bukti}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-indigo-600"
                    >
                      Bukti
                    </a>
                  ) : (
                    ""
                  )}
                </td>
                <td className="px-4 py-3 align-middle whitespace-nowrap">
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
                {showDeleted && (
                  <td className="px-4 py-3 align-middle">
                    {r.deleted_at ? new Date(r.deleted_at).toLocaleString() : "-"}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4" colSpan={showDeleted ? 7 : 6}>
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

/* ---------- Tabel Ringkasan Renderer ---------- */
function PrettyTable1A2Summary({ rows }) {
  const formatRupiah = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const numeric = Number(String(value).replace(/[^\d\-]/g, ""));
    if (Number.isNaN(numeric)) return String(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numeric);
  };

  return (
    <Card>
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              {["Sumber Pendanaan", "TS-4", "TS-3", "TS-2", "TS-1", "TS", "Link Bukti"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
              >
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium">{r.sumber_dana || ""}</span>
                </td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.ts_minus_4)}</td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.ts_minus_3)}</td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.ts_minus_2)}</td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.ts_minus_1)}</td>
                <td className="px-4 py-3 align-middle">{formatRupiah(r.ts)}</td>
                <td className="px-4 py-3 align-middle">
                  {r.link_bukti ? (
                    <a
                      href={r.link_bukti}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-indigo-600"
                    >
                      Bukti
                    </a>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4" colSpan={7}>
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

/* ---------- Page component ---------- */
export default function Tabel1A2({ auth, role }) {
  const table = {
    key: "tabel_1a2",
    label: "1.A.2 Sumber Pendanaan UPPS/PS",
    path: "/api/sumber-pendanaan",
  };

  // aman dari error "read 'user' of undefined"
  const { maps: mapsFromHook } = useMaps(auth?.user || true);
  const maps = mapsFromHook ?? { tahun: {} };

  const [rows, setRows] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]); // State baru untuk ringkasan
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // filter tahun (TS)
  const [activeYear, setActiveYear] = useState("");

  // multi-select & soft-delete
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  // form: create
  const [newIdTahun, setNewIdTahun] = useState("");
  const [newSumberDana, setNewSumberDana] = useState("");
  const [newJumlahDana, setNewJumlahDana] = useState("");
  const [newLinkBukti, setNewLinkBukti] = useState("");

  // form: edit
  const [editIdTahun, setEditIdTahun] = useState("");
  const [editSumberDana, setEditSumberDana] = useState("");
  const [editJumlahDana, setEditJumlahDana] = useState("");
  const [editLinkBukti, setEditLinkBukti] = useState("");

  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");

  // helper: angka tahun untuk sorting
  const yearKey = (id) => {
    const y = maps?.tahun?.[id]?.tahun || maps?.tahun?.[id]?.nama || id;
    const m = String(y).match(/\d{4}/); // ambil 4 digit tahun pertama (mis. "2025/2026" -> 2025)
    return m ? parseInt(m[0], 10) : Number(id) || 0;
  };

  // rows terurut berdasarkan tahun (DESC: terbaru → terlama)
  const rowsSorted = useMemo(() => {
    const clone = [...rows];
    clone.sort((a, b) => {
      const yb = yearKey(b.id_tahun);
      const ya = yearKey(a.id_tahun);
      if (yb !== ya) return yb - ya; // DESC
      // tie-breaker stabil
      return (a.id_sumber ?? 0) - (b.id_sumber ?? 0);
    });
    return clone;
  }, [rows, maps]);

  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      const qs = activeYear ? `&id_tahun=${encodeURIComponent(activeYear)}` : "";
      const deletedQs = showDeleted ? `&include_deleted=1` : "";
      const data = await apiFetch(`${table.path}?relasi=1${qs}${deletedQs}`);

      // Filter data berdasarkan showDeleted
      const filteredData = showDeleted
        ? data.filter((row) => row.deleted_at !== null)
        : data.filter((row) => row.deleted_at === null);

      setRows(Array.isArray(filteredData) ? filteredData : filteredData?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryRows = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/api/sumber-pendanaan/summary"); // Endpoint ringkasan
      setSummaryRows(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data ringkasan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchSummaryRows();
    setSelectedRows([]); // Reset pilihan saat tahun / showDeleted berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeYear, showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdTahun(editing.id_tahun ?? activeYear ?? "");
      setEditSumberDana(editing.sumber_dana ?? "");
      setEditJumlahDana(editing.jumlah_dana ?? "");
      setEditLinkBukti(editing.link_bukti ?? "");
      setShowEditModal(true);
    }
  }, [editing, activeYear]);

  const doDelete = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    const idField = getIdField(row);
    await apiFetch(`${table.path}/${row?.[idField]}`, { method: "DELETE" });
    fetchRows();
  };

  const doHardDelete = async (row) => {
    if (!confirm("Yakin hapus data ini secara permanen?")) return;
    const idField = getIdField(row);
    await apiFetch(`${table.path}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
    fetchRows();
  };

  const doRestoreMultiple = async () => {
    if (!selectedRows.length) {
      alert("Pilih setidaknya satu baris untuk dipulihkan.");
      return;
    }
    if (!confirm(`Yakin pulihkan ${selectedRows.length} data ini?`)) return;

    try {
      setLoading(true);
      await apiFetch(`${table.path}/restore-multiple`, {
        method: "POST",
        body: JSON.stringify({ ids: selectedRows }),
      });
      setSelectedRows([]);
      fetchRows();
      fetchSummaryRows();
    } catch (e) {
      alert("Gagal memulihkan data: " + e.message);
    }
  };

  const downloadBlob = async (resp, filename) => {
    const blob = await resp.blob();
    const a = document.createElement("a");
    const href = window.URL.createObjectURL(blob);
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(href);
  };

  const doExportDoc = async () => {
    const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "";
    const resp = await fetch(`${table.path}/export-doc${qs}`, {
      method: "POST",
      credentials: "include",
    });
    if (!resp.ok) {
      const err = await resp.json();
      return alert("Gagal ekspor DOCX: " + err.message);
    }
    await downloadBlob(resp, `sumber_pendanaan_${activeYear || "semua"}.docx`);
  };

  const doExportPdf = async () => {
    const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "";
    const resp = await fetch(`${table.path}/export-pdf${qs}`, {
      method: "POST",
      credentials: "include",
    });
    if (!resp.ok) {
      const err = await resp.json();
      return alert("Gagal ekspor PDF: " + err.message);
    }
    await downloadBlob(resp, `sumber_pendanaan_${activeYear || "semua"}.pdf`);
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        title={table.label}
        right={
          <div className="flex items-center gap-2 text-sm">
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
            <YearSelector maps={maps} activeYear={activeYear} setActiveYear={setActiveYear} />
            <Badge>{rowsSorted.length} baris</Badge>
            <Button variant="soft" onClick={doExportDoc}>
              Ekspor DOCX
            </Button>
            <Button variant="soft" onClick={doExportPdf}>
              Ekspor PDF
            </Button>
            {canCreate && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + Buat Baru
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Card className="p-3 text-red-700 dark:text-red-400 bg-red-50/80 dark:bg-red-500/10 border-red-200/60 dark:border-red-500/30">
          {error}
        </Card>
      )}

      <PrettyTable1A2
        rows={rowsSorted}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showDeleted={showDeleted}
      />

      {/* Ringkasan */}
      <SectionTitle title="Ringkasan Sumber Pendanaan (TS, TS-1, TS-2, TS-3, TS-4)" className="mt-8" />
      <PrettyTable1A2Summary rows={summaryRows} />

      {/* Create */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tambah Data Sumber Pendanaan"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              await apiFetch(table.path, {
                method: "POST",
                body: JSON.stringify({
                  id_tahun: parseInt(newIdTahun || activeYear || 0),
                  sumber_dana: (newSumberDana || "").trim(),
                  jumlah_dana: String(newJumlahDana ?? "").trim(),
                  link_bukti: (newLinkBukti || "").trim(),
                }),
              });
              setShowCreateModal(false);
              setNewIdTahun("");
              setNewSumberDana("");
              setNewJumlahDana("");
              setNewLinkBukti("");
              fetchRows();
              fetchSummaryRows();
            } catch (e) {
              alert("Gagal menambah data: " + e.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              className="w-full p-3 rounded-2xl border"
              value={newIdTahun || activeYear}
              onChange={(e) => setNewIdTahun(e.target.value)}
              required
            >
              <option value="">Pilih...</option>
              {Object.values(maps.tahun).map((y) => (
                <option key={y.id_tahun} value={y.id_tahun}>
                  {y.tahun || y.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sumber Dana</label>
            <input
              className="w-full p-3 rounded-2xl border"
              placeholder="mis. DIPA, Hibah, Kerjasama, dll."
              value={newSumberDana}
              onChange={(e) => setNewSumberDana(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jumlah Dana</label>
            <input
              className="w-full p-3 rounded-2xl border"
              value={newJumlahDana}
              onChange={(e) => setNewJumlahDana(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link Bukti</label>
            <input
              className="w-full p-3 rounded-2xl border"
              value={newLinkBukti}
              onChange={(e) => setNewLinkBukti(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 rounded-xl text-white bg-indigo-600" disabled={loading} type="submit">
              Simpan
            </button>
            <button className="px-3 py-2 rounded-xl border" type="button" onClick={() => setShowCreateModal(false)}>
              Batal
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Data Sumber Pendanaan">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              setLoading(true);
              const idField = getIdField(editing);
              await apiFetch(`${table.path}/${editing?.[idField]}`, {
                method: "PUT",
                body: JSON.stringify({
                  id_tahun: parseInt(editIdTahun || activeYear || 0),
                  sumber_dana: (editSumberDana || "").trim(),
                  jumlah_dana: String(editJumlahDana ?? "").trim(),
                  link_bukti: (editLinkBukti || "").trim(),
                }),
              });
              setShowEditModal(false);
              setEditing(null);
              fetchRows();
              fetchSummaryRows();
            } catch (e) {
              alert("Gagal mengupdate data: " + e.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1">Tahun</label>
            <select
              className="w-full p-3 rounded-2xl border"
              value={editIdTahun || activeYear}
              onChange={(e) => setEditIdTahun(e.target.value)}
              required
            >
              <option value="">Pilih...</option>
              {Object.values(maps.tahun).map((y) => (
                <option key={y.id_tahun} value={y.id_tahun}>
                  {y.tahun || y.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sumber Dana</label>
            <input
              className="w-full p-3 rounded-2xl border"
              value={editSumberDana}
              onChange={(e) => setEditSumberDana(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Jumlah Dana</label>
            <input
              className="w-full p-3 rounded-2xl border"
              value={editJumlahDana}
              onChange={(e) => setEditJumlahDana(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link Bukti</label>
            <input
              className="w-full p-3 rounded-2xl border"
              value={editLinkBukti}
              onChange={(e) => setEditLinkBukti(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button className="px-3 py-2 rounded-xl text-white bg-indigo-600" disabled={loading} type="submit">
              Simpan
            </button>
            <button className="px-3 py-2 rounded-xl border" type="button" onClick={() => setShowEditModal(false)}>
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

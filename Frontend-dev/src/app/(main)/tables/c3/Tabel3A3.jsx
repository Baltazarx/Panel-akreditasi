"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';

const ENDPOINT_BASE = "/tabel-3a3-pengembangan-dtpr";
const ENDPOINT_SUMMARY = "/tabel-3a3-pengembangan-dtpr/summary";
const ENDPOINT_DETAIL = "/tabel-3a3-pengembangan-dtpr/detail";
const TABLE_KEY = "tabel_3a3_pengembangan_dtpr";
const LABEL = "3.A.3 Pengembangan DTPR di Bidang Penelitian";

/* ---------- Modal Form Summary ---------- */
function ModalFormSummary({ isOpen, onClose, onSave, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    id_unit: "",
    id_tahun: "",
    jumlah_dtpr: "",
    link_bukti: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id_unit: initialData.id_unit || "",
        id_tahun: initialData.id_tahun || "",
        jumlah_dtpr: initialData.jumlah_dtpr || "",
        link_bukti: initialData.link_bukti || "",
      });
    } else {
      const userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit || "";
      setForm({
        id_unit: userUnit,
        id_tahun: "",
        jumlah_dtpr: "",
        link_bukti: "",
      });
    }
  }, [initialData, authUser]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const unitOptions = useMemo(() => {
    const units = maps?.units || maps?.unit_kerja || {};
    return Object.values(units);
  }, [maps]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Jumlah DTPR" : "Tambah Jumlah DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data jumlah DTPR per tahun.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Unit */}
            <div>
              <label htmlFor="id_unit" className="block text-sm font-medium text-slate-700 mb-1">
                Unit/Prodi <span className="text-red-500">*</span>
              </label>
              <select
                id="id_unit"
                value={form.id_unit}
                onChange={(e) => handleChange("id_unit", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
                disabled={!!initialData}
              >
                <option value="">Pilih Unit/Prodi</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id_unit} value={unit.id_unit}>
                    {unit.nama_unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label htmlFor="id_tahun" className="block text-sm font-medium text-slate-700 mb-1">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <select
                id="id_tahun"
                value={form.id_tahun}
                onChange={(e) => handleChange("id_tahun", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                <option value="">Pilih Tahun</option>
                {tahunList.map((tahun) => (
                  <option key={tahun.id_tahun} value={tahun.id_tahun}>
                    {tahun.tahun || tahun.nama || tahun.id_tahun}
                  </option>
                ))}
              </select>
              {initialData && (
                <p className="text-xs text-gray-500 mt-1">
                  Pilih tahun yang ingin di-edit (TS, TS-1, atau TS-2)
                </p>
              )}
            </div>

            {/* Jumlah DTPR */}
            <div>
              <label htmlFor="jumlah_dtpr" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah DTPR
              </label>
              <input
                type="number"
                id="jumlah_dtpr"
                value={form.jumlah_dtpr}
                onChange={(e) => handleChange("jumlah_dtpr", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="cth: 15"
                min="0"
              />
            </div>

            {/* Link Bukti */}
            <div>
              <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">
                Link Bukti
              </label>
              <input
                type="url"
                id="link_bukti"
                value={form.link_bukti}
                onChange={(e) => handleChange("link_bukti", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Modal Form Detail ---------- */
function ModalFormDetail({ isOpen, onClose, onSave, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    id_unit: "",
    id_dosen: "",
    jenis_pengembangan: "",
    id_tahun: "",
    link_bukti: "",
  });

  const [dosenList, setDosenList] = useState([]);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const data = await apiFetch("/dosen");
        const list = Array.isArray(data) ? data : [];
        setDosenList(list);
      } catch (err) {
        console.error("Error fetching dosen:", err);
      }
    };
    fetchDosen();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        id_unit: initialData.id_unit || "",
        id_dosen: initialData.id_dosen || "",
        jenis_pengembangan: initialData.jenis_pengembangan || "",
        id_tahun: initialData.id_tahun || "",
        link_bukti: initialData.link_bukti || "",
      });
    } else {
      const userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit || "";
      setForm({
        id_unit: userUnit,
        id_dosen: "",
        jenis_pengembangan: "",
        id_tahun: "",
        link_bukti: "",
      });
    }
  }, [initialData, authUser]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const unitOptions = useMemo(() => {
    const units = maps?.units || maps?.unit_kerja || {};
    return Object.values(units);
  }, [maps]);

  const jenisPengembanganOptions = [
    "Tugas Belajar",
    "Pelatihan",
    "Seminar",
    "Workshop",
    "Lokakarya",
    "Magang",
    "Penelitian",
    "Pengabdian Masyarakat",
    "Lainnya"
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Pengembangan DTPR" : "Tambah Pengembangan DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data pengembangan DTPR per dosen.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Unit */}
            <div>
              <label htmlFor="id_unit" className="block text-sm font-medium text-slate-700 mb-1">
                Unit/Prodi <span className="text-red-500">*</span>
              </label>
              <select
                id="id_unit"
                value={form.id_unit}
                onChange={(e) => handleChange("id_unit", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
                disabled={!!initialData}
              >
                <option value="">Pilih Unit/Prodi</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id_unit} value={unit.id_unit}>
                    {unit.nama_unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Dosen */}
            <div>
              <label htmlFor="id_dosen" className="block text-sm font-medium text-slate-700 mb-1">
                Dosen DTPR <span className="text-red-500">*</span>
              </label>
              <select
                id="id_dosen"
                value={form.id_dosen}
                onChange={(e) => handleChange("id_dosen", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                <option value="">Pilih Dosen</option>
                {dosenList.map((dosen) => (
                  <option key={dosen.id_dosen} value={dosen.id_dosen}>
                    {dosen.nama || `${dosen.nama_depan || ""} ${dosen.nama_belakang || ""}`.trim()}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Pengembangan */}
            <div>
              <label htmlFor="jenis_pengembangan" className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Pengembangan <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis_pengembangan"
                value={form.jenis_pengembangan}
                onChange={(e) => handleChange("jenis_pengembangan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                <option value="">Pilih Jenis Pengembangan</option>
                {jenisPengembanganOptions.map((jenis) => (
                  <option key={jenis} value={jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label htmlFor="id_tahun" className="block text-sm font-medium text-slate-700 mb-1">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <select
                id="id_tahun"
                value={form.id_tahun}
                onChange={(e) => handleChange("id_tahun", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
                disabled={!!initialData}
              >
                <option value="">Pilih Tahun</option>
                {tahunList.map((tahun) => (
                  <option key={tahun.id_tahun} value={tahun.id_tahun}>
                    {tahun.tahun || tahun.nama || tahun.id_tahun}
                  </option>
                ))}
              </select>
            </div>

            {/* Link Bukti */}
            <div>
              <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">
                Link Bukti
              </label>
              <input
                type="url"
                id="link_bukti"
                value={form.link_bukti}
                onChange={(e) => handleChange("link_bukti", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {initialData ? "Simpan Perubahan" : "Tambah Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Tabel Summary ---------- */
function SummaryTable({
  summaryData,
  maps,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  tahunTS,
  tahunTS1,
  tahunTS2,
}) {
  const getUnitName = (id) => {
    const unit = maps?.units?.[id] || maps?.unit_kerja?.[id];
    return unit?.nama_unit || id || "-";
  };

  if (!summaryData) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Pilih tahun untuk melihat data summary.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit/Prodi</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-2</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-1</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          <tr className="bg-white hover:bg-slate-50">
            <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">
              {getUnitName(summaryData.id_unit)}
            </td>
            <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">
              {summaryData.jumlah_ts_2 || 0}
            </td>
            <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">
              {summaryData.jumlah_ts_1 || 0}
            </td>
            <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">
              {summaryData.jumlah_ts || 0}
            </td>
            <td className="px-4 py-3 border border-slate-200 text-slate-700">
              <div className="space-y-1">
                {summaryData.link_bukti_ts_2 && (
                  <a href={summaryData.link_bukti_ts_2} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975] text-xs block">
                    TS-2
                  </a>
                )}
                {summaryData.link_bukti_ts_1 && (
                  <a href={summaryData.link_bukti_ts_1} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975] text-xs block">
                    TS-1
                  </a>
                )}
                {summaryData.link_bukti_ts && (
                  <a href={summaryData.link_bukti_ts} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975] text-xs block">
                    TS
                  </a>
                )}
                {!summaryData.link_bukti_ts_2 && !summaryData.link_bukti_ts_1 && !summaryData.link_bukti_ts && (
                  <span className="text-slate-400 text-xs">-</span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 text-center border border-slate-200">
              <div className="flex items-center justify-center gap-2">
                {canUpdate && (
                  <button
                    onClick={() => onEdit(summaryData)}
                    className="font-medium text-[#0384d6] hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Tabel Detail ---------- */
function DetailTable({
  rows,
  maps,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  showDeleted,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  handleSelectAll,
}) {
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);

  const getUnitName = (id) => {
    const unit = maps?.units?.[id] || maps?.unit_kerja?.[id];
    return unit?.nama_unit || id || "-";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr>
            {showDeleted && (
              <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                />
              </th>
            )}
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit/Prodi</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama DTPR</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jenis Pengembangan</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-2</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-1</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRows.length === 0 ? (
            <tr>
              <td
                colSpan={showDeleted ? 10 : 9}
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            filteredRows.map((r, i) => (
              <tr
                key={r.id_pengembangan || i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-[#eaf4ff]`}
              >
                {showDeleted && (
                  <td className="px-4 py-3 text-center border border-slate-200">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id_pengembangan)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, r.id_pengembangan]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== r.id_pengembangan));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                <td className="px-4 py-3 border border-slate-200 text-slate-700">{getUnitName(r.id_unit)}</td>
                <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">{r.nama_dtpr || "-"}</td>
                <td className="px-4 py-3 border border-slate-200 text-slate-700">{r.jenis_pengembangan || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.jumlah_ts_2 || 0}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.jumlah_ts_1 || 0}</td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.jumlah_ts || 0}</td>
                <td className="px-4 py-3 border border-slate-200 text-slate-700">
                  {r.link_bukti || r.link_bukti_ts || r.link_bukti_ts_1 || r.link_bukti_ts_2 ? (
                    <a
                      href={r.link_bukti || r.link_bukti_ts || r.link_bukti_ts_1 || r.link_bukti_ts_2}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0384d6] underline hover:text-[#043975]"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {!showDeleted && canUpdate && (
                      <button
                        onClick={() => onEdit(r)}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {!showDeleted && canDelete && (
                      <button
                        onClick={() => onDelete(r)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                    {showDeleted && canDelete && (
                      <button
                        onClick={() => onHardDelete(r)}
                        className="font-medium text-red-800 hover:underline"
                      >
                        Hapus Permanen
                      </button>
                    )}
                    {showDeleted && canUpdate && (
                      <button
                        onClick={() => onRestore(r)}
                        className="font-medium text-green-600 hover:underline"
                      >
                        Pulihkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Page Component ---------- */
export default function Tabel3A3({ auth, role }) {
  const { authUser } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUser || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, tahun: {} };

  const [activeTab, setActiveTab] = useState("summary"); // "summary" or "detail"
  
  // Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  // Detail state
  const [detailRows, setDetailRows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedTahun, setSelectedTahun] = useState(null);

  // Modal state
  const [modalSummaryOpen, setModalSummaryOpen] = useState(false);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Tahun options
  const tahunList = useMemo(() => {
    const tahun = Object.values(maps?.tahun || {});
    return tahun.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
  }, [maps?.tahun]);

  // Hitung TS, TS-1, TS-2 berdasarkan tahun yang dipilih
  const { tahunTS, tahunTS1, tahunTS2 } = useMemo(() => {
    if (!selectedTahun) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null };
    }

    const sortedTahunList = [...tahunList].sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
    const selectedIndex = sortedTahunList.findIndex(t => t.id_tahun === parseInt(selectedTahun));
    
    if (selectedIndex === -1) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null };
    }

    const tahunTS = sortedTahunList[selectedIndex]?.id_tahun;
    const tahunTS1 = selectedIndex > 0 ? sortedTahunList[selectedIndex - 1]?.id_tahun : tahunTS;
    const tahunTS2 = selectedIndex > 1 ? sortedTahunList[selectedIndex - 2]?.id_tahun : tahunTS1;

    return { tahunTS, tahunTS1, tahunTS2 };
  }, [selectedTahun, tahunList]);

  // Auto-select tahun TS
  useEffect(() => {
    if (tahunList.length > 0 && !selectedTahun) {
      const tahun2025 = tahunList.find(t => {
        const tahunStr = String(t.tahun || t.nama || "");
        return tahunStr.includes("2025");
      });

      if (tahun2025) {
        setSelectedTahun(tahun2025.id_tahun);
      } else {
        setSelectedTahun(tahunList[tahunList.length - 1]?.id_tahun);
      }
    }
  }, [tahunList, selectedTahun]);

  // Fetch Summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!tahunTS || !tahunTS1 || !tahunTS2) return;

      setSummaryLoading(true);
      try {
        let url = `${ENDPOINT_SUMMARY}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const data = await apiFetch(url);
        setSummaryData(data);
      } catch (err) {
        console.error("Error fetching summary:", err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal memuat data summary',
          text: err.message || 'Terjadi kesalahan saat memuat data summary.'
        });
        setSummaryData(null);
      } finally {
        setSummaryLoading(false);
      }
    };

    if (activeTab === "summary") {
      fetchSummary();
    }
  }, [activeTab, showDeleted, tahunTS, tahunTS1, tahunTS2]);

  // Fetch Detail data
  useEffect(() => {
    const fetchDetail = async () => {
      if (!tahunTS || !tahunTS1 || !tahunTS2) return;

      setDetailLoading(true);
      try {
        let url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const data = await apiFetch(url);
        setDetailRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching detail:", err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal memuat data detail',
          text: err.message || 'Terjadi kesalahan saat memuat data detail.'
        });
        setDetailRows([]);
      } finally {
        setDetailLoading(false);
      }
    };

    if (activeTab === "detail") {
      fetchDetail();
    }
  }, [activeTab, showDeleted, tahunTS, tahunTS1, tahunTS2]);

  // Handle Save Summary
  const handleSaveSummary = async (form) => {
    try {
      let finalIdUnit = form.id_unit;
      
      if (!editingSummary) {
        let userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit;
        if (!userUnit && authUser?.token) {
          try {
            const base64Url = authUser.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userUnit = decoded?.id_unit_prodi || decoded?.id_unit;
          } catch (e) {
            console.error("Gagal decode token:", e);
          }
        }
        if (userUnit) finalIdUnit = userUnit;
      }

      const payload = {
        id_unit: finalIdUnit,
        id_tahun: form.id_tahun,
        jumlah_dtpr: form.jumlah_dtpr || 0,
        link_bukti: form.link_bukti || null,
      };

      // API menggunakan UPSERT logic - POST akan otomatis update jika sudah ada
      await apiFetch(ENDPOINT_SUMMARY, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Data summary untuk tahun ${tahunList.find(t => t.id_tahun === parseInt(form.id_tahun))?.tahun || form.id_tahun} berhasil ${editingSummary ? 'diperbarui' : 'ditambahkan'}.`,
        timer: 1500,
        showConfirmButton: false
      });

      setModalSummaryOpen(false);
      setEditingSummary(null);

      // Refresh data
      const url = `${ENDPOINT_SUMMARY}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}${showDeleted ? "&include_deleted=1" : ""}`;
      const data = await apiFetch(url);
      setSummaryData(data);
    } catch (err) {
      console.error("Save summary error:", err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editingSummary ? 'memperbarui' : 'menambah'} data summary`,
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  // Handle Save Detail
  const handleSaveDetail = async (form) => {
    try {
      let finalIdUnit = form.id_unit;
      
      if (!editingDetail) {
        let userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit;
        if (!userUnit && authUser?.token) {
          try {
            const base64Url = authUser.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            userUnit = decoded?.id_unit_prodi || decoded?.id_unit;
          } catch (e) {
            console.error("Gagal decode token:", e);
          }
        }
        if (userUnit) finalIdUnit = userUnit;
      }

      const payload = {
        id_unit: finalIdUnit,
        id_dosen: form.id_dosen,
        jenis_pengembangan: form.jenis_pengembangan,
        id_tahun: form.id_tahun,
        link_bukti: form.link_bukti || null,
      };

      if (editingDetail) {
        await apiFetch(`${ENDPOINT_DETAIL}/${editingDetail.id_pengembangan}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data detail berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT_DETAIL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data detail berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }

      setModalDetailOpen(false);
      setEditingDetail(null);

      // Refresh data
      const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}${showDeleted ? "&include_deleted=1" : ""}`;
      const data = await apiFetch(url);
      setDetailRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Save detail error:", err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editingDetail ? 'memperbarui' : 'menambah'} data detail`,
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  // Handle Edit Summary
  const handleEditSummary = async (data) => {
    // Untuk edit summary, kita buka modal dengan data yang sudah ada
    // User bisa memilih tahun mana yang akan di-edit (TS, TS-1, atau TS-2)
    // Pre-fill form dengan id_unit dari data yang ada
    setEditingSummary({
      id_unit: data.id_unit,
      id_tahun: tahunTS, // Default ke TS
      jumlah_dtpr: data.jumlah_ts || 0,
      link_bukti: data.link_bukti_ts || "",
    });
    setModalSummaryOpen(true);
  };

  // Handle Edit Detail
  const handleEditDetail = async (row) => {
    try {
      const detail = await apiFetch(`${ENDPOINT_DETAIL}/${row.id_pengembangan}`);
      setEditingDetail(detail);
      setModalDetailOpen(true);
    } catch (err) {
      console.error("Error fetching detail:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat detail',
        text: err.message || 'Terjadi kesalahan saat memuat detail data.'
      });
    }
  };

  // Handle Delete Detail
  const handleDeleteDetail = async (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: `Data pengembangan "${row.jenis_pengembangan}" untuk "${row.nama_dtpr}" akan dihapus (soft delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT_DETAIL}/${row.id_pengembangan}`, { method: "DELETE" });
          
          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setDetailRows(Array.isArray(data) ? data : []);

          Swal.fire('Dihapus!', 'Data telah dihapus (soft delete).', 'success');
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Handle Hard Delete Detail
  const handleHardDeleteDetail = async (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      html: `Data pengembangan "<strong>${row.jenis_pengembangan}</strong>" untuk "<strong>${row.nama_dtpr}</strong>" akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT_DETAIL}/${row.id_pengembangan}/hard`, { method: "DELETE" });
          
          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setDetailRows(Array.isArray(data) ? data : []);

          Swal.fire('Dihapus Permanen!', 'Data telah dihapus secara permanen.', 'success');
        } catch (err) {
          console.error("Hard delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Handle Restore Detail
  const handleRestoreDetail = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data pengembangan "${row.jenis_pengembangan}" untuk "${row.nama_dtpr}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT_DETAIL}/${row.id_pengembangan}/restore`, { method: "POST" });
          
          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setDetailRows(Array.isArray(data) ? data : []);

          Swal.fire('Dipulihkan!', 'Data telah dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore error:", err);
          Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Select all logic
  const filteredDetailRows = detailRows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  const isAllSelected = filteredDetailRows.length > 0 && selectedRows.length === filteredDetailRows.length;
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredDetailRows.map(r => r.id_pengembangan));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md border p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{LABEL}</h1>
        <p className="text-slate-600 text-sm">
          Tabel untuk mencatat pengembangan DTPR (Dosen Tetap Program Studi) di bidang penelitian untuk periode 3 tahun akademik (TS-2, TS-1, TS).
        </p>
      </div>

      {/* Filter Tahun */}
      <div className="bg-white rounded-2xl shadow-md border p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pilih Tahun Akademik (TS)
            </label>
            <select
              value={selectedTahun || ""}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
            >
              <option value="">Pilih Tahun</option>
              {tahunList.map((tahun) => (
                <option key={tahun.id_tahun} value={tahun.id_tahun}>
                  {tahun.tahun || tahun.nama || tahun.id_tahun}
                </option>
              ))}
            </select>
          </div>
          {selectedTahun && (
            <div className="text-sm text-slate-600">
              <p><strong>TS:</strong> {tahunList.find(t => t.id_tahun === parseInt(tahunTS))?.tahun || tahunTS}</p>
              <p><strong>TS-1:</strong> {tahunList.find(t => t.id_tahun === parseInt(tahunTS1))?.tahun || tahunTS1}</p>
              <p><strong>TS-2:</strong> {tahunList.find(t => t.id_tahun === parseInt(tahunTS2))?.tahun || tahunTS2}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-md border">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "summary"
                  ? "text-[#0384d6] border-b-2 border-[#0384d6]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Summary (Jumlah DTPR)
            </button>
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "detail"
                  ? "text-[#0384d6] border-b-2 border-[#0384d6]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Detail (Pengembangan DTPR)
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Jumlah Dosen DTPR</h2>
                {canCreate && tahunTS && tahunTS1 && tahunTS2 && (
                  <button
                    onClick={() => {
                      setEditingSummary(null);
                      setModalSummaryOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    + Tambah Summary
                  </button>
                )}
              </div>

              {summaryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6] mx-auto"></div>
                  <p className="mt-2 text-slate-600">Memuat data...</p>
                </div>
              ) : !tahunTS || !tahunTS1 || !tahunTS2 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Pilih tahun akademik untuk melihat data summary.</p>
                </div>
              ) : (
                <SummaryTable
                  summaryData={summaryData}
                  maps={maps}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={handleEditSummary}
                  onDelete={() => {}}
                  tahunTS={tahunTS}
                  tahunTS1={tahunTS1}
                  tahunTS2={tahunTS2}
                />
              )}
            </div>
          )}

          {/* Detail Tab */}
          {activeTab === "detail" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Detail Pengembangan DTPR</h2>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                    />
                    Tampilkan yang dihapus
                  </label>
                  {canCreate && tahunTS && tahunTS1 && tahunTS2 && (
                    <button
                      onClick={() => {
                        setEditingDetail(null);
                        setModalDetailOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      + Tambah Detail
                    </button>
                  )}
                </div>
              </div>

              {detailLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6] mx-auto"></div>
                  <p className="mt-2 text-slate-600">Memuat data...</p>
                </div>
              ) : !tahunTS || !tahunTS1 || !tahunTS2 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Pilih tahun akademik untuk melihat data detail.</p>
                </div>
              ) : (
                <DetailTable
                  rows={detailRows}
                  maps={maps}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={handleEditDetail}
                  onDelete={handleDeleteDetail}
                  onRestore={handleRestoreDetail}
                  onHardDelete={handleHardDeleteDetail}
                  showDeleted={showDeleted}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  isAllSelected={isAllSelected}
                  handleSelectAll={handleSelectAll}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalFormSummary
        isOpen={modalSummaryOpen}
        onClose={() => {
          setModalSummaryOpen(false);
          setEditingSummary(null);
        }}
        onSave={handleSaveSummary}
        initialData={editingSummary}
        maps={maps}
        tahunList={tahunList}
        authUser={authUser}
      />

      <ModalFormDetail
        isOpen={modalDetailOpen}
        onClose={() => {
          setModalDetailOpen(false);
          setEditingDetail(null);
        }}
        onSave={handleSaveDetail}
        initialData={editingDetail}
        maps={maps}
        tahunList={tahunList}
        authUser={authUser}
      />
    </div>
  );
}


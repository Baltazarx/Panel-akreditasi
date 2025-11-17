"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

const ENDPOINT = "/tabel-3a2-penelitian";
const TABLE_KEY = "tabel_3a2_penelitian";
const LABEL = "3.A.2 Penelitian DTPR, Hibah dan Pembiayaan Penelitian";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    id_unit: "",
    id_dosen_ketua: "",
    judul_penelitian: "",
    jml_mhs_terlibat: "",
    jenis_hibah: "",
    sumber_dana: "",
    durasi_tahun: "",
    link_bukti: "",
    pendanaan: [] // Array of {id_tahun, jumlah_dana}
  });

  // Fetch dosen list dari API
  const [dosenList, setDosenList] = useState([]);
  
  useEffect(() => {
    if (initialData) {
      setForm({
        id_unit: initialData.id_unit || "",
        id_dosen_ketua: initialData.id_dosen_ketua || "",
        judul_penelitian: initialData.judul_penelitian || "",
        jml_mhs_terlibat: initialData.jml_mhs_terlibat || "",
        jenis_hibah: initialData.jenis_hibah || "",
        sumber_dana: initialData.sumber_dana || "",
        durasi_tahun: initialData.durasi_tahun || "",
        link_bukti: initialData.link_bukti || "",
        pendanaan: initialData.pendanaan || []
      });
    } else {
      // Auto-fill id_unit dari user yang login
      // Ambil dari berbagai sumber untuk kompatibilitas maksimal
      const userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit || "";
      if (!userUnit && authUser) {
        // Jika masih tidak ada, coba decode dari token jika ada
        if (authUser.token) {
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
            const unitFromToken = decoded?.id_unit_prodi || decoded?.id_unit;
            if (unitFromToken) {
              setForm({
                id_unit: unitFromToken,
                id_dosen_ketua: "",
                judul_penelitian: "",
                jml_mhs_terlibat: "",
                jenis_hibah: "",
                sumber_dana: "",
                durasi_tahun: "",
                link_bukti: "",
                pendanaan: []
              });
              return;
            }
          } catch (e) {
            console.error("Gagal decode token:", e);
          }
        }
      }
      setForm({
        id_unit: userUnit,
        id_dosen_ketua: "",
        judul_penelitian: "",
        jml_mhs_terlibat: "",
        jenis_hibah: "",
        sumber_dana: "",
        durasi_tahun: "",
        link_bukti: "",
        pendanaan: []
      });
    }
  }, [initialData, authUser]);

  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const data = await apiFetch("/dosen");
        const list = Array.isArray(data) ? data : [];
        // Filter duplicate ID dan pastikan unique dengan Map
        const dosenMap = new Map();
        list.forEach((d, idx) => {
          const id = d.id_dosen;
          if (!dosenMap.has(id)) {
            dosenMap.set(id, {
              id: id,
              nama: d.nama_lengkap || d.nama,
              originalIndex: idx
            });
          }
        });
        
        setDosenList(Array.from(dosenMap.values()).map((d, idx) => ({
          id: d.id,
          nama: d.nama,
          uniqueKey: `dosen-${d.id}-${idx}-${d.originalIndex}`
        })).sort((a, b) => a.nama.localeCompare(b.nama)));
      } catch (err) {
        console.error("Error fetching dosen:", err);
        // Fallback ke pegawai jika gagal
        const pegawaiMap = new Map();
        Object.values(maps?.pegawai || {}).forEach((p, idx) => {
          const id = p.id_pegawai;
          if (!pegawaiMap.has(id)) {
            pegawaiMap.set(id, {
              id: id,
              nama: p.nama_lengkap || p.nama,
              originalIndex: idx
            });
          }
        });
        
        setDosenList(Array.from(pegawaiMap.values()).map((p, idx) => ({
          id: p.id,
          nama: p.nama,
          uniqueKey: `pegawai-${p.id}-${idx}-${p.originalIndex}`
        })).sort((a, b) => a.nama.localeCompare(b.nama)));
      }
    };
    if (isOpen) fetchDosen();
  }, [isOpen, maps?.pegawai]);

  const tahunOptions = useMemo(() => {
    const tahun = Object.values(maps?.tahun || {}).length > 0 
      ? Object.values(maps.tahun) 
      : (tahunList || []);
    return tahun.map(y => ({
      id: y.id_tahun,
      nama: y.tahun || y.nama
    })).sort((a, b) => a.id - b.id);
  }, [maps?.tahun, tahunList]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePendanaanChange = (index, field, value) => {
    const newPendanaan = [...form.pendanaan];
    newPendanaan[index] = { ...newPendanaan[index], [field]: value };
    setForm((prev) => ({ ...prev, pendanaan: newPendanaan }));
  };

  const addPendanaanRow = () => {
    setForm((prev) => ({
      ...prev,
      pendanaan: [...prev.pendanaan, { id_tahun: "", jumlah_dana: "" }]
    }));
  };

  const removePendanaanRow = (index) => {
    setForm((prev) => ({
      ...prev,
      pendanaan: prev.pendanaan.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi minimal (id_unit tidak perlu divalidasi karena auto-fill dari user)
    if (!form.id_dosen_ketua || !form.judul_penelitian) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Nama Ketua dan Judul Penelitian wajib diisi.'
      });
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Data Penelitian DTPR" : "Input Data Penelitian DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Formulir dengan input pendanaan dinamis</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Judul Penelitian */}
          <div>
            <label htmlFor="judul_penelitian" className="block text-sm font-medium text-slate-700 mb-1">
              Judul Penelitian (Wajib) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="judul_penelitian"
              value={form.judul_penelitian}
              onChange={(e) => handleChange("judul_penelitian", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none"
              rows="3"
              placeholder="Judul lengkap penelitian..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Ketua */}
            <div>
              <label htmlFor="id_dosen_ketua" className="block text-sm font-medium text-slate-700 mb-1">
                Nama Ketua (Wajib) <span className="text-red-500">*</span>
              </label>
              <select
                id="id_dosen_ketua"
                value={form.id_dosen_ketua}
                onChange={(e) => handleChange("id_dosen_ketua", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                required
              >
                <option value="">-- Pilih Dosen --</option>
                {dosenList.map((d, idx) => (
                  <option key={d.uniqueKey || `dosen-${d.id}-${idx}`} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Sumber */}
            <div>
              <label htmlFor="sumber_dana" className="block text-sm font-medium text-slate-700 mb-1">
                Sumber
              </label>
              <select
                id="sumber_dana"
                value={form.sumber_dana}
                onChange={(e) => handleChange("sumber_dana", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              >
                <option value="">Pilih Sumber</option>
                <option value="L">Lokal/Wilayah (L)</option>
                <option value="N">Nasional (N)</option>
                <option value="I">Internasional (I)</option>
              </select>
            </div>

            {/* Jenis Hibah */}
            <div>
              <label htmlFor="jenis_hibah" className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Hibah
              </label>
              <input
                type="text"
                id="jenis_hibah"
                value={form.jenis_hibah}
                onChange={(e) => handleChange("jenis_hibah", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Hibah Dasar, Terapan..."
              />
            </div>

            {/* Durasi */}
            <div>
              <label htmlFor="durasi_tahun" className="block text-sm font-medium text-slate-700 mb-1">
                Durasi (Tahun)
              </label>
              <input
                type="number"
                id="durasi_tahun"
                value={form.durasi_tahun}
                onChange={(e) => handleChange("durasi_tahun", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
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
                placeholder="https://..."
              />
            </div>

            {/* Jumlah Mahasiswa */}
            <div>
              <label htmlFor="jml_mhs_terlibat" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Mahasiswa
              </label>
              <input
                type="number"
                id="jml_mhs_terlibat"
                value={form.jml_mhs_terlibat}
                onChange={(e) => handleChange("jml_mhs_terlibat", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Rincian Pendanaan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rincian Pendanaan (Rp Juta)
            </label>
            <div className="space-y-3">
              {form.pendanaan.map((item, index) => (
                <div key={`pendanaan-${index}-${item.id_tahun || 'new'}`} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-600 mb-1">Tahun</label>
                    <select
                      value={item.id_tahun || ""}
                      onChange={(e) => handlePendanaanChange(index, "id_tahun", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">-- Pilih Tahun --</option>
                      {tahunOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-600 mb-1">Jumlah Dana (Rp Juta)</label>
                    <input
                      type="number"
                      value={item.jumlah_dana || ""}
                      onChange={(e) => handlePendanaanChange(index, "jumlah_dana", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendanaanRow(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus pendanaan"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPendanaanRow}
                className="text-[#0384d6] hover:text-[#043975] hover:underline text-sm font-medium mt-2"
              >
                + Tambah Pendanaan Lain
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span className="relative z-10">Batal</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </button>
            <button 
              type="submit" 
              className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            >
              <span className="relative z-10">Tambahkan Penelitian ke Tabel</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Tabel Data ---------- */
function DataTable({
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
  tahunList,
  tahunTS,
  tahunTS1,
  tahunTS2,
}) {
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container') && !event.target.closest('.fixed')) {
        setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdownId]);

  const getUnitName = (id) => {
    const unit = maps?.units?.[id] || maps?.unit_kerja?.[id];
    return unit?.nama_unit || id || "-";
  };

  const getDosenName = (id) => {
    // id_dosen_ketua adalah id_dosen dari tabel dosen
    // Cari di pegawai melalui join dosen, atau gunakan nama_dosen_ketua dari response
    // Response sudah include nama_dosen_ketua dari backend
    return id || "-";
  };

  // Kalkulasi summary
  const totalDana = useMemo(() => {
    return filteredRows.reduce((sum, row) => {
      const danaTS4 = parseFloat(row.dana_ts_4 || 0);
      const danaTS3 = parseFloat(row.dana_ts_3 || 0);
      const danaTS2 = parseFloat(row.dana_ts_2 || 0);
      const danaTS1 = parseFloat(row.dana_ts_1 || 0);
      const danaTS = parseFloat(row.dana_ts || 0);
      return sum + danaTS4 + danaTS3 + danaTS2 + danaTS1 + danaTS;
    }, 0);
  }, [filteredRows]);

  const jumlahJenisHibah = useMemo(() => {
    const jenisSet = new Set();
    filteredRows.forEach(row => {
      if (row.jenis_hibah) jenisSet.add(row.jenis_hibah);
    });
    return jenisSet.size;
  }, [filteredRows]);

  const jumlahPenelitian = filteredRows.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* Header Level 1 */}
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">No</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Nama DTPR (Ketua)</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Judul Penelitian</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Jumlah Mahasiswa yang Terlibat</th>
            <th colSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Sumber</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Durasi (tahun)</th>
            <th colSpan={6} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Pendanaan (Rp juta)</th>
            <th rowSpan={2} className="px-2 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white w-20">Aksi</th>
          </tr>
          {/* Header Level 2 */}
          <tr>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">Jenis Hibah Penelitian</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">L/N/I</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS-4</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS-3</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS-2</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS-1</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border border-white">Link Bukti</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td 
                colSpan={14} 
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            <>
              {filteredRows.map((r, i) => (
                <tr
                  key={r.id ? `penelitian-${r.id}` : `penelitian-temp-${i}-${r.judul_penelitian || ''}`}
                  className={`transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-[#eaf4ff]`}
                >
                  <td className="px-4 py-3 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{r.nama_dosen_ketua || "-"}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{r.judul_penelitian || "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.jml_mhs_terlibat || "-"}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{r.jenis_hibah || "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.sumber_dana || "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.durasi_tahun || "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.dana_ts_4 ? parseFloat(r.dana_ts_4).toLocaleString('id-ID') : "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.dana_ts_3 ? parseFloat(r.dana_ts_3).toLocaleString('id-ID') : "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.dana_ts_2 ? parseFloat(r.dana_ts_2).toLocaleString('id-ID') : "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.dana_ts_1 ? parseFloat(r.dana_ts_1).toLocaleString('id-ID') : "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700">{r.dana_ts ? parseFloat(r.dana_ts).toLocaleString('id-ID') : "-"}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">
                    {r.link_bukti ? (
                      <a 
                        href={r.link_bukti} 
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
                  <td className="px-2 py-3 border border-slate-200 w-20">
                    <div className="flex items-center justify-center dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                          if (openDropdownId !== rowId) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownWidth = 192;
                            setDropdownPosition({
                              top: rect.bottom + 4,
                              left: Math.max(8, rect.right - dropdownWidth)
                            });
                            setOpenDropdownId(rowId);
                          } else {
                            setOpenDropdownId(null);
                          }
                        }}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                        aria-label="Menu aksi"
                        aria-expanded={openDropdownId === (getIdField(r) ? r[getIdField(r)] : r.id || i)}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Summary Rows */}
              <tr className="bg-slate-100 font-semibold">
                <td colSpan={7} className="px-6 py-4 text-slate-800 border border-slate-300">Jumlah Dana</td>
                <td colSpan={6} className="px-6 py-4 text-slate-800 border border-slate-300 text-center">
                  {totalDana.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 border border-slate-300"></td>
              </tr>
              <tr className={`${filteredRows.length % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                <td colSpan={4} className="px-6 py-4 text-slate-800 border border-slate-300 font-semibold">Jumlah Jenis Hibah</td>
                <td colSpan={10} className="px-6 py-4 text-slate-800 border border-slate-300 text-center">
                  {jumlahJenisHibah}
                </td>
              </tr>
              <tr className={`${filteredRows.length % 2 === 1 ? "bg-white" : "bg-slate-50"}`}>
                <td colSpan={2} className="px-6 py-4 text-slate-800 border border-slate-300 font-semibold">Jumlah Penelitian</td>
                <td colSpan={12} className="px-6 py-4 text-slate-800 border border-slate-300 text-center">
                  {jumlahPenelitian}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : r.id || idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        const isDeleted = currentRow.deleted_at;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.judul_penelitian || ''}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.judul_penelitian || ''}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${currentRow.judul_penelitian || ''}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${currentRow.judul_penelitian || ''}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ---------- Page Component ---------- */
export default function Tabel3A2({ auth, role }) {
  const { authUser } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUser || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, pegawai: {}, tahun: {} };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [roadmapLink, setRoadmapLink] = useState("");
  const [selectedTahun, setSelectedTahun] = useState(null); // 1 dropdown untuk tahun utama (TS)

  // Modal state & editing row
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
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
  }, [modalOpen]);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Tahun options untuk dropdown
  const tahunList = useMemo(() => {
    const tahun = Object.values(maps?.tahun || {});
    return tahun.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
  }, [maps?.tahun]);

  // Hitung TS sampai TS-4 berdasarkan tahun yang dipilih (TS)
  // TS = tahun yang dipilih, TS-1 = tahun SEBELUM TS, TS-2 = tahun SEBELUM TS-1, dst.
  const { tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 } = useMemo(() => {
    if (!selectedTahun) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null, tahunTS3: null, tahunTS4: null };
    }
    
    // Pastikan tahunList sudah diurutkan dari terkecil ke terbesar (tahun lama ke tahun baru)
    const sortedTahunList = [...tahunList].sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
    
    const selectedIndex = sortedTahunList.findIndex(t => t.id_tahun === parseInt(selectedTahun));
    if (selectedIndex === -1) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null, tahunTS3: null, tahunTS4: null };
    }
    
    // TS = tahun yang dipilih
    const tahunTS = sortedTahunList[selectedIndex]?.id_tahun;
    
    // TS-1 sampai TS-4 adalah tahun SEBELUM TS (indeks lebih kecil)
    // Jika tidak ada tahun sebelumnya, gunakan tahun TS sebagai fallback
    const tahunTS1 = selectedIndex > 0 ? sortedTahunList[selectedIndex - 1]?.id_tahun : tahunTS;
    const tahunTS2 = selectedIndex > 1 ? sortedTahunList[selectedIndex - 2]?.id_tahun : tahunTS1;
    const tahunTS3 = selectedIndex > 2 ? sortedTahunList[selectedIndex - 3]?.id_tahun : tahunTS2;
    const tahunTS4 = selectedIndex > 3 ? sortedTahunList[selectedIndex - 4]?.id_tahun : tahunTS3;
    
    return { tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 };
  }, [selectedTahun, tahunList]);

  // Auto-select tahun TS (cari tahun 2025, jika tidak ada gunakan tahun terakhir) jika belum dipilih
  useEffect(() => {
    if (tahunList.length > 0 && !selectedTahun) {
      // Cari tahun yang mengandung "2025"
      const tahun2025 = tahunList.find(t => {
        const tahunStr = String(t.tahun || t.nama || "");
        return tahunStr.includes("2025");
      });
      
      if (tahun2025) {
        setSelectedTahun(tahun2025.id_tahun);
      } else {
        // Jika tidak ada 2025, gunakan tahun terakhir
        setSelectedTahun(tahunList[tahunList.length - 1]?.id_tahun);
      }
    }
  }, [tahunList, selectedTahun]);

  // Hitung tahun awal periode 5 tahun untuk roadmap
  // Roadmap disimpan per periode 5 tahun (contoh: 2024-2028, 2029-2033, 2034-2038)
  const tahunAwalPeriode = useMemo(() => {
    if (!tahunTS) return null;
    // Cari tahun awal periode 5 tahun berdasarkan tahun TS
    // Contoh: tahun 2024 -> periode 2024-2028 (tahun awal = 2024)
    // Contoh: tahun 2025 -> periode 2024-2028 (tahun awal = 2024)
    // Contoh: tahun 2029 -> periode 2029-2033 (tahun awal = 2029)
    // Rumus: hitung sisa pembagian dengan 5
    const sisa = tahunTS % 5;
    if (sisa === 0) {
      // Jika tahun habis dibagi 5 (contoh: 2025, 2030), turunkan ke periode sebelumnya
      // 2025 -> periode 2024-2028, jadi tahun awal = 2025 - 5 = 2020? Tidak!
      // Seharusnya: 2025 -> periode 2024-2028, jadi tahun awal = 2024
      // 2025 - 1 = 2024 ✓
      return tahunTS - 1;
    } else if (sisa === 4) {
      // Jika sisa 4 (contoh: 2024, 2029), tahun ini adalah awal periode
      return tahunTS;
    } else {
      // Jika sisa 1, 2, atau 3, turunkan ke periode sebelumnya
      // Contoh: tahun 2026 (sisa 1) -> periode 2024-2028, jadi tahun awal = 2024
      // 2026 - 1 - 1 = 2024 ✓
      return tahunTS - sisa - 1;
    }
  }, [tahunTS]);

  // Load roadmap link berdasarkan periode 5 tahun
  // Roadmap disimpan per periode 5 tahun di localStorage dengan key: tabel3a2_roadmap_link_{tahunAwalPeriode}
  // Roadmap akan otomatis reset (kosong) jika periode berubah
  useEffect(() => {
    if (!tahunTS || !tahunAwalPeriode) {
      // Jika belum ada tahun TS atau tahun awal periode, kosongkan roadmap
      setRoadmapLink("");
      return;
    }

    // Ambil roadmap dari localStorage untuk periode 5 tahun yang bersangkutan
    // Ini memastikan roadmap reset ketika periode berubah (setiap 5 tahun)
    const saved = localStorage.getItem(`tabel3a2_roadmap_link_${tahunAwalPeriode}`);
    if (saved) {
      setRoadmapLink(saved);
    } else {
      // Jika tidak ada roadmap untuk periode ini, kosongkan (reset)
      setRoadmapLink("");
    }
  }, [tahunTS, tahunAwalPeriode]); // Depend pada tahunTS dan tahunAwalPeriode

  // Save roadmap link ke localStorage berdasarkan periode 5 tahun
  const handleRoadmapSave = () => {
    if (!tahunTS || !tahunAwalPeriode) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian!',
        text: 'Pilih tahun terlebih dahulu sebelum menyimpan roadmap.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Simpan roadmap untuk periode 5 tahun yang bersangkutan
    // Contoh: tahun 2024-2028 akan pakai key yang sama (tabel3a2_roadmap_link_2024)
    localStorage.setItem(`tabel3a2_roadmap_link_${tahunAwalPeriode}`, roadmapLink);
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: `Link roadmap untuk periode ${tahunAwalPeriode}-${tahunAwalPeriode + 4} berhasil disimpan.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4) return;
      
      setLoading(true);
      try {
        let url = `${ENDPOINT}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const data = await apiFetch(url);
        setRows(Array.isArray(data) ? data : data?.items || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal memuat data',
          text: err.message || 'Terjadi kesalahan saat memuat data.'
        });
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setSelectedRows([]);
  }, [showDeleted, tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4]);

  // Create / Update handler
  const handleSave = async (form) => {
    try {
      // Untuk create baru, gunakan id_unit dari user yang login
      // Untuk edit, gunakan id_unit yang sudah ada di form (dari initialData)
      let finalIdUnit = form.id_unit;
      
      if (!editingRow) {
        // Create baru - ambil dari user yang login
        // Coba berbagai sumber untuk mendapatkan id_unit
        let userUnit = authUser?.unit || authUser?.id_unit_prodi || authUser?.id_unit;
        
        // Jika masih tidak ada, coba decode dari token
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
        
        if (!userUnit) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Tidak dapat menentukan unit/prodi. Silakan logout dan login ulang.'
          });
          return;
        }
        finalIdUnit = userUnit;
      }

      const payload = {
        ...form,
        id_unit: finalIdUnit, // Gunakan id_unit yang sudah ditentukan
        link_roadmap: roadmapLink || null, // Tambahkan link_roadmap dari state
        pendanaan: JSON.stringify(form.pendanaan.filter(p => p.id_tahun && p.jumlah_dana))
      };

      if (editingRow) {
        await apiFetch(`${ENDPOINT}/${editingRow.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data penelitian berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data penelitian berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setModalOpen(false);
      setEditingRow(null);

      // Refresh data
      const url = `${ENDPOINT}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&include_deleted=1" : ""}`;
      const data = await apiFetch(url);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editingRow ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  // Edit handler - fetch detail untuk form
  const handleEdit = async (row) => {
    try {
      const detail = await apiFetch(`${ENDPOINT}/${row.id}`);
      setEditingRow(detail);
      setModalOpen(true);
    } catch (err) {
      console.error("Error fetching detail:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat detail',
        text: err.message || 'Terjadi kesalahan saat memuat detail data.'
      });
    }
  };

  // Soft Delete handler
  const handleDelete = async (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: `Data penelitian "${row.judul_penelitian}" akan dihapus (soft delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT}/${row.id}`, { method: "DELETE" });
          
          // Refresh data
          const url = `${ENDPOINT}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dihapus!', 'Data telah dihapus (soft delete).', 'success');
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Hard Delete handler
  const handleHardDelete = async (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      html: `Data "<strong>${row.judul_penelitian}</strong>" akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: "DELETE" });
          
          // Refresh data
          const url = `${ENDPOINT}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dihapus Permanen!', 'Data telah dihapus secara permanen.', 'success');
        } catch (err) {
          console.error("Hard delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Restore handler
  const handleRestore = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data "${row.judul_penelitian}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT}/${row.id}/restore`, { method: "POST" });
          
          // Refresh data
          const url = `${ENDPOINT}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dipulihkan!', 'Data telah dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore error:", err);
          Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Select all logic
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  const isAllSelected = filteredRows.length > 0 && selectedRows.length === filteredRows.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = filteredRows.map(r => r.id);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data penelitian DTPR, hibah dan pembiayaan penelitian sesuai dengan format LKPS.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Roadmap Link Input */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">Roadmap</label>
          </div>
          <div className="md:col-span-8">
            <input
              type="url"
              value={roadmapLink}
              onChange={(e) => setRoadmapLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Tuliskan link ke dokumen roadmap penelitian"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleRoadmapSave}
              className="w-full px-4 py-3 bg-[#0384d6] hover:bg-[#043975] text-white font-semibold rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Tahun Selector */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {filteredRows.length} baris
          </span>
          <select
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
            value={selectedTahun || ""}
            onChange={(e) => setSelectedTahun(e.target.value)}
          >
            <option value="">Pilih Tahun</option>
            {tahunList.map((y) => (
              <option key={y.id_tahun} value={y.id_tahun}>
                {y.tahun || y.nama}
              </option>
            ))}
          </select>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowDeleted(false)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data aktif"
            >
              Data
            </button>
            <button
              onClick={() => setShowDeleted(true)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              aria-label="Tampilkan data terhapus"
            >
              Data Terhapus
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => { setModalOpen(true); setEditingRow(null); }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Tambah Data
            </button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-slate-500">Memuat data...</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && (
        <DataTable
          rows={rows}
          maps={maps}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onHardDelete={handleHardDelete}
          showDeleted={showDeleted}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          isAllSelected={isAllSelected}
          handleSelectAll={handleSelectAll}
          tahunList={tahunList}
          tahunTS={tahunTS}
          tahunTS1={tahunTS1}
          tahunTS2={tahunTS2}
        />
      )}

      {/* Keterangan */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Keterangan:</h3>
        <p className="text-sm text-yellow-700">
          L: Lokal/Wilayah, N: Nasional, I: Internasional
        </p>
      </div>

      {/* Modal */}
      <ModalForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRow(null); }}
        onSave={handleSave}
          initialData={editingRow}
          maps={maps}
          tahunList={tahunList}
          authUser={authUser}
        />
    </div>
  );
}


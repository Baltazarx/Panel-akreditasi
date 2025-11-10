"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus } from 'react-icons/fi';

const ENDPOINT = "/tabel-4a1-sarpras-pkm";
const TABLE_KEY = "tabel_4a1_sarpras_pkm";
const LABEL = "4.A.1 Sarpras PkM";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    nama_sarpras: "",
    daya_tampung: "",
    luas_ruang_m2: "",
    kepemilikan: "",
    lisensi: "",
    perangkat_detail: "",
    link_bukti: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          nama_sarpras: initialData.nama_sarpras || "",
          daya_tampung: initialData.daya_tampung || "",
          luas_ruang_m2: initialData.luas_ruang_m2 || "",
          kepemilikan: initialData.kepemilikan || "",
          lisensi: initialData.lisensi || "",
          perangkat_detail: initialData.perangkat_detail || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        setForm({
          nama_sarpras: "",
          daya_tampung: "",
          luas_ruang_m2: "",
          kepemilikan: "",
          lisensi: "",
          perangkat_detail: "",
          link_bukti: ""
        });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sarpras PkM" : "Tambah Sarpras PkM"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data sarana dan prasarana PkM sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nama Sarpras */}
          <div>
            <label htmlFor="nama_sarpras" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Prasarana <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama_sarpras"
              value={form.nama_sarpras}
              onChange={(e) => handleChange("nama_sarpras", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Nama prasarana..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daya Tampung */}
            <div>
              <label htmlFor="daya_tampung" className="block text-sm font-medium text-slate-700 mb-1">
                Daya Tampung
              </label>
              <input
                type="number"
                id="daya_tampung"
                value={form.daya_tampung}
                onChange={(e) => handleChange("daya_tampung", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Luas Ruang */}
            <div>
              <label htmlFor="luas_ruang_m2" className="block text-sm font-medium text-slate-700 mb-1">
                Luas Ruang (m²)
              </label>
              <input
                type="number"
                id="luas_ruang_m2"
                value={form.luas_ruang_m2}
                onChange={(e) => handleChange("luas_ruang_m2", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Kepemilikan */}
            <div>
              <label htmlFor="kepemilikan" className="block text-sm font-medium text-slate-700 mb-1">
                Kepemilikan
              </label>
              <select
                id="kepemilikan"
                value={form.kepemilikan}
                onChange={(e) => handleChange("kepemilikan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              >
                <option value="">Pilih Kepemilikan</option>
                <option value="M">Milik Sendiri (M)</option>
                <option value="S">Sewa (S)</option>
                <option value="W">Wakaf (W)</option>
              </select>
            </div>

            {/* Lisensi */}
            <div>
              <label htmlFor="lisensi" className="block text-sm font-medium text-slate-700 mb-1">
                Lisensi
              </label>
              <select
                id="lisensi"
                value={form.lisensi}
                onChange={(e) => handleChange("lisensi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              >
                <option value="">Pilih Lisensi</option>
                <option value="L">Berlisensi (L)</option>
                <option value="P">Public Domain (P)</option>
                <option value="T">Tidak Berlisensi (T)</option>
              </select>
            </div>
          </div>

          {/* Perangkat Detail */}
          <div>
            <label htmlFor="perangkat_detail" className="block text-sm font-medium text-slate-700 mb-1">
              Perangkat
            </label>
            <textarea
              id="perangkat_detail"
              value={form.perangkat_detail}
              onChange={(e) => handleChange("perangkat_detail", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none"
              rows="3"
              placeholder="Detail perangkat..."
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Data Table Component ---------- */
function DataTable({ rows, loading, showDeleted, selectedRows, setSelectedRows, onEdit, onDelete, onRestore, onHardDelete, canUpdate, canDelete, openDropdownId, setOpenDropdownId, dropdownPosition, setDropdownPosition }) {
  const filteredRows = useMemo(() => {
    if (showDeleted) {
      // Hanya tampilkan data yang benar-benar dihapus (deleted_at IS NOT NULL)
      return rows.filter(r => r.deleted_at);
    }
    // Tampilkan data yang tidak dihapus (deleted_at IS NULL)
    return rows.filter(r => !r.deleted_at);
  }, [rows, showDeleted]);

  if (loading) {
    return (
      <div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
          <p className="mt-4 text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              {showDeleted && (
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredRows.map(r => r.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-white focus:ring-white"
                  />
                </th>
              )}
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Nama<br />Prasarana
              </th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Daya<br />Tampung
              </th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Luas<br />Ruang<br />(m²)
              </th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Milik Sendiri<br />(M)/ Sewa (W)
              </th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Berlisensi (L)/<br /><em>Public Domain</em><br />(P)/Tidak<br />Berlisensi (T)
              </th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Perangkat</th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">...</th>
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredRows.length === 0 ? (
              <tr>
                <td 
                  colSpan={showDeleted ? 11 : 10} 
                  className="px-6 py-16 text-center text-slate-500 border border-slate-300"
                >
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((r, i) => {
                const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                const isDeleted = r.deleted_at;
                
                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-white"
                    } hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                  >
                    {showDeleted && (
                      <td className="px-4 py-3 text-center border border-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(r.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, r.id]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== r.id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-center border border-slate-300 font-medium text-slate-800">{i + 1}</td>
                    <td className="px-4 py-3 border border-slate-300 font-semibold text-slate-800 max-w-xs">
                      <div className="truncate" title={r.nama_sarpras || ""}>
                        {r.nama_sarpras || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">{r.daya_tampung || "-"}</td>
                    <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">{r.luas_ruang_m2 || "-"}</td>
                    <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">
                      {r.kepemilikan === "M" ? "M" : r.kepemilikan === "S" ? "S" : r.kepemilikan === "W" ? "W" : "-"}
                    </td>
                    <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">
                      {r.lisensi === "L" ? "L" : r.lisensi === "P" ? "P" : r.lisensi === "T" ? "T" : "-"}
                    </td>
                    <td className="px-4 py-3 border border-slate-300 text-slate-700 max-w-xs">
                      <div className="truncate" title={r.perangkat_detail || ""}>
                        {r.perangkat_detail || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 border border-slate-300 text-slate-700 text-center">-</td>
                    <td className="px-4 py-3 border border-slate-300 text-slate-700">
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
                    {(canUpdate || canDelete) && (
                      <td className="px-4 py-3 border border-slate-300">
                        <div className="flex items-center justify-center dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
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
                            aria-expanded={openDropdownId === rowId}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-left">
        <p className="text-sm font-medium text-slate-700">Keterangan:</p>
      </div>

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
                aria-label={`Edit data ${currentRow.nama_sarpras || ''}`}
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
                aria-label={`Hapus data ${currentRow.nama_sarpras || ''}`}
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
                aria-label={`Pulihkan data ${currentRow.nama_sarpras || ''}`}
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
                aria-label={`Hapus permanen data ${currentRow.nama_sarpras || ''}`}
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
export default function Tabel4A1({ auth, role: propRole }) {
  const { authUser: authUserFromContext } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUserFromContext || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, tahun: {} };
  const role = propRole || authUserFromContext?.role;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal state & editing row
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = ENDPOINT;
        if (showDeleted) {
          url += "?include_deleted=1";
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
  }, [showDeleted]);

  // Create / Update handler
  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (editingRow) {
        await apiFetch(`${ENDPOINT}/${editingRow.id}`, {
          method: "PUT",
          body: JSON.stringify(formData)
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Sarpras PkM berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(formData)
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Sarpras PkM berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setModalOpen(false);
      setEditingRow(null);
      // Refresh data
      const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
      const data = await apiFetch(url);
      setRows(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Error saving data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan data',
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = (row) => {
    Swal.fire({
      title: 'Hapus Data?',
      text: `Anda yakin ingin menghapus "${row.nama_sarpras || 'data ini'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await apiFetch(`${ENDPOINT}/${row.id}`, { method: "DELETE" });
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Data berhasil dihapus.',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
          console.error("Error deleting data:", err);
          Swal.fire({
            icon: 'error',
            title: 'Gagal menghapus data',
            text: err.message || 'Terjadi kesalahan saat menghapus data.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Restore handler
  const handleRestore = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data "${row.nama_sarpras || 'data ini'}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          // Restore menggunakan PUT dengan semua field yang ada + deleted_at = null
          // Karena controller update memerlukan nama_sarpras sebagai field wajib
          const restoreData = {
            nama_sarpras: row.nama_sarpras || "",
            daya_tampung: row.daya_tampung || "",
            luas_ruang_m2: row.luas_ruang_m2 || "",
            kepemilikan: row.kepemilikan || "",
            lisensi: row.lisensi || "",
            perangkat_detail: row.perangkat_detail || "",
            link_bukti: row.link_bukti || "",
            deleted_at: null
          };
          
          await apiFetch(`${ENDPOINT}/${row.id}`, {
            method: "PUT",
            body: JSON.stringify(restoreData),
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Dipulihkan!',
            text: 'Data telah berhasil dipulihkan.',
            timer: 1500,
            showConfirmButton: false
          });
          
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
          console.error("Restore error:", err);
          Swal.fire({
            icon: 'error',
            title: 'Gagal memulihkan data',
            text: err.message || 'Terjadi kesalahan saat memulihkan data.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Hard delete handler
  const handleHardDelete = (row) => {
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
          setLoading(true);
          await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: "DELETE" });
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Data telah dihapus secara permanen.',
            timer: 1500,
            showConfirmButton: false
          });
          // Refresh data
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
          console.error("Error hard deleting data:", err);
          Swal.fire({
            icon: 'error',
            title: 'Gagal menghapus data',
            text: err.message || 'Terjadi kesalahan saat menghapus data.'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Export Excel handler
  const handleExport = async () => {
    try {
      setLoading(true);
      const url = `${ENDPOINT}/export${showDeleted ? '?include_deleted=1' : ''}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}${url}`, {
        credentials: 'include',
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }
      
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `Tabel_4A1_Sarpras_PkM_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor ke Excel.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengekspor data',
        text: err.message || 'Terjadi kesalahan saat mengekspor data.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data sarana dan prasarana PkM untuk tabel 4A-1.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.filter(r => !r.deleted_at || showDeleted).length} baris`}
          </span>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showDeleted
                ? "bg-[#0384d6] text-white"
                : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
            }`}
          >
            {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => {
                setEditingRow(null);
                setModalOpen(true);
              }}
              disabled={loading}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiPlus size={18} />
              Tambah Data
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownload size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        rows={rows}
        loading={loading}
        showDeleted={showDeleted}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onEdit={(row) => {
          setEditingRow(row);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        dropdownPosition={dropdownPosition}
        setDropdownPosition={setDropdownPosition}
      />

      {/* Modal Form */}
      <ModalForm
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRow(null);
        }}
        onSave={handleSave}
        initialData={editingRow}
      />
    </div>
  );
}

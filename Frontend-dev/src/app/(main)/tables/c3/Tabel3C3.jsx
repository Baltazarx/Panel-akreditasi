"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload } from 'react-icons/fi';

const ENDPOINT = "/tabel-3c3-hki";
const TABLE_KEY = "tabel_3c3_hki";
const LABEL = "3.C.3 Perolehan HKI (Granted)";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    id_dosen: "",
    judul_hki: "",
    jenis_hki: "",
    id_tahun_perolehan: "",
    link_bukti: ""
  });

  const [dosenList, setDosenList] = useState([]);

  // Hook harus dipanggil sebelum early return
  const tahunOptions = useMemo(() => {
    if (!maps || !maps.tahun) return [];
    const tahun = Object.values(maps.tahun);
    return tahun
      .filter(t => t && t.id_tahun) // Filter out invalid entries
      .sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0))
      .map(t => ({
        id: t.id_tahun,
        nama: t.tahun || t.nama || t.id_tahun
      }));
  }, [maps?.tahun]);

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
              id_dosen: id,
              nama: d.nama_lengkap || d.nama || `${d.nama_depan || ""} ${d.nama_belakang || ""}`.trim() || `Dosen ${id}`,
              originalIndex: idx
            });
          }
        });
        
        setDosenList(Array.from(dosenMap.values()).sort((a, b) => (a.nama || "").localeCompare(b.nama || "")));
      } catch (err) {
        console.error("Error fetching dosen:", err);
        setDosenList([]);
      }
    };
    if (isOpen) fetchDosen();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          id_dosen: initialData.id_dosen || "",
          judul_hki: initialData.judul_hki || "",
          jenis_hki: initialData.jenis_hki || "",
          id_tahun_perolehan: initialData.id_tahun_perolehan || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        setForm({
          id_dosen: "",
          judul_hki: "",
          jenis_hki: "",
          id_tahun_perolehan: "",
          link_bukti: ""
        });
      }
    }
  }, [initialData, isOpen]);

  // Early return setelah semua hook dipanggil
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.id_dosen || !form.judul_hki || !form.jenis_hki || !form.id_tahun_perolehan) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap lengkapi semua field yang wajib diisi (Nama DTPR, Judul HKI, Jenis HKI, Tahun Perolehan).'
      });
      return;
    }

    onSave(form);
  };

  const jenisHkiOptions = [
    { value: "Paten", label: "Paten" },
    { value: "Paten Sederhana", label: "Paten Sederhana" },
    { value: "Hak Cipta", label: "Hak Cipta" },
    { value: "Merek", label: "Merek" },
    { value: "Desain Industri", label: "Desain Industri" },
    { value: "Rahasia Dagang", label: "Rahasia Dagang" },
    { value: "Indikasi Geografis", label: "Indikasi Geografis" },
    { value: "Desain Tata Letak Sirkuit Terpadu", label: "Desain Tata Letak Sirkuit Terpadu" }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {initialData ? "Edit" : "Tambah"} {LABEL}
              </h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data perolehan HKI sesuai dengan format LKPS.</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nama DTPR */}
          <div>
            <label htmlFor="id_dosen" className="block text-sm font-medium text-slate-700 mb-1">
              Nama DTPR <span className="text-red-500">*</span>
            </label>
            <select
              id="id_dosen"
              value={form.id_dosen}
              onChange={(e) => handleChange("id_dosen", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              required
            >
              <option value="">Pilih Dosen</option>
              {dosenList.map((dosen) => (
                <option key={dosen.id_dosen} value={dosen.id_dosen}>
                  {dosen.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Judul HKI */}
          <div>
            <label htmlFor="judul_hki" className="block text-sm font-medium text-slate-700 mb-1">
              Judul HKI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_hki"
              value={form.judul_hki}
              onChange={(e) => handleChange("judul_hki", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Masukkan judul HKI"
              required
            />
          </div>

          {/* Jenis HKI */}
          <div>
            <label htmlFor="jenis_hki" className="block text-sm font-medium text-slate-700 mb-1">
              Jenis HKI <span className="text-red-500">*</span>
            </label>
            <select
              id="jenis_hki"
              value={form.jenis_hki}
              onChange={(e) => handleChange("jenis_hki", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              required
            >
              <option value="">Pilih Jenis HKI</option>
              {jenisHkiOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Perolehan */}
          <div>
            <label htmlFor="id_tahun_perolehan" className="block text-sm font-medium text-slate-700 mb-1">
              Tahun Perolehan <span className="text-red-500">*</span>
            </label>
            <select
              id="id_tahun_perolehan"
              value={form.id_tahun_perolehan}
              onChange={(e) => handleChange("id_tahun_perolehan", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
              required
            >
              <option value="">Pilih Tahun Perolehan</option>
              {tahunOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}
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
              placeholder="https://..."
            />
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
  tahunLaporan,
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

  const handleRowClick = (e, rowId) => {
    e.stopPropagation();
    if (openDropdownId === rowId) {
      setOpenDropdownId(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 4, left: rect.left });
      setOpenDropdownId(rowId);
    }
  };

  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  // Format checkmark untuk tahun perolehan
  const formatTahunPerolehan = (row) => {
    // Backend mengembalikan tahun_ts4, tahun_ts3, tahun_ts2, tahun_ts1, tahun_ts
    const ts4 = row.tahun_ts4 === '√' ? '√' : '';
    const ts3 = row.tahun_ts3 === '√' ? '√' : '';
    const ts2 = row.tahun_ts2 === '√' ? '√' : '';
    const ts1 = row.tahun_ts1 === '√' ? '√' : '';
    const ts = row.tahun_ts === '√' ? '√' : '';
    return { ts4, ts3, ts2, ts1, ts };
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* Header Level 1 */}
          <tr>
            {showDeleted && (
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-white focus:ring-white"
                />
              </th>
            )}
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Jenis HKI</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Nama DTPR</th>
            <th colSpan={5} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              Tahun Perolehan (Beri Tanda √)
            </th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
          </tr>
          {/* Header Level 2 - Tahun */}
          <tr>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              {tahunLaporan?.nama_ts4 || 'TS-4'}
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              {tahunLaporan?.nama_ts3 || 'TS-3'}
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              {tahunLaporan?.nama_ts2 || 'TS-2'}
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              {tahunLaporan?.nama_ts1 || 'TS-1'}
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              {tahunLaporan?.nama_ts || 'TS'}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td 
                colSpan={showDeleted ? 12 : 11} 
                className="px-6 py-16 text-center text-slate-500 border border-slate-200"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            filteredRows.map((row, index) => {
              const tahunPerolehan = formatTahunPerolehan(row);
              return (
                <tr
                  key={row.id || index}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-[#eaf4ff]`}
                >
                  {showDeleted && (
                    <td className="px-4 py-3 text-center border border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleCheckboxChange(row.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-center border border-slate-200 font-medium text-slate-800">{index + 1}</td>
                  <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800 max-w-xs">
                    <div className="truncate" title={row.judul_hki || ""}>
                      {row.judul_hki || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{row.jenis_hki || "-"}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">{row.nama_dtpr || "-"}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 bg-white">{tahunPerolehan.ts4}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 bg-white">{tahunPerolehan.ts3}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 bg-white">{tahunPerolehan.ts2}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 bg-white">{tahunPerolehan.ts1}</td>
                  <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 bg-white">{tahunPerolehan.ts}</td>
                  <td className="px-4 py-3 border border-slate-200 text-slate-700">
                    {row.link_bukti ? (
                      <a 
                        href={row.link_bukti} 
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
                  <td className="px-4 py-3 border border-slate-200">
                    <div className="flex items-center justify-center dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rowId = row.id || index;
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
                        aria-expanded={openDropdownId === (row.id || index)}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
          {/* Summary Row */}
          {filteredRows.length > 0 && (
            <tr className="bg-white">
              {showDeleted && <td className="px-4 py-3 border border-slate-200 bg-white"></td>}
              <td 
                colSpan={4} 
                className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white"
              >
                Jumlah HKI
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {filteredRows.filter(r => r.tahun_ts4 === '√').length}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {filteredRows.filter(r => r.tahun_ts3 === '√').length}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {filteredRows.filter(r => r.tahun_ts2 === '√').length}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {filteredRows.filter(r => r.tahun_ts1 === '√').length}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {filteredRows.filter(r => r.tahun_ts === '√').length}
              </td>
              <td 
                colSpan={2} 
                className="px-4 py-3 border border-slate-200 bg-white"
              ></td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = r.id || idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        return (
          <div
            className="fixed z-50 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {canUpdate && !currentRow.deleted_at && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            {canDelete && !currentRow.deleted_at && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(currentRow.id);
                  setOpenDropdownId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <FiTrash2 className="w-4 h-4" />
                Hapus
              </button>
            )}
            {currentRow.deleted_at && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(currentRow.id);
                    setOpenDropdownId(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                >
                  <FiRotateCw className="w-4 h-4" />
                  Restore
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHardDelete(currentRow.id);
                    setOpenDropdownId(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiXCircle className="w-4 h-4" />
                  Hard Delete
                </button>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ---------- Page Component ---------- */
export default function Tabel3C3({ auth, role }) {
  const { authUser: authUserFromContext } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUserFromContext || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, tahun: {} };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunLaporan, setTahunLaporan] = useState(null);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Tahun options
  const tahunList = useMemo(() => {
    if (!maps || !maps.tahun) {
      return [];
    }
    const tahun = Object.values(maps.tahun);
    const sorted = tahun
      .filter(t => t && t.id_tahun) // Filter out invalid entries
      .sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
    return sorted;
  }, [maps?.tahun]);

  // Auto-select tahun TS (cari tahun 2025, jika tidak ada gunakan tahun terakhir) jika belum dipilih
  useEffect(() => {
    if (tahunList.length > 0 && !selectedTahun) {
      const tahun2025 = tahunList.find(t => {
        const tahunStr = String(t.tahun || t.nama || t.id_tahun || "");
        return tahunStr.includes("2025") || tahunStr.includes("2024");
      });
      if (tahun2025) {
        setSelectedTahun(tahun2025.id_tahun);
      } else {
        // Gunakan tahun terakhir
        const lastTahun = tahunList[tahunList.length - 1];
        if (lastTahun) {
          setSelectedTahun(lastTahun.id_tahun);
        }
      }
    }
  }, [tahunList, selectedTahun]);

  // Fetch data
  useEffect(() => {
    if (!selectedTahun) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${ENDPOINT}?ts_id=${selectedTahun}`);
        if (response && response.data) {
          setRows(response.data);
          setTahunLaporan(response.tahun_laporan);
        } else {
          setRows([]);
          setTahunLaporan(null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Gagal mengambil data'
        });
        setRows([]);
        setTahunLaporan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedTahun]);

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (editingRow) {
        await apiFetch(`${ENDPOINT}/${editingRow.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil diperbarui'
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(formData),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil ditambahkan'
        });
      }
      setIsModalOpen(false);
      setEditingRow(null);
      // Refresh data
      if (selectedTahun) {
        const response = await apiFetch(`${ENDPOINT}?ts_id=${selectedTahun}`);
        if (response && response.data) {
          setRows(response.data);
          setTahunLaporan(response.tahun_laporan);
        }
      }
    } catch (err) {
      console.error("Error saving data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Gagal menyimpan data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Data?',
      text: 'Data akan dihapus (soft delete).',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil dihapus'
        });
        // Refresh data
        if (selectedTahun) {
          const response = await apiFetch(`${ENDPOINT}?ts_id=${selectedTahun}`);
          if (response && response.data) {
            setRows(response.data);
            setTahunLaporan(response.tahun_laporan);
          }
        }
      } catch (err) {
        console.error("Error deleting data:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Gagal menghapus data'
        });
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      // Restore menggunakan PUT dengan deleted_at = null
      await apiFetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ deleted_at: null }),
      });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil direstore'
      });
      // Refresh data
      if (selectedTahun) {
        const response = await apiFetch(`${ENDPOINT}?ts_id=${selectedTahun}`);
        if (response && response.data) {
          setRows(response.data);
          setTahunLaporan(response.tahun_laporan);
        }
      }
    } catch (err) {
      console.error("Error restoring data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Gagal restore data'
      });
    }
  };

  const handleHardDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'error',
      title: 'Hapus Permanen?',
      text: 'Data akan dihapus secara permanen dan tidak dapat dikembalikan!',
      showCancelButton: true,
      confirmButtonText: 'Hapus Permanen',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${id}/hard`, { method: "DELETE" });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil dihapus secara permanen'
        });
        // Refresh data
        if (selectedTahun) {
          const response = await apiFetch(`${ENDPOINT}?ts_id=${selectedTahun}`);
          if (response && response.data) {
            setRows(response.data);
            setTahunLaporan(response.tahun_laporan);
          }
        }
      } catch (err) {
        console.error("Error hard deleting data:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Gagal menghapus data'
        });
      }
    }
  };

  const handleExport = async () => {
    if (!selectedTahun) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Tahun',
        text: 'Harap pilih tahun terlebih dahulu'
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api${ENDPOINT}/export?ts_id=${selectedTahun}`, {
        credentials: "include",
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tabel_3C3_HKI.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data berhasil diekspor'
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Gagal mengekspor data'
      });
    }
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length;
  const handleSelectAll = () => {
    const filtered = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(r => r.id));
    }
  };

  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data perolehan HKI (Granted) sesuai dengan format LKPS.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Filter & Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${filteredRows.length} baris`}
          </span>
          <label htmlFor="tahun" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Pilih Tahun Akademik (TS):
          </label>
          <select
            id="tahun"
            value={selectedTahun || ""}
            onChange={(e) => setSelectedTahun(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
            disabled={loading}
          >
            <option value="">Pilih Tahun</option>
            {tahunList.length > 0 ? (
              tahunList.map((t) => (
                <option key={t.id_tahun} value={t.id_tahun}>
                  {t.tahun || t.nama || t.id_tahun}
                </option>
              ))
            ) : (
              <option value="">Tidak ada data tahun</option>
            )}
          </select>
          <button 
            onClick={() => setShowDeleted(!showDeleted)} 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              showDeleted ? "bg-[#0384d6] text-white" : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
            }`}
            disabled={loading}
            aria-label={showDeleted ? "Sembunyikan data yang dihapus" : "Tampilkan data yang dihapus"}
          >
            {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
          </button>
        </div>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => {
                setEditingRow(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              aria-label="Tambah data baru"
            >
              + Tambah Data
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
            <p className="mt-4 text-slate-600">Memuat data...</p>
          </div>
        ) : (
          <DataTable
            rows={rows}
            maps={maps}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={(row) => {
              setEditingRow(row);
              setIsModalOpen(true);
            }}
            onDelete={handleDelete}
            onRestore={handleRestore}
            onHardDelete={handleHardDelete}
            showDeleted={showDeleted}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            isAllSelected={isAllSelected}
            handleSelectAll={handleSelectAll}
            tahunLaporan={tahunLaporan}
          />
        )}
      </div>

      {/* Modal Form */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRow(null);
        }}
        onSave={handleSave}
        initialData={editingRow}
        maps={maps}
        tahunList={tahunList}
        authUser={auth?.user || authUserFromContext}
      />
    </div>
  );
}

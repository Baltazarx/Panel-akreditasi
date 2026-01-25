"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiChevronDown, FiCalendar, FiUser, FiShield, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as XLSX from 'xlsx';

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

  // Dropdown state
  const [openDosenDropdown, setOpenDosenDropdown] = useState(false);
  const [openJenisDropdown, setOpenJenisDropdown] = useState(false);
  const [openTahunDropdown, setOpenTahunDropdown] = useState(false);

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
    setOpenDosenDropdown(false);
    setOpenJenisDropdown(false);
    setOpenTahunDropdown(false);
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open - HARUS SEBELUM EARLY RETURN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDosenDropdown && !event.target.closest('.dosen-dropdown-container') && !event.target.closest('.dosen-dropdown-menu')) {
        setOpenDosenDropdown(false);
      }
      if (openJenisDropdown && !event.target.closest('.jenis-dropdown-container') && !event.target.closest('.jenis-dropdown-menu')) {
        setOpenJenisDropdown(false);
      }
      if (openTahunDropdown && !event.target.closest('.tahun-dropdown-container') && !event.target.closest('.tahun-dropdown-menu')) {
        setOpenTahunDropdown(false);
      }
    };

    if (openDosenDropdown || openJenisDropdown || openTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDosenDropdown, openJenisDropdown, openTahunDropdown]);

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

    // Transformasi Title Case: "hak cipta" -> "Hak Cipta"
    const titleCaseJenisHki = form.jenis_hki
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const finalForm = { ...form, jenis_hki: titleCaseJenisHki };

    setOpenDosenDropdown(false);
    setOpenJenisDropdown(false);
    setOpenTahunDropdown(false);
    onSave(finalForm);
  };


  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
      style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
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

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Nama DTPR */}
          <div>
            <label htmlFor="id_dosen" className="block text-sm font-medium text-slate-700 mb-2">
              Nama DTPR <span className="text-red-500">*</span>
            </label>
            <div className="relative dosen-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDosenDropdown(!openDosenDropdown);
                  setOpenJenisDropdown(false);
                  setOpenTahunDropdown(false);
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_dosen
                  ? 'border-[#0384d6] bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                aria-label="Pilih dosen"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${form.id_dosen ? 'text-gray-900' : 'text-gray-500'}`}>
                    {form.id_dosen
                      ? (() => {
                        const found = dosenList.find((d) => String(d.id_dosen) === String(form.id_dosen));
                        return found ? found.nama : "Pilih Dosen";
                      })()
                      : "Pilih Dosen"}
                  </span>
                </div>
                <FiChevronDown
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openDosenDropdown ? 'rotate-180' : ''
                    }`}
                  size={18}
                />
              </button>
              {openDosenDropdown && (
                <div
                  className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto dosen-dropdown-menu mt-1 w-full"
                >
                  {dosenList.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Tidak ada data dosen
                    </div>
                  ) : (
                    dosenList.map((d) => (
                      <button
                        key={d.id_dosen}
                        type="button"
                        onClick={() => {
                          handleChange("id_dosen", d.id_dosen.toString());
                          setOpenDosenDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_dosen === d.id_dosen.toString()
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                          }`}
                      >
                        <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                        <span className="truncate">{d.nama}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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

          {/* Jenis HKI - Diubah jadi Input Text */}
          <div>
            <label htmlFor="jenis_hki" className="block text-sm font-medium text-slate-700 mb-1">
              Jenis HKI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jenis_hki"
              value={form.jenis_hki}
              onChange={(e) => handleChange("jenis_hki", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Contoh: Hak Cipta, Paten, Merek..."
              required
            />
          </div>

          {/* Tahun Perolehan */}
          <div>
            <label htmlFor="id_tahun_perolehan" className="block text-sm font-medium text-slate-700 mb-2">
              Tahun Perolehan <span className="text-red-500">*</span>
            </label>
            <div className="relative tahun-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTahunDropdown(!openTahunDropdown);
                  setOpenDosenDropdown(false);
                  setOpenJenisDropdown(false);
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_tahun_perolehan
                  ? 'border-[#0384d6] bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                aria-label="Pilih tahun perolehan"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${form.id_tahun_perolehan ? 'text-gray-900' : 'text-gray-500'}`}>
                    {form.id_tahun_perolehan
                      ? (() => {
                        const found = tahunOptions.find((t) => String(t.id) === String(form.id_tahun_perolehan));
                        return found ? found.nama : "Pilih Tahun Perolehan";
                      })()
                      : "Pilih Tahun Perolehan"}
                  </span>
                </div>
                <FiChevronDown
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openTahunDropdown ? 'rotate-180' : ''
                    }`}
                  size={18}
                />
              </button>
              {openTahunDropdown && (
                <div
                  className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-dropdown-menu mt-1 w-full"
                  style={{ minWidth: '200px' }}
                >
                  {tahunOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Tidak ada data tahun
                    </div>
                  ) : (
                    tahunOptions.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          handleChange("id_tahun_perolehan", t.id.toString());
                          setOpenTahunDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_tahun_perolehan === t.id.toString()
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                          }`}
                      >
                        <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                        <span className="truncate">{t.nama}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setOpenDosenDropdown(false);
                setOpenJenisDropdown(false);
                setOpenTahunDropdown(false);
                onClose();
              }}
              className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
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
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  summaryData
}) {
  // filteredRows is now just the rows passed (paginated)
  const filteredRows = rows;

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
              TS (Beri Tanda √)
            </th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
          </tr>
          {/* Header Level 2 - TS */}
          <tr>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              TS-4
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              TS-3
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              TS-2
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              TS-1
            </th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              TS
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
                  className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50"
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
                  <td className="px-4 py-3 text-center border border-slate-200 font-medium text-slate-800">{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
          {/* Summary Row using summaryData prop */}
          {summaryData && (
            <tr className="bg-white">
              {showDeleted && <td className="px-4 py-3 border border-slate-200 bg-white"></td>}
              <td
                colSpan={4}
                className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white"
              >
                Jumlah HKI
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {summaryData.total_ts4}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {summaryData.total_ts3}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {summaryData.total_ts2}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {summaryData.total_ts1}
              </td>
              <td className="px-4 py-3 text-center border border-slate-200 font-semibold text-slate-800 bg-white">
                {summaryData.total_ts}
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
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {canDelete && !currentRow.deleted_at && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(currentRow.id);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
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
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                >
                  <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                  <span>Pulihkan</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHardDelete(currentRow.id);
                    setOpenDropdownId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                >
                  <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                  <span>Hapus Permanen</span>
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-700 mt-4 px-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Data per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-shadow text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Halaman <span className="font-semibold text-slate-900">{currentPage}</span> dari <span className="font-semibold text-slate-900">{Math.ceil(totalItems / itemsPerPage)}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                aria-label="Halaman sebelumnya"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => onPageChange(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                aria-label="Halaman berikutnya"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [openTahunFilterDropdown, setOpenTahunFilterDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Helper function untuk sorting data berdasarkan Nama DTPR (A-Z)
  const sortRowsByLatest = (rowsArray) => {
    return [...rowsArray].sort((a, b) => {
      // 1. Prioritaskan Nama DTPR (A-Z)
      const namaA = (a.nama_dtpr || "").toLowerCase();
      const namaB = (b.nama_dtpr || "").toLowerCase();
      if (namaA !== namaB) {
        return namaA.localeCompare(namaB);
      }

      // 2. Jika nama sama, urutkan berdasarkan created_at terbaru
      if (a.created_at && b.created_at) {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
      }

      // 3. Fallback ke ID terbesar
      const idFieldA = getIdField(a);
      const idFieldB = getIdField(b);
      return (b[idFieldB] || 0) - (a[idFieldA] || 0);
    });
  };

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

  // Close tahun filter dropdown when selectedTahun changes
  useEffect(() => {
    setOpenTahunFilterDropdown(false);
  }, [selectedTahun]);

  // Close tahun filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openTahunFilterDropdown && !event.target.closest('.tahun-filter-dropdown-container') && !event.target.closest('.tahun-filter-dropdown-menu')) {
        setOpenTahunFilterDropdown(false);
      }
    };

    if (openTahunFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openTahunFilterDropdown]);

  // Fetch data
  useEffect(() => {
    if (!selectedTahun) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response && response.data) {
          const rowsArray = Array.isArray(response.data) ? response.data : [];
          const sortedRows = sortRowsByLatest(rowsArray);
          setRows(sortedRows);
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
    setSelectedRows([]);
    setCurrentPage(1); // Reset page on filter change
  }, [selectedTahun, showDeleted]);

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
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response && response.data) {
          const rowsArray = Array.isArray(response.data) ? response.data : [];
          const sortedRows = sortRowsByLatest(rowsArray);
          setRows(sortedRows);
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
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6'
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
          let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
          if (showDeleted) {
            url += "&include_deleted=1";
          }
          const response = await apiFetch(url);
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
    const result = await Swal.fire({
      icon: 'question',
      title: 'Pulihkan Data?',
      text: 'Data akan dipulihkan dan kembali ke status aktif.',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pulihkan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6'
    });

    if (result.isConfirmed) {
      try {
        // Restore menggunakan POST ke endpoint /restore
        await apiFetch(`${ENDPOINT}/${id}/restore`, {
          method: "POST",
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Data berhasil direstore'
        });
        // Refresh data
        if (selectedTahun) {
          let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
          if (showDeleted) {
            url += "&include_deleted=1";
          }
          const response = await apiFetch(url);
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
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#3085d6'
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
          let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
          if (showDeleted) {
            url += "&include_deleted=1";
          }
          const response = await apiFetch(url);
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
    try {
      const currentData = rows.filter(r => {
        const hasDeletedAt = r.deleted_at !== null && r.deleted_at !== undefined;
        return showDeleted ? hasDeletedAt : !hasDeletedAt;
      });

      if (!currentData || currentData.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];

      // Tambahkan header (merged header)
      const headerRow1 = [
        'No',
        'Judul',
        'Jenis HKI',
        'Nama DTPR',
        'TS (Beri Tanda √)',
        '',
        '',
        '',
        '',
        'Link Bukti'
      ];
      exportData.push(headerRow1);

      const headerRow2 = [
        '',
        '',
        '',
        '',
        'TS-4',
        'TS-3',
        'TS-2',
        'TS-1',
        'TS',
        ''
      ];
      exportData.push(headerRow2);

      // Format checkmark untuk tahun perolehan
      const formatTahunPerolehan = (row) => {
        const ts4 = row.tahun_ts4 === '√' ? '√' : '';
        const ts3 = row.tahun_ts3 === '√' ? '√' : '';
        const ts2 = row.tahun_ts2 === '√' ? '√' : '';
        const ts1 = row.tahun_ts1 === '√' ? '√' : '';
        const ts = row.tahun_ts === '√' ? '√' : '';
        return { ts4, ts3, ts2, ts1, ts };
      };

      // Tambahkan data rows
      currentData.forEach((row, index) => {
        const tahunPerolehan = formatTahunPerolehan(row);
        exportData.push([
          index + 1,
          row.judul_hki || "-",
          row.jenis_hki || "-",
          row.nama_dtpr || "-",
          tahunPerolehan.ts4,
          tahunPerolehan.ts3,
          tahunPerolehan.ts2,
          tahunPerolehan.ts1,
          tahunPerolehan.ts,
          row.link_bukti || "-"
        ]);
      });

      // Tambahkan summary row
      if (currentData.length > 0) {
        exportData.push([
          'Jumlah HKI',
          '',
          '',
          '',
          currentData.filter(r => r.tahun_ts4 === '√').length,
          currentData.filter(r => r.tahun_ts3 === '√').length,
          currentData.filter(r => r.tahun_ts2 === '√').length,
          currentData.filter(r => r.tahun_ts1 === '√').length,
          currentData.filter(r => r.tahun_ts === '√').length,
          ''
        ]);
      }

      // Buat worksheet
      const ws = XLSX.utils.aoa_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 40 },  // Judul
        { wch: 25 },  // Jenis HKI
        { wch: 25 },  // Nama DTPR
        { wch: 12 },  // TS-4
        { wch: 12 },  // TS-3
        { wch: 12 },  // TS-2
        { wch: 12 },  // TS-1
        { wch: 12 },  // TS
        { wch: 30 }   // Link Bukti
      ];

      // Buat workbook dan tambahkan worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Perolehan HKI');

      // Export ke file
      XLSX.writeFile(wb, `Tabel_3C3_HKI_${selectedTahun || 'Data'}.xlsx`);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Export error:", err);

      // Fallback ke CSV jika XLSX gagal
      try {
        const currentData = rows.filter(r => {
          const hasDeletedAt = r.deleted_at !== null && r.deleted_at !== undefined;
          return showDeleted ? hasDeletedAt : !hasDeletedAt;
        });
        if (currentData && currentData.length > 0) {
          const csvContent = [
            ['No', 'Judul', 'Jenis HKI', 'Nama DTPR', 'TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS', 'Link Bukti'],
            ...currentData.map((row, index) => {
              const ts4 = row.tahun_ts4 === '√' ? '√' : '';
              const ts3 = row.tahun_ts3 === '√' ? '√' : '';
              const ts2 = row.tahun_ts2 === '√' ? '√' : '';
              const ts1 = row.tahun_ts1 === '√' ? '√' : '';
              const ts = row.tahun_ts === '√' ? '√' : '';
              return [
                index + 1,
                row.judul_hki || "-",
                row.jenis_hki || "-",
                row.nama_dtpr || "-",
                ts4,
                ts3,
                ts2,
                ts1,
                ts,
                row.link_bukti || "-"
              ];
            })
          ].map(row => row.join(',')).join('\n');

          const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tabel_3C3_HKI_${selectedTahun || 'Data'}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            icon: 'info',
            title: 'Diekspor sebagai CSV',
            text: 'Data diekspor sebagai CSV karena library Excel tidak tersedia.',
            timer: 2000,
            showConfirmButton: false
          });
          return;
        }
      } catch (csvErr) {
        console.error("CSV export error:", csvErr);
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal mengekspor',
        text: err.message || 'Terjadi kesalahan saat mengekspor data.'
      });
    }
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.filter(r => {
    const hasDeletedAt = r.deleted_at !== null && r.deleted_at !== undefined;
    return showDeleted ? hasDeletedAt : !hasDeletedAt;
  }).length;
  const handleSelectAll = () => {
    const filtered = rows.filter(r => {
      const hasDeletedAt = r.deleted_at !== null && r.deleted_at !== undefined;
      return showDeleted ? hasDeletedAt : !hasDeletedAt;
    });
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(r => r.id));
    }
  };

  const filteredRows = rows.filter(r => {
    const hasDeletedAt = r.deleted_at !== null && r.deleted_at !== undefined;
    if (showDeleted) {
      return hasDeletedAt; // Tampilkan hanya data yang terhapus
    } else {
      return !hasDeletedAt; // Tampilkan hanya data yang tidak terhapus
    }
  });

  // Calculate Summary Data from ALL filtered rows (before pagination)
  const summaryData = {
    total_ts4: filteredRows.filter(r => r.tahun_ts4 === '√').length,
    total_ts3: filteredRows.filter(r => r.tahun_ts3 === '√').length,
    total_ts2: filteredRows.filter(r => r.tahun_ts2 === '√').length,
    total_ts1: filteredRows.filter(r => r.tahun_ts1 === '√').length,
    total_ts: filteredRows.filter(r => r.tahun_ts === '√').length,
    total_items: filteredRows.length
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

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
          <div className="relative tahun-filter-dropdown-container" style={{ minWidth: '200px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  setOpenTahunFilterDropdown(!openTahunFilterDropdown);
                }
              }}
              disabled={loading}
              className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedTahun
                ? 'border-[#0384d6] bg-white'
                : 'border-slate-300 bg-white hover:border-gray-400'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Pilih tahun"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                <span className={`truncate ${selectedTahun ? 'text-slate-700' : 'text-slate-500'}`}>
                  {selectedTahun
                    ? (() => {
                      const found = tahunList.find((y) => y.id_tahun === selectedTahun);
                      return found ? (found.tahun || found.nama || found.id_tahun) : selectedTahun;
                    })()
                    : "Pilih Tahun"}
                </span>
              </div>
              <FiChevronDown
                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openTahunFilterDropdown ? 'rotate-180' : ''
                  }`}
                size={16}
              />
            </button>
            {openTahunFilterDropdown && !loading && (
              <div
                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-filter-dropdown-menu mt-1 w-full"
                style={{ minWidth: '200px' }}
              >
                {tahunList.length > 0 ? (
                  tahunList.map((y) => (
                    <button
                      key={y.id_tahun}
                      type="button"
                      onClick={() => {
                        setSelectedTahun(y.id_tahun);
                        setOpenTahunFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedTahun === y.id_tahun
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                      <span>{y.tahun || y.nama || y.id_tahun}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Tidak ada data tahun
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowDeleted(false)}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!showDeleted
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
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${showDeleted
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
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
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
            rows={currentItems}
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

            // Pagination Props
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredRows.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            summaryData={summaryData}
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

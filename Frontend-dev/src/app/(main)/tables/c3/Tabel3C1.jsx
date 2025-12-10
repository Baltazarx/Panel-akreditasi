"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiChevronDown, FiCalendar, FiShield } from 'react-icons/fi';

const ENDPOINT = "/tabel-3c1-kerjasama";
const TABLE_KEY = "tabel_3c1_kerjasama_penelitian";
const LABEL = "3.C.1 Kerjasama Penelitian";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    judul_kerjasama: "",
    mitra_kerja_sama: "",
    sumber: "",
    durasi_tahun: "",
    link_bukti: "",
    pendanaan: [] // Array of {id_tahun, jumlah_dana}
  });

  // Dropdown state
  const [openSumberDropdown, setOpenSumberDropdown] = useState(false);
  const [openTahunDropdown, setOpenTahunDropdown] = useState({}); // Object dengan index sebagai key

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
    if (isOpen) {
      if (initialData) {
        setForm({
          judul_kerjasama: initialData.judul_kerjasama || "",
          mitra_kerja_sama: initialData.mitra_kerja_sama || "",
          sumber: initialData.sumber || "",
          durasi_tahun: initialData.durasi_tahun || "",
          link_bukti: initialData.link_bukti || "",
          pendanaan: Array.isArray(initialData.pendanaan) ? initialData.pendanaan : []
        });
      } else {
        setForm({
          judul_kerjasama: "",
          mitra_kerja_sama: "",
          sumber: "",
          durasi_tahun: "",
          link_bukti: "",
          pendanaan: []
        });
      }
    }
    setOpenSumberDropdown(false);
    setOpenTahunDropdown({});
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open
  // PERBAIKAN: Pindahkan useEffect SEBELUM early return untuk mematuhi Rules of Hooks
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
      if (openSumberDropdown && !event.target.closest('.sumber-dropdown-container') && !event.target.closest('.sumber-dropdown-menu')) {
        setOpenSumberDropdown(false);
      }
      // Check for tahun dropdowns
      const tahunDropdownOpen = Object.values(openTahunDropdown).some(v => v === true);
      if (tahunDropdownOpen && !event.target.closest('.tahun-dropdown-container') && !event.target.closest('.tahun-dropdown-menu')) {
        setOpenTahunDropdown({});
      }
    };

    if (openSumberDropdown || Object.values(openTahunDropdown).some(v => v === true)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openSumberDropdown, openTahunDropdown]);

  // Early return HARUS setelah semua hooks
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePendanaanChange = (index, field, value) => {
    const currentPendanaan = Array.isArray(form.pendanaan) ? form.pendanaan : [];
    const newPendanaan = [...currentPendanaan];
    newPendanaan[index] = {
      ...newPendanaan[index],
      [field]: field === "jumlah_dana" ? parseFloat(value) || 0 : value
    };
    setForm((prev) => ({ ...prev, pendanaan: newPendanaan }));
  };

  const addPendanaanRow = () => {
    setForm((prev) => ({
      ...prev,
      pendanaan: [...(Array.isArray(prev.pendanaan) ? prev.pendanaan : []), { id_tahun: "", jumlah_dana: 0 }]
    }));
  };

  const removePendanaanRow = (index) => {
    const currentPendanaan = Array.isArray(form.pendanaan) ? form.pendanaan : [];
    const newPendanaan = currentPendanaan.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, pendanaan: newPendanaan }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi minimal 1 pendanaan
    const pendanaanArray = Array.isArray(form.pendanaan) ? form.pendanaan : [];
    if (pendanaanArray.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pendanaan Wajib',
        text: 'Minimal harus ada 1 data pendanaan (TS-4 s/d TS).'
      });
      return;
    }
    setOpenSumberDropdown(false);
    setOpenTahunDropdown({});
    onSave(form);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Kerjasama Penelitian" : "Tambah Kerjasama Penelitian"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data kerjasama penelitian sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Judul Kerjasama */}
          <div>
            <label htmlFor="judul_kerjasama" className="block text-sm font-medium text-slate-700 mb-1">
              Judul Kerjasama <span className="text-red-500">*</span>
            </label>
            <textarea
              id="judul_kerjasama"
              value={form.judul_kerjasama}
              onChange={(e) => handleChange("judul_kerjasama", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none"
              rows="3"
              placeholder="Judul lengkap kerjasama penelitian..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mitra Kerja Sama */}
            <div>
              <label htmlFor="mitra_kerja_sama" className="block text-sm font-medium text-slate-700 mb-1">
                Mitra Kerja Sama <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="mitra_kerja_sama"
                value={form.mitra_kerja_sama}
                onChange={(e) => handleChange("mitra_kerja_sama", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Nama mitra kerja sama..."
                required
              />
            </div>

            {/* Sumber */}
            <div>
              <label htmlFor="sumber" className="block text-sm font-medium text-slate-700 mb-2">
                Sumber (L/N/I) <span className="text-red-500">*</span>
              </label>
              <div className="relative sumber-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenSumberDropdown(!openSumberDropdown);
                    setOpenTahunDropdown({});
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                    form.sumber
                      ? 'border-[#0384d6] bg-white' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  aria-label="Pilih sumber"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.sumber ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.sumber === "L" 
                        ? "Lokal/Wilayah (L)" 
                        : form.sumber === "N" 
                        ? "Nasional (N)" 
                        : form.sumber === "I"
                        ? "Internasional (I)"
                        : "Pilih Sumber"}
                    </span>
                  </div>
                  <FiChevronDown 
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openSumberDropdown ? 'rotate-180' : ''
                    }`} 
                    size={18} 
                  />
                </button>
                {openSumberDropdown && (
                  <div 
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto sumber-dropdown-menu mt-1 w-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                        !form.sumber
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Pilih Sumber</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "L");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                        form.sumber === "L"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Lokal/Wilayah (L)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "N");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                        form.sumber === "N"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Nasional (N)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "I");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                        form.sumber === "I"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Internasional (I)</span>
                    </button>
                  </div>
                )}
              </div>
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
          </div>

          {/* Rincian Pendanaan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rincian Pendanaan (Rp) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Masukkan pendanaan untuk TS-4, TS-3, TS-2, TS-1, dan TS (minimal 1 tahun wajib diisi).</p>
            <div className="space-y-3">
              {(Array.isArray(form.pendanaan) ? form.pendanaan : []).map((item, index) => (
                <div key={`pendanaan-${index}-${item.id_tahun || 'new'}`} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-600 mb-1">Tahun</label>
                    <div className="relative tahun-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenTahunDropdown(prev => ({
                            ...prev,
                            [index]: !prev[index]
                          }));
                          setOpenSumberDropdown(false);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                          item.id_tahun
                            ? 'border-[#0384d6] bg-white' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        aria-label="Pilih tahun"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                          <span className={`truncate text-sm ${item.id_tahun ? 'text-gray-900' : 'text-gray-500'}`}>
                            {item.id_tahun 
                              ? (() => {
                                  const found = tahunOptions.find((t) => String(t.id) === String(item.id_tahun));
                                  return found ? found.nama : "-- Pilih Tahun --";
                                })()
                              : "-- Pilih Tahun --"}
                          </span>
                        </div>
                        <FiChevronDown 
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            openTahunDropdown[index] ? 'rotate-180' : ''
                          }`} 
                          size={14} 
                        />
                      </button>
                      {openTahunDropdown[index] && (
                        <div 
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-dropdown-menu mt-1 w-full"
                          style={{ minWidth: '200px' }}
                        >
                          {tahunOptions.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-gray-500 text-center">
                              Tidak ada data tahun
                            </div>
                          ) : (
                            tahunOptions.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  handlePendanaanChange(index, "id_tahun", t.id.toString());
                                  setOpenTahunDropdown(prev => ({
                                    ...prev,
                                    [index]: false
                                  }));
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors text-sm ${
                                  item.id_tahun === t.id.toString()
                                    ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                    : 'text-gray-700'
                                }`}
                              >
                                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={12} />
                                <span className="truncate">{t.nama}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-600 mb-1">Jumlah Dana (Rp)</label>
                    <input
                      type="number"
                      value={item.jumlah_dana || ""}
                      onChange={(e) => handlePendanaanChange(index, "jumlah_dana", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                      placeholder="0"
                      min="0"
                      step="1"
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
              onClick={() => {
                setOpenSumberDropdown(false);
                setOpenTahunDropdown({});
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
              Simpan
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

  // Format currency
  const formatCurrency = (value) => {
    if (!value || value === 0) return "-";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format untuk display di tabel (dalam juta)
  const formatJuta = (value) => {
    if (!value || value === 0) return "-";
    const juta = value / 1000000;
    return `${juta.toFixed(2)} juta`;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-300 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* Header Level 1 */}
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul Kerjasama</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Mitra Kerja Sama</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Sumber</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Durasi (Tahun)</th>
            <th colSpan={5} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              Pendanaan (Rp Juta)
            </th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
          </tr>
          {/* Header Level 2 - Tahun */}
          <tr>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-4</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-3</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-2</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-1</th>
            <th className="px-4 py-2 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td 
                colSpan={12} 
                className="px-6 py-16 text-center text-slate-500 border border-slate-300"
              >
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            filteredRows.map((r, i) => (
              <tr
                key={r.id || i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-white"
                } hover:bg-[#eaf4ff]`}
              >
                <td className="px-4 py-3 text-center border border-slate-300 font-medium text-slate-800">{i + 1}</td>
                <td className="px-4 py-3 border border-slate-300 font-semibold text-slate-800 max-w-xs">
                  <div className="truncate" title={r.judul_kerjasama || ""}>
                    {r.judul_kerjasama || "-"}
                  </div>
                </td>
                <td className="px-4 py-3 border border-slate-300 text-slate-700">{r.mitra_kerja_sama || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">
                  {r.sumber === "L" ? "L" : r.sumber === "N" ? "N" : r.sumber === "I" ? "I" : "-"}
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700">{r.durasi_tahun || "-"}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700 bg-white">{formatJuta(r.pendanaan_ts4 || 0)}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700 bg-white">{formatJuta(r.pendanaan_ts3 || 0)}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700 bg-white">{formatJuta(r.pendanaan_ts2 || 0)}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700 bg-white">{formatJuta(r.pendanaan_ts1 || 0)}</td>
                <td className="px-4 py-3 text-center border border-slate-300 text-slate-700 bg-white">{formatJuta(r.pendanaan_ts || 0)}</td>
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
                <td className="px-4 py-3 border border-slate-300">
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
            ))
          )}
          {/* Summary Rows */}
          {filteredRows.length > 0 && (
            <>
              {/* Jumlah Dana */}
              <tr className="bg-white">
                <td 
                  colSpan={5} 
                  className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white"
                >
                  Jumlah Dana
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {formatJuta(filteredRows.reduce((sum, r) => sum + (parseFloat(r.pendanaan_ts4) || 0), 0))}
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {formatJuta(filteredRows.reduce((sum, r) => sum + (parseFloat(r.pendanaan_ts3) || 0), 0))}
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {formatJuta(filteredRows.reduce((sum, r) => sum + (parseFloat(r.pendanaan_ts2) || 0), 0))}
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {formatJuta(filteredRows.reduce((sum, r) => sum + (parseFloat(r.pendanaan_ts1) || 0), 0))}
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {formatJuta(filteredRows.reduce((sum, r) => sum + (parseFloat(r.pendanaan_ts) || 0), 0))}
                </td>
                <td className="px-4 py-3 border border-slate-300 bg-white"></td>
                <td className="px-4 py-3 border border-slate-300 bg-white"></td>
              </tr>
              {/* Jumlah Mitra Kerjasama */}
              <tr className="bg-white">
                <td 
                  colSpan={2} 
                  className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white"
                >
                  Jumlah Mitra Kerjasama
                </td>
                <td className="px-4 py-3 text-center border border-slate-300 font-semibold text-slate-800 bg-white">
                  {filteredRows.length}
                </td>
                <td 
                  colSpan={9} 
                  className="px-4 py-3 border border-slate-300 bg-white"
                ></td>
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
                aria-label={`Edit data ${currentRow.judul_kerjasama || ''}`}
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
                aria-label={`Hapus data ${currentRow.judul_kerjasama || ''}`}
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
                aria-label={`Pulihkan data ${currentRow.judul_kerjasama || ''}`}
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
                aria-label={`Hapus permanen data ${currentRow.judul_kerjasama || ''}`}
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
export default function Tabel3C1({ auth, role }) {
  const { authUser: authUserFromContext } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUserFromContext || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, tahun: {} };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [openTahunFilterDropdown, setOpenTahunFilterDropdown] = useState(false);

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

  // Helper function untuk sorting data berdasarkan terbaru
  const sortRowsByLatest = (rowsArray) => {
    return [...rowsArray].sort((a, b) => {
      // Jika ada created_at, urutkan berdasarkan created_at terbaru
      if (a.created_at && b.created_at) {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Terbaru di atas
        }
      }
      
      // Jika ada updated_at, urutkan berdasarkan updated_at terbaru
      if (a.updated_at && b.updated_at) {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Terbaru di atas
        }
      }
      
      // Fallback ke ID terbesar jika tidak ada timestamp
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

  // Hitung TS berdasarkan tahun yang dipilih
  const tahunTS = useMemo(() => {
    if (!selectedTahun) return null;
    return parseInt(selectedTahun);
  }, [selectedTahun]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!tahunTS) return;
      
      setLoading(true);
      try {
        let url = `${ENDPOINT}?ts_id=${tahunTS}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const data = await apiFetch(url);
        const rowsArray = Array.isArray(data) ? data : data?.items || [];
        const sortedRows = sortRowsByLatest(rowsArray);
        setRows(sortedRows);
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
  }, [showDeleted, tahunTS]);

  // Create / Update handler
  const handleSave = async (form) => {
    try {
      if (editingRow) {
        await apiFetch(`${ENDPOINT}/${editingRow.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data kerjasama penelitian berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: "POST",
          body: JSON.stringify(form),
        });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data kerjasama penelitian berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setModalOpen(false);
      setEditingRow(null);

      // Refresh data
      const url = `${ENDPOINT}?ts_id=${tahunTS}${showDeleted ? "&include_deleted=1" : ""}`;
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
      text: `Data "${row.judul_kerjasama}" akan dihapus (soft delete).`,
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
          const url = `${ENDPOINT}?ts_id=${tahunTS}${showDeleted ? "&include_deleted=1" : ""}`;
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
      html: `Data "<strong>${row.judul_kerjasama}</strong>" akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
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
          const url = `${ENDPOINT}?ts_id=${tahunTS}${showDeleted ? "&include_deleted=1" : ""}`;
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
      text: `Data "${row.judul_kerjasama}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idField = getIdField(row);
          const rowId = idField ? row[idField] : row.id;
          
          if (!rowId) {
            throw new Error('ID data tidak valid. Silakan refresh halaman dan coba lagi.');
          }

          await apiFetch(`${ENDPOINT}/${rowId}/restore`, { method: "POST" });
          
          // Refresh data
          const url = `${ENDPOINT}?ts_id=${tahunTS}${showDeleted ? "&include_deleted=1" : ""}`;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);

          Swal.fire('Dipulihkan!', 'Data telah dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore error:", err);
          const errorMessage = err.message || err.error || 'Terjadi kesalahan saat memulihkan data';
          Swal.fire('Gagal!', `Gagal memulihkan data: ${errorMessage}`, 'error');
        }
      }
    });
  };

  // Export handler
  const handleExport = async () => {
    if (!tahunTS) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Tahun',
        text: 'Silakan pilih tahun akademik terlebih dahulu.'
      });
      return;
    }

    try {
      const BASE_URL = "http://localhost:3000/api";
      const url = `${BASE_URL}${ENDPOINT}/export?ts_id=${tahunTS}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = 'Gagal mengekspor data';
        try {
          const json = JSON.parse(text);
          errorMsg = json.error || json.message || errorMsg;
        } catch (e) {
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `Tabel_3C1_Kerjasama_Penelitian_${tahunTS}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob);
      document.body.removeChild(a);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Export error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengekspor',
        text: err.message || 'Terjadi kesalahan saat mengekspor data.'
      });
    }
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
            Kelola data kerjasama penelitian sesuai dengan format LKPS.
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
              className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                selectedTahun 
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
                        const found = tahunList.find((y) => String(y.id_tahun) === String(selectedTahun));
                        return found ? (found.tahun || found.nama || found.id_tahun) : selectedTahun;
                      })()
                    : "Pilih Tahun"}
                </span>
              </div>
              <FiChevronDown 
                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  openTahunFilterDropdown ? 'rotate-180' : ''
                }`} 
                size={16} 
              />
            </button>
            {openTahunFilterDropdown && !loading && (
              <div 
                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-filter-dropdown-menu mt-1 w-full"
                style={{ minWidth: '200px' }}
              >
                {tahunList && tahunList.length > 0 ? (
                  tahunList.map((y) => (
                    <button
                      key={y.id_tahun}
                      type="button"
                      onClick={() => {
                        setSelectedTahun(y.id_tahun.toString());
                        setOpenTahunFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                        selectedTahun === y.id_tahun.toString()
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
              disabled={loading}
              aria-label="Tambah data baru"
            >
              + Tambah Data
            </button>
          )}
          {roleCan(role, TABLE_KEY, "R") && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!tahunTS || loading}
            >
              <FiDownload className="w-4 h-4" />
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
            <p className="mt-4 text-slate-600">Memuat data...</p>
          </div>
        ) : !tahunTS ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Silakan pilih tahun akademik untuk melihat data.</p>
          </div>
        ) : (
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
          />
        )}
      </div>

      {/* Modal */}
      <ModalForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingRow(null); }}
        onSave={handleSave}
        initialData={editingRow}
        maps={maps || { units: {}, unit_kerja: {}, tahun: {} }}
        tahunList={tahunList || []}
        authUser={auth?.user || authUserFromContext}
      />
    </div>
  );
}


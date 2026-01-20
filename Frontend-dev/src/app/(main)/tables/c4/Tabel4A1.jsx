"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiChevronDown, FiHome, FiShield, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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

  // Dropdown state
  const [openKepemilikanDropdown, setOpenKepemilikanDropdown] = useState(false);
  const [openLisensiDropdown, setOpenLisensiDropdown] = useState(false);

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
    setOpenKepemilikanDropdown(false);
    setOpenLisensiDropdown(false);
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
      if (openKepemilikanDropdown && !event.target.closest('.kepemilikan-dropdown-container') && !event.target.closest('.kepemilikan-dropdown-menu')) {
        setOpenKepemilikanDropdown(false);
      }
      if (openLisensiDropdown && !event.target.closest('.lisensi-dropdown-container') && !event.target.closest('.lisensi-dropdown-menu')) {
        setOpenLisensiDropdown(false);
      }
    };

    if (openKepemilikanDropdown || openLisensiDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openKepemilikanDropdown, openLisensiDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenKepemilikanDropdown(false);
    setOpenLisensiDropdown(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sarpras PkM" : "Tambah Sarpras PkM"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data sarana dan prasarana PkM sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
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
              <label htmlFor="kepemilikan" className="block text-sm font-medium text-slate-700 mb-2">
                Kepemilikan
              </label>
              <div className="relative kepemilikan-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenKepemilikanDropdown(!openKepemilikanDropdown);
                    setOpenLisensiDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.kepemilikan
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih kepemilikan"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiHome className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.kepemilikan ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.kepemilikan === "M"
                        ? "Milik Sendiri (M)"
                        : form.kepemilikan === "W"
                          ? "Sewa (W)"
                          : "Pilih Kepemilikan"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openKepemilikanDropdown ? 'rotate-180' : ''
                      }`}
                    size={18}
                  />
                </button>
                {openKepemilikanDropdown && (
                  <div
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto kepemilikan-dropdown-menu mt-1 w-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("kepemilikan", "");
                        setOpenKepemilikanDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${!form.kepemilikan
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiHome className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Pilih Kepemilikan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("kepemilikan", "M");
                        setOpenKepemilikanDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.kepemilikan === "M"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiHome className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Milik Sendiri (M)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("kepemilikan", "W");
                        setOpenKepemilikanDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.kepemilikan === "W"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiHome className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Sewa (W)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lisensi */}
            <div>
              <label htmlFor="lisensi" className="block text-sm font-medium text-slate-700 mb-2">
                Lisensi
              </label>
              <div className="relative lisensi-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenLisensiDropdown(!openLisensiDropdown);
                    setOpenKepemilikanDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.lisensi
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih lisensi"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.lisensi ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.lisensi === "L"
                        ? "Berlisensi (L)"
                        : form.lisensi === "P"
                          ? "Public Domain (P)"
                          : form.lisensi === "T"
                            ? "Tidak Berlisensi (T)"
                            : "Pilih Lisensi"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openLisensiDropdown ? 'rotate-180' : ''
                      }`}
                    size={18}
                  />
                </button>
                {openLisensiDropdown && (
                  <div
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto lisensi-dropdown-menu mt-1 w-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("lisensi", "");
                        setOpenLisensiDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${!form.lisensi
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Pilih Lisensi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("lisensi", "L");
                        setOpenLisensiDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.lisensi === "L"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Berlisensi (L)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("lisensi", "P");
                        setOpenLisensiDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.lisensi === "P"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Public Domain (P)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("lisensi", "T");
                        setOpenLisensiDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.lisensi === "T"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Tidak Berlisensi (T)</span>
                    </button>
                  </div>
                )}
              </div>
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

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setOpenKepemilikanDropdown(false);
                setOpenLisensiDropdown(false);
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

/* ---------- Data Table Component ---------- */
function DataTable({ rows, loading, showDeleted, selectedRows, setSelectedRows, onEdit, onDelete, onRestore, onHardDelete, canUpdate, canDelete, openDropdownId, setOpenDropdownId, dropdownPosition, setDropdownPosition, currentPage, itemsPerPage }) {
  const filteredRows = useMemo(() => {
    if (showDeleted) {
      // Hanya tampilkan data yang benar-benar dihapus (deleted_at IS NOT NULL)
      return rows.filter(r => r.deleted_at !== null && r.deleted_at !== undefined);
    }
    // Tampilkan data yang tidak dihapus (deleted_at IS NULL)
    return rows.filter(r => r.deleted_at === null || r.deleted_at === undefined);
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
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr className="sticky top-0">
              {showDeleted && (
                <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
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
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Nama<br />Prasarana
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Daya<br />Tampung
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Luas<br />Ruang<br />(m²)
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Milik Sendiri<br />(M)/ Sewa (W)
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Berlisensi (L)/<br /><em>Public Domain</em><br />(P)/Tidak<br />Berlisensi (T)
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Perangkat</th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              )}
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
                    className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                  >
                    {showDeleted && (
                      <td className="px-6 py-4 text-center border border-slate-200">
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
                    <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="px-6 py-4 border border-slate-200 font-semibold text-slate-800 max-w-xs">
                      <div className="truncate" title={r.nama_sarpras || ""}>
                        {r.nama_sarpras || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.daya_tampung || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.luas_ruang_m2 || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">
                      {r.kepemilikan === "M" ? "M" : r.kepemilikan === "W" ? "W" : "-"}
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">
                      {r.lisensi === "L" ? "L" : r.lisensi === "P" ? "P" : r.lisensi === "T" ? "T" : "-"}
                    </td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                      <div className="truncate" title={r.perangkat_detail || ""}>
                        {r.perangkat_detail || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">
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
                      <td className="px-6 py-4 border border-slate-200">
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      document.body.classList.add('modal-open');

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
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
          const idField = getIdField(row);
          const rowId = idField ? row[idField] : row.id;

          if (!rowId) {
            throw new Error('ID data tidak valid. Silakan refresh halaman dan coba lagi.');
          }

          // Gunakan endpoint restore yang terpisah (POST /:id/restore)
          await apiFetch(`${ENDPOINT}/${rowId}/restore`, {
            method: "POST",
          });

          Swal.fire({
            icon: 'success',
            title: 'Dipulihkan!',
            text: 'Data telah berhasil dipulihkan.',
            timer: 1500,
            showConfirmButton: false
          });

          // Refresh data - pastikan refresh dengan include_deleted jika sedang di tab Data Terhapus
          const url = showDeleted ? `${ENDPOINT}?include_deleted=1` : ENDPOINT;
          const data = await apiFetch(url);
          setRows(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
          console.error("Restore error:", err);
          const errorMessage = err.message || err.error || 'Terjadi kesalahan saat memulihkan data';
          Swal.fire({
            icon: 'error',
            title: 'Gagal memulihkan data',
            text: errorMessage
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

  // Filter and paginate rows
  const filteredRows = useMemo(() => {
    return rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  }, [rows, showDeleted]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [showDeleted]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data sarana dan prasarana PkM untuk tabel 4A-1.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.filter(r => !r.deleted_at || showDeleted).length} baris`}
          </span>
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
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        rows={currentItems}
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
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
      />

      {/* Pagination Controls */}
      {!loading && rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length > 0 && (() => {
        const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

        return (
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Baris per halaman:</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 font-medium hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0384d6]/20 focus:border-[#0384d6] transition-all cursor-pointer shadow-sm"
                  aria-label="Pilih jumlah baris per halaman"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <FiChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 font-medium">
                Halaman <span className="text-slate-900 font-bold">{currentPage}</span> dari <span className="text-slate-900 font-bold">{totalPages}</span>
                <span className="mx-2 text-slate-300">|</span>
                Total <span className="text-slate-900 font-bold">{filteredRows.length}</span> data
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-[#0384d6] hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1 active:scale-95"
                  aria-label="Halaman sebelumnya"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-[#0384d6] hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1 active:scale-95"
                  aria-label="Halaman berikutnya"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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


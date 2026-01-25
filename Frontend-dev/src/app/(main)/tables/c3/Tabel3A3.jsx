"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiCalendar, FiUser, FiBriefcase, FiShield, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const ENDPOINT_BASE = "/tabel-3a3-pengembangan-dtpr";
const ENDPOINT_SUMMARY = "/tabel-3a3-pengembangan-dtpr/summary";
const ENDPOINT_DETAIL = "/tabel-3a3-pengembangan-dtpr/detail";
const TABLE_KEY = "tabel_3a3_pengembangan_dtpr";
const LABEL = "3.A.3 Pengembangan DTPR di Bidang Penelitian";

/* ---------- Modal Form Summary ---------- */
function ModalFormSummary({ isOpen, onClose, onSave, onDelete, initialData, maps, tahunList, authUser }) {
  const [form, setForm] = useState({
    id_unit: "",
    id_tahun: "",
    jumlah_dtpr: "",
    link_bukti: "",
  });

  // Dropdown state
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const [openTahunDropdown, setOpenTahunDropdown] = useState(false);

  const isEditMode = !!initialData;

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
    setOpenUnitDropdown(false);
    setOpenTahunDropdown(false);
  }, [initialData, authUser, isOpen]);

  const unitOptions = useMemo(() => {
    const units = maps?.units || maps?.unit_kerja || {};
    return Object.values(units);
  }, [maps]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openUnitDropdown && !event.target.closest('.unit-dropdown-container') && !event.target.closest('.unit-dropdown-menu')) {
        setOpenUnitDropdown(false);
      }
      if (openTahunDropdown && !event.target.closest('.tahun-dropdown-container') && !event.target.closest('.tahun-dropdown-menu')) {
        setOpenTahunDropdown(false);
      }
    };

    if (openUnitDropdown || openTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openUnitDropdown, openTahunDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenUnitDropdown(false);
    setOpenTahunDropdown(false);
    onSave(form);
  };

  const handleDeleteClick = () => {
    if (onDelete && initialData) {
      Swal.fire({
        title: 'Hapus Data?',
        text: 'Data Jumlah DTPR untuk tahun ini akan dihapus.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
      }).then((result) => {
        if (result.isConfirmed) {
          onDelete(initialData);
          onClose();
        }
      });
    }
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Jumlah DTPR" : "Tambah Jumlah DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data jumlah DTPR per tahun.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-6">
            {/* Tahun */}
            <div>
              <label htmlFor="id_tahun" className="block text-sm font-medium text-slate-700 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              {isEditMode ? (
                /* Disabled view for Edit Mode */
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-3">
                  <FiCalendar className="text-gray-400 flex-shrink-0" size={18} />
                  <span>
                    {form.id_tahun
                      ? (() => {
                        const found = tahunList.find((t) => String(t.id_tahun) === String(form.id_tahun));
                        return found ? (found.tahun || found.nama || found.id_tahun) : form.id_tahun;
                      })()
                      : "-"}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 italic">(Tidak dapat diubah)</span>
                </div>
              ) : (
                /* Dropdown for Add Mode */
                <div className="relative tahun-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenTahunDropdown(!openTahunDropdown);
                      setOpenUnitDropdown(false);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_tahun
                      ? 'border-[#0384d6] bg-white'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    aria-label="Pilih tahun akademik"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                      <span className={`truncate ${form.id_tahun ? 'text-gray-900' : 'text-gray-500'}`}>
                        {form.id_tahun
                          ? (() => {
                            const found = tahunList.find((t) => String(t.id_tahun) === String(form.id_tahun));
                            return found ? (found.tahun || found.nama || found.id_tahun) : "Pilih Tahun...";
                          })()
                          : "Pilih Tahun"}
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
                      {tahunList.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Tidak ada data tahun
                        </div>
                      ) : (
                        tahunList.map((tahun) => (
                          <button
                            key={tahun.id_tahun}
                            type="button"
                            onClick={() => {
                              handleChange("id_tahun", tahun.id_tahun.toString());
                              setOpenTahunDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_tahun === tahun.id_tahun.toString()
                              ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                              : 'text-gray-700'
                              }`}
                          >
                            <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span className="truncate">{tahun.tahun || tahun.nama || tahun.id_tahun}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
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

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpenUnitDropdown(false);
                  setOpenTahunDropdown(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium shadow-sm hover:bg-gray-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#0384d6] text-white text-sm font-semibold shadow-sm hover:bg-[#043975] hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
              >
                {initialData ? "Simpan Perubahan" : "Tambah Data"}
              </button>
            </div>
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

  // Dropdown state
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);
  const [openDosenDropdown, setOpenDosenDropdown] = useState(false);
  const [openJenisDropdown, setOpenJenisDropdown] = useState(false);
  const [openTahunDropdown, setOpenTahunDropdown] = useState(false);

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
    setOpenUnitDropdown(false);
    setOpenDosenDropdown(false);
    setOpenJenisDropdown(false);
    setOpenTahunDropdown(false);
  }, [initialData, authUser, isOpen]);

  const unitOptions = useMemo(() => {
    const units = maps?.units || maps?.unit_kerja || {};
    return Object.values(units);
  }, [maps]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openUnitDropdown && !event.target.closest('.unit-detail-dropdown-container') && !event.target.closest('.unit-detail-dropdown-menu')) {
        setOpenUnitDropdown(false);
      }
      if (openDosenDropdown && !event.target.closest('.dosen-dropdown-container') && !event.target.closest('.dosen-dropdown-menu')) {
        setOpenDosenDropdown(false);
      }
      if (openJenisDropdown && !event.target.closest('.jenis-dropdown-container') && !event.target.closest('.jenis-dropdown-menu')) {
        setOpenJenisDropdown(false);
      }
      if (openTahunDropdown && !event.target.closest('.tahun-detail-dropdown-container') && !event.target.closest('.tahun-detail-dropdown-menu')) {
        setOpenTahunDropdown(false);
      }
    };

    if (openUnitDropdown || openDosenDropdown || openJenisDropdown || openTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openUnitDropdown, openDosenDropdown, openJenisDropdown, openTahunDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Pengembangan DTPR" : "Tambah Pengembangan DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data pengembangan DTPR per dosen.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-6">
            {/* Tahun - Paling Atas */}
            <div>
              <label htmlFor="id_tahun" className="block text-sm font-medium text-slate-700 mb-2">
                Tahun Akademik <span className="text-red-500">*</span>
              </label>
              <div className="relative tahun-detail-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!initialData) {
                      setOpenTahunDropdown(!openTahunDropdown);
                      setOpenDosenDropdown(false);
                    }
                  }}
                  disabled={!!initialData}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_tahun
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Pilih tahun akademik"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.id_tahun ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.id_tahun
                        ? (() => {
                          const found = tahunList.find((t) => String(t.id_tahun) === String(form.id_tahun));
                          return found ? (found.tahun || found.nama || found.id_tahun) : "Pilih Tahun...";
                        })()
                        : "Pilih Tahun"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openTahunDropdown ? 'rotate-180' : ''
                      }`}
                    size={18}
                  />
                </button>
                {openTahunDropdown && !initialData && (
                  <div
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-detail-dropdown-menu mt-1 w-full"
                    style={{ minWidth: '200px' }}
                  >
                    {tahunList.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Tidak ada data tahun
                      </div>
                    ) : (
                      tahunList.map((tahun) => (
                        <button
                          key={tahun.id_tahun}
                          type="button"
                          onClick={() => {
                            handleChange("id_tahun", tahun.id_tahun.toString());
                            setOpenTahunDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_tahun === tahun.id_tahun.toString()
                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                            : 'text-gray-700'
                            }`}
                        >
                          <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                          <span className="truncate">{tahun.tahun || tahun.nama || tahun.id_tahun}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dosen */}
            <div>
              <label htmlFor="id_dosen" className="block text-sm font-medium text-slate-700 mb-2">
                Dosen DTPR <span className="text-red-500">*</span>
              </label>
              <div className="relative dosen-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDosenDropdown(!openDosenDropdown);
                    setOpenTahunDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_dosen
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih dosen DTPR"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.id_dosen ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.id_dosen
                        ? (() => {
                          const found = dosenList.find((d) => String(d.id_dosen) === String(form.id_dosen));
                          return found ? (found.nama || `Dosen ${found.id_dosen}`) : "Pilih Dosen...";
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
                      dosenList.map((dosen) => (
                        <button
                          key={dosen.id_dosen}
                          type="button"
                          onClick={() => {
                            handleChange("id_dosen", dosen.id_dosen.toString());
                            setOpenDosenDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_dosen === dosen.id_dosen.toString()
                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                            : 'text-gray-700'
                            }`}
                        >
                          <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                          <span className="truncate">{dosen.nama || `Dosen ${dosen.id_dosen}`}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Jenis Pengembangan - Diubah jadi Input Text */}
            <div>
              <label htmlFor="jenis_pengembangan" className="block text-sm font-medium text-slate-700 mb-1">
                Jenis Pengembangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jenis_pengembangan"
                value={form.jenis_pengembangan}
                onChange={(e) => handleChange("jenis_pengembangan", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Contoh: Tugas Belajar, Pelatihan, Seminar, Workshop..."
                required
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

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setOpenUnitDropdown(false);
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


/* ---------- Tabel Summary ---------- */
function SummaryTable({
  summaryData,
  maps,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  showDeleted,
  tahunTS,
  tahunTS1,
  tahunTS2,
  tahunTS3,
  tahunTS4,
}) {
  // Dropdown menu state for SummaryTable
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
          {/* Baris 1: Header utama - Tahun Akademik */}
          <tr>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white align-middle">
              &nbsp;
            </th>
            <th colSpan={5} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              Tahun Akademik
            </th>
          </tr>
          {/* Baris 2: Sub-header TS-4 s/d TS */}
          <tr>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-4</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-3</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-2</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-1</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS</th>
          </tr>

        </thead>
        <tbody>
          {summaryData && (Array.isArray(summaryData) ? summaryData[0] : summaryData) ? (() => {
            const data = Array.isArray(summaryData) ? summaryData[0] : summaryData;
            return (
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 border border-slate-200 font-medium text-slate-800 text-sm">
                  Jumlah Dosen DTPR
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 font-medium">
                  {data.jumlah_ts_4 || 0}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 font-medium">
                  {data.jumlah_ts_3 || 0}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 font-medium">
                  {data.jumlah_ts_2 || 0}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 font-medium">
                  {data.jumlah_ts_1 || 0}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200 text-slate-700 font-medium">
                  {data.jumlah_ts || 0}
                </td>
              </tr>
            );
          })() : (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-500 bg-slate-50 font-medium">
                Pilih tahun untuk melihat data summary.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Tabel Manajemen Data (CRUD Raw) ---------- */
function SummaryManagementTable({
  rows,
  maps,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  showDeleted,
  // Pagination props
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container') && !event.target.closest('.fixed')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', () => setOpenDropdownId(null), true);
    window.addEventListener('resize', () => setOpenDropdownId(null));
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setOpenDropdownId(null), true);
      window.removeEventListener('resize', () => setOpenDropdownId(null));
    };
  }, [openDropdownId]);

  // Logic: Pagination
  const sortedRows = [...rows].sort((a, b) => b.id_tahun - a.id_tahun);
  const totalItems = sortedRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md mb-8">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr>
            <th className="px-4 py-3 uppercase tracking-wide text-xs font-semibold border border-white/20">Tahun Akademik</th>
            <th className="px-4 py-3 uppercase tracking-wide text-xs font-semibold text-center border border-white/20">Jumlah Dosen DTPR</th>
            <th className="px-4 py-3 uppercase tracking-wide text-xs font-semibold text-center border border-white/20">Link Bukti</th>
            <th className="px-4 py-3 uppercase tracking-wide text-xs font-semibold text-center border border-white/20 w-20">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.length > 0 ? paginatedRows.map((row) => (
            <tr
              key={row.id}
              className="bg-white hover:bg-slate-50 border-b border-slate-100 transition-colors"
            >
              <td className="px-4 py-3.5 font-medium text-slate-800 border border-slate-200">
                Tahun Akademik {maps.tahun[row.id_tahun]?.tahun || row.id_tahun}
              </td>
              <td className="px-4 py-3.5 text-center text-slate-700 border border-slate-200 font-medium">
                {row.jumlah_dtpr || 0}
              </td>
              <td className="px-4 py-3.5 border border-slate-200 text-center text-slate-600 font-medium text-xs">
                {row.link_bukti ? (
                  <a href={row.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975] transition-colors">Lihat Bukti</a>
                ) : <span className="text-slate-400">-</span>}
              </td>
              <td className="px-2 py-3 border border-slate-200 text-center">
                <div className="flex items-center justify-center dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openDropdownId !== row.id) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropdownPosition({ top: rect.bottom + 4, left: Math.max(8, rect.right - 160) });
                        setOpenDropdownId(row.id);
                      } else {
                        setOpenDropdownId(null);
                      }
                    }}
                    className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 focus:outline-none"
                    aria-label="Menu manajemen data"
                  >
                    <FiMoreVertical size={16} />
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 italic bg-slate-50">Belum ada data operasional tahun akademik. Silakan klik + Tambah Data.</td></tr>
          )}
        </tbody>
      </table>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between sm:flex-row flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Data per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 text-sm border border-slate-300 rounded hover:border-[#0384d6] focus:outline-none focus:ring-1 focus:ring-[#0384d6] bg-white transition-all font-medium text-slate-700"
            >
              {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">
              Halaman <span className="text-slate-800 font-bold">{currentPage}</span> dari <span className="text-slate-800 font-bold">{totalPages || 1}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-600"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {openDropdownId && (
        <div
          className="fixed w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          {!showDeleted ? (
            <>
              <button
                onClick={() => { onEdit(rows.find(r => r.id === openDropdownId)); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-slate-50 text-left"
              >
                <FiEdit2 size={14} /> Edit
              </button>
              <button
                onClick={() => { onDelete(rows.find(r => r.id === openDropdownId)); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <FiTrash2 size={14} /> Hapus
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onRestore(rows.find(r => r.id === openDropdownId)); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 text-left"
              >
                <FiRotateCw size={14} /> Pulihkan
              </button>
              <button
                onClick={() => { onHardDelete(rows.find(r => r.id === openDropdownId)); setOpenDropdownId(null); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 text-left font-medium"
              >
                <FiXCircle size={14} /> Hapus Permanen
              </button>
            </>
          )}
        </div>
      )}
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
  yearsConfig,

  handleSelectAll,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) {


  // filteredRows is now just the rows passed (paginated)
  const filteredRows = rows;

  // Dropdown menu state for DetailTable
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

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* Baris 1: Header Utama */}
          <tr>
            {showDeleted && (
              <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white w-16 align-middle">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                />
              </th>
            )}
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white align-middle">
              Jenis Pengembangan DTPR
            </th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white align-middle">
              Nama DTPR
            </th>
            <th colSpan={5} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
              Jumlah
            </th>
            <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white align-middle">
              Link Bukti
            </th>
            <th rowSpan={2} className="px-2 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white w-20 align-middle">
              Aksi
            </th>
          </tr>
          {/* Baris 2: TS-4, TS-3, TS-2, TS-1, TS */}
          <tr>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-4</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-3</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-2</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS-1</th>
            <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">TS</th>
          </tr>
        </thead>



        <tbody>
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
                key={r.id_pengembangan || `row-${i}`}
                className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}
              >
                {showDeleted && (
                  <td className="px-4 py-3.5 text-center border border-slate-200">
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
                <td className="px-4 py-3.5 border border-slate-200 text-slate-700 font-medium">
                  {r.jenis_pengembangan || "-"}
                </td>
                <td className="px-4 py-3.5 border border-slate-200 font-medium text-slate-800">{r.nama_dtpr || "-"}</td>
                <td className="px-4 py-3.5 text-center border border-slate-200 text-slate-700 font-medium">{r.jumlah_ts_4 || 0}</td>
                <td className="px-4 py-3.5 text-center border border-slate-200 text-slate-700 font-medium">{r.jumlah_ts_3 || 0}</td>
                <td className="px-4 py-3.5 text-center border border-slate-200 text-slate-700 font-medium">{r.jumlah_ts_2 || 0}</td>
                <td className="px-4 py-3.5 text-center border border-slate-200 text-slate-700 font-medium">{r.jumlah_ts_1 || 0}</td>
                <td className="px-4 py-3.5 text-center border border-slate-200 text-slate-700 font-medium">{r.jumlah_ts || 0}</td>
                <td className="px-4 py-3.5 border border-slate-200 text-center text-slate-600 font-medium text-xs">
                  {r.link_bukti || r.link_bukti_ts || r.link_bukti_ts_1 || r.link_bukti_ts_2 || r.link_bukti_ts_3 || r.link_bukti_ts_4 ? (
                    <a
                      href={r.link_bukti || r.link_bukti_ts || r.link_bukti_ts_1 || r.link_bukti_ts_2 || r.link_bukti_ts_3 || r.link_bukti_ts_4}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0384d6] underline hover:text-[#043975] transition-colors"
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
                        // Gunakan composite key untuk pivot row
                        const rowId = `${r.id_dosen}-${r.jenis_pengembangan}` || i;
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
                      aria-expanded={openDropdownId === (`${r.id_dosen}-${r.jenis_pengembangan}` || i)}
                    >
                      <FiMoreVertical size={18} />
                    </button>

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

      {/* Dropdown Menu - Fixed Position for DetailTable */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = `${r.id_dosen}-${r.jenis_pengembangan}` || idx;
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
                aria-label={`Edit data ${currentRow.nama_dtpr || ''}`}
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
                aria-label={`Hapus data ${currentRow.nama_dtpr || ''}`}
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
                aria-label={`Pulihkan data ${currentRow.nama_dtpr || ''}`}
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
                aria-label={`Hapus permanen data ${currentRow.nama_dtpr || ''}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
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
export default function Tabel3A3({ auth, role }) {
  const { authUser } = useAuth();
  const { maps: mapsFromHook } = useMaps(auth?.user || authUser || true);
  const maps = mapsFromHook ?? { units: {}, unit_kerja: {}, tahun: {} };

  // Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [summaryRawRows, setSummaryRawRows] = useState([]); // New state for CRUD raw table
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Detail state
  const [detailRows, setDetailRows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showDeleted, setShowDeleted] = useState(false);
  const [showDeletedSummary, setShowDeletedSummary] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [openTahunFilterDropdown, setOpenTahunFilterDropdown] = useState(false);

  // Pagination State (Detail Table)
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailItemsPerPage, setDetailItemsPerPage] = useState(5);

  // Pagination State (Summary Management Table)
  const [summaryCurrentPage, setSummaryCurrentPage] = useState(1);
  const [summaryItemsPerPage, setSummaryItemsPerPage] = useState(5);

  // Modal state
  const [modalSummaryOpen, setModalSummaryOpen] = useState(false);
  const [modalDetailOpen, setModalDetailOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState(null);
  const [editingDetail, setEditingDetail] = useState(null);

  // Modal Detail Records state (Hybrid mode - untuk lihat detail per dosen+jenis)
  const [modalDetailRecordsOpen, setModalDetailRecordsOpen] = useState(false);
  const [selectedDosenInfo, setSelectedDosenInfo] = useState(null); // { id_dosen, nama_dtpr, jenis_pengembangan }


  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalSummaryOpen || modalDetailOpen) {
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
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [modalSummaryOpen, modalDetailOpen]);



  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Helper function untuk sorting data berdasarkan Nama DTPR (A-Z)
  const sortRowsByLatest = (rowsArray) => {
    return [...rowsArray].sort((a, b) => {
      // 1. Prioritaskan Nama DTPR (A-Z) sesuai request terbaru
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
    const tahun = Object.values(maps?.tahun || {});
    return tahun.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
  }, [maps?.tahun]);

  // Hitung TS, TS-1, TS-2, TS-3, TS-4 berdasarkan tahun yang dipilih
  const { tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 } = useMemo(() => {
    if (!selectedTahun) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null, tahunTS3: null, tahunTS4: null };
    }

    const sortedTahunList = [...tahunList].sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
    const selectedIndex = sortedTahunList.findIndex(t => t.id_tahun === parseInt(selectedTahun));

    if (selectedIndex === -1) {
      return { tahunTS: null, tahunTS1: null, tahunTS2: null, tahunTS3: null, tahunTS4: null };
    }

    const tahunTS = sortedTahunList[selectedIndex]?.id_tahun;
    const tahunTS1 = selectedIndex > 0 ? sortedTahunList[selectedIndex - 1]?.id_tahun : tahunTS;
    const tahunTS2 = selectedIndex > 1 ? sortedTahunList[selectedIndex - 2]?.id_tahun : tahunTS1;
    const tahunTS3 = selectedIndex > 2 ? sortedTahunList[selectedIndex - 3]?.id_tahun : tahunTS2;
    const tahunTS4 = selectedIndex > 3 ? sortedTahunList[selectedIndex - 4]?.id_tahun : tahunTS3;

    return { tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 };
  }, [selectedTahun, tahunList]);

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

  // Unified Refresh Function for Summary
  const refreshSummaryData = async () => {
    if (!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4) return;

    setSummaryLoading(true);
    try {
      // 1. Refresh Pivot Table
      const pivotUrl = `${ENDPOINT_SUMMARY}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeletedSummary ? "&is_deleted=1" : ""}`;
      const pivotData = await apiFetch(pivotUrl);
      setSummaryData(pivotData);

      // 2. Refresh Raw Management Table (with 5-year filter)
      const rawUrl = showDeletedSummary ? `${ENDPOINT_SUMMARY}?is_deleted=1` : ENDPOINT_SUMMARY;
      const rawData = await apiFetch(rawUrl);
      const currentYears = [tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4].map(Number);
      const filteredData = (Array.isArray(rawData) ? rawData : []).filter(r => currentYears.includes(Number(r.id_tahun)));
      setSummaryRawRows(filteredData);
    } catch (err) {
      console.error("Refresh summary error:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch Summary data on TS/Filter change
  useEffect(() => {
    refreshSummaryData();
  }, [showDeletedSummary, tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4]);

  // Fetch Detail data (Pivot Mode untuk tampilan 5 tahun)
  useEffect(() => {
    const fetchDetail = async () => {
      if (!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4) return;

      setDetailLoading(true);
      try {
        let url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}`;
        if (showDeleted) {
          url += "&is_deleted=1";
        }
        const data = await apiFetch(url);
        const rowsArray = Array.isArray(data) ? data : [];
        const sortedRows = sortRowsByLatest(rowsArray);
        setDetailRows(sortedRows);
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

    fetchDetail();
    setSelectedRows([]);
    setDetailCurrentPage(1); // Reset page on filter change
  }, [showDeleted, tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4]);



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

      // Refresh data using unified function
      await refreshSummaryData();
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

      // Refresh data (mode pivot)
      const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&include_deleted=1" : ""}`;
      const data = await apiFetch(url);
      const rowsArray = Array.isArray(data) ? data : [];
      const sortedRows = sortRowsByLatest(rowsArray);
      setDetailRows(sortedRows);

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
  const handleEditSummary = (data) => {
    setEditingSummary({
      ...data,
      id: data.id,
      id_tahun: data.id_tahun,
      jumlah_dtpr: data.jumlah_dtpr,
      link_bukti: data.link_bukti,
    });
    setModalSummaryOpen(true);
  };

  // Handle Delete Summary - hapus 1 record spesifik
  const handleDeleteSummary = async (data) => {
    // Ambil ID dan tahun dari data yang dikirim
    const recordId = data.id;
    const tahunLabel = tahunList.find(t => String(t.id_tahun) === String(data.id_tahun))?.tahun || data.id_tahun;

    if (!recordId) {
      Swal.fire('Error', 'ID record tidak ditemukan.', 'error');
      return;
    }

    Swal.fire({
      title: 'Anda yakin?',
      text: `Data jumlah DTPR untuk tahun ${tahunLabel} akan dihapus (soft delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Hapus hanya 1 record berdasarkan ID
          await apiFetch(`${ENDPOINT_SUMMARY}/${recordId}`, { method: "DELETE" });

          // Refresh data
          await refreshSummaryData();

          // Tutup modal jika masih terbuka
          setModalSummaryOpen(false);
          setEditingSummary(null);

          Swal.fire('Dihapus!', `Data jumlah DTPR untuk tahun ${tahunLabel} telah dihapus.`, 'success');
        } catch (err) {
          console.error("Delete summary error:", err);
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Handle Restore Summary
  const handleRestoreSummary = async (data) => {
    const recordId = data.id;
    const tahunLabel = tahunList.find(t => String(t.id_tahun) === String(data.id_tahun))?.tahun || data.id_tahun;

    if (!recordId) {
      Swal.fire('Error', 'ID record tidak ditemukan.', 'error');
      return;
    }

    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data jumlah DTPR untuk tahun ${tahunLabel} akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT_SUMMARY}/${recordId}/restore`, { method: "POST" });

          // Refresh data
          await refreshSummaryData();

          Swal.fire('Dipulihkan!', `Data jumlah DTPR untuk tahun ${tahunLabel} telah dipulihkan.`, 'success');
        } catch (err) {
          console.error("Restore summary error:", err);
          Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Handle Hard Delete Summary
  const handleHardDeleteSummary = async (data) => {
    const recordId = data.id;
    const tahunLabel = tahunList.find(t => String(t.id_tahun) === String(data.id_tahun))?.tahun || data.id_tahun;

    if (!recordId) {
      Swal.fire('Error', 'ID record tidak ditemukan.', 'error');
      return;
    }

    Swal.fire({
      title: 'Hapus Permanen?',
      html: `Data jumlah DTPR untuk tahun <strong>${tahunLabel}</strong> akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`${ENDPOINT_SUMMARY}/${recordId}/hard`, { method: "DELETE" });

          // Refresh data
          await refreshSummaryData();

          Swal.fire('Dihapus Permanen!', `Data jumlah DTPR untuk tahun ${tahunLabel} telah dihapus permanen.`, 'success');
        } catch (err) {
          console.error("Hard delete summary error:", err);
          Swal.fire('Gagal!', `Gagal menghapus permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Handle View Detail Records (Hybrid mode - buka modal dengan record per dosen+jenis)
  const handleViewDetailRecords = (row) => {
    setSelectedDosenInfo({
      id_dosen: row.id_dosen,
      nama_dtpr: row.nama_dtpr || 'Dosen',
      jenis_pengembangan: row.jenis_pengembangan || '-'
    });
    setModalDetailRecordsOpen(true);
  };

  // Handle Edit Detail (dipanggil dari ModalDetailRecords)
  const handleEditDetail = async (row) => {
    // Cari ID dari tahun manapun yang ada datanya
    const id = row.id_pengembangan
      || row.id_pengembangan_ts
      || row.id_pengembangan_ts_1
      || row.id_pengembangan_ts_2
      || row.id_pengembangan_ts_3
      || row.id_pengembangan_ts_4;
    if (!id) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak ada data',
        text: 'Tidak ada data pengembangan untuk dosen ini.'
      });
      return;
    }
    try {
      const detail = await apiFetch(`${ENDPOINT_DETAIL}/${id}`);
      setEditingDetail(detail);
      setModalDetailRecordsOpen(false);
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
          const deleteId = row.id_pengembangan || row.id_pengembangan_ts || row.id_pengembangan_ts_1 || row.id_pengembangan_ts_2 || row.id_pengembangan_ts_3 || row.id_pengembangan_ts_4;
          await apiFetch(`${ENDPOINT_DETAIL}/${deleteId}`, { method: "DELETE" });

          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&is_deleted=1" : ""}`;
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
          const hardDeleteId = row.id_pengembangan || row.id_pengembangan_ts || row.id_pengembangan_ts_1 || row.id_pengembangan_ts_2 || row.id_pengembangan_ts_3 || row.id_pengembangan_ts_4;
          await apiFetch(`${ENDPOINT_DETAIL}/${hardDeleteId}/hard`, { method: "DELETE" });

          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&is_deleted=1" : ""}`;
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
          const restoreId = row.id_pengembangan || row.id_pengembangan_ts || row.id_pengembangan_ts_1 || row.id_pengembangan_ts_2 || row.id_pengembangan_ts_3 || row.id_pengembangan_ts_4;
          await apiFetch(`${ENDPOINT_DETAIL}/${restoreId}/restore`, { method: "POST" });

          const url = `${ENDPOINT_DETAIL}?id_tahun_ts=${tahunTS}&id_tahun_ts_1=${tahunTS1}&id_tahun_ts_2=${tahunTS2}&id_tahun_ts_3=${tahunTS3}&id_tahun_ts_4=${tahunTS4}${showDeleted ? "&is_deleted=1" : ""}`;
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

  // Select all logic - Backend already filters by is_deleted, so no need to filter again
  const filteredDetailRows = detailRows;
  const isAllSelected = filteredDetailRows.length > 0 && selectedRows.length === filteredDetailRows.length;

  // Pagination Logic (Detail Table)
  const indexOfLastItem = detailCurrentPage * detailItemsPerPage;
  const indexOfFirstItem = indexOfLastItem - detailItemsPerPage;
  const currentDetailRows = filteredDetailRows.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredDetailRows.map(r => r.id_pengembangan));
    }
  };

  // Fungsi export Excel
  const handleExport = async () => {
    try {
      // Buat workbook baru
      const wb = XLSX.utils.book_new();

      // Export Summary Table
      if (summaryData) {
        const summaryDataExport = [];

        // Header
        const summaryHeader = ['Tahun Akademik', 'TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS', 'Link Bukti'];
        summaryDataExport.push(summaryHeader);

        // Data
        const summaryRow = [
          'Jumlah Dosen DTPR',
          summaryData.jumlah_ts_4 || 0,
          summaryData.jumlah_ts_3 || 0,
          summaryData.jumlah_ts_2 || 0,
          summaryData.jumlah_ts_1 || 0,
          summaryData.jumlah_ts || 0,
          summaryData.link_bukti_ts || summaryData.link_bukti_ts_1 || summaryData.link_bukti_ts_2 || summaryData.link_bukti_ts_3 || summaryData.link_bukti_ts_4 || ''
        ];
        summaryDataExport.push(summaryRow);

        const wsSummary = XLSX.utils.aoa_to_sheet(summaryDataExport);
        wsSummary['!cols'] = [
          { wch: 25 },  // Tahun Akademik
          { wch: 12 },  // TS-4
          { wch: 12 },  // TS-3
          { wch: 12 },  // TS-2
          { wch: 12 },  // TS-1
          { wch: 12 },  // TS
          { wch: 40 }   // Link Bukti
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
      }

      // Export Detail Table
      if (filteredDetailRows && filteredDetailRows.length > 0) {
        const detailDataExport = [];

        // Header
        const detailHeader = [
          'Jenis Pengembangan DTPR',
          'Nama DTPR',
          'TS-4',
          'TS-3',
          'TS-2',
          'TS-1',
          'TS',
          'Link Bukti'
        ];
        detailDataExport.push(detailHeader);

        // Data rows
        filteredDetailRows.forEach((row) => {
          const detailRow = [
            row.jenis_pengembangan || '',
            row.nama_dtpr || '',
            row.jumlah_ts_4 || 0,
            row.jumlah_ts_3 || 0,
            row.jumlah_ts_2 || 0,
            row.jumlah_ts_1 || 0,
            row.jumlah_ts || 0,
            row.link_bukti || row.link_bukti_ts || row.link_bukti_ts_1 || row.link_bukti_ts_2 || row.link_bukti_ts_3 || row.link_bukti_ts_4 || ''
          ];
          detailDataExport.push(detailRow);
        });

        const wsDetail = XLSX.utils.aoa_to_sheet(detailDataExport);
        wsDetail['!cols'] = [
          { wch: 30 },  // Jenis Pengembangan DTPR
          { wch: 30 },  // Nama DTPR
          { wch: 12 },  // TS-4
          { wch: 12 },  // TS-3
          { wch: 12 },  // TS-2
          { wch: 12 },  // TS-1
          { wch: 12 },  // TS
          { wch: 40 }   // Link Bukti
        ];
        const detailSheetName = showDeleted ? 'Detail Terhapus' : 'Detail';
        XLSX.utils.book_append_sheet(wb, wsDetail, detailSheetName);
      }

      // Jika tidak ada data sama sekali
      if (!summaryData && (!filteredDetailRows || filteredDetailRows.length === 0)) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Generate file dan download
      const fileName = `Tabel_3A3_Pengembangan_DTPR_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor ke Excel.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error exporting data:", err);

      // Fallback ke CSV jika xlsx gagal
      try {
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };

        let csvContent = '\ufeff';

        // Export Summary
        if (summaryData) {
          csvContent += '=== SUMMARY ===\n';
          csvContent += ['Tahun Akademik', 'TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS', 'Link Bukti'].map(escapeCsv).join(',') + '\n';
          csvContent += [
            'Jumlah Dosen DTPR',
            summaryData.jumlah_ts_4 || 0,
            summaryData.jumlah_ts_3 || 0,
            summaryData.jumlah_ts_2 || 0,
            summaryData.jumlah_ts_1 || 0,
            summaryData.jumlah_ts || 0,
            summaryData.link_bukti_ts || summaryData.link_bukti_ts_1 || summaryData.link_bukti_ts_2 || summaryData.link_bukti_ts_3 || summaryData.link_bukti_ts_4 || ''
          ].map(escapeCsv).join(',') + '\n\n';
        }

        // Export Detail
        if (filteredDetailRows && filteredDetailRows.length > 0) {
          csvContent += '=== DETAIL ===\n';
          csvContent += ['Jenis Pengembangan DTPR', 'Nama DTPR', 'TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS', 'Link Bukti'].map(escapeCsv).join(',') + '\n';
          filteredDetailRows.forEach((row) => {
            csvContent += [
              row.jenis_pengembangan || '',
              row.nama_dtpr || '',
              row.jumlah_ts_4 || 0,
              row.jumlah_ts_3 || 0,
              row.jumlah_ts_2 || 0,
              row.jumlah_ts_1 || 0,
              row.jumlah_ts || 0,
              row.link_bukti || row.link_bukti_ts || row.link_bukti_ts_1 || row.link_bukti_ts_2 || row.link_bukti_ts_3 || row.link_bukti_ts_4 || ''
            ].map(escapeCsv).join(',') + '\n';
          });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tabel_3A3_Pengembangan_DTPR_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil diekspor ke CSV. File dapat dibuka di Excel.',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (csvErr) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengekspor data',
          text: err.message || 'Terjadi kesalahan saat mengekspor data.'
        });
      }
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Tabel untuk mencatat pengembangan DTPR (Dosen Tetap Program Studi) di bidang penelitian untuk periode 5 tahun akademik (TS-4, TS-3, TS-2, TS-1, TS).
          </p>
          {!detailLoading && !summaryLoading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredDetailRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Filter & Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {detailLoading || summaryLoading ? "Memuat..." : `${filteredDetailRows.length} baris detail`}
          </span>
          <label htmlFor="tahun" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Pilih Tahun Akademik (TS):
          </label>
          <div className="relative tahun-filter-dropdown-container" style={{ minWidth: '200px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!detailLoading && !summaryLoading) {
                  setOpenTahunFilterDropdown(!openTahunFilterDropdown);
                }
              }}
              disabled={detailLoading || summaryLoading}
              className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedTahun
                ? 'border-[#0384d6] bg-white'
                : 'border-slate-300 bg-white hover:border-gray-400'
                } ${(detailLoading || summaryLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Pilih tahun"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                <span className={`truncate ${selectedTahun ? 'text-slate-700' : 'text-slate-500'}`}>
                  {selectedTahun
                    ? (() => {
                      const found = tahunList.find((y) => String(y.id_tahun) === String(selectedTahun));
                      return found ? (found.tahun || found.nama) : selectedTahun;
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
            {openTahunFilterDropdown && !detailLoading && !summaryLoading && (
              <div
                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-filter-dropdown-menu mt-1 w-full"
                style={{ minWidth: '200px' }}
              >
                {tahunList.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Tidak ada data tahun
                  </div>
                ) : (
                  tahunList.map((y) => (
                    <button
                      key={y.id_tahun}
                      type="button"
                      onClick={() => {
                        setSelectedTahun(y.id_tahun.toString());
                        setOpenTahunFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedTahun === y.id_tahun.toString()
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                      <span>{y.tahun || y.nama || y.id_tahun}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedTahun && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold text-blue-700">TS:</span>
                <span className="text-xs font-medium text-blue-900">{tahunList.find(t => t.id_tahun === parseInt(tahunTS))?.tahun || tahunTS}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-xs font-bold text-indigo-700">TS-1:</span>
                <span className="text-xs font-medium text-indigo-900">{tahunList.find(t => t.id_tahun === parseInt(tahunTS1))?.tahun || tahunTS1}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-xs font-bold text-purple-700">TS-2:</span>
                <span className="text-xs font-medium text-purple-900">{tahunList.find(t => t.id_tahun === parseInt(tahunTS2))?.tahun || tahunTS2}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200">
                <span className="text-xs font-bold text-pink-700">TS-3:</span>
                <span className="text-xs font-medium text-pink-900">{tahunList.find(t => t.id_tahun === parseInt(tahunTS3))?.tahun || tahunTS3}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-700">TS-4:</span>
                <span className="text-xs font-medium text-rose-900">{tahunList.find(t => t.id_tahun === parseInt(tahunTS4))?.tahun || tahunTS4}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={detailLoading || summaryLoading || (!summaryData && (!filteredDetailRows || filteredDetailRows.length === 0))}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary Section - Jumlah Dosen DTPR */}
      <div className="mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Jumlah Dosen DTPR</h2>
            <div className="flex gap-2">
              {canDelete && (
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowDeletedSummary(false)}
                    disabled={summaryLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!showDeletedSummary
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                      } ${summaryLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Tampilkan data aktif"
                  >
                    Data
                  </button>
                  <button
                    onClick={() => setShowDeletedSummary(true)}
                    disabled={summaryLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${showDeletedSummary
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                      } ${summaryLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Tampilkan data terhapus"
                  >
                    Data Terhapus
                  </button>
                </div>
              )}
              {canCreate && (
                <button
                  onClick={() => {
                    setEditingSummary(null);
                    setModalSummaryOpen(true);
                  }}
                  className={`px-4 py-2 rounded-lg transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed ${!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#0384d6] text-white hover:bg-[#043975] shadow-md"
                    }`}
                  disabled={!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4 || summaryLoading}
                  aria-label="Tambah jumlah DTPR"
                >
                  + Tambah Jumlah DTPR
                </button>
              )}
            </div>
          </div>

          {summaryLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
              <p className="mt-4 text-slate-600">Memuat data...</p>
            </div>
          ) : !tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Pilih tahun akademik untuk melihat data summary.</p>
            </div>
          ) : (
            <SummaryTable
              summaryData={summaryData}
              maps={maps}
              canUpdate={canUpdate}
              canDelete={canDelete}
              onEdit={handleEditSummary}
              onDelete={handleDeleteSummary}
              onRestore={handleRestoreSummary}
              onHardDelete={handleHardDeleteSummary}
              showDeleted={showDeletedSummary}
              tahunTS={tahunTS}
              tahunTS1={tahunTS1}
              tahunTS2={tahunTS2}
              tahunTS3={tahunTS3}
              tahunTS4={tahunTS4}
            />
          )}

          {/* Manajemen Data Operasional (CRUD Raw) */}
          {!summaryLoading && tahunTS && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-5">
                <h3 className="text-lg font-semibold text-slate-900">Manajemen Data Dosen DTPR ({showDeletedSummary ? "Terhapus" : "Aktif"})</h3>
              </div>
              <SummaryManagementTable
                rows={summaryRawRows}
                maps={maps}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={handleEditSummary}
                onDelete={handleDeleteSummary}
                onRestore={handleRestoreSummary}
                onHardDelete={handleHardDeleteSummary}
                showDeleted={showDeletedSummary}
                // Pagination props
                currentPage={summaryCurrentPage}
                itemsPerPage={summaryItemsPerPage}
                onPageChange={setSummaryCurrentPage}
                onItemsPerPageChange={setSummaryItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Section - Pengembangan DTPR */}
      <div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Pengembangan DTPR</h2>
            <div className="flex gap-2">
              {canDelete && (
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setShowDeleted(false)}
                    disabled={detailLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!showDeleted
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                      } ${detailLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Tampilkan data aktif"
                  >
                    Data
                  </button>
                  <button
                    onClick={() => setShowDeleted(true)}
                    disabled={detailLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${showDeleted
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                      } ${detailLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    aria-label="Tampilkan data terhapus"
                  >
                    Data Terhapus
                  </button>
                </div>
              )}
              {canCreate && (
                <button
                  onClick={() => {
                    setEditingDetail(null);
                    setModalDetailOpen(true);
                  }}
                  className={`px-4 py-2 rounded-lg transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed ${!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#0384d6] text-white hover:bg-[#043975] shadow-md"
                    }`}
                  disabled={!tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4 || detailLoading}
                  aria-label="Tambah pengembangan DTPR"
                >
                  + Tambah Pengembangan DTPR
                </button>
              )}
            </div>
          </div>

          {detailLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
              <p className="mt-4 text-slate-600">Memuat data...</p>
            </div>
          ) : !tahunTS || !tahunTS1 || !tahunTS2 || !tahunTS3 || !tahunTS4 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Pilih tahun akademik untuk melihat data detail.</p>
            </div>
          ) : (
            <DetailTable
              rows={currentDetailRows}
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
              yearsConfig={{ tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 }}


              // Pagination Props
              currentPage={detailCurrentPage}
              itemsPerPage={detailItemsPerPage}
              totalItems={filteredDetailRows.length}
              onPageChange={setDetailCurrentPage}
              onItemsPerPageChange={(val) => {
                setDetailItemsPerPage(val);
                setDetailCurrentPage(1);
              }}
            />
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
        onDelete={handleDeleteSummary}
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



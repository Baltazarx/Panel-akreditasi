"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiChevronDown, FiCalendar, FiShield } from 'react-icons/fi';

const ENDPOINT = "/tabel-4c1-kerjasama-pkm";
const TABLE_KEY = "tabel_4c1_kerjasama_pkm";
const LABEL = "4.C.1 Kerjasama PKM";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedTahun }) {
  const [form, setForm] = useState({
    judul_kerjasama: "",
    mitra_kerja_sama: "",
    sumber: "",
    durasi_tahun: "",
    link_bukti: "",
    pendanaan: [] // Array untuk 3 tahun (TS-2, TS-1, TS): [{id_tahun, jumlah_dana}, ...]
  });

  // State untuk form input pendanaan baru
  const [selectedTahunPendanaan, setSelectedTahunPendanaan] = useState("");
  const [jumlahDanaPendanaan, setJumlahDanaPendanaan] = useState("");

  const [tahunList, setTahunList] = useState([]);

  // Dropdown state
  const [openSumberDropdown, setOpenSumberDropdown] = useState(false);
  const [openTahunPendanaanDropdown, setOpenTahunPendanaanDropdown] = useState(false);

  // Fetch tahun akademik
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const data = await apiFetch("/tahun-akademik");
        const list = Array.isArray(data) ? data : [];
        // Filter hanya tahun mulai dari 2020/2021 (id_tahun >= 2020)
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || "");
          // Filter tahun dengan id_tahun >= 2020 atau nama tahun mengandung "2020"
          return idTahun >= 2020 || tahunStr.includes("2020");
        });
        setTahunList(filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0))); // Urut dari terkecil ke terbesar
      } catch (err) {
        console.error("Error fetching tahun:", err);
        setTahunList([]);
      }
    };
    if (isOpen) fetchTahun();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Reset input pendanaan setiap kali form dibuka
      setSelectedTahunPendanaan("");
      setJumlahDanaPendanaan("");

      if (initialData) {
        // Load existing data
        setForm({
          judul_kerjasama: initialData.judul_kerjasama || "",
          mitra_kerja_sama: initialData.mitra_kerja_sama || "",
          sumber: initialData.sumber || "",
          durasi_tahun: initialData.durasi_tahun || "",
          link_bukti: initialData.link_bukti || "",
          pendanaan: initialData.pendanaan || []
        });

        // Fetch detail untuk mendapatkan pendanaan lengkap
        if (initialData.id) {
          apiFetch(`${ENDPOINT}/${initialData.id}`)
            .then(data => {
              if (data.pendanaan && Array.isArray(data.pendanaan)) {
                // Tampilkan semua pendanaan yang ada (tidak perlu filter)
                setForm(prev => ({ ...prev, pendanaan: data.pendanaan }));
              }
            })
            .catch(err => console.error("Error fetching detail:", err));
        }
      } else {
        // Reset form for new data
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
    setOpenTahunPendanaanDropdown(false);
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
      if (openSumberDropdown && !event.target.closest('.sumber-dropdown-container') && !event.target.closest('.sumber-dropdown-menu')) {
        setOpenSumberDropdown(false);
      }
      if (openTahunPendanaanDropdown && !event.target.closest('.tahun-pendanaan-dropdown-container') && !event.target.closest('.tahun-pendanaan-dropdown-menu')) {
        setOpenTahunPendanaanDropdown(false);
      }
    };

    if (openSumberDropdown || openTahunPendanaanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openSumberDropdown, openTahunPendanaanDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPendanaan = () => {
    if (!selectedTahunPendanaan) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Tahun',
        text: 'Silakan pilih tahun terlebih dahulu.'
      });
      return;
    }
    const jumlahDanaNum = parseFloat(jumlahDanaPendanaan) || 0;
    if (jumlahDanaNum < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Jumlah Dana Tidak Valid',
        text: 'Jumlah dana harus lebih besar atau sama dengan 0.'
      });
      return;
    }
    // Cek apakah tahun sudah ada di list
    const tahunSudahAda = form.pendanaan.some(p => p.id_tahun === selectedTahunPendanaan);
    if (tahunSudahAda) {
      Swal.fire({
        icon: 'warning',
        title: 'Tahun Sudah Ada',
        text: 'Tahun yang dipilih sudah ada dalam daftar pendanaan. Silakan pilih tahun lain atau edit yang sudah ada.'
      });
      return;
    }
    // Tambahkan ke list pendanaan
    setForm((prev) => ({
      ...prev,
      pendanaan: [...(Array.isArray(prev.pendanaan) ? prev.pendanaan : []), {
        id_tahun: selectedTahunPendanaan,
        jumlah_dana: jumlahDanaNum
      }]
    }));
    // Reset input
    setSelectedTahunPendanaan("");
    setJumlahDanaPendanaan("");
  };

  const removePendanaanRow = (index) => {
    setForm((prev) => {
      const newPendanaan = prev.pendanaan.filter((_, i) => i !== index);
      return { ...prev, pendanaan: newPendanaan };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi minimal 1 pendanaan
    const pendanaanArray = Array.isArray(form.pendanaan) ? form.pendanaan : [];
    if (pendanaanArray.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pendanaan Wajib',
        text: 'Minimal harus ada 1 data pendanaan.'
      });
      return;
    }
    // Validasi semua pendanaan harus memiliki tahun dan jumlah dana
    const invalidPendanaan = pendanaanArray.some(p => !p.id_tahun || p.jumlah_dana === undefined || p.jumlah_dana === null || p.jumlah_dana < 0);
    if (invalidPendanaan) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Pendanaan Tidak Lengkap',
        text: 'Semua pendanaan harus memiliki tahun yang dipilih dan jumlah dana yang valid (minimal 0).'
      });
      return;
    }
    setOpenSumberDropdown(false);
    setOpenTahunPendanaanDropdown(false);
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
      style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Kerjasama PKM" : "Tambah Kerjasama PKM"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Kerjasama PKM sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Judul Kerjasama */}
          <div>
            <label htmlFor="judul_kerjasama" className="block text-sm font-medium text-slate-700 mb-1">
              Judul Kerjasama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_kerjasama"
              value={form.judul_kerjasama}
              onChange={(e) => handleChange("judul_kerjasama", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Judul kerjasama..."
              required
            />
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    setOpenTahunPendanaanDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.sumber
                      ? 'border-[#0384d6] bg-white'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih sumber"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.sumber ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.sumber === "L"
                        ? "L - Lokal"
                        : form.sumber === "N"
                          ? "N - Nasional"
                          : form.sumber === "I"
                            ? "I - Internasional"
                            : "-- Pilih Sumber --"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openSumberDropdown ? 'rotate-180' : ''
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
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${!form.sumber
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>-- Pilih Sumber --</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "L");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber === "L"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>L - Lokal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "N");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber === "N"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>N - Nasional</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("sumber", "I");
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber === "I"
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                        }`}
                    >
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>I - Internasional</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Durasi Tahun */}
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
          </div>

          {/* Pendanaan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Pendanaan (Rp Juta) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Pilih tahun dan masukkan jumlah dana, lalu klik "Tambah" untuk menambahkan ke daftar.</p>

            {/* Form Input Pendanaan Baru */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 mb-1">Pilih Tahun</label>
                  <div className="relative tahun-pendanaan-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenTahunPendanaanDropdown(!openTahunPendanaanDropdown);
                        setOpenSumberDropdown(false);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg text-black text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedTahunPendanaan
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih tahun"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                        <span className={`truncate text-sm ${selectedTahunPendanaan ? 'text-gray-900' : 'text-gray-500'}`}>
                          {selectedTahunPendanaan
                            ? (() => {
                              const found = tahunList.find((t) => String(t.id_tahun) === String(selectedTahunPendanaan));
                              return found ? (found.tahun || found.nama || found.id_tahun) : "-- Pilih Tahun --";
                            })()
                            : "-- Pilih Tahun --"}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openTahunPendanaanDropdown ? 'rotate-180' : ''
                          }`}
                        size={14}
                      />
                    </button>
                    {openTahunPendanaanDropdown && (
                      <div
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto tahun-pendanaan-dropdown-menu mt-1 w-full"
                        style={{ minWidth: '200px' }}
                      >
                        {tahunList.length === 0 ? (
                          <div className="px-3 py-2 text-xs text-gray-500 text-center">
                            Tidak ada data tahun
                          </div>
                        ) : (
                          tahunList.map((t) => (
                            <button
                              key={t.id_tahun}
                              type="button"
                              onClick={() => {
                                setSelectedTahunPendanaan(t.id_tahun.toString());
                                setOpenTahunPendanaanDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors text-sm ${selectedTahunPendanaan === t.id_tahun.toString()
                                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                  : 'text-gray-700'
                                }`}
                            >
                              <FiCalendar className="text-[#0384d6] flex-shrink-0" size={12} />
                              <span className="truncate">{t.tahun || t.nama || t.id_tahun}</span>
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
                    value={jumlahDanaPendanaan}
                    onChange={(e) => setJumlahDanaPendanaan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                    placeholder="0"
                    min="0"
                    step="1"
                    autoComplete="off"
                    autoFocus={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPendanaan}
                  className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Daftar Pendanaan yang Sudah Ditambahkan */}
            {form.pendanaan.length > 0 && (
              <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-white">
                <label className="block text-xs font-medium text-slate-700 mb-2">Daftar Pendanaan:</label>
                {form.pendanaan.map((p, idx) => {
                  const tahunInfo = tahunList.find(t => t.id_tahun === p.id_tahun);
                  const tahunLabel = tahunInfo ? (tahunInfo.tahun || tahunInfo.nama || tahunInfo.id_tahun) : `Tahun ${p.id_tahun}`;

                  return (
                    <div key={`pendanaan-${idx}-${p.id_tahun}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700">{tahunLabel}</span>
                        <span className="text-sm text-slate-500 ml-2">
                          : Rp {new Intl.NumberFormat('id-ID').format(p.jumlah_dana || 0)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendanaanRow(idx)}
                        className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        title="Hapus pendanaan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
                setOpenSumberDropdown(false);
                setOpenTahunPendanaanDropdown(false);
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

export default function Tabel4C1({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openTahunFilterDropdown, setOpenTahunFilterDropdown] = useState(false);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  const canHardDelete = roleCan(role, TABLE_KEY, "H");

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

      // Fallback ke ID jika tidak ada timestamp
      const idFieldA = getIdField(a);
      const idFieldB = getIdField(b);
      return (b[idFieldB] || 0) - (a[idFieldA] || 0);
    });
  };

  // Fetch tahun akademik
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const data = await apiFetch("/tahun-akademik");
        const list = Array.isArray(data) ? data : [];
        // Filter hanya tahun mulai dari 2020/2021 (id_tahun >= 2020)
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || "");
          // Filter tahun dengan id_tahun >= 2020 atau nama tahun mengandung "2020"
          return idTahun >= 2020 || tahunStr.includes("2020");
        });
        const sorted = filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0)); // Urut dari terkecil ke terbesar
        setTahunList(sorted);
        if (sorted.length > 0 && !selectedTahun) {
          // Prioritaskan tahun 2024/2025, jika tidak ada cari 2024/2025, lalu fallback ke 2020/2021
          let tahun2024 = sorted.find(t => {
            const tahunStr = String(t.tahun || t.nama || "").toLowerCase();
            const yearId = String(t.id_tahun || "");
            return (tahunStr.includes("2024/2025") || yearId.includes("2024/2025"));
          });
          if (!tahun2024) {
            tahun2024 = sorted.find(t => {
              const tahunStr = String(t.tahun || t.nama || "").toLowerCase();
              const yearId = String(t.id_tahun || "");
              return tahunStr.includes("2024") || tahunStr.includes("2025") ||
                yearId.includes("2024") || yearId.includes("2025");
            });
          }
          if (!tahun2024) {
            tahun2024 = sorted.find(t => {
              const tahunStr = String(t.tahun || t.nama || "");
              return tahunStr.includes("2020") || parseInt(t.id_tahun) === 2020;
            });
          }
          setSelectedTahun(tahun2024 ? tahun2024.id_tahun : sorted[0].id_tahun);
        }
      } catch (err) {
        console.error("Error fetching tahun:", err);
      }
    };
    fetchTahun();
  }, []);

  // Hitung yearOrder untuk 5 kolom TS (TS-4, TS-3, TS-2, TS-1, TS) berdasarkan selectedTahun
  const yearOrder = useMemo(() => {
    if (tahunList.length === 0 || !selectedTahun) return [];

    const idx = tahunList.findIndex((y) => y.id_tahun === selectedTahun);
    if (idx === -1) return [];

    // Tahun yang dipilih = TS (kolom paling kanan)
    const ts = tahunList[idx]?.id_tahun;
    const ts1 = idx > 0 ? tahunList[idx - 1]?.id_tahun : null; // Tahun sebelumnya = TS-1
    const ts2 = idx > 1 ? tahunList[idx - 2]?.id_tahun : null; // Tahun sebelumnya lagi = TS-2
    const ts3 = idx > 2 ? tahunList[idx - 3]?.id_tahun : null; // Tahun sebelumnya lagi = TS-3
    const ts4 = idx > 3 ? tahunList[idx - 4]?.id_tahun : null; // Tahun sebelumnya lagi = TS-4

    // Urutan array dari kiri ke kanan: [TS-4, TS-3, TS-2, TS-1, TS]
    // Tampilkan semua 5 kolom meskipun ada null (untuk konsistensi tampilan)
    return [ts4, ts3, ts2, ts1, ts];
  }, [tahunList, selectedTahun]);

  // Mapping tahun ke label untuk display
  const yearLabelMap = useMemo(() => {
    if (tahunList.length === 0 || !selectedTahun) return {};

    const idx = tahunList.findIndex((y) => y.id_tahun === selectedTahun);
    if (idx === -1) return {};

    const map = {};
    // Tahun yang dipilih = TS
    map[tahunList[idx]?.id_tahun] = 'TS';
    // Tahun sebelumnya = TS-1
    if (idx > 0) map[tahunList[idx - 1]?.id_tahun] = 'TS-1';
    // Tahun sebelumnya lagi = TS-2
    if (idx > 1) map[tahunList[idx - 2]?.id_tahun] = 'TS-2';
    // Tahun sebelumnya lagi = TS-3
    if (idx > 2) map[tahunList[idx - 3]?.id_tahun] = 'TS-3';
    // Tahun sebelumnya lagi = TS-4
    if (idx > 3) map[tahunList[idx - 4]?.id_tahun] = 'TS-4';

    return map;
  }, [tahunList, selectedTahun]);

  // Helper function untuk mendapatkan nama tahun
  const getTahunName = (id) => {
    if (!id) return null;
    const found = tahunList.find(t => t.id_tahun === id);
    return found ? (found.tahun || found.nama || found.id_tahun) : id;
  };

  // Fetch data - menggunakan ts_id seperti yang diharapkan backend
  const fetchRows = async () => {
    if (!selectedTahun) return;

    try {
      setLoading(true);
      setError("");

      // Build URL dengan ts_id (backend akan menghitung 5 tahun secara otomatis)
      let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
      if (showDeleted) {
        url += "&include_deleted=1";
      }

      const response = await apiFetch(url);

      const data = Array.isArray(response.data) ? response.data : (response.items || []);

      // Hapus duplikasi berdasarkan ID (jika ada)
      const uniqueData = data.filter((row, index, self) => {
        const rowId = getIdField(row) ? row[getIdField(row)] : row.id;
        return index === self.findIndex((r) => {
          const rId = getIdField(r) ? r[getIdField(r)] : r.id;
          return rId === rowId;
        });
      });

      const sortedRows = sortRowsByLatest(uniqueData);
      setRows(sortedRows);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTahun) {
      fetchRows();
    }
  }, [selectedTahun, showDeleted]);

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

  // Handle save (create/update)
  const handleSave = async (formData) => {
    try {
      if (editData) {
        await apiFetch(`${ENDPOINT}/${editData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Kerjasama PKM berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Kerjasama PKM berhasil ditambahkan.', 'success');
      }
      setShowForm(false);
      setEditData(null);
      fetchRows();
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal menyimpan data", 'error');
    }
  };

  // Handle delete
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan dihapus (soft delete).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}`, { method: 'DELETE' });
        Swal.fire('Berhasil!', 'Data berhasil dihapus.', 'success');
        fetchRows();
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle restore
  const handleRestore = async (row) => {
    try {
      await apiFetch(`${ENDPOINT}/${row.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...row, deleted_at: null })
      });
      Swal.fire('Berhasil!', 'Data berhasil dipulihkan.', 'success');
      fetchRows();
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal memulihkan data", 'error');
    }
  };

  // Handle hard delete
  const handleHardDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: 'DELETE' });
        Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        fetchRows();
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!selectedTahun) {
      Swal.fire('Peringatan!', 'Pilih tahun akademik terlebih dahulu.', 'warning');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${ENDPOINT}/export?ts_id=${selectedTahun}`, {
        credentials: 'include',
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tabel_4C1_Kerjasama_PKM_${selectedTahun}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire('Berhasil!', 'Data berhasil diekspor.', 'success');
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal mengekspor data", 'error');
    }
  };

  // Filter rows dan hapus duplikasi
  const filteredRows = useMemo(() => {
    let filtered = [];
    if (showDeleted) {
      // Hanya tampilkan data yang benar-benar dihapus (deleted_at IS NOT NULL)
      filtered = rows.filter(r => r.deleted_at);
    } else {
      // Tampilkan data yang tidak dihapus (deleted_at IS NULL)
      filtered = rows.filter(r => !r.deleted_at);
    }

    // Hapus duplikasi berdasarkan ID
    const uniqueFiltered = filtered.filter((row, index, self) => {
      const rowId = getIdField(row) ? row[getIdField(row)] : row.id;
      return index === self.findIndex((r) => {
        const rId = getIdField(r) ? r[getIdField(r)] : r.id;
        return rId === rowId;
      });
    });

    return uniqueFiltered;
  }, [rows, showDeleted]);

  // Calculate summary berdasarkan field pendanaan dari backend (5 kolom: TS-4, TS-3, TS-2, TS-1, TS)
  const summary = useMemo(() => {
    const activeRows = rows.filter(r => !r.deleted_at);

    // Hitung total dana untuk setiap kolom TS dari field backend
    const totalDanaTS4 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts4) || 0), 0);
    const totalDanaTS3 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts3) || 0), 0);
    const totalDanaTS2 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts2) || 0), 0);
    const totalDanaTS1 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts1) || 0), 0);
    const totalDanaTS = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts) || 0), 0);

    // Map ke array sesuai urutan yearOrder [TS-4, TS-3, TS-2, TS-1, TS]
    const totalsByPosition = [totalDanaTS4, totalDanaTS3, totalDanaTS2, totalDanaTS1, totalDanaTS];

    const jumlahKerjasama = activeRows.length;

    return {
      totalsByPosition,
      jumlahKerjasama
    };
  }, [rows]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Kerjasama PKM untuk tabel 4C-1.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tahun Akademik Selector */}
          <div className="relative tahun-filter-dropdown-container" style={{ minWidth: '200px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setOpenTahunFilterDropdown(!openTahunFilterDropdown);
              }}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedTahun
                  ? 'border-[#0384d6] bg-white text-black'
                  : 'border-gray-300 bg-white text-black hover:border-gray-400'
                }`}
              aria-label="Pilih tahun"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                <span className={`truncate ${selectedTahun ? 'text-black' : 'text-gray-500'}`}>
                  {selectedTahun
                    ? (() => {
                      const found = tahunList.find((y) => y.id_tahun === selectedTahun);
                      return found ? (found.tahun || found.nama || found.id_tahun) : selectedTahun;
                    })()
                    : "-- Pilih Tahun --"}
                </span>
              </div>
              <FiChevronDown
                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openTahunFilterDropdown ? 'rotate-180' : ''
                  }`}
                size={16}
              />
            </button>
            {openTahunFilterDropdown && (
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

          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${filteredRows.length} baris`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors flex items-center gap-2"
            >
              <FiPlus size={18} />
              Tambah Data
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownload size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul Kerjasama</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Mitra kerja sama</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Sumber<br />(L/N/I)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Durasi<br />(tahun)
              </th>
              {yearOrder.length > 0 && (
                <th colSpan={yearOrder.length} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  Pendanaan (Rp Juta)
                </th>
              )}
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
              )}
            </tr>
            {yearOrder.length > 0 && (
              <tr>
                {yearOrder.map((yearId, idx) => {
                  // Selalu tampilkan 5 kolom TS meskipun ada null
                  // Label berdasarkan posisi: TS-4, TS-3, TS-2, TS-1, TS
                  const label = yearId != null
                    ? (yearLabelMap[yearId] || 'TS')
                    : (idx === 0 ? 'TS-4' : idx === 1 ? 'TS-3' : idx === 2 ? 'TS-2' : idx === 3 ? 'TS-1' : 'TS');
                  return (
                    <th key={yearId ?? `null-${idx}`} className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                      {label}
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={yearOrder.length > 0 ? 6 + yearOrder.length + (canUpdate || canDelete ? 1 : 0) : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={yearOrder.length > 0 ? 6 + yearOrder.length + (canUpdate || canDelete ? 1 : 0) : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              <>
                {filteredRows.map((r, i) => {
                  const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                  const isDeleted = r.deleted_at;

                  // Format pendanaan ke juta rupiah
                  const formatPendanaan = (value) => {
                    if (!value || value === 0) return "-";
                    return (value / 1000000).toFixed(2);
                  };

                  return (
                    <tr
                      key={rowId}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                        <div className="truncate" title={r.judul_kerjasama || ""}>
                          {r.judul_kerjasama || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.mitra_kerja_sama || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.sumber || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.durasi_tahun || "-"}</td>
                      {yearOrder.map((yearId, idx) => {
                        // Selalu tampilkan 5 kolom TS meskipun ada null
                        if (yearId == null) {
                          return (
                            <td key={`null-${idx}`} className="px-6 py-4 text-center border border-slate-200 text-slate-700">
                              -
                            </td>
                          );
                        }
                        // Backend mengembalikan field: pendanaan_ts4, pendanaan_ts3, pendanaan_ts2, pendanaan_ts1, pendanaan_ts
                        // Map ke posisi sesuai yearOrder [TS-4, TS-3, TS-2, TS-1, TS]
                        const pendanaanFields = ['pendanaan_ts4', 'pendanaan_ts3', 'pendanaan_ts2', 'pendanaan_ts1', 'pendanaan_ts'];
                        const fieldName = pendanaanFields[idx];
                        const jumlahDana = r[fieldName] || 0;
                        return (
                          <td key={yearId} className="px-6 py-4 text-center border border-slate-200 text-slate-700">
                            {formatPendanaan(jumlahDana)}
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">
                        {r.link_bukti ? (
                          <a
                            href={r.link_bukti}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0384d6] underline hover:text-[#043975]"
                          >
                            Lihat
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
                })}

                {/* Summary Rows - Hanya tampilkan jika tidak menampilkan data yang dihapus */}
                {filteredRows.length > 0 && !loading && !showDeleted && (
                  <>
                    {/* Jumlah Dana */}
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan="5" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Dana
                      </td>
                      {yearOrder.map((yearId, idx) => {
                        if (yearId == null) {
                          return (
                            <td key={`null-${idx}`} className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-slate-100">
                              -
                            </td>
                          );
                        }
                        // totalsByPosition sesuai urutan [TS-4, TS-3, TS-2, TS-1, TS]
                        const totalDana = summary.totalsByPosition[idx] || 0;
                        return (
                          <td key={yearId} className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-slate-100">
                            {(totalDana / 1000000).toFixed(2)}
                          </td>
                        );
                      })}
                      <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                    </tr>

                    {/* Jumlah Kerjasama */}
                    <tr className="bg-slate-50 font-semibold">
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Kerjasama
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-slate-100">
                        {summary.jumlahKerjasama}
                      </td>
                      <td colSpan={yearOrder.length > 0 ? yearOrder.length + 3 : 3} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
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
                  setEditData(currentRow);
                  setShowForm(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label="Edit data"
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label="Hapus data"
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label="Pulihkan data"
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canHardDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label="Hapus permanen data"
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal Form */}
      <ModalForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSave={handleSave}
        initialData={editData}
        maps={maps}
        authUser={authUser}
        selectedTahun={selectedTahun}
      />
    </div>
  );
}


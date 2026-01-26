"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiChevronDown, FiCalendar, FiUser, FiShield, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ENDPOINT = "/tabel-4a2-pkm";
const TABLE_KEY = "tabel_4a2_pkm";
const LABEL = "4.A.2 PkM DTPR";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedTahun }) {
  const [form, setForm] = useState({
    id_dosen_ketua: "",
    judul_pkm: "",
    jml_mhs_terlibat: "",
    jenis_hibah_pkm: "",
    sumber_dana: "",
    durasi_tahun: "",
    link_bukti: "",
    pendanaan: [] // Array untuk pendanaan: [{id_tahun, jumlah_dana}, ...]
  });

  // State untuk form input pendanaan baru
  const [selectedTahunPendanaan, setSelectedTahunPendanaan] = useState("");
  const [jumlahDanaPendanaan, setJumlahDanaPendanaan] = useState("");

  const [dosenList, setDosenList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [tahunLaporan, setTahunLaporan] = useState(null);

  // Dropdown state
  const [openDosenDropdown, setOpenDosenDropdown] = useState(false);
  const [openSumberDropdown, setOpenSumberDropdown] = useState(false);
  const [openTahunPendanaanDropdown, setOpenTahunPendanaanDropdown] = useState(false);

  // Fetch dosen list
  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const data = await apiFetch("/dosen");
        const list = Array.isArray(data) ? data : [];
        const dosenMap = new Map();
        list.forEach((d) => {
          const id = d.id_dosen;
          if (!dosenMap.has(id)) {
            dosenMap.set(id, {
              id_dosen: id,
              nama: d.nama_lengkap || d.nama || `${d.nama_depan || ""} ${d.nama_belakang || ""}`.trim() || `Dosen ${id}`
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
      // Pre-fill selected tahun from filter if available
      setSelectedTahunPendanaan(selectedTahun || "");
      setJumlahDanaPendanaan("");

      if (initialData) {
        // Load existing data
        setForm({
          id_dosen_ketua: initialData.id_dosen_ketua || "",
          judul_pkm: initialData.judul_pkm || "",
          jml_mhs_terlibat: initialData.jml_mhs_terlibat || "",
          jenis_hibah_pkm: initialData.jenis_hibah_pkm || "",
          sumber_dana: initialData.sumber_dana || "",
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
          id_dosen_ketua: "",
          judul_pkm: "",
          jml_mhs_terlibat: "",
          jenis_hibah_pkm: "",
          sumber_dana: "",
          durasi_tahun: "",
          link_bukti: "",
          pendanaan: []
        });
      }
    }
    setOpenDosenDropdown(false);
    setOpenSumberDropdown(false);
    setOpenTahunPendanaanDropdown(false);
  }, [initialData, isOpen]);

  // Get tahun laporan untuk menentukan tahun laporan (untuk display di tabel)
  useEffect(() => {
    const getTahunLaporan = async () => {
      try {
        // Prioritaskan tahun 2020/2021, jika tidak ada gunakan tahun pertama
        if (tahunList.length > 0 && selectedTahun) {
          const ts_id = selectedTahun;

          // Fetch data untuk mendapatkan tahun_laporan
          const response = await apiFetch(`${ENDPOINT}?ts_id=${ts_id}`);
          if (response.tahun_laporan) {
            setTahunLaporan(response.tahun_laporan);
          }
        }
      } catch (err) {
        console.error("Error getting tahun laporan:", err);
      }
    };

    if (isOpen && tahunList.length > 0 && selectedTahun) {
      getTahunLaporan();
    }
  }, [isOpen, tahunList, selectedTahun]);

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
      if (openSumberDropdown && !event.target.closest('.sumber-dropdown-container') && !event.target.closest('.sumber-dropdown-menu')) {
        setOpenSumberDropdown(false);
      }
      if (openTahunPendanaanDropdown && !event.target.closest('.tahun-pendanaan-dropdown-container') && !event.target.closest('.tahun-pendanaan-dropdown-menu')) {
        setOpenTahunPendanaanDropdown(false);
      }
    };

    if (openDosenDropdown || openSumberDropdown || openTahunPendanaanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDosenDropdown, openSumberDropdown, openTahunPendanaanDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePendanaanChange = (index, field, value) => {
    setForm((prev) => {
      const newPendanaan = [...prev.pendanaan];
      newPendanaan[index] = {
        ...newPendanaan[index],
        [field]: field === 'jumlah_dana' ? parseFloat(value) || 0 : value
      };
      return { ...prev, pendanaan: newPendanaan };
    });
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
    setOpenDosenDropdown(false);
    setOpenSumberDropdown(false);
    setOpenTahunPendanaanDropdown(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit PkM DTPR" : "Tambah PkM DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data PkM DTPR sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Dosen Ketua */}
          <div>
            <label htmlFor="id_dosen_ketua" className="block text-sm font-medium text-slate-700 mb-2">
              Dosen Ketua (DTPR) <span className="text-red-500">*</span>
            </label>
            <div className="relative dosen-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDosenDropdown(!openDosenDropdown);
                  setOpenSumberDropdown(false);
                  setOpenTahunPendanaanDropdown(false);
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_dosen_ketua
                  ? 'border-[#0384d6] bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                aria-label="Pilih dosen"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${form.id_dosen_ketua ? 'text-gray-900' : 'text-gray-500'}`}>
                    {form.id_dosen_ketua
                      ? (() => {
                        const found = dosenList.find((d) => String(d.id_dosen) === String(form.id_dosen_ketua));
                        return found ? found.nama : "-- Pilih Dosen --";
                      })()
                      : "-- Pilih Dosen --"}
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
                          handleChange("id_dosen_ketua", d.id_dosen.toString());
                          setOpenDosenDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_dosen_ketua === d.id_dosen.toString()
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

          {/* Judul PkM */}
          <div>
            <label htmlFor="judul_pkm" className="block text-sm font-medium text-slate-700 mb-1">
              Judul PkM <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_pkm"
              value={form.judul_pkm}
              onChange={(e) => handleChange("judul_pkm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Judul PkM..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jumlah Mahasiswa Terlibat */}
            <div>
              <label htmlFor="jml_mhs_terlibat" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Mahasiswa Terlibat
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

          {/* Jenis Hibah PkM */}
          <div>
            <label htmlFor="jenis_hibah_pkm" className="block text-sm font-medium text-slate-700 mb-1">
              Jenis Hibah PkM
            </label>
            <input
              type="text"
              id="jenis_hibah_pkm"
              value={form.jenis_hibah_pkm}
              onChange={(e) => handleChange("jenis_hibah_pkm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Jenis hibah..."
            />
          </div>

          {/* Sumber Dana */}
          <div>
            <label htmlFor="sumber_dana" className="block text-sm font-medium text-slate-700 mb-2">
              Sumber Dana (L/N/I) <span className="text-red-500">*</span>
            </label>
            <div className="relative sumber-dropdown-container">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenSumberDropdown(!openSumberDropdown);
                  setOpenDosenDropdown(false);
                  setOpenTahunPendanaanDropdown(false);
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.sumber_dana
                  ? 'border-[#0384d6] bg-white'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                aria-label="Pilih sumber dana"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${form.sumber_dana ? 'text-gray-900' : 'text-gray-500'}`}>
                    {form.sumber_dana === "L"
                      ? "L - Lembaga"
                      : form.sumber_dana === "N"
                        ? "N - Nasional"
                        : form.sumber_dana === "I"
                          ? "I - Internasional"
                          : "-- Pilih Sumber Dana --"}
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
                      handleChange("sumber_dana", "");
                      setOpenSumberDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${!form.sumber_dana
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                    <span>-- Pilih Sumber Dana --</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("sumber_dana", "L");
                      setOpenSumberDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber_dana === "L"
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                    <span>L - Lembaga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange("sumber_dana", "N");
                      setOpenSumberDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber_dana === "N"
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
                      handleChange("sumber_dana", "I");
                      setOpenSumberDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.sumber_dana === "I"
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
                        setOpenDosenDropdown(false);
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
                setOpenDosenDropdown(false);
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

export default function Tabel4A2({ auth, role: propRole, selectedTahun: propSelectedTahun }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);

  const [rows, setRows] = useState([]);
  const [tahunLaporan, setTahunLaporan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [linkRoadmap, setLinkRoadmap] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [openTahunFilterDropdown, setOpenTahunFilterDropdown] = useState(false);

  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  const canHardDelete = roleCan(role, TABLE_KEY, "H");

  // [PERBAIKAN] Hitung tahun awal periode 5 tahun untuk roadmap
  const tahunAwalPeriode = useMemo(() => {
    if (!selectedTahun) return null;
    const ts = parseInt(selectedTahun);
    if (isNaN(ts)) return null;
    const sisa = ts % 5;
    if (sisa === 4) return ts; // Contoh: 2024 -> 2024
    if (sisa === 0) return ts - 1; // Contoh: 2025 -> 2024
    return ts - sisa - 1; // Contoh: 2026 -> 2024, 2027 -> 2024, 2028 -> 2024
  }, [selectedTahun]);

  // [PERBAIKAN] Load roadmap berdasarkan periode 5 tahun
  useEffect(() => {
    if (tahunAwalPeriode) {
      const storageKey = `roadmap_4a2_${authUser?.id_unit || 'global'}_${tahunAwalPeriode}`;
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        setLinkRoadmap(saved);
      } else {
        setLinkRoadmap("");
      }
    }
  }, [tahunAwalPeriode, authUser?.id_unit]);

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
          // Prioritaskan tahun 2024/2025 (ID 2024 atau mulai dengan "2024")
          const tahun2024 = sorted.find(t => {
            const tahunStr = String(t.tahun || t.nama || "");
            const idTahun = parseInt(t.id_tahun);
            return idTahun === 2024 || tahunStr.startsWith("2024");
          });
          setSelectedTahun(tahun2024 ? tahun2024.id_tahun : sorted[sorted.length - 1].id_tahun);
        }
      } catch (err) {
        console.error("Error fetching tahun:", err);
      }
    };
    fetchTahun();
  }, []);

  // Fetch data
  const fetchRows = async () => {
    if (!selectedTahun) return;

    try {
      setLoading(true);
      setError("");
      let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
      if (showDeleted) {
        url += "&include_deleted=1";
      }
      const response = await apiFetch(url);

      if (response.tahun_laporan) {
        setTahunLaporan(response.tahun_laporan);
      }

      const data = Array.isArray(response.data) ? response.data : (response.items || []);
      // Primary sort: Nama DTPR (A-Z), Secondary: Latest (if names same)
      const sortedRows = [...data].sort((a, b) => {
        const nameA = a.nama_dtpr || "";
        const nameB = b.nama_dtpr || "";
        const nameCompare = nameA.localeCompare(nameB);
        if (nameCompare !== 0) return nameCompare;

        // Fallback to latest timestamp if names are equal
        return sortRowsByLatest([a, b])[0] === a ? -1 : 1;
      });
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
        Swal.fire('Berhasil!', 'Data PkM berhasil diperbarui.', 'success');
      } else {
        // [PERBAIKAN] Sisipkan linkRoadmap otomatis saat tambah data baru
        const finalData = { ...formData, link_roadmap: linkRoadmap };
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(finalData)
        });
        Swal.fire('Berhasil!', 'Data PkM berhasil ditambahkan.', 'success');
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
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data "${row.judul_pkm || 'data ini'}" akan dipulihkan.`,
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

          fetchRows();
        } catch (e) {
          console.error("Restore error:", e);
          const errorMessage = e.message || e.error || 'Terjadi kesalahan saat memulihkan data';
          Swal.fire({
            icon: 'error',
            title: 'Gagal memulihkan data',
            text: errorMessage
          });
        }
      }
    });
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
      a.download = `Tabel_4A2_PkM_DTPR_${selectedTahun}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      Swal.fire('Berhasil!', 'Data berhasil diekspor.', 'success');
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal mengekspor data", 'error');
    }
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    if (showDeleted) {
      // Hanya tampilkan data yang benar-benar dihapus (deleted_at IS NOT NULL)
      return rows.filter(r => r.deleted_at !== null && r.deleted_at !== undefined);
    }
    // Tampilkan data yang tidak dihapus (deleted_at IS NULL)
    return rows.filter(r => r.deleted_at === null || r.deleted_at === undefined);
  }, [rows, showDeleted]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTahun, showDeleted]);

  // Calculate summary (hanya dari data yang tidak dihapus)
  const summary = useMemo(() => {
    // Selalu hitung dari data yang tidak dihapus, bukan dari filteredRows
    const activeRows = rows.filter(r => !r.deleted_at);
    const totalDanaTS4 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts4) || 0), 0);
    const totalDanaTS3 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts3) || 0), 0);
    const totalDanaTS2 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts2) || 0), 0);
    const totalDanaTS1 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts1) || 0), 0);
    const totalDanaTS = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts) || 0), 0);
    const jumlahPkm = activeRows.length;
    const uniqueJenisHibah = new Set(activeRows.map(r => r.jenis_hibah_pkm).filter(Boolean));
    const jumlahJenisHibah = uniqueJenisHibah.size;

    return {
      totalDanaTS4,
      totalDanaTS3,
      totalDanaTS2,
      totalDanaTS1,
      totalDanaTS,
      jumlahPkm,
      jumlahJenisHibah
    };
  }, [rows]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data PkM DTPR untuk tabel 4A-2.
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
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Roadmap Card */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <label className="text-gray-800 font-bold text-base">Roadmap</label>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="url"
              value={linkRoadmap}
              onChange={(e) => setLinkRoadmap(e.target.value)}
              placeholder="Tuliskan link ke dokumen roadmap Pengabdian kepada Masyarakat"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              onClick={async () => {
                if (!selectedTahun) {
                  Swal.fire('Peringatan', 'Silakan pilih tahun terlebih dahulu.', 'warning');
                  return;
                }

                try {
                  setLoading(true);
                  // 1. Simpan ke Database secara global (untuk semua record unit ini)
                  await apiFetch(`${ENDPOINT}/roadmap-global`, {
                    method: 'POST',
                    body: JSON.stringify({
                      link_roadmap: linkRoadmap,
                      ts_id: selectedTahun
                    })
                  });

                  // 2. Simpan ke LocalStorage agar persisten di browser
                  if (tahunAwalPeriode) {
                    const storageKey = `roadmap_4a2_${authUser?.id_unit || 'global'}_${tahunAwalPeriode}`;
                    localStorage.setItem(storageKey, linkRoadmap);
                  }

                  // 3. Notifikasi Sukses
                  Swal.fire({
                    icon: 'success',
                    title: 'Roadmap Disimpan',
                    text: `Link roadmap untuk periode ${tahunAwalPeriode}-${tahunAwalPeriode + 4} berhasil diperbarui.`,
                    timer: 2000,
                    showConfirmButton: false
                  });

                  // 4. Refresh data agar roadmap di tabel (jika ada kolomnya) terupdate
                  fetchRows();
                } catch (err) {
                  console.error("Error saving roadmap:", err);
                  Swal.fire('Error', 'Gagal menyimpan roadmap ke database.', 'error');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap disabled:opacity-50"
              disabled={loading}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Nama DTPR<br />(Sebagai Ketua PkM)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul PkM</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Jumlah Mahasiswa<br />yang Terlibat
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Jenis Hibah PkM</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Sumber Dana<br />(L/N/I)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Durasi<br />(tahun)
              </th>
              {tahunLaporan && (
                <th colSpan="5" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  Pendanaan (Rp Juta)
                </th>
              )}
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
              )}
            </tr>
            {tahunLaporan && (
              <tr>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-4
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-3
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-2
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-1
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS
                </th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={tahunLaporan ? 13 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={tahunLaporan ? 13 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              <>
                {currentItems.map((r, i) => {
                  const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                  const isDeleted = r.deleted_at;

                  // Format pendanaan ke juta rupiah
                  const formatPendanaan = (value) => {
                    const num = parseFloat(value || 0) / 1000000;
                    if (num === 0) return 0; // Return number 0 agar konsisten tanpa tanda kutip kalau mau
                    // Format 2 desimal, lalu convert ke Number untuk hilangkan trailing zeros (7.50 -> 7.5, 0.00 -> 0)
                    return Number(num.toFixed(2));
                  };

                  return (
                    <tr
                      key={rowId}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_dtpr || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                        <div className="truncate" title={r.judul_pkm || ""}>
                          {r.judul_pkm || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.jml_mhs_terlibat || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.jenis_hibah_pkm || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.sumber_dana || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.durasi_tahun || "-"}</td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts4)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts3)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts2)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts1)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts)}</td>
                        </>
                      )}
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
                      <td colSpan="7" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Dana
                      </td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                            {(() => {
                              const val = summary.totalDanaTS4 / 1000000;
                              const formatted = val.toFixed(2);
                              return parseFloat(formatted) === 0 ? "0" : Number(formatted);
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                            {(() => {
                              const val = summary.totalDanaTS3 / 1000000;
                              const formatted = val.toFixed(2);
                              return parseFloat(formatted) === 0 ? "0" : Number(formatted);
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                            {(() => {
                              const val = summary.totalDanaTS2 / 1000000;
                              const formatted = val.toFixed(2);
                              return parseFloat(formatted) === 0 ? "0" : Number(formatted);
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                            {(() => {
                              const val = summary.totalDanaTS1 / 1000000;
                              const formatted = val.toFixed(2);
                              return parseFloat(formatted) === 0 ? "0" : Number(formatted);
                            })()}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                            {(() => {
                              const val = summary.totalDanaTS / 1000000;
                              const formatted = val.toFixed(2);
                              return parseFloat(formatted) === 0 ? "0" : Number(formatted);
                            })()}
                          </td>
                        </>
                      )}
                      <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                    </tr>

                    {/* Jumlah PkM */}
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan="2" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah PkM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                        {summary.jumlahPkm}
                      </td>
                      <td colSpan={tahunLaporan ? 9 : 4} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>

                    {/* Jumlah Jenis Hibah PKM */}
                    <tr className="bg-slate-50 font-semibold">
                      <td colSpan="4" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Jenis Hibah PKM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-white">
                        {summary.jumlahJenisHibah}
                      </td>
                      <td colSpan={tahunLaporan ? 7 : 2} className="px-6 py-4 border border-slate-200"></td>
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

      {/* Pagination Controls */}
      {!loading && filteredRows.length > 0 && (() => {
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

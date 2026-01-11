"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiChevronDown, FiCalendar, FiUser } from 'react-icons/fi';

const ENDPOINT = "/tabel-4c3-hki-pkm";
const TABLE_KEY = "tabel_4c3_hki_pkm";
const LABEL = "4.C.3 Perolehan HKI PKM";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedTahun, tahunLaporan }) {
  const [form, setForm] = useState({
    id_dosen: "",
    judul_hki: "",
    jenis_hki: "",
    id_tahun_perolehan: "",
    link_bukti: ""
  });

  const [dosenList, setDosenList] = useState([]);
  const [tahunList, setTahunList] = useState([]);

  // Dropdown state
  const [openDosenDropdown, setOpenDosenDropdown] = useState(false);
  const [openTahunDropdown, setOpenTahunDropdown] = useState(false);

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

  // Fetch tahun akademik (5 tahun: TS-4, TS-3, TS-2, TS-1, TS)
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        let tahunIds = [];
        let order = [];

        if (tahunLaporan && tahunLaporan.id_ts && tahunLaporan.id_ts1 && tahunLaporan.id_ts2 && tahunLaporan.id_ts3 && tahunLaporan.id_ts4) {
          // Gunakan tahunLaporan jika semua 5 tahun tersedia
          tahunIds = [
            tahunLaporan.id_ts4,
            tahunLaporan.id_ts3,
            tahunLaporan.id_ts2,
            tahunLaporan.id_ts1,
            tahunLaporan.id_ts
          ];
          order = [
            tahunLaporan.id_ts,
            tahunLaporan.id_ts1,
            tahunLaporan.id_ts2,
            tahunLaporan.id_ts3,
            tahunLaporan.id_ts4
          ];
        } else if (selectedTahun) {
          // Fallback: hitung dari selectedTahun jika tahunLaporan belum lengkap atau belum ada
          const ts = parseInt(selectedTahun, 10);
          if (!isNaN(ts)) {
            tahunIds = [ts - 4, ts - 3, ts - 2, ts - 1, ts];
            order = [ts, ts - 1, ts - 2, ts - 3, ts - 4];
          }
        }

        if (tahunIds.length > 0) {
          const data = await apiFetch("/tahun-akademik");
          const list = Array.isArray(data) ? data : [];
          const filtered = list.filter(t => tahunIds.includes(t.id_tahun));
          // Urutkan dari TS ke TS-4 (dari terbaru ke terlama)
          setTahunList(filtered.sort((a, b) => {
            const indexA = order.indexOf(a.id_tahun);
            const indexB = order.indexOf(b.id_tahun);
            return indexA - indexB;
          }));
        } else {
          setTahunList([]);
        }
      } catch (err) {
        console.error("Error fetching tahun:", err);
        setTahunList([]);
      }
    };
    if (isOpen && (tahunLaporan || selectedTahun)) {
      fetchTahun();
    }
  }, [isOpen, tahunLaporan, selectedTahun]);

  // Initialize form data
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
      if (openTahunDropdown && !event.target.closest('.tahun-dropdown-container') && !event.target.closest('.tahun-dropdown-menu')) {
        setOpenTahunDropdown(false);
      }
    };

    if (openDosenDropdown || openTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDosenDropdown, openTahunDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenDosenDropdown(false);
    setOpenTahunDropdown(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Perolehan HKI PKM" : "Tambah Perolehan HKI PKM"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Perolehan HKI PKM sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Dosen (DTPR) */}
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
              Judul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_hki"
              value={form.judul_hki}
              onChange={(e) => handleChange("judul_hki", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Judul HKI..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jenis HKI */}
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
                placeholder="Jenis HKI..."
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
                          const found = tahunList.find((t) => String(t.id_tahun) === String(form.id_tahun_perolehan));
                          if (found) {
                            let label = found.tahun || found.nama || found.id_tahun;
                            if (tahunLaporan) {
                              if (found.id_tahun === tahunLaporan.id_ts4) label = `TS-4 (${label})`;
                              else if (found.id_tahun === tahunLaporan.id_ts3) label = `TS-3 (${label})`;
                              else if (found.id_tahun === tahunLaporan.id_ts2) label = `TS-2 (${label})`;
                              else if (found.id_tahun === tahunLaporan.id_ts1) label = `TS-1 (${label})`;
                              else if (found.id_tahun === tahunLaporan.id_ts) label = `TS (${label})`;
                            } else if (selectedTahun) {
                              const ts = parseInt(selectedTahun, 10);
                              if (!isNaN(ts)) {
                                const tId = parseInt(found.id_tahun, 10);
                                if (tId === ts) label = `TS (${label})`;
                                else if (tId === ts - 1) label = `TS-1 (${label})`;
                                else if (tId === ts - 2) label = `TS-2 (${label})`;
                                else if (tId === ts - 3) label = `TS-3 (${label})`;
                                else if (tId === ts - 4) label = `TS-4 (${label})`;
                              }
                            }
                            return label;
                          }
                          return "-- Pilih Tahun --";
                        })()
                        : "-- Pilih Tahun --"}
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
                      tahunList.map((t) => {
                        let label = t.tahun || t.nama || t.id_tahun;

                        // Tentukan label TS berdasarkan tahunLaporan atau selectedTahun
                        if (tahunLaporan) {
                          if (t.id_tahun === tahunLaporan.id_ts4) label = `TS-4 (${label})`;
                          else if (t.id_tahun === tahunLaporan.id_ts3) label = `TS-3 (${label})`;
                          else if (t.id_tahun === tahunLaporan.id_ts2) label = `TS-2 (${label})`;
                          else if (t.id_tahun === tahunLaporan.id_ts1) label = `TS-1 (${label})`;
                          else if (t.id_tahun === tahunLaporan.id_ts) label = `TS (${label})`;
                        } else if (selectedTahun) {
                          // Fallback: hitung dari selectedTahun
                          const ts = parseInt(selectedTahun, 10);
                          if (!isNaN(ts)) {
                            const tId = parseInt(t.id_tahun, 10);
                            if (tId === ts) label = `TS (${label})`;
                            else if (tId === ts - 1) label = `TS-1 (${label})`;
                            else if (tId === ts - 2) label = `TS-2 (${label})`;
                            else if (tId === ts - 3) label = `TS-3 (${label})`;
                            else if (tId === ts - 4) label = `TS-4 (${label})`;
                          }
                        }

                        return (
                          <button
                            key={t.id_tahun}
                            type="button"
                            onClick={() => {
                              handleChange("id_tahun_perolehan", t.id_tahun.toString());
                              setOpenTahunDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_tahun_perolehan === t.id_tahun.toString()
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                              }`}
                          >
                            <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
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
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tabel4C3({ auth, role: propRole }) {
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
        // Filter tahun mulai dari 2020/2021 (id_tahun >= 2020 atau tahun string mengandung "2020")
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || t.id_tahun || "").toLowerCase();
          return idTahun >= 2020 || tahunStr.includes("2020") || tahunStr.includes("2021");
        });
        const sorted = filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0)); // Urut dari terkecil ke terbesar
        setTahunList(sorted);
        if (sorted.length > 0 && !selectedTahun) {
          // Set default ke tahun 2025/2026 jika ada, jika tidak ambil tahun terbesar (terakhir)
          const defaultTahun = sorted.find(t => {
            const idTahun = parseInt(t.id_tahun) || 0;
            const tahunStr = String(t.tahun || t.nama || "").toLowerCase();
            return idTahun === 2025 || tahunStr.includes("2025/2026") || tahunStr.includes("2025");
          });
          // Fallback ke tahun terbesar (terakhir dalam sorted array)
          setSelectedTahun(defaultTahun ? defaultTahun.id_tahun : sorted[sorted.length - 1].id_tahun);
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
      const sortedRows = sortRowsByLatest(data);
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
        Swal.fire('Berhasil!', 'Data Perolehan HKI PKM berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Perolehan HKI PKM berhasil ditambahkan.', 'success');
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
        // Refresh dengan parameter yang sesuai dengan state showDeleted
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response.tahun_laporan) {
          setTahunLaporan(response.tahun_laporan);
        }
        const data = Array.isArray(response.data) ? response.data : (response.items || []);
        setRows(data);
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
        // Refresh dengan parameter yang sesuai dengan state showDeleted
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response.tahun_laporan) {
          setTahunLaporan(response.tahun_laporan);
        }
        const data = Array.isArray(response.data) ? response.data : (response.items || []);
        setRows(data);
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
      a.download = `Tabel_4C3_HKI_PKM_${selectedTahun}.xlsx`;
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
      // Filter data yang dihapus: deleted_at tidak null dan tidak undefined
      return rows.filter(r => r.deleted_at !== null && r.deleted_at !== undefined);
    }
    // Filter data aktif: deleted_at null atau undefined
    return rows.filter(r => r.deleted_at === null || r.deleted_at === undefined);
  }, [rows, showDeleted]);

  // Calculate summary (hanya dari data yang tidak dihapus)
  const summary = useMemo(() => {
    const activeRows = rows.filter(r => !r.deleted_at);

    // Jumlah HKI per tahun
    let jumlahHkiTS4 = 0;
    let jumlahHkiTS3 = 0;
    let jumlahHkiTS2 = 0;
    let jumlahHkiTS1 = 0;
    let jumlahHkiTS = 0;

    activeRows.forEach(row => {
      if (tahunLaporan) {
        // Check TS-4
        if (row.id_tahun_perolehan === tahunLaporan.id_ts4 || row.tahun_ts4 === '√') {
          jumlahHkiTS4++;
        }
        // Check TS-3
        if (row.id_tahun_perolehan === tahunLaporan.id_ts3 || row.tahun_ts3 === '√') {
          jumlahHkiTS3++;
        }
        // Check TS-2
        if (row.id_tahun_perolehan === tahunLaporan.id_ts2 || row.tahun_ts2 === '√') {
          jumlahHkiTS2++;
        }
        // Check TS-1
        if (row.id_tahun_perolehan === tahunLaporan.id_ts1 || row.tahun_ts1 === '√') {
          jumlahHkiTS1++;
        }
        // Check TS
        if (row.id_tahun_perolehan === tahunLaporan.id_ts || row.tahun_ts === '√') {
          jumlahHkiTS++;
        }
      }
    });

    return {
      jumlahHkiTS4,
      jumlahHkiTS3,
      jumlahHkiTS2,
      jumlahHkiTS1,
      jumlahHkiTS
    };
  }, [rows, tahunLaporan]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Perolehan HKI PKM untuk tabel 4C-3.
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
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Jenis HKI</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Nama DTPR
              </th>
              {tahunLaporan && (
                <th colSpan="5" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  Tahun Perolehan<br />(beri tanda √)
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
                <td colSpan={tahunLaporan ? 11 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={tahunLaporan ? 11 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              <>
                {filteredRows.map((r, i) => {
                  const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                  // Buat key yang unik dengan menggabungkan rowId dan index untuk menghindari duplikasi
                  const uniqueKey = `${rowId}-${i}`;
                  const isDeleted = r.deleted_at;

                  // Check checkmark untuk 5 tahun
                  const checkTS4 = tahunLaporan && (r.id_tahun_perolehan === tahunLaporan.id_ts4 || r.tahun_ts4 === '√');
                  const checkTS3 = tahunLaporan && (r.id_tahun_perolehan === tahunLaporan.id_ts3 || r.tahun_ts3 === '√');
                  const checkTS2 = tahunLaporan && (r.id_tahun_perolehan === tahunLaporan.id_ts2 || r.tahun_ts2 === '√');
                  const checkTS1 = tahunLaporan && (r.id_tahun_perolehan === tahunLaporan.id_ts1 || r.tahun_ts1 === '√');
                  const checkTS = tahunLaporan && (r.id_tahun_perolehan === tahunLaporan.id_ts || r.tahun_ts === '√');

                  return (
                    <tr
                      key={uniqueKey}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                        <div className="truncate" title={r.judul_hki || ""}>
                          {r.judul_hki || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.jenis_hki || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_dtpr || "-"}</td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS4 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS3 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS2 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS1 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS ? "√" : ""}</td>
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

                {/* Summary Row - Hanya tampilkan jika tidak menampilkan data yang dihapus */}
                {filteredRows.length > 0 && !loading && !showDeleted && tahunLaporan && (
                  <tr className="font-semibold">
                    <td colSpan="4" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      Jumlah HKI
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      {summary.jumlahHkiTS4}
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      {summary.jumlahHkiTS3}
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      {summary.jumlahHkiTS2}
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      {summary.jumlahHkiTS1}
                    </td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                      {summary.jumlahHkiTS}
                    </td>
                    <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                  </tr>
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
        tahunLaporan={tahunLaporan}
      />
    </div>
  );
}


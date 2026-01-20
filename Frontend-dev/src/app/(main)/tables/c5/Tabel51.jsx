"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiChevronDown, FiBriefcase, FiGlobe, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ENDPOINT = "/tabel-5-1-sistem-tata-kelola";
const TABLE_KEY = "tabel_5_1_sistem_tata_kelola";
const LABEL = "Tabel 5.1. Sistem Tata Kelola";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser }) {
  const [form, setForm] = useState({
    jenis_tata_kelola: "",
    nama_sistem_informasi: "",
    akses: "",
    id_unit_pengelola: "",
    link_bukti: ""
  });

  const [unitList, setUnitList] = useState([]);

  // Dropdown state
  const [openAksesDropdown, setOpenAksesDropdown] = useState(false);
  const [openUnitDropdown, setOpenUnitDropdown] = useState(false);

  // Fetch unit kerja list
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const data = await apiFetch("/unit-kerja");
        const list = Array.isArray(data) ? data : [];
        setUnitList(list.sort((a, b) => (a.nama_unit || "").localeCompare(b.nama_unit || "")));
      } catch (err) {
        console.error("Error fetching unit:", err);
        setUnitList([]);
      }
    };
    if (isOpen) fetchUnit();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          jenis_tata_kelola: initialData.jenis_tata_kelola || "",
          nama_sistem_informasi: initialData.nama_sistem_informasi || "",
          akses: initialData.akses || "",
          id_unit_pengelola: initialData.id_unit_pengelola || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        setForm({
          jenis_tata_kelola: "",
          nama_sistem_informasi: "",
          akses: "",
          id_unit_pengelola: "",
          link_bukti: ""
        });
      }
    }
    setOpenAksesDropdown(false);
    setOpenUnitDropdown(false);
  }, [initialData, isOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openAksesDropdown && !event.target.closest('.akses-dropdown-container') && !event.target.closest('.akses-dropdown-menu')) {
        setOpenAksesDropdown(false);
      }
      if (openUnitDropdown && !event.target.closest('.unit-dropdown-container') && !event.target.closest('.unit-dropdown-menu')) {
        setOpenUnitDropdown(false);
      }
    };

    if (openAksesDropdown || openUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openAksesDropdown, openUnitDropdown]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenAksesDropdown(false);
    setOpenUnitDropdown(false);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sistem Tata Kelola" : "Tambah Sistem Tata Kelola"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Sistem Tata Kelola sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Jenis Tata Kelola */}
          <div>
            <label htmlFor="jenis_tata_kelola" className="block text-sm font-medium text-slate-700 mb-1">
              Jenis Tata Kelola <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jenis_tata_kelola"
              value={form.jenis_tata_kelola}
              onChange={(e) => handleChange("jenis_tata_kelola", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Contoh: Pendidikan, Keuangan, SDM, dll..."
              required
            />
          </div>

          {/* Nama Sistem Informasi */}
          <div>
            <label htmlFor="nama_sistem_informasi" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Sistem Informasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama_sistem_informasi"
              value={form.nama_sistem_informasi}
              onChange={(e) => handleChange("nama_sistem_informasi", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Nama sistem informasi..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Akses */}
            <div>
              <label htmlFor="akses" className="block text-sm font-medium text-slate-700 mb-2">
                Akses (Lokal/Internet)
              </label>
              <div className="relative akses-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenAksesDropdown(!openAksesDropdown);
                    setOpenUnitDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.akses
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih akses"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiGlobe className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.akses ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.akses || "-- Pilih Akses --"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openAksesDropdown ? 'rotate-180' : ''
                      }`}
                    size={18}
                  />
                </button>
                {openAksesDropdown && (
                  <div
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto akses-dropdown-menu mt-1 w-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("akses", "");
                        setOpenAksesDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${!form.akses
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiGlobe className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>-- Pilih Akses --</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("akses", "Lokal");
                        setOpenAksesDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.akses === "Lokal"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiGlobe className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Lokal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("akses", "Internet");
                        setOpenAksesDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.akses === "Internet"
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                        }`}
                    >
                      <FiGlobe className="text-[#0384d6] flex-shrink-0" size={16} />
                      <span>Internet</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Unit Kerja/SDM Pengelola */}
            <div>
              <label htmlFor="id_unit_pengelola" className="block text-sm font-medium text-slate-700 mb-2">
                Unit Kerja/SDM Pengelola <span className="text-red-500">*</span>
              </label>
              <div className="relative unit-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenUnitDropdown(!openUnitDropdown);
                    setOpenAksesDropdown(false);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${form.id_unit_pengelola
                    ? 'border-[#0384d6] bg-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  aria-label="Pilih unit kerja"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                    <span className={`truncate ${form.id_unit_pengelola ? 'text-gray-900' : 'text-gray-500'}`}>
                      {form.id_unit_pengelola
                        ? (() => {
                          const found = unitList.find((u) => String(u.id_unit) === String(form.id_unit_pengelola));
                          return found ? (found.nama_unit || found.nama || found.id_unit) : "-- Pilih Unit Kerja --";
                        })()
                        : "-- Pilih Unit Kerja --"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openUnitDropdown ? 'rotate-180' : ''
                      }`}
                    size={18}
                  />
                </button>
                {openUnitDropdown && (
                  <div
                    className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto unit-dropdown-menu mt-1 w-full"
                  >
                    {unitList.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Tidak ada data unit kerja
                      </div>
                    ) : (
                      unitList.map((u) => (
                        <button
                          key={u.id_unit}
                          type="button"
                          onClick={() => {
                            handleChange("id_unit_pengelola", u.id_unit.toString());
                            setOpenUnitDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${form.id_unit_pengelola === u.id_unit.toString()
                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                            : 'text-gray-700'
                            }`}
                        >
                          <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                          <span className="truncate">{u.nama_unit || u.nama || u.id_unit}</span>
                        </button>
                      ))
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
                setOpenAksesDropdown(false);
                setOpenUnitDropdown(false);
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

export default function Tabel51({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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

  // Lock body scroll and add modal-open class when modal is open
  useEffect(() => {
    if (showForm) {
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
  }, [showForm]);

  // Fetch data
  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      let url = ENDPOINT;
      if (showDeleted) {
        url += "?include_deleted=1";
      }
      const data = await apiFetch(url);
      const rowsArray = Array.isArray(data) ? data : (data.items || []);
      const sortedRows = sortRowsByLatest(rowsArray);
      setRows(sortedRows);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [showDeleted]);

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
        Swal.fire('Berhasil!', 'Data Sistem Tata Kelola berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Sistem Tata Kelola berhasil ditambahkan.', 'success');
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
      await apiFetch(`${ENDPOINT}/${row.id}/restore`, { method: 'POST' });
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${ENDPOINT}/export`, {
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
      a.download = `Tabel_5_1_Sistem_Tata_Kelola.xlsx`;
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
      return rows.filter(r => r.deleted_at);
    }
    return rows.filter(r => !r.deleted_at);
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
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Sistem Tata Kelola untuk tabel 5.1.
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

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Jenis Tata Kelola</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Nama Sistem Informasi</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Akses (Lokal/Internet)</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Unit Kerja/SDM Pengelola</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={(canUpdate || canDelete) ? 7 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={(canUpdate || canDelete) ? 7 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              currentItems.map((r, i) => {
                const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                const isDeleted = r.deleted_at;

                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.jenis_tata_kelola || "-"}</td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_sistem_informasi || "-"}</td>
                    <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.akses || "-"}</td>
                    <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_unit_pengelola || "-"}</td>
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
              })
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
      />
    </div>
  );
}


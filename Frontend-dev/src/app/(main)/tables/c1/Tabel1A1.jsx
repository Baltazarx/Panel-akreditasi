"use client";

import React, { useEffect, useState, useMemo } from "react";

// ==================================================================================
// [INSTRUKSI]: Uncomment import asli di bawah ini saat dipakai di project Anda.
// Dan HAPUS bagian "MOCKS FOR PREVIEW" di bawahnya.
// ==================================================================================

// --- REAL IMPORTS (UNCOMMENT IN YOUR PROJECT) ---
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiAlertCircle, FiFileText, FiUser } from 'react-icons/fi';

// // --- MOCKS FOR PREVIEW (DELETE THIS BLOCK IN YOUR PROJECT) ---
// import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Edit, Trash2, RotateCw, XCircle, MoreVertical } from 'lucide-react';

// // Mock Icons mapping to match your original code structure
// const FiChevronUp = ChevronUp;
// const FiChevronDown = ChevronDown;
// const FiChevronLeft = ChevronLeft;
// const FiChevronRight = ChevronRight;
// const FiEdit2 = Edit;
// const FiTrash2 = Trash2;
// const FiRotateCw = RotateCw;
// const FiXCircle = XCircle;
// const FiMoreVertical = MoreVertical;

// // Mock Functions
// const apiFetch = async (url, options) => {
//   // Simulasi delay
//   await new Promise(r => setTimeout(r, 500));
  
//   if (options?.method === "DELETE") return {};
//   if (options?.method === "POST" || options?.method === "PUT") return {};

//   // Mock Data Get List
//   return [
//     {
//       id_pimpinan: 1,
//       id_unit: 2,
//       unit_kerja: "Wakil Ketua I",
//       nama_ketua: "Dr. Budi Santoso, M.Kom.",
//       periode_mulai: "2023-01-01",
//       periode_selesai: "2027-12-31",
//       pendidikan_terakhir: "S3",
//       jabatan_struktural: "Wakil Ketua I", 
//       jabatan_fungsional: "Lektor Kepala", // [AUTO-DETECT]
//       tupoksi: "Bertanggung jawab atas bidang akademik...",
//       deleted_at: null
//     },
//     {
//       id_pimpinan: 2,
//       id_unit: 7,
//       unit_kerja: "PMB",
//       nama_ketua: "Citra Lestari, S.Kom., M.T.",
//       periode_mulai: "2024-08-01",
//       periode_selesai: "2028-07-31",
//       pendidikan_terakhir: "S2",
//       jabatan_struktural: "Ketua Program Studi",
//       jabatan_fungsional: "Lektor", // [AUTO-DETECT]
//       tupoksi: "Mengelola kegiatan penerimaan mahasiswa baru...",
//       deleted_at: null
//     }
//   ];
// };

// const getIdField = (row) => 'id_pimpinan'; // Mock helper
// const roleCan = () => true; // Mock permission (allow all)

// const useMaps = () => ({
//   maps: {
//     units: { 2: { id_unit: 2, nama_unit: "Wakil Ketua I" }, 7: { id_unit: 7, nama_unit: "PMB" } },
//     pegawai: { 1: { id_pegawai: 1, nama_lengkap: "Dr. Budi Santoso" }, 2: { id_pegawai: 2, nama_lengkap: "Citra Lestari" } },
//     tahun: {},
//     ref_jabatan_struktural: { 1: { id_jabatan: 1, nama_jabatan: "Ketua" }, 2: { id_jabatan: 2, nama_jabatan: "Wakil Ketua" } }
//   }
// });

// const Swal = {
//   fire: (opts) => {
//     // Simple alert for preview
//     if (opts.title) alert(opts.title + "\n" + (opts.text || ""));
//     return Promise.resolve({ isConfirmed: true });
//   }
// };
// // ==================================================================================

export default function Tabel1A1({ role }) {
  const table = { key: "tabel_1a1", label: "1.A.1 Pimpinan & Tupoksi UPPS/PS", path: "/pimpinan-upps-ps" };
  const COLUMN_COUNT = 7; // Jumlah kolom untuk colSpan

  const { maps: mapsFromHook } = useMaps(true);
  const maps = mapsFromHook ?? { units: {}, pegawai: {}, tahun: {}, ref_jabatan_struktural: {} };

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relational] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Pegawai dropdown state (for form)
  const [openPegawaiDropdown, setOpenPegawaiDropdown] = useState(false);
  const [pegawaiDropdownPosition, setPegawaiDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [openEditPegawaiDropdown, setOpenEditPegawaiDropdown] = useState(false);
  const [editPegawaiDropdownPosition, setEditPegawaiDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal) {
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
  }, [showCreateModal, showEditModal]);

  const getUnitName = (row) =>
    row?.unit_kerja || row?.unit?.nama || row?.unit_nama || row?.nama_unit || maps.units[row?.id_unit]?.nama || maps.units[row?.unit_id]?.nama || maps.units[row?.id_unit]?.nama_unit || maps.units[row?.unit_id]?.nama_unit || row?.unit || "";
  const getKetuaName = (row) =>
    row?.nama_ketua || row?.nama_lengkap || row?.ketua?.nama || row?.ketua?.nama_ketua || maps.pegawai[row?.id_pegawai]?.nama || row?.ketua || "";
  const getPeriode = (row) => {
    if (row?.periode_mulai && row?.periode_selesai) {
      const tahunMulai = row.periode_mulai.substring(0, 4);
      const tahunSelesai = row.periode_selesai.substring(0, 4);
      return `${tahunMulai}/${tahunSelesai}`;
    }
    return row?.periode || "";
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Processed rows with search, filter, and sort
  const processedRows = useMemo(() => {
    let filtered = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);

    // Helper functions inside useMemo to avoid dependency issues
    const getUnitNameLocal = (row) =>
      row?.unit_kerja || row?.unit?.nama || row?.unit_nama || row?.nama_unit || maps.units[row?.id_unit]?.nama || maps.units[row?.unit_id]?.nama || maps.units[row?.id_unit]?.nama_unit || maps.units[row?.unit_id]?.nama_unit || row?.unit || "";
    const getKetuaNameLocal = (row) =>
      row?.nama_ketua || row?.nama_lengkap || row?.ketua?.nama || row?.ketua?.nama_ketua || maps.pegawai[row?.id_pegawai]?.nama || row?.ketua || "";
    const getPeriodeLocal = (row) => {
      if (row?.periode_mulai && row?.periode_selesai) {
        const tahunMulai = row.periode_mulai.substring(0, 4);
        const tahunSelesai = row.periode_selesai.substring(0, 4);
        return `${tahunMulai}/${tahunSelesai}`;
      }
      return row?.periode || "";
    };

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'unit':
            aValue = getUnitNameLocal(a).toLowerCase();
            bValue = getUnitNameLocal(b).toLowerCase();
            break;
          case 'ketua':
            aValue = getKetuaNameLocal(a).toLowerCase();
            bValue = getKetuaNameLocal(b).toLowerCase();
            break;
          case 'periode':
            aValue = getPeriodeLocal(a).toLowerCase();
            bValue = getPeriodeLocal(b).toLowerCase();
            break;
          case 'pendidikan':
            aValue = (a.pendidikan_terakhir || "").toLowerCase();
            bValue = (b.pendidikan_terakhir || "").toLowerCase();
            break;
          case 'jabatan':
            // [UBAH]: Sorting sekarang berdasarkan Jabatan Fungsional (sesuai tampilan)
            aValue = (a.jabatan_fungsional || "").toLowerCase();
            bValue = (b.jabatan_fungsional || "").toLowerCase();
            break;
          case 'tupoksi':
            aValue = (a.tupoksi || "").toLowerCase();
            bValue = (b.tupoksi || "").toLowerCase();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rows, showDeleted, sortConfig, maps]);

  // Pagination
  const totalPages = Math.ceil(processedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = processedRows.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
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

  // Close dropdown when modal opens
  useEffect(() => {
    if (showCreateModal || showEditModal) {
      setOpenDropdownId(null);
      setOpenPegawaiDropdown(false);
      setOpenEditPegawaiDropdown(false);
    }
  }, [showCreateModal, showEditModal]);

  // Close pegawai dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openPegawaiDropdown && !event.target.closest('.pegawai-dropdown-container') && !event.target.closest('.pegawai-dropdown-menu')) {
        setOpenPegawaiDropdown(false);
      }
      if (openEditPegawaiDropdown && !event.target.closest('.edit-pegawai-dropdown-container') && !event.target.closest('.edit-pegawai-dropdown-menu')) {
        setOpenEditPegawaiDropdown(false);
      }
    };

    if (openPegawaiDropdown || openEditPegawaiDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openPegawaiDropdown, openEditPegawaiDropdown]);

  const [newIdPegawai, setNewIdPegawai] = useState("");
  const [newPeriodeMulai, setNewPeriodeMulai] = useState("");
  const [newPeriodeSelesai, setNewPeriodeSelesai] = useState("");
  const [newTupoksi, setNewTupoksi] = useState("");

  const [editIdPegawai, setEditIdPegawai] = useState("");
  const [editPeriodeMulai, setEditPeriodeMulai] = useState("");
  const [editPeriodeSelesai, setEditPeriodeSelesai] = useState("");
  const [editTupoksi, setEditTupoksi] = useState("");

  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");

  const fetchRows = async (isToggle = false) => {
    try {
      // Only show loading skeleton on initial load, not when toggling
      if (!isToggle) {
        setLoading(true);
      }
      setError("");
      const params = new URLSearchParams();
      if (relational) {
        params.append("relasi", "1");
      }
      if (showDeleted) {
        params.append("include_deleted", "1");
      }
      const data = await apiFetch(`${table.path}?${params.toString()}`);
      const rowsArray = Array.isArray(data) ? data : data?.items || [];
      
      // Urutkan berdasarkan data terbaru (yang baru ditambahkan di posisi pertama)
      // Prioritas: created_at terbaru > updated_at terbaru > id terbesar
      const sortedRows = [...rowsArray].sort((a, b) => {
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
        
        // Fallback: urutkan berdasarkan ID terbesar (asumsi auto-increment)
        const idField = getIdField(a) || getIdField(b);
        if (idField) {
          const idA = a[idField] || 0;
          const idB = b[idField] || 0;
          return idB - idA; // ID terbesar di atas
        }
        
        return 0;
      });
      
      setRows(sortedRows);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Initial load
  useEffect(() => { 
    fetchRows(false); 
  }, []);

  // Toggle between active and deleted data
  useEffect(() => { 
    if (!initialLoading) {
      fetchRows(true); 
    }
  }, [showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdPegawai(editing.id_pegawai ?? "");
      setEditPeriodeMulai(editing.periode_mulai?.split('T')[0] ?? "");
      setEditPeriodeSelesai(editing.periode_selesai?.split('T')[0] ?? "");
      setEditTupoksi(editing.tupoksi ?? "");
      setShowEditModal(true);
    }
  }, [editing]);

  const doDelete = (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: "Data akan dipindahkan ke daftar item yang dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}`, { method: "DELETE" });
            fetchRows();
            Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal menghapus data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doHardDelete = (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
            fetchRows();
            Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doRestore = (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const idField = getIdField(row);
            await apiFetch(`${table.path}/${row?.[idField]}/restore`, { method: "POST" });
            fetchRows();
            Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        } catch(e) {
            Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        }
      }
    });
  };

  const renderModalForm = (isEdit = false) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validasi pegawai harus dipilih
      const selectedPegawai = isEdit ? editIdPegawai : newIdPegawai;
      if (!selectedPegawai || selectedPegawai === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Data Belum Lengkap',
          text: 'Silakan pilih Nama Pegawai terlebih dahulu.'
        });
        return;
      }
      
      try {
        setLoading(true);
        const payload = {
            id_pegawai: parseInt(selectedPegawai),
            periode_mulai: isEdit ? editPeriodeMulai : newPeriodeMulai,
            periode_selesai: isEdit ? editPeriodeSelesai : newPeriodeSelesai,
            tupoksi: (isEdit ? editTupoksi : newTupoksi || "").trim(),
        };
        
        if (isEdit) {
            const idField = getIdField(editing);
            await apiFetch(`${table.path}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(payload) });
            setShowEditModal(false); 
            setEditing(null);
            setOpenEditPegawaiDropdown(false);
        } else {
            await apiFetch(table.path, { method: "POST", body: JSON.stringify(payload) });
            setShowCreateModal(false);
            setNewIdPegawai(""); setNewPeriodeMulai(""); setNewPeriodeSelesai(""); setNewTupoksi("");
            setOpenPegawaiDropdown(false);
        }

        fetchRows();
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: isEdit ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
            timer: 1500,
            showConfirmButton: false
        });
      } catch (e) {
        Swal.fire({
            icon: 'error',
            title: `Gagal ${isEdit ? 'memperbarui' : 'menambah'} data`,
            text: e.message
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <label htmlFor="id_pegawai" className="block text-sm font-semibold text-gray-700">Nama Pegawai <span className="text-red-500">*</span></label>
                  <div className={`relative ${isEdit ? 'edit-pegawai-dropdown-container' : 'pegawai-dropdown-container'}`}>
                      <button
                          type="button"
                          onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              if (isEdit) {
                                  setEditPegawaiDropdownPosition({
                                      top: rect.bottom + 4,
                                      left: rect.left,
                                      width: rect.width
                                  });
                                  setOpenEditPegawaiDropdown(!openEditPegawaiDropdown);
                                  setOpenPegawaiDropdown(false);
                              } else {
                                  setPegawaiDropdownPosition({
                                      top: rect.bottom + 4,
                                      left: rect.left,
                                      width: rect.width
                                  });
                                  setOpenPegawaiDropdown(!openPegawaiDropdown);
                                  setOpenEditPegawaiDropdown(false);
                              }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                              (isEdit ? editIdPegawai : newIdPegawai) 
                                  ? 'border-[#0384d6] bg-white' 
                                  : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                          aria-label="Pilih pegawai"
                      >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                              <span className={`truncate ${(isEdit ? editIdPegawai : newIdPegawai) ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {(isEdit ? editIdPegawai : newIdPegawai) 
                                      ? (Object.values(maps.pegawai).find(p => p.id_pegawai === parseInt(isEdit ? editIdPegawai : newIdPegawai))?.nama_lengkap || Object.values(maps.pegawai).find(p => p.id_pegawai === parseInt(isEdit ? editIdPegawai : newIdPegawai))?.nama || "Pilih...")
                                      : "Pilih pegawai..."}
                              </span>
                          </div>
                          <FiChevronDown 
                              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                  (isEdit ? openEditPegawaiDropdown : openPegawaiDropdown) ? 'rotate-180' : ''
                              }`} 
                              size={18} 
                          />
                      </button>
                      {(isEdit ? openEditPegawaiDropdown : openPegawaiDropdown) && (
                          <div 
                              className={`fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto ${isEdit ? 'edit-pegawai-dropdown-menu' : 'pegawai-dropdown-menu'}`}
                              style={{
                                  top: `${(isEdit ? editPegawaiDropdownPosition : pegawaiDropdownPosition).top}px`,
                                  left: `${(isEdit ? editPegawaiDropdownPosition : pegawaiDropdownPosition).left}px`,
                                  width: `${(isEdit ? editPegawaiDropdownPosition : pegawaiDropdownPosition).width || 300}px`,
                                  minWidth: '200px'
                              }}
                          >
                              {Object.values(maps.pegawai).length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                      Tidak ada data pegawai
                                  </div>
                              ) : (
                                  Object.values(maps.pegawai).map((p) => (
                                      <button
                                          key={p.id_pegawai}
                                          type="button"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (isEdit) {
                                                  setEditIdPegawai(p.id_pegawai.toString());
                                                  setOpenEditPegawaiDropdown(false);
                                              } else {
                                                  setNewIdPegawai(p.id_pegawai.toString());
                                                  setOpenPegawaiDropdown(false);
                                              }
                                          }}
                                          onMouseDown={(e) => {
                                              e.preventDefault(); // Prevent blur event from closing dropdown
                                          }}
                                          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                              (isEdit ? editIdPegawai : newIdPegawai) === p.id_pegawai.toString()
                                                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                                  : 'text-gray-700'
                                          }`}
                                      >
                                          <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                                          <span className="truncate">{p.nama_lengkap || p.nama}</span>
                                      </button>
                                  ))
                              )}
                          </div>
                      )}
                  </div>
              </div>
              <div className="space-y-2">
                  <label htmlFor="periode_mulai" className="block text-sm font-semibold text-gray-700">Periode Mulai <span className="text-red-500">*</span></label>
                  <input type="date" id="periode_mulai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editPeriodeMulai : newPeriodeMulai} onChange={(e)=> isEdit ? setEditPeriodeMulai(e.target.value) : setNewPeriodeMulai(e.target.value)} required/>
              </div>
              <div className="space-y-2">
                  <label htmlFor="periode_selesai" className="block text-sm font-semibold text-gray-700">Periode Selesai <span className="text-red-500">*</span></label>
                  <input type="date" id="periode_selesai" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editPeriodeSelesai : newPeriodeSelesai} onChange={(e)=> isEdit ? setEditPeriodeSelesai(e.target.value) : setNewPeriodeSelesai(e.target.value)} required/>
              </div>
              <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <FiAlertCircle className="text-blue-600 flex-shrink-0" size={16} />
                      <p className="text-sm text-blue-700">Unit Kerja mengambil dari tabel pegawai dan Jabatan Fungsional mengambil dari tabel dosen.</p>
                  </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                  <label htmlFor="tupoksi" className="block text-sm font-semibold text-gray-700">Tupoksi <span className="text-red-500">*</span></label>
                  <textarea id="tupoksi" rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={isEdit ? editTupoksi : newTupoksi} onChange={(e)=> isEdit ? setEditTupoksi(e.target.value) : setNewTupoksi(e.target.value)} required/>
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                  className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                  type="button" 
                  onClick={()=> {
                      if (isEdit) {
                          setShowEditModal(false);
                          setOpenEditPegawaiDropdown(false);
                      } else {
                          setShowCreateModal(false);
                          setOpenPegawaiDropdown(false);
                      }
                  }}
              >
                  <span className="relative z-10">Batal</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              </button>
              <button 
                  className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2" 
                  disabled={loading} 
                  type="submit"
              >
                  <span className="relative z-10">{loading ? 'Menyimpan...' : 'Simpan'}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              </button>
          </div>
      </form>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data pimpinan dan tupoksi UPPS/PS.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{processedRows.length}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  
                  // Prepare data untuk export - sesuai dengan struktur tabel di tampilan
                  const exportData = processedRows.map((row, index) => ({
                    'No': index + 1,
                    'Unit Kerja': getUnitName(row),
                    'Nama Ketua': getKetuaName(row),
                    'Periode Jabatan': getPeriode(row),
                    'Pendidikan Terakhir': row.pendidikan_terakhir || '',
                    'Jabatan Fungsional': row.jabatan_fungsional || '',
                    'Tugas Pokok dan Fungsi': row.tupoksi || ''
                  }));
                  
                  if (exportData.length === 0) {
                    throw new Error('Tidak ada data untuk diekspor.');
                  }
                  
                  // Coba import xlsx library
                  let XLSX;
                  try {
                    XLSX = await import('xlsx');
                  } catch (importErr) {
                    console.warn('xlsx library tidak tersedia, menggunakan CSV fallback:', importErr);
                    // Fallback ke CSV
                    const escapeCsv = (str) => {
                      if (str === null || str === undefined) return '';
                      const strValue = String(str);
                      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
                        return `"${strValue.replace(/"/g, '""')}"`;
                      }
                      return strValue;
                    };
                    
                    const headers = ['No', 'Unit Kerja', 'Nama Ketua', 'Periode Jabatan', 'Pendidikan Terakhir', 'Jabatan Fungsional', 'Tugas Pokok dan Fungsi'];
                    const csvRows = [
                      headers.map(escapeCsv).join(','),
                      ...exportData.map(row => [
                        row.No,
                        escapeCsv(row['Unit Kerja']),
                        escapeCsv(row['Nama Ketua']),
                        escapeCsv(row['Periode Jabatan']),
                        escapeCsv(row['Pendidikan Terakhir']),
                        escapeCsv(row['Jabatan Fungsional']),
                        escapeCsv(row['Tugas Pokok dan Fungsi'])
                      ].map(escapeCsv).join(','))
                    ];
                    const csvContent = '\ufeff' + csvRows.join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Tabel_1A1_Pimpinan_${new Date().toISOString().split('T')[0]}.csv`;
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
                    return;
                  }
                  
                  // Buat workbook baru
                  const wb = XLSX.utils.book_new();
                  
                  // Buat worksheet dari data
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  
                  // Set column widths untuk format yang rapi sesuai tampilan tabel
                  // Struktur kolom: No, Unit Kerja, Nama Ketua, Periode Jabatan, Pendidikan Terakhir, Jabatan Fungsional, Tugas Pokok dan Fungsi
                  ws['!cols'] = [
                    { wch: 5 },   // No
                    { wch: 20 },  // Unit Kerja
                    { wch: 30 },  // Nama Ketua
                    { wch: 18 },  // Periode Jabatan
                    { wch: 20 },  // Pendidikan Terakhir
                    { wch: 25 },  // Jabatan Fungsional
                    { wch: 50 }   // Tugas Pokok dan Fungsi (lebih lebar karena teks panjang)
                  ];
                  
                  // Tambahkan worksheet ke workbook
                  XLSX.utils.book_append_sheet(wb, ws, 'Tabel 1A1');
                  
                  // Generate file dan download
                  const fileName = `Tabel_1A1_Pimpinan_${new Date().toISOString().split('T')[0]}.xlsx`;
                  XLSX.writeFile(wb, fileName);

                  Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data berhasil diekspor ke Excel dengan format yang rapi.',
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
              }}
              disabled={loading || processedRows.length === 0}
              className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Export to Excel"
            >
              <FiFileText className="w-4 h-4" />
              Export Excel
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              Cek kelengkapan data
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          {canCreate && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
              aria-label="Tambah data baru"
            >
              + Tambah Data
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <div className="relative transition-opacity duration-200 ease-in-out">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr className="sticky top-0">
              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('unit')}
                aria-label="Sort by Unit Kerja"
              >
                <div className="flex items-center gap-2">
                  Unit Kerja
                  {sortConfig.key === 'unit' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('ketua')}
                aria-label="Sort by Nama Ketua"
              >
                <div className="flex items-center gap-2">
                  Nama Ketua
                  {sortConfig.key === 'ketua' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('periode')}
                aria-label="Sort by Periode Jabatan"
              >
                <div className="flex items-center gap-2">
                  Periode Jabatan
                  {sortConfig.key === 'periode' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('pendidikan')}
                aria-label="Sort by Pendidikan Terakhir"
              >
                <div className="flex items-center gap-2">
                  Pendidikan Terakhir
                  {sortConfig.key === 'pendidikan' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>
              
              {/* [UBAH]: Judul kolom diubah jadi Jabatan Fungsional */}
              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('jabatan')}
                aria-label="Sort by Jabatan Fungsional"
              >
                <div className="flex items-center gap-2">
                  Jabatan Fungsional
                  {sortConfig.key === 'jabatan' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>

              <th 
                className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-left border border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('tupoksi')}
                aria-label="Sort by Tugas Pokok dan Fungsi"
              >
                <div className="flex items-center gap-2">
                  Tugas Pokok dan Fungsi
                  {sortConfig.key === 'tupoksi' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
            {initialLoading && loading ? (
              // Loading Skeleton - only show on initial load
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="bg-white">
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </td>
                </tr>
              ))
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            ) : (
              paginatedRows.map((r, i) => {
                const idField = getIdField(r);
                const rowId = idField ? r[idField] : null;
                const uniqueKey = `${showDeleted ? 'deleted' : 'active'}-${rowId !== null && rowId !== undefined ? rowId : `idx-${i}`}-${i}`;
                return (
                <tr key={uniqueKey} className={`transition-all duration-200 ease-in-out ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{getUnitName(r)}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{getKetuaName(r)}</td>
                  <td className="px-6 py-4 text-slate-600 border border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {getPeriode(r)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.pendidikan_terakhir || ""}</td>
                  
                  {/* [UBAH]: Tampilkan Jabatan Fungsional (Auto-Detect dari Backend) */}
                  <td className="px-6 py-4 border border-slate-200 font-medium text-[#0384d6]">
                      {r.jabatan_fungsional || "-"}
                  </td>

                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    <div className="max-w-md md:max-w-lg lg:max-w-xl">
                      <p className="whitespace-pre-wrap break-words line-clamp-3" title={r.tupoksi || ""}>
                        {r.tupoksi || ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 border border-slate-200">
                    <div className="flex items-center justify-center dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openDropdownId !== uniqueKey) {
                            // Calculate position for fixed dropdown - align right edge
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownWidth = 192; // w-48 = 192px
                            setDropdownPosition({
                              top: rect.bottom + 4,
                              left: Math.max(8, rect.right - dropdownWidth) // Align right, but ensure it doesn't go off-screen
                            });
                            setOpenDropdownId(uniqueKey);
                          } else {
                            setOpenDropdownId(null);
                          }
                        }}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                        aria-label="Menu aksi"
                        aria-expanded={openDropdownId === uniqueKey}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Dropdown Menu - Fixed Position (Outside table to prevent scroll) */}
      {openDropdownId !== null && (
        <div 
          className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          {(() => {
            const currentRow = paginatedRows.find((r, idx) => {
              const idField = getIdField(r);
              const rowId = idField ? r[idField] : null;
              const uniqueKey = `${showDeleted ? 'deleted' : 'active'}-${rowId !== null && rowId !== undefined ? rowId : `idx-${idx}`}-${idx}`;
              return uniqueKey === openDropdownId;
            });
            if (!currentRow) return null;
            
            return (
              <>
                {!showDeleted && canUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(currentRow);
                      setOpenDropdownId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                    aria-label={`Edit data ${getUnitName(currentRow)}`}
                  >
                    <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                    <span>Edit</span>
                  </button>
                )}
                {!showDeleted && canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      doDelete(currentRow);
                      setOpenDropdownId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                    aria-label={`Hapus data ${getUnitName(currentRow)}`}
                  >
                    <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                    <span>Hapus</span>
                  </button>
                )}
                {showDeleted && canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      doHardDelete(currentRow);
                      setOpenDropdownId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                    aria-label={`Hapus permanen data ${getUnitName(currentRow)}`}
                  >
                    <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                    <span>Hapus Permanen</span>
                  </button>
                )}
                {showDeleted && canUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      doRestore(currentRow);
                      setOpenDropdownId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                    aria-label={`Pulihkan data ${getUnitName(currentRow)}`}
                  >
                    <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                    <span>Pulihkan</span>
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Pagination */}
      {!loading && processedRows.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Baris per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              aria-label="Pilih jumlah baris per halaman"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages} ({processedRows.length} data)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                aria-label="Halaman sebelumnya"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                aria-label="Halaman berikutnya"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Pimpinan & Tupoksi UPPS/PS</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data pimpinan dan periode jabatan.</p>
            </div>
            <div className="p-8">
              {renderModalForm(false)}
            </div>
          </div>
        </div>
      )}

       {showEditModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Edit Data Pimpinan & Tupoksi UPPS/PS</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data pimpinan dan periode jabatan.</p>
            </div>
            <div className="p-8">
              {renderModalForm(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
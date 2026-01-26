"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiBook, FiBriefcase, FiAward, FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function TabelPegawai({ role }) {
  const table = { key: "pegawai", label: "Manajemen Data Pegawai", path: "/pegawai" };

  // State management
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { maps, refreshMaps } = useMaps(true);
  const [formState, setFormState] = useState({});

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Form dropdown states
  const [openFormPendidikanDropdown, setOpenFormPendidikanDropdown] = useState(false);
  const [openFormUnitDropdown, setOpenFormUnitDropdown] = useState(false);
  const [openFormJabatanDropdown, setOpenFormJabatanDropdown] = useState(false);

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
    if (showModal) {
      setOpenDropdownId(null);
    } else {
      // Close form dropdowns when modal closes
      setOpenFormPendidikanDropdown(false);
      setOpenFormUnitDropdown(false);
      setOpenFormJabatanDropdown(false);
    }
  }, [showModal]);

  // Close form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFormPendidikanDropdown && !event.target.closest('.form-pendidikan-dropdown-container') && !event.target.closest('.form-pendidikan-dropdown-menu')) {
        setOpenFormPendidikanDropdown(false);
      }
      if (openFormUnitDropdown && !event.target.closest('.form-unit-dropdown-container') && !event.target.closest('.form-unit-dropdown-menu')) {
        setOpenFormUnitDropdown(false);
      }
      if (openFormJabatanDropdown && !event.target.closest('.form-jabatan-dropdown-container') && !event.target.closest('.form-jabatan-dropdown-menu')) {
        setOpenFormJabatanDropdown(false);
      }
    };

    if (openFormPendidikanDropdown || openFormUnitDropdown || openFormJabatanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openFormPendidikanDropdown, openFormUnitDropdown, openFormJabatanDropdown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  // Cek hak akses
  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");
  const canRestore = roleCan(role, table.key, "H");

  // Debug permissions
  console.log('TabelPegawai permissions:', {
    role,
    roleType: typeof role,
    tableKey: table.key,
    canCreate,
    canUpdate,
    canDelete,
    canRestore,
    showModal,
    editing
  });


  // Fungsi fetchRows
  const fetchRows = async (isToggle = false) => {
    // Only show loading skeleton on initial load, not when toggling
    if (!isToggle) {
      setLoading(true);
    }
    try {
      const url = showDeleted
        ? `${table.path}?include_deleted=1&include=units`
        : `${table.path}?include=units`;
      const result = await apiFetch(url);
      const rowsArray = Array.isArray(result) ? result : [];

      // Urutkan berdasarkan nama_lengkap secara alfabetis (case-insensitive)
      // Menggunakan localeCompare dengan locale 'id' untuk sorting bahasa Indonesia
      const sortedRows = [...rowsArray].sort((a, b) => {
        const namaA = (a.nama_lengkap || '').trim().toLowerCase();
        const namaB = (b.nama_lengkap || '').trim().toLowerCase();

        // Jika nama sama, urutkan berdasarkan id_pegawai sebagai secondary sort
        if (namaA === namaB) {
          const idA = a.id_pegawai || 0;
          const idB = b.id_pegawai || 0;
          return idA - idB;
        }

        return namaA.localeCompare(namaB, 'id', {
          sensitivity: 'base',
          numeric: true
        });
      });

      setRows(sortedRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // useEffects
  // Initial load
  useEffect(() => { fetchRows(false); }, []);
  // Toggle between active and deleted data
  useEffect(() => {
    if (!initialLoading) {
      fetchRows(true);
    }
  }, [showDeleted]);
  useEffect(() => {
    if (editing) {
      // [NEW] Convert units array ke array of id_unit strings
      const unitIds = editing.units && editing.units.length > 0
        ? editing.units.map(u => String(u.id_unit))
        : (editing.id_unit ? [String(editing.id_unit)] : []);

      setFormState({
        nama_lengkap: editing.nama_lengkap || "",
        pendidikan_terakhir: editing.pendidikan_terakhir || "",
        unit_kerja: unitIds,
        id_jabatan: editing.id_jabatan || "",
        nikp: editing.nikp || "",
      });
    } else {
      setFormState({
        nama_lengkap: "",
        pendidikan_terakhir: "",
        unit_kerja: [],
        id_jabatan: "",
        nikp: "",
      });
    }
  }, [editing]);

  const handleAddNew = () => {
    setEditing(null);
    setFormState({
      nama_lengkap: "",
      pendidikan_terakhir: "",
      unit_kerja: [],
      id_jabatan: "",
      nikp: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenFormPendidikanDropdown(false);
    setOpenFormUnitDropdown(false);
    setOpenFormJabatanDropdown(false);
    setLoading(true);
    try {
      const idField = getIdField(editing);
      const url = editing ? `${table.path}/${editing[idField]}` : table.path;
      const method = editing ? "PUT" : "POST";

      // [NEW] Prepare payload dengan multi-unit support
      const primaryUnit = formState.unit_kerja && formState.unit_kerja.length > 0
        ? formState.unit_kerja[0]
        : null;

      const payload = {
        nama_lengkap: formState.nama_lengkap || "",
        pendidikan_terakhir: formState.pendidikan_terakhir || "",
        id_unit: primaryUnit ? parseInt(primaryUnit) : null, // Unit utama untuk backward compatibility
        units: formState.unit_kerja ? formState.unit_kerja.map(unitId => parseInt(unitId)) : [],
        id_jabatan: formState.id_jabatan ? parseInt(formState.id_jabatan) : null,
        nikp: formState.nikp || null,
      };

      // Validasi: Cek apakah unit kerja adalah "Ketua STIKOM" dan jabatan adalah "Ketua"
      if (payload.id_unit && payload.id_jabatan) {
        const selectedUnit = maps.units?.[payload.id_unit];
        const selectedJabatan = maps.ref_jabatan_struktural?.[payload.id_jabatan];

        // Cek apakah unit kerja mengandung "Ketua" (case-insensitive)
        const isUnitKetua = selectedUnit?.nama_unit?.toLowerCase().includes('ketua') ||
          selectedUnit?.kode_role?.toLowerCase() === 'ketua' ||
          payload.id_unit === 1; // id_unit = 1 adalah "Ketua STIKOM"

        // Cek apakah jabatan adalah "Ketua"
        const isJabatanKetua = selectedJabatan?.nama_jabatan?.toLowerCase() === 'ketua' ||
          payload.id_jabatan === 1; // id_jabatan = 1 adalah "Ketua"

        // Jika kedua kondisi terpenuhi, validasi duplikasi
        if (isUnitKetua && isJabatanKetua) {
          // Cek apakah sudah ada data dengan kombinasi id_unit dan id_jabatan yang sama (aktif, tidak deleted)
          const existingKetua = rows.find(row => {
            // Skip data yang sedang diedit
            if (editing && row[idField] === editing[idField]) {
              return false;
            }
            // Cek apakah data aktif (tidak deleted)
            if (row.deleted_at) {
              return false;
            }
            // Cek kombinasi id_unit dan id_jabatan
            return row.id_unit === payload.id_unit && row.id_jabatan === payload.id_jabatan;
          });

          if (existingKetua) {
            setLoading(false);
            Swal.fire({
              icon: 'error',
              title: 'Data Ganda Tidak Diizinkan',
              text: 'Sudah ada data Ketua untuk unit kerja ini. Hanya boleh ada satu Ketua per unit kerja.',
              confirmButtonColor: '#3085d6'
            });
            return;
          }
        }
      }

      console.log('Edit pegawai data:', {
        url,
        method,
        idField,
        editingId: editing ? editing[idField] : null,
        payload
      });

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('Response from API:', response);

      setShowModal(false);
      setEditing(null);
      fetchRows();
      if (refreshMaps) refreshMaps();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Edit pegawai error:', err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async (row) => {
    const idField = getIdField(row);
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Data ${row.nama_lengkap} akan dipindahkan ke daftar terhapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${table.path}/${row[idField]}`, { method: "DELETE" });
        await Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        fetchRows();
        if (refreshMaps) refreshMaps();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  const doRestore = async (row) => {
    const idField = getIdField(row);
    const result = await Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data ${row.nama_lengkap} akan dikembalikan ke daftar aktif.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${table.path}/${row[idField]}/restore`, { method: "POST" });
        await Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        fetchRows();
        if (refreshMaps) refreshMaps();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  const doHardDelete = async (row) => {
    const idField = getIdField(row);
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
        await apiFetch(`${table.path}/${row[idField]}/hard-delete`, { method: "DELETE" });
        await Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
        fetchRows();
        if (refreshMaps) refreshMaps();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus permanen data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  // Filter rows for pagination
  const filteredRows = rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [showDeleted]);

  // Render component
  if (loading && !rows.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data pegawai program studi.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.length}</span>
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
        {canCreate && (
          <button onClick={handleAddNew} className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            + Tambah Data
          </button>
        )}
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit Kerja</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jabatan Struktural</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendidikan Terakhir</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">NIKP</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
              {currentItems.map((row, index) => (
                <tr key={`${showDeleted ? 'deleted' : 'active'}-pegawai-${row.id_pegawai || index}`} className={`transition-all duration-200 ease-in-out ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-6 py-4 font-semibold text-slate-800 text-center border border-slate-200">{(currentPage - 1) * itemsPerPage + index + 1}.</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nama_lengkap || '-'}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    {row.units && row.units.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {row.units.map((unit, idx) => (
                          <span
                            key={`${row.id_pegawai}-unit-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eaf4ff] border border-[#0384d6]/30 text-[#043975] rounded-md text-xs font-medium"
                          >
                            <FiBriefcase size={12} />
                            {unit.nama_unit}
                            {unit.is_primary === 1 && <span className="text-yellow-600" title="Unit Utama">★</span>}
                          </span>
                        ))}
                      </div>
                    ) : row.nama_unit ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eaf4ff] border border-[#0384d6]/30 text-[#043975] rounded-md text-xs font-medium">
                        <FiBriefcase size={12} />
                        {row.nama_unit}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jabatan_struktural || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 border border-slate-200">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {row.pendidikan_terakhir || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nikp || '-'}</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(row) ? row[getIdField(row)] : index;
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
                          aria-expanded={openDropdownId === (getIdField(row) ? row[getIdField(row)] : index)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        const filteredRows = rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at);
        const currentRow = filteredRows.find((row, idx) => {
          const rowId = getIdField(row) ? row[getIdField(row)] : idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        return (
          <div
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(currentRow);
                  setShowModal(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.nama_lengkap || 'pegawai'}`}
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
                aria-label={`Hapus data ${currentRow.nama_lengkap || 'pegawai'}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
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
                aria-label={`Pulihkan data ${currentRow.nama_lengkap || 'pegawai'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
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
                aria-label={`Hapus permanen data ${currentRow.nama_lengkap || 'pegawai'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenFormPendidikanDropdown(false);
              setOpenFormUnitDropdown(false);
              setOpenFormJabatanDropdown(false);
              setShowModal(false);
              setEditing(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">{editing ? 'Edit Data Pegawai' : 'Tambah Data Pegawai'}</h2>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data pegawai dengan lengkap.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formState.nama_lengkap || ""}
                      onChange={(e) => setFormState({ ...formState, nama_lengkap: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pendidikan Terakhir</label>
                    <div className="relative form-pendidikan-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormPendidikanDropdown(!openFormPendidikanDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.pendidikan_terakhir
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih pendidikan terakhir"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiBook className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.pendidikan_terakhir ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.pendidikan_terakhir || '-- Pilih Pendidikan Terakhir --'}
                          </span>
                        </div>
                        <FiChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormPendidikanDropdown ? 'rotate-180' : ''
                            }`}
                          size={18}
                        />
                      </button>
                      {openFormPendidikanDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-pendidikan-dropdown-menu mt-1 w-full"
                        >
                          {['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2', 'S3'].map(pendidikan => (
                            <button
                              key={pendidikan}
                              type="button"
                              onClick={() => {
                                setFormState({ ...formState, pendidikan_terakhir: pendidikan });
                                setOpenFormPendidikanDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.pendidikan_terakhir === pendidikan
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiBook className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span>{pendidikan}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">NIKP</label>
                    <input
                      type="text"
                      value={formState.nikp || ""}
                      onChange={(e) => setFormState({ ...formState, nikp: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan NIKP (opsional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Unit Kerja (Multi-Select)
                      <span className="text-xs text-gray-500 ml-2">Pilih satu atau lebih unit kerja</span>
                    </label>

                    {/* Display selected units */}
                    {formState.unit_kerja && formState.unit_kerja.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formState.unit_kerja.map((unitId, index) => {
                          const unit = Object.values(maps.units || {}).find(u => String(u.id_unit) === String(unitId));
                          return (
                            <div
                              key={`${unitId}-${index}`}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eaf4ff] border border-[#0384d6] text-[#043975] rounded-lg text-sm font-medium"
                            >
                              <FiBriefcase size={14} />
                              <span>{unit ? (unit.nama_unit || unit.nama) : unitId}</span>
                              {index === 0 && <span className="text-yellow-600 text-xs" title="Unit Utama">★ Utama</span>}
                              <button
                                type="button"
                                onClick={() => {
                                  const newUnits = formState.unit_kerja.filter((_, i) => i !== index);
                                  setFormState({ ...formState, unit_kerja: newUnits });
                                }}
                                className="p-0.5 rounded-full hover:bg-red-100 transition-colors"
                                aria-label="Hapus unit kerja"
                              >
                                <FiX size={14} className="text-red-600" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Dropdown to add new unit */}
                    <div className="relative form-unit-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormUnitDropdown(!openFormUnitDropdown);
                        }}
                        className="w-full px-4 py-3 border border-dashed border-gray-400 rounded-lg text-black shadow-sm hover:border-[#0384d6] hover:bg-[#f8fbff] focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-center gap-2 transition-all duration-200"
                        aria-label="Tambah unit kerja"
                      >
                        <FiPlus className="text-[#0384d6]" size={18} />
                        <span className="text-gray-700 font-medium">Tambah Unit Kerja</span>
                      </button>
                      {openFormUnitDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-unit-dropdown-menu mt-1 w-full"
                        >
                          {Object.values(maps.units || {}).length > 0 ? (
                            Object.values(maps.units || {}).map(u => {
                              const isSelected = formState.unit_kerja && formState.unit_kerja.some(unitId => String(unitId) === String(u.id_unit));
                              return (
                                <button
                                  key={u.id_unit}
                                  type="button"
                                  onClick={() => {
                                    if (!isSelected) {
                                      const newUnits = [...(formState.unit_kerja || []), String(u.id_unit)];
                                      setFormState({ ...formState, unit_kerja: newUnits });
                                    }
                                    setOpenFormUnitDropdown(false);
                                  }}
                                  disabled={isSelected}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${isSelected
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'hover:bg-[#eaf4ff] text-gray-700'
                                    }`}
                                >
                                  <FiBriefcase className={isSelected ? 'text-gray-400' : 'text-[#0384d6]'} size={16} />
                                  <span className="truncate">{u.nama_unit || u.nama}</span>
                                  {isSelected && <span className="ml-auto text-xs text-gray-500">(Sudah dipilih)</span>}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data unit kerja
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jabatan Struktural</label>
                    <div className="relative form-jabatan-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormJabatanDropdown(!openFormJabatanDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.id_jabatan
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih jabatan struktural"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiAward className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_jabatan ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_jabatan
                              ? (() => {
                                const found = Object.values(maps.ref_jabatan_struktural || {}).find(j => String(j.id_jabatan) === String(formState.id_jabatan));
                                return found ? found.nama_jabatan : formState.id_jabatan;
                              })()
                              : '-- Pilih Jabatan Struktural --'}
                          </span>
                        </div>
                        <FiChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormJabatanDropdown ? 'rotate-180' : ''
                            }`}
                          size={18}
                        />
                      </button>
                      {openFormJabatanDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-jabatan-dropdown-menu mt-1 w-full"
                        >
                          {Object.values(maps.ref_jabatan_struktural || {}).length > 0 ? (
                            Object.values(maps.ref_jabatan_struktural || {}).map(j => (
                              <button
                                key={j.id_jabatan}
                                type="button"
                                onClick={() => {
                                  setFormState({ ...formState, id_jabatan: String(j.id_jabatan) });
                                  setOpenFormJabatanDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.id_jabatan === String(j.id_jabatan)
                                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                  : 'text-gray-700'
                                  }`}
                              >
                                <FiAward className="text-[#0384d6] flex-shrink-0" size={16} />
                                <span className="truncate">{j.nama_jabatan}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data jabatan struktural
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFormPendidikanDropdown(false);
                      setOpenFormUnitDropdown(false);
                      setOpenFormJabatanDropdown(false);
                      setShowModal(false);
                      setEditing(null);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
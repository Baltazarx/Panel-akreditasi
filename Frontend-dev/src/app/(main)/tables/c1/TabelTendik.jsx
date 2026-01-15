"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiUser, FiBriefcase } from 'react-icons/fi';

export default function TabelTendik({ role }) {
  const table = { key: "tenaga_kependidikan", label: "Manajemen Data Tenaga Kependidikan", path: "/tendik" };

  // State management
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const { maps, refreshMaps } = useMaps(true);
  const [formState, setFormState] = useState({});

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Form dropdown state
  const [openFormPegawaiDropdown, setOpenFormPegawaiDropdown] = useState(false);

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
      setOpenFormPegawaiDropdown(false);
    }
  }, [showModal]);

  // Close form dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFormPegawaiDropdown && !event.target.closest('.form-pegawai-dropdown-container') && !event.target.closest('.form-pegawai-dropdown-menu')) {
        setOpenFormPegawaiDropdown(false);
      }
    };

    if (openFormPegawaiDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openFormPegawaiDropdown]);

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
  console.log('TabelTendik permissions:', {
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
      setError("");
      const url = showDeleted ? `${table.path}?include_deleted=1&include=units` : `${table.path}?include=units`;
      const result = await apiFetch(url);
      const rowsArray = Array.isArray(result) ? result : [];

      // Urutkan berdasarkan nama_lengkap secara alfabetis (case-insensitive)
      // Menggunakan localeCompare dengan locale 'id' untuk sorting bahasa Indonesia
      const sortedRows = [...rowsArray].sort((a, b) => {
        const namaA = (a.nama_lengkap || '').trim().toLowerCase();
        const namaB = (b.nama_lengkap || '').trim().toLowerCase();

        // Jika nama sama, urutkan berdasarkan id_tendik sebagai secondary sort
        if (namaA === namaB) {
          const idFieldA = getIdField(a);
          const idFieldB = getIdField(b);
          const idA = idFieldA && a[idFieldA] !== undefined && a[idFieldA] !== null ? a[idFieldA] : 0;
          const idB = idFieldB && b[idFieldB] !== undefined && b[idFieldB] !== null ? b[idFieldB] : 0;
          return idA - idB;
        }

        return namaA.localeCompare(namaB, 'id', {
          sensitivity: 'base',
          numeric: true
        });
      });

      setRows(sortedRows);
    } catch (err) {
      console.error('Error fetching tendik data:', err);
      let errorMessage = err.message || 'Gagal memuat data';

      // Handle specific error messages
      if (err.status === 404) {
        errorMessage = 'Endpoint tidak ditemukan. Pastikan backend berjalan dan route sudah terdaftar.';
      } else if (err.status === 403) {
        errorMessage = 'Anda tidak memiliki akses untuk melihat data ini.';
      } else if (err.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      }

      setError(errorMessage);
      setRows([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // useEffects
  // Initial load
  useEffect(() => {
    fetchRows(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle between active and deleted data
  useEffect(() => {
    if (!initialLoading) {
      fetchRows(true);
    }
  }, [showDeleted]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (editing) {
      setFormState({
        id_pegawai: editing.id_pegawai || "",
        jenis_tendik: editing.jenis_tendik || "",
      });
    } else {
      setFormState({
        id_pegawai: "",
        jenis_tendik: "",
      });
    }
  }, [editing]);

  const handleAddNew = () => {
    setEditing(null);
    setFormState({
      id_pegawai: "",
      jenis_tendik: "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenFormPegawaiDropdown(false);
    setLoading(true);
    try {
      const idField = getIdField(editing);
      const url = editing ? `${table.path}/${editing[idField]}` : table.path;
      const method = editing ? "PUT" : "POST";

      // Prepare payload
      const payload = {
        jenis_tendik: formState.jenis_tendik || "",
      };

      // Untuk create: ambil dari formState, untuk update: ambil dari editing (karena field disabled)
      if (editing) {
        payload.id_pegawai = editing.id_pegawai;
      } else {
        payload.id_pegawai = formState.id_pegawai ? parseInt(formState.id_pegawai) : null;
      }

      // Validasi
      if (!payload.id_pegawai || !payload.jenis_tendik) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi Gagal',
          text: 'Pegawai dan Jenis Tendik wajib diisi.'
        });
        setLoading(false);
        return;
      }

      console.log('Submit tendik data:', {
        url,
        method,
        idField,
        editingId: editing ? editing[idField] : null,
        payload
      });

      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
      console.error('Submit tendik error:', err);
      let errorMessage = err.message || 'Terjadi kesalahan saat menyimpan data';

      // Handle specific error messages from backend
      if (err.response) {
        const responseError = typeof err.response === 'string' ? JSON.parse(err.response) : err.response;
        if (responseError?.error) {
          errorMessage = responseError.error;
        }
      }

      // Handle HTTP status codes
      if (err.status === 409) {
        errorMessage = errorMessage || 'Data duplikat atau pegawai sudah terdaftar sebagai tenaga kependidikan';
      } else if (err.status === 400) {
        errorMessage = errorMessage || 'Data yang dikirim tidak valid';
      }

      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: errorMessage
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async (row) => {
    const idField = getIdField(row);
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Data ${row.nama_lengkap || 'tenaga kependidikan'} akan dipindahkan ke daftar terhapus.`,
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
      text: `Data ${row.nama_lengkap || 'tenaga kependidikan'} akan dikembalikan ke daftar aktif.`,
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

  // Render component
  // Show loading only on initial load
  if (initialLoading && loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  // Error boundary - jika ada error kritis, tampilkan pesan error
  if (error && !rows.length && !loading) {
    return (
      <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => {
              setError("");
              fetchRows(false);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data tenaga kependidikan program studi.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">
                {rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at).length}
              </span>
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendidikan Terakhir</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jenis Tendik</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
              {rows
                .filter(row => showDeleted ? row.deleted_at : !row.deleted_at)
                .map((row, index) => {
                  const idField = getIdField(row);
                  const rowId = row[idField];
                  return (
                    <tr key={`${showDeleted ? 'deleted' : 'active'}-tendik-${rowId || index}`} className={`transition-all duration-200 ease-in-out ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                      <td className="px-6 py-4 font-semibold text-slate-800 text-center border border-slate-200">{index + 1}.</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nama_lengkap || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">
                        {row.units && row.units.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 justify-start">
                            {row.units.map((unit, idx) => (
                              <span
                                key={`${row.id_tendik}-unit-${idx}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eaf4ff] border border-[#0384d6]/30 text-[#043975] rounded-md text-xs font-medium"
                              >
                                <FiBriefcase size={12} />
                                {unit.nama_unit}
                                {unit.is_primary === 1 && <span className="text-yellow-600 ml-0.5" title="Unit Utama">★</span>}
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
                      <td className="px-6 py-4 text-slate-600 border border-slate-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {row.pendidikan_terakhir || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jenis_tendik || '-'}</td>
                      <td className="px-6 py-4 text-center border border-slate-200">
                        <div className="flex items-center justify-center gap-2">
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
                        </div>
                      </td>
                    </tr>
                  )
                })}
              {rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">
                      {showDeleted
                        ? 'Belum ada data yang dihapus.'
                        : 'Belum ada data yang ditambahkan atau data yang cocok dengan filter.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = rows.find((row) => {
          const idField = getIdField(row);
          return row[idField] === openDropdownId;
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
                aria-label={`Edit data ${currentRow.nama_lengkap || 'tenaga kependidikan'}`}
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
                aria-label={`Hapus data ${currentRow.nama_lengkap || 'tenaga kependidikan'}`}
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
                aria-label={`Hapus permanen data ${currentRow.nama_lengkap || 'tenaga kependidikan'}`}
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
                aria-label={`Pulihkan data ${currentRow.nama_lengkap || 'tenaga kependidikan'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenFormPegawaiDropdown(false);
              setShowModal(false);
              setEditing(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">{editing ? 'Edit Data Tenaga Kependidikan' : 'Tambah Data Tenaga Kependidikan'}</h2>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data tenaga kependidikan dengan lengkap.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pegawai <span className="text-red-500">*</span></label>
                    <div className="relative form-pegawai-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!editing) {
                            setOpenFormPegawaiDropdown(!openFormPegawaiDropdown);
                          }
                        }}
                        disabled={editing !== null}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.id_pegawai
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          } ${editing !== null ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                        aria-label="Pilih pegawai"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_pegawai ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_pegawai
                              ? (() => {
                                const selectedPegawai = maps && maps.pegawai ? Object.values(maps.pegawai).find(p => String(p.id_pegawai) === String(formState.id_pegawai)) : null;
                                if (selectedPegawai) {
                                  const unitName = selectedPegawai.id_unit && maps.units ? `(${maps.units[selectedPegawai.id_unit]?.nama_unit || maps.units[selectedPegawai.id_unit]?.nama || ''})` : '';
                                  return `${selectedPegawai.nama_lengkap || selectedPegawai.nama} ${unitName}`;
                                }
                                return formState.id_pegawai;
                              })()
                              : '-- Pilih Pegawai --'}
                          </span>
                        </div>
                        <FiChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormPegawaiDropdown ? 'rotate-180' : ''
                            }`}
                          size={18}
                        />
                      </button>
                      {openFormPegawaiDropdown && !editing && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-pegawai-dropdown-menu mt-1 w-full"
                        >
                          {maps && maps.pegawai && Object.values(maps.pegawai).length > 0 ? (
                            Object.values(maps.pegawai)
                              .filter(p => !p.deleted_at)
                              .filter(p => {
                                // Sembunyi jika sudah jadi DOSEN (NIDN)
                                if (p.is_dosen) return false;
                                // Sembunyi jika sudah jadi TENDIK (kecuali yang sedang diedit - tapi di Tendik pegawai di-lock saat edit)
                                if (p.is_tendik) return false;
                                return true;
                              })
                              .map(p => {
                                const unitName = p.id_unit && maps.units ? `(${maps.units[p.id_unit]?.nama_unit || maps.units[p.id_unit]?.nama || ''})` : '';
                                const displayName = `${p.nama_lengkap || p.nama} ${unitName}`;
                                return (
                                  <button
                                    key={p.id_pegawai}
                                    type="button"
                                    onClick={() => {
                                      setFormState({ ...formState, id_pegawai: String(p.id_pegawai) });
                                      setOpenFormPegawaiDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.id_pegawai === String(p.id_pegawai)
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                      }`}
                                  >
                                    <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                                    <span className="truncate">{displayName}</span>
                                  </button>
                                );
                              })
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data pegawai
                            </div>
                          )}
                        </div>
                      )}
                      {editing && (
                        <p className="mt-1 text-xs text-gray-500">Pegawai tidak dapat diubah saat edit</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jenis Tendik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formState.jenis_tendik || ""}
                      onChange={(e) => setFormState({ ...formState, jenis_tendik: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan jenis tendik (contoh: Administrasi, Teknisi, dll)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFormPegawaiDropdown(false);
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


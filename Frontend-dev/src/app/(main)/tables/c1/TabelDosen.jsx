"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiHome, FiBook, FiAward, FiUser } from 'react-icons/fi';

export default function TabelDosen({ role, search }) {
  const table = { key: "dosen", label: "Manajemen Data Dosen", path: "/dosen" };

  // State management
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const { maps } = useMaps(true);
  const [formState, setFormState] = useState({});

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [ptCustom, setPtCustom] = useState("");
  const [showPtInput, setShowPtInput] = useState(false);

  // Form dropdown states
  const [openFormPegawaiDropdown, setOpenFormPegawaiDropdown] = useState(false);
  const [openFormHomebaseDropdown, setOpenFormHomebaseDropdown] = useState(false);
  const [openFormPtDropdown, setOpenFormPtDropdown] = useState(false);
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
      setOpenFormPegawaiDropdown(false);
      setOpenFormHomebaseDropdown(false);
      setOpenFormPtDropdown(false);
      setOpenFormJabatanDropdown(false);
    }
  }, [showModal]);

  // Close form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFormPegawaiDropdown && !event.target.closest('.form-pegawai-dropdown-container') && !event.target.closest('.form-pegawai-dropdown-menu')) {
        setOpenFormPegawaiDropdown(false);
      }
      if (openFormHomebaseDropdown && !event.target.closest('.form-homebase-dropdown-container') && !event.target.closest('.form-homebase-dropdown-menu')) {
        setOpenFormHomebaseDropdown(false);
      }
      if (openFormPtDropdown && !event.target.closest('.form-pt-dropdown-container') && !event.target.closest('.form-pt-dropdown-menu')) {
        setOpenFormPtDropdown(false);
      }
      if (openFormJabatanDropdown && !event.target.closest('.form-jabatan-dropdown-container') && !event.target.closest('.form-jabatan-dropdown-menu')) {
        setOpenFormJabatanDropdown(false);
      }
    };

    if (openFormPegawaiDropdown || openFormHomebaseDropdown || openFormPtDropdown || openFormJabatanDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openFormPegawaiDropdown, openFormHomebaseDropdown, openFormPtDropdown, openFormJabatanDropdown]);

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
  console.log('TabelDosen permissions:', {
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
      setError(""); // Clear previous errors
      const url = showDeleted ? `${table.path}?include_deleted=1` : table.path;
      console.log('Fetching dosen data from:', url);
      const result = await apiFetch(url);
      console.log('Received dosen data:', result);

      // Pastikan tidak ada duplikasi data berdasarkan id_dosen
      const uniqueRows = Array.isArray(result) ? result.filter((row, index, self) => {
        const idField = getIdField(row);
        const idValue = idField && row[idField] !== undefined && row[idField] !== null ? row[idField] : null;
        if (idValue === null) return true; // Keep rows without ID
        // Keep only first occurrence of each ID
        return index === self.findIndex(r => {
          const rIdField = getIdField(r);
          return rIdField && r[rIdField] === idValue;
        });
      }) : [];

      // Urutkan berdasarkan nama_lengkap secara alfabetis (case-insensitive)
      // Menggunakan localeCompare dengan locale 'id' untuk sorting bahasa Indonesia
      const sortedRows = [...uniqueRows].sort((a, b) => {
        const namaA = (a.nama_lengkap || '').trim().toLowerCase();
        const namaB = (b.nama_lengkap || '').trim().toLowerCase();

        // Jika nama sama, urutkan berdasarkan id_dosen sebagai secondary sort
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

      console.log('Processed unique rows:', sortedRows.length);
      setRows(sortedRows);
    } catch (err) {
      // Serialize error untuk logging yang lebih baik
      const errorDetails = {
        message: err.message,
        status: err.status,
        isNetworkError: err.isNetworkError,
        response: err.response,
        responseText: err.responseText,
        stack: err.stack
      };
      console.error('Error fetching dosen data:', errorDetails);
      console.error('Full error object:', err);

      // Show user-friendly error message
      let errorMessage = 'Gagal memuat data dosen.';
      if (err.isNetworkError) {
        errorMessage = err.message || 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
      } else if (err.status === 401) {
        errorMessage = 'Session expired. Silakan login kembali.';
      } else if (err.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk mengakses data ini.';
      } else if (err.status === 404) {
        errorMessage = 'Endpoint tidak ditemukan.';
      } else if (err.status >= 500) {
        errorMessage = `Server error: ${err.message || 'Terjadi kesalahan di server.'}`;
      } else {
        errorMessage = err.message || 'Gagal memuat data dosen. Silakan coba lagi.';
      }

      setError(errorMessage);

      // Show alert for critical errors
      if (err.isNetworkError || err.status >= 500) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          footer: 'Periksa console untuk detail lebih lanjut'
        });
      }
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
      setFormState({
        id_pegawai: editing.id_pegawai ? String(editing.id_pegawai) : "",
        nidn: editing.nidn || "",
        nuptk: editing.nuptk || "",
        homebase: editing.homebase || "",
        pt: editing.pt || "",
        id_jafung: editing.id_jafung ? String(editing.id_jafung) : "",
        beban_sks: editing.beban_sks || "",
      });
      // Set ptCustom untuk input text jika PT bukan STIKOM PGRI Banyuwangi
      if (editing.pt && editing.pt !== "STIKOM PGRI Banyuwangi") {
        setPtCustom(editing.pt);
        setShowPtInput(true);
      } else {
        setPtCustom("");
        setShowPtInput(false);
      }
    } else {
      setFormState({
        id_pegawai: "",
        nidn: "",
        nuptk: "",
        homebase: "",
        pt: "",
        id_jafung: "",
        beban_sks: "",
      });
      setPtCustom("");
      setShowPtInput(false);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenFormPegawaiDropdown(false);
    setOpenFormHomebaseDropdown(false);
    setOpenFormPtDropdown(false);
    setOpenFormJabatanDropdown(false);

    // Validasi semua field wajib diisi
    if (!formState.id_pegawai || !formState.nidn || !formState.nuptk || !formState.homebase ||
      !formState.id_jafung || formState.beban_sks === "" || formState.beban_sks === null || formState.beban_sks === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon lengkapi semua field yang wajib diisi.',
      });
      return;
    }

    // Validasi khusus untuk PT (Perguruan Tinggi)
    if (!formState.pt || formState.pt === "") {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon pilih atau isi Perguruan Tinggi.',
      });
      return;
    }

    // Validasi jika memilih "Lainnya" tetapi ptCustom kosong
    if (showPtInput && (!ptCustom || ptCustom.trim() === "")) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Belum Lengkap',
        text: 'Mohon isi nama perguruan tinggi.',
      });
      return;
    }

    setLoading(true);
    try {
      const idField = getIdField(editing);
      const url = editing ? `${table.path}/${editing[idField]}` : table.path;
      const method = editing ? "PUT" : "POST";

      // Prepare payload dengan konversi id_pegawai ke integer
      const payload = {
        ...formState,
        id_pegawai: formState.id_pegawai ? parseInt(formState.id_pegawai) : null,
        id_jafung: formState.id_jafung ? parseInt(formState.id_jafung) : null,
        beban_sks: formState.beban_sks ? parseFloat(formState.beban_sks) : null,
      };

      console.log('Edit data:', {
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
      setPtCustom("");
      setShowPtInput(false);
      fetchRows();

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Edit error:', err);
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
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus permanen data: ${err.message}`, 'error');
        setError(err.message);
      }
    }
  };

  // Render component
  if (loading && !rows.length) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  // Filter Data Logic
  const filteredRows = rows
    .filter(row => showDeleted ? row.deleted_at : !row.deleted_at)
    .filter(row => {
      if (!search) return true;
      const lowerSearch = search.toLowerCase();
      return (
        (row.nidn || "").toLowerCase().includes(lowerSearch) ||
        (row.nuptk || "").toLowerCase().includes(lowerSearch) ||
        (row.nama_lengkap || "").toLowerCase().includes(lowerSearch) ||
        (row.pt || "").toLowerCase().includes(lowerSearch) ||
        (row.jabatan_fungsional || "").toLowerCase().includes(lowerSearch) ||
        (row.homebase || "").toLowerCase().includes(lowerSearch)
      );
    });

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{table.label}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data dosen program studi.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
              {search && rows.length !== filteredRows.length && (
                <span className="ml-1 text-xs text-slate-400">(dari {rows.length})</span>
              )}
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
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
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
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">NIDN</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">NUPTK</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Lengkap</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT (Perguruan Tinggi)</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jabatan Fungsional</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Homebase</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Beban SKS</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
              {filteredRows
                .map((row, index) => {
                  const idField = getIdField(row);
                  // Pastikan key selalu unik dengan menggabungkan ID, showDeleted state, dan index
                  // Menggunakan index untuk memastikan unik meskipun ada duplikasi ID
                  const uniqueKey = idField && row[idField] !== undefined && row[idField] !== null
                    ? `${showDeleted ? 'deleted' : 'active'}-dosen-${row[idField]}-${index}`
                    : `${showDeleted ? 'deleted' : 'active'}-dosen-no-id-${index}`;
                  const rowId = idField && row[idField] !== undefined && row[idField] !== null
                    ? row[idField]
                    : `dosen-no-id-${index}`;
                  return (
                    <tr key={uniqueKey} className={`transition-all duration-200 ease-in-out ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                      <td className="px-6 py-4 font-semibold text-slate-800 text-center border border-slate-200">{index + 1}.</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nidn || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nuptk || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.nama_lengkap || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.pt || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jabatan_fungsional || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.homebase || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 border border-slate-200">{(row.beban_sks !== null && row.beban_sks !== undefined) ? row.beban_sks : '-'}</td>
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
                    </tr>
                  )
                })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">
                      {search ? `Tidak ada data yang cocok dengan "${search}"` : "Belum ada data yang ditambahkan."}
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
        const currentRow = filteredRows.find((r, idx) => {
          const idField = getIdField(r);
          const rowId = idField && r[idField] !== undefined && r[idField] !== null
            ? r[idField]
            : `dosen-no-id-${idx}`;
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
                aria-label={`Edit data ${currentRow.nama_lengkap || 'dosen'}`}
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
                aria-label={`Hapus data ${currentRow.nama_lengkap || 'dosen'}`}
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
                aria-label={`Hapus permanen data ${currentRow.nama_lengkap || 'dosen'}`}
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
                aria-label={`Pulihkan data ${currentRow.nama_lengkap || 'dosen'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenFormPegawaiDropdown(false);
              setOpenFormHomebaseDropdown(false);
              setOpenFormPtDropdown(false);
              setOpenFormJabatanDropdown(false);
              setShowModal(false);
              setEditing(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">{editing ? 'Edit Data Dosen' : 'Tambah Data Dosen'}</h2>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data dosen dengan lengkap.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pilih Pegawai <span className="text-red-500">*</span></label>
                    <div className="relative form-pegawai-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormPegawaiDropdown(!openFormPegawaiDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.id_pegawai
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih pegawai"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_pegawai ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_pegawai
                              ? (() => {
                                const found = maps?.pegawai ? Object.values(maps.pegawai).find(p => String(p.id_pegawai) === String(formState.id_pegawai)) : null;
                                return found ? (found.nama_lengkap || found.nama || formState.id_pegawai) : formState.id_pegawai;
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
                      {openFormPegawaiDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-pegawai-dropdown-menu mt-1 w-full"
                        >
                          {maps?.pegawai && Object.values(maps.pegawai).length > 0 ? (
                            Object.values(maps.pegawai)
                              .filter(p => !p.deleted_at) // Hanya tampilkan pegawai yang tidak dihapus
                              .sort((a, b) => {
                                const namaA = (a.nama_lengkap || a.nama || '').toLowerCase();
                                const namaB = (b.nama_lengkap || b.nama || '').toLowerCase();
                                return namaA.localeCompare(namaB, 'id', { sensitivity: 'base', numeric: true });
                              })
                              .map(p => (
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
                                  <span className="truncate">{p.nama_lengkap || p.nama || `Pegawai ${p.id_pegawai}`}</span>
                                </button>
                              ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data pegawai
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">NIDN <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formState.nidn || ""}
                      onChange={(e) => setFormState({ ...formState, nidn: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan NIDN"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">NUPTK <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formState.nuptk || ""}
                      onChange={(e) => setFormState({ ...formState, nuptk: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan NUPTK"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Homebase <span className="text-red-500">*</span></label>
                    <div className="relative form-homebase-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormHomebaseDropdown(!openFormHomebaseDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.homebase
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih homebase"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiHome className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.homebase ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.homebase || '-- Pilih Homebase --'}
                          </span>
                        </div>
                        <FiChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormHomebaseDropdown ? 'rotate-180' : ''
                            }`}
                          size={18}
                        />
                      </button>
                      {openFormHomebaseDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-homebase-dropdown-menu mt-1 w-full"
                        >
                          {['Manajemen Informatika', 'Teknik Informatika'].map(homebase => (
                            <button
                              key={homebase}
                              type="button"
                              onClick={() => {
                                setFormState({ ...formState, homebase });
                                setOpenFormHomebaseDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.homebase === homebase
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiHome className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span>{homebase}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">PT (Perguruan Tinggi) <span className="text-red-500">*</span></label>
                    <div className="relative form-pt-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormPtDropdown(!openFormPtDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.pt
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih perguruan tinggi"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiBook className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.pt ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.pt === "STIKOM PGRI Banyuwangi"
                              ? "STIKOM PGRI Banyuwangi"
                              : formState.pt
                                ? formState.pt
                                : '-- Pilih Perguruan Tinggi --'}
                          </span>
                        </div>
                        <FiChevronDown
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormPtDropdown ? 'rotate-180' : ''
                            }`}
                          size={18}
                        />
                      </button>
                      {openFormPtDropdown && (
                        <div
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-pt-dropdown-menu mt-1 w-full"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setFormState({ ...formState, pt: "STIKOM PGRI Banyuwangi" });
                              setPtCustom("");
                              setShowPtInput(false);
                              setOpenFormPtDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.pt === "STIKOM PGRI Banyuwangi"
                              ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                              : 'text-gray-700'
                              }`}
                          >
                            <FiBook className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span>STIKOM PGRI Banyuwangi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPtInput(true);
                              setFormState({ ...formState, pt: ptCustom || "" });
                              setOpenFormPtDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${showPtInput && formState.pt !== "STIKOM PGRI Banyuwangi"
                              ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                              : 'text-gray-700'
                              }`}
                          >
                            <FiBook className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span>Lainnya</span>
                          </button>
                        </div>
                      )}
                      {showPtInput && (
                        <input
                          type="text"
                          value={ptCustom}
                          onChange={(e) => {
                            setPtCustom(e.target.value);
                            setFormState({ ...formState, pt: e.target.value });
                          }}
                          required={showPtInput}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white mt-2"
                          placeholder="Masukkan nama perguruan tinggi"
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jabatan Fungsional <span className="text-red-500">*</span></label>
                    <div className="relative form-jabatan-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormJabatanDropdown(!openFormJabatanDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formState.id_jafung
                          ? 'border-[#0384d6] bg-white'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        aria-label="Pilih jabatan fungsional"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiAward className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_jafung ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_jafung
                              ? (() => {
                                const found = maps?.ref_jabatan_fungsional ? Object.values(maps.ref_jabatan_fungsional).find(jf => String(jf.id_jafung) === String(formState.id_jafung)) : null;
                                return found ? found.nama_jafung : formState.id_jafung;
                              })()
                              : '-- Pilih Jabatan Fungsional --'}
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
                          {maps?.ref_jabatan_fungsional && Object.values(maps.ref_jabatan_fungsional).length > 0 ? (
                            Object.values(maps.ref_jabatan_fungsional).map(jf => (
                              <button
                                key={jf.id_jafung}
                                type="button"
                                onClick={() => {
                                  setFormState({ ...formState, id_jafung: String(jf.id_jafung) });
                                  setOpenFormJabatanDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formState.id_jafung === String(jf.id_jafung)
                                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                  : 'text-gray-700'
                                  }`}
                              >
                                <FiAward className="text-[#0384d6] flex-shrink-0" size={16} />
                                <span className="truncate">{jf.nama_jafung}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data jabatan fungsional
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Beban SKS <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formState.beban_sks || ""}
                      onChange={(e) => setFormState({ ...formState, beban_sks: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan Beban SKS"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFormPegawaiDropdown(false);
                      setOpenFormHomebaseDropdown(false);
                      setOpenFormPtDropdown(false);
                      setOpenFormJabatanDropdown(false);
                      setShowModal(false);
                      setEditing(null);
                      setPtCustom("");
                      setShowPtInput(false);
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
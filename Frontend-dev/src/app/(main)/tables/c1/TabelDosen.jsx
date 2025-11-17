"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

export default function TabelDosen({ role }) {
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
  const [pegawaiSearch, setPegawaiSearch] = useState("");
  const [showPegawaiDropdown, setShowPegawaiDropdown] = useState(false);

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
    }
  }, [showModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showModal]);

  // Cek hak akses
  const canCreate = roleCan(role, table.key, "C");
  const canUpdate = roleCan(role, table.key, "U");
  const canDelete = roleCan(role, table.key, "D");

  // Filter pegawai berdasarkan pencarian (bisa di mana saja dalam nama)
  const filteredPegawai = maps?.pegawai ? Object.values(maps.pegawai).filter(pegawai => 
    pegawai.nama_lengkap.toLowerCase().includes(pegawaiSearch.toLowerCase())
  ).sort((a, b) => {
    // Urutkan berdasarkan relevansi: yang dimulai dengan pencarian di atas
    const aStartsWith = a.nama_lengkap.toLowerCase().startsWith(pegawaiSearch.toLowerCase());
    const bStartsWith = b.nama_lengkap.toLowerCase().startsWith(pegawaiSearch.toLowerCase());
    
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    
    // Jika sama-sama dimulai atau tidak dimulai, urutkan alfabetis
    return a.nama_lengkap.localeCompare(b.nama_lengkap);
  }) : [];

  // Mendapatkan nama pegawai yang dipilih
  const selectedPegawai = maps?.pegawai && formState.id_pegawai ? 
    maps.pegawai[formState.id_pegawai] : null;
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
      const url = showDeleted ? `${table.path}?include_deleted=1` : table.path;
      const result = await apiFetch(url);
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
      setRows(uniqueRows);
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
      setFormState({
        id_pegawai: editing.id_pegawai || "",
        nidn: editing.nidn || "",
        nuptk: editing.nuptk || "",
        homebase: editing.homebase || "",
        pt: editing.pt || "",
        id_jafung: editing.id_jafung || "",
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
      
      // Set pegawaiSearch untuk combobox
      if (editing.id_pegawai && maps?.pegawai && maps.pegawai[editing.id_pegawai]) {
        setPegawaiSearch(maps.pegawai[editing.id_pegawai].nama_lengkap);
      } else {
        setPegawaiSearch("");
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
      setPegawaiSearch("");
      setShowPegawaiDropdown(false);
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      console.log('Edit data:', {
        url,
        method,
        idField,
        editingId: editing ? editing[idField] : null,
        formState
      });
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      
      setShowModal(false);
      setEditing(null);
      setPtCustom("");
      setShowPtInput(false);
      setPegawaiSearch("");
      setShowPegawaiDropdown(false);
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
            {rows
              .filter(row => showDeleted ? row.deleted_at : !row.deleted_at)
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
            )})}
            {rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at).length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const filteredRows = rows.filter(row => showDeleted ? row.deleted_at : !row.deleted_at);
        const currentRow = filteredRows.find((row, idx) => {
          const idField = getIdField(row);
          const rowId = idField && row[idField] !== undefined && row[idField] !== null 
            ? row[idField] 
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Data Dosen' : 'Tambah Data Dosen'}</h2>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data dosen dengan lengkap.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">ID Pegawai <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={pegawaiSearch}
                        onChange={(e) => {
                          setPegawaiSearch(e.target.value);
                          setShowPegawaiDropdown(true);
                          if (!e.target.value) {
                            setFormState({...formState, id_pegawai: ""});
                          }
                        }}
                        onFocus={() => setShowPegawaiDropdown(true)}
                        onBlur={() => {
                          // Delay untuk memungkinkan click pada dropdown
                          setTimeout(() => {
                            setShowPegawaiDropdown(false);
                            // Jika user mengetik tapi tidak memilih dari dropdown, reset id_pegawai
                            if (pegawaiSearch && !selectedPegawai) {
                              setFormState({...formState, id_pegawai: ""});
                            }
                          }, 200);
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                        placeholder="Cari atau pilih pegawai..."
                      />
                      {showPegawaiDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredPegawai.length > 0 ? (
                            filteredPegawai.map((pegawai) => (
                              <div
                                key={pegawai.id_pegawai}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Mencegah onBlur dari input
                                }}
                                onClick={() => {
                                  setFormState({...formState, id_pegawai: pegawai.id_pegawai});
                                  setPegawaiSearch(pegawai.nama_lengkap);
                                  setShowPegawaiDropdown(false);
                                }}
                              >
                                <div className="font-medium text-gray-900">{pegawai.nama_lengkap}</div>
                                <div className="text-sm text-gray-500">ID: {pegawai.id_pegawai}</div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-center">
                              {pegawaiSearch ? "Pegawai tidak ditemukan" : "Tidak ada data pegawai"}
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
                      onChange={(e) => setFormState({...formState, nidn: e.target.value})}
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
                      onChange={(e) => setFormState({...formState, nuptk: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan NUPTK"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Homebase <span className="text-red-500">*</span></label>
                    <select
                      value={formState.homebase || ""}
                      onChange={(e) => setFormState({...formState, homebase: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Homebase</option>
                      <option value="Manajemen Informatika">Manajemen Informatika</option>
                      <option value="Teknik Informatika">Teknik Informatika</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">PT (Perguruan Tinggi) <span className="text-red-500">*</span></label>
                    <select
                      value={formState.pt === "STIKOM PGRI Banyuwangi" ? "STIKOM PGRI Banyuwangi" : showPtInput ? "Lainnya" : ""}
                      onChange={(e) => {
                        if (e.target.value === "STIKOM PGRI Banyuwangi") {
                          setFormState({...formState, pt: "STIKOM PGRI Banyuwangi"});
                          setPtCustom("");
                          setShowPtInput(false);
                        } else if (e.target.value === "Lainnya") {
                          setShowPtInput(true);
                          setFormState({...formState, pt: ptCustom || ""});
                        } else {
                          setFormState({...formState, pt: ""});
                          setPtCustom("");
                          setShowPtInput(false);
                        }
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Perguruan Tinggi</option>
                      <option value="STIKOM PGRI Banyuwangi">STIKOM PGRI Banyuwangi</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    {showPtInput && (
                      <input
                        type="text"
                        value={ptCustom}
                        onChange={(e) => {
                          setPtCustom(e.target.value);
                          setFormState({...formState, pt: e.target.value});
                        }}
                        required={showPtInput}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white mt-2"
                        placeholder="Masukkan nama perguruan tinggi"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jabatan Fungsional <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_jafung || ""}
                      onChange={(e) => setFormState({...formState, id_jafung: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Jabatan Fungsional</option>
                      {maps?.ref_jabatan_fungsional && Object.values(maps.ref_jabatan_fungsional).map((jf) => (
                        <option key={jf.id_jafung} value={jf.id_jafung}>
                          {jf.nama_jafung}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Beban SKS <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formState.beban_sks || ""}
                      onChange={(e) => setFormState({...formState, beban_sks: e.target.value})}
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
                        setShowModal(false); 
                        setEditing(null);
                        setPtCustom("");
                        setShowPtInput(false);
                        setPegawaiSearch("");
                        setShowPegawaiDropdown(false);
                      }} 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      <span className="relative z-10">Batal</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                  <button 
                      type="submit" 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      <span className="relative z-10">{loading ? "Menyimpan..." : "Simpan"}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
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
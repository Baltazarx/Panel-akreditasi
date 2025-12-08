"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiMoreVertical, FiChevronDown, FiBriefcase } from 'react-icons/fi';

// ============================================================
// PROFIL LULUSAN CRUD
// ============================================================
export default function ProfilLulusanCRUD({ role, maps, onDataChange }) {
  const { authUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
  
  // === PERBAIKAN: State filter menyimpan id_unit_prodi ===
  const [selectedProdi, setSelectedProdi] = useState("");
  
  // Dropdown states for filters and forms
  const [openProdiFilterDropdown, setOpenProdiFilterDropdown] = useState(false);
  const [openFormUnitDropdown, setOpenFormUnitDropdown] = useState(false); 

  const [formState, setFormState] = useState({
    kode_pl: "",
    deskripsi: "", // Frontend kirim 'deskripsi'
    id_unit_prodi: ""
  });

  const canCreate = roleCan(role, "profil_lulusan", "C");
  const canUpdate = roleCan(role, "profil_lulusan", "U");
  const canDelete = roleCan(role, "profil_lulusan", "D");
  
  // Set selectedProdi untuk user prodi
  useEffect(() => {
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi) {
      // Superadmin: default ke "Semua Prodi" (empty string)
      setSelectedProdi("");
    }
  }, [isSuperAdmin, userProdiId, selectedProdi]);

  // === PERBAIKAN: Logika filter disederhanakan ===
  const filteredRows = selectedProdi 
    ? rows.filter(row => row.id_unit_prodi == selectedProdi)
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      // Jika user prodi, filter berdasarkan prodi mereka
      let url = "/profil-lulusan";
      if (!isSuperAdmin && userProdiId) {
        url += `?id_unit_prodi=${userProdiId}`;
      } else if (isSuperAdmin && selectedProdi) {
        url += `?id_unit_prodi=${selectedProdi}`;
      }
      const result = await apiFetch(url);
      setRows(result);
    } catch (err) {
      console.error("Error fetching Profil Lulusan:", err);
      Swal.fire('Error', 'Gagal memuat data Profil Lulusan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpenFormUnitDropdown(false);
    setLoading(true);
    
    // Backend controller Anda sudah di-set untuk memetakan
    // 'deskripsi' -> 'deskripsi_pl'. Ini sudah benar.
    try {
      const url = editing ? `/profil-lulusan/${editing.id_pl}` : "/profil-lulusan";
      const method = editing ? "PUT" : "POST";
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      if (onDataChange) onDataChange();
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data Profil Lulusan berhasil diperbarui.' : 'Data Profil Lulusan berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan yang tidak diketahui'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Profil Lulusan ${row.kode_pl} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/profil-lulusan/${row.id_pl}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data Profil Lulusan telah dihapus.', 'success');
        fetchRows();
        if (onDataChange) onDataChange();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin dan selectedProdi sudah di-set (bisa empty string untuk "Semua Prodi")
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi !== null && selectedProdi !== undefined)) {
      fetchRows();
    }
  }, [selectedProdi, isSuperAdmin, userProdiId]);

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
      setOpenFormUnitDropdown(false);
    }
  }, [showModal]);

  // Close filter dropdown when value changes
  useEffect(() => {
    setOpenProdiFilterDropdown(false);
  }, [selectedProdi]);

  // Close filter and form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openProdiFilterDropdown && !event.target.closest('.prodi-filter-dropdown-container') && !event.target.closest('.prodi-filter-dropdown-menu')) {
        setOpenProdiFilterDropdown(false);
      }
      if (openFormUnitDropdown && !event.target.closest('.form-unit-dropdown-container') && !event.target.closest('.form-unit-dropdown-menu')) {
        setOpenFormUnitDropdown(false);
      }
    };

    if (openProdiFilterDropdown || openFormUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openProdiFilterDropdown, openFormUnitDropdown]);

  // Lock body scroll and add modal-open class when modal is open
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
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showModal]);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_pl: editing.kode_pl || "",
        deskripsi: editing.deskripsi_pl || "", // Map dari 'deskripsi_pl' (DB) ke 'deskripsi' (Form)
        id_unit_prodi: editing.id_unit_prodi || ""
      });
    } else {
      // Tambah data baru: auto-set id_unit_prodi untuk user prodi
      setFormState({
        kode_pl: "",
        deskripsi: "",
        id_unit_prodi: (!isSuperAdmin && userProdiId) ? String(userProdiId) : ""
      });
    }
  }, [editing, isSuperAdmin, userProdiId]);

  // Ekstrak Prodi dari maps untuk filter
  const prodiList = Object.values(maps?.units || {}).filter(
    uk => uk.id_unit === 4 || uk.id_unit === 5 // Asumsi hanya TI (4) dan MI (5)
  );

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Profil Lulusan</h2>
        <div className="flex items-center gap-3">
          
          {/* === PERBAIKAN: Dropdown filter hanya untuk superadmin === */}
          {isSuperAdmin && (
            <div className="relative prodi-filter-dropdown-container" style={{ minWidth: '200px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenProdiFilterDropdown(!openProdiFilterDropdown);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                  selectedProdi 
                    ? 'border-[#0384d6] bg-white text-black' 
                    : 'border-gray-300 bg-white text-slate-700 hover:border-gray-400'
                }`}
                aria-label="Pilih prodi"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                  <span className={`truncate ${selectedProdi ? 'text-black' : 'text-gray-500'}`}>
                    {selectedProdi 
                      ? (() => {
                          const found = prodiList.find((p) => String(p.id_unit) === String(selectedProdi));
                          return found ? found.nama_unit : selectedProdi;
                        })()
                      : "Semua Prodi"}
                  </span>
                </div>
                <FiChevronDown 
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openProdiFilterDropdown ? 'rotate-180' : ''
                  }`} 
                  size={16} 
                />
              </button>
              {openProdiFilterDropdown && (
                <div 
                  className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto prodi-filter-dropdown-menu mt-1 w-full"
                  style={{ minWidth: '200px' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProdi("");
                      setOpenProdiFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                      selectedProdi === ""
                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                        : 'text-gray-700'
                    }`}
                  >
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                    <span>Semua Prodi</span>
                  </button>
                  {prodiList.map(prodi => (
                    <button
                      key={prodi.id_unit}
                      type="button"
                      onClick={() => {
                        setSelectedProdi(String(prodi.id_unit));
                        setOpenProdiFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                        selectedProdi === String(prodi.id_unit)
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                      <span>{prodi.nama_unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setEditing(null);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah Profil Lulusan
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} profil lulusan
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Kode PL</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Unit Prodi</th>
              <th className="px-2 py-3 text-xs font-semibold uppercase border border-white w-20 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_pl} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-2 py-3 border border-slate-200 w-20">
                  <div className="flex items-center justify-center dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rowId = getIdField(row) ? row[getIdField(row)] : idx;
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
                      aria-expanded={openDropdownId === (getIdField(row) ? row[getIdField(row)] : idx)}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : idx;
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
            {canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(currentRow);
                  setShowModal(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.kode_pl}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.kode_pl}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal Form */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setOpenFormUnitDropdown(false);
              setShowModal(false);
              setEditing(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Profil Lulusan (PL)' : 'Tambah Profil Lulusan (PL) Baru'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode PL</label>
                  <input
                    type="text"
                    placeholder="cth: PL-3"
                    value={formState.kode_pl}
                    onChange={(e) => setFormState({...formState, kode_pl: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Prodi</label>
                  <div className="relative form-unit-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!editing && isSuperAdmin) {
                          setOpenFormUnitDropdown(!openFormUnitDropdown);
                        }
                      }}
                      disabled={!!editing || !isSuperAdmin}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                        formState.id_unit_prodi
                          ? 'border-[#0384d6] bg-white' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      } ${(!!editing || !isSuperAdmin) ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                      aria-label="Pilih unit prodi"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${formState.id_unit_prodi ? 'text-gray-900' : 'text-gray-500'}`}>
                          {formState.id_unit_prodi 
                            ? (() => {
                                const found = prodiList.find((p) => String(p.id_unit) === String(formState.id_unit_prodi));
                                return found ? found.nama_unit : formState.id_unit_prodi;
                              })()
                            : '-- Pilih Unit Prodi --'}
                        </span>
                      </div>
                      <FiChevronDown 
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                          openFormUnitDropdown ? 'rotate-180' : ''
                        }`} 
                        size={18} 
                      />
                    </button>
                    {openFormUnitDropdown && !editing && isSuperAdmin && (
                      <div 
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-unit-dropdown-menu mt-1 w-full"
                      >
                        {prodiList.length > 0 ? (
                          prodiList.map(prodi => (
                            <button
                              key={prodi.id_unit}
                              type="button"
                              onClick={() => {
                                setFormState({...formState, id_unit_prodi: String(prodi.id_unit)});
                                setOpenFormUnitDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                formState.id_unit_prodi === String(prodi.id_unit)
                                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                  : 'text-gray-700'
                              }`}
                            >
                              <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span>{prodi.nama_unit}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada data prodi
                          </div>
                        )}
                      </div>
                    )}
                    {(!isSuperAdmin || editing) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {!isSuperAdmin ? "Unit Prodi otomatis dari akun Anda." : editing ? "Unit Prodi tidak dapat diubah setelah data dibuat." : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Profil Lulusan</label>
                  <textarea
                    placeholder="cth: Mampu menjadi Manajer Proyek IT"
                    value={formState.deskripsi} // Form menggunakan 'deskripsi'
                    onChange={(e) => setFormState({...formState, deskripsi: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFormUnitDropdown(false);
                      setShowModal(false);
                      setEditing(null);
                    }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
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
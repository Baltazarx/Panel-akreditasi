"use client";

import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../lib/api"; // Path disesuaikan
import { roleCan } from "../../../lib/role"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';

// ============================================================
// CPMK CRUD
// ============================================================
export default function CpmkCRUD({ role, maps, onDataChange }) {
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

  const [formState, setFormState] = useState({
    kode_cpmk: "",
    deskripsi_cpmk: "", // Field ini sudah benar sesuai backend
    id_unit_prodi: "",
    id_mk: ""
  });

  const canCreate = roleCan(role, "cpmk", "C");
  const canUpdate = roleCan(role, "cpmk", "U");
  const canDelete = roleCan(role, "cpmk", "D");
  
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

  // === PERBAIKAN: Filter dilakukan di backend, bukan di frontend ===
  const fetchRows = async () => {
    setLoading(true);
    try {
      let url = "/cpmk";
      // Jika user prodi, selalu filter berdasarkan prodi mereka
      if (!isSuperAdmin && userProdiId) {
        url += `?id_unit_prodi=${userProdiId}`;
      } else if (selectedProdi) {
        // Superadmin memilih prodi tertentu
        url += `?id_unit_prodi=${selectedProdi}`;
      } else {
        // Superadmin memilih "Semua Prodi" = kirim semua prodi (TI dan MI)
        url += "?id_unit_prodi_in=4,5";
      }
      
      const result = await apiFetch(url);
      setRows(result);
    } catch (err) {
      console.error("Error fetching CPMK:", err);
      Swal.fire('Error', 'Gagal memuat data CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editing ? `/cpmk/${editing.id_cpmk}` : "/cpmk";
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
        text: editing ? 'Data CPMK berhasil diperbarui.' : 'Data CPMK berhasil ditambahkan.',
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
      text: `CPMK ${row.kode_cpmk} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/cpmk/${row.id_cpmk}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data CPMK telah dihapus.', 'success');
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
  }, [selectedProdi, isSuperAdmin, userProdiId]); // Fetch ulang ketika filter berubah

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

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_cpmk: editing.kode_cpmk || "",
        deskripsi_cpmk: editing.deskripsi_cpmk || "",
        id_unit_prodi: editing.id_unit_prodi || "",
        id_mk: editing.id_mk || ""
      });
    } else {
      // Tambah data baru: auto-set id_unit_prodi untuk user prodi
      setFormState({
        kode_cpmk: "",
        deskripsi_cpmk: "",
        id_unit_prodi: (!isSuperAdmin && userProdiId) ? String(userProdiId) : "",
        id_mk: ""
      });
    }
  }, [editing, isSuperAdmin, userProdiId]);

  // Ekstrak Prodi dari maps untuk filter
  const prodiList = Object.values(maps?.units || {}).filter(
    uk => uk.id_unit === 4 || uk.id_unit === 5 // Asumsi hanya TI (4) dan MI (5)
  );

  // Ambil daftar MK dari maps
  const mkList = Object.values(maps?.mata_kuliah || {});

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
        <div className="flex items-center gap-3">
          
          {/* === PERBAIKAN: Dropdown filter hanya untuk superadmin === */}
          {isSuperAdmin && (
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
            >
              <option value="">Semua Prodi</option>
              {prodiList.map(prodi => (
                <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
              ))}
            </select>
          )}
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setEditing(null);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah CPMK
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      <div className="mb-3 text-sm text-slate-600">
        Menampilkan {rows.length} CPMK
        {selectedProdi && ` untuk ${prodiList.find(p => p.id_unit == selectedProdi)?.nama_unit || 'Prodi Terpilih'}`}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode CPMK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Mata Kuliah</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={row.id_cpmk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
                <td className="px-4 py-3 border border-slate-200">
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
        const currentRow = rows.find((r, idx) => {
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
                aria-label={`Edit data ${currentRow.kode_cpmk}`}
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
                aria-label={`Hapus data ${currentRow.kode_cpmk}`}
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit CPMK' : 'Tambah CPMK'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kode CPMK</label>
                    <input
                      type="text"
                      value={formState.kode_cpmk}
                      onChange={(e) => setFormState({...formState, kode_cpmk: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                      required
                      disabled={!!editing || !isSuperAdmin}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Pilih Unit Prodi</option>
                      {prodiList.map(prodi => (
                        <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi CPMK</label>
                  <textarea
                    value={formState.deskripsi_cpmk}
                    onChange={(e) => setFormState({...formState, deskripsi_cpmk: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Kuliah (Opsional)</label>
                  <select
                    value={formState.id_mk}
                    onChange={(e) => setFormState({...formState, id_mk: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  >
                    <option value="">Pilih Mata Kuliah (Opsional)</option>
                    {mkList.map(mk => (
                      <option key={mk.id_mk} value={mk.id_mk}>{mk.kode_mk} - {mk.nama_mk}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mata kuliah akan dipetakan setelah CPMK dibuat</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
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
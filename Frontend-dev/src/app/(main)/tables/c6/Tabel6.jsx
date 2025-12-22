"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus, FiSave, FiChevronDown, FiBriefcase } from 'react-icons/fi';

const ENDPOINT = "/tabel-6-kesesuaian-visi-misi";
const TABLE_KEY = "tabel_6_kesesuaian_visi_misi";
const LABEL = "Tabel 6. Kesesuaian Visi Misi";

/* ---------- Action Dropdown Component ---------- */
function ActionDropdown({ row, canUpdate, canDelete, canHardDelete, onEdit, onDelete, onRestore, onHardDelete, openDropdownId, setOpenDropdownId }) {
  const dropdownRef = useRef(null);
  const isDeleted = row?.deleted_at;
  const rowId = row?.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId === rowId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdownId, rowId, setOpenDropdownId]);

  if (!row) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenDropdownId(openDropdownId === rowId ? null : rowId);
        }}
        className="p-2 text-slate-600 hover:text-[#0384d6] hover:bg-[#eaf4ff] rounded-lg transition-colors"
        aria-label="Menu aksi"
      >
        <FiMoreVertical size={18} />
      </button>

      {openDropdownId === rowId && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {!isDeleted && canUpdate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
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
                onDelete(row);
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
                onRestore(row);
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
                onHardDelete(row);
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
      )}
    </div>
  );
}

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedProdi, isSuperAdmin }) {
  const [form, setForm] = useState({
    id_unit_prodi: "",
    visi_pt: "",
    visi_upps: "",
    visi_keilmuan_ps: "",
    misi_pt: "",
    misi_upps: ""
  });

  const [prodiList, setProdiList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch prodi list
  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const data = await apiFetch("/unit-kerja");
        const list = Array.isArray(data) ? data : [];
        // Filter hanya TI (4) dan MI (5)
        const filtered = list.filter(uk => uk.id_unit === 4 || uk.id_unit === 5);
        setProdiList(filtered.sort((a, b) => a.id_unit - b.id_unit));
      } catch (err) {
        console.error("Error fetching prodi:", err);
        setProdiList([]);
      }
    };
    if (isOpen) fetchProdi();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          id_unit_prodi: initialData.id_unit_prodi ? String(initialData.id_unit_prodi) : "",
          visi_pt: initialData.visi_pt || "",
          visi_upps: initialData.visi_upps || "",
          visi_keilmuan_ps: initialData.visi_keilmuan_ps || "",
          misi_pt: initialData.misi_pt || "",
          misi_upps: initialData.misi_upps || ""
        });
      } else {
        // Tambah data baru: untuk superadmin, set dari selectedProdi
        // Untuk user prodi, ambil dari authUser
        const defaultProdiId = isSuperAdmin 
          ? (selectedProdi ? String(selectedProdi) : "")
          : (authUser?.id_unit_prodi || authUser?.unit || authUser?.id_unit ? String(authUser?.id_unit_prodi || authUser?.unit || authUser?.id_unit) : "");
        
        setForm({
          id_unit_prodi: defaultProdiId,
          visi_pt: "",
          visi_upps: "",
          visi_keilmuan_ps: "",
          misi_pt: "",
          misi_upps: ""
        });
      }
    } else {
      // Reset form saat modal ditutup
      setForm({
        id_unit_prodi: "",
        visi_pt: "",
        visi_upps: "",
        visi_keilmuan_ps: "",
        misi_pt: "",
        misi_upps: ""
      });
    }
  }, [initialData, isOpen, selectedProdi, isSuperAdmin, authUser]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi id_unit_prodi wajib diisi
    if (!form.id_unit_prodi) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Gagal',
        text: 'Program Studi wajib dipilih.',
        confirmButtonColor: '#0384d6'
      });
      return;
    }
    
    setLoading(true);
    try {
      await onSave(form);
    } catch (error) {
      // Error sudah di-handle di onSave, tidak perlu action tambahan
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Kesesuaian Visi Misi" : "Tambah Kesesuaian Visi Misi"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Kesesuaian Visi Misi sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Program Studi */}
          <div>
            <label htmlFor="id_unit_prodi" className="block text-sm font-medium text-slate-700 mb-2">
              Program Studi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 flex items-center gap-3 cursor-not-allowed">
                <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                <span className="truncate">
                  {form.id_unit_prodi 
                    ? (() => {
                        const found = prodiList.find((p) => String(p.id_unit) === String(form.id_unit_prodi));
                        return found ? (found.nama_unit || found.nama || found.id_unit) : "-- Program Studi --";
                      })()
                    : "-- Program Studi --"}
                </span>
              </div>
            </div>
            {initialData && (
              <p className="mt-1 text-xs text-slate-500">Program Studi tidak dapat diubah setelah data dibuat.</p>
            )}
            {isSuperAdmin && !initialData && (
              <p className="mt-1 text-xs text-slate-500">Program Studi sudah dipilih dari dropdown filter di atas.</p>
            )}
          </div>

          {/* Visi Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Visi</h3>
            
            <div>
              <label htmlFor="visi_pt" className="block text-sm font-medium text-slate-700 mb-1">
                Visi PT
              </label>
              <textarea
                id="visi_pt"
                value={form.visi_pt}
                onChange={(e) => handleChange("visi_pt", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Perguruan Tinggi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="visi_upps" className="block text-sm font-medium text-slate-700 mb-1">
                Visi UPPS
              </label>
              <textarea
                id="visi_upps"
                value={form.visi_upps}
                onChange={(e) => handleChange("visi_upps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Unit Pengelola Program Studi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="visi_keilmuan_ps" className="block text-sm font-medium text-slate-700 mb-1">
                Visi Keilmuan PS
              </label>
              <textarea
                id="visi_keilmuan_ps"
                value={form.visi_keilmuan_ps}
                onChange={(e) => handleChange("visi_keilmuan_ps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Visi Keilmuan Program Studi..."
                rows="3"
              />
            </div>
          </div>

          {/* Misi Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">Misi</h3>
            
            <div>
              <label htmlFor="misi_pt" className="block text-sm font-medium text-slate-700 mb-1">
                Misi PT
              </label>
              <textarea
                id="misi_pt"
                value={form.misi_pt}
                onChange={(e) => handleChange("misi_pt", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Misi Perguruan Tinggi..."
                rows="3"
              />
            </div>

            <div>
              <label htmlFor="misi_upps" className="block text-sm font-medium text-slate-700 mb-1">
                Misi UPPS
              </label>
              <textarea
                id="misi_upps"
                value={form.misi_upps}
                onChange={(e) => handleChange("misi_upps", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="Misi Unit Pengelola Program Studi..."
                rows="3"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tabel6({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);
  
  const [rows, setRows] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  const isKetuastikom = userRole?.toLowerCase() === 'ketuastikom';
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit || authUser?.id_unit;
  
  // State filter menyimpan id_unit_prodi
  const [selectedProdi, setSelectedProdi] = useState("");
  const [openProdiFilterDropdown, setOpenProdiFilterDropdown] = useState(false);
  
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
  
  // Ekstrak Prodi dari maps untuk filter - hanya TI dan MI
  const prodiList = Object.values(maps?.units || {})
    .filter(uk => uk.id_unit === 4 || uk.id_unit === 5) // Hanya TI (4) dan MI (5)
    .sort((a, b) => a.id_unit - b.id_unit); // Sort berdasarkan id_unit (TI dulu, lalu MI)
  
  // Set selectedProdi untuk user prodi
  // Untuk role ketuastikom, jangan set selectedProdi (bisa lihat semua data)
  useEffect(() => {
    if (isKetuastikom) {
      // Role ketuastikom: tidak perlu set selectedProdi, bisa lihat semua data
      return;
    }
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi && prodiList.length > 0) {
      // Superadmin: default ke Prodi TI (id_unit = 4)
      setSelectedProdi(String(prodiList[0].id_unit));
    }
  }, [isSuperAdmin, userProdiId, selectedProdi, prodiList, isKetuastikom]);
  
  // Fetch data
  const fetchRows = async () => {
    try {
      setLoading(true);
      setError("");
      let url = ENDPOINT;
      
      // Build query parameters
      const params = [];
      if (showDeleted) {
        params.push("include_deleted=1");
      }
      
      // Filter berdasarkan prodi
      // Untuk role ketuastikom, jangan kirim filter (bisa lihat semua data)
      if (!isKetuastikom) {
        if (!isSuperAdmin && userProdiId) {
          // User prodi: selalu filter berdasarkan prodi mereka
          params.push(`id_unit_prodi=${userProdiId}`);
        } else if (selectedProdi) {
          // Superadmin memilih prodi tertentu
          params.push(`id_unit_prodi=${selectedProdi}`);
        }
      }
      
      if (params.length > 0) {
        url += "?" + params.join("&");
      }
      
      const data = await apiFetch(url);
      const dataArray = Array.isArray(data) ? data : (data.items || []);
      const sortedDataArray = sortRowsByLatest(dataArray);
      setRows(sortedDataArray);
      
      // Set current data berdasarkan filter (hanya untuk display info, bukan untuk tabel)
      // Tabel akan menampilkan semua data dari filteredRows
      if (sortedDataArray.length > 0) {
        if (isKetuastikom) {
          // Role ketuastikom: jika ada selectedProdi, tampilkan data prodi yang dipilih
          if (selectedProdi) {
            const filteredData = sortedDataArray.find(r => 
              String(r.id_unit_prodi) === String(selectedProdi) && 
              (showDeleted ? r.deleted_at : !r.deleted_at)
            );
            setCurrentData(filteredData || sortedDataArray.find(r => showDeleted ? r.deleted_at : !r.deleted_at) || sortedDataArray[0]);
          } else {
            // Tampilkan data pertama sesuai filter deleted
            setCurrentData(sortedDataArray.find(r => showDeleted ? r.deleted_at : !r.deleted_at) || sortedDataArray[0]);
          }
        } else if (selectedProdi) {
          // Jika ada filter prodi, tampilkan data prodi yang dipilih
          const filteredData = sortedDataArray.find(r => 
            String(r.id_unit_prodi) === String(selectedProdi) && 
            (showDeleted ? r.deleted_at : !r.deleted_at)
          );
          setCurrentData(filteredData || sortedDataArray.find(r => showDeleted ? r.deleted_at : !r.deleted_at) || sortedDataArray[0]);
        } else if (!isSuperAdmin && userProdiId) {
          // User prodi: tampilkan data prodi mereka
          const userData = sortedDataArray.find(r => 
            String(r.id_unit_prodi) === String(userProdiId) && 
            (showDeleted ? r.deleted_at : !r.deleted_at)
          );
          setCurrentData(userData || sortedDataArray.find(r => showDeleted ? r.deleted_at : !r.deleted_at) || sortedDataArray[0]);
        } else {
          // Fallback: tampilkan data pertama sesuai filter deleted
          setCurrentData(sortedDataArray.find(r => showDeleted ? r.deleted_at : !r.deleted_at) || sortedDataArray[0]);
        }
      } else {
        setCurrentData(null);
      }
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Untuk role ketuastikom, fetch data langsung (bisa lihat semua data)
    // Filter akan dilakukan di frontend berdasarkan selectedProdi
    if (isKetuastikom) {
      fetchRows();
      return;
    }
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin dan selectedProdi sudah di-set
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi)) {
      fetchRows();
    }
  }, [showDeleted, selectedProdi, isSuperAdmin, userProdiId, isKetuastikom]);
  
  // Update currentData saat selectedProdi berubah untuk role ketuastikom (filter di frontend)
  useEffect(() => {
    if (isKetuastikom && rows.length > 0) {
      if (selectedProdi) {
        const filteredData = rows.find(r => String(r.id_unit_prodi) === String(selectedProdi) && !r.deleted_at);
        setCurrentData(filteredData || rows.find(r => !r.deleted_at) || rows[0]);
      } else {
        setCurrentData(rows.find(r => !r.deleted_at) || rows[0]);
      }
    }
  }, [selectedProdi, rows, isKetuastikom]);

  // Close prodi filter dropdown when selectedProdi changes
  useEffect(() => {
    setOpenProdiFilterDropdown(false);
  }, [selectedProdi]);

  // Close prodi filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openProdiFilterDropdown && !event.target.closest('.prodi-filter-dropdown-container') && !event.target.closest('.prodi-filter-dropdown-menu')) {
        setOpenProdiFilterDropdown(false);
      }
    };

    if (openProdiFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openProdiFilterDropdown]);

  // Handle save (create/update)
  const handleSave = async (formData) => {
    try {
      // Pastikan id_unit_prodi dalam format yang benar (number)
      const dataToSend = {
        ...formData,
        id_unit_prodi: formData.id_unit_prodi ? parseInt(formData.id_unit_prodi) : formData.id_unit_prodi
      };
      
      if (editData) {
        await apiFetch(`${ENDPOINT}/${editData.id}`, {
          method: 'PUT',
          body: JSON.stringify(dataToSend)
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Kesesuaian Visi Misi berhasil diperbarui.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(dataToSend)
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Kesesuaian Visi Misi berhasil ditambahkan.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      
      setShowForm(false);
      setEditData(null);
      await fetchRows();
    } catch (e) {
      console.error('Error saving data:', e);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: e?.message || "Gagal menyimpan data",
        confirmButtonColor: '#0384d6'
      });
      throw e; // Re-throw agar bisa di-handle di modal form
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
        setLoading(true);
        await apiFetch(`${ENDPOINT}/${row.id}`, { method: 'DELETE' });
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil dihapus.',
          timer: 1500,
          showConfirmButton: false
        });
        await fetchRows();
      } catch (e) {
        console.error('Error deleting data:', e);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: e?.message || "Gagal menghapus data",
          confirmButtonColor: '#0384d6'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle restore
  const handleRestore = async (row) => {
    try {
      setLoading(true);
      await apiFetch(`${ENDPOINT}/${row.id}/restore`, { method: 'POST' });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil dipulihkan.',
        timer: 1500,
        showConfirmButton: false
      });
      await fetchRows();
    } catch (e) {
      console.error('Error restoring data:', e);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: e?.message || "Gagal memulihkan data",
        confirmButtonColor: '#0384d6'
      });
    } finally {
      setLoading(false);
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
        setLoading(true);
        await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: 'DELETE' });
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          text: 'Data telah dihapus secara permanen.',
          timer: 1500,
          showConfirmButton: false
        });
        await fetchRows();
      } catch (e) {
        console.error('Error hard deleting data:', e);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: e?.message || "Gagal menghapus data",
          confirmButtonColor: '#0384d6'
        });
      } finally {
        setLoading(false);
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
      a.download = `Tabel_6_Kesesuaian_Visi_Misi.xlsx`;
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
    let filtered = rows;
    
    // Filter berdasarkan status deleted
    if (showDeleted) {
      filtered = filtered.filter(r => r.deleted_at);
    } else {
      filtered = filtered.filter(r => !r.deleted_at);
    }
    
    // Filter berdasarkan selectedProdi untuk role ketuastikom (filter di frontend)
    if (isKetuastikom && selectedProdi) {
      filtered = filtered.filter(r => String(r.id_unit_prodi) === String(selectedProdi));
    }
    
    return filtered;
  }, [rows, showDeleted, selectedProdi, isKetuastikom]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Kesesuaian Visi Misi untuk tabel 6.
          </p>
          {!loading && currentData && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Prodi: <span className="ml-1 text-[#0384d6] font-bold text-base">{currentData.nama_prodi || "-"}</span>
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

            {/* Dropdown filter untuk superadmin dan ketuastikom */}
            {(isSuperAdmin || isKetuastikom) && (
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
                      : 'border-gray-300 bg-white text-black hover:border-gray-400'
                  }`}
                  aria-label="Pilih program studi"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                    <span className={`truncate ${selectedProdi ? 'text-black' : 'text-gray-500'}`}>
                      {selectedProdi 
                        ? (() => {
                            const found = prodiList.find((p) => String(p.id_unit) === String(selectedProdi));
                            return found ? found.nama_unit : selectedProdi;
                          })()
                        : isSuperAdmin ? "Semua Prodi" : "-- Pilih Prodi --"}
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
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProdi("");
                          setOpenProdiFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                          !selectedProdi
                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                        <span>Semua Prodi</span>
                      </button>
                    )}
                    {prodiList.length > 0 ? (
                      prodiList.map((prodi) => (
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
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Tidak ada data program studi
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

           <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
             {loading ? "Memuat..." : `${filteredRows.length} data`}
             {selectedProdi && ` - ${prodiList.find(p => p.id_unit == selectedProdi)?.nama_unit || 'Prodi Terpilih'}`}
           </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && !currentData && (
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
        <div className="relative transition-opacity duration-200 ease-in-out">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
            {loading ? (
              <tr>
                <td colSpan={(canUpdate || canDelete || canHardDelete) ? 4 : 3} className="px-6 py-16 text-center text-slate-500 border border-slate-200 bg-white">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row, idx) => {
                const rowId = row.id || idx;
                const isDeleted = row.deleted_at;
                // Alternating row colors
                const rowBgClass = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                return (
                  <React.Fragment key={rowId}>
                    {/* Row 1: Header Visi */}
                    <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        Visi PT
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        Visi UPPS
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        Visi Keilmuan PS
                      </th>
                      {(canUpdate || canDelete || canHardDelete) && (
                        <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                          Aksi
                        </th>
                      )}
                    </tr>
                    {/* Row 2: Data Visi */}
                    <tr className={`transition-all duration-200 ease-in-out ${isDeleted ? 'bg-red-50 hover:bg-red-100' : `${rowBgClass} hover:bg-[#eaf4ff]`}`}>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top whitespace-pre-wrap ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {row.visi_pt || ""}
                      </td>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top whitespace-pre-wrap ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {row.visi_upps || ""}
                      </td>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top whitespace-pre-wrap ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {row.visi_keilmuan_ps || ""}
                      </td>
                      {(canUpdate || canDelete || canHardDelete) && (
                        <td className={`px-6 py-4 text-center border border-slate-200 ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                          <ActionDropdown
                            row={row}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            canHardDelete={canHardDelete}
                            onEdit={() => {
                              setEditData(row);
                              setShowForm(true);
                            }}
                            onDelete={handleDelete}
                            onRestore={handleRestore}
                            onHardDelete={handleHardDelete}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                          />
                        </td>
                      )}
                    </tr>
                    {/* Row 3: Header Misi */}
                    <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        Misi PT
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        Misi UPPS
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                        {/* Kosong */}
                      </th>
                      {(canUpdate || canDelete || canHardDelete) && (
                        <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                          {/* Kosong */}
                        </th>
                      )}
                    </tr>
                    {/* Row 4: Data Misi */}
                    <tr className={`transition-all duration-200 ease-in-out ${isDeleted ? 'bg-red-50 hover:bg-red-100' : `${rowBgClass} hover:bg-[#eaf4ff]`}`}>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top whitespace-pre-wrap ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {row.misi_pt || ""}
                      </td>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top whitespace-pre-wrap ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {row.misi_upps || ""}
                      </td>
                      <td className={`px-6 py-4 text-slate-700 border border-slate-200 align-top ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                        {/* Kosong */}
                      </td>
                      {(canUpdate || canDelete || canHardDelete) && (
                        <td className={`px-6 py-4 text-center border border-slate-200 ${isDeleted ? 'bg-red-50' : rowBgClass}`}>
                          {/* Kosong */}
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })
            ) : (
              <tr className="bg-white">
                <td colSpan={(canUpdate || canDelete || canHardDelete) ? 4 : 3} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

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
        selectedProdi={selectedProdi}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}


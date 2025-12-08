'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiKey, FiChevronDown, FiBriefcase, FiShield } from 'react-icons/fi';

export default function UserManagementPage() {
  const api = useApi();
  const { authUser } = useAuth();
  const loweredRole = authUser?.role?.toLowerCase();
  const isReadOnlyRole = loweredRole === "ketuastikom";
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [pegawaiQuery, setPegawaiQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Form dropdown states
  const [openFormUnitDropdown, setOpenFormUnitDropdown] = useState(false);
  const [openFormRoleDropdown, setOpenFormRoleDropdown] = useState(false);
  
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

  const [formData, setFormData] = useState({
    id_user: null,
    username: "",
    password: "",
    id_unit: "",
    id_pegawai: "",
    role: "PRODI",
  });

  // Ambil data users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal ambil users:", err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Gagal memuat data pengguna.';
      Swal.fire('Gagal!', errorMessage, 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Ambil unit kerja untuk dropdown
  const fetchUnits = async () => {
    try {
      const data = await api.get("/users/extra/units");
      setUnits(data);
    } catch (err) {
      console.error("Gagal ambil unit kerja:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Fetch sekali saat mount

  useEffect(() => {
    fetchUnits();
  }, []); // Fetch units sekali saat mount

  // Close form dropdowns when form closes
  useEffect(() => {
    if (!showForm) {
      setOpenFormUnitDropdown(false);
      setOpenFormRoleDropdown(false);
    }
  }, [showForm]);

  // Close form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFormUnitDropdown && !event.target.closest('.form-unit-dropdown-container') && !event.target.closest('.form-unit-dropdown-menu')) {
        setOpenFormUnitDropdown(false);
      }
      if (openFormRoleDropdown && !event.target.closest('.form-role-dropdown-container') && !event.target.closest('.form-role-dropdown-menu')) {
        setOpenFormRoleDropdown(false);
      }
    };

    if (openFormUnitDropdown || openFormRoleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openFormUnitDropdown, openFormRoleDropdown]);

  // Submit tambah/edit user
  const handleSubmit = async (e) => {
    if (isReadOnlyRole) return;
    e.preventDefault();
    setOpenFormUnitDropdown(false);
    setOpenFormRoleDropdown(false);
    
    // Validasi form
    if (!formData.username || !formData.username.trim()) {
      Swal.fire('Gagal!', 'Username tidak boleh kosong.', 'error');
      return;
    }
    
    if (!formData.id_unit) {
      Swal.fire('Gagal!', 'Unit kerja harus dipilih.', 'error');
      return;
    }
    
    if (!formData.role) {
      Swal.fire('Gagal!', 'Role harus dipilih.', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Siapkan payload
      const payload = {
        username: formData.username.trim(),
        id_unit: formData.id_unit || null,
        id_pegawai: formData.id_pegawai || null,
        role: formData.role,
      };
      
      // Untuk create: gunakan password default "123"
      // Untuk edit: jangan kirim password (biarkan backend tidak mengubah password)
      if (!editMode) {
        payload.password = "123"; // Password default untuk akun baru
      }
      
      if (editMode) {
        await api.put(`/users/${formData.id_user}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Akun berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post("/users", payload);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Akun berhasil dibuat dengan password default "123".',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setShowForm(false);
      setEditMode(false);
      resetForm();
      await fetchUsers();
    } catch (err) {
      console.error("Gagal simpan user:", err);
      const errorMessage = err?.response?.data?.error || err?.message || 'Terjadi kesalahan saat menyimpan akun.';
      Swal.fire('Gagal!', errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id_user: null,
      username: "",
      password: "", // Tidak digunakan lagi, tapi tetap di state untuk kompatibilitas
      id_unit: "",
      id_pegawai: "",
      role: "PRODI",
    });
    setPegawaiQuery("");
    setPegawaiList([]);
    setEditMode(false);
  };

  // Edit user
  const handleEdit = (user) => {
    if (isReadOnlyRole) return;
    setFormData({
      id_user: user.id_user,
      username: user.username || "",
      password: "", // Tidak digunakan lagi, tapi tetap di state untuk kompatibilitas
      id_unit: user.id_unit || "",
      id_pegawai: user.id_pegawai || "",
      role: user.role || "PRODI",
    });
    setPegawaiQuery(user.pegawai_name || "");
    setPegawaiList([]);
    setEditMode(true);
    setShowForm(true);
  };

  // Hapus user (soft delete)
  const handleDelete = (id) => {
    if (isReadOnlyRole) return;
    Swal.fire({
      title: 'Hapus Akun?',
      text: "Anda yakin ingin menghapus akun ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${id}`);
          // Refresh data setelah delete
          await fetchUsers();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Akun telah dihapus.',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          console.error("Gagal hapus user:", err);
          const errorMessage = err?.response?.data?.error || err?.message || 'Gagal menghapus akun.';
          Swal.fire('Gagal!', errorMessage, 'error');
        }
      }
    });
  };

  // Hard delete
  const handleHardDelete = (id) => {
    if (isReadOnlyRole) return;
    Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${id}/hard-delete`);
          fetchUsers();
          Swal.fire('Terhapus!', 'Akun telah dihapus secara permanen.', 'success');
        } catch (err) {
          console.error("Gagal hapus permanen user:", err);
          Swal.fire('Gagal!', `Gagal menghapus akun secara permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Reset password untuk superadmin
  const handleResetPassword = (user) => {
    if (isReadOnlyRole) return;
    
    // Cek apakah user adalah superadmin (waket1, waket2, tpm)
    const superAdminRoles = ['waket1', 'waket2', 'tpm', 'superadmin'];
    const userRole = user.role?.toLowerCase();
    const isSuperAdmin = superAdminRoles.includes(userRole);
    
    if (!isSuperAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Ditolak',
        text: 'Reset password hanya tersedia untuk role superadmin (WAKET-1, WAKET-2, TPM).'
      });
      return;
    }

    Swal.fire({
      title: 'Reset Password?',
      text: `Password untuk akun "${user.username}" akan direset ke "123".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, reset password!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/users/${user.id_user}`, {
            password: "123"
          });
          fetchUsers();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `Password untuk akun "${user.username}" telah direset ke "123".`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          console.error("Gagal reset password:", err);
          Swal.fire('Gagal!', `Gagal mereset password: ${err.message}`, 'error');
        }
      }
    });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">👤 Manajemen Akun</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola akun pengguna sistem penjaminan mutu.
          </p>
          <span className="inline-flex items-center text-sm text-slate-700">
            Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{users.length}</span>
          </span>
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          {!isReadOnlyRole && (
            <button
              onClick={() => {
                resetForm();
                setEditMode(false);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors"
            >
              + Tambah Akun
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975] mx-auto mb-2"></div>
            <p className="text-slate-500">Memuat data...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">ID</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Username</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Role</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pegawai</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
              <tr
                key={u.id_user}
                className={`transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-[#eaf4ff]`}
              >
                <td className="px-6 py-4 border border-slate-200 text-center font-semibold text-slate-800">{idx + 1}.</td>
                <td className="px-6 py-4 border border-slate-200 text-center font-semibold text-slate-700">{u.id_user}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.username}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.role}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.unit_name || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.pegawai_name || "-"}</td>
                <td className="px-6 py-4 border border-slate-200">
                  <div className="flex items-center justify-center dropdown-container">
                    {isReadOnlyRole ? (
                      <span className="text-xs text-slate-400 italic">Hanya melihat</span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openDropdownId !== u.id_user) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownWidth = 192;
                            setDropdownPosition({
                              top: rect.bottom + 4,
                              left: Math.max(8, rect.right - dropdownWidth)
                            });
                            setOpenDropdownId(u.id_user);
                          } else {
                            setOpenDropdownId(null);
                          }
                        }}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                        aria-label="Menu aksi"
                        aria-expanded={openDropdownId === u.id_user}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Dropdown Menu - Fixed Position */}
      {!isReadOnlyRole && openDropdownId !== null && (() => {
        const currentUser = users.find(u => u.id_user === openDropdownId);
        if (!currentUser) return null;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(currentUser);
                setOpenDropdownId(null);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
              aria-label="Edit akun"
            >
              <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
              <span>Edit</span>
            </button>
            {(() => {
              // Cek apakah user adalah superadmin (waket1, waket2, tpm, superadmin)
              const superAdminRoles = ['waket1', 'waket2', 'tpm', 'superadmin'];
              const userRole = currentUser.role?.toLowerCase();
              const isSuperAdmin = superAdminRoles.includes(userRole);
              
              if (isSuperAdmin) {
                return (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetPassword(currentUser);
                      setOpenDropdownId(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors text-left"
                    aria-label="Reset password"
                  >
                    <FiKey size={16} className="flex-shrink-0 text-orange-600" />
                    <span>Reset Password</span>
                  </button>
                );
              }
              return null;
            })()}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(currentUser.id_user);
                setOpenDropdownId(null);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              aria-label="Hapus akun"
            >
              <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
              <span>Hapus</span>
            </button>
          </div>
        );
      })()}

      {showForm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenFormUnitDropdown(false);
              setOpenFormRoleDropdown(false);
              setShowForm(false);
              setEditMode(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">
                {editMode ? 'Edit' : 'Tambah'} Akun Pengguna
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                {editMode ? 'Perbarui informasi akun pengguna' : 'Buat akun pengguna baru untuk sistem penjaminan mutu'}.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="Masukkan username"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit Kerja
                </label>
                <div className="relative form-unit-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenFormUnitDropdown(!openFormUnitDropdown);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                      formData.id_unit
                        ? 'border-[#0384d6] bg-white' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    aria-label="Pilih unit kerja"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                      <span className={`truncate ${formData.id_unit ? 'text-gray-900' : 'text-gray-500'}`}>
                        {formData.id_unit 
                          ? (() => {
                              const found = units.find(u => String(u.id_unit) === String(formData.id_unit));
                              return found ? found.nama_unit : formData.id_unit;
                            })()
                          : '-- Pilih Unit Kerja --'}
                      </span>
                    </div>
                    <FiChevronDown 
                      className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openFormUnitDropdown ? 'rotate-180' : ''
                      }`} 
                      size={18} 
                    />
                  </button>
                  {openFormUnitDropdown && (
                    <div 
                      className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-unit-dropdown-menu mt-1 w-full"
                    >
                      {units.length > 0 ? (
                        units.map(u => (
                          <button
                            key={u.id_unit}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, id_unit: String(u.id_unit) });
                              setOpenFormUnitDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                              formData.id_unit === String(u.id_unit)
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span className="truncate">{u.nama_unit}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Tidak ada data unit kerja
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pegawai
                </label>
                <input
                  type="text"
                  value={pegawaiQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPegawaiQuery(val);
                    if (val.length >= 2) {
                      api.get(`/users/extra/pegawai?search=${val}`)
                        .then(setPegawaiList)
                        .catch(console.error);
                    } else {
                      setPegawaiList([]);
                    }
                    setFormData({ ...formData, id_pegawai: "" });
                  }}
                  placeholder="Ketik nama pegawai untuk mencari..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                />
                {pegawaiList.length > 0 && (
                  <ul className="border border-slate-200 mt-1 max-h-40 overflow-y-auto rounded-lg shadow bg-white z-50 relative">
                    {pegawaiList.map((p) => (
                      <li
                        key={p.id_pegawai}
                        className="px-4 py-3 hover:bg-[#eaf4ff] cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setFormData({ ...formData, id_pegawai: p.id_pegawai });
                          setPegawaiQuery(p.nama_lengkap);
                          setPegawaiList([]);
                        }}
                      >
                        <div className="font-medium text-slate-700">{p.nama_lengkap}</div>
                        {p.nip && (
                          <div className="text-sm text-slate-500">{p.nip}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <div className="relative form-role-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenFormRoleDropdown(!openFormRoleDropdown);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                      formData.role
                        ? 'border-[#0384d6] bg-white' 
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    aria-label="Pilih role"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                      <span className={`truncate ${formData.role ? 'text-gray-900' : 'text-gray-500'}`}>
                        {formData.role || '-- Pilih Role --'}
                      </span>
                    </div>
                    <FiChevronDown 
                      className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                        openFormRoleDropdown ? 'rotate-180' : ''
                      }`} 
                      size={18} 
                    />
                  </button>
                  {openFormRoleDropdown && (
                    <div 
                      className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-role-dropdown-menu mt-1 w-full"
                    >
                      {['PRODI', 'LPPM', 'ALA', 'PMB', 'KEMAHASISWAAN', 'KEPEGAWAIAN', 'KERJASAMA', 'SARPRAS', 'KETUASTIKOM', 'WAKET-1', 'WAKET-2', 'TPM', 'ADMIN'].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, role });
                            setOpenFormRoleDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                            formData.role === role
                              ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                          <span>{role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setOpenFormUnitDropdown(false);
                    setOpenFormRoleDropdown(false);
                    setShowForm(false);
                    setEditMode(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
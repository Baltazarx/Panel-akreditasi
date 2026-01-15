'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiKey, FiChevronDown, FiBriefcase, FiShield, FiUser, FiRefreshCw } from 'react-icons/fi';
import { useMaps } from "../hooks/useMaps";

export default function UserManagementPage() {
  const api = useApi();
  const { authUser } = useAuth();
  const loweredRole = authUser?.role?.toLowerCase();
  const isReadOnlyRole = loweredRole === "ketua";
  const { refreshMaps } = useMaps(true);
  const [users, setUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [units, setUnits] = useState([]);
  const [allPegawai, setAllPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Form dropdown states
  const [openFormPegawaiDropdown, setOpenFormPegawaiDropdown] = useState(false);
  const [openFormUnitDropdown, setOpenFormUnitDropdown] = useState(false);

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
      const endpoint = showDeleted ? "/users?status=deleted" : "/users";
      const data = await api.get(endpoint);
      const usersArray = Array.isArray(data) ? data : [];

      // Urutkan berdasarkan username secara alfabetis (case-insensitive)
      // Menggunakan localeCompare dengan locale 'id' untuk sorting bahasa Indonesia
      const sortedUsers = [...usersArray].sort((a, b) => {
        const usernameA = (a.username || '').trim().toLowerCase();
        const usernameB = (b.username || '').trim().toLowerCase();

        // Jika username sama, urutkan berdasarkan id_user sebagai secondary sort
        if (usernameA === usernameB) {
          return (a.id_user || 0) - (b.id_user || 0);
        }

        return usernameA.localeCompare(usernameB, 'id', {
          sensitivity: 'base',
          numeric: true
        });
      });

      setUsers(sortedUsers);
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

  // Ambil semua pegawai untuk dropdown
  const fetchAllPegawai = async () => {
    try {
      // [FIX] Fetch with include=units to get pegawai_unit data
      const data = await api.get("/pegawai?include=units");
      // Urutkan berdasarkan nama_lengkap secara alfabetis
      const sortedPegawai = Array.isArray(data) ? [...data].sort((a, b) => {
        const namaA = (a.nama_lengkap || '').trim().toLowerCase();
        const namaB = (b.nama_lengkap || '').trim().toLowerCase();

        if (namaA === namaB) {
          return (a.id_pegawai || 0) - (b.id_pegawai || 0);
        }

        return namaA.localeCompare(namaB, 'id', {
          sensitivity: 'base',
          numeric: true
        });
      }) : [];
      setAllPegawai(sortedPegawai);
    } catch (err) {
      console.error("Gagal ambil pegawai:", err);
      setAllPegawai([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]); // Re-fetch when showDeleted changes

  useEffect(() => {
    fetchUnits();
  }, []); // Fetch units sekali saat mount

  // Fetch pegawai saat form dibuka
  useEffect(() => {
    if (showForm) {
      fetchAllPegawai();
    }
  }, [showForm]);

  // Lock body scroll when form is open
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
    }
  }, [showForm]);

  // Close form dropdowns when form closes
  useEffect(() => {
    if (!showForm) {
      setOpenFormPegawaiDropdown(false);
      setOpenFormUnitDropdown(false);
    }
  }, [showForm]);

  // Close form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFormPegawaiDropdown && !event.target.closest('.form-pegawai-dropdown-container') && !event.target.closest('.form-pegawai-dropdown-menu')) {
        setOpenFormPegawaiDropdown(false);
      }
      if (openFormUnitDropdown && !event.target.closest('.form-unit-dropdown-container') && !event.target.closest('.form-unit-dropdown-menu')) {
        setOpenFormUnitDropdown(false);
      }
    };

    if (openFormPegawaiDropdown || openFormUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openFormPegawaiDropdown, openFormUnitDropdown]);

  const handleSubmit = async (e) => {
    if (isReadOnlyRole) return;
    e.preventDefault();
    setOpenFormPegawaiDropdown(false);
    setOpenFormUnitDropdown(false);

    // Validasi form
    if (!formData.username || !formData.username.trim()) {
      Swal.fire('Gagal!', 'Username tidak boleh kosong.', 'error');
      return;
    }

    if (!formData.id_pegawai) {
      Swal.fire('Gagal!', 'Pegawai harus dipilih.', 'error');
      return;
    }

    if (!formData.id_unit) {
      Swal.fire('Gagal!', 'Unit kerja tidak ditemukan. Pastikan pegawai yang dipilih memiliki unit kerja.', 'error');
      return;
    }

    if (!formData.role) {
      Swal.fire('Gagal!', 'Role tidak ditemukan. Pastikan unit kerja dari pegawai memiliki kode_role.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Siapkan payload
      const payload = {
        username: formData.username.trim(),
        id_unit: formData.id_unit ? parseInt(formData.id_unit) : null, // [NEW] Send selected unit
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
      if (refreshMaps) refreshMaps();
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
          if (refreshMaps) refreshMaps();
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

  // Pulihkan user (restore)
  const handleRestore = (id) => {
    if (isReadOnlyRole) return;
    Swal.fire({
      title: 'Pulihkan Akun?',
      text: "Anda yakin ingin mengaktifkan kembali akun ini?",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/users/${id}/restore`);
          await fetchUsers();
          if (refreshMaps) refreshMaps();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Akun telah dipulihkan.',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          console.error("Gagal pulihkan user:", err);
          Swal.fire('Gagal!', `Gagal memulihkan akun: ${err.message}`, 'error');
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
          await fetchUsers();
          if (refreshMaps) refreshMaps();
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

    // Cek apakah user yang sedang login adalah superadmin (waket1, waket2, tpm, superadmin)
    const superAdminRoles = ['waket1', 'waket2', 'tpm', 'superadmin'];
    const currentUserRole = authUser?.role?.toLowerCase();
    const isCurrentUserSuperAdmin = superAdminRoles.includes(currentUserRole);

    if (!isCurrentUserSuperAdmin) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Ditolak',
        text: 'Hanya superadmin (WAKET-1, WAKET-2, TPM) yang dapat mereset password.'
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
          await fetchUsers();
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `Password untuk akun "${user.username}" telah direset ke "123".`,
            timer: 2000,
            showConfirmButton: false
          });
        } catch (err) {
          console.error("Gagal reset password:", err);
          const errorMessage = err?.response?.data?.error || err?.message || 'Gagal mereset password.';
          Swal.fire('Gagal!', errorMessage, 'error');
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
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Tidak ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u.id_user}
                    className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-[#eaf4ff]`}
                  >
                    <td className="px-6 py-4 border border-slate-200 text-center font-semibold text-slate-800">{idx + 1}.</td>
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
            {!showDeleted ? (
              <>
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
                  const superAdminRoles = ['waket1', 'waket2', 'tpm', 'superadmin'];
                  const currentUserRole = authUser?.role?.toLowerCase();
                  const isCurrentUserSuperAdmin = superAdminRoles.includes(currentUserRole);

                  if (isCurrentUserSuperAdmin) {
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
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(currentUser.id_user);
                    setOpenDropdownId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                  aria-label="Pulihkan akun"
                >
                  <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                  <span>Pulihkan</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHardDelete(currentUser.id_user);
                    setOpenDropdownId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left"
                  aria-label="Hapus permanen"
                >
                  <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                  <span>Hapus Permanen</span>
                </button>
              </>
            )}
          </div>
        );
      })()}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpenFormPegawaiDropdown(false);
              setShowForm(false);
              setEditMode(false);
              resetForm();
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 border border-slate-100 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">
                {editMode ? 'Edit' : 'Tambah'} Akun Pengguna
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                {editMode ? 'Perbarui informasi akun pengguna' : 'Buat akun pengguna baru untuk sistem penjaminan mutu'}.
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
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
                    Pegawai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative form-pegawai-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenFormPegawaiDropdown(!openFormPegawaiDropdown);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formData.id_pegawai
                        ? 'border-[#0384d6] bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih pegawai"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${formData.id_pegawai ? 'text-gray-900' : 'text-gray-500'}`}>
                          {formData.id_pegawai
                            ? (() => {
                              const found = allPegawai.find(p => String(p.id_pegawai) === String(formData.id_pegawai));
                              return found ? found.nama_lengkap : formData.id_pegawai;
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
                        {allPegawai.length > 0 ? (
                          allPegawai.map(p => (
                            <button
                              key={p.id_pegawai}
                              type="button"
                              onClick={() => {
                                // [UPDATE] Show available units for selection
                                const selectedPegawai = p;
                                const newFormData = {
                                  ...formData,
                                  id_pegawai: selectedPegawai.id_pegawai
                                };

                                // If pegawai has multiple units, don't auto-fill - let user choose
                                // If pegawai has only one unit, auto-fill
                                if (selectedPegawai.units && selectedPegawai.units.length > 0) {
                                  // Has units from pegawai_unit table
                                  if (selectedPegawai.units.length === 1) {
                                    // Only one unit, auto-fill
                                    const unit = selectedPegawai.units[0];
                                    newFormData.id_unit = String(unit.id_unit);
                                    const foundUnit = units.find(u => String(u.id_unit) === String(unit.id_unit));
                                    if (foundUnit?.kode_role) {
                                      newFormData.role = foundUnit.kode_role;
                                    }
                                  }
                                  // Multiple units - user will select from dropdown below
                                } else if (selectedPegawai.id_unit) {
                                  // Fallback to primary unit
                                  newFormData.id_unit = String(selectedPegawai.id_unit);
                                  const foundUnit = units.find(u => String(u.id_unit) === String(selectedPegawai.id_unit));
                                  if (foundUnit?.kode_role) {
                                    newFormData.role = foundUnit.kode_role;
                                  }
                                }

                                setFormData(newFormData);
                                setOpenFormPegawaiDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formData.id_pegawai === String(p.id_pegawai)
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{p.nama_lengkap}</div>
                                {p.nip && (
                                  <div className="text-sm text-gray-500 truncate">{p.nip}</div>
                                )}
                              </div>
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
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      💡 <strong>Info:</strong> Jika pegawai ini bekerja di beberapa unit kerja (melalui tabel pegawai_unit),
                      Anda dapat membuat akun terpisah untuk setiap unit dengan username yang berbeda.
                      Setiap akun akan memiliki role sesuai dengan unit kerjanya.
                    </p>
                    <p className="text-xs text-blue-600 mt-1.5">
                      <strong>Contoh:</strong> <code className="bg-blue-100 px-1.5 py-0.5 rounded">rachman.tpm</code>,
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded ml-1">rachman.ketua</code>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit Kerja <span className="text-red-500">*</span>
                    {formData.id_pegawai && (() => {
                      const selectedPegawai = allPegawai.find(p => String(p.id_pegawai) === String(formData.id_pegawai));
                      if (selectedPegawai?.units && selectedPegawai.units.length > 1) {
                        return <span className="text-xs text-amber-600 ml-2">(Pilih salah satu unit)</span>;
                      }
                      return <span className="text-xs text-gray-500 font-normal">(Otomatis dari Pegawai)</span>;
                    })()}
                  </label>
                  <div className="relative">
                    {formData.id_pegawai && (() => {
                      const selectedPegawai = allPegawai.find(p => String(p.id_pegawai) === String(formData.id_pegawai));
                      const availableUnits = selectedPegawai?.units && selectedPegawai.units.length > 0
                        ? selectedPegawai.units
                        : (selectedPegawai?.id_unit ? [{ id_unit: selectedPegawai.id_unit, nama_unit: selectedPegawai.nama_unit }] : []);

                      // If multiple units, show dropdown
                      if (availableUnits.length > 1) {
                        return (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenFormUnitDropdown(!openFormUnitDropdown);
                              }}
                              className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${formData.id_unit
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
                                      const found = availableUnits.find(u => String(u.id_unit) === String(formData.id_unit));
                                      return found ? found.nama_unit : formData.id_unit;
                                    })()
                                    : '-- Pilih Unit Kerja --'}
                                </span>
                              </div>
                              <FiChevronDown
                                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFormUnitDropdown ? 'rotate-180' : ''
                                  }`}
                                size={18}
                              />
                            </button>
                            {openFormUnitDropdown && (
                              <div
                                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-unit-dropdown-menu mt-1 w-full"
                              >
                                {availableUnits.map(unit => (
                                  <button
                                    key={unit.id_unit}
                                    type="button"
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        id_unit: String(unit.id_unit),
                                        role: (() => {
                                          const foundUnit = units.find(u => String(u.id_unit) === String(unit.id_unit));
                                          return foundUnit?.kode_role || formData.role;
                                        })()
                                      });
                                      setOpenFormUnitDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${formData.id_unit === String(unit.id_unit)
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                      }`}
                                  >
                                    <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                                    <div className="flex-1">
                                      <div className="font-medium">{unit.nama_unit}</div>
                                      {unit.is_primary === 1 && <span className="text-xs text-yellow-600">★ Unit Utama</span>}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                            <p className="mt-1 text-xs text-amber-600">
                              Pegawai ini memiliki {availableUnits.length} unit kerja. Pilih unit untuk akun ini.
                            </p>
                          </>
                        );
                      }

                      // Single unit or no pegawai selected - show readonly
                      return (
                        <>
                          <div
                            className={`w-full px-4 py-3 border rounded-lg shadow-sm flex items-center justify-between transition-all duration-200 ${formData.id_unit
                              ? 'border-[#0384d6] bg-gray-50'
                              : 'border-gray-300 bg-gray-50'
                              } cursor-not-allowed opacity-75`}
                            aria-label="Unit kerja (otomatis dari pegawai)"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FiBriefcase className="text-gray-400 flex-shrink-0" size={18} />
                              <span className={`truncate ${formData.id_unit ? 'text-gray-700' : 'text-gray-400'}`}>
                                {formData.id_unit
                                  ? (() => {
                                    const found = units.find(u => String(u.id_unit) === String(formData.id_unit));
                                    return found ? found.nama_unit : formData.id_unit;
                                  })()
                                  : 'Pilih Pegawai terlebih dahulu'}
                              </span>
                            </div>
                            <FiBriefcase className="text-gray-400 flex-shrink-0" size={18} />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Unit kerja otomatis diambil dari data pegawai yang dipilih
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role <span className="text-xs text-gray-500 font-normal">(Otomatis dari Pegawai)</span>
                  </label>
                  <div className="relative form-role-dropdown-container">
                    <div
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm flex items-center justify-between transition-all duration-200 ${formData.role
                        ? 'border-[#0384d6] bg-gray-50'
                        : 'border-gray-300 bg-gray-50'
                        } cursor-not-allowed opacity-75`}
                      aria-label="Role (otomatis dari pegawai)"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiShield className="text-gray-400 flex-shrink-0" size={18} />
                        <span className={`truncate ${formData.role ? 'text-gray-700' : 'text-gray-400'}`}>
                          {formData.role || 'Pilih Pegawai terlebih dahulu'}
                        </span>
                      </div>
                      <FiShield className="text-gray-400 flex-shrink-0" size={18} />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Role akan otomatis terisi sesuai dengan unit kerja dari pegawai yang dipilih
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenFormPegawaiDropdown(false);
                      setShowForm(false);
                      setEditMode(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
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
        </div>
      )}
    </div>
  );
}
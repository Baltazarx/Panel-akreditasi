'use client';

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

export default function UserManagementPage() {
  const api = useApi();
  const { authUser } = useAuth();
  const loweredRole = authUser?.role?.toLowerCase();
  const isReadOnlyRole = loweredRole === "ketuastikom";
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [pegawaiQuery, setPegawaiQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "active", "inactive"

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
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
      let url = "/users";
      if (statusFilter !== "all") {
        url += `?status=${statusFilter}`;
      }
      const data = await api.get(url);
      setUsers(data);
    } catch (err) {
      console.error("Gagal ambil users:", err);
      // Notifikasi bisa ditambahkan di sini jika diperlukan
      Swal.fire('Gagal!', `Gagal memuat data pengguna: ${err.message}`, 'error');
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
  }, [statusFilter]); // Fetch ulang ketika filter berubah

  useEffect(() => {
    fetchUnits();
  }, []); // Fetch units sekali saat mount

  // Submit tambah/edit user
  const handleSubmit = async (e) => {
    if (isReadOnlyRole) return;
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/users/${formData.id_user}`, formData);
      } else {
        await api.post("/users", formData);
      }
      setShowForm(false);
      setEditMode(false);
      resetForm();
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Akun berhasil ${editMode ? 'diperbarui' : 'dibuat'}.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Gagal simpan user:", err);
      Swal.fire('Gagal!', `Gagal menyimpan akun: ${err.message}`, 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id_user: null,
      username: "",
      password: "",
      id_unit: "",
      id_pegawai: "",
      role: "PRODI",
    });
    setPegawaiQuery("");
    setPegawaiList([]);
  };

  // Edit user
  const handleEdit = (user) => {
    if (isReadOnlyRole) return;
    setFormData({
      id_user: user.id_user,
      username: user.username,
      password: "",
      id_unit: user.id_unit,
      id_pegawai: user.id_pegawai,
      role: user.role,
    });
    setPegawaiQuery(user.pegawai_name || "");
    setEditMode(true);
    setShowForm(true);
  };

  // Nonaktifkan user
  const handleDelete = (id) => {
    if (isReadOnlyRole) return;
    Swal.fire({
      title: 'Nonaktifkan Akun?',
      text: "Anda yakin ingin menonaktifkan akun ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, nonaktifkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${id}`);
          fetchUsers();
          Swal.fire('Berhasil!', 'Akun telah dinonaktifkan.', 'success');
        } catch (err) {
          console.error("Gagal nonaktifkan user:", err);
          Swal.fire('Gagal!', `Gagal menonaktifkan akun: ${err.message}`, 'error');
        }
      }
    });
  };

  // Restore user
  const handleRestore = (id) => {
    if (isReadOnlyRole) return;
    Swal.fire({
      title: 'Aktifkan Kembali Akun?',
      text: "Anda yakin ingin mengaktifkan kembali akun ini?",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, aktifkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/users/${id}/restore`, {});
          fetchUsers();
          Swal.fire('Berhasil!', 'Akun telah diaktifkan kembali.', 'success');
        } catch (err) {
          console.error("Gagal restore user:", err);
          Swal.fire('Gagal!', `Gagal mengaktifkan akun: ${err.message}`, 'error');
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
          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
            >
              <option value="all">Semua Akun</option>
              <option value="active">Akun Aktif</option>
              <option value="inactive">Akun Nonaktif</option>
            </select>
          </div>
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

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">ID</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Username</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Role</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pegawai</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Status</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u, idx) => (
              <tr
                key={u.id_user}
                className={`transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-[#eaf4ff]`}
              >
                <td className="px-6 py-4 border border-slate-200 text-center font-semibold text-slate-700">{u.id_user}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.username}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.role}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.unit_name || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-center text-slate-700">{u.pegawai_name || "-"}</td>
                <td className="px-6 py-4 border border-slate-200 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      !u.is_active || u.deleted_at
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {!u.is_active || u.deleted_at ? "Nonaktif" : "Aktif"}
                  </span>
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {!isReadOnlyRole && openDropdownId !== null && (() => {
        const currentUser = users.find(u => u.id_user === openDropdownId);
        if (!currentUser) return null;

        const isDeleted = currentUser.deleted_at || !currentUser.is_active;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!isDeleted && (
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
            )}
            {!isDeleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentUser.id_user);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label="Nonaktifkan akun"
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Nonaktifkan</span>
              </button>
            )}
            {isDeleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(currentUser.id_user);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label="Aktifkan akun"
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Aktifkan</span>
              </button>
            )}
            {isDeleted && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHardDelete(currentUser.id_user);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label="Hapus permanen akun"
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 border border-slate-100">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={editMode ? "(biarkan kosong jika tidak diubah)" : "Masukkan password"}
                  {...(editMode ? {} : { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Kerja
                </label>
                <select
                  value={formData.id_unit}
                  onChange={(e) =>
                    setFormData({ ...formData, id_unit: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  required
                >
                  <option value="">-- Pilih Unit Kerja --</option>
                  {units.map((u) => (
                    <option key={u.id_unit} value={u.id_unit}>
                      {u.nama_unit}
                    </option>
                  ))}
                </select>
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
                        <div className="text-sm text-slate-500">{p.nip || 'NIP tidak tersedia'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                >
                  <option value="PRODI">PRODI</option>
                  <option value="LPPM">LPPM</option>
                  <option value="ALA">ALA</option>
                  <option value="PMB">PMB</option>
                  <option value="KEMAHASISWAAN">KEMAHASISWAAN</option>
                  <option value="KEPEGAWAIAN">KEPEGAWAIAN</option>
                  <option value="KERJASAMA">KERJASAMA</option>
                  <option value="SARPRAS">SARPRAS</option>
                  <option value="KETUASTIKOM">KETUASTIKOM</option>
                  <option value="WAKET-1">WAKET-1</option>
                  <option value="WAKET-2">WAKET-2</option>
                  <option value="TPM">TPM</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditMode(false);
                  }}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white shadow-md transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
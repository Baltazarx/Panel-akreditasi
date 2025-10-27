'use client';

import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";
import Swal from 'sweetalert2'; // Penambahan notifikasi

export default function UserManagementPage() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [pegawaiQuery, setPegawaiQuery] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
      const data = await api.get("/users");
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
    fetchUnits();
  }, []);

  // Submit tambah/edit user
  const handleSubmit = async (e) => {
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
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">👤 Manajemen Akun</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola akun pengguna sistem penjaminan mutu.
        </p>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Total Akun:</span>
          <span className="px-2 py-1 bg-[#0384d6] text-white text-xs font-semibold rounded-full">
            {users.length}
          </span>
        </div>
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
                      u.deleted_at
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.deleted_at ? "Nonaktif" : "Aktif"}
                  </span>
                </td>
                <td className="px-6 py-4 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-[#0384d6] hover:underline text-sm font-medium"
                    >
                      Edit
                    </button>
                    {u.deleted_at ? (
                      <>
                        <button
                          onClick={() => handleRestore(u.id_user)}
                          className="text-green-600 hover:underline text-sm font-medium"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleHardDelete(u.id_user)}
                          className="text-red-700 hover:underline text-sm font-medium"
                        >
                          Hapus Permanen
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleDelete(u.id_user)}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
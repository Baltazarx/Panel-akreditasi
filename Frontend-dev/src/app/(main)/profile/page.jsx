// src/app/profile/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { FiCamera, FiUser, FiMail, FiShield, FiLock, FiKey, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../../../lib/api";
import Swal from "sweetalert2";

// An icon for the upload button for a better UX
const CameraIcon = () => (
  <FiCamera className="mr-2" size={18} />
);

export default function ProfilePage() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  // State for photo update (no change)
  const [profilePic, setProfilePic] = useState(null);
  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Logic for redirection and setting initial profile picture (no change)
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }
    if (authUser?.avatar) {
      setProfilePic(authUser.avatar);
    }
  }, [authUser, isLoading, router]);

  // Avatar berbasis role (default otomatis jika belum ada foto)
  const roleAvatarUrl = authUser?.role
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.role)}&background=0384d6&color=fff&bold=true&rounded=true&size=128`
    : null;

  // Photo upload handler (no change)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
      toast.success("Profile picture updated!");
      // TODO: Send to backend (API for photo upload)
    }
  };

  // Password change handler dengan konfirmasi
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validasi input
    if (!currentPassword) {
      toast.error("Kata sandi saat ini wajib diisi!");
      return;
    }
    
    if (!newPassword) {
      toast.error("Kata sandi baru wajib diisi!");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Kata sandi baru dan konfirmasi tidak cocok!");
      return;
    }
    
    if (currentPassword === newPassword) {
      toast.error("Kata sandi baru harus berbeda dengan kata sandi saat ini!");
      return;
    }

    // Konfirmasi sebelum mengubah password
    const result = await Swal.fire({
      title: 'Ubah Kata Sandi?',
      html: `
        <p class="text-sm text-gray-600 mb-3">Anda yakin ingin mengubah kata sandi akun Anda?</p>
        <p class="text-xs text-gray-500">Pastikan Anda mengingat kata sandi baru Anda.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0384d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, Ubah Kata Sandi',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Panggil API change password
      await apiFetch('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Tampilkan success message
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kata sandi Anda berhasil diubah.',
        timer: 2000,
        showConfirmButton: false
      });

      toast.success("Kata sandi berhasil diubah!");
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Tampilkan error message yang lebih informatif
      const errorMessage = error?.response?.error || error?.message || "Gagal mengubah kata sandi. Silakan coba lagi.";
      
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Mengubah Kata Sandi',
        text: errorMessage,
        confirmButtonColor: '#0384d6'
      });
      
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Improved loading state
  if (isLoading || !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f9ff] via-white to-white">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
          <span className="text-slate-600 font-medium">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* -- Modern Page Header -- */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-[#0384d6] to-[#043975] rounded-xl shadow-lg">
              <FiUser className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
              <p className="text-slate-500 mt-1">Kelola informasi akun dan keamanan Anda</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* -- Left Column: User Info & Photo Card -- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-[#043975] to-[#0384d6] p-6 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0384d6] to-[#043975] rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src={profilePic || roleAvatarUrl || "https://via.placeholder.com/150"}
                      alt={authUser?.role ? `Avatar ${authUser.role}` : "Profile"}
                      className="relative w-32 h-32 rounded-full object-cover ring-4 ring-white/50 shadow-xl"
                    />
                    <div className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg">
                      <FiCamera className="text-[#0384d6]" size={16} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {authUser.name}
                  </h2>
                  <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                    <FiMail size={14} />
                    <span>{authUser.email}</span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-gradient-to-br from-[#0384d6] to-[#043975] rounded-lg">
                    <FiShield className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Role</p>
                    <p className="text-sm font-semibold text-slate-800 capitalize">{authUser.role}</p>
                  </div>
                </div>

                <label className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0384d6] to-[#043975] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]">
                  <CameraIcon />
                  <span>Ubah Foto Profil</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* -- Right Column: Change Password Form -- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-[#043975] to-[#0384d6] p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FiLock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Ubah Kata Sandi</h3>
                    <p className="text-white/80 text-sm mt-1">Perbarui kata sandi Anda untuk menjaga keamanan akun</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FiKey className="text-[#0384d6]" size={16} />
                      Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-all"
                        placeholder="Masukkan kata sandi saat ini"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0384d6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] rounded-lg p-1.5"
                        aria-label={showCurrentPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FiLock className="text-[#0384d6]" size={16} />
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-all"
                        placeholder="Masukkan kata sandi baru"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0384d6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] rounded-lg p-1.5"
                        aria-label={showNewPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FiCheck className="text-[#0384d6]" size={16} />
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border-2 border-slate-200 rounded-xl p-3.5 pr-12 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-all"
                        placeholder="Konfirmasi kata sandi baru"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0384d6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] rounded-lg p-1.5"
                        aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="px-6 py-3 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="relative px-6 py-3 bg-gradient-to-r from-[#0384d6] to-[#043975] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0384d6] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg"
                  >
                    {isChangingPassword ? (
                      <span className="relative z-10 flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Mengubah...</span>
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center gap-2">
                          <FiLock size={16} />
                          Perbarui Kata Sandi
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
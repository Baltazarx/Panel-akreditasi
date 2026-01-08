"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import {
  FiUser, FiMail, FiShield, FiLock, FiKey, FiCheck, FiEye, FiEyeOff, FiSettings
} from "react-icons/fi";
import { apiFetch } from "../../../lib/api";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  // State for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  // Logic for redirection
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, isLoading, router]);



  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) { toast.error("Kata sandi saat ini wajib diisi!"); return; }
    if (!newPassword) { toast.error("Kata sandi baru wajib diisi!"); return; }
    if (newPassword.length < 6) { toast.error("Kata sandi baru minimal 6 karakter!"); return; }
    if (newPassword !== confirmPassword) { toast.error("Kata sandi baru dan konfirmasi tidak cocok!"); return; }
    if (currentPassword === newPassword) { toast.error("Kata sandi baru harus berbeda!"); return; }

    const result = await Swal.fire({
      title: 'Ubah Kata Sandi?',
      text: "Pastikan Anda mengingat kata sandi baru Anda.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb', // blue-600
      cancelButtonColor: '#94a3b8',  // slate-400
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-xl px-6 py-2.5 font-medium',
        cancelButton: 'rounded-xl px-6 py-2.5 font-medium'
      }
    });

    if (!result.isConfirmed) return;

    setIsChangingPassword(true);

    try {
      await apiFetch('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Kata sandi Anda berhasil diubah.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-2xl' }
      });

    } catch (error) {
      console.error("Error changing password:", error);
      let errorMessage = "Gagal mengubah kata sandi.";
      // Simple error parsing
      if (error?.response) {
        try {
          const parsed = typeof error.response === 'string' ? JSON.parse(error.response) : error.response;
          errorMessage = parsed.error || parsed.message || errorMessage;
        } catch (e) { errorMessage = String(error.response); }
      }
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading || !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-500 font-medium text-sm">Memuat profil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#334155',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            fontSize: '14px'
          }
        }}
      />

      <main className="max-w-6xl mx-auto p-6 md:p-8">

        {/* -- Page Header -- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Profil</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola informasi akun dan keamanan Anda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* -- Left Column: User Card (4 cols) -- */}
          <div className="lg:col-span-4 flex flex-col">

            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 flex flex-col items-center text-center flex-1 justify-center">
                <div className="h-24 w-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-4 ring-white shadow-sm border border-blue-100">
                  <FiUser size={40} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {authUser.name}
                </h2>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1 mb-4">
                  <FiMail size={14} />
                  <span>{authUser.email}</span>
                </div>

                <div className="px-4 py-1.5 bg-slate-100/80 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-wide border border-slate-200">
                  {authUser.role}
                </div>
              </div>

              <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Status Akun</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Aktif
                  </span>
                </div>
              </div>
            </div>


          </div>

          {/* -- Right Column: Security (8 cols) -- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Keamanan Akun</h3>
                  <p className="text-slate-500 text-sm mt-1">Perbarui kata sandi Anda secara berkala.</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiShield size={20} />
                </div>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-6">

                  {/* Current Password */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi Saat Ini</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <FiKey size={18} />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-all"
                      >
                        {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* New Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi Baru</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <FiLock size={18} />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-all"
                        >
                          {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="group">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Sandi Baru</label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                          <FiCheck size={18} />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-all"
                        >
                          {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <span>Simpan Perubahan</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
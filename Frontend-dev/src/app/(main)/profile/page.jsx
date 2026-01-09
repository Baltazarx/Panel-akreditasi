"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import {
  FiUser, FiMail, FiShield, FiLock, FiKey, FiCheck, FiEye, FiEyeOff, FiEdit2
} from "react-icons/fi";
import { apiFetch } from "../../../lib/api";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }
  }, [authUser, isLoading, router]);

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
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#94a3b8',
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-slate-500 font-medium text-sm">Memuat profil...</span>
        </div>
      </div>
    );
  }

  // --- Reusable Modern Input Component ---
  const ModernInput = ({ label, type, value, onChange, placeholder, icon: Icon, showToggle, onToggle, showPassword }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
          <Icon size={18} />
        </div>
        <input
          type={showToggle ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
          placeholder={placeholder}
          required
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <Toaster position="top-center" reverseOrder={false} />

      <main className="max-w-6xl mx-auto p-6 md:p-10 relative z-10">

        {/* -- Page Header -- */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Akun Saya</h1>
          <p className="text-slate-500 text-base mt-2">Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* -- Left Column: Profile Card (4 cols) -- */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 overflow-hidden h-full flex flex-col relative group">

              {/* Banner Area */}
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10"></div>
              </div>

              <div className="px-8 pb-8 flex flex-col items-center flex-1 relative">
                {/* Avatar Floating */}
                <div className="-mt-14 mb-5 relative">
                  <div className="h-28 w-28 rounded-full bg-white p-1.5 shadow-xl ring-1 ring-slate-100">
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 text-3xl font-bold ring-1 ring-indigo-100/50">
                      {authUser.name ? authUser.name.charAt(0).toUpperCase() : <FiUser />}
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full">
                  <h2 className="text-2xl font-bold text-slate-800 text-center leading-tight mb-1">
                    {authUser.name}
                  </h2>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
                    <FiMail size={14} className="text-indigo-500" />
                    {authUser.email}
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                          <FiShield size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Role</p>
                          <p className="text-sm font-bold text-slate-700 capitalize">{authUser.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                          <FiCheck size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                          <p className="text-sm font-bold text-slate-700">Aktif</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                  <p className="text-xs text-slate-400 font-medium">Bergabung sejak 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* -- Right Column: Security (8 cols) -- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FiLock className="text-indigo-500" />
                    Keamanan & Kata Sandi
                  </h3>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-md">
                    Demi keamanan akun Anda, kami sarankan untuk memperbarui kata sandi secara berkala.
                  </p>
                </div>
              </div>

              <div className="p-8 flex-1">
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-3xl">

                  <ModernInput
                    label="Kata Sandi Saat Ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama Anda"
                    icon={FiKey}
                    showToggle={true}
                    showPassword={showCurrentPassword}
                    onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <ModernInput
                      label="Kata Sandi Baru"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      icon={FiLock}
                      showToggle={true}
                      showPassword={showNewPassword}
                      onToggle={() => setShowNewPassword(!showNewPassword)}
                    />

                    <ModernInput
                      label="Konfirmasi Kata Sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      icon={FiCheck}
                      showToggle={true}
                      showPassword={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-8 flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
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
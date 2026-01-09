// src/app/login/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const { login, isLoading, error, authUser } = useAuth();
  const router = useRouter();
  const yearNow = new Date().getFullYear();

  useEffect(() => {
    // Jika user sudah login dan bukan dalam proses transisi, langsung arahkan
    if (!isLoading && authUser && !transitioning) {
      router.push("/");
    }
  }, [authUser, isLoading, transitioning, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      // Tampilkan animasi loading transisi sebelum menuju home
      setTransitioning(true);
      // Beri sedikit jeda agar animasi terlihat
      setTimeout(() => {
        router.push("/");
      }, 900);
    } catch (err) {
      console.error("Login gagal:", err.message);
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: err.message || 'Username atau password salah. Silakan coba lagi.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-gray-600">Memverifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Transition overlay setelah login berhasil */}
      {transitioning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-700"></div>
            <p className="text-slate-700 font-medium">Mengalihkan ke beranda...</p>
          </div>
        </div>
      )}
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 md:p-8 space-y-8 relative">
          {/* Logo Maskot di pojok kanan atas */}
          <div className="absolute top-4 right-4 z-10">
            <img
              src="/maskot.png"
              alt="Maskot STIKOM"
              className="h-12 w-12 md:h-14 md:w-14 object-contain drop-shadow-md"
            />
          </div>

          {/* Header - minimal style like reference */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Stikom Banyuwangi</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-800">Log in</h1>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-slate-400 group-focus-within:text-[#0384d6] transition-colors" />
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-400"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-slate-400 group-focus-within:text-[#0384d6] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm hover:border-slate-400"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#0384d6] transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => Swal.fire({
                  icon: 'info',
                  title: 'Lupa Password?',
                  html: 'Silakan hubungi <b>Waket 1</b>, <b>Waket 2</b>, atau <b>TPM</b> untuk mereset password Anda.',
                  confirmButtonText: 'Mengerti',
                  confirmButtonColor: '#0384d6'
                })}
                className="text-sm font-medium text-[#0384d6] hover:text-[#0270b8] transition-colors focus:outline-none focus:underline"
              >
                Lupa Password?
              </button>
            </div>


            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#043975] to-[#0384d6] hover:from-[#032a5a] hover:to-[#0270b8] disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Sistem Penjaminan Mutu Internal STIKOM PGRI Banyuwangi
            </p>
          </div>
        </div>
      </div >
    </div >
  );
}
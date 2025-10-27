// src/app/login/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const { login, isLoading, error, authUser } = useAuth();
  const router = useRouter();
  const [now, setNow] = useState(new Date());

  // Update waktu setiap detik untuk kartu di sebelah form
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const monthShorts = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const monthShort = monthShorts[now.getMonth()];
  const yearNow = now.getFullYear();
  const weekdayText = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const fullDateText = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeText = now.toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

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
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 md:p-8 space-y-8">
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
                <label className="block text-sm font-semibold text-slate-700">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] focus:outline-none transition-all duration-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-slate-50 rounded-r-xl transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#043975] to-[#0384d6] hover:from-[#032a5a] hover:to-[#0270b8] disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 shadow-lg"
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
      </div>

      {/* Right side minimalism card (reference) - tidak mengubah background */}
      <div className="relative hidden md:block ml-6">
        <div className="w-[260px] lg:w-[320px] rounded-[28px] bg-white/90 backdrop-blur-md shadow-2xl border border-white/30 overflow-hidden relative">
          {/* Global frosted strip to overlap header and body */}
          <div className="absolute top-4 bottom-4 left-4 right-1/2 rounded-[24px] z-20 bg-white/55 backdrop-blur-lg border border-white/40 shadow" />
          {/* Header Month */}
          <div className="p-6 relative z-30">
            <div className="text-4xl font-bold text-slate-800 leading-none">{monthShort}</div>
            <div className="text-2xl text-slate-400 -mt-1">{yearNow}</div>
          </div>

          {/* Body with blur panel and pink orb */}
          <div className="relative h-[300px] px-6">
            {/* Blue orb centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full z-10 bg-[radial-gradient(circle_at_30%_30%,#7ec9ff,#38a9e8,#0384d6_70%,transparent_82%)]"></div>

            {/* Small details */}
            <div className="absolute left-8 top-10 text-[11px] leading-4 text-slate-600 z-30">
              <p className="capitalize">{weekdayText}</p>
              <p>{fullDateText}</p>
              <p className="font-medium text-slate-700">{timeText} WIB</p>
            </div>

            {/* Bottom row */}
            <div className="absolute left-0 right-0 bottom-0 px-6 pb-5 flex items-center justify-between z-30">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600">CS</span>
                <span>Creative.style</span>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-[11px] px-4 py-2 shadow hover:bg-black">
                Click Here
                <span className="inline-block h-2 w-2 rounded-full bg-white"></span>
              </button>
            </div>
            {/* Top-right note */}
            <div className="absolute right-4 top-4 text-[11px] leading-4 text-slate-600 text-right z-30">
              <p>Minimalism style</p>
              <p>Typography</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { FaFolderOpen, FaInfoCircle } from "react-icons/fa";

// ============================================================
// TABEL 2B - PLACEHOLDER (Navigasi sudah dipindahkan ke Sidebar)
// ============================================================
export default function Tabel2B() {
  return (
    <div className="flex items-center justify-center min-h-[600px] p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaFolderOpen className="w-24 h-24 text-blue-400" />
              <FaInfoCircle className="w-8 h-8 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Tabel 2B - Pemetaan Kurikulum
          </h1>

          {/* Description */}
          <p className="text-slate-600 mb-8 leading-relaxed">
            Silakan pilih salah satu sub-menu <strong>Tabel 2B</strong> dari <strong>sidebar</strong> untuk mengelola:
          </p>

          {/* Menu List */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">📚</span>
                <span className="text-slate-700"><strong>2B.1 MK vs PL</strong> - Pemetaan Mata Kuliah vs Profil Lulusan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">🎯</span>
                <span className="text-slate-700"><strong>2B.2 CPL vs PL</strong> - Pemetaan CPL vs Profil Lulusan</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">🗺️</span>
                <span className="text-slate-700"><strong>2B.3 Peta CPL</strong> - Peta/Matrix CPL</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">🔗</span>
                <span className="text-slate-700"><strong>CPMK vs CPL</strong> - Pemetaan CPMK vs CPL</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">📋</span>
                <span className="text-slate-700"><strong>CPMK</strong> - Kelola Data CPMK</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">📖</span>
                <span className="text-slate-700"><strong>Mata Kuliah</strong> - Kelola Data Mata Kuliah</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">🎓</span>
                <span className="text-slate-700"><strong>CPL</strong> - Kelola Data CPL</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-0.5">👨‍🎓</span>
                <span className="text-slate-700"><strong>Profil Lulusan</strong> - Kelola Data Profil Lulusan</span>
              </li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>💡 Petunjuk:</strong> Expand folder <strong>"Tabel 2B"</strong> di sidebar kiri, lalu pilih salah satu sub-menu untuk mulai mengelola data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
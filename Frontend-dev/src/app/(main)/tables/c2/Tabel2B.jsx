"use client"; // Wajib ada di App Router

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMaps } from "../../../../hooks/useMaps"; // Path disesuaikan
import { useAuth } from "../../../../context/AuthContext"; // Import useAuth

// Impor semua komponen yang sudah dipecah dari folder 'components'
import Pemetaan2B1 from "../../../../components/tables/Tabel2B/Pemetaan2B1";
import Pemetaan2B2 from "../../../../components/tables/Tabel2B/Pemetaan2B2";
import Pemetaan2B3 from "../../../../components/tables/Tabel2B/Pemetaan2B3";
import PemetaanCpmkCpl from "../../../../components/tables/Tabel2B/PemetaanCpmkCpl";
import CpmkCRUD from "../../../../components/tables/Tabel2B/CpmkCRUD";
import CplCRUD from "../../../../components/tables/Tabel2B/CplCRUD";
import ProfilLulusanCRUD from "../../../../components/tables/Tabel2B/ProfilLulusanCRUD";
import MataKuliahCRUD from "../../../../components/tables/Tabel2B/MataKuliahCRUD";

// ============================================================
// TABEL 2B - PEMETAAN DAN CRUD KURIKULUM (CONTAINER)
// ============================================================
export default function Tabel2B({ role }) {
  const [activeTab, setActiveTab] = useState("pemetaan2b1");
  const { authUser } = useAuth(); // Gunakan useAuth untuk mendapatkan data user yang sebenarnya
  const { maps } = useMaps(authUser);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pastikan role adalah string
  const userRole = typeof role === 'string' ? role : role?.role || '';

  // Fungsi untuk memicu refresh
  const handleDataChange = () => setRefreshTrigger(prev => prev + 1);

  // Konfigurasi Tab
  const tabs = [
    { id: "pemetaan2b1", label: "2B.1 MK vs PL", icon: "📚" },
    { id: "pemetaan2b2", label: "2B.2 CPL vs PL", icon: "🎯" },
    { id: "pemetaan2b3", label: "2B.3 Peta CPL", icon: "🗺️" },
    { id: "pemetaanCpmkCpl", label: "CPMK vs CPL", icon: "🔗" },
    { id: "cpmk", label: "CPMK", icon: "📋" },
    { id: "mata_kuliah", label: "Mata Kuliah", icon: "📖" },
    { id: "cpl", label: "CPL", icon: "🎓" },
    { id: "profil_lulusan", label: "Profil Lulusan", icon: "👨‍🎓" }
  ];

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-slate-200">
        <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Tabel 2B - Pemetaan Kurikulum</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola pemetaan kurikulum, CPMK, CPL, Profil Lulusan, dan Mata Kuliah.
        </p>
      </header>

      {/* Navigasi Tab */}
      <div className="mb-6">
        <div className="w-full rounded-2xl shadow-md border px-3 sm:px-4 py-3 bg-gradient-to-br from-[#f5f9ff] via-white to-[#f5f9ff]">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Navigasi Tabel 2B</h3>
          </div>
          <div className="relative">
            <div className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-2 bg-white rounded-2xl p-2 relative">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="tab2b-active-pill"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"
                        />
                      </>
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${isActive ? "text-blue-700 font-semibold" : "text-gray-700"
                      }`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Konten Tab */}
      <div className="min-h-[400px] sm:min-h-[500px]">
        {activeTab === "pemetaan2b1" && <Pemetaan2B1 role={userRole} refreshTrigger={refreshTrigger} />}
        {activeTab === "pemetaan2b2" && <Pemetaan2B2 role={userRole} maps={maps} refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />}
        {activeTab === "pemetaan2b3" && <Pemetaan2B3 role={userRole} refreshTrigger={refreshTrigger} />}
        {activeTab === "pemetaanCpmkCpl" && <PemetaanCpmkCpl role={userRole} maps={maps} refreshTrigger={refreshTrigger} onDataChange={handleDataChange} />}
        {activeTab === "cpmk" && <CpmkCRUD role={userRole} maps={maps} onDataChange={handleDataChange} />}
        {activeTab === "cpl" && <CplCRUD role={userRole} maps={maps} onDataChange={handleDataChange} />}
        {activeTab === "profil_lulusan" && <ProfilLulusanCRUD role={userRole} maps={maps} onDataChange={handleDataChange} />}
        {activeTab === "mata_kuliah" && <MataKuliahCRUD role={userRole} maps={maps} onDataChange={handleDataChange} />}
      </div>
    </div>
  );
}
"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext"; // Sesuaikan path jika perlu
import { motion, AnimatePresence } from "framer-motion";
import { roleCan } from "../../../../lib/role"; // Sesuaikan path jika perlu

// Impor semua komponen tabel C1
import Tabel1A1 from "./Tabel1A1";
import Tabel1A2 from "./Tabel1A2";
import Tabel1A3 from "./Tabel1A3";
import Tabel1A4 from "./Tabel1A4";
import Tabel1A5 from "./Tabel1A5";
import Tabel1B from "./Tabel1B";
// TabelTendik hanya ada di Panel Admin sidebar, tidak di navigasi C1
// import TabelTendik from "./TabelTendik";
// Impor komponen TabelDosen dan TabelPegawai jika ada di level C1
// import TabelDosen from "./TabelDosen";
// import TabelPegawai from "./TabelPegawai";

// Definisikan SEMUA tabel yang mungkin ada di C1
const ALL_TABLES = [
  { key: "1a1", label: "Tabel 1A-1", Component: Tabel1A1, accessKey: "tabel_1a1" },
  { key: "1a2", label: "Tabel 1A-2", Component: Tabel1A2, accessKey: "tabel_1a2" },
  { key: "1a3", label: "Tabel 1A-3", Component: Tabel1A3, accessKey: "tabel_1a3" },
  { key: "1a4", label: "Tabel 1A-4", Component: Tabel1A4, accessKey: "tabel_1a4" }, // Pastikan accessKey cocok dengan roles.js
  { key: "1a5", label: "Tabel 1A-5", Component: Tabel1A5, accessKey: "tabel_1a5" },
  { key: "1b", label: "Tabel 1B", Component: Tabel1B, accessKey: "tabel_1b" }, // Pastikan accessKey cocok dengan roles.js
  // TabelTendik hanya ada di Panel Admin sidebar, tidak di navigasi C1
  // { key: "tendik", label: "Tenaga Kependidikan", Component: TabelTendik, accessKey: "tenaga_kependidikan" },
  // Jika Tabel Dosen & Pegawai ada di C1, tambahkan di sini
  // { key: "dosen", label: "Tabel Dosen", Component: TabelDosen, accessKey: "dosen" },
  // { key: "pegawai", label: "Tabel Pegawai", Component: TabelPegawai, accessKey: "pegawai" },
];

export default function C1WithTopNav({ lastC1Tab }) {
  const { authUser } = useAuth();
  const role = authUser?.role;

  // Filter tabel berdasarkan akses role ('R'ead)
  const tabs = useMemo(() => {
    console.log(`[c1.jsx] Filtering tabs for role: ${role}`);
    return ALL_TABLES.filter(table => {
      const canAccess = roleCan(role, table.accessKey, "r"); // Pakai lowercase 'r'
      console.log(`[c1.jsx] - Checking access for '${table.accessKey}': ${canAccess}`);
      return canAccess;
    });
  }, [role]);

  const [activeKey, setActiveKey] = useState(""); // Default kosong
  const initializedRef = useRef(false);

  // Efek untuk inisialisasi tab aktif (hanya sekali)
  useEffect(() => {
    if (initializedRef.current || typeof window === "undefined" || !tabs || tabs.length === 0) {
      return;
    }

    const url = new URL(window.location.href);
    const fromHash = (url.hash || "").replace("#tab=", "");
    const fromStore = localStorage.getItem("c1_active_tab") || localStorage.getItem("lastActiveC1Tab") || "";
    const fromProp = lastC1Tab || "";
    const candidate = fromHash || fromProp || fromStore;

    const available = tabs.map(t => t.key);
    const fallback = available[0] || ""; // Tab pertama yang TERFILTER
    const next = available.includes(candidate) ? candidate : fallback;

    console.log("C1 - Init active tab:", { fromHash, fromProp, fromStore, candidate, available, chosen: next });

    if (next) {
      setActiveKey(next);
    }
    initializedRef.current = true;
  }, [tabs, lastC1Tab]); // Bergantung pada tabs (hasil filter)

  // Efek untuk menyimpan tab aktif ke URL hash dan localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !activeKey || !initializedRef.current) return; // Jangan simpan sebelum inisialisasi

    const url = new URL(window.location.href);
    if (url.hash !== `#tab=${activeKey}`) {
      url.hash = `#tab=${activeKey}`;
      window.history.replaceState(null, "", url.toString());
      console.log(`C1 - Updated hash to: ${url.hash}`);
    }

    localStorage.setItem("c1_active_tab", activeKey);
    localStorage.setItem("lastActiveC1Tab", activeKey);
  }, [activeKey]);

  // Efek untuk menangani perubahan hash dari luar (misal, back button)
  useEffect(() => {
    if (typeof window === "undefined" || !tabs.length) return;

    const checkHash = () => {
      const url = new URL(window.location.href);
      const fromHash = (url.hash || "").replace("#tab=", "");
      if (fromHash && fromHash !== activeKey) {
        const available = tabs.map(t => t.key);
        if (available.includes(fromHash)) {
          console.log("C1 - Hash change detected, setting active key:", { fromHash });
          setActiveKey(fromHash);
        }
      }
    };

    // Check hash on mount (jika belum diinisialisasi, biarkan useEffect init yg bekerja)
    if (initializedRef.current) {
      checkHash();
    }

    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, [tabs, activeKey]); // Perlu activeKey agar tidak set ulang jika hash sama

  // === PERBAIKAN FINAL: Tentukan Komponen Aktif ===
  const ActiveComponent = useMemo(() => {
    // 1. Pastikan activeKey sudah terisi DAN ada di daftar tabs yang visible
    if (activeKey && tabs.some(t => t.key === activeKey)) {
      // 2. Cari komponen yang cocok
      return tabs.find(t => t.key === activeKey)?.Component;
    }
    // 3. JIKA TIDAK MEMENUHI SYARAT, return null. Jangan fallback apapun di sini.
    return null;
  }, [activeKey, tabs]);
  // ===============================================


  // Kondisi Loading/Inisialisasi Awal
  // Tampilkan loading JIKA:
  // 1. Belum diinisialisasi (initializedRef.current === false) DAN ada tabs yang mungkin muncul
  // 2. ATAU SUDAH inisialisasi TAPI activeKey belum valid (ActiveComponent masih null) DAN ada tabs yang mungkin muncul
  const isLoading = (!initializedRef.current && tabs.length > 0) || (initializedRef.current && !ActiveComponent && tabs.length > 0);


  // Jika tidak ada tab yang visible sama sekali untuk role ini
  if (tabs.length === 0 && role && initializedRef.current) { // Tambah initializedRef.current agar tdk flash
    return <div className="p-4 text-center text-slate-600">Tidak ada tabel C1 yang tersedia untuk peran Anda ({role}).</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top navigation (tabs) */}
      <div className="w-full rounded-2xl shadow-md px-3 sm:px-4 py-3 bg-white pt-2">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Budaya Mutu</h3>
        </div>
        <div className="relative">
          <div className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-2 bg-white rounded-2xl p-2 relative">
            {/* Render tombol HANYA untuk tab yang visible */}
            {tabs.map((t) => {
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="c1-tab-pill" // Pastikan layoutId unik untuk grup tab ini
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
                    }`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active table content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey || 'loading'} // Beri key unik
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* === PERBAIKAN FINAL: Render Komponen atau Loading === */}
          {isLoading ? (
            <div className="text-center py-10">Memuat tabel C1...</div>
          ) : ActiveComponent ? (
            <ActiveComponent role={role} />
          ) : (
            // Ini seharusnya jarang terjadi jika tabs.length > 0, tapi sebagai fallback
            <div className="text-center py-10 text-red-600">Tidak dapat menampilkan tabel yang dipilih.</div>
          )}
          {/* ================================================== */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
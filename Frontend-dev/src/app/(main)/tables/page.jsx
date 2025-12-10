"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";

// Ikon-ikon - Variasi icon untuk setiap menu
import { 
  FaBars, FaXmark, FaTable, FaGrip, FaUserGroup, 
  FaUserTie, FaGraduationCap, FaFlask, FaBook, 
  FaChartLine, FaShield, FaChalkboard
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Impor halaman C1, C2, C3, C4, C5, C6
import C1Page from "./c1/c1";
import C2Page from "./c2/c2";
import C3Page from "./c3/c3";
import C4Page from "./c4/c4";
import C5Page from "./c5/c5";
import C6Page from "./c6/c6";
import UserManagementPage from "../../../components/UserManagementPage";
import TabelDosen from "./c1/TabelDosen";
import TabelPegawai from "./c1/TabelPegawai";
import TabelTendik from "./c1/TabelTendik";

// Helper hook untuk mendeteksi ukuran layar
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => {
            setMatches(media.matches);
        };
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [matches, query]);

    return matches;
};


// Map menu ke komponen dengan icon yang bervariasi
const menuMap = {
  C1: { name: "C1", Component: C1Page, icon: FaUserTie, description: "Data Dosen dan Pegawai" },
  C2: { name: "C2", Component: C2Page, icon: FaGraduationCap, description: "Data Mahasiswa" },
  C3: { name: "C3", Component: C3Page, icon: FaFlask, description: "Penelitian dan Pengabdian" },
  C4: { name: "C4", Component: C4Page, icon: FaBook, description: "Pendidikan" },
  C5: { name: "C5", Component: C5Page, icon: FaUserGroup, description: "Kerjasama" },
  C6: { name: "C6", Component: C6Page, icon: FaChartLine, description: "Luaran dan Capaian" },
  ManajemenAkun: { name: "Manajemen Akun", Component: UserManagementPage, icon: FaShield, description: "Kelola Pengguna Sistem" },
  TabelDosen: { name: "Tabel Dosen", Component: TabelDosen, icon: FaChalkboard, description: "Data Dosen" },
  TabelPegawai: { name: "Data Pegawai", Component: TabelPegawai, icon: FaUserTie, description: "Data Pegawai" },
  TabelTendik: { name: "Tenaga Kependidikan", Component: TabelTendik, icon: FaUserGroup, description: "Data Tenaga Kependidikan" },
};

// Tooltip component
const Tooltip = ({ children, text, isVisible }) => {
  if (!isVisible) return children;
  
  return (
    <div className="relative group pointer-events-auto">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
        {text}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    </div>
  );
};

const MobileExpandingMenu = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, canSeeUserMgmt, authUser }) => {
    const menuVariants = {
        open: {
            height: "auto",
            transition: { type: "spring", stiffness: 150, damping: 25 },
        },
        closed: {
            height: "56px",
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
    };

    // Define loweredRole for use in admin items filtering
    const loweredRole = (authUser?.role || "").toLowerCase();

    // Filter admin items berdasarkan akses
    const adminItemsList = [];
    if (canSeeUserMgmt) {
      // ManajemenAkun hanya untuk role yang memiliki akses ke "users"
      if (roleCan(authUser?.role, "users", "r") || ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)) {
        adminItemsList.push('ManajemenAkun');
      }
      // Role kepegawaian hanya melihat TabelTendik, bukan TabelDosen dan TabelPegawai
      if (loweredRole !== "kepegawaian") {
        if (roleCan(authUser?.role, "dosen", "r")) adminItemsList.push('TabelDosen');
        if (roleCan(authUser?.role, "pegawai", "r")) adminItemsList.push('TabelPegawai');
      }
      if (roleCan(authUser?.role, "tenaga_kependidikan", "r")) adminItemsList.push('TabelTendik');
    }
    const adminItems = adminItemsList;

    return (
        <motion.div
            variants={menuVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            className="bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden"
        >
            <div 
                className="flex items-center justify-between p-4 flex-shrink-0 cursor-pointer h-14" 
                onClick={() => setIsOpen(!isOpen)}
                role="button"
                aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                aria-expanded={isOpen}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                  }
                }}
            >
                <div className="flex items-center gap-3">
                    <FaGrip className="h-6 w-6 text-[#043975]" />
                    <span className="font-bold text-[#043975]">Menu Navigasi</span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 135 : 0 }} transition={{ duration: 0.3 }}>
                    <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                    </svg>
                </motion.div>
            </div>

            <div className="overflow-hidden flex-1 flex flex-col">
                <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.1 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        className="flex-1 flex flex-col"
                    >
                        <nav className="flex-1 px-2 py-4 space-y-8 overflow-y-auto" role="navigation" aria-label="Menu navigasi tabel">
                            <div>
                                <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">List Tabel</h3>
                                <ul className="space-y-1.5">
                                    {sidebarItems.map((key, index) => {
                                        const menuItem = menuMap[key];
                                        if (!menuItem) {
                                          console.warn(`Menu item not found for key: ${key}`);
                                          return null;
                                        }
                                        const { name, icon: Icon, description } = menuItem;
                                        const isActive = activeTable === key;
                                        return (
                                            <li key={key}>
                                            <button 
                                                onClick={() => {
                                                    updateActiveTable(key);
                                                    setIsOpen(false);
                                                }} 
                                                className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-150 relative group ${
                                                  isActive 
                                                        ? "bg-[#0384d6] text-white"
                                                    : "text-[#043975] hover:bg-[#eaf3ff]"
                                                }`}
                                                aria-label={`${name} - ${description}`}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                {/* Active indicator */}
                                                {isActive && (
                                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                                )}
                                                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                                                <span className="truncate flex-1 text-left">{name}</span>
                                            </button>
                                            </li>
                                        );
                                      })}
                                </ul>
                            </div>
                            {canSeeUserMgmt && adminItems.length > 0 && (
                              <div>
                                <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Panel Admin</h3>
                                <ul className="space-y-1.5">
                                  {adminItems.map((key, index) => {
                                    const menuItem = menuMap[key];
                                    if (!menuItem) {
                                      console.warn(`Menu item not found for key: ${key}`);
                                      return null;
                                    }
                                    const { name, icon: Icon, description } = menuItem;
                                    const isActive = activeTable === key;
                                    return (
                                      <li key={key}>
                                        <button 
                                          onClick={()=>{
                                            updateActiveTable(key); 
                                            setIsOpen(false);
                                          }} 
                                                className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-150 relative group ${
                                            isActive 
                                                        ? "bg-[#0384d6] text-white"
                                                        : "text-[#043975] hover:bg-[#eaf3ff]"
                                          }`}
                                          aria-label={`${name} - ${description}`}
                                          aria-current={isActive ? 'page' : undefined}
                                        >
                                          {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                          )}
                                          <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                                          <span className="truncate flex-1 text-left">{name}</span>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                        </nav>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const ExpandingSidebar = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, canSeeUserMgmt, contentHeight, authUser }) => {
    // Calculate sidebar height: follow content height if it's longer than viewport, otherwise use viewport
    const sidebarHeight = React.useMemo(() => {
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
        // Use contentHeight if it exists and is greater than viewport, otherwise use viewport
        if (contentHeight && contentHeight > 0 && contentHeight > viewportHeight) {
            return `${contentHeight}px`;
        }
        return "100vh";
    }, [contentHeight]);

    const sidebarVariants = React.useMemo(() => ({
    open: { 
      width: "288px", 
            height: sidebarHeight,
            minHeight: "100vh",
            borderRadius: "0",
      transition: { type: "spring", stiffness: 120, damping: 20 } 
    },
    closed: { 
            width: "4px",
            height: sidebarHeight,
            minHeight: "100vh",
            borderRadius: "0",
      transition: { type: "spring", stiffness: 300, damping: 30 } 
    },
    }), [sidebarHeight]);

  // Define loweredRole for use in admin items filtering
  const loweredRole = (authUser?.role || "").toLowerCase();

  // Filter admin items berdasarkan akses
  const adminItemsList = [];
  if (canSeeUserMgmt) {
    // ManajemenAkun hanya untuk role yang memiliki akses ke "users"
    if (roleCan(authUser?.role, "users", "r") || ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)) {
      adminItemsList.push('ManajemenAkun');
    }
    // Role kepegawaian hanya melihat TabelTendik, bukan TabelDosen dan TabelPegawai
    if (loweredRole !== "kepegawaian") {
      if (roleCan(authUser?.role, "dosen", "r")) adminItemsList.push('TabelDosen');
      if (roleCan(authUser?.role, "pegawai", "r")) adminItemsList.push('TabelPegawai');
    }
    if (roleCan(authUser?.role, "tenaga_kependidikan", "r")) adminItemsList.push('TabelTendik');
  }
  const adminItems = adminItemsList;

    // Sub-komponen untuk konten navigasi
  const SidebarContent = React.memo(({ activeTable, updateActiveTable, sidebarItems, adminItems }) => {
    return (
      <div className="flex flex-col min-h-full pt-16">
          <div className="flex items-center gap-3 px-5 pb-5 flex-shrink-0 border-b border-slate-200">
            <FaTable className="h-8 w-8 text-[#043975]" />
            <h2 className="font-bold text-[#043975] text-xl">Tabel</h2>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-8 overflow-y-auto" role="navigation" aria-label="Menu navigasi tabel">
              <div>
                <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">List Tabel</h3>
                <ul className="space-y-1.5">
                  {sidebarItems.map((key, index) => {
                      const menuItem = menuMap[key];
                      if (!menuItem) {
                        console.warn(`Menu item not found for key: ${key}`);
                        return null;
                      }
                      const { name, icon: Icon, description } = menuItem;
                      const isActive = activeTable === key;
                      return (
                        <li key={key}>
                          <button 
                            onClick={() => updateActiveTable(key)} 
                                        className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-150 relative group focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 ${
                              isActive 
                                                ? "bg-[#0384d6] text-white"
                                                : "text-[#043975] hover:bg-[#eaf3ff]"
                            }`}
                            aria-label={`${name} - ${description}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                            )}
                            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                            <span className="truncate flex-1 text-left">{name}</span>
                          </button>
                        </li>
                      );
                    })}
                </ul>
              </div>
              {canSeeUserMgmt && adminItems.length > 0 && (
                <div>
                  <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Panel Admin</h3>
                  <ul className="space-y-1.5">
                    {adminItems.map((key, index) => {
                      const menuItem = menuMap[key];
                      if (!menuItem) {
                        console.warn(`Menu item not found for key: ${key}`);
                        return null;
                      }
                      const { name, icon: Icon, description } = menuItem;
                      const isActive = activeTable === key;
                      return (
                        <li key={key}>
                          <button 
                            onClick={()=>updateActiveTable(key)} 
                                        className={`w-full flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-medium transition-colors duration-150 relative group focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 ${
                              isActive 
                                                ? "bg-[#0384d6] text-white"
                                                : "text-[#043975] hover:bg-[#eaf3ff]"
                            }`}
                            aria-label={`${name} - ${description}`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                                          {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                                          )}
                            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                            <span className="truncate flex-1 text-left">{name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
          </nav>
      </div>
    );
  });

  const toggleButton = (
        <motion.button
        onClick={() => setIsOpen(!isOpen)} 
            className="absolute z-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            style={{ zIndex: 10 }}
            animate={{
                top: 16,
                left: isOpen ? 256 : 0,
                padding: isOpen ? '0.5rem' : '0.5rem',
                backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.9)' : 'rgb(255, 255, 255)',
                borderRadius: isOpen ? '0.5rem' : '0 0.75rem 0.75rem 0',
                boxShadow: isOpen
                    ? '0 2px 8px 0 rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.1)'
                    : '0 2px 8px 0 rgba(0, 0, 0, 0.12), 0 1px 4px -1px rgba(0, 0, 0, 0.1)',
                width: isOpen ? '36px' : '32px',
                minWidth: isOpen ? '36px' : '32px',
                height: isOpen ? '36px' : '100px',
                minHeight: isOpen ? '36px' : '100px',
                border: isOpen ? '1px solid rgba(229, 231, 235, 0.8)' : '1px solid rgba(229, 231, 235, 0.6)',
            }}
            transition={isOpen
                ? { type: "spring", stiffness: 120, damping: 20 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            whileHover={isOpen ? {
                backgroundColor: 'rgb(255, 255, 255)',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                scale: 1.05
            } : {
                backgroundColor: 'rgb(249, 250, 251)',
                boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                scale: 1.02,
                borderColor: 'rgba(229, 231, 235, 0.9)'
            }}
            whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <motion.div
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center w-full h-full"
                >
                    <ChevronLeft size={20} className="text-[#043975]" />
          </motion.div>
        ) : (
                <motion.div
                    className="flex items-center justify-center w-full h-full"
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronRight size={22} className="text-[#043975]" />
                </motion.div>
            )}
        </motion.button>
  );

  return (
    <motion.aside 
      variants={sidebarVariants} 
      initial={false} 
      animate={isOpen ? "open" : "closed"} 
            className={`flex flex-col relative self-start ${
                isOpen
                    ? 'bg-white border-r border-gray-200 overflow-hidden ml-0 shadow-sm'
                    : 'bg-gray-200 overflow-visible ml-0'
            }`}
            style={isOpen ? { left: 0, top: 0, borderLeft: '1px solid #000' } : { left: 0, top: 0 }}
      role="complementary"
      aria-label="Sidebar navigasi tabel"
    >
      {toggleButton}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }} 
            exit={{ opacity: 0, transition: { duration: 0.1 } }} 
            className="flex flex-col min-h-full"
          >
            <SidebarContent 
              activeTable={activeTable} 
              updateActiveTable={updateActiveTable}
              sidebarItems={sidebarItems}
              adminItems={adminItems}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default function TablesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTable, setActiveTable] = useState(null); // Changed from 'C1' to null to prevent defaulting to C1
  const [lastC1TabFromStore, setLastC1TabFromStore] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const searchParams = useSearchParams();
  const { authUser } = useAuth();

  // Tentukan akses C1 berdasarkan minimal satu tabel di dalam C1 yang bisa dibaca
  // Mapping kunci sesuai dengan ACCESS_MATRIX (huruf kecil)
  // KECUALI role kemahasiswaan, ALA, PMB, dan SARPRAS yang tidak boleh akses C1
  const loweredRole = (authUser?.role || "").toLowerCase();
  const c1AccessKeys = ["dosen", "pegawai", "tabel_1a1", "tabel_1a2", "tabel_1a3", "tabel_1a4", "tabel_1a5", "tabel_1b", "beban_kerja_dosen", "tenaga_kependidikan"]; 
  const hasC1Access = loweredRole !== "kemahasiswaan" && loweredRole !== "ala" && loweredRole !== "pmb" && loweredRole !== "sarpras" && c1AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C2: jika ada akses ke tabel C2 (sesuaikan dengan ACCESS_MATRIX)
  const c2AccessKeys = [
    "tabel_2a1_pendaftaran",
    "tabel_2a2_keragaman_asal", 
    "tabel_2a3_kondisi_mahasiswa",
    "pemetaan2b1",
    "tabel_2b4_masa_tunggu",
    "tabel_2b5_kesesuaian_kerja",
    "tabel_2b6_kepuasan_pengguna"
  ]; // tabel-tabel yang ada di C2
  const hasC2Access = c2AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C3: jika ada akses ke tabel C3
  const c3AccessKeys = [
    "tabel_3a1_sarpras_penelitian",
    "tabel_3a2_penelitian",
    "tabel_3a3_pengembangan_dtpr",
    "tabel_3c1_kerjasama_penelitian",
    "tabel_3c2_publikasi_penelitian",
    "tabel_3c3_hki"
  ]; // tabel-tabel yang ada di C3
  const hasC3Access = c3AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C4: jika ada akses ke tabel C4
  const c4AccessKeys = [
    "tabel_4a1_sarpras_pkm",
    "tabel_4a2",
    "tabel_4a2_pkm",
    "tabel_4c1_kerjasama_pkm",
    "tabel_4c2_diseminasi_pkm",
    "tabel_4c3_hki_pkm"
  ]; // tabel-tabel yang ada di C4
  const hasC4Access = c4AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C5: jika ada akses ke tabel C5
  const c5AccessKeys = [
    "tabel_5a1",
    "tabel_5a2",
    "tabel_5_2_sarpras_pendidikan"
  ]; // tabel-tabel yang ada di C5
  const hasC5Access = c5AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C6: jika ada akses ke tabel C6
  const c6AccessKeys = [
    "tabel_6_kesesuaian_visi_misi"
  ]; // tabel-tabel yang ada di C6
  const hasC6Access = c6AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Panel Admin tampil jika role admin tertentu ATAU punya akses minimal ke dosen/pegawai/tenaga_kependidikan
  // KECUALI role kemahasiswaan, ALA, LPPM, dan SARPRAS yang tidak boleh akses Panel Admin
  // KEPEGAWAIAN diperbolehkan karena memiliki akses CRUD untuk dosen, pegawai, dan tenaga_kependidikan
  const canSeeUserMgmt = loweredRole !== "kemahasiswaan" && loweredRole !== "ala" && loweredRole !== "lppm" && loweredRole !== "sarpras" && (
    ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)
    || roleCan(authUser?.role, "dosen", "r")
    || roleCan(authUser?.role, "pegawai", "r")
    || roleCan(authUser?.role, "tenaga_kependidikan", "r")
  );

  // Susun item sidebar sesuai akses - Memoized untuk performance
  const sidebarItems = useMemo(() => [
    ...(hasC1Access ? ["C1"] : []),
    ...(hasC2Access ? ["C2"] : []),
    ...(hasC3Access ? ["C3"] : []),
    ...(hasC4Access ? ["C4"] : []),
    ...(hasC5Access ? ["C5"] : []),
    ...(hasC6Access ? ["C6"] : []),
  ], [hasC1Access, hasC2Access, hasC3Access, hasC4Access, hasC5Access, hasC6Access]);

  // Initialize component state after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize mobile detection with debounce
    let resizeTimer;
    const checkMobile = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth <= 1023);
      }, 150);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Initialize C1 tab from localStorage (if user has C1 access)
    const savedC1Tab = localStorage.getItem('c1_active_tab') || localStorage.getItem('lastActiveC1Tab') || '';
    setLastC1TabFromStore(savedC1Tab);
    
    // Don't set activeTable here - let the useEffect handle it based on access
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Handle URL params and sidebar items changes
  useEffect(() => {
    if (!mounted) return;
    
    const tableFromUrl = searchParams.get("table");
    const lastTable = localStorage.getItem("lastActiveTable");
    
    // Build admin keys based on access (same logic as adminItems)
    const adminKeysList = [];
    if (canSeeUserMgmt) {
      // ManajemenAkun hanya untuk role yang memiliki akses ke "users"
      if (roleCan(authUser?.role, "users", "r") || ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)) {
        adminKeysList.push('ManajemenAkun');
      }
      // Role kepegawaian hanya melihat TabelTendik, bukan TabelDosen dan TabelPegawai
      if (loweredRole !== "kepegawaian") {
        if (roleCan(authUser?.role, "dosen", "r")) adminKeysList.push('TabelDosen');
        if (roleCan(authUser?.role, "pegawai", "r")) adminKeysList.push('TabelPegawai');
      }
      if (roleCan(authUser?.role, "tenaga_kependidikan", "r")) adminKeysList.push('TabelTendik');
    }
    const adminKeys = adminKeysList;
    
    const allowed = new Set([...(sidebarItems || []), ...adminKeys]);
    
    // Determine candidate table - prioritize URL, then last saved, then first available
    const candidate = tableFromUrl || lastTable;
    const initial = candidate && allowed.has(candidate)
      ? candidate
      : (sidebarItems[0] || (adminKeys[0] || null));

    // Only update on initial mount or when URL/searchParams change
    // Don't reset activeTable if user is currently viewing a valid table (like TabelTendik)
    if (initial && initial !== activeTable) {
      // Check if current activeTable is still valid before changing
      const currentIsValid = activeTable && (allowed.has(activeTable) || menuMap[activeTable]);
      // Only change if:
      // 1. Current table is not valid, OR
      // 2. We have a URL param forcing the change, OR
      // 3. This is the initial mount (no activeTable set yet)
      if (!currentIsValid || tableFromUrl || !activeTable) {
        setActiveTable(initial);
      }
    } else if (!initial && activeTable) {
      // Only clear if current activeTable is not in allowed set AND not in menuMap
      const currentIsValid = activeTable && (allowed.has(activeTable) || menuMap[activeTable]);
      if (!currentIsValid) {
        setActiveTable(null);
      }
    }
  }, [searchParams, sidebarItems, mounted, canSeeUserMgmt, authUser?.role]);

  const updateActiveTable = useCallback((key) => {
    if (key === activeTable) return;
    setActiveTable(key);
    localStorage.setItem('lastActiveTable', key);
  }, [activeTable]);

  // Set sidebar state based on mobile detection
  useEffect(() => {
    if (mounted) {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile, mounted]);

  // Update C1 tab from store when active table changes
  useEffect(() => {
    if (mounted && activeTable === 'C1') {
      const val = localStorage.getItem('c1_active_tab') || localStorage.getItem('lastActiveC1Tab') || '';
      setLastC1TabFromStore(val);
    }
  }, [activeTable, mounted]);

  // Measure content height and update sidebar with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let resizeTimer;
    const measureContentHeight = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const contentElement = document.querySelector('.main-content-area');
        if (contentElement) {
          const height = contentElement.scrollHeight;
          setContentHeight(height);
        }
      }, 100);
    };

    // Initial measurement
    measureContentHeight();

    // Set up ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(() => {
      measureContentHeight();
    });

    const contentElement = document.querySelector('.main-content-area');
    if (contentElement) {
      resizeObserver.observe(contentElement);
    }

    // Also listen for window resize
    window.addEventListener('resize', measureContentHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureContentHeight);
      clearTimeout(resizeTimer);
    };
  }, [mounted, activeTable]);

  const { Component: ActiveComponent } = activeTable ? (menuMap[activeTable] || menuMap.C1) : { Component: () => null };

  const activeProps = useMemo(() => {
    if (activeTable === 'C1') {
      return { lastC1Tab: lastC1TabFromStore };
    }
    if (activeTable === 'TabelDosen' || activeTable === 'TabelPegawai' || activeTable === 'TabelTendik') {
      return { role: authUser?.role };
    }
    return {};
  }, [activeTable, lastC1TabFromStore, authUser?.role]);

  if (isMobile) {
    return (
      <>
        <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
          .mobile-viewport {
            min-height: 100vh;
            min-height: 100svh;
            min-height: 100dvh;
          }
          @media (max-width: 1023px) {
            .mobile-viewport {
              height: 100vh;
              height: 100svh;
              height: 100dvh;
            }
          }
        `}</style>
        <div className="mobile-viewport bg-gradient-to-br from-[#f5f9ff] via-white to-white overflow-x-hidden relative">
          {/* Background Pattern - Same as Hero */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(3, 132, 214, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(3, 132, 214, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}></div>
            
            {/* Frosted Glass Effect */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
            
            {/* Vertical Lines */}
            <div className="absolute inset-0">
              <div className="absolute left-1/4 top-0 w-px h-full bg-[#0384d6]/20"></div>
              <div className="absolute left-1/2 top-0 w-px h-full bg-[#0384d6]/20"></div>
              <div className="absolute left-3/4 top-0 w-px h-full bg-[#0384d6]/20"></div>
            </div>
          </div>
          <header className="p-4 relative z-10">
            <MobileExpandingMenu 
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
              activeTable={activeTable}
              updateActiveTable={updateActiveTable}
              sidebarItems={sidebarItems}
              canSeeUserMgmt={canSeeUserMgmt}
              authUser={authUser}
            />
          </header>
          <main className="px-4 pb-4 overflow-x-hidden relative z-10">
            {!mounted ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-400 flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975] mx-auto mb-2"></div>
                  <p>Memuat...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTable && ActiveComponent ? (
                  <motion.div
                    key={activeTable}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActiveComponent {...activeProps} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center text-slate-600"
                  >
                    <p>Memuat komponen...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-start min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white relative">
      {/* Background Pattern - Same as Hero */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(3, 132, 214, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(3, 132, 214, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Frosted Glass Effect */}
        <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
        
        {/* Vertical Lines */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 w-px h-full bg-[#0384d6]/20"></div>
          <div className="absolute left-1/2 top-0 w-px h-full bg-[#0384d6]/20"></div>
          <div className="absolute left-3/4 top-0 w-px h-full bg-[#0384d6]/20"></div>
        </div>
      </div>
      
      <ExpandingSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        activeTable={activeTable}
        updateActiveTable={updateActiveTable}
        sidebarItems={sidebarItems}
        canSeeUserMgmt={canSeeUserMgmt}
        contentHeight={contentHeight}
        authUser={authUser}
      />
      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10 ${!isSidebarOpen ? 'ml-8' : ''}`}>
        <main className="flex-1 overflow-x-hidden">
          <div className="px-4 pt-4 pb-6 main-content-area">
            {!mounted ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-400 flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975] mx-auto mb-2"></div>
                  <p>Memuat...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTable && ActiveComponent ? (
                  <motion.div
                    key={activeTable}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActiveComponent {...activeProps} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center text-slate-600"
                  >
                    <p>Memuat komponen...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

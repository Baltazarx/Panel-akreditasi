"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";

// Ikon-ikon
import { FaBars, FaXmark, FaTable, FaGrip, FaUserGroup } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

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

// Map menu ke komponen
const menuMap = {
  C1: { name: "C1", Component: C1Page, icon: FaTable },
  C2: { name: "C2", Component: C2Page, icon: FaTable },
  C3: { name: "C3", Component: C3Page, icon: FaTable },
  C4: { name: "C4", Component: C4Page, icon: FaTable },
  C5: { name: "C5", Component: C5Page, icon: FaTable },
  C6: { name: "C6", Component: C6Page, icon: FaTable },
  ManajemenAkun: { name: "Manajemen Akun", Component: UserManagementPage, icon: FaUserGroup },
  TabelDosen: { name: "Tabel Dosen", Component: TabelDosen, icon: FaUserGroup },
  TabelPegawai: { name: "Data Pegawai", Component: TabelPegawai, icon: FaUserGroup },
};

const MobileExpandingMenu = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, canSeeUserMgmt }) => {
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

    return (
        <motion.div
            variants={menuVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            className="bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden"
        >
            <div 
                className="flex items-center justify-between p-4 flex-shrink-0 cursor-pointer h-14" 
                onClick={() => setIsOpen(!isOpen)}
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
                        <nav className="flex-1 px-2 py-4 space-y-6">
                            <div>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">List Tabel</h3>
                                <ul className="space-y-1">
                                    {sidebarItems.map((key) => {
                                        const { name, icon: Icon } = menuMap[key];
                                        const isActive = activeTable === key;
                                        return (
                                            <li key={key}>
                                            <button 
                                                onClick={() => {
                                                    updateActiveTable(key);
                                                    setIsOpen(false);
                                                }} 
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#0384d6] text-white" : "text-[#043975] hover:bg-[#eaf3ff]"}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="truncate">{name}</span>
                                            </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            {canSeeUserMgmt && (
                              <div>
                                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Panel Admin</h3>
                                <ul className="space-y-1">
                                  {['ManajemenAkun','TabelDosen','TabelPegawai'].map((key)=>{
                                    const { name, icon: Icon } = menuMap[key];
                                    const isActive = activeTable === key;
                                    return (
                                      <li key={key}>
                                        <button onClick={()=>{updateActiveTable(key); setIsOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#0384d6] text-white" : "text-[#043975] hover:bg-[#eaf3ff]"}`}>
                                          <Icon className="h-5 w-5" />
                                          <span className="truncate">{name}</span>
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

const ExpandingSidebar = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, canSeeUserMgmt, contentHeight }) => {
  const sidebarVariants = {
    open: { 
      width: "288px", 
      height: contentHeight > 0 ? `${Math.max(contentHeight + 32, typeof window !== 'undefined' ? window.innerHeight - 32 : 800)}px` : "auto", 
      minHeight: "calc(100vh - 2rem)", 
      borderRadius: "16px", 
      transition: { type: "spring", stiffness: 120, damping: 20 } 
    },
    closed: { width: "56px", height: "56px", borderRadius: "100%", transition: { type: "spring", stiffness: 300, damping: 30 }, },
  };
  const SidebarContent = ({ activeTable, updateActiveTable }) => (
    <div className="flex flex-col min-h-full pt-16">
        <div className="flex items-center gap-3 px-4 pb-4 flex-shrink-0 border-b"><FaTable className="h-8 w-8 text-[#043975]" /><h2 className="font-bold text-[#043975] text-xl">Tabel</h2></div>
        <nav className="flex-1 px-2 py-4 space-y-6">
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">List Tabel</h3>
              <ul className="space-y-1">
                {sidebarItems.map((key) => {
                  const { name, icon: Icon } = menuMap[key];
                  const isActive = activeTable === key;
                  return (
                    <li key={key}>
                      <button onClick={() => updateActiveTable(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#0384d6] text-white" : "text-[#043975] hover:bg-[#eaf3ff]"}`} aria-current={isActive ? 'page' : undefined}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                        <span className="truncate">{name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            {canSeeUserMgmt && (
              <div>
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Panel Admin</h3>
                <ul className="space-y-1">
                  {['ManajemenAkun','TabelDosen','TabelPegawai'].map((key)=>{
                    const { name, icon: Icon } = menuMap[key];
                    const isActive = activeTable === key;
                    return (
                      <li key={key}>
                        <button onClick={()=>updateActiveTable(key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#0384d6] text-white" : "text-[#043975] hover:bg-[#eaf3ff]"}`} aria-current={isActive ? 'page' : undefined}>
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#043975]'}`} />
                          <span className="truncate">{name}</span>
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
  return (
    <motion.aside variants={sidebarVariants} initial={false} animate={isOpen ? "open" : "closed"} className="bg-white shadow-2xl flex flex-col overflow-hidden m-4 relative self-start">
      <button onClick={() => setIsOpen(!isOpen)} className={`absolute z-20 text-slate-500 hover:text-[#043975] transition-colors ${!isOpen ? 'w-full h-full top-0 left-0 flex items-center justify-center' : 'top-4 right-4'}`}>{isOpen ? <FaXmark size={20} /> : <FaBars size={20} />}</button>
      <AnimatePresence>{isOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.1 } }} className="flex flex-col min-h-full"><SidebarContent activeTable={activeTable} updateActiveTable={updateActiveTable} /></motion.div>)}</AnimatePresence>
    </motion.aside>
  );
};

export default function TablesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTable, setActiveTable] = useState('C1');
  const [lastC1TabFromStore, setLastC1TabFromStore] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const searchParams = useSearchParams();
  const { authUser } = useAuth();

  // Tentukan akses C1 berdasarkan minimal satu tabel di dalam C1 yang bisa dibaca
  // Mapping kunci sesuai dengan ACCESS_MATRIX (huruf kecil)
  // KECUALI role kemahasiswaan yang tidak boleh akses C1
  const loweredRole = (authUser?.role || "").toLowerCase();
  const c1AccessKeys = ["dosen", "pegawai", "tabel_1a1", "tabel_1a2", "tabel_1a3", "tabel_1a4", "tabel_1a5", "tabel_1b", "beban_kerja_dosen", "tendik"]; 
  const hasC1Access = loweredRole !== "kemahasiswaan" && c1AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

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
    "tabel_3a3_pengembangan_dtpr"
  ]; // tabel-tabel yang ada di C3
  const hasC3Access = c3AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C4: jika ada akses ke tabel C4
  const c4AccessKeys = [
    "tabel_4a1",
    "tabel_4a2"
  ]; // tabel-tabel yang ada di C4
  const hasC4Access = c4AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C5: jika ada akses ke tabel C5
  const c5AccessKeys = [
    "tabel_5a1",
    "tabel_5a2"
  ]; // tabel-tabel yang ada di C5
  const hasC5Access = c5AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Akses C6: jika ada akses ke tabel C6
  const c6AccessKeys = [
    "tabel_6a1",
    "tabel_6a2"
  ]; // tabel-tabel yang ada di C6
  const hasC6Access = c6AccessKeys.some((k) => roleCan(authUser?.role, k, "r"));

  // Panel Admin tampil jika role admin tertentu ATAU punya akses minimal ke dosen/pegawai
  // KECUALI role kemahasiswaan yang tidak boleh akses Panel Admin
  const canSeeUserMgmt = loweredRole !== "kemahasiswaan" && (
    ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)
    || roleCan(authUser?.role, "dosen", "r")
    || roleCan(authUser?.role, "pegawai", "r")
  );

  // Susun item sidebar sesuai akses
  const sidebarItems = [
    ...(hasC1Access ? ["C1"] : []),
    ...(hasC2Access ? ["C2"] : []),
    ...(hasC3Access ? ["C3"] : []),
    ...(hasC4Access ? ["C4"] : []),
    ...(hasC5Access ? ["C5"] : []),
    ...(hasC6Access ? ["C6"] : []),
    // Manajemen Akun dipindah ke panel admin, bukan list tabel utama
  ];

  // Initialize component state after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Initialize mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1023);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Initialize active table from localStorage
    const savedTable = localStorage.getItem('lastActiveTable') || 'C1';
    const savedC1Tab = localStorage.getItem('c1_active_tab') || localStorage.getItem('lastActiveC1Tab') || '';
    
    setActiveTable(savedTable);
    setLastC1TabFromStore(savedC1Tab);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle URL params and sidebar items changes
  useEffect(() => {
    if (!mounted) return;
    
    const tableFromUrl = searchParams.get("table");
    const lastTable = localStorage.getItem("lastActiveTable");
    const candidate = tableFromUrl || lastTable || "C1";
    const adminKeys = canSeeUserMgmt ? ["ManajemenAkun", "TabelDosen", "TabelPegawai"] : [];
    const allowed = new Set([...(sidebarItems || []), ...adminKeys]);
    const initial = allowed.has(candidate)
      ? candidate
      : (sidebarItems[0] || (adminKeys[0] || null));

    if (initial && initial !== activeTable) {
      setActiveTable(initial);
    }
  }, [searchParams, sidebarItems, mounted, canSeeUserMgmt]);

  const updateActiveTable = (key) => {
    setActiveTable(key);
    localStorage.setItem('lastActiveTable', key);
  };

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

  // Measure content height and update sidebar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const measureContentHeight = () => {
      const contentElement = document.querySelector('.main-content-area');
      if (contentElement) {
        const height = contentElement.scrollHeight;
        setContentHeight(height);
      }
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
    };
  }, [mounted, activeTable]);

  const { Component: ActiveComponent } = activeTable ? (menuMap[activeTable] || menuMap.C1) : { Component: () => null };

  const activeProps = (() => {
    if (activeTable === 'C1') {
      return { lastC1Tab: lastC1TabFromStore };
    }
    if (activeTable === 'TabelDosen' || activeTable === 'TabelPegawai') {
      return { role: authUser?.role };
    }
    return {};
  })();

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
              <motion.div
                key={activeTable}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {activeTable && (activeTable === 'C1' ? (
                  <ActiveComponent {...activeProps} key={`c1-${lastC1TabFromStore || 'none'}`} />
                ) : (
                  <ActiveComponent {...activeProps} />
                ))}
              </motion.div>
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
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden m-4 relative z-10">
        <main className="flex-1 overflow-x-hidden">
          <div className="px-4 pb-6 main-content-area">
            {!mounted ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-400 flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975] mx-auto mb-2"></div>
                  <p>Memuat...</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={activeTable}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {activeTable && (activeTable === 'C1' ? (
                  <ActiveComponent {...activeProps} key={`c1-${lastC1TabFromStore || 'none'}`} />
                ) : (
                  <ActiveComponent {...activeProps} />
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
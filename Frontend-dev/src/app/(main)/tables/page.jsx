"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";
import { useMaps } from "../../../hooks/useMaps";

// Ikon-ikon - Variasi icon untuk setiap menu
import {
  FaBars, FaXmark, FaTable, FaGrip, FaUserGroup,
  FaUserTie, FaGraduationCap, FaFlask, FaBook,
  FaChartLine, FaShield, FaChalkboard,
  FaFolder, FaFolderOpen, FaFile, FaDatabase
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronDown, Search } from "lucide-react";

// Impor halaman C1, C2, C3, C4, C5, C6
import C1Page from "./c1/c1";
// C2Page is no longer needed as main entry, we use sub-components directly
// import C2Page from "./c2/c2"; 
// import C3Page from "./c3/c3";
// import C4Page from "./c4/c4";
// import C5Page from "./c5/c5";
// import C6Page from "./c6/c6";
import UserManagementPage from "../../../components/UserManagementPage";

// Impor Komponen C1 secara langsung untuk Tree View
import Tabel1A1 from "./c1/Tabel1A1";
import Tabel1A2 from "./c1/Tabel1A2";
import Tabel1A3 from "./c1/Tabel1A3";
import Tabel1A4 from "./c1/Tabel1A4";
import Tabel1A5 from "./c1/Tabel1A5";
import Tabel1B from "./c1/Tabel1B";

// Impor Komponen C2 secara langsung untuk Tree View
import Tabel2A1 from "./c2/Tabel2A1";
import Tabel2A2 from "./c2/Tabel2A2";
import Tabel2A3 from "./c2/Tabel2A3";
import Tabel2B from "./c2/Tabel2B";
import Tabel2B4 from "./c2/Tabel2B4";
import Tabel2B5 from "./c2/Tabel2B5";
import Tabel2B6 from "./c2/Tabel2B6";
import Tabel2C from "./c2/Tabel2C";
import Tabel2D from "./c2/Tabel2D";

// Impor Komponen C3 secara langsung untuk Tree View
import Tabel3A1 from "./c3/Tabel3A1";
import Tabel3A2 from "./c3/Tabel3A2";
import Tabel3A3 from "./c3/Tabel3A3";
import Tabel3C1 from "./c3/Tabel3C1";
import Tabel3C2 from "./c3/Tabel3C2";
import Tabel3C3 from "./c3/Tabel3C3";

// Impor Komponen C4 secara langsung untuk Tree View
import Tabel4A1 from "./c4/Tabel4A1";
import Tabel4A2 from "./c4/Tabel4A2";
import Tabel4C1 from "./c4/Tabel4C1";
import Tabel4C2 from "./c4/Tabel4C2";
import Tabel4C3 from "./c4/Tabel4C3";

// Impor Komponen C5 secara langsung untuk Tree View
import Tabel51 from "./c5/Tabel51";
import Tabel52 from "./c5/Tabel52";

// Impor Komponen C6 secara langsung untuk Tree View
import Tabel6 from "./c6/Tabel6";

// Impor Komponen Sub-Tabel 2B
import Pemetaan2B1 from "../../../components/tables/Tabel2B/Pemetaan2B1";
import Pemetaan2B2 from "../../../components/tables/Tabel2B/Pemetaan2B2";
import Pemetaan2B3 from "../../../components/tables/Tabel2B/Pemetaan2B3";
import PemetaanCpmkCpl from "../../../components/tables/Tabel2B/PemetaanCpmkCpl";
import CpmkCRUD from "../../../components/tables/Tabel2B/CpmkCRUD";
import CplCRUD from "../../../components/tables/Tabel2B/CplCRUD";
import ProfilLulusanCRUD from "../../../components/tables/Tabel2B/ProfilLulusanCRUD";
import MataKuliahCRUD from "../../../components/tables/Tabel2B/MataKuliahCRUD";

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

// ==========================================
// DEFINISI STRUKTUR SIDEBAR (HIERARKIS)
// ==========================================
const sidebarStructure = [
  {
    key: "C1",
    name: "Budaya Mutu",
    icon: FaUserTie,
    description: "Data Dosen dan Pegawai",
    type: "folder",
    children: [
      { key: "tabel_1a1", name: "Tabel 1A-1", icon: FaFile, Component: Tabel1A1, accessKey: "tabel_1a1", description: "Audit Mutu Internal" },
      { key: "tabel_1a2", name: "Tabel 1A-2", icon: FaFile, Component: Tabel1A2, accessKey: "tabel_1a2", description: "Mekanisme Rapat Tinjauan Manajemen" },
      { key: "tabel_1a3", name: "Tabel 1A-3", icon: FaFile, Component: Tabel1A3, accessKey: "tabel_1a3", description: "Pelaksanaan Rapat Tinjauan Manajemen" },
      { key: "tabel_1a4", name: "Tabel 1A-4", icon: FaFile, Component: Tabel1A4, accessKey: "tabel_1a4", description: "Tindak Lanjut Rapat Tinjauan Manajemen" },
      { key: "tabel_1a5", name: "Tabel 1A-5", icon: FaFile, Component: Tabel1A5, accessKey: "tabel_1a5", description: "Kelengkapan Dokumen Rapat Tinjauan Manajemen" },
      { key: "tabel_1b", name: "Tabel 1B", icon: FaFile, Component: Tabel1B, accessKey: "tabel_1b", description: "Kerjasama Pendidikan, Penelitian, dan PkM" },
    ]
  },
  {
    key: "C2",
    name: "Relevansi Pendidikan",
    icon: FaGraduationCap,
    description: "Data Mahasiswa",
    type: "folder",
    children: [
      { key: "2a1", name: "Tabel 2A-1", icon: FaFile, Component: Tabel2A1, accessKey: "tabel_2a1_pendaftaran", description: "Seleksi Mahasiswa" },
      { key: "2a2", name: "Tabel 2A-2", icon: FaFile, Component: Tabel2A2, accessKey: "tabel_2a2_keragaman_asal", description: "Mahasiswa Asing" },
      { key: "2a3", name: "Tabel 2A-3", icon: FaFile, Component: Tabel2A3, accessKey: "tabel_2a3_kondisi_mahasiswa", description: "Kondisi Mahasiswa" },

      {
        key: "2b",
        name: "Tabel 2B",
        icon: FaFolder, // Changed to folder
        description: "Pemetaan Kurikulum",
        children: [
          { key: "pemetaan2b1", name: "2B.1 MK vs PL", icon: FaFile, Component: Pemetaan2B1, accessKey: "pemetaan2b1", description: "MK vs Profil Lulusan" },
          { key: "pemetaan2b2", name: "2B.2 CPL vs PL", icon: FaFile, Component: Pemetaan2B2, accessKey: "pemetaan2b2", description: "CPL vs Profil Lulusan" },
          { key: "pemetaan2b3", name: "2B.3 Peta CPL", icon: FaFile, Component: Pemetaan2B3, accessKey: "pemetaan2b3", description: "Peta Beban CPL" },
          { key: "pemetaanCpmkCpl", name: "CPMK vs CPL", icon: FaFile, Component: PemetaanCpmkCpl, accessKey: "pemetaanCpmkCpl", description: "Peta CPMK ke CPL" },
          { key: "cpmk", name: "CPMK", icon: FaFile, Component: CpmkCRUD, accessKey: "cpmk", description: "Data CPMK" },
          { key: "mata_kuliah", name: "Mata Kuliah", icon: FaFile, Component: MataKuliahCRUD, accessKey: "mata_kuliah", description: "Data Mata Kuliah" },
          { key: "cpl", name: "CPL", icon: FaFile, Component: CplCRUD, accessKey: "cpl", description: "Data CPL" },
          { key: "profil_lulusan", name: "Profil Lulusan", icon: FaFile, Component: ProfilLulusanCRUD, accessKey: "profil_lulusan", description: "Data Profil Lulusan" },
        ]
      },
      { key: "2b4", name: "Tabel 2B-4", icon: FaFile, Component: Tabel2B4, accessKey: "tabel_2b4_masa_tunggu", description: "Masa Tunggu" },
      { key: "2b5", name: "Tabel 2B-5", icon: FaFile, Component: Tabel2B5, accessKey: "tabel_2b5_kesesuaian_kerja", description: "Kesesuaian Bidang" },
      { key: "2b6", name: "Tabel 2B-6", icon: FaFile, Component: Tabel2B6, accessKey: "tabel_2b6_kepuasan_pengguna", description: "Kepuasan Pengguna" },
      { key: "2c", name: "Tabel 2C", icon: FaFile, Component: Tabel2C, accessKey: "fleksibilitas_pembelajaran", description: "Fleksibilitas Pembelajaran" },
      { key: "2d", name: "Tabel 2D", icon: FaFile, Component: Tabel2D, accessKey: "rekognisi_lulusan", description: "Rekognisi Lulusan" },
    ]
  },
  {
    key: "C3",
    name: "Relevansi Penelitian",
    icon: FaFlask,
    description: "Penelitian dan Pengabdian",
    type: "folder",
    children: [
      { key: "3a1", name: "Tabel 3A-1", icon: FaFile, Component: Tabel3A1, accessKey: "tabel_3a1_sarpras_penelitian", description: "Sarpras Penelitian" },
      { key: "3a2", name: "Tabel 3A-2", icon: FaFile, Component: Tabel3A2, accessKey: "tabel_3a2_penelitian", description: "Data Penelitian" },
      { key: "3a3", name: "Tabel 3A-3", icon: FaFile, Component: Tabel3A3, accessKey: "tabel_3a3_pengembangan_dtpr", description: "Pengembangan DTPR" },
      { key: "3c1", name: "Tabel 3C-1", icon: FaFile, Component: Tabel3C1, accessKey: "tabel_3c1_kerjasama_penelitian", description: "Kerjasama Penelitian" },
      { key: "3c2", name: "Tabel 3C-2", icon: FaFile, Component: Tabel3C2, accessKey: "tabel_3c2_publikasi_penelitian", description: "Publikasi Penelitian" },
      { key: "3c3", name: "Tabel 3C-3", icon: FaFile, Component: Tabel3C3, accessKey: "tabel_3c3_hki", description: "Hak Kekayaan Intelektual" },
    ]
  },
  {
    key: "C4",
    name: "Relevansi PkM",
    icon: FaBook,
    description: "Pendidikan",
    type: "folder",
    children: [
      { key: "4a1", name: "Tabel 4A-1", icon: FaFile, Component: Tabel4A1, accessKey: "tabel_4a1_sarpras_pkm", description: "Sarpras PkM" },
      { key: "4a2", name: "Tabel 4A-2", icon: FaFile, Component: Tabel4A2, accessKey: "tabel_4a2_pkm", description: "Data PkM" },
      { key: "4c1", name: "Tabel 4C-1", icon: FaFile, Component: Tabel4C1, accessKey: "tabel_4c1_kerjasama_pkm", description: "Kerjasama PkM" },
      { key: "4c2", name: "Tabel 4C-2", icon: FaFile, Component: Tabel4C2, accessKey: "tabel_4c2_diseminasi_pkm", description: "Diseminasi PkM" },
      { key: "4c3", name: "Tabel 4C-3", icon: FaFile, Component: Tabel4C3, accessKey: "tabel_4c3_hki_pkm", description: "HKI PkM" },
    ]
  },
  {
    key: "C5",
    name: "Akuntabilitas",
    icon: FaChartLine,
    description: "Keuangan dan Sarana",
    type: "folder",
    children: [
      { key: "51", name: "Tabel 5.1", icon: FaFile, Component: Tabel51, accessKey: "tabel_5_1_sistem_tata_kelola", description: "Sistem Tata Kelola" },
      { key: "52", name: "Tabel 5.2", icon: FaFile, Component: Tabel52, accessKey: "tabel_5_2_sarpras_pendidikan", description: "Sarpras Pendidikan" },
    ]
  },
  {
    key: "C6",
    name: "Luaran",
    icon: FaChalkboard,
    description: "Visi Misi",
    type: "folder",
    children: [
      { key: "6", name: "Tabel 6", icon: FaFile, Component: Tabel6, accessKey: "tabel_6_kesesuaian_visi_misi", description: "Kesesuaian Visi Misi" },
    ]
  },
];

// Flat Map untuk akses cepat (O(1) lookup)
// Dibuat function agar bisa dipanggil ulang jika struktur berubah (misal dinamis)
// Flat Map untuk akses cepat (O(1) lookup) - Improved Recursive
const flattenStructure = (items, parent = null) => {
  let map = {};
  items.forEach(item => {
    // Clone item dan tambahkan referensi parent jika ada
    const currentItem = {
      ...item,
      parentKey: parent?.key,
      parentName: parent?.name
    };

    // Simpan item saat ini ke map
    map[item.key] = currentItem;

    // Jika punya children, recurse dengan item saat ini sebagai parent
    if (item.children) {
      const childrenMap = flattenStructure(item.children, currentItem); // Pass currentItem as parent
      map = { ...map, ...childrenMap };
    }
  });
  return map;
};

// Buat menuMap statis awal
const menuMap = {
  ...flattenStructure(sidebarStructure),
  // Tambahan manual yang tidak ada di struktur utama
  ManajemenAkun: { name: "Manajemen Akun", Component: UserManagementPage, icon: FaShield, description: "Kelola Pengguna Sistem" },
  TabelDosen: { name: "Tabel Dosen", Component: TabelDosen, icon: FaChalkboard, description: "Data Dosen" },
  TabelPegawai: { name: "Data Pegawai", Component: TabelPegawai, icon: FaUserTie, description: "Data Pegawai" },
  TabelTendik: { name: "Tenaga Kependidikan", Component: TabelTendik, icon: FaUserGroup, description: "Data Tenaga Kependidikan" },
};

// Breadcrumbs Component - Windows Explorer Style
// Breadcrumbs Component - Windows Explorer Style
// Breadcrumbs Component - Windows Explorer Style (Light Theme)
// Breadcrumbs Component - Modern Web Style
const Breadcrumbs = ({ activeTable, menuMap }) => {
  if (!activeTable || !menuMap[activeTable]) return null;

  const getPath = (key) => {
    const path = [];
    let currentKey = key;
    while (currentKey && menuMap[currentKey]) {
      const item = menuMap[currentKey];
      // Use unshift to add to the beginning of the array
      path.unshift({ name: item.name, key: item.key, icon: item.icon });
      currentKey = item.parentKey;
    }
    path.unshift({ name: "Data Akreditasi", key: "root", icon: FaDatabase });
    return path;
  };

  const pathItems = getPath(activeTable);

  return (
    <nav className="flex items-center flex-wrap gap-1 mb-6 text-sm">
      {pathItems.map((item, index) => {
        const isLast = index === pathItems.length - 1;
        const isRoot = index === 0;

        return (
          <React.Fragment key={item.key || index}>
            {index > 0 && (
              <ChevronRight className="text-slate-300 mx-1 flex-shrink-0" size={14} />
            )}

            <div
              className={`
                flex items-center gap-2 px-1 py-1 transition-colors duration-200
                ${isLast
                  ? "text-blue-700 font-bold"
                  : "text-slate-500 hover:text-blue-600 cursor-pointer"
                }
              `}
            >
              {item.icon && (
                <item.icon
                  className={`
                    w-3.5 h-3.5 
                    ${isLast ? "text-blue-600" : "text-slate-400"}
                    ${isRoot ? "text-blue-500" : ""}
                  `}
                />
              )}
              <span className="tracking-wide text-[13px]">
                {item.name}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};


// Komponen Item Sidebar Rekursif - Memoized untuk mencegah re-render massal
const SidebarItem = React.memo(({ item, activeTable, updateActiveTable, setIsSidebarOpen, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = activeTable === item.key;
  const hasChildren = item.children && item.children.length > 0;

  // Cek apakah ada child yang aktif untuk auto-expand folder
  const isChildActive = useMemo(() => {
    if (!hasChildren) return false;
    const checkActive = (children) => {
      return children.some(child => {
        if (child.key === activeTable) return true;
        if (child.children) return checkActive(child.children);
        return false;
      });
    };
    return checkActive(item.children);
  }, [hasChildren, item.children, activeTable]);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // Determine Icon
  let DisplayIcon = item.icon || FaFile;
  let iconColor = "text-slate-400";

  if (hasChildren) {
    // Override icon for folders if not explicitly set to something else custom
    // or just colorize the existing one
    DisplayIcon = isOpen ? FaFolderOpen : FaFolder;
    iconColor = "text-amber-400"; // Classic folder color
    if (isChildActive) iconColor = "text-amber-500";
  } else if (isActive) {
    iconColor = "text-blue-600";
  }

  return (
    <div className="select-none relative">
      {/* Tree Line Indicator (Optional - can be added for depth > 0) */}
      {depth > 0 && (
        <div
          className="absolute left-[20px] top-0 bottom-0 w-px bg-slate-100"
          style={{ left: `${(depth * 16) + 12 - 16}px` }}
        />
      )}

      <button
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            updateActiveTable(item.key);
            if (setIsSidebarOpen) setIsSidebarOpen(false); // Close sidebar on leaf click (mobile)
          }
        }}
        className={`w-full flex items-center gap-2.5 py-1.5 pr-3 rounded-md text-sm transition-all duration-200 relative group focus:outline-none 
          ${isActive && !hasChildren
            ? "bg-blue-50 text-blue-700 font-semibold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } 
          ${hasChildren ? "font-medium" : ""}
          ${isChildActive && !isOpen ? "text-blue-700 bg-slate-50/50" : ""}
        `}
        style={{
          paddingLeft: `${depth * 16 + 12}px`,
          marginLeft: '4px',
          width: 'calc(100% - 8px)'
        }}
      >
        {/* Active Indicator Strip */}
        {isActive && !hasChildren && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-full" />
        )}

        <div className={`relative flex items-center justify-center transition-colors duration-200 ${iconColor}`}>
          <DisplayIcon className="h-4 w-4" />
        </div>

        <span className="truncate flex-1 text-left leading-tight py-0.5">
          {item.name}
        </span>

        {hasChildren && (
          <div className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <ChevronDown size={12} />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {item.children.map((child) => (
              <SidebarItem
                key={child.key}
                item={child}
                activeTable={activeTable}
                updateActiveTable={updateActiveTable}
                setIsSidebarOpen={setIsSidebarOpen}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison untuk React.memo
  // Hanya re-render jika:
  // 1. activeTable berubah (untuk highlight)
  // 2. properties item berubah (jarang)
  // 3. depth berubah

  // Optimasi: Jika item ini atau anaknya TIDAK aktif sebelumnya DAN TIDAK aktif sekarang, abaikan re-render akibat perubahan activeTable
  // (Ini agak kompleks karena kita perlu tahu apakah 'activeTable' baru ada di dalam subtree item ini)

  // Untuk keamanan dan kesederhanaan, kita compare shallow props dulu, tapi activeTable string comparison sudah cukup cepat.
  // Yang penting object identity item stabil.
  return (
    prevProps.activeTable === nextProps.activeTable &&
    prevProps.item === nextProps.item &&
    prevProps.depth === nextProps.depth
  );
});

const MobileExpandingMenu = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, adminItems }) => {
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
      className="bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden shadow-sm"
    >
      <div
        className="flex items-center justify-between p-4 flex-shrink-0 cursor-pointer h-14 bg-white z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <FaGrip className="h-5 w-5 text-[#043975]" />
          <span className="font-bold text-[#043975] text-sm">Menu Navigasi</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="h-5 w-5 text-slate-500" />
        </motion.div>
      </div>

      <div className="overflow-hidden flex-1 flex flex-col bg-slate-50/50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex-1 flex flex-col p-2"
            >
              <nav className="space-y-6" aria-label="Menu navigasi tabel">
                <div>
                  <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tabel Akreditasi</h3>
                  <div className="space-y-0.5">
                    {sidebarItems.map((item) => (
                      <SidebarItem
                        key={item.key}
                        item={item} // Passthrough object structure
                        activeTable={activeTable}
                        updateActiveTable={updateActiveTable}
                        setIsSidebarOpen={setIsOpen}
                      />
                    ))}
                  </div>
                </div>

                {adminItems && adminItems.length > 0 && (
                  <div>
                    <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Admin</h3>
                    <div className="space-y-0.5">
                      {adminItems.map((key) => {
                        const menuItem = menuMap[key];
                        // Fake item object for consistent API
                        const itemObj = { key, name: menuItem?.name, icon: menuItem?.icon, children: [] };
                        return (
                          <SidebarItem
                            key={key}
                            item={itemObj}
                            activeTable={activeTable}
                            updateActiveTable={updateActiveTable}
                            setIsSidebarOpen={setIsOpen}
                          />
                        );
                      })}
                    </div>
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


// Sub-komponen untuk konten navigasi - sudah React.memo
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
          <div className="space-y-0.5">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                activeTable={activeTable}
                updateActiveTable={updateActiveTable}
                depth={0}
              />
            ))}
          </div>
        </div>

        {adminItems && adminItems.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Panel Admin</h3>
            <div className="space-y-0.5">
              {adminItems.map((key) => {
                const menuItem = menuMap[key];
                const itemObj = { key, name: menuItem?.name, icon: menuItem?.icon, children: [] };
                return (
                  <SidebarItem
                    key={key}
                    item={itemObj}
                    activeTable={activeTable}
                    updateActiveTable={updateActiveTable}
                    depth={0}
                  />
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
});

const ExpandingSidebar = ({ isOpen, setIsOpen, activeTable, updateActiveTable, sidebarItems, adminItems, contentHeight }) => {
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
      className={`flex flex-col relative self-start ${isOpen
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
  // Tentukan akses C1 berdasarkan minimal satu tabel di dalam C1 yang bisa dibaca
  // Mapping kunci sesuai dengan ACCESS_MATRIX (huruf kecil)
  // KECUALI role kemahasiswaan, ALA, PMB, dan SARPRAS yang tidak boleh akses C1
  let role = authUser?.role;
  const lowerRoleRaw = (role || "").toLowerCase();

  // Normalisasi: perlakukan 'kaprodi' sebagai 'prodi'
  if (lowerRoleRaw.includes('kaprodi') || lowerRoleRaw === 'kaprodi_ti' || lowerRoleRaw === 'kaprodi_mi') {
    role = 'prodi';
  }

  const loweredRole = (role || "").toLowerCase();
  const c1AccessKeys = ["dosen", "pegawai", "tabel_1a1", "tabel_1a2", "tabel_1a3", "tabel_1a4", "tabel_1a5", "tabel_1b", "beban_kerja_dosen", "tenaga_kependidikan"];
  const hasC1Access = loweredRole !== "kemahasiswaan" && loweredRole !== "ala" && loweredRole !== "pmb" && loweredRole !== "sarpras" && c1AccessKeys.some((k) => roleCan(role, k, "r"));

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
  const hasC2Access = c2AccessKeys.some((k) => roleCan(role, k, "r"));

  // Akses C3: jika ada akses ke tabel C3
  const c3AccessKeys = [
    "tabel_3a1_sarpras_penelitian",
    "tabel_3a2_penelitian",
    "tabel_3a3_pengembangan_dtpr",
    "tabel_3c1_kerjasama_penelitian",
    "tabel_3c2_publikasi_penelitian",
    "tabel_3c3_hki"
  ]; // tabel-tabel yang ada di C3
  const hasC3Access = c3AccessKeys.some((k) => roleCan(role, k, "r"));

  // Akses C4: jika ada akses ke tabel C4
  const c4AccessKeys = [
    "tabel_4a1_sarpras_pkm",
    "tabel_4a2",
    "tabel_4a2_pkm",
    "tabel_4c1_kerjasama_pkm",
    "tabel_4c2_diseminasi_pkm",
    "tabel_4c3_hki_pkm"
  ]; // tabel-tabel yang ada di C4
  const hasC4Access = c4AccessKeys.some((k) => roleCan(role, k, "r"));

  // Akses C5: jika ada akses ke tabel C5
  const c5AccessKeys = [
    "tabel_5a1",
    "tabel_5a2",
    "tabel_5_2_sarpras_pendidikan"
  ]; // tabel-tabel yang ada di C5
  const hasC5Access = c5AccessKeys.some((k) => roleCan(role, k, "r"));

  // Akses C6: jika ada akses ke tabel C6
  const c6AccessKeys = [
    "tabel_6_kesesuaian_visi_misi"
  ]; // tabel-tabel yang ada di C6
  const hasC6Access = c6AccessKeys.some((k) => roleCan(role, k, "r"));

  // Panel Admin tampil jika role admin tertentu ATAU punya akses minimal ke dosen/pegawai/tenaga_kependidikan
  // KECUALI role kemahasiswaan, ALA, LPPM, dan SARPRAS yang tidak boleh akses Panel Admin
  // KEPEGAWAIAN diperbolehkan karena memiliki akses CRUD untuk dosen, pegawai, dan tenaga_kependidikan
  const canSeeUserMgmt = loweredRole !== "kemahasiswaan" && loweredRole !== "ala" && loweredRole !== "lppm" && loweredRole !== "sarpras" && (
    ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)
    || roleCan(role, "dosen", "r")
    || roleCan(role, "pegawai", "r")
    || roleCan(role, "tenaga_kependidikan", "r")
  );

  // Susun item sidebar sesuai akses - Memoized untuk performance
  const sidebarItems = useMemo(() => {
    // Fungsi rekursif untuk filter item berdasarkan akses
    const filterItemsRecursive = (items) => {
      return items.reduce((acc, item) => {
        // Cek akses untuk item saat ini
        let hasAccess = false;

        // Jika ada accessKey, cek permission
        if (item.accessKey) {
          hasAccess = roleCan(role, item.accessKey, "r");
        }
        // Logic khusus untuk folder top-level (C1-C6) tetap dipertahankan sebagai fallback/grouping logic
        else if (item.key === 'C1') hasAccess = hasC1Access;
        else if (item.key === 'C2') hasAccess = hasC2Access;
        else if (item.key === 'C3') hasAccess = hasC3Access;
        else if (item.key === 'C4') hasAccess = hasC4Access;
        else if (item.key === 'C5') hasAccess = hasC5Access;
        else if (item.key === 'C6') hasAccess = hasC6Access;
        // Jika tidak ada key spesifik (folder murni), anggap true dulu, nanti dicek children-nya
        else {
          hasAccess = true;
        }

        // Jika item punya children, filter children-nya
        let validChildren = [];
        if (item.children && item.children.length > 0) {
          validChildren = filterItemsRecursive(item.children);

          // Jika item adalah folder (tidak punya accessKey sendiri), tapi punya children valid, maka item ini valid
          if (!item.accessKey && validChildren.length > 0) {
            hasAccess = true;
          } else if (!item.accessKey && validChildren.length === 0) {
            // Folder tanpa children valid -> hide
            hasAccess = false;
          }
        }

        if (hasAccess) {
          // Clone item untuk memasukkan filtered children
          const newItem = { ...item };
          if (validChildren.length > 0) {
            newItem.children = validChildren;
          } else if (item.children) {
            // Jika punya children property tapi kosong setelah filter, hapus property children agar tidak dianggap folder kosong
            // KECUALI jika accessKey-nya valid (item leaf yang valid tapi kebetulan punya children empty - rare case, usually leaf nodes dont have children)
            // Tapi untuk folder, kita ingin hide jika kosong.
            // Structure data kita: type="folder" usually means it relies on children.
            if (item.type === 'folder') {
              return acc; // Skip folder kosong
            }
            newItem.children = [];
          }
          acc.push(newItem);
        }
        return acc;
      }, []);
    };

    return filterItemsRecursive(sidebarStructure);
  }, [authUser, role, hasC1Access, hasC2Access, hasC3Access, hasC4Access, hasC5Access, hasC6Access]);

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
    // Legacy support logic removed as we use direct keys now

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

    // Build admin keys based on access
    const adminKeysList = [];
    if (canSeeUserMgmt) {
      if (roleCan(authUser?.role, "users", "r") || ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)) {
        adminKeysList.push('ManajemenAkun');
      }
      if (loweredRole !== "kepegawaian") {
        if (roleCan(authUser?.role, "dosen", "r")) adminKeysList.push('TabelDosen');
        if (roleCan(authUser?.role, "pegawai", "r")) adminKeysList.push('TabelPegawai');
      }
      if (roleCan(authUser?.role, "tenaga_kependidikan", "r")) adminKeysList.push('TabelTendik');
    }
    const adminKeys = adminKeysList;

    // Flatten allowed keys from recursive sidebarItems
    const allowedKeys = new Set([...adminKeys]);
    const traverse = (items) => {
      items.forEach(item => {
        allowedKeys.add(item.key);
        if (item.children) traverse(item.children);
      });
    };
    traverse(sidebarItems);

    // Helper to find first valid leaf node
    const findDefault = (items) => {
      for (const item of items) {
        // Jika accessKey ada dan user tidak punya akses, skip (double check)
        // Tapi sidebarItems sudah difilter di level top. Level anak diasumsikan OK jika parent OK, 
        // atau bisa dicek lagi permissionnya. Sementara ambil yang ada saja.
        if (!item.children || item.children.length === 0) return item.key;
        const childResult = findDefault(item.children);
        if (childResult) return childResult;
      }
      return null;
    };

    // Determine candidate table
    const candidate = tableFromUrl || lastTable;
    // Check if candidate is valid (leaf or admin item)
    // Note: 'C1' key is valid in map but maybe not what we want to render (it's a folder).
    // If candidate is a folder, we might want to redirect to first child?
    // For now, accept candidate if it allowed.

    // Find default if no candidate
    const defaultKey = findDefault(sidebarItems) || adminKeys[0] || null;

    const initial = candidate && allowedKeys.has(candidate) ? candidate : defaultKey;

    if (initial && initial !== activeTable) {
      // Avoid resetting if current is already valid
      const currentIsValid = activeTable && allowedKeys.has(activeTable);
      if (!currentIsValid || tableFromUrl || !activeTable) {
        setActiveTable(initial);
      }
    } else if (!initial && activeTable) {
      const currentIsValid = activeTable && allowedKeys.has(activeTable);
      if (!currentIsValid) setActiveTable(null);
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

    measureContentHeight();
    const resizeObserver = new ResizeObserver(() => measureContentHeight());
    const contentElement = document.querySelector('.main-content-area');
    if (contentElement) resizeObserver.observe(contentElement);
    window.addEventListener('resize', measureContentHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureContentHeight);
      clearTimeout(resizeTimer);
    };
  }, [mounted, activeTable]);

  const { maps } = useMaps(authUser);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleDataChange = useCallback(() => setRefreshTrigger(prev => prev + 1), []);

  const { Component: ActiveComponent } = activeTable ? (menuMap[activeTable]) : { Component: () => null };

  const activeProps = useMemo(() => {
    // Selalu kirim role ke semua active component untuk keamanan
    // Tambahkan maps dan handler untuk komponen C2 yang butuh data mapping
    return {
      role: authUser?.role,
      maps,
      refreshTrigger,
      onDataChange: handleDataChange
    };
  }, [authUser?.role, maps, refreshTrigger, handleDataChange]);

  // Calculate admin items once at top level
  const adminItems = useMemo(() => {
    const adminKeysList = [];
    if (canSeeUserMgmt) {
      if (loweredRole !== "kepegawaian") {
        if (roleCan(authUser?.role, "pegawai", "r")) adminKeysList.push('TabelPegawai');
        if (roleCan(authUser?.role, "dosen", "r")) adminKeysList.push('TabelDosen');
      }
      if (roleCan(authUser?.role, "tenaga_kependidikan", "r")) adminKeysList.push('TabelTendik');

      if (roleCan(authUser?.role, "users", "r") || ["waket-1", "waket-2", "admin", "tpm"].includes(loweredRole)) {
        adminKeysList.push('ManajemenAkun');
      }
    }
    return adminKeysList;
  }, [canSeeUserMgmt, loweredRole, authUser?.role]);

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
              adminItems={adminItems}
            />
          </header>
          <main className="px-4 pb-4 overflow-x-hidden relative z-10">

            {/* Breadcrumbs for Mobile */}
            <Breadcrumbs activeTable={activeTable} menuMap={menuMap} />


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
        adminItems={adminItems}
        canSeeUserMgmt={canSeeUserMgmt}
        contentHeight={contentHeight}
        authUser={authUser}
      />

      <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10 ${!isSidebarOpen ? 'ml-8' : ''}`}>
        <main className="flex-1 overflow-x-hidden">
          <div className="px-4 pt-4 pb-6 main-content-area">

            {/* Breadcrumbs for Desktop */}
            <Breadcrumbs activeTable={activeTable} menuMap={menuMap} />


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

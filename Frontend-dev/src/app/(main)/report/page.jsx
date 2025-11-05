"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";

// Shimmer animation akan ditambahkan via inline style atau global CSS

// Custom fetch untuk report page yang tidak log error sama sekali
// Error sudah di-handle dengan baik di komponen, jadi tidak perlu log ke console
const silentApiFetch = async (path, opts = {}) => {
  const BASE_URL = "http://localhost:3000/api";
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
    credentials: "include",
    mode: "cors",
  });

  if (!res.ok) {
    const text = await res.text();
    // Tidak log error sama sekali - error sudah di-handle di komponen
    try {
      const j = JSON.parse(text);
      const errorMsg = j?.error || j?.message || `HTTP ${res.status}: ${res.statusText}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.response = j;
      throw error;
    } catch (parseError) {
      const error = new Error(text || `HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.responseText = text;
      throw error;
    }
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
};
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Database,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";

// Definisi semua tabel C1
const C1_TABLES = [
  { key: "1a1", label: "Tabel 1A-1", endpoint: "/pimpinan-upps-ps", accessKey: "tabel_1a1", description: "Pimpinan UPPS/PS" },
  { key: "1a2", label: "Tabel 1A-2", endpoint: "/sumber-pendanaan", accessKey: "tabel_1a2", description: "Sumber Pendanaan" },
  { key: "1a3", label: "Tabel 1A-3", endpoint: "/penggunaan-dana", accessKey: "tabel_1a3", description: "Penggunaan Dana" },
  { key: "1a4", label: "Tabel 1A-4", endpoint: "/beban-kerja-dosen", accessKey: "tabel_1a4", description: "Beban Kerja Dosen" },
  { key: "1a5", label: "Tabel 1A-5", endpoint: "/kualifikasi-tendik", accessKey: "tabel_1a5", description: "Kualifikasi Tendik" },
  { key: "1b", label: "Tabel 1B", endpoint: "/audit-mutu-internal", accessKey: "tabel_1b", description: "Audit Mutu Internal" },
];

// Definisi semua tabel C2
const C2_TABLES = [
  { key: "2a1", label: "Tabel 2A-1", endpoint: "/tabel2a1-pendaftaran", accessKey: "tabel_2a1_pendaftaran", description: "Data Pendaftaran Mahasiswa" },
  { key: "2a2", label: "Tabel 2A-2", endpoint: "/tabel2a2-keragaman-asal", accessKey: "tabel_2a2_keragaman_asal", description: "Keragaman Asal Mahasiswa" },
  { key: "2a3", label: "Tabel 2A-3", endpoint: "/tabel2a3-kondisi-mahasiswa", accessKey: "tabel_2a3_kondisi_mahasiswa", description: "Kondisi Mahasiswa" },
  { key: "2b", label: "Tabel 2B", endpoint: "/pemetaan-2b1", accessKey: "pemetaan2b1", description: "Pemetaan CPL-PL" },
  { key: "2b4", label: "Tabel 2B-4", endpoint: "/tabel2b4-masa-tunggu", accessKey: "tabel_2b4_masa_tunggu", description: "Masa Tunggu Lulusan" },
  { key: "2b5", label: "Tabel 2B-5", endpoint: "/tabel2b5-kesesuaian-kerja", accessKey: "tabel_2b5_kesesuaian_kerja", description: "Kesesuaian Bidang Kerja" },
  { key: "2b6", label: "Tabel 2B-6", endpoint: "/tabel2b6-kepuasan-pengguna", accessKey: "tabel_2b6_kepuasan_pengguna", description: "Kepuasan Pengguna Lulusan" },
  { key: "2c", label: "Tabel 2C", endpoint: "/tabel2c-fleksibilitas-pembelajaran", accessKey: "fleksibilitas_pembelajaran", description: "Fleksibilitas Pembelajaran" },
  { key: "2d", label: "Tabel 2D", endpoint: "/tabel2d-rekognisi-lulusan", accessKey: "rekognisi_lulusan", description: "Rekognisi Lulusan" },
];

// Definisi semua tabel C3
const C3_TABLES = [
  { key: "3a1", label: "Tabel 3A-1", endpoint: "/tabel-3a1-sarpras-penelitian", accessKey: "tabel_3a1_sarpras_penelitian", description: "Sarana Prasarana Penelitian" },
  { key: "3a2", label: "Tabel 3A-2", endpoint: "/tabel-3a2-penelitian", accessKey: "tabel_3a2_penelitian", description: "Penelitian" },
];

// Komponen Grafik Card untuk setiap tabel - Design sesuai gambar
const ChartCard = ({ table, dataCount, isLoading, onExpand, isExpanded, role, color }) => {
  const canAccess = roleCan(role, table.accessKey, "r");
  
  if (!canAccess) return null;

  // Hitung persentase untuk progress bar (max 100 untuk scaling yang lebih baik)
  const maxValue = 100;
  const percentage = Math.min((dataCount / maxValue) * 100, 100);

  // Extract color untuk solid blue circle
  const getSolidColor = (colorClass) => {
    if (colorClass.includes('blue')) return '#3b82f6'; // blue-500
    if (colorClass.includes('purple')) return '#a855f7'; // purple-500
    if (colorClass.includes('green')) return '#10b981'; // green-500
    if (colorClass.includes('orange')) return '#f97316'; // orange-500
    if (colorClass.includes('indigo')) return '#6366f1'; // indigo-500
    return '#3b82f6'; // default blue
  };

  const solidColor = getSolidColor(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300"
      onClick={onExpand}
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-8 bg-gray-100 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section - Icon dan Label */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: solidColor }}
            >
              <BarChart3 size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate">{table.label}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{table.description}</p>
            </div>
          </div>

          {/* Data Count Section */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {dataCount.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-gray-500">Data</span>
          </div>
          
          {/* Progress Bar Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Progress</span>
              <span className="font-bold" style={{ color: solidColor }}>
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${solidColor}, ${solidColor}dd)`
                }}
              />
            </div>
          </div>

          {/* Footer - Lihat Detail */}
          <div className="flex items-center text-sm font-medium pt-2 text-blue-600">
            <span>Lihat Detail</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-gray-200 mt-4"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/tables?table=${table.key.startsWith('1') ? 'C1' : table.key.startsWith('2') ? 'C2' : 'C3'}#tab=${table.key}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg hover:shadow-md transition-all duration-300 font-medium text-sm text-white"
                style={{ backgroundColor: solidColor }}
              >
                <FileText size={16} />
                <span>Lihat Detail Tabel</span>
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Komponen Section untuk setiap kategori
const ReportSection = ({ title, icon: Icon, tables, role, color }) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [dataCounts, setDataCounts] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  // Fetch data count untuk setiap tabel
  useEffect(() => {
    if (!role) return;
    
    tables.forEach(async (table) => {
      if (!roleCan(role, table.accessKey, "r")) {
        setDataCounts(prev => ({ ...prev, [table.key]: 0 }));
        setLoadingStates(prev => ({ ...prev, [table.key]: false }));
        return;
      }
      
      setLoadingStates(prev => ({ ...prev, [table.key]: true }));
      
      try {
        // Fetch data biasa (tanpa query params karena beberapa endpoint tidak support)
        // Gunakan silentApiFetch untuk suppress error logging 404/403
        const data = await silentApiFetch(table.endpoint);
        
        // Jika response memiliki total atau count, gunakan itu
        // Jika tidak, hitung dari array length
        let count = 0;
        if (data?.total !== undefined) {
          count = data.total;
        } else if (data?.count !== undefined) {
          count = data.count;
        } else if (Array.isArray(data)) {
          // Jika response adalah array, hitung panjangnya
          count = data.length;
        } else if (data?.items && Array.isArray(data.items)) {
          count = data.items.length;
        }
        
        setDataCounts(prev => ({ ...prev, [table.key]: count }));
      } catch (err) {
        // Silent fail untuk 404 dan 403 (Not Found atau Forbidden adalah expected)
        // Jangan log error untuk status code yang diharapkan
        if (err?.status && err.status !== 404 && err.status !== 403) {
          // Hanya log warning untuk error selain 404/403 (network error, server error, dll)
          console.warn(`[Report] Warning: Could not fetch data for ${table.label}:`, err.message || 'Unknown error');
        }
        setDataCounts(prev => ({ ...prev, [table.key]: 0 }));
      } finally {
        setLoadingStates(prev => ({ ...prev, [table.key]: false }));
      }
    });
  }, [tables, role]);

  const toggleExpand = (key) => {
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const accessibleTables = tables.filter(table => roleCan(role, table.accessKey, "r"));

  if (accessibleTables.length === 0) return null;

  return (
    <div className="mb-14">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3.5 bg-gradient-to-br ${color} rounded-2xl text-white shadow-lg`}>
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{accessibleTables.length} tabel tersedia</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accessibleTables.map((table) => (
          <ChartCard
            key={table.key}
            table={table}
            dataCount={dataCounts[table.key] || 0}
            isLoading={loadingStates[table.key]}
            isExpanded={expandedCards[table.key]}
            onExpand={() => toggleExpand(table.key)}
            role={role}
            color={color}
          />
        ))}
      </div>
    </div>
  );
};

export default function ReportPage() {
  const { authUser } = useAuth();
  const role = authUser?.role;

  // Cek akses untuk setiap kategori
  const c1AccessKeys = ["dosen", "pegawai", "tabel_1a1", "tabel_1a2", "tabel_1a3", "tabel_1a4", "tabel_1a5", "tabel_1b", "beban_kerja_dosen", "tendik"]; 
  const hasC1Access = useMemo(() => c1AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c2AccessKeys = [
    "tabel_2a1_pendaftaran",
    "tabel_2a2_keragaman_asal", 
    "tabel_2a3_kondisi_mahasiswa",
    "pemetaan2b1",
    "tabel_2b4_masa_tunggu",
    "tabel_2b5_kesesuaian_kerja",
    "tabel_2b6_kepuasan_pengguna"
  ];
  const hasC2Access = useMemo(() => c2AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c3AccessKeys = [
    "tabel_3a1_sarpras_penelitian",
    "tabel_3a2_penelitian"
  ];
  const hasC3Access = useMemo(() => c3AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const hasDosenAccess = useMemo(() => roleCan(role, "dosen", "r"), [role]);
  const hasPegawaiAccess = useMemo(() => roleCan(role, "pegawai", "r"), [role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
                  Laporan & Grafik
                </h1>
                <p className="text-gray-500 text-sm">Ringkasan data dan grafik untuk semua tabel penjaminan mutu</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium text-sm">
                <Download size={18} />
                <span>Export PDF</span>
              </button>
            </div>
          </motion.div>

        {/* Section C1 */}
        {hasC1Access && (
          <ReportSection
            title="Standar C1 - Visi, Misi, Tujuan, dan Sasaran"
            icon={Database}
            tables={C1_TABLES}
            role={role}
            color="from-blue-500 to-cyan-500"
          />
        )}

        {/* Section Panel Admin - Data Dosen dan Pegawai */}
        {(hasDosenAccess || hasPegawaiAccess) && (
          <ReportSection
            title="Panel Admin"
            icon={Users}
            tables={[
              ...(hasDosenAccess ? [{ key: "dosen", label: "Tabel Dosen", endpoint: "/dosen", accessKey: "dosen", description: "Data Dosen" }] : []),
              ...(hasPegawaiAccess ? [{ key: "pegawai", label: "Tabel Pegawai", endpoint: "/pegawai", accessKey: "pegawai", description: "Data Pegawai" }] : [])
            ]}
            role={role}
            color="from-green-500 to-emerald-500"
          />
        )}

        {/* Section C2 */}
        {hasC2Access && (
          <ReportSection
            title="Standar C2 - Mahasiswa, Lulusan, dan Pengguna"
            icon={TrendingUp}
            tables={C2_TABLES}
            role={role}
            color="from-purple-500 to-violet-500"
          />
        )}

        {/* Section C3 */}
        {hasC3Access && (
          <ReportSection
            title="Standar C3 - Penelitian"
            icon={FileText}
            tables={C3_TABLES}
            role={role}
            color="from-indigo-500 to-purple-500"
          />
        )}

        {/* Empty State */}
        {!hasC1Access && !hasC2Access && !hasC3Access && !hasDosenAccess && !hasPegawaiAccess && (
          <div className="text-center py-20">
            <Database size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada akses</h3>
            <p className="text-gray-500">Anda tidak memiliki akses untuk melihat laporan tabel.</p>
          </div>
        )}
        </div>
      </div>
  );
}


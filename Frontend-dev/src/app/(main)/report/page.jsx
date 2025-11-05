"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";
import { apiFetch } from "../../../lib/api";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Database,
  Download,
  ChevronDown,
  ChevronUp
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
  { key: "2b", label: "Tabel 2B", endpoint: "/pemetaan2b1", accessKey: "pemetaan2b1", description: "Pemetaan CPL-PL" },
  { key: "2b4", label: "Tabel 2B-4", endpoint: "/tabel2b4-masa-tunggu", accessKey: "tabel_2b4_masa_tunggu", description: "Masa Tunggu Lulusan" },
  { key: "2b5", label: "Tabel 2B-5", endpoint: "/tabel2b5-kesesuaian-kerja", accessKey: "tabel_2b5_kesesuaian_kerja", description: "Kesesuaian Bidang Kerja" },
  { key: "2b6", label: "Tabel 2B-6", endpoint: "/tabel2b6-kepuasan-pengguna", accessKey: "tabel_2b6_kepuasan_pengguna", description: "Kepuasan Pengguna Lulusan" },
  { key: "2c", label: "Tabel 2C", endpoint: "/tabel2c-fleksibilitas-pembelajaran", accessKey: "fleksibilitas_pembelajaran", description: "Fleksibilitas Pembelajaran" },
  { key: "2d", label: "Tabel 2D", endpoint: "/tabel2d-rekognisi-lulusan", accessKey: "rekognisi_lulusan", description: "Rekognisi Lulusan" },
];

// Definisi semua tabel C3
const C3_TABLES = [
  { key: "3a1", label: "Tabel 3A-1", endpoint: "/tabel3a1-sarpras-penelitian", accessKey: "tabel_3a1_sarpras_penelitian", description: "Sarana Prasarana Penelitian" },
  { key: "3a2", label: "Tabel 3A-2", endpoint: "/tabel3a2-penelitian", accessKey: "tabel_3a2_penelitian", description: "Penelitian" },
];

// Komponen Grafik Card untuk setiap tabel
const ChartCard = ({ table, dataCount, isLoading, onExpand, isExpanded, role }) => {
  const canAccess = roleCan(role, table.accessKey, "r");
  
  if (!canAccess) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onExpand}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{table.label}</h3>
              <p className="text-sm text-gray-600">{table.description}</p>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isLoading ? (
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-gray-900">{dataCount}</span>
            <span className="text-sm text-gray-500">Data</span>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="relative h-32 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-xl transition-all duration-500"
              style={{ height: `${Math.min((dataCount / 100) * 100, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800 z-10">{dataCount}</span>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <p className="text-sm text-gray-600 mb-3">Detail data untuk {table.label}</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/tables?table=${table.key.startsWith('1') ? 'C1' : table.key.startsWith('2') ? 'C2' : 'C3'}#tab=${table.key}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
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
    tables.forEach(async (table) => {
      if (!roleCan(role, table.accessKey, "r")) return;
      
      setLoadingStates(prev => ({ ...prev, [table.key]: true }));
      try {
        // Fetch summary atau count dari API
        const summaryUrl = table.endpoint.includes('/summary') 
          ? table.endpoint 
          : `${table.endpoint}/summary`;
        
        try {
          const data = await apiFetch(summaryUrl);
          const count = Array.isArray(data) ? data.length : data?.total || data?.count || 0;
          setDataCounts(prev => ({ ...prev, [table.key]: count }));
        } catch (err) {
          // Jika summary tidak ada, coba fetch data biasa
          try {
            const data = await apiFetch(table.endpoint);
            const count = Array.isArray(data) ? data.length : (data?.items?.length || 0);
            setDataCounts(prev => ({ ...prev, [table.key]: count }));
          } catch (err2) {
            console.error(`Error fetching ${table.label}:`, err2);
            setDataCounts(prev => ({ ...prev, [table.key]: 0 }));
          }
        }
      } catch (err) {
        console.error(`Error fetching ${table.label}:`, err);
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
    <div className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 bg-gradient-to-br ${color} rounded-xl text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{accessibleTables.length} tabel tersedia</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessibleTables.map((table) => (
          <ChartCard
            key={table.key}
            table={table}
            dataCount={dataCounts[table.key] || 0}
            isLoading={loadingStates[table.key]}
            isExpanded={expandedCards[table.key]}
            onExpand={() => toggleExpand(table.key)}
            role={role}
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Laporan & Grafik</h1>
              <p className="text-gray-600">Ringkasan data dan grafik untuk semua tabel penjaminan mutu</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

        {/* Section Data Dosen */}
        {hasDosenAccess && (
          <ReportSection
            title="Data Dosen"
            icon={Users}
            tables={[
              { key: "dosen", label: "Tabel Dosen", endpoint: "/dosen", accessKey: "dosen", description: "Data Dosen" }
            ]}
            role={role}
            color="from-green-500 to-emerald-500"
          />
        )}

        {/* Section Data Pegawai */}
        {hasPegawaiAccess && (
          <ReportSection
            title="Data Pegawai"
            icon={Users}
            tables={[
              { key: "pegawai", label: "Tabel Pegawai", endpoint: "/pegawai", accessKey: "pegawai", description: "Data Pegawai" }
            ]}
            role={role}
            color="from-purple-500 to-violet-500"
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
            <Database size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak ada akses</h3>
            <p className="text-gray-600">Anda tidak memiliki akses untuk melihat laporan tabel.</p>
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { roleCan } from "../../../lib/role";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Handshake,
  Award,
  Circle
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
  { key: "3a3", label: "Tabel 3A-3", endpoint: "/tabel-3a3-pengembangan-dtpr/detail", accessKey: "tabel_3a3_pengembangan_dtpr", description: "Pengembangan DTPR di Bidang Penelitian" },
];

// Definisi semua tabel C4
const C4_TABLES = [
  { key: "4a1", label: "Tabel 4A-1", endpoint: "/tabel-4a1-sarpras-pkm", accessKey: "tabel_4a1_sarpras_pkm", description: "Sarana Prasarana PKM" },
  { key: "4a2", label: "Tabel 4A-2", endpoint: "/tabel-4a2", accessKey: "tabel_4a2", description: "Pengabdian Kepada Masyarakat" },
];

// Definisi semua tabel C5
const C5_TABLES = [
  { key: "5a1", label: "Tabel 5A-1", endpoint: "/tabel-5a1", accessKey: "tabel_5a1", description: "Kerjasama" },
  { key: "5a2", label: "Tabel 5A-2", endpoint: "/tabel-5a2", accessKey: "tabel_5a2", description: "Kerjasama Lanjutan" },
];

// Definisi semua tabel C6
const C6_TABLES = [
  { key: "6a1", label: "Tabel 6A-1", endpoint: "/tabel-6a1", accessKey: "tabel_6a1", description: "Luaran dan Capaian" },
  { key: "6a2", label: "Tabel 6A-2", endpoint: "/tabel-6a2", accessKey: "tabel_6a2", description: "Capaian Tridharma" },
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

// Komponen Grafik untuk setiap kategori (C1, C2, C3) - Terpisah sesuai sub judul
const GrafikSection = ({ tables, role, color, icon: Icon, title, categoryName, showCards = true }) => {
  const [barData, setBarData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk fetch data count dari API
  const fetchTableDataCount = async (endpoint, tsId = null) => {
    try {
      const BASE_URL = "http://localhost:3000/api";
      let url = `${BASE_URL}${endpoint}`;
      
      if (tsId) {
        url += `${url.includes('?') ? '&' : '?'}ts_id=${tsId}`;
      }
      
      const response = await fetch(url, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      
      if (data?.total !== undefined) {
        return data.total;
      } else if (data?.count !== undefined) {
        return data.count;
      } else if (data?.data && Array.isArray(data.data)) {
        return data.data.length;
      } else if (Array.isArray(data)) {
        return data.length;
      } else if (data?.items && Array.isArray(data.items)) {
        return data.items.length;
      }
      
      return 0;
    } catch (error) {
      console.warn(`Failed to fetch data for ${endpoint}:`, error);
      return 0;
    }
  };

  // Fungsi untuk mendapatkan tahun terbaru
  const getLatestTahunId = async () => {
    try {
      const BASE_URL = "http://localhost:3000/api";
      const response = await fetch(`${BASE_URL}/tahun-akademik`, {
        credentials: "include",
        mode: "cors",
      });
      
      if (!response.ok) {
        return new Date().getFullYear();
      }
      
      const data = await response.json();
      const tahunList = Array.isArray(data) ? data : (data?.items || []);
      
      if (tahunList.length === 0) {
        return new Date().getFullYear();
      }
      
      const currentYear = new Date().getFullYear();
      const tahunTerpilih = tahunList.find(t => {
        const tahunStr = String(t.tahun || t.nama || '');
        return tahunStr.includes(String(currentYear));
      });
      
      if (tahunTerpilih) {
        return tahunTerpilih.id_tahun;
      }
      
      const sorted = tahunList.sort((a, b) => (b.id_tahun || 0) - (a.id_tahun || 0));
      return sorted[0]?.id_tahun || new Date().getFullYear();
    } catch (error) {
      console.warn('Failed to fetch tahun akademik:', error);
      return new Date().getFullYear();
    }
  };

  // Fetch data grafik
  const fetchChartData = useCallback(async () => {
    if (!role) return;
    
    setLoading(true);
    
    const latestTahunId = await getLatestTahunId();
    
    const dataPromises = tables.map(async (table) => {
      if (!roleCan(role, table.accessKey, 'r')) return null;
      const needsTsId = ['3a3'].includes(table.key);
      const count = await fetchTableDataCount(table.endpoint, needsTsId ? latestTahunId : null);
      return { label: table.label.replace('Tabel ', ''), count };
    });

    const results = await Promise.all(dataPromises);
    const filteredResults = results.filter(Boolean);

    if (filteredResults.length === 0) {
      setBarData([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const chartBarData = filteredResults.map((item) => ({
      category: item.label,
      value: item.count
    }));

    const total = filteredResults.reduce((sum, item) => sum + item.count, 0);

    setBarData(chartBarData);
    setTotalCount(total);
    setLoading(false);
  }, [tables, role]);

  useEffect(() => {
    if (role) {
      fetchChartData();
    } else {
      setLoading(false);
    }
  }, [role, fetchChartData]);

  // Hitung persentase untuk progress bar
  const maxValue = 100;
  const calculatePercentage = (count) => Math.min((count / maxValue) * 100, 100);
  const percentage = calculatePercentage(totalCount);

  // Cek apakah user punya akses ke setidaknya satu tabel
  const hasAccess = tables.some(table => roleCan(role, table.accessKey, 'r'));

  if (!hasAccess) {
    return null;
  }

  // Warna stroke berdasarkan kategori
  const getStrokeColor = () => {
    if (categoryName === 'C1') return '#3b82f6';
    if (categoryName === 'C2') return '#8b5cf6';
    if (categoryName === 'C3') return '#10b981';
    if (categoryName === 'C4') return '#14b8a6'; // teal-500
    if (categoryName === 'C5') return '#f59e0b'; // amber-500
    if (categoryName === 'C6') return '#f43f5e'; // rose-500
    if (categoryName === 'Panel Admin') return '#10b981';
    return '#3b82f6';
  };

  const strokeColor = getStrokeColor();

  // Hitung jumlah tabel yang bisa diakses
  const accessibleTablesCount = tables.filter(table => roleCan(role, table.accessKey, 'r')).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-14"
    >
      {/* Sub Judul Baru - Di atas card */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Grafik Card - Dengan judul dan icon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6"
      >
        {/* Header dengan Icon dan Judul */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${color} text-white shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{categoryName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{title}</p>
          </div>
        </div>

        {/* Deskripsi Grafik untuk Semua Kategori */}
        {categoryName === 'C1' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C1 (Visi, Misi, Tujuan, dan Sasaran). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'C2' && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C2 (Mahasiswa, Lulusan, dan Pengguna). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'C3' && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C3 (Penelitian). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'C4' && (
          <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C4 (Pengabdian Kepada Masyarakat). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'C5' && (
          <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C5 (Kerjasama). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'C6' && (
          <div className="mb-4 p-4 bg-rose-50 rounded-lg border border-rose-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari setiap tabel dalam Standar C6 (Luaran dan Capaian). 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {categoryName === 'Panel Admin' && (
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Grafik ini menampilkan jumlah data dari tabel Dosen dan Pegawai. 
              Setiap titik pada grafik mewakili jumlah data yang tersedia pada tabel terkait, membantu Anda melihat 
              distribusi dan kelengkapan data secara visual.
            </p>
          </div>
        )}

        {loading ? (
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={barData || []} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'dataMax']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px'
                  }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone"
                  dataKey="value" 
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={{ fill: strokeColor, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Jumlah Data"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Progress Bar dengan Icon - Untuk Semua Grafik */}
        {!loading && (
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-shrink-0">
              <Circle className={`w-5 h-5 ${categoryName === 'C1' ? 'text-blue-500' : categoryName === 'C2' ? 'text-purple-500' : categoryName === 'C3' ? 'text-green-500' : categoryName === 'C4' ? 'text-teal-500' : categoryName === 'C5' ? 'text-amber-500' : categoryName === 'C6' ? 'text-rose-500' : 'text-green-500'}`} strokeWidth={2} fill="none" />
            </div>
            <div className="flex-1 relative">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    categoryName === 'C1' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                    categoryName === 'C2' ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                    categoryName === 'C3' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                    categoryName === 'C4' ? 'bg-gradient-to-r from-teal-400 to-teal-500' :
                    categoryName === 'C5' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    categoryName === 'C6' ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                    'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className={`text-sm font-medium ${
                categoryName === 'C1' ? 'text-blue-500/70' :
                categoryName === 'C2' ? 'text-purple-500/70' :
                categoryName === 'C3' ? 'text-green-500/70' :
                categoryName === 'C4' ? 'text-teal-500/70' :
                categoryName === 'C5' ? 'text-amber-500/70' :
                categoryName === 'C6' ? 'text-rose-500/70' :
                'text-green-500/70'
              }`}>{percentage.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </motion.div>
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
    "tabel_3a2_penelitian",
    "tabel_3a3_pengembangan_dtpr"
  ];
  const hasC3Access = useMemo(() => c3AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c4AccessKeys = [
    "tabel_4a1_sarpras_pkm",
    "tabel_4a2"
  ];
  const hasC4Access = useMemo(() => c4AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c5AccessKeys = [
    "tabel_5a1",
    "tabel_5a2"
  ];
  const hasC5Access = useMemo(() => c5AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c6AccessKeys = [
    "tabel_6a1",
    "tabel_6a2"
  ];
  const hasC6Access = useMemo(() => c6AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const hasDosenAccess = useMemo(() => roleCan(role, "dosen", "r"), [role]);
  const hasPegawaiAccess = useMemo(() => roleCan(role, "pegawai", "r"), [role]);
  const hasUsersAccess = useMemo(() => roleCan(role, "users", "r") || roleCan(role, "user_management", "r") || roleCan(role, "manajemen_akun", "r"), [role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white py-10 px-4 sm:px-6 lg:px-8">
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
          <GrafikSection
            tables={C1_TABLES}
            role={role}
            color="from-blue-500 to-cyan-500"
            icon={Database}
            title="Standar C1 - Visi, Misi, Tujuan, dan Sasaran"
            categoryName="C1"
            showCards={false}
          />
        )}

        {/* Section C2 */}
        {hasC2Access && (
          <GrafikSection
            tables={C2_TABLES}
            role={role}
            color="from-purple-500 to-violet-500"
            icon={TrendingUp}
            title="Standar C2 - Mahasiswa, Lulusan, dan Pengguna"
            categoryName="C2"
            showCards={false}
          />
        )}

        {/* Section C3 */}
        {hasC3Access && (
          <GrafikSection
            tables={C3_TABLES}
            role={role}
            color="from-green-500 to-emerald-500"
            icon={FileText}
            title="Standar C3 - Penelitian"
            categoryName="C3"
            showCards={false}
          />
        )}

        {/* Section C4 */}
        {hasC4Access && (
          <GrafikSection
            tables={C4_TABLES}
            role={role}
            color="from-teal-500 to-cyan-500"
            icon={Building2}
            title="Standar C4 - Pengabdian Kepada Masyarakat"
            categoryName="C4"
            showCards={false}
          />
        )}

        {/* Section C5 */}
        {hasC5Access && (
          <GrafikSection
            tables={C5_TABLES}
            role={role}
            color="from-amber-500 to-orange-500"
            icon={Handshake}
            title="Standar C5 - Kerjasama"
            categoryName="C5"
            showCards={false}
          />
        )}

        {/* Section C6 */}
        {hasC6Access && (
          <GrafikSection
            tables={C6_TABLES}
            role={role}
            color="from-rose-500 to-pink-500"
            icon={Award}
            title="Standar C6 - Luaran dan Capaian"
            categoryName="C6"
            showCards={false}
          />
        )}

        {/* Section Panel Admin - Data Dosen, Pegawai, dan Users */}
        {(hasDosenAccess || hasPegawaiAccess || hasUsersAccess) && (
          <GrafikSection
            tables={[
              ...(hasDosenAccess ? [{ key: "dosen", label: "Tabel Dosen", endpoint: "/dosen", accessKey: "dosen", description: "Data Dosen" }] : []),
              ...(hasPegawaiAccess ? [{ key: "pegawai", label: "Tabel Pegawai", endpoint: "/pegawai", accessKey: "pegawai", description: "Data Pegawai" }] : []),
              ...(hasUsersAccess ? [{ key: "users", label: "Tabel Users", endpoint: "/users", accessKey: "users", description: "Manajemen Akun" }] : [])
            ]}
            role={role}
            color="from-green-500 to-emerald-500"
            icon={Users}
            title="Panel Admin"
            categoryName="Panel Admin"
            showCards={false}
          />
        )}

        {/* Empty State */}
        {!hasC1Access && !hasC2Access && !hasC3Access && !hasC4Access && !hasC5Access && !hasC6Access && !hasDosenAccess && !hasPegawaiAccess && !hasUsersAccess && (
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


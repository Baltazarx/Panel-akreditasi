"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Calendar, ClipboardList, FileText, Award, ArrowRight, Clock, Tag, AlertCircle, TrendingUp, Users, BookOpen, Upload, X, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Data berita sederhana
const tpmNewsData = [
  {
    id: 1,
    icon: ClipboardList,
    color: "blue",
    title: "Pelaksanaan Audit Mutu Internal (AMI) Siklus Ke-12",
    excerpt: "AMI Siklus ke-12 akan segera dilaksanakan untuk seluruh program studi dan unit kerja di lingkungan STIKOM. Persiapkan dokumen dan bukti kinerja Anda.",
    content: "Audit Mutu Internal (AMI) Siklus Ke-12 akan dilaksanakan mulai tanggal 15 Oktober 2025 hingga 30 November 2025. Kegiatan ini meliputi audit terhadap semua program studi dan unit kerja di lingkungan STIKOM.",
    date: "2025-10-02",
    readTime: "5 menit",
    priority: "high",
    author: "Tim TPM",
    tags: ["audit", "mutu", "internal"]
  },
  {
    id: 2,
    icon: Award,
    color: "emerald",
    title: "Program Studi S1 Sistem Informasi Berhasil Meraih Akreditasi 'Unggul'",
    excerpt: "Selamat kepada seluruh civitas akademika atas pencapaian luar biasa ini. Akreditasi 'Unggul' merupakan bukti komitmen kita terhadap kualitas.",
    content: "Program Studi S1 Sistem Informasi STIKOM berhasil meraih akreditasi 'Unggul' dari BAN-PT dengan nilai 375. Pencapaian ini merupakan hasil dari kerja keras seluruh civitas akademika.",
    date: "2025-09-28",
    readTime: "3 menit",
    priority: "high",
    author: "Ketua Program Studi SI",
    tags: ["akreditasi", "unggul", "sistem-informasi"]
  },
  {
    id: 3,
    icon: FileText,
    color: "amber",
    title: "Pembaruan Standar Operasional Prosedur (SOP) Penelitian Dosen",
    excerpt: "Telah diterbitkan SOP baru terkait prosedur pengajuan, pelaksanaan, dan pelaporan penelitian dosen untuk meningkatkan luaran yang berkualitas.",
    content: "SOP baru untuk penelitian dosen telah diterbitkan dengan beberapa perubahan signifikan. SOP ini mencakup prosedur pengajuan proposal, proses review, dan pelaporan hasil.",
    date: "2025-09-20",
    readTime: "4 menit",
    priority: "medium",
    author: "Ketua LPPM",
    tags: ["sop", "penelitian", "dosen"]
  },
  {
    id: 4,
    icon: ShieldCheck,
    color: "indigo",
    title: "Workshop Penyusunan Laporan Evaluasi Diri (LED) untuk Akreditasi",
    excerpt: "TPM mengundang para Ketua Program Studi dan tim akreditasi untuk mengikuti workshop intensif mengenai strategi penyusunan LED yang efektif.",
    content: "Workshop penyusunan LED akan dilaksanakan pada tanggal 25-27 September 2025 di Ruang Seminar STIKOM. Workshop ini akan membahas strategi penyusunan LED yang efektif.",
    date: "2025-09-15",
    readTime: "6 menit",
    priority: "medium",
    author: "Tim TPM",
    tags: ["workshop", "led", "akreditasi"]
  }
];

// Komponen Kartu Berita dengan Error Boundary
const NewsCard = ({ post }) => {
  const categoryStyles = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  // Default icon dan color jika tidak ada
  const IconComponent = post.icon || FileText;
  const color = post.color || 'blue';

  // Format tanggal untuk display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle click untuk membuka detail berita
  const handleReadMore = (e) => {
    e.preventDefault();
    // Simulasi navigasi ke halaman detail
    console.log(`Membuka detail berita: ${post.title}`);
    // Di implementasi nyata, ini akan menggunakan router.push atau modal
  };
  
  return (
    <motion.article 
      variants={itemVariants}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#0384d6]/20 focus-within:ring-2 focus-within:ring-[#0384d6]/20"
      role="article"
      aria-labelledby={`news-title-${post.id}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {post.priority === 'high' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700" aria-label="Berita prioritas tinggi">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" aria-hidden="true"></div>
                Prioritas Tinggi
              </span>
            )}
            {post.priority === 'medium' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700" aria-label="Berita prioritas sedang">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" aria-hidden="true"></div>
                Prioritas Sedang
              </span>
            )}
            {post.priority === 'low' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700" aria-label="Berita prioritas rendah">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" aria-hidden="true"></div>
                Prioritas Rendah
              </span>
            )}
            {post.status && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                post.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : post.status === 'draft' 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-orange-100 text-orange-700'
              }`} aria-label={`Status: ${post.status}`}>
                {post.status === 'published' ? 'Diterbitkan' : post.status === 'draft' ? 'Draft' : 'Diarsipkan'}
              </span>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryStyles[color]} shadow-md group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
            <IconComponent className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <h3 id={`news-title-${post.id}`} className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#043975] transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-gray-600 mb-4 leading-relaxed text-sm">
          {post.excerpt}
        </p>

        {/* Author & User Info */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Oleh: <span className="font-medium">{post.author}</span></span>
            {post.nama_user && (
              <span className="text-xs text-gray-400">({post.nama_user})</span>
            )}
          </div>
          {post.created_at && (
            <div className="text-xs text-gray-400">
              Dibuat: {new Date(post.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>

        {/* Tags - hanya tampilkan jika ada tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1" aria-label={`Tanggal: ${formatDate(post.date)}`}>
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="flex items-center gap-1" aria-label={`Waktu baca: ${post.readTime}`}>
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{post.readTime}</span>
            </div>
          </div>
          
          <button 
            onClick={handleReadMore}
            className="inline-flex items-center gap-1 text-[#0384d6] hover:text-[#043975] font-medium text-xs transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#0384d6]/20 focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label={`Baca lebih lanjut: ${post.title}`}
          >
            Baca
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Terjadi Kesalahan</h3>
          <p className="text-red-600">Maaf, terjadi kesalahan saat memuat berita. Silakan refresh halaman.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Skeleton Component
const NewsCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-12 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Komponen Halaman Utama
export default function TpmNewsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    priority: 'medium',
    tags: '',
    icon: 'FileText',
    color: 'blue'
  });

  // Dropdown state
  const [openIconDropdown, setOpenIconDropdown] = useState(false);
  const [iconDropdownPosition, setIconDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [openColorDropdown, setOpenColorDropdown] = useState(false);
  const [colorDropdownPosition, setColorDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState(false);
  const [priorityDropdownPosition, setPriorityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const iconOptions = [
    { value: 'ClipboardList', label: 'Clipboard', component: ClipboardList },
    { value: 'Award', label: 'Award', component: Award },
    { value: 'FileText', label: 'File', component: FileText },
    { value: 'ShieldCheck', label: 'Shield', component: ShieldCheck },
    { value: 'BookOpen', label: 'Book', component: BookOpen },
    { value: 'Users', label: 'Users', component: Users },
    { value: 'TrendingUp', label: 'Trending', component: TrendingUp },
  ];

  const colorOptions = [
    { value: 'blue', label: 'Biru' },
    { value: 'emerald', label: 'Hijau' },
    { value: 'amber', label: 'Kuning' },
    { value: 'indigo', label: 'Indigo' },
  ];

  const calculateReadTime = (content) => {
    if (!content) return '0 menit';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} menit`;
  };

  // Mapping data dari backend ke format frontend
  const mapBackendToFrontend = (backendData) => {
    return backendData.map(item => ({
      id: item.id_berita,
      title: item.judul,
      excerpt: item.ringkasan,
      content: item.konten,
      author: item.penulis,
      priority: item.prioritas || 'medium',
      status: item.status || 'published',
      date: item.tanggal_publikasi,
      readTime: item.waktu_baca || calculateReadTime(item.konten),
      nama_user: item.nama_user || null,
      id_user: item.id_user || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
      // Default values untuk icon dan color (karena tidak ada di backend)
      icon: FileText,
      color: 'blue',
      tags: [], // Tags tidak ada di backend
      deleted_at: item.deleted_at // Simpan untuk filter
    }));
  };

  // Fetch data dari API
  const fetchBerita = async () => {
    setIsLoading(true);
    try {
      // Fetch hanya berita yang published dan tidak dihapus
      const data = await apiFetch('/berita?status=published');
      const mappedData = mapBackendToFrontend(Array.isArray(data) ? data : []);
      // Filter out deleted items (jika ada deleted_at)
      const activeData = mappedData.filter(item => !item.deleted_at);
      setNewsData(activeData);
    } catch (error) {
      console.error('Error fetching berita:', error);
      setNewsData([]);
      // Tampilkan error hanya jika bukan network error
      if (!error.isNetworkError) {
        console.warn('Gagal mengambil data berita dari server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data saat component mount
  useEffect(() => {
    fetchBerita();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showUploadModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, scrollY);
      };
    }
  }, [showUploadModal]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openIconDropdown && !event.target.closest('.icon-dropdown-container') && !event.target.closest('.icon-dropdown-menu')) {
        setOpenIconDropdown(false);
      }
      if (openColorDropdown && !event.target.closest('.color-dropdown-container') && !event.target.closest('.color-dropdown-menu')) {
        setOpenColorDropdown(false);
      }
      if (openPriorityDropdown && !event.target.closest('.priority-dropdown-container') && !event.target.closest('.priority-dropdown-menu')) {
        setOpenPriorityDropdown(false);
      }
    };

    if (openIconDropdown || openColorDropdown || openPriorityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openIconDropdown, openColorDropdown, openPriorityDropdown]);

  // Close dropdowns when modal closes
  useEffect(() => {
    if (!showUploadModal) {
      setOpenIconDropdown(false);
      setOpenColorDropdown(false);
      setOpenPriorityDropdown(false);
    }
  }, [showUploadModal]);

  const handleUpload = async () => {
    // Validasi form
    if (!uploadForm.title.trim()) {
      alert('Judul berita wajib diisi');
      return;
    }
    if (!uploadForm.excerpt.trim()) {
      alert('Ringkasan berita wajib diisi');
      return;
    }
    if (!uploadForm.content.trim()) {
      alert('Konten berita wajib diisi');
      return;
    }
    if (!uploadForm.author.trim()) {
      alert('Penulis berita wajib diisi');
      return;
    }

    setUploading(true);
    try {
      // Mapping data dari frontend ke format backend
      const backendData = {
        judul: uploadForm.title.trim(),
        ringkasan: uploadForm.excerpt.trim(),
        konten: uploadForm.content.trim(),
        penulis: uploadForm.author.trim(),
        prioritas: uploadForm.priority || 'medium',
        status: 'published',
        tanggal_publikasi: new Date().toISOString().split('T')[0],
        waktu_baca: calculateReadTime(uploadForm.content)
      };

      const result = await apiFetch('/berita', {
        method: 'POST',
        body: JSON.stringify(backendData)
      });

      // Refresh data setelah upload berhasil
      await fetchBerita();
      
      setShowUploadModal(false);
      setOpenIconDropdown(false);
      setOpenColorDropdown(false);
      setOpenPriorityDropdown(false);
      setUploadForm({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        priority: 'medium',
        tags: '',
        icon: 'FileText',
        color: 'blue'
      });
      alert('Berita berhasil dipublikasikan!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Gagal mempublikasikan berita: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Hero Section */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#043975] to-[#0384d6] rounded-2xl mb-6 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Berita & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#043975] to-[#0384d6]">Pengumuman</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Informasi resmi dan terkini terkait siklus penjaminan mutu di lingkungan STIKOM. 
              Dapatkan update terbaru tentang akreditasi, audit, dan pengembangan kualitas pendidikan.
            </p>
            <motion.button
              onClick={() => setShowUploadModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Berita</span>
            </motion.button>
          </motion.div>


          {/* Grid Kartu Berita */}
          <motion.div 
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, index) => (
                  <NewsCardSkeleton key={`skeleton-${index}`} />
                ))
              ) : (
                newsData.map(post => (
                  <NewsCard key={post.id} post={post} />
                ))
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
              style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !uploading) {
                  setShowUploadModal(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
                style={{ zIndex: 10000 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                  <h2 className="text-xl font-bold">Upload Berita Baru</h2>
                  <p className="text-white/80 mt-1 text-sm">Lengkapi informasi berita untuk dipublikasikan.</p>
                </div>
                <div className="p-8">
                  <form 
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpload();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Judul */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                          Judul Berita <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                          disabled={uploading}
                          placeholder="Masukkan judul berita"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      {/* Ringkasan */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700">
                          Ringkasan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="excerpt"
                          value={uploadForm.excerpt}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, excerpt: e.target.value }))}
                          disabled={uploading}
                          placeholder="Masukkan ringkasan berita (akan ditampilkan di card)"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      {/* Konten */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                          Konten Lengkap <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="content"
                          value={uploadForm.content}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                          disabled={uploading}
                          placeholder="Masukkan konten lengkap berita"
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      {/* Penulis */}
                      <div className="space-y-2">
                        <label htmlFor="author" className="block text-sm font-semibold text-gray-700">
                          Penulis <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="author"
                          value={uploadForm.author}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, author: e.target.value }))}
                          disabled={uploading}
                          placeholder="Nama penulis"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                        />
                      </div>

                      {/* Prioritas */}
                      <div className="space-y-2">
                        <label htmlFor="priority" className="block text-sm font-semibold text-gray-700">
                          Prioritas
                        </label>
                        <div className="relative priority-dropdown-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setPriorityDropdownPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setOpenPriorityDropdown(!openPriorityDropdown);
                              setOpenIconDropdown(false);
                              setOpenColorDropdown(false);
                            }}
                            disabled={uploading}
                            className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                              uploadForm.priority 
                                ? 'border-[#0384d6] bg-white' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Pilih prioritas"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className={`truncate ${uploadForm.priority ? 'text-gray-900' : 'text-gray-500'}`}>
                                {uploadForm.priority === 'low' ? 'Rendah' : uploadForm.priority === 'medium' ? 'Sedang' : uploadForm.priority === 'high' ? 'Tinggi' : 'Pilih prioritas...'}
                              </span>
                            </div>
                            <ChevronDown 
                              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                openPriorityDropdown ? 'rotate-180' : ''
                              }`} 
                              size={18} 
                            />
                          </button>
                          {openPriorityDropdown && (
                            <div 
                              className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 priority-dropdown-menu"
                              style={{
                                top: `${priorityDropdownPosition.top}px`,
                                left: `${priorityDropdownPosition.left}px`,
                                width: `${priorityDropdownPosition.width || 300}px`,
                                minWidth: '200px'
                              }}
                            >
                              {['low', 'medium', 'high'].map((priority) => (
                                <button
                                  key={priority}
                                  type="button"
                                  onClick={() => {
                                    setUploadForm(prev => ({ ...prev, priority }));
                                    setOpenPriorityDropdown(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                    uploadForm.priority === priority
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <span className="truncate">
                                    {priority === 'low' ? 'Rendah' : priority === 'medium' ? 'Sedang' : 'Tinggi'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="space-y-2">
                        <label htmlFor="icon" className="block text-sm font-semibold text-gray-700">
                          Icon
                        </label>
                        <div className="relative icon-dropdown-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setIconDropdownPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setOpenIconDropdown(!openIconDropdown);
                              setOpenPriorityDropdown(false);
                              setOpenColorDropdown(false);
                            }}
                            disabled={uploading}
                            className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                              uploadForm.icon 
                                ? 'border-[#0384d6] bg-white' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Pilih icon"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {(() => {
                                const selectedIcon = iconOptions.find(opt => opt.value === uploadForm.icon);
                                const IconComponent = selectedIcon?.component || FileText;
                                return <IconComponent className="text-[#0384d6] flex-shrink-0" size={18} />;
                              })()}
                              <span className={`truncate ${uploadForm.icon ? 'text-gray-900' : 'text-gray-500'}`}>
                                {iconOptions.find(opt => opt.value === uploadForm.icon)?.label || 'Pilih icon...'}
                              </span>
                            </div>
                            <ChevronDown 
                              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                openIconDropdown ? 'rotate-180' : ''
                              }`} 
                              size={18} 
                            />
                          </button>
                          {openIconDropdown && (
                            <div 
                              className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto icon-dropdown-menu"
                              style={{
                                top: `${iconDropdownPosition.top}px`,
                                left: `${iconDropdownPosition.left}px`,
                                width: `${iconDropdownPosition.width || 300}px`,
                                minWidth: '200px'
                              }}
                            >
                              {iconOptions.map((option) => {
                                const IconComponent = option.component;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setUploadForm(prev => ({ ...prev, icon: option.value }));
                                      setOpenIconDropdown(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                      uploadForm.icon === option.value
                                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    <IconComponent className="text-[#0384d6] flex-shrink-0" size={16} />
                                    <span className="truncate">{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Warna */}
                      <div className="space-y-2">
                        <label htmlFor="color" className="block text-sm font-semibold text-gray-700">
                          Warna
                        </label>
                        <div className="relative color-dropdown-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setColorDropdownPosition({
                                top: rect.bottom + 4,
                                left: rect.left,
                                width: rect.width
                              });
                              setOpenColorDropdown(!openColorDropdown);
                              setOpenPriorityDropdown(false);
                              setOpenIconDropdown(false);
                            }}
                            disabled={uploading}
                            className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                              uploadForm.color 
                                ? 'border-[#0384d6] bg-white' 
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Pilih warna"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div 
                                className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                  uploadForm.color === 'blue' ? 'bg-blue-500' :
                                  uploadForm.color === 'emerald' ? 'bg-emerald-500' :
                                  uploadForm.color === 'amber' ? 'bg-amber-500' :
                                  uploadForm.color === 'indigo' ? 'bg-indigo-500' :
                                  'bg-gray-300'
                                }`}
                              />
                              <span className={`truncate ${uploadForm.color ? 'text-gray-900' : 'text-gray-500'}`}>
                                {colorOptions.find(opt => opt.value === uploadForm.color)?.label || 'Pilih warna...'}
                              </span>
                            </div>
                            <ChevronDown 
                              className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                openColorDropdown ? 'rotate-180' : ''
                              }`} 
                              size={18} 
                            />
                          </button>
                          {openColorDropdown && (
                            <div 
                              className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 color-dropdown-menu"
                              style={{
                                top: `${colorDropdownPosition.top}px`,
                                left: `${colorDropdownPosition.left}px`,
                                width: `${colorDropdownPosition.width || 300}px`,
                                minWidth: '200px'
                              }}
                            >
                              {colorOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setUploadForm(prev => ({ ...prev, color: option.value }));
                                    setOpenColorDropdown(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                    uploadForm.color === option.value
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <div 
                                    className={`w-4 h-4 rounded-full flex-shrink-0 ${
                                      option.value === 'blue' ? 'bg-blue-500' :
                                      option.value === 'emerald' ? 'bg-emerald-500' :
                                      option.value === 'amber' ? 'bg-amber-500' :
                                      option.value === 'indigo' ? 'bg-indigo-500' :
                                      'bg-gray-300'
                                    }`}
                                  />
                                  <span className="truncate">{option.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Note untuk Warna */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <AlertCircle className="text-blue-600 flex-shrink-0" size={16} />
                          <p className="text-sm text-blue-700">Warna digunakan untuk menampilkan gradient background pada icon berita di card. Pilih warna yang sesuai dengan kategori atau tema berita.</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                          Tags <span className="text-gray-400 text-xs font-normal">(pisahkan dengan koma)</span>
                        </label>
                        <input
                          type="text"
                          id="tags"
                          value={uploadForm.tags}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                          disabled={uploading}
                          placeholder="contoh: audit, mutu, internal"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                      <button 
                        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                        type="button" 
                        onClick={() => {
                          if (!uploading) {
                            setShowUploadModal(false);
                            setOpenIconDropdown(false);
                            setOpenColorDropdown(false);
                            setOpenPriorityDropdown(false);
                            setUploadForm({
                              title: '',
                              excerpt: '',
                              content: '',
                              author: '',
                              priority: 'medium',
                              tags: '',
                              icon: 'FileText',
                              color: 'blue'
                            });
                          }
                        }}
                        disabled={uploading}
                      >
                        <span className="relative z-10">Batal</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                      </button>
                      <button 
                        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2 flex items-center justify-center gap-2" 
                        disabled={uploading || !uploadForm.title.trim() || !uploadForm.excerpt.trim() || !uploadForm.content.trim() || !uploadForm.author.trim()} 
                        type="submit"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                            <span className="relative z-10">Mengupload...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Publikasikan Berita</span>
                          </>
                        )}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </ErrorBoundary>
  );
}
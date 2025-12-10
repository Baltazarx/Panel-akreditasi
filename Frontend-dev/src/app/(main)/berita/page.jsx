"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, Calendar, ClipboardList, FileText, Award, ArrowRight, Clock, Tag, AlertCircle, TrendingUp, Users, BookOpen, Upload, X, Loader2, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../../lib/api';
import Swal from 'sweetalert2';

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
const NewsCard = ({ post, onEdit, onDelete, onReadMore }) => {
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
    e.stopPropagation();
    if (onReadMore) {
      onReadMore(post);
    }
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
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(post);
                }}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 rounded-md px-2 py-1 hover:bg-blue-50"
                aria-label={`Edit berita: ${post.title}`}
                title="Edit Berita"
              >
                <Edit2 className="w-3 h-3" aria-hidden="true" />
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(post.id);
                }}
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-xs transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 rounded-md px-2 py-1 hover:bg-red-50"
                aria-label={`Hapus berita: ${post.title}`}
                title="Hapus Berita"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                Hapus
              </button>
            )}
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    priority: 'medium'
  });

  // Dropdown state untuk prioritas
  const [openPriorityDropdown, setOpenPriorityDropdown] = useState(false);
  const [priorityDropdownPosition, setPriorityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const calculateReadTime = (content) => {
    if (!content) return '0 menit';
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} menit`;
  };

  // Generate icon dan color otomatis berdasarkan judul dan prioritas
  const generateIconAndColor = (judul, prioritas) => {
    const judulLower = judul?.toLowerCase() || '';
    
    // Tentukan icon berdasarkan kata kunci di judul
    let icon = FileText;
    let color = 'blue';
    
    if (judulLower.includes('audit') || judulLower.includes('ami') || judulLower.includes('mutu')) {
      icon = ShieldCheck;
      color = 'indigo';
    } else if (judulLower.includes('akreditasi') || judulLower.includes('unggul') || judulLower.includes('prestasi')) {
      icon = Award;
      color = 'emerald';
    } else if (judulLower.includes('sop') || judulLower.includes('prosedur') || judulLower.includes('dokumen')) {
      icon = FileText;
      color = 'amber';
    } else if (judulLower.includes('workshop') || judulLower.includes('pelatihan') || judulLower.includes('seminar')) {
      icon = BookOpen;
      color = 'blue';
    } else if (judulLower.includes('penelitian') || judulLower.includes('pkm') || judulLower.includes('hibah')) {
      icon = TrendingUp;
      color = 'emerald';
    } else if (judulLower.includes('mahasiswa') || judulLower.includes('kemahasiswaan')) {
      icon = Users;
      color = 'blue';
    } else if (judulLower.includes('pengumuman') || judulLower.includes('informasi')) {
      icon = ClipboardList;
      color = 'blue';
    } else {
      // Default berdasarkan prioritas
      if (prioritas === 'high') {
        icon = ShieldCheck;
        color = 'indigo';
      } else if (prioritas === 'medium') {
        icon = FileText;
        color = 'blue';
      } else {
        icon = FileText;
        color = 'blue';
      }
    }
    
    return { icon, color };
  };

  // Mapping data dari backend ke format frontend
  const mapBackendToFrontend = (backendData) => {
    return backendData.map(item => {
      // Generate icon dan color otomatis
      const { icon, color } = generateIconAndColor(item.judul, item.prioritas);
      
      return {
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
        // Icon dan color di-generate otomatis
        icon: icon,
        color: color,
        tags: [], // Tags tidak ada di backend
        deleted_at: item.deleted_at // Simpan untuk filter
      };
    });
  };

  // Fetch data dari API
  const fetchBerita = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Fetch semua berita yang tidak dihapus (buildWhere otomatis filter deleted_at IS NULL)
      // Tambahkan timestamp untuk force refresh cache
      const url = forceRefresh 
        ? `/berita?t=${Date.now()}` 
        : '/berita';
      
      const data = await apiFetch(url);
      console.log('Raw API response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      
      // Pastikan data adalah array
      let dataArray = [];
      if (Array.isArray(data)) {
        dataArray = data;
      } else if (data && typeof data === 'object') {
        // Coba berbagai kemungkinan struktur response
        dataArray = data.data || data.items || data.results || Object.values(data);
      }
      
      console.log('Data array length:', dataArray.length);
      console.log('Data array:', dataArray);
      
      if (dataArray.length === 0) {
        console.warn('Tidak ada data berita yang ditemukan');
        setNewsData([]);
        setIsLoading(false);
        return;
      }
      
      // Map data ke format frontend
      const mappedData = mapBackendToFrontend(dataArray);
      console.log('Mapped data length:', mappedData.length);
      console.log('Mapped data:', mappedData);
      
      // Filter out deleted items (jika ada yang terlewat)
      const activeData = mappedData.filter(item => !item.deleted_at);
      console.log('Active data length (after filter):', activeData.length);
      console.log('Active data:', activeData);
      
      // Sort: Pinned berita di atas, lalu berdasarkan updated_at (terbaru di atas), lalu created_at
      activeData.sort((a, b) => {
        // Pinned berita selalu di atas
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        
        // Jika keduanya pinned atau tidak pinned, sort berdasarkan updated_at terlebih dahulu
        const updatedA = new Date(a.updated_at || a.created_at || 0);
        const updatedB = new Date(b.updated_at || b.created_at || 0);
        
        // Jika updated_at berbeda, sort berdasarkan updated_at (terbaru di atas)
        if (updatedA.getTime() !== updatedB.getTime()) {
          return updatedB - updatedA; // Descending (terbaru di atas)
        }
        
        // Jika updated_at sama, sort berdasarkan created_at atau tanggal publikasi
        const dateA = new Date(a.date || a.created_at || 0);
        const dateB = new Date(b.date || b.created_at || 0);
        return dateB - dateA; // Descending (terbaru di atas)
      });
      
      console.log('Setting newsData with', activeData.length, 'items');
      console.log('Setting newsData with', activeData.length, 'items');
      setNewsData(activeData);
      console.log('newsData state updated, current newsData.length:', newsData.length);
      console.log('newsData state updated');
    } catch (error) {
      console.error('Error fetching berita:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
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
    console.log('Component mounted, fetching berita...');
    fetchBerita();
  }, []);

  // Monitor perubahan newsData
  useEffect(() => {
    console.log('newsData changed, current length:', newsData.length);
    console.log('newsData content:', newsData);
  }, [newsData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showUploadModal || showEditModal || showDetailModal) {
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
  }, [showUploadModal, showEditModal, showDetailModal]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openPriorityDropdown && !event.target.closest('.priority-dropdown-container') && !event.target.closest('.priority-dropdown-menu')) {
        setOpenPriorityDropdown(false);
      }
    };

    if (openPriorityDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openPriorityDropdown]);

  // Close dropdowns when modal closes
  useEffect(() => {
    if (!showUploadModal && !showEditModal) {
      setOpenPriorityDropdown(false);
    }
  }, [showUploadModal, showEditModal]);

  const handleUpload = async () => {
    // Validasi form
    if (!uploadForm.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Judul berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.excerpt.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Ringkasan berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Konten berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.author.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Penulis berita wajib diisi'
      });
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

      console.log('Sending data to API:', backendData);
      const result = await apiFetch('/berita', {
        method: 'POST',
        body: JSON.stringify(backendData)
      });
      console.log('Upload response:', result);

      // Reset form
      setShowUploadModal(false);
      setOpenPriorityDropdown(false);
      setUploadForm({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        priority: 'medium'
      });

      // Refresh data setelah upload berhasil dengan force refresh
      // Gunakan setTimeout untuk memastikan modal sudah tertutup dan state sudah di-reset
      console.log('Refreshing data after upload...');
      setTimeout(async () => {
        try {
          await fetchBerita(true); // Force refresh dengan timestamp
          console.log('Data refresh completed successfully');
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }
      }, 200);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berita berhasil dipublikasikan!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Gagal mempublikasikan berita. Terjadi kesalahan.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle Edit Berita
  const handleEdit = (post) => {
    setEditingNews(post);
    setUploadForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      author: post.author || '',
      priority: post.priority || 'medium'
    });
    setShowEditModal(true);
  };

  // Handle Update Berita
  const handleUpdate = async () => {
    if (!editingNews) return;

    // Validasi form
    if (!uploadForm.title.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Judul berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.excerpt.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Ringkasan berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.content.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Konten berita wajib diisi'
      });
      return;
    }
    if (!uploadForm.author.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Penulis berita wajib diisi'
      });
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
        status: editingNews.status || 'published',
        tanggal_publikasi: editingNews.date || new Date().toISOString().split('T')[0],
        waktu_baca: calculateReadTime(uploadForm.content)
      };

      console.log('Updating berita:', editingNews.id, backendData);
      const result = await apiFetch(`/berita/${editingNews.id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });
      console.log('Update response:', result);

      // Reset form dan modal
      setShowEditModal(false);
      setEditingNews(null);
      setOpenPriorityDropdown(false);
      setUploadForm({
        title: '',
        excerpt: '',
        content: '',
        author: '',
        priority: 'medium'
      });

      // Refresh data setelah update berhasil (berita yang di-update akan muncul di posisi pertama)
      console.log('Refreshing data after update...');
      setTimeout(async () => {
        try {
          await fetchBerita(true);
          console.log('Data refresh completed successfully');
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }
      }, 200);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Berita berhasil diperbarui!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Gagal memperbarui berita. Terjadi kesalahan.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle Read More - Buka modal detail
  const handleReadMore = (post) => {
    setSelectedNews(post);
    setShowDetailModal(true);
  };

  // Handle Delete Berita (Hard Delete)
  const handleDelete = async (id) => {
    if (!id) return;
    
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Berita?',
      html: 'Apakah Anda yakin ingin menghapus berita ini secara <strong>permanen</strong>?<br/><br/>Tindakan ini <strong>tidak dapat dibatalkan</strong>.',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      console.log('Deleting berita:', id);
      // Hard delete langsung tanpa soft delete
      const result = await apiFetch(`/berita/${id}/hard`, {
        method: 'DELETE'
      });
      console.log('Delete response:', result);

      // Refresh data setelah delete berhasil
      console.log('Refreshing data after delete...');
      setTimeout(async () => {
        try {
          await fetchBerita(true);
          console.log('Data refresh completed successfully');
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }
      }, 200);
      
      Swal.fire({
        icon: 'success',
        title: 'Terhapus!',
        text: 'Berita berhasil dihapus secara permanen.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: error.message || 'Gagal menghapus berita. Terjadi kesalahan.'
      });
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
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <NewsCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : newsData.length > 0 ? (
              <AnimatePresence>
                {newsData.map((post, index) => {
                  console.log(`Rendering NewsCard ${index}:`, post);
                  return (
                    <NewsCard 
                      key={post.id || `news-${index}`} 
                      post={post}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReadMore={handleReadMore}
                    />
                  );
                })}
              </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Berita</h3>
                <p className="text-gray-500 mb-6">Belum ada berita yang dipublikasikan. Klik tombol "Upload Berita" untuk menambahkan berita pertama.</p>
              </div>
            )}
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                      <button 
                        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
                        type="button" 
                        onClick={() => {
                          if (!uploading) {
                            setShowUploadModal(false);
                            setOpenPriorityDropdown(false);
                            setUploadForm({
                              title: '',
                              excerpt: '',
                              content: '',
                              author: '',
                              priority: 'medium'
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

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && editingNews && (
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
              style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !uploading) {
                  setShowEditModal(false);
                  setEditingNews(null);
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
                  <h2 className="text-xl font-bold">Edit Berita</h2>
                  <p className="text-white/80 mt-1 text-sm">Perbarui informasi berita.</p>
                </div>
                <div className="p-8">
                  <form 
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate();
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Judul */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="edit-title" className="block text-sm font-semibold text-gray-700">
                          Judul Berita <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="edit-title"
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
                        <label htmlFor="edit-excerpt" className="block text-sm font-semibold text-gray-700">
                          Ringkasan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="edit-excerpt"
                          value={uploadForm.excerpt}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, excerpt: e.target.value }))}
                          disabled={uploading}
                          placeholder="Masukkan ringkasan berita"
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                          required
                        />
                      </div>

                      {/* Konten */}
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="edit-content" className="block text-sm font-semibold text-gray-700">
                          Konten <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="edit-content"
                          value={uploadForm.content}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                          disabled={uploading}
                          placeholder="Masukkan konten berita lengkap"
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                          required
                        />
                      </div>

                      {/* Penulis */}
                      <div className="space-y-2">
                        <label htmlFor="edit-author" className="block text-sm font-semibold text-gray-700">
                          Penulis <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="edit-author"
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
                        <label htmlFor="edit-priority" className="block text-sm font-semibold text-gray-700">
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
                            }}
                            disabled={uploading}
                            className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                              uploadForm.priority
                                ? 'border-[#0384d6] bg-white'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label="Pilih prioritas"
                          >
                            <span className={`truncate ${uploadForm.priority ? 'text-gray-900' : 'text-gray-500'}`}>
                              {uploadForm.priority === 'high' ? 'Tinggi' : uploadForm.priority === 'medium' ? 'Sedang' : 'Rendah'}
                            </span>
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
                              {[
                                { value: 'high', label: 'Tinggi' },
                                { value: 'medium', label: 'Sedang' },
                                { value: 'low', label: 'Rendah' }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    setUploadForm(prev => ({ ...prev, priority: option.value }));
                                    setOpenPriorityDropdown(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-[#eaf4ff] transition-colors ${
                                    uploadForm.priority === option.value
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                      <button 
                        type="button"
                        className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingNews(null);
                          setOpenPriorityDropdown(false);
                          setUploadForm({
                            title: '',
                            excerpt: '',
                            content: '',
                            author: '',
                            priority: 'medium'
                          });
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
                            <span className="relative z-10">Memperbarui...</span>
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Perbarui Berita</span>
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

        {/* Detail Berita Modal */}
        <AnimatePresence>
          {showDetailModal && selectedNews && (() => {
            const categoryStyles = {
              blue: "from-blue-500 to-blue-600",
              emerald: "from-emerald-500 to-emerald-600",
              amber: "from-amber-500 to-amber-600",
              indigo: "from-indigo-500 to-indigo-600",
            };
            const IconComponent = selectedNews.icon || FileText;
            const color = selectedNews.color || 'blue';
            
            return (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
              style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowDetailModal(false);
                  setSelectedNews(null);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden relative z-[10000] pointer-events-auto flex flex-col"
                style={{ zIndex: 10000 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryStyles[color]} shadow-md`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedNews.priority === 'high' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Prioritas Tinggi
                          </span>
                        )}
                        {selectedNews.priority === 'medium' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                            Prioritas Sedang
                          </span>
                        )}
                        {selectedNews.priority === 'low' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                            Prioritas Rendah
                          </span>
                        )}
                        {selectedNews.status && (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            selectedNews.status === 'published' || selectedNews.status === 'diterbitkan'
                              ? 'bg-green-100 text-green-700'
                              : selectedNews.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {selectedNews.status === 'published' || selectedNews.status === 'diterbitkan' ? 'Diterbitkan' : selectedNews.status === 'draft' ? 'Draft' : 'Diarsipkan'}
                          </span>
                        )}
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold">{selectedNews.title}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedNews(null);
                    }}
                    className="ml-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Tutup modal"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto flex-1">
                  {/* Meta Info */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {selectedNews.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(selectedNews.date).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {selectedNews.readTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{selectedNews.readTime}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">
                          Oleh: <span className="font-medium text-gray-700">{selectedNews.author}</span>
                        </span>
                        {selectedNews.nama_user && (
                          <span className="text-sm text-gray-400">
                            ({selectedNews.nama_user})
                          </span>
                        )}
                      </div>
                      {selectedNews.created_at && (() => {
                        const date = new Date(selectedNews.created_at);
                        const day = date.getDate();
                        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return (
                          <div className="text-sm text-gray-400">
                            Dibuat: {day} {month} {year} pukul {hours}.{minutes}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Excerpt */}
                  {selectedNews.excerpt && (
                    <div className="mb-6">
                      <p className="text-lg text-gray-700 leading-relaxed font-medium italic border-l-4 border-[#0384d6] pl-4">
                        {selectedNews.excerpt}
                      </p>
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-lg max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedNews.content || selectedNews.excerpt || 'Konten tidak tersedia.'}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {selectedNews.tags && selectedNews.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedNews.tags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="inline-block px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedNews(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
            );
          })()}
        </AnimatePresence>
      </main>
    </ErrorBoundary>
  );
}
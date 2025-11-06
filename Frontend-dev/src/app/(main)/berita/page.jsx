"use client";

import React, { useState, useMemo } from 'react';
import { ShieldCheck, Calendar, ClipboardList, FileText, Award, ArrowRight, Clock, Tag, AlertCircle, TrendingUp, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Format tanggal untuk display
  const formatDate = (dateString) => {
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
                Prioritas
              </span>
            )}
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryStyles[post.color]} shadow-md group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
            <post.icon className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <h3 id={`news-title-${post.id}`} className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#043975] transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-gray-600 mb-4 leading-relaxed text-sm">
          {post.excerpt}
        </p>

        {/* Author */}
        <div className="mb-4">
          <span className="text-xs text-gray-500">Oleh: <span className="font-medium">{post.author}</span></span>
        </div>

        {/* Tags */}
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
  const [isLoading, setIsLoading] = useState(false);

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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Informasi resmi dan terkini terkait siklus penjaminan mutu di lingkungan STIKOM. 
              Dapatkan update terbaru tentang akreditasi, audit, dan pengembangan kualitas pendidikan.
            </p>
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
                tpmNewsData.map(post => (
                  <NewsCard key={post.id} post={post} />
                ))
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </main>
    </ErrorBoundary>
  );
}
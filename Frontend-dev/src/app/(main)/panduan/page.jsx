"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiBookOpen, FiGrid, FiUser, FiShield, FiSearch, FiHome, FiArrowRight, FiCheckCircle, FiBarChart, FiTrendingUp, FiDatabase, FiFileText, FiDownload, FiSettings } from "react-icons/fi";
import { useRouter } from "next/navigation";

const fadeIn = {
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

export default function PanduanPage() {
  const router = useRouter();

  const sections = [
    {
      icon: FiHome,
      title: "Dashboard",
      desc: "Halaman utama setelah login menampilkan ringkasan data, berita terbaru, statistik, dan akses cepat ke semua fitur. Layout terbaru dengan card berita yang menampilkan 2 berita terbaru.",
      features: ["Akses Cepat Berita (2 item terbaru)", "Statistik cards (Total Tabel, Data Terisi, dll)", "Akses cepat ke tabel C1-C6, Data Dosen, Pegawai", "Selamat Datang section dengan info user"],
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FiGrid,
      title: "Akses Tabel Data",
      desc: "Akses semua tabel penjaminan mutu (C1, C2, C3, C4, C5, C6) melalui menu navigasi. Setiap tabel memiliki fitur CRUD lengkap dengan custom dropdown design.",
      features: ["Navigasi menu (Home, Tables, Berita, Panduan)", "Tabel C1-C6 lengkap", "Data Dosen & Pegawai", "Custom dropdown dengan icon", "Filter berdasarkan tahun & unit"],
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: FiFileText,
      title: "Berita & Pengumuman",
      desc: "Akses berita terbaru dan pengumuman penting. Tersedia di dashboard dan halaman berita terpisah dengan fitur modal popup untuk membaca isi lengkap.",
      features: ["Berita terbaru di dashboard (2 item)", "Halaman berita lengkap dengan CRUD", "Modal popup untuk membaca isi lengkap", "Prioritas tinggi/sedang/rendah", "Status diterbitkan/draft", "Upload dan edit berita"],
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: FiBookOpen,
      title: "Pengisian Data",
      desc: "Gunakan tombol Tambah/Ubah/Hapus di setiap tabel sesuai hak akses Anda. Form menggunakan custom dropdown design dengan icon dan validasi otomatis.",
      features: ["Form input data dengan custom dropdown", "Dropdown dengan icon (Calendar, Briefcase, Shield, dll)", "Validasi otomatis", "Soft delete & restore", "Konfirmasi aksi", "Modal dengan backdrop blur"],
      color: "from-green-500 to-green-600"
    },
    {
      icon: FiUser,
      title: "Management Akun",
      desc: "Kelola pengguna dan akses sistem. Role otomatis terisi berdasarkan unit kerja yang dipilih. Tersedia di menu Akses Cepat atau melalui halaman /users.",
      features: ["User management lengkap", "Role otomatis dari unit kerja", "Role-based access control", "Permission control", "Akses cepat dari dashboard", "Reset password untuk superadmin"],
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: FiSearch,
      title: "Pencarian & Filter",
      desc: "Gunakan kolom pencarian dan filter untuk menemukan data dengan cepat. Filter menggunakan custom dropdown design dengan icon yang intuitif.",
      features: ["Search functionality", "Custom dropdown filter", "Filter tahun & unit", "Filter berdasarkan prodi", "Show deleted data", "Quick results"],
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: FiShield,
      title: "Keamanan & Akses",
      desc: "Setiap fitur memiliki kontrol akses berdasarkan role. Sistem menggunakan role-based access control (RBAC) untuk mengatur hak akses pengguna.",
      features: ["Role-based access control (RBAC)", "Secure login dengan session", "Permission matrix", "Data protection", "Logout otomatis", "Jangan bagikan kredensial"],
      color: "from-red-500 to-red-600"
    },
    {
      icon: FiSettings,
      title: "Navigasi & Menu",
      desc: "Menu navigasi utama terdiri dari Home, Tables, Berita, Panduan, dan Design System. Header sticky di semua halaman kecuali halaman tabel.",
      features: ["Menu: Home, Tables, Berita, Panduan, Design System", "Header sticky dengan backdrop blur", "Mobile responsive dengan drawer menu", "Profile menu dengan logout", "Active page indicator"],
      color: "from-indigo-500 to-indigo-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeIn} 
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#043975] to-[#0384d6] rounded-2xl mb-6">
            <FiBookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Panduan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#043975] to-[#0384d6]">Pengguna</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pelajari cara menggunakan portal ini dengan cepat dan efektif. 
            Panduan lengkap untuk semua fitur dan fungsi yang tersedia.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {sections.map(({ icon: Icon, title, desc, features, color }, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#0384d6]/20"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#043975] transition-colors">
                    {title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {desc}
                </p>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Fitur Utama
                  </h4>
                  <ul className="space-y-2">
                    {features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-3 text-sm text-gray-600">
                        <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="px-8 pb-6">
                <div className="h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${color} rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Siap Memulai?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Jelajahi semua fitur yang tersedia dan mulai mengelola data Anda dengan efisien.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')} 
                className="group inline-flex items-center gap-3 bg-gray-100 text-gray-700 font-semibold py-4 px-8 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300"
              >
                <FiHome className="w-5 h-5" />
                Kembali ke Beranda
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/tables')} 
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#0384d6] to-[#043975] text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <FiGrid className="w-5 h-5" />
                Buka Akses Tabel
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}



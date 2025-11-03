"use client";
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// --- FUNGSI DAN IKON LOKAL ---
const useRouter = () => {
    return {
        push: (path) => {
            if (typeof window !== "undefined") {
                window.location.href = path;
            }
        }
    };
};

const FiCalendar = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const FiBookOpen = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>);
const FiUsers = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const FiHelpCircle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const FiArrowRight = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);
const FiBarChart = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>);
const FiFileText = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const FiDatabase = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const FiTrendingUp = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>);
const FiGrid = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const FiTarget = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>);
const FiSettings = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m19-4.24a3.5 3.5 0 0 0-4.93-4.93l-4.13 4.14M8.06 8.06l-4.13-4.14A3.5 3.5 0 0 0 1 6.76m13.94 9.3l4.13 4.14a3.5 3.5 0 0 1-4.93 4.93l-4.14-4.13M8.94 15.94l-4.14 4.13a3.5 3.5 0 0 1-4.93-4.93l4.14-4.14"></path></svg>);

// Varian animasi (tidak diubah)
const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const slideUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// Data tabel yang tersedia - Disederhanakan menjadi 5 kategori utama
const tableData = [
    { id: 'C1', title: 'C1', description: 'Tabel Penjaminan Mutu Standar C1', icon: FiBarChart, category: 'Akreditasi', color: 'from-blue-500 to-cyan-500' },
    { id: 'C2', title: 'C2', description: 'Tabel Penjaminan Mutu Standar C2', icon: FiTrendingUp, category: 'Akreditasi', color: 'from-purple-500 to-violet-500' },
    { id: 'TabelDosen', title: 'Data Dosen', description: 'Kelola informasi dan data dosen', icon: FiUsers, category: 'Data Master', color: 'from-green-500 to-emerald-500' },
    { id: 'TabelPegawai', title: 'Data Pegawai', description: 'Kelola informasi dan data pegawai', icon: FiUsers, category: 'Data Master', color: 'from-orange-500 to-red-500' },
    { id: 'ManajemenAkun', title: 'Manajemen Akun', description: 'Kelola pengguna dan akses sistem', icon: FiSettings, category: 'Administrasi', color: 'from-pink-500 to-rose-500' }
];

const AnimatedDatabaseIcon = () => {
    const commonTransition = {
        duration: 1.5,
        ease: "backInOut",
        repeat: Infinity,
        repeatType: "mirror",
        repeatDelay: 1.5
    };
    const diskHeight = 3;

    return (
        <motion.svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ overflow: 'visible' }}
        >
            <motion.g
                animate={{ y: -8 }}
                transition={commonTransition}
            >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d={`M3 5 v${diskHeight} c0 1.66 4 3 9 3 s9 -1.34 9 -3 v-${diskHeight}`} />
            </motion.g>
            <g>
                <ellipse cx="12" cy="12" rx="9" ry="3" />
                <path d={`M3 12 v${diskHeight} c0 1.66 4 3 9 3 s9 -1.34 9 -3 v-${diskHeight}`} />
            </g>
            <motion.g
                animate={{ y: 8 }}
                transition={commonTransition}
            >
                <ellipse cx="12" cy="19" rx="9" ry="3" />
                <path d={`M3 19 v${diskHeight} c0 1.66 4 3 9 3 s9 -1.34 9 -3 v-${diskHeight}`} />
            </motion.g>
        </motion.svg>
    );
};

// ----- [BAGIAN YANG DIUBAH] KOMPONEN HERO -----
const Hero = () => {
    const router = useRouter();
    // State untuk menyimpan sapaan
    const [greeting, setGreeting] = useState("");
    const shouldReduceMotion = useReducedMotion();

    // useEffect untuk menentukan sapaan berdasarkan waktu
    useEffect(() => {
        const getGreeting = () => {
            const currentHour = new Date().getHours();
            if (currentHour >= 5 && currentHour < 12) {
                return "Selamat Pagi";
            } else if (currentHour >= 12 && currentHour < 18) {
                return "Selamat Siang";
            } else {
                return "Selamat Malam";
            }
        };
        setGreeting(getGreeting());
    }, []); // Array kosong berarti efek ini hanya berjalan sekali saat komponen dimuat
    
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#043975_0%,#0384d6_50%,#ffbf1b_100%)]" style={{ minHeight: '100vh', minHeight: '100svh', minHeight: '100dvh' }}>
            {/* Background Pattern - Grid Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none select-none">
                {/* Grid Pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }}></div>
                
                {/* Frosted Glass Effect */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/5"></div>
                
                {/* Vertical Lines */}
                <div className="absolute inset-0">
                    <div className="absolute left-1/4 top-0 w-px h-full bg-white/20"></div>
                    <div className="absolute left-1/2 top-0 w-px h-full bg-white/20"></div>
                    <div className="absolute left-3/4 top-0 w-px h-full bg-white/20"></div>
                </div>
            </div>
            
            <div className="relative z-10 container mx-auto px-4 w-full h-full flex flex-col items-center justify-center text-center">
                
                {/* Top Section */}
                <motion.div 
                    initial={false}
                    animate="visible"
                    variants={staggerContainer}
                    className="w-full max-w-4xl"
                >
                    {/* Top Left - Category */}
                    <motion.div variants={fadeIn} className="text-left mb-8 mt-16">
                        <p className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                            PORTAL PENJAMINAN MUTU
                        </p>
                    </motion.div>

                    {/* Main Title Section */}
                    <motion.div variants={fadeIn} className="mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <h1 className="text-6xl md:text-8xl font-black text-white">
                                {greeting && greeting.split(' ')[0]}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-white/60 rounded-full"></div>
                                <span className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                                    STIKOM
                                </span>
                            </div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-[#ffbf1b] mb-4">
                            {greeting && greeting.split(' ')[1]}
                        </h1>
                    </motion.div>

                    {/* Center Main Content */}
                    <motion.div variants={fadeIn} className="mb-16">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20">
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                PORTAL PENJAMINAN<br/>
                                MUTU TERPADU<br/>
                                STIKOM
                            </h2>
                            
                            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
                                <p className="text-lg font-semibold text-white">
                                    @ Tim Penjaminan Mutu
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Section */}
                    <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
                        <div>
                            <p className="text-lg font-semibold text-white/90 mb-2">
                                AKSES LAYANAN TERPADU
                            </p>
                            <p className="text-sm text-white/70">
                                PORTAL PENJAMINAN MUTU
                            </p>
                        </div>
                        
                        <div className="flex justify-center items-center gap-4">
                            <p className="text-sm text-white/70">2025</p>
                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                            <p className="text-sm text-white/70">DESEMBER</p>
                        </div>
                        
                        <div>
                            <p className="text-lg font-semibold text-white/90">
                                SIMPAN UNTUK NANTI
                            </p>
                        </div>
                    </motion.div>

                    {/* Action Buttons - Fixed positioning */}
                    <motion.div 
                        variants={fadeIn}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-30 mt-8"
                    >
                        <motion.button 
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.05, y: -3 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                            onClick={() => router.push('/tables')}
                            className="group inline-flex items-center gap-3 bg-white text-[#043975] font-bold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-white/20 w-full sm:w-auto justify-center"
                        >
                            <FiGrid className="w-5 h-5" />
                            Akses Tabel Data
                            <FiArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </motion.button>
                        
                        <motion.button 
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.05, y: -3 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                            onClick={() => router.push('/panduan')}
                            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white font-semibold py-4 px-8 rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/30 w-full sm:w-auto justify-center"
                        >
                            <FiHelpCircle className="w-5 h-5" />
                            Panduan Penggunaan
                        </motion.button>
                    </motion.div>
                    
                    {/* Bottom spacing */}
                    <div className="h-16"></div>
                </motion.div>
            </div>
        </div>
    );
};

// ----- [BARU] KOMPONEN MOBILE CARD -----
const MobileTableCard = ({ table, router }) => {
    const IconComponent = table.icon;
    const shouldReduceMotion = useReducedMotion();
    
    return (
        <motion.div 
            variants={slideUp}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => router.push(`/tables?table=${table.id}`)}
            className="group relative flex flex-col items-center cursor-pointer w-full mobile-table-card p-2"
        >
                {/* Icon Container - Squircle dengan gradient */}
                <div className="relative w-14 h-14 mb-3">
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${table.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mobile-card-icon`}>
                        <IconComponent className="w-7 h-7 text-white" />
                    </div>
                </div>
                
                {/* Category Label - Pill shaped */}
                <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-blue-600">
                        {table.category}
                    </span>
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-bold text-gray-800 text-center leading-tight">
                    {table.title}
                </h3>
        </motion.div>
    );
};

const MobileTablesSection = () => {
    const router = useRouter();
    
    return (
        <motion.section 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="py-8 px-4 bg-white md:hidden"
        >
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <motion.div variants={fadeIn} className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Akses Tabel Data
                    </h2>
                    <p className="text-sm text-gray-600">
                        Kelola data penjaminan mutu dengan mudah
                    </p>
                </motion.div>
                
                        <motion.div 
                            variants={staggerContainer}
                            className="grid grid-cols-4 gap-4"
                        >
                            {tableData.map((table) => (
                                <MobileTableCard key={table.id} table={table} router={router} />
                            ))}
                        </motion.div>
            </div>
        </motion.section>
    );
};

// ----- [TIDAK DIUBAH] KOMPONEN TABLESCARD, TABLESSECTION, QUICKACTIONS -----
const TableCard = ({ table, router }) => {
    const IconComponent = table.icon;
    const shouldReduceMotion = useReducedMotion();
    return (
        <motion.div 
            variants={slideUp}
            whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => router.push(`/tables?table=${table.id}`)}
            className="group relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-gray-100/50 backdrop-blur-sm"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${table.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            <div className="relative z-10 mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${table.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8" />
                </div>
            </div>
            <div className="relative z-10">
                <div className="mb-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#f1f5f9] text-[#0384d6]">
                        {table.category}
                    </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#043975]">
                    {table.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {table.description}
                </p>
                <div className="flex items-center text-sm font-medium text-[#0384d6]">
                    <span>Buka Tabel</span>
                    <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>
        </motion.div>
    );
};

const TablesSection = () => {
    const router = useRouter();
    const groupedTables = tableData.reduce((acc, table) => {
        if (!acc[table.category]) acc[table.category] = [];
        acc[table.category].push(table);
        return acc;
    }, {});
    
    return (
        <motion.section 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="py-20 px-4 sm:px-8 rounded-t-3xl bg-white"
        >
            <div className="container mx-auto max-w-7xl">
                <motion.div variants={fadeIn} className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#043975]">
                        Akses Tabel Data
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg text-[#0384d6]">
                        Kelola dan akses semua data penjaminan mutu dengan mudah melalui tabel interaktif
                    </p>
                </motion.div>
                
                {Object.entries(groupedTables).map(([category, tables]) => (
                    <motion.div key={category} variants={fadeIn} className="mb-16">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-2 text-[#043975]">
                                {category}
                            </h3>
                            <div className="w-20 h-1 rounded-full bg-[#ffbf1b]"></div>
                        </div>
                        <motion.div 
                            variants={staggerContainer}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {tables.map((table) => (
                                <TableCard key={table.id} table={table} router={router} />
                            ))}
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

const QuickActions = () => {
    const router = useRouter();
    const quickActions = [
        { title: "SIAKAD & Jadwal", description: "Akses sistem akademik dan lihat jadwal mengajar terbaru", icon: FiCalendar, color: "from-blue-500 to-cyan-500" },
        { title: "E-Learning", description: "Platform pembelajaran digital untuk mengelola materi kuliah", icon: FiBookOpen, color: "from-green-500 to-emerald-500" },
        { title: "Layanan Kepegawaian", description: "Informasi, dokumen, dan layanan terkait kepegawaian", icon: FiUsers, color: "from-purple-500 to-violet-500" },
        { title: "Bantuan & IT Support", description: "Butuh bantuan teknis? Hubungi tim IT Support kami", icon: FiHelpCircle, color: "from-orange-500 to-red-500" }
    ];
    
    return (
        <motion.section 
            initial={false}
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="py-20 px-4 sm:px-8"
            style={{ backgroundColor: '#f8fafc' }}
        >
            <div className="container mx-auto max-w-7xl">
                <motion.div variants={fadeIn} className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#043975' }}>
                        Layanan Cepat
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg" style={{ color: '#0384d6' }}>
                        Akses layanan dan sistem informasi penting yang Anda butuhkan
                    </p>
                </motion.div>
                <motion.div 
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {quickActions.map((action, index) => {
                        const IconComponent = action.icon;
                        return (
                            <motion.div
                                key={index}
                                variants={slideUp}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-gray-100/50 backdrop-blur-sm"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <div className="relative z-10 mb-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-3" style={{ color: '#043975' }}>
                                        {action.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {action.description}
                                    </p>
                                    <div className="flex items-center text-sm font-medium" style={{ color: '#0384d6' }}>
                                        <span>Akses Layanan</span>
                                        <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </motion.section>
    );
};


// ----- [TIDAK DIUBAH] KOMPONEN UTAMA APP -----
export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
            * {
                box-sizing: border-box;
            }
            html, body {
                margin: 0;
                padding: 0;
                font-family: 'Montserrat', sans-serif;
                overflow-x: hidden;
            }
            body {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            /* Fix untuk mobile viewport */
            .mobile-viewport {
                min-height: 100vh;
                min-height: 100svh;
                min-height: 100dvh;
            }
            /* Animasi untuk blob di background hero */
            @keyframes blob {
              0% { transform: translate(0px, 0px) scale(1); }
              33% { transform: translate(30px, -50px) scale(1.1); }
              66% { transform: translate(-20px, 20px) scale(0.9); }
              100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
            /* Fix untuk mobile layout */
            @media (max-width: 768px) {
                .mobile-viewport {
                    height: 100vh;
                    height: 100svh;
                    height: 100dvh;
                }
                
                /* Mobile card hover effects */
                .mobile-table-card {
                    transition: all 0.3s ease;
                }
                
                .mobile-table-card:hover {
                    transform: scale(1.02);
                }
                
                .mobile-table-card:active {
                    transform: scale(0.98);
                }
                
                /* Mobile card icon container */
                .mobile-card-icon {
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .mobile-card-icon:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
            }
        `}</style>
        <div className="bg-white mobile-viewport" style={{ color: '#043975' }}>
            <main>
                {!mounted ? (
                  <div className="min-h-screen flex items-center justify-center" style={{ minHeight: '100vh', minHeight: '100svh', minHeight: '100dvh' }}>
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#043975] mx-auto mb-4"></div>
                      <p className="text-[#043975]">Memuat...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Hero />
                    <div className="relative z-10 bg-white" style={{ borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', marginTop: '-3rem' }}>
                        <MobileTablesSection />
                        <div className="hidden md:block">
                            <TablesSection />
                        </div>
                        <QuickActions />
                    </div>
                  </>
                )}
            </main>
        </div>
    </>
  );
}


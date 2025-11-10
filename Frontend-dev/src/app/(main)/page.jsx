"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { roleCan } from "../../lib/role";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
const FiChevronLeft = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>);
const FiChevronRight = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6"></polyline></svg>);
const FiBarChart = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>);
const FiFileText = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const FiDatabase = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>);
const FiTrendingUp = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>);
const FiGrid = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const FiTarget = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>);
const FiSettings = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m19-4.24a3.5 3.5 0 0 0-4.93-4.93l-4.13 4.14M8.06 8.06l-4.13-4.14A3.5 3.5 0 0 0 1 6.76m13.94 9.3l4.13 4.14a3.5 3.5 0 0 1-4.93 4.93l-4.14-4.13M8.94 15.94l-4.14 4.13a3.5 3.5 0 0 1-4.93-4.93l4.14-4.14"></path></svg>);
const FiNewspaper = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6z"></path></svg>);
const FiDownload = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const FiFile = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>);
const FiFolder = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>);
const FiActivity = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>);
const FiCheckCircle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const FiPlusCircle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const FiEdit = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const FiTrash = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const FiClock = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);

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
    const [berita, setBerita] = useState([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    const tpmNewsData = [
        {
            id: 1,
            title: "Pelaksanaan Audit Mutu Internal (AMI) Siklus Ke-12",
            excerpt: "AMI Siklus ke-12 akan segera dilaksanakan untuk seluruh program studi dan unit kerja di lingkungan STIKOM.",
            date: "2025-10-02",
            time: "2 Okt 2025",
            color: "from-blue-500 to-cyan-500",
            icon: FiNewspaper
        },
        {
            id: 2,
            title: "Persiapan Akreditasi Program Studi Teknik Informatika",
            excerpt: "Tim TPM mengajak seluruh civitas akademika untuk mempersiapkan dokumen akreditasi.",
            date: "2025-09-28",
            time: "28 Sep 2025",
            color: "from-green-500 to-emerald-500",
            icon: FiFileText
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            // Ambil 2 berita terbaru
            setBerita(tpmNewsData.slice(0, 2));
            setLoading(false);
        }, 500);
    }, []);
    
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
                        Akses Cepat Berita
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg" style={{ color: '#0384d6' }}>
                        Dapatkan informasi terbaru dan update terkini dari Tim Penjaminan Mutu
                    </p>
                </motion.div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-3xl shadow-lg border border-gray-100/50 p-6 animate-pulse">
                                <div className="h-16 bg-gray-200 rounded-2xl mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {berita.map((item, index) => {
                            const IconComponent = item.icon;
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={slideUp}
                                    whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.02 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                    onClick={() => router.push('/berita')}
                                    className="group relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-gray-100/50 backdrop-blur-sm"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                    <div className="relative z-10 mb-6">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                {item.time}
                                            </span>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                                Update
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-3" style={{ color: '#043975' }}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                            {item.excerpt}
                                        </p>
                                        <div className="flex items-center text-sm font-medium" style={{ color: '#0384d6' }}>
                                            <span>Baca Selengkapnya</span>
                                            <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </motion.section>
    );
};

// Komponen Statistik Cards untuk Dashboard - Style seperti Layanan Cepat
const StatistikCards = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setStats([
                { 
                    title: 'Total Tabel', 
                    value: '97', 
                    icon: FiDatabase, 
                    color: 'from-blue-500 to-cyan-500',
                    change: '+12%',
                    trend: 'up'
                },
                { 
                    title: 'Data Terisi', 
                    value: '1,248', 
                    icon: FiFileText, 
                    color: 'from-green-500 to-emerald-500',
                    change: '+8%',
                    trend: 'up'
                },
                { 
                    title: 'Tabel Aktif', 
                    value: '24', 
                    icon: FiBarChart, 
                    color: 'from-purple-500 to-violet-500',
                    change: '+3',
                    trend: 'up'
                },
                { 
                    title: 'Update Hari Ini', 
                    value: '156', 
                    icon: FiTrendingUp, 
                    color: 'from-orange-500 to-red-500',
                    change: '+45',
                    trend: 'up'
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="group relative bg-white p-5 rounded-xl shadow-md border border-gray-100 animate-pulse">
                        <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-slate-200 rounded mb-2 w-1/2"></div>
                        <div className="h-6 bg-slate-200 rounded mb-1"></div>
                        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                ))
            ) : (
                stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className="group relative bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {stat.trend === 'up' ? (
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        )}
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold mb-1 text-slate-900">
                                    {stat.value}
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {stat.title}
                                </p>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
    );
};

// Komponen Unduh Dokumen - Table Design
const UnduhDokumenSection = () => {
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setDocuments([
                {
                    id: 1,
                    code: "DOC-001",
                    name: "Template Dokumen Akreditasi",
                    date: "15 Des, 2024",
                    size: "2.5 MB",
                    status: "Available"
                },
                {
                    id: 2,
                    code: "DOC-002",
                    name: "Panduan Pengisian Tabel",
                    date: "10 Des, 2024",
                    size: "1.8 MB",
                    status: "Available"
                },
                {
                    id: 3,
                    code: "DOC-003",
                    name: "Dokumen Standar C1",
                    date: "5 Des, 2024",
                    size: "5.2 MB",
                    status: "Available"
                },
                {
                    id: 4,
                    code: "DOC-004",
                    name: "Dokumen Standar C2",
                    date: "1 Des, 2024",
                    size: "4.7 MB",
                    status: "Available"
                },
                {
                    id: 5,
                    code: "DOC-005",
                    name: "Format Laporan AMI",
                    date: "28 Nov, 2024",
                    size: "850 KB",
                    status: "Available"
                },
                {
                    id: 6,
                    code: "DOC-006",
                    name: "Regulasi & SK",
                    date: "25 Nov, 2024",
                    size: "3.1 MB",
                    status: "Available"
                },
                {
                    id: 7,
                    code: "DOC-007",
                    name: "Checklist Dokumen",
                    date: "20 Nov, 2024",
                    size: "650 KB",
                    status: "Available"
                },
                {
                    id: 8,
                    code: "DOC-008",
                    name: "Arsip Dokumen Lama",
                    date: "15 Nov, 2024",
                    size: "12.5 MB",
                    status: "Archived"
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const getStatusBadge = (status) => {
        const statusConfig = {
            "Available": { bg: "bg-green-100", text: "text-green-700", label: "Available" },
            "Archived": { bg: "bg-gray-100", text: "text-gray-700", label: "Archived" },
            "Pending": { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
            "Outdated": { bg: "bg-red-100", text: "text-red-700", label: "Outdated" }
        };
        const config = statusConfig[status] || statusConfig["Available"];
        return (
            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Unduh Dokumen</h3>
                <button 
                    onClick={() => router.push('/')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                    Lihat Semua
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Dokumen</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ukuran</th>
                                <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unduhan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <tr 
                                    key={doc.id} 
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-3 px-2">
                                        <div className="font-medium text-slate-900">{doc.code}</div>
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">{doc.date}</td>
                                    <td className="py-3 px-2">
                                        <div className="font-medium text-slate-900">{doc.name}</div>
                                    </td>
                                    <td className="py-3 px-2 text-gray-600">{doc.size}</td>
                                    <td className="py-3 px-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Download:', doc.name);
                                                // TODO: Implement download functionality
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0384d6] hover:text-[#043975] hover:bg-blue-50 rounded-md transition-colors"
                                        >
                                            <FiDownload className="w-3.5 h-3.5" />
                                            <span>Unduh</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

// Komponen Welcome Section - Modern & Clean Design
const WelcomeSection = ({ authUser }) => {
    const [greeting, setGreeting] = useState("");
    const [currentTime, setCurrentTime] = useState("");

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

        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            setCurrentTime(timeString);
        };

        setGreeting(getGreeting());
        updateTime();
        const timeInterval = setInterval(updateTime, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    const userName = authUser?.username || authUser?.pegawai_name || "Pengguna";
    const userRole = authUser?.role || "User";

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="bg-gradient-to-br from-[#043975] via-[#0384d6] to-[#043975] rounded-2xl shadow-xl p-6 h-full text-white relative overflow-hidden"
        >
            {/* Background Grid Pattern - White Lines */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '35px 35px',
                    backgroundPosition: '0 0'
                }}></div>
            </div>

            {/* Decorative Circle */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#ffbf1b]/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    {/* Greeting Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                    >
                        <div className="w-2 h-2 bg-[#ffbf1b] rounded-full animate-pulse"></div>
                        <span className="text-xs font-semibold text-white/90">{greeting}</span>
                    </motion.div>

                    {/* Welcome Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                            Selamat Datang,
                        </h2>
                        <h3 className="text-xl md:text-2xl font-bold mb-3 text-[#ffbf1b]">
                            {userName}
                        </h3>
                        <p className="text-sm text-white/80 mb-4 leading-relaxed">
                            Anda login sebagai <span className="font-semibold text-white">{userRole}</span>
                        </p>
                    </motion.div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 pt-6 border-t border-white/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-white/60 mb-1">Waktu Saat Ini</p>
                            <p className="text-lg font-bold text-white">{currentTime}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-white/60 mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-sm font-semibold text-white">Online</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Komponen Berita - Card terpisah untuk setiap berita
const BeritaCard = ({ berita, index }) => {
    const router = useRouter();
    const IconComponent = berita.icon;
    const shouldReduceMotion = useReducedMotion();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }}
            className="group relative bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
            onClick={() => router.push('/berita')}
        >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${berita.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${berita.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{formatDate(berita.date)}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-[#0384d6] transition-colors">
                    {berita.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {berita.excerpt}
                </p>
                <div className="flex items-center text-sm font-medium text-[#0384d6]">
                    <span>Baca Selengkapnya</span>
                    <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
            </div>
        </motion.div>
    );
};

// Komponen Akses Cepat Berita untuk Dashboard
const AksesCepatBeritaDashboard = () => {
    const router = useRouter();
    const [berita, setBerita] = useState([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    const tpmNewsData = [
        {
            id: 1,
            title: "Pelaksanaan Audit Mutu Internal (AMI) Siklus Ke-12",
            excerpt: "AMI Siklus ke-12 akan segera dilaksanakan untuk seluruh program studi dan unit kerja di lingkungan STIKOM.",
            date: "2025-10-02",
            time: "2 Okt 2025",
            color: "from-blue-500 to-cyan-500",
            icon: FiNewspaper
        },
        {
            id: 2,
            title: "Persiapan Akreditasi Program Studi Teknik Informatika",
            excerpt: "Tim TPM mengajak seluruh civitas akademika untuk mempersiapkan dokumen akreditasi.",
            date: "2025-09-28",
            time: "28 Sep 2025",
            color: "from-green-500 to-emerald-500",
            icon: FiFileText
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setBerita(tpmNewsData);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Akses Cepat Berita</h3>
                <button 
                    onClick={() => router.push('/berita')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                    Lihat Semua
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                            <div className="h-16 bg-gray-200 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {berita.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.div
                                key={item.id}
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                                whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                                onClick={() => router.push('/berita')}
                                className="group relative bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer overflow-hidden border border-gray-100/50 backdrop-blur-sm"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <div className="relative z-10 mb-6">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                            {item.time}
                                        </span>
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                                            Update
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3" style={{ color: '#043975' }}>
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {item.excerpt}
                                    </p>
                                    <div className="flex items-center text-sm font-medium" style={{ color: '#0384d6' }}>
                                        <span>Baca Selengkapnya</span>
                                        <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

// Komponen Aktivitas Website
const AktivitasWebsite = () => {
    const router = useRouter();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    const activityData = [
        {
            id: 1,
            type: 'table_update',
            activity: 'Tabel 3A-1 telah diupdate',
            detail: 'Data sarana prasarana penelitian telah diperbarui',
            user: 'Admin TPM',
            date: "2025-10-02",
            time: "2 Okt 2025",
            color: "from-blue-500 to-cyan-500",
            icon: FiEdit,
            tag: 'Update Tabel'
        },
        {
            id: 2,
            type: 'berita_update',
            activity: 'Berita baru ditambahkan',
            detail: 'Pelaksanaan Audit Mutu Internal (AMI) Siklus Ke-12 telah dipublikasikan',
            user: 'Admin TPM',
            date: "2025-09-28",
            time: "28 Sep 2025",
            color: "from-green-500 to-emerald-500",
            icon: FiNewspaper,
            tag: 'Update Berita'
        },
        {
            id: 3,
            type: 'profile_update',
            activity: 'Profile user diupdate',
            detail: 'Profile Dr. Ahmad Hidayat telah diperbarui',
            user: 'Admin TPM',
            date: "2025-09-27",
            time: "27 Sep 2025",
            color: "from-purple-500 to-pink-500",
            icon: FiUsers,
            tag: 'Update Profile'
        },
        {
            id: 4,
            type: 'table_create',
            activity: 'Data baru ditambahkan',
            detail: 'Data baru telah ditambahkan ke Tabel 2A-1',
            user: 'Admin TPM',
            date: "2025-09-26",
            time: "26 Sep 2025",
            color: "from-orange-500 to-red-500",
            icon: FiPlusCircle,
            tag: 'Tambah Data'
        },
        {
            id: 5,
            type: 'table_delete',
            activity: 'Data dihapus',
            detail: 'Data dari Tabel 1A-1 telah dihapus',
            user: 'Admin TPM',
            date: "2025-09-25",
            time: "25 Sep 2025",
            color: "from-red-500 to-rose-500",
            icon: FiTrash,
            tag: 'Hapus Data'
        },
        {
            id: 6,
            type: 'login',
            activity: 'User login',
            detail: 'User berhasil login ke sistem',
            user: 'Admin TPM',
            date: "2025-09-24",
            time: "24 Sep 2025",
            color: "from-teal-500 to-cyan-500",
            icon: FiActivity,
            tag: 'Login'
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setActivities(activityData);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Aktivitas Website</h3>
                <button 
                    onClick={() => router.push('/activity')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                    Lihat Semua
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="space-y-2 overflow-x-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
                            <div className="flex gap-3">
                                <div className="h-8 w-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-1"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto overflow-x-hidden">
                    {activities.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.div
                                key={item.id}
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.05 }}
                                whileHover={shouldReduceMotion ? undefined : {}}
                                onClick={() => router.push('/activity')}
                                className="group relative bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer border border-gray-100 hover:border-gray-200 overflow-hidden"
                            >
                                <div className="flex gap-3">
                                    {/* Icon Section - Left */}
                                    <div className="flex-shrink-0">
                                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-sm transition-opacity duration-300`}>
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Content Section - Right */}
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                            <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                                                {item.tag}
                                            </span>
                                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                {item.time}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold mb-0.5 leading-tight truncate" style={{ color: '#043975' }}>
                                            {item.activity}
                                        </h4>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-0.5 line-clamp-1">
                                            {item.detail}
                                        </p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            oleh {item.user}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

const BeritaSection = () => {
    const router = useRouter();
    const [berita, setBerita] = useState([]);
    const [loading, setLoading] = useState(true);

    const tpmNewsData = [
        {
            id: 1,
            title: "Pelaksanaan Audit Mutu Internal (AMI) Siklus Ke-12",
            excerpt: "AMI Siklus ke-12 akan segera dilaksanakan untuk seluruh program studi dan unit kerja di lingkungan STIKOM.",
            date: "2025-10-02",
            color: "from-blue-500 to-cyan-500",
            icon: FiNewspaper
        },
        {
            id: 2,
            title: "Persiapan Akreditasi Program Studi Teknik Informatika",
            excerpt: "Tim TPM mengajak seluruh civitas akademika untuk mempersiapkan dokumen akreditasi.",
            date: "2025-09-28",
            color: "from-green-500 to-emerald-500",
            icon: FiFileText
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setBerita(tpmNewsData);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Berita</h3>
                <button 
                    onClick={() => router.push('/berita')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                    Lihat Semua
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-pulse">
                            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {berita.map((item, index) => (
                        <BeritaCard key={item.id} berita={item} index={index} />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// Komponen Update Status Terkini (tidak digunakan lagi, sudah digabung ke AksesCepatBeritaDashboard)
const UpdateStatusTerkini_OLD = () => {
    const router = useRouter();
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    const dummyUpdates = [
        {
            id: 1,
            type: 'create',
            action: 'Menambahkan data baru',
            table: 'Tabel 3A-1',
            user: 'Admin TPM',
            time: '2 menit yang lalu',
            icon: FiPlusCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            id: 2,
            type: 'update',
            action: 'Memperbarui data',
            table: 'Tabel 2B-4',
            user: 'Ketua Prodi',
            time: '15 menit yang lalu',
            icon: FiEdit,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            id: 3,
            type: 'delete',
            action: 'Menghapus data',
            table: 'Tabel 1A-2',
            user: 'Admin TPM',
            time: '1 jam yang lalu',
            icon: FiTrash,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            id: 4,
            type: 'complete',
            action: 'Menyelesaikan pengisian',
            table: 'Tabel 4A-1',
            user: 'Staff TPM',
            time: '2 jam yang lalu',
            icon: FiCheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            id: 5,
            type: 'update',
            action: 'Memperbarui data',
            table: 'Tabel 5A-2',
            user: 'Admin TPM',
            time: '3 jam yang lalu',
            icon: FiEdit,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        }
    ];

    useEffect(() => {
        setTimeout(() => {
            setUpdates(dummyUpdates);
            setLoading(false);
        }, 500);
    }, []);

    const getTimeAgo = (timeString) => {
        return timeString;
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                        <FiActivity className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Update Status Terkini</h3>
                </div>
                <button 
                    onClick={() => router.push('/activity')}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                    Lihat Semua
                    <FiArrowRight className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {updates.map((update, index) => {
                        const IconComponent = update.icon;
                        return (
                            <motion.div
                                key={update.id}
                                variants={slideUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.05 }}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className={`p-2 rounded-full ${update.bgColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComponent className={`w-4 h-4 ${update.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-slate-900">{update.action}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                            {update.table}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{update.user}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            <span>{getTimeAgo(update.time)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

// Komponen Akses Cepat - Style seperti Market (list dengan filter)
const AksesCepatMarket = ({ quickActions }) => {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('24h');
    const [selectedCategory, setSelectedCategory] = useState('Top gainers');

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Akses Cepat</h3>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setSelectedFilter('24h')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        selectedFilter === '24h'
                            ? 'bg-gray-100 text-slate-900'
                            : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    24h
                </button>
                <button
                    onClick={() => setSelectedCategory('Top gainers')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        selectedCategory === 'Top gainers'
                            ? 'bg-gray-100 text-slate-900'
                            : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    Top gainers
                </button>
            </div>

            {/* Quick Actions List */}
            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                {quickActions && quickActions.length > 0 ? (
                    quickActions.map((item, i) => {
                        const IconComponent = item.icon;
                        return (
                            <motion.button
                                key={i}
                                whileHover={{ x: 4 }}
                                onClick={() => router.push(item.path)}
                                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${item.color} text-white flex-shrink-0`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-900 text-base truncate">{item.label}</div>
                                        <div className="text-xs text-gray-500">Akses cepat</div>
                                    </div>
                                </div>
                                <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 group-hover:translate-x-1" />
                            </motion.button>
                        );
                    })
                ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">Tidak ada akses cepat tersedia</div>
                )}
            </div>
        </motion.div>
    );
};

// Komponen Grafik Semua Tabel - Carousel/Slider Design
const GrafikTabel = () => {
    const router = useRouter();
    const { authUser } = useAuth();
    const role = authUser?.role;
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const shouldReduceMotion = useReducedMotion();

    // Definisi tabel untuk setiap standar
    const C1_TABLES = [
        { key: '1a1', label: '1A-1', endpoint: '/pimpinan-upps-ps', accessKey: 'tabel_1a1' },
        { key: '1a2', label: '1A-2', endpoint: '/sumber-pendanaan', accessKey: 'tabel_1a2' },
        { key: '1a3', label: '1A-3', endpoint: '/penggunaan-dana', accessKey: 'tabel_1a3' },
        { key: '1a4', label: '1A-4', endpoint: '/beban-kerja-dosen', accessKey: 'tabel_1a4' },
        { key: '1a5', label: '1A-5', endpoint: '/kualifikasi-tendik', accessKey: 'tabel_1a5' },
        { key: '1b', label: '1B', endpoint: '/audit-mutu-internal', accessKey: 'tabel_1b' }
    ];

    const C2_TABLES = [
        { key: '2a2', label: '2A-2', endpoint: '/tabel2a2-keragaman-asal', accessKey: 'tabel_2a2_keragaman_asal' },
        { key: '2a3', label: '2A-3', endpoint: '/tabel2a3-kondisi-mahasiswa', accessKey: 'tabel_2a3_kondisi_mahasiswa' },
        { key: '2b', label: '2B', endpoint: '/pemetaan-2b1', accessKey: 'pemetaan2b1' },
        { key: '2b4', label: '2B-4', endpoint: '/tabel2b4-masa-tunggu', accessKey: 'tabel_2b4_masa_tunggu' },
        { key: '2b5', label: '2B-5', endpoint: '/tabel2b5-kesesuaian-kerja', accessKey: 'tabel_2b5_kesesuaian_kerja' },
        { key: '2b6', label: '2B-6', endpoint: '/tabel2b6-kepuasan-pengguna', accessKey: 'tabel_2b6_kepuasan_pengguna' },
        { key: '2c', label: '2C', endpoint: '/tabel2c-fleksibilitas-pembelajaran', accessKey: 'fleksibilitas_pembelajaran' },
        { key: '2d', label: '2D', endpoint: '/tabel2d-rekognisi-lulusan', accessKey: 'rekognisi_lulusan' }
    ];

    const C3_TABLES = [
        { key: '3a1', label: '3A-1', endpoint: '/tabel-3a1-sarpras-penelitian', accessKey: 'tabel_3a1_sarpras_penelitian' },
        { key: '3a2', label: '3A-2', endpoint: '/tabel-3a2-penelitian', accessKey: 'tabel_3a2_penelitian' },
        { key: '3a3', label: '3A-3', endpoint: '/tabel-3a3-pengembangan-dtpr/detail', accessKey: 'tabel_3a3_pengembangan_dtpr' },
        { key: '3c1', label: '3C-1', endpoint: '/tabel-3c1-kerjasama', accessKey: 'tabel_3c1_kerjasama_penelitian' },
        { key: '3c2', label: '3C-2', endpoint: '/tabel-3c2-publikasi', accessKey: 'tabel_3c2_publikasi_penelitian' },
        { key: '3c3', label: '3C-3', endpoint: '/tabel-3c3-hki', accessKey: 'tabel_3c3_hki' }
    ];

    const C4_TABLES = [
        { key: '4a1', label: '4A-1', endpoint: '/tabel-4a1', accessKey: 'tabel_4a1' },
        { key: '4a2', label: '4A-2', endpoint: '/tabel-4a2', accessKey: 'tabel_4a2' }
    ];

    const C5_TABLES = [
        { key: '5a1', label: '5A-1', endpoint: '/tabel-5a1', accessKey: 'tabel_5a1' },
        { key: '5a2', label: '5A-2', endpoint: '/tabel-5a2', accessKey: 'tabel_5a2' }
    ];

    const C6_TABLES = [
        { key: '6a1', label: '6A-1', endpoint: '/tabel-6a1', accessKey: 'tabel_6a1' },
        { key: '6a2', label: '6A-2', endpoint: '/tabel-6a2', accessKey: 'tabel_6a2' }
    ];

    // Fungsi untuk fetch data count dari API
    const fetchTableDataCount = async (endpoint, tsId = null) => {
        try {
            const BASE_URL = "http://localhost:3000/api";
            let url = `${BASE_URL}${endpoint}`;
            
            // Tambahkan parameter ts_id jika diperlukan
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
            
            // Handle berbagai format response
            if (data?.total !== undefined) {
                return data.total;
            } else if (data?.count !== undefined) {
                return data.count;
            } else if (data?.data && Array.isArray(data.data)) {
                // Format untuk 3C2 dan 3C3: { tahun_laporan: {...}, data: [...] }
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
                // Fallback ke tahun saat ini jika API gagal
                return new Date().getFullYear();
            }
            
            const data = await response.json();
            const tahunList = Array.isArray(data) ? data : (data?.items || []);
            
            if (tahunList.length === 0) {
                return new Date().getFullYear();
            }
            
            // Cari tahun yang mengandung tahun saat ini
            const currentYear = new Date().getFullYear();
            const tahunTerpilih = tahunList.find(t => {
                const tahunStr = String(t.tahun || t.nama || '');
                return tahunStr.includes(String(currentYear));
            });
            
            if (tahunTerpilih) {
                return tahunTerpilih.id_tahun;
            }
            
            // Jika tidak ditemukan, gunakan tahun terbaru berdasarkan id_tahun
            const sorted = tahunList.sort((a, b) => (b.id_tahun || 0) - (a.id_tahun || 0));
            return sorted[0]?.id_tahun || new Date().getFullYear();
        } catch (error) {
            console.warn('Failed to fetch tahun akademik:', error);
            return new Date().getFullYear();
        }
    };

    // Fungsi untuk fetch semua data grafik (bisa dipanggil ulang untuk sinkronisasi)
    const fetchAllChartData = useCallback(async () => {
        if (!role) return;
        
        setLoading(true);
        
        // Fetch data untuk C1
        const c1DataPromises = C1_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const count = await fetchTableDataCount(table.endpoint);
            return { label: table.label, count };
        });
        
        // Fetch data untuk C2
        const c2DataPromises = C2_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const count = await fetchTableDataCount(table.endpoint);
            return { label: table.label, count };
        });
        
        // Fetch data untuk C3 - Perlu ts_id untuk beberapa tabel
        const latestTahunId = await getLatestTahunId();
        const c3DataPromises = C3_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const needsTsId = ['3c1', '3c2', '3c3'].includes(table.key);
            const count = await fetchTableDataCount(table.endpoint, needsTsId ? latestTahunId : null);
            return { label: table.label, count };
        });

        // Fetch data untuk C4
        const c4DataPromises = C4_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const count = await fetchTableDataCount(table.endpoint);
            return { label: table.label, count };
        });

        // Fetch data untuk C5
        const c5DataPromises = C5_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const count = await fetchTableDataCount(table.endpoint);
            return { label: table.label, count };
        });

        // Fetch data untuk C6
        const c6DataPromises = C6_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const count = await fetchTableDataCount(table.endpoint);
            return { label: table.label, count };
        });

        const [c1Results, c2Results, c3Results, c4Results, c5Results, c6Results] = await Promise.all([
            Promise.all(c1DataPromises),
            Promise.all(c2DataPromises),
            Promise.all(c3DataPromises),
            Promise.all(c4DataPromises),
            Promise.all(c5DataPromises),
            Promise.all(c6DataPromises)
        ]);

        // Filter null values dan buat barData
        const c1BarData = c1Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        const c2BarData = c2Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        const c3BarData = c3Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        const c4BarData = c4Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        const c5BarData = c5Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        const c6BarData = c6Results.filter(Boolean).map((item) => ({
            category: item.label,
            value: item.count
        }));

        // Hitung total count
        const c1Total = c1Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);
        const c2Total = c2Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);
        const c3Total = c3Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);
        const c4Total = c4Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);
        const c5Total = c5Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);
        const c6Total = c6Results.filter(Boolean).reduce((sum, item) => sum + item.count, 0);

        // Fetch data untuk Dosen, Pegawai, dan Users (Panel Admin)
        let dosenCount = 0;
        let pegawaiCount = 0;
        let usersCount = 0;
        const hasDosenAccess = roleCan(role, 'dosen', 'r');
        const hasPegawaiAccess = roleCan(role, 'pegawai', 'r');
        const hasUsersAccess = roleCan(role, 'users', 'r');
        
        if (hasDosenAccess) {
            dosenCount = await fetchTableDataCount('/dosen');
        }
        
        if (hasPegawaiAccess) {
            pegawaiCount = await fetchTableDataCount('/pegawai');
        }
        
        if (hasUsersAccess) {
            usersCount = await fetchTableDataCount('/users');
        }

        const chartDataArray = [
            { 
                name: 'C1', 
                count: c1Total, 
                color: 'from-blue-500 to-cyan-500', 
                icon: FiBarChart, 
                description: 'Standar C1',
                barData: c1BarData.length > 0 ? c1BarData : [
                    { category: '1A-1', value: 0 },
                    { category: '1A-2', value: 0 },
                    { category: '1A-3', value: 0 }
                ]
            },
            { 
                name: 'C2', 
                count: c2Total, 
                color: 'from-purple-500 to-violet-500', 
                icon: FiTrendingUp, 
                description: 'Standar C2',
                barData: c2BarData.length > 0 ? c2BarData : [
                    { category: '2A-2', value: 0 },
                    { category: '2A-3', value: 0 },
                    { category: '2B', value: 0 }
                ]
            },
            { 
                name: 'C3', 
                count: c3Total, 
                color: 'from-green-500 to-emerald-500', 
                icon: FiUsers, 
                description: 'Standar C3',
                barData: c3BarData.length > 0 ? c3BarData : [
                    { category: '3A-1', value: 0 },
                    { category: '3A-2', value: 0 },
                    { category: '3A-3', value: 0 }
                ]
            }
        ];

        // Tambahkan grafik C4 jika user punya akses
        if (c4Results.filter(Boolean).length > 0) {
            chartDataArray.push({
                name: 'C4',
                count: c4Total,
                color: 'from-teal-500 to-cyan-500',
                icon: FiTarget,
                description: 'Standar C4',
                barData: c4BarData.length > 0 ? c4BarData : [
                    { category: '4A-1', value: 0 },
                    { category: '4A-2', value: 0 }
                ]
            });
        }

        // Tambahkan grafik C5 jika user punya akses
        if (c5Results.filter(Boolean).length > 0) {
            chartDataArray.push({
                name: 'C5',
                count: c5Total,
                color: 'from-amber-500 to-orange-500',
                icon: FiDatabase,
                description: 'Standar C5',
                barData: c5BarData.length > 0 ? c5BarData : [
                    { category: '5A-1', value: 0 },
                    { category: '5A-2', value: 0 }
                ]
            });
        }

        // Tambahkan grafik C6 jika user punya akses
        if (c6Results.filter(Boolean).length > 0) {
            chartDataArray.push({
                name: 'C6',
                count: c6Total,
                color: 'from-rose-500 to-pink-500',
                icon: FiFileText,
                description: 'Standar C6',
                barData: c6BarData.length > 0 ? c6BarData : [
                    { category: '6A-1', value: 0 },
                    { category: '6A-2', value: 0 }
                ]
            });
        }

        // Tambahkan grafik Panel Admin jika user punya akses ke dosen, pegawai, atau users
        if (hasDosenAccess || hasPegawaiAccess || hasUsersAccess) {
            const panelAdminBarData = [];
            if (hasDosenAccess) {
                panelAdminBarData.push({ category: 'Dosen', value: dosenCount });
            }
            if (hasPegawaiAccess) {
                panelAdminBarData.push({ category: 'Pegawai', value: pegawaiCount });
            }
            if (hasUsersAccess) {
                panelAdminBarData.push({ category: 'Users', value: usersCount });
            }
            
            const panelAdminTotal = dosenCount + pegawaiCount + usersCount;
            
            chartDataArray.push({
                name: 'Panel Admin',
                count: panelAdminTotal,
                color: 'from-pink-500 to-rose-500',
                icon: FiSettings,
                description: 'Panel Administrasi',
                barData: panelAdminBarData.length > 0 ? panelAdminBarData : [
                    { category: 'Dosen', value: 0 },
                    { category: 'Pegawai', value: 0 },
                    { category: 'Users', value: 0 }
                ]
            });
        }

        setChartData(chartDataArray);
        setLoading(false);
    }, [role]);

    // Fetch data untuk semua tabel saat pertama kali load
    useEffect(() => {
        if (role) {
            fetchAllChartData();
        } else {
            setLoading(false);
        }
    }, [role, fetchAllChartData]);

    // Auto-refresh grafik setiap 30 detik dan saat window focus untuk sinkronisasi dengan data tabel
    useEffect(() => {
        if (!role) return;

        // Auto-refresh setiap 30 detik
        const intervalId = setInterval(() => {
            fetchAllChartData();
        }, 30000); // 30 detik

        // Refresh saat window focus (user kembali ke tab)
        window.addEventListener('focus', fetchAllChartData);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', fetchAllChartData);
        };
    }, [role, fetchAllChartData]);

    // Hitung persentase untuk progress bar (max 100 untuk scaling yang lebih baik)
    const maxValue = 100;
    const calculatePercentage = (count) => Math.min((count / maxValue) * 100, 100);

    // Items per slide (1 item per slide)
    const itemsPerSlide = 1;
    const totalSlides = Math.ceil(chartData.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Grafik Data Tabel</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => router.push('/tables')}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                    >
                        Lihat Semua
                        <FiArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : (
                <div className="relative">
                    {/* Carousel Container */}
                    <div className="overflow-hidden rounded-xl">
                        <motion.div
                            animate={{
                                x: `-${currentSlide * (100 / totalSlides)}%`
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30
                            }}
                            className="flex"
                            style={{ width: `${totalSlides * 100}%` }}
                        >
                            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                                <div
                                    key={slideIndex}
                                    className="w-full"
                                    style={{ width: `${100 / totalSlides}%`, flexShrink: 0 }}
                                >
                                    {chartData.slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide).map((item, itemIndex) => {
                                        const IconComponent = item.icon;
                                        const percentage = calculatePercentage(item.count);
                                        const globalIndex = slideIndex * itemsPerSlide + itemIndex;
                                        return (
                                            <div key={globalIndex} className="space-y-4">
                                                {/* Line Chart Section */}
                                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <LineChart data={item.barData || []} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
                                                                stroke={
                                                                    item.name === 'C1' ? '#3b82f6' : 
                                                                    item.name === 'C2' ? '#8b5cf6' : 
                                                                    item.name === 'C3' ? '#10b981' :
                                                                    item.name === 'C4' ? '#14b8a6' :
                                                                    item.name === 'C5' ? '#f59e0b' :
                                                                    item.name === 'C6' ? '#f43f5e' :
                                                                    item.name === 'Panel Admin' ? '#ec4899' :
                                                                    '#3b82f6'
                                                                }
                                                                strokeWidth={2}
                                                                dot={{ 
                                                                    fill: item.name === 'C1' ? '#3b82f6' : 
                                                                          item.name === 'C2' ? '#8b5cf6' : 
                                                                          item.name === 'C3' ? '#10b981' :
                                                                          item.name === 'C4' ? '#14b8a6' :
                                                                          item.name === 'C5' ? '#f59e0b' :
                                                                          item.name === 'C6' ? '#f43f5e' :
                                                                          item.name === 'Panel Admin' ? '#ec4899' :
                                                                          '#3b82f6', 
                                                                    r: 4 
                                                                }}
                                                                activeDot={{ r: 6 }}
                                                                name="Jumlah Data"
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Card Section - Design seperti gambar 2 */}
                                                <motion.div
                                                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                                    className="group relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-all duration-300"
                                                    onClick={() => {
                                                        if (item.name === 'Panel Admin') {
                                                            // Redirect ke halaman tables dengan parameter untuk menampilkan panel admin
                                                            router.push('/tables');
                                                        } else {
                                                            router.push(`/tables?table=${item.name}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        {/* Icon dan Label */}
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className={`p-3 rounded-lg bg-gradient-to-br ${item.color} text-white shadow-md flex-shrink-0`}>
                                                                <IconComponent className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                                                                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Bottom Section dengan Navigation, Data, Progress */}
                                                    <div className="flex items-end justify-between gap-4">
                                                        {/* Left Navigation */}
                                                        {totalSlides > 1 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    prevSlide();
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-300 flex-shrink-0"
                                                                aria-label="Previous slide"
                                                            >
                                                                <FiChevronLeft className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {/* Data Section */}
                                                        <div className="flex-1">
                                                            <div className="text-4xl font-extrabold text-slate-900 mb-1">{item.count}</div>
                                                            <div className="text-xs text-gray-500 mb-3">Data</div>
                                                            
                                                            {/* Progress Bar */}
                                                            <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentage}%` }}
                                                                    transition={{ duration: 1, delay: globalIndex * 0.1, ease: "easeOut" }}
                                                                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Progress Percentage */}
                                                        <div className="text-right flex-shrink-0">
                                                            <div className={`text-base font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                                                {percentage.toFixed(0)}%
                                                            </div>
                                                            <div className="text-xs text-gray-500">Progress</div>
                                                        </div>

                                                        {/* Right Navigation */}
                                                        {totalSlides > 1 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    nextSlide();
                                                                }}
                                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-300 flex-shrink-0"
                                                                aria-label="Next slide"
                                                            >
                                                                <FiChevronRight className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};


// ----- [TIDAK DIUBAH] KOMPONEN UTAMA APP -----
export default function App() {
  const [mounted, setMounted] = useState(false);
  const { authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const role = authUser?.role;

  // Tentukan akses C1, C2, C3 berdasarkan role (sama seperti di tables/page.jsx)
  const c1AccessKeys = ["dosen", "pegawai", "tabel_1a1", "tabel_1a2", "tabel_1a3", "tabel_1a4", "tabel_1a5", "tabel_1b", "beban_kerja_dosen", "tendik"]; 
  const hasC1Access = useMemo(() => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === "ala" || roleLower === "kemahasiswaan") {
      return false;
    }
    return c1AccessKeys.some((k) => roleCan(role, k, "r"));
  }, [role]);

  const c2AccessKeys = [
    "tabel_2a1_pendaftaran",
    "tabel_2a2_keragaman_asal", 
    "tabel_2a3_kondisi_mahasiswa",
    "pemetaan2b1",
    "tabel_2b4_masa_tunggu",
    "tabel_2b5_kesesuaian_kerja",
    "tabel_2b6_kepuasan_pengguna",
    "fleksibilitas_pembelajaran",
    "rekognisi_lulusan"
  ];
  const hasC2Access = useMemo(() => c2AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c3AccessKeys = [
    "tabel_3a1_sarpras_penelitian",
    "tabel_3a2_penelitian",
    "tabel_3a3_pengembangan_dtpr",
    "tabel_3c1_kerjasama_penelitian",
    "tabel_3c2_publikasi_penelitian",
    "tabel_3c3_hki"
  ];
  const hasC3Access = useMemo(() => c3AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  // Akses C4, C5, C6
  const c4AccessKeys = ["tabel_4a1", "tabel_4a2"];
  const hasC4Access = useMemo(() => c4AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c5AccessKeys = ["tabel_5a1", "tabel_5a2"];
  const hasC5Access = useMemo(() => c5AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c6AccessKeys = ["tabel_6a1", "tabel_6a2"];
  const hasC6Access = useMemo(() => c6AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  // Akses Data Dosen
  const hasDosenAccess = useMemo(() => roleCan(role, "dosen", "r"), [role]);

  // Akses Data Pegawai
  const hasPegawaiAccess = useMemo(() => roleCan(role, "pegawai", "r"), [role]);

  // Akses Management Akun (kecuali untuk role ALA dan kemahasiswaan)
  const hasUsersAccess = useMemo(() => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === "ala" || roleLower === "kemahasiswaan") {
      return false;
    }
    return roleCan(role, "users", "r");
  }, [role]);

  // Cek apakah user bisa melihat grafik tabel (hanya untuk super admin, waket 1&2, tpm)
  const canSeeGrafikTabel = useMemo(() => {
    const roleLower = (role || '').toLowerCase();
    const allowedRoles = ['super admin', 'admin', 'waket-1', 'waket1', 'waket-2', 'waket2', 'tpm'];
    return allowedRoles.includes(roleLower);
  }, [role]);

  // Filter quick actions berdasarkan akses role
  const quickActions = useMemo(() => {
    const allQuickActions = [
      { label: 'Tabel C1', path: '/tables?table=C1', icon: FiBarChart, color: 'from-blue-500 to-cyan-500', hasAccess: hasC1Access },
      { label: 'Tabel C2', path: '/tables?table=C2', icon: FiTrendingUp, color: 'from-purple-500 to-violet-500', hasAccess: hasC2Access },
      { label: 'Tabel C3', path: '/tables?table=C3', icon: FiGrid, color: 'from-indigo-500 to-purple-500', hasAccess: hasC3Access },
      { label: 'Tabel C4', path: '/tables?table=C4', icon: FiTarget, color: 'from-teal-500 to-cyan-500', hasAccess: hasC4Access },
      { label: 'Tabel C5', path: '/tables?table=C5', icon: FiDatabase, color: 'from-amber-500 to-orange-500', hasAccess: hasC5Access },
      { label: 'Tabel C6', path: '/tables?table=C6', icon: FiFileText, color: 'from-rose-500 to-pink-500', hasAccess: hasC6Access },
      { label: 'Data Dosen', path: '/tables?table=TabelDosen', icon: FiUsers, color: 'from-green-500 to-emerald-500', hasAccess: hasDosenAccess },
      { label: 'Tabel Pegawai', path: '/tables?table=TabelPegawai', icon: FiUsers, color: 'from-orange-500 to-red-500', hasAccess: hasPegawaiAccess },
      { label: 'Management Akun', path: '/users', icon: FiSettings, color: 'from-pink-500 to-rose-500', hasAccess: hasUsersAccess }
    ];
    return allQuickActions.filter(item => item.hasAccess);
  }, [hasC1Access, hasC2Access, hasC3Access, hasC4Access, hasC5Access, hasC6Access, hasDosenAccess, hasPegawaiAccess, hasUsersAccess]);
  
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
                    <AnimatePresence mode="wait">
                      {authUser ? (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { duration: 0.5 } }}
                          className="min-h-screen bg-gradient-to-br from-[#f5f9ff] via-white to-white"
                        >
                          <div className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
                            <div className="container mx-auto max-w-7xl">
                              {/* Header Dashboard */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-6"
                              >
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
                                <p className="text-slate-600">Selamat datang kembali! Berikut ringkasan data Anda.</p>
                              </motion.div>

                              {/* Top Row: Statistik Cards (4 cards) */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-6"
                              >
                                <StatistikCards />
                              </motion.div>

                              {/* Middle Row: Grafik Tabel (Wide) & Selamat Datang (Small) */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                {/* Left: Grafik Tabel - Lebih Lebar */}
                                <div className="lg:col-span-2">
                                  {canSeeGrafikTabel ? (
                                    <motion.div
                                      initial="hidden"
                                      animate="visible"
                                      variants={slideUp}
                                      className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full"
                                    >
                                      <GrafikTabel />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      initial="hidden"
                                      animate="visible"
                                      variants={slideUp}
                                      className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full flex items-center justify-center"
                                    >
                                      <div className="text-center">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Grafik Data Tabel</h3>
                                        <p className="text-sm text-gray-500">Grafik hanya tersedia untuk admin dan waket.</p>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {/* Right: Selamat Datang - Lebih Kecil */}
                                <div className="lg:col-span-1">
                                  <WelcomeSection authUser={authUser} />
                                </div>
                              </div>

                              {/* Bottom Row: Akses Cepat (Small) & Unduh Dokumen (Wide) */}
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                {/* Left: Akses Cepat - Lebih Kecil */}
                                <div className="lg:col-span-1">
                                  <AksesCepatMarket quickActions={quickActions} />
                                </div>

                                {/* Right: Unduh Dokumen - Lebih Lebar */}
                                <div className="lg:col-span-2">
                                  <UnduhDokumenSection />
                                </div>
                              </div>

                              {/* Update Terkini - Full Width */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-6"
                              >
                                <AksesCepatBeritaDashboard />
                              </motion.div>

                              {/* Aktivitas Website - Full Width */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-6"
                              >
                                <AktivitasWebsite />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
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
                    </AnimatePresence>
                  </>
                )}
            </main>
        </div>
    </>
  );
}


"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { roleCan } from "../../lib/role";
import { apiFetch } from "../../lib/api";
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
const FiAlertTriangle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const FiCheckCircle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const FiPlusCircle = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const FiEdit = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const FiTrash = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);
const FiClock = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);
const FiRefreshCw = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>);
const FiUpload = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);
const FiX = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const FiAward = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>);
const FiShield = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>);
const FiShieldCheck = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>);
const FiClipboard = (props) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>);

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

    // Generate icon dan color otomatis berdasarkan judul dan prioritas
    const generateIconAndColor = (judul, prioritas) => {
        const judulLower = judul?.toLowerCase() || '';
        
        // Tentukan icon berdasarkan kata kunci di judul
        let icon = FiFileText;
        let color = 'from-blue-500 to-cyan-500';
        
        if (judulLower.includes('audit') || judulLower.includes('ami') || judulLower.includes('mutu')) {
            icon = FiShield;
            color = 'from-indigo-500 to-indigo-600';
        } else if (judulLower.includes('akreditasi') || judulLower.includes('unggul') || judulLower.includes('prestasi')) {
            icon = FiAward;
            color = 'from-emerald-500 to-emerald-600';
        } else if (judulLower.includes('sop') || judulLower.includes('prosedur') || judulLower.includes('dokumen')) {
            icon = FiFileText;
            color = 'from-amber-500 to-amber-600';
        } else if (judulLower.includes('workshop') || judulLower.includes('pelatihan') || judulLower.includes('seminar')) {
            icon = FiBookOpen;
            color = 'from-blue-500 to-cyan-500';
        } else if (judulLower.includes('penelitian') || judulLower.includes('pkm') || judulLower.includes('hibah')) {
            icon = FiTrendingUp;
            color = 'from-emerald-500 to-emerald-600';
        } else if (judulLower.includes('mahasiswa') || judulLower.includes('kemahasiswaan')) {
            icon = FiUsers;
            color = 'from-blue-500 to-cyan-500';
        } else if (judulLower.includes('pengumuman') || judulLower.includes('informasi')) {
            icon = FiClipboard;
            color = 'from-blue-500 to-cyan-500';
        } else {
            // Default berdasarkan prioritas
            if (prioritas === 'high') {
                icon = FiShield;
                color = 'from-indigo-500 to-indigo-600';
            } else if (prioritas === 'medium') {
                icon = FiFileText;
                color = 'from-blue-500 to-cyan-500';
            } else {
                icon = FiFileText;
                color = 'from-blue-500 to-cyan-500';
            }
        }
        
        return { icon, color };
    };

    // Mapping data dari backend ke format frontend
    const mapBackendToFrontend = (backendData) => {
        return backendData.map(item => {
            // Generate icon dan color otomatis
            const { icon, color } = generateIconAndColor(item.judul, item.prioritas);
            
            // Format tanggal untuk time display dengan hari dan jam
            const formatTime = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const dayName = days[date.getDay()];
                const dateStr = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                const timeStr = date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                return `${dayName}, ${dateStr} ${timeStr} WIB`;
            };
            
            // Format tanggal untuk display
            const formatDateDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            // Format waktu untuk "Dibuat"
            const formatCreatedAt = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const day = date.getDate();
                const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
            };

            // Hitung reading time (estimasi sederhana: 200 kata per menit)
            const calculateReadTime = (text) => {
                if (!text) return '1 menit';
                const wordCount = text.split(/\s+/).length;
                const minutes = Math.max(1, Math.ceil(wordCount / 200));
                return `${minutes} menit`;
            };

            return {
                id: item.id_berita,
                title: item.judul,
                excerpt: item.ringkasan,
                date: item.tanggal_publikasi,
                dateDisplay: formatDateDisplay(item.tanggal_publikasi),
                time: formatTime(item.tanggal_publikasi),
                created_at: item.created_at,
                created_at_display: formatCreatedAt(item.created_at),
                readTime: calculateReadTime(item.ringkasan || item.isi || ''),
                priority: item.prioritas || 'medium',
                status: item.status || 'published',
                author: item.penulis || item.author || 'Admin',
                nama_user: item.nama_user || item.user?.nama || '',
                color: color,
                icon: icon
            };
        });
    };

    // Fetch data dari API
    const fetchBerita = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/berita');
            
            // Pastikan data adalah array
            let dataArray = [];
            if (Array.isArray(data)) {
                dataArray = data;
            } else if (data && typeof data === 'object') {
                dataArray = data.data || data.items || data.results || Object.values(data);
            }
            
            if (dataArray.length === 0) {
                setBerita([]);
                setLoading(false);
                return;
            }
            
            // Filter out deleted items
            const activeData = dataArray.filter(item => !item.deleted_at);
            
            // Sort berdasarkan tanggal publikasi (terbaru di atas)
            activeData.sort((a, b) => {
                const dateA = new Date(a.tanggal_publikasi || a.created_at || 0);
                const dateB = new Date(b.tanggal_publikasi || b.created_at || 0);
                return dateB - dateA; // Descending (terbaru di atas)
            });
            
            // Ambil 2 berita terbaru
            const latestBerita = activeData.slice(0, 2);
            
            // Map data ke format frontend
            const mappedData = mapBackendToFrontend(latestBerita);
            setBerita(mappedData);
        } catch (error) {
            console.error('Error fetching berita:', error);
            setBerita([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBerita();
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

    // Helper function untuk mendapatkan warna solid dari gradient
    const getColorClasses = (color) => {
        const colorMap = {
            'from-blue-500 to-cyan-500': { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
            'from-green-500 to-emerald-500': { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
            'from-purple-500 to-violet-500': { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
            'from-orange-500 to-red-500': { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' }
        };
        return colorMap[color] || { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' };
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
                        <div className="h-10 w-10 bg-slate-200 rounded-lg mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ))
            ) : (
                stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    const colors = getColorClasses(stat.color);
                    return (
                        <motion.div
                            key={index}
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2 }}
                            className="group bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-2.5 rounded-lg ${colors.light} group-hover:scale-105 transition-transform duration-200`}>
                                    <IconComponent className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md ${
                                    stat.trend === 'up' 
                                        ? 'bg-emerald-50 text-emerald-600' 
                                        : 'bg-red-50 text-red-600'
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
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                                    {stat.value}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
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
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        name: '',
        description: ''
    });
    const shouldReduceMotion = useReducedMotion();

    // Fungsi untuk mengumpulkan dokumen dari semua tabel
    const fetchDocumentsFromTables = async () => {
        const BASE_URL = "http://localhost:3000/api";
        const allDocuments = [];
        
        // Daftar endpoint dan field yang mengandung link dokumen
        const tableConfigs = [
            // C1
            { endpoint: '/audit-mutu-internal', fields: ['laporan_audit_url', 'bukti_certified_url'], tableName: 'Tabel 1B - Audit Mutu Internal' },
            // C2 - jika ada field link dokumen
            // C3
            { endpoint: '/tabel-3a1-sarpras-penelitian', fields: ['link_bukti'], tableName: 'Tabel 3A-1' },
            { endpoint: '/tabel-3a2-penelitian', fields: ['link_bukti'], tableName: 'Tabel 3A-2' },
            { endpoint: '/tabel-3a3-pengembangan-dtpr/detail', fields: ['link_bukti'], tableName: 'Tabel 3A-3' },
            { endpoint: '/tabel-3c1-kerjasama', fields: ['link_bukti'], tableName: 'Tabel 3C-1' },
            { endpoint: '/tabel-3c2-publikasi', fields: ['link_bukti'], tableName: 'Tabel 3C-2' },
            { endpoint: '/tabel-3c3-hki', fields: ['link_bukti'], tableName: 'Tabel 3C-3' },
            // C4
            { endpoint: '/tabel-4a1-sarpras-pkm', fields: ['link_bukti'], tableName: 'Tabel 4A-1' },
            { endpoint: '/tabel-4a2', fields: ['link_bukti'], tableName: 'Tabel 4A-2' },
            { endpoint: '/tabel-4c1-kerjasama-pkm', fields: ['link_bukti'], tableName: 'Tabel 4C-1' },
            { endpoint: '/tabel-4c2-diseminasi-pkm', fields: ['link_bukti'], tableName: 'Tabel 4C-2' },
            { endpoint: '/tabel-4c3-hki-pkm', fields: ['link_bukti'], tableName: 'Tabel 4C-3' },
            // C5
            { endpoint: '/tabel-5-1-sistem-tata-kelola', fields: ['link_bukti'], tableName: 'Tabel 5.1' },
            { endpoint: '/tabel-5-2-sarpras-pendidikan', fields: ['link_bukti'], tableName: 'Tabel 5.2' },
            // C6
            { endpoint: '/tabel-6-kesesuaian-visi-misi', fields: ['link_bukti'], tableName: 'Tabel 6' },
        ];

        try {
            // Fetch data dari semua tabel secara paralel
            const fetchPromises = tableConfigs.map(async (config) => {
                try {
                    const response = await fetch(`${BASE_URL}${config.endpoint}`, {
                        credentials: "include",
                        mode: "cors",
                    });
                    
                    if (!response.ok) {
                        return [];
                    }
                    
                    const data = await response.json();
                    const items = Array.isArray(data) ? data : (data?.items || data?.data || []);
                    
                    // Ekstrak dokumen dari setiap item
                    const docs = [];
                    items.forEach((item, index) => {
                        config.fields.forEach(field => {
                            if (item[field] && item[field].trim()) {
                                // Validasi bahwa ini adalah URL/link yang valid
                                const link = item[field].trim();
                                if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('www.')) {
                                    docs.push({
                                        id: `${config.endpoint}-${index}-${field}`,
                                        code: `${config.tableName.substring(0, 8).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
                                        name: `${config.tableName} - ${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
                                        link: link,
                                        date: item.updated_at || item.created_at || new Date().toISOString(),
                                        tableName: config.tableName,
                                        fieldName: field
                                    });
                                }
                            }
                        });
                    });
                    
                    return docs;
                } catch (error) {
                    console.warn(`Failed to fetch from ${config.endpoint}:`, error);
                    return [];
                }
            });

            const results = await Promise.all(fetchPromises);
            const flattenedDocs = results.flat();
            
            // Sort by date (newest first)
            flattenedDocs.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });

            // Format documents untuk display
            const formattedDocs = flattenedDocs.map((doc, index) => ({
                id: doc.id,
                code: doc.code,
                name: doc.name,
                link: doc.link,
                date: new Date(doc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                tableName: doc.tableName,
                status: "Available"
            }));

            setDocuments(formattedDocs);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentsFromTables();
    }, []);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!uploadForm.name) {
                setUploadForm(prev => ({
                    ...prev,
                    name: file.name.replace(/\.[^/.]+$/, "")
                }));
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Pilih file terlebih dahulu');
            return;
        }
        if (!uploadForm.name.trim()) {
            alert('Masukkan nama dokumen');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', uploadForm.name);
            formData.append('description', uploadForm.description || '');

            // TODO: Ganti dengan endpoint API yang sesuai
            const BASE_URL = "http://localhost:3000/api";
            const response = await fetch(`${BASE_URL}/documents/upload`, {
                method: 'POST',
                credentials: "include",
                mode: "cors",
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload gagal');
            }

            const result = await response.json();
            
            // Tambahkan dokumen baru ke list
            const newDoc = {
                id: documents.length + 1,
                code: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
                name: uploadForm.name,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                size: formatFileSize(selectedFile.size),
                status: "Available"
            };

            // Refresh dokumen dari tabel setelah upload
            await fetchDocumentsFromTables();
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadForm({ name: '', description: '' });
            alert('Dokumen berhasil diupload!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal mengupload dokumen. Silakan coba lagi.');
        } finally {
            setUploading(false);
        }
    };

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
        <>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={slideUp}
                className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 h-full"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Link Dokumen</h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setLoading(true);
                                fetchDocumentsFromTables();
                            }}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh dokumen"
                        >
                            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        <button 
                            onClick={() => router.push('/tables')}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                        >
                            Lihat Semua Tabel
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-sm">Tidak ada dokumen yang tersedia</p>
                                <p className="text-gray-400 text-xs mt-1">Dokumen akan muncul setelah diupload di tabel</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Dokumen</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tabel</th>
                                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Link Dokumen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {documents.map((doc, index) => (
                                        <tr 
                                            key={doc.id} 
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-slate-900">{index + 1}</div>
                                            </td>
                                            <td className="py-3 px-2 text-gray-600">{doc.date}</td>
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-slate-900">{doc.name}</div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                    {doc.tableName || '-'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                {doc.link ? (
                                                    <a
                                                        href={doc.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0384d6] hover:text-[#043975] hover:bg-blue-50 rounded-md transition-colors"
                                                    >
                                                        <FiDownload className="w-3.5 h-3.5" />
                                                        <span>Buka Link</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => !uploading && setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Upload Dokumen</h3>
                                <button
                                    onClick={() => !uploading && setShowUploadModal(false)}
                                    disabled={uploading}
                                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* File Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih File
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleFileSelect}
                                            disabled={uploading}
                                            className="hidden"
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                                selectedFile
                                                    ? 'border-[#0384d6] bg-blue-50'
                                                    : 'border-gray-300 hover:border-[#0384d6] hover:bg-gray-50'
                                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center">
                                                    <FiFile className="w-8 h-8 text-[#0384d6] mb-2" />
                                                    <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium text-[#0384d6]">Klik untuk upload</span> atau drag & drop
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Nama Dokumen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Dokumen <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadForm.name}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                                        disabled={uploading}
                                        placeholder="Masukkan nama dokumen"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0384d6] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Deskripsi (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi <span className="text-gray-400 text-xs">(Opsional)</span>
                                    </label>
                                    <textarea
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                                        disabled={uploading}
                                        placeholder="Masukkan deskripsi dokumen"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0384d6] focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setSelectedFile(null);
                                            setUploadForm({ name: '', description: '' });
                                        }}
                                        disabled={uploading}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || !selectedFile || !uploadForm.name.trim()}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#0384d6] hover:bg-[#043975] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <FiRefreshCw className="w-4 h-4 animate-spin" />
                                                <span>Mengupload...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiUpload className="w-4 h-4" />
                                                <span>Upload</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
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
            className="relative bg-gradient-to-br from-[#043975] via-[#0384d6] to-[#043975] rounded-3xl shadow-2xl p-8 h-full text-white overflow-hidden"
        >
            {/* Background Grid Pattern - White Lines */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                    backgroundPosition: '0 0'
                }}></div>
            </div>

            {/* Decorative Circle */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-[#ffbf1b]/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    {/* Greeting Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-3"
                    >
                        <div className="w-1.5 h-1.5 bg-[#ffbf1b] rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-semibold text-white/90">{greeting}</span>
                    </motion.div>

                    {/* Welcome Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-lg md:text-xl font-bold mb-1 leading-tight">
                            Selamat Datang,
                        </h2>
                        <h3 className="text-base md:text-lg font-bold mb-2 text-[#ffbf1b] truncate">
                            {userName}
                        </h3>
                        <p className="text-xs text-white/80 mb-3 leading-relaxed">
                            Login sebagai <span className="font-semibold text-white">{userRole}</span>
                        </p>
                    </motion.div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 pt-4 border-t border-white/20"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-white/60 mb-0.5">Waktu</p>
                            <p className="text-sm font-bold text-white">{currentTime}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-white/60 mb-0.5">Status</p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-xs font-semibold text-white">Online</p>
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

    // Generate icon dan color otomatis berdasarkan judul dan prioritas
    const generateIconAndColor = (judul, prioritas) => {
        const judulLower = judul?.toLowerCase() || '';
        
        // Tentukan icon berdasarkan kata kunci di judul
        let icon = FiFileText;
        let color = 'from-blue-500 to-cyan-500';
        
        if (judulLower.includes('audit') || judulLower.includes('ami') || judulLower.includes('mutu')) {
            icon = FiShield;
            color = 'from-indigo-500 to-indigo-600';
        } else if (judulLower.includes('akreditasi') || judulLower.includes('unggul') || judulLower.includes('prestasi')) {
            icon = FiAward;
            color = 'from-emerald-500 to-emerald-600';
        } else if (judulLower.includes('sop') || judulLower.includes('prosedur') || judulLower.includes('dokumen')) {
            icon = FiFileText;
            color = 'from-amber-500 to-amber-600';
        } else if (judulLower.includes('workshop') || judulLower.includes('pelatihan') || judulLower.includes('seminar')) {
            icon = FiBookOpen;
            color = 'from-blue-500 to-cyan-500';
        } else if (judulLower.includes('penelitian') || judulLower.includes('pkm') || judulLower.includes('hibah')) {
            icon = FiTrendingUp;
            color = 'from-emerald-500 to-emerald-600';
        } else if (judulLower.includes('mahasiswa') || judulLower.includes('kemahasiswaan')) {
            icon = FiUsers;
            color = 'from-blue-500 to-cyan-500';
        } else if (judulLower.includes('pengumuman') || judulLower.includes('informasi')) {
            icon = FiClipboard;
            color = 'from-blue-500 to-cyan-500';
        } else {
            // Default berdasarkan prioritas
            if (prioritas === 'high') {
                icon = FiShield;
                color = 'from-indigo-500 to-indigo-600';
            } else if (prioritas === 'medium') {
                icon = FiFileText;
                color = 'from-blue-500 to-cyan-500';
            } else {
                icon = FiFileText;
                color = 'from-blue-500 to-cyan-500';
            }
        }
        
        return { icon, color };
    };

    // Mapping data dari backend ke format frontend
    const mapBackendToFrontend = (backendData) => {
        return backendData.map(item => {
            // Generate icon dan color otomatis
            const { icon, color } = generateIconAndColor(item.judul, item.prioritas);
            
            // Format tanggal untuk time display dengan hari dan jam
            const formatTime = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const dayName = days[date.getDay()];
                const dateStr = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                const timeStr = date.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                return `${dayName}, ${dateStr} ${timeStr} WIB`;
            };
            
            // Format tanggal untuk display
            const formatDateDisplay = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            // Format waktu untuk "Dibuat"
            const formatCreatedAt = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const day = date.getDate();
                const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${day} ${month} ${year} pukul ${hours}.${minutes}`;
            };

            // Hitung reading time (estimasi sederhana: 200 kata per menit)
            const calculateReadTime = (text) => {
                if (!text) return '1 menit';
                const wordCount = text.split(/\s+/).length;
                const minutes = Math.max(1, Math.ceil(wordCount / 200));
                return `${minutes} menit`;
            };

            return {
                id: item.id_berita,
                title: item.judul,
                excerpt: item.ringkasan,
                date: item.tanggal_publikasi,
                dateDisplay: formatDateDisplay(item.tanggal_publikasi),
                time: formatTime(item.tanggal_publikasi),
                created_at: item.created_at,
                created_at_display: formatCreatedAt(item.created_at),
                readTime: calculateReadTime(item.ringkasan || item.isi || ''),
                priority: item.prioritas || 'medium',
                status: item.status || 'published',
                author: item.penulis || item.author || 'Admin',
                nama_user: item.nama_user || item.user?.nama || '',
                is_pinned: item.is_pinned || item.pinned || false,
                color: color,
                icon: icon
            };
        });
    };

    // Fetch data dari API
    const fetchBerita = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/berita');
            
            // Pastikan data adalah array
            let dataArray = [];
            if (Array.isArray(data)) {
                dataArray = data;
            } else if (data && typeof data === 'object') {
                dataArray = data.data || data.items || data.results || Object.values(data);
            }
            
            if (dataArray.length === 0) {
                setBerita([]);
                setLoading(false);
                return;
            }
            
            // Filter out deleted items
            const activeData = dataArray.filter(item => !item.deleted_at);
            
            // Sort: Pinned berita di atas, lalu berdasarkan updated_at (terbaru di atas), lalu created_at
            activeData.sort((a, b) => {
                const aPinned = a.is_pinned || a.pinned || false;
                const bPinned = b.is_pinned || b.pinned || false;
                
                // Pinned berita selalu di atas
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                
                // Jika keduanya pinned atau tidak pinned, sort berdasarkan updated_at terlebih dahulu
                const updatedA = new Date(a.updated_at || a.created_at || a.tanggal_publikasi || 0);
                const updatedB = new Date(b.updated_at || b.created_at || b.tanggal_publikasi || 0);
                
                // Jika updated_at berbeda, sort berdasarkan updated_at (terbaru di atas)
                if (updatedA.getTime() !== updatedB.getTime()) {
                    return updatedB - updatedA; // Descending (terbaru di atas)
                }
                
                // Jika updated_at sama, sort berdasarkan tanggal publikasi atau created_at
                const dateA = new Date(a.tanggal_publikasi || a.created_at || 0);
                const dateB = new Date(b.tanggal_publikasi || b.created_at || 0);
                return dateB - dateA; // Descending (terbaru di atas)
            });
            
            // Ambil berita dengan prioritas: pinned berita dulu, lalu yang terbaru
            // Jika ada pinned berita, ambil pinned berita terlebih dahulu (maks 2)
            // Jika tidak ada atau kurang dari 2, tambahkan berita terbaru yang tidak di-pin
            const pinnedBerita = activeData.filter(item => item.is_pinned || item.pinned);
            const unpinnedBerita = activeData.filter(item => !(item.is_pinned || item.pinned));
            
            let latestBerita = [];
            if (pinnedBerita.length > 0) {
                // Ambil pinned berita (maks 2)
                latestBerita = pinnedBerita.slice(0, 2);
                // Jika kurang dari 2, tambahkan berita terbaru yang tidak di-pin
                if (latestBerita.length < 2 && unpinnedBerita.length > 0) {
                    const remaining = 2 - latestBerita.length;
                    latestBerita = [...latestBerita, ...unpinnedBerita.slice(0, remaining)];
                }
            } else {
                // Jika tidak ada pinned berita, ambil 2 berita terbaru
                latestBerita = activeData.slice(0, 2);
            }
            
            // Map data ke format frontend
            const mappedData = mapBackendToFrontend(latestBerita);
            setBerita(mappedData);
        } catch (error) {
            console.error('Error fetching berita:', error);
            setBerita([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBerita();
    }, []);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 overflow-hidden"
        >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                            Akses Cepat Berita
                        </h3>
                        <p className="text-base text-slate-500 font-medium">Informasi terbaru dari Tim Penjaminan Mutu</p>
                    </div>
                    <button 
                        onClick={() => router.push('/berita')}
                        className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#0384d6] to-[#043975] rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                    >
                        <span className="relative z-10">Lihat Semua</span>
                        <FiArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#043975] to-[#0384d6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                            const IconComponent = item.icon || FiFileText;
                            return (
                                <motion.div
                                    key={item.id}
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                                    onClick={() => router.push('/berita')}
                                    className="group relative bg-white/90 backdrop-blur-sm p-7 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden border border-white/60 hover:border-white/80"
                                >
                                {/* Header dengan badge dan icon */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {item.priority === 'high' && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                Prioritas Tinggi
                                            </span>
                                        )}
                                        {item.priority === 'medium' && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                                                Prioritas Sedang
                                            </span>
                                        )}
                                        {item.priority === 'low' && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                                Prioritas Rendah
                                            </span>
                                        )}
                                        {item.status && (
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                                                item.status === 'published' || item.status === 'diterbitkan'
                                                    ? 'bg-green-100 text-green-700'
                                                    : item.status === 'draft'
                                                    ? 'bg-gray-100 text-gray-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {item.status === 'published' || item.status === 'diterbitkan' ? 'Diterbitkan' : item.status === 'draft' ? 'Draft' : 'Diarsipkan'}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        <IconComponent className="h-6 w-6 text-white relative z-10" />
                                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-extrabold text-slate-900 mb-4 leading-tight group-hover:bg-gradient-to-r group-hover:from-[#043975] group-hover:to-[#0384d6] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                    {item.title}
                                </h3>

                                <p className="text-slate-600 mb-5 leading-relaxed text-sm font-medium">
                                    {item.excerpt}
                                </p>

                                {/* Author & Created Info */}
                                <div className="mb-4 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-gray-500">
                                            Oleh: <span className="font-medium">{item.author}</span>
                                        </span>
                                        {item.nama_user && (
                                            <span className="text-xs text-gray-400">
                                                ({item.nama_user})
                                            </span>
                                        )}
                                    </div>
                                    {item.created_at_display && (
                                        <div className="text-xs text-gray-400">
                                            Dibuat: {item.created_at_display}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-5 border-t border-slate-200/50">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                        {item.dateDisplay && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50/80 backdrop-blur-sm">
                                                <FiCalendar className="w-3.5 h-3.5" />
                                                <span>{item.dateDisplay}</span>
                                            </div>
                                        )}
                                        {item.readTime && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50/80 backdrop-blur-sm">
                                                <FiClock className="w-3.5 h-3.5" />
                                                <span>{item.readTime}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0384d6]/10 to-[#043975]/10 text-sm font-bold text-[#0384d6] group-hover:from-[#0384d6] group-hover:to-[#043975] group-hover:text-white transition-all duration-300">
                                        <span>Baca</span>
                                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Komponen Aktivitas Website
const AktivitasWebsite = () => {
    const router = useRouter();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const shouldReduceMotion = useReducedMotion();

    // Dummy log dengan status & icon ala notifikasi
    const activityData = [
        {
            id: 1,
            status: 'success',
            activity: "Pengguna 'Budi' berhasil menambah data",
            detail: 'Tabel 3A-1: sarpras penelitian',
            user: 'Budi',
            timestamp: '2025-12-09T15:21:00Z'
        },
        {
            id: 2,
            status: 'info',
            activity: 'Otomatis: Data transaksi 30 hari yang lalu',
            detail: 'Sinkronisasi data transaksi bulanan',
            user: 'Sistem',
            timestamp: '2025-12-09T12:05:00Z'
        },
        {
            id: 3,
            status: 'warning',
            activity: "Pengguna 'Admin' menghapus data",
            detail: 'Laporan: Penjualan Q1 2023',
            user: 'Admin',
            timestamp: '2025-12-09T10:11:00Z'
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
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 overflow-hidden"
        >
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                            Aktivitas Terbaru
                        </h3>
                        <p className="text-base text-slate-500 font-medium">Log aktivitas sistem terkini</p>
                    </div>
                    <button 
                        onClick={() => router.push('/activity')}
                        className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#0384d6] to-[#043975] rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                    >
                        <span className="relative z-10">Lihat Semua</span>
                        <FiArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#043975] to-[#0384d6] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                </div>

            {loading ? (
                <div className="space-y-3 overflow-x-hidden">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent pointer-events-none"></div>

                    <div className="space-y-3 max-h-[520px] overflow-y-auto overflow-x-hidden pr-2">
                        {activities.map((item, index) => {
                            // Status styling map
                            const statusMap = {
                                success: {
                                    label: 'Berhasil',
                                    icon: FiCheckCircle,
                                    dot: 'bg-emerald-500',
                                    badgeBg: 'bg-emerald-50',
                                    badgeText: 'text-emerald-700',
                                    badgeBorder: 'border border-emerald-100'
                                },
                                info: {
                                    label: 'Informasi',
                                    icon: FiClipboard,
                                    dot: 'bg-blue-500',
                                    badgeBg: 'bg-blue-50',
                                    badgeText: 'text-blue-700',
                                    badgeBorder: 'border border-blue-100'
                                },
                                warning: {
                                    label: 'Peringatan',
                                    icon: FiAlertTriangle,
                                    dot: 'bg-amber-500',
                                    badgeBg: 'bg-amber-50',
                                    badgeText: 'text-amber-700',
                                    badgeBorder: 'border border-amber-100'
                                },
                                default: {
                                    label: 'Aktivitas',
                                    icon: FiActivity,
                                    dot: 'bg-slate-400',
                                    badgeBg: 'bg-slate-50',
                                    badgeText: 'text-slate-700',
                                    badgeBorder: 'border border-slate-100'
                                }
                            };

                            const status = statusMap[item.status] || statusMap.default;
                            const StatusIcon = status.icon;

                            // Format timestamp
                            const ts = item.timestamp ? new Date(item.timestamp) : null;
                            const formattedDate = ts
                                ? ts.toLocaleString('id-ID', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : item.time;

                            return (
                                <motion.div
                                    key={item.id}
                                    variants={slideUp}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={undefined}
                                    className="group relative flex gap-4 pl-10 pr-4 py-5 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg border border-transparent hover:border-white/40 transition-all duration-300"
                                >
                                    {/* Timeline dot */}
                                    <div className={`absolute left-4 top-4 w-2.5 h-2.5 rounded-full ${status.dot} shadow-sm`}></div>

                                    {/* Icon */}
                                    <div className={`flex-shrink-0 p-3.5 rounded-xl ${status.badgeBg} ${status.badgeBorder} text-slate-700 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                                        <StatusIcon className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded ${status.badgeBg} ${status.badgeText} ${status.badgeBorder}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {status.label.toUpperCase()}
                                            </span>
                                            {formattedDate && (
                                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                    <FiClock className="w-3 h-3" />
                                                    {formattedDate}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-base font-extrabold text-slate-900 mb-1 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-[#043975] group-hover:to-[#0384d6] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                                            {item.activity}
                                        </h4>
                                        {item.detail && (
                                            <p className="text-xs text-gray-600 mb-0.5 line-clamp-2">
                                                {item.detail}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-gray-400">
                                            oleh {item.user}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
            </div>
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

// Komponen Akses Cepat - Redesigned dengan Grid Card Layout
const AksesCepatMarket = ({ quickActions }) => {
    const router = useRouter();
    const shouldReduceMotion = useReducedMotion();

    // Kategorisasi quick actions
    const categorizedActions = useMemo(() => {
        if (!quickActions || quickActions.length === 0) return { tables: [], admin: [] };
        
        const adminLabels = ['Data Dosen', 'Tabel Pegawai', 'Tenaga Kependidikan', 'Management Akun', 'Panel Admin'];
        const tables = quickActions.filter(item => item.label.startsWith('Tabel C'));
        const admin = quickActions.filter(item => adminLabels.includes(item.label));
        
        return { tables, admin };
    }, [quickActions]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-10 h-full overflow-hidden"
        >
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="mb-10 space-y-2">
                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                        Akses Cepat Tabel
                    </h3>
                    <p className="text-base text-slate-500 font-medium">Navigasi cepat ke tabel data</p>
                </div>

            {quickActions && quickActions.length > 0 ? (
                <div className="space-y-6">
                    {/* Tabel Data Section */}
                    {categorizedActions.tables.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Tabel Data</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {categorizedActions.tables.map((item, i) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <motion.button
                                            key={i}
                                            variants={slideUp}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: i * 0.05 }}
                                            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                                            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                            onClick={() => router.push(item.path)}
                                            className="group relative p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-transparent transition-all duration-300 text-left overflow-hidden"
                                        >
                                            {/* Background Gradient on Hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                            
                                            {/* Content */}
                                            <div className="relative z-10 flex items-center gap-3">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 text-sm mb-0.5 truncate group-hover:text-[#0384d6] transition-colors">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Klik untuk buka</div>
                                                </div>
                                                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0384d6] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Panel Admin Section */}
                    {categorizedActions.admin.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Panel Admin</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {categorizedActions.admin.map((item, i) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <motion.button
                                            key={i}
                                            variants={slideUp}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: (categorizedActions.tables.length + i) * 0.05 }}
                                            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02 }}
                                            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                            onClick={() => router.push(item.path)}
                                            className="group relative p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-transparent transition-all duration-300 text-left overflow-hidden"
                                        >
                                            {/* Background Gradient on Hover */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                            
                                            {/* Content */}
                                            <div className="relative z-10 flex items-center gap-3">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 flex-shrink-0`}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 text-sm mb-0.5 truncate group-hover:text-[#0384d6] transition-colors">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Klik untuk buka</div>
                                                </div>
                                                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0384d6] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <FiGrid className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Tidak ada akses cepat tersedia</p>
                    <p className="text-gray-400 text-xs mt-1">Hubungi administrator untuk mendapatkan akses</p>
                </div>
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
        { key: '4a1', label: '4A-1', endpoint: '/tabel-4a1-sarpras-pkm', accessKey: 'tabel_4a1_sarpras_pkm' },
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

    // Fungsi untuk menghitung tahun TS, TS-1, TS-2, TS-3, TS-4 dari tahun terbaru
    const getTahunTSParams = async () => {
        try {
            const BASE_URL = "http://localhost:3000/api";
            const response = await fetch(`${BASE_URL}/tahun-akademik`, {
                credentials: "include",
                mode: "cors",
            });
            
            if (!response.ok) {
                return null;
            }
            
            const data = await response.json();
            const tahunList = Array.isArray(data) ? data : (data?.items || []);
            
            if (tahunList.length === 0) {
                return null;
            }
            
            // Urutkan tahun dari terkecil ke terbesar
            const sortedTahunList = [...tahunList].sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0));
            
            // Cari tahun yang mengandung tahun saat ini
            const currentYear = new Date().getFullYear();
            const tahunTerpilih = sortedTahunList.find(t => {
                const tahunStr = String(t.tahun || t.nama || '');
                return tahunStr.includes(String(currentYear));
            });
            
            // Gunakan tahun terpilih atau tahun terakhir
            const selectedTahun = tahunTerpilih || sortedTahunList[sortedTahunList.length - 1];
            if (!selectedTahun) return null;
            
            const selectedIndex = sortedTahunList.findIndex(t => t.id_tahun === selectedTahun.id_tahun);
            if (selectedIndex === -1) return null;
            
            const tahunTS = sortedTahunList[selectedIndex]?.id_tahun;
            const tahunTS1 = selectedIndex > 0 ? sortedTahunList[selectedIndex - 1]?.id_tahun : tahunTS;
            const tahunTS2 = selectedIndex > 1 ? sortedTahunList[selectedIndex - 2]?.id_tahun : tahunTS1;
            const tahunTS3 = selectedIndex > 2 ? sortedTahunList[selectedIndex - 3]?.id_tahun : tahunTS2;
            const tahunTS4 = selectedIndex > 3 ? sortedTahunList[selectedIndex - 4]?.id_tahun : tahunTS3;
            
            return { tahunTS, tahunTS1, tahunTS2, tahunTS3, tahunTS4 };
        } catch (error) {
            console.warn('Failed to fetch tahun akademik for TS params:', error);
            return null;
        }
    };

    // Fungsi untuk fetch data count dari API
    const fetchTableDataCount = async (endpoint, tsId = null, useTahunTS = false) => {
        try {
            const BASE_URL = "http://localhost:3000/api";
            let url = `${BASE_URL}${endpoint}`;
            
            // Jika menggunakan parameter tahun TS (untuk Tabel3A2, 3A3)
            if (useTahunTS) {
                const tahunParams = await getTahunTSParams();
                if (tahunParams && tahunParams.tahunTS) {
                    url += `${url.includes('?') ? '&' : '?'}id_tahun_ts=${tahunParams.tahunTS}&id_tahun_ts_1=${tahunParams.tahunTS1}&id_tahun_ts_2=${tahunParams.tahunTS2}&id_tahun_ts_3=${tahunParams.tahunTS3}&id_tahun_ts_4=${tahunParams.tahunTS4}`;
                } else {
                    return 0; // Jika tidak ada tahun params, return 0
                }
            } else if (tsId) {
            // Tambahkan parameter ts_id jika diperlukan
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
        
        // Fetch data untuk C3 - Perlu ts_id untuk beberapa tabel, dan tahun TS untuk 3a2 dan 3a3
        const latestTahunId = await getLatestTahunId();
        const c3DataPromises = C3_TABLES.map(async (table) => {
            if (!roleCan(role, table.accessKey, 'r')) return null;
            const needsTsId = ['3c1', '3c2', '3c3'].includes(table.key);
            const needsTahunTS = ['3a2', '3a3'].includes(table.key);
            const count = await fetchTableDataCount(table.endpoint, needsTsId ? latestTahunId : null, needsTahunTS);
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

    // Auto-refresh dihapus - refresh hanya melalui button manual

    // Hitung persentase untuk progress bar (max 100 untuk scaling yang lebih baik)
    const maxValue = 100;
    const calculatePercentage = (count) => Math.min((count / maxValue) * 100, 100);

    // Items per slide (1 item per slide)
    const itemsPerSlide = 1;
    const totalSlides = Math.ceil(chartData.length / itemsPerSlide);
    const [isLooping, setIsLooping] = useState(false);

    const nextSlide = () => {
        if (currentSlide === totalSlides - 1) {
            // Dari slide terakhir ke slide pertama (loop)
            setIsLooping(true);
            setCurrentSlide(0);
            // Reset isLooping setelah animasi selesai
            setTimeout(() => setIsLooping(false), 50);
        } else {
            setIsLooping(false);
            setCurrentSlide((prev) => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide === 0) {
            // Dari slide pertama ke slide terakhir (loop)
            setIsLooping(true);
            setCurrentSlide(totalSlides - 1);
            // Reset isLooping setelah animasi selesai
            setTimeout(() => setIsLooping(false), 50);
        } else {
            setIsLooping(false);
            setCurrentSlide((prev) => prev - 1);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Grafik Data Tabel</h3>
                    <p className="text-sm text-slate-500">Visualisasi data dari semua tabel</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            fetchAllChartData();
                        }}
                        disabled={loading}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        title="Refresh data grafik"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => router.push('/tables')}
                        className="text-sm font-semibold text-[#0384d6] hover:text-[#043975] transition-colors flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50"
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
                    {/* Navigation Buttons - Outside Carousel */}
                    {totalSlides > 1 && (
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={prevSlide}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-md"
                                aria-label="Previous slide"
                            >
                                <FiChevronLeft className="w-5 h-5" />
                            </button>
                            
                            {/* Dots Indicator */}
                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalSlides }).map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setIsLooping(false);
                                            setCurrentSlide(index);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            currentSlide === index
                                                ? 'bg-[#0384d6] w-6'
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                            
                            <button
                                onClick={nextSlide}
                                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-md"
                                aria-label="Next slide"
                            >
                                <FiChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Carousel Container */}
                    <div className="overflow-hidden rounded-xl">
                        <motion.div
                            key={isLooping ? `loop-${currentSlide}` : `normal-${currentSlide}`}
                            animate={{
                                x: `-${currentSlide * (100 / totalSlides)}%`
                            }}
                            transition={
                                isLooping
                                    ? { duration: 0 }
                                    : {
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 30
                                      }
                            }
                            className="flex"
                            style={{ width: `${totalSlides * 100}%` }}
                        >
                            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                                <div
                                    key={slideIndex}
                                    className="w-full px-1"
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

                                                {/* Card Section */}
                                                <motion.div
                                                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                                    className="group relative bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-all duration-300"
                                                    onClick={() => {
                                                        if (item.name === 'Panel Admin') {
                                                            router.push('/tables');
                                                        } else {
                                                            router.push(`/tables?table=${item.name}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between mb-4">
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
                                                    
                                                    <div className="flex items-end justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="text-4xl font-extrabold text-slate-900 mb-1">{item.count}</div>
                                                            <div className="text-xs text-gray-500 mb-3">Data</div>
                                                            
                                                            <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${percentage}%` }}
                                                                    transition={{ duration: 1, delay: globalIndex * 0.1, ease: "easeOut" }}
                                                                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="text-right flex-shrink-0">
                                                            <div className={`text-base font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                                                                {percentage.toFixed(0)}%
                                                            </div>
                                                            <div className="text-xs text-gray-500">Progress</div>
                                                        </div>
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
    if (roleLower === "ala" || roleLower === "kemahasiswaan" || roleLower === "pmb") {
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
  const c4AccessKeys = [
    "tabel_4a1_sarpras_pkm", 
    "tabel_4a2",
    "tabel_4a2_pkm",
    "tabel_4c1_kerjasama_pkm",
    "tabel_4c2_diseminasi_pkm",
    "tabel_4c3_hki_pkm"
  ];
  const hasC4Access = useMemo(() => c4AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c5AccessKeys = ["tabel_5a1", "tabel_5a2", "tabel_5_2_sarpras_pendidikan"];
  const hasC5Access = useMemo(() => c5AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  const c6AccessKeys = ["tabel_6a1", "tabel_6a2"];
  const hasC6Access = useMemo(() => c6AccessKeys.some((k) => roleCan(role, k, "r")), [role]);

  // Akses Data Dosen
  const hasDosenAccess = useMemo(() => roleCan(role, "dosen", "r"), [role]);

  // Akses Data Pegawai
  const hasPegawaiAccess = useMemo(() => roleCan(role, "pegawai", "r"), [role]);

  // Akses Data Tenaga Kependidikan
  const hasTendikAccess = useMemo(() => roleCan(role, "tenaga_kependidikan", "r"), [role]);

  // Akses Management Akun (kecuali untuk role ALA, kemahasiswaan, LPPM, dan KEPEGAWAIAN)
  const hasUsersAccess = useMemo(() => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === "ala" || roleLower === "kemahasiswaan" || roleLower === "lppm" || roleLower === "kepegawaian") {
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
    const roleLower = (role || '').toLowerCase();
    const isKepegawaian = roleLower === 'kepegawaian';
    
    const allQuickActions = [
      { label: 'Tabel C1', path: '/tables?table=C1', icon: FiBarChart, color: 'from-blue-500 to-cyan-500', hasAccess: hasC1Access },
      { label: 'Tabel C2', path: '/tables?table=C2', icon: FiTrendingUp, color: 'from-purple-500 to-violet-500', hasAccess: hasC2Access },
      { label: 'Tabel C3', path: '/tables?table=C3', icon: FiGrid, color: 'from-indigo-500 to-purple-500', hasAccess: hasC3Access },
      { label: 'Tabel C4', path: '/tables?table=C4', icon: FiTarget, color: 'from-teal-500 to-cyan-500', hasAccess: hasC4Access },
      { label: 'Tabel C5', path: '/tables?table=C5', icon: FiDatabase, color: 'from-amber-500 to-orange-500', hasAccess: hasC5Access },
      { label: 'Tabel C6', path: '/tables?table=C6', icon: FiFileText, color: 'from-rose-500 to-pink-500', hasAccess: hasC6Access },
      // Role kepegawaian hanya melihat Tenaga Kependidikan, bukan Data Dosen dan Tabel Pegawai
      { label: 'Data Dosen', path: '/tables?table=TabelDosen', icon: FiUsers, color: 'from-green-500 to-emerald-500', hasAccess: hasDosenAccess && !isKepegawaian },
      { label: 'Tabel Pegawai', path: '/tables?table=TabelPegawai', icon: FiUsers, color: 'from-orange-500 to-red-500', hasAccess: hasPegawaiAccess && !isKepegawaian },
      { label: 'Tenaga Kependidikan', path: '/tables?table=TabelTendik', icon: FiUsers, color: 'from-violet-500 to-purple-500', hasAccess: hasTendikAccess },
      { label: 'Management Akun', path: '/users', icon: FiSettings, color: 'from-pink-500 to-rose-500', hasAccess: hasUsersAccess }
    ];
    return allQuickActions.filter(item => item.hasAccess);
  }, [role, hasC1Access, hasC2Access, hasC3Access, hasC4Access, hasC5Access, hasC6Access, hasDosenAccess, hasPegawaiAccess, hasTendikAccess, hasUsersAccess]);
  
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
                          <div className="pt-10 pb-20 min-h-screen">
                            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                              {/* Header Dashboard - Ultra Modern Design */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-10"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                  <div className="space-y-2">
                                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#043975] via-[#0384d6] to-[#043975]">
                                        Dashboard
                                    </h1>
                                    <p className="text-slate-500 text-lg font-medium">Selamat datang kembali! Ringkasan data Anda</p>
                                  </div>
                                  <div className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="relative">
                                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                      <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">Sistem Aktif</span>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Top Row: Statistik Cards (4 cards) */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-8"
                              >
                                <StatistikCards />
                              </motion.div>

                              {/* Middle Row: Akses Cepat Berita (Full Width) */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-8"
                              >
                                <AksesCepatBeritaDashboard />
                              </motion.div>

                              {/* Bottom Row: Akses Cepat (Wide) & Selamat Datang (Small) */}
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                                {/* Left: Akses Cepat - Lebih Panjang */}
                                <div className="lg:col-span-8">
                                  <AksesCepatMarket quickActions={quickActions} />
                                </div>

                                {/* Right: Selamat Datang - Lebih Kecil */}
                                <div className="lg:col-span-4">
                                  <WelcomeSection authUser={authUser} />
                                </div>
                              </div>

                              {/* Log Aktivitas (Dummy) */}
                              <motion.div 
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                className="mb-8"
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


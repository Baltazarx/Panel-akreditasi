"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../lib/api";
import {
    FiUsers, FiDatabase, FiActivity, FiTrendingUp, FiBarChart,
    FiFileText, FiSettings, FiCalendar, FiClock, FiArrowRight,
    FiPieChart, FiTarget, FiAward, FiShield, FiBookOpen
} from 'react-icons/fi';

// ============================================================
// MODERN DASHBOARD - PANEL AKREDITASI STIKOM
// ============================================================

export default function DashboardPage() {
    const { authUser } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalData: 0,
        pendingTasks: 0,
        completionRate: 0
    });
    const [activities, setActivities] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch stats
                const statsData = await apiFetch('/dashboard/stats').catch(() => ({
                    totalUsers: 45,
                    totalData: 1250,
                    pendingTasks: 8,
                    completionRate: 87
                }));

                // Fetch activities
                const activitiesData = await apiFetch('/dashboard/activities').catch(() => [
                    { id: 1, type: 'create', description: 'Data CPL baru ditambahkan', time: '2 jam lalu', user: 'Admin' },
                    { id: 2, type: 'update', description: 'Tabel C2 diperbarui', time: '4 jam lalu', user: 'Kaprodi TI' },
                    { id: 3, type: 'export', description: 'Laporan akreditasi diekspor', time: '6 jam lalu', user: 'TPM' },
                    { id: 4, type: 'create', description: 'Data dosen baru ditambahkan', time: '1 hari lalu', user: 'Admin' },
                    { id: 5, type: 'update', description: 'Profil lulusan diperbarui', time: '2 hari lalu', user: 'Kaprodi MI' }
                ]);

                // Fetch news from berita API
                const newsResponse = await apiFetch('/berita').catch(() => []);

                // Map backend data to dashboard format and take only latest 3
                const mappedNews = Array.isArray(newsResponse)
                    ? newsResponse
                        .filter(item => !item.deleted_at && item.status === 'published') // Only published news
                        .sort((a, b) => {
                            // Sort by updated_at or created_at (newest first)
                            const dateA = new Date(a.updated_at || a.created_at || a.tanggal_publikasi || 0);
                            const dateB = new Date(b.updated_at || b.created_at || b.tanggal_publikasi || 0);
                            return dateB - dateA;
                        })
                        .slice(0, 3) // Take only latest 3
                        .map(item => ({
                            id: item.id_berita,
                            title: item.judul,
                            excerpt: item.ringkasan,
                            content: item.konten, // Add content field
                            date: item.tanggal_publikasi,
                            priority: item.prioritas || 'medium',
                            author: item.penulis
                        }))
                    : [];

                setStats(statsData);
                setActivities(activitiesData);
                setNews(mappedNews);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour >= 5 && hour < 12) return 'Selamat Pagi';
        if (hour >= 12 && hour < 18) return 'Selamat Siang';
        return 'Selamat Malam';
    };

    // Format date
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            {/* Header Section */}
            <DashboardHeader
                greeting={getGreeting()}
                userName={authUser?.name || 'User'}
                currentDate={formatDate(currentTime)}
                stats={stats}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Statistics Cards */}
                <StatisticsGrid stats={stats} loading={loading} />

                {/* News & Activities Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <NewsSection news={news} loading={loading} />
                    </div>
                    <div className="lg:col-span-1">
                        <RecentActivities activities={activities} loading={loading} />
                    </div>
                </div>

                {/* Quick Actions */}
                <QuickActionsGrid />
            </div>
        </div>
    );
}

// ============================================================
// DASHBOARD HEADER COMPONENT
// ============================================================
function DashboardHeader({ greeting, userName, currentDate, stats }) {
    return (
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Greeting Section */}
                    <div className="space-y-2">
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-blue-100 uppercase tracking-wide"
                        >
                            {currentDate}
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold"
                        >
                            {greeting}, <span className="text-yellow-300">{userName}</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-blue-100"
                        >
                            Selamat datang di Portal Penjaminan Mutu STIKOM
                        </motion.p>
                    </div>

                    {/* Quick Stats Summary */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-4"
                    >
                        <QuickStat icon={FiUsers} value={stats.totalUsers} label="Users" />
                        <QuickStat icon={FiDatabase} value={stats.totalData} label="Data" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function QuickStat({ icon: Icon, value, label }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-w-[100px]">
            <Icon className="w-6 h-6 mb-2 text-blue-200" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-blue-100 uppercase">{label}</p>
        </div>
    );
}

// ============================================================
// STATISTICS GRID COMPONENT
// ============================================================
function StatisticsGrid({ stats, loading }) {
    const statsCards = [
        {
            title: 'Total Pengguna',
            value: stats.totalUsers,
            icon: FiUsers,
            gradient: 'from-blue-500 to-cyan-500',
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Total Data',
            value: stats.totalData,
            icon: FiDatabase,
            gradient: 'from-purple-500 to-pink-500',
            trend: '+8%',
            trendUp: true
        },
        {
            title: 'Tugas Pending',
            value: stats.pendingTasks,
            icon: FiActivity,
            gradient: 'from-orange-500 to-red-500',
            trend: '-5%',
            trendUp: false
        },
        {
            title: 'Tingkat Penyelesaian',
            value: `${stats.completionRate}%`,
            icon: FiTrendingUp,
            gradient: 'from-green-500 to-emerald-500',
            trend: '+3%',
            trendUp: true
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                        <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {statsCards.map((card, index) => (
                <StatCard key={index} card={card} index={index} />
            ))}
        </motion.div>
    );
}

function StatCard({ card, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden group"
        >
            {/* Gradient Background */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>

            {/* Icon */}
            <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="relative">
                <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                    <span className={`text-sm font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {card.trend}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}


// ============================================================
// RECENT ACTIVITIES COMPONENT
// ============================================================
function RecentActivities({ activities, loading }) {
    const getActivityIcon = (type) => {
        const icons = {
            create: { icon: FiPieChart, color: 'text-green-600', bg: 'bg-green-100' },
            update: { icon: FiActivity, color: 'text-blue-600', bg: 'bg-blue-100' },
            delete: { icon: FiTarget, color: 'text-red-600', bg: 'bg-red-100' },
            export: { icon: FiAward, color: 'text-purple-600', bg: 'bg-purple-100' }
        };
        return icons[type] || icons.create;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 h-[28rem] animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-full"></div>
                                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 h-[28rem] flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Aktivitas Terbaru</h3>
                <FiClock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
                {activities.map((activity, index) => {
                    const iconData = getActivityIcon(activity.type);
                    const Icon = iconData.icon;

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconData.bg} flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${iconData.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{activity.user}</span>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-400">{activity.time}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ============================================================
// QUICK ACTIONS GRID COMPONENT
// ============================================================
function QuickActionsGrid() {
    const actions = [
        // List Tabel (C1-C6)
        {
            id: 'c1',
            title: 'Budaya Mutu',
            description: 'Data Dosen dan Pegawai',
            icon: FiUsers,
            gradient: 'from-blue-500 to-cyan-500',
            href: '/tables?table=C1'
        },
        {
            id: 'c2',
            title: 'Relevansi Pendidikan',
            description: 'Data Mahasiswa',
            icon: FiTrendingUp,
            gradient: 'from-purple-500 to-pink-500',
            href: '/tables?table=C2'
        },
        {
            id: 'c3',
            title: 'Relevansi Penelitian',
            description: 'Penelitian dan Pengabdian',
            icon: FiActivity,
            gradient: 'from-green-500 to-emerald-500',
            href: '/tables?table=C3'
        },
        {
            id: 'c4',
            title: 'Relevansi PkM',
            description: 'Pendidikan',
            icon: FiBookOpen,
            gradient: 'from-amber-500 to-orange-500',
            href: '/tables?table=C4'
        },
        {
            id: 'c5',
            title: 'Akuntabilitas',
            description: 'Kerjasama',
            icon: FiShield,
            gradient: 'from-indigo-500 to-purple-500',
            href: '/tables?table=C5'
        },
        {
            id: 'c6',
            title: 'Diferensiasi Misi',
            description: 'Luaran dan Capaian',
            icon: FiBarChart,
            gradient: 'from-pink-500 to-rose-500',
            href: '/tables?table=C6'
        },
        // Panel Admin
        {
            id: 'manajemen-akun',
            title: 'Manajemen Akun',
            description: 'Kelola Pengguna Sistem',
            icon: FiSettings,
            gradient: 'from-red-500 to-pink-500',
            href: '/tables?table=ManajemenAkun'
        },
        {
            id: 'tabel-dosen',
            title: 'Tabel Dosen',
            description: 'Data Dosen',
            icon: FiUsers,
            gradient: 'from-teal-500 to-cyan-500',
            href: '/tables?table=TabelDosen'
        },
        {
            id: 'data-pegawai',
            title: 'Data Pegawai',
            description: 'Data Pegawai',
            icon: FiUsers,
            gradient: 'from-orange-500 to-red-500',
            href: '/tables?table=TabelPegawai'
        },
        {
            id: 'tenaga-kependidikan',
            title: 'Tenaga Kependidikan',
            description: 'Data Tenaga Kependidikan',
            icon: FiUsers,
            gradient: 'from-emerald-500 to-green-500',
            href: '/tables?table=TabelTendik'
        }
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Akses Cepat</h2>
                    <p className="text-sm text-slate-600">Navigasi ke fitur utama sistem</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
                {actions.map((action, index) => (
                    <ActionCard key={action.id} action={action} index={index} />
                ))}
            </motion.div>
        </div>
    );
}

function ActionCard({ action, index }) {
    const handleClick = () => {
        if (typeof window !== 'undefined') {
            window.location.href = action.href;
        }
    };

    return (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group overflow-hidden"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            {/* Icon */}
            <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="relative">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{action.description}</p>
                <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Akses <FiArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.button>
    );
}

// ============================================================
// NEWS DETAIL MODAL COMPONENT
// ============================================================
function NewsDetailModal({ news, onClose }) {
    if (!news) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div className="pr-8">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${news.priority === 'high' ? 'bg-red-100 text-red-700' :
                                news.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                }`}>
                                {news.priority === 'high' ? 'Penting' : news.priority === 'medium' ? 'Info' : 'Update'}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <FiCalendar className="w-3 h-3" />
                                {new Date(news.date).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                            {news.title}
                        </h2>
                        <div className="mt-2 text-sm text-slate-500">
                            Oleh: <span className="font-medium text-slate-700">{news.author || 'Admin'}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="prose prose-slate max-w-none">
                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                            {news.content || news.excerpt}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================
// NEWS SECTION COMPONENT
// ============================================================
function NewsSection({ news, loading }) {
    const [selectedNews, setSelectedNews] = useState(null);

    const getPriorityBadge = (priority) => {
        const badges = {
            high: { text: 'Penting', color: 'bg-red-100 text-red-700' },
            medium: { text: 'Info', color: 'bg-blue-100 text-blue-700' },
            low: { text: 'Update', color: 'bg-slate-100 text-slate-700' }
        };
        return badges[priority] || badges.medium;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 h-96 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-32 bg-slate-200 rounded-xl"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 h-[28rem] flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Pengumuman & Berita</h2>
                    <p className="text-sm text-slate-600">Update terbaru seputar akreditasi</p>
                </div>
                <button
                    onClick={() => window.location.href = '/berita'}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <FiBookOpen className="w-5 h-5" />
                    Lihat Semua
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {news.map((item, index) => {
                    const badge = getPriorityBadge(item.priority);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedNews(item)}
                            className="group cursor-pointer h-full"
                        >
                            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 hover:shadow-md transition-all duration-300 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                    <FiCalendar className="w-4 h-4 text-slate-400" />
                                </div>

                                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-auto line-clamp-3">
                                    {item.excerpt}
                                </p>

                                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200">
                                    <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                    <span className="text-blue-600 font-semibold group-hover:underline">
                                        Baca →
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Render Modal if selectedNews is present */}
            <AnimatePresence>
                {selectedNews && (
                    <NewsDetailModal
                        news={selectedNews}
                        onClose={() => setSelectedNews(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

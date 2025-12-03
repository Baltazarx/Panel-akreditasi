"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Table, Book, User, LogOut, X, Menu, Newspaper, BarChart3, Palette } from 'lucide-react';
import Image from 'next/image'; // Import komponen Image dari Next.js

// Konstanta item navigasi (hindari re-create tiap render)
const ALL_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tables", label: "Tabel", icon: Table },
  { href: "/report", label: "Report", icon: BarChart3 },
  { href: "/panduan", label: "Panduan", icon: Book },
  { href: "/berita", label: "Berita", icon: Newspaper },
  { href: "/design-system/buttons", label: "Design System", icon: Palette },
];

// Helper function untuk cek apakah role boleh melihat Report
const canViewReport = (role) => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return ['superadmin', 'super admin', 'waket1', 'waket-1', 'waket2', 'waket-2', 'tpm'].includes(roleLower);
};

export default function Header() {
  const { authUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Filter NAV_ITEMS berdasarkan role user
  const NAV_ITEMS = useMemo(() => {
    if (!authUser) return ALL_NAV_ITEMS.filter(item => item.href !== "/report");
    return ALL_NAV_ITEMS.filter(item => {
      if (item.href === "/report") {
        return canViewReport(authUser.role);
      }
      return true;
    });
  }, [authUser]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const menuRef = useRef(null);
  const drawerRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const activePath = useMemo(() => {
    if (pathname === "/") return "/";
    const activeItem = NAV_ITEMS.slice().reverse().find(item => pathname.startsWith(item.href));
    return activeItem ? activeItem.href : null;
  }, [pathname]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (navMenuOpen) {
      document.body.style.overflow = 'hidden';
      // simpan fokus terakhir dan pindahkan fokus ke drawer
      lastFocusedElementRef.current = document.activeElement;
      const firstFocusable = drawerRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else {
      document.body.style.overflow = 'unset';
      // kembalikan fokus
      if (lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === 'function') {
        lastFocusedElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [navMenuOpen]);

  // Focus trap + ESC to close + swipe close
  useEffect(() => {
    if (!navMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNavMenuOpen(false);
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    let startX = null;
    const onTouchStart = (e) => { startX = e.touches[0].clientX; };
    const onTouchMove = (e) => { /* no-op: we only need end delta */ };
    const onTouchEnd = (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      // swipe ke kanan untuk menutup drawer kanan
      if (deltaX > 50) setNavMenuOpen(false);
      startX = null;
    };

    document.addEventListener('keydown', handleKeyDown);
    drawerRef.current?.addEventListener('touchstart', onTouchStart, { passive: true });
    drawerRef.current?.addEventListener('touchmove', onTouchMove, { passive: true });
    drawerRef.current?.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      drawerRef.current?.removeEventListener('touchstart', onTouchStart);
      drawerRef.current?.removeEventListener('touchmove', onTouchMove);
      drawerRef.current?.removeEventListener('touchend', onTouchEnd);
    };
  }, [navMenuOpen]);

  // Tutup menu ketika rute berubah (edge case UX)
  useEffect(() => {
    setMenuOpen(false);
    setNavMenuOpen(false);
  }, [pathname]);

  // Tandai sudah mounted untuk menghindari mismatch SSR pada state dinamis
  useEffect(() => {
    setMounted(true);
    // shadow on scroll
    const onScroll = () => setHasShadow(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // prefers-reduced-motion
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mq.addEventListener?.('change', listener);
      return () => {
        window.removeEventListener('scroll', onScroll);
        mq.removeEventListener?.('change', listener);
      };
    } catch {
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  // Check if current page is tables page - header tidak sticky di halaman tabel
  const isTablesPage = pathname === '/tables';
  // Header akan sticky di semua halaman (termasuk home) kecuali di halaman tabel
  // Di home (pathname === '/'), header harus sticky
  const shouldBeSticky = !isTablesPage;
  
  return (
    <>
      {/* Skip to content untuk aksesibilitas */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-white text-[#043975] px-3 py-2 rounded-md shadow">
        Skip to content
      </a>
      <header 
        className={`${shouldBeSticky ? 'sticky top-0' : ''} z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/60 ${hasShadow ? 'shadow-xl shadow-gray-200/40' : ''}`}
        style={shouldBeSticky ? { position: 'sticky', top: 0, zIndex: 50 } : { zIndex: 50 }}
      >
        <div className="w-full max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-3 items-center gap-6">
          {/* Kiri: Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-4 hover:scale-105 transition-all duration-300 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0384d6]/20 to-[#043975]/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Image 
                  src="/stikom_logo.png"
                  alt="Logo STIKOM"
                  width={52}
                  height={52}
                  className="relative rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-900 font-bold text-xl tracking-tight group-hover:text-[#043975] transition-colors duration-300">
                  Portal Mutu
                </span>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider group-hover:text-gray-600 transition-colors duration-300">
                  Sistem Penjaminan Mutu
                </p>
              </div>
            </Link>
          </div>

          {/* Tengah: Navigasi (Desktop) */}
          <div className="hidden lg:flex items-center justify-center min-w-0 overflow-hidden justify-self-center">
            <nav className="flex items-center justify-center bg-white backdrop-blur-sm px-3 py-2 rounded-2xl">
              {NAV_ITEMS.map((item) => {
                const isActive = mounted && activePath === item.href;
                const { icon: Icon, label } = item;
                return (
                  <Link
                    href={item.href}
                    key={item.href}
                    className={`relative rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive ? "text-gray-900 px-4 py-2.5" : "text-gray-600 hover:text-gray-900 px-3 py-2.5 hover:bg-gray-50"
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                          transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 25 }}
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"
                        />
                      </>
                    )}
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <Icon 
                        size={18} 
                        className={`flex-shrink-0 transition-colors duration-200 ${
                          isActive ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden whitespace-nowrap text-sm font-semibold text-blue-700"
                          >
                            {label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Kanan: Aksi (Profile & Hamburger) */}
          <div className="flex items-center justify-end gap-4 flex-nowrap justify-self-end">
            {/* Desktop: Profile Menu */}
            {authUser && (
              <div className="relative hidden lg:block" ref={menuRef}>
                <button 
                  onClick={() => setMenuOpen((v) => !v)} 
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50/80 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0384d6]/40 focus-visible:ring-offset-2`}
                  aria-label="Buka menu profil"
                  aria-expanded={menuOpen}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] text-white text-base font-bold uppercase shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {authUser.username?.[0] || authUser.email?.[0] || "U"}
                  </div>
                  <div className="flex flex-col items-start text-left min-w-0">
                      <span className="text-sm font-bold leading-tight text-gray-900 capitalize truncate max-w-[140px]">
                          {authUser.username || "User"}
                      </span>
                      <span className="text-xs leading-tight text-gray-500 tracking-wider uppercase truncate max-w-[140px] font-medium">
                          {authUser.role || "user"}
                      </span>
                  </div>
                  <svg className={`h-5 w-5 text-gray-400 transition-all duration-300 flex-shrink-0 ${menuOpen ? 'rotate-180 text-gray-600' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                </button>
                
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-4 w-72 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl focus:outline-none z-[60]"
                      style={{ zIndex: 60 }}
                    >
                      <div className="p-3 relative">
                        {/* Arrow */}
                        <div className="absolute -top-2 right-8 h-4 w-4 rotate-45 bg-white border border-gray-200 rounded-sm" />
                        <div className="px-4 py-4 border-b border-gray-100/60 mb-2">
                          <p className="text-base font-bold capitalize text-gray-900 truncate">{authUser.username || "User"}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{authUser.role || "user"}</p>
                        </div>
                        <div className="space-y-1">
                          <button onClick={() => { setMenuOpen(false); router.push(`/profile?role=${authUser.role || "user"}`); }} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium">Profil</span>
                          </button>
                          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200">
                            <LogOut size={16} className="text-red-400" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile: Hamburger Menu */}
            <div className="lg:hidden">
              <button onClick={() => setNavMenuOpen(true)} className="p-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md" aria-label="Buka navigasi mobile" aria-expanded={navMenuOpen} aria-controls="mobile-drawer">
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Panel Navigasi Mobile (Sidebar) */}
      <AnimatePresence>
        {navMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ zIndex: 60 }}
            onClick={() => setNavMenuOpen(false)}
          >
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" style={{ zIndex: 60 }} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-72 bg-white/95 backdrop-blur-lg shadow-2xl p-6 flex flex-col border-l border-gray-200/60"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              id="mobile-drawer"
              ref={drawerRef}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-gray-900 tracking-tight">Menu</span>
                <button onClick={() => setNavMenuOpen(false)} className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-all duration-200 hover:shadow-md" aria-label="Tutup navigasi mobile">
                  <X size={22} />
                </button>
              </div>


              {/* User Info Section */}
              {authUser && (
                <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/60 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0384d6] to-[#043975] text-white text-lg font-bold uppercase shadow-lg">
                      {authUser.username?.[0] || authUser.email?.[0] || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold capitalize text-gray-900 truncate">{authUser.username || "User"}</p>
                      <p className="text-sm text-gray-600 capitalize truncate font-medium">{authUser.role || "user"}</p>
                    </div>
                  </div>
                </div>
              )}

              <motion.nav
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.07 } },
                }}
                className="flex flex-col gap-2"
              >
                {NAV_ITEMS.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setNavMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 relative ${
                        activePath === item.href ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                      aria-current={activePath === item.href ? 'page' : undefined}
                    >
                      {activePath === item.href && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"
                        />
                      )}
                      <item.icon 
                        size={20} 
                        className={`transition-colors duration-200 ${
                          activePath === item.href ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                      <span className={`text-base transition-colors duration-200 ${
                        activePath === item.href ? 'text-blue-700 font-semibold' : 'text-gray-700'
                      }`}>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* User Actions */}
                {authUser && (
                  <>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                      }}
                      className="border-t border-gray-200 pt-2 mt-4"
                    >
                      <button 
                        onClick={() => { 
                          setNavMenuOpen(false); 
                          router.push(`/profile?role=${authUser.role || "user"}`); 
                        }} 
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-200 hover:shadow-md"
                      >
                        <User size={18} className="text-gray-400" />
                        <span className="text-base">Profil</span>
                      </button>
                      <button 
                        onClick={() => { 
                          setNavMenuOpen(false); 
                          handleLogout(); 
                        }} 
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors duration-200 hover:shadow-md"
                      >
                        <LogOut size={18} className="text-red-400" />
                        <span className="text-base">Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </motion.nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
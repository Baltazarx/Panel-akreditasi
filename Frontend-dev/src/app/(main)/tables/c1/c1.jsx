"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { roleCan } from "../../../../lib/role";

import Tabel1A1 from "./Tabel1A1";
import Tabel1A2 from "./Tabel1A2";
import Tabel1A3 from "./Tabel1A3";
import Tabel1A4 from "./Tabel1A4";
import Tabel1A5 from "./Tabel1A5";
import Tabel1B from "./Tabel1B";

const ALL_TABLES = [
  { key: "1a1", label: "Tabel 1A-1", Component: Tabel1A1, accessKey: "tabel_1a1" },
  { key: "1a2", label: "Tabel 1A-2", Component: Tabel1A2, accessKey: "tabel_1a2" },
  { key: "1a3", label: "Tabel 1A-3", Component: Tabel1A3, accessKey: "tabel_1a3" },
  { key: "1a4", label: "Tabel 1A-4", Component: Tabel1A4, accessKey: "tabel_1a4" },
  { key: "1a5", label: "Tabel 1A-5", Component: Tabel1A5, accessKey: "tabel_1a5" },
  { key: "1b", label: "Tabel 1B", Component: Tabel1B, accessKey: "tabel_1b" },
];

export default function C1WithTopNav({ lastC1Tab }) {
  const { authUser } = useAuth();
  const role = authUser?.role;

  // Filter tabel berdasarkan akses role
  const tabs = useMemo(() => {
    return ALL_TABLES.filter(table => roleCan(role, table.accessKey, "R"));
  }, [role]);
  
  const [activeKey, setActiveKey] = useState(""); // default kosong → akan diisi dari hash/store/prop atau tab pertama
  const initializedRef = useRef(false);

  // Baca tab dari hash / localStorage / prop (hanya sekali saat tabs siap)
  useEffect(() => {
    if (initializedRef.current) return;
    if (typeof window === "undefined") return;
    if (!tabs || tabs.length === 0) return;

    const url = new URL(window.location.href);
    const fromHash = (url.hash || "").replace("#tab=", "");
    const fromStore = localStorage.getItem("c1_active_tab") || localStorage.getItem("lastActiveC1Tab") || "";
    const fromProp = lastC1Tab || "";
    // Prioritas: hash URL > prop > localStorage
    const candidate = fromHash || fromProp || fromStore;

    const available = tabs.map(t => t.key);
    const fallback = available[0] || "";
    const next = available.includes(candidate) ? candidate : fallback;

    console.log("C1 - Init active tab:", { 
      fromHash, 
      fromProp, 
      fromStore, 
      candidate, 
      available, 
      chosen: next,
      currentUrl: window.location.href,
      currentHash: window.location.hash
    });

    if (next) {
      setActiveKey(next);
    }
    initializedRef.current = true;
  }, [tabs, lastC1Tab]);

  // Persist pilihan tab ke hash + localStorage (hanya jika activeKey berubah)
  useEffect(() => {
    if (typeof window === "undefined" || !activeKey) return;
    
    // Update hash URL
    const url = new URL(window.location.href);
    url.hash = `#tab=${activeKey}`;
    window.history.replaceState(null, "", url.toString());
    
    // Update localStorage
    localStorage.setItem("c1_active_tab", activeKey);
    localStorage.setItem("lastActiveC1Tab", activeKey);
    
    console.log("C1 - Saving to localStorage:", {
      activeKey,
      savedToC1: localStorage.getItem("c1_active_tab"),
      savedToGlobal: localStorage.getItem("lastActiveC1Tab")
    });
  }, [activeKey]);

  // Handle hash changes from external navigation (e.g., from main page)
  useEffect(() => {
    if (typeof window === "undefined" || !tabs.length) return;
    
    const checkHash = () => {
      const url = new URL(window.location.href);
      const fromHash = (url.hash || "").replace("#tab=", "");
      if (fromHash && fromHash !== activeKey) {
        const available = tabs.map(t => t.key);
        if (available.includes(fromHash)) {
          console.log("C1 - Hash change detected:", { fromHash, currentActive: activeKey });
          setActiveKey(fromHash);
        }
      }
    };

    // Check hash on mount
    checkHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', checkHash);
    
    return () => {
      window.removeEventListener('hashchange', checkHash);
    };
  }, [tabs, activeKey]);

  const Active = tabs.find(t => t.key === activeKey)?.Component || (tabs[0]?.Component || Tabel1A2);

  return (
    <div className="space-y-6">
      {/* Top navigation (tabs) dengan pill bergeser dan mobile scrollable */}
      <div className="w-full rounded-2xl shadow-md border px-3 sm:px-4 py-3 bg-gradient-to-br from-[#f5f9ff] via-white to-[#f5f9ff]">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Navigasi C1</h3>
        </div>
        <div className="relative">
          <div className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-2 bg-white rounded-2xl p-2 relative">
            {tabs.map((t) => {
              const isActive = t.key === activeKey;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="c1-tab-pill"
                        className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"
                      />
                    </>
                  )}
                  <span className={`relative z-10 transition-colors duration-200 ${
                    isActive ? "text-blue-700 font-semibold" : "text-gray-700"
                  }`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active table only */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Active role={role} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
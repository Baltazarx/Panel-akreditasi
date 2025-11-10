"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { roleCan } from "../../../../lib/role";

// Impor komponen tabel C3
import Tabel3A1 from "./Tabel3A1";
import Tabel3A2 from "./Tabel3A2";
import Tabel3A3 from "./Tabel3A3";
import Tabel3C1 from "./Tabel3C1";
import Tabel3C3 from "./Tabel3C3";

const ALL_TABLES = [
  { key: "3a1", label: "Tabel 3A-1", Component: Tabel3A1, accessKey: "tabel_3a1_sarpras_penelitian" },
  { key: "3a2", label: "Tabel 3A-2", Component: Tabel3A2, accessKey: "tabel_3a2_penelitian" },
  { key: "3a3", label: "Tabel 3A-3", Component: Tabel3A3, accessKey: "tabel_3a3_pengembangan_dtpr" },
  { key: "3c1", label: "Tabel 3C-1", Component: Tabel3C1, accessKey: "tabel_3c1_kerjasama_penelitian" },
  { key: "3c3", label: "Tabel 3C-3", Component: Tabel3C3, accessKey: "tabel_3c3_hki" },
];

export default function C3WithTopNav() {
  const { authUser } = useAuth();
  const role = authUser?.role;

  // Filter tabel berdasarkan akses role
  const tabs = useMemo(() => {
    const filteredTabs = ALL_TABLES.filter(table => roleCan(role, table.accessKey, "r"));
    console.log("C3 - Available tabs:", {
      role,
      allTables: ALL_TABLES.map(t => ({ key: t.key, accessKey: t.accessKey })),
      filteredTabs: filteredTabs.map(t => t.key),
      roleCanResults: ALL_TABLES.map(table => ({
        key: table.key,
        accessKey: table.accessKey,
        canAccess: roleCan(role, table.accessKey, "r")
      }))
    });
    return filteredTabs;
  }, [role]);
  
  const [activeKey, setActiveKey] = useState("3a1"); // default ke 3A-1

  // Baca tab dari hash / localStorage jika ada (#tab=3a1)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const fromHash = url.hash.replace("#tab=", "");
      const fromStore = localStorage.getItem("c3_active_tab") || "";
      const candidate = fromHash || fromStore;
      
      // Jika ada tab yang valid, gunakan itu, jika tidak gunakan tab pertama yang tersedia
      if (tabs.some(t => t.key === candidate)) {
        setActiveKey(candidate);
      } else if (tabs.length > 0) {
        setActiveKey(tabs[0].key);
      }
    }
  }, [tabs]);

  // Persist pilihan tab ke hash + localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.hash = `#tab=${activeKey}`;
      window.history.replaceState(null, "", url.toString());
      localStorage.setItem("c3_active_tab", activeKey);
    }
  }, [activeKey]);

  const Active = tabs.find(t => t.key === activeKey)?.Component || (tabs[0]?.Component || Tabel3A1);

  // Jika tidak ada tab yang visible sama sekali untuk role ini
  if (tabs.length === 0 && role) {
    return <div className="p-4 text-center text-slate-600">Tidak ada tabel C3 yang tersedia untuk peran Anda ({role}).</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top navigation (tabs) dengan pill bergeser dan mobile scrollable */}
      <div className="w-full bg-white rounded-2xl shadow-md border px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Navigasi C3</h3>
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
                        layoutId="c3-tab-pill"
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
          <Active role={authUser?.role} auth={authUser} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


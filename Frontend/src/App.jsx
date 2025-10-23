import React, { useState } from "react";
import "./index.css";
import { Container, Card, Button } from "./components/ui";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from "./hooks/useAuth";

// Tables - Only components that match backend routes
import PegawaiTable from "./components/tables/PegawaiTable";
import DosenTable from "./components/tables/DosenTable";
import Tabel1A1 from "./components/tables/Tabel1A1";
import Tabel1A2 from "./components/tables/Tabel1A2";
import Tabel1A3 from "./components/tables/Tabel1A3";
import Tabel1A4 from "./components/tables/Tabel1A4";
import Tabel1A5 from "./components/tables/Tabel1A5";
import Tabel1B from "./components/tables/Tabel1B";
import Tabel2A1 from "./components/tables/Tabel2A1";
import Tabel2A2 from "./components/tables/Tabel2A2";
import Tabel2A3 from "./components/tables/Tabel2A3";
import Tabel2B4 from "./components/tables/Tabel2B4";
import Tabel2B5 from "./components/tables/Tabel2B5";
import Tabel2B6 from "./components/tables/Tabel2B6";
import Tabel2C from "./components/tables/Tabel2C";
import Tabel2D from "./components/tables/Tabel2D";
import ManajemenKurikulum from "./components/tables/ManajemenKurikulum";
// Tab list - Only tabs that match backend routes
const TABS = [
  // Master Data
  { key: "pegawai",   label: "Daftar Pegawai",                    icon: "👥", Comp: PegawaiTable },
  { key: "dosen",     label: "Daftar Dosen",                      icon: "👨‍🏫", Comp: DosenTable },
  
  // C1 - Standar 1
  { key: "tabel_1a1", label: "1.A.1 Pimpinan UPPS/PS",            icon: "👤", Comp: Tabel1A1 },
  { key: "tabel_1a2", label: "1.A.2 Sumber Pendanaan",           icon: "💰", Comp: Tabel1A2 },
  { key: "tabel_1a3", label: "1.A.3 Penggunaan Dana",            icon: "📊", Comp: Tabel1A3 },
  { key: "tabel_1a4", label: "1.A.4 Beban Kerja Dosen",          icon: "📈", Comp: Tabel1A4 },
  { key: "tabel_1a5", label: "1.A.5 Kualifikasi Tendik",         icon: "🎓", Comp: Tabel1A5 },
  { key: "tabel_1b",  label: "1.B Audit Mutu Internal",         icon: "🏢", Comp: Tabel1B },
  
  // C2 - Standar 2
  { key: "tabel_2a1", label: "2.A.1 Data Mahasiswa",             icon: "👥", Comp: Tabel2A1 },
  { key: "tabel_2a2", label: "2.A.2 Keragaman Asal",             icon: "🌍", Comp: Tabel2A2 },
  { key: "tabel_2a3", label: "2.A.3 Kondisi Mahasiswa",          icon: "📊", Comp: Tabel2A3 },
  { key: "tabel_2b4", label: "2.B.4 Masa Tunggu",                icon: "⏰", Comp: Tabel2B4 },
  { key: "tabel_2b5", label: "2.B.5 Kesesuaian Kerja",           icon: "💼", Comp: Tabel2B5 },
  { key: "tabel_2b6", label: "2.B.6 Kepuasan Pengguna",          icon: "😊", Comp: Tabel2B6 },
  { key: "tabel_2c",  label: "2.C Pembelajaran Luar Prodi",      icon: "🎓", Comp: Tabel2C },
  { key: "tabel_2d",  label: "2.D Rekognisi Lulusan",            icon: "🏆", Comp: Tabel2D },
  
  // Manajemen Kurikulum
  { key: "manajemen_kurikulum", label: "Manajemen Kurikulum",     icon: "📚", Comp: ManajemenKurikulum },
];

function LoginForm({ onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Card className="max-w-md w-full p-6 mx-auto">
      <h2 className="text-xl font-semibold mb-4">Masuk ke Panel</h2>
      <div className="space-y-3">
        <input className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 outline-none focus:ring-4 focus:ring-indigo-200/60 dark:focus:ring-indigo-500/20" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="p-2 rounded-2xl bg-red-50/80 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">{error}</div>}
        <Button disabled={loading} className="w-full" onClick={() => onSubmit(username, password)}>{loading ? "Memproses…" : "Masuk"}</Button>
      </div>
    </Card>
  );
}

export default function App() {
  const auth = useAuth();
  const [active, setActive] = useState(TABS[0].key);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-[#0b1020] dark:to-[#0b1020] text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="sticky top-0 z-30 border-b border-black/5 dark:border-white/10 bg-white/60 dark:bg-[#0b1020]/60 backdrop-blur">
        <Container>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Panel Akreditasi</h1>
              <p className="text-sm opacity-70">React + Tailwind (cookie-based auth)</p>
            </div>
            {auth.user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-right">
                  <div className="font-medium truncate max-w-[200px]">{auth.user.name}</div>
                  <div className="opacity-70">Role: {auth.user.role || "-"}</div>
                </div>
                <Button variant="soft" onClick={auth.logout}>Keluar</Button>
              </div>
            ) : null}
          </div>
        </Container>
      </div>

      <Container>
        {!auth.user ? (
          <div className="py-16"><LoginForm onSubmit={auth.login} loading={auth.loading} error={auth.error} /></div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <Card className="p-2">
              <div className="flex flex-wrap gap-2">
                {TABS.map((t) => {
                  const activeTab = active === t.key;
                  return (
                    <button key={t.key} onClick={() => setActive(t.key)}
                      className={`px-3 py-2 rounded-2xl text-sm transition border ${
                        activeTab
                          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent shadow"
                          : "bg-white/70 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
                      }`}>
                      <span className="mr-1">{t.icon}</span>{t.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Content */}
            {TABS.filter(t => t.key === active).map(({ key, Comp }) => (
              <Comp key={key} role={auth.user?.role} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

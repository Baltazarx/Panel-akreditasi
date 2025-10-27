import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { apiFetch } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';

// ============================================================
// TABEL 2B - PEMETAAN DAN CRUD KURIKULUM
// ============================================================

export default function Tabel2B({ role }) {
  const [activeTab, setActiveTab] = useState("pemetaan2b1");
  const [authUser] = useState({});
  const { maps } = useMaps(authUser);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Ensure role is a string
  const userRole = typeof role === 'string' ? role : role?.role || '';

  // Tab configuration
  const tabs = [
    { id: "pemetaan2b1", label: "2B.1 MK vs PL", icon: "📚", type: "laporan" },
    { id: "pemetaan2b2", label: "2B.2 CPL vs PL", icon: "🎯", type: "edit" },
    { id: "pemetaan2b3", label: "2B.3 Peta CPL", icon: "🗺️", type: "laporan" },
    { id: "pemetaanCpmkCpl", label: "CPMK vs CPL", icon: "🔗", type: "edit" },
    { id: "cpmk", label: "CPMK", icon: "📋", type: "crud" },
    { id: "cpl", label: "CPL", icon: "🎓", type: "crud" },
    { id: "profil_lulusan", label: "Profil Lulusan", icon: "👨‍🎓", type: "crud" },
    { id: "mata_kuliah", label: "Mata Kuliah", icon: "📖", type: "crud" }
  ];

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl">
      <header className="pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-slate-200">
        <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Tabel 2B - Pemetaan Kurikulum</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola pemetaan kurikulum, CPMK, CPL, Profil Lulusan, dan Mata Kuliah.
        </p>
      </header>

            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="w-full rounded-2xl shadow-md border px-3 sm:px-4 py-3 bg-gradient-to-br from-[#f5f9ff] via-white to-[#f5f9ff]">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">Navigasi Tabel 2B</h3>
                </div>
                <div className="relative">
                  <div className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-2 bg-white rounded-2xl p-2 relative">
                    {tabs.map((tab) => {
                      const isActive = tab.id === activeTab;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                            isActive ? "text-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {isActive && (
                            <>
                              <motion.div
                                layoutId="tab2b-active-pill"
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
                          }`}>
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

      {/* Tab Content */}
      <div className="min-h-[400px] sm:min-h-[500px]">
        {activeTab === "pemetaan2b1" && <Pemetaan2B1 role={userRole} maps={maps} refreshTrigger={refreshTrigger} />}
        {activeTab === "pemetaan2b2" && <Pemetaan2B2 role={userRole} maps={maps} refreshTrigger={refreshTrigger} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === "pemetaan2b3" && <Pemetaan2B3 role={userRole} maps={maps} refreshTrigger={refreshTrigger} />}
        {activeTab === "pemetaanCpmkCpl" && <PemetaanCpmkCpl role={userRole} maps={maps} refreshTrigger={refreshTrigger} />}
        {activeTab === "cpmk" && <CpmkCRUD role={userRole} maps={maps} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === "cpl" && <CplCRUD role={userRole} maps={maps} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === "profil_lulusan" && <ProfilLulusanCRUD role={userRole} maps={maps} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === "mata_kuliah" && <MataKuliahCRUD role={userRole} maps={maps} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />}
      </div>
    </div>
  );
}

// ============================================================
// 2B.1 PEMETAAN MK vs PL (LAPORAN)
// ============================================================
function Pemetaan2B1({ role, maps, refreshTrigger }) {
  const [data, setData] = useState({ columns: [], data: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b1", "R");

  const fetchData = async () => {
    if (!canRead) return;
    
    setLoading(true);
    try {
      const result = await apiFetch("/pemetaan-2b1");
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan 2B.1:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.1', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    try {
      const response = await fetch('/api/pemetaan-2b1/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_2B1_Pemetaan_MK_vs_PL.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengexport data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (!canRead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan Mata Kuliah vs Profil Lulusan</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode MK</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Nama MK</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">SKS</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Semester</th>
                {data.columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.data.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_mk}</td>
                  <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
                  <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.sks}</td>
                  <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.semester}</td>
                  {data.columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-center border border-slate-200">
                      {row.profil_lulusan && row.profil_lulusan[col] ? "✅" : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2B.2 PEMETAAN CPL vs PL (MATRIX EDITABLE)
// ============================================================
function Pemetaan2B2({ role, maps, refreshTrigger, onDataChange }) {
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b2", "R");
  const canUpdate = roleCan(role, "pemetaan2b2", "U");

  const fetchData = async () => {
    if (!canRead) return;
    
    setLoading(true);
    try {
      console.log('Fetching Pemetaan2B2 data...');
      const result = await apiFetch("/pemetaan-2b2");
      console.log('Fetched Pemetaan2B2 data:', result);
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan 2B.2:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.2', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (cplIndex, plCode, checked) => {
    if (!canUpdate) return;
    
    console.log('Cell change:', { cplIndex, plCode, checked });
    
    const newData = { ...data };
    newData.rows[cplIndex].row[plCode] = checked;
    setData(newData);
    
    console.log('Updated data:', newData.rows[cplIndex]);
  };

  const handleSave = async () => {
    if (!canUpdate) return;
    
    try {
      console.log('Saving Pemetaan2B2 data:', data.rows);
      
      const response = await apiFetch("/pemetaan-2b2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data.rows })
      });
      
      console.log('Save response:', response);
      Swal.fire('Success', 'Data pemetaan berhasil disimpan', 'success');
      
      // Tunggu sebentar sebelum refresh untuk memastikan backend selesai memproses
      setTimeout(async () => {
        // Refresh data untuk Pemetaan2B2
        await fetchData();
        
        // Trigger refresh for 2B.1 tab
        if (onDataChange) {
          onDataChange();
        }
      }, 500);
    } catch (err) {
      console.error('Error saving Pemetaan2B2:', err);
      Swal.fire('Error', `Gagal menyimpan data pemetaan: ${err.message}`, 'error');
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    try {
      const response = await fetch('/api/pemetaan-2b2/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_2B2_Pemetaan_CPL_vs_PL.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengexport data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (!canRead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPL vs Profil Lulusan</h2>
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              💾 Simpan Perubahan
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPL</th>
                {data.columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpl}</td>
                  {data.columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-center border border-slate-200">
                      {canUpdate ? (
                        <input
                          type="checkbox"
                          checked={row.row[col] || false}
                          onChange={(e) => handleCellChange(idx, col, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      ) : (
                        row.row[col] ? "✅" : ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PEMETAAN CPMK vs CPL (MATRIX EDITABLE)
// ============================================================
function PemetaanCpmkCpl({ role, maps, refreshTrigger }) {
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaanCpmkCpl", "R");
  const canUpdate = roleCan(role, "pemetaanCpmkCpl", "U");

  const fetchData = async () => {
    if (!canRead) return;
    
    setLoading(true);
    try {
      const result = await apiFetch("/pemetaan-cpmk-cpl");
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan CPMK vs CPL:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan CPMK vs CPL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (cpmkIndex, cplCode, checked) => {
    if (!canUpdate) return;
    
    const newData = { ...data };
    newData.rows[cpmkIndex].row[cplCode] = checked;
    setData(newData);
  };

  const handleSave = async () => {
    if (!canUpdate) return;
    
    try {
      console.log('Saving PemetaanCpmkCpl data:', data.rows);
      
      const response = await apiFetch("/pemetaan-cpmk-cpl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data.rows })
      });
      
      console.log('Save response:', response);
      Swal.fire('Success', 'Data pemetaan CPMK vs CPL berhasil disimpan', 'success');
      
      // Tunggu sebentar sebelum refresh untuk memastikan backend selesai memproses
      setTimeout(async () => {
        // Refresh data untuk PemetaanCpmkCpl
        await fetchData();
        
        // Trigger refresh for pemetaan tabs
        if (onDataChange) {
          onDataChange();
        }
      }, 500);
    } catch (err) {
      console.error('Error saving PemetaanCpmkCpl:', err);
      Swal.fire('Error', `Gagal menyimpan data pemetaan CPMK vs CPL: ${err.message}`, 'error');
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    try {
      const response = await fetch('/api/pemetaan-cpmk-cpl/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_Pemetaan_CPMK_vs_CPL.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengexport data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (!canRead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Pemetaan CPMK vs CPL</h2>
        <div className="flex gap-2">
          {canUpdate && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              💾 Simpan Perubahan
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPMK</th>
                {data.columns.map((col) => (
                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpmk}</td>
                  {data.columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-center border border-slate-200">
                      {canUpdate ? (
                        <input
                          type="checkbox"
                          checked={row.row[col] || false}
                          onChange={(e) => handleCellChange(idx, col, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      ) : (
                        row.row[col] ? "✅" : ""
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 2B.3 PETA PEMENUHAN CPL (LAPORAN)
// ============================================================
function Pemetaan2B3({ role, maps, refreshTrigger }) {
  const [data, setData] = useState({ semesters: [], rows: [] });
  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b3", "R");

  const fetchData = async () => {
    if (!canRead) return;
    
    setLoading(true);
    try {
      const result = await apiFetch("/pemetaan-2b3");
      setData(result);
    } catch (err) {
      console.error("Error fetching pemetaan 2B.3:", err);
      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.3', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!canRead) return;
    
    try {
      const response = await fetch('/api/pemetaan-2b3/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Tabel_2B3_Peta_Pemenuhan_CPL.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengexport data', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  if (!canRead) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">🗺️ Peta Pemenuhan CPL</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 Export Excel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPL</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">CPMK</th>
                {data.semesters.map((sem) => (
                  <th key={sem} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">
                    Semester {sem}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_cpl}</td>
                  <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                  {data.semesters.map((sem) => (
                    <td key={sem} className="px-4 py-3 text-slate-700 border border-slate-200 text-center">
                      {row.semester_map && row.semester_map[sem] && row.semester_map[sem].length > 0 
                        ? row.semester_map[sem].join(", ") 
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CPMK CRUD
// ============================================================
function CpmkCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(""); // Filter state
  const [formState, setFormState] = useState({
    kode_cpmk: "",
    deskripsi_cpmk: "",
    id_unit_prodi: "",
    id_mk: ""
  });

  const canCreate = roleCan(role, "cpmk", "C");
  const canUpdate = roleCan(role, "cpmk", "U");
  const canDelete = roleCan(role, "cpmk", "D");
  
  // Filter rows based on selected prodi
  const filteredRows = selectedProdi 
    ? rows.filter(row => {
        if (selectedProdi === "MI") {
          return row.id_unit_prodi === 5 || row.nama_unit_prodi?.includes("Manajemen Informatika");
        } else if (selectedProdi === "TI") {
          return row.id_unit_prodi === 4 || row.nama_unit_prodi?.includes("Teknik Informatika");
        }
        return true;
      })
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/cpmk");
      setRows(result);
    } catch (err) {
      console.error("Error fetching CPMK:", err);
      Swal.fire('Error', 'Gagal memuat data CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('CPMK Form State:', formState); // Debug log
    
    try {
      const url = editing ? `/cpmk/${editing.id_cpmk}` : "/cpmk";
      const method = editing ? "PUT" : "POST";
      
      console.log('CPMK Sending request to:', url); // Debug log
      console.log('CPMK Method:', method); // Debug log
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      
      // Trigger refresh for pemetaan tabs
      if (onDataChange) {
        onDataChange();
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data CPMK berhasil diperbarui.' : 'Data CPMK berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error in CPMK handleSubmit:', err); // Debug log
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan yang tidak diketahui'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `CPMK ${row.kode_cpmk} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/cpmk/${row.id_cpmk}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data CPMK telah dihapus.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_cpmk: editing.kode_cpmk || "",
        deskripsi_cpmk: editing.deskripsi_cpmk || "",
        id_unit_prodi: editing.id_unit_prodi || "",
        id_mk: editing.id_mk || ""
      });
    } else {
      setFormState({
        kode_cpmk: "",
        deskripsi_cpmk: "",
        id_unit_prodi: "",
        id_mk: ""
      });
    }
  }, [editing]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">Semua Prodi</option>
            <option value="TI">Teknik Informatika (TI)</option>
            <option value="MI">Manajemen Informatika (MI)</option>
          </select>
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setSelectedProdi(""); // Reset filter when adding new data
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah CPMK
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} CPMK untuk Prodi {selectedProdi}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode CPMK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Mata Kuliah</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_cpmk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => { setEditing(row); setShowModal(true); }}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit CPMK' : 'Tambah CPMK'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kode CPMK</label>
                    <input
                      type="text"
                      value={formState.kode_cpmk}
                      onChange={(e) => setFormState({...formState, kode_cpmk: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    >
                      <option value="">Pilih Unit Prodi</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                      {maps.unit_kerja && Object.values(maps.unit_kerja).map(uk => (
                        <option key={uk.id_unit} value={uk.id_unit}>{uk.nama_unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi CPMK</label>
                  <textarea
                    value={formState.deskripsi_cpmk}
                    onChange={(e) => setFormState({...formState, deskripsi_cpmk: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Kuliah (Opsional)</label>
                  <select
                    value={formState.id_mk}
                    onChange={(e) => setFormState({...formState, id_mk: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  >
                    <option value="">Pilih Mata Kuliah (Opsional)</option>
                    {maps.mata_kuliah && Object.values(maps.mata_kuliah).map(mk => (
                      <option key={mk.id_mk} value={mk.id_mk}>{mk.kode_mk} - {mk.nama_mk}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mata kuliah akan dipetakan setelah CPMK dibuat</p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CPL CRUD
// ============================================================
function CplCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(""); // Filter state
  const [formState, setFormState] = useState({
    kode_cpl: "",
    deskripsi: "",
    id_unit_prodi: ""
  });

  const canCreate = roleCan(role, "cpl", "C");
  const canUpdate = roleCan(role, "cpl", "U");
  const canDelete = roleCan(role, "cpl", "D");
  
  // Filter rows based on selected prodi
  const filteredRows = selectedProdi 
    ? rows.filter(row => {
        if (selectedProdi === "MI") {
          return row.id_unit_prodi === 5 || row.nama_unit_prodi?.includes("Manajemen Informatika");
        } else if (selectedProdi === "TI") {
          return row.id_unit_prodi === 4 || row.nama_unit_prodi?.includes("Teknik Informatika");
        }
        return true;
      })
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/cpl");
      setRows(result);
    } catch (err) {
      console.error("Error fetching CPL:", err);
      Swal.fire('Error', 'Gagal memuat data CPL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('CPL Form State:', formState); // Debug log
    
    try {
      const url = editing ? `/cpl/${editing.id_cpl}` : "/cpl";
      const method = editing ? "PUT" : "POST";
      
      console.log('CPL Sending request to:', url); // Debug log
      console.log('CPL Method:', method); // Debug log
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      
      // Trigger refresh for 2B.2 tab
      if (onDataChange) {
        onDataChange();
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data CPL berhasil diperbarui.' : 'Data CPL berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error in CPL handleSubmit:', err); // Debug log
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan yang tidak diketahui'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `CPL ${row.kode_cpl} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/cpl/${row.id_cpl}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data CPL telah dihapus.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_cpl: editing.kode_cpl || "",
        deskripsi: editing.deskripsi_cpl || "",
        id_unit_prodi: editing.id_unit_prodi || ""
      });
    } else {
      setFormState({
        kode_cpl: "",
        deskripsi: "",
        id_unit_prodi: ""
      });
    }
  }, [editing]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Capaian Pembelajaran Lulusan (CPL)</h2>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">Semua Prodi</option>
            <option value="TI">Teknik Informatika (TI)</option>
            <option value="MI">Manajemen Informatika (MI)</option>
          </select>
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setSelectedProdi(""); // Reset filter when adding new data
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah CPL
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} CPL untuk Prodi {selectedProdi}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode CPL</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_cpl} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_cpl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_cpl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => { setEditing(row); setShowModal(true); }}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Capaian Pembelajaran (CPL)' : 'Tambah Capaian Pembelajaran (CPL) Baru'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode CPL</label>
                  <input
                    type="text"
                    placeholder="cth: CPL-D"
                    value={formState.kode_cpl}
                    onChange={(e) => setFormState({...formState, kode_cpl: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                  <select
                    value={formState.id_unit_prodi}
                    onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  >
                    <option value="">Pilih Unit Prodi</option>
                    <option value="4">Teknik Informatika (TI)</option>
                    <option value="5">Manajemen Informatika (MI)</option>
                    {maps.unit_kerja && Object.values(maps.unit_kerja).map(uk => (
                      <option key={uk.id_unit} value={uk.id_unit}>{uk.nama_unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Capaian Pembelajaran</label>
                  <textarea
                    placeholder="cth: Mampu merancang arsitektur sistem"
                    value={formState.deskripsi}
                    onChange={(e) => setFormState({...formState, deskripsi: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROFIL LULUSAN CRUD
// ============================================================
function ProfilLulusanCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(""); // Filter state
  const [formState, setFormState] = useState({
    kode_pl: "",
    deskripsi: "",
    id_unit_prodi: ""
  });

  const canCreate = roleCan(role, "profil_lulusan", "C");
  const canUpdate = roleCan(role, "profil_lulusan", "U");
  const canDelete = roleCan(role, "profil_lulusan", "D");
  
  // Filter rows based on selected prodi
  const filteredRows = selectedProdi 
    ? rows.filter(row => {
        if (selectedProdi === "MI") {
          return row.id_unit_prodi === 5 || row.nama_unit_prodi?.includes("Manajemen Informatika");
        } else if (selectedProdi === "TI") {
          return row.id_unit_prodi === 4 || row.nama_unit_prodi?.includes("Teknik Informatika");
        }
        return true;
      })
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/profil-lulusan");
      setRows(result);
    } catch (err) {
      console.error("Error fetching Profil Lulusan:", err);
      Swal.fire('Error', 'Gagal memuat data Profil Lulusan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('Form State:', formState); // Debug log
    
    try {
      const url = editing ? `/profil-lulusan/${editing.id_pl}` : "/profil-lulusan";
      const method = editing ? "PUT" : "POST";
      
      console.log('Sending request to:', url); // Debug log
      console.log('Method:', method); // Debug log
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      
      // Trigger refresh for 2B.2 tab
      if (onDataChange) {
        onDataChange();
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data Profil Lulusan berhasil diperbarui.' : 'Data Profil Lulusan berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error in handleSubmit:', err); // Debug log
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan yang tidak diketahui'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Profil Lulusan ${row.kode_pl} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/profil-lulusan/${row.id_pl}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data Profil Lulusan telah dihapus.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_pl: editing.kode_pl || "",
        deskripsi: editing.deskripsi_pl || "",
        id_unit_prodi: editing.id_unit_prodi || ""
      });
    } else {
      setFormState({
        kode_pl: "",
        deskripsi: "",
        id_unit_prodi: ""
      });
    }
  }, [editing]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Profil Lulusan</h2>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">Semua Prodi</option>
            <option value="TI">Teknik Informatika (TI)</option>
            <option value="MI">Manajemen Informatika (MI)</option>
          </select>
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setSelectedProdi(""); // Reset filter when adding new data
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah Profil Lulusan
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} profil lulusan untuk Prodi {selectedProdi}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode PL</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_pl} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_pl}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => { setEditing(row); setShowModal(true); }}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Profil Lulusan (PL)' : 'Tambah Profil Lulusan (PL) Baru'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode PL</label>
                  <input
                    type="text"
                    placeholder="cth: PL-3"
                    value={formState.kode_pl}
                    onChange={(e) => setFormState({...formState, kode_pl: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                  <select
                    value={formState.id_unit_prodi}
                    onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  >
                    <option value="">Pilih Unit Prodi</option>
                    <option value="4">Teknik Informatika (TI)</option>
                    <option value="5">Manajemen Informatika (MI)</option>
                    {maps.unit_kerja && Object.values(maps.unit_kerja).map(uk => (
                      <option key={uk.id_unit} value={uk.id_unit}>{uk.nama_unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Profil Lulusan</label>
                  <textarea
                    placeholder="cth: Mampu menjadi Manajer Proyek IT"
                    value={formState.deskripsi}
                    onChange={(e) => setFormState({...formState, deskripsi: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MATA KULIAH CRUD
// ============================================================
function MataKuliahCRUD({ role, maps, onDataChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(""); // Filter state
  const [formState, setFormState] = useState({
    kode_mk: "",
    nama_mk: "",
    sks: "",
    semester: "",
    id_unit_prodi: "",
    cpmk: []
  });

  const canCreate = roleCan(role, "mata_kuliah", "C");
  const canUpdate = roleCan(role, "mata_kuliah", "U");
  const canDelete = roleCan(role, "mata_kuliah", "D");
  
  // Filter rows based on selected prodi
  const filteredRows = selectedProdi 
    ? rows.filter(row => {
        if (selectedProdi === "MI") {
          return row.id_unit_prodi === 5 || row.nama_unit_prodi?.includes("Manajemen Informatika");
        } else if (selectedProdi === "TI") {
          return row.id_unit_prodi === 4 || row.nama_unit_prodi?.includes("Teknik Informatika");
        }
        return true;
      })
    : rows;

  const fetchRows = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/mata-kuliah");
      setRows(result);
    } catch (err) {
      console.error("Error fetching Mata Kuliah:", err);
      Swal.fire('Error', 'Gagal memuat data Mata Kuliah', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editing ? `/mata-kuliah/${editing.id_mk}` : "/mata-kuliah";
      const method = editing ? "PUT" : "POST";
      
      // Prepare data for backend
      const payload = {
        kode_mk: formState.kode_mk,
        nama_mk: formState.nama_mk,
        sks: formState.sks,
        semester: formState.semester,
        id_unit_prodi: formState.id_unit_prodi,
        cpmk: formState.cpmk.filter(c => c.trim() !== "").map(cpmkText => ({
          kode_cpmk: `CPMK-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          deskripsi: cpmkText
        }))
      };
      
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      setShowModal(false);
      setEditing(null);
      setSelectedProdi(""); // Reset filter
      fetchRows();
      
      // Trigger refresh for pemetaan tabs
      if (onDataChange) {
        onDataChange();
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editing ? 'Data Mata Kuliah berhasil diperbarui.' : 'Data Mata Kuliah berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editing ? 'memperbarui' : 'menambah'} data`,
        text: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: `Mata Kuliah ${row.kode_mk} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/mata-kuliah/${row.id_mk}`, { method: "DELETE" });
        Swal.fire('Dihapus!', 'Data Mata Kuliah telah dihapus.', 'success');
        fetchRows();
      } catch (err) {
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  const addCpmk = () => {
    setFormState({
      ...formState,
      cpmk: [...formState.cpmk, ""]
    });
  };

  const removeCpmk = (index) => {
    setFormState({
      ...formState,
      cpmk: formState.cpmk.filter((_, i) => i !== index)
    });
  };

  const updateCpmk = (index, value) => {
    const newCpmk = [...formState.cpmk];
    newCpmk[index] = value;
    setFormState({ ...formState, cpmk: newCpmk });
  };

  useEffect(() => {
    fetchRows();
  }, []);

  useEffect(() => {
    if (editing) {
      setFormState({
        kode_mk: editing.kode_mk || "",
        nama_mk: editing.nama_mk || "",
        sks: editing.sks || "",
        semester: editing.semester || "",
        id_unit_prodi: editing.id_unit_prodi || "",
        cpmk: editing.cpmk_list ? editing.cpmk_list.map(c => c.deskripsi_cpmk || "") : []
      });
    } else {
      setFormState({
        kode_mk: "",
        nama_mk: "",
        sks: "",
        semester: "",
        id_unit_prodi: "",
        cpmk: ["", ""]
      });
    }
  }, [editing]);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Mata Kuliah</h2>
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <select
            value={selectedProdi}
            onChange={(e) => setSelectedProdi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">Semua Prodi</option>
            <option value="TI">Teknik Informatika (TI)</option>
            <option value="MI">Manajemen Informatika (MI)</option>
          </select>
          
          {canCreate && (
            <button
              onClick={() => {
                setShowModal(true);
                setSelectedProdi(""); // Reset filter when adding new data
              }}
              className="px-4 py-2 bg-[#0384d6] text-white rounded-lg hover:bg-[#043975] transition-colors"
            >
              + Tambah Mata Kuliah
            </button>
          )}
        </div>
      </div>

      {/* Filter Info */}
      {selectedProdi && (
        <div className="mb-3 text-sm text-slate-600">
          Menampilkan {filteredRows.length} dari {rows.length} mata kuliah untuk Prodi {selectedProdi}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode MK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Nama MK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">SKS</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Semester</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id_mk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.sks}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.semester}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => { setEditing(row); setShowModal(true); }}
                        className="font-medium text-[#0384d6] hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(row)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">{editing ? 'Edit Mata Kuliah (MK) & CPMK' : 'Tambah Mata Kuliah (MK) & CPMK'}</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Mata Kuliah</label>
                    <input
                      type="text"
                      value={formState.kode_mk}
                      onChange={(e) => setFormState({...formState, kode_mk: e.target.value})}
                      placeholder="cth: IF-202"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Prodi</label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    >
                      <option value="">Pilih Unit Prodi</option>
                      <option value="TI">Teknik Informatika (TI)</option>
                      <option value="MI">Manajemen Informatika (MI)</option>
                      {maps.unit_kerja && Object.values(maps.unit_kerja).map(uk => (
                        <option key={uk.id_unit} value={uk.id_unit}>{uk.nama_unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Mata Kuliah</label>
                  <input
                    type="text"
                    value={formState.nama_mk}
                    onChange={(e) => setFormState({...formState, nama_mk: e.target.value})}
                    placeholder="cth: Rekayasa Perangkat Lunak"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS</label>
                    <input
                      type="number"
                      value={formState.sks}
                      onChange={(e) => setFormState({...formState, sks: e.target.value})}
                      placeholder="cth: 3"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      value={formState.semester}
                      onChange={(e) => setFormState({...formState, semester: e.target.value})}
                      placeholder="cth: 3"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                    />
                  </div>
                </div>
                
                {/* CPMK Section */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">CPMK (Capaian Pembelajaran Mata Kuliah)</h3>
                    <p className="text-sm text-gray-600 mb-4">Definisikan kemampuan spesifik yang didapat dari mata kuliah ini.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {formState.cpmk.map((cpmk, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-gray-700 min-w-[80px]">
                          CPMK {index + 1}:
                        </label>
                        <input
                          type="text"
                          value={cpmk}
                          onChange={(e) => updateCpmk(index, e.target.value)}
                          placeholder="..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
                        />
                        {formState.cpmk.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeCpmk(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addCpmk}
                      className="text-[#0384d6] hover:text-[#043975] transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <span className="text-lg">+</span> Tambah CPMK
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditing(null); }}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

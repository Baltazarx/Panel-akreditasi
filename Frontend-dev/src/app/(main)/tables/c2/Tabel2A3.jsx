"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';

// Helper functions for building table headers
const seg = (n) => (n.key ? String(n.key) : String(n.label || "col")).replace(/\s+/g, "_");
const depth = (n) => (n.children ? 1 + Math.max(...n.children.map(depth)) : 1);
const colSpan = (n) => (n.children ? n.children.reduce((s, c) => s + colSpan(c), 0) : 1);

const buildHeaderRows = (tree) => {
  const treeMax = Math.max(...tree.map(depth));
  const rows = [];
  const walk = (nodes, d = 1, path = []) => {
    rows[d - 1] ||= [];
    nodes.forEach((n) => {
      const hasKids = !!n.children;
      const cs = colSpan(n);
      const rs = hasKids ? 1 : treeMax - d + 1;
      const keyPath = [...path, seg(n)].join(">");
      rows[d - 1].push(
        <th key={`th:${keyPath}:${d}`} colSpan={cs} rowSpan={rs} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
          {(n.label || n.key)?.toUpperCase()}
        </th>
      );
      if (hasKids) walk(n.children, d + 1, [...path, seg(n)]);
    });
  };
  walk(tree);
  return rows;
};

const flattenLeaves = (tree) => {
  const out = [];
  const walk = (nodes, path = []) => {
    nodes.forEach((n) => {
      const p = [...path, seg(n)];
      if (n.children) walk(n.children, p);
      else out.push({ ...n, __path: p.join(">") });
    });
  };
  walk(tree);
  return out;
};

// Komponen Form untuk Tambah/Edit data Lulus & DO
function KondisiMahasiswaForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({ jml_lulus: 0, jml_do: 0, ...initialData });

  useEffect(() => {
    setFormData({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Jumlah Lulus pada saat TS
        </label>
        <input
          type="number"
          name="jml_lulus"
          value={formData.jml_lulus}
          onChange={handleChange}
          placeholder="Masukkan jumlah"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Jumlah Mengundurkan Diri/DO pada saat TS
        </label>
        <input
          type="number"
          name="jml_do"
          value={formData.jml_do}
          onChange={handleChange}
          placeholder="Masukkan jumlah"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] text-black"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}


export default function Tabel2A3() {
  const { authUser } = useAuth();
  const { maps } = useMaps(true);

  const [mahasiswaConditions, setMahasiswaConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingData, setEditingData] = useState(null);

  const tahunList = useMemo(() => {
    return Object.values(maps.tahun || {}).sort((a, b) => a.id_tahun - b.id_tahun);
  }, [maps.tahun]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Tabel2A3 - Starting refresh");
      console.log("👤 Auth user:", authUser ? { id: authUser.id, unit: authUser.unit, role: authUser.role } : null);
      
      const mc = await apiFetch(`/tabel2a3-kondisi-mahasiswa?timestamp=${new Date().getTime()}`);
      console.log("📊 Raw API response:", mc);
      console.log("📊 Is array:", Array.isArray(mc));
      console.log("📊 Length:", Array.isArray(mc) ? mc.length : 'N/A');
      
      setMahasiswaConditions(Array.isArray(mc) ? mc : []);
      
      const years = [...(Array.isArray(mc) ? mc : [])].map((x) => Number(x?.id_tahun)).filter((n) => Number.isFinite(n));
      console.log("📅 Available years:", years);
      
      const latest = years.length === 0 ? new Date().getFullYear() : Math.max(...years);
      console.log("📅 Selected year:", latest);
      setSelectedTahun(latest);
      
      console.log("✅ Tabel2A3 - Refresh completed");
    } catch (e) {
      console.error("❌ Tabel2A3 - Failed to fetch data:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const currentYearLulusDoData = useMemo(() => {
    if (!selectedTahun) {
      console.log("⚠️ Tabel2A3 - Missing selectedTahun:", {
        selectedTahun,
        authUserUnit: authUser?.unit,
        authUser: authUser
      });
      return null;
    }
    
    // Untuk role khusus seperti WAKET, cari data dari semua unit
    let searchData = mahasiswaConditions;
    if (authUser?.unit && !authUser?.role?.toLowerCase().includes('waket') && !authUser?.role?.toLowerCase().includes('tpm')) {
      searchData = mahasiswaConditions.filter(item => item.id_unit_prodi === authUser.unit);
    }
    
    // Backend mengembalikan data agregat dari tabel_2a1 dan tabel_2a3
    const record = searchData.find(d => d.id_tahun === selectedTahun);
    if (!record) return null;
    
    // Jika ada jml_lulus atau jml_do, berarti data sudah ada di tabel_2a3
    const hasData = (record.jml_lulus && record.jml_lulus > 0) || (record.jml_do && record.jml_do > 0);
    
    return hasData ? {
      id: record.id,
      id_tahun: selectedTahun,
      id_unit_prodi: record.id_unit_prodi,
      jml_lulus: record.jml_lulus || 0,
      jml_do: record.jml_do || 0,
    } : null;
  }, [mahasiswaConditions, selectedTahun, authUser?.unit, authUser?.role]);

  const handleOpenAddModal = () => {
    // Debug authUser untuk troubleshooting
    console.log("🔍 Tabel2A3 - Debug authUser di handleOpenAddModal:", {
      authUser,
      unit: authUser?.unit,
      hasUnit: !!authUser?.unit,
      selectedTahun
    });
    
    if (!authUser?.unit) {
      // Untuk role khusus seperti WAKET, gunakan unit default
      if (authUser?.role?.toLowerCase().includes('waket') || authUser?.role?.toLowerCase().includes('tpm')) {
        console.log("⚠️ User dengan role khusus, menggunakan unit default");
        setModalMode('add');
        setEditingData({ id_tahun: selectedTahun, id_unit_prodi: 1, jml_lulus: 0, jml_do: 0 }); // Default ke Ketua STIKOM
        setIsModalOpen(true);
        return;
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error!', 
          text: 'Unit program studi tidak ditemukan. Silakan logout dan login kembali.' 
        });
        return;
      }
    }
    
    setModalMode('add');
    setEditingData({ id_tahun: selectedTahun, id_unit_prodi: authUser.unit, jml_lulus: 0, jml_do: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!currentYearLulusDoData) return;
    setModalMode('edit');
    setEditingData(currentYearLulusDoData);
    setIsModalOpen(true);
  };

  const handleHapus = async () => {
    if (!currentYearLulusDoData) return;
    const result = await Swal.fire({
      title: 'Anda yakin?',
      text: `Data Lulus & DO untuk tahun ${selectedTahun} akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2a3-kondisi-mahasiswa/${currentYearLulusDoData.id}`, { method: 'DELETE' });
        await refresh();
        Swal.fire('Dihapus!', 'Data telah berhasil dihapus.', 'success');
      } catch (err) {
        setError(err);
        Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        id_tahun: formData.id_tahun,
        id_unit_prodi: formData.id_unit_prodi,
        jml_lulus: formData.jml_lulus,
        jml_do: formData.jml_do,
      };
      if (modalMode === 'add') {
        await apiFetch('/tabel2a3-kondisi-mahasiswa', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch(`/tabel2a3-kondisi-mahasiswa/${editingData.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      await refresh();
      Swal.fire('Berhasil!', `Data berhasil ${modalMode === 'add' ? 'ditambahkan' : 'diperbarui'}.`, 'success');
    } catch (err) {
      setError(err);
      Swal.fire('Gagal!', `Gagal ${modalMode === 'add' ? 'menambahkan' : 'memperbarui'} data: ${err.message}`, 'error');
    }
  };

  const COLS_2A3 = useMemo(() => [
    { key: "kategori", label: "Kategori" }, { key: "ts", label: "TS" },
    { key: "ts_minus_1", label: "TS-1" }, { key: "ts_minus_2", label: "TS-2" },
    { key: "ts_minus_3", label: "TS-3" }, { key: "ts_minus_4", label: "TS-4" },
    { key: "jumlah", label: "Jumlah" },
  ], []);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2A3), [COLS_2A3]);
  const leaves = useMemo(() => flattenLeaves(COLS_2A3), [COLS_2A3]);

  const displayRows = useMemo(() => {
    console.log("🎨 Tabel2A3 - Building display rows");
    console.log("📊 Selected tahun:", selectedTahun);
    console.log("👤 Auth user unit:", authUser?.unit);
    console.log("📊 Mahasiswa conditions:", mahasiswaConditions);
    
    if (!selectedTahun) {
      console.log("⚠️ Tabel2A3 - Missing selectedTahun:", {
        selectedTahun,
        authUserUnit: authUser?.unit,
        authUser: authUser
      });
      return [];
    }
    
    // Untuk role khusus seperti WAKET, tampilkan data dari semua unit
    let dataToProcess = mahasiswaConditions;
    if (authUser?.unit && !authUser?.role?.toLowerCase().includes('waket') && !authUser?.role?.toLowerCase().includes('tpm')) {
      // Filter data untuk unit prodi user
      dataToProcess = mahasiswaConditions.filter(item => item.id_unit_prodi === authUser.unit);
      console.log("🔍 Filtered data for unit", authUser.unit, ":", dataToProcess);
    } else {
      console.log("🔍 Showing data from all units for role:", authUser?.role);
    }
    
    // Inisialisasi struktur data agregat
    const aggregatedData = {
      "Mahasiswa Baru": { kategori: "Mahasiswa Baru", ts: 0, ts_minus_1: 0, ts_minus_2: 0, ts_minus_3: 0, ts_minus_4: 0, jumlah: 0 },
      "Mahasiswa Aktif pada saat TS": { kategori: "Mahasiswa Aktif pada saat TS", ts: 0, ts_minus_1: 0, ts_minus_2: 0, ts_minus_3: 0, ts_minus_4: 0, jumlah: 0 },
      "Lulus pada saat TS": { kategori: "Lulus pada saat TS", ts: 0, ts_minus_1: 0, ts_minus_2: 0, ts_minus_3: 0, ts_minus_4: 0, jumlah: 0 },
      "Mengundurkan Diri/DO pada saat TS": { kategori: "Mengundurkan Diri/DO pada saat TS", ts: 0, ts_minus_1: 0, ts_minus_2: 0, ts_minus_3: 0, ts_minus_4: 0, jumlah: 0 }
    };
    
    // Proses data dari backend
    // Backend mengembalikan: jumlah_maba, jumlah_mhs_aktif, jml_lulus, jml_do
    dataToProcess.forEach(item => {
      const year = Number(item.id_tahun);
      const yearDiff = selectedTahun - year;
      
      if (yearDiff < 0 || yearDiff > 4) return; // Skip data di luar range TS sampai TS-4
      
      const tsKey = yearDiff === 0 ? 'ts' : `ts_minus_${yearDiff}`;
      
      // Mahasiswa Baru (dari jml_baru)
      const jmlBaru = Number(item.jml_baru) || 0;
      aggregatedData["Mahasiswa Baru"][tsKey] += jmlBaru;
      
      // Mahasiswa Aktif (dari jml_aktif)
      const jmlAktif = Number(item.jml_aktif) || 0;
      aggregatedData["Mahasiswa Aktif pada saat TS"][tsKey] += jmlAktif;
      
      // Lulus
      const jmlLulus = Number(item.jml_lulus) || 0;
      aggregatedData["Lulus pada saat TS"][tsKey] += jmlLulus;
      
      // DO/Mengundurkan Diri
      const jmlDo = Number(item.jml_do) || 0;
      aggregatedData["Mengundurkan Diri/DO pada saat TS"][tsKey] += jmlDo;
    });
    
    // Hitung total jumlah untuk setiap kategori
    Object.values(aggregatedData).forEach(row => {
      row.jumlah = row.ts + row.ts_minus_1 + row.ts_minus_2 + row.ts_minus_3 + row.ts_minus_4;
    });
    
    const result = Object.values(aggregatedData);
    console.log("📊 Final aggregated data:", result);
    
    return result;
  }, [mahasiswaConditions, selectedTahun, authUser?.unit]);

  const renderBody = (rows, leaves) => rows.map((item, rowIndex) => (
    <tr key={`row-${rowIndex}`} className={`transition-colors ${rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
      {leaves.map((leaf) => {
        const val = item?.[leaf.key];
        const show = leaf.key === 'kategori' ? val : (Number.isFinite(Number(val)) ? Number(val) : 0);
        return <td key={`cell-${leaf.key}-${rowIndex}`} className={`px-6 py-4 border border-slate-200 ${leaf.key === "kategori" ? "text-left font-medium text-slate-700" : "text-center text-slate-700"}`}>{show}</td>;
      })}
    </tr>
  ));
  
  const renderSumRow = (rows, leaves) => {
    const totals = {};
    leaves.forEach(leaf => {
      if (leaf.key !== "kategori") {
        totals[leaf.key] = rows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
      }
    });
    return (
      <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white font-semibold">
        {leaves.map((leaf, i) => (
          <td key={`sum-${i}`} className="px-6 py-4 text-center border border-white/20">
            {leaf.key === "kategori" ? "Jumlah" : totals[leaf.key] ?? ""}
          </td>
        ))}
      </tr>
    );
  };

  if (loading) return (
    <div className="p-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
      <p className="mt-2 text-slate-600">Memuat data...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-8">
      <div className="p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
        Error: {String(error?.message || error)}
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Tabel 2.A.3 Kondisi Jumlah Mahasiswa</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data kondisi mahasiswa (baru, aktif, lulus, DO) per tahun akademik.
        </p>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="select-tahun" className="text-sm font-medium text-slate-700">Filter Tahun:</label>
          <select
            id="select-tahun"
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
            value={selectedTahun || ''}
            onChange={(e) => setSelectedTahun(Number(e.target.value))}
            disabled={loading}
          >
            <option value="" disabled>Pilih Tahun</option>
            {tahunList.map((tahun) => (
              <option key={tahun.id_tahun} value={tahun.id_tahun}>
                {tahun.tahun || tahun.nama}
              </option>
            ))}
          </select>
        </div>
        
        {currentYearLulusDoData ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEditModal}
              disabled={loading}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit Data
            </button>
            <button
              onClick={handleHapus}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hapus Data
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpenAddModal}
            disabled={loading}
            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Tambah Data
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            {headerRows.map((cells, idx) => (
              <tr key={`hdr-${idx}`} className="sticky top-0">
                {cells}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {renderBody(displayRows, leaves)}
            {renderSumRow(displayRows, leaves)}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">
                {modalMode === 'add' ? 'Tambah' : 'Edit'} Data Lulus & DO untuk Tahun {selectedTahun}
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                Lengkapi data jumlah mahasiswa lulus dan mengundurkan diri.
              </p>
            </div>
            <div className="p-8">
              <KondisiMahasiswaForm
                initialData={editingData}
                onSubmit={handleFormSubmit}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
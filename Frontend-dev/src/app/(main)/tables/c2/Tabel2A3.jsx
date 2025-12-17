"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiChevronDown, FiCalendar, FiDownload } from 'react-icons/fi';

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
          className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
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
  const [openYearFilterDropdown, setOpenYearFilterDropdown] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, scrollY);
      };
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isModalOpen]);

  // Close year filter dropdown when selectedTahun changes
  useEffect(() => {
    setOpenYearFilterDropdown(false);
  }, [selectedTahun]);

  // Close year filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openYearFilterDropdown && !event.target.closest('.year-filter-dropdown-container') && !event.target.closest('.year-filter-dropdown-menu')) {
        setOpenYearFilterDropdown(false);
      }
    };

    if (openYearFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openYearFilterDropdown]);

  const tahunList = useMemo(() => {
    return Object.values(maps.tahun || {}).sort((a, b) => a.id_tahun - b.id_tahun);
  }, [maps.tahun]);

  // Helper function untuk sorting data berdasarkan terbaru
  const sortRowsByLatest = (rowsArray) => {
    return [...rowsArray].sort((a, b) => {
      // Jika ada created_at, urutkan berdasarkan created_at terbaru
      if (a.created_at && b.created_at) {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Terbaru di atas
        }
      }
      
      // Jika ada updated_at, urutkan berdasarkan updated_at terbaru
      if (a.updated_at && b.updated_at) {
        const dateA = new Date(a.updated_at);
        const dateB = new Date(b.updated_at);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB.getTime() - dateA.getTime(); // Terbaru di atas
        }
      }
      
      // Fallback: urutkan berdasarkan ID terbesar (asumsi auto-increment)
      const idA = a.id || 0;
      const idB = b.id || 0;
      return idB - idA; // ID terbesar di atas
    });
  };

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
      
      const rowsArray = Array.isArray(mc) ? mc : [];
      const sortedData = sortRowsByLatest(rowsArray);
      setMahasiswaConditions(sortedData);
      
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

  // Fungsi export Excel untuk Tabel Kondisi Mahasiswa
  const exportToExcel = async () => {
    try {
      setLoading(true);
      
      if (!selectedTahun) {
        throw new Error('Pilih tahun akademik terlebih dahulu untuk mengekspor data.');
      }

      if (displayRows.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];
      
      // Tambahkan data dari displayRows
      displayRows.forEach((row) => {
        exportData.push({
          'Kategori': row.kategori || '',
          'TS': row.ts || 0,
          'TS-1': row.ts_minus_1 || 0,
          'TS-2': row.ts_minus_2 || 0,
          'TS-3': row.ts_minus_3 || 0,
          'TS-4': row.ts_minus_4 || 0,
          'Jumlah': row.jumlah || 0
        });
      });
      
      // Tambahkan baris Jumlah
      const totals = {};
      leaves.forEach(leaf => {
        if (leaf.key !== "kategori") {
          totals[leaf.key] = displayRows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
        }
      });
      
      exportData.push({
        'Kategori': 'Jumlah',
        'TS': totals.ts || 0,
        'TS-1': totals.ts_minus_1 || 0,
        'TS-2': totals.ts_minus_2 || 0,
        'TS-3': totals.ts_minus_3 || 0,
        'TS-4': totals.ts_minus_4 || 0,
        'Jumlah': totals.jumlah || 0
      });

      // Import xlsx library
      let XLSX;
      try {
        XLSX = await import('xlsx');
      } catch (importErr) {
        console.warn('xlsx library tidak tersedia, menggunakan CSV fallback:', importErr);
        // Fallback ke CSV
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };
        
        // Get headers from first row
        const headers = Object.keys(exportData[0] || {});
        const csvRows = [
          headers.map(escapeCsv).join(','),
          ...exportData.map(row => 
            headers.map(header => escapeCsv(row[header])).join(',')
          )
        ];
        const csvContent = '\ufeff' + csvRows.join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tabel_2A3_Kondisi_Mahasiswa_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data berhasil diekspor ke CSV. File dapat dibuka di Excel.',
          timer: 1500,
          showConfirmButton: false
        });
        return;
      }

      // Buat workbook baru
      const wb = XLSX.utils.book_new();
      
      // Buat worksheet dari data
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 35 },  // Kategori
        { wch: 12 },  // TS
        { wch: 12 },  // TS-1
        { wch: 12 },  // TS-2
        { wch: 12 },  // TS-3
        { wch: 12 },  // TS-4
        { wch: 12 }   // Jumlah
      ];
      
      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Kondisi Mahasiswa');
      
      // Generate file dan download
      const fileName = `Tabel_2A3_Kondisi_Mahasiswa_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor ke Excel.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error exporting data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengekspor data',
        text: err.message || 'Terjadi kesalahan saat mengekspor data.'
      });
    } finally {
      setLoading(false);
    }
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
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Tabel 2.A.3 Kondisi Jumlah Mahasiswa</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data kondisi mahasiswa (baru, aktif, lulus, DO) per tahun akademik.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{mahasiswaConditions.length}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Filter Tahun:</label>
          <div className="relative year-filter-dropdown-container" style={{ minWidth: '200px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  setOpenYearFilterDropdown(!openYearFilterDropdown);
                }
              }}
              disabled={loading}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                selectedTahun 
                  ? 'border-[#0384d6] bg-white text-black' 
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Pilih tahun"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                <span className={`truncate ${selectedTahun ? 'text-black' : 'text-gray-500'}`}>
                  {selectedTahun 
                    ? (() => {
                        const found = tahunList.find((t) => Number(t.id_tahun) === Number(selectedTahun));
                        return found ? (found.tahun || found.nama) : selectedTahun;
                      })()
                    : "Pilih Tahun"}
                </span>
              </div>
              <FiChevronDown 
                className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                  openYearFilterDropdown ? 'rotate-180' : ''
                }`} 
                size={16} 
              />
            </button>
            {openYearFilterDropdown && !loading && (
              <div 
                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto year-filter-dropdown-menu mt-1 w-full"
                style={{ minWidth: '200px' }}
              >
                {tahunList.length > 0 ? (
                  tahunList.map((tahun) => (
                    <button
                      key={tahun.id_tahun}
                      type="button"
                      onClick={() => {
                        setSelectedTahun(Number(tahun.id_tahun));
                        setOpenYearFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                        selectedTahun === Number(tahun.id_tahun)
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                      <span>{tahun.tahun || tahun.nama}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Tidak ada data tahun
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            disabled={loading || !selectedTahun || displayRows.length === 0}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
          {currentYearLulusDoData ? (
            <>
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
            </>
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
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">
                {modalMode === 'add' ? 'Tambah' : 'Edit'} Data Lulus & DO untuk Tahun {selectedTahun}
              </h2>
              <p className="text-white/80 mt-1 text-sm">
                Lengkapi data jumlah mahasiswa lulus dan mengundurkan diri.
              </p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
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
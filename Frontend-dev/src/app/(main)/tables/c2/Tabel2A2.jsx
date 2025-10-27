"use client";
import React, { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../../../lib/api";
import { useMaps } from "../../../../hooks/useMaps";
import { useAuth } from "../../../../context/AuthContext";
import Swal from 'sweetalert2';

export default function Tabel2A2() {
  const { maps, loading: mapsLoading } = useMaps(true);
  const { authUser } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({
    id_unit_prodi: "",
    id_tahun: "",
    nama_daerah_input: "",
    kategori_geografis: "Sama Kota/Kab",
    jumlah_mahasiswa: 0,
    link_bukti: ""
  });

  const geographicalCategories = [
    {
      name: "Kota/Kab sama dengan PS",
      subcategories: []
    },
    {
      name: "Kota/Kab Lain",
      subcategories: []
    },
    {
      name: "Provinsi Lain", 
      subcategories: []
    },
    {
      name: "Negara Lain",
      subcategories: []
    }
  ];

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (showDeleted) params.append("include_deleted", "1");
      if (selectedTahun) params.append("id_tahun", selectedTahun);
      
      const apiUrl = `/tabel2a2-keragaman-asal?${params}`;
      
      const result = await apiFetch(apiUrl);
      
      // Apply filtering
      const filteredData = showDeleted
        ? result.filter((row) => row.deleted_at !== null)
        : result.filter((row) => row.deleted_at === null);
      
      setData(Array.isArray(filteredData) ? filteredData : []);
      
      // Set default selected year from data or maps
      if (!selectedTahun) {
        const years = result.map(x => Number(x?.id_tahun)).filter(Number.isFinite);
        
        if (years.length > 0) {
          // Use latest year from API data
          const latest = Math.max(...years);
          setSelectedTahun(latest);
        } else if (maps?.tahun && Object.keys(maps.tahun).length > 0) {
          // Use latest year from maps
          const mapYears = Object.keys(maps.tahun).map(Number).filter(Number.isFinite);
          const latest = Math.max(...mapYears);
          setSelectedTahun(latest);
        } else {
          // No years available, show all data without year filter
        }
      }
      
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapsLoading) {
      refresh();
    }
  }, [mapsLoading, showDeleted, selectedTahun]);

  const yearWindow = useMemo(() => {
    const window = selectedTahun ? Array.from({ length: 5 }, (_, i) => Number(selectedTahun) - i) : [];
    return window;
  }, [selectedTahun]);

  const filteredData = useMemo(() => {
    if (!selectedTahun) {
      return data; // Show all data if no year selected
    }
    
    const filtered = data.filter(item => yearWindow.includes(Number(item.id_tahun)));
    return filtered;
  }, [data, selectedTahun, yearWindow]);

  // Helper function to organize data by categories and subcategories
  const organizeDataByCategories = () => {
    const organizedData = geographicalCategories.map(category => {
      // Map database categories to frontend categories
      let dbCategory = category.name;
      if (category.name === "Kota/Kab sama dengan PS") {
        dbCategory = "Sama Kota/Kab";
      }
      
      const categoryData = filteredData.filter(item => item.kategori_geografis === dbCategory);
      
      // Group by nama_daerah_input to create subcategories
      const subcategories = {};
      categoryData.forEach(item => {
        const daerah = item.nama_daerah_input;
        if (!subcategories[daerah]) {
          subcategories[daerah] = {
            name: daerah,
            data: [],
            totalTS4: 0,
            totalTS3: 0,
            totalTS2: 0,
            totalTS1: 0,
            totalTS: 0,
            linkBukti: item.link_bukti
          };
        }
        subcategories[daerah].data.push(item);
        
        // Calculate totals for each TS
        const year = Number(item.id_tahun);
        const currentYear = selectedTahun || new Date().getFullYear();
        if (year === currentYear - 4) subcategories[daerah].totalTS4 += Number(item.jumlah_mahasiswa) || 0;
        if (year === currentYear - 3) subcategories[daerah].totalTS3 += Number(item.jumlah_mahasiswa) || 0;
        if (year === currentYear - 2) subcategories[daerah].totalTS2 += Number(item.jumlah_mahasiswa) || 0;
        if (year === currentYear - 1) subcategories[daerah].totalTS1 += Number(item.jumlah_mahasiswa) || 0;
        if (year === currentYear) subcategories[daerah].totalTS += Number(item.jumlah_mahasiswa) || 0;
      });
      
      return {
        ...category,
        subcategories: Object.values(subcategories),
        totalTS4: Object.values(subcategories).reduce((sum, sub) => sum + sub.totalTS4, 0),
        totalTS3: Object.values(subcategories).reduce((sum, sub) => sum + sub.totalTS3, 0),
        totalTS2: Object.values(subcategories).reduce((sum, sub) => sum + sub.totalTS2, 0),
        totalTS1: Object.values(subcategories).reduce((sum, sub) => sum + sub.totalTS1, 0),
        totalTS: Object.values(subcategories).reduce((sum, sub) => sum + sub.totalTS, 0),
        linkBukti: categoryData.length > 0 ? categoryData[0].link_bukti : null
      };
    });
    
    return organizedData;
  };

  // Get organized data
  const organizedData = organizeDataByCategories();

  const handleAddClick = () => {
    // Pastikan ada tahun yang dipilih sebelum membuka modal
    if (!selectedTahun) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Peringatan!', 
        text: 'Pilih tahun akademik terlebih dahulu sebelum menambah data' 
      });
      return;
    }
    
    // Debug authUser untuk troubleshooting
    console.log("🔍 Debug authUser di handleAddClick:", {
      authUser,
      unit: authUser?.unit,
      hasUnit: !!authUser?.unit
    });
    
    setForm({
      id_unit_prodi: authUser?.unit || "",
      id_tahun: selectedTahun || "",
      nama_daerah_input: "",
      kategori_geografis: "Sama Kota/Kab",
      jumlah_mahasiswa: 0,
      link_bukti: ""
    });
    setEditingRow(null);
    setShowModal(true);
  };

  const handleEditClick = (row) => {
    setForm({
      id_unit_prodi: row.id_unit_prodi || authUser?.unit || "",
      id_tahun: row.id_tahun || "",
      nama_daerah_input: row.nama_daerah_input || "",
      kategori_geografis: row.kategori_geografis || "Sama Kota/Kab",
      jumlah_mahasiswa: row.jumlah_mahasiswa || 0,
      link_bukti: row.link_bukti || ""
    });
    setEditingRow(row);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Tabel2A2 - Form submission started");
    console.log("📋 Form data:", form);
    console.log("👤 Auth user:", authUser ? { id: authUser.id, role: authUser.role } : null);
    console.log("✏️ Editing row:", editingRow ? { id: editingRow.id, ...editingRow } : null);
    
    try {
      // Validation
      console.log("🔍 Validating form data...");
      if (!form.id_unit_prodi) {
        console.log("❌ Validation failed: No unit selected");
        console.log("🔍 Debug form data:", form);
        console.log("🔍 Debug authUser:", authUser);
        
        // Jika user tidak punya unit, kita bisa menggunakan unit default atau skip validasi ini
        // untuk role tertentu seperti WAKET yang bisa mengakses semua unit
        if (authUser?.role?.toLowerCase().includes('waket') || authUser?.role?.toLowerCase().includes('tpm')) {
          console.log("⚠️ User dengan role khusus, menggunakan unit default");
          form.id_unit_prodi = 1; // Default ke Ketua STIKOM
        } else {
          Swal.fire({ 
            icon: 'error', 
            title: 'Error!', 
            text: 'Unit program studi tidak ditemukan. Silakan logout dan login kembali.' 
          });
          return;
        }
      }
      if (!form.id_tahun) {
        console.log("❌ Validation failed: No year selected");
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Pilih tahun akademik terlebih dahulu' });
        return;
      }
      if (!form.nama_daerah_input) {
        console.log("❌ Validation failed: No region name");
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Masukkan nama daerah terlebih dahulu' });
        return;
      }
      if (!form.kategori_geografis) {
        console.log("❌ Validation failed: No category selected");
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Pilih kategori geografis terlebih dahulu' });
        return;
      }
      if (form.jumlah_mahasiswa < 0) {
        console.log("❌ Validation failed: Negative student count");
        Swal.fire({ icon: 'error', title: 'Error!', text: 'Jumlah mahasiswa tidak boleh negatif' });
        return;
      }
      console.log("✅ Form validation passed");

      const payload = {
        ...form,
        id_unit_prodi: Number(form.id_unit_prodi),
        id_tahun: Number(form.id_tahun),
        jumlah_mahasiswa: Number(form.jumlah_mahasiswa),
        // Backend mengharapkan req.user.id_user, jadi kita tidak perlu kirim created_by/updated_by
        // karena middleware auth akan menangani ini
      };
      
      console.log("📦 Prepared payload:", payload);

      if (editingRow) {
        console.log("✏️ Updating existing record:", editingRow.id);
        const updateUrl = `/tabel2a2-keragaman-asal/${editingRow.id}`;
        console.log("🌐 Update API URL:", updateUrl);
        
        await apiFetch(updateUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        console.log("✅ Update successful");
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diupdate', timer: 2000 });
      } else {
        console.log("➕ Creating new record");
        const createUrl = "/tabel2a2-keragaman-asal";
        console.log("🌐 Create API URL:", createUrl);
        
        await apiFetch(createUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        console.log("✅ Create successful");
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil ditambahkan', timer: 2000 });
      }
      
      setShowModal(false);
      console.log("🔄 Refreshing data after submission");
      refresh();
    } catch (e) {
      console.error("❌ Tabel2A2 - Form submission error:", e);
      console.error("❌ Error details:", {
        message: e?.message,
        stack: e?.stack,
        name: e?.name
      });
      Swal.fire({ icon: 'error', title: 'Gagal!', text: e?.message || 'Terjadi kesalahan' });
    }
  };

  const handleDelete = async (id) => {
    console.log("🗑️ Tabel2A2 - Delete request for ID:", id);
    
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: 'Yakin ingin menghapus data ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        console.log("🌐 Making DELETE request to:", `/tabel2a2-keragaman-asal/${id}`);
        await apiFetch(`/tabel2a2-keragaman-asal/${id}`, { method: "DELETE" });
        console.log("✅ Delete successful");
        await Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Data berhasil dihapus', timer: 2000 });
        refresh();
      } catch (e) {
        console.error("❌ Tabel2A2 - Delete error:", e);
        Swal.fire({ icon: 'error', title: 'Gagal!', text: e?.message || 'Gagal menghapus data' });
      }
    } else {
      console.log("❌ Delete cancelled by user");
    }
  };

  const handleRestore = async (id) => {
    console.log("🔄 Tabel2A2 - Restore request for ID:", id);
    try {
      console.log("🌐 Making RESTORE request to:", `/tabel2a2-keragaman-asal/${id}/restore`);
      await apiFetch(`/tabel2a2-keragaman-asal/${id}/restore`, { method: "POST" });
      console.log("✅ Restore successful");
      await Swal.fire({ icon: 'success', title: 'Dipulihkan!', text: 'Data berhasil dipulihkan', timer: 2000 });
      refresh();
    } catch (e) {
      console.error("❌ Tabel2A2 - Restore error:", e);
      Swal.fire({ icon: 'error', title: 'Gagal!', text: e?.message || 'Gagal memulihkan data' });
    }
  };

  const handleHardDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Permanen?',
      text: 'Data akan dihapus permanen dan tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33'
    });
    
    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2a2-keragaman-asal/${id}/hard-delete`, { method: "DELETE" });
        await Swal.fire({ icon: 'success', title: 'Terhapus Permanen!', text: 'Data berhasil dihapus permanen', timer: 2000 });
        refresh();
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: e?.message || 'Gagal menghapus permanen' });
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const doRestoreMultiple = async () => {
    if (selectedRows.length === 0) return;
    const result = await Swal.fire({
      title: 'Pulihkan Data',
      text: `Pulihkan ${selectedRows.length} data terpilih?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pulihkan',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2a2-keragaman-asal/restore-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedRows })
        });
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil dipulihkan', timer: 2000 });
        setSelectedRows([]);
        refresh();
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: e?.message || 'Gagal memulihkan data' });
      }
    }
  };

  console.log("🎨 Tabel2A2 - Rendering component with state:", {
    mapsLoading,
    loading,
    error,
    dataLength: data.length,
    filteredDataLength: filteredData.length,
    selectedTahun,
    showDeleted,
    authUser: authUser ? { 
      id: authUser.id, 
      role: authUser.role, 
      unit: authUser.unit,
      username: authUser.username 
    } : null
  });

  if (mapsLoading) {
    console.log("⏳ Rendering maps loading state");
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat...</span>
      </div>
    );
  }

  if (loading && !data.length) {
    console.log("⏳ Rendering data loading state");
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043975]"></div>
        <span className="ml-3 text-gray-600">Memuat data...</span>
      </div>
    );
  }

  if (error) {
    console.log("❌ Rendering error state:", error);
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  const isAllSelected = filteredData.length > 0 && selectedRows.length === filteredData.length;

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-10">
      
      {/* Loading State */}
      {mapsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-600">Memuat data...</div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Keragaman Asal Mahasiswa */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Tabel 2.A.2 - Keragaman Asal Mahasiswa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data keragaman asal mahasiswa per tahun akademik.
          </p>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Year Selector */}
            {maps?.tahun && Object.keys(maps.tahun).length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="filter-tahun" className="text-sm font-medium text-slate-700">Filter Tahun:</label>
                <select
                  id="filter-tahun"
                  value={selectedTahun || ""}
                  onChange={(e) => setSelectedTahun(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
                  disabled={loading}
                >
                  <option value="" disabled>Pilih Tahun</option>
                  {Object.values(maps.tahun).map((t) => (
                    <option key={t.id_tahun} value={t.id_tahun} className="text-slate-700">{t.tahun}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Show Deleted Toggle */}
            <button
              onClick={() => { setShowDeleted(!showDeleted); setSelectedRows([]); }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showDeleted
                  ? "bg-[#0384d6] text-white"
                  : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
              }`}
              disabled={loading}
            >
              {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
            </button>

            {/* Bulk Restore Button */}
            {showDeleted && selectedRows.length > 0 && (
              <button
                onClick={doRestoreMultiple}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Pulihkan ({selectedRows.length})
              </button>
            )}
          </div>
          
          {/* Add Button */}
          {!showDeleted && (
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              + Tambah Data
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr className="sticky top-0">
                {showDeleted && (
                  <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                    />
                  </th>
                )}
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Asal Mahasiswa</th>
                <th colSpan="5" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Mahasiswa Baru</th>
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
              </tr>
              <tr className="sticky top-0">
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-4</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-3</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-2</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-1</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(() => {
                console.log("📊 Tabel2A2 - Rendering organized data:", {
                  organizedDataLength: organizedData.length,
                  sampleCategory: organizedData[0] || null
                });
                
                const rows = [];
                
                organizedData.forEach((category, categoryIndex) => {
                  // Add category row
                  rows.push(
                    <tr key={`category-${categoryIndex}`} className="transition-colors bg-slate-100 hover:bg-slate-200">
                      {showDeleted && (
                        <td className="px-6 py-4 text-center border border-slate-200">
                          {/* Checkbox for bulk operations if needed */}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-700 font-semibold border border-slate-200">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">
                        {category.totalTS4 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">
                        {category.totalTS3 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">
                        {category.totalTS2 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">
                        {category.totalTS1 || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">
                        {category.totalTS || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                        {category.linkBukti ? (
                          <a href={category.linkBukti} target="_blank" rel="noopener noreferrer" className="text-[#0384d6] hover:underline">
                            Lihat Bukti
                          </a>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-center whitespace-nowrap border border-slate-200">
                        {!showDeleted && (
                          <button
                            onClick={() => handleAddClick()}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Tambah
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  
                  // Add subcategory rows
                  category.subcategories.forEach((subcategory, subIndex) => {
                    rows.push(
                      <tr key={`subcategory-${categoryIndex}-${subIndex}`} className={`transition-colors ${subIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                        {showDeleted && (
                          <td className="px-6 py-4 text-center border border-slate-200">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(subcategory.data[0]?.id)}
                              onChange={() => handleSelectRow(subcategory.data[0]?.id)}
                              className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-700 pl-12 border border-slate-200">
                          {subcategory.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.totalTS4 || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.totalTS3 || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.totalTS2 || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.totalTS1 || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.totalTS || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">
                          {subcategory.linkBukti ? (
                            <a href={subcategory.linkBukti} target="_blank" rel="noopener noreferrer" className="text-[#0384d6] hover:underline">
                              Lihat Bukti
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-center whitespace-nowrap border border-slate-200">
                          {!showDeleted ? (
                            <>
                              <button
                                onClick={() => handleEditClick(subcategory.data[0])}
                                className="font-medium text-[#0384d6] hover:underline mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(subcategory.data[0]?.id)}
                                className="font-medium text-red-600 hover:underline"
                              >
                                Hapus
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestore(subcategory.data[0]?.id)}
                                className="font-medium text-green-600 hover:underline mr-2"
                              >
                                Pulihkan
                              </button>
                              <button
                                onClick={() => handleHardDelete(subcategory.data[0]?.id)}
                                className="font-medium text-red-800 hover:underline"
                              >
                                Hapus Permanen
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  });
                });
                
                return rows;
              })()}
              
              {/* Total Row */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white font-semibold">
                {showDeleted && <td className="px-6 py-4 text-center border border-white/20"></td>}
                <td className="px-6 py-4 font-bold border border-white/20">Jumlah</td>
                <td className="px-6 py-4 text-center font-bold border border-white/20">
                  {organizedData.reduce((sum, cat) => sum + cat.totalTS4, 0)}
                </td>
                <td className="px-6 py-4 text-center font-bold border border-white/20">
                  {organizedData.reduce((sum, cat) => sum + cat.totalTS3, 0)}
                </td>
                <td className="px-6 py-4 text-center font-bold border border-white/20">
                  {organizedData.reduce((sum, cat) => sum + cat.totalTS2, 0)}
                </td>
                <td className="px-6 py-4 text-center font-bold border border-white/20">
                  {organizedData.reduce((sum, cat) => sum + cat.totalTS1, 0)}
                </td>
                <td className="px-6 py-4 text-center font-bold border border-white/20">
                  {organizedData.reduce((sum, cat) => sum + cat.totalTS, 0)}
                </td>
                <td className="px-6 py-4 text-center border border-white/20">-</td>
                <td className="px-6 py-4 text-center border border-white/20">-</td>
              </tr>
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={showDeleted ? 8 : 7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editingRow ? 'Edit Keragaman Asal' : 'Tambah Keragaman Asal'}</h3>
              <p className="text-white/80 mt-1 text-sm">Isi formulir data keragaman asal mahasiswa.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Akademik <span className="text-red-500">*</span></label>
                    <select
                      value={form.id_tahun}
                      onChange={(e) => setForm({...form, id_tahun: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Tahun...</option>
                      {maps?.tahun && Object.values(maps.tahun).map((t) => (
                        <option key={t.id_tahun} value={t.id_tahun} className="text-slate-700">
                          {t.tahun}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nama Daerah <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.nama_daerah_input || ""}
                      onChange={(e) => setForm({...form, nama_daerah_input: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan nama daerah"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Kategori Geografis <span className="text-red-500">*</span></label>
                    <select
                      value={form.kategori_geografis}
                      onChange={(e) => setForm({...form, kategori_geografis: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                    >
                      <option value="">Pilih Kategori...</option>
                      <option value="Sama Kota/Kab">Kota/Kab sama dengan PS</option>
                      <option value="Kota/Kab Lain">Kota/Kab Lain</option>
                      <option value="Provinsi Lain">Provinsi Lain</option>
                      <option value="Negara Lain">Negara Lain</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Mahasiswa <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={form.jumlah_mahasiswa}
                      onChange={(e) => setForm({...form, jumlah_mahasiswa: e.target.value})}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan jumlah mahasiswa"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Link Bukti (Opsional)</label>
                    <input
                      type="url"
                      value={form.link_bukti}
                      onChange={(e) => setForm({...form, link_bukti: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white">{loading ? "Menyimpan..." : "Simpan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
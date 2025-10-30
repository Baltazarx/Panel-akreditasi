"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";

export default function Tabel2B4({ role }) {
  const { authUser } = useAuth();
  const { maps, loading: mapsLoading } = useMaps(true);
  const tableKey = "tabel_2b4_masa_tunggu";
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    id_tahun_lulus: "",
    jumlah_lulusan: "",
    jumlah_terlacak: "",
    rata_rata_waktu_tunggu_bulan: ""
  });
  const [showDeleted, setShowDeleted] = useState(false);

  const canCreate = roleCan(role, tableKey, "C");
  const canUpdate = roleCan(role, tableKey, "U");
  const canDelete = roleCan(role, tableKey, "D");

  // Fetch data berdasarkan tahun yang dipilih
  const fetchData = async () => {
    try {
      setLoading(true);
      let params = selectedTahun ? `?id_tahun_lulus=${selectedTahun}` : "";
      if (showDeleted) params += (params ? "&" : "?") + "include_deleted=1";
      console.log('Fetching Tabel2B4 data with params:', params);
      const result = await apiFetch(`/tabel2b4-masa-tunggu${params}`);
      console.log('Tabel2B4 data received:', result);
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTahun, showDeleted]);

  // Filter tahun yang tersedia
  const availableYears = useMemo(() => {
    const years = Object.values(maps?.tahun || {}).map(year => ({
      id: year.id_tahun,
      tahun: year.tahun
    }));
    // Urutkan dari yang terkecil (2020) ke yang terbesar
    return years.sort((a, b) => a.id - b.id);
  }, [maps?.tahun]);

  // Data untuk tabel dengan format TS-2, TS-1, TS
  const tableData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const tsData = {};
    
    // Group data by tahun
    data.forEach(item => {
      // Gunakan id_tahun_lulus langsung (sudah angka)
      const tahunLulus = item.id_tahun_lulus || parseInt(item.tahun_lulus?.split('/')[0] || currentYear);
      const tsKey = currentYear - tahunLulus;
      
      if (tsKey >= 0 && tsKey <= 2) {
        tsData[tsKey] = item;
      }
    });
    
    // Format untuk tabel
    const rows = [];
    for (let i = 2; i >= 0; i--) {
      const tsLabel = i === 0 ? "TS" : `TS-${i}`;
      const item = tsData[i];
      
      rows.push({
        tahun_lulus: tsLabel,
        jumlah_lulusan: item?.jumlah_lulusan || "",
        jumlah_terlacak: item?.jumlah_terlacak || "",
        rata_rata_waktu_tunggu_bulan: item?.rata_rata_waktu_tunggu_bulan || "",
        data: item
      });
    }
    
    // Tambahkan baris total
    const totalLulusan = data.reduce((sum, item) => sum + (item.jumlah_lulusan || 0), 0);
    const totalTerlacak = data.reduce((sum, item) => sum + (item.jumlah_terlacak || 0), 0);
    const avgTunggu = data.length > 0 
      ? data.reduce((sum, item) => sum + (item.rata_rata_waktu_tunggu_bulan || 0), 0) / data.length 
      : 0;
    
    rows.push({
      tahun_lulus: "Jumlah",
      jumlah_lulusan: totalLulusan,
      jumlah_terlacak: totalTerlacak,
      rata_rata_waktu_tunggu_bulan: Math.round(avgTunggu * 100) / 100,
      data: null
    });
    
    return rows;
  }, [data]);

  const handleAddClick = () => {
    setFormState({
      id_unit_prodi: authUser?.unit || "",
      id_tahun_lulus: selectedTahun || "",
      jumlah_lulusan: "",
      jumlah_terlacak: "",
      rata_rata_waktu_tunggu_bulan: ""
    });
    setEditing(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item) => {
    setFormState({
      id_unit_prodi: item.id_unit_prodi,
      id_tahun_lulus: item.id_tahun_lulus,
      jumlah_lulusan: item.jumlah_lulusan,
      jumlah_terlacak: item.jumlah_terlacak,
      rata_rata_waktu_tunggu_bulan: item.rata_rata_waktu_tunggu_bulan
    });
    setEditing(item);
    setShowAddModal(true);
  };

  const handleDeleteClick = async (item) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2b4-masa-tunggu/${item.id}`, {
          method: "DELETE"
        });
        Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
        fetchData();
      } catch (error) {
        console.error("Error deleting:", error);
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Prepare data dengan konversi ke number untuk field numerik
      const submitData = {
        ...formState,
        id_unit_prodi: parseInt(formState.id_unit_prodi),
        id_tahun_lulus: parseInt(formState.id_tahun_lulus),
        jumlah_lulusan: parseInt(formState.jumlah_lulusan) || 0,
        jumlah_terlacak: parseInt(formState.jumlah_terlacak) || 0,
        rata_rata_waktu_tunggu_bulan: parseFloat(formState.rata_rata_waktu_tunggu_bulan) || 0
      };
      
      if (editing) {
        await apiFetch(`/tabel2b4-masa-tunggu/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil diperbarui", "success");
      } else {
        await apiFetch("/tabel2b4-masa-tunggu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil ditambahkan", "success");
      }
      
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Error submitting:", error);
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCellClick = (row, field) => {
    if (row.data) {
      handleEditClick(row.data);
    }
  };

  // Render table function untuk konsistensi dengan tabel lain
  const renderTable = () => {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr className="sticky top-0">
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Tahun Lulus
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Jumlah Lulusan
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Jumlah Lulusan yang Terlacak
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Rata-rata Waktu Tunggu (Bulan)
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {tableData.map((row, index) => (
              <tr key={index} className={`transition-colors ${row.data && row.data.deleted_at ? "bg-red-100 text-red-800" : index%2===0?"bg-white":"bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium">
                  {row.tahun_lulus}
                </td>
                <td 
                  className={`px-6 py-4 text-slate-700 border border-slate-200 ${
                    row.data ? 'bg-yellow-50 cursor-pointer hover:bg-yellow-100' : ''
                  }`}
                  onClick={() => row.data && handleCellClick(row, 'jumlah_lulusan')}
                >
                  {row.jumlah_lulusan || (row.data ? "Klik untuk mengisi" : "")}
                </td>
                <td 
                  className={`px-6 py-4 text-slate-700 border border-slate-200 ${
                    row.data ? 'bg-yellow-50 cursor-pointer hover:bg-yellow-100' : ''
                  }`}
                  onClick={() => row.data && handleCellClick(row, 'jumlah_terlacak')}
                >
                  {row.jumlah_terlacak || (row.data ? "Klik untuk mengisi" : "")}
                </td>
                <td 
                  className={`px-6 py-4 text-slate-700 border border-slate-200 ${
                    row.data ? 'bg-yellow-50 cursor-pointer hover:bg-yellow-100' : ''
                  }`}
                  onClick={() => row.data && handleCellClick(row, 'rata_rata_waktu_tunggu_bulan')}
                >
                  {row.rata_rata_waktu_tunggu_bulan || (row.data ? "Klik untuk mengisi" : "")}
                </td>
                <td className="px-6 py-4 text-center border border-slate-200">
                  {row.data && (
                    <div className="flex items-center justify-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEditClick(row.data)}
                          className="font-medium text-[#0384d6] hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteClick(row.data)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  )}
                  {row.data && row.data.deleted_at && (
                    <div className="italic">Dihapus</div>
                  )}
                </td>
              </tr>
            ))}
            {tableData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper functions
  const getUnitName = (id) => {
    return maps?.units?.[id]?.nama || maps?.units?.[id]?.nama_unit || id;
  };

  const getTahunName = (id) => {
    return maps?.tahun?.[id]?.tahun || id;
  };
  // Year Selector Component
  const YearSelector = () => (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-tahun" className="text-sm font-medium text-slate-700">Tahun:</label>
      <select
        id="filter-tahun"
        value={selectedTahun || ""}
        onChange={(e) => setSelectedTahun(e.target.value ? parseInt(e.target.value) : null)}
        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
        disabled={loading}
      >
        <option value="">Semua Tahun</option>
        {availableYears.map(year => (
          <option key={year.id} value={year.id} className="text-slate-700">
            {year.tahun}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-10">
      
      {/* Loading State */}
      {mapsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-600">Memuat data...</div>
        </div>
      )}
      
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Tabel 2.B.4 Rata-rata Masa Tunggu Lulusan untuk Bekerja Pertama Kali
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Data masa tunggu lulusan untuk mendapatkan pekerjaan pertama
        </p>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector />
          {canDelete && (
            <button
              onClick={() => setShowDeleted(prev => !prev)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showDeleted
                  ? "bg-[#0384d6] text-white"
                  : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
              }`}
              disabled={loading}
            >
              {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan yang Dihapus"}
            </button>
          )}
        </div>
        
        {canCreate && (
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
      {renderTable()}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editing ? "Edit Data Masa Tunggu" : "Tambah Data Masa Tunggu"}</h3>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data rata-rata masa tunggu lulusan untuk bekerja pertama kali.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Unit Prodi...</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Lulus <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_tahun_lulus}
                      onChange={(e) => setFormState({...formState, id_tahun_lulus: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Tahun Lulus...</option>
                      {availableYears.map(year => (
                        <option key={year.id} value={year.id}>{year.tahun}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Lulusan <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jumlah_lulusan}
                      onChange={(e) => setFormState({...formState, jumlah_lulusan: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan jumlah lulusan"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Terlacak <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jumlah_terlacak}
                      onChange={(e) => setFormState({...formState, jumlah_terlacak: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan jumlah yang terlacak"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Rata-rata Waktu Tunggu (Bulan) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formState.rata_rata_waktu_tunggu_bulan}
                      onChange={(e) => setFormState({...formState, rata_rata_waktu_tunggu_bulan: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan rata-rata waktu tunggu (contoh: 2.5)"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : (editing ? "Perbarui" : "Simpan")}
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

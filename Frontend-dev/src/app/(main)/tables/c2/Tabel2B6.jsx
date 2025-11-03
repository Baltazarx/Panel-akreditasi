"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";

export default function Tabel2B6({ role }) {
  const { authUser } = useAuth();
  const { maps, loading: mapsLoading } = useMaps(true);
  const tableKey = "tabel_2b6_kepuasan_pengguna";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    id_tahun: "",
    jenis_kemampuan: "",
    persen_sangat_baik: "",
    persen_baik: "",
    persen_cukup: "",
    persen_kurang: ""
  });
  const [showDeleted, setShowDeleted] = useState(false);

  // Jenis kemampuan yang tersedia (sesuai backend)
  const jenisKemampuanList = [
    'Kerjasama Tim',
    'Keahlian di Bidang Prodi',
    'Kemampuan Berbahasa Asing (Inggris)',
    'Kemampuan Berkomunikasi',
    'Pengembangan Diri',
    'Kepemimpinan',
    'Etos Kerja'
  ];

  const availableYears = useMemo(() => {
    const years = Object.values(maps?.tahun || {}).map(year => ({
      id: year.id_tahun,
      tahun: year.tahun
    }));
    return years.sort((a, b) => a.id - b.id);
  }, [maps?.tahun]);

  const canCreate = roleCan(role, tableKey, "C");
  const canUpdate = roleCan(role, tableKey, "U");
  const canDelete = roleCan(role, tableKey, "D");

  const fetchData = async () => {
    try {
      setLoading(true);
      let params = "";
      if (selectedTahun) params += `?id_tahun=${selectedTahun}`;
      if (showDeleted) params += (params ? "&" : "?") + "include_deleted=1";
      
      const result = await apiFetch(`/tabel2b6-kepuasan-pengguna${params}`);
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTahun && availableYears.length > 0) {
      const nowYear = new Date().getFullYear();
      const found = availableYears.find(y => (`${y.tahun}`.startsWith(nowYear.toString())));
      if (found) setSelectedTahun(found.id);
      else setSelectedTahun(availableYears[availableYears.length - 1].id);
    }
  }, [availableYears, selectedTahun]);

  useEffect(() => { 
    fetchData(); 
  }, [selectedTahun, showDeleted]);

  // Transform data untuk tampilan tabel
  const tableData = useMemo(() => {
    if (!selectedTahun) return [];

    let filteredData = data.filter(item => !item.deleted_at);
    if (showDeleted) {
      filteredData = data.filter(item => item.deleted_at);
    }

    // Group by jenis_kemampuan
    const grouped = {};
    filteredData.forEach(item => {
      if (!grouped[item.jenis_kemampuan]) {
        grouped[item.jenis_kemampuan] = {
          jenis_kemampuan: item.jenis_kemampuan,
          sangat_baik: item.persen_sangat_baik || 0,
          baik: item.persen_baik || 0,
          cukup: item.persen_cukup || 0,
          kurang: item.persen_kurang || 0,
          data: item
        };
      }
    });

    const rows = Object.values(grouped);
    
    // Tambahkan baris total
    if (rows.length > 0) {
      const fieldSum = (field) => rows.reduce((acc, x) => acc + (parseFloat(x[field]) || 0), 0);
      rows.push({
        jenis_kemampuan: "Rata-rata",
        sangat_baik: (fieldSum("sangat_baik") / rows.length).toFixed(2),
        baik: (fieldSum("baik") / rows.length).toFixed(2),
        cukup: (fieldSum("cukup") / rows.length).toFixed(2),
        kurang: (fieldSum("kurang") / rows.length).toFixed(2),
        data: null
      });
    }

    return rows;
  }, [data, selectedTahun, showDeleted]);

  const handleAddClick = () => {
    setFormState({
      id_unit_prodi: authUser?.unit || "",
      id_tahun: selectedTahun || "",
      jenis_kemampuan: "",
      persen_sangat_baik: "",
      persen_baik: "",
      persen_cukup: "",
      persen_kurang: ""
    });
    setEditing(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item) => {
    setFormState({
      id_unit_prodi: item.data.id_unit_prodi,
      id_tahun: item.data.id_tahun,
      jenis_kemampuan: item.data.jenis_kemampuan,
      persen_sangat_baik: item.data.persen_sangat_baik,
      persen_baik: item.data.persen_baik,
      persen_cukup: item.data.persen_cukup,
      persen_kurang: item.data.persen_kurang
    });
    setEditing(item.data);
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
        await apiFetch(`/tabel2b6-kepuasan-pengguna/${item.data.id}`, {method: "DELETE"});
        Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  const handleRestoreClick = async (item) => {
    const result = await Swal.fire({
      title: "Konfirmasi Pulihkan",
      text: "Apakah Anda yakin ingin memulihkan data ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, Pulihkan!",
      cancelButtonText: "Batal"
    });
    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2b6-kepuasan-pengguna/${item.data.id}/restore`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        Swal.fire("Berhasil!", "Data berhasil dipulihkan", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal memulihkan data", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi total persentase tidak lebih dari 100%
    const totalPersen = parseFloat((parseFloat(formState.persen_sangat_baik || 0) + 
                            parseFloat(formState.persen_baik || 0) + 
                            parseFloat(formState.persen_cukup || 0) + 
                            parseFloat(formState.persen_kurang || 0)).toFixed(2));
    
    if (totalPersen > 100) {
      Swal.fire("Error", `Total persentase (${totalPersen}%) tidak boleh lebih dari 100%`, "error");
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formState,
        id_unit_prodi: parseInt(formState.id_unit_prodi),
        id_tahun: parseInt(formState.id_tahun),
        persen_sangat_baik: parseFloat(formState.persen_sangat_baik) || 0,
        persen_baik: parseFloat(formState.persen_baik) || 0,
        persen_cukup: parseFloat(formState.persen_cukup) || 0,
        persen_kurang: parseFloat(formState.persen_kurang) || 0,
      };

      if (editing) {
        await apiFetch(`/tabel2b6-kepuasan-pengguna/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil diperbarui", "success");
      } else {
        await apiFetch("/tabel2b6-kepuasan-pengguna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil ditambahkan", "success");
      }
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire("Error", error.message || "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jenis Kemampuan</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Sangat Baik (%)</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Baik (%)</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Cukup (%)</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kurang (%)</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <span className="ml-2">Memuat data...</span>
                </div>
              </td>
            </tr>
          ) : tableData.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            tableData.map((row, idx) => (
              <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${row.data?.deleted_at ? "bg-red-100 text-red-800" : ""}`}>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium text-center">{idx + 1}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 font-medium">{row.jenis_kemampuan}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.sangat_baik}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.baik}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.cukup}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.kurang}</td>
                <td className="px-6 py-4 text-center border border-slate-200">
                  {row.data && (
                    <div className="flex items-center justify-center gap-2">
                      {row.data.deleted_at ? (
                        // Untuk data yang dihapus, tampilkan tombol Pulihkan
                        canUpdate && (
                          <button onClick={() => handleRestoreClick(row)} className="font-medium text-green-600 hover:underline">
                            Pulihkan
                          </button>
                        )
                      ) : (
                        // Untuk data aktif, tampilkan Edit dan Hapus
                        <>
                          {canUpdate && <button onClick={() => handleEditClick(row)} className="font-medium text-[#0384d6] hover:underline">Edit</button>}
                          {canDelete && <button onClick={() => handleDeleteClick(row)} className="font-medium text-red-600 hover:underline">Hapus</button>}
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

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
        {availableYears.map(year => (
          <option key={year.id} value={year.id} className="text-slate-700">{year.tahun}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-10">
      {mapsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-600">Memuat data...</div>
        </div>
      )}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Tabel 2.B.6 Kepuasan Pengguna Lulusan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Data kepuasan pengguna terhadap kemampuan lulusan
        </p>
      </header>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector />
          {canDelete && (
            <button
              onClick={() => setShowDeleted(prev => !prev)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showDeleted ? "bg-[#0384d6] text-white" : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"}`}
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
      {renderTable()}
      
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white sticky top-0">
              <h3 className="text-xl font-bold">{editing ? "Edit Data Kepuasan Pengguna" : "Tambah Data Kepuasan Pengguna"}</h3>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data kepuasan pengguna terhadap kemampuan lulusan</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={e => setFormState({ ...formState, id_unit_prodi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Unit Prodi...</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Akademik <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_tahun}
                      onChange={e => setFormState({ ...formState, id_tahun: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Tahun...</option>
                      {availableYears.map(year => (
                        <option key={year.id} value={year.id}>{year.tahun}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Jenis Kemampuan <span className="text-red-500">*</span></label>
                    <select
                      value={formState.jenis_kemampuan}
                      onChange={e => setFormState({ ...formState, jenis_kemampuan: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                      disabled={!!editing}
                    >
                      <option value="">Pilih Jenis Kemampuan...</option>
                      {jenisKemampuanList.map(jenis => (
                        <option key={jenis} value={jenis}>{jenis}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Sangat Baik (%) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formState.persen_sangat_baik}
                      onChange={e => setFormState({ ...formState, persen_sangat_baik: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Baik (%) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formState.persen_baik}
                      onChange={e => setFormState({ ...formState, persen_baik: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Cukup (%) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formState.persen_cukup}
                      onChange={e => setFormState({ ...formState, persen_cukup: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Kurang (%) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formState.persen_kurang}
                      onChange={e => setFormState({ ...formState, persen_kurang: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Catatan:</strong> Total persentase tidak boleh melebihi 100%. 
                    Saat ini total: {((parseFloat(formState.persen_sangat_baik || 0) + 
                                       parseFloat(formState.persen_baik || 0) + 
                                       parseFloat(formState.persen_cukup || 0) + 
                                       parseFloat(formState.persen_kurang || 0)).toFixed(2))}%
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white" disabled={saving}>{saving ? "Menyimpan..." : (editing ? "Perbarui" : "Simpan")}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    id_tahun: "",
    jenis_kemampuan: "",
    persen_sangat_baik: "",
    persen_baik: "",
    persen_cukup: "",
    persen_kurang: "",
    rencana_tindak_lanjut: ""
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

  const availableUnits = useMemo(() => {
    const allUnits = Object.values(maps?.units || {}).map(u => ({ id: u.id_unit || u.id, nama: u.nama_unit || u.nama }));
    const onlyTIMI = allUnits.filter(u => {
      const id = Number(u.id);
      const name = String(u.nama || "");
      return id === 4 || id === 5 || /Teknik Informatika|Prodi TI|\bTI\b/i.test(name) || /Manajemen Informatika|Prodi MI|\bMI\b/i.test(name);
    });
    return onlyTIMI.sort((a, b) => String(a.nama).localeCompare(String(b.nama)));
  }, [maps?.units]);

  const canCreate = roleCan(role, tableKey, "C");
  const canUpdate = roleCan(role, tableKey, "U");
  const canDelete = roleCan(role, tableKey, "D");

  const fetchData = useCallback(async () => {
    // Jangan fetch jika selectedTahun atau selectedUnit belum di-set
    if (!selectedTahun || !selectedUnit) {
      console.log("Tabel2B6 - Skip fetch, waiting for filters:", { selectedTahun, selectedUnit });
      return;
    }

    try {
      setLoading(true);
      let params = `?id_tahun=${selectedTahun}&id_unit_prodi=${selectedUnit}`;
      if (showDeleted) params += "&include_deleted=1";

      const url = `/tabel2b6-kepuasan-pengguna${params}`;
      console.log("Tabel2B6 - Fetching data:", {
        url,
        selectedTahun,
        selectedUnit,
        showDeleted
      });

      const result = await apiFetch(url);
      
      console.log("Tabel2B6 - API Response received:", {
        hasData: !!result?.data,
        dataLength: Array.isArray(result?.data) ? result.data.length : 0,
        hasStatistik: !!result?.statistik,
        result
      });
      
      // Handle response - bisa berupa array langsung atau object dengan property data
      let rows = [];
      if (Array.isArray(result)) {
        rows = result;
      } else if (Array.isArray(result?.data)) {
        rows = result.data;
      } else if (result?.data) {
        rows = [result.data];
      }
      
      setData(rows);
      setStatistik(result?.statistik || null);
    } catch (error) {
      console.error("Tabel2B6 - Error fetching data:", {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      // Tampilkan error yang lebih detail
      const errorMessage = error.message || "Gagal mengambil data dari server";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        footer: "Periksa console browser untuk detail lebih lanjut"
      });
      
      setData([]);
      setStatistik(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTahun, selectedUnit, showDeleted]);

  // Set selectedTahun saat availableYears tersedia
  useEffect(() => {
    if (!selectedTahun && availableYears.length > 0) {
      const nowYear = new Date().getFullYear();
      const found = availableYears.find(y => (`${y.tahun}`.startsWith(nowYear.toString())));
      if (found) {
        console.log("Tabel2B6 - Auto-selecting tahun:", found.id);
        setSelectedTahun(found.id);
      } else {
        console.log("Tabel2B6 - Auto-selecting last tahun:", availableYears[availableYears.length - 1].id);
        setSelectedTahun(availableYears[availableYears.length - 1].id);
      }
    }
  }, [availableYears, selectedTahun]);

  // Set selectedUnit saat availableUnits tersedia
  useEffect(() => {
    if (!selectedUnit && Array.isArray(availableUnits) && availableUnits.length > 0) {
      console.log("Tabel2B6 - Auto-selecting unit:", availableUnits[0].id);
      setSelectedUnit(parseInt(availableUnits[0].id));
    }
  }, [availableUnits, selectedUnit]);

  // Fetch data saat filter berubah (pastikan kedua filter sudah ter-set)
  useEffect(() => { 
    if (selectedTahun && selectedUnit) {
      fetchData();
    }
  }, [selectedTahun, selectedUnit, showDeleted, fetchData]);

  // Transform data untuk tampilan tabel
  const tableData = useMemo(() => {
    if (!selectedTahun) return [];

    // Pastikan hanya tahun terpilih yang ditampilkan walau API mengembalikan lebih banyak
    const filteredByYear = data.filter(d => parseInt(d.id_tahun) === parseInt(selectedTahun));
    const filteredByUnit = selectedUnit ? filteredByYear.filter(d => parseInt(d.id_unit_prodi) === parseInt(selectedUnit)) : filteredByYear;
    const source = showDeleted ? filteredByUnit.filter(d => d.deleted_at) : filteredByUnit.filter(d => !d.deleted_at);
    const byJenis = new Map();
    for (const row of source) {
      const key = String(row.jenis_kemampuan || '').toLowerCase();
      // Ambil yang pertama (seharusnya unik per tahun/unit)
      if (!byJenis.has(key)) byJenis.set(key, row);
    }

    return jenisKemampuanList.map((label) => {
      const item = byJenis.get(label.toLowerCase());
      return {
        jenis_kemampuan: label,
        sangat_baik: item?.persen_sangat_baik ?? null,
        baik: item?.persen_baik ?? null,
        cukup: item?.persen_cukup ?? null,
        kurang: item?.persen_kurang ?? null,
        data: item || null,
      };
    });
  }, [data, selectedTahun, selectedUnit, showDeleted]);

  // Statistik terpilih (backend bisa kirim object atau array)
  const statData = useMemo(() => {
    if (!selectedTahun || !selectedUnit) return null;
    if (!statistik) return null;
    if (Array.isArray(statistik)) {
      return statistik.find(s => parseInt(s?.unit_prodi) === parseInt(selectedUnit) && parseInt(s?.tahun_akademik) === parseInt(selectedTahun)) || statistik[0] || null;
    }
    return statistik;
  }, [statistik, selectedTahun, selectedUnit]);

  // Helper untuk nama prodi dari maps
  const getUnitName = (id) => {
    return maps?.units?.[id]?.nama || maps?.units?.[id]?.nama_unit || id || "";
  };

  const handleAddClick = () => {
    if (!selectedUnit) {
      Swal.fire("Pilih Prodi", "Silakan pilih Prodi pada filter sebelum menambah data.", "info");
      return;
    }
    setFormState({
      id_unit_prodi: selectedUnit,
      id_tahun: selectedTahun || "",
      jenis_kemampuan: "",
      persen_sangat_baik: "",
      persen_baik: "",
      persen_cukup: "",
      persen_kurang: "",
      rencana_tindak_lanjut: ""
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
      persen_kurang: item.data.persen_kurang,
      rencana_tindak_lanjut: item.data.rencana_tindak_lanjut || ""
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
      if (!selectedUnit) {
        Swal.fire("Pilih Prodi", "Silakan pilih Prodi pada filter terlebih dahulu.", "error");
        setSaving(false);
        return;
      }

      const submitData = {
        ...formState,
        id_unit_prodi: parseInt(selectedUnit),
        id_tahun: parseInt(formState.id_tahun),
        persen_sangat_baik: parseFloat(formState.persen_sangat_baik) || 0,
        persen_baik: parseFloat(formState.persen_baik) || 0,
        persen_cukup: parseFloat(formState.persen_cukup) || 0,
        persen_kurang: parseFloat(formState.persen_kurang) || 0,
        ...(formState.rencana_tindak_lanjut ? { rencana_tindak_lanjut: String(formState.rencana_tindak_lanjut).trim() } : {}),
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
        <thead>
          <tr className="sticky top-0 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20" rowSpan={2}>No</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20" rowSpan={2}>Jenis Kemampuan</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20" colSpan={4}>Tingkat Kepuasan Pengguna (%)</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20" rowSpan={2}>Rencana Tindak Lanjut oleh UPPS/PS</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20" rowSpan={2}>Aksi</th>
          </tr>
          <tr className="sticky top-0 bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Sangat Baik</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Baik</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Cukup</th>
            <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kurang</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <span className="ml-2">Memuat data...</span>
                </div>
              </td>
            </tr>
          ) : tableData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          ) : (
            <>
            {tableData.map((row, idx) => (
              <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${row.data?.deleted_at ? "bg-red-100 text-red-800" : ""}`}>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium text-center">{idx + 1}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 font-medium">{row.jenis_kemampuan}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.sangat_baik ?? ""}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.baik ?? ""}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.cukup ?? ""}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.kurang ?? ""}</td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.data?.rencana_tindak_lanjut || ""}</td>
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
            ))}
            {/* Baris Jumlah (gabung kolom No + Jumlah) */}
            <tr className={tableData.length % 2 === 0 ? "bg-slate-50" : "bg-white"}>
              <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center" colSpan={2}>Jumlah</td>
              <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
              <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
              <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
              <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
              <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
              <td className="px-6 py-4 text-center border border-slate-300 bg-slate-100"></td>
            </tr>

            {/* Baris Statistik (dalam struktur tabel utama) */}
            <tr className={(tableData.length + 1) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
              <td className="px-6 py-4 text-slate-700 border border-slate-300" colSpan={2}>Jumlah alumni/lulusan dalam 3 tahun terakhir</td>
              <td className="px-6 py-4 text-slate-900 border border-slate-300 text-center font-semibold" colSpan={5}>{statData?.jumlah_alumni_3_tahun ?? ""}</td>
              <td className="px-6 py-4 text-center border border-slate-300"></td>
            </tr>
            <tr className={(tableData.length + 2) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
              <td className="px-6 py-4 text-slate-700 border border-slate-300" colSpan={2}>Jumlah pengguna lulusan sebagai responden</td>
              <td className="px-6 py-4 text-slate-900 border border-slate-300 text-center font-semibold" colSpan={5}>{statData?.jumlah_responden ?? ""}</td>
              <td className="px-6 py-4 text-center border border-slate-300"></td>
            </tr>
            <tr className={(tableData.length + 3) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
              <td className="px-6 py-4 text-slate-700 border border-slate-300" colSpan={2}>Jumlah mahasiswa aktif pada tahun TS</td>
              <td className="px-6 py-4 text-slate-900 border border-slate-300 text-center font-semibold" colSpan={5}>{statData?.jumlah_mahasiswa_aktif_ts ?? ""}</td>
              <td className="px-6 py-4 text-center border border-slate-300"></td>
            </tr>
            </>
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

  const UnitSelector = () => (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-prodi" className="text-sm font-medium text-slate-700">Prodi:</label>
      <select
        id="filter-prodi"
        value={selectedUnit || ""}
        onChange={(e) => setSelectedUnit(e.target.value ? parseInt(e.target.value) : null)}
        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-64"
        disabled={loading}
      >
        {availableUnits.map(u => (
          <option key={u.id} value={u.id} className="text-slate-700">{u.nama}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-10">
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
          <UnitSelector />
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
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi</label>
                    <input
                      type="text"
                      value={getUnitName(selectedUnit) || "(Pilih di filter atas)"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-slate-700 bg-slate-50"
                    />
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">Rencana Tindak Lanjut oleh UPPS/PS</label>
                    <textarea
                      value={formState.rencana_tindak_lanjut}
                      onChange={e => setFormState({ ...formState, rencana_tindak_lanjut: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      rows={3}
                      placeholder="Opsional"
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


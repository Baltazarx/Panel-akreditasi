"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

export default function Tabel2B6({ role }) {
  const { authUser } = useAuth();
  const { maps, loading: mapsLoading } = useMaps(true);
  const tableKey = "tabel_2b6_kepuasan_pengguna";
  
  // Cek apakah user adalah role kemahasiswaan
  const userRole = authUser?.role || role;
  const isKemahasiswaan = userRole?.toLowerCase() === 'kemahasiswaan';
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
  
  const [data, setData] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container') && !event.target.closest('.fixed')) {
        setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdownId]);

  // Close dropdown when modal opens
  useEffect(() => {
    if (showAddModal) {
      setOpenDropdownId(null);
    }
  }, [showAddModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showAddModal]);
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

  // Pastikan showDeleted selalu false untuk role kemahasiswaan
  useEffect(() => {
    if (isKemahasiswaan && showDeleted) {
      setShowDeleted(false);
    }
  }, [isKemahasiswaan, showDeleted]);

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
    // Untuk role kemahasiswaan, fetch data meskipun selectedUnit tidak ada
    // Untuk role lain, jangan fetch jika selectedTahun atau selectedUnit belum di-set
    if (!selectedTahun || (!selectedUnit && !isKemahasiswaan)) {
      console.log("Tabel2B6 - Skip fetch, waiting for filters:", { selectedTahun, selectedUnit, isKemahasiswaan });
      return;
    }

    try {
      setLoading(true);
      let params = `?id_tahun=${selectedTahun}`;
      // Untuk role kemahasiswaan, jangan kirim filter id_unit_prodi (bisa lihat semua data)
      if (selectedUnit && !isKemahasiswaan) {
        params += `&id_unit_prodi=${selectedUnit}`;
      }
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
  }, [selectedTahun, selectedUnit, showDeleted, isKemahasiswaan]);

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

  // Set selectedUnit: jika user prodi, gunakan prodi mereka; jika superadmin, pilih pertama
  // Untuk role kemahasiswaan, tidak perlu set selectedUnit (bisa lihat semua data)
  useEffect(() => {
    if (!selectedUnit && !isKemahasiswaan) {
      if (!isSuperAdmin && userProdiId) {
        // User prodi: gunakan prodi mereka
        console.log("Tabel2B6 - Auto-selecting user prodi:", userProdiId);
        setSelectedUnit(parseInt(userProdiId));
      } else if (isSuperAdmin && Array.isArray(availableUnits) && availableUnits.length > 0) {
        // Superadmin: pilih prodi pertama
        console.log("Tabel2B6 - Auto-selecting unit:", availableUnits[0].id);
        setSelectedUnit(parseInt(availableUnits[0].id));
      }
    }
  }, [selectedUnit, isSuperAdmin, userProdiId, availableUnits, isKemahasiswaan]);

  // Fetch data saat filter berubah
  // Untuk role kemahasiswaan, fetch data meskipun selectedUnit tidak ada
  useEffect(() => { 
    if (isKemahasiswaan && selectedTahun) {
      fetchData();
    } else if (selectedTahun && selectedUnit) {
      fetchData();
    }
  }, [selectedTahun, selectedUnit, showDeleted, fetchData, isKemahasiswaan]);

  // Helper function untuk transform data
  const transformTableData = useCallback((sourceData) => {
    if (!selectedTahun) return [];

    // Pastikan hanya tahun terpilih yang ditampilkan walau API mengembalikan lebih banyak
    const filteredByYear = sourceData.filter(d => parseInt(d.id_tahun) === parseInt(selectedTahun));
    // Untuk role kemahasiswaan, jangan filter berdasarkan selectedUnit (bisa lihat semua)
    const filteredByUnit = (selectedUnit && !isKemahasiswaan) ? filteredByYear.filter(d => parseInt(d.id_unit_prodi) === parseInt(selectedUnit)) : filteredByYear;
    const byJenis = new Map();
    for (const row of filteredByUnit) {
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
  }, [selectedTahun, selectedUnit, isKemahasiswaan]);

  // Data untuk tabel aktif (tidak dihapus)
  const tableDataActive = useMemo(() => {
    const activeData = data.filter(d => !d.deleted_at);
    return transformTableData(activeData);
  }, [data, selectedTahun, selectedUnit, isKemahasiswaan]);

  // Data untuk tabel terhapus
  const tableDataDeleted = useMemo(() => {
    const deletedData = data.filter(d => d.deleted_at);
    return transformTableData(deletedData);
  }, [data, selectedTahun, selectedUnit, isKemahasiswaan]);

  // Hitung total untuk baris Jumlah (jumlahkan lalu bagi 7)
  const jumlahDataActive = useMemo(() => {
    const totalSangatBaik = tableDataActive.reduce((sum, row) => {
      const val = parseFloat(row.sangat_baik) || 0;
      return sum + val;
    }, 0);
    
    const totalBaik = tableDataActive.reduce((sum, row) => {
      const val = parseFloat(row.baik) || 0;
      return sum + val;
    }, 0);
    
    const totalCukup = tableDataActive.reduce((sum, row) => {
      const val = parseFloat(row.cukup) || 0;
      return sum + val;
    }, 0);
    
    const totalKurang = tableDataActive.reduce((sum, row) => {
      const val = parseFloat(row.kurang) || 0;
      return sum + val;
    }, 0);
    
    return {
      sangat_baik: totalSangatBaik > 0 ? (totalSangatBaik / 7).toFixed(2) : "",
      baik: totalBaik > 0 ? (totalBaik / 7).toFixed(2) : "",
      cukup: totalCukup > 0 ? (totalCukup / 7).toFixed(2) : "",
      kurang: totalKurang > 0 ? (totalKurang / 7).toFixed(2) : ""
    };
  }, [tableDataActive]);

  const jumlahDataDeleted = useMemo(() => {
    const totalSangatBaik = tableDataDeleted.reduce((sum, row) => {
      const val = parseFloat(row.sangat_baik) || 0;
      return sum + val;
    }, 0);
    
    const totalBaik = tableDataDeleted.reduce((sum, row) => {
      const val = parseFloat(row.baik) || 0;
      return sum + val;
    }, 0);
    
    const totalCukup = tableDataDeleted.reduce((sum, row) => {
      const val = parseFloat(row.cukup) || 0;
      return sum + val;
    }, 0);
    
    const totalKurang = tableDataDeleted.reduce((sum, row) => {
      const val = parseFloat(row.kurang) || 0;
      return sum + val;
    }, 0);
    
    return {
      sangat_baik: totalSangatBaik > 0 ? (totalSangatBaik / 7).toFixed(2) : "",
      baik: totalBaik > 0 ? (totalBaik / 7).toFixed(2) : "",
      cukup: totalCukup > 0 ? (totalCukup / 7).toFixed(2) : "",
      kurang: totalKurang > 0 ? (totalKurang / 7).toFixed(2) : ""
    };
  }, [tableDataDeleted]);

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
        setLoading(true);
        const idField = getIdField(item.data);
        await apiFetch(`/tabel2b6-kepuasan-pengguna/${item.data?.[idField]}`, {method: "DELETE"});
        Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const doRestore = (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const idField = getIdField(row.data);
          await apiFetch(`/tabel2b6-kepuasan-pengguna/${row.data?.[idField]}/restore`, { 
            method: "POST"
          });
          fetchData();
          Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const doHardDelete = (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const idField = getIdField(row.data);
          await apiFetch(`/tabel2b6-kepuasan-pengguna/${row.data?.[idField]}/hard-delete`, { method: "DELETE" });
          fetchData();
          Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
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

  // Render table function untuk data aktif
  const renderTableActive = () => {
    const currentData = tableDataActive;
    const currentJumlah = jumlahDataActive;
    
    return (
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
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            ) : (
              <>
              {currentData.map((row, idx) => (
                <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium text-center">{idx + 1}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 font-medium">{row.jenis_kemampuan}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.sangat_baik ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.baik ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.cukup ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.kurang ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.data?.rencana_tindak_lanjut || ""}</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    {row.data && (
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : idx;
                            if (openDropdownId !== rowId) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownWidth = 192;
                              setDropdownPosition({
                                top: rect.bottom + 4,
                                left: Math.max(8, rect.right - dropdownWidth)
                              });
                              setOpenDropdownId(rowId);
                            } else {
                              setOpenDropdownId(null);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                          aria-label="Menu aksi"
                          aria-expanded={openDropdownId === (getIdField(row.data) ? row.data[getIdField(row.data)] : idx)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {/* Baris Jumlah */}
              <tr className={currentData.length % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center" colSpan={2}>Jumlah</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.sangat_baik}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.baik}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.cukup}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.kurang}</td>
                <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
                <td className="px-6 py-4 text-center border border-slate-300 bg-slate-100"></td>
              </tr>

              {/* Baris Statistik */}
              <tr className={(currentData.length + 1) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                <td className="px-6 py-4 text-slate-700 border border-slate-300" colSpan={2}>Jumlah alumni/lulusan dalam 3 tahun terakhir</td>
                <td className="px-6 py-4 text-slate-900 border border-slate-300 text-center font-semibold" colSpan={5}>{statData?.jumlah_alumni_3_tahun ?? ""}</td>
                <td className="px-6 py-4 text-center border border-slate-300"></td>
              </tr>
              <tr className={(currentData.length + 2) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                <td className="px-6 py-4 text-slate-700 border border-slate-300" colSpan={2}>Jumlah pengguna lulusan sebagai responden</td>
                <td className="px-6 py-4 text-slate-900 border border-slate-300 text-center font-semibold" colSpan={5}>{statData?.jumlah_responden ?? ""}</td>
                <td className="px-6 py-4 text-center border border-slate-300"></td>
              </tr>
              <tr className={(currentData.length + 3) % 2 === 0 ? "bg-slate-50" : "bg-white"}>
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
  };

  // Render table function untuk data terhapus
  const renderTableDeleted = () => {
    const currentData = tableDataDeleted;
    const currentJumlah = jumlahDataDeleted;
    
    return (
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
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang dihapus atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            ) : (
              <>
              {currentData.map((row, idx) => (
                <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium text-center">{idx + 1}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 font-medium">{row.jenis_kemampuan}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.sangat_baik ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.baik ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.cukup ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">{row.kurang ?? ""}</td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.data?.rencana_tindak_lanjut || ""}</td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    {row.data && (
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : idx;
                            if (openDropdownId !== rowId) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownWidth = 192;
                              setDropdownPosition({
                                top: rect.bottom + 4,
                                left: Math.max(8, rect.right - dropdownWidth)
                              });
                              setOpenDropdownId(rowId);
                            } else {
                              setOpenDropdownId(null);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                          aria-label="Menu aksi"
                          aria-expanded={openDropdownId === (getIdField(row.data) ? row.data[getIdField(row.data)] : idx)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {/* Baris Jumlah */}
              <tr className={currentData.length % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center" colSpan={2}>Jumlah</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.sangat_baik}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.baik}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.cukup}</td>
                <td className="px-6 py-4 text-slate-800 border border-slate-300 bg-slate-100 font-semibold text-center">{currentJumlah.kurang}</td>
                <td className="px-6 py-4 border border-slate-300 bg-slate-100"></td>
                <td className="px-6 py-4 text-center border border-slate-300 bg-slate-100"></td>
              </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

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
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Data kepuasan pengguna terhadap kemampuan lulusan
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">
                {showDeleted ? tableDataDeleted.length : tableDataActive.length}
              </span>
            </span>
          )}
        </div>
      </header>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector />
          {isSuperAdmin && <UnitSelector />}
          {canDelete && !isKemahasiswaan && (
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowDeleted(false)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  !showDeleted
                    ? "bg-white text-[#0384d6] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-label="Tampilkan data aktif"
              >
                Data
              </button>
              <button
                onClick={() => setShowDeleted(true)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  showDeleted
                    ? "bg-white text-[#0384d6] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-label="Tampilkan data terhapus"
              >
                Data Terhapus
              </button>
            </div>
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
      {showDeleted ? renderTableDeleted() : renderTableActive()}

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentTableData = showDeleted ? tableDataDeleted : tableDataActive;
        const currentRow = currentTableData.find((row, idx) => {
          if (!row.data) return false;
          const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : idx;
          return rowId === openDropdownId;
        });
        if (!currentRow || !currentRow.data) return null;
        
        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.jenis_kemampuan || 'kepuasan pengguna'}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.jenis_kemampuan || 'kepuasan pengguna'}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${currentRow.jenis_kemampuan || 'kepuasan pengguna'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
            {showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${currentRow.jenis_kemampuan || 'kepuasan pengguna'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}
      
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
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      <span className="relative z-10">Batal</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                  <button 
                      type="submit" 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={saving}
                  >
                      <span className="relative z-10">{saving ? "Menyimpan..." : (editing ? "Perbarui" : "Simpan")}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
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


"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiCalendar, FiBriefcase, FiShield, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

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
  
  // Dropdown states for filters and forms
  const [openYearFilterDropdown, setOpenYearFilterDropdown] = useState(false);
  const [openUnitFilterDropdown, setOpenUnitFilterDropdown] = useState(false);
  const [openFormTahunDropdown, setOpenFormTahunDropdown] = useState(false);
  const [openFormJenisDropdown, setOpenFormJenisDropdown] = useState(false);

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
    // Close form dropdowns when modal closes
    if (!showAddModal) {
      setOpenFormTahunDropdown(false);
      setOpenFormJenisDropdown(false);
    }
  }, [showAddModal]);

  // Close filter dropdowns when values change
  useEffect(() => {
    setOpenYearFilterDropdown(false);
  }, [selectedTahun]);

  useEffect(() => {
    setOpenUnitFilterDropdown(false);
  }, [selectedUnit]);

  // Close filter and form dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openYearFilterDropdown && !event.target.closest('.year-filter-dropdown-container') && !event.target.closest('.year-filter-dropdown-menu')) {
        setOpenYearFilterDropdown(false);
      }
      if (openUnitFilterDropdown && !event.target.closest('.unit-filter-dropdown-container') && !event.target.closest('.unit-filter-dropdown-menu')) {
        setOpenUnitFilterDropdown(false);
      }
      if (openFormTahunDropdown && !event.target.closest('.form-tahun-dropdown-container') && !event.target.closest('.form-tahun-dropdown-menu')) {
        setOpenFormTahunDropdown(false);
      }
      if (openFormJenisDropdown && !event.target.closest('.form-jenis-dropdown-container') && !event.target.closest('.form-jenis-dropdown-menu')) {
        setOpenFormJenisDropdown(false);
      }
    };

    if (openYearFilterDropdown || openUnitFilterDropdown || openFormTahunDropdown || openFormJenisDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openYearFilterDropdown, openUnitFilterDropdown, openFormTahunDropdown, openFormJenisDropdown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
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

  // Helper function untuk sorting data berdasarkan terbaru
  const sortRowsByLatest = useCallback((rowsArray) => {
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
      
      // Fallback ke ID terbesar jika tidak ada timestamp
      const idFieldA = getIdField(a);
      const idFieldB = getIdField(b);
      return (b[idFieldB] || 0) - (a[idFieldA] || 0);
    });
  }, []);

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
      
      const sortedRows = sortRowsByLatest(rows);
      setData(sortedRows);
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
  }, [selectedTahun, selectedUnit, showDeleted, isKemahasiswaan, sortRowsByLatest]);

  // Set selectedTahun saat availableYears tersedia
  useEffect(() => {
    if (!selectedTahun && availableYears.length > 0) {
      // Default ke tahun 2024/2025 jika ada, jika tidak ada fallback ke tahun terakhir
      // Prioritas: cari yang mengandung "2024/2025" terlebih dahulu
      let tahun2024 = availableYears.find(y => {
        const yearText = String(y.tahun || "").toLowerCase();
        const yearId = String(y.id || "");
        return (yearText.includes("2024/2025") || yearId.includes("2024/2025"));
      });
      
      // Jika tidak ketemu "2024/2025", cari yang mengandung "2024" atau "2025"
      if (!tahun2024) {
        tahun2024 = availableYears.find(y => {
          const yearText = String(y.tahun || "").toLowerCase();
          const yearId = String(y.id || "");
          return yearText.includes("2024") || yearText.includes("2025") || 
                 yearId.includes("2024") || yearId.includes("2025");
        });
      }
      
      if (tahun2024?.id) {
        console.log("Tabel2B6 - Auto-selecting tahun 2024/2025:", tahun2024.id);
        setSelectedTahun(parseInt(tahun2024.id));
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
    if (!selectedTahun) {
      Swal.fire("Pilih Tahun", "Silakan pilih Tahun pada filter sebelum menambah data.", "info");
      return;
    }
    if (!selectedUnit) {
      Swal.fire("Pilih Prodi", "Silakan pilih Prodi pada filter sebelum menambah data.", "info");
      return;
    }
    setFormState({
      id_unit_prodi: selectedUnit,
      id_tahun: selectedTahun, // Selalu gunakan selectedTahun dari filter
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
    setOpenFormTahunDropdown(false);
    setOpenFormJenisDropdown(false);
    
    // Validasi tahun harus dipilih di filter
    if (!selectedTahun) {
      Swal.fire("Error", "Silakan pilih Tahun pada filter terlebih dahulu", "error");
      return;
    }
    
    // Validasi jenis kemampuan harus diisi
    if (!formState.jenis_kemampuan || formState.jenis_kemampuan.trim() === "") {
      Swal.fire("Error", "Jenis Kemampuan harus diisi", "error");
      return;
    }
    
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
      if (!selectedTahun) {
        Swal.fire("Pilih Tahun", "Silakan pilih Tahun pada filter terlebih dahulu.", "error");
        setSaving(false);
        return;
      }
      if (!selectedUnit) {
        Swal.fire("Pilih Prodi", "Silakan pilih Prodi pada filter terlebih dahulu.", "error");
        setSaving(false);
        return;
      }

      // Pastikan id_tahun selalu menggunakan selectedTahun dari filter
      const submitData = {
        ...formState,
        id_unit_prodi: parseInt(selectedUnit),
        id_tahun: parseInt(selectedTahun), // Selalu gunakan selectedTahun dari filter
        jenis_kemampuan: formState.jenis_kemampuan.trim(),
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

  // Fungsi export Excel
  const handleExport = async () => {
    try {
      const currentData = showDeleted ? tableDataDeleted : tableDataActive;
      const currentJumlah = showDeleted ? jumlahDataDeleted : jumlahDataActive;
      const currentStatData = statData;
      
      if (!currentData || currentData.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];
      
      // Tambahkan header (merged header)
      const headerRow1 = ['No', 'Jenis Kemampuan', 'Tingkat Kepuasan Pengguna (%)', '', '', '', 'Rencana Tindak Lanjut oleh UPPS/PS'];
      exportData.push(headerRow1);
      const headerRow2 = ['', '', 'Sangat Baik', 'Baik', 'Cukup', 'Kurang', ''];
      exportData.push(headerRow2);
      
      // Tambahkan data rows
      currentData.forEach((row, idx) => {
        const rowData = [
          idx + 1,
          row.jenis_kemampuan || '',
          row.sangat_baik ?? '',
          row.baik ?? '',
          row.cukup ?? '',
          row.kurang ?? '',
          row.data?.rencana_tindak_lanjut || ''
        ];
        exportData.push(rowData);
      });
      
      // Tambahkan baris Jumlah
      exportData.push([
        '',
        'Jumlah',
        currentJumlah.sangat_baik || '',
        currentJumlah.baik || '',
        currentJumlah.cukup || '',
        currentJumlah.kurang || '',
        ''
      ]);
      
      // Tambahkan baris statistik
      exportData.push([
        '',
        'Jumlah alumni/lulusan dalam 3 tahun terakhir',
        currentStatData?.jumlah_alumni_3_tahun ?? '',
        '',
        '',
        '',
        ''
      ]);
      exportData.push([
        '',
        'Jumlah pengguna lulusan sebagai responden',
        currentStatData?.jumlah_responden ?? '',
        '',
        '',
        '',
        ''
      ]);
      exportData.push([
        '',
        'Jumlah mahasiswa aktif pada tahun TS',
        currentStatData?.jumlah_mahasiswa_aktif_ts ?? '',
        '',
        '',
        '',
        ''
      ]);

      // Buat workbook baru
      const wb = XLSX.utils.book_new();
      
      // Buat worksheet dari array data
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      
      // Merge cells untuk header
      ws['!merges'] = [
        { s: { r: 0, c: 2 }, e: { r: 0, c: 5 } } // Merge "Tingkat Kepuasan Pengguna (%)" header
      ];
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // No
        { wch: 35 },  // Jenis Kemampuan
        { wch: 15 },  // Sangat Baik
        { wch: 12 },  // Baik
        { wch: 12 },  // Cukup
        { wch: 12 },  // Kurang
        { wch: 50 }   // Rencana Tindak Lanjut
      ];
      ws['!cols'] = colWidths;
      
      // Tambahkan worksheet ke workbook
      const sheetName = showDeleted ? 'Data Terhapus' : 'Data Kepuasan Pengguna';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate file dan download
      const fileName = `Tabel_2B6_Kepuasan_Pengguna_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      
      // Fallback ke CSV jika xlsx gagal
      try {
        const currentData = showDeleted ? tableDataDeleted : tableDataActive;
        const currentJumlah = showDeleted ? jumlahDataDeleted : jumlahDataActive;
        const currentStatData = statData;
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };
        
        const csvRows = [
          ['No', 'Jenis Kemampuan', 'Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Rencana Tindak Lanjut'],
          ...currentData.map((row, idx) => [
            idx + 1,
            row.jenis_kemampuan || '',
            row.sangat_baik ?? '',
            row.baik ?? '',
            row.cukup ?? '',
            row.kurang ?? '',
            row.data?.rencana_tindak_lanjut || ''
          ]),
          ['', 'Jumlah', currentJumlah.sangat_baik || '', currentJumlah.baik || '', currentJumlah.cukup || '', currentJumlah.kurang || '', ''],
          ['', 'Jumlah alumni/lulusan dalam 3 tahun terakhir', currentStatData?.jumlah_alumni_3_tahun ?? '', '', '', '', ''],
          ['', 'Jumlah pengguna lulusan sebagai responden', currentStatData?.jumlah_responden ?? '', '', '', '', ''],
          ['', 'Jumlah mahasiswa aktif pada tahun TS', currentStatData?.jumlah_mahasiswa_aktif_ts ?? '', '', '', '', '']
        ].map(row => row.map(cell => escapeCsv(cell)).join(','));
        
        const csvContent = '\ufeff' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tabel_2B6_Kepuasan_Pengguna_${new Date().toISOString().split('T')[0]}.csv`;
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
      } catch (csvErr) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengekspor data',
          text: err.message || 'Terjadi kesalahan saat mengekspor data.'
        });
      }
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
      <label className="text-sm font-medium text-slate-700">Tahun:</label>
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
                    const found = availableYears.find((y) => Number(y.id) === Number(selectedTahun));
                    return found ? found.tahun : selectedTahun;
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
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <button
                  key={year.id}
                  type="button"
                  onClick={() => {
                    setSelectedTahun(parseInt(year.id));
                    setOpenYearFilterDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                    selectedTahun === parseInt(year.id)
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                  <span>{year.tahun}</span>
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
  );

  const UnitSelector = () => (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700">Prodi:</label>
      <div className="relative unit-filter-dropdown-container" style={{ minWidth: '200px' }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!loading) {
              setOpenUnitFilterDropdown(!openUnitFilterDropdown);
            }
          }}
          disabled={loading}
          className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
            selectedUnit 
              ? 'border-[#0384d6] bg-white text-black' 
              : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Pilih prodi"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
            <span className={`truncate ${selectedUnit ? 'text-black' : 'text-gray-500'}`}>
              {selectedUnit 
                ? (() => {
                    const found = availableUnits.find((u) => Number(u.id) === Number(selectedUnit));
                    return found ? found.nama : selectedUnit;
                  })()
                : "Pilih Prodi"}
            </span>
          </div>
          <FiChevronDown 
            className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              openUnitFilterDropdown ? 'rotate-180' : ''
            }`} 
            size={16} 
          />
        </button>
        {openUnitFilterDropdown && !loading && (
          <div 
            className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto unit-filter-dropdown-menu mt-1 w-full"
            style={{ minWidth: '200px' }}
          >
            {availableUnits.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUnit(parseInt(u.id));
                  setOpenUnitFilterDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                  selectedUnit === parseInt(u.id)
                    ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                    : 'text-gray-700'
                }`}
              >
                <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                <span>{u.nama}</span>
              </button>
            ))}
          </div>
        )}
      </div>
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={loading || (showDeleted ? !tableDataDeleted || tableDataDeleted.length === 0 : !tableDataActive || tableDataActive.length === 0)}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Export ke Excel"
          >
            <FiDownload size={18} />
            <span>Export Excel</span>
          </button>
          
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
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setOpenFormTahunDropdown(false);
              setOpenFormJenisDropdown(false);
              setShowAddModal(false);
              setEditing(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h3 className="text-xl font-bold">{editing ? "Edit Data Tingkat Kepuasan" : "Tambah Data Tingkat Kepuasan"}</h3>
              <p className="text-white/80 mt-1 text-sm">
                {editing 
                  ? "Edit data tingkat kepuasan pengguna untuk jenis kemampuan yang dipilih"
                  : `Pilih jenis kemampuan dan isi data tingkat kepuasan untuk tahun ${selectedTahun 
                      ? (() => {
                          const found = availableYears.find((y) => Number(y.id) === Number(selectedTahun));
                          return found ? found.tahun : selectedTahun;
                        })()
                      : 'yang dipilih'}`}
              </p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Akademik <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={selectedTahun 
                        ? (() => {
                            const found = availableYears.find((y) => Number(y.id) === Number(selectedTahun));
                            return found ? found.tahun : selectedTahun;
                          })()
                        : "(Pilih tahun di filter atas)"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-slate-700 bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Tahun mengikuti filter yang dipilih di atas</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pilih Jenis Kemampuan <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                      Pilih jenis kemampuan untuk menambah data tingkat kepuasan di tahun {selectedTahun 
                        ? (() => {
                            const found = availableYears.find((y) => Number(y.id) === Number(selectedTahun));
                            return found ? found.tahun : selectedTahun;
                          })()
                        : 'yang dipilih'}
                    </p>
                    <div className="relative form-jenis-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!editing) {
                            setOpenFormJenisDropdown(!openFormJenisDropdown);
                          }
                        }}
                        disabled={!!editing}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                          formState.jenis_kemampuan
                            ? 'border-[#0384d6] bg-white' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        } ${editing ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                        aria-label="Pilih jenis kemampuan"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.jenis_kemampuan ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.jenis_kemampuan || "-- Pilih Jenis Kemampuan --"}
                          </span>
                        </div>
                        <FiChevronDown 
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            openFormJenisDropdown ? 'rotate-180' : ''
                          }`} 
                          size={18} 
                        />
                      </button>
                      {openFormJenisDropdown && !editing && (
                        <div 
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-jenis-dropdown-menu mt-1 w-full"
                        >
                          {jenisKemampuanList.length > 0 ? (
                            jenisKemampuanList.map(jenis => {
                              // Cek apakah sudah ada data untuk jenis kemampuan ini di tahun yang dipilih
                              const existingData = data.find(d => 
                                !d.deleted_at &&
                                String(d.jenis_kemampuan).toLowerCase() === jenis.toLowerCase() &&
                                parseInt(d.id_tahun) === parseInt(selectedTahun) &&
                                parseInt(d.id_unit_prodi) === parseInt(selectedUnit)
                              );
                              
                              return (
                                <button
                                  key={jenis}
                                  type="button"
                                  onClick={() => {
                                    setFormState({...formState, jenis_kemampuan: jenis});
                                    setOpenFormJenisDropdown(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#eaf4ff] transition-colors ${
                                    formState.jenis_kemampuan === jenis
                                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                                    <span className="truncate">{jenis}</span>
                                  </div>
                                  {existingData && (
                                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                      (Sudah ada data)
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Tidak ada data jenis kemampuan
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {editing && (
                      <p className="mt-1 text-xs text-slate-500">Jenis Kemampuan tidak dapat diubah setelah data dibuat.</p>
                    )}
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
                      onClick={() => {
                        setOpenFormTahunDropdown(false);
                        setOpenFormJenisDropdown(false);
                        setShowAddModal(false);
                      }} 
                      className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      Batal
                  </button>
                  <button 
                      type="submit" 
                      className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={saving}
                  >
                      {saving ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        editing ? "Perbarui" : "Simpan"
                      )}
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


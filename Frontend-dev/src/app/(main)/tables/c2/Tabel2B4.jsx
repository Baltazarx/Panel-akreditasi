"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiChevronDown, FiCalendar, FiBriefcase, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

export default function Tabel2B4({ role }) {
  const { authUser } = useAuth();
  const { maps, loading: mapsLoading } = useMaps(true);
  const tableKey = "tabel_2b4_masa_tunggu";
  
  // Cek apakah user adalah role kemahasiswaan
  const userRole = authUser?.role || role;
  const isKemahasiswaan = userRole?.toLowerCase() === 'kemahasiswaan';
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
  
  const [data, setData] = useState([]);
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
  const [openFormUnitDropdown, setOpenFormUnitDropdown] = useState(false);
  const [openFormTahunDropdown, setOpenFormTahunDropdown] = useState(false);

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
    id_tahun_lulus: "",
    jumlah_lulusan: "",
    jumlah_terlacak: "",
    rata_rata_waktu_tunggu_bulan: ""
  });
  const [showDeleted, setShowDeleted] = useState(false);

  // Pastikan showDeleted selalu false untuk role kemahasiswaan
  useEffect(() => {
    if (isKemahasiswaan && showDeleted) {
      setShowDeleted(false);
    }
  }, [isKemahasiswaan, showDeleted]);

  const canCreate = roleCan(role, tableKey, "C");
  const canUpdate = roleCan(role, tableKey, "U");
  const canDelete = roleCan(role, tableKey, "D");

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

  // Filter prodi yang tersedia (hanya TI dan MI)
  const availableUnits = useMemo(() => {
    return [
      { id: 4, nama: "Teknik Informatika (TI)" },
      { id: 5, nama: "Manajemen Informatika (MI)" }
    ];
  }, []);

  // Set selectedUnit: jika user prodi, gunakan prodi mereka; jika superadmin, pilih pertama
  // Untuk role kemahasiswaan, tidak perlu set selectedUnit (bisa lihat semua data)
  useEffect(() => {
    if (!selectedUnit && !isKemahasiswaan) {
      if (!isSuperAdmin && userProdiId) {
        // User prodi: gunakan prodi mereka
        setSelectedUnit(parseInt(userProdiId));
      } else if (isSuperAdmin && availableUnits.length > 0) {
        // Superadmin: pilih prodi pertama
        setSelectedUnit(parseInt(availableUnits[0].id));
      }
    }
  }, [selectedUnit, isSuperAdmin, userProdiId, availableUnits, isKemahasiswaan]);

  // Fetch data - ambil semua data, filter di frontend untuk menampilkan TS-4 sampai TS
  const fetchData = async () => {
    try {
      setLoading(true);
      let params = showDeleted ? "?include_deleted=1" : "";
      // Untuk role kemahasiswaan, jangan kirim filter id_unit_prodi (bisa lihat semua data)
      if (selectedUnit && !isKemahasiswaan) {
        params += (params ? "&" : "?") + `id_unit_prodi=${selectedUnit}`;
      }
      console.log('Fetching Tabel2B4 data with params:', params);
      const result = await apiFetch(`/tabel2b4-masa-tunggu${params}`);
      console.log('Tabel2B4 data received:', result);
      const rowsArray = Array.isArray(result) ? result : [];
      const sortedData = sortRowsByLatest(rowsArray);
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Untuk role kemahasiswaan, fetch data meskipun selectedUnit tidak ada
    // Untuk role lain, fetch data hanya jika selectedUnit ada
    if (isKemahasiswaan || selectedUnit) {
      fetchData();
    }
  }, [showDeleted, selectedUnit, isKemahasiswaan]);

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
      setOpenFormUnitDropdown(false);
      setOpenFormTahunDropdown(false);
    }
  }, [showAddModal]);

  // Close filter dropdowns when values change
  useEffect(() => {
    setOpenYearFilterDropdown(false);
  }, [selectedTahun]);

  useEffect(() => {
    setOpenUnitFilterDropdown(false);
  }, [selectedUnit]);

  // Close filter dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openYearFilterDropdown && !event.target.closest('.year-filter-dropdown-container') && !event.target.closest('.year-filter-dropdown-menu')) {
        setOpenYearFilterDropdown(false);
      }
      if (openUnitFilterDropdown && !event.target.closest('.unit-filter-dropdown-container') && !event.target.closest('.unit-filter-dropdown-menu')) {
        setOpenUnitFilterDropdown(false);
      }
      if (openFormUnitDropdown && !event.target.closest('.form-unit-dropdown-container') && !event.target.closest('.form-unit-dropdown-menu')) {
        setOpenFormUnitDropdown(false);
      }
      if (openFormTahunDropdown && !event.target.closest('.form-tahun-dropdown-container') && !event.target.closest('.form-tahun-dropdown-menu')) {
        setOpenFormTahunDropdown(false);
      }
    };

    if (openYearFilterDropdown || openUnitFilterDropdown || openFormUnitDropdown || openFormTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openYearFilterDropdown, openUnitFilterDropdown, openFormUnitDropdown, openFormTahunDropdown]);

  // Filter tahun yang tersedia
  const availableYears = useMemo(() => {
    const years = Object.values(maps?.tahun || {}).map(year => ({
      id: year.id_tahun,
      tahun: year.tahun
    }));
    // Urutkan dari yang terkecil (2020) ke yang terbesar
    return years.sort((a, b) => a.id - b.id);
  }, [maps?.tahun]);

  // Data untuk tabel aktif (tidak dihapus)
  const tableDataActive = useMemo(() => {
    const activeData = data.filter(item => !item.deleted_at);
    // Gunakan selectedTahun sebagai referensi tahun untuk TS, jika tidak ada gunakan tahun saat ini
    const referenceYear = selectedTahun || new Date().getFullYear();
    const tsData = {};
    
    // Filter data berdasarkan tahun yang dipilih (tahun referensi dan 4 tahun sebelumnya) dan prodi
    let filteredData = selectedTahun 
      ? activeData.filter(item => {
          const tahunLulus = item.id_tahun_lulus || parseInt(item.tahun_lulus?.split('/')[0] || referenceYear);
          const tsKey = referenceYear - tahunLulus;
          return tsKey >= 0 && tsKey <= 4;
        })
      : activeData;
    
    // Filter berdasarkan prodi yang dipilih (kecuali untuk role kemahasiswaan yang bisa lihat semua)
    if (selectedUnit && !isKemahasiswaan) {
      filteredData = filteredData.filter(item => parseInt(item.id_unit_prodi) === parseInt(selectedUnit));
    }
    
    // Group data by tahun
    filteredData.forEach(item => {
      const tahunLulus = item.id_tahun_lulus || parseInt(item.tahun_lulus?.split('/')[0] || referenceYear);
      const tsKey = referenceYear - tahunLulus;
      
      if (tsKey >= 0 && tsKey <= 4) {
        tsData[tsKey] = item;
      }
    });
    
    // Format untuk tabel - TS di urutan paling awal
    const rows = [];
    for (let i = 0; i <= 4; i++) {
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
    const totalLulusan = filteredData.reduce((sum, item) => sum + (item.jumlah_lulusan || 0), 0);
    const totalTerlacak = filteredData.reduce((sum, item) => sum + (item.jumlah_terlacak || 0), 0);
    const avgTunggu = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + (item.rata_rata_waktu_tunggu_bulan || 0), 0) / filteredData.length 
      : 0;
    
    rows.push({
      tahun_lulus: "Jumlah",
      jumlah_lulusan: totalLulusan,
      jumlah_terlacak: totalTerlacak,
      rata_rata_waktu_tunggu_bulan: Math.round(avgTunggu * 100) / 100,
      data: null
    });
    
    return rows;
  }, [data, selectedTahun, selectedUnit]);

  // Data untuk tabel terhapus
  const tableDataDeleted = useMemo(() => {
    const deletedData = data.filter(item => item.deleted_at);
    // Gunakan selectedTahun sebagai referensi tahun untuk TS, jika tidak ada gunakan tahun saat ini
    const referenceYear = selectedTahun || new Date().getFullYear();
    const tsData = {};
    
    // Filter data berdasarkan tahun yang dipilih (tahun referensi dan 4 tahun sebelumnya) dan prodi
    let filteredData = selectedTahun 
      ? deletedData.filter(item => {
          const tahunLulus = item.id_tahun_lulus || parseInt(item.tahun_lulus?.split('/')[0] || referenceYear);
          const tsKey = referenceYear - tahunLulus;
          return tsKey >= 0 && tsKey <= 4;
        })
      : deletedData;
    
    // Filter berdasarkan prodi yang dipilih (kecuali untuk role kemahasiswaan yang bisa lihat semua)
    if (selectedUnit && !isKemahasiswaan) {
      filteredData = filteredData.filter(item => parseInt(item.id_unit_prodi) === parseInt(selectedUnit));
    }
    
    // Group data by tahun
    filteredData.forEach(item => {
      const tahunLulus = item.id_tahun_lulus || parseInt(item.tahun_lulus?.split('/')[0] || referenceYear);
      const tsKey = referenceYear - tahunLulus;
      
      if (tsKey >= 0 && tsKey <= 4) {
        tsData[tsKey] = item;
      }
    });
    
    // Format untuk tabel - TS di urutan paling awal
    const rows = [];
    for (let i = 0; i <= 4; i++) {
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
    const totalLulusan = filteredData.reduce((sum, item) => sum + (item.jumlah_lulusan || 0), 0);
    const totalTerlacak = filteredData.reduce((sum, item) => sum + (item.jumlah_terlacak || 0), 0);
    const avgTunggu = filteredData.length > 0 
      ? filteredData.reduce((sum, item) => sum + (item.rata_rata_waktu_tunggu_bulan || 0), 0) / filteredData.length 
      : 0;
    
    rows.push({
      tahun_lulus: "Jumlah",
      jumlah_lulusan: totalLulusan,
      jumlah_terlacak: totalTerlacak,
      rata_rata_waktu_tunggu_bulan: Math.round(avgTunggu * 100) / 100,
      data: null
    });
    
    return rows;
  }, [data, selectedTahun, selectedUnit]);

  const handleAddClick = () => {
    setFormState({
      id_unit_prodi: selectedUnit || authUser?.unit || "",
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
        setLoading(true);
        const idField = getIdField(item);
        await apiFetch(`/tabel2b4-masa-tunggu/${item?.[idField]}`, {
          method: "DELETE"
        });
        Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
        fetchData();
      } catch (error) {
        console.error("Error deleting:", error);
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
          const idField = getIdField(row);
          await apiFetch(`/tabel2b4-masa-tunggu/${row?.[idField]}/restore`, { 
            method: "POST",
            body: JSON.stringify({
              restored_by: authUser?.name || authUser?.username || "Unknown User",
              restored_at: new Date().toISOString()
            })
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
          const idField = getIdField(row);
          await apiFetch(`/tabel2b4-masa-tunggu/${row?.[idField]}/hard-delete`, { method: "DELETE" });
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
    setOpenFormUnitDropdown(false);
    setOpenFormTahunDropdown(false);
    
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

  // Fungsi export Excel
  const handleExport = async () => {
    try {
      const currentData = showDeleted ? tableDataDeleted : tableDataActive;
      
      if (!currentData || currentData.length === 0) {
        throw new Error('Tidak ada data untuk diekspor.');
      }

      // Prepare data untuk export sesuai struktur tabel
      const exportData = [];
      
      // Tambahkan header
      const headers = [
        'Tahun Lulus',
        'Jumlah Lulusan',
        'Jumlah Lulusan yang Terlacak',
        'Rata-rata Waktu Tunggu (Bulan)'
      ];
      exportData.push(headers);
      
      // Tambahkan data rows
      currentData.forEach((row) => {
        const rowData = [
          row.tahun_lulus || '',
          row.jumlah_lulusan !== "" ? row.jumlah_lulusan : '-',
          row.jumlah_terlacak !== "" ? row.jumlah_terlacak : '-',
          row.rata_rata_waktu_tunggu_bulan !== "" ? row.rata_rata_waktu_tunggu_bulan : '-'
        ];
        exportData.push(rowData);
      });

      // Buat workbook baru
      const wb = XLSX.utils.book_new();
      
      // Buat worksheet dari array data
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 },  // Tahun Lulus
        { wch: 20 },  // Jumlah Lulusan
        { wch: 30 },  // Jumlah Lulusan yang Terlacak
        { wch: 35 }   // Rata-rata Waktu Tunggu (Bulan)
      ];
      ws['!cols'] = colWidths;
      
      // Tambahkan worksheet ke workbook
      const sheetName = showDeleted ? 'Data Terhapus' : 'Data Masa Tunggu';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      // Generate file dan download
      const fileName = `Tabel_2B4_Masa_Tunggu_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        const escapeCsv = (str) => {
          if (str === null || str === undefined) return '';
          const strValue = String(str);
          if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
            return `"${strValue.replace(/"/g, '""')}"`;
          }
          return strValue;
        };
        
        const csvRows = [
          ['Tahun Lulus', 'Jumlah Lulusan', 'Jumlah Lulusan yang Terlacak', 'Rata-rata Waktu Tunggu (Bulan)'],
          ...currentData.map(row => [
            row.tahun_lulus || '',
            row.jumlah_lulusan !== "" ? row.jumlah_lulusan : '-',
            row.jumlah_terlacak !== "" ? row.jumlah_terlacak : '-',
            row.rata_rata_waktu_tunggu_bulan !== "" ? row.rata_rata_waktu_tunggu_bulan : '-'
          ])
        ].map(row => row.map(cell => escapeCsv(cell)).join(','));
        
        const csvContent = '\ufeff' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tabel_2B4_Masa_Tunggu_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Render table function - unified untuk active dan deleted
  const renderTable = useMemo(() => {
    const currentData = showDeleted ? tableDataDeleted : tableDataActive;
    
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <div className="relative transition-opacity duration-200 ease-in-out">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr className="sticky top-0">
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                  Tahun Lulus
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                  Jumlah Lulusan
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                  Jumlah Lulusan yang Terlacak
                </th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">
                  Rata-rata Waktu Tunggu (Bulan)
                </th>
                <th className="px-2 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white w-20">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
              {currentData.map((row, index) => {
                const rowBg = index % 2 === 0 ? "bg-white" : "bg-slate-50";
                const isJumlah = row.tahun_lulus === "Jumlah";
                const rowId = row.data && getIdField(row.data) ? row.data[getIdField(row.data)] : null;
                const uniqueKey = isJumlah 
                  ? `${showDeleted ? 'deleted' : 'active'}-2b4-jumlah-${index}` 
                  : `${showDeleted ? 'deleted' : 'active'}-2b4-${rowId || row.tahun_lulus || index}-${index}`;
                return (
              <tr key={uniqueKey} className={`transition-all duration-200 ease-in-out ${rowBg} hover:bg-[#eaf4ff] ${isJumlah ? 'font-semibold' : ''}`}>
                <td className={`px-4 py-3 text-slate-700 border border-slate-200 ${isJumlah ? 'bg-slate-100 font-semibold' : 'bg-gray-50'} font-medium text-center`}>
                  {row.tahun_lulus}
                </td>
                <td 
                  className={`px-4 py-3 text-slate-700 border border-slate-200 text-center ${rowBg} ${
                    row.data && !isJumlah && !showDeleted ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() => row.data && !isJumlah && !showDeleted && handleCellClick(row, 'jumlah_lulusan')}
                >
                  {row.jumlah_lulusan !== "" ? row.jumlah_lulusan : (row.data && !isJumlah && !showDeleted ? "Klik untuk mengisi" : "-")}
                </td>
                <td 
                  className={`px-4 py-3 text-slate-700 border border-slate-200 text-center ${rowBg} ${
                    row.data && !isJumlah && !showDeleted ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() => row.data && !isJumlah && !showDeleted && handleCellClick(row, 'jumlah_terlacak')}
                >
                  {row.jumlah_terlacak !== "" ? row.jumlah_terlacak : (row.data && !isJumlah && !showDeleted ? "Klik untuk mengisi" : "-")}
                </td>
                <td 
                  className={`px-4 py-3 text-slate-700 border border-slate-200 text-center ${rowBg} ${
                    row.data && !isJumlah && !showDeleted ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() => row.data && !isJumlah && !showDeleted && handleCellClick(row, 'rata_rata_waktu_tunggu_bulan')}
                >
                  {row.rata_rata_waktu_tunggu_bulan !== "" ? row.rata_rata_waktu_tunggu_bulan : (row.data && !isJumlah && !showDeleted ? "Klik untuk mengisi" : "-")}
                </td>
                <td className="px-2 py-3 border border-slate-200 w-20">
                  {row.data && !isJumlah && (
                    <div className="flex items-center justify-center dropdown-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : index;
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
                        aria-expanded={openDropdownId === (getIdField(row.data) ? row.data[getIdField(row.data)] : index)}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              );
            })}
            {currentData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">
                    {showDeleted 
                      ? "Belum ada data yang dihapus atau data yang cocok dengan filter."
                      : "Belum ada data yang ditambahkan atau data yang cocok dengan filter."
                    }
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    );
  }, [showDeleted, tableDataActive, tableDataDeleted]);

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
                : "Semua Tahun"}
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
            <button
              type="button"
              onClick={() => {
                setSelectedTahun(null);
                setOpenYearFilterDropdown(false);
              }}
              className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                !selectedTahun
                  ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                  : 'text-gray-700'
              }`}
            >
              <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
              <span>Semua Tahun</span>
            </button>
            {availableYears.map(year => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Unit Selector Component
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
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Data masa tunggu lulusan untuk mendapatkan pekerjaan pertama
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

      {/* Controls */}
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

      {/* Table */}
      {renderTable}

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentTableData = showDeleted ? tableDataDeleted : tableDataActive;
        const currentRow = currentTableData.find((r, idx) => {
          if (!r.data) return false;
          const rowId = getIdField(r.data) ? r.data[getIdField(r.data)] : idx;
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
                  handleEditClick(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doHardDelete(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
            {showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doRestore(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              setOpenFormUnitDropdown(false);
              setOpenFormTahunDropdown(false);
              setShowAddModal(false);
              setEditing(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editing ? "Edit Data Masa Tunggu" : "Tambah Data Masa Tunggu"}</h3>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data rata-rata masa tunggu lulusan untuk bekerja pertama kali.</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Prodi <span className="text-red-500">*</span></label>
                    <div className="relative form-unit-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormUnitDropdown(!openFormUnitDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                          formState.id_unit_prodi
                            ? 'border-[#0384d6] bg-white' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        aria-label="Pilih unit prodi"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_unit_prodi ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_unit_prodi === '4' ? 'Teknik Informatika (TI)' : formState.id_unit_prodi === '5' ? 'Manajemen Informatika (MI)' : '-- Pilih Unit Prodi --'}
                          </span>
                        </div>
                        <FiChevronDown 
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            openFormUnitDropdown ? 'rotate-180' : ''
                          }`} 
                          size={18} 
                        />
                      </button>
                      {openFormUnitDropdown && (
                        <div 
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-unit-dropdown-menu mt-1 w-full"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setFormState({...formState, id_unit_prodi: "4"});
                              setOpenFormUnitDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                              formState.id_unit_prodi === "4"
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span>Teknik Informatika (TI)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormState({...formState, id_unit_prodi: "5"});
                              setOpenFormUnitDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                              formState.id_unit_prodi === "5"
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                            <span>Manajemen Informatika (MI)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Lulus <span className="text-red-500">*</span></label>
                    <div className="relative form-tahun-dropdown-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenFormTahunDropdown(!openFormTahunDropdown);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                          formState.id_tahun_lulus
                            ? 'border-[#0384d6] bg-white' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                        aria-label="Pilih tahun lulus"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                          <span className={`truncate ${formState.id_tahun_lulus ? 'text-gray-900' : 'text-gray-500'}`}>
                            {formState.id_tahun_lulus 
                              ? (() => {
                                  const found = availableYears.find((y) => String(y.id) === String(formState.id_tahun_lulus));
                                  return found ? found.tahun : formState.id_tahun_lulus;
                                })()
                              : "-- Pilih Tahun Lulus --"}
                          </span>
                        </div>
                        <FiChevronDown 
                          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            openFormTahunDropdown ? 'rotate-180' : ''
                          }`} 
                          size={18} 
                        />
                      </button>
                      {openFormTahunDropdown && (
                        <div 
                          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-tahun-dropdown-menu mt-1 w-full"
                        >
                          {availableYears.length > 0 ? (
                            availableYears.map(year => (
                              <button
                                key={year.id}
                                type="button"
                                onClick={() => {
                                  setFormState({...formState, id_tahun_lulus: String(year.id)});
                                  setOpenFormTahunDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                  formState.id_tahun_lulus === String(year.id)
                                    ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                    : 'text-gray-700'
                                }`}
                              >
                                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
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
                    onClick={() => {
                      setOpenFormUnitDropdown(false);
                      setOpenFormTahunDropdown(false);
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

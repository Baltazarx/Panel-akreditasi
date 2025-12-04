"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { apiFetch } from "../../../../lib/api";
import { useMaps } from "../../../../hooks/useMaps";
import { useAuth } from "../../../../context/AuthContext";
import { roleCan } from "../../../../lib/role";
import Swal from 'sweetalert2';

export default function Tabel2A2({ role }) {
  const { maps, loading: mapsLoading } = useMaps(true);
  const { authUser } = useAuth();
  const userRole = role || authUser?.role;
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kabupatenKotaList, setKabupatenKotaList] = useState([]);
  const [loadingKabupatenKota, setLoadingKabupatenKota] = useState(false);
  
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isEditTSMode, setIsEditTSMode] = useState(false);
  const [daerahSearchTerm, setDaerahSearchTerm] = useState("");
  const [showDaerahDropdown, setShowDaerahDropdown] = useState(false);
  const daerahInputRef = useRef(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);
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
      // Role kemahasiswaan tidak bisa melihat data yang dihapus
      if (showDeleted && userRole?.toLowerCase() !== 'kemahasiswaan') {
        params.append("include_deleted", "1");
      }
      if (selectedTahun) params.append("id_tahun", selectedTahun);
      
      const apiUrl = `/tabel2a2-keragaman-asal?${params}`;
      
      const result = await apiFetch(apiUrl);
      
      // Apply filtering
      // Role kemahasiswaan tidak bisa melihat data yang dihapus
      const filteredData = (showDeleted && userRole?.toLowerCase() !== 'kemahasiswaan')
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

  // Pastikan showDeleted selalu false untuk role kemahasiswaan
  useEffect(() => {
    if (userRole?.toLowerCase() === 'kemahasiswaan' && showDeleted) {
      setShowDeleted(false);
    }
  }, [userRole, showDeleted]);

  useEffect(() => {
    if (!mapsLoading) {
      refresh();
    }
  }, [mapsLoading, showDeleted, selectedTahun]);

  // Fetch data kabupaten/kota dari ref_kabupaten_kota
  useEffect(() => {
    const fetchKabupatenKota = async () => {
      try {
        setLoadingKabupatenKota(true);
        const result = await apiFetch("/ref-kabupaten-kota");
        console.log("📦 Data kabupaten/kota loaded:", result?.length || 0, "items");
        setKabupatenKotaList(Array.isArray(result) ? result : []);
      } catch (e) {
        console.error("❌ Error fetching kabupaten/kota:", e);
        setKabupatenKotaList([]);
      } finally {
        setLoadingKabupatenKota(false);
      }
    };

    fetchKabupatenKota();
  }, []);

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

  // Permission checks
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  const canRead = isSuperAdmin || roleCan(userRole, "tabel_2a2_keragaman_asal", "r");
  const canUpdate = isSuperAdmin || roleCan(userRole, "tabel_2a2_keragaman_asal", "u");
  const canDelete = isSuperAdmin || roleCan(userRole, "tabel_2a2_keragaman_asal", "d");
  const canCreate = isSuperAdmin || roleCan(userRole, "tabel_2a2_keragaman_asal", "c");
  const canManageData = canCreate || canUpdate;

  // Helper untuk mendapatkan data tahun TS yang dipilih
  const getTSData = useMemo(() => {
    if (!selectedTahun) return { active: [], deleted: [], hasActive: false, hasDeleted: false };
    const tsData = filteredData.filter(item => Number(item.id_tahun) === Number(selectedTahun));
    const active = tsData.filter(item => !item.deleted_at);
    const deleted = tsData.filter(item => item.deleted_at);
    return {
      active,
      deleted,
      hasActive: active.length > 0,
      hasDeleted: deleted.length > 0
    };
  }, [filteredData, selectedTahun]);

  // Helper untuk mendapatkan nama tahun
  const getTahunName = (tahunId) => {
    if (!tahunId || !maps?.tahun) return tahunId;
    const tahun = Object.values(maps.tahun).find(t => Number(t.id_tahun) === Number(tahunId));
    return tahun?.tahun || tahunId;
  };

  // Get unique list of daerah names from ref_kabupaten_kota
  const uniqueDaerahList = useMemo(() => {
    return kabupatenKotaList.map(item => ({
      id: item.id_kabupaten_kota,
      nama: item.nama_kabupaten_kota,
      provinsi: item.nama_provinsi || ''
    }));
  }, [kabupatenKotaList]);

  // Filtered daerah list based on search term
  const filteredDaerahList = useMemo(() => {
    if (!daerahSearchTerm.trim()) {
      // Jika tidak ada search term, tampilkan semua (limit untuk performa)
      return uniqueDaerahList.slice(0, 50);
    }
    const searchLower = daerahSearchTerm.toLowerCase().trim();
    const filtered = uniqueDaerahList.filter(daerah => {
      const namaLower = daerah.nama.toLowerCase();
      const provinsiLower = daerah.provinsi ? daerah.provinsi.toLowerCase() : '';
      return namaLower.includes(searchLower) || provinsiLower.includes(searchLower);
    });
    return filtered;
  }, [uniqueDaerahList, daerahSearchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (daerahInputRef.current && !daerahInputRef.current.contains(event.target)) {
        setShowDaerahDropdown(false);
      }
    };

    if (showDaerahDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDaerahDropdown]);

  // Sinkronisasi daerahSearchTerm dengan form.nama_daerah_input ketika form berubah dari luar
  useEffect(() => {
    if (form.nama_daerah_input !== daerahSearchTerm) {
      // Hanya update jika berbeda dan tidak sedang dalam proses typing
      // Ini mencegah konflik dengan handleDaerahInputChange
    }
  }, [form.nama_daerah_input]);

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
    setIsEditTSMode(false);
    setShowModal(true);
    setDaerahSearchTerm("");
    setShowDaerahDropdown(false);
  };

  // Helper function untuk mencari provinsi dari nama daerah dan cek apakah ditemukan
  const cariProvinsiDariDaerah = (namaDaerah) => {
    if (!namaDaerah) return { provinsi: null, ditemukan: false };
    
    const namaDaerahUpper = namaDaerah.toUpperCase();
    
    // Coba exact match dulu
    let daerahFound = uniqueDaerahList.find(daerah => 
      daerah.nama.toUpperCase() === namaDaerahUpper
    );
    
    // Jika tidak ketemu exact match, coba partial match (contains)
    if (!daerahFound) {
      daerahFound = uniqueDaerahList.find(daerah => {
        const namaListUpper = daerah.nama.toUpperCase();
        // Cek apakah nama daerah input mengandung nama dari list atau sebaliknya
        return namaDaerahUpper.includes(namaListUpper) || namaListUpper.includes(namaDaerahUpper);
      });
    }
    
    return {
      provinsi: daerahFound?.provinsi || null,
      ditemukan: !!daerahFound
    };
  };

  // Helper function untuk menentukan kategori geografis berdasarkan nama daerah dan provinsi
  const getKategoriGeografis = (namaDaerah, provinsi = null) => {
    if (!namaDaerah) {
      return "Kota/Kab Lain";
    }
    
    const namaDaerahUpper = namaDaerah.toUpperCase();
    
    // Prioritas 1: Jika nama daerah mengandung KABUPATEN BANYUWANGI, maka Sama Kota/Kab
    if (namaDaerahUpper.includes("KABUPATEN BANYUWANGI")) {
      return "Sama Kota/Kab";
    }
    
    // Cari provinsi dari database jika tidak tersedia atau untuk memastikan
    const hasilPencarian = cariProvinsiDariDaerah(namaDaerah);
    const provinsiFinal = provinsi || hasilPencarian.provinsi;
    
    // Jika tidak ditemukan di database, maka Negara Lain
    if (!hasilPencarian.ditemukan) {
      return "Negara Lain";
    }
    
    // Prioritas 2: Jika provinsi ditemukan dan bukan Jawa Timur, maka Provinsi Lain
    if (provinsiFinal && provinsiFinal.toUpperCase() !== "JAWA TIMUR") {
      return "Provinsi Lain";
    }
    
    // Default: Kota/Kab Lain (untuk daerah di Jawa Timur selain Banyuwangi)
    return "Kota/Kab Lain";
  };

  const handleEditClick = (row) => {
    const upperDaerah = (row.nama_daerah_input || "").toUpperCase();
    const kategoriGeografis = getKategoriGeografis(upperDaerah);
    setForm({
      id_unit_prodi: row.id_unit_prodi || authUser?.unit || "",
      id_tahun: row.id_tahun || "",
      nama_daerah_input: upperDaerah,
      kategori_geografis: kategoriGeografis,
      jumlah_mahasiswa: row.jumlah_mahasiswa || 0,
      link_bukti: row.link_bukti || ""
    });
    setEditingRow(row);
    setIsEditTSMode(false);
    setShowModal(true);
    setDaerahSearchTerm(upperDaerah);
    setShowDaerahDropdown(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRow(null);
    setIsEditTSMode(false);
    setDaerahSearchTerm("");
    setShowDaerahDropdown(false);
  };

  // Handler untuk mengubah input daerah
  const handleDaerahInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    const kategoriGeografis = getKategoriGeografis(value);
    setForm({
      ...form, 
      nama_daerah_input: value,
      kategori_geografis: kategoriGeografis
    });
    setDaerahSearchTerm(value);
    setShowDaerahDropdown(true);
  };

  // Handler untuk memilih daerah dari dropdown
  const handleSelectDaerah = (daerah) => {
    const upperValue = daerah.nama.toUpperCase();
    const provinsi = daerah.provinsi || null;
    const kategoriGeografis = getKategoriGeografis(upperValue, provinsi);
    setForm({
      ...form, 
      nama_daerah_input: upperValue,
      kategori_geografis: kategoriGeografis
    });
    setDaerahSearchTerm(upperValue);
    setShowDaerahDropdown(false);
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
        console.log("➕ Creating new record(s)");
        const createUrl = "/tabel2a2-keragaman-asal";
        console.log("🌐 Create API URL:", createUrl);
        
        // Cari provinsi dari nama daerah
        const hasilPencarian = cariProvinsiDariDaerah(form.nama_daerah_input);
        const provinsiDitemukan = hasilPencarian.provinsi;
        const daerahDitemukan = hasilPencarian.ditemukan;
        const namaDaerahUpper = (form.nama_daerah_input || "").toUpperCase();
        const isBanyuwangi = namaDaerahUpper.includes("KABUPATEN BANYUWANGI");
        const isJawaTimur = provinsiDitemukan && provinsiDitemukan.toUpperCase() === "JAWA TIMUR";
        
        // Jika tidak ditemukan di database, buat 1 record dengan kategori Negara Lain
        if (!daerahDitemukan) {
          const payloadNegaraLain = {
            ...payload,
            nama_daerah_input: form.nama_daerah_input.toUpperCase(),
            kategori_geografis: "Negara Lain"
          };
          
          await apiFetch(createUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadNegaraLain)
          });
          console.log("✅ Create Negara Lain successful");
          
          await Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: 'Data berhasil ditambahkan (Negara Lain)', 
            timer: 2000 
          });
        } else {
          // Record 1: Kota/Kab Lain (selalu dibuat, kecuali jika Banyuwangi)
          if (!isBanyuwangi) {
            const payloadKotaKab = {
              ...payload,
              nama_daerah_input: form.nama_daerah_input.toUpperCase(),
              kategori_geografis: "Kota/Kab Lain"
            };
            
            await apiFetch(createUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadKotaKab)
            });
            console.log("✅ Create Kota/Kab Lain successful");
          } else {
            // Jika Banyuwangi, buat dengan kategori Sama Kota/Kab
            const payloadBanyuwangi = {
              ...payload,
              nama_daerah_input: form.nama_daerah_input.toUpperCase(),
              kategori_geografis: "Sama Kota/Kab"
            };
            
            await apiFetch(createUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadBanyuwangi)
            });
            console.log("✅ Create Sama Kota/Kab (Banyuwangi) successful");
          }
          
          // Record 2: Provinsi Lain (hanya jika provinsi ditemukan dan bukan Jawa Timur)
          if (provinsiDitemukan && !isJawaTimur) {
            const payloadProvinsi = {
              ...payload,
              nama_daerah_input: provinsiDitemukan.toUpperCase(),
              kategori_geografis: "Provinsi Lain"
            };
            
            await apiFetch(createUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payloadProvinsi)
            });
            console.log("✅ Create Provinsi Lain successful");
          }
          
          await Swal.fire({ 
            icon: 'success', 
            title: 'Berhasil!', 
            text: provinsiDitemukan && !isJawaTimur 
              ? 'Data berhasil ditambahkan (Kota/Kab Lain dan Provinsi Lain)' 
              : 'Data berhasil ditambahkan', 
            timer: 2000 
          });
        }
      }
      
      handleCloseModal();
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

  // Handler untuk Edit Data TS - membuka modal untuk menambah/edit data untuk tahun TS
  const handleEditTS = () => {
    if (!selectedTahun) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'Peringatan!', 
        text: 'Pilih tahun akademik terlebih dahulu' 
      });
      return;
    }
    
    // Buka modal dengan mode Edit TS (akan menampilkan dropdown untuk memilih data)
    setForm({
      id_unit_prodi: authUser?.unit || "",
      id_tahun: selectedTahun || "",
      nama_daerah_input: "",
      kategori_geografis: "Sama Kota/Kab",
      jumlah_mahasiswa: 0,
      link_bukti: ""
    });
    setEditingRow(null);
    setIsEditTSMode(true);
    setShowModal(true);
    setDaerahSearchTerm("");
    setShowDaerahDropdown(false);
  };

  // Handler untuk memilih data dari dropdown
  const handleSelectDataToEdit = (dataId) => {
    if (!dataId) {
      // Reset form jika tidak ada yang dipilih
      setForm({
        id_unit_prodi: authUser?.unit || "",
        id_tahun: selectedTahun || "",
        nama_daerah_input: "",
        kategori_geografis: "Sama Kota/Kab",
        jumlah_mahasiswa: 0,
        link_bukti: ""
      });
      setEditingRow(null);
      setDaerahSearchTerm("");
      return;
    }

    const tsData = getTSData.active;
    const selectedData = tsData.find(item => Number(item.id) === Number(dataId));
    
    if (selectedData) {
      const upperDaerah = (selectedData.nama_daerah_input || "").toUpperCase();
      const kategoriGeografis = getKategoriGeografis(upperDaerah);
      setForm({
        id_unit_prodi: selectedData.id_unit_prodi || authUser?.unit || "",
        id_tahun: selectedData.id_tahun || selectedTahun || "",
        nama_daerah_input: upperDaerah,
        kategori_geografis: kategoriGeografis,
        jumlah_mahasiswa: selectedData.jumlah_mahasiswa || 0,
        link_bukti: selectedData.link_bukti || ""
      });
      setEditingRow(selectedData);
      setDaerahSearchTerm(upperDaerah);
    }
  };

  // Handler untuk Soft Delete Data TS - menghapus semua data aktif untuk tahun TS
  const handleSoftDeleteTS = async () => {
    if (!selectedTahun || !canManageData) {
      Swal.fire("Info", "Tidak ada data untuk dihapus atau Anda tidak memiliki izin.", "info");
      return;
    }

    const tsData = getTSData.active;
    if (tsData.length === 0) {
      Swal.fire("Info", `Tidak ada data aktif untuk tahun ${getTahunName(selectedTahun)}.`, "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Semua data keragaman asal untuk tahun ${getTahunName(selectedTahun)} (${tsData.length} data) akan di-soft delete.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        const ids = tsData.map(item => item.id);
        await apiFetch(`/tabel2a2-keragaman-asal/delete-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
        Swal.fire("Berhasil", "Data berhasil di-soft delete.", "success");
        refresh();
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
      }
    }
  };

  // Handler untuk Restore Data TS - memulihkan semua data yang dihapus untuk tahun TS
  const handleRestoreTS = async () => {
    if (!selectedTahun || !canManageData) {
      Swal.fire("Info", "Tidak ada data untuk dipulihkan atau Anda tidak memiliki izin.", "info");
      return;
    }

    const tsData = getTSData.deleted;
    if (tsData.length === 0) {
      Swal.fire("Info", `Tidak ada data yang dihapus untuk tahun ${getTahunName(selectedTahun)}.`, "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin memulihkan?",
      text: `Data keragaman asal untuk tahun ${getTahunName(selectedTahun)} (${tsData.length} data) akan dipulihkan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, pulihkan!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        const ids = tsData.map(item => item.id);
        await apiFetch(`/tabel2a2-keragaman-asal/restore-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
        Swal.fire("Berhasil", "Data berhasil dipulihkan.", "success");
        refresh();
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal memulihkan data", "error");
      }
    }
  };

  // Handler untuk Hard Delete Data TS - menghapus permanen semua data yang dihapus untuk tahun TS
  const handleHardDeleteTS = async () => {
    if (!selectedTahun || !canDelete) {
      Swal.fire("Info", "Tidak ada data untuk dihapus permanen atau Anda tidak memiliki izin.", "info");
      return;
    }

    const tsData = getTSData.deleted;
    if (tsData.length === 0) {
      Swal.fire("Info", `Tidak ada data yang dihapus untuk tahun ${getTahunName(selectedTahun)}.`, "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus permanen?",
      text: `Data keragaman asal untuk tahun ${getTahunName(selectedTahun)} (${tsData.length} data) akan dihapus secara permanen dan tidak dapat dipulihkan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus permanen!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        const ids = tsData.map(item => item.id);
        await apiFetch(`/tabel2a2-keragaman-asal/hard-delete-multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
        Swal.fire("Berhasil", "Data berhasil dihapus secara permanen.", "success");
        refresh();
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal menghapus permanen", "error");
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
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-10">
      
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
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-slate-500">
              Kelola data keragaman asal mahasiswa per tahun akademik.
            </p>
            {!loading && (
              <span className="inline-flex items-center text-sm text-slate-700">
                Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredData.length}</span>
              </span>
            )}
          </div>
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
            
            {/* Show Deleted Toggle - Hidden untuk role kemahasiswaan */}
            {userRole?.toLowerCase() !== 'kemahasiswaan' && (
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setShowDeleted(false); setSelectedRows([]); }}
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
                  onClick={() => { setShowDeleted(true); setSelectedRows([]); }}
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
          
          {/* Action Buttons */}
          <div className="inline-flex items-center gap-2">
            {canCreate && canManageData && !showDeleted && (
              <button
                onClick={handleAddClick}
                disabled={loading}
                className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Tambah Data
              </button>
            )}
            {canManageData && getTSData.hasActive && !showDeleted && (
              <>
                {canUpdate && (
                  <button 
                    onClick={handleEditTS}
                    className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] transition-colors"
                    disabled={!canUpdate}
                  >
                    Edit Data TS
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={handleSoftDeleteTS}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    disabled={!canDelete}
                  >
                    Hapus Data TS
                  </button>
                )}
              </>
            )}
            {canManageData && getTSData.hasDeleted && showDeleted && (
              <>
                <button 
                  onClick={handleRestoreTS}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                  disabled={!canUpdate}
                >
                  Pulihkan Data TS
                </button>
                <button 
                  onClick={handleHardDeleteTS}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                  disabled={!canDelete}
                >
                  Hapus Permanen TS
                </button>
              </>
            )}
          </div>
        </div>

        {!canRead ? (
          <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
            Anda tidak memiliki akses untuk membaca tabel ini.
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <div className="relative transition-opacity duration-200 ease-in-out">
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
              </tr>
              <tr className="sticky top-0">
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-4</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-3</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-2</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-1</th>
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
              {(() => {
                console.log("📊 Tabel2A2 - Rendering organized data:", {
                  organizedDataLength: organizedData.length,
                  sampleCategory: organizedData[0] || null
                });
                
                const rows = [];
                
                organizedData.forEach((category, categoryIndex) => {
                  // Add category row
                  rows.push(
                    <tr key={`category-${showDeleted ? 'deleted' : 'active'}-${categoryIndex}`} className="transition-all duration-200 ease-in-out bg-slate-100 hover:bg-slate-200">
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
                    </tr>
                  );
                  
                  // Add subcategory rows
                  category.subcategories.forEach((subcategory, subIndex) => {
                    rows.push(
                      <tr key={`subcategory-${showDeleted ? 'deleted' : 'active'}-${categoryIndex}-${subIndex}`} className={`transition-all duration-200 ease-in-out ${subIndex % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
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
              </tr>
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={showDeleted ? 7 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
          </>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">
                {editingRow 
                  ? 'Edit Keragaman Asal' 
                  : isEditTSMode 
                    ? `Edit Data TS - ${getTahunName(selectedTahun)}` 
                    : 'Tambah Keragaman Asal'
                }
              </h3>
              <p className="text-white/80 mt-1 text-sm">
                {isEditTSMode && !editingRow 
                  ? `Pilih data yang ingin diedit atau tambah data baru untuk tahun ${getTahunName(selectedTahun)}.`
                  : editingRow
                    ? 'Edit data keragaman asal mahasiswa yang dipilih.'
                    : 'Isi formulir data keragaman asal mahasiswa.'
                }
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dropdown untuk memilih data yang ingin diedit - hanya muncul di mode Edit TS */}
                {isEditTSMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Pilih Asal Mahasiswa yang Ingin Diedit {getTSData.hasActive && <span className="text-red-500">*</span>}
                    </label>
                    {getTSData.hasActive ? (
                      <>
                        <select
                          value={editingRow?.id || ""}
                          onChange={(e) => handleSelectDataToEdit(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                        >
                          <option value="">-- Pilih Data yang Ingin Diedit atau Kosongkan untuk Menambah Data Baru --</option>
                          {getTSData.active.map((item) => {
                            const kategoriLabel = item.kategori_geografis === "Sama Kota/Kab" 
                              ? "Kota/Kab sama dengan PS"
                              : item.kategori_geografis;
                            return (
                              <option key={item.id} value={item.id} className="text-slate-700">
                                {kategoriLabel} - {item.nama_daerah_input} ({item.jumlah_mahasiswa} mahasiswa)
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Pilih data dari dropdown di atas untuk mengisi form secara otomatis, atau kosongkan untuk menambah data baru.
                        </p>
                      </>
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Tidak ada data untuk tahun {getTahunName(selectedTahun)}. Anda dapat menambah data baru dengan mengisi form di bawah.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
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
                    <div className="relative" ref={daerahInputRef}>
                      <input
                        type="text"
                        value={form.nama_daerah_input || ""}
                        onChange={handleDaerahInputChange}
                        onFocus={() => {
                          if (form.nama_daerah_input) {
                            setDaerahSearchTerm(form.nama_daerah_input);
                          } else {
                            setDaerahSearchTerm("");
                          }
                          setShowDaerahDropdown(true);
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white uppercase"
                        placeholder="Ketik untuk mencari kabupaten/kota dari referensi"
                        style={{ textTransform: 'uppercase' }}
                        autoComplete="off"
                      />
                      {showDaerahDropdown && (
                        <>
                          {filteredDaerahList.length > 0 ? (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredDaerahList.map((daerah, index) => (
                                <div
                                  key={daerah.id || index}
                                  onClick={() => handleSelectDaerah(daerah)}
                                  className="px-4 py-3 cursor-pointer hover:bg-[#0384d6] transition-colors border-b border-gray-100 last:border-b-0 group"
                                >
                                  <div className="font-medium text-base text-gray-800 group-hover:text-white">
                                    {daerah.nama}
                                  </div>
                                  {daerah.provinsi && (
                                    <div className="text-xs text-gray-500 mt-0.5 group-hover:text-white">
                                      {daerah.provinsi}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : daerahSearchTerm ? (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                              <div className="px-4 py-3 text-sm text-gray-600">
                                <div className="font-medium text-gray-800 mb-1">Tidak ada hasil</div>
                                <div className="text-xs">
                                  Tidak ditemukan untuk "{daerahSearchTerm}". Coba cari dengan nama lengkap seperti "KOTA SURAKARTA" atau "SURAKARTA".
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {uniqueDaerahList.slice(0, 20).map((daerah, index) => (
                                <div
                                  key={daerah.id || index}
                                  onClick={() => handleSelectDaerah(daerah)}
                                  className="px-4 py-3 cursor-pointer hover:bg-[#0384d6] transition-colors border-b border-gray-100 last:border-b-0 group"
                                >
                                  <div className="font-medium text-base text-gray-800 group-hover:text-white">
                                    {daerah.nama}
                                  </div>
                                  {daerah.provinsi && (
                                    <div className="text-xs text-gray-500 mt-0.5 group-hover:text-white">
                                      {daerah.provinsi}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {uniqueDaerahList.length > 20 && (
                                <div className="px-4 py-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                                  <div className="font-medium">Ketik untuk mencari lebih spesifik...</div>
                                  <div className="mt-1">Total {uniqueDaerahList.length} kabupaten/kota tersedia</div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {loadingKabupatenKota ? (
                      <p className="text-xs text-blue-500 mt-1">
                        Memuat data kabupaten/kota...
                      </p>
                    ) : uniqueDaerahList.length > 0 ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih dari {uniqueDaerahList.length} kabupaten/kota yang tersedia di referensi.
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠️ Data kabupaten/kota belum ter-load. Silakan refresh halaman.
                      </p>
                    )}
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
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      <span className="relative z-10">Batal</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                  <button 
                      type="submit" 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      <span className="relative z-10">{loading ? "Menyimpan..." : "Simpan"}</span>
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
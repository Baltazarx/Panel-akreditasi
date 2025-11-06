"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "../../../../lib/api";
import { useMaps } from "../../../../hooks/useMaps";
import { roleCan } from "../../../../lib/role";
import { useAuth } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

export default function Tabel2C({ role }) {
  const { maps } = useMaps(true);
  const { authUser } = useAuth();

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedProdi, setSelectedProdi] = useState(""); // Filter prodi khusus superadmin
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bentukList, setBentukList] = useState([]); // {id_bentuk, nama_bentuk}
  const [dataByYear, setDataByYear] = useState({}); // { [id_tahun]: { aktif, link, counts:{[id_bentuk]: jumlah}, deleted_at, hasData } }
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // Flag untuk membedakan mode tambah/edit

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    jumlah_mahasiswa_aktif: "",
    link_bukti: "",
    details: {} // { [id_bentuk]: jumlah_mahasiswa_ikut }
  });
  const [saving, setSaving] = useState(false);
  const [customBentukList, setCustomBentukList] = useState([]); // Array untuk bentuk pembelajaran custom yang ditambahkan dinamis
  const [showDeleted, setShowDeleted] = useState(false); // State untuk toggle menampilkan data yang dihapus
  const [editingBentukId, setEditingBentukId] = useState(null); // ID bentuk pembelajaran yang sedang diedit
  const [editingBentukName, setEditingBentukName] = useState(""); // Nama bentuk pembelajaran yang sedang diedit
                
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(role?.toLowerCase());

  // Get available prodi for dropdown (hanya TI dan MI)
  const availableProdi = useMemo(() => {
    const units = Object.values(maps.units || {});
    return units
      .filter(u => {
        const id = u.id_unit ?? u.id;
        const nama = (u.nama_unit || u.nama || "").toLowerCase();
        return id === 4 || id === 5 || nama.includes('teknik informatika') || nama.includes('manajemen informatika');
      })
      .map(u => ({
        id: u.id_unit ?? u.id,
        nama: u.nama_unit || u.nama || ""
      }))
      .filter(u => u.id && (u.id === 4 || u.id === 5));
  }, [maps.units]);

  const availableYears = useMemo(() => {
    const years = Object.values(maps.tahun || {})
      .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
      .filter((t) => t.id)
      .sort((a, b) => Number(a.id) - Number(b.id));
    return years;
  }, [maps.tahun]);

  // Default ke tahun sekarang jika ada
  useEffect(() => {
    if (!selectedYear && availableYears.length) {
      const now = new Date();
      const yr = now.getFullYear();
      const match = availableYears.find((y) => String(y.text).startsWith(String(yr)) || String(y.id) === String(yr));
      // Jika tidak ada match, gunakan tahun terbaru (index terakhir karena ascending)
      setSelectedYear((match?.id ?? availableYears[availableYears.length - 1].id) + "");
    }
  }, [availableYears, selectedYear]);

  // Default ke prodi pertama untuk superadmin
  useEffect(() => {
    if (isSuperAdmin && !selectedProdi && availableProdi.length > 0) {
      setSelectedProdi(String(availableProdi[0].id));
    }
  }, [isSuperAdmin, availableProdi, selectedProdi]);

  const yearOrder = useMemo(() => {
    if (!selectedYear) return [];
    const idx = availableYears.findIndex((y) => String(y.id) === String(selectedYear));
    if (idx === -1) return [];
    const ts = availableYears[idx]?.id;
    const ts1 = idx > 0 ? availableYears[idx - 1]?.id : null;
    const ts2 = idx > 1 ? availableYears[idx - 2]?.id : null;
    const ts3 = idx > 2 ? availableYears[idx - 3]?.id : null;
    const ts4 = idx > 3 ? availableYears[idx - 4]?.id : null;
    // Selalu return 5 elemen (bisa null) agar kolom tetap tampil
    return [ts4, ts3, ts2, ts1, ts]; // urut: TS-4, TS-3, TS-2, TS-1, TS (dari kiri ke kanan)
  }, [availableYears, selectedYear]);

  // Fetch master bentuk + data per tahun
  useEffect(() => {
    if (!selectedYear || yearOrder.length === 0) {
      setBentukList([]);
      setDataByYear({});
      return;
    }

    // Untuk superadmin, pastikan prodi sudah dipilih sebelum fetch
    if (isSuperAdmin && !selectedProdi) {
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError("");
        
        // Filter tahun yang valid (bukan null) untuk fetch
        const validYears = yearOrder.filter(y => y != null);
        
        // Fetch data fleksibilitas untuk semua tahun dalam yearOrder (yang valid)
        let resAll = { masterBentuk: [], dataTahunan: [], dataDetails: [] };
        if (validYears.length > 0) {
          // Build query params: tahun + prodi filter + include_deleted
          const params = [`id_tahun_in=${validYears.join(',')}`];
          if (isSuperAdmin && selectedProdi) {
            params.push(`id_unit_prodi=${selectedProdi}`);
          }
          const deletedParam = showDeleted ? '&include_deleted=1' : '';
          const queryParams = params.join('&') + deletedParam;
          resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
        }
        
        // Parse response dari backend: { masterBentuk, dataTahunan, dataDetails }
        const masterBentuk = resAll.masterBentuk || [];
        const dataTahunan = resAll.dataTahunan || [];
        const dataDetails = resAll.dataDetails || [];
        
        // Set master bentuk
        setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);

        // Mapping data per tahun dengan filter berdasarkan showDeleted
        const map = mapDataByYear(dataTahunan, dataDetails, yearOrder, showDeleted);
        setDataByYear(map);
      } catch (e) {
        console.error("Error fetching data:", e);
        setError(e?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear, yearOrder.join(","), selectedProdi, isSuperAdmin, showDeleted]);

  // Helper function untuk mapping data tahun dengan filter berdasarkan showDeleted
  const mapDataByYear = useCallback((dataTahunan, dataDetails, yearOrder, showDeletedFlag) => {
    const map = {};
    yearOrder.forEach((y) => {
      if (y != null) {
        // Cari data tahunan untuk tahun ini
        const tahunData = dataTahunan.find((d) => String(d.id_tahun) === String(y));
        
        if (tahunData) {
          const aktif = tahunData.jumlah_mahasiswa_aktif || 0;
          const link = tahunData.link_bukti || "";
          const id_tahunan = tahunData.id;
          const id_unit_prodi = tahunData.id_unit_prodi || null;
          const deleted_at = tahunData.deleted_at || null;
          
          // Filter berdasarkan showDeletedFlag
          // Jika showDeleted aktif, hanya tampilkan data yang sudah di-soft delete
          // Jika showDeleted tidak aktif, hanya tampilkan data yang tidak di-soft delete
          if (showDeletedFlag && !deleted_at) {
            map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, id_unit_prodi: null, deleted_at: null, hasData: false };
            return;
          }
          if (!showDeletedFlag && deleted_at) {
            map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, id_unit_prodi: null, deleted_at: null, hasData: false };
            return;
          }
          
          // Ambil detail untuk id_tahunan ini
          const details = dataDetails.filter((d) => d.id_tahunan === id_tahunan);
          const counts = {};
          details.forEach((d) => {
            counts[d.id_bentuk] = d.jumlah_mahasiswa_ikut || 0;
          });
          
          map[y] = { aktif, link, counts, id_tahunan, id_unit_prodi, deleted_at, hasData: true };
        } else {
          // Tidak ada data di database untuk tahun ini - tampilkan entry kosong
          map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, id_unit_prodi: null, deleted_at: null, hasData: false };
        }
      }
    });
    return map;
  }, []);

  const totalsByYear = useMemo(() => {
    const sums = {};
    yearOrder.forEach((y) => {
      if (y != null) {
        const counts = dataByYear[y]?.counts || {};
        sums[y] = Object.values(counts).reduce((a, b) => a + Number(b || 0), 0);
      }
    });
    return sums;
  }, [dataByYear, yearOrder]);

  const percentByYear = useMemo(() => {
    const pct = {};
    yearOrder.forEach((y) => {
      if (y != null) {
        const total = totalsByYear[y] || 0;
        const aktif = Number(dataByYear[y]?.aktif || 0);
        pct[y] = aktif > 0 ? (total / aktif) * 100 : 0;
      }
    });
    return pct;
  }, [totalsByYear, dataByYear, yearOrder]);

  const canRead = isSuperAdmin || roleCan(role, "fleksibilitas_pembelajaran", "r");
  const canUpdate = isSuperAdmin || roleCan(role, "fleksibilitas_pembelajaran", "U");
  const canDelete = isSuperAdmin || roleCan(role, "fleksibilitas_pembelajaran", "D");
  const canCreate = isSuperAdmin || roleCan(role, "fleksibilitas_pembelajaran", "C");
  const canDeleteBentuk = roleCan(role, "bentuk_pembelajaran_master", "D"); // Permission untuk menghapus bentuk pembelajaran master
  const canManageData = isSuperAdmin || roleCan(role, "fleksibilitas_pembelajaran", "C") || roleCan(role, "fleksibilitas_pembelajaran", "U");

  // Handler untuk update nama bentuk pembelajaran
  const handleUpdateBentuk = async (idBentuk, namaBentukBaru) => {
    if (!namaBentukBaru || !namaBentukBaru.trim()) {
      Swal.fire("Peringatan", "Nama bentuk pembelajaran tidak boleh kosong", "warning");
      return;
    }

    try {
      await apiFetch(`/tabel2c-bentuk-pembelajaran/${idBentuk}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_bentuk: namaBentukBaru.trim() })
      });

      Swal.fire("Berhasil", "Nama bentuk pembelajaran berhasil diperbarui", "success");
      
      // Reset editing state
      setEditingBentukId(null);
      setEditingBentukName("");

      // Refresh bentukList
      const validYears = yearOrder.filter(y => y != null);
      if (validYears.length > 0) {
        const params = [`id_tahun_in=${validYears.join(',')}`];
        if (isSuperAdmin && selectedProdi) {
          params.push(`id_unit_prodi=${selectedProdi}`);
        }
        const queryParams = params.join('&');
        const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
        const masterBentuk = resAll.masterBentuk || [];
        setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
      }
    } catch (e) {
      console.error("Error updating bentuk pembelajaran:", e);
      Swal.fire("Error", e?.message || "Gagal memperbarui nama bentuk pembelajaran", "error");
    }
  };

  // Handler untuk memulai edit nama bentuk pembelajaran
  const handleStartEditBentuk = (idBentuk, namaBentuk) => {
    setEditingBentukId(idBentuk);
    setEditingBentukName(namaBentuk);
  };

  // Handler untuk membatalkan edit nama bentuk pembelajaran
  const handleCancelEditBentuk = () => {
    setEditingBentukId(null);
    setEditingBentukName("");
  };

  // Handler untuk menghapus bentuk pembelajaran dari master
  const handleDeleteBentuk = async (idBentuk, namaBentuk) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus bentuk pembelajaran?",
      text: `Bentuk pembelajaran "${namaBentuk}" akan dihapus secara permanen. Pastikan tidak sedang digunakan dalam data fleksibilitas.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        // Fetch langsung untuk bisa mengakses response body secara lengkap
        const BASE_URL = "http://localhost:3000/api";
        const res = await fetch(`${BASE_URL}/tabel2c-bentuk-pembelajaran/${idBentuk}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          mode: "cors",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw { status: res.status, data: errorData };
        }

        const result = await res.json();
        
        Swal.fire("Berhasil", `Bentuk pembelajaran "${namaBentuk}" berhasil dihapus`, "success");
        
        // Hapus bentuk pembelajaran dari formState.details jika sedang digunakan
        const newDetails = {...formState.details};
        delete newDetails[idBentuk];
        setFormState({...formState, details: newDetails});
        
        // Refresh bentukList
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length > 0) {
          const params = [`id_tahun_in=${validYears.join(',')}`];
          if (isSuperAdmin && selectedProdi) {
            params.push(`id_unit_prodi=${selectedProdi}`);
          }
          const queryParams = params.join('&');
          const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
          const masterBentuk = resAll.masterBentuk || [];
          setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
        }
      } catch (e) {
        console.error("Error deleting bentuk pembelajaran:", e);
        
        // Extract error message dan details dari error object
        let errorMessage = "Gagal menghapus bentuk pembelajaran";
        let errorDetails = null;
        
        if (e?.data) {
          // Jika error memiliki data property (dari custom fetch)
          errorMessage = e.data.error || e.data.message || errorMessage;
          errorDetails = e.data.details || null;
        } else if (e?.message) {
          // Fallback ke parsing error message seperti sebelumnya
          let msg = String(e.message).trim();
          
          if (msg.startsWith('{')) {
            try {
              const parsed = JSON.parse(msg);
              errorMessage = parsed.error || parsed.message || errorMessage;
              errorDetails = parsed.details || null;
            } catch (parseErr) {
              const errorMatch = msg.match(/"error"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              if (errorMatch && errorMatch[1]) {
                errorMessage = errorMatch[1]
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\r/g, '\r')
                  .replace(/\\\\/g, '\\');
              } else {
                errorMessage = msg;
              }
            }
          } else {
            errorMessage = msg;
          }
        }
        
        let htmlContent = `<div style="text-align: left; padding: 10px; white-space: pre-wrap;">${errorMessage}</div>`;
        if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
          htmlContent += `<div style="text-align: left; padding: 10px; margin-top: 10px; background-color: #f8f9fa; border-radius: 5px;">`;
          htmlContent += `<strong>Data yang menggunakan bentuk pembelajaran ini:</strong><ul style="margin-top: 5px; padding-left: 20px;">`;
          errorDetails.forEach(detail => {
            htmlContent += `<li style="margin-bottom: 5px;">${detail}</li>`;
          });
          htmlContent += `</ul></div>`;
        }
        
        Swal.fire({
          title: "Gagal Menghapus Bentuk Pembelajaran",
          html: htmlContent,
          icon: "error",
          confirmButtonText: "OK",
          width: "600px"
        });
      }
    }
  };

  // Handler untuk reset form
  const resetForm = () => {
    setFormState({
      id_unit_prodi: isSuperAdmin ? "" : (authUser?.unit || ""),
      jumlah_mahasiswa_aktif: "",
      link_bukti: "",
      details: {}
    });
    setEditingYear(null);
    setIsEditMode(false);
    setCustomBentukList([]); // Reset custom bentuk list
    setEditingBentukId(null); // Reset editing bentuk
    setEditingBentukName(""); // Reset editing nama bentuk
  };

  // Handler untuk buka modal tambah/edit
  const handleOpenModal = (yearId = null) => {
    if (yearId && dataByYear[yearId]?.hasData) {
      // Edit mode - perlu ambil id_unit_prodi dari data existing
      const yearData = dataByYear[yearId];
      setEditingYear(yearId);
      setIsEditMode(true);
      
      // Untuk edit, kita perlu fetch data lengkap untuk dapat id_unit_prodi
      // Atau bisa dari dataByYear jika kita simpan
      // Untuk sementara, kita ambil dari data yang ada atau gunakan default
      const defaultProdi = isSuperAdmin ? "" : (authUser?.unit || "");
      
      setFormState({
        id_unit_prodi: yearData.id_unit_prodi || defaultProdi,
        jumlah_mahasiswa_aktif: yearData.aktif || "",
        link_bukti: yearData.link || "",
        details: yearData.counts || {}
      });
      setCustomBentukList([]); // Reset custom bentuk list saat edit mode
    } else {
      // Tambah mode (untuk tahun TS yang dipilih)
      resetForm();
      setEditingYear(selectedYear || yearOrder[4]);
      setIsEditMode(false);
    }
    setShowModal(true);
  };

  // Handler untuk tutup modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Handler untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingYear) {
      Swal.fire("Error", "Tahun akademik tidak valid", "error");
      return;
    }

    try {
      setSaving(true);

      // Handle custom bentuk pembelajaran: buat bentuk pembelajaran baru di master terlebih dahulu
      const customBentukIds = {};
      for (const customBentuk of customBentukList) {
        if (customBentuk.nama && customBentuk.nama.trim() && customBentuk.jumlah && Number(customBentuk.jumlah) > 0) {
          try {
            const createResult = await apiFetch("/tabel2c-bentuk-pembelajaran", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nama_bentuk: customBentuk.nama.trim() })
            });
            if (createResult?.id) {
              customBentukIds[customBentuk.nama] = createResult.id;
            }
          } catch (err) {
            console.error("Error creating bentuk pembelajaran:", err);
            Swal.fire("Error", `Gagal membuat bentuk pembelajaran "${customBentuk.nama}": ${err?.message || "Error tidak diketahui"}`, "error");
            setSaving(false);
            return;
          }
        }
      }

      // Convert details object to array format yang diharapkan backend
      // Include bentuk master yang sudah ada
      const detailsArray = Object.entries(formState.details)
        .filter(([id_bentuk, jumlah_mahasiswa_ikut]) => {
          // Filter hanya yang valid dan bukan custom (custom di-handle terpisah)
          return jumlah_mahasiswa_ikut && Number(jumlah_mahasiswa_ikut) > 0 && !isNaN(Number(id_bentuk));
        })
        .map(([id_bentuk, jumlah_mahasiswa_ikut]) => ({
          id_bentuk: Number(id_bentuk),
          jumlah_mahasiswa_ikut: Number(jumlah_mahasiswa_ikut)
        }));

      // Tambahkan custom bentuk yang sudah dibuat
      for (const customBentuk of customBentukList) {
        if (customBentuk.nama && customBentukIds[customBentuk.nama] && customBentuk.jumlah && Number(customBentuk.jumlah) > 0) {
          detailsArray.push({
            id_bentuk: customBentukIds[customBentuk.nama],
            jumlah_mahasiswa_ikut: Number(customBentuk.jumlah)
          });
        }
      }

      // Determine id_unit_prodi: dari form untuk superadmin, atau dari user untuk prodi
      let finalIdUnitProdi;
      if (isSuperAdmin) {
        finalIdUnitProdi = Number(formState.id_unit_prodi);
        if (!finalIdUnitProdi) {
          Swal.fire("Error", "Pilih Unit Prodi terlebih dahulu", "error");
          return;
        }
      } else {
        // User prodi: gunakan id_unit_prodi dari user atau dari form jika ada (untuk edit)
        finalIdUnitProdi = Number(formState.id_unit_prodi) || Number(authUser?.unit);
        if (!finalIdUnitProdi) {
          Swal.fire("Error", "Unit Prodi tidak ditemukan", "error");
          return;
        }
      }

      const payload = {
        id_tahun_akademik: Number(editingYear),
        id_unit_prodi: finalIdUnitProdi,
        jumlah_mahasiswa_aktif: Number(formState.jumlah_mahasiswa_aktif) || 0,
        link_bukti: formState.link_bukti || "",
        details: detailsArray
      };

      await apiFetch("/tabel2c-fleksibilitas-pembelajaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      Swal.fire("Berhasil!", isEditMode ? "Data berhasil diperbarui" : "Data berhasil ditambahkan", "success");
      
      handleCloseModal();
      
      // Refresh data termasuk master bentuk (untuk mendapatkan bentuk baru yang dibuat)
      const validYears = yearOrder.filter(y => y != null);
      if (validYears.length > 0) {
        const params = [`id_tahun_in=${validYears.join(',')}`];
        if (isSuperAdmin && selectedProdi) {
          params.push(`id_unit_prodi=${selectedProdi}`);
        }
        const deletedParam = showDeleted ? '&include_deleted=1' : '';
        const queryParams = params.join('&') + deletedParam;
        const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
        const masterBentuk = resAll.masterBentuk || [];
        const dataTahunan = resAll.dataTahunan || [];
        const dataDetails = resAll.dataDetails || [];
        setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
        
        const map = mapDataByYear(dataTahunan, dataDetails, yearOrder, showDeleted);
        setDataByYear(map);
      }
    } catch (e) {
      console.error("Error submitting:", e);
      Swal.fire("Error", e?.message || "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk delete (hard delete permanen)
  const handleDelete = async () => {
    const tsYearId = selectedYear || yearOrder[4];
    if (!tsYearId || !dataByYear[tsYearId]?.id_tahunan) {
      Swal.fire("Info", "Tidak ada data untuk dihapus", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus permanen?",
      text: "Data akan dihapus secara permanen dan tidak dapat dipulihkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus permanen!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        const tsYearId = selectedYear || yearOrder[4];
        await apiFetch(`/tabel2c-fleksibilitas-pembelajaran/${dataByYear[tsYearId].id_tahunan}/hard`, {
          method: "DELETE"
        });
        
        Swal.fire("Berhasil", "Data berhasil dihapus secara permanen", "success");
        
        // Refresh data
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length > 0) {
          const params = [`id_tahun_in=${validYears.join(',')}`];
          if (isSuperAdmin && selectedProdi) {
            params.push(`id_unit_prodi=${selectedProdi}`);
          }
          const deletedParam = showDeleted ? '&include_deleted=1' : '';
          const queryParams = params.join('&') + deletedParam;
          const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
          const masterBentuk = resAll.masterBentuk || [];
          const dataTahunan = resAll.dataTahunan || [];
          const dataDetails = resAll.dataDetails || [];
          setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
          
          const map = mapDataByYear(dataTahunan, dataDetails, yearOrder, showDeleted);
          setDataByYear(map);
        }
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
      }
    }
  };

  // Handler untuk memulihkan data TS yang sudah di-soft delete
  const handleRestoreTS = async () => {
    const yearId = selectedYear || yearOrder[4];
    const data = dataByYear[yearId];
    
    if (!data?.id_tahunan || !canManageData) {
      Swal.fire("Info", "Tidak ada data untuk dipulihkan atau Anda tidak memiliki izin.", "info");
      return false;
    }

    if (!data.deleted_at) {
      Swal.fire("Info", "Data ini tidak dalam status dihapus.", "info");
      return false;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin memulihkan?",
      text: `Data fleksibilitas pembelajaran untuk tahun ${getTahunName(yearId)} akan dipulihkan.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, pulihkan!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await apiFetch(`/tabel2c-fleksibilitas-pembelajaran/${data.id_tahunan}/restore`, { method: "PUT" });
        Swal.fire("Berhasil", "Data berhasil dipulihkan.", "success");
        
        // Refresh data
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length > 0) {
          const params = [`id_tahun_in=${validYears.join(',')}`];
          if (isSuperAdmin && selectedProdi) {
            params.push(`id_unit_prodi=${selectedProdi}`);
          }
          const deletedParam = showDeleted ? '&include_deleted=1' : '';
          const queryParams = params.join('&') + deletedParam;
          const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
          const masterBentuk = resAll.masterBentuk || [];
          const dataTahunan = resAll.dataTahunan || [];
          const dataDetails = resAll.dataDetails || [];
          setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
          
          const map = mapDataByYear(dataTahunan, dataDetails, yearOrder, showDeleted);
          setDataByYear(map);
        }
        return true; 
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal memulihkan data", "error");
        return false;
      }
    }
    return false;
  };

  // Handler Soft Delete Seluruh Data TS
  const handleSoftDeleteTS = async () => {
    const yearId = selectedYear || yearOrder[4];
    const data = dataByYear[yearId];
    
    if (!data?.id_tahunan || !canManageData) {
      Swal.fire("Info", "Tidak ada data untuk dihapus atau Anda tidak memiliki izin.", "info");
      return false;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Semua Data fleksibilitas pembelajaran untuk tahun ${getTahunName(yearId)} akan di-soft delete.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await apiFetch(`/tabel2c-fleksibilitas-pembelajaran/${data.id_tahunan}`, { method: "DELETE" });
        Swal.fire("Berhasil", "Data berhasil di-soft delete.", "success");
        
        // Refresh data
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length > 0) {
          const params = [`id_tahun_in=${validYears.join(',')}`];
          if (isSuperAdmin && selectedProdi) {
            params.push(`id_unit_prodi=${selectedProdi}`);
          }
          const deletedParam = showDeleted ? '&include_deleted=1' : '';
          const queryParams = params.join('&') + deletedParam;
          const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${queryParams}`);
          const masterBentuk = resAll.masterBentuk || [];
          const dataTahunan = resAll.dataTahunan || [];
          const dataDetails = resAll.dataDetails || [];
          setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
          
          const map = mapDataByYear(dataTahunan, dataDetails, yearOrder, showDeleted);
          setDataByYear(map);
        }
        return true; 
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
        return false;
      }
    }
    return false;
  };

  // Get tahun name untuk display
  const getTahunName = (id) => {
    if (!id) return "";
    return availableYears.find(y => String(y.id) === String(id))?.text || id;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <header className="pb-6 mb-2 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran</h2>
        <p className="text-sm text-slate-600 mt-1">Menampilkan TS-4, TS-3, TS-2, TS-1, TS berdasarkan tahun akademik terpilih.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Tahun (TS):</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
          >
            {availableYears.map((y) => (
              <option key={y.id} value={y.id}>{y.text}</option>
            ))}
          </select>
          
          {/* Filter Prodi khusus untuk superadmin */}
          {isSuperAdmin && (
            <>
              <label className="text-sm font-medium text-slate-700 ml-2">Prodi:</label>
              <select
                value={selectedProdi}
                onChange={(e) => setSelectedProdi(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                {availableProdi.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </>
          )}
          
          {canDelete && (
            <button
              onClick={() => setShowDeleted(prev => !prev)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                showDeleted 
                  ? "bg-[#0384d6] text-white hover:bg-[#043975]" 
                  : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
              }`}
              disabled={loading}
            >
              {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan yang Dihapus"}
            </button>
          )}
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${bentukList.length} bentuk`}
          </span>
          {canCreate && canManageData && !showDeleted && (
            <button
              onClick={() => handleOpenModal()}
              disabled={loading}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Tambah Data
            </button>
          )}
          {canManageData && dataByYear[selectedYear || yearOrder[4]]?.hasData && (
            <>
              {showDeleted ? (
                <>
                  <button 
                    onClick={handleRestoreTS}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    disabled={!canUpdate || !dataByYear[selectedYear || yearOrder[4]]?.deleted_at}
                  >
                    Pulihkan Data TS
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                    disabled={!canDelete}
                  >
                    Hapus Permanen TS
                  </button>
                </>
              ) : (
                <>
                  {canUpdate && (
                    <button 
                      onClick={() => handleOpenModal(selectedYear || yearOrder[4])}
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
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>
      )}

      {!canRead ? (
        <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
          Anda tidak memiliki akses untuk membaca tabel ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Tahun Akademik</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-4</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-3</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-2</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-1</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Link Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className={`bg-white hover:bg-[#eaf4ff] ${yearOrder[4] != null && dataByYear[yearOrder[4]]?.deleted_at ? 'opacity-60 bg-red-50' : ''}`}>
                <td className="px-4 py-3 text-slate-800 border border-slate-200">
                  {yearOrder[4] != null && dataByYear[yearOrder[4]]?.deleted_at && (
                    <span className="text-red-600 text-xs mr-1">[Dihapus]</span>
                  )}
                  Jumlah Mahasiswa Aktif
                </td>
                {yearOrder.map((y, idx) => {
                  const yearData = y != null ? dataByYear[y] : null;
                  const isDeleted = yearData?.deleted_at;
                  return (
                    <td key={y ?? `null-${idx}`} className={`px-4 py-3 border border-slate-200 text-center text-slate-800 ${isDeleted ? 'line-through text-red-600' : ''}`}>
                      {y != null ? (yearData?.aktif ?? 0) : 0}
                    </td>
                  );
                })}
                <td className="px-4 py-3 border border-slate-200">
                  {yearOrder[4] != null && dataByYear[yearOrder[4]]?.link ? (
                    <a href={dataByYear[yearOrder[4]]?.link} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                      {dataByYear[yearOrder[4]]?.link}
                    </a>
                  ) : (
                    ""
                  )}
                </td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200" colSpan={7}>
                  Bentuk Pembelajaran — Jumlah mahasiswa untuk setiap bentuk pembelajaran
                </td>
              </tr>

              {bentukList.map((b) => {
                // Cek apakah ada data yang sudah di-soft delete untuk bentuk ini
                const hasDeletedData = yearOrder.some(y => {
                  const yearData = y != null ? dataByYear[y] : null;
                  return yearData?.deleted_at;
                });
                
                const rowBg = "bg-white";
                const deletedStyle = hasDeletedData ? "opacity-60 bg-red-50" : "";
                
                return (
                  <tr key={b.id_bentuk} className={`transition-colors ${rowBg} ${deletedStyle} hover:bg-[#eaf4ff]`}>
                    <td className="px-4 py-3 border border-slate-200 text-slate-800">
                      {hasDeletedData && <span className="text-red-600 text-xs mr-1">[Dihapus]</span>}
                      {b.nama_bentuk}
                    </td>
                    {yearOrder.map((y, idx) => {
                      const yearData = y != null ? dataByYear[y] : null;
                      const isDeleted = yearData?.deleted_at;
                      return (
                        <td key={y ?? `null-${idx}`} className={`px-4 py-3 border border-slate-200 text-center text-slate-800 ${isDeleted ? 'line-through text-red-600' : ''}`}>
                          {y != null ? (yearData?.counts?.[b.id_bentuk] ?? 0) : 0}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 border border-slate-200"></td>
                  </tr>
                );
              })}

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">Jumlah</td>
                {yearOrder.map((y, idx) => {
                  const yearData = y != null ? dataByYear[y] : null;
                  return (
                    <td key={y ?? `null-${idx}`} className="px-4 py-3 border border-slate-200 text-center font-semibold text-slate-800">
                      {y != null ? (totalsByYear[y] ?? 0) : 0}
                    </td>
                  );
                })}
                <td className="px-4 py-3 border border-slate-200"></td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 font-semibold text-slate-800">Persentase</td>
                {yearOrder.map((y, idx) => {
                  const yearData = y != null ? dataByYear[y] : null;
                  return (
                    <td key={y ?? `null-${idx}`} className="px-4 py-3 border border-slate-200 text-center font-semibold text-slate-800">
                      {y != null ? ((percentByYear[y] ?? 0).toFixed(2)) : "0.00"}%
                    </td>
                  );
                })}
                <td className="px-4 py-3 border border-slate-200"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="text-sm text-slate-600">Memuat data...</div>
      )}

      {/* Modal Form Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">
                {isEditMode ? "Edit Data Fleksibilitas Pembelajaran" : "Tambah Data Fleksibilitas Pembelajaran"}
              </h3>
              <p className="text-white/80 mt-1 text-sm">
                Tahun Akademik: {editingYear ? getTahunName(editingYear) : ""}
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isSuperAdmin && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Unit Prodi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formState.id_unit_prodi}
                        onChange={(e) => setFormState({...formState, id_unit_prodi: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                        required
                      >
                        <option value="">Pilih Unit Prodi...</option>
                        {availableProdi.map((p) => (
                          <option key={p.id} value={p.id}>{p.nama}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Jumlah Mahasiswa Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jumlah_mahasiswa_aktif}
                      onChange={(e) => setFormState({...formState, jumlah_mahasiswa_aktif: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan jumlah mahasiswa aktif"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Link Bukti
                    </label>
                    <input
                      type="text"
                      value={formState.link_bukti}
                      onChange={(e) => setFormState({...formState, link_bukti: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      placeholder="Masukkan link bukti (opsional)"
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Jumlah Mahasiswa untuk Setiap Bentuk Pembelajaran
                    </label>
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                      {bentukList.map((b) => (
                        <div key={b.id_bentuk} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          {editingBentukId === b.id_bentuk ? (
                            // Mode edit: tampilkan input field untuk nama
                            <input
                              type="text"
                              value={editingBentukName}
                              onChange={(e) => setEditingBentukName(e.target.value)}
                              className="flex-1 min-w-0 px-2.5 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                              placeholder="Nama bentuk pembelajaran"
                              autoFocus
                            />
                          ) : (
                            // Mode normal: tampilkan label
                            <label className="flex-1 min-w-0 text-sm text-slate-700 font-medium truncate">
                              {b.nama_bentuk}
                            </label>
                          )}
                          <input
                            type="number"
                            min="0"
                            value={formState.details[b.id_bentuk] || ""}
                            onChange={(e) => {
                              const newDetails = {...formState.details};
                              if (e.target.value === "") {
                                delete newDetails[b.id_bentuk];
                              } else {
                                newDetails[b.id_bentuk] = Number(e.target.value);
                              }
                              setFormState({...formState, details: newDetails});
                            }}
                            className="w-20 px-2.5 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                            placeholder="0"
                          />
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {editingBentukId === b.id_bentuk ? (
                              // Mode edit: tampilkan tanda centang dan silang di tempat icon edit dan hapus
                              <>
                                {canUpdate && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateBentuk(b.id_bentuk, editingBentukName)}
                                    className="w-8 h-8 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center border border-green-200 hover:border-green-300 flex-shrink-0"
                                    title="Simpan perubahan"
                                  >
                                    <span className="text-base font-bold">✓</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={handleCancelEditBentuk}
                                  className="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center border border-red-200 hover:border-red-300 flex-shrink-0"
                                  title="Batal"
                                >
                                  <span className="text-base font-bold">✕</span>
                                </button>
                              </>
                            ) : (
                              // Mode normal: tampilkan icon edit dan hapus
                              <>
                                {canUpdate && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditBentuk(b.id_bentuk, b.nama_bentuk)}
                                    className="w-8 h-8 text-[#0384d6] hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center border border-blue-200 hover:border-blue-300 flex-shrink-0"
                                    title="Edit nama bentuk pembelajaran"
                                  >
                                    <span className="text-sm">✏️</span>
                                  </button>
                                )}
                                {canDeleteBentuk && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBentuk(b.id_bentuk, b.nama_bentuk)}
                                    className="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center border border-red-200 hover:border-red-300 flex-shrink-0"
                                    title="Hapus bentuk pembelajaran dari master"
                                  >
                                    <span className="text-sm">🗑️</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom bentuk pembelajaran yang ditambahkan dinamis */}
                      {customBentukList.map((customBentuk, idx) => (
                        <div key={`custom-${idx}`} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                          <input
                            type="text"
                            value={customBentuk.nama}
                            onChange={(e) => {
                              const updated = [...customBentukList];
                              updated[idx].nama = e.target.value;
                              setCustomBentukList(updated);
                            }}
                            className="flex-1 min-w-0 px-2.5 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                            placeholder="Nama bentuk pembelajaran"
                            required
                          />
                          <input
                            type="number"
                            min="0"
                            value={customBentuk.jumlah || ""}
                            onChange={(e) => {
                              const updated = [...customBentukList];
                              updated[idx].jumlah = e.target.value === "" ? "" : Number(e.target.value);
                              setCustomBentukList(updated);
                            }}
                            className="w-20 px-2.5 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = customBentukList.filter((_, i) => i !== idx);
                              setCustomBentukList(updated);
                            }}
                            className="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center border border-red-200 hover:border-red-300 flex-shrink-0"
                            title="Hapus bentuk pembelajaran"
                          >
                            <span className="text-base font-bold">✕</span>
                          </button>
                        </div>
                      ))}
                      
                      {/* Button Tambah Bentuk Pembelajaran */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomBentukList([...customBentukList, { nama: "", jumlah: "" }]);
                        }}
                        className="w-full px-4 py-2 border-2 border-dashed border-[#0384d6] text-[#0384d6] rounded-lg hover:bg-[#eaf3ff] transition-colors font-medium flex items-center justify-center gap-2 sticky bottom-0 bg-white z-10"
                      >
                        + Tambah Bentuk Pembelajaran
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formState.jumlah_mahasiswa_aktif || (isSuperAdmin && !formState.id_unit_prodi)}
                    className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Menyimpan..." : (isEditMode ? "Perbarui" : "Simpan")}
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



"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
// Import disesuaikan dengan asumsi struktur proyek
import { apiFetch } from "../../../../lib/api"; 
import { useMaps } from "../../../../hooks/useMaps"; 
import { roleCan } from "../../../../lib/role"; 
import { useAuth } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

export default function Tabel2D({ role }) {
    const { maps } = useMaps(true);
    const { authUser } = useAuth();
    
    // --- State Utama ---
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedProdi, setSelectedProdi] = useState(""); // Filter prodi khusus superadmin
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [masterSumber, setMasterSumber] = useState([]); // {id_sumber, nama_sumber}
    const [dataByYear, setDataByYear] = useState({}); 
    const [showDeleted, setShowDeleted] = useState(false); 
    
    // --- State Form Input Tunggal (untuk form input di bagian atas) ---
    const [singleInput, setSingleInput] = useState({
        id_sumber: "",
        jenis_pengakuan: "",
        jumlah_mahasiswa_rekognisi: "",
        link_bukti: "",
    });
    
    // --- State Modal dan Form ---
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDetail, setEditingDetail] = useState(null);

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
    const [detailsToSubmit, setDetailsToSubmit] = useState([]); // Daftar rincian yang akan di-submit

    const isProdiUser = ['prodi'].includes(role?.toLowerCase());
    const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(role?.toLowerCase());
    const canManageData = isProdiUser || isSuperAdmin; // Akses untuk prodi dan superadmin
    
    // Cek apakah user adalah prodi TI atau MI berdasarkan id_unit_prodi
    const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
    const isProdiTIorMI = userProdiId && (userProdiId === 4 || userProdiId === 5);
    
    // Pastikan showDeleted selalu false untuk user prodi TI/MI
    useEffect(() => {
        if (isProdiTIorMI && showDeleted) {
            setShowDeleted(false);
        }
    }, [isProdiTIorMI, showDeleted]);

    // --- Utility Hooks ---
    const availableYears = useMemo(() => {
        return Object.values(maps.tahun || {})
          .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
          .filter((t) => t.id)
          .sort((a, b) => Number(a.id) - Number(b.id));
    }, [maps.tahun]);

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

    const yearOrder = useMemo(() => {
        if (!selectedYear) return [];
        const idx = availableYears.findIndex((y) => String(y.id) === String(selectedYear));
        if (idx === -1) return [];
        const ts = availableYears[idx]?.id;
        const ts1 = idx > 0 ? availableYears[idx - 1]?.id : null;
        const ts2 = idx > 1 ? availableYears[idx - 2]?.id : null;
        const ts3 = idx > 2 ? availableYears[idx - 3]?.id : null;
        const ts4 = idx > 3 ? availableYears[idx - 4]?.id : null;
        return [ts4, ts3, ts2, ts1, ts].filter(y => y != null); // TS-4, TS-3, TS-2, TS-1, TS
    }, [availableYears, selectedYear]);

    useEffect(() => {
        if (!selectedYear && availableYears.length) {
            const latestYear = availableYears[availableYears.length - 1]?.id;
            if (latestYear) setSelectedYear(String(latestYear));
        }
    }, [availableYears, selectedYear]);

    // Default ke prodi pertama untuk superadmin
    useEffect(() => {
        if (isSuperAdmin && !selectedProdi && availableProdi.length > 0) {
            setSelectedProdi(String(availableProdi[0].id));
        }
    }, [isSuperAdmin, availableProdi, selectedProdi]);
    
    // --- Fetch Data Utama ---
    const fetchData = useCallback(async () => {
        if (yearOrder.length === 0) {
            setMasterSumber([]);
            setDataByYear({});
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            const validYears = yearOrder.filter(y => y != null);
            const yearParams = `id_tahun_in=${validYears.join(',')}`;
            const deletedParam = showDeleted ? '&include_deleted=1' : '';
            
            // Tambahkan parameter prodi jika superadmin atau user prodi
            let prodiParam = '';
            if (isSuperAdmin && selectedProdi) {
                prodiParam = `&id_unit_prodi=${selectedProdi}`;
            } else if (isProdiUser && authUser?.id_unit_prodi) {
                prodiParam = `&id_unit_prodi=${authUser.id_unit_prodi}`;
            }
            
            const resAll = await apiFetch(`/tabel2d-rekognisi-lulusan?${yearParams}${deletedParam}${prodiParam}`);
            
            const masterSumber = resAll.masterSumber || [];
            const dataTahunan = resAll.dataTahunan || [];
            const dataDetails = resAll.dataDetails || [];
            
            setMasterSumber(Array.isArray(masterSumber) ? masterSumber : []);
            
            // Set default sumber jika belum ada
            if (!singleInput.id_sumber && masterSumber.length > 0) {
                 setSingleInput(prev => ({ ...prev, id_sumber: String(masterSumber[0]?.id_sumber || "") }));
            }

            const map = {};
            yearOrder.forEach((y) => {
                if (y != null) {
                    const tahunData = dataTahunan.find((d) => String(d.id_tahun) === String(y));
                    
                    if (tahunData) {
                        // Jika showDeleted aktif, hanya tampilkan data yang sudah di-soft delete
                        // Jika showDeleted tidak aktif, hanya tampilkan data yang tidak di-soft delete
                        if (showDeleted && !tahunData.deleted_at) {
                            map[y] = { id_tahunan: null, lulusan_ts: 0, details: [], hasData: false };
                            return;
                        }
                        if (!showDeleted && tahunData.deleted_at) {
                            map[y] = { id_tahunan: null, lulusan_ts: 0, details: [], hasData: false };
                            return;
                        }
                        
                        const id_tahunan = tahunData.id;
                        const lulusan_ts = tahunData.jumlah_lulusan_ts || 0;
                        const deleted_at = tahunData.deleted_at || null;
                        
                        const details = dataDetails
                            .filter((d) => String(d.id_tahunan) === String(id_tahunan))
                            .map(d => ({ 
                                id_sumber: d.id_sumber,
                                jenis_pengakuan: d.jenis_pengakuan,
                                link_bukti: d.link_bukti,
                                jumlah_mahasiswa_rekognisi: d.jumlah_mahasiswa_rekognisi || 0
                            }));
                        
                        map[y] = { id_tahunan, lulusan_ts, details, hasData: true, deleted_at };
                    } else {
                        map[y] = { id_tahunan: null, lulusan_ts: 0, details: [], hasData: false };
                    }
                }
            });
            setDataByYear(map);
        } catch (e) {
            console.error("Error fetching data:", e);
            setError(e?.message || "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    }, [yearOrder, selectedYear, singleInput.id_sumber, showDeleted, selectedProdi, isSuperAdmin, isProdiUser, authUser?.id_unit_prodi]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Menggabungkan data existing dan data baru untuk ditampilkan di daftar submit
    useEffect(() => {
        if (selectedYear && dataByYear[selectedYear] && showAddModal) {
            const existingDetails = dataByYear[selectedYear]?.details || [];
            const id_tahunan = dataByYear[selectedYear]?.id_tahunan;
            // Buat tempId unik untuk data existing agar bisa dihapus dari daftar submit
            setDetailsToSubmit(existingDetails.map((d, i) => ({ 
                ...d, 
                jumlah_mahasiswa_rekognisi: String(d.jumlah_mahasiswa_rekognisi),
                tempId: (id_tahunan || 'existing') + '_' + d.id_sumber + '_' + i // ID unik sementara
            })));
        }
    }, [selectedYear, dataByYear, showAddModal]);
    
    // --- Perhitungan Total dan Persentase ---
    const totalsByYear = useMemo(() => {
        const sums = {};
        yearOrder.forEach((y) => {
            if (y != null) {
                const details = dataByYear[y]?.details || [];
                sums[y] = details.reduce((a, b) => a + Number(b.jumlah_mahasiswa_rekognisi || 0), 0);
            }
        });
        return sums;
    }, [dataByYear, yearOrder]);

    const percentByYear = useMemo(() => {
        const pct = {};
        yearOrder.forEach((y) => {
            if (y != null) {
                const totalRekognisi = totalsByYear[y] || 0;
                const totalLulusan = Number(dataByYear[y]?.lulusan_ts || 0);
                pct[y] = totalLulusan > 0 ? (totalRekognisi / totalLulusan) * 100 : 0;
            }
        });
        return pct;
    }, [totalsByYear, dataByYear, yearOrder]);
    
    // --- Izin Akses ---
    // Superadmin otomatis memiliki semua akses CRUD
    const canRead = isSuperAdmin || roleCan(role, "rekognisi_lulusan", "r");
    const canUpdate = isSuperAdmin || roleCan(role, "rekognisi_lulusan", "U");
    const canCreate = isSuperAdmin || roleCan(role, "rekognisi_lulusan", "C");
    const canDelete = isSuperAdmin || roleCan(role, "rekognisi_lulusan", "D");

    const getTahunName = (id) => {
        return availableYears.find(y => String(y.id) === String(id))?.text || id;
    };
    
    // Fungsi Helper untuk mengakses data tahunan dengan aman
    const getYearData = (yearId) => {
        if (yearId != null && dataByYear && dataByYear[yearId]) {
            return dataByYear[yearId];
        }
        return null;
    };
    
    // Handler untuk mengubah input tunggal
    const handleSingleInputChange = (e) => {
        const { name, value } = e.target;
        setSingleInput(prev => ({ ...prev, [name]: value }));
    };

    // Handler ketika tombol "+ Tambah ke Daftar" ditekan - menambahkan ke daftar
    const handleAddRekognisi = (e) => {
        e.preventDefault(); 
        
        const { id_sumber, jenis_pengakuan, jumlah_mahasiswa_rekognisi, link_bukti } = singleInput;

        if (!id_sumber || !jenis_pengakuan.trim() || !Number(jumlah_mahasiswa_rekognisi)) {
            Swal.fire("Peringatan", "Semua kolom input rincian wajib diisi (Sumber, Jenis Pengakuan, Jumlah Lulusan > 0).", "warning");
            return;
        }

        const newDetail = {
            id_sumber: Number(id_sumber),
            jenis_pengakuan: jenis_pengakuan.trim(),
            jumlah_mahasiswa_rekognisi: Number(jumlah_mahasiswa_rekognisi),
            link_bukti: link_bukti || "",
            tempId: Date.now() 
        };
        
        // Jika sedang edit mode, hapus yang lama dan tambahkan yang baru
        if (editingDetail) {
            setDetailsToSubmit(prev => {
                const filtered = prev.filter(d => d.tempId !== editingDetail.tempId);
                return [...filtered, newDetail];
            });
            setEditingDetail(null);
        } else {
        // Cek apakah kombinasi sumber dan jenis pengakuan sudah ada di detailsToSubmit
        const exists = detailsToSubmit.some(d => 
            d.id_sumber === newDetail.id_sumber && d.jenis_pengakuan === newDetail.jenis_pengakuan
        );

        if (exists) {
                 Swal.fire("Peringatan", "Rincian dengan Sumber dan Jenis Pengakuan yang sama sudah ada di daftar.", "warning");
             return;
        }

        // Tambahkan ke detailsToSubmit
        setDetailsToSubmit(prev => [...prev, newDetail]);
        }

        // Reset form input tunggal, pertahankan id_sumber default
        setSingleInput(prev => ({
            id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
            jenis_pengakuan: "",
            jumlah_mahasiswa_rekognisi: "",
            link_bukti: "",
        }));
    };

    // Handler untuk mengedit rincian dari daftar
    const handleEditDetail = (detail) => {
        setSingleInput({
            id_sumber: String(detail.id_sumber),
            jenis_pengakuan: detail.jenis_pengakuan || "",
            jumlah_mahasiswa_rekognisi: String(detail.jumlah_mahasiswa_rekognisi || ""),
            link_bukti: detail.link_bukti || "",
        });
        setEditingDetail(detail);
    };

    // Handler untuk menghapus rincian dari daftar detailsToSubmit
    const handleDeleteDetail = (tempId) => {
        setDetailsToSubmit(prev => prev.filter(d => d.tempId !== tempId));
    };

    // Handler untuk submit Data TS (Mengirim semua data di detailsToSubmit)
    const handleSubmitBulk = async (e) => {
        e.preventDefault();
        
        if (!selectedYear || !canManageData) {
            Swal.fire("Error", "Tahun akademik tidak valid atau Anda tidak memiliki izin", "error");
            return;
        }

        try {
            setSaving(true);
            
            const payloadDetails = detailsToSubmit
                .filter(d => d.jenis_pengakuan?.trim() || Number(d.jumlah_mahasiswa_rekognisi) > 0)
                .map(d => ({
                    id_sumber: d.id_sumber,
                    jenis_pengakuan: d.jenis_pengakuan,
                    link_bukti: d.link_bukti,
                    jumlah_mahasiswa_rekognisi: Number(d.jumlah_mahasiswa_rekognisi) || 0
                }));

            // Jika daftar rincian kosong, dan ada data historis, tawarkan hapus
            if (payloadDetails.length === 0 && dataByYear[selectedYear]?.hasData) {
                 const confirmed = await Swal.fire({
                    title: "Hapus Semua Rincian?",
                    text: "Daftar rincian kosong. Apakah Anda ingin menghapus semua data rekognisi untuk tahun TS ini?",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Ya, Hapus Semua",
                    cancelButtonText: "Batal"
                });
                if (confirmed.isConfirmed) {
                    await handleDeleteTS();
                }
                setSaving(false);
                return;
            } else if (payloadDetails.length === 0) {
                 Swal.fire("Peringatan", "Tambahkan minimal satu rincian rekognisi sebelum menyimpan.", "warning");
                 setSaving(false);
                 return;
            }

            const payload = {
                id_tahun: Number(selectedYear),
                details: payloadDetails
            };

            await apiFetch("/tabel2d-rekognisi-lulusan", {
                method: "POST", // CREATE/UPDATE
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            Swal.fire("Berhasil!", isEditMode ? "Data rekognisi berhasil diperbarui" : "Data rekognisi berhasil disimpan", "success");
            await fetchData(); 
            setShowAddModal(false);
            setIsEditMode(false);
            setEditingDetail(null);
            setDetailsToSubmit([]);
            
            // Reset form
            setSingleInput({
                id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
                jenis_pengakuan: "",
                jumlah_mahasiswa_rekognisi: "",
                link_bukti: "",
            });
            
        } catch (e) {
            console.error("Error submitting:", e);
            Swal.fire("Error", e?.message || "Gagal menyimpan data", "error");
        } finally {
            setSaving(false);
        }
    };

    // Handler untuk membuka modal edit data TS
    const handleEditTS = () => {
        if (!selectedYear || !dataByYear[selectedYear]?.hasData) {
            Swal.fire("Info", "Tidak ada data untuk diedit.", "info");
            return;
        }

        // Inisialisasi dengan data existing
        const existingDetails = dataByYear[selectedYear]?.details || [];
        const id_tahunan = dataByYear[selectedYear]?.id_tahunan;
        setDetailsToSubmit(existingDetails.map((d, i) => ({ 
            ...d, 
            jumlah_mahasiswa_rekognisi: String(d.jumlah_mahasiswa_rekognisi),
            tempId: (id_tahunan || 'existing') + '_' + d.id_sumber + '_' + i
        })));
        
        // Reset form input
        setSingleInput({
            id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
            jenis_pengakuan: "",
            jumlah_mahasiswa_rekognisi: "",
            link_bukti: "",
        });
        setIsEditMode(true);
        setEditingDetail(null);
        setShowAddModal(true);
    };
    
    // Handler untuk memulihkan data TS yang sudah di-soft delete
    const handleRestoreTS = async () => {
        const yearId = selectedYear || yearOrder[0];
        const data = getYearData(yearId);
        
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
            text: `Data rekognisi untuk tahun ${getTahunName(yearId)} akan dipulihkan.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Ya, pulihkan!",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            try {
                await apiFetch(`/tabel2d-rekognisi-lulusan/${data.id_tahunan}/restore`, { method: "PUT" });
                Swal.fire("Berhasil", "Data berhasil dipulihkan.", "success");
                await fetchData(); 
                return true; 
            } catch (e) {
                Swal.fire("Error", e?.message || "Gagal memulihkan data", "error");
                return false;
            }
        }
        return false;
    };

    // Handler Hard Delete Seluruh Data TS (Permanent)
    const handleHardDeleteTS = async () => {
        const yearId = selectedYear || yearOrder[0];
        const data = getYearData(yearId);
        
        if (!data?.id_tahunan || !canManageData) {
            Swal.fire("Info", "Tidak ada data untuk dihapus atau Anda tidak memiliki izin.", "info");
            return false;
        }

        const confirm = await Swal.fire({
            title: "PERINGATAN: Hapus Permanen?",
            text: `Data rekognisi untuk tahun ${getTahunName(yearId)} akan dihapus PERMANEN dan tidak dapat dikembalikan!`,
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus permanen!",
            cancelButtonText: "Batal",
            dangerMode: true
        });

        if (confirm.isConfirmed) {
            try {
                await apiFetch(`/tabel2d-rekognisi-lulusan/${data.id_tahunan}/hard`, { method: "DELETE" });
                Swal.fire("Berhasil", "Data berhasil dihapus secara permanen.", "success");
                await fetchData(); 
                return true; 
            } catch (e) {
                Swal.fire("Error", e?.message || "Gagal menghapus data permanen", "error");
                return false;
            }
        }
        return false;
    };
    
    // Handler Soft Delete Seluruh Data TS
    const handleDeleteTS = async () => {
        const yearId = selectedYear || yearOrder[0];
        const data = getYearData(yearId);
        
        if (!data?.id_tahunan || !canManageData) {
            Swal.fire("Info", "Tidak ada data untuk dihapus atau Anda tidak memiliki izin.", "info");
            return false;
        }

        const confirm = await Swal.fire({
            title: "Yakin ingin menghapus?",
            text: `Semua Data rekognisi untuk tahun ${getTahunName(yearId)} akan di-soft delete.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            try {
                // Menggunakan softDeleteRekognisi (rute: DELETE /:id)
                await apiFetch(`/tabel2d-rekognisi-lulusan/${data.id_tahunan}`, { method: "DELETE" });
                Swal.fire("Berhasil", "Data berhasil di-soft delete.", "success");
                await fetchData(); 
                return true; 
            } catch (e) {
                Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
                return false;
            }
        }
        return false;
    };

    // --- Render ---
    return (
        <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-8">
            <header className="pb-6 mb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Tabel 2.D Rekognisi Lulusan</h2>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-slate-600">
                    Menampilkan TS-4 hingga TS berdasarkan tahun akademik terpilih.
                  </p>
                  {!loading && (
                    <span className="inline-flex items-center text-sm text-slate-700">
                      Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{masterSumber.length}</span>
                    </span>
                  )}
                </div>
            </header>

            {/* Bagian Kontrol dan Filter */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2 flex-wrap">
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
                            >
                                {availableProdi.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nama}</option>
                                ))}
                            </select>
                        </>
                    )}
                    
                    {canDelete && !isProdiTIorMI && (
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
                    {canCreate && canManageData && (
                        <button
                            onClick={() => {
                                // Reset form dan inisialisasi dengan data existing
                                const existingDetails = dataByYear[selectedYear]?.details || [];
                                const id_tahunan = dataByYear[selectedYear]?.id_tahunan;
                                setDetailsToSubmit(existingDetails.map((d, i) => ({ 
                                    ...d, 
                                    jumlah_mahasiswa_rekognisi: String(d.jumlah_mahasiswa_rekognisi),
                                    tempId: (id_tahunan || 'existing') + '_' + d.id_sumber + '_' + i
                                })));
                                setSingleInput({
                                    id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
                                    jenis_pengakuan: "",
                                    jumlah_mahasiswa_rekognisi: "",
                                    link_bukti: "",
                                });
                                setIsEditMode(false);
                                setEditingDetail(null);
                                setShowAddModal(true);
                            }}
                            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || !selectedYear}
                        >
                            + Tambah Data
                        </button>
                    )}
                    <button 
                        onClick={() => window.open(`/api/tabel2d-rekognisi-lulusan/export`, '_blank')}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                        Export Excel
                    </button>
                    {canManageData && dataByYear[selectedYear]?.hasData && (
                        <>
                            {showDeleted ? (
                                <>
                                    <button 
                                        onClick={handleRestoreTS}
                                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                                        disabled={!canUpdate || !dataByYear[selectedYear]?.deleted_at}
                                    >
                                        Pulihkan Data TS
                                    </button>
                                    <button 
                                        onClick={handleHardDeleteTS}
                                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                                        disabled={!canDelete}
                                    >
                                        Hapus Data TS
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleEditTS}
                                        className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] transition-colors"
                                        disabled={!canUpdate}
                                    >
                                        Edit Data TS
                                    </button>
                        <button 
                            onClick={handleDeleteTS}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                                        disabled={!canDelete}
                        >
                            Hapus Data TS
                        </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>
            )}



            {/* Tabel 2.D Output (Output Final) */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Tabel 2.D: Rekognisi dan Apresiasi Kompetensi Lulusan</h3>
                {loading ? (
                     <div className="p-4 text-sm text-slate-600 text-center">Memuat data...</div>
                ) : !canRead ? (
                    <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm">
                        Anda tidak memiliki akses untuk membaca tabel ini.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                                <tr>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">SUMBER REKOGNISI</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">JENIS PENGAKUAN LULUSAN (REKOGNISI)</th>
                                    <th colSpan={yearOrder.length} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TAHUN AKADEMIK</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">LINK BUKTI</th>
                                </tr>
                                <tr>
                                    {yearOrder.map((y, idx) => {
                                        // Label TS-4, TS-3, TS-2, TS-1, TS berdasarkan urutan
                                        const labels = ['TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS'];
                                        const label = labels[idx] || getTahunName(y);
                                        return (
                                            <th key={y ?? `null-${idx}`} className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white/20">
                                                {label}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {masterSumber.map((sumber, idx) => {
                                    // Ambil detail untuk setiap tahun dan kombinasi sumber
                                    const detailsByYear = yearOrder.map(y => {
                                        const yearData = getYearData(y);
                                        return yearData?.details.find(d => d.id_sumber === sumber.id_sumber) || null;
                                    });
                                    
                                    // Ambil jenis pengakuan dari tahun TS (terakhir)
                                    const jenisPengakuan = detailsByYear[detailsByYear.length - 1]?.jenis_pengakuan || '-';
                                    const linkBukti = detailsByYear[detailsByYear.length - 1]?.link_bukti || '';
                                    
                                    // Cek apakah ada data yang sudah di-soft delete untuk sumber ini
                                    const hasDeletedData = yearOrder.some(y => {
                                        const yearData = getYearData(y);
                                        return yearData?.deleted_at;
                                    });
                                    
                                    // Alternating row colors seperti tabel lain
                                    const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50";
                                    // Tambahkan styling khusus untuk data yang sudah di-soft delete
                                    const deletedStyle = hasDeletedData ? "opacity-60 bg-red-50" : "";
                                    
                                    return (
                                        <tr key={sumber.id_sumber} className={`transition-colors ${rowBg} ${deletedStyle} hover:bg-[#eaf4ff]`}>
                                            <td className="px-4 py-3 text-slate-800 border border-slate-200 font-medium bg-gray-50">
                                                {hasDeletedData && <span className="text-red-600 text-xs mr-1">[Dihapus]</span>}
                                                {sumber.nama_sumber}
                                            </td>
                                            <td className="px-4 py-3 text-slate-800 border border-slate-200 text-left">{jenisPengakuan}</td>
                                            {yearOrder.map((y, yearIdx) => {
                                                const detail = detailsByYear[yearIdx];
                                                const yearData = getYearData(y);
                                                const isDeleted = yearData?.deleted_at;
                                                const count = detail?.jumlah_mahasiswa_rekognisi || 0;
                                                return (
                                                    <td key={y ?? `null-${yearIdx}`} className={`px-4 py-3 text-slate-800 border border-slate-200 text-center ${isDeleted ? 'line-through text-red-600' : ''}`}>
                                                        {count > 0 ? count : ''}
                                                    </td>
                                                );
                                            })}
                                            <td className="px-4 py-3 border border-slate-200 text-center">
                                                {linkBukti ? (
                                                    <a href={linkBukti} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                                                        Link
                                                    </a>
                                                ) : ("-")}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3 border border-slate-200 text-slate-800 bg-gray-50" colSpan={2}>Jumlah Rekognisi</td>
                                    {yearOrder.map((y, idx) => (
                                        <td key={`total-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                                            {totalsByYear[y] ?? 0}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 border border-slate-200"></td>
                                </tr>
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3 border border-slate-200 text-slate-800 bg-gray-50" colSpan={2}>Jumlah Lulusan</td>
                                    {yearOrder.map((y, idx) => (
                                        <td key={`lulusan-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                                            {getYearData(y)?.lulusan_ts ?? 0}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 border border-slate-200" rowSpan={2}></td>
                                </tr>
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3 border border-slate-200 text-slate-800 bg-gray-50" colSpan={2}>Persentase</td>
                                    {yearOrder.map((y, idx) => (
                                        <td key={`persen-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                                            {`${(percentByYear[y] ?? 0).toFixed(2)}%`}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Tambah Data */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white sticky top-0">
                            <h3 className="text-xl font-bold">{isEditMode ? "Edit Data Rekognisi Lulusan" : "Tambah Data Rekognisi Lulusan"}</h3>
                            <p className="text-white/80 mt-1 text-sm">Lengkapi data rekognisi lulusan untuk tahun TS ({getTahunName(selectedYear)})</p>
                        </div>
                        <div className="p-8">
                            {/* Form Input Rincian Baris Tunggal - Hanya tampil jika mode tambah dan tidak sedang edit detail */}
                            {!isEditMode && !editingDetail && (
                                <form onSubmit={handleAddRekognisi} className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Tambah Rincian Rekognisi</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Sumber Rekognisi <span className="text-red-500">*</span></label>
                                            <select
                                                name="id_sumber"
                                                value={singleInput.id_sumber}
                                                onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                                required
                                            >
                                                <option value="" disabled>Pilih Sumber...</option>
                                                {masterSumber.map(s => (
                                                    <option key={s.id_sumber} value={s.id_sumber}>{s.nama_sumber}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Jenis Pengakuan Lulusan (Rekognisi) <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="jenis_pengakuan"
                                                value={singleInput.jenis_pengakuan}
                                                onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                                placeholder="Contoh: Juara 1 Lomba..."
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Jumlah Mahasiswa <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                                name="jumlah_mahasiswa_rekognisi"
                                                min="0"
                                                value={singleInput.jumlah_mahasiswa_rekognisi}
                                                onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                                placeholder="0"
                                                required
                            />
                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Link Bukti</label>
                            <input
                                                type="url"
                                                name="link_bukti"
                                                value={singleInput.link_bukti}
                                                onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                                placeholder="https://"
                            />
                        </div>
                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving || !singleInput.id_sumber}
                                            className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            + Tambah ke Daftar
                                        </button>
                </div>
                                </form>
            )}

                            {/* Form Edit Rincian - Hanya tampil jika sedang edit detail */}
                            {editingDetail && (
                                <form onSubmit={handleAddRekognisi} className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Edit Rincian Rekognisi</h4>
                                    
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Sedang mengedit:</strong> {masterSumber.find(s => s.id_sumber === editingDetail.id_sumber)?.nama_sumber || 'N/A'} - {editingDetail.jenis_pengakuan}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingDetail(null);
                                                setSingleInput({
                                                    id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
                                                    jenis_pengakuan: "",
                                                    jumlah_mahasiswa_rekognisi: "",
                                                    link_bukti: "",
                                                });
                                            }}
                                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Batalkan Edit
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Sumber Rekognisi <span className="text-red-500">*</span></label>
                                <select
                                    name="id_sumber"
                                    value={singleInput.id_sumber}
                                    onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                    required
                                >
                                    <option value="" disabled>Pilih Sumber...</option>
                                    {masterSumber.map(s => (
                                        <option key={s.id_sumber} value={s.id_sumber}>{s.nama_sumber}</option>
                                    ))}
                                </select>
                            </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Jenis Pengakuan Lulusan (Rekognisi) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="jenis_pengakuan"
                                    value={singleInput.jenis_pengakuan}
                                    onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                    placeholder="Contoh: Juara 1 Lomba..."
                                    required
                                />
                            </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Jumlah Mahasiswa <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="jumlah_mahasiswa_rekognisi"
                                    min="0"
                                    value={singleInput.jumlah_mahasiswa_rekognisi}
                                    onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">Link Bukti</label>
                                <input
                                    type="url"
                                    name="link_bukti"
                                    value={singleInput.link_bukti}
                                    onChange={handleSingleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                                    placeholder="https://"
                                />
                                        </div>
                            </div>

                                    <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving || !singleInput.id_sumber}
                                            className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                            Perbarui Rincian
                                </button>
                        </div>
                    </form>
                            )}

                            {/* Daftar Rincian yang Akan Di-Submit */}
                            <form onSubmit={handleSubmitBulk} className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 mb-4">Daftar Rincian untuk Tahun TS ({getTahunName(selectedYear)})</h4>
                        
                                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                            <table className="min-w-full text-sm text-left border-collapse">
                                        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                                    <tr>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Sumber</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Jenis Pengakuan</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Jumlah</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Link Bukti</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Aksi</th>
                                    </tr>
                                </thead>
                                        <tbody className="divide-y divide-slate-200">
                                    {detailsToSubmit.length === 0 ? (
                                        <tr>
                                                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500 border border-slate-200">
                                                Tidak ada rincian yang ditambahkan.
                                            </td>
                                        </tr>
                                    ) : (
                                        detailsToSubmit.map((detail, index) => {
                                            const source = masterSumber.find(s => s.id_sumber === detail.id_sumber)?.nama_sumber || 'N/A';
                                                    const rowBg = index % 2 === 0 ? "bg-white" : "bg-slate-50";
                                                    const isEditing = editingDetail && editingDetail.tempId === detail.tempId;
                                            return (
                                                        <tr key={detail.tempId || index} className={`transition-colors ${rowBg} hover:bg-[#eaf4ff] ${isEditing ? 'ring-2 ring-[#0384d6]' : ''}`}>
                                                            <td className="px-4 py-3 text-slate-800 border border-slate-200 font-medium">{source}</td>
                                                            <td className="px-4 py-3 text-slate-800 border border-slate-200">{detail.jenis_pengakuan}</td>
                                                            <td className="px-4 py-3 text-slate-800 border border-slate-200 text-center">{detail.jumlah_mahasiswa_rekognisi}</td>
                                                            <td className="px-4 py-3 border border-slate-200">
                                                                {detail.link_bukti ? (
                                                                    <a href={detail.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                                                                        Link
                                                                    </a>
                                                                ) : '-'}
                                                    </td>
                                                            <td className="px-4 py-3 text-center border border-slate-200">
                                                                {isEditMode && (
                                                        <button 
                                                            type="button" 
                                                                        onClick={() => handleEditDetail(detail)}
                                                                        className="text-[#0384d6] hover:text-[#043975] font-medium"
                                                                        title="Edit rincian ini"
                                                                    >
                                                                        Edit
                                                        </button>
                                                                )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setIsEditMode(false);
                                            setEditingDetail(null);
                                            setDetailsToSubmit([]);
                                            setSingleInput({
                                                id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
                                                jenis_pengakuan: "",
                                                jumlah_mahasiswa_rekognisi: "",
                                                link_bukti: "",
                                            });
                                        }} 
                                        className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                            <button
                                type="submit"
                                disabled={saving || (detailsToSubmit.length === 0 && !dataByYear[selectedYear]?.hasData)}
                                className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Menyimpan..." : (dataByYear[selectedYear]?.hasData ? "Perbarui Semua Data TS" : "Simpan Semua Data TS")}
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
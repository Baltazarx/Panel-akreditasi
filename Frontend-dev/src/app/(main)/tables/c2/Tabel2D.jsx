"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
// Import disesuaikan dengan asumsi struktur proyek
import { apiFetch } from "../../../../lib/api"; 
import { useMaps } from "../../../../hooks/useMaps"; 
import { roleCan } from "../../../../lib/role"; 
import { useAuth } from "../../../../context/AuthContext";
import Swal from "sweetalert2";
import { FiChevronDown, FiCalendar, FiBriefcase, FiShield, FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

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
    
    // Dropdown states for filters and forms
    const [openYearFilterDropdown, setOpenYearFilterDropdown] = useState(false);
    const [openProdiFilterDropdown, setOpenProdiFilterDropdown] = useState(false);
    const [openFormSumberDropdown, setOpenFormSumberDropdown] = useState(false);

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
        // Close form dropdowns when modal closes
        setOpenFormSumberDropdown(false);
      }
    }, [showAddModal]);

    // Close filter dropdowns when values change
    useEffect(() => {
      setOpenYearFilterDropdown(false);
    }, [selectedYear]);

    useEffect(() => {
      setOpenProdiFilterDropdown(false);
    }, [selectedProdi]);

    // Close filter and form dropdowns on outside click
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (openYearFilterDropdown && !event.target.closest('.year-filter-dropdown-container') && !event.target.closest('.year-filter-dropdown-menu')) {
          setOpenYearFilterDropdown(false);
        }
        if (openProdiFilterDropdown && !event.target.closest('.prodi-filter-dropdown-container') && !event.target.closest('.prodi-filter-dropdown-menu')) {
          setOpenProdiFilterDropdown(false);
        }
        if (openFormSumberDropdown && !event.target.closest('.form-sumber-dropdown-container') && !event.target.closest('.form-sumber-dropdown-menu')) {
          setOpenFormSumberDropdown(false);
        }
      };

      if (openYearFilterDropdown || openProdiFilterDropdown || openFormSumberDropdown) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }, [openYearFilterDropdown, openProdiFilterDropdown, openFormSumberDropdown]);
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
        const allYears = Object.values(maps.tahun || {})
          .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
          .filter((t) => t.id)
          .sort((a, b) => Number(a.id) - Number(b.id));
        
        // Filter tahun mulai dari 2020/2021 (id >= 2020 atau text mengandung "2020")
        const filteredYears = allYears.filter((t) => {
            const yearId = Number(t.id);
            const yearText = String(t.text || "").toLowerCase();
            return yearId >= 2020 || yearText.includes("2020");
        });
        
        return filteredYears;
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
        if (availableYears.length === 0) return [];
        
        // Gunakan selectedYear jika ada, jika tidak gunakan tahun terakhir sebagai default
        const tahunReferensi = selectedYear || (availableYears.length > 0 ? String(availableYears[availableYears.length - 1].id) : null);
        
        if (!tahunReferensi) return [];
        
        const idx = availableYears.findIndex((y) => String(y.id) === String(tahunReferensi));
        if (idx === -1) return [];
        
        // PENTING: Tahun yang dipilih (selectedYear) SELALU menjadi TS di kolom paling kanan
        // ts adalah tahun yang dipilih, akan masuk ke kolom TS (index terakhir array)
        const ts = availableYears[idx]?.id; // Tahun yang dipilih = TS (kolom paling kanan)
        const ts1 = idx > 0 ? availableYears[idx - 1]?.id : null; // Tahun sebelumnya = TS-1
        const ts2 = idx > 1 ? availableYears[idx - 2]?.id : null; // Tahun sebelumnya lagi = TS-2
        const ts3 = idx > 2 ? availableYears[idx - 3]?.id : null; // Tahun sebelumnya lagi = TS-3
        const ts4 = idx > 3 ? availableYears[idx - 4]?.id : null; // Tahun sebelumnya lagi = TS-4
        
        // Urutan array dari kiri ke kanan: [TS-4, TS-3, TS-2, TS-1, TS]
        // ts (tahun yang dipilih/selectedYear) SELALU ada di index terakhir, sesuai dengan label 'TS' di index terakhir
        // Contoh: Pilih 2020/2021 → ts = 2020/2021 (TS), ts1 = tahun sebelumnya (TS-1), dst.
        // Jika tidak ada tahun sebelumnya, akan ada null di array, tapi kita tetap tampilkan 5 kolom
        return [ts4, ts3, ts2, ts1, ts];
    }, [availableYears, selectedYear]);

    // State untuk menandai apakah "Semua Tahun" dipilih
    const isAllYearsSelected = selectedYear === "all";

    // Mapping tahun ke label untuk memastikan label selalu sesuai dengan posisi relatif terhadap tahun yang dipilih
    const yearLabelMap = useMemo(() => {
        if (!selectedYear && availableYears.length === 0) return {};
        
        // Gunakan selectedYear atau tahun terakhir sebagai referensi
        const tahunReferensi = selectedYear || (availableYears.length > 0 ? String(availableYears[availableYears.length - 1].id) : null);
        if (!tahunReferensi) return {};
        
        const idx = availableYears.findIndex((y) => String(y.id) === String(tahunReferensi));
        if (idx === -1) return {};
        
        const map = {};
        // Tahun yang dipilih = TS
        map[availableYears[idx]?.id] = 'TS';
        // Tahun sebelumnya = TS-1
        if (idx > 0) map[availableYears[idx - 1]?.id] = 'TS-1';
        // Tahun sebelumnya lagi = TS-2
        if (idx > 1) map[availableYears[idx - 2]?.id] = 'TS-2';
        // Tahun sebelumnya lagi = TS-3
        if (idx > 2) map[availableYears[idx - 3]?.id] = 'TS-3';
        // Tahun sebelumnya lagi = TS-4
        if (idx > 3) map[availableYears[idx - 4]?.id] = 'TS-4';
        
        return map;
    }, [availableYears, selectedYear]);

    useEffect(() => {
        if (!selectedYear && availableYears.length) {
            // Default ke tahun 2024/2025 jika ada, jika tidak ada fallback ke tahun terakhir
            // Prioritas: cari yang mengandung "2024/2025" terlebih dahulu
            let tahun2024 = availableYears.find(y => {
                const yearText = String(y.text || "").toLowerCase();
                const yearId = String(y.id || "");
                return (yearText.includes("2024/2025") || yearId.includes("2024/2025"));
            });
            
            // Jika tidak ketemu "2024/2025", cari yang mengandung "2024" atau "2025"
            if (!tahun2024) {
                tahun2024 = availableYears.find(y => {
                    const yearText = String(y.text || "").toLowerCase();
                    const yearId = String(y.id || "");
                    return yearText.includes("2024") || yearText.includes("2025") || 
                           yearId.includes("2024") || yearId.includes("2025");
                });
            }
            
            if (tahun2024?.id) {
                setSelectedYear(String(tahun2024.id));
            } else {
                // Fallback ke tahun terakhir jika 2024/2025 tidak ditemukan
                const latestYear = availableYears[availableYears.length - 1];
                if (latestYear?.id) {
                    setSelectedYear(String(latestYear.id));
                }
            }
        }
    }, [availableYears, selectedYear]);

    // Default ke prodi pertama untuk superadmin
    useEffect(() => {
        if (isSuperAdmin && !selectedProdi && availableProdi.length > 0) {
            setSelectedProdi(String(availableProdi[0].id));
        }
    }, [isSuperAdmin, availableProdi, selectedProdi]);
    
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
            const idA = a.id_sumber || a.id || 0;
            const idB = b.id_sumber || b.id || 0;
            return idB - idA;
        });
    }, []);

    // --- Fetch Data Utama ---
    const fetchData = useCallback(async () => {
        // Filter tahun yang valid (bukan null) untuk fetch data
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length === 0) {
            setMasterSumber([]);
            setDataByYear({});
            return;
        }

        try {
            setLoading(true);
            setError("");
            
            const yearParams = `id_tahun_in=${validYears.join(',')}`;
            const deletedParam = showDeleted ? '&include_deleted=1' : '';
            
            // Tambahkan parameter prodi jika superadmin memilih prodi atau user prodi
            // Untuk superadmin: hanya kirim id_unit_prodi jika memilih prodi di dropdown (biarkan backend tidak filter jika tidak dipilih)
            // Untuk prodi user: selalu kirim id_unit_prodi untuk filter data mereka
            let prodiParam = '';
            if (isSuperAdmin && selectedProdi) {
                prodiParam = `&id_unit_prodi=${selectedProdi}`;
            } else if (isProdiUser && authUser?.id_unit_prodi) {
                prodiParam = `&id_unit_prodi=${authUser.id_unit_prodi}`;
            }
            // Jika superadmin tidak memilih prodi, jangan kirim prodiParam agar backend tidak filter (superadmin bisa lihat semua)
            
            const resAll = await apiFetch(`/tabel2d-rekognisi-lulusan?${yearParams}${deletedParam}${prodiParam}`);
            
            const masterSumber = resAll.masterSumber || [];
            const dataTahunan = resAll.dataTahunan || [];
            const dataDetails = resAll.dataDetails || [];
            
            // Set master sumber dengan sorting
            const sortedSumber = sortRowsByLatest(Array.isArray(masterSumber) ? masterSumber : []);
            setMasterSumber(sortedSumber);
            
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
                                jumlah_mahasiswa_rekognisi: d.jumlah_mahasiswa_rekognisi || 0,
                                created_at: d.created_at,
                                updated_at: d.updated_at,
                                id: d.id
                            }))
                            .sort((a, b) => {
                                // Sort details berdasarkan terbaru
                                if (a.updated_at && b.updated_at) {
                                    const dateA = new Date(a.updated_at);
                                    const dateB = new Date(b.updated_at);
                                    if (dateA.getTime() !== dateB.getTime()) {
                                        return dateB.getTime() - dateA.getTime();
                                    }
                                }
                                if (a.created_at && b.created_at) {
                                    const dateA = new Date(a.created_at);
                                    const dateB = new Date(b.created_at);
                                    if (dateA.getTime() !== dateB.getTime()) {
                                        return dateB.getTime() - dateA.getTime();
                                    }
                                }
                                return (b.id || 0) - (a.id || 0);
                            });
                        
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
    }, [yearOrder, selectedYear, singleInput.id_sumber, showDeleted, selectedProdi, isSuperAdmin, isProdiUser, authUser?.id_unit_prodi, sortRowsByLatest]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // State untuk track apakah modal baru saja dibuka (untuk mencegah reset detailsToSubmit yang tidak perlu)
    const [modalJustOpened, setModalJustOpened] = useState(false);

    // Menggabungkan data existing dan data baru untuk ditampilkan di daftar submit
    // Hanya reset detailsToSubmit saat modal pertama kali dibuka (ketika modalJustOpened = true)
    useEffect(() => {
        if (selectedYear && dataByYear[selectedYear] && showAddModal && modalJustOpened) {
            const existingDetails = dataByYear[selectedYear]?.details || [];
            const id_tahunan = dataByYear[selectedYear]?.id_tahunan;
            
            // Reset detailsToSubmit dengan data existing saat modal baru dibuka
            setDetailsToSubmit(existingDetails.map((d, i) => ({ 
                ...d, 
                jumlah_mahasiswa_rekognisi: String(d.jumlah_mahasiswa_rekognisi),
                tempId: (id_tahunan || 'existing') + '_' + d.id_sumber + '_' + i
            })));
            setModalJustOpened(false);
        }
    }, [selectedYear, yearOrder, dataByYear, showAddModal, modalJustOpened]);
    
    // Reset flag saat modal ditutup
    useEffect(() => {
        if (!showAddModal) {
            setModalJustOpened(false);
        }
    }, [showAddModal]);
    
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

    // Fungsi export Excel
    const handleExport = async () => {
        try {
            if (!selectedYear || yearOrder.length === 0 || masterSumber.length === 0) {
                throw new Error('Tidak ada data untuk diekspor.');
            }

            // Prepare data untuk export sesuai struktur tabel
            const exportData = [];
            
            // Tambahkan header (merged header)
            const headerRow1 = ['SUMBER REKOGNISI', 'JENIS PENGAKUAN LULUSAN (REKOGNISI)', ...yearOrder.map((y) => {
                return yearLabelMap[y] || getTahunName(y);
            }), 'LINK BUKTI'];
            exportData.push(headerRow1);
            
            // Tambahkan baris untuk setiap sumber
            masterSumber.forEach((sumber) => {
                // Ambil detail untuk setiap tahun
                const detailsByYear = yearOrder.map(y => {
                    const yearData = getYearData(y);
                    return yearData?.details.find(d => d.id_sumber === sumber.id_sumber) || null;
                });
                
                // Ambil jenis pengakuan dari tahun TS (tahun yang dipilih, index terakhir)
                const jenisPengakuan = detailsByYear[detailsByYear.length - 1]?.jenis_pengakuan || '-';
                const linkBukti = detailsByYear[detailsByYear.length - 1]?.link_bukti || '';
                
                const sumberRow = [
                    sumber.nama_sumber || '',
                    jenisPengakuan,
                    ...detailsByYear.map(detail => detail?.jumlah_mahasiswa_rekognisi || 0),
                    linkBukti
                ];
                exportData.push(sumberRow);
            });
            
            // Tambahkan baris Jumlah Rekognisi
            exportData.push([
                'Jumlah Rekognisi',
                '',
                ...yearOrder.map(y => totalsByYear[y] ?? 0),
                ''
            ]);
            
            // Tambahkan baris Jumlah Lulusan
            exportData.push([
                'Jumlah Lulusan',
                '',
                ...yearOrder.map(y => getYearData(y)?.lulusan_ts ?? 0),
                ''
            ]);
            
            // Tambahkan baris Persentase
            exportData.push([
                'Persentase',
                '',
                ...yearOrder.map(y => `${(percentByYear[y] ?? 0).toFixed(2)}%`),
                ''
            ]);

            // Buat workbook baru
            const wb = XLSX.utils.book_new();
            
            // Buat worksheet dari array data
            const ws = XLSX.utils.aoa_to_sheet(exportData);
            
            // Set column widths
            const colWidths = [
                { wch: 30 },  // SUMBER REKOGNISI
                { wch: 40 },  // JENIS PENGAKUAN LULUSAN (REKOGNISI)
                ...yearOrder.map(() => ({ wch: 15 })), // Kolom tahun
                { wch: 40 }   // LINK BUKTI
            ];
            ws['!cols'] = colWidths;
            
            // Tambahkan worksheet ke workbook
            const sheetName = showDeleted ? 'Data Terhapus' : 'Data Rekognisi';
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            
            // Generate file dan download
            const fileName = `Tabel_2D_Rekognisi_Lulusan_${new Date().toISOString().split('T')[0]}.xlsx`;
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
                const escapeCsv = (str) => {
                    if (str === null || str === undefined) return '';
                    const strValue = String(str);
                    if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
                        return `"${strValue.replace(/"/g, '""')}"`;
                    }
                    return strValue;
                };
                
                const headerRow = ['SUMBER REKOGNISI', 'JENIS PENGAKUAN LULUSAN (REKOGNISI)', ...yearOrder.map((y) => {
                    return yearLabelMap[y] || getTahunName(y);
                }), 'LINK BUKTI'];
                
                const csvRows = [
                    headerRow,
                    ...masterSumber.map(sumber => {
                        const detailsByYear = yearOrder.map(y => {
                            const yearData = getYearData(y);
                            return yearData?.details.find(d => d.id_sumber === sumber.id_sumber) || null;
                        });
                        const jenisPengakuan = detailsByYear[detailsByYear.length - 1]?.jenis_pengakuan || '-';
                        const linkBukti = detailsByYear[detailsByYear.length - 1]?.link_bukti || '';
                        return [
                            sumber.nama_sumber || '',
                            jenisPengakuan,
                            ...detailsByYear.map(detail => detail?.jumlah_mahasiswa_rekognisi || 0),
                            linkBukti
                        ];
                    }),
                    ['Jumlah Rekognisi', '', ...yearOrder.map(y => totalsByYear[y] ?? 0), ''],
                    ['Jumlah Lulusan', '', ...yearOrder.map(y => getYearData(y)?.lulusan_ts ?? 0), ''],
                    ['Persentase', '', ...yearOrder.map(y => `${(percentByYear[y] ?? 0).toFixed(2)}%`), '']
                ].map(row => row.map(cell => escapeCsv(cell)).join(','));
                
                const csvContent = '\ufeff' + csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Tabel_2D_Rekognisi_Lulusan_${new Date().toISOString().split('T')[0]}.csv`;
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
    
    // Handler untuk mengubah input tunggal
    const handleSingleInputChange = (e) => {
        const { name, value } = e.target;
        setSingleInput(prev => ({ ...prev, [name]: value }));
    };

    // Handler ketika tombol "+ Tambah ke Daftar" ditekan - menambahkan ke daftar
    const handleAddRekognisi = (e) => {
        e.preventDefault();
        setOpenFormSumberDropdown(false);
        
        const { id_sumber, jenis_pengakuan, jumlah_mahasiswa_rekognisi, link_bukti } = singleInput;

        // Validasi: id_sumber dan jenis_pengakuan wajib, jumlah_mahasiswa_rekognisi harus angka dan >= 0
        const jumlahNum = Number(jumlah_mahasiswa_rekognisi);
        if (!id_sumber || !jenis_pengakuan.trim() || isNaN(jumlahNum) || jumlahNum < 0) {
            Swal.fire("Peringatan", "Semua kolom input rincian wajib diisi (Sumber, Jenis Pengakuan, Jumlah Mahasiswa >= 0).", "warning");
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
        setOpenFormSumberDropdown(false);
        
        // Gunakan tahun TS (tahun terakhir dari yearOrder) jika selectedYear belum dipilih
        const tahunTS = selectedYear || (yearOrder.length > 0 ? String(yearOrder[yearOrder.length - 1]) : null);
        
        if (!tahunTS || isAllYearsSelected || !canManageData) {
            Swal.fire("Error", "Tidak dapat menambah atau mengedit data", "error");
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

            // Gunakan tahun TS (tahun terakhir dari yearOrder) jika selectedYear belum dipilih
            const tahunTS = selectedYear || (yearOrder.length > 0 ? String(yearOrder[yearOrder.length - 1]) : null);
            
            // Jika daftar rincian kosong, dan ada data historis, tawarkan hapus
            if (payloadDetails.length === 0 && tahunTS && dataByYear[tahunTS]?.hasData) {
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

            // Tentukan id_unit_prodi untuk payload
            // Untuk superadmin: gunakan selectedProdi jika ada, atau fallback ke id_unit_prodi/id_unit dari authUser
            // Untuk prodi user: gunakan id_unit_prodi dari authUser
            let id_unit_prodi_payload = null;
            if (isSuperAdmin && selectedProdi) {
                id_unit_prodi_payload = Number(selectedProdi);
            } else if (isSuperAdmin && (authUser?.id_unit_prodi || authUser?.unit)) {
                id_unit_prodi_payload = Number(authUser.id_unit_prodi || authUser.unit);
            } else if (isProdiUser && authUser?.id_unit_prodi) {
                id_unit_prodi_payload = Number(authUser.id_unit_prodi);
            }

            const payload = {
                id_tahun: Number(selectedYear),
                details: payloadDetails,
                ...(id_unit_prodi_payload && { id_unit_prodi: id_unit_prodi_payload })
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
        if (!selectedYear || isAllYearsSelected || !dataByYear[selectedYear]?.hasData) {
            Swal.fire("Info", isAllYearsSelected ? "Pilih tahun akademik spesifik untuk mengedit data" : "Tidak ada data untuk diedit.", "info");
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
        setModalJustOpened(true);
        setShowAddModal(true);
    };
    
    // Handler untuk memulihkan data TS yang sudah di-soft delete
    const handleRestoreTS = async () => {
        if (isAllYearsSelected) {
            Swal.fire("Info", "Pilih tahun akademik spesifik untuk memulihkan data", "info");
            return false;
        }
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
                await apiFetch(`/tabel2d-rekognisi-lulusan/${data.id_tahunan}/restore`, { method: "POST" });
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
        if (isAllYearsSelected) {
            Swal.fire("Info", "Pilih tahun akademik spesifik untuk menghapus data", "info");
            return false;
        }
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
        if (isAllYearsSelected) {
            Swal.fire("Info", "Pilih tahun akademik spesifik untuk menghapus data", "info");
            return false;
        }
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
                    <div className="relative year-filter-dropdown-container" style={{ minWidth: '200px' }}>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setOpenYearFilterDropdown(!openYearFilterDropdown);
                            }}
                            className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                                selectedYear 
                                    ? 'border-[#0384d6] bg-white text-black' 
                                    : 'border-gray-300 bg-white text-slate-700 hover:border-gray-400'
                            }`}
                            aria-label="Pilih tahun"
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                                <span className={`truncate ${selectedYear ? 'text-black' : 'text-gray-500'}`}>
                                    {selectedYear === "all" 
                                        ? "Semua Tahun"
                                        : selectedYear 
                                            ? (() => {
                                                const found = availableYears.find((y) => String(y.id) === String(selectedYear));
                                                return found ? found.text : selectedYear;
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
                        {openYearFilterDropdown && (
                            <div 
                                className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto year-filter-dropdown-menu mt-1 w-full"
                                style={{ minWidth: '200px' }}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedYear("all");
                                        setOpenYearFilterDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                                        selectedYear === "all"
                                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                                    <span>Semua Tahun</span>
                                </button>
                                {availableYears.length > 0 ? (
                                    availableYears.map((y) => (
                                        <button
                                            key={y.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedYear(String(y.id));
                                                setOpenYearFilterDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                                                selectedYear === String(y.id)
                                                    ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                                    : 'text-gray-700'
                                            }`}
                                        >
                                            <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                                            <span>{y.text}</span>
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
                    
                    {/* Filter Prodi khusus untuk superadmin */}
                    {isSuperAdmin && (
                        <>
                            <label className="text-sm font-medium text-slate-700 ml-2">Prodi:</label>
                            <div className="relative prodi-filter-dropdown-container" style={{ minWidth: '200px' }}>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenProdiFilterDropdown(!openProdiFilterDropdown);
                                    }}
                                    className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                                        selectedProdi 
                                            ? 'border-[#0384d6] bg-white text-black' 
                                            : 'border-gray-300 bg-white text-slate-700 hover:border-gray-400'
                                    }`}
                                    aria-label="Pilih prodi"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                                        <span className={`truncate ${selectedProdi ? 'text-black' : 'text-gray-500'}`}>
                                            {selectedProdi 
                                                ? (() => {
                                                    const found = availableProdi.find((p) => String(p.id) === String(selectedProdi));
                                                    return found ? found.nama : selectedProdi;
                                                })()
                                                : "Pilih Prodi"}
                                        </span>
                                    </div>
                                    <FiChevronDown 
                                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                            openProdiFilterDropdown ? 'rotate-180' : ''
                                        }`} 
                                        size={16} 
                                    />
                                </button>
                                {openProdiFilterDropdown && (
                                    <div 
                                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto prodi-filter-dropdown-menu mt-1 w-full"
                                        style={{ minWidth: '200px' }}
                                    >
                                        {availableProdi.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProdi(String(p.id));
                                                    setOpenProdiFilterDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                                                    selectedProdi === String(p.id)
                                                        ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={14} />
                                                <span>{p.nama}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    
                    {canDelete && !isProdiTIorMI && (
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
                                setModalJustOpened(true);
                                setShowAddModal(true);
                            }}
                            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || yearOrder.length === 0 || isAllYearsSelected}
                            title={isAllYearsSelected ? "Pilih tahun spesifik untuk menambah data" : ""}
                        >
                            + Tambah Data
                        </button>
                    )}
                    <button 
                        onClick={handleExport}
                        disabled={loading || yearOrder.length === 0 || masterSumber.length === 0}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Export ke Excel"
                    >
                        <FiDownload size={18} />
                        <span>Export Excel</span>
                    </button>
                    {canManageData && !isAllYearsSelected && (() => {
                        const tahunTS = selectedYear || (yearOrder.length > 0 ? String(yearOrder[yearOrder.length - 1]) : null);
                        return tahunTS && dataByYear[tahunTS]?.hasData;
                    })() && (
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
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">SUMBER REKOGNISI</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">JENIS PENGAKUAN LULUSAN (REKOGNISI)</th>
                                    <th colSpan={5} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">TAHUN AKADEMIK</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">LINK BUKTI</th>
                                </tr>
                                <tr>
                                    {yearOrder.length > 0 ? (
                                        yearOrder.map((y, idx) => {
                                            // Selalu tampilkan 5 kolom TS meskipun ada null
                                            // Label berdasarkan posisi: TS-4, TS-3, TS-2, TS-1, TS
                                            const label = y != null 
                                                ? (yearLabelMap[y] || getTahunName(y))
                                                : (idx === 0 ? 'TS-4' : idx === 1 ? 'TS-3' : idx === 2 ? 'TS-2' : idx === 3 ? 'TS-1' : 'TS');
                                            return (
                                                <th key={y ?? `null-${idx}`} className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">
                                                    {label}
                                                </th>
                                            );
                                        })
                                    ) : (
                                        // Fallback: tampilkan 5 kolom TS jika yearOrder kosong
                                        <>
                                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">TS-4</th>
                                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">TS-3</th>
                                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">TS-2</th>
                                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">TS-1</th>
                                            <th className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white">TS</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {masterSumber.map((sumber, idx) => {
                                    // Ambil detail untuk setiap tahun dan kombinasi sumber
                                    const detailsByYear = yearOrder.map(y => {
                                        const yearData = getYearData(y);
                                        return yearData?.details.find(d => d.id_sumber === sumber.id_sumber) || null;
                                    });
                                    
                                    // Ambil jenis pengakuan dari tahun TS (tahun yang dipilih, index terakhir)
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
                                                // Selalu tampilkan 5 kolom TS meskipun ada null
                                                if (y == null) {
                                                    return (
                                                        <td key={`null-${yearIdx}`} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">
                                                            -
                                                        </td>
                                                    );
                                                }
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
                                            {y != null ? (totalsByYear[y] ?? 0) : '-'}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 border border-slate-200"></td>
                                </tr>
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3 border border-slate-200 text-slate-800 bg-gray-50" colSpan={2}>Jumlah Lulusan</td>
                                    {yearOrder.map((y, idx) => (
                                        <td key={`lulusan-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                                            {y != null ? (getYearData(y)?.lulusan_ts ?? 0) : '-'}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 border border-slate-200" rowSpan={2}></td>
                                </tr>
                                <tr className="bg-slate-50 font-bold">
                                    <td className="px-4 py-3 border border-slate-200 text-slate-800 bg-gray-50" colSpan={2}>Persentase</td>
                                    {yearOrder.map((y, idx) => (
                                        <td key={`persen-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                                            {y != null ? `${(percentByYear[y] ?? 0).toFixed(2)}%` : '-'}
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
                <div 
                  className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
                  style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setOpenFormSumberDropdown(false);
                      setShowAddModal(false);
                    }
                  }}
                >
                    <div 
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
                      style={{ zIndex: 10000 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white sticky top-0">
                            <h3 className="text-xl font-bold">{isEditMode ? "Edit Data Rekognisi Lulusan" : "Tambah Data Rekognisi Lulusan"}</h3>
                            <p className="text-white/80 mt-1 text-sm">Lengkapi data rekognisi lulusan untuk tahun TS ({getTahunName(selectedYear)})</p>
                        </div>
                        <div className="p-8">
                            {/* Form Input Rincian Baris Tunggal - Tampil jika tidak sedang edit detail (bisa tambah rincian baru baik dalam mode tambah maupun edit) */}
                            {!editingDetail && (
                                <form onSubmit={handleAddRekognisi} className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Tambah Rincian Rekognisi</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Rekognisi <span className="text-red-500">*</span></label>
                                            <div className="relative form-sumber-dropdown-container">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setOpenFormSumberDropdown(!openFormSumberDropdown);
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                                                        singleInput.id_sumber
                                                            ? 'border-[#0384d6] bg-white' 
                                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                                    }`}
                                                    aria-label="Pilih sumber rekognisi"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                                                        <span className={`truncate ${singleInput.id_sumber ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {singleInput.id_sumber 
                                                                ? (() => {
                                                                    const found = masterSumber.find((s) => String(s.id_sumber) === String(singleInput.id_sumber));
                                                                    return found ? found.nama_sumber : singleInput.id_sumber;
                                                                })()
                                                                : "-- Pilih Sumber --"}
                                                        </span>
                                                    </div>
                                                    <FiChevronDown 
                                                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                                            openFormSumberDropdown ? 'rotate-180' : ''
                                                        }`} 
                                                        size={18} 
                                                    />
                                                </button>
                                                {openFormSumberDropdown && (
                                                    <div 
                                                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-sumber-dropdown-menu mt-1 w-full"
                                                    >
                                                        {masterSumber.length > 0 ? (
                                                            masterSumber.map(s => (
                                                                <button
                                                                    key={s.id_sumber}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSingleInput(prev => ({ ...prev, id_sumber: String(s.id_sumber) }));
                                                                        setOpenFormSumberDropdown(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                                                        singleInput.id_sumber === String(s.id_sumber)
                                                                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                                                            : 'text-gray-700'
                                                                    }`}
                                                                >
                                                                    <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                                                                    <span>{s.nama_sumber}</span>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                                Tidak ada data sumber
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                            className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
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
                                                setOpenFormSumberDropdown(false);
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Sumber Rekognisi <span className="text-red-500">*</span></label>
                                            <div className="relative form-sumber-dropdown-container">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setOpenFormSumberDropdown(!openFormSumberDropdown);
                                                    }}
                                                    className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                                                        singleInput.id_sumber
                                                            ? 'border-[#0384d6] bg-white' 
                                                            : 'border-gray-300 bg-white hover:border-gray-400'
                                                    }`}
                                                    aria-label="Pilih sumber rekognisi"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <FiShield className="text-[#0384d6] flex-shrink-0" size={18} />
                                                        <span className={`truncate ${singleInput.id_sumber ? 'text-gray-900' : 'text-gray-500'}`}>
                                                            {singleInput.id_sumber 
                                                                ? (() => {
                                                                    const found = masterSumber.find((s) => String(s.id_sumber) === String(singleInput.id_sumber));
                                                                    return found ? found.nama_sumber : singleInput.id_sumber;
                                                                })()
                                                                : "-- Pilih Sumber --"}
                                                        </span>
                                                    </div>
                                                    <FiChevronDown 
                                                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                                                            openFormSumberDropdown ? 'rotate-180' : ''
                                                        }`} 
                                                        size={18} 
                                                    />
                                                </button>
                                                {openFormSumberDropdown && (
                                                    <div 
                                                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto form-sumber-dropdown-menu mt-1 w-full"
                                                    >
                                                        {masterSumber.length > 0 ? (
                                                            masterSumber.map(s => (
                                                                <button
                                                                    key={s.id_sumber}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSingleInput(prev => ({ ...prev, id_sumber: String(s.id_sumber) }));
                                                                        setOpenFormSumberDropdown(false);
                                                                    }}
                                                                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                                                                        singleInput.id_sumber === String(s.id_sumber)
                                                                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                                                            : 'text-gray-700'
                                                                    }`}
                                                                >
                                                                    <FiShield className="text-[#0384d6] flex-shrink-0" size={16} />
                                                                    <span>{s.nama_sumber}</span>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                                Tidak ada data sumber
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
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
                                            className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
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
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">Sumber</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">Jenis Pengakuan</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">Jumlah</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">Link Bukti</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white">Aksi</th>
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
                                            setOpenFormSumberDropdown(false);
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
                                        className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        Batal
                                    </button>
                            <button
                                type="submit"
                                disabled={saving || (detailsToSubmit.length === 0 && !dataByYear[selectedYear]?.hasData)}
                                className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                            >
                                {saving ? (
                                  <div className="flex items-center justify-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                    <span>Menyimpan...</span>
                                  </div>
                                ) : (
                                  dataByYear[selectedYear]?.hasData ? "Perbarui Semua Data TS" : "Simpan Semua Data TS"
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
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [masterSumber, setMasterSumber] = useState([]); // {id_sumber, nama_sumber}
    const [dataByYear, setDataByYear] = useState({}); 
    
    // --- State Form Input Tunggal (untuk form input di bagian atas) ---
    const [singleInput, setSingleInput] = useState({
        id_sumber: "",
        jenis_pengakuan: "",
        jumlah_mahasiswa_rekognisi: "",
        link_bukti: "",
    });
    
    // --- State Rincian yang Akan Di-Submit (Data existing + data baru) ---
    const [detailsToSubmit, setDetailsToSubmit] = useState([]);
    const [saving, setSaving] = useState(false);

    const isProdiUser = ['prodi'].includes(role?.toLowerCase());

    // --- Utility Hooks ---
    const availableYears = useMemo(() => {
        return Object.values(maps.tahun || {})
          .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
          .filter((t) => t.id)
          .sort((a, b) => Number(a.id) - Number(b.id));
    }, [maps.tahun]);

    const yearOrder = useMemo(() => {
        if (!selectedYear) return [];
        const idx = availableYears.findIndex((y) => String(y.id) === String(selectedYear));
        if (idx === -1) return [];
        const ts = availableYears[idx]?.id;
        const ts1 = idx > 0 ? availableYears[idx - 1]?.id : null;
        const ts2 = idx > 1 ? availableYears[idx - 2]?.id : null;
        return [ts, ts1, ts2]; // TS, TS-1, TS-2
    }, [availableYears, selectedYear]);

    useEffect(() => {
        if (!selectedYear && availableYears.length) {
            const latestYear = availableYears[availableYears.length - 1]?.id;
            if (latestYear) setSelectedYear(String(latestYear));
        }
    }, [availableYears, selectedYear]);
    
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
            
            const resAll = await apiFetch(`/tabel2d-rekognisi-lulusan?${yearParams}`);
            
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
                        const id_tahunan = tahunData.id;
                        const lulusan_ts = tahunData.jumlah_lulusan_ts || 0;
                        
                        const details = dataDetails
                            .filter((d) => String(d.id_tahunan) === String(id_tahunan))
                            .map(d => ({ 
                                id_sumber: d.id_sumber,
                                jenis_pengakuan: d.jenis_pengakuan,
                                link_bukti: d.link_bukti,
                                jumlah_mahasiswa_rekognisi: d.jumlah_mahasiswa_rekognisi || 0
                            }));
                        
                        map[y] = { id_tahunan, lulusan_ts, details, hasData: true };
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
    }, [yearOrder, selectedYear, singleInput.id_sumber]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Menggabungkan data existing dan data baru untuk ditampilkan di daftar submit
    useEffect(() => {
        if (selectedYear && dataByYear[selectedYear]) {
            const existingDetails = dataByYear[selectedYear]?.details || [];
            // Buat tempId unik untuk data existing agar bisa dihapus dari daftar submit
            setDetailsToSubmit(existingDetails.map((d, i) => ({ 
                ...d, 
                jumlah_mahasiswa_rekognisi: String(d.jumlah_mahasiswa_rekognisi),
                tempId: d.id_tahunan + '_' + d.id_sumber + '_' + i // ID unik sementara
            })));
        }
    }, [selectedYear, dataByYear]);
    
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
    const canRead = roleCan(role, "rekognisi_lulusan", "r");
    const canUpdate = roleCan(role, "rekognisi_lulusan", "U");
    const canCreate = roleCan(role, "rekognisi_lulusan", "C");

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

    // Handler ketika tombol "+ Tambah Rekognisi" ditekan
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
            link_bukti: link_bukti,
            tempId: Date.now() 
        };
        
        // Cek apakah kombinasi sumber dan jenis pengakuan sudah ada di detailsToSubmit
        const exists = detailsToSubmit.some(d => 
            d.id_sumber === newDetail.id_sumber && d.jenis_pengakuan === newDetail.jenis_pengakuan
        );

        if (exists) {
             Swal.fire("Peringatan", "Rincian dengan Sumber dan Jenis Pengakuan yang sama sudah ada di daftar submit.", "warning");
             return;
        }

        // Tambahkan ke detailsToSubmit
        setDetailsToSubmit(prev => [...prev, newDetail]);

        // Reset form input tunggal, pertahankan id_sumber default
        setSingleInput(prev => ({
            id_sumber: masterSumber[0]?.id_sumber ? String(masterSumber[0].id_sumber) : "",
            jenis_pengakuan: "",
            jumlah_mahasiswa_rekognisi: "",
            link_bukti: "",
        }));
    };

    // Handler untuk menghapus rincian dari daftar detailsToSubmit
    const handleDeleteDetail = (tempId) => {
        setDetailsToSubmit(prev => prev.filter(d => d.tempId !== tempId));
    };

    // Handler untuk submit Data TS (Mengirim semua data di detailsToSubmit)
    const handleSubmitBulk = async (e) => {
        e.preventDefault();
        
        if (!selectedYear || !isProdiUser) {
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

            Swal.fire("Berhasil!", "Data rekognisi berhasil disimpan/diperbarui", "success");
            await fetchData(); 
            
        } catch (e) {
            console.error("Error submitting:", e);
            Swal.fire("Error", e?.message || "Gagal menyimpan data", "error");
        } finally {
            setSaving(false);
        }
    };
    
    // Handler Soft Delete Seluruh Data TS
    const handleDeleteTS = async () => {
        const yearId = selectedYear || yearOrder[0];
        const data = getYearData(yearId);
        
        if (!data?.id_tahunan || !isProdiUser) {
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
                setDetailsToSubmit([]);
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
        <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-8">
            <header className="pb-6 mb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Tabel 2.D Rekognisi Lulusan</h2>
                <p className="text-sm text-slate-600 mt-1">Menampilkan TS, TS-1, TS-2 berdasarkan tahun akademik terpilih.</p>
            </header>

            {/* Bagian Kontrol dan Filter */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
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
                </div>
                <div className="inline-flex items-center gap-2">
                    <button 
                        onClick={() => window.open(`/api/tabel2d-rekognisi-lulusan/export`, '_blank')}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
                    >
                        Export Excel
                    </button>
                    {isProdiUser && dataByYear[selectedYear]?.hasData && (
                        <button 
                            onClick={handleDeleteTS}
                            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors"
                            disabled={!canUpdate} // Hanya yang punya izin update/delete yang bisa hapus
                        >
                            Hapus Data TS
                        </button>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">{error}</div>
            )}

            {/* Input Data Agregat Tahunan */}
            {canCreate && isProdiUser && (
                <div className="space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800">Input Data Agregat Tahunan</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Jumlah Lulusan (TS-2)</label>
                            <input
                                type="number"
                                value={getYearData(yearOrder[2])?.lulusan_ts || 0}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Jumlah Lulusan (TS-1)</label>
                            <input
                                type="number"
                                value={getYearData(yearOrder[1])?.lulusan_ts || 0}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">Jumlah Lulusan (TS)</label>
                            <input
                                type="number"
                                value={getYearData(yearOrder[0])?.lulusan_ts || 0}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Form Input Rincian Baris Tunggal + Daftar Submit */}
            {canCreate && isProdiUser && (canUpdate || !dataByYear[selectedYear]?.hasData) && (
                <>
                    {/* Form Input Rincian Baris Tunggal (Sesuai Screenshot) */}
                    <form onSubmit={handleAddRekognisi} className="space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800">Input Rincian Rekognisi (Satu per Satu)</h3>
                        
                        <div className="grid grid-cols-5 gap-3 items-end">
                            {/* Kolom 1: Sumber */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Sumber</label>
                                <select
                                    name="id_sumber"
                                    value={singleInput.id_sumber}
                                    onChange={handleSingleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    required
                                >
                                    <option value="" disabled>Pilih Sumber...</option>
                                    {masterSumber.map(s => (
                                        <option key={s.id_sumber} value={s.id_sumber}>{s.nama_sumber}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Kolom 2: Jenis Pengakuan */}
                            <div className="col-span-1 space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Jenis Pengakuan</label>
                                <input
                                    type="text"
                                    name="jenis_pengakuan"
                                    value={singleInput.jenis_pengakuan}
                                    onChange={handleSingleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Contoh: Juara 1 Lomba..."
                                    required
                                />
                            </div>

                            {/* Kolom 3: Jml. Lulusan */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Jml. Lulusan</label>
                                <input
                                    type="number"
                                    name="jumlah_mahasiswa_rekognisi"
                                    min="0"
                                    value={singleInput.jumlah_mahasiswa_rekognisi}
                                    onChange={handleSingleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="0"
                                    required
                                />
                            </div>
                            
                            {/* Kolom 4: Link Bukti */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">Link Bukti</label>
                                <input
                                    type="url"
                                    name="link_bukti"
                                    value={singleInput.link_bukti}
                                    onChange={handleSingleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="https://"
                                />
                            </div>

                            {/* Kolom 5: Tombol Tambah */}
                            <div className="pt-5">
                                <button
                                    type="submit"
                                    disabled={saving || !singleInput.id_sumber}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + Tambah Rekognisi
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Daftar Rincian yang Akan Di-Submit (Tabel Sementara) */}
                    <form onSubmit={handleSubmitBulk} className="space-y-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800">Daftar Rincian untuk Tahun TS ({getTahunName(selectedYear)})</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left border-collapse">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2 font-semibold">Sumber</th>
                                        <th className="px-4 py-2 font-semibold">Jenis Pengakuan</th>
                                        <th className="px-4 py-2 font-semibold text-center">Jumlah</th>
                                        <th className="px-4 py-2 font-semibold">Link Bukti</th>
                                        <th className="px-4 py-2 font-semibold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailsToSubmit.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                                                Tidak ada rincian yang ditambahkan.
                                            </td>
                                        </tr>
                                    ) : (
                                        detailsToSubmit.map((detail, index) => {
                                            const source = masterSumber.find(s => s.id_sumber === detail.id_sumber)?.nama_sumber || 'N/A';
                                            return (
                                                <tr key={detail.tempId || index} className="border-t hover:bg-slate-50">
                                                    <td className="px-4 py-2">{source}</td>
                                                    <td className="px-4 py-2">{detail.jenis_pengakuan}</td>
                                                    <td className="px-4 py-2 text-center">{detail.jumlah_mahasiswa_rekognisi}</td>
                                                    <td className="px-4 py-2">
                                                        {detail.link_bukti ? <a href={detail.link_bukti} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a> : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => handleDeleteDetail(detail.tempId || index)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Hapus rincian ini dari daftar submit"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || (detailsToSubmit.length === 0 && !dataByYear[selectedYear]?.hasData)}
                                className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Menyimpan..." : (dataByYear[selectedYear]?.hasData ? "Perbarui Semua Data TS" : "Simpan Semua Data TS")}
                            </button>
                        </div>
                    </form>
                </>
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
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20 w-1/5">SUMBER REKOGNISI</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20 w-1/4">JENIS PENGAKUAN LULUSAN (REKOGNISI)</th>
                                    <th colSpan={yearOrder.length} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Jumlah Mahasiswa (Tahun Akademik)</th>
                                    <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">LINK BUKTI</th>
                                </tr>
                                <tr>
                                    {yearOrder.map((y, idx) => (
                                        <th key={y ?? `null-${idx}`} className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white/20">
                                            {y != null ? getTahunName(y) : `TS-${idx}`}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {masterSumber.map((sumber) => (
                                    <tr key={sumber.id_sumber} className="transition-colors bg-white hover:bg-[#eaf4ff]">
                                        <td className="px-4 py-3 text-slate-800 border border-slate-200 font-medium">{sumber.nama_sumber}</td>
                                        <td className="px-4 py-3 text-slate-800 border border-slate-200 text-left">
                                            {getYearData(yearOrder[0])?.details.find(d => d.id_sumber === sumber.id_sumber)?.jenis_pengakuan || '-'}
                                        </td>
                                        {yearOrder.map((y, idx) => {
                                            const count = getYearData(y)?.details.find(d => d.id_sumber === sumber.id_sumber)?.jumlah_mahasiswa_rekognisi || 0;
                                            return (
                                                <td key={y ?? `null-${idx}`} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">
                                                    {count}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 border border-slate-200 text-center">
                                            {getYearData(yearOrder[0])?.details.find(d => d.id_sumber === sumber.id_sumber)?.link_bukti ? (
                                                <a href={getYearData(yearOrder[0])?.details.find(d => d.id_sumber === sumber.id_sumber)?.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                                                    Link
                                                </a>
                                            ) : ("-")}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-100 font-bold">
                                    <td className="px-4 py-3 border border-slate-200" colSpan={2}>Jumlah Rekognisi</td>
                                    {yearOrder.map((y, idx) => (<td key={`total-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center">{totalsByYear[y] ?? 0}</td>))}
                                    <td className="px-4 py-3 border border-slate-200"></td>
                                </tr>
                                <tr className="bg-slate-100 font-bold">
                                    <td className="px-4 py-3 border border-slate-200" colSpan={2}>Jumlah Lulusan (N)</td>
                                    {yearOrder.map((y, idx) => (<td key={`lulusan-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center">{getYearData(y)?.lulusan_ts ?? 0}</td>))}
                                    <td className="px-4 py-3 border border-slate-200"></td>
                                </tr>
                                <tr className="bg-slate-100 font-bold">
                                    <td className="px-4 py-3 border border-slate-200" colSpan={2}>Persentase (Rekognisi/N)</td>
                                    {yearOrder.map((y, idx) => (<td key={`persen-${y ?? idx}`} className="px-4 py-3 border border-slate-200 text-center">{`${(percentByYear[y] ?? 0).toFixed(2)}%`}</td>))}
                                    <td className="px-4 py-3 border border-slate-200"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiFetch } from "../../../../lib/api"; 
import { useMaps } from "../../../../hooks/useMaps"; 
import { roleCan } from "../../../../lib/role"; 
import { useAuth } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

export default function Tabel3C3({ role }) {
    const { maps } = useMaps(true);
    const { authUser } = useAuth();
    
    // --- State Utama ---
    const [selectedYear, setSelectedYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dataList, setDataList] = useState([]); // Data HKI per baris
    const [tahunLaporan, setTahunLaporan] = useState({}); // {id_ts, nama_ts, id_ts1, nama_ts1, ...}
    
    // --- State Modal & Form ---
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState({
        id: null, // Hanya ada saat edit
        id_dosen: "",
        judul_hki: "",
        jenis_hki: "",
        id_tahun_perolehan: "", // Tahun HKI diperoleh
        link_bukti: "",
    });
    
    // --- Permissions ---
    const resourceKey = 'tabel_3c3_hki';
    const canRead = roleCan(role, resourceKey, "R");
    const canCreate = roleCan(role, resourceKey, "C");
    const canUpdate = roleCan(role, resourceKey, "U");
    const canDelete = roleCan(role, resourceKey, "D");

    // --- Data Master & Tahun ---
    const availableYears = useMemo(() => {
        return Object.values(maps.tahun || {})
          .map((t) => ({ id: t.id_tahun ?? t.id, text: t.tahun ?? t.nama ?? String(t.id_tahun ?? t.id) }))
          .filter((t) => t.id)
          .sort((a, b) => Number(a.id) - Number(b.id));
    }, [maps.tahun]);

    const availableDosen = useMemo(() => {
        // Asumsi maps.dosen berisi {id_dosen, nama_lengkap}
        return Object.values(maps.dosen || {}).map(d => ({
            id: d.id_dosen,
            nama: d.nama_lengkap || d.nama || `Dosen ${d.id_dosen}`
        }));
    }, [maps.dosen]);

    useEffect(() => {
        if (!selectedYear && availableYears.length) {
            const latestYear = availableYears[availableYears.length - 1]?.id;
            if (latestYear) setSelectedYear(String(latestYear));
        }
    }, [availableYears, selectedYear]);
    
    // Urutan kolom tahun laporan (TS-4 s/d TS)
    const yearOrderKeys = useMemo(() => {
        if (!tahunLaporan.id_ts) return [];
        return [
            { id: tahunLaporan.id_ts4, name: tahunLaporan.nama_ts4, key: 'tahun_ts4' },
            { id: tahunLaporan.id_ts3, name: tahunLaporan.nama_ts3, key: 'tahun_ts3' },
            { id: tahunLaporan.id_ts2, name: tahunLaporan.nama_ts2, key: 'tahun_ts2' },
            { id: tahunLaporan.id_ts1, name: tahunLaporan.nama_ts1, key: 'tahun_ts1' },
            { id: tahunLaporan.id_ts, name: tahunLaporan.nama_ts, key: 'tahun_ts' },
        ];
    }, [tahunLaporan]);

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
        if (!canRead || !selectedYear) return;

        try {
            setLoading(true);
            setError("");
            
            // Menggunakan query parameter ts_id sesuai dengan controller backend
            const res = await apiFetch(`/tabel3c3-hki?ts_id=${selectedYear}`);
            
            if (res.tahun_laporan && res.data) {
                setTahunLaporan(res.tahun_laporan);
                setDataList(Array.isArray(res.data) ? res.data : []);
            } else {
                 setTahunLaporan({});
                 setDataList([]);
                 setError("Format data laporan tidak sesuai.");
            }
        } catch (e) {
            console.error("Error fetching data:", e);
            setError(e?.message || "Gagal memuat data HKI");
        } finally {
            setLoading(false);
        }
    }, [canRead, selectedYear]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Form & CRUD Handlers ---
    
    const resetForm = () => {
        setFormState({
            id: null,
            id_dosen: "",
            judul_hki: "",
            jenis_hki: "",
            id_tahun_perolehan: selectedYear || "", // Default ke tahun TS yang dipilih
            link_bukti: "",
        });
        setIsEditMode(false);
    };

    const handleOpenModal = async (data = null) => {
        if (data && canUpdate) {
            // Edit Mode
            setFormState({
                id: data.id,
                id_dosen: String(data.id_dosen || ""),
                judul_hki: data.judul_hki || "",
                jenis_hki: data.jenis_hki || "",
                id_tahun_perolehan: String(data.id_tahun_perolehan || selectedYear),
                link_bukti: data.link_bukti || "",
            });
            setIsEditMode(true);
        } else if (canCreate) {
            // Create Mode
            resetForm();
        } else {
             return; // Tidak ada izin
        }
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            id: formState.id,
            id_dosen: Number(formState.id_dosen),
            judul_hki: formState.judul_hki,
            jenis_hki: formState.jenis_hki,
            id_tahun_perolehan: Number(formState.id_tahun_perolehan),
            link_bukti: formState.link_bukti,
        };
        
        try {
            setSaving(true);
            
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `/tabel3c3-hki/${payload.id}` : `/tabel3c3-hki`;

            await apiFetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            Swal.fire("Berhasil!", `Data HKI berhasil di${isEditMode ? 'perbarui' : 'simpan'}`, "success");
            handleCloseModal();
            fetchData();
        } catch (e) {
            console.error("Error submitting:", e);
            Swal.fire("Error", e?.message || "Gagal menyimpan data", "error");
        } finally {
            setSaving(false);
        }
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleDelete = async (id, judul) => {
        if (!canDelete) return;

        const confirm = await Swal.fire({
            title: "Yakin ingin menghapus?",
            text: `Data HKI "${judul}" akan di-soft delete.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Ya, hapus!",
            cancelButtonText: "Batal"
        });

        if (confirm.isConfirmed) {
            try {
                // Menggunakan softDeleteTabel3c3Hki (DELETE /:id)
                await apiFetch(`/tabel3c3-hki/${id}`, { method: "DELETE" });
                Swal.fire("Berhasil", "Data berhasil di-soft delete.", "success");
                fetchData(); 
            } catch (e) {
                Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
            }
        }
    };

    const handleExport = () => {
        if (selectedYear) {
            window.open(`/api/tabel3c3-hki/export?ts_id=${selectedYear}`, '_blank');
        } else {
            Swal.fire("Info", "Pilih Tahun (TS) terlebih dahulu untuk Export.", "info");
        }
    };


    // --- Render ---
    return (
        <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-6">
            <header className="pb-6 mb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Tabel 3.C.3 Hak Kekayaan Intelektual (HKI)</h2>
                <p className="text-sm text-slate-600 mt-1">Menampilkan HKI yang diperoleh Dosen Tetap Pendidik dan Peneliti (DTPR) selama 5 tahun terakhir (TS-4 s/d TS).</p>
            </header>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-slate-700">Tahun Laporan (TS):</label>
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
                        onClick={handleExport}
                        disabled={!selectedYear || loading}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        Export Excel
                    </button>
                    {canCreate && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] transition-colors"
                        >
                            + Tambah HKI
                        </button>
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
                                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Judul HKI</th>
                                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Jenis HKI</th>
                                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Nama DTPR</th>
                                <th colSpan={yearOrderKeys.length} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Tahun Perolehan</th>
                                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Link Bukti</th>
                                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Aksi</th>
                            </tr>
                            <tr>
                                {/* Kolom Tahun Dinamis (TS-4 s/d TS) */}
                                {yearOrderKeys.map(y => (
                                    <th key={y.id} className="px-4 py-2 text-xs font-semibold uppercase text-center border border-white/20">
                                        {y.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6 + yearOrderKeys.length} className="py-4 text-center text-slate-600">Memuat data...</td>
                                </tr>
                            ) : dataList.length === 0 ? (
                                <tr>
                                    <td colSpan={6 + yearOrderKeys.length} className="py-4 text-center text-slate-600">Tidak ada data HKI dalam rentang 5 tahun terakhir (TS-4 s/d TS).</td>
                                </tr>
                            ) : (
                                dataList.map((data) => (
                                    <tr key={data.id} className="transition-colors bg-white hover:bg-[#eaf4ff]">
                                        <td className="px-4 py-3 border border-slate-200">{data.judul_hki}</td>
                                        <td className="px-4 py-3 border border-slate-200">{data.jenis_hki}</td>
                                        <td className="px-4 py-3 border border-slate-200">{data.nama_dtpr}</td>
                                        
                                        {/* Tampilkan Checkmark Tahun Perolehan */}
                                        {yearOrderKeys.map(y => (
                                            <td key={y.key} className="px-4 py-3 border border-slate-200 text-center font-bold">
                                                {data[y.key] === '√' ? '√' : ''}
                                            </td>
                                        ))}

                                        <td className="px-4 py-3 border border-slate-200">
                                            {data.link_bukti ? (
                                                <a href={data.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">Link</a>
                                            ) : ('-')}
                                        </td>
                                        
                                        <td className="px-4 py-3 text-center border border-slate-200">
                                            <div className="flex items-center justify-center gap-2">
                                                {canUpdate && (
                                                    <button 
                                                        onClick={() => handleOpenModal(data)}
                                                        className="font-medium text-[#0384d6] hover:underline"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button 
                                                        onClick={() => handleDelete(data.id, data.judul_hki)}
                                                        className="font-medium text-red-600 hover:underline"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Form Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                            <h3 className="text-xl font-bold">
                                {isEditMode ? "Edit Data HKI" : "Formulir Data HKI"}
                            </h3>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Nama Dosen (DTPR)<span className="text-red-500">*</span></label>
                                        <select
                                            name="id_dosen"
                                            value={formState.id_dosen}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white"
                                            required
                                        >
                                            <option value="">Pilih Dosen...</option>
                                            {availableDosen.map(d => (
                                                <option key={d.id} value={d.id}>{d.nama}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Judul HKI <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="judul_hki"
                                            value={formState.judul_hki}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Jenis HKI <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="jenis_hki"
                                            value={formState.jenis_hki}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white"
                                            placeholder="Contoh: Paten Sederhana, Hak Cipta"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-semibold text-gray-700">Tahun Perolehan <span className="text-red-500">*</span></label>
                                            <select
                                                name="id_tahun_perolehan"
                                                value={formState.id_tahun_perolehan}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white"
                                                required
                                            >
                                                <option value="">Pilih Tahun...</option>
                                                {/* Hanya tampilkan tahun yang relevan (TS-4 s/d TS) */}
                                                {yearOrderKeys.map(y => (
                                                    <option key={y.id} value={y.id}>{y.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-semibold text-gray-700">Link Bukti</label>
                                            <input
                                                type="url"
                                                name="link_bukti"
                                                value={formState.link_bukti}
                                                onChange={handleFormChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black bg-white"
                                                placeholder="https://..."
                                            />
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
                                        disabled={saving || !formState.id_dosen || !formState.judul_hki}
                                        className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? "Menyimpan..." : (isEditMode ? "Simpan Perubahan" : "Simpan Data HKI")}
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
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { useMaps } from "../../../../hooks/useMaps";
import { roleCan } from "../../../../lib/role";
import { useAuth } from "../../../../context/AuthContext";
import Swal from "sweetalert2";

export default function Tabel2C({ role }) {
  const { maps } = useMaps(true);
  const { authUser } = useAuth();

  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bentukList, setBentukList] = useState([]); // {id_bentuk, nama_bentuk}
  const [dataByYear, setDataByYear] = useState({}); // { [id_tahun]: { aktif, link, counts:{[id_bentuk]: jumlah} } }
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    jumlah_mahasiswa_aktif: "",
    link_bukti: "",
    details: {} // { [id_bentuk]: jumlah_mahasiswa_ikut }
  });
  const [saving, setSaving] = useState(false);

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
    return [ts, ts1, ts2, ts3, ts4]; // urut: TS, TS-1, TS-2, TS-3, TS-4 (dari kiri ke kanan)
  }, [availableYears, selectedYear]);

  // Fetch master bentuk + data per tahun
  useEffect(() => {
    if (!selectedYear || yearOrder.length === 0) {
      setBentukList([]);
      setDataByYear({});
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
          const yearParams = `id_tahun_in=${validYears.join(',')}`;
          resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${yearParams}`);
        }
        
        // Parse response dari backend: { masterBentuk, dataTahunan, dataDetails }
        const masterBentuk = resAll.masterBentuk || [];
        const dataTahunan = resAll.dataTahunan || [];
        const dataDetails = resAll.dataDetails || [];
        
        // Set master bentuk
        setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);

        // Mapping data per tahun - hanya map tahun yang tidak null
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
              
              // Ambil detail untuk id_tahunan ini
              const details = dataDetails.filter((d) => d.id_tahunan === id_tahunan);
              const counts = {};
              details.forEach((d) => {
                counts[d.id_bentuk] = d.jumlah_mahasiswa_ikut || 0;
              });
              
              map[y] = { aktif, link, counts, id_tahunan, id_unit_prodi, hasData: true };
            } else {
              // Tidak ada data di database untuk tahun ini - tetap buat entry dengan nilai 0
              map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, id_unit_prodi: null, hasData: false };
            }
          }
          // Jika y == null, tidak perlu buat entry - akan langsung return 0 di render
        });
        
        setDataByYear(map);
      } catch (e) {
        console.error("Error fetching data:", e);
        setError(e?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear, yearOrder.join(",")]);

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

  const canRead = roleCan(role, "fleksibilitas_pembelajaran", "r");
  const canUpdate = roleCan(role, "fleksibilitas_pembelajaran", "U");
  const canDelete = roleCan(role, "fleksibilitas_pembelajaran", "D");
  const canCreate = roleCan(role, "fleksibilitas_pembelajaran", "C");

  // Handler untuk reset form
  const resetForm = () => {
    setFormState({
      id_unit_prodi: isSuperAdmin ? "" : (authUser?.unit || ""),
      jumlah_mahasiswa_aktif: "",
      link_bukti: "",
      details: {}
    });
    setEditingYear(null);
  };

  // Handler untuk buka modal tambah/edit
  const handleOpenModal = (yearId = null) => {
    if (yearId && dataByYear[yearId]?.hasData) {
      // Edit mode - perlu ambil id_unit_prodi dari data existing
      const yearData = dataByYear[yearId];
      setEditingYear(yearId);
      
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
    } else {
      // Tambah mode (untuk tahun TS yang dipilih)
      resetForm();
      setEditingYear(selectedYear || yearOrder[0]);
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

      // Convert details object to array format yang diharapkan backend
      const detailsArray = Object.entries(formState.details)
        .filter(([_, jumlah]) => jumlah && Number(jumlah) > 0)
        .map(([id_bentuk, jumlah_mahasiswa_ikut]) => ({
          id_bentuk: Number(id_bentuk),
          jumlah_mahasiswa_ikut: Number(jumlah_mahasiswa_ikut)
        }));

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

      Swal.fire("Berhasil!", dataByYear[editingYear]?.hasData ? "Data berhasil diperbarui" : "Data berhasil ditambahkan", "success");
      
      handleCloseModal();
      
      // Refresh data
      const validYears = yearOrder.filter(y => y != null);
      if (validYears.length > 0) {
        const yearParams = `id_tahun_in=${validYears.join(',')}`;
        const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${yearParams}`);
        const masterBentuk = resAll.masterBentuk || [];
        const dataTahunan = resAll.dataTahunan || [];
        const dataDetails = resAll.dataDetails || [];
        setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
        
        const map = {};
        yearOrder.forEach((y) => {
          if (y != null) {
            const tahunData = dataTahunan.find((d) => String(d.id_tahun) === String(y));
            if (tahunData) {
              const aktif = tahunData.jumlah_mahasiswa_aktif || 0;
              const link = tahunData.link_bukti || "";
              const id_tahunan = tahunData.id;
              const id_unit_prodi = tahunData.id_unit_prodi || null;
              const details = dataDetails.filter((d) => d.id_tahunan === id_tahunan);
              const counts = {};
              details.forEach((d) => {
                counts[d.id_bentuk] = d.jumlah_mahasiswa_ikut || 0;
              });
              map[y] = { aktif, link, counts, id_tahunan, id_unit_prodi, hasData: true };
            } else {
              map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, id_unit_prodi: null, hasData: false };
            }
          }
        });
        setDataByYear(map);
      }
    } catch (e) {
      console.error("Error submitting:", e);
      Swal.fire("Error", e?.message || "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk delete
  const handleDelete = async () => {
    if (!yearOrder[0] || !dataByYear[yearOrder[0]]?.id_tahunan) {
      Swal.fire("Info", "Tidak ada data untuk dihapus", "info");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data akan dihapus secara permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (confirm.isConfirmed) {
      try {
        await apiFetch(`/tabel2c-fleksibilitas-pembelajaran/${dataByYear[yearOrder[0]].id_tahunan}`, {
          method: "DELETE"
        });
        
        Swal.fire("Berhasil", "Data berhasil dihapus", "success");
        
        // Refresh data
        const validYears = yearOrder.filter(y => y != null);
        if (validYears.length > 0) {
          const yearParams = `id_tahun_in=${validYears.join(',')}`;
          const resAll = await apiFetch(`/tabel2c-fleksibilitas-pembelajaran?${yearParams}`);
          const masterBentuk = resAll.masterBentuk || [];
          const dataTahunan = resAll.dataTahunan || [];
          const dataDetails = resAll.dataDetails || [];
          setBentukList(Array.isArray(masterBentuk) ? masterBentuk : []);
          
          const map = {};
          yearOrder.forEach((y) => {
            if (y != null) {
              const tahunData = dataTahunan.find((d) => String(d.id_tahun) === String(y));
              if (tahunData) {
                const aktif = tahunData.jumlah_mahasiswa_aktif || 0;
                const link = tahunData.link_bukti || "";
                const id_tahunan = tahunData.id;
                const details = dataDetails.filter((d) => d.id_tahunan === id_tahunan);
                const counts = {};
                details.forEach((d) => {
                  counts[d.id_bentuk] = d.jumlah_mahasiswa_ikut || 0;
                });
                map[y] = { aktif, link, counts, id_tahunan, hasData: true };
              } else {
                map[y] = { aktif: 0, link: "", counts: {}, id_tahunan: null, hasData: false };
              }
            }
          });
          setDataByYear(map);
        }
      } catch (e) {
        Swal.fire("Error", e?.message || "Gagal menghapus data", "error");
      }
    }
  };

  // Get tahun name untuk display
  const getTahunName = (id) => {
    if (!id) return "";
    return availableYears.find(y => String(y.id) === String(id))?.text || id;
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <header className="pb-6 mb-2 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran</h2>
        <p className="text-sm text-slate-600 mt-1">Menampilkan TS, TS-1, TS-2, TS-3, TS-4 berdasarkan tahun akademik terpilih.</p>
      </header>

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
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${bentukList.length} bentuk`}
          </span>
          {canCreate && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors"
            >
              + Tambah Data
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
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Tahun Akademik</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-1</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-2</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-3</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">TS-4</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Link Bukti</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-center border border-white/20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white hover:bg-[#eaf4ff]">
                <td className="px-4 py-3 text-slate-800 border border-slate-200">Jumlah Mahasiswa Aktif</td>
                {yearOrder.map((y, idx) => (
                  <td key={y ?? `null-${idx}`} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">
                    {y != null ? (dataByYear[y]?.aktif ?? 0) : 0}
                  </td>
                ))}
                <td className="px-4 py-3 border border-slate-200">
                  {yearOrder[0] != null && dataByYear[yearOrder[0]]?.link ? (
                    <a href={dataByYear[yearOrder[0]]?.link} target="_blank" rel="noreferrer" className="text-[#0384d6] hover:underline">
                      {dataByYear[yearOrder[0]]?.link}
                    </a>
                  ) : (
                    ""
                  )}
                </td>
                <td className="px-4 py-3 text-center border border-slate-200">
                  {yearOrder[0] != null && dataByYear[yearOrder[0]]?.hasData && (
                    <div className="flex items-center justify-center gap-2">
                      {canUpdate && (
                        <button 
                          onClick={() => handleOpenModal(yearOrder[0])}
                          className="font-medium text-[#0384d6] hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          onClick={handleDelete}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200" colSpan={8}>
                  Bentuk Pembelajaran — Jumlah mahasiswa untuk setiap bentuk pembelajaran
                </td>
              </tr>

              {bentukList.map((b) => (
                <tr key={b.id_bentuk} className="transition-colors bg-white hover:bg-[#eaf4ff]">
                  <td className="px-4 py-3 text-slate-800 border border-slate-200">{b.nama_bentuk}</td>
                  {yearOrder.map((y, idx) => (
                    <td key={y ?? `null-${idx}`} className="px-4 py-3 text-slate-800 border border-slate-200 text-center">
                      {y != null ? (dataByYear[y]?.counts?.[b.id_bentuk] ?? 0) : 0}
                    </td>
                  ))}
                  <td className="px-4 py-3 border border-slate-200"></td>
                  <td className="px-4 py-3 border border-slate-200"></td>
                </tr>
              ))}

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 text-slate-800 font-semibold">Jumlah</td>
                {yearOrder.map((y, idx) => (
                  <td key={y ?? `null-${idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                    {y != null ? (totalsByYear[y] ?? 0) : 0}
                  </td>
                ))}
                <td className="px-4 py-3 border border-slate-200"></td>
                <td className="px-4 py-3 border border-slate-200"></td>
              </tr>

              <tr className="bg-slate-50">
                <td className="px-4 py-3 border border-slate-200 text-slate-800 font-semibold">Persentase</td>
                {yearOrder.map((y, idx) => (
                  <td key={y ?? `null-${idx}`} className="px-4 py-3 border border-slate-200 text-center text-slate-800">
                    {y != null ? ((percentByYear[y] ?? 0).toFixed(2)) : "0.00"}%
                  </td>
                ))}
                <td className="px-4 py-3 border border-slate-200"></td>
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
                {editingYear && dataByYear[editingYear]?.hasData ? "Edit Data Fleksibilitas Pembelajaran" : "Tambah Data Fleksibilitas Pembelajaran"}
              </h3>
              <p className="text-white/80 mt-1 text-sm">
                Tahun Akademik: {editingYear ? getTahunName(editingYear) : ""}
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Jumlah Mahasiswa untuk Setiap Bentuk Pembelajaran
                    </label>
                    <div className="space-y-3">
                      {bentukList.map((b) => (
                        <div key={b.id_bentuk} className="flex items-center gap-3">
                          <label className="flex-1 text-sm text-slate-700">
                            {b.nama_bentuk}
                          </label>
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
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                            placeholder="0"
                          />
                        </div>
                      ))}
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
                    {saving ? "Menyimpan..." : (editingYear && dataByYear[editingYear]?.hasData ? "Perbarui" : "Simpan")}
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



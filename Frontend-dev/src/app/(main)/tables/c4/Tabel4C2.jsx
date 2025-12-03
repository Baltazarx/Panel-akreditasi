"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus } from 'react-icons/fi';

const ENDPOINT = "/tabel-4c2-diseminasi-pkm";
const TABLE_KEY = "tabel_4c2_diseminasi_pkm";
const LABEL = "4.C.2 Diseminasi Hasil PkM";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedTahun, tahunLaporan }) {
  const [form, setForm] = useState({
    id_dosen: "",
    judul_pkm: "",
    jenis_diseminasi: "",
    id_tahun_diseminasi: "",
    link_bukti: ""
  });

  const [dosenList, setDosenList] = useState([]);
  const [tahunList, setTahunList] = useState([]);

  // Fetch dosen list
  useEffect(() => {
    const fetchDosen = async () => {
      try {
        const data = await apiFetch("/dosen");
        const list = Array.isArray(data) ? data : [];
        const dosenMap = new Map();
        list.forEach((d) => {
          const id = d.id_dosen;
          if (!dosenMap.has(id)) {
            dosenMap.set(id, {
              id_dosen: id,
              nama: d.nama_lengkap || d.nama || `${d.nama_depan || ""} ${d.nama_belakang || ""}`.trim() || `Dosen ${id}`
            });
          }
        });
        setDosenList(Array.from(dosenMap.values()).sort((a, b) => (a.nama || "").localeCompare(b.nama || "")));
      } catch (err) {
        console.error("Error fetching dosen:", err);
        setDosenList([]);
      }
    };
    if (isOpen) fetchDosen();
  }, [isOpen]);

  // Fetch tahun akademik (5 tahun: TS-4, TS-3, TS-2, TS-1, TS)
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        let tahunIds = [];
        let order = [];
        
        if (tahunLaporan && tahunLaporan.id_ts && tahunLaporan.id_ts1 && tahunLaporan.id_ts2 && tahunLaporan.id_ts3 && tahunLaporan.id_ts4) {
          // Gunakan tahunLaporan jika semua 5 tahun tersedia
          tahunIds = [
            tahunLaporan.id_ts4, 
            tahunLaporan.id_ts3, 
            tahunLaporan.id_ts2, 
            tahunLaporan.id_ts1, 
            tahunLaporan.id_ts
          ];
          order = [
            tahunLaporan.id_ts,
            tahunLaporan.id_ts1,
            tahunLaporan.id_ts2,
            tahunLaporan.id_ts3,
            tahunLaporan.id_ts4
          ];
        } else if (selectedTahun) {
          // Fallback: hitung dari selectedTahun jika tahunLaporan belum lengkap atau belum ada
          const ts = parseInt(selectedTahun, 10);
          if (!isNaN(ts)) {
            tahunIds = [ts - 4, ts - 3, ts - 2, ts - 1, ts];
            order = [ts, ts - 1, ts - 2, ts - 3, ts - 4];
          }
        }
        
        if (tahunIds.length > 0) {
          const data = await apiFetch("/tahun-akademik");
          const list = Array.isArray(data) ? data : [];
          const filtered = list.filter(t => tahunIds.includes(t.id_tahun));
          // Urutkan dari TS ke TS-4 (dari terbaru ke terlama)
          setTahunList(filtered.sort((a, b) => {
            const indexA = order.indexOf(a.id_tahun);
            const indexB = order.indexOf(b.id_tahun);
            return indexA - indexB;
          }));
        } else {
          setTahunList([]);
        }
      } catch (err) {
        console.error("Error fetching tahun:", err);
        setTahunList([]);
      }
    };
    if (isOpen && (tahunLaporan || selectedTahun)) {
      fetchTahun();
    }
  }, [isOpen, tahunLaporan, selectedTahun]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          id_dosen: initialData.id_dosen || "",
          judul_pkm: initialData.judul_pkm || "",
          jenis_diseminasi: initialData.jenis_diseminasi || "",
          id_tahun_diseminasi: initialData.id_tahun_diseminasi || "",
          link_bukti: initialData.link_bukti || ""
        });
      } else {
        setForm({
          id_dosen: "",
          judul_pkm: "",
          jenis_diseminasi: "",
          id_tahun_diseminasi: "",
          link_bukti: ""
        });
      }
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999] pointer-events-auto"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Diseminasi Hasil PkM" : "Tambah Diseminasi Hasil PkM"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data Diseminasi Hasil PkM sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Dosen Ketua (DTPR) */}
          <div>
            <label htmlFor="id_dosen" className="block text-sm font-medium text-slate-700 mb-1">
              Nama DTPR (Ketua) <span className="text-red-500">*</span>
            </label>
            <select
              id="id_dosen"
              value={form.id_dosen}
              onChange={(e) => handleChange("id_dosen", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              required
            >
              <option value="">-- Pilih Dosen --</option>
              {dosenList.map((d) => (
                <option key={d.id_dosen} value={d.id_dosen}>
                  {d.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Judul PkM */}
          <div>
            <label htmlFor="judul_pkm" className="block text-sm font-medium text-slate-700 mb-1">
              Judul PkM <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="judul_pkm"
              value={form.judul_pkm}
              onChange={(e) => handleChange("judul_pkm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Judul PkM..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jenis Diseminasi */}
            <div>
              <label htmlFor="jenis_diseminasi" className="block text-sm font-medium text-slate-700 mb-1">
                Diseminasi Hasil PkM (L/N/I) <span className="text-red-500">*</span>
              </label>
              <select
                id="jenis_diseminasi"
                value={form.jenis_diseminasi}
                onChange={(e) => handleChange("jenis_diseminasi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                <option value="">-- Pilih Jenis --</option>
                <option value="L">L - Lokal</option>
                <option value="N">N - Nasional</option>
                <option value="I">I - Internasional</option>
              </select>
            </div>

            {/* Tahun Diseminasi */}
            <div>
              <label htmlFor="id_tahun_diseminasi" className="block text-sm font-medium text-slate-700 mb-1">
                Tahun Diseminasi <span className="text-red-500">*</span>
              </label>
              <select
                id="id_tahun_diseminasi"
                value={form.id_tahun_diseminasi}
                onChange={(e) => handleChange("id_tahun_diseminasi", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                required
              >
                <option value="">-- Pilih Tahun --</option>
                {tahunList.map((t) => {
                  let label = t.tahun || t.nama || t.id_tahun;
                  
                  // Tentukan label TS berdasarkan tahunLaporan atau selectedTahun
                  if (tahunLaporan) {
                    if (t.id_tahun === tahunLaporan.id_ts4) label = `TS-4 (${label})`;
                    else if (t.id_tahun === tahunLaporan.id_ts3) label = `TS-3 (${label})`;
                    else if (t.id_tahun === tahunLaporan.id_ts2) label = `TS-2 (${label})`;
                    else if (t.id_tahun === tahunLaporan.id_ts1) label = `TS-1 (${label})`;
                    else if (t.id_tahun === tahunLaporan.id_ts) label = `TS (${label})`;
                  } else if (selectedTahun) {
                    // Fallback: hitung dari selectedTahun
                    const ts = parseInt(selectedTahun, 10);
                    if (!isNaN(ts)) {
                      const tId = parseInt(t.id_tahun, 10);
                      if (tId === ts) label = `TS (${label})`;
                      else if (tId === ts - 1) label = `TS-1 (${label})`;
                      else if (tId === ts - 2) label = `TS-2 (${label})`;
                      else if (tId === ts - 3) label = `TS-3 (${label})`;
                      else if (tId === ts - 4) label = `TS-4 (${label})`;
                    }
                  }
                  
                  return (
                    <option key={t.id_tahun} value={t.id_tahun}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Link Bukti */}
          <div>
            <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">
              Link Bukti
            </label>
            <input
              type="url"
              id="link_bukti"
              value={form.link_bukti}
              onChange={(e) => handleChange("link_bukti", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <span className="relative z-10">Batal</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </button>
            <button
              type="submit"
              className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            >
              <span className="relative z-10">Simpan</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tabel4C2({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);
  
  const [rows, setRows] = useState([]);
  const [tahunLaporan, setTahunLaporan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  const canHardDelete = roleCan(role, TABLE_KEY, "H");
  
  // Fetch tahun akademik
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const data = await apiFetch("/tahun-akademik");
        const list = Array.isArray(data) ? data : [];
        // Filter tahun mulai dari 2020/2021 (id_tahun >= 2020 atau tahun string mengandung "2020")
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || t.id_tahun || "").toLowerCase();
          return idTahun >= 2020 || tahunStr.includes("2020") || tahunStr.includes("2021");
        });
        const sorted = filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0)); // Urut dari terkecil ke terbesar
        setTahunList(sorted);
        if (sorted.length > 0 && !selectedTahun) {
          // Set default ke tahun 2020/2021 jika ada, jika tidak ambil tahun terkecil
          const defaultTahun = sorted.find(t => {
            const idTahun = parseInt(t.id_tahun) || 0;
            const tahunStr = String(t.tahun || t.nama || "").toLowerCase();
            return idTahun === 2020 || tahunStr.includes("2020/2021") || tahunStr.includes("2020");
          });
          setSelectedTahun(defaultTahun ? defaultTahun.id_tahun : sorted[0].id_tahun);
        }
      } catch (err) {
        console.error("Error fetching tahun:", err);
      }
    };
    fetchTahun();
  }, []);

  // Fetch data
  const fetchRows = async () => {
    if (!selectedTahun) return;
    
    try {
      setLoading(true);
      setError("");
      let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
      if (showDeleted) {
        url += "&include_deleted=1";
      }
      const response = await apiFetch(url);
      
      if (response.tahun_laporan) {
        setTahunLaporan(response.tahun_laporan);
      }
      
      const data = Array.isArray(response.data) ? response.data : (response.items || []);
      setRows(data);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
      Swal.fire('Error!', e?.message || "Gagal memuat data", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTahun) {
      fetchRows();
    }
  }, [selectedTahun, showDeleted]);

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

  // Handle save (create/update)
  const handleSave = async (formData) => {
    try {
      if (editData) {
        await apiFetch(`${ENDPOINT}/${editData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Diseminasi Hasil PkM berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data Diseminasi Hasil PkM berhasil ditambahkan.', 'success');
      }
      setShowForm(false);
      setEditData(null);
      // Refresh dengan parameter yang sesuai dengan state showDeleted
      let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
      if (showDeleted) {
        url += "&include_deleted=1";
      }
      const response = await apiFetch(url);
      if (response.tahun_laporan) {
        setTahunLaporan(response.tahun_laporan);
      }
      const data = Array.isArray(response.data) ? response.data : (response.items || []);
      setRows(data);
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal menyimpan data", 'error');
    }
  };

  // Handle delete
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan dihapus (soft delete).",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}`, { method: 'DELETE' });
        Swal.fire('Berhasil!', 'Data berhasil dihapus.', 'success');
        // Refresh dengan parameter yang sesuai dengan state showDeleted
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response.tahun_laporan) {
          setTahunLaporan(response.tahun_laporan);
        }
        const data = Array.isArray(response.data) ? response.data : (response.items || []);
        setRows(data);
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle restore
  const handleRestore = async (row) => {
    const result = await Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data akan dipulihkan dan muncul kembali di tabel utama.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}/restore`, {
          method: 'POST'
        });
        Swal.fire('Berhasil!', 'Data berhasil dipulihkan.', 'success');
        // Refresh dengan parameter yang sesuai dengan state showDeleted
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response.tahun_laporan) {
          setTahunLaporan(response.tahun_laporan);
        }
        const data = Array.isArray(response.data) ? response.data : (response.items || []);
        setRows(data);
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal memulihkan data", 'error');
      }
    }
  };

  // Handle hard delete
  const handleHardDelete = async (row) => {
    const result = await Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await apiFetch(`${ENDPOINT}/${row.id}/hard`, { method: 'DELETE' });
        Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        // Refresh dengan parameter yang sesuai dengan state showDeleted
        let url = `${ENDPOINT}?ts_id=${selectedTahun}`;
        if (showDeleted) {
          url += "&include_deleted=1";
        }
        const response = await apiFetch(url);
        if (response.tahun_laporan) {
          setTahunLaporan(response.tahun_laporan);
        }
        const data = Array.isArray(response.data) ? response.data : (response.items || []);
        setRows(data);
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!selectedTahun) {
      Swal.fire('Peringatan!', 'Pilih tahun akademik terlebih dahulu.', 'warning');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}${ENDPOINT}/export?ts_id=${selectedTahun}`, {
        credentials: 'include',
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tabel_4C2_Diseminasi_PKM_${selectedTahun}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      Swal.fire('Berhasil!', 'Data berhasil diekspor.', 'success');
    } catch (e) {
      Swal.fire('Error!', e?.message || "Gagal mengekspor data", 'error');
    }
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    if (showDeleted) {
      // Filter data yang dihapus: deleted_at tidak null dan tidak undefined
      return rows.filter(r => r.deleted_at !== null && r.deleted_at !== undefined);
    }
    // Filter data aktif: deleted_at null atau undefined
    return rows.filter(r => r.deleted_at === null || r.deleted_at === undefined);
  }, [rows, showDeleted]);

  // Group rows by judul_pkm and nama_dtpr untuk menghitung summary
  const groupedData = useMemo(() => {
    const activeRows = rows.filter(r => !r.deleted_at);
    const grouped = new Map();
    
    activeRows.forEach(row => {
      const key = `${row.nama_dtpr || ''}_${row.judul_pkm || ''}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          nama_dtpr: row.nama_dtpr,
          judul_pkm: row.judul_pkm,
          jenis_diseminasi: row.jenis_diseminasi,
          ts4: false,
          ts3: false,
          ts2: false,
          ts1: false,
          ts: false
        });
      }
      const item = grouped.get(key);
      if (tahunLaporan) {
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts4 || row.tahun_ts4 === '√') item.ts4 = true;
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts3 || row.tahun_ts3 === '√') item.ts3 = true;
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts2 || row.tahun_ts2 === '√') item.ts2 = true;
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts1 || row.tahun_ts1 === '√') item.ts1 = true;
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts || row.tahun_ts === '√') item.ts = true;
      }
    });
    
    return Array.from(grouped.values());
  }, [rows, tahunLaporan]);

  // Calculate summary (hanya dari data yang tidak dihapus)
  const summary = useMemo(() => {
    const activeRows = rows.filter(r => !r.deleted_at);
    
    // Jumlah Judul PkM per tahun
    const judulTS4 = new Set();
    const judulTS3 = new Set();
    const judulTS2 = new Set();
    const judulTS1 = new Set();
    const judulTS = new Set();
    
    // Jumlah Diseminasi per tahun
    let diseminasiTS4 = 0;
    let diseminasiTS3 = 0;
    let diseminasiTS2 = 0;
    let diseminasiTS1 = 0;
    let diseminasiTS = 0;
    
    // Jumlah per jenis
    let jumlahLokal = 0;
    let jumlahNasional = 0;
    let jumlahInternasional = 0;
    
    activeRows.forEach(row => {
      if (tahunLaporan) {
        // Check TS-4
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts4 || row.tahun_ts4 === '√') {
          judulTS4.add(`${row.nama_dtpr || ''}_${row.judul_pkm || ''}`);
          diseminasiTS4++;
        }
        // Check TS-3
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts3 || row.tahun_ts3 === '√') {
          judulTS3.add(`${row.nama_dtpr || ''}_${row.judul_pkm || ''}`);
          diseminasiTS3++;
        }
        // Check TS-2
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts2 || row.tahun_ts2 === '√') {
          judulTS2.add(`${row.nama_dtpr || ''}_${row.judul_pkm || ''}`);
          diseminasiTS2++;
        }
        // Check TS-1
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts1 || row.tahun_ts1 === '√') {
          judulTS1.add(`${row.nama_dtpr || ''}_${row.judul_pkm || ''}`);
          diseminasiTS1++;
        }
        // Check TS
        if (row.id_tahun_diseminasi === tahunLaporan.id_ts || row.tahun_ts === '√') {
          judulTS.add(`${row.nama_dtpr || ''}_${row.judul_pkm || ''}`);
          diseminasiTS++;
        }
      }
      
      // Count per jenis
      if (row.jenis_diseminasi === 'L') jumlahLokal++;
      else if (row.jenis_diseminasi === 'N') jumlahNasional++;
      else if (row.jenis_diseminasi === 'I') jumlahInternasional++;
    });
    
    return {
      jumlahJudulTS4: judulTS4.size,
      jumlahJudulTS3: judulTS3.size,
      jumlahJudulTS2: judulTS2.size,
      jumlahJudulTS1: judulTS1.size,
      jumlahJudulTS: judulTS.size,
      jumlahDiseminasiTS4: diseminasiTS4,
      jumlahDiseminasiTS3: diseminasiTS3,
      jumlahDiseminasiTS2: diseminasiTS2,
      jumlahDiseminasiTS1: diseminasiTS1,
      jumlahDiseminasiTS: diseminasiTS,
      jumlahLokal,
      jumlahNasional,
      jumlahInternasional
    };
  }, [rows, tahunLaporan]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data Diseminasi Hasil PkM untuk tabel 4C-2.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{filteredRows.length}</span>
            </span>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tahun Akademik Selector */}
          <select
            value={selectedTahun || ""}
            onChange={(e) => setSelectedTahun(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
          >
            <option value="">-- Pilih Tahun --</option>
            {tahunList.map((t) => (
              <option key={t.id_tahun} value={t.id_tahun}>
                {t.tahun || t.nama || t.id_tahun}
              </option>
            ))}
          </select>

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

          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${filteredRows.length} baris`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors flex items-center gap-2"
            >
              <FiPlus size={18} />
              Tambah Data
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiDownload size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Nama DTPR<br/>(Ketua)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Diseminasi Hasil PkM<br/>(L/N/I)
              </th>
              {tahunLaporan && (
                <th colSpan="5" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  Tahun Diseminasi
                </th>
              )}
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Link Bukti</th>
              {(canUpdate || canDelete) && (
                <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Aksi</th>
              )}
            </tr>
            {tahunLaporan && (
              <tr>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-4<br/>({tahunLaporan.nama_ts4})
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-3<br/>({tahunLaporan.nama_ts3})
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-2<br/>({tahunLaporan.nama_ts2})
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS-1<br/>({tahunLaporan.nama_ts1})
                </th>
                <th className="px-6 py-3 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  TS<br/>({tahunLaporan.nama_ts})
                </th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={tahunLaporan ? 11 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={tahunLaporan ? 11 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              <>
                {filteredRows.map((r, i) => {
                  const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                  // Buat key yang unik dengan menggabungkan rowId dan index untuk menghindari duplikasi
                  const uniqueKey = `${rowId}-${i}`;
                  const isDeleted = r.deleted_at;
                  
                  // Check checkmark untuk 5 tahun
                  const checkTS4 = tahunLaporan && (r.id_tahun_diseminasi === tahunLaporan.id_ts4 || r.tahun_ts4 === '√');
                  const checkTS3 = tahunLaporan && (r.id_tahun_diseminasi === tahunLaporan.id_ts3 || r.tahun_ts3 === '√');
                  const checkTS2 = tahunLaporan && (r.id_tahun_diseminasi === tahunLaporan.id_ts2 || r.tahun_ts2 === '√');
                  const checkTS1 = tahunLaporan && (r.id_tahun_diseminasi === tahunLaporan.id_ts1 || r.tahun_ts1 === '√');
                  const checkTS = tahunLaporan && (r.id_tahun_diseminasi === tahunLaporan.id_ts || r.tahun_ts === '√');
                  
                  return (
                    <tr
                      key={uniqueKey}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_dtpr || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                        <div className="truncate" title={r.judul_pkm || ""}>
                          {r.judul_pkm || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.jenis_diseminasi || "-"}</td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS4 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS3 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS2 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS1 ? "√" : ""}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{checkTS ? "√" : ""}</td>
                        </>
                      )}
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">
                        {r.link_bukti ? (
                          <a 
                            href={r.link_bukti} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#0384d6] underline hover:text-[#043975]"
                          >
                            Lihat
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200">
                          <div className="flex items-center justify-center dropdown-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
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
                              aria-expanded={openDropdownId === rowId}
                            >
                              <FiMoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                
                {/* Summary Rows - Hanya tampilkan jika tidak menampilkan data yang dihapus */}
                {filteredRows.length > 0 && !loading && !showDeleted && tahunLaporan && (
                  <>
                    {/* Jumlah Judul PkM */}
                    <tr className="font-semibold">
                      <td colSpan="4" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Judul PkM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahJudulTS4}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahJudulTS3}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahJudulTS2}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahJudulTS1}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahJudulTS}
                      </td>
                      <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                    </tr>
                    
                    {/* Jumlah Diseminasi Hasil PkM */}
                    <tr className="font-semibold">
                      <td colSpan="4" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Diseminasi Hasil PkM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahDiseminasiTS4}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahDiseminasiTS3}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahDiseminasiTS2}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahDiseminasiTS1}
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahDiseminasiTS}
                      </td>
                      <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                    </tr>
                    
                    {/* Jumlah PkM Lokal */}
                    <tr className="font-semibold">
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah PkM Lokal
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahLokal}
                      </td>
                      <td colSpan={tahunLaporan ? 8 : 3} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>
                    
                    {/* Jumlah PkM Nasional */}
                    <tr className="font-semibold">
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah PkM Nasional
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahNasional}
                      </td>
                      <td colSpan={tahunLaporan ? 8 : 3} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>
                    
                    {/* Jumlah PkM Internasional */}
                    <tr className="font-semibold">
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah PkM Internasional
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        {summary.jumlahInternasional}
                      </td>
                      <td colSpan={tahunLaporan ? 8 : 3} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>
                  </>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : r.id || idx;
          return rowId === openDropdownId;
        });
        if (!currentRow) return null;

        const isDeleted = currentRow.deleted_at;

        return (
          <div 
            className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            {!isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditData(currentRow);
                  setShowForm(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label="Edit data"
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label="Hapus data"
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label="Pulihkan data"
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canHardDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label="Hapus permanen data"
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Modal Form */}
      <ModalForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSave={handleSave}
        initialData={editData}
        maps={maps}
        authUser={authUser}
        selectedTahun={selectedTahun}
        tahunLaporan={tahunLaporan}
      />
    </div>
  );
}


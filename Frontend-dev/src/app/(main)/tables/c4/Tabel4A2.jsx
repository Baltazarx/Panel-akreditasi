"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiDownload, FiPlus } from 'react-icons/fi';

const ENDPOINT = "/tabel-4a2-pkm";
const TABLE_KEY = "tabel_4a2_pkm";
const LABEL = "4.A.2 PkM DTPR";

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, authUser, selectedTahun }) {
  const [form, setForm] = useState({
    link_roadmap: "",
    id_dosen_ketua: "",
    judul_pkm: "",
    jml_mhs_terlibat: "",
    jenis_hibah_pkm: "",
    sumber_dana: "",
    durasi_tahun: "",
    link_bukti: "",
    pendanaan: [] // Array untuk pendanaan: [{id_tahun, jumlah_dana}, ...]
  });

  // State untuk form input pendanaan baru
  const [selectedTahunPendanaan, setSelectedTahunPendanaan] = useState("");
  const [jumlahDanaPendanaan, setJumlahDanaPendanaan] = useState("");

  const [dosenList, setDosenList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [tahunLaporan, setTahunLaporan] = useState(null);

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

  // Fetch tahun akademik
  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const data = await apiFetch("/tahun-akademik");
        const list = Array.isArray(data) ? data : [];
        // Filter hanya tahun mulai dari 2020/2021 (id_tahun >= 2020)
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || "");
          // Filter tahun dengan id_tahun >= 2020 atau nama tahun mengandung "2020"
          return idTahun >= 2020 || tahunStr.includes("2020");
        });
        setTahunList(filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0))); // Urut dari terkecil ke terbesar
      } catch (err) {
        console.error("Error fetching tahun:", err);
        setTahunList([]);
      }
    };
    if (isOpen) fetchTahun();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Reset input pendanaan setiap kali form dibuka
      setSelectedTahunPendanaan("");
      setJumlahDanaPendanaan("");
      
      if (initialData) {
        // Load existing data
        setForm({
          link_roadmap: initialData.link_roadmap || "",
          id_dosen_ketua: initialData.id_dosen_ketua || "",
          judul_pkm: initialData.judul_pkm || "",
          jml_mhs_terlibat: initialData.jml_mhs_terlibat || "",
          jenis_hibah_pkm: initialData.jenis_hibah_pkm || "",
          sumber_dana: initialData.sumber_dana || "",
          durasi_tahun: initialData.durasi_tahun || "",
          link_bukti: initialData.link_bukti || "",
          pendanaan: initialData.pendanaan || []
        });
        
        // Fetch detail untuk mendapatkan pendanaan lengkap
        if (initialData.id) {
          apiFetch(`${ENDPOINT}/${initialData.id}`)
            .then(data => {
              if (data.pendanaan && Array.isArray(data.pendanaan)) {
                // Tampilkan semua pendanaan yang ada (tidak perlu filter)
                setForm(prev => ({ ...prev, pendanaan: data.pendanaan }));
              }
            })
            .catch(err => console.error("Error fetching detail:", err));
        }
      } else {
        // Reset form for new data
        setForm({
          link_roadmap: "",
          id_dosen_ketua: "",
          judul_pkm: "",
          jml_mhs_terlibat: "",
          jenis_hibah_pkm: "",
          sumber_dana: "",
          durasi_tahun: "",
          link_bukti: "",
          pendanaan: []
        });
      }
    }
  }, [initialData, isOpen]);

  // Get tahun laporan untuk menentukan tahun laporan (untuk display di tabel)
  useEffect(() => {
    const getTahunLaporan = async () => {
      try {
        // Prioritaskan tahun 2020/2021, jika tidak ada gunakan tahun pertama
        if (tahunList.length > 0 && selectedTahun) {
          const ts_id = selectedTahun;
          
          // Fetch data untuk mendapatkan tahun_laporan
          const response = await apiFetch(`${ENDPOINT}?ts_id=${ts_id}`);
          if (response.tahun_laporan) {
            setTahunLaporan(response.tahun_laporan);
          }
        }
      } catch (err) {
        console.error("Error getting tahun laporan:", err);
      }
    };
    
    if (isOpen && tahunList.length > 0 && selectedTahun) {
      getTahunLaporan();
    }
  }, [isOpen, tahunList, selectedTahun]);

  // Lock body scroll when modal is open - HARUS SEBELUM EARLY RETURN
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePendanaanChange = (index, field, value) => {
    setForm((prev) => {
      const newPendanaan = [...prev.pendanaan];
      newPendanaan[index] = {
        ...newPendanaan[index],
        [field]: field === 'jumlah_dana' ? parseFloat(value) || 0 : value
      };
      return { ...prev, pendanaan: newPendanaan };
    });
  };

  const handleAddPendanaan = () => {
    if (!selectedTahunPendanaan) {
      Swal.fire({
        icon: 'warning',
        title: 'Pilih Tahun',
        text: 'Silakan pilih tahun terlebih dahulu.'
      });
      return;
    }
    const jumlahDanaNum = parseFloat(jumlahDanaPendanaan) || 0;
    if (jumlahDanaNum < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Jumlah Dana Tidak Valid',
        text: 'Jumlah dana harus lebih besar atau sama dengan 0.'
      });
      return;
    }
    // Cek apakah tahun sudah ada di list
    const tahunSudahAda = form.pendanaan.some(p => p.id_tahun === selectedTahunPendanaan);
    if (tahunSudahAda) {
      Swal.fire({
        icon: 'warning',
        title: 'Tahun Sudah Ada',
        text: 'Tahun yang dipilih sudah ada dalam daftar pendanaan. Silakan pilih tahun lain atau edit yang sudah ada.'
      });
      return;
    }
    // Tambahkan ke list pendanaan
    setForm((prev) => ({
      ...prev,
      pendanaan: [...(Array.isArray(prev.pendanaan) ? prev.pendanaan : []), { 
        id_tahun: selectedTahunPendanaan, 
        jumlah_dana: jumlahDanaNum 
      }]
    }));
    // Reset input
    setSelectedTahunPendanaan("");
    setJumlahDanaPendanaan("");
  };

  const removePendanaanRow = (index) => {
    setForm((prev) => {
      const newPendanaan = prev.pendanaan.filter((_, i) => i !== index);
      return { ...prev, pendanaan: newPendanaan };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi minimal 1 pendanaan
    const pendanaanArray = Array.isArray(form.pendanaan) ? form.pendanaan : [];
    if (pendanaanArray.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pendanaan Wajib',
        text: 'Minimal harus ada 1 data pendanaan.'
      });
      return;
    }
    // Validasi semua pendanaan harus memiliki tahun dan jumlah dana
    const invalidPendanaan = pendanaanArray.some(p => !p.id_tahun || p.jumlah_dana === undefined || p.jumlah_dana === null || p.jumlah_dana < 0);
    if (invalidPendanaan) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Pendanaan Tidak Lengkap',
        text: 'Semua pendanaan harus memiliki tahun yang dipilih dan jumlah dana yang valid (minimal 0).'
      });
      return;
    }
    onSave(form);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
      style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative z-[10000] pointer-events-auto"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit PkM DTPR" : "Tambah PkM DTPR"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data PkM DTPR sesuai dengan format LKPS.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Link Roadmap */}
          <div>
            <label htmlFor="link_roadmap" className="block text-sm font-medium text-slate-700 mb-1">
              Link Roadmap
            </label>
            <input
              type="url"
              id="link_roadmap"
              value={form.link_roadmap}
              onChange={(e) => handleChange("link_roadmap", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="https://..."
            />
          </div>

          {/* Dosen Ketua */}
          <div>
            <label htmlFor="id_dosen_ketua" className="block text-sm font-medium text-slate-700 mb-1">
              Dosen Ketua (DTPR) <span className="text-red-500">*</span>
            </label>
            <select
              id="id_dosen_ketua"
              value={form.id_dosen_ketua}
              onChange={(e) => handleChange("id_dosen_ketua", e.target.value)}
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
            {/* Jumlah Mahasiswa Terlibat */}
            <div>
              <label htmlFor="jml_mhs_terlibat" className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Mahasiswa Terlibat
              </label>
              <input
                type="number"
                id="jml_mhs_terlibat"
                value={form.jml_mhs_terlibat}
                onChange={(e) => handleChange("jml_mhs_terlibat", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Durasi Tahun */}
            <div>
              <label htmlFor="durasi_tahun" className="block text-sm font-medium text-slate-700 mb-1">
                Durasi (Tahun)
              </label>
              <input
                type="number"
                id="durasi_tahun"
                value={form.durasi_tahun}
                onChange={(e) => handleChange("durasi_tahun", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Jenis Hibah PkM */}
          <div>
            <label htmlFor="jenis_hibah_pkm" className="block text-sm font-medium text-slate-700 mb-1">
              Jenis Hibah PkM
            </label>
            <input
              type="text"
              id="jenis_hibah_pkm"
              value={form.jenis_hibah_pkm}
              onChange={(e) => handleChange("jenis_hibah_pkm", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              placeholder="Jenis hibah..."
            />
          </div>

          {/* Sumber Dana */}
          <div>
            <label htmlFor="sumber_dana" className="block text-sm font-medium text-slate-700 mb-1">
              Sumber Dana (L/N/I) <span className="text-red-500">*</span>
            </label>
            <select
              id="sumber_dana"
              value={form.sumber_dana}
              onChange={(e) => handleChange("sumber_dana", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              required
            >
              <option value="">-- Pilih Sumber Dana --</option>
              <option value="L">L - Lembaga</option>
              <option value="N">N - Nasional</option>
              <option value="I">I - Internasional</option>
            </select>
          </div>

          {/* Pendanaan */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Pendanaan (Rp Juta) <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">Pilih tahun dan masukkan jumlah dana, lalu klik "Tambah" untuk menambahkan ke daftar.</p>
            
            {/* Form Input Pendanaan Baru */}
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 mb-1">Pilih Tahun</label>
                  <select
                    value={selectedTahunPendanaan}
                    onChange={(e) => setSelectedTahunPendanaan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                  >
                    <option value="">-- Pilih Tahun --</option>
                    {tahunList.map((t) => (
                      <option key={t.id_tahun} value={t.id_tahun}>
                        {t.tahun || t.nama || t.id_tahun}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 mb-1">Jumlah Dana (Rp)</label>
                  <input
                    type="number"
                    value={jumlahDanaPendanaan}
                    onChange={(e) => setJumlahDanaPendanaan(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                    placeholder="0"
                    min="0"
                    step="1"
                    autoComplete="off"
                    autoFocus={false}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPendanaan}
                  className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </div>

            {/* Daftar Pendanaan yang Sudah Ditambahkan */}
            {form.pendanaan.length > 0 && (
              <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-white">
                <label className="block text-xs font-medium text-slate-700 mb-2">Daftar Pendanaan:</label>
                {form.pendanaan.map((p, idx) => {
                  const tahunInfo = tahunList.find(t => t.id_tahun === p.id_tahun);
                  const tahunLabel = tahunInfo ? (tahunInfo.tahun || tahunInfo.nama || tahunInfo.id_tahun) : `Tahun ${p.id_tahun}`;
                  
                  return (
                    <div key={`pendanaan-${idx}-${p.id_tahun}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700">{tahunLabel}</span>
                        <span className="text-sm text-slate-500 ml-2">
                          : Rp {new Intl.NumberFormat('id-ID').format(p.jumlah_dana || 0)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendanaanRow(idx)}
                        className="px-3 py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        title="Hapus pendanaan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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

export default function Tabel4A2({ auth, role: propRole, selectedTahun: propSelectedTahun }) {
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
  const [linkRoadmap, setLinkRoadmap] = useState("");
  
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
        // Filter hanya tahun mulai dari 2020/2021 (id_tahun >= 2020)
        const filtered = list.filter(t => {
          const idTahun = parseInt(t.id_tahun) || 0;
          const tahunStr = String(t.tahun || t.nama || "");
          // Filter tahun dengan id_tahun >= 2020 atau nama tahun mengandung "2020"
          return idTahun >= 2020 || tahunStr.includes("2020");
        });
        const sorted = filtered.sort((a, b) => (a.id_tahun || 0) - (b.id_tahun || 0)); // Urut dari terkecil ke terbesar
        setTahunList(sorted);
        if (sorted.length > 0 && !selectedTahun) {
          // Prioritaskan tahun 2020/2021, jika tidak ada gunakan tahun terkecil
          const tahun2020 = sorted.find(t => {
            const tahunStr = String(t.tahun || t.nama || "");
            return tahunStr.includes("2020") || parseInt(t.id_tahun) === 2020;
          });
          setSelectedTahun(tahun2020 ? tahun2020.id_tahun : sorted[0].id_tahun);
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
        Swal.fire('Berhasil!', 'Data PkM berhasil diperbarui.', 'success');
      } else {
        await apiFetch(ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        Swal.fire('Berhasil!', 'Data PkM berhasil ditambahkan.', 'success');
      }
      setShowForm(false);
      setEditData(null);
      fetchRows();
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
        fetchRows();
      } catch (e) {
        Swal.fire('Error!', e?.message || "Gagal menghapus data", 'error');
      }
    }
  };

  // Handle restore
  const handleRestore = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data "${row.judul_pkm || 'data ini'}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idField = getIdField(row);
          const rowId = idField ? row[idField] : row.id;
          
          if (!rowId) {
            throw new Error('ID data tidak valid. Silakan refresh halaman dan coba lagi.');
          }

          // Gunakan endpoint restore yang terpisah (POST /:id/restore)
          await apiFetch(`${ENDPOINT}/${rowId}/restore`, {
            method: "POST",
          });
          
          Swal.fire({
            icon: 'success',
            title: 'Dipulihkan!',
            text: 'Data telah berhasil dipulihkan.',
            timer: 1500,
            showConfirmButton: false
          });
          
          fetchRows();
        } catch (e) {
          console.error("Restore error:", e);
          const errorMessage = e.message || e.error || 'Terjadi kesalahan saat memulihkan data';
          Swal.fire({
            icon: 'error',
            title: 'Gagal memulihkan data',
            text: errorMessage
          });
        }
      }
    });
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
        fetchRows();
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
      a.download = `Tabel_4A2_PkM_DTPR_${selectedTahun}.xlsx`;
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
      // Hanya tampilkan data yang benar-benar dihapus (deleted_at IS NOT NULL)
      return rows.filter(r => r.deleted_at !== null && r.deleted_at !== undefined);
    }
    // Tampilkan data yang tidak dihapus (deleted_at IS NULL)
    return rows.filter(r => r.deleted_at === null || r.deleted_at === undefined);
  }, [rows, showDeleted]);

  // Calculate summary (hanya dari data yang tidak dihapus)
  const summary = useMemo(() => {
    // Selalu hitung dari data yang tidak dihapus, bukan dari filteredRows
    const activeRows = rows.filter(r => !r.deleted_at);
    const totalDanaTS4 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts4) || 0), 0);
    const totalDanaTS3 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts3) || 0), 0);
    const totalDanaTS2 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts2) || 0), 0);
    const totalDanaTS1 = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts1) || 0), 0);
    const totalDanaTS = activeRows.reduce((sum, r) => sum + (Number(r.pendanaan_ts) || 0), 0);
    const jumlahPkm = activeRows.length;
    const uniqueJenisHibah = new Set(activeRows.map(r => r.jenis_hibah_pkm).filter(Boolean));
    const jumlahJenisHibah = uniqueJenisHibah.size;
    
    return {
      totalDanaTS4,
      totalDanaTS3,
      totalDanaTS2,
      totalDanaTS1,
      totalDanaTS,
      jumlahPkm,
      jumlahJenisHibah
    };
  }, [rows]);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data PkM DTPR untuk tabel 4A-2.
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

      {/* Roadmap Card */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <label className="text-gray-800 font-bold text-base">Roadmap</label>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <input
              type="url"
              value={linkRoadmap}
              onChange={(e) => setLinkRoadmap(e.target.value)}
              placeholder="Tuliskan link ke dokumen roadmap Pengabdian kepada Masyarakat"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => {
                // TODO: Implement save roadmap functionality
                Swal.fire('Info', 'Fitur simpan roadmap akan segera tersedia.', 'info');
              }}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          {/* Main Table Header */}
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">No</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Nama DTPR<br/>(Sebagai Ketua PkM)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Judul PkM</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Jumlah Mahasiswa<br/>yang Terlibat
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">Jenis Hibah PkM</th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Sumber Dana<br/>(L/N/I)
              </th>
              <th rowSpan="2" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                Durasi<br/>(tahun)
              </th>
              {tahunLaporan && (
                <th colSpan="5" className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border-[0.5px] border-white">
                  Pendanaan (Rp Juta)
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
                <td colSpan={tahunLaporan ? 13 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>
                  <p className="mt-4">Memuat data...</p>
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={tahunLaporan ? 13 : 8} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang tersedia untuk tabel ini.</p>
                </td>
              </tr>
            ) : (
              <>
                {filteredRows.map((r, i) => {
                  const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
                  const isDeleted = r.deleted_at;
                  
                  // Format pendanaan ke juta rupiah
                  const formatPendanaan = (value) => {
                    if (!value || value === 0) return "-";
                    return (value / 1000000).toFixed(2);
                  };
                  
                  return (
                    <tr
                      key={rowId}
                      className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-6 py-4 text-center border border-slate-200 font-medium text-slate-800">{i + 1}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.nama_dtpr || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700 max-w-xs">
                        <div className="truncate" title={r.judul_pkm || ""}>
                          {r.judul_pkm || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.jml_mhs_terlibat || "-"}</td>
                      <td className="px-6 py-4 border border-slate-200 text-slate-700">{r.jenis_hibah_pkm || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.sumber_dana || "-"}</td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{r.durasi_tahun || "-"}</td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts4)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts3)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts2)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts1)}</td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-700">{formatPendanaan(r.pendanaan_ts)}</td>
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
                {filteredRows.length > 0 && !loading && !showDeleted && (
                  <>
                    {/* Jumlah Dana */}
                    <tr className="bg-yellow-50 font-semibold">
                      <td colSpan="7" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Dana
                      </td>
                      {tahunLaporan && (
                        <>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                            {(summary.totalDanaTS4 / 1000000).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                            {(summary.totalDanaTS3 / 1000000).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                            {(summary.totalDanaTS2 / 1000000).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                            {(summary.totalDanaTS1 / 1000000).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                            {(summary.totalDanaTS / 1000000).toFixed(2)}
                          </td>
                        </>
                      )}
                      <td colSpan={(canUpdate || canDelete) ? 2 : 1} className="px-6 py-4 border border-slate-200"></td>
                    </tr>
                    
                    {/* Jumlah PkM */}
                    <tr className="bg-yellow-50 font-semibold">
                      <td colSpan="2" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah PkM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                        {summary.jumlahPkm}
                      </td>
                      <td colSpan={tahunLaporan ? 9 : 4} className="px-6 py-4 border border-slate-200"></td>
                      {(canUpdate || canDelete) && (
                        <td className="px-6 py-4 border border-slate-200"></td>
                      )}
                    </tr>
                    
                    {/* Jumlah Jenis Hibah PKM */}
                    <tr className="bg-yellow-50 font-semibold">
                      <td colSpan="4" className="px-6 py-4 text-center border border-slate-200 text-slate-800">
                        Jumlah Jenis Hibah PKM
                      </td>
                      <td className="px-6 py-4 text-center border border-slate-200 text-slate-800 bg-yellow-100">
                        {summary.jumlahJenisHibah}
                      </td>
                      <td colSpan={tahunLaporan ? 7 : 2} className="px-6 py-4 border border-slate-200"></td>
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
      />
    </div>
  );
}

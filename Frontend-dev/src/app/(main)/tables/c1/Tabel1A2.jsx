import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

/* ---------- Format Rupiah ---------- */
const formatRupiah = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(String(value).replace(/[^\d\-]/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numeric);
};

/* ---------- Year selector (TS filter) ---------- */
function YearSelector({ maps, activeYear, setActiveYear, tahunList, isLoadingTahun }) {
  // Gunakan maps.tahun jika ada, jika tidak gunakan tahunList
  const tahunData = Object.keys(maps.tahun || {}).length > 0 ? Object.values(maps.tahun) : tahunList;
  
  return (
    <select
      className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
      value={activeYear}
      onChange={(e) => setActiveYear(e.target.value)}
    >
      <option value="">Semua Tahun</option>
      {isLoadingTahun ? (
        <option disabled>Memuat tahun...</option>
      ) : (
        tahunData.map((y) => (
          <option key={y.id_tahun} value={y.id_tahun}>
            {y.tahun || y.nama}
          </option>
        ))
      )}
    </select>
  );
}

/* ---------- Modal Form Tambah/Edit ---------- */
function ModalForm({ isOpen, onClose, onSave, initialData, maps, activeYear, tahunList }) {
  const [form, setForm] = useState({
    sumber_dana: "",
    jumlah_dana: "",
    link_bukti: "",
    id_tahun: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        sumber_dana: initialData.sumber_dana || "",
        jumlah_dana: initialData.jumlah_dana || "",
        link_bukti: initialData.link_bukti || "",
        id_tahun: initialData.id_tahun || activeYear || "",
      });
    } else {
      setForm({
        sumber_dana: "",
        jumlah_dana: "",
        link_bukti: "",
        id_tahun: activeYear || "",
      });
    }
  }, [initialData, activeYear]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
        <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Sumber Dana" : "Tambah Sumber Dana"}
          </h2>
          <p className="text-white/80 mt-1 text-sm">Lengkapi data sumber pendanaan per tahun.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="">
            <label htmlFor="id_tahun" className="block text-sm font-medium text-slate-700 mb-1">Tahun Akademik</label>
                   <select
                     id="id_tahun"
                     value={form.id_tahun}
                     onChange={(e) => handleChange("id_tahun", e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                     required
                   >
                     <option value="">Pilih Tahun Akademik</option>
                     {(Object.keys(maps.tahun || {}).length > 0 ? Object.values(maps.tahun) : tahunList).map((y) => (
                       <option key={y.id_tahun} value={y.id_tahun}>
                         {y.tahun || y.nama}
                       </option>
                     ))}
                   </select>
          </div>

          <div className="">
            <label htmlFor="sumber_dana" className="block text-sm font-medium text-slate-700 mb-1">Sumber Dana</label>
            <input
              type="text"
              id="sumber_dana"
              value={form.sumber_dana}
              onChange={(e) => handleChange("sumber_dana", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              required
            />
          </div>

          <div className="">
            <label htmlFor="jumlah_dana" className="block text-sm font-medium text-slate-700 mb-1">Jumlah Dana</label>
            <input
              type="number"
              id="jumlah_dana"
              value={form.jumlah_dana}
              onChange={(e) => handleChange("jumlah_dana", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              required
            />
          </div>

          <div className="">
            <label htmlFor="link_bukti" className="block text-sm font-medium text-slate-700 mb-1">Link Bukti</label>
            <input
              type="text"
              id="link_bukti"
              value={form.link_bukti}
              onChange={(e) => handleChange("link_bukti", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Batal
            </button>
            <button 
                type="submit" 
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
            >
                Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Tabel Per Tahun (CRUD) ---------- */
function TablePerYear({ rows, onEdit, onDelete, onRestore, onHardDelete, canUpdate, canDelete, getYearLabel, showDeleted, selectedRows, setSelectedRows, isAllSelected, handleSelectAll, openDropdownId, setOpenDropdownId, setDropdownPosition }) {
  // Hanya tampilkan data yang dihapus jika showDeleted true
  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
  
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            {showDeleted && (
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                />
              </th>
            )}
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Sumber Dana</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Dana</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredRows.map((r, i) => (
            <tr key={i} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
              {showDeleted && (
                <td className="px-6 py-4 text-center border border-slate-200">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(r.id_sumber)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows([...selectedRows, r.id_sumber]);
                      } else {
                        setSelectedRows(selectedRows.filter(id => id !== r.id_sumber));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                  />
                </td>
              )}
              <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{getYearLabel ? getYearLabel(r.id_tahun) : r.id_tahun}</td>
              <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{r.sumber_dana}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.jumlah_dana)}</td>
              <td className="px-6 py-4 text-slate-NF700 border border-slate-200">
                {r.link_bukti ? (
                  <a href={r.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975]">
                    Lihat Bukti
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-6 py-4 border border-slate-200">
                <div className="flex items-center justify-center dropdown-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rowId = r.id_sumber || i;
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
                    aria-expanded={openDropdownId === (r.id_sumber || i)}
                  >
                    <FiMoreVertical size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={showDeleted ? 6 : 5} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                <p className="font-medium">Data tidak ditemukan</p>
                <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Tabel Ringkasan Semua Tahun ---------- */
function TableSummary({ rows }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Sumber Pendanaan</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-4</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-3</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-2</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS-1</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((r, i) => (
            <tr key={i} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
              <td className="px-6 py-4 font-semibold text-slate-800 border border-slate-200">{r.sumber_dana}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.ts4)}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.ts3)}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.ts2)}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.ts1)}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{formatRupiah(r.ts)}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">
                {r.link_bukti ? (
                  <a href={r.link_bukti} target="_blank" rel="noreferrer" className="text-[#0384d6] underline hover:text-[#043975]">
                    Bukti
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Page Component ---------- */
export default function Tabel1A2({ auth, role }) {
  const { maps: mapsFromHook } = useMaps(auth?.user || true);
  const maps = mapsFromHook ?? { tahun: {} };
  
  // Fallback untuk memastikan data tahun tersedia untuk semua role
  const [tahunList, setTahunList] = useState([]);
  const [isLoadingTahun, setIsLoadingTahun] = useState(false);

  const [rows, setRows] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [activeYear, setActiveYear] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal state & editing row
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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
    if (modalOpen) {
      setOpenDropdownId(null);
    }
  }, [modalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [modalOpen]);

  // Permission flags
  const canCreate = roleCan(role, "tabel_1a2", "C");
  const canUpdate = roleCan(role, "tabel_1a2", "U");
  const canDelete = roleCan(role, "tabel_1a2", "D");

  // Fetch tahun data jika maps.tahun kosong
  useEffect(() => {
    const fetchTahunIfEmpty = async () => {
      if (Object.keys(maps.tahun || {}).length === 0 && !isLoadingTahun) {
        setIsLoadingTahun(true);
        
        // Langsung gunakan hardcoded fallback untuk role lppm
        // menggunakan id_tahun yang sesuai dengan database
        const defaultTahunList = [
          { id_tahun: 2020, tahun: "2020/2021" },
          { id_tahun: 2021, tahun: "2021/2022" },
          { id_tahun: 2022, tahun: "2022/2023" },
          { id_tahun: 2023, tahun: "2023/2024" },
          { id_tahun: 2024, tahun: "2024/2025" },
          { id_tahun: 2025, tahun: "2025/2026" },
          { id_tahun: 2026, tahun: "2026/2027" },
          { id_tahun: 2027, tahun: "2027/2028" },
          { id_tahun: 2028, tahun: "2028/2029" },
          { id_tahun: 2029, tahun: "2029/2030" },
          { id_tahun: 2030, tahun: "2030/2031" },
          { id_tahun: 2031, tahun: "2031/2032" },
          { id_tahun: 2032, tahun: "2032/2033" },
          { id_tahun: 2033, tahun: "2033/2034" },
          { id_tahun: 2034, tahun: "2034/2035" },
          { id_tahun: 2035, tahun: "2035/2036" },
          { id_tahun: 2036, tahun: "2036/2037" },
          { id_tahun: 2037, tahun: "2037/2038" },
          { id_tahun: 2038, tahun: "2038/2039" }
        ];
        
        setTahunList(defaultTahunList);
        setIsLoadingTahun(false);
      }
    };

    fetchTahunIfEmpty();
  }, [maps.tahun, isLoadingTahun]);

  // (Removed) Auto-set latest year. Default stays as "Semua Tahun" (empty string)

  // Helper: sort years descending by label string (e.g., "2024/2025")
  const getSortedYearsDesc = () => {
    // Gunakan maps.tahun jika ada, jika tidak gunakan tahunList
    const tahunData = Object.keys(maps.tahun || {}).length > 0 ? Object.values(maps.tahun) : tahunList;
    return [...tahunData].sort((a, b) => String(b.tahun || b.nama || "").localeCompare(String(a.tahun || a.nama || "")));
  };

  // Helper: get 5 relative year ids from a base year id (TS..TS-4)
  const getRelativeYearIdsFromBase = (baseYearId) => {
    if (!baseYearId) return [];
    const sorted = getSortedYearsDesc();
    const idx = sorted.findIndex((y) => String(y.id_tahun) === String(baseYearId));
    if (idx === -1) return [];
    const slice = sorted.slice(idx, idx + 5);
    return slice.map((y) => y.id_tahun);
  };

  // Helper: given activeYear id, return up to [TS, TS-1, TS-2, TS-3, TS-4] as year IDs
  const getRelativeYearIds = () => {
    if (!activeYear) return [];
    return getRelativeYearIdsFromBase(activeYear);
  };

  // Generic compute summary from a base year id
  const computeSummaryFromBaseYear = async (baseYearId) => {
    const yearIds = getRelativeYearIdsFromBase(baseYearId);
    if (!yearIds.length) return;
    const [ts, ts1, ts2, ts3, ts4] = yearIds;
    
    // Fetch data untuk 5 tahun terakhir (hanya data aktif, tanpa yang dihapus)
    const fetches = [ts, ts1, ts2, ts3, ts4].map((id) =>
      id ? apiFetch(`/sumber-pendanaan?id_tahun=${encodeURIComponent(id)}`) : Promise.resolve([])
    );
    const [tsData, ts1Data, ts2Data, ts3Data, ts4Data] = await Promise.all(fetches);
    const normalize = (d) => (Array.isArray(d) ? d : d?.items || []);
    // Filter hanya data yang tidak dihapus (deleted_at === null)
    const tsRows = normalize(tsData).filter(r => !r.deleted_at);
    const ts1Rows = normalize(ts1Data).filter(r => !r.deleted_at);
    const ts2Rows = normalize(ts2Data).filter(r => !r.deleted_at);
    const ts3Rows = normalize(ts3Data).filter(r => !r.deleted_at);
    const ts4Rows = normalize(ts4Data).filter(r => !r.deleted_at);

    const sumberToRow = new Map();
    const addRows = (rowsArr, keyName) => {
      rowsArr.forEach((r) => {
        const key = String(r.sumber_dana || "");
        if (!sumberToRow.has(key)) {
          sumberToRow.set(key, {
            sumber_dana: key,
            ts: 0,
            ts1: 0,
            ts2: 0,
            ts3: 0,
            ts4: 0,
            link_bukti: r.link_bukti || "",
          });
        }
        const agg = sumberToRow.get(key);
        agg[keyName] = Number(r.jumlah_dana || 0);
        if (keyName === 'ts' && r.link_bukti) agg.link_bukti = r.link_bukti;
        else if (!agg.link_bukti && r.link_bukti) agg.link_bukti = r.link_bukti;
      });
    };

    addRows(tsRows, "ts");
    addRows(ts1Rows, "ts1");
    addRows(ts2Rows, "ts2");
    addRows(ts3Rows, "ts3");
    addRows(ts4Rows, "ts4");

    setSummaryRows(Array.from(sumberToRow.values()));
  };


  // Compute summary for the selected activeYear
  const computeSummaryForActiveYear = async () => {
    if (!activeYear) return;
    await computeSummaryFromBaseYear(activeYear);
  };

  // Fetch summary (all years) from backend
  const fetchSummaryAll = async () => {
    const data = await apiFetch(`/sumber-pendanaan/summary`);
    setSummaryRows(Array.isArray(data) ? data : data?.items || []);
  };


  // Fetch data per tahun dan summary sesuai filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Debug logging
        console.log("Tabel1A2 - Fetching data with:", { 
          activeYear, 
          showDeleted,
          mapsTahun: Object.keys(maps.tahun || {}), 
          tahunListLength: tahunList.length,
          role: role
        });
        
        // Fetch data utama
        let qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "?";
        if (showDeleted) {
          qs += (qs.length > 1 ? "&" : "") + "include_deleted=1";
        }
        const fullUrl = `/sumber-pendanaan${qs}`;
        console.log("Tabel1A2 - Making API call to:", fullUrl);
        
        try {
          const data = await apiFetch(fullUrl);
          console.log("Tabel1A2 - API Response:", { 
            qs, 
            fullUrl,
            dataLength: Array.isArray(data) ? data.length : 0,
            data: data
          });
          setRows(Array.isArray(data) ? data : data?.items || []);
        } catch (apiErr) {
          console.error("API Error for /sumber-pendanaan:", apiErr);
          console.error("Full error details:", {
            message: apiErr.message,
            status: apiErr.status,
            response: apiErr.response
          });
          // Fallback: set empty array jika API tidak bisa diakses
          setRows([]);
        }

        // Fetch summary (hanya data aktif)
        if (activeYear) {
          try {
            await computeSummaryForActiveYear();
          } catch (summaryErr) {
            console.error("Summary computation error:", summaryErr);
            setSummaryRows([]);
          }
        } else {
          try {
            await fetchSummaryAll();
          } catch (summaryErr) {
            console.error("Summary fetch error:", summaryErr);
            setSummaryRows([]);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    setSelectedRows([]); // Reset selected rows saat filter berubah
  }, [activeYear, showDeleted, maps, tahunList]);



  // Create / Update handler
  const handleSave = async (form) => {
    try {
      if (editingRow) {
        await apiFetch(`/sumber-pendanaan/${editingRow.id_sumber}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch(`/sumber-pendanaan`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setModalOpen(false);
      setEditingRow(null);

      // Setelah simpan, tampilkan "Semua Tahun"
      setActiveYear("");

      // Refresh data semua tahun
      const dataAll = await apiFetch(`/sumber-pendanaan`);
      setRows(Array.isArray(dataAll) ? dataAll : dataAll?.items || []);

      // Refresh ringkasan (karena activeYear sudah di-set ke "", gunakan fetchSummaryAll)
      await fetchSummaryAll();

      // SweetAlert notification
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: editingRow ? 'Data sumber dana berhasil diperbarui.' : 'Data sumber dana berhasil ditambahkan.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: 'error',
        title: `Gagal ${editingRow ? 'memperbarui' : 'menambah'} data`,
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  // Soft Delete handler
  const handleDelete = async (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: `Data sumber dana "${row.sumber_dana}" akan dihapus (soft delete).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`/sumber-pendanaan/${row.id_sumber}`, { method: "DELETE" });
          
          // Refresh data
          const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "?";
          const qsWithDeleted = showDeleted ? qs + (qs.length > 1 ? "&" : "") + "include_deleted=1" : qs;
          const data = await apiFetch(`/sumber-pendanaan${qsWithDeleted}`);
          setRows(Array.isArray(data) ? data : data?.items || []);

          // Refresh ringkasan sesuai filter (tahun tertentu atau semua tahun)
          if (activeYear) {
            await computeSummaryForActiveYear();
          } else {
            await fetchSummaryAll();
          }

          Swal.fire('Dihapus!', 'Data sumber dana telah dihapus (soft delete).', 'success');
        } catch (err) {
          console.error("Delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Hard Delete handler
  const handleHardDelete = async (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      html: `Data sumber dana "<strong>${row.sumber_dana}</strong>" akan dihapus <strong style="color: red;">PERMANEN</strong>.<br/><br/>Data yang dihapus permanen <strong>TIDAK DAPAT dipulihkan</strong>!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#7f1d1d',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus permanen!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`/sumber-pendanaan/${row.id_sumber}/hard-delete`, { method: "DELETE" });
          
          // Refresh data
          const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "?";
          const qsWithDeleted = showDeleted ? qs + (qs.length > 1 ? "&" : "") + "include_deleted=1" : qs;
          const data = await apiFetch(`/sumber-pendanaan${qsWithDeleted}`);
          setRows(Array.isArray(data) ? data : data?.items || []);

          // Refresh ringkasan
          if (activeYear) {
            await computeSummaryForActiveYear();
          } else {
            await fetchSummaryAll();
          }

          Swal.fire('Dihapus Permanen!', 'Data sumber dana telah dihapus secara permanen.', 'success');
        } catch (err) {
          console.error("Hard delete error:", err);
          Swal.fire('Gagal!', `Gagal menghapus permanen: ${err.message}`, 'error');
        }
      }
    });
  };

  // Restore handler
  const handleRestore = async (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: `Data sumber dana "${row.sumber_dana}" akan dipulihkan.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`/sumber-pendanaan/${row.id_sumber}/restore`, { method: "POST" });
          
          // Refresh data
          const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "?";
          const qsWithDeleted = showDeleted ? qs + (qs.length > 1 ? "&" : "") + "include_deleted=1" : qs;
          const data = await apiFetch(`/sumber-pendanaan${qsWithDeleted}`);
          setRows(Array.isArray(data) ? data : data?.items || []);

          // Refresh ringkasan
          if (activeYear) {
            await computeSummaryForActiveYear();
          } else {
            await fetchSummaryAll();
          }

          Swal.fire('Dipulihkan!', 'Data sumber dana telah dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore error:", err);
          Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Bulk Restore handler
  const handleRestoreMultiple = () => {
    if (!selectedRows.length) {
      Swal.fire('Perhatian', 'Pilih setidaknya satu baris untuk dipulihkan.', 'info');
      return;
    }
    Swal.fire({
      title: `Pulihkan ${selectedRows.length} Data?`,
      text: "Semua data yang dipilih akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiFetch(`/sumber-pendanaan/restore-multiple`, {
            method: "POST",
            body: JSON.stringify({ ids: selectedRows }),
          });
          
          setSelectedRows([]);
          
          // Refresh data
          const qs = activeYear ? `?id_tahun=${encodeURIComponent(activeYear)}` : "?";
          const qsWithDeleted = showDeleted ? qs + (qs.length > 1 ? "&" : "") + "include_deleted=1" : qs;
          const data = await apiFetch(`/sumber-pendanaan${qsWithDeleted}`);
          setRows(Array.isArray(data) ? data : data?.items || []);

          // Refresh ringkasan
          if (activeYear) {
            await computeSummaryForActiveYear();
          } else {
            await fetchSummaryAll();
          }

          Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
        } catch (err) {
          console.error("Restore multiple error:", err);
          Swal.fire('Gagal!', `Gagal memulihkan data: ${err.message}`, 'error');
        }
      }
    });
  };

  // Select all logic
  const isAllSelected = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length > 0 && selectedRows.length === rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).map(r => r.id_sumber).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = rows.filter(r => r.deleted_at).map(r => r.id_sumber);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl overflow-visible">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">1.A.2 Sumber Pendanaan UPPS/PS</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data sumber pendanaan per tahun dan lihat ringkasan multi-TS.
          </p>
          <span className="inline-flex items-center text-sm text-slate-700">
            Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length}</span>
          </span>
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector 
            maps={maps} 
            activeYear={activeYear} 
            setActiveYear={setActiveYear}
            tahunList={tahunList}
            isLoadingTahun={isLoadingTahun}
          />
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowDeleted(false)}
              disabled={false}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Tampilkan data aktif"
            >
              Data
            </button>
            <button
              onClick={() => setShowDeleted(true)}
              disabled={false}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Tampilkan data terhapus"
            >
              Data Terhapus
            </button>
          </div>
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <button
              onClick={handleRestoreMultiple}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={false}
            >
              Pulihkan ({selectedRows.length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {canCreate && (
            <button
              onClick={() => { setModalOpen(true); setEditingRow(null); }}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={false}
            >
              + Tambah Data
            </button>
          )}
        </div>
      </div>

      {/* Tabel per tahun */}
      <TablePerYear
        rows={rows}
        onEdit={(r) => { setEditingRow(r); setModalOpen(true); }}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onHardDelete={handleHardDelete}
        canUpdate={canUpdate}
        canDelete={canDelete}
        showDeleted={showDeleted}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        setDropdownPosition={setDropdownPosition}
        getYearLabel={(id) => {
          // Ambil label tahun dari maps.tahun atau fallback tahunList
          const tahunData = Object.keys(maps.tahun || {}).length > 0 ? Object.values(maps.tahun) : tahunList;
          const found = tahunData.find((y) => String(y.id_tahun) === String(id));
          return found ? (found.tahun || found.nama || id) : id;
        }}
      />

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
        const currentRow = filteredRows.find((r) => (r.id_sumber || filteredRows.indexOf(r)) === openDropdownId);
        if (!currentRow) return null;
        
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
                  setEditingRow(currentRow);
                  setModalOpen(true);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.sumber_dana}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.sumber_dana}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${currentRow.sumber_dana}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
            {showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${currentRow.sumber_dana}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Ringkasan */}
      <div className="mt-10 mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Ringkasan Sumber Pendanaan (TS-4 s.d. TS)</h3>
        <span className="inline-flex items-center text-sm text-slate-700">
          Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{summaryRows.length}</span>
        </span>
      </div>
      <TableSummary 
        rows={summaryRows} 
      />

             {/* Modal */}
             <ModalForm
               isOpen={modalOpen}
               onClose={() => setModalOpen(false)}
               onSave={handleSave}
               initialData={editingRow}
               maps={maps}
               activeYear={activeYear}
               tahunList={tahunList}
             />
    </div>
  );
}
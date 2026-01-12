// src/components/tables/Tabel1A4.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiFileText, FiCalendar, FiChevronDown, FiUser } from 'react-icons/fi';

const ENDPOINT = "/beban-kerja-dosen";
const TABLE_KEY = "tabel_1a4";
const LABEL = "1.A.4 Rata-rata Beban DTPR (EWMP) TS";

const n = (v) => Number(v || 0);

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, doRestoreSingle, showDeleted, openDropdownId, setOpenDropdownId, setDropdownPosition, dosenList }) {
  // [FIX] Use dosenList for lookup by id_dosen, fallback to maps.pegawai by id_pegawai
  const getDosenName = (id_dosen, id_pegawai) => {
    // First try dosenList (by id_dosen)
    const fromDosenList = dosenList?.find(d => String(d.id_dosen) === String(id_dosen));
    if (fromDosenList?.nama_lengkap) return fromDosenList.nama_lengkap;
    // Fallback to maps.pegawai (by id_pegawai)
    if (id_pegawai && maps.pegawai[id_pegawai]?.nama_lengkap) return maps.pegawai[id_pegawai].nama_lengkap;
    // Last resort
    return id_dosen || id_pegawai || 'Unknown';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          {/* header bertingkat */}
          <tr className="sticky top-0">
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama DTPR</th>
            <th colSpan={3} className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase border border-white/20">
              SKS Pengajaran<sup>1)</sup> Pada
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              SKS Penelitian<sup>2)</sup>
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
              SKS Pengabdian kepada Masyarakat<sup>2)</sup>
            </th>
            <th colSpan={2} className="px-6 py-4 text-center text-xs font-semibold tracking-wide uppercase border border-white/20">
              SKS Manajemen<sup>3)</sup>
            </th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Total SKS</th>
            <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
          <tr className="sticky top-0">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PS Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PS Lain, PT Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Lain</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Sendiri</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">PT Lain</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
          {rows.map((r, i) => {
            // [UPDATED] Using 5 separate columns directly (no fallback to totals)
            const pengajaranPsSendiri = n(r.sks_pengajaran_ps_sendiri) || 0;
            const pengajaranPsLainPtSendiri = n(r.sks_pengajaran_ps_lain_pt_sendiri) || 0;
            const pengajaranPtLain = n(r.sks_pengajaran_pt_lain) || 0;

            const penelitian = n(r.sks_penelitian);
            const pkm = n(r.sks_pkm);

            const manajemenPtSendiri = n(r.sks_manajemen_pt_sendiri) || 0;
            const manajemenPtLain = n(r.sks_manajemen_pt_lain) || 0;

            const total = (
              n(pengajaranPsSendiri) +
              n(pengajaranPsLainPtSendiri) +
              n(pengajaranPtLain) +
              n(penelitian) +
              n(pkm) +
              n(manajemenPtSendiri) +
              n(manajemenPtLain)
            ).toFixed(2);

            const idField = getIdField(r);
            const rowId = idField && r[idField] ? r[idField] : i;
            // Membuat key yang unik dengan menggabungkan ID, index, dan field lainnya untuk menghindari duplicate
            const uniqueKey = `${showDeleted ? 'deleted' : 'active'}-1a4-${rowId}-${i}-${r.id_dosen || ''}-${r.id_tahun || ''}`;

            return (
              <tr key={uniqueKey} className={`transition-all duration-200 ease-in-out ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">{i + 1}.</td>
                <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">{getDosenName(r.id_dosen, r.id_pegawai)}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPsSendiri}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPsLainPtSendiri}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pengajaranPtLain}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{penelitian}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{pkm}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{manajemenPtSendiri}</td>
                <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{manajemenPtLain}</td>
                <td className="px-6 py-4 text-slate-700 text-center font-semibold border border-slate-200">{total}</td>
                <td className="px-6 py-4 border border-slate-200">
                  <div className="flex items-center justify-center dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Gunakan uniqueKey yang sama dengan key row untuk konsistensi
                        const rowId = getIdField(r) ? r[getIdField(r)] : i;
                        const uniqueRowId = `${rowId}-${i}-${r.id_dosen || ''}-${r.id_tahun || ''}`;
                        if (openDropdownId !== uniqueRowId) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const dropdownWidth = 192;
                          setDropdownPosition({
                            top: rect.bottom + 4,
                            left: Math.max(8, rect.right - dropdownWidth)
                          });
                          setOpenDropdownId(uniqueRowId);
                        } else {
                          setOpenDropdownId(null);
                        }
                      }}
                      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                      aria-label="Menu aksi"
                      aria-expanded={openDropdownId === `${getIdField(r) ? r[getIdField(r)] : i}-${i}-${r.id_dosen || ''}-${r.id_tahun || ''}`}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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

export default function Tabel1A4({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Tahun dropdown state (for filter and form)
  const [openYearFilterDropdown, setOpenYearFilterDropdown] = useState(false);
  const [openNewTahunDropdown, setOpenNewTahunDropdown] = useState(false);
  const [openEditTahunDropdown, setOpenEditTahunDropdown] = useState(false);

  // Dosen dropdown state (for form)
  const [openNewDosenDropdown, setOpenNewDosenDropdown] = useState(false);
  const [openEditDosenDropdown, setOpenEditDosenDropdown] = useState(false);

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
    if (showCreateModal || showEditModal) {
      setOpenDropdownId(null);
      setOpenNewTahunDropdown(false);
      setOpenEditTahunDropdown(false);
      setOpenNewDosenDropdown(false);
      setOpenEditDosenDropdown(false);
    }
  }, [showCreateModal, showEditModal]);

  // Close tahun and dosen dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openYearFilterDropdown && !event.target.closest('.year-filter-dropdown-container') && !event.target.closest('.year-filter-dropdown-menu')) {
        setOpenYearFilterDropdown(false);
      }
      if (openNewTahunDropdown && !event.target.closest('.new-tahun-dropdown-container') && !event.target.closest('.new-tahun-dropdown-menu')) {
        setOpenNewTahunDropdown(false);
      }
      if (openEditTahunDropdown && !event.target.closest('.edit-tahun-dropdown-container') && !event.target.closest('.edit-tahun-dropdown-menu')) {
        setOpenEditTahunDropdown(false);
      }
      if (openNewDosenDropdown && !event.target.closest('.new-dosen-dropdown-container') && !event.target.closest('.new-dosen-dropdown-menu')) {
        setOpenNewDosenDropdown(false);
      }
      if (openEditDosenDropdown && !event.target.closest('.edit-dosen-dropdown-container') && !event.target.closest('.edit-dosen-dropdown-menu')) {
        setOpenEditDosenDropdown(false);
      }
    };

    if (openYearFilterDropdown || openNewTahunDropdown || openEditTahunDropdown || openNewDosenDropdown || openEditDosenDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openYearFilterDropdown, openNewTahunDropdown, openEditTahunDropdown, openNewDosenDropdown, openEditDosenDropdown]);

  // Close dropdown when selectedYear changes
  useEffect(() => {
    setOpenYearFilterDropdown(false);
  }, [selectedYear]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCreateModal || showEditModal) {
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
    }
  }, [showCreateModal, showEditModal]);

  const [newIdTahun, setNewIdTahun] = useState("");
  const [newIdDosen, setNewIdDosen] = useState("");
  const [newPengajaranPsSendiri, setNewPengajaranPsSendiri] = useState("");
  const [newPengajaranPsLainPtSendiri, setNewPengajaranPsLainPtSendiri] = useState("");
  const [newPengajaranPtLain, setNewPengajaranPtLain] = useState("");
  const [newPenelitian, setNewPenelitian] = useState("");
  const [newPkm, setNewPkm] = useState("");
  const [newManajemenPtSendiri, setNewManajemenPtSendiri] = useState("");
  const [newManajemenPtLain, setNewManajemenPtLain] = useState("");

  const [editIdTahun, setEditIdTahun] = useState("");
  const [editIdDosen, setEditIdDosen] = useState("");

  // State untuk data dosen (untuk dropdown)
  const [dosenList, setDosenList] = useState([]);
  const [editPengajaranPsSendiri, setEditPengajaranPsSendiri] = useState("");
  const [editPengajaranPsLainPtSendiri, setEditPengajaranPsLainPtSendiri] = useState("");
  const [editPengajaranPtLain, setEditPengajaranPtLain] = useState("");
  const [editPenelitian, setEditPenelitian] = useState("");
  const [editPkm, setEditPkm] = useState("");
  const [editManajemenPtSendiri, setEditManajemenPtSendiri] = useState("");
  const [editManajemenPtLain, setEditManajemenPtLain] = useState("");

  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");

  // Helper function untuk sorting data berdasarkan terbaru
  const sortRowsByLatest = (rowsArray) => {
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

      // Fallback: urutkan berdasarkan ID terbesar (asumsi auto-increment)
      const idField = getIdField(a) || getIdField(b);
      if (idField) {
        const idA = a[idField] || 0;
        const idB = b[idField] || 0;
        return idB - idA; // ID terbesar di atas
      }

      return 0;
    });
  };

  async function fetchRows(isToggle = false) {
    try {
      // Only show loading skeleton on initial load, not when toggling
      if (!isToggle) {
        setLoading(true);
      }
      setError("");
      const deletedQs = showDeleted ? `&include_deleted=1` : "";
      const yearQs = selectedYear ? `&id_tahun=${selectedYear}` : "";
      const data = await apiFetch(`${ENDPOINT}?relasi=1${deletedQs}${yearQs}`);
      const filteredData = showDeleted
        ? data.filter((row) => row.deleted_at !== null)
        : data.filter((row) => row.deleted_at === null);
      const rowsArray = Array.isArray(filteredData) ? filteredData : filteredData?.items || [];
      const sortedRows = sortRowsByLatest(rowsArray);
      setRows(sortedRows);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  // Fetch data dosen untuk dropdown
  useEffect(() => {
    const fetchDosen = async () => {
      // Cek apakah role memiliki akses untuk membaca tabel dosen
      if (!roleCan(role, 'dosen', 'r')) {
        console.log("Role tidak memiliki akses baca dosen, skip fetchDosen.");
        return;
      }

      try {
        const data = await apiFetch("/dosen");
        const list = Array.isArray(data) ? data : [];
        // Filter dan map data dosen
        const dosenMap = new Map();
        list.forEach((d) => {
          if (d.id_dosen && !dosenMap.has(d.id_dosen)) {
            dosenMap.set(d.id_dosen, {
              id_dosen: d.id_dosen,
              id_pegawai: d.id_pegawai,
              nama_lengkap: d.nama_lengkap || d.nama || `Dosen ${d.id_dosen}`
            });
          }
        });
        setDosenList(Array.from(dosenMap.values()).sort((a, b) =>
          (a.nama_lengkap || '').localeCompare(b.nama_lengkap || '')
        ));
      } catch (err) {
        console.error("Error fetching dosen:", err);
        setDosenList([]);
      }
    };
    fetchDosen();
  }, [role]); // Add role dependency

  // Initial load
  useEffect(() => {
    fetchRows(false);
    setSelectedRows([]);
  }, [selectedYear]);

  // Toggle between active and deleted data
  useEffect(() => {
    if (!initialLoading) {
      fetchRows(true);
      setSelectedRows([]);
    }
  }, [showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdTahun(editing.id_tahun || "");
      setEditIdDosen(editing.id_dosen || "");
      // [FIX] Jangan bagi otomatis - masukkan total ke field pertama saja agar user bisa edit manual
      // Atau gunakan nilai terpisah jika ada di backend
      const pengajaranTotal = n(editing.sks_pengajaran);
      const manajemenTotal = n(editing.sks_manajemen);

      // [FIX] Cek apakah ada field terpisah dari backend, jika tidak gunakan total di field pertama
      setEditPengajaranPsSendiri(editing.sks_pengajaran_ps_sendiri ?? pengajaranTotal ?? "");
      setEditPengajaranPsLainPtSendiri(editing.sks_pengajaran_ps_lain_pt_sendiri ?? "");
      setEditPengajaranPtLain(editing.sks_pengajaran_pt_lain ?? "");
      setEditPenelitian(editing.sks_penelitian ?? "");
      setEditPkm(editing.sks_pkm ?? "");
      setEditManajemenPtSendiri(editing.sks_manajemen_pt_sendiri ?? manajemenTotal ?? "");
      setEditManajemenPtLain(editing.sks_manajemen_pt_lain ?? "");
      setShowEditModal(true);
      setOpenEditTahunDropdown(false);
      setOpenEditDosenDropdown(false);
    }
  }, [editing]);

  const doDelete = (row) => {
    Swal.fire({
      title: 'Anda yakin?',
      text: "Data akan dipindahkan ke daftar item yang dihapus.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}`, {
            method: "DELETE",
            body: JSON.stringify({
              deleted_by: role?.user?.name || role?.user?.username || "Unknown User",
              deleted_at: new Date().toISOString()
            })
          });
          fetchRows();
          Swal.fire('Dihapus!', 'Data telah dipindahkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const doHardDelete = (row) => {
    Swal.fire({
      title: 'Hapus Permanen?',
      text: "PERINGATAN: Tindakan ini tidak dapat dibatalkan!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Permanen!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}/hard-delete`, { method: "DELETE" });
          fetchRows();
          Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
        }
      }
    });
  };

  const doRestoreSingle = (row) => {
    Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}/restore`, {
            method: "POST",
            body: JSON.stringify({
              restored_by: role?.user?.name || role?.user?.username || "Unknown User",
              restored_at: new Date().toISOString()
            })
          });
          fetchRows();
          Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const doRestoreMultiple = () => {
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
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await apiFetch(`${ENDPOINT}/restore-multiple`, {
            method: "POST",
            body: JSON.stringify({
              ids: selectedRows,
              restored_by: role?.user?.name || role?.user?.username || "Unknown User",
              restored_at: new Date().toISOString()
            }),
          });
          setSelectedRows([]);
          fetchRows();
          Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const newTotal = (
    n(newPengajaranPsSendiri) +
    n(newPengajaranPsLainPtSendiri) +
    n(newPengajaranPtLain) +
    n(newPenelitian) +
    n(newPkm) +
    n(newManajemenPtSendiri) +
    n(newManajemenPtLain)
  ).toFixed(2);

  const editTotal = (
    n(editPengajaranPsSendiri) +
    n(editPengajaranPsLainPtSendiri) +
    n(editPengajaranPtLain) +
    n(editPenelitian) +
    n(editPkm) +
    n(editManajemenPtSendiri) +
    n(editManajemenPtLain)
  ).toFixed(2);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data beban kerja dosen dan distribusi SKS per tahun.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.length}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="filter-tahun" className="text-sm font-medium text-slate-700">Tahun:</label>
            <div className="relative year-filter-dropdown-container w-48">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenYearFilterDropdown(!openYearFilterDropdown);
                }}
                disabled={loading}
                className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${selectedYear
                  ? 'border-[#0384d6] bg-white'
                  : 'border-slate-300 bg-white hover:border-gray-400'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Pilih tahun"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                  <span className={`truncate ${selectedYear ? 'text-slate-700' : 'text-slate-500'}`}>
                    {selectedYear
                      ? (() => {
                        const found = Object.values(maps.tahun || {}).find((y) => String(y.id_tahun) === String(selectedYear));
                        return found ? (found.tahun || found.nama || selectedYear) : selectedYear;
                      })()
                      : "Pilih Tahun"}
                  </span>
                </div>
                <FiChevronDown
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openYearFilterDropdown ? 'rotate-180' : ''
                    }`}
                  size={16}
                />
              </button>
              {openYearFilterDropdown && (
                <div
                  className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto year-filter-dropdown-menu mt-1 w-full"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedYear("");
                      setOpenYearFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${!selectedYear
                      ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                      : 'text-gray-700'
                      }`}
                  >
                    <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                    <span>Pilih Tahun</span>
                  </button>
                  {Object.values(maps.tahun || {}).length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Tidak ada data tahun
                    </div>
                  ) : (
                    Object.values(maps.tahun || {}).map((y) => (
                      <button
                        key={y.id_tahun}
                        type="button"
                        onClick={() => {
                          setSelectedYear(y.id_tahun.toString());
                          setOpenYearFilterDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${selectedYear === y.id_tahun.toString()
                          ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                          : 'text-gray-700'
                          }`}
                      >
                        <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
                        <span className="truncate">{y.tahun || y.nama}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {canDelete && (
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowDeleted(false)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!showDeleted
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${showDeleted
                  ? "bg-white text-[#0384d6] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                aria-label="Tampilkan data terhapus"
              >
                Data Terhapus
              </button>
            </div>
          )}
          {canUpdate && showDeleted && selectedRows.length > 0 && (
            <button
              onClick={doRestoreMultiple}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Pulihkan ({selectedRows.length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              onClick={async () => {
                try {
                  setLoading(true);

                  // Helper function untuk get dosen name
                  const getDosenName = (id) => maps.pegawai[id]?.nama_lengkap || id;

                  // Helper function untuk get year name
                  const getYearName = (id) => maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

                  // Prepare data untuk export (hanya data yang aktif, tidak yang dihapus)
                  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);

                  if (filteredRows.length === 0) {
                    throw new Error('Tidak ada data untuk diekspor.');
                  }

                  const exportData = filteredRows.map((row, index) => {
                    const pengajaranTotal = n(row.sks_pengajaran);
                    const pengajaranPsSendiri = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;
                    const pengajaranPsLainPtSendiri = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;
                    const pengajaranPtLain = pengajaranTotal > 0 ? (pengajaranTotal / 3).toFixed(2) : 0;
                    const penelitian = n(row.sks_penelitian);
                    const pkm = n(row.sks_pkm);
                    const manajemenTotal = n(row.sks_manajemen);
                    const manajemenPtSendiri = manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : 0;
                    const manajemenPtLain = manajemenTotal > 0 ? (manajemenTotal / 2).toFixed(2) : 0;
                    const total = (
                      n(pengajaranPsSendiri) +
                      n(pengajaranPsLainPtSendiri) +
                      n(pengajaranPtLain) +
                      n(penelitian) +
                      n(pkm) +
                      n(manajemenPtSendiri) +
                      n(manajemenPtLain)
                    ).toFixed(2);

                    return {
                      'No': index + 1,
                      'Tahun': getYearName(row.id_tahun),
                      'Nama DTPR': getDosenName(row.id_dosen),
                      'SKS Pengajaran PS Sendiri': Number(pengajaranPsSendiri),
                      'SKS Pengajaran PS Lain PT Sendiri': Number(pengajaranPsLainPtSendiri),
                      'SKS Pengajaran PT Lain': Number(pengajaranPtLain),
                      'SKS Penelitian': Number(penelitian),
                      'SKS Pengabdian kepada Masyarakat': Number(pkm),
                      'SKS Manajemen PT Sendiri': Number(manajemenPtSendiri),
                      'SKS Manajemen PT Lain': Number(manajemenPtLain),
                      'Total SKS': Number(total)
                    };
                  });

                  // Coba import xlsx library
                  let XLSX;
                  try {
                    XLSX = await import('xlsx');
                  } catch (importErr) {
                    console.warn('xlsx library tidak tersedia, menggunakan CSV fallback:', importErr);
                    // Fallback ke CSV
                    const escapeCsv = (str) => {
                      if (str === null || str === undefined) return '';
                      const strValue = String(str);
                      if (strValue.includes(',') || strValue.includes('\n') || strValue.includes('"')) {
                        return `"${strValue.replace(/"/g, '""')}"`;
                      }
                      return strValue;
                    };

                    const headers = ['No', 'Tahun', 'Nama DTPR', 'SKS Pengajaran PS Sendiri', 'SKS Pengajaran PS Lain PT Sendiri', 'SKS Pengajaran PT Lain', 'SKS Penelitian', 'SKS Pengabdian kepada Masyarakat', 'SKS Manajemen PT Sendiri', 'SKS Manajemen PT Lain', 'Total SKS'];
                    const csvRows = [
                      headers.map(escapeCsv).join(','),
                      ...exportData.map(row => [
                        row.No,
                        escapeCsv(row.Tahun),
                        escapeCsv(row['Nama DTPR']),
                        row['SKS Pengajaran PS Sendiri'],
                        row['SKS Pengajaran PS Lain PT Sendiri'],
                        row['SKS Pengajaran PT Lain'],
                        row['SKS Penelitian'],
                        row['SKS Pengabdian kepada Masyarakat'],
                        row['SKS Manajemen PT Sendiri'],
                        row['SKS Manajemen PT Lain'],
                        row['Total SKS']
                      ].map(escapeCsv).join(','))
                    ];
                    const csvContent = '\ufeff' + csvRows.join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Tabel_1A4_Beban_Kerja_Dosen_${new Date().toISOString().split('T')[0]}.csv`;
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
                    return;
                  }

                  // Buat workbook baru
                  const wb = XLSX.utils.book_new();

                  // Buat worksheet dari data
                  const ws = XLSX.utils.json_to_sheet(exportData);

                  // Set column widths
                  ws['!cols'] = [
                    { wch: 5 },   // No
                    { wch: 15 },  // Tahun
                    { wch: 30 },  // Nama DTPR
                    { wch: 20 },  // SKS Pengajaran PS Sendiri
                    { wch: 25 },  // SKS Pengajaran PS Lain PT Sendiri
                    { wch: 20 },  // SKS Pengajaran PT Lain
                    { wch: 15 },  // SKS Penelitian
                    { wch: 30 },  // SKS Pengabdian kepada Masyarakat
                    { wch: 20 },  // SKS Manajemen PT Sendiri
                    { wch: 20 },  // SKS Manajemen PT Lain
                    { wch: 12 }   // Total SKS
                  ];

                  // Tambahkan worksheet ke workbook
                  XLSX.utils.book_append_sheet(wb, ws, 'Tabel 1A4');

                  // Generate file dan download
                  const fileName = `Tabel_1A4_Beban_Kerja_Dosen_${new Date().toISOString().split('T')[0]}.xlsx`;
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
                  Swal.fire({
                    icon: 'error',
                    title: 'Gagal mengekspor data',
                    text: err.message || 'Terjadi kesalahan saat mengekspor data.'
                  });
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length === 0}
              className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Export to Excel"
            >
              <FiFileText className="w-4 h-4" />
              Export Excel
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              Ekspor data beban kerja dosen ke Excel
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              + Tambah Data
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}

      <PrettyTable
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        setDropdownPosition={setDropdownPosition}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        doRestoreSingle={doRestoreSingle}
        showDeleted={showDeleted}
        dosenList={dosenList}
      />

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : idx;
          const uniqueRowId = `${rowId}-${idx}-${r.id_dosen || ''}-${r.id_tahun || ''}`;
          return uniqueRowId === openDropdownId;
        });
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
                  setEditing(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${maps.pegawai[currentRow.id_dosen]?.nama_lengkap || 'beban kerja dosen'}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${maps.pegawai[currentRow.id_dosen]?.nama_lengkap || 'beban kerja dosen'}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {showDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doHardDelete(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${maps.pegawai[currentRow.id_dosen]?.nama_lengkap || 'beban kerja dosen'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
            {showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doRestoreSingle(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${maps.pegawai[currentRow.id_dosen]?.nama_lengkap || 'beban kerja dosen'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
          </div>
        );
      })()}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">Tambah Data Beban Kerja Dosen</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data beban kerja dosen dan distribusi SKS.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Validasi tahun dan dosen harus dipilih
                  if (!newIdTahun || newIdTahun === "") {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Data Belum Lengkap',
                      text: 'Silakan pilih Tahun terlebih dahulu.'
                    });
                    return;
                  }
                  if (!newIdDosen || newIdDosen === "") {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Data Belum Lengkap',
                      text: 'Silakan pilih Nama Dosen terlebih dahulu.'
                    });
                    return;
                  }

                  try {
                    setLoading(true);
                    setOpenNewTahunDropdown(false);
                    setOpenNewDosenDropdown(false);
                    const body = {
                      id_tahun: parseInt(newIdTahun),
                      id_dosen: parseInt(newIdDosen),
                      // [UPDATED] Using 5 separate columns only (no totals)
                      sks_pengajaran_ps_sendiri: n(newPengajaranPsSendiri),
                      sks_pengajaran_ps_lain_pt_sendiri: n(newPengajaranPsLainPtSendiri),
                      sks_pengajaran_pt_lain: n(newPengajaranPtLain),
                      sks_penelitian: n(newPenelitian),
                      sks_pkm: n(newPkm),
                      sks_manajemen_pt_sendiri: n(newManajemenPtSendiri),
                      sks_manajemen_pt_lain: n(newManajemenPtLain)
                    };
                    await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
                    setShowCreateModal(false);
                    setNewIdTahun(""); setNewIdDosen(""); setNewPengajaranPsSendiri(""); setNewPengajaranPsLainPtSendiri(""); setNewPengajaranPtLain(""); setNewPenelitian(""); setNewPkm(""); setNewManajemenPtSendiri(""); setNewManajemenPtLain("");
                    fetchRows();
                    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
                  } catch (e) {
                    Swal.fire({ icon: 'error', title: 'Gagal Menambah Data', text: e.message });
                  } finally { setLoading(false); }
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun <span className="text-red-500">*</span></label>
                  <div className="relative new-tahun-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenNewTahunDropdown(!openNewTahunDropdown);
                        setOpenNewDosenDropdown(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${newIdTahun
                        ? 'border-[#0384d6] bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih tahun"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${newIdTahun ? 'text-gray-900' : 'text-gray-500'}`}>
                          {newIdTahun
                            ? (() => {
                              const found = Object.values(maps.tahun || {}).find((y) => String(y.id_tahun) === String(newIdTahun));
                              return found ? (found.tahun || found.nama || "Pilih...") : "Pilih tahun...";
                            })()
                            : "Pilih tahun..."}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openNewTahunDropdown ? 'rotate-180' : ''
                          }`}
                        size={18}
                      />
                    </button>
                    {openNewTahunDropdown && (
                      <div
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto new-tahun-dropdown-menu mt-1 w-full"
                      >
                        {Object.values(maps.tahun || {}).length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada data tahun
                          </div>
                        ) : (
                          Object.values(maps.tahun || {}).map((y) => (
                            <button
                              key={y.id_tahun}
                              type="button"
                              onClick={() => {
                                setNewIdTahun(y.id_tahun.toString());
                                setOpenNewTahunDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${newIdTahun === y.id_tahun.toString()
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span className="truncate">{y.tahun || y.nama}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Dosen <span className="text-red-500">*</span></label>
                  <div className="relative new-dosen-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenNewDosenDropdown(!openNewDosenDropdown);
                        setOpenNewTahunDropdown(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${newIdDosen
                        ? 'border-[#0384d6] bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih dosen"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${newIdDosen ? 'text-gray-900' : 'text-gray-500'}`}>
                          {newIdDosen
                            ? (() => {
                              const found = dosenList.find((d) => String(d.id_dosen) === String(newIdDosen));
                              return found ? (found.nama_lengkap || "Pilih...") : "Pilih dosen...";
                            })()
                            : "Pilih dosen..."}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openNewDosenDropdown ? 'rotate-180' : ''
                          }`}
                        size={18}
                      />
                    </button>
                    {openNewDosenDropdown && (
                      <div
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto new-dosen-dropdown-menu mt-1 w-full"
                      >
                        {dosenList.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada data dosen
                          </div>
                        ) : (
                          dosenList.map((d) => (
                            <button
                              key={d.id_dosen}
                              type="button"
                              onClick={() => {
                                setNewIdDosen(d.id_dosen.toString());
                                setOpenNewDosenDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${newIdDosen === d.id_dosen.toString()
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span className="truncate">{d.nama_lengkap}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-slate-700 mb-3">SKS Pengajaran<sup>1)</sup> Pada</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PS Sendiri</label>
                      <input type="number" step="0.01" min="0" value={newPengajaranPsSendiri} onChange={(e) => setNewPengajaranPsSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PS Lain, PT Sendiri</label>
                      <input type="number" step="0.01" min="0" value={newPengajaranPsLainPtSendiri} onChange={(e) => setNewPengajaranPsLainPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                      <input type="number" step="0.01" min="0" value={newPengajaranPtLain} onChange={(e) => setNewPengajaranPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Penelitian</label>
                    <input type="number" step="0.01" min="0" value={newPenelitian} onChange={(e) => setNewPenelitian(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Pengabdian kepada Masyarakat</label>
                    <input type="number" step="0.01" min="0" value={newPkm} onChange={(e) => setNewPkm(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-slate-700 mb-3">SKS Manajemen<sup>3)</sup></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Sendiri</label>
                      <input type="number" step="0.01" min="0" value={newManajemenPtSendiri} onChange={(e) => setNewManajemenPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                      <input type="number" step="0.01" min="0" value={newManajemenPtLain} onChange={(e) => setNewManajemenPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                  </div>
                </div>

                <div className="text-right font-semibold text-black">Total SKS: {newTotal}</div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setOpenNewTahunDropdown(false);
                      setOpenNewDosenDropdown(false);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">Edit Data Beban Kerja Dosen</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data beban kerja dosen dan distribusi SKS.</p>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();

                  // Validasi tahun dan dosen harus dipilih
                  if (!editIdTahun || editIdTahun === "") {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Data Belum Lengkap',
                      text: 'Silakan pilih Tahun terlebih dahulu.'
                    });
                    return;
                  }
                  if (!editIdDosen || editIdDosen === "") {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Data Belum Lengkap',
                      text: 'Silakan pilih Nama Dosen terlebih dahulu.'
                    });
                    return;
                  }

                  try {
                    setLoading(true);
                    setOpenEditTahunDropdown(false);
                    setOpenEditDosenDropdown(false);
                    const idField = getIdField(editing);
                    const body = {
                      id_tahun: parseInt(editIdTahun),
                      id_dosen: parseInt(editIdDosen),
                      // [UPDATED] Using 5 separate columns only (no totals)
                      sks_pengajaran_ps_sendiri: n(editPengajaranPsSendiri),
                      sks_pengajaran_ps_lain_pt_sendiri: n(editPengajaranPsLainPtSendiri),
                      sks_pengajaran_pt_lain: n(editPengajaranPtLain),
                      sks_penelitian: n(editPenelitian),
                      sks_pkm: n(editPkm),
                      sks_manajemen_pt_sendiri: n(editManajemenPtSendiri),
                      sks_manajemen_pt_lain: n(editManajemenPtLain)
                    };
                    // [DEBUG] Log data yang dikirim
                    console.log('[DEBUG] Edit submission:', {
                      idField,
                      editingId: editing?.[idField],
                      editing,
                      body,
                      url: `${ENDPOINT}/${editing?.[idField]}`
                    });
                    await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
                    setShowEditModal(false);
                    setEditing(null);
                    fetchRows();
                    Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
                  } catch (e) {
                    Swal.fire({ icon: 'error', title: 'Gagal Memperbarui Data', text: e.message });
                  } finally { setLoading(false); }
                }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun <span className="text-red-500">*</span></label>
                  <div className="relative edit-tahun-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenEditTahunDropdown(!openEditTahunDropdown);
                        setOpenEditDosenDropdown(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${editIdTahun
                        ? 'border-[#0384d6] bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih tahun"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${editIdTahun ? 'text-gray-900' : 'text-gray-500'}`}>
                          {editIdTahun
                            ? (() => {
                              const found = Object.values(maps.tahun || {}).find((y) => String(y.id_tahun) === String(editIdTahun));
                              return found ? (found.tahun || found.nama || "Pilih...") : "Pilih tahun...";
                            })()
                            : "Pilih tahun..."}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openEditTahunDropdown ? 'rotate-180' : ''
                          }`}
                        size={18}
                      />
                    </button>
                    {openEditTahunDropdown && (
                      <div
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto edit-tahun-dropdown-menu mt-1 w-full"
                      >
                        {Object.values(maps.tahun || {}).length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada data tahun
                          </div>
                        ) : (
                          Object.values(maps.tahun || {}).map((y) => (
                            <button
                              key={y.id_tahun}
                              type="button"
                              onClick={() => {
                                setEditIdTahun(y.id_tahun.toString());
                                setOpenEditTahunDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${editIdTahun === y.id_tahun.toString()
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span className="truncate">{y.tahun || y.nama}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Dosen <span className="text-red-500">*</span></label>
                  <div className="relative edit-dosen-dropdown-container">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenEditDosenDropdown(!openEditDosenDropdown);
                        setOpenEditTahunDropdown(false);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${editIdDosen
                        ? 'border-[#0384d6] bg-white'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      aria-label="Pilih dosen"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FiUser className="text-[#0384d6] flex-shrink-0" size={18} />
                        <span className={`truncate ${editIdDosen ? 'text-gray-900' : 'text-gray-500'}`}>
                          {editIdDosen
                            ? (() => {
                              const found = dosenList.find((d) => String(d.id_dosen) === String(editIdDosen));
                              return found ? (found.nama_lengkap || "Pilih...") : "Pilih dosen...";
                            })()
                            : "Pilih dosen..."}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openEditDosenDropdown ? 'rotate-180' : ''
                          }`}
                        size={18}
                      />
                    </button>
                    {openEditDosenDropdown && (
                      <div
                        className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto edit-dosen-dropdown-menu mt-1 w-full"
                      >
                        {dosenList.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            Tidak ada data dosen
                          </div>
                        ) : (
                          dosenList.map((d) => (
                            <button
                              key={d.id_dosen}
                              type="button"
                              onClick={() => {
                                setEditIdDosen(d.id_dosen.toString());
                                setOpenEditDosenDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${editIdDosen === d.id_dosen.toString()
                                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                                : 'text-gray-700'
                                }`}
                            >
                              <FiUser className="text-[#0384d6] flex-shrink-0" size={16} />
                              <span className="truncate">{d.nama_lengkap}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-slate-700 mb-3">SKS Pengajaran<sup>1)</sup> Pada</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PS Sendiri</label>
                      <input type="number" step="0.01" min="0" value={editPengajaranPsSendiri} onChange={(e) => setEditPengajaranPsSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PS Lain, PT Sendiri</label>
                      <input type="number" step="0.01" min="0" value={editPengajaranPsLainPtSendiri} onChange={(e) => setEditPengajaranPsLainPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                      <input type="number" step="0.01" min="0" value={editPengajaranPtLain} onChange={(e) => setEditPengajaranPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Penelitian</label>
                    <input type="number" step="0.01" min="0" value={editPenelitian} onChange={(e) => setEditPenelitian(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SKS Pengabdian kepada Masyarakat</label>
                    <input type="number" step="0.01" min="0" value={editPkm} onChange={(e) => setEditPkm(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                  </div>
                </div>

                <div className="mb-4">
                  <p className="font-semibold text-slate-700 mb-3">SKS Manajemen<sup>3)</sup></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Sendiri</label>
                      <input type="number" step="0.01" min="0" value={editManajemenPtSendiri} onChange={(e) => setEditManajemenPtSendiri(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PT Lain</label>
                      <input type="number" step="0.01" min="0" value={editManajemenPtLain} onChange={(e) => setEditManajemenPtLain(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" />
                    </div>
                  </div>
                </div>

                <div className="text-right font-semibold text-black">Total SKS: {editTotal}</div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditing(null);
                      setOpenEditTahunDropdown(false);
                      setOpenEditDosenDropdown(false);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-lg bg-blue-100 text-blue-600 text-sm font-semibold shadow-sm hover:bg-blue-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span>Menyimpan...</span>
                      </div>
                    ) : (
                      'Simpan'
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
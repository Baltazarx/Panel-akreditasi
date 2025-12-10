// src/components/tables/Tabel1B.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiFileText, FiCalendar, FiChevronDown, FiBriefcase } from 'react-icons/fi';

const ENDPOINT = "/audit-mutu-internal";
const TABLE_KEY = "tabel_1b";
const LABEL = "1.B Audit Mutu Internal";

const n = (v) => Number(v || 0);

/* ---------- Year Selector Component ---------- */
function YearSelector({ maps, activeYear, setActiveYear }) {
  const tahunData = Object.values(maps.tahun || {});
  
  // Dropdown state
  const [openYearDropdown, setOpenYearDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openYearDropdown && !event.target.closest('.year-selector-dropdown-container') && !event.target.closest('.year-selector-dropdown-menu')) {
        setOpenYearDropdown(false);
      }
    };

    if (openYearDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openYearDropdown]);

  // Close dropdown when activeYear changes
  useEffect(() => {
    setOpenYearDropdown(false);
  }, [activeYear]);

  // Get selected year label
  const getSelectedYearLabel = () => {
    if (!activeYear) return "Semua Tahun";
    const found = tahunData.find((y) => String(y.id_tahun) === String(activeYear));
    return found ? (found.tahun || found.nama || activeYear) : activeYear;
  };
  
  return (
    <div className="relative year-selector-dropdown-container w-48">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpenYearDropdown(!openYearDropdown);
        }}
        className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
          activeYear 
            ? 'border-[#0384d6] bg-white' 
            : 'border-slate-300 bg-white hover:border-gray-400'
        }`}
        aria-label="Pilih tahun"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FiCalendar className="text-[#0384d6] flex-shrink-0" size={16} />
          <span className={`truncate ${activeYear ? 'text-slate-700' : 'text-slate-500'}`}>
            {getSelectedYearLabel()}
          </span>
        </div>
        <FiChevronDown 
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            openYearDropdown ? 'rotate-180' : ''
          }`} 
          size={16} 
        />
      </button>
      {openYearDropdown && (
        <div 
          className="absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto year-selector-dropdown-menu mt-1 w-full"
        >
          <button
            type="button"
            onClick={() => {
              setActiveYear("");
              setOpenYearDropdown(false);
            }}
            className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
              !activeYear
                ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                : 'text-gray-700'
            }`}
          >
            <FiCalendar className="text-[#0384d6] flex-shrink-0" size={14} />
            <span>Semua Tahun</span>
          </button>
          {tahunData.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Tidak ada data tahun
            </div>
          ) : (
            tahunData.map((y) => (
              <button
                key={y.id_tahun}
                type="button"
                onClick={() => {
                  setActiveYear(y.id_tahun.toString());
                  setOpenYearDropdown(false);
                }}
                className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${
                  activeYear === y.id_tahun.toString()
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
  );
}

function PrettyTable({ rows, maps, canUpdate, canDelete, setEditing, doDelete, doHardDelete, showDeleted, doRestore, selectedRows, setSelectedRows, isAllSelected, handleSelectAll, openDropdownId, setOpenDropdownId, setDropdownPosition }) {
  const getUnitName = (id) => maps.units[id]?.nama_unit || id;
  const getYearName = (id) => maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
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
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">No.</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Unit SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nama Unit SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Dokumen SPMI</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Auditor Mutu Internal</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Certified</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Non Certified</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Frekuensi audit/monev per tahun</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Bukti Certified Auditor</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Laporan Audit</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
            {rows
              .filter(r => showDeleted ? r.deleted_at : !r.deleted_at)
              .map((r, i) => {
                const totalAuditors = (r.jumlah_auditor_certified || 0) + (r.jumlah_auditor_noncertified || 0);
                const idField = getIdField(r);
                const rowId = idField && r[idField] ? r[idField] : i;
                return (
                  <tr key={`${showDeleted ? 'deleted' : 'active'}-1b-${rowId}`} className={`transition-all duration-200 ease-in-out ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                    {showDeleted && (
                      <td className="px-6 py-4 text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(r.id_ami)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, r.id_ami]);
                            } else {
                              setSelectedRows(selectedRows.filter(id => id !== r.id_ami));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{i + 1}.</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{getYearName(r.id_tahun)}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.id_unit}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">{getUnitName(r.id_unit)}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">{r.dokumen_spmi}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{totalAuditors}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.jumlah_auditor_certified}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.jumlah_auditor_noncertified}</td>
                    <td className="px-6 py-4 text-slate-700 text-center border border-slate-200">{r.frekuensi_audit}</td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">
                      {r.bukti_certified_uri ? (
                        <a href={r.bukti_certified_uri} target="_blank" rel="noopener noreferrer" className="underline text-[#0384d6] hover:text-[#043975] transition">Lihat Bukti</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 border border-slate-200">
                      {r.laporan_audit_url ? (
                        <a href={r.laporan_audit_url} target="_blank" rel="noopener noreferrer" className="underline text-[#0384d6] hover:text-[#043975] transition">Lihat Laporan</a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 border border-slate-200">
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(r) ? r[getIdField(r)] : i;
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
                          aria-expanded={openDropdownId === (getIdField(r) ? r[getIdField(r)] : i)}
                        >
                          <FiMoreVertical size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 13 : 12} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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

export default function Tabel1B({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeYear, setActiveYear] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Tahun and Unit dropdown state (for form)
  const [openNewTahunDropdown, setOpenNewTahunDropdown] = useState(false);
  const [openEditTahunDropdown, setOpenEditTahunDropdown] = useState(false);
  const [openNewUnitDropdown, setOpenNewUnitDropdown] = useState(false);
  const [openEditUnitDropdown, setOpenEditUnitDropdown] = useState(false);

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
      setOpenNewUnitDropdown(false);
      setOpenEditUnitDropdown(false);
    }
  }, [showCreateModal, showEditModal]);

  // Close tahun and unit dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openNewTahunDropdown && !event.target.closest('.new-tahun-dropdown-container') && !event.target.closest('.new-tahun-dropdown-menu')) {
        setOpenNewTahunDropdown(false);
      }
      if (openEditTahunDropdown && !event.target.closest('.edit-tahun-dropdown-container') && !event.target.closest('.edit-tahun-dropdown-menu')) {
        setOpenEditTahunDropdown(false);
      }
      if (openNewUnitDropdown && !event.target.closest('.new-unit-dropdown-container') && !event.target.closest('.new-unit-dropdown-menu')) {
        setOpenNewUnitDropdown(false);
      }
      if (openEditUnitDropdown && !event.target.closest('.edit-unit-dropdown-container') && !event.target.closest('.edit-unit-dropdown-menu')) {
        setOpenEditUnitDropdown(false);
      }
    };

    if (openNewTahunDropdown || openEditTahunDropdown || openNewUnitDropdown || openEditUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openNewTahunDropdown, openEditTahunDropdown, openNewUnitDropdown, openEditUnitDropdown]);

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

  const [newIdUnit, setNewIdUnit] = useState("");
  const [newIdTahun, setNewIdTahun] = useState("");
  const [newFrekuensiAudit, setNewFrekuensiAudit] = useState("");
  const [newDokumenSpmi, setNewDokumenSpmi] = useState("");
  const [newLaporanAuditUrl, setNewLaporanAuditUrl] = useState("");
  const [newJumlahAuditorCertified, setNewJumlahAuditorCertified] = useState("");
  const [newJumlahAuditorNoncertified, setNewJumlahAuditorNoncertified] = useState("");
  const [newBuktiCertifiedUri, setNewBuktiCertifiedUri] = useState("");

  const [editIdUnit, setEditIdUnit] = useState("");
  const [editIdTahun, setEditIdTahun] = useState("");
  const [editFrekuensiAudit, setEditFrekuensiAudit] = useState("");
  const [editDokumenSpmi, setEditDokumenSpmi] = useState("");
  const [editLaporanAuditUrl, setEditLaporanAuditUrl] = useState("");
  const [editJumlahAuditorCertified, setEditJumlahAuditorCertified] = useState("");
  const [editJumlahAuditorNoncertified, setEditJumlahAuditorNoncertified] = useState("");
  const [editBuktiCertifiedUri, setEditBuktiCertifiedUri] = useState("");

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
      const params = new URLSearchParams();
      params.append("relasi", "1");
      if (activeYear) {
        params.append("id_tahun", activeYear);
      }
      if (showDeleted) {
        params.append("include_deleted", "1");
      }
      const data = await apiFetch(`${ENDPOINT}?${params.toString()}`);
      const rowsArray = Array.isArray(data) ? data : data?.items || [];
      const sortedRows = sortRowsByLatest(rowsArray);
      setRows(sortedRows);
    } catch (e) {
      setError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchRows(false);
    setSelectedRows([]);
  }, [activeYear]);

  // Toggle between active and deleted data
  useEffect(() => {
    if (!initialLoading) {
      fetchRows(true);
      setSelectedRows([]);
    }
  }, [showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdUnit(editing.id_unit || "");
      setEditIdTahun(editing.id_tahun || "");
      setEditFrekuensiAudit(editing.frekuensi_audit || "");
      setEditDokumenSpmi(editing.dokumen_spmi || "");
      setEditLaporanAuditUrl(editing.laporan_audit_url || "");
      setEditJumlahAuditorCertified(editing.jumlah_auditor_certified || "");
      setEditJumlahAuditorNoncertified(editing.jumlah_auditor_noncertified || "");
      setEditBuktiCertifiedUri(editing.bukti_certified_uri || "");
      setShowEditModal(true);
      setOpenEditTahunDropdown(false);
      setOpenEditUnitDropdown(false);
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

  const doRestore = (row) => {
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
            })
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

  const isAllSelected = rows.filter(r => r.deleted_at).length > 0 && selectedRows.length === rows.filter(r => r.deleted_at).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = rows.filter(r => r.deleted_at).map(r => r.id_ami);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  const renderModalForm = (isEdit = false) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validasi unit dan tahun harus dipilih
      const selectedUnit = isEdit ? editIdUnit : newIdUnit;
      const selectedTahun = isEdit ? editIdTahun : newIdTahun;
      
      if (!selectedUnit || selectedUnit === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Data Belum Lengkap',
          text: 'Silakan pilih Unit SPMI terlebih dahulu.'
        });
        return;
      }
      if (!selectedTahun || selectedTahun === "") {
        Swal.fire({
          icon: 'warning',
          title: 'Data Belum Lengkap',
          text: 'Silakan pilih Tahun terlebih dahulu.'
        });
        return;
      }
      
      try {
        setLoading(true);
        setOpenNewTahunDropdown(false);
        setOpenEditTahunDropdown(false);
        setOpenNewUnitDropdown(false);
        setOpenEditUnitDropdown(false);
        const body = {
          id_unit: parseInt(selectedUnit),
          id_tahun: parseInt(selectedTahun),
          frekuensi_audit: n(isEdit ? editFrekuensiAudit : newFrekuensiAudit),
          dokumen_spmi: isEdit ? editDokumenSpmi : newDokumenSpmi,
          laporan_audit_url: isEdit ? editLaporanAuditUrl : newLaporanAuditUrl,
          jumlah_auditor_certified: n(isEdit ? editJumlahAuditorCertified : newJumlahAuditorCertified),
          jumlah_auditor_noncertified: n(isEdit ? editJumlahAuditorNoncertified : newJumlahAuditorNoncertified),
          bukti_certified_uri: isEdit ? editBuktiCertifiedUri : newBuktiCertifiedUri,
          ...(isEdit ? {
            updated_by: role?.user?.name || role?.user?.username || "Unknown User",
            updated_at: new Date().toISOString()
          } : {
            created_by: role?.user?.name || role?.user?.username || "Unknown User",
            created_at: new Date().toISOString()
          })
        };

        if (isEdit) {
          const idField = getIdField(editing);
          await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
          setEditing(null);
          setShowEditModal(false);
        } else {
          await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
          setNewIdUnit(""); setNewIdTahun(""); setNewFrekuensiAudit("");
          setNewDokumenSpmi(""); setNewLaporanAuditUrl("");
          setNewJumlahAuditorCertified(""); setNewJumlahAuditorNoncertified("");
          setNewBuktiCertifiedUri("");
          setShowCreateModal(false);
        }
        fetchRows();
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Data berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}.`, timer: 1500, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
      } finally {
        setLoading(false);
      }
    };

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unit SPMI <span className="text-red-500">*</span></label>
            <div className={`relative ${isEdit ? 'edit-unit-dropdown-container' : 'new-unit-dropdown-container'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isEdit) {
                    setOpenEditUnitDropdown(!openEditUnitDropdown);
                    setOpenEditTahunDropdown(false);
                  } else {
                    setOpenNewUnitDropdown(!openNewUnitDropdown);
                    setOpenNewTahunDropdown(false);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                  (isEdit ? editIdUnit : newIdUnit)
                    ? 'border-[#0384d6] bg-white' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                aria-label="Pilih unit SPMI"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${(isEdit ? editIdUnit : newIdUnit) ? 'text-gray-900' : 'text-gray-500'}`}>
                    {(isEdit ? editIdUnit : newIdUnit) 
                      ? (() => {
                          const found = Object.values(maps.units || {}).find((u) => String(u.id_unit) === String(isEdit ? editIdUnit : newIdUnit));
                          return found ? (found.nama_unit || "Pilih...") : "Pilih unit...";
                        })()
                      : "Pilih unit..."}
                  </span>
                </div>
                <FiChevronDown 
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    (isEdit ? openEditUnitDropdown : openNewUnitDropdown) ? 'rotate-180' : ''
                  }`} 
                  size={18} 
                />
              </button>
              {(isEdit ? openEditUnitDropdown : openNewUnitDropdown) && (
                <div 
                  className={`absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto ${isEdit ? 'edit-unit-dropdown-menu' : 'new-unit-dropdown-menu'} mt-1 w-full`}
                >
                  {Object.values(maps.units || {}).length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Tidak ada data unit
                    </div>
                  ) : (
                    Object.values(maps.units || {}).map((u) => (
                      <button
                        key={u.id_unit}
                        type="button"
                        onClick={() => {
                          if (isEdit) {
                            setEditIdUnit(u.id_unit.toString());
                            setOpenEditUnitDropdown(false);
                          } else {
                            setNewIdUnit(u.id_unit.toString());
                            setOpenNewUnitDropdown(false);
                          }
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                          (isEdit ? editIdUnit : newIdUnit) === u.id_unit.toString()
                            ? 'bg-[#eaf4ff] text-[#0384d6] font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <FiBriefcase className="text-[#0384d6] flex-shrink-0" size={16} />
                        <span className="truncate">{u.nama_unit}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun <span className="text-red-500">*</span></label>
            <div className={`relative ${isEdit ? 'edit-tahun-dropdown-container' : 'new-tahun-dropdown-container'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isEdit) {
                    setOpenEditTahunDropdown(!openEditTahunDropdown);
                    setOpenEditUnitDropdown(false);
                  } else {
                    setOpenNewTahunDropdown(!openNewTahunDropdown);
                    setOpenNewUnitDropdown(false);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${
                  (isEdit ? editIdTahun : newIdTahun)
                    ? 'border-[#0384d6] bg-white' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                aria-label="Pilih tahun"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiCalendar className="text-[#0384d6] flex-shrink-0" size={18} />
                  <span className={`truncate ${(isEdit ? editIdTahun : newIdTahun) ? 'text-gray-900' : 'text-gray-500'}`}>
                    {(isEdit ? editIdTahun : newIdTahun) 
                      ? (() => {
                          const found = Object.values(maps.tahun || {}).find((y) => String(y.id_tahun) === String(isEdit ? editIdTahun : newIdTahun));
                          return found ? (found.tahun || found.nama || "Pilih...") : "Pilih tahun...";
                        })()
                      : "Pilih tahun..."}
                  </span>
                </div>
                <FiChevronDown 
                  className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    (isEdit ? openEditTahunDropdown : openNewTahunDropdown) ? 'rotate-180' : ''
                  }`} 
                  size={18} 
                />
              </button>
              {(isEdit ? openEditTahunDropdown : openNewTahunDropdown) && (
                <div 
                  className={`absolute z-[100] bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto ${isEdit ? 'edit-tahun-dropdown-menu' : 'new-tahun-dropdown-menu'} mt-1 w-full`}
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
                          if (isEdit) {
                            setEditIdTahun(y.id_tahun.toString());
                            setOpenEditTahunDropdown(false);
                          } else {
                            setNewIdTahun(y.id_tahun.toString());
                            setOpenNewTahunDropdown(false);
                          }
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#eaf4ff] transition-colors ${
                          (isEdit ? editIdTahun : newIdTahun) === y.id_tahun.toString()
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
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Frekuensi audit/monev per tahun</label>
          <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editFrekuensiAudit : newFrekuensiAudit} onChange={(e) => isEdit ? setEditFrekuensiAudit(e.target.value) : setNewFrekuensiAudit(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Dokumen SPMI</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editDokumenSpmi : newDokumenSpmi} onChange={(e) => isEdit ? setEditDokumenSpmi(e.target.value) : setNewDokumenSpmi(e.target.value)} />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Laporan Audit URL</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editLaporanAuditUrl : newLaporanAuditUrl} onChange={(e) => isEdit ? setEditLaporanAuditUrl(e.target.value) : setNewLaporanAuditUrl(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Auditor Certified</label>
            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editJumlahAuditorCertified : newJumlahAuditorCertified} onChange={(e) => isEdit ? setEditJumlahAuditorCertified(e.target.value) : setNewJumlahAuditorCertified(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Auditor Non Certified</label>
            <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editJumlahAuditorNoncertified : newJumlahAuditorNoncertified} onChange={(e) => isEdit ? setEditJumlahAuditorNoncertified(e.target.value) : setNewJumlahAuditorNoncertified(e.target.value)} required />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Bukti Certified Auditor URL</label>
          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-[#0384d6] focus:border-[#0384d6] text-black" value={isEdit ? editBuktiCertifiedUri : newBuktiCertifiedUri} onChange={(e) => isEdit ? setEditBuktiCertifiedUri(e.target.value) : setNewBuktiCertifiedUri(e.target.value)} />
        </div>
        
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
           <button 
               className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" 
               type="button" 
               onClick={() => {
                 if (isEdit) {
                   setShowEditModal(false);
                   setOpenEditTahunDropdown(false);
                   setOpenEditUnitDropdown(false);
                 } else {
                   setShowCreateModal(false);
                   setOpenNewTahunDropdown(false);
                   setOpenNewUnitDropdown(false);
                 }
               }}
           >
               <span className="relative z-10">Batal</span>
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
           </button>
           <button 
               className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2" 
               disabled={loading} 
               type="submit"
           >
               <span className="relative z-10">{loading ? 'Menyimpan...' : 'Simpan'}</span>
               <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
           </button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
          Kelola data audit mutu internal dan monitoring evaluasi per tahun.
        </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at).length}</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector 
            maps={maps} 
            activeYear={activeYear} 
            setActiveYear={setActiveYear}
          />
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
                  
                  // Helper function untuk get unit name
                  const getUnitName = (id) => maps.units[id]?.nama_unit || id;
                  
                  // Helper function untuk get year name
                  const getYearName = (id) => maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;
                  
                  // Prepare data untuk export (hanya data yang aktif, tidak yang dihapus)
                  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
                  
                  if (filteredRows.length === 0) {
                    throw new Error('Tidak ada data untuk diekspor.');
                  }
                  
                  const exportData = filteredRows.map((row, index) => {
                    const totalAuditors = (row.jumlah_auditor_certified || 0) + (row.jumlah_auditor_noncertified || 0);
                    
                    return {
                      'No': index + 1,
                      'Tahun': getYearName(row.id_tahun),
                      'Unit SPMI': row.id_unit || '',
                      'Nama Unit SPMI': getUnitName(row.id_unit),
                      'Dokumen SPMI': row.dokumen_spmi || '',
                      'Jumlah Auditor Mutu Internal': totalAuditors,
                      'Certified': row.jumlah_auditor_certified || 0,
                      'Non Certified': row.jumlah_auditor_noncertified || 0,
                      'Frekuensi audit/monev per tahun': row.frekuensi_audit || 0,
                      'Bukti Certified Auditor': row.bukti_certified_uri || '',
                      'Laporan Audit': row.laporan_audit_url || ''
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
                    
                    const headers = ['No', 'Tahun', 'Unit SPMI', 'Nama Unit SPMI', 'Dokumen SPMI', 'Jumlah Auditor Mutu Internal', 'Certified', 'Non Certified', 'Frekuensi audit/monev per tahun', 'Bukti Certified Auditor', 'Laporan Audit'];
                    const csvRows = [
                      headers.map(escapeCsv).join(','),
                      ...exportData.map(row => [
                        row.No,
                        escapeCsv(row.Tahun),
                        row['Unit SPMI'],
                        escapeCsv(row['Nama Unit SPMI']),
                        escapeCsv(row['Dokumen SPMI']),
                        row['Jumlah Auditor Mutu Internal'],
                        row.Certified,
                        row['Non Certified'],
                        row['Frekuensi audit/monev per tahun'],
                        escapeCsv(row['Bukti Certified Auditor']),
                        escapeCsv(row['Laporan Audit'])
                      ].map(escapeCsv).join(','))
                    ];
                    const csvContent = '\ufeff' + csvRows.join('\n');
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Tabel_1B_Audit_Mutu_Internal_${new Date().toISOString().split('T')[0]}.csv`;
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
                    { wch: 12 },  // Unit SPMI
                    { wch: 25 },  // Nama Unit SPMI
                    { wch: 30 },  // Dokumen SPMI
                    { wch: 25 },  // Jumlah Auditor Mutu Internal
                    { wch: 12 },  // Certified
                    { wch: 15 },  // Non Certified
                    { wch: 30 },  // Frekuensi audit/monev per tahun
                    { wch: 40 },  // Bukti Certified Auditor
                    { wch: 40 }   // Laporan Audit
                  ];
                  
                  // Tambahkan worksheet ke workbook
                  XLSX.utils.book_append_sheet(wb, ws, 'Tabel 1B');
                  
                  // Generate file dan download
                  const fileName = `Tabel_1B_Audit_Mutu_Internal_${new Date().toISOString().split('T')[0]}.xlsx`;
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
              disabled={loading || rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at)).length === 0}
              className="px-4 py-2 bg-white border border-green-600 text-green-600 font-semibold rounded-lg shadow-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Export to Excel"
            >
              <FiFileText className="w-4 h-4" />
              Export Excel
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              Ekspor data audit mutu internal ke Excel
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
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
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        showDeleted={showDeleted}
        doRestore={doRestore}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        setDropdownPosition={setDropdownPosition}
      />

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);
        const currentRow = filteredRows.find((r, idx) => {
          const rowId = getIdField(r) ? r[getIdField(r)] : idx;
          return rowId === openDropdownId;
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
                aria-label={`Edit data ${maps.units[currentRow.id_unit]?.nama_unit || 'audit mutu internal'}`}
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
                aria-label={`Hapus data ${maps.units[currentRow.id_unit]?.nama_unit || 'audit mutu internal'}`}
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
                aria-label={`Hapus permanen data ${maps.units[currentRow.id_unit]?.nama_unit || 'audit mutu internal'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
            {showDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${maps.units[currentRow.id_unit]?.nama_unit || 'audit mutu internal'}`}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Tambah Data Audit Mutu Internal</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data AMI termasuk auditor dan dokumen pendukung.</p>
            </div>
            <div className="p-8">{renderModalForm(false)}</div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h2 className="text-xl font-bold">Ubah Data Audit Mutu Internal</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui data AMI termasuk auditor dan dokumen pendukung.</p>
            </div>
            <div className="p-8">{renderModalForm(true)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
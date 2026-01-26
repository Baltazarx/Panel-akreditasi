// src/components/tables/Tabel1A3.jsx
import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2'; // Penambahan notifikasi
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical, FiFileText, FiCalendar, FiChevronDown, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ENDPOINT = "/penggunaan-dana";
const TABLE_KEY = "tabel_1a3";
const LABEL = "1.A.3 Penggunaan Dana UPPS/PS";

const n = (v) => Number(v || 0);

/* ---------- Year selector (TS filter) ---------- */
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
        className={`w-full px-3 py-2 rounded-lg border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] flex items-center justify-between transition-all duration-200 ${activeYear
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
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${openYearDropdown ? 'rotate-180' : ''
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
            className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${!activeYear
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
                className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-[#eaf4ff] transition-colors ${activeYear === y.id_tahun.toString()
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

function PrettyTable1A3({
  rows,
  maps,
  canUpdate,
  canDelete,
  setEditing,
  doDelete,
  doHardDelete,
  doRestore,
  showDeleted,
  selectedRows,
  setSelectedRows,
  isAllSelected,
  handleSelectAll,
  openDropdownId,
  setOpenDropdownId,
  setDropdownPosition,

  currentPage = 1,
  itemsPerPage = 5,
  setCurrentPage,
  setItemsPerPage
}) {
  const getYearName = (id) =>
    maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

  // Filter Data
  const filteredRows = rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at));

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col gap-4">
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jenis Penggunaan</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Dana</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Link Bukti</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
            {currentItems.map((r, i) => {
              const idField = getIdField(r);
              const rowId = idField && r[idField] ? r[idField] : i;
              return (
                <tr
                  key={`${showDeleted ? 'deleted' : 'active'}-1a3-${rowId}`}
                  className={`transition-all duration-200 ease-in-out ${i % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-[#eaf4ff]`}
                >
                  {showDeleted && (
                    <td className="px-6 py-4 text-center border border-slate-200">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(r.id_penggunaan_dana)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows([
                              ...selectedRows,
                              r.id_penggunaan_dana,
                            ]);
                          } else {
                            setSelectedRows(
                              selectedRows.filter(
                                (id) => id !== r.id_penggunaan_dana
                              )
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    {getYearName(r.id_tahun)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">
                    {r.jenis_penggunaan}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    {r.jumlah_dana
                      ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(n(r.jumlah_dana))
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    {r.link_bukti ? (
                      <a
                        href={r.link_bukti}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#0384d6] hover:text-[#043975] transition"
                      >
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
            {rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at))
              .length === 0 && (
                <tr>
                  <td
                    colSpan={showDeleted ? 6 : 5}
                    className="px-6 py-16 text-center text-slate-500 border border-slate-200"
                  >
                    <p className="font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">
                      Belum ada data yang ditambahkan atau data yang cocok dengan
                      filter.
                    </p>
                  </td>
                </tr>
              )}
          </tbody>

        </table>
      </div>

      {/* Pagination Controls - PrettyTable1A3 */}
      {
        filteredRows.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-700 px-2 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-shadow text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-slate-600">
                Halaman <span className="font-semibold text-slate-900">{currentPage}</span> dari <span className="font-semibold text-slate-900">{Math.ceil(filteredRows.length / itemsPerPage)}</span> | Total <span className="font-semibold text-slate-900">{filteredRows.length}</span> data
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                  aria-label="Halaman sebelumnya"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(filteredRows.length / itemsPerPage), currentPage + 1))}
                  disabled={currentPage === Math.ceil(filteredRows.length / itemsPerPage)}
                  className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                  aria-label="Halaman berikutnya"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function PrettyTable1A3Summary({ summaryData, currentPage = 1, itemsPerPage = 5, setCurrentPage, setItemsPerPage }) {
  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = summaryData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr className="sticky top-0">
              {[
                "Jenis Penggunaan",
                "TS-4",
                "TS-3",
                "TS-2",
                "TS-1",
                "TS",
                "Link Bukti",
              ].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 transition-opacity duration-200 ease-in-out">
            {currentItems.map((row, i) => (
              <tr
                key={`summary-${i}`}
                className={`transition-all duration-200 ease-in-out ${i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-[#eaf4ff]`}
              >
                <td className="px-6 py-4 font-semibold text-slate-700 border border-slate-200">
                  {row.jenis_penggunaan}
                </td>
                <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_4))}
                </td>
                <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_3))}
                </td>
                <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_2))}
                </td>
                <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts_minus_1))}
                </td>
                <td className="px-6 py-4 text-slate-700 text-right border border-slate-200">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n(row.ts))}
                </td>
                <td className="px-6 py-4 text-slate-700 border border-slate-200">
                  {row.link_bukti ? (
                    <a
                      href={row.link_bukti}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-[#0384d6] hover:text-[#043975] transition"
                    >
                      Lihat Bukti
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {summaryData.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-slate-500 border border-slate-200"
                >
                  <p className="font-medium">Data ringkasan tidak tersedia</p>
                  <p className="text-sm">Belum ada data penggunaan dana.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Summary */}
      {summaryData.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-700 px-2 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Baris per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] transition-shadow text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Halaman <span className="font-semibold text-slate-900">{currentPage}</span> dari <span className="font-semibold text-slate-900">{Math.ceil(summaryData.length / itemsPerPage)}</span> | Total <span className="font-semibold text-slate-900">{summaryData.length}</span> data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                aria-label="Halaman sebelumnya"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(summaryData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(summaryData.length / itemsPerPage)}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6]"
                aria-label="Halaman berikutnya"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default function Tabel1A3({ role }) {
  const { maps } = useMaps(true);
  const [rows, setRows] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [activeYear, setActiveYear] = useState("");

  // Pagination State - PrettyTable1A3
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Pagination State - Summary
  const [currentSummaryPage, setCurrentSummaryPage] = useState(1);
  const [itemsSummaryPerPage, setItemsSummaryPerPage] = useState(5);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setCurrentSummaryPage(1);
  }, [activeYear, showDeleted]);

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Tahun dropdown state (for form)
  const [openNewTahunDropdown, setOpenNewTahunDropdown] = useState(false);
  const [openEditTahunDropdown, setOpenEditTahunDropdown] = useState(false);

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
    }
  }, [showCreateModal, showEditModal]);

  // Close tahun dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openNewTahunDropdown && !event.target.closest('.new-tahun-dropdown-container') && !event.target.closest('.new-tahun-dropdown-menu')) {
        setOpenNewTahunDropdown(false);
      }
      if (openEditTahunDropdown && !event.target.closest('.edit-tahun-dropdown-container') && !event.target.closest('.edit-tahun-dropdown-menu')) {
        setOpenEditTahunDropdown(false);
      }
    };

    if (openNewTahunDropdown || openEditTahunDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openNewTahunDropdown, openEditTahunDropdown]);

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
  const [newJenis, setNewJenis] = useState("");
  const [newJumlah, setNewJumlah] = useState("");
  const [newLink, setNewLink] = useState("");

  const [editIdTahun, setEditIdTahun] = useState("");
  const [editJenis, setEditJenis] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [editLink, setEditLink] = useState("");

  // Auto-fill tahun saat modal tambah dibuka sesuai filter yang aktif
  useEffect(() => {
    if (showCreateModal && activeYear) {
      setNewIdTahun(activeYear);
    }
  }, [showCreateModal, activeYear]);

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
      let qs = "?relasi=1";
      if (activeYear) {
        qs += `&id_tahun=${encodeURIComponent(activeYear)}`;
      }
      if (showDeleted) {
        qs += `&include_deleted=1`;
      }
      const data = await apiFetch(`${ENDPOINT}${qs}`);
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

  // Helper: sort years descending by label string
  const getSortedYearsDesc = () => {
    const tahunData = Object.values(maps.tahun || {});
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

  const computeSummaryFromBaseYear = async (baseYearId) => {
    const yearIds = getRelativeYearIdsFromBase(baseYearId);
    if (!yearIds.length) return;
    const [ts, ts1, ts2, ts3, ts4] = yearIds;

    // Fetch data for 5 years
    const fetches = [ts, ts1, ts2, ts3, ts4].map((id) =>
      id ? apiFetch(`${ENDPOINT}?id_tahun=${encodeURIComponent(id)}`) : Promise.resolve([])
    );

    try {
      const [tsData, ts1Data, ts2Data, ts3Data, ts4Data] = await Promise.all(fetches);
      const normalize = (d) => (Array.isArray(d) ? d : d?.items || []);

      // Filter non-deleted data
      const tsRows = normalize(tsData).filter(r => !r.deleted_at);
      const ts1Rows = normalize(ts1Data).filter(r => !r.deleted_at);
      const ts2Rows = normalize(ts2Data).filter(r => !r.deleted_at);
      const ts3Rows = normalize(ts3Data).filter(r => !r.deleted_at);
      const ts4Rows = normalize(ts4Data).filter(r => !r.deleted_at);

      const jenisToRow = new Map();
      const addRows = (rowsArr, keyName) => {
        rowsArr.forEach((r) => {
          const key = String(r.jenis_penggunaan || "");
          if (!jenisToRow.has(key)) {
            jenisToRow.set(key, {
              jenis_penggunaan: key,
              ts: 0,
              ts_minus_1: 0,
              ts_minus_2: 0,
              ts_minus_3: 0,
              ts_minus_4: 0,
              link_bukti: r.link_bukti || "",
            });
          }
          const agg = jenisToRow.get(key);
          agg[keyName] = Number(r.jumlah_dana || 0);
          if (keyName === 'ts' && r.link_bukti) agg.link_bukti = r.link_bukti;
          else if (!agg.link_bukti && r.link_bukti) agg.link_bukti = r.link_bukti;
        });
      };

      addRows(tsRows, "ts");
      addRows(ts1Rows, "ts_minus_1");
      addRows(ts2Rows, "ts_minus_2");
      addRows(ts3Rows, "ts_minus_3");
      addRows(ts4Rows, "ts_minus_4");

      setSummaryData(Array.from(jenisToRow.values()));
    } catch (err) {
      console.error("Error computing summary:", err);
    }
  };

  async function fetchSummary() {
    try {
      if (activeYear) {
        await computeSummaryFromBaseYear(activeYear);
      } else {
        const data = await apiFetch(`${ENDPOINT}/summary`);
        setSummaryData(Array.isArray(data) ? data : data?.items || []);
      }
    } catch (e) {
      console.error("Gagal memuat summary:", e);
      setSummaryData([]);
    }
  }

  // Initial load
  useEffect(() => {
    fetchRows(false);
    fetchSummary();
    setSelectedRows([]);
  }, [activeYear]);

  // Toggle between active and deleted data
  useEffect(() => {
    if (!initialLoading) {
      fetchRows(true);
      fetchSummary();
      setSelectedRows([]);
    }
  }, [showDeleted]);

  useEffect(() => {
    if (editing) {
      setEditIdTahun(editing.id_tahun || "");
      setEditJenis(editing.jenis_penggunaan || "");
      setEditJumlah(editing.jumlah_dana || "");
      setEditLink(editing.link_bukti || "");
      setShowEditModal(true);
      setOpenEditTahunDropdown(false);
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
              deleted_at: new Date().toISOString(),
            }),
          });
          fetchRows();
          fetchSummary();
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
        setLoading(true);
        try {
          const idField = getIdField(row);
          await apiFetch(`${ENDPOINT}/${row?.[idField]}/hard-delete`, {
            method: "DELETE",
          });
          fetchRows();
          fetchSummary();
          Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal menghapus data secara permanen: ${e.message}`, 'error');
        } finally {
          setLoading(false);
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
              restored_at: new Date().toISOString(),
            }),
          });
          fetchRows();
          fetchSummary();
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
              restored_at: new Date().toISOString(),
            }),
          });
          setSelectedRows([]);
          fetchRows();
          fetchSummary();
          Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
        } catch (e) {
          Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const isAllSelected =
    rows.filter((r) => r.deleted_at).length > 0 &&
    selectedRows.length === rows.filter((r) => r.deleted_at).length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDeletedIds = rows
        .filter((r) => r.deleted_at)
        .map((r) => r.id_penggunaan_dana);
      setSelectedRows(allDeletedIds);
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-slate-500">
            Kelola data penggunaan dana UPPS/PS dan distribusi per tahun.
          </p>
          {!loading && (
            <span className="inline-flex items-center text-sm text-slate-700">
              Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rows.filter((r) => (showDeleted ? r.deleted_at : !r.deleted_at)).length}</span>
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

                  // Helper function untuk get year name
                  const getYearName = (id) =>
                    maps.tahun[id]?.tahun || maps.tahun[id]?.nama || id;

                  // Prepare data untuk export (hanya data yang aktif, tidak yang dihapus)
                  const filteredRows = rows.filter(r => showDeleted ? r.deleted_at : !r.deleted_at);

                  if (filteredRows.length === 0) {
                    throw new Error('Tidak ada data untuk diekspor.');
                  }

                  const exportData = filteredRows.map((row, index) => ({
                    'No': index + 1,
                    'Tahun': getYearName(row.id_tahun),
                    'Jenis Penggunaan': row.jenis_penggunaan || '',
                    'Jumlah Dana': Number(String(row.jumlah_dana || '0').replace(/[^\d.-]/g, '')) || 0,
                    'Link Bukti': row.link_bukti || ''
                  }));

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

                    const headers = ['No', 'Tahun', 'Jenis Penggunaan', 'Jumlah Dana', 'Link Bukti'];
                    const csvRows = [
                      headers.map(escapeCsv).join(','),
                      ...exportData.map(row => [
                        row.No,
                        escapeCsv(row.Tahun),
                        escapeCsv(row['Jenis Penggunaan']),
                        row['Jumlah Dana'],
                        escapeCsv(row['Link Bukti'])
                      ].map(escapeCsv).join(','))
                    ];
                    const csvContent = '\ufeff' + csvRows.join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Tabel_1A3_Penggunaan_Dana_${new Date().toISOString().split('T')[0]}.csv`;
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
                    { wch: 30 },  // Jenis Penggunaan
                    { wch: 20 },  // Jumlah Dana
                    { wch: 40 }   // Link Bukti
                  ];

                  // Tambahkan worksheet ke workbook
                  XLSX.utils.book_append_sheet(wb, ws, 'Tabel 1A3');

                  // Generate file dan download
                  const fileName = `Tabel_1A3_Penggunaan_Dana_${new Date().toISOString().split('T')[0]}.xlsx`;
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
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Export ke Excel"
            >
              <FiDownload size={18} />
              <span>Export Excel</span>
            </button>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
              Ekspor data tabel per tahun
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

      <PrettyTable1A3
        rows={rows}
        maps={maps}
        canUpdate={canUpdate}
        canDelete={canDelete}
        setEditing={setEditing}
        doDelete={doDelete}
        doHardDelete={doHardDelete}
        doRestore={doRestore}
        showDeleted={showDeleted}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isAllSelected={isAllSelected}
        handleSelectAll={handleSelectAll}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
        setDropdownPosition={setDropdownPosition}
        // Pagination Props
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
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
                aria-label={`Edit data ${currentRow.jenis_penggunaan || 'penggunaan dana'}`}
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
                aria-label={`Hapus data ${currentRow.jenis_penggunaan || 'penggunaan dana'}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
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
                aria-label={`Pulihkan data ${currentRow.jenis_penggunaan || 'penggunaan dana'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
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
                aria-label={`Hapus permanen data ${currentRow.jenis_penggunaan || 'penggunaan dana'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      <div className="mt-8">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-700">
            Ringkasan Penggunaan Dana
          </h2>
          <div className="flex items-center gap-3">
            {!loading && (
              <span className="inline-flex items-center text-sm text-slate-700">
                Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{summaryData.length}</span>
              </span>
            )}
            <div className="relative group">
              <button
                onClick={async () => {
                  try {
                    setLoading(true);

                    // Prepare data untuk export ringkasan
                    if (summaryData.length === 0) {
                      throw new Error('Tidak ada data ringkasan untuk diekspor.');
                    }

                    const exportData = summaryData.map((row) => ({
                      'Jenis Penggunaan': row.jenis_penggunaan || '',
                      'TS-4': Number(String(n(row.ts_minus_4) || '0').replace(/[^\d.-]/g, '')) || 0,
                      'TS-3': Number(String(n(row.ts_minus_3) || '0').replace(/[^\d.-]/g, '')) || 0,
                      'TS-2': Number(String(n(row.ts_minus_2) || '0').replace(/[^\d.-]/g, '')) || 0,
                      'TS-1': Number(String(n(row.ts_minus_1) || '0').replace(/[^\d.-]/g, '')) || 0,
                      'TS': Number(String(n(row.ts) || '0').replace(/[^\d.-]/g, '')) || 0,
                      'Link Bukti': row.link_bukti || ''
                    }));

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

                      const headers = ['Jenis Penggunaan', 'TS-4', 'TS-3', 'TS-2', 'TS-1', 'TS', 'Link Bukti'];
                      const csvRows = [
                        headers.map(escapeCsv).join(','),
                        ...exportData.map(row => [
                          escapeCsv(row['Jenis Penggunaan']),
                          row['TS-4'],
                          row['TS-3'],
                          row['TS-2'],
                          row['TS-1'],
                          row['TS'],
                          escapeCsv(row['Link Bukti'])
                        ].map(escapeCsv).join(','))
                      ];
                      const csvContent = '\ufeff' + csvRows.join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Tabel_1A3_Ringkasan_${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);

                      Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Data ringkasan berhasil diekspor ke CSV. File dapat dibuka di Excel.',
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
                      { wch: 30 },  // Jenis Penggunaan
                      { wch: 15 },  // TS-4
                      { wch: 15 },  // TS-3
                      { wch: 15 },  // TS-2
                      { wch: 15 },  // TS-1
                      { wch: 15 },  // TS
                      { wch: 40 }   // Link Bukti
                    ];

                    // Tambahkan worksheet ke workbook
                    XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan 1A3');

                    // Generate file dan download
                    const fileName = `Tabel_1A3_Ringkasan_${new Date().toISOString().split('T')[0]}.xlsx`;
                    XLSX.writeFile(wb, fileName);

                    Swal.fire({
                      icon: 'success',
                      title: 'Berhasil!',
                      text: 'Data ringkasan berhasil diekspor ke Excel.',
                      timer: 1500,
                      showConfirmButton: false
                    });
                  } catch (err) {
                    console.error("Error exporting summary data:", err);
                    Swal.fire({
                      icon: 'error',
                      title: 'Gagal mengekspor data',
                      text: err.message || 'Terjadi kesalahan saat mengekspor data ringkasan.'
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || summaryData.length === 0}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Export Ringkasan ke Excel"
              >
                <FiDownload size={18} />
                <span>Export Ringkasan</span>
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50">
                Ekspor data ringkasan (TS-4 s.d. TS)
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <PrettyTable1A3Summary
          summaryData={summaryData}
          // Pagination Props
          currentPage={currentSummaryPage}
          itemsPerPage={itemsSummaryPerPage}
          setCurrentPage={setCurrentSummaryPage}
          setItemsPerPage={setItemsSummaryPerPage}
        />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">Tambah Data Penggunaan Dana</h2>
              <p className="text-white/80 mt-1 text-sm">Lengkapi jenis penggunaan, jumlah dan tahun.</p>
            </div>
            <form
              className="p-8 space-y-6 overflow-y-auto flex-1"
              onSubmit={async (e) => {
                e.preventDefault();

                // Validasi tahun harus dipilih
                if (!newIdTahun || newIdTahun === "") {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Data Belum Lengkap',
                    text: 'Silakan pilih Tahun terlebih dahulu.'
                  });
                  return;
                }

                setLoading(true);
                setOpenNewTahunDropdown(false);
                try {
                  const body = { id_tahun: parseInt(newIdTahun), jenis_penggunaan: newJenis, jumlah_dana: n(newJumlah), link_bukti: newLink, created_by: role?.user?.name || role?.user?.username || "Unknown User", created_at: new Date().toISOString() };
                  await apiFetch(ENDPOINT, { method: "POST", body: JSON.stringify(body) });
                  setShowCreateModal(false);
                  setNewIdTahun(""); setNewJenis(""); setNewJumlah(""); setNewLink("");
                  fetchRows();
                  fetchSummary();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Menambah Data', text: e.message });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <div className="relative new-tahun-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenNewTahunDropdown(!openNewTahunDropdown);
                      setOpenEditTahunDropdown(false);
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
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Penggunaan
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  placeholder="mis. Operasional, Pengembangan, dll."
                  value={newJenis}
                  onChange={(e) => setNewJenis(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Dana
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={newJumlah}
                  onChange={(e) => setNewJumlah(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Bukti
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setOpenNewTahunDropdown(false);
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
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white flex-shrink-0">
              <h2 className="text-xl font-bold">Ubah Data Penggunaan Dana</h2>
              <p className="text-white/80 mt-1 text-sm">Perbarui jenis penggunaan, jumlah dan tahun.</p>
            </div>
            <form
              className="p-8 space-y-6 overflow-y-auto flex-1"
              onSubmit={async (e) => {
                e.preventDefault();

                // Validasi tahun harus dipilih
                if (!editIdTahun || editIdTahun === "") {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Data Belum Lengkap',
                    text: 'Silakan pilih Tahun terlebih dahulu.'
                  });
                  return;
                }

                setLoading(true);
                setOpenEditTahunDropdown(false);
                try {
                  const idField = getIdField(editing);
                  const body = { id_tahun: parseInt(editIdTahun), jenis_penggunaan: editJenis, jumlah_dana: n(editJumlah), link_bukti: editLink, updated_by: role?.user?.name || role?.user?.username || "Unknown User", updated_at: new Date().toISOString() };
                  await apiFetch(`${ENDPOINT}/${editing?.[idField]}`, { method: "PUT", body: JSON.stringify(body) });
                  setShowEditModal(false);
                  setEditing(null);
                  fetchRows();
                  fetchSummary();
                  Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data berhasil diperbarui.', timer: 1500, showConfirmButton: false });
                } catch (e) {
                  Swal.fire({ icon: 'error', title: 'Gagal Memperbarui Data', text: e.message });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tahun <span className="text-red-500">*</span>
                </label>
                <div className="relative edit-tahun-dropdown-container">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenEditTahunDropdown(!openEditTahunDropdown);
                      setOpenNewTahunDropdown(false);
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
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jenis Penggunaan
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editJenis}
                  onChange={(e) => setEditJenis(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Dana
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editJumlah}
                  onChange={(e) => setEditJumlah(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Link Bukti
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  className="px-6 py-2.5 rounded-lg bg-red-100 text-red-600 text-sm font-medium shadow-sm hover:bg-red-200 hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditing(null);
                    setOpenEditTahunDropdown(false);
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
      )}
    </div>
  );
}
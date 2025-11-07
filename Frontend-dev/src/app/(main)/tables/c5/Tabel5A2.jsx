import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

// const ENDPOINT = "/tabel-5a2";
const TABLE_KEY = "tabel_5a2";
const LABEL = "5.A.2 Tabel C5 - A2";

export default function Tabel5A2({ auth, role: propRole }) {
  const { authUser } = useAuth();
  const role = propRole || authUser?.role;
  const { maps } = useMaps(auth?.user || authUser || true);
  
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // Permission flags
  const canCreate = roleCan(role, TABLE_KEY, "C");
  const canUpdate = roleCan(role, TABLE_KEY, "U");
  const canDelete = roleCan(role, TABLE_KEY, "D");
  
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

  // Endpoint belum tersedia - fetch data dinonaktifkan sementara
  // async function fetchRows() {
  //   try {
  //     setLoading(true);
  //     setError("");
  //     const data = await apiFetch(ENDPOINT);
  //     setRows(Array.isArray(data) ? data : data?.items || []);
  //   } catch (e) {
  //     setError(e?.message || "Gagal memuat data");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   fetchRows();
  // }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl">
      {/* Header */}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{LABEL}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola data untuk tabel 5A-2.
        </p>
      </header>

      {/* Controls */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-800">
            {loading ? "Memuat..." : `${rows.length} baris`}
          </span>
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
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr className="sticky top-0">
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                No.
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                Data
              </th>
              {(canUpdate || canDelete) && (
                <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r, i) => {
              const rowId = getIdField(r) ? r[getIdField(r)] : r.id || i;
              const isDeleted = r.deleted_at;
              
              return (
                <tr
                  key={i}
                  className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}
                >
                  <td className="px-6 py-4 font-semibold text-slate-800 text-center border border-slate-200">
                    {i + 1}.
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200">
                    {JSON.stringify(r)}
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
            {rows.length === 0 && (
              <tr>
                <td colSpan={(canUpdate || canDelete) ? 3 : 2} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">
                    Belum ada data yang tersedia untuk tabel ini.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = rows.find((r, idx) => {
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
                  // TODO: Implement edit handler
                  // handleEdit(currentRow);
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
                  // TODO: Implement delete handler
                  // handleDelete(currentRow);
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
                  // TODO: Implement restore handler
                  // handleRestore(currentRow);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label="Pulihkan data"
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement hard delete handler
                  // handleHardDelete(currentRow);
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
    </div>
  );
}



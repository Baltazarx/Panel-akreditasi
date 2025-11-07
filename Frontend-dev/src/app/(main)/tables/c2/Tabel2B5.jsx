"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiMoreVertical, FiRotateCw, FiXCircle } from 'react-icons/fi';

export default function Tabel2B5({ role }) {
  const { authUser } = useAuth();
  const { maps, loading: mapsLoading } = useMaps(true);
  const tableKey = "tabel_2b5_kesesuaian_kerja";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
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
    if (showAddModal) {
      setOpenDropdownId(null);
    }
  }, [showAddModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showAddModal]);
  const [formState, setFormState] = useState({
    id_unit_prodi: "",
    id_tahun_lulus: "",
    jumlah_lulusan: "",
    jumlah_terlacak: "",
    jml_infokom: "",
    jml_non_infokom: "",
    jml_internasional: "",
    jml_nasional: "",
    jml_wirausaha: ""
  });
  const [showDeleted, setShowDeleted] = useState(false);

  const availableYears = useMemo(() => {
    const years = Object.values(maps?.tahun || {}).map(year => ({
      id: year.id_tahun,
      tahun: year.tahun
    }));
    return years.sort((a, b) => a.id - b.id);
  }, [maps?.tahun]);

  const canCreate = roleCan(role, tableKey, "C");
  const canUpdate = roleCan(role, tableKey, "U");
  const canDelete = roleCan(role, tableKey, "D");

  const fetchData = async () => {
    try {
      setLoading(true);
      let params = selectedTahun ? `?id_tahun_lulus=${selectedTahun}` : "";
      if (showDeleted) params += (params ? "&" : "?") + "include_deleted=1";
      const result = await apiFetch(`/tabel2b5-kesesuaian-kerja${params}`);
      setData(result);
    } catch (error) {
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedTahun && availableYears.length > 0) {
      // Cari tahun sekarang di list dengan prefix, bukan includes biasa!
      const nowYear = new Date().getFullYear();
      const found = availableYears.find(y => (`${y.tahun}`.startsWith(nowYear.toString())));
      if (found) setSelectedTahun(found.id);
      else setSelectedTahun(availableYears[availableYears.length - 1].id); // tahun terbaru
    }
  }, [availableYears, selectedTahun]);

  useEffect(() => { fetchData(); }, [selectedTahun, showDeleted]);

  // Mapping ke baris TS, TS-1, TS-2, TS-3, TS-4, Jumlah
  const tableData = useMemo(() => {
    if (!selectedTahun || !availableYears.length) return [];

    if (showDeleted) {
      // Tampilkan HANYA data yang sudah soft delete
      const idxSelected = availableYears.findIndex(y => y.id === selectedTahun);
      const deletedRows = data.filter(item => item.deleted_at).map(item => {
        const idxTarget = availableYears.findIndex(y => parseInt(item.id_tahun_lulus) === y.id);
        const tsIdx = idxSelected - idxTarget;
        let tsLabel = (tsIdx >= 0 && tsIdx <= 4) ? (tsIdx === 0 ? "TS" : `TS-${tsIdx}`) : (availableYears[idxTarget]?.tahun || item.id_tahun_lulus);
        return {
          tahun_lulus: tsLabel,
          tahun_label: availableYears[idxTarget]?.tahun || item.id_tahun_lulus,
          jumlah_lulusan: item.jumlah_lulusan || "",
          jumlah_terlacak: item.jumlah_terlacak || "",
          jml_infokom: item.jml_infokom || "",
          jml_non_infokom: item.jml_non_infokom || "",
          jml_internasional: item.jml_internasional || "",
          jml_nasional: item.jml_nasional || "",
          jml_wirausaha: item.jml_wirausaha || "",
          data: item,
        };
      });
      // Baris jumlah hanya untuk deletedRows
      if (deletedRows.length > 0) {
        const fieldSum = f => deletedRows.reduce((acc, x) => acc + (parseInt(x[f]) || 0), 0);
        deletedRows.push({
          tahun_lulus: "Jumlah",
          tahun_label: "",
          jumlah_lulusan: fieldSum("jumlah_lulusan"),
          jumlah_terlacak: fieldSum("jumlah_terlacak"),
          jml_infokom: fieldSum("jml_infokom"),
          jml_non_infokom: fieldSum("jml_non_infokom"),
          jml_internasional: fieldSum("jml_internasional"),
          jml_nasional: fieldSum("jml_nasional"),
          jml_wirausaha: fieldSum("jml_wirausaha"),
          data: null,
        });
      }
      return deletedRows;
    }

    // Default: slot TS~TS-4, hanya data aktif
    const idxSelected = availableYears.findIndex(y => y.id === selectedTahun);
    const rows = [];
    for (let i = 0; i <= 4; i++) {
      const idxTarget = idxSelected - i;
      if (idxTarget < 0) continue;
      const yearMeta = availableYears[idxTarget];
      const dataItem = data.find(d => parseInt(d.id_tahun_lulus) === yearMeta.id && !d.deleted_at);
      rows.push({
        tahun_lulus: i === 0 ? "TS" : `TS-${i}`,
        tahun_label: yearMeta.tahun,
        jumlah_lulusan: dataItem?.jumlah_lulusan || "",
        jumlah_terlacak: dataItem?.jumlah_terlacak || "",
        jml_infokom: dataItem?.jml_infokom || "",
        jml_non_infokom: dataItem?.jml_non_infokom || "",
        jml_internasional: dataItem?.jml_internasional || "",
        jml_nasional: dataItem?.jml_nasional || "",
        jml_wirausaha: dataItem?.jml_wirausaha || "",
        data: dataItem || null,
      });
    }
    const fieldSum = f => rows.reduce((acc, x) => acc + (parseInt(x[f]) || 0), 0);
    rows.push({
      tahun_lulus: "Jumlah",
      tahun_label: "",
      jumlah_lulusan: fieldSum("jumlah_lulusan"),
      jumlah_terlacak: fieldSum("jumlah_terlacak"),
      jml_infokom: fieldSum("jml_infokom"),
      jml_non_infokom: fieldSum("jml_non_infokom"),
      jml_internasional: fieldSum("jml_internasional"),
      jml_nasional: fieldSum("jml_nasional"),
      jml_wirausaha: fieldSum("jml_wirausaha"),
      data: null
    });
    return rows;
  }, [data, selectedTahun, availableYears, showDeleted]);

  const handleAddClick = () => {
    setFormState({
      id_unit_prodi: authUser?.unit || "",
      id_tahun_lulus: selectedTahun || "",
      jumlah_lulusan: "",
      jumlah_terlacak: "",
      jml_infokom: "",
      jml_non_infokom: "",
      jml_internasional: "",
      jml_nasional: "",
      jml_wirausaha: ""
    });
    setEditing(null);
    setShowAddModal(true);
  };
  const handleEditClick = (item) => {
    setFormState({
      id_unit_prodi: item.id_unit_prodi,
      id_tahun_lulus: item.id_tahun_lulus,
      jumlah_lulusan: item.jumlah_lulusan,
      jumlah_terlacak: item.jumlah_terlacak,
      jml_infokom: item.jml_infokom,
      jml_non_infokom: item.jml_non_infokom,
      jml_internasional: item.jml_internasional,
      jml_nasional: item.jml_nasional,
      jml_wirausaha: item.jml_wirausaha
    });
    setEditing(item);
    setShowAddModal(true);
  };
  const handleDeleteClick = async (item) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });
    if (result.isConfirmed) {
      try {
        await apiFetch(`/tabel2b5-kesesuaian-kerja/${item.id}`, {method: "DELETE"});
        Swal.fire("Berhasil!", "Data berhasil dihapus", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  const doRestore = async (item) => {
    const result = await Swal.fire({
      title: 'Pulihkan Data?',
      text: "Data ini akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        const idField = getIdField(item);
        await apiFetch(`/tabel2b5-kesesuaian-kerja/${item?.[idField]}/restore`, { 
          method: "POST"
        });
        fetchData();
        Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
      } catch (error) {
        Swal.fire('Gagal!', `Gagal memulihkan data: ${error.message}`, 'error');
      }
    }
  };

  const doHardDelete = async (item) => {
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
        const idField = getIdField(item);
        await apiFetch(`/tabel2b5-kesesuaian-kerja/${item?.[idField]}/hard-delete`, { 
          method: "DELETE" 
        });
        fetchData();
        Swal.fire('Terhapus Permanen!', 'Data telah dihapus selamanya.', 'success');
      } catch (error) {
        Swal.fire('Gagal!', `Gagal menghapus permanen data: ${error.message}`, 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const submitData = {
        ...formState,
        id_unit_prodi: parseInt(formState.id_unit_prodi),
        id_tahun_lulus: parseInt(formState.id_tahun_lulus),
        jumlah_lulusan: parseInt(formState.jumlah_lulusan) || 0,
        jumlah_terlacak: parseInt(formState.jumlah_terlacak) || 0,
        jml_infokom: parseInt(formState.jml_infokom) || 0,
        jml_non_infokom: parseInt(formState.jml_non_infokom) || 0,
        jml_internasional: parseInt(formState.jml_internasional) || 0,
        jml_nasional: parseInt(formState.jml_nasional) || 0,
        jml_wirausaha: parseInt(formState.jml_wirausaha) || 0,
      };
      if (editing) {
        await apiFetch(`/tabel2b5-kesesuaian-kerja/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil diperbarui", "success");
      } else {
        await apiFetch("/tabel2b5-kesesuaian-kerja", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData)
        });
        Swal.fire("Berhasil!", "Data berhasil ditambahkan", "success");
      }
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
          <tr className="sticky top-0">
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Tahun Lulus</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Lulusan</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Lulusan yang Terlacak</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Profesi Kerja Bidang Infokom</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Profesi Kerja Bidang Non Infokom</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Multinasional / Internasional</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Nasional</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Wirausaha</th>
            <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tableData.map((row, idx) => (
            <tr key={idx} className={`transition-colors ${row.data && row.data.deleted_at ? "bg-red-100 text-red-800" : idx%2===0?"bg-white":"bg-slate-50"} hover:bg-[#eaf4ff]`}>
              <td className="px-6 py-4 text-slate-700 border border-slate-200 bg-gray-50 font-medium">{row.tahun_lulus}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jumlah_lulusan}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jumlah_terlacak}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jml_infokom}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jml_non_infokom}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jml_internasional}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jml_nasional}</td>
              <td className="px-6 py-4 text-slate-700 border border-slate-200">{row.jml_wirausaha}</td>
              <td className="px-6 py-4 border border-slate-200">
                {row.data && (
                  <div className="flex items-center justify-center dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : idx;
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
                      aria-expanded={openDropdownId === (getIdField(row.data) ? row.data[getIdField(row.data)] : idx)}
                    >
                      <FiMoreVertical size={18} />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {tableData.length === 0 && (
            <tr><td colSpan={9} className="px-6 py-16 text-center text-slate-500 border border-slate-200"><p className="font-medium">Data tidak ditemukan</p><p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p></td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const YearSelector = () => (
    <div className="flex items-center gap-2">
      <label htmlFor="filter-tahun" className="text-sm font-medium text-slate-700">Tahun:</label>
      <select
        id="filter-tahun"
        value={selectedTahun || ""}
        onChange={(e) => setSelectedTahun(e.target.value ? parseInt(e.target.value) : null)}
        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
        disabled={loading}
      >
        {availableYears.map(year => (
          <option key={year.id} value={year.id} className="text-slate-700">{year.tahun}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-10">
      {mapsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-600">Memuat data...</div>
        </div>
      )}
      <header className="pb-6 mb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">
          Tabel 2.B.5 Kesesuaian Bidang Kerja Lulusan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Data bidang profesi lulusan dan lingkup kerja (TS, TS-1, TS-2)
        </p>
      </header>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <YearSelector />
          {canDelete && (
            <button
              onClick={() => setShowDeleted(prev => !prev)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${showDeleted ? "bg-[#0384d6] text-white" : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"}`}
              disabled={loading}
            >
              {showDeleted ? "Sembunyikan Dihapus" : "Tampilkan yang Dihapus"}
            </button>
          )}
        </div>
        {canCreate && (
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            + Tambah Data
          </button>
        )}
      </div>
      {renderTable()}

      {/* Dropdown Menu - Fixed Position */}
      {openDropdownId !== null && (() => {
        const currentRow = tableData.find((row, idx) => {
          if (!row.data) return false;
          const rowId = getIdField(row.data) ? row.data[getIdField(row.data)] : idx;
          return rowId === openDropdownId;
        });
        if (!currentRow || !currentRow.data) return null;
        
        const isDeleted = currentRow.data.deleted_at;
        
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
                  handleEditClick(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                aria-label={`Edit data ${currentRow.tahun_lulus || 'kesesuaian kerja'}`}
              >
                <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                <span>Edit</span>
              </button>
            )}
            {!isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                aria-label={`Hapus data ${currentRow.tahun_lulus || 'kesesuaian kerja'}`}
              >
                <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                <span>Hapus</span>
              </button>
            )}
            {isDeleted && canUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doRestore(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                aria-label={`Pulihkan data ${currentRow.tahun_lulus || 'kesesuaian kerja'}`}
              >
                <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                <span>Pulihkan</span>
              </button>
            )}
            {isDeleted && canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  doHardDelete(currentRow.data);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                aria-label={`Hapus permanen data ${currentRow.tahun_lulus || 'kesesuaian kerja'}`}
              >
                <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                <span>Hapus Permanen</span>
              </button>
            )}
          </div>
        );
      })()}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editing ? "Edit Data Kesesuaian Kerja" : "Tambah Data Kesesuaian Kerja"}</h3>
              <p className="text-white/80 mt-1 text-sm">Lengkapi data terkait bidang kerja lulusan sesuai format tabel 2B.5</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_unit_prodi}
                      onChange={e => setFormState({ ...formState, id_unit_prodi: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Unit Prodi...</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Lulus <span className="text-red-500">*</span></label>
                    <select
                      value={formState.id_tahun_lulus}
                      onChange={e => setFormState({ ...formState, id_tahun_lulus: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    >
                      <option value="">Pilih Tahun Lulus...</option>
                      {availableYears.map(year => (
                        <option key={year.id} value={year.id}>{year.tahun}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Lulusan <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jumlah_lulusan}
                      onChange={e => setFormState({ ...formState, jumlah_lulusan: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Lulusan yang Terlacak <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jumlah_terlacak}
                      onChange={e => setFormState({ ...formState, jumlah_terlacak: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Profesi Kerja di Bidang Infokom <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jml_infokom}
                      onChange={e => setFormState({ ...formState, jml_infokom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Profesi Kerja di Bidang Non Infokom <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jml_non_infokom}
                      onChange={e => setFormState({ ...formState, jml_non_infokom: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Kerja Multinasional/Internasional <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jml_internasional}
                      onChange={e => setFormState({ ...formState, jml_internasional: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Kerja Nasional <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jml_nasional}
                      onChange={e => setFormState({ ...formState, jml_nasional: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Wirausaha <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={formState.jml_wirausaha}
                      onChange={e => setFormState({ ...formState, jml_wirausaha: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      Batal
                  </button>
                  <button 
                      type="submit" 
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={saving}
                  >
                      {saving ? "Menyimpan..." : (editing ? "Perbarui" : "Simpan")}
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

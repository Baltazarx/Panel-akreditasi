import React, { useEffect, useState } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';

export default function Tabel2A1({ role }) {
  const { maps, loading: mapsLoading } = useMaps(true);
  const tablePend = { key: "tabel_2a1_pendaftaran", label: "2.A.1 Pendaftaran", path: "/tabel2a1-pendaftaran" };
  const tableMaba = { key: "tabel_2a1_mahasiswa_baru_aktif", label: "2.A.1 Mahasiswa Baru & Aktif", path: "/tabel2a1-mahasiswa-baru-aktif" };

  const [rowsPend, setRowsPend] = useState([]);
  const [rowsMaba, setRowsMaba] = useState([]);
  const [rowsGabungan, setRowsGabungan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [showDeletedPend, setShowDeletedPend] = useState(false);
  const [showDeletedMaba, setShowDeletedMaba] = useState(false);
  const [selectedYearPend, setSelectedYearPend] = useState('');
  const [selectedYearMaba, setSelectedYearMaba] = useState('');
  
  // Selection states for bulk actions
  const [selectedRowsPend, setSelectedRowsPend] = useState([]);
  const [selectedRowsMaba, setSelectedRowsMaba] = useState([]);

  const [editingPend, setEditingPend] = useState(null);
  const [editingMaba, setEditingMaba] = useState(null);
  const [showModalPend, setShowModalPend] = useState(false);
  const [showModalMaba, setShowModalMaba] = useState(false);

  const [formPend, setFormPend] = useState({
    id_unit_prodi: "", id_tahun: "", daya_tampung: "", pendaftar: "", pendaftar_afirmasi: "", pendaftar_kebutuhan_khusus: ""
  });
  const [formMaba, setFormMaba] = useState({
    id_unit_prodi: "", id_tahun: "", jenis: "baru", jalur: "reguler", jumlah_total: "", jumlah_afirmasi: "", jumlah_kebutuhan_khusus: ""
  });

  const canCPend = roleCan(role, tablePend.key, "C");
  const canUPend = roleCan(role, tablePend.key, "U");
  const canDPend = roleCan(role, tablePend.key, "D");
  const canCMaba = roleCan(role, tableMaba.key, "C");
  const canUMaba = roleCan(role, tableMaba.key, "U");
  const canDMaba = roleCan(role, tableMaba.key, "D");
  

  const fetchPend = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (showDeletedPend) params.append("include_deleted", "1");
      if (selectedYearPend) params.append("id_tahun", selectedYearPend);
      const data = await apiFetch(`${tablePend.path}?${params}`);
      const filteredData = showDeletedPend
        ? data.filter((row) => row.deleted_at)
        : data.filter((row) => !row.deleted_at);
      const sortedData = filteredData.sort((a, b) => b.id - a.id);
      setRowsPend(Array.isArray(sortedData) ? sortedData : sortedData?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data pendaftaran");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMaba = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (showDeletedMaba) params.append("include_deleted", "1");
      if (selectedYearMaba) params.append("id_tahun", selectedYearMaba);
      const data = await apiFetch(`${tableMaba.path}?${params}`);
      const filteredData = showDeletedMaba
        ? data.filter((row) => row.deleted_at)
        : data.filter((row) => !row.deleted_at);
      const sortedData = filteredData.sort((a, b) => b.id - a.id);
      setRowsMaba(Array.isArray(sortedData) ? sortedData : sortedData?.items || []);
    } catch (e) {
      setError(e?.message || "Gagal memuat data mahasiswa baru/aktif");
    } finally {
      setLoading(false);
    }
  };

  const combineRows = (pendaftaran, mabaAktif) => {
    return pendaftaran.map((p) => {
      const matches = mabaAktif.filter(
        (m) => m.id_unit_prodi === p.id_unit_prodi && m.id_tahun === p.id_tahun
      );
      const jumlahBaru = matches.filter(m => m.jenis === "baru").reduce((s, m) => s + (m.jumlah_total || 0), 0);
      const jumlahAktif = matches.filter(m => m.jenis === "aktif").reduce((s, m) => s + (m.jumlah_total || 0), 0);
      return { ...p, maba_baru: jumlahBaru, maba_aktif: jumlahAktif };
    });
  };

  useEffect(() => { setRowsGabungan(combineRows(rowsPend, rowsMaba)); }, [rowsPend, rowsMaba]);
  useEffect(() => { 
    fetchPend(); 
    setSelectedRowsPend([]);
  }, [showDeletedPend, selectedYearPend]);
  useEffect(() => { 
    fetchMaba(); 
    setSelectedRowsMaba([]);
  }, [showDeletedMaba, selectedYearMaba]);

  // Helper functions untuk mendapatkan nama dari maps
  const getUnitName = (id) => {
    if (!id) return "-";
    
    // Convert to number untuk konsistensi
    const numId = parseInt(id);
    
    // Mapping untuk prodi TI dan MI
    if (numId === 1) return "Teknik Informatika (TI)"; // Legacy support
    if (numId === 4) return "Teknik Informatika (TI)";
    if (numId === 5) return "Manajemen Informatika (MI)";
    
    // Fallback ke maps jika ada
    if (maps?.unit_kerja && maps.unit_kerja[numId]) {
      return maps.unit_kerja[numId].nama_unit || `Unit ${numId}`;
    }
    
    return `Unit ${numId}`;
  };
  const getTahunName = (id) => {
    if (!maps?.tahun || !id) return id;
    return maps.tahun[id]?.tahun || id;
  };

  // Soft delete dengan SweetAlert2
  const doDelete = async (row, table) => {
    const result = await Swal.fire({
      title: 'Hapus Data?',
      text: "Data akan dipindahkan ke daftar item yang dihapus dan dapat dipulihkan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const idField = getIdField(row);
        const deleteUrl = `${table.path}/${row[idField]}`;
        const deleteBody = { 
          deleted_by: "Unknown User",
          deleted_at: new Date().toISOString()
        };
        console.log('Soft Delete Request:', { deleteUrl, deleteBody, idField, rowId: row[idField] });
        await apiFetch(deleteUrl, { 
          method: "DELETE",
          body: JSON.stringify(deleteBody)
        });
        console.log('Soft Delete Success, refreshing data...');
        table.key === tablePend.key ? fetchPend() : fetchMaba();
        Swal.fire('Dihapus!', 'Data telah dipindahkan ke daftar yang dihapus.', 'success');
      } catch (e) {
        console.error('Soft Delete Error:', e);
        Swal.fire('Gagal!', `Gagal menghapus data: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Hard delete dengan SweetAlert2
  const doHardDelete = async (row, table) => {
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
        const idField = getIdField(row);
        await apiFetch(`${table.path}/${row[idField]}/hard-delete`, { method: "DELETE" });
        table.key === tablePend.key ? fetchPend() : fetchMaba();
        Swal.fire('Terhapus!', 'Data telah dihapus secara permanen.', 'success');
      } catch (e) {
        console.error('Hard Delete Error:', e);
        Swal.fire('Gagal!', `Gagal menghapus permanen data: ${e.message}`, 'error');
      }
    }
  };

  // Restore single dengan SweetAlert2
  const doRestore = async (row, table) => {
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
        setLoading(true);
        const idField = getIdField(row);
        const restoreUrl = `${table.path}/${row[idField]}/restore`;
        const restoreBody = {
          restored_by: "Unknown User",
          restored_at: new Date().toISOString()
        };
        console.log('Restore Request:', { restoreUrl, restoreBody, idField, rowId: row[idField] });
        await apiFetch(restoreUrl, { 
          method: "POST",
          body: JSON.stringify(restoreBody)
        });
        console.log('Restore Success, refreshing data...');
        table.key === tablePend.key ? fetchPend() : fetchMaba();
        Swal.fire('Dipulihkan!', 'Data telah berhasil dipulihkan.', 'success');
      } catch (e) {
        console.error('Restore Error:', e);
        Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Bulk restore dengan SweetAlert2
  const doRestoreMultiple = async (table) => {
    const selectedRows = table.key === tablePend.key ? selectedRowsPend : selectedRowsMaba;
    console.log('doRestoreMultiple called:', { 
      tableKey: table.key, 
      selectedRows, 
      selectedRowsCount: selectedRows.length,
      selectedRowsPend,
      selectedRowsMaba
    });
    if (!selectedRows.length) {
      console.log('No rows selected for bulk restore');
      Swal.fire('Perhatian', 'Pilih setidaknya satu baris untuk dipulihkan.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: `Pulihkan ${selectedRows.length} Data?`,
      text: "Semua data yang dipilih akan dikembalikan ke daftar aktif.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, pulihkan!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await apiFetch(`${table.path}/restore-multiple`, {
          method: "POST",
          body: JSON.stringify({ 
            ids: selectedRows,
            restored_by: "Unknown User",
            restored_at: new Date().toISOString()
          }),
        });
        if (table.key === tablePend.key) {
          setSelectedRowsPend([]);
          fetchPend();
        } else {
          setSelectedRowsMaba([]);
          fetchMaba();
        }
        Swal.fire('Dipulihkan!', 'Data yang dipilih telah berhasil dipulihkan.', 'success');
      } catch (e) {
        Swal.fire('Gagal!', `Gagal memulihkan data: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (table, checked) => {
    const rows = table.key === tablePend.key ? rowsPend : rowsMaba;
    if (checked) {
      // Hanya select data yang sedang tampil (sudah dihapus jika showDeleted)
      const ids = rows.map(row => getIdField(row) ? row[getIdField(row)] : row.id);
      if (table.key === tablePend.key) {
        setSelectedRowsPend(ids);
      } else {
        setSelectedRowsMaba(ids);
      }
    } else {
      if (table.key === tablePend.key) {
        setSelectedRowsPend([]);
      } else {
        setSelectedRowsMaba([]);
      }
    }
  };

  const submitPend = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const target = editingPend ? `${tablePend.path}/${editingPend[getIdField(editingPend)]}` : tablePend.path;
      const method = editingPend ? "PUT" : "POST";
      const body = {
        ...formPend,
        created_by: "Unknown User",
        created_at: new Date().toISOString(),
        updated_by: "Unknown User",
        updated_at: new Date().toISOString()
      };
      console.log('Submitting Pendaftaran:', { target, method, body });
      console.log('Unit Prodi value:', formPend.id_unit_prodi);
      const response = await apiFetch(target, { method, body: JSON.stringify(body) });
      console.log('API Response:', response);
      setShowModalPend(false); 
      setEditingPend(null);
      // Reset form setelah update/create berhasil
      setFormPend({
        id_unit_prodi: "", id_tahun: "", daya_tampung: "", pendaftar: "", pendaftar_afirmasi: "", pendaftar_kebutuhan_khusus: ""
      });
      fetchPend();
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil!', 
        text: editingPend ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.', 
        timer: 1500, 
        showConfirmButton: false 
      });
    } catch (e) {
      Swal.fire({ 
        icon: 'error', 
        title: editingPend ? 'Gagal Memperbarui Data' : 'Gagal Menambah Data', 
        text: e.message 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitMaba = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const target = editingMaba ? `${tableMaba.path}/${editingMaba[getIdField(editingMaba)]}` : tableMaba.path;
      const method = editingMaba ? "PUT" : "POST";
      const body = {
        ...formMaba,
        created_by: "Unknown User",
        created_at: new Date().toISOString(),
        updated_by: "Unknown User",
        updated_at: new Date().toISOString()
      };
      console.log('Submitting Maba:', { target, method, body });
      console.log('Unit Prodi value:', formMaba.id_unit_prodi);
      const response = await apiFetch(target, { method, body: JSON.stringify(body) });
      console.log('API Response:', response);
      setShowModalMaba(false); 
      setEditingMaba(null);
      // Reset form setelah update/create berhasil
      setFormMaba({
        id_unit_prodi: "", id_tahun: "", jenis: "baru", jalur: "reguler", jumlah_total: "", jumlah_afirmasi: "", jumlah_kebutuhan_khusus: ""
      });
      fetchMaba();
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil!', 
        text: editingMaba ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.', 
        timer: 1500, 
        showConfirmButton: false 
      });
    } catch (e) {
      Swal.fire({ 
        icon: 'error', 
        title: editingMaba ? 'Gagal Memperbarui Data' : 'Gagal Menambah Data', 
        text: e.message 
      });
    } finally {
      setLoading(false);
    }
  };

  // Year Selector Component
  const YearSelector = ({ selectedYear, setSelectedYear, label }) => (
    <div className="flex items-center gap-2">
      <label htmlFor={`filter-tahun-${label}`} className="text-sm font-medium text-slate-700">{label}:</label>
      <select
        id={`filter-tahun-${label}`}
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
        disabled={loading}
      >
        <option value="" disabled>Pilih Tahun</option>
        {maps?.tahun && Object.values(maps.tahun).map((y) => (
          <option key={y.id_tahun} value={y.id_tahun} className="text-slate-700">{y.tahun}</option>
        ))}
      </select>
    </div>
  );

  const renderTable = (rows, headers, keys, table, canUpdate, canDelete, setEditing, setForm, setShowModal, showDeleted) => {
    const selectedRows = table.key === tablePend.key ? selectedRowsPend : selectedRowsMaba;
    const setSelectedRows = table.key === tablePend.key ? setSelectedRowsPend : setSelectedRowsMaba;
    const isAllSelected = rows.length > 0 && rows.every(row => selectedRows.includes(row[getIdField(row)]));
    
    console.log('renderTable:', { 
      tableKey: table.key, 
      rowsCount: rows.length, 
      selectedRows, 
      selectedRowsCount: selectedRows.length,
      isAllSelected,
      showDeleted
    });

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
                    onChange={(e) => handleSelectAll(table, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                  />
                </th>
              )}
              {headers.map((h,i) => (
                <th key={i} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">{h}</th>
              ))}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((r,i) => {
              const isSelected = selectedRows.includes(r[getIdField(r)]);
              return (
                <tr key={i} className={`transition-colors ${i%2===0?"bg-white":"bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  {showDeleted && (
                    <td className="px-6 py-4 text-center border border-slate-200">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const idField = getIdField(r);
                          const id = r[idField];
                          console.log('Individual checkbox change:', { 
                            tableKey: table.key, 
                            row: r, 
                            idField, 
                            id, 
                            checked: e.target.checked,
                            currentSelectedRows: selectedRows
                          });
                          if (e.target.checked) {
                            const newSelectedRows = [...selectedRows, id];
                            console.log('Adding to selected rows:', newSelectedRows);
                            setSelectedRows(newSelectedRows);
                          } else {
                            const newSelectedRows = selectedRows.filter(rowId => rowId !== id);
                            console.log('Removing from selected rows:', newSelectedRows);
                            setSelectedRows(newSelectedRows);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                      />
                    </td>
                  )}
                  {keys.map((k,j) => {
                    let displayValue = r[k];
                    if (k === 'id_unit_prodi') displayValue = getUnitName(r[k]);
                    if (k === 'id_tahun') displayValue = getTahunName(r[k]);
                    return (
                      <td key={j} className="px-6 py-4 text-slate-700 border border-slate-200">{displayValue}</td>
                    );
                  })}
                  <td className="px-6 py-4 text-center border border-slate-200">
                    <div className="flex items-center justify-center gap-2">
                      {!showDeleted && canUpdate && (
                        <button onClick={()=>{
                          console.log('Edit clicked:', r);
                          setEditing(r);
                          setForm(r);
                          setShowModal(true);
                        }} className="font-medium text-[#0384d6] hover:underline">
                          Edit
                        </button>
                      )}
                      {!showDeleted && canDelete && (
                        <button onClick={()=>doDelete(r,table)} className="font-medium text-red-600 hover:underline">
                          Hapus
                        </button>
                      )}
                      {showDeleted && canUpdate && (
                        <button onClick={()=>doRestore(r,table)} className="font-medium text-green-600 hover:underline">
                          Pulihkan
                        </button>
                      )}
                      {showDeleted && canDelete && (
                        <button onClick={()=>doHardDelete(r,table)} className="font-medium text-red-800 hover:underline">
                          Hapus Permanen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length + (showDeleted ? 2 : 1)} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                  <p className="font-medium">Data tidak ditemukan</p>
                  <p className="text-sm">Belum ada data yang ditambahkan atau data yang cocok dengan filter.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-[#fff6cc] rounded-2xl shadow-xl space-y-10">
      
      {/* Loading State */}
      {mapsLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-slate-600">Memuat data...</div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Pendaftaran */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tablePend.label}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola data daya tampung dan jumlah pendaftar per tahun akademik.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-600 font-medium">
                Total Data: <span className="text-[#0384d6] font-bold">{rowsPend.length}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <YearSelector 
              selectedYear={selectedYearPend} 
              setSelectedYear={setSelectedYearPend} 
              label="Tahun" 
            />
            
            {canDPend && (
              <button
                onClick={() => setShowDeletedPend((prev) => !prev)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  showDeletedPend
                    ? "bg-[#0384d6] text-white"
                    : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
                }`}
                disabled={loading}
              >
                {showDeletedPend ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
              </button>
            )}
            {canUPend && showDeletedPend && selectedRowsPend.length > 0 && (
              <button
                onClick={() => doRestoreMultiple(tablePend)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Pulihkan ({selectedRowsPend.length})
              </button>
            )}
            
          </div>
          
          {canCPend && (
            <button
              onClick={() => setShowModalPend(true)}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              + Tambah Data
            </button>
          )}
        </div>

        {renderTable(rowsPend,
          ["Unit Prodi","Tahun","Daya Tampung","Pendaftar","Afirmasi","Kebutuhan Khusus"],
          ["id_unit_prodi","id_tahun","daya_tampung","pendaftar","pendaftar_afirmasi","pendaftar_kebutuhan_khusus"],
          tablePend,canUPend,canDPend,setEditingPend,setFormPend,setShowModalPend,showDeletedPend)}
      </section>

      {/* Mahasiswa Baru & Aktif */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tableMaba.label}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola data mahasiswa baru dan aktif per tahun akademik.
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-slate-600 font-medium">
                Total Data: <span className="text-[#0384d6] font-bold">{rowsMaba.length}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <YearSelector 
              selectedYear={selectedYearMaba} 
              setSelectedYear={setSelectedYearMaba} 
              label="Tahun" 
            />
            
            {canDMaba && (
              <button
                onClick={() => setShowDeletedMaba((prev) => !prev)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  showDeletedMaba
                    ? "bg-[#0384d6] text-white"
                    : "bg-[#eaf3ff] text-[#043975] hover:bg-[#d9ecff]"
                }`}
                disabled={loading}
              >
                {showDeletedMaba ? "Sembunyikan Dihapus" : "Tampilkan Dihapus"}
              </button>
            )}
            {canUMaba && showDeletedMaba && selectedRowsMaba.length > 0 && (
              <button
                onClick={() => doRestoreMultiple(tableMaba)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Pulihkan ({selectedRowsMaba.length})
              </button>
            )}
            
          </div>
          
          {canCMaba && (
            <button
              onClick={() => setShowModalMaba(true)}
              className="px-4 py-2 bg-[#0384d6] text-white font-semibold rounded-lg shadow-md hover:bg-[#043975] focus:outline-none focus:ring-2 focus:ring-[#0384d6]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              + Tambah Data
            </button>
          )}
        </div>

        {renderTable(rowsMaba,
          ["Unit Prodi","Tahun","Jenis","Jalur","Jumlah Total","Afirmasi","Kebutuhan Khusus"],
          ["id_unit_prodi","id_tahun","jenis","jalur","jumlah_total","jumlah_afirmasi","jumlah_kebutuhan_khusus"],
          tableMaba,canUMaba,canDMaba,setEditingMaba,setFormMaba,setShowModalMaba,showDeletedMaba)}
      </section>

      {/* Gabungan */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Gabungan Pendaftaran + Mahasiswa Baru/Aktif</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tabel hasil gabungan pendaftaran dan mahasiswa baru/aktif per tahun akademik.
          </p>
        </header>
        {renderTable(rowsGabungan,
          ["Unit Prodi","Tahun","Pendaftar","Mahasiswa Baru","Mahasiswa Aktif"],
          ["id_unit_prodi","id_tahun","pendaftar","maba_baru","maba_aktif"],
          {key:"gabungan"},false,false,()=>{},()=>{},()=>{},false)}
      </section>

      {/* Modal Form Pendaftaran */}
      {showModalPend && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editingPend?"Edit Pendaftaran":"Tambah Pendaftaran"}</h3>
              <p className="text-white/80 mt-1 text-sm">Isi formulir daya tampung & pendaftar per tahun.</p>
            </div>
            <div className="p-8">
              <form onSubmit={submitPend} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formPend.id_unit_prodi} onChange={e=>setFormPend({...formPend,id_unit_prodi:e.target.value})} required>
                      <option value="">Pilih Unit Prodi...</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                      {maps?.unit_kerja && Object.values(maps.unit_kerja).map((u) => (
                        <option key={u.id_unit} value={u.id_unit}>{u.nama_unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Akademik <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formPend.id_tahun} onChange={e=>setFormPend({...formPend,id_tahun:e.target.value})} required>
                      <option value="">Pilih Tahun...</option>
                      {maps?.tahun && Object.values(maps.tahun).map((y) => (
                        <option key={y.id_tahun} value={y.id_tahun}>{y.tahun}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Daya Tampung <span className="text-red-500">*</span></label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formPend.daya_tampung} onChange={e=>setFormPend({...formPend,daya_tampung:e.target.value})} required />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Pendaftar <span className="text-red-500">*</span></label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formPend.pendaftar} onChange={e=>setFormPend({...formPend,pendaftar:e.target.value})} required />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pendaftar Afirmasi</label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formPend.pendaftar_afirmasi} onChange={e=>setFormPend({...formPend,pendaftar_afirmasi:e.target.value})} />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Pendaftar Kebutuhan Khusus</label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formPend.pendaftar_kebutuhan_khusus} onChange={e=>setFormPend({...formPend,pendaftar_kebutuhan_khusus:e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={()=>setShowModalPend(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white">{loading?"Menyimpan...":"Simpan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Maba */}
      {showModalMaba && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4">
            <div className="px-8 py-6 rounded-t-2xl bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
              <h3 className="text-xl font-bold">{editingMaba?"Edit Mahasiswa Baru/Aktif":"Tambah Mahasiswa Baru/Aktif"}</h3>
              <p className="text-white/80 mt-1 text-sm">Isi formulir jumlah mahasiswa berdasarkan jenis dan tahun.</p>
            </div>
            <div className="p-8">
              <form onSubmit={submitMaba} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Unit Prodi <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formMaba.id_unit_prodi} onChange={e=>setFormMaba({...formMaba,id_unit_prodi:e.target.value})} required>
                      <option value="">Pilih Unit Prodi...</option>
                      <option value="4">Teknik Informatika (TI)</option>
                      <option value="5">Manajemen Informatika (MI)</option>
                      {maps?.unit_kerja && Object.values(maps.unit_kerja).map((u) => (
                        <option key={u.id_unit} value={u.id_unit}>{u.nama_unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Tahun Akademik <span className="text-red-500">*</span></label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formMaba.id_tahun} onChange={e=>setFormMaba({...formMaba,id_tahun:e.target.value})} required>
                      <option value="">Pilih Tahun...</option>
                      {maps?.tahun && Object.values(maps.tahun).map((y) => (
                        <option key={y.id_tahun} value={y.id_tahun}>{y.tahun}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jenis Mahasiswa</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formMaba.jenis} onChange={e=>setFormMaba({...formMaba,jenis:e.target.value})}>
                      <option value="baru">Baru</option>
                      <option value="aktif">Aktif</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jalur</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white" value={formMaba.jalur} onChange={e=>setFormMaba({...formMaba,jalur:e.target.value})}>
                      <option value="reguler">Reguler</option>
                      <option value="rpl">RPL</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Total <span className="text-red-500">*</span></label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formMaba.jumlah_total} onChange={e=>setFormMaba({...formMaba,jumlah_total:e.target.value})} required />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Afirmasi</label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formMaba.jumlah_afirmasi} onChange={e=>setFormMaba({...formMaba,jumlah_afirmasi:e.target.value})} />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Jumlah Kebutuhan Khusus</label>
                    <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]" value={formMaba.jumlah_kebutuhan_khusus} onChange={e=>setFormMaba({...formMaba,jumlah_kebutuhan_khusus:e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={()=>setShowModalMaba(false)} className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">Batal</button>
                  <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#0384d6] hover:bg-[#043975] text-white">{loading?"Menyimpan...":"Simpan"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

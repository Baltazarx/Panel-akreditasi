import React, { useEffect, useState, useRef } from "react";
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
  const [selectedUnitProdi, setSelectedUnitProdi] = useState('4'); // Default TI
  
  // Flag untuk memastikan tahun default hanya di-set sekali
  const hasSetDefaultYear = useRef(false);
  
  // Selection states for bulk actions
  const [selectedRowsPend, setSelectedRowsPend] = useState([]);
  const [selectedRowsMaba, setSelectedRowsMaba] = useState([]);

  const [editingPend, setEditingPend] = useState(null);
  const [editingMaba, setEditingMaba] = useState(null);
  const [showModalPend, setShowModalPend] = useState(false);
  const [showModalMaba, setShowModalMaba] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModalPend || showModalMaba) {
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
  }, [showModalPend, showModalMaba]);

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
      
      // Jika ada filter tahun, ambil data untuk TS, TS-1, TS-2, TS-3
      if (selectedYearPend && maps?.tahun) {
        const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
        const currentYearId = parseInt(selectedYearPend);
        const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
        
        if (currentYearIndex !== -1) {
          // Ambil ID tahun untuk TS, TS-1, TS-2, TS-3
          const yearIds = [];
          for (let i = 0; i <= 3; i++) {
            const yearIndex = currentYearIndex - i;
            if (yearIndex >= 0 && yearIndex < tahunList.length) {
              yearIds.push(tahunList[yearIndex].id_tahun);
            }
          }
          
          if (yearIds.length > 0) {
            params.append("id_tahun_in", yearIds.join(','));
          }
        }
      }
      
      // Handle showDeleted
      if (showDeletedPend) {
        params.append("include_deleted", "1");
      }
      
      const data = await apiFetch(`${tablePend.path}?${params}`);
      
      // Backend sudah melakukan filtering, jadi langsung gunakan data
      const sortedData = Array.isArray(data) ? data : (data?.items || []);
      sortedData.sort((a, b) => {
        // Sort by tahun (descending) lalu by id (descending)
        if (a.id_tahun !== b.id_tahun) {
          return b.id_tahun - a.id_tahun;
        }
        return b.id - a.id;
      });
      
      setRowsPend(sortedData);
    } catch (e) {
      setError(e?.message || "Gagal memuat data pendaftaran");
      setRowsPend([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMaba = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      
      // Jika ada filter tahun, ambil data untuk TS, TS-1, TS-2, TS-3
      if (selectedYearMaba && maps?.tahun) {
        const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
        const currentYearId = parseInt(selectedYearMaba);
        const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
        
        if (currentYearIndex !== -1) {
          // Ambil ID tahun untuk TS, TS-1, TS-2, TS-3
          const yearIds = [];
          for (let i = 0; i <= 3; i++) {
            const yearIndex = currentYearIndex - i;
            if (yearIndex >= 0 && yearIndex < tahunList.length) {
              yearIds.push(tahunList[yearIndex].id_tahun);
            }
          }
          
          if (yearIds.length > 0) {
            params.append("id_tahun_in", yearIds.join(','));
          }
        }
      }
      
      // Handle showDeleted
      if (showDeletedMaba) {
        params.append("include_deleted", "1");
      }
      
      const data = await apiFetch(`${tableMaba.path}?${params}`);
      
      // Backend sudah melakukan filtering, jadi langsung gunakan data
      const sortedData = Array.isArray(data) ? data : (data?.items || []);
      sortedData.sort((a, b) => {
        // Sort by tahun (descending) lalu by id (descending)
        if (a.id_tahun !== b.id_tahun) {
          return b.id_tahun - a.id_tahun;
        }
        return b.id - a.id;
      });
      
      setRowsMaba(sortedData);
    } catch (e) {
      setError(e?.message || "Gagal memuat data mahasiswa baru/aktif");
      setRowsMaba([]);
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

  // Fungsi untuk memproses data menjadi format TS-3, TS-2, TS-1, TS
  const processDataForTable = (unitProdiId) => {
    if (!selectedYearPend || !maps?.tahun) return [];

    const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
    const currentYearId = parseInt(selectedYearPend);
    const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
    
    if (currentYearIndex === -1) return [];

    const result = [];
    
    // TS, TS-1, TS-2, TS-3
    for (let i = 0; i <= 3; i++) {
      const yearIndex = currentYearIndex - i;
      if (yearIndex < 0 || yearIndex >= tahunList.length) {
        result.push({
          ts: i === 0 ? 'TS' : `TS-${i}`,
          tahun: null,
          tahunId: null,
          dayaTampung: 0,
          pendaftar: 0,
          pendaftarAfirmasi: 0,
          pendaftarKebutuhanKhusus: 0,
          baruRegulerDiterima: 0,
          baruRegulerAfirmasi: 0,
          baruRegulerKebutuhanKhusus: 0,
          baruRPLDiterima: 0,
          baruRPLAfirmasi: 0,
          baruRPLKebutuhanKhusus: 0,
          aktifRegulerDiterima: 0,
          aktifRegulerAfirmasi: 0,
          aktifRegulerKebutuhanKhusus: 0,
          aktifRPLDiterima: 0,
          aktifRPLAfirmasi: 0,
          aktifRPLKebutuhanKhusus: 0,
        });
        continue;
      }

      const year = tahunList[yearIndex];
      const yearId = year.id_tahun;

      // Data pendaftaran
      const pendData = rowsPend.find(p => 
        p.id_unit_prodi === unitProdiId && 
        p.id_tahun === yearId && 
        !p.deleted_at
      );

      // Data mahasiswa baru dan aktif
      const mabaData = rowsMaba.filter(m => 
        m.id_unit_prodi === unitProdiId && 
        m.id_tahun === yearId && 
        !m.deleted_at
      );

      // Proses data mahasiswa baru
      const baruReguler = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'reguler');
      const baruRPL = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'rpl');
      
      // Proses data mahasiswa aktif
      const aktifReguler = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'reguler');
      const aktifRPL = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'rpl');

      result.push({
        ts: i === 0 ? 'TS' : `TS-${i}`,
        tahun: year.tahun,
        tahunId: yearId,
        dayaTampung: pendData?.daya_tampung || 0,
        pendaftar: pendData?.pendaftar || 0,
        pendaftarAfirmasi: pendData?.pendaftar_afirmasi || 0,
        pendaftarKebutuhanKhusus: pendData?.pendaftar_kebutuhan_khusus || 0,
        baruRegulerDiterima: baruReguler?.jumlah_total || 0,
        baruRegulerAfirmasi: baruReguler?.jumlah_afirmasi || 0,
        baruRegulerKebutuhanKhusus: baruReguler?.jumlah_kebutuhan_khusus || 0,
        baruRPLDiterima: baruRPL?.jumlah_total || 0,
        baruRPLAfirmasi: baruRPL?.jumlah_afirmasi || 0,
        baruRPLKebutuhanKhusus: baruRPL?.jumlah_kebutuhan_khusus || 0,
        aktifRegulerDiterima: aktifReguler?.jumlah_total || 0,
        aktifRegulerAfirmasi: aktifReguler?.jumlah_afirmasi || 0,
        aktifRegulerKebutuhanKhusus: aktifReguler?.jumlah_kebutuhan_khusus || 0,
        aktifRPLDiterima: aktifRPL?.jumlah_total || 0,
        aktifRPLAfirmasi: aktifRPL?.jumlah_afirmasi || 0,
        aktifRPLKebutuhanKhusus: aktifRPL?.jumlah_kebutuhan_khusus || 0,
      });
    }

    // Tambahkan baris Jumlah
    const jumlah = result.reduce((acc, row) => {
      acc.dayaTampung += row.dayaTampung;
      acc.pendaftar += row.pendaftar;
      acc.pendaftarAfirmasi += row.pendaftarAfirmasi;
      acc.pendaftarKebutuhanKhusus += row.pendaftarKebutuhanKhusus;
      acc.baruRegulerDiterima += row.baruRegulerDiterima;
      acc.baruRegulerAfirmasi += row.baruRegulerAfirmasi;
      acc.baruRegulerKebutuhanKhusus += row.baruRegulerKebutuhanKhusus;
      acc.baruRPLDiterima += row.baruRPLDiterima;
      acc.baruRPLAfirmasi += row.baruRPLAfirmasi;
      acc.baruRPLKebutuhanKhusus += row.baruRPLKebutuhanKhusus;
      acc.aktifRegulerDiterima += row.aktifRegulerDiterima;
      acc.aktifRegulerAfirmasi += row.aktifRegulerAfirmasi;
      acc.aktifRegulerKebutuhanKhusus += row.aktifRegulerKebutuhanKhusus;
      acc.aktifRPLDiterima += row.aktifRPLDiterima;
      acc.aktifRPLAfirmasi += row.aktifRPLAfirmasi;
      acc.aktifRPLKebutuhanKhusus += row.aktifRPLKebutuhanKhusus;
      return acc;
    }, {
      ts: 'Jumlah',
      tahun: '',
      tahunId: null,
      dayaTampung: 0,
      pendaftar: 0,
      pendaftarAfirmasi: 0,
      pendaftarKebutuhanKhusus: 0,
      baruRegulerDiterima: 0,
      baruRegulerAfirmasi: 0,
      baruRegulerKebutuhanKhusus: 0,
      baruRPLDiterima: 0,
      baruRPLAfirmasi: 0,
      baruRPLKebutuhanKhusus: 0,
      aktifRegulerDiterima: 0,
      aktifRegulerAfirmasi: 0,
      aktifRegulerKebutuhanKhusus: 0,
      aktifRPLDiterima: 0,
      aktifRPLAfirmasi: 0,
      aktifRPLKebutuhanKhusus: 0,
    });

    return [...result, jumlah];
  };
  
  // Set default tahun saat pertama kali maps dimuat berdasarkan tahun sistem
  useEffect(() => {
    if (!mapsLoading && maps?.tahun && Object.keys(maps.tahun).length > 0 && !hasSetDefaultYear.current) {
      // Deteksi tahun saat ini dari sistem
      const currentYear = new Date().getFullYear();
      
      // Cari tahun yang sesuai dengan tahun sistem dari maps.tahun
      const tahunList = Object.values(maps.tahun);
      if (tahunList.length > 0) {
        // Cari tahun yang mengandung tahun saat ini (misal: "2024/2025" mengandung 2024)
        let tahunTerpilih = null;
        
        // Prioritas 1: Cari tahun yang persis sama dengan tahun saat ini
        tahunTerpilih = tahunList.find(t => {
          const tahunStr = String(t.tahun || '');
          return tahunStr.includes(String(currentYear));
        });
        
        // Prioritas 2: Jika tidak ditemukan, cari tahun terdekat (tahun akademik yang mengandung tahun saat ini atau tahun sebelumnya)
        if (!tahunTerpilih) {
          tahunTerpilih = tahunList.find(t => {
            const tahunStr = String(t.tahun || '');
            const tahunInt = parseInt(tahunStr.split('/')[0]) || 0;
            return tahunInt >= currentYear - 1 && tahunInt <= currentYear;
          });
        }
        
        // Prioritas 3: Jika masih tidak ditemukan, gunakan tahun terbaru berdasarkan id_tahun
        if (!tahunTerpilih) {
          tahunTerpilih = tahunList.reduce((latest, current) => 
            (Number(current.id_tahun) > Number(latest.id_tahun)) ? current : latest
          );
        }
        
        if (tahunTerpilih) {
          setSelectedYearPend(String(tahunTerpilih.id_tahun));
          setSelectedYearMaba(String(tahunTerpilih.id_tahun));
          hasSetDefaultYear.current = true;
        }
      }
    }
  }, [mapsLoading, maps?.tahun]);
  
  useEffect(() => { 
    if (!mapsLoading && maps?.tahun) {
      fetchPend(); 
      setSelectedRowsPend([]);
    }
  }, [showDeletedPend, selectedYearPend, mapsLoading, maps?.tahun]);
  
  useEffect(() => { 
    if (!mapsLoading && maps?.tahun) {
      fetchMaba(); 
      setSelectedRowsMaba([]);
    }
  }, [showDeletedMaba, selectedYearMaba, mapsLoading, maps?.tahun]);

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

  // Fungsi render khusus untuk tabel Pendaftaran dengan struktur header kompleks
  const renderTablePendaftaran = () => {
    const selectedRows = selectedRowsPend;
    const setSelectedRows = setSelectedRowsPend;
    const rows = rowsPend;
    const showDeleted = showDeletedPend;
    const isAllSelected = rows.length > 0 && rows.every(row => selectedRows.includes(row[getIdField(row)]));
    
    // Proses data untuk ditampilkan per TS jika selectedYearPend ada
    let displayRows = [];
    if (selectedYearPend && maps?.tahun) {
      const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
      const currentYearId = parseInt(selectedYearPend);
      const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
      
      if (currentYearIndex !== -1) {
        // TS, TS-1, TS-2, TS-3
        for (let i = 0; i <= 3; i++) {
          const yearIndex = currentYearIndex - i;
          if (yearIndex < 0 || yearIndex >= tahunList.length) {
            displayRows.push({
              ts: i === 0 ? 'TS' : `TS-${i}`,
              tahun: null,
              tahunId: null,
              tahunName: '',
              pendaftar: '',
              pendaftarAfirmasi: '',
              pendaftarKebutuhanKhusus: '',
              rowData: null
            });
            continue;
          }

          const year = tahunList[yearIndex];
          const yearId = year.id_tahun;
          
          // Cari data pendaftaran untuk semua unit prodi atau unit prodi tertentu
          // Jika showDeleted aktif, ambil yang deleted_at, jika tidak ambil yang tidak deleted
          const pendData = rows.find(p => {
            const matchesYear = p.id_tahun === yearId;
            if (showDeleted) {
              return matchesYear && p.deleted_at;
            } else {
              return matchesYear && !p.deleted_at;
            }
          });
          
          displayRows.push({
            ts: i === 0 ? 'TS' : `TS-${i}`,
            tahun: year.tahun,
            tahunId: yearId,
            tahunName: year.tahun,
            pendaftar: pendData?.pendaftar || '',
            pendaftarAfirmasi: pendData?.pendaftar_afirmasi || '',
            pendaftarKebutuhanKhusus: pendData?.pendaftar_kebutuhan_khusus || '',
            rowData: pendData
          });
        }
      }
    } else {
      // Jika tidak ada filter tahun, tampilkan semua data
      // Filter berdasarkan showDeleted
      const filteredRows = rows.filter(row => {
        if (showDeleted) {
          return row.deleted_at;
        } else {
          return !row.deleted_at;
        }
      });
      
      displayRows = filteredRows.map(row => ({
        ts: getTahunName(row.id_tahun),
        tahun: row.id_tahun,
        tahunId: row.id_tahun,
        tahunName: getTahunName(row.id_tahun),
        pendaftar: row.pendaftar || '',
        pendaftarAfirmasi: row.pendaftar_afirmasi || '',
        pendaftarKebutuhanKhusus: row.pendaftar_kebutuhan_khusus || '',
        rowData: row
      }));
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            {/* Row 1: Header utama */}
            <tr className="sticky top-0">
              {showDeleted && (
                <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(tablePend, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                  />
                </th>
              )}
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                TAHUN
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                TS
              </th>
              <th colSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                JUMLAH CALON MAHASISWA
              </th>
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
              </th>
            </tr>
            {/* Row 2: Sub-header */}
            <tr className="sticky top-0">
              {/* TAHUN, TS, dan AKSI sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                PENDAFTAR
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                PENDAFTAR AFIRMASI
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                PENDAFTAR KEBUTUHAN KHUSUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayRows.map((row, idx) => {
              const isSelected = row.rowData && selectedRows.includes(row.rowData[getIdField(row.rowData)]);
              return (
                <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  {showDeleted && (
                    <td className="px-6 py-4 text-center border border-slate-200">
                      {row.rowData && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const idField = getIdField(row.rowData);
                            const id = row.rowData[idField];
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, id]);
                            } else {
                              setSelectedRows(selectedRows.filter(rowId => rowId !== id));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center font-medium">
                    {row.tahunName || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center font-medium whitespace-nowrap">
                    {row.ts}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.pendaftar || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.pendaftarAfirmasi || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.pendaftarKebutuhanKhusus || '-'}
                  </td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    {row.rowData && (
                      <div className="flex items-center justify-center gap-2">
                        {!showDeleted && canUPend && (
                          <button
                            onClick={() => {
                              setEditingPend(row.rowData);
                              setFormPend(row.rowData);
                              setShowModalPend(true);
                            }}
                            className="font-medium text-[#0384d6] hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {!showDeleted && canDPend && (
                          <button
                            onClick={() => doDelete(row.rowData, tablePend)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                        {showDeleted && canUPend && (
                          <button
                            onClick={() => doRestore(row.rowData, tablePend)}
                            className="font-medium text-green-600 hover:underline"
                          >
                            Pulihkan
                          </button>
                        )}
                        {showDeleted && canDPend && (
                          <button
                            onClick={() => doHardDelete(row.rowData, tablePend)}
                            className="font-medium text-red-800 hover:underline"
                          >
                            Hapus Permanen
                          </button>
                        )}
                      </div>
                    )}
                    {row.rowData && row.rowData.deleted_at && (
                      <div className="italic text-slate-500">Dihapus</div>
                    )}
                  </td>
                </tr>
              );
            })}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 7 : 6} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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

  // Fungsi render khusus untuk tabel Mahasiswa Baru & Aktif dengan struktur header kompleks
  const renderTableMaba = () => {
    const selectedRows = selectedRowsMaba;
    const setSelectedRows = setSelectedRowsMaba;
    const rows = rowsMaba;
    const showDeleted = showDeletedMaba;
    const isAllSelected = rows.length > 0 && rows.every(row => selectedRows.includes(row[getIdField(row)]));
    
    // Proses data untuk ditampilkan per TS jika selectedYearMaba ada
    let displayRows = [];
    if (selectedYearMaba && maps?.tahun) {
      const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
      const currentYearId = parseInt(selectedYearMaba);
      const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
      
      if (currentYearIndex !== -1) {
        // TS, TS-1, TS-2, TS-3
        for (let i = 0; i <= 3; i++) {
          const yearIndex = currentYearIndex - i;
          if (yearIndex < 0 || yearIndex >= tahunList.length) {
            displayRows.push({
              ts: i === 0 ? 'TS' : `TS-${i}`,
              tahun: null,
              tahunId: null,
              tahunName: '',
              baruRegulerDiterima: '',
              baruRegulerAfirmasi: '',
              baruRegulerKebutuhanKhusus: '',
              baruRPLDiterima: '',
              baruRPLAfirmasi: '',
              baruRPLKebutuhanKhusus: '',
              aktifRegulerDiterima: '',
              aktifRegulerAfirmasi: '',
              aktifRegulerKebutuhanKhusus: '',
              aktifRPLDiterima: '',
              aktifRPLAfirmasi: '',
              aktifRPLKebutuhanKhusus: '',
              rowData: []
            });
            continue;
          }

          const year = tahunList[yearIndex];
          const yearId = year.id_tahun;
          
          // Cari data mahasiswa baru dan aktif untuk semua unit prodi atau unit prodi tertentu
          // Jika showDeleted aktif, ambil yang deleted_at, jika tidak ambil yang tidak deleted
          const mabaData = rows.filter(m => {
            const matchesYear = m.id_tahun === yearId;
            if (showDeleted) {
              return matchesYear && m.deleted_at;
            } else {
              return matchesYear && !m.deleted_at;
            }
          });
          
          // Proses data mahasiswa baru
          const baruReguler = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'reguler');
          const baruRPL = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'rpl');
          
          // Proses data mahasiswa aktif
          const aktifReguler = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'reguler');
          const aktifRPL = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'rpl');
          
          displayRows.push({
            ts: i === 0 ? 'TS' : `TS-${i}`,
            tahun: year.tahun,
            tahunId: yearId,
            tahunName: year.tahun,
            baruRegulerDiterima: baruReguler?.jumlah_total || '',
            baruRegulerAfirmasi: baruReguler?.jumlah_afirmasi || '',
            baruRegulerKebutuhanKhusus: baruReguler?.jumlah_kebutuhan_khusus || '',
            baruRPLDiterima: baruRPL?.jumlah_total || '',
            baruRPLAfirmasi: baruRPL?.jumlah_afirmasi || '',
            baruRPLKebutuhanKhusus: baruRPL?.jumlah_kebutuhan_khusus || '',
            aktifRegulerDiterima: aktifReguler?.jumlah_total || '',
            aktifRegulerAfirmasi: aktifReguler?.jumlah_afirmasi || '',
            aktifRegulerKebutuhanKhusus: aktifReguler?.jumlah_kebutuhan_khusus || '',
            aktifRPLDiterima: aktifRPL?.jumlah_total || '',
            aktifRPLAfirmasi: aktifRPL?.jumlah_afirmasi || '',
            aktifRPLKebutuhanKhusus: aktifRPL?.jumlah_kebutuhan_khusus || '',
            rowData: mabaData
          });
        }
      }
    } else {
      // Jika tidak ada filter tahun, tampilkan semua data dalam format yang sama
      // Filter berdasarkan showDeleted
      const filteredRows = rows.filter(row => {
        if (showDeleted) {
          return row.deleted_at;
        } else {
          return !row.deleted_at;
        }
      });
      
      const groupedByYear = {};
      filteredRows.forEach(row => {
        const yearId = row.id_tahun;
        if (!groupedByYear[yearId]) {
          groupedByYear[yearId] = [];
        }
        groupedByYear[yearId].push(row);
      });
      
      displayRows = Object.keys(groupedByYear).map(yearId => {
        const yearIdNum = parseInt(yearId);
        const tahunName = getTahunName(yearIdNum);
        const mabaData = groupedByYear[yearId];
        
        const baruReguler = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'reguler');
        const baruRPL = mabaData.find(m => m.jenis === 'baru' && m.jalur === 'rpl');
        const aktifReguler = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'reguler');
        const aktifRPL = mabaData.find(m => m.jenis === 'aktif' && m.jalur === 'rpl');
        
        return {
          ts: tahunName,
          tahun: yearIdNum,
          tahunId: yearIdNum,
          tahunName: tahunName,
          baruRegulerDiterima: baruReguler?.jumlah_total || '',
          baruRegulerAfirmasi: baruReguler?.jumlah_afirmasi || '',
          baruRegulerKebutuhanKhusus: baruReguler?.jumlah_kebutuhan_khusus || '',
          baruRPLDiterima: baruRPL?.jumlah_total || '',
          baruRPLAfirmasi: baruRPL?.jumlah_afirmasi || '',
          baruRPLKebutuhanKhusus: baruRPL?.jumlah_kebutuhan_khusus || '',
          aktifRegulerDiterima: aktifReguler?.jumlah_total || '',
          aktifRegulerAfirmasi: aktifReguler?.jumlah_afirmasi || '',
          aktifRegulerKebutuhanKhusus: aktifReguler?.jumlah_kebutuhan_khusus || '',
          aktifRPLDiterima: aktifRPL?.jumlah_total || '',
          aktifRPLAfirmasi: aktifRPL?.jumlah_afirmasi || '',
          aktifRPLKebutuhanKhusus: aktifRPL?.jumlah_kebutuhan_khusus || '',
          rowData: mabaData
        };
      });
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            {/* Row 1: Header utama */}
            <tr className="sticky top-0">
              {showDeleted && (
                <th rowSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20 w-16">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(tableMaba, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                  />
                </th>
              )}
              <th rowSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                TAHUN
              </th>
              <th rowSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                TS
              </th>
              <th colSpan={6} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                JUMLAH MAHASISWA BARU
              </th>
              <th colSpan={6} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                JUMLAH MAHASISWA AKTIF
              </th>
              <th rowSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
              </th>
            </tr>
            {/* Row 2: Sub-header */}
            <tr className="sticky top-0">
              {/* TAHUN, TS, dan AKSI sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
              {/* Di bawah "Jumlah Mahasiswa Baru" */}
              <th colSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                REGULER
              </th>
              <th colSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                RPL
              </th>
              {/* Di bawah "Jumlah Mahasiswa Aktif" */}
              <th colSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                REGULER
              </th>
              <th colSpan={3} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                RPL
              </th>
            </tr>
            {/* Row 3: Header detail */}
            <tr className="sticky top-0">
              {/* TAHUN, TS, dan AKSI sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
              {/* Di bawah "Reguler" (Mahasiswa Baru) */}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                DITERIMA
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AFIRMASI
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                KEBUTUHAN KHUSUS
              </th>
              {/* Di bawah "RPL" (Mahasiswa Baru) */}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                DITERIMA
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AFIRMASI
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                KEBUTUHAN KHUSUS
              </th>
              {/* Di bawah "Reguler" (Mahasiswa Aktif) */}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                DITERIMA
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AFIRMASI
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                KEBUTUHAN KHUSUS
              </th>
              {/* Di bawah "RPL" (Mahasiswa Aktif) */}
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                DITERIMA
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AFIRMASI
              </th>
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                KEBUTUHAN KHUSUS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayRows.map((row, idx) => {
              // Untuk checkbox, cek apakah ada rowData yang terpilih
              const rowDataIds = row.rowData && row.rowData.length > 0 
                ? row.rowData.map(r => r[getIdField(r)])
                : [];
              const isSelected = rowDataIds.length > 0 && rowDataIds.every(id => selectedRows.includes(id));
              
              return (
                <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                  {showDeleted && (
                    <td className="px-6 py-4 text-center border border-slate-200">
                      {row.rowData && row.rowData.length > 0 && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows([...selectedRows, ...rowDataIds]);
                            } else {
                              setSelectedRows(selectedRows.filter(rowId => !rowDataIds.includes(rowId)));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0384d6] focus:ring-[#0384d6]"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center font-medium">
                    {row.tahunName || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center font-medium whitespace-nowrap">
                    {row.ts}
                  </td>
                  {/* Mahasiswa Baru - Reguler */}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRegulerDiterima || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRegulerAfirmasi || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRegulerKebutuhanKhusus || '-'}
                  </td>
                  {/* Mahasiswa Baru - RPL */}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRPLDiterima || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRPLAfirmasi || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.baruRPLKebutuhanKhusus || '-'}
                  </td>
                  {/* Mahasiswa Aktif - Reguler */}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRegulerDiterima || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRegulerAfirmasi || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRegulerKebutuhanKhusus || '-'}
                  </td>
                  {/* Mahasiswa Aktif - RPL */}
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRPLDiterima || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRPLAfirmasi || '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-700 border border-slate-200 text-center">
                    {row.aktifRPLKebutuhanKhusus || '-'}
                  </td>
                  <td className="px-6 py-4 text-center border border-slate-200">
                    {row.rowData && row.rowData.length > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        {!showDeleted && canUMaba && (
                          <button
                            onClick={() => {
                              // Tampilkan semua data untuk edit (bisa multiple)
                              // Untuk sekarang, edit data pertama saja atau buka modal untuk semua
                              if (row.rowData.length === 1) {
                                setEditingMaba(row.rowData[0]);
                                setFormMaba(row.rowData[0]);
                                setShowModalMaba(true);
                              } else {
                                // Jika ada multiple data, bisa tampilkan info atau edit salah satu
                                Swal.fire({
                                  icon: 'info',
                                  title: 'Data Multiple',
                                  text: `Terdapat ${row.rowData.length} data untuk tahun ini. Silakan edit secara individual melalui menu lain.`
                                });
                              }
                            }}
                            className="font-medium text-[#0384d6] hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {!showDeleted && canDMaba && (
                          <button
                            onClick={() => {
                              // Hapus semua data untuk TS ini
                              const firstData = row.rowData[0];
                              if (firstData) {
                                doDelete(firstData, tableMaba);
                              }
                            }}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                        {showDeleted && canUMaba && (
                          <button
                            onClick={() => {
                              // Pulihkan semua data untuk TS ini
                              if (row.rowData.length > 0) {
                                doRestore(row.rowData[0], tableMaba);
                              }
                            }}
                            className="font-medium text-green-600 hover:underline"
                          >
                            Pulihkan
                          </button>
                        )}
                        {showDeleted && canDMaba && (
                          <button
                            onClick={() => {
                              // Hapus permanen semua data untuk TS ini
                              if (row.rowData.length > 0) {
                                doHardDelete(row.rowData[0], tableMaba);
                              }
                            }}
                            className="font-medium text-red-800 hover:underline"
                          >
                            Hapus Permanen
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                    {row.rowData && row.rowData.length > 0 && row.rowData.some(r => r.deleted_at) && (
                      <div className="italic text-slate-500">Dihapus</div>
                    )}
                  </td>
                </tr>
              );
            })}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 16 : 15} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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
    <div className="p-8 bg-gradient-to-br from-[#f5f9ff] via-white to-white rounded-2xl shadow-xl space-y-10">
      
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

        {renderTablePendaftaran()}
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

        {renderTableMaba()}
      </section>

      {/* Tabel Data Mahasiswa - Struktur Kompleks */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Tabel 2.A.1 Data Mahasiswa</h1>
          <p className="text-sm text-slate-500 mt-1">
            Data lengkap mahasiswa berdasarkan tahun akademik (TS-3, TS-2, TS-1, TS).
          </p>
        </header>

        {/* Filter Unit Prodi */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <YearSelector 
              selectedYear={selectedYearPend} 
              setSelectedYear={setSelectedYearPend} 
              label="Tahun TS" 
            />
            <select
              value={selectedUnitProdi}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6]"
              onChange={(e) => setSelectedUnitProdi(e.target.value)}
            >
              <option value="4">Teknik Informatika (TI)</option>
              <option value="5">Manajemen Informatika (MI)</option>
            </select>
          </div>
        </div>

        {/* Tabel dengan struktur kompleks */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              {/* Row 1: Header utama */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                <th rowSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">TS</th>
                <th rowSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Daya Tampung</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Calon Mahasiswa</th>
                <th colSpan={6} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Mahasiswa Baru</th>
                <th colSpan={6} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Jumlah Mahasiswa Aktif</th>
              </tr>
              {/* Row 2: Sub-header */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                {/* TS dan Daya Tampung sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendaftar</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendaftar Afirmasi</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Pendaftar Kebutuhan Khusus</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Reguler</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">RPL</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Reguler</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">RPL</th>
              </tr>
              {/* Row 3: Header detail */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                {/* TS, Daya Tampung, Pendaftar, Pendaftar Afirmasi, Pendaftar Kebutuhan Khusus sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
                {/* Di bawah "Reguler" (Mahasiswa Baru) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kebutuhan Khusus</th>
                {/* Di bawah "RPL" (Mahasiswa Baru) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kebutuhan Khusus</th>
                {/* Di bawah "Reguler" (Mahasiswa Aktif) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kebutuhan Khusus</th>
                {/* Di bawah "RPL" (Mahasiswa Aktif) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">Kebutuhan Khusus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(() => {
                const unitProdiId = parseInt(selectedUnitProdi) || 4;
                const tableData = processDataForTable(unitProdiId);
                
                // Filter data berdasarkan showDeleted jika diperlukan
                // (Saat ini tabel gabungan ini hanya menampilkan data aktif)
                
                if (tableData.length === 0) {
                  return (
                    <tr>
                      <td colSpan={17} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
                        <p className="font-medium">Data tidak ditemukan</p>
                        <p className="text-sm">Pilih tahun TS untuk melihat data.</p>
                      </td>
                    </tr>
                  );
                }

                return tableData.map((row, idx) => (
                  <tr key={idx} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff] ${row.ts === 'Jumlah' ? 'bg-slate-100 font-semibold' : ''}`}>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center font-medium bg-gray-50 whitespace-nowrap">{row.ts}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.dayaTampung || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.pendaftar || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.pendaftarAfirmasi || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.pendaftarKebutuhanKhusus || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRegulerDiterima || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRegulerAfirmasi || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRegulerKebutuhanKhusus || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRPLDiterima || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRPLAfirmasi || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.baruRPLKebutuhanKhusus || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRegulerDiterima || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRegulerAfirmasi || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRegulerKebutuhanKhusus || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRPLDiterima || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRPLAfirmasi || ''}</td>
                    <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.aktifRPLKebutuhanKhusus || ''}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
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
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                      type="button" 
                      onClick={()=>setShowModalPend(false)} 
                      className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      Batal
                  </button>
                  <button 
                      type="submit" 
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      {loading?"Menyimpan...":"Simpan"}
                  </button>
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
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                      type="button" 
                      onClick={()=>setShowModalMaba(false)} 
                      className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-medium bg-white hover:bg-red-500 hover:border-red-500 hover:text-white active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      Batal
                  </button>
                  <button 
                      type="submit" 
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0384d6] to-[#043975] hover:from-[#043975] hover:to-[#0384d6] text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      {loading?"Menyimpan...":"Simpan"}
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

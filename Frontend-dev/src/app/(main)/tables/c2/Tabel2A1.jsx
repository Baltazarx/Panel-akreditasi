import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { apiFetch, getIdField } from "../../../../lib/api";
import { roleCan } from "../../../../lib/role";
import { useMaps } from "../../../../hooks/useMaps";
import Swal from 'sweetalert2';
import { FiEdit2, FiTrash2, FiRotateCw, FiXCircle, FiMoreVertical } from 'react-icons/fi';

export default function Tabel2A1({ role }) {
  const { maps, loading: mapsLoading } = useMaps(true);
  const tablePend = { key: "tabel_2a1_pendaftaran", label: "2.A.1 Pendaftaran", path: "/tabel2a1-pendaftaran" };
  const tableMaba = { key: "tabel_2a1_mahasiswa_baru_aktif", label: "2.A.1 Mahasiswa Baru & Aktif", path: "/tabel2a1-mahasiswa-baru-aktif" };

  const [rowsPend, setRowsPend] = useState([]);
  const [rowsMaba, setRowsMaba] = useState([]);
  const [rowsGabungan, setRowsGabungan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoadingPend, setInitialLoadingPend] = useState(true);
  const [initialLoadingMaba, setInitialLoadingMaba] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states - Global filters
  const [selectedYear, setSelectedYear] = useState(''); // Global filter tahun
  const [selectedUnitProdi, setSelectedUnitProdi] = useState('4'); // Default: TI
  
  // Local states untuk show deleted
  const [showDeletedPend, setShowDeletedPend] = useState(false);
  const [showDeletedMaba, setShowDeletedMaba] = useState(false);
  
  // Flag untuk memastikan tahun default hanya di-set sekali
  const hasSetDefaultYear = useRef(false);
  
  // Selection states for bulk actions
  const [selectedRowsPend, setSelectedRowsPend] = useState([]);
  const [selectedRowsMaba, setSelectedRowsMaba] = useState([]);

  const [editingPend, setEditingPend] = useState(null);
  const [editingMaba, setEditingMaba] = useState(null);
  const [showModalPend, setShowModalPend] = useState(false);
  const [showModalMaba, setShowModalMaba] = useState(false);
  
  // Dropdown menu state - untuk setiap bagian tabel
  const [openDropdownIdPend, setOpenDropdownIdPend] = useState(null);
  const [openDropdownIdMaba, setOpenDropdownIdMaba] = useState(null);
  const [openDropdownIdGabungan, setOpenDropdownIdGabungan] = useState(null);
  // State untuk 4 dropdown aksi di tabel Maba (baru-reguler, baru-rpl, aktif-reguler, aktif-rpl)
  const [openDropdownMaba, setOpenDropdownMaba] = useState(null); // Format: "baru-reguler-{id}" atau "baru-rpl-{id}" atau "aktif-reguler-{id}" atau "aktif-rpl-{id}"
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if ((openDropdownIdPend || openDropdownIdMaba || openDropdownIdGabungan || openDropdownMaba) && 
          !event.target.closest('.dropdown-container') && 
          !event.target.closest('.fixed')) {
        setOpenDropdownIdPend(null);
        setOpenDropdownIdMaba(null);
        setOpenDropdownIdGabungan(null);
        setOpenDropdownMaba(null);
      }
    };

    const handleScroll = () => {
      if (openDropdownIdPend || openDropdownIdMaba || openDropdownIdGabungan || openDropdownMaba) {
        setOpenDropdownIdPend(null);
        setOpenDropdownIdMaba(null);
        setOpenDropdownIdGabungan(null);
        setOpenDropdownMaba(null);
      }
    };

    const handleResize = () => {
      if (openDropdownIdPend || openDropdownIdMaba || openDropdownIdGabungan || openDropdownMaba) {
        setOpenDropdownIdPend(null);
        setOpenDropdownIdMaba(null);
        setOpenDropdownIdGabungan(null);
        setOpenDropdownMaba(null);
      }
    };

    if (openDropdownIdPend || openDropdownIdMaba || openDropdownIdGabungan || openDropdownMaba) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [openDropdownIdPend, openDropdownIdMaba, openDropdownIdGabungan, openDropdownMaba]);

  // Close dropdown when modal opens
  useEffect(() => {
    if (showModalPend || showModalMaba) {
      setOpenDropdownIdPend(null);
      setOpenDropdownIdMaba(null);
      setOpenDropdownIdGabungan(null);
      setOpenDropdownMaba(null);
    }
  }, [showModalPend, showModalMaba]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModalPend || showModalMaba) {
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
  
  // Pastikan showDeleted selalu false untuk role ALA
  useEffect(() => {
    if (role?.toLowerCase() === "ala") {
      setShowDeletedPend(false);
      setShowDeletedMaba(false);
    }
  }, [role]);
  

  const fetchPend = useCallback(async (isToggle = false) => {
    try {
      // Only show loading skeleton on initial load, not when toggling
      if (!isToggle) {
        setLoading(true);
        setInitialLoadingPend(true);
      }
      setError("");
      const params = new URLSearchParams();
      
      // Filter berdasarkan prodi (selalu ada karena default adalah TI)
      const unitProdi = selectedUnitProdi || '4';
      params.append("id_unit_prodi", unitProdi);
      
      // Jika ada filter tahun, ambil data untuk TS, TS-1, TS-2, TS-3, TS-4
      if (selectedYear && maps?.tahun) {
        const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
        const currentYearId = parseInt(selectedYear);
        const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
        
        if (currentYearIndex !== -1) {
          // Ambil ID tahun untuk TS, TS-1, TS-2, TS-3, TS-4
          const yearIds = [];
          for (let i = 0; i <= 4; i++) {
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
      if (!isToggle) {
        setLoading(false);
        setInitialLoadingPend(false);
      }
    }
  }, [selectedYear, selectedUnitProdi, showDeletedPend, maps?.tahun]);
  
  const fetchMaba = useCallback(async (isToggle = false) => {
    try {
      // Only show loading skeleton on initial load, not when toggling
      if (!isToggle) {
        setLoading(true);
        setInitialLoadingMaba(true);
      }
      setError("");
      const params = new URLSearchParams();
      
      // Filter berdasarkan prodi (selalu ada karena default adalah TI)
      const unitProdi = selectedUnitProdi || '4';
      params.append("id_unit_prodi", unitProdi);
      
      // Jika ada filter tahun, ambil data untuk TS, TS-1, TS-2, TS-3, TS-4
      if (selectedYear && maps?.tahun) {
        const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
        const currentYearId = parseInt(selectedYear);
        const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
        
        if (currentYearIndex !== -1) {
          // Ambil ID tahun untuk TS, TS-1, TS-2, TS-3, TS-4
          const yearIds = [];
          for (let i = 0; i <= 4; i++) {
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
      if (!isToggle) {
        setLoading(false);
        setInitialLoadingMaba(false);
      }
    }
  }, [selectedYear, selectedUnitProdi, showDeletedMaba, maps?.tahun]);

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

  // Fungsi untuk memproses data menjadi format TS-4, TS-3, TS-2, TS-1, TS
  const processDataForTable = (unitProdiId) => {
    if (!selectedYear || !maps?.tahun) return [];

    const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
    const currentYearId = parseInt(selectedYear);
    const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
    
    if (currentYearIndex === -1) return [];

    const result = [];
    
    // TS, TS-1, TS-2, TS-3, TS-4
    for (let i = 0; i <= 4; i++) {
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
          setSelectedYear(String(tahunTerpilih.id_tahun));
          hasSetDefaultYear.current = true;
        }
      }
    }
  }, [mapsLoading, maps?.tahun]);
  
  // Initial load untuk Pendaftaran
  useEffect(() => { 
    if (!mapsLoading && maps?.tahun) {
      fetchPend(false); 
      setSelectedRowsPend([]);
    }
  }, [selectedYear, selectedUnitProdi, mapsLoading, maps?.tahun, fetchPend]);
  
  // Toggle showDeleted untuk Pendaftaran
  useEffect(() => {
    if (!initialLoadingPend && !mapsLoading && maps?.tahun) {
      fetchPend(true);
      setSelectedRowsPend([]);
    }
  }, [showDeletedPend, initialLoadingPend, mapsLoading, maps?.tahun, fetchPend]);
  
  // Initial load untuk Mahasiswa Baru & Aktif
  useEffect(() => { 
    if (!mapsLoading && maps?.tahun) {
      fetchMaba(false); 
      setSelectedRowsMaba([]);
    }
  }, [selectedYear, selectedUnitProdi, mapsLoading, maps?.tahun, fetchMaba]);
  
  // Toggle showDeleted untuk Mahasiswa Baru & Aktif
  useEffect(() => {
    if (!initialLoadingMaba && !mapsLoading && maps?.tahun) {
      fetchMaba(true);
      setSelectedRowsMaba([]);
    }
  }, [showDeletedMaba, initialLoadingMaba, mapsLoading, maps?.tahun, fetchMaba]);

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
      // Validasi field wajib
      const unitProdiId = Number(formPend.id_unit_prodi || selectedUnitProdi || 0);
      const tahunId = Number(formPend.id_tahun);

      if (!unitProdiId || !tahunId) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi Gagal',
          text: 'Unit prodi dan tahun wajib dipilih.'
        });
        return;
      }

      const dayaTampungNum = Number(formPend.daya_tampung || 0);
      const pendaftarNum = Number(formPend.pendaftar || 0);
      const afirmasiNum = Number(formPend.pendaftar_afirmasi || 0);
      const kebutuhanKhususNum = Number(formPend.pendaftar_kebutuhan_khusus || 0);

      // Validasi: Total 3 kategori (pendaftar + afirmasi + kebutuhan khusus) tidak boleh melebihi daya tampung
      const totalPendaftar = pendaftarNum + afirmasiNum + kebutuhanKhususNum;
      
      if (dayaTampungNum > 0 && totalPendaftar > dayaTampungNum) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi Gagal',
          html: `
            Total jumlah calon mahasiswa (${totalPendaftar}) tidak boleh melebihi daya tampung (${dayaTampungNum}).<br/>
            <small>Rincian: Pendaftar (${pendaftarNum}) + Afirmasi (${afirmasiNum}) + Kebutuhan Khusus (${kebutuhanKhususNum}) = ${totalPendaftar}</small>
          `
        });
        return;
      }

      // Cek duplikat: tidak boleh ada data dengan kombinasi id_unit_prodi dan id_tahun yang sama
      if (!editingPend) {
        const existingRow = rowsPend.find(row =>
          row.id_unit_prodi === unitProdiId &&
          row.id_tahun === tahunId &&
          !row.deleted_at
        );
        
        if (existingRow) {
          Swal.fire({
            icon: 'warning',
            title: 'Data Sudah Ada',
            text: 'Data dengan kombinasi unit prodi dan tahun yang sama sudah ada. Silakan edit data yang sudah ada atau pilih kombinasi yang berbeda.'
          });
          return;
        }
      }

      setLoading(true);
      const target = editingPend ? `${tablePend.path}/${editingPend[getIdField(editingPend)]}` : tablePend.path;
      const method = editingPend ? "PUT" : "POST";
      // Hanya kirim field yang diharapkan backend dengan format yang benar
      const body = {
        id_unit_prodi: unitProdiId,
        id_tahun: tahunId,
        daya_tampung: dayaTampungNum,
        pendaftar: pendaftarNum,
        pendaftar_afirmasi: afirmasiNum,
        pendaftar_kebutuhan_khusus: kebutuhanKhususNum
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
      console.error('Error submitting Pendaftaran:', e);
      let errorMessage = e.message || 'Terjadi kesalahan saat menyimpan data';
      
      // Handle specific error messages from backend
      if (e.response) {
        const responseError = typeof e.response === 'string' ? JSON.parse(e.response) : e.response;
        if (responseError?.error) {
          errorMessage = responseError.error;
        }
      }
      
      // Handle HTTP status codes
      if (e.status === 409) {
        errorMessage = 'Data dengan kombinasi unit prodi dan tahun yang sama sudah ada';
      } else if (e.status === 400) {
        errorMessage = errorMessage || 'Data yang dikirim tidak valid';
      } else if (e.status === 500) {
        errorMessage = errorMessage || 'Terjadi kesalahan di server. Silakan coba lagi.';
      }
      
      Swal.fire({ 
        icon: 'error', 
        title: editingPend ? 'Gagal Memperbarui Data' : 'Gagal Menambah Data', 
        text: errorMessage,
        footer: e.status ? `Error ${e.status}` : ''
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitMaba = async (e) => {
    e.preventDefault();
    try {
      const unitProdiId = Number(formMaba.id_unit_prodi || selectedUnitProdi || 0);
      const tahunId = Number(formMaba.id_tahun);
      const jenisMaba = formMaba.jenis || 'baru';

      if (!unitProdiId || !tahunId) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi Gagal',
          text: 'Unit prodi dan tahun wajib dipilih.'
        });
        return;
      }

      // Validasi hanya untuk mahasiswa baru, tidak untuk mahasiswa aktif
      if (jenisMaba === 'baru') {
        const pendRow = rowsPend.find(row =>
          row.id_unit_prodi === unitProdiId &&
          row.id_tahun === tahunId &&
          !row.deleted_at
        );

        const pendaftarLimit = Number(pendRow?.pendaftar || 0);

        if (!pendRow || pendaftarLimit <= 0) {
          Swal.fire({
            icon: 'error',
            title: 'Data Pendaftaran Tidak Ditemukan',
            text: 'Silakan lengkapi data pendaftaran (Jumlah Calon Mahasiswa) terlebih dahulu.'
          });
          return;
        }

        const newContribution =
          Number(formMaba.jumlah_total || 0) +
          Number(formMaba.jumlah_afirmasi || 0) +
          Number(formMaba.jumlah_kebutuhan_khusus || 0);

        const existingContribution = rowsMaba
          .filter(row =>
            row.id_unit_prodi === unitProdiId &&
            row.id_tahun === tahunId &&
            row.jenis === 'baru' &&
            !row.deleted_at &&
            (!editingMaba || row[getIdField(row)] !== editingMaba[getIdField(editingMaba)])
          )
          .reduce((sum, row) => {
            const base = Number(row.jumlah_total || 0);
            const afirm = Number(row.jumlah_afirmasi || 0);
            const khusus = Number(row.jumlah_kebutuhan_khusus || 0);
            return sum + base + afirm + khusus;
          }, 0);

        if (existingContribution + newContribution > pendaftarLimit) {
          Swal.fire({
            icon: 'warning',
            title: 'Validasi Gagal',
            html: `
              Total Mahasiswa Baru (${existingContribution + newContribution}) tidak boleh melebihi
              Jumlah Calon Mahasiswa (${pendaftarLimit}).`
          });
          return;
        }
      }
      // Untuk mahasiswa aktif, tidak ada validasi - langsung submit

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

  const UnitSelector = ({ selectedUnit, setSelectedUnit, label }) => (
    <div className="flex items-center gap-2">
      <label htmlFor={`filter-unit-${label}`} className="text-sm font-medium text-slate-700">{label}:</label>
      <select
        id={`filter-unit-${label}`}
        value={selectedUnit || '4'}
        onChange={(e) => setSelectedUnit(e.target.value)}
        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] w-48"
        disabled={loading}
      >
        <option value="4">Teknik Informatika (TI)</option>
        <option value="5">Manajemen Informatika (MI)</option>
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
    
    // Proses data untuk ditampilkan per TS jika selectedYear ada
    let displayRows = [];
    if (selectedYear && maps?.tahun) {
      const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
      const currentYearId = parseInt(selectedYear);
      const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
      
      if (currentYearIndex !== -1) {
        // TS, TS-1, TS-2, TS-3, TS-4
        for (let i = 0; i <= 4; i++) {
          const yearIndex = currentYearIndex - i;
          if (yearIndex < 0 || yearIndex >= tahunList.length) {
            displayRows.push({
              ts: i === 0 ? 'TS' : `TS-${i}`,
              tahun: null,
              tahunId: null,
              tahunName: '',
              dayaTampung: '',
              pendaftar: '',
              pendaftarAfirmasi: '',
              pendaftarKebutuhanKhusus: '',
              rowData: null
            });
            continue;
          }

          const year = tahunList[yearIndex];
          const yearId = year.id_tahun;
          
          // Filter berdasarkan prodi yang dipilih
          const unitProdiId = selectedUnitProdi ? parseInt(selectedUnitProdi) : 4;
          
          // Cari data pendaftaran untuk unit prodi tertentu
          // Jika showDeleted aktif, ambil yang deleted_at, jika tidak ambil yang tidak deleted
          const pendData = rows.find(p => {
            const matchesYear = p.id_tahun === yearId;
            const matchesProdi = p.id_unit_prodi === unitProdiId || String(p.id_unit_prodi) === String(unitProdiId);
            if (showDeleted) {
              return matchesYear && matchesProdi && p.deleted_at;
            } else {
              return matchesYear && matchesProdi && !p.deleted_at;
            }
          });
          
          displayRows.push({
            ts: i === 0 ? 'TS' : `TS-${i}`,
            tahun: year.tahun,
            tahunId: yearId,
            tahunName: year.tahun,
            dayaTampung: pendData?.daya_tampung || '',
            pendaftar: pendData?.pendaftar || '',
            pendaftarAfirmasi: pendData?.pendaftar_afirmasi || '',
            pendaftarKebutuhanKhusus: pendData?.pendaftar_kebutuhan_khusus || '',
            rowData: pendData
          });
        }
      }
    } else {
      // Jika tidak ada filter tahun, tampilkan semua data
      // Filter berdasarkan prodi yang dipilih dan showDeleted
      const unitProdiId = selectedUnitProdi ? parseInt(selectedUnitProdi) : 4;
      const filteredRows = rows.filter(row => {
        const matchesProdi = row.id_unit_prodi === unitProdiId || String(row.id_unit_prodi) === String(unitProdiId);
        if (showDeleted) {
          return matchesProdi && row.deleted_at;
        } else {
          return matchesProdi && !row.deleted_at;
        }
      });
      
      displayRows = filteredRows.map(row => ({
        ts: getTahunName(row.id_tahun),
        tahun: row.id_tahun,
        tahunId: row.id_tahun,
        tahunName: getTahunName(row.id_tahun),
        dayaTampung: row.daya_tampung || '',
        pendaftar: row.pendaftar || '',
        pendaftarAfirmasi: row.pendaftar_afirmasi || '',
        pendaftarKebutuhanKhusus: row.pendaftar_kebutuhan_khusus || '',
        rowData: row
      }));
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md transition-opacity duration-300 ease-in-out">
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
              <th rowSpan={2} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                DAYA TAMPUNG
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
              const idField = row.rowData ? getIdField(row.rowData) : null;
              const rowId = idField && row.rowData ? row.rowData[idField] : null;
              // Pastikan key selalu unik dengan menggabungkan rowId dan idx
              const uniqueKey = `pend-${showDeleted ? 'deleted' : 'active'}-${rowId !== null ? rowId : 'no-id'}-${idx}`;
              return (
                <tr key={uniqueKey} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
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
                {row.dayaTampung || '-'}
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
                  <td className="px-6 py-4 border border-slate-200">
                    {row.rowData && !row.rowData.deleted_at && (
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(row.rowData) ? row.rowData[getIdField(row.rowData)] : idx;
                            if (openDropdownIdPend !== rowId) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownWidth = 192;
                              setDropdownPosition({
                                top: rect.bottom + 4,
                                left: Math.max(8, rect.right - dropdownWidth)
                              });
                              setOpenDropdownIdPend(rowId);
                            } else {
                              setOpenDropdownIdPend(null);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                          aria-label="Menu aksi"
                          aria-expanded={openDropdownIdPend === (getIdField(row.rowData) ? row.rowData[getIdField(row.rowData)] : idx)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    )}
                    {row.rowData && row.rowData.deleted_at && (
                      <div className="text-center italic text-red-600">Dihapus</div>
                    )}
                  </td>
                </tr>
              );
            })}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 8 : 7} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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
    
    // Proses data untuk ditampilkan per TS jika selectedYear ada
    let displayRows = [];
    if (selectedYear && maps?.tahun) {
      const tahunList = Object.values(maps.tahun).sort((a, b) => a.id_tahun - b.id_tahun);
      const currentYearId = parseInt(selectedYear);
      const currentYearIndex = tahunList.findIndex(t => t.id_tahun === currentYearId);
      
      if (currentYearIndex !== -1) {
        // TS, TS-1, TS-2, TS-3, TS-4
        for (let i = 0; i <= 4; i++) {
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
          
          // Filter berdasarkan prodi yang dipilih
          const unitProdiId = selectedUnitProdi ? parseInt(selectedUnitProdi) : 4;
          
          // Cari data mahasiswa baru dan aktif untuk unit prodi tertentu
          // Jika showDeleted aktif, ambil yang deleted_at, jika tidak ambil yang tidak deleted
          const mabaData = rows.filter(m => {
            const matchesYear = m.id_tahun === yearId;
            const matchesProdi = m.id_unit_prodi === unitProdiId || String(m.id_unit_prodi) === String(unitProdiId);
            if (showDeleted) {
              return matchesYear && matchesProdi && m.deleted_at;
            } else {
              return matchesYear && matchesProdi && !m.deleted_at;
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
      // Filter berdasarkan prodi yang dipilih dan showDeleted
      const unitProdiId = selectedUnitProdi ? parseInt(selectedUnitProdi) : 4;
      const filteredRows = rows.filter(row => {
        const matchesProdi = row.id_unit_prodi === unitProdiId || String(row.id_unit_prodi) === String(unitProdiId);
        if (showDeleted) {
          return matchesProdi && row.deleted_at;
        } else {
          return matchesProdi && !row.deleted_at;
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
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md transition-opacity duration-300 ease-in-out">
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
              <th colSpan={8} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                JUMLAH MAHASISWA BARU
              </th>
              <th colSpan={8} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                JUMLAH MAHASISWA AKTIF
              </th>
            </tr>
            {/* Row 2: Sub-header */}
            <tr className="sticky top-0">
              {/* TAHUN, TS sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
              {/* Di bawah "Jumlah Mahasiswa Baru" */}
              <th colSpan={4} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                REGULER
              </th>
              <th colSpan={4} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                RPL
              </th>
              {/* Di bawah "Jumlah Mahasiswa Aktif" */}
              <th colSpan={4} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                REGULER
              </th>
              <th colSpan={4} className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                RPL
              </th>
            </tr>
            {/* Row 3: Header detail */}
            <tr className="sticky top-0">
              {/* TAHUN, TS sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
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
              <th className="px-6 py-4 text-xs font-semibold tracking-wide uppercase text-center border border-white/20">
                AKSI
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
              const firstDataId = row.rowData && row.rowData.length > 0 
                ? (getIdField(row.rowData[0]) ? row.rowData[0][getIdField(row.rowData[0])] : null)
                : null;
              // Pastikan key selalu unik dengan menggabungkan firstDataId dan idx
              const uniqueKey = `maba-${showDeleted ? 'deleted' : 'active'}-${firstDataId !== null ? firstDataId : 'no-id'}-${idx}`;
              
              return (
                <tr key={uniqueKey} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
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
                  {/* Aksi Mahasiswa Baru - Reguler */}
                  <td className="px-6 py-4 border border-slate-200">
                    {(() => {
                      const baruRegulerData = row.rowData?.find(m => m.jenis === 'baru' && m.jalur === 'reguler');
                      if (!baruRegulerData || baruRegulerData.deleted_at) return <span className="text-center text-slate-400">-</span>;
                      const rowId = getIdField(baruRegulerData) ? baruRegulerData[getIdField(baruRegulerData)] : null;
                      const dropdownKey = `baru-reguler-${rowId !== null && rowId !== undefined ? rowId : idx}`;
                      return (
                        <div className="flex items-center justify-center dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownMaba !== dropdownKey) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownWidth = 192;
                                setDropdownPosition({
                                  top: rect.bottom + 4,
                                  left: Math.max(8, rect.right - dropdownWidth)
                                });
                                setOpenDropdownMaba(dropdownKey);
                              } else {
                                setOpenDropdownMaba(null);
                              }
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                            aria-label="Menu aksi Mahasiswa Baru Reguler"
                            aria-expanded={openDropdownMaba === dropdownKey}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                        </div>
                      );
                    })()}
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
                  {/* Aksi Mahasiswa Baru - RPL */}
                  <td className="px-6 py-4 border border-slate-200">
                    {(() => {
                      const baruRPLData = row.rowData?.find(m => m.jenis === 'baru' && m.jalur === 'rpl');
                      if (!baruRPLData || baruRPLData.deleted_at) return <span className="text-center text-slate-400">-</span>;
                      const rowId = getIdField(baruRPLData) ? baruRPLData[getIdField(baruRPLData)] : null;
                      const dropdownKey = `baru-rpl-${rowId !== null && rowId !== undefined ? rowId : idx}`;
                      return (
                        <div className="flex items-center justify-center dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownMaba !== dropdownKey) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownWidth = 192;
                                setDropdownPosition({
                                  top: rect.bottom + 4,
                                  left: Math.max(8, rect.right - dropdownWidth)
                                });
                                setOpenDropdownMaba(dropdownKey);
                              } else {
                                setOpenDropdownMaba(null);
                              }
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                            aria-label="Menu aksi Mahasiswa Baru RPL"
                            aria-expanded={openDropdownMaba === dropdownKey}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                        </div>
                      );
                    })()}
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
                  {/* Aksi Mahasiswa Aktif - Reguler */}
                  <td className="px-6 py-4 border border-slate-200">
                    {(() => {
                      const aktifRegulerData = row.rowData?.find(m => m.jenis === 'aktif' && m.jalur === 'reguler');
                      if (!aktifRegulerData || aktifRegulerData.deleted_at) return <span className="text-center text-slate-400">-</span>;
                      const rowId = getIdField(aktifRegulerData) ? aktifRegulerData[getIdField(aktifRegulerData)] : null;
                      const dropdownKey = `aktif-reguler-${rowId !== null && rowId !== undefined ? rowId : idx}`;
                      return (
                        <div className="flex items-center justify-center dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownMaba !== dropdownKey) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const dropdownWidth = 192;
                                setDropdownPosition({
                                  top: rect.bottom + 4,
                                  left: Math.max(8, rect.right - dropdownWidth)
                                });
                                setOpenDropdownMaba(dropdownKey);
                              } else {
                                setOpenDropdownMaba(null);
                              }
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                            aria-label="Menu aksi Mahasiswa Aktif Reguler"
                            aria-expanded={openDropdownMaba === dropdownKey}
                          >
                            <FiMoreVertical size={18} />
                          </button>
                        </div>
                      );
                    })()}
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
                  {/* Aksi Mahasiswa Aktif - RPL */}
                  <td className="px-6 py-4 border border-slate-200">
                    {(() => {
                      const aktifRPLData = row.rowData?.find(m => m.jenis === 'aktif' && m.jalur === 'rpl');
                      if (!aktifRPLData || aktifRPLData.deleted_at) return <span className="text-center text-slate-400">-</span>;
                      const rowId = getIdField(aktifRPLData) ? aktifRPLData[getIdField(aktifRPLData)] : null;
                      const dropdownKey = `aktif-rpl-${rowId !== null && rowId !== undefined ? rowId : idx}`;
                      return (
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                              if (openDropdownMaba !== dropdownKey) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownWidth = 192;
                              setDropdownPosition({
                                top: rect.bottom + 4,
                                left: Math.max(8, rect.right - dropdownWidth)
                              });
                                setOpenDropdownMaba(dropdownKey);
                            } else {
                                setOpenDropdownMaba(null);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                            aria-label="Menu aksi Mahasiswa Aktif RPL"
                            aria-expanded={openDropdownMaba === dropdownKey}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan={showDeleted ? 19 : 18} className="px-6 py-16 text-center text-slate-500 border border-slate-200">
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
                  <td className="px-6 py-4 border border-slate-200">
                    {!r.deleted_at && (
                      <div className="flex items-center justify-center dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rowId = getIdField(r) ? r[getIdField(r)] : j;
                            if (openDropdownIdGabungan !== rowId) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dropdownWidth = 192;
                              setDropdownPosition({
                                top: rect.bottom + 4,
                                left: Math.max(8, rect.right - dropdownWidth)
                              });
                              setOpenDropdownIdGabungan(rowId);
                            } else {
                              setOpenDropdownIdGabungan(null);
                            }
                          }}
                          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-1"
                          aria-label="Menu aksi"
                          aria-expanded={openDropdownIdGabungan === (getIdField(r) ? r[getIdField(r)] : j)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                      </div>
                    )}
                    {r.deleted_at && (
                      <div className="text-center italic text-red-600">Dihapus</div>
                    )}
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
          <h1 className="text-2xl font-bold text-slate-800">{tablePend.label}</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-slate-500">
              Kelola data daya tampung dan jumlah pendaftar per tahun akademik.
            </p>
            {!loading && (
              <span className="inline-flex items-center text-sm text-slate-700">
                Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rowsPend.length}</span>
              </span>
            )}
          </div>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <YearSelector 
              selectedYear={selectedYear} 
              setSelectedYear={setSelectedYear} 
              label="Tahun" 
            />
            <UnitSelector 
              selectedUnit={selectedUnitProdi} 
              setSelectedUnit={setSelectedUnitProdi} 
              label="Prodi" 
            />
            
            {canDPend && role?.toLowerCase() !== "ala" && (
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setShowDeletedPend(false)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    !showDeletedPend
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Tampilkan data aktif"
                >
                  Data
                </button>
                <button
                  onClick={() => setShowDeletedPend(true)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    showDeletedPend
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Tampilkan data terhapus"
                >
                  Data Terhapus
                </button>
              </div>
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

        <div className="relative transition-opacity duration-300 ease-in-out">
          {renderTablePendaftaran()}
        </div>

        {/* Dropdown Menu Pendaftaran - Fixed Position */}
        {openDropdownIdPend !== null && (() => {
          const filteredRows = rowsPend.filter(r => showDeletedPend ? r.deleted_at : !r.deleted_at);
          const currentRow = filteredRows.find((r, idx) => {
            const rowId = getIdField(r) ? r[getIdField(r)] : idx;
            return rowId === openDropdownIdPend;
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
              {!showDeletedPend && canUPend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPend(currentRow);
                    setFormPend(currentRow);
                    setShowModalPend(true);
                    setOpenDropdownIdPend(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                  aria-label={`Edit data pendaftaran`}
                >
                  <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                  <span>Edit</span>
                </button>
              )}
              {!showDeletedPend && canDPend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doDelete(currentRow, tablePend);
                    setOpenDropdownIdPend(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                  aria-label={`Hapus data pendaftaran`}
                >
                  <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                  <span>Hapus</span>
                </button>
              )}
              {showDeletedPend && canUPend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doRestore(currentRow, tablePend);
                    setOpenDropdownIdPend(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                  aria-label={`Pulihkan data pendaftaran`}
                >
                  <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                  <span>Pulihkan</span>
                </button>
              )}
              {showDeletedPend && canDPend && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doHardDelete(currentRow, tablePend);
                    setOpenDropdownIdPend(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                  aria-label={`Hapus permanen data pendaftaran`}
                >
                  <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                  <span>Hapus Permanen</span>
                </button>
              )}
            </div>
          );
        })()}
      </section>

      {/* Mahasiswa Baru & Aktif */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">{tableMaba.label}</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-slate-500">
              Kelola data mahasiswa baru dan aktif per tahun akademik.
            </p>
            {!loading && (
              <span className="inline-flex items-center text-sm text-slate-700">
                Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{rowsMaba.length}</span>
              </span>
            )}
          </div>
        </header>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {canDMaba && role?.toLowerCase() !== "ala" && (
              <div className="inline-flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setShowDeletedMaba(false)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    !showDeletedMaba
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Tampilkan data aktif"
                >
                  Data
                </button>
                <button
                  onClick={() => setShowDeletedMaba(true)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    showDeletedMaba
                      ? "bg-white text-[#0384d6] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Tampilkan data terhapus"
                >
                  Data Terhapus
                </button>
              </div>
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

        <div className="relative transition-opacity duration-300 ease-in-out">
          {renderTableMaba()}
        </div>

        {/* Dropdown Menu Maba - Fixed Position (untuk 4 kolom aksi terpisah) */}
        {openDropdownMaba !== null && (() => {
          // Parse dropdown key: format "baru-reguler-{id}" atau "baru-rpl-{id}" atau "aktif-reguler-{id}" atau "aktif-rpl-{id}"
          const match = openDropdownMaba.match(/^(baru|aktif)-(reguler|rpl)-(.+)$/);
          if (!match) return null;
          
          const jenis = match[1]; // "baru" atau "aktif"
          const jalur = match[2]; // "reguler" atau "rpl"
          const idStr = match[3]; // ID
          const rowId = isNaN(idStr) ? idStr : parseInt(idStr);
          
          // Cari data yang sesuai dari rowsMaba
          const currentRowData = rowsMaba.find((r) => {
            const rId = getIdField(r) ? r[getIdField(r)] : null;
            return r.jenis === jenis && r.jalur === jalur && (rId === rowId || String(rId) === String(rowId) || String(rId) === idStr);
          });
          
          if (!currentRowData) return null;
          
          return (
            <div 
              className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
              }}
            >
              {!showDeletedMaba && canUMaba && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingMaba(currentRowData);
                    setFormMaba(currentRowData);
                    setShowModalMaba(true);
                    setOpenDropdownMaba(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                  aria-label={`Edit data ${jenis} ${jalur}`}
                >
                  <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                  <span>Edit</span>
                </button>
              )}
              {!showDeletedMaba && canDMaba && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doDelete(currentRowData, tableMaba);
                    setOpenDropdownMaba(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                  aria-label={`Hapus data ${jenis} ${jalur}`}
                >
                  <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                  <span>Hapus</span>
                </button>
              )}
              {showDeletedMaba && canUMaba && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doRestore(currentRowData, tableMaba);
                    setOpenDropdownMaba(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                  aria-label={`Pulihkan data ${jenis} ${jalur}`}
                >
                  <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                  <span>Pulihkan</span>
                </button>
              )}
              {showDeletedMaba && canDMaba && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doHardDelete(currentRowData, tableMaba);
                    setOpenDropdownMaba(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                  aria-label={`Hapus permanen data ${jenis} ${jalur}`}
                >
                  <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                  <span>Hapus Permanen</span>
                </button>
              )}
            </div>
          );
        })()}
      </section>

      {/* Tabel Data Mahasiswa - Struktur Kompleks */}
      <section>
        <header className="pb-6 mb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Tabel 2.A.1 Data Mahasiswa</h1>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-slate-500">
              Data lengkap mahasiswa berdasarkan tahun akademik (TS-4, TS-3, TS-2, TS-1, TS).
            </p>
            {!loading && (() => {
              const unitProdiId = parseInt(selectedUnitProdi) || 4;
              const tableData = processDataForTable(unitProdiId);
              return (
                <span className="inline-flex items-center text-sm text-slate-700">
                  Total Data: <span className="ml-1 text-[#0384d6] font-bold text-base">{tableData.length}</span>
                </span>
              );
            })()}
          </div>
        </header>

        {/* Filter Unit Prodi */}
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <YearSelector 
              selectedYear={selectedYear} 
              setSelectedYear={setSelectedYear} 
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
                <th rowSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">TS</th>
                <th rowSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Daya Tampung</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Jumlah Calon Mahasiswa</th>
                <th colSpan={6} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Jumlah Mahasiswa Baru</th>
                <th colSpan={6} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Jumlah Mahasiswa Aktif</th>
              </tr>
              {/* Row 2: Sub-header */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                {/* TS dan Daya Tampung sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Pendaftar</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Pendaftar Afirmasi</th>
                <th rowSpan={2} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Pendaftar Kebutuhan Khusus</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Reguler</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">RPL</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Reguler</th>
                <th colSpan={3} className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">RPL</th>
              </tr>
              {/* Row 3: Header detail */}
              <tr className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
                {/* TS, Daya Tampung, Pendaftar, Pendaftar Afirmasi, Pendaftar Kebutuhan Khusus sudah di rowSpan, jadi tidak perlu th lagi di row ini */}
                {/* Di bawah "Reguler" (Mahasiswa Baru) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Kebutuhan Khusus</th>
                {/* Di bawah "RPL" (Mahasiswa Baru) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Kebutuhan Khusus</th>
                {/* Di bawah "Reguler" (Mahasiswa Aktif) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Kebutuhan Khusus</th>
                {/* Di bawah "RPL" (Mahasiswa Aktif) */}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Diterima</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Afirmasi</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase text-center border border-white">Kebutuhan Khusus</th>
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

        {/* Dropdown Menu Gabungan - Fixed Position */}
        {openDropdownIdGabungan !== null && (() => {
          // Cari row yang sesuai dengan openDropdownIdGabungan
          // Tabel gabungan menggunakan renderTable function
          const currentRow = rowsGabungan.find((r, idx) => {
            const rowId = getIdField(r) ? r[getIdField(r)] : idx;
            return rowId === openDropdownIdGabungan;
          });
          if (!currentRow) return null;
          
          // Tentukan table berdasarkan context
          const table = tablePend; // Default, bisa disesuaikan
          const canUpdate = roleCan(role, table.key, "U");
          const canDelete = roleCan(role, table.key, "D");
          const showDeleted = showDeletedPend; // Default, bisa disesuaikan
          
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
                    // Tentukan setEditing dan setForm berdasarkan context
                    setEditingPend(currentRow);
                    setFormPend(currentRow);
                    setShowModalPend(true);
                    setOpenDropdownIdGabungan(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0384d6] hover:bg-[#eaf3ff] hover:text-[#043975] transition-colors text-left"
                  aria-label={`Edit data gabungan`}
                >
                  <FiEdit2 size={16} className="flex-shrink-0 text-[#0384d6]" />
                  <span>Edit</span>
                </button>
              )}
              {!showDeleted && canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doDelete(currentRow, table);
                    setOpenDropdownIdGabungan(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                  aria-label={`Hapus data gabungan`}
                >
                  <FiTrash2 size={16} className="flex-shrink-0 text-red-600" />
                  <span>Hapus</span>
                </button>
              )}
              {showDeleted && canUpdate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doRestore(currentRow, table);
                    setOpenDropdownIdGabungan(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors text-left"
                  aria-label={`Pulihkan data gabungan`}
                >
                  <FiRotateCw size={16} className="flex-shrink-0 text-green-600" />
                  <span>Pulihkan</span>
                </button>
              )}
              {showDeleted && canDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doHardDelete(currentRow, table);
                    setOpenDropdownIdGabungan(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100 hover:text-red-800 transition-colors text-left font-medium"
                  aria-label={`Hapus permanen data gabungan`}
                >
                  <FiXCircle size={16} className="flex-shrink-0 text-red-700" />
                  <span>Hapus Permanen</span>
                </button>
              )}
            </div>
          );
        })()}
      </section>

      {/* Modal Form Pendaftaran */}
      {showModalPend && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModalPend(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 relative z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
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
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      <span className="relative z-10">Batal</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                  <button 
                      type="submit" 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      <span className="relative z-10">{loading?"Menyimpan...":"Simpan"}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Maba */}
      {showModalMaba && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[9999] pointer-events-auto"
          style={{ zIndex: 9999, backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModalPend(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl mx-4 relative z-[10000] pointer-events-auto"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
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
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white text-sm font-medium overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                      <span className="relative z-10">Batal</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </button>
                  <button 
                      type="submit" 
                      className="relative px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#0384d6] via-[#043975] to-[#0384d6] text-white text-sm font-semibold overflow-hidden group shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:ring-offset-2"
                      disabled={loading}
                  >
                      <span className="relative z-10">{loading?"Menyimpan...":"Simpan"}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
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

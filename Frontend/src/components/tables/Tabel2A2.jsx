import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh, Button, Modal } from "../ui";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Tabel2A2Form } from "../forms/Tabel2A2Form";

const Tabel2A2 = () => {
  const { user } = useAuth();
  const api = useApi();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [kabupatenKotaList, setKabupatenKotaList] = useState([]);

  const geographicalCategories = ["Sama Kota/Kab", "Kota/Kab Lain", "Provinsi Lain", "Negara Lain"];
  const specialCategories = ["Afirmasi", "Berkebutuhan Khusus"];
  const NAMA_KABUPATEN_KOTA_PS = "KABUPATEN BANYUWANGI";
  const NAMA_PROVINSI_PS = "JAWA TIMUR";

  const displayKategori = (value) => (value === "Sama Kota/Kab" ? "Kota/Kab sama dengan PS" : value);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [keragamanAsalData, tahunData, kabupatenKotaData] = await Promise.all([
        api.get("/tabel-2a2-keragaman-asal"),
        api.get("/tahun"),
        api.get("/ref-kabupaten-kota"),
      ]);
      setData(Array.isArray(keragamanAsalData) ? keragamanAsalData : []);
      setTahunList(Array.isArray(tahunData) ? tahunData.sort((a, b) => a.id_tahun - b.id_tahun) : []);
      setKabupatenKotaList(Array.isArray(kabupatenKotaData) ? kabupatenKotaData : []);
      if (Array.isArray(tahunData) && tahunData.length > 0) {
        const years = keragamanAsalData.map(x => Number(x?.id_tahun)).filter(Number.isFinite);
        const latest = years.length > 0 ? Math.max(...years) : Math.max(...tahunData.map(t => t.id_tahun));
        setSelectedTahun(latest);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh() }, [api]);

  const handleAddSubmit = async (formData) => {
    try {
      await api.post("/tabel-2a2-keragaman-asal", formData);
      await refresh();
      setIsModalOpen(false);
    } catch (e) {
      setError(e);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.put(`/tabel-2a2-keragaman-asal/${editingRow.id}`, formData);
      await refresh();
      setIsEditModalOpen(false);
      setEditingRow(null);
    } catch (e) {
      setError(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      await api.delete(`/tabel-2a2-keragaman-asal/${id}`);
      await refresh();
    } catch (e) {
      setError(e);
    }
  };

  const yearWindow = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => Number(selectedTahun) - i),
    [selectedTahun]
  );

  const filteredData = useMemo(() => {
    if (!selectedTahun || !user?.unit_id) return [];
    
    const currentYearData = data.filter(
      (item) => yearWindow.includes(Number(item.id_tahun)) && Number(item.id_unit_prodi) === Number(user.unit_id)
    );

    const aggregatedData = {};

    currentYearData.forEach(item => {
      // Proses untuk kategori spesial
      if (item.is_afirmasi) {
        const key = `Afirmasi-${item.id_tahun}`;
        if (!aggregatedData[key]) aggregatedData[key] = { ...item, kategori_asal: "Afirmasi", jumlah_mahasiswa: 0, _id: key };
        aggregatedData[key].jumlah_mahasiswa += Number(item.jumlah_mahasiswa) || 0;
      }
      if (item.is_kebutuhan_khusus) {
        const key = `Berkebutuhan Khusus-${item.id_tahun}`;
        if (!aggregatedData[key]) aggregatedData[key] = { ...item, kategori_asal: "Berkebutuhan Khusus", jumlah_mahasiswa: 0, _id: key };
        aggregatedData[key].jumlah_mahasiswa += Number(item.jumlah_mahasiswa) || 0;
      }

      // Semua data, termasuk yang spesial, akan diproses lagi di sini sebagai data geografis
      const geoKey = `${item.kategori_geografis}-${item.id_tahun}-${item.nama_daerah_input}`;
      if (!aggregatedData[geoKey]) {
          aggregatedData[geoKey] = { ...item, kategori_asal: item.kategori_geografis, jumlah_mahasiswa: 0, _id: geoKey };
      }
      aggregatedData[geoKey].jumlah_mahasiswa += Number(item.jumlah_mahasiswa) || 0;

      // Duplikasi untuk Provinsi Lain
      if (item.kategori_geografis === 'Kota/Kab Lain' && item.nama_daerah_input) {
          const foundKab = kabupatenKotaList.find(kab => kab.nama_kabupaten_kota.toLowerCase() === item.nama_daerah_input.toLowerCase());
          if (foundKab && foundKab.nama_provinsi.toLowerCase() !== NAMA_PROVINSI_PS.toLowerCase()) {
            const provKey = `Provinsi Lain-${item.id_tahun}-${foundKab.nama_provinsi}`;
            if (!aggregatedData[provKey]) {
              aggregatedData[provKey] = { ...item, kategori_asal: 'Provinsi Lain', nama_daerah_input: foundKab.nama_provinsi, jumlah_mahasiswa: 0, id: null, _id: provKey };
            }
            aggregatedData[provKey].jumlah_mahasiswa += Number(item.jumlah_mahasiswa) || 0;
          }
      }
    });

    return Object.values(aggregatedData);
  }, [data, selectedTahun, user?.unit_id, kabupatenKotaList, yearWindow]);
  
  const sumRowData = useMemo(() => {
    const totals = { 'TS': 0, 'TS-1': 0, 'TS-2': 0, 'TS-3': 0, 'TS-4': 0 };
    const relevantOriginalData = data.filter(item => 
        Number(item.id_unit_prodi) === Number(user?.unit_id) &&
        yearWindow.includes(Number(item.id_tahun))
    );
    relevantOriginalData.forEach(item => {
        const offset = Number(selectedTahun) - Number(item.id_tahun);
        const tsKey = offset === 0 ? 'TS' : `TS-${offset}`;
        totals[tsKey] += (Number(item.jumlah_mahasiswa) || 0);
    });
    return totals;
  }, [data, selectedTahun, user?.unit_id, yearWindow]);

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
      <div className="flex justify-between items-center bg-gray-100/60 dark:bg-gray-800/60 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tabel 2.A.2 Keragaman Asal Mahasiswa</h3>
        <div className="flex items-center space-x-2">
          <select value={selectedTahun || ''} onChange={(e) => setSelectedTahun(Number(e.target.value))} disabled={loading} className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="" disabled>Pilih Tahun</option>
            {tahunList.map((tahun) => <option key={tahun.id_tahun} value={tahun.id_tahun}>{tahun.tahun}</option>)}
          </select>
          <Button onClick={() => setIsModalOpen(true)} disabled={!selectedTahun || loading}>+ Tambah Data</Button>
        </div>
      </div>
      
      <Table className="w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          <TableRow className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
            <TableTh rowSpan="2" className="text-center border font-semibold tracking-wide align-middle">Asal Mahasiswa</TableTh>
            <TableTh colSpan="5" className="text-center border font-semibold tracking-wide">Jumlah Mahasiswa Baru</TableTh>
            <TableTh rowSpan="2" className="text-center border font-semibold tracking-wide align-middle">Link Bukti</TableTh>
            <TableTh rowSpan="2" className="text-center border font-semibold tracking-wide align-middle">Aksi</TableTh>
          </TableRow>
          <TableRow className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
            <TableTh className="text-center border font-semibold tracking-wide w-32">TS</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide w-32">TS-1</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide w-32">TS-2</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide w-32">TS-3</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide w-32">TS-4</TableTh>
          </TableRow>
        </TableHeadGroup>
        <TableBody>
          {geographicalCategories.map((kategori) => {
            const rowKeyPrefix = `${kategori.replace(/\s/g, '_')}`;
            const rowDataForKategori = filteredData.filter(item => item.kategori_asal === kategori);
            const detailRows = rowDataForKategori.filter(item => item.nama_daerah_input);

            // =============================================
            // PERUBAHAN DI BAGIAN INI
            // =============================================
            // Cari data spesifik untuk tahun TS (selectedTahun)
            const tsDataItem = rowDataForKategori.find(d => Number(d.id_tahun) === Number(selectedTahun));
            // =============================================
            // AKHIR DARI PERUBAHAN
            // =============================================

            return (
              <React.Fragment key={`${rowKeyPrefix}-group`}>
                <TableRow key={rowKeyPrefix} className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition">
                  <TableCell className="border font-medium">{displayKategori(kategori)}</TableCell>
                  {yearWindow.map((year, i) => {
                    const totalJumlah = rowDataForKategori
                      .filter(item => Number(item.id_tahun) === year)
                      .reduce((sum, item) => sum + (Number(item.jumlah_mahasiswa) || 0), 0);
                    return <TableCell key={i} className="border w-32 text-center align-middle">{totalJumlah > 0 ? totalJumlah : '-'}</TableCell>;
                  })}
                  <TableCell className="border text-center align-middle">
                    {/* Hanya tampilkan link bukti dari data TS */}
                    {kategori === 'Sama Kota/Kab' && tsDataItem?.link_bukti ? (
                      <a href={tsDataItem.link_bukti} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lihat Bukti</a>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="border text-center align-middle whitespace-nowrap">
                    {/* Hanya tampilkan tombol jika ada data di tahun TS */}
                    {kategori === 'Sama Kota/Kab' && tsDataItem?.id ? (
                      <>
                        <Button variant="soft" size="sm" onClick={() => { setEditingRow(tsDataItem); setIsEditModalOpen(true); }}>Edit</Button>
                        <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleDelete(tsDataItem.id)}>Hapus</Button>
                      </>
                    ) : '-'}
                  </TableCell>
                </TableRow>
                
                {kategori !== 'Sama Kota/Kab' && detailRows.map(item => (
                  <TableRow key={item._id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10">
                    <TableCell className="border text-gray-600 dark:text-gray-300">
                      <span className="pl-6 inline-block">{item.nama_daerah_input}</span>
                    </TableCell>
                    {yearWindow.map((year, i) => (
                      <TableCell key={i} className="border w-32 text-center align-middle">
                        {Number(item.id_tahun) === year ? (item.jumlah_mahasiswa || '-') : ''}
                      </TableCell>
                    ))}
                    <TableCell className="border text-center align-middle">
                      {item.link_bukti ? <a href={item.link_bukti} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lihat Bukti</a> : '-'}
                    </TableCell>
                    <TableCell className="border text-center align-middle whitespace-nowrap">
                      {/* ============================================= */}
                      {/* PERUBAHAN DI BAGIAN INI */}
                      {/* ============================================= */}
                      {/* Tampilkan tombol hanya jika item.id ada DAN tahunnya adalah tahun TS */}
                      {item.id && Number(item.id_tahun) === Number(selectedTahun) ? (
                        <>
                          <Button variant="soft" size="sm" onClick={() => { setEditingRow(item); setIsEditModalOpen(true); }}>Edit</Button>
                          <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleDelete(item.id)}>Hapus</Button>
                        </>
                      ) : '-'}
                      {/* ============================================= */}
                      {/* AKHIR DARI PERUBAHAN */}
                      {/* ============================================= */}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}

          {specialCategories.map(kategori => {
            const rowDataForKategori = filteredData.filter(item => item.kategori_asal === kategori);
            return (
              <TableRow key={kategori} className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition">
                <TableCell className="border font-medium">{kategori}</TableCell>
                {yearWindow.map((year, i) => {
                   const totalJumlah = rowDataForKategori
                      .filter(item => Number(item.id_tahun) === year)
                      .reduce((sum, item) => sum + (Number(item.jumlah_mahasiswa) || 0), 0);
                  return <TableCell key={i} className="border w-32 text-center align-middle">{totalJumlah > 0 ? totalJumlah : '-'}</TableCell>;
                })}
                <TableCell className="border text-center align-middle">-</TableCell>
                <TableCell className="border text-center align-middle whitespace-nowrap">-</TableCell>
              </TableRow>
            );
          })}

          <TableRow className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold">
            <TableCell className="border">Jumlah</TableCell>
            {Object.values(sumRowData).map((total, i) => <TableCell key={i} className="border w-32 text-center align-middle">{total || 0}</TableCell>)}
            <TableCell className="border"></TableCell>
            <TableCell className="border"></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Data Keragaman Asal">
         <Tabel2A2Form onSubmit={handleAddSubmit} onClose={() => setIsModalOpen(false)} initialTahun={selectedTahun} />
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Data Keragaman Asal">
        {editingRow && <Tabel2A2Form onSubmit={handleEditSubmit} onClose={() => setIsEditModalOpen(false)} initialData={editingRow} />}
      </Modal>
    </div>
  );
};

export default Tabel2A2;
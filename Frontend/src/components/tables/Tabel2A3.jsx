import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh, Button, Modal, InputField } from "../ui";

// Helper functions for building table headers
const seg = (n) => (n.key ? String(n.key) : String(n.label || "col")).replace(/\s+/g, "_");
const depth = (n) => (n.children ? 1 + Math.max(...n.children.map(depth)) : 1);
const colSpan = (n) => (n.children ? n.children.reduce((s, c) => s + colSpan(c), 0) : 1);

const buildHeaderRows = (tree) => {
  const treeMax = Math.max(...tree.map(depth));
  const rows = [];
  const walk = (nodes, d = 1, path = []) => {
    rows[d - 1] ||= [];
    nodes.forEach((n) => {
      const hasKids = !!n.children;
      const cs = colSpan(n);
      const rs = hasKids ? 1 : treeMax - d + 1;
      const keyPath = [...path, seg(n)].join(">");
      rows[d - 1].push(
        <TableTh key={`th:${keyPath}:${d}`} colSpan={cs} rowSpan={rs} className="text-center border font-semibold tracking-wide">
          {(n.label || n.key)?.toUpperCase()}
        </TableTh>
      );
      if (hasKids) walk(n.children, d + 1, [...path, seg(n)]);
    });
  };
  walk(tree);
  return rows;
};

const flattenLeaves = (tree) => {
  const out = [];
  const walk = (nodes, path = []) => {
    nodes.forEach((n) => {
      const p = [...path, seg(n)];
      if (n.children) walk(n.children, p);
      else out.push({ ...n, __path: p.join(">") });
    });
  };
  walk(tree);
  return out;
};

// Komponen Form untuk Tambah/Edit data Lulus & DO
function KondisiMahasiswaForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({ jml_lulus: 0, jml_do: 0, ...initialData });

  useEffect(() => {
    setFormData({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Jumlah Lulus pada saat TS" type="number" name="jml_lulus"
        value={formData.jml_lulus} onChange={handleChange} placeholder="Masukkan jumlah" required
      />
      <InputField
        label="Jumlah Mengundurkan Diri/DO pada saat TS" type="number" name="jml_do"
        value={formData.jml_do} onChange={handleChange} placeholder="Masukkan jumlah" required
      />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
        <Button type="submit" variant="primary">Simpan</Button>
      </div>
    </form>
  );
}


export function Tabel2A3() {
  const { user } = useAuth();
  const api = useApi();

  const [mahasiswaConditions, setMahasiswaConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingData, setEditingData] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mc, t] = await Promise.all([
        api.get(`/tabel2a3-kondisi-mahasiswa?timestamp=${new Date().getTime()}`),
        api.get("/tahun-akademik"),
      ]);
      setMahasiswaConditions(Array.isArray(mc) ? mc : []);
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);
      const years = [...mc].map((x) => Number(x?.id_tahun)).filter((n) => Number.isFinite(n));
      const latest = years.length === 0 ? new Date().getFullYear() : Math.max(...years);
      setSelectedTahun(latest);
    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [api]);

  const currentYearLulusDoData = useMemo(() => {
    if (!selectedTahun || !user?.unit_id) return null;
    const lulusRecord = mahasiswaConditions.find(d => d.id_tahun === selectedTahun && d.id_unit_prodi === user.unit_id && d.jenis_mahasiswa === 'lulus');
    const doRecord = mahasiswaConditions.find(d => d.id_tahun === selectedTahun && d.id_unit_prodi === user.unit_id && d.jenis_mahasiswa === 'mengundurkan_diri');
    if (!lulusRecord && !doRecord) return null;
    return {
      id: lulusRecord?.id || doRecord?.id,
      id_tahun: selectedTahun,
      id_unit_prodi: user.unit_id,
      jml_lulus: lulusRecord?.jumlah || 0,
      jml_do: doRecord?.jumlah || 0,
    };
  }, [mahasiswaConditions, selectedTahun, user?.unit_id]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingData({ id_tahun: selectedTahun, id_unit_prodi: user.unit_id, jml_lulus: 0, jml_do: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!currentYearLulusDoData) return;
    setModalMode('edit');
    setEditingData(currentYearLulusDoData);
    setIsModalOpen(true);
  };

  const handleHapus = async () => {
    if (!currentYearLulusDoData) return;
    if (confirm(`Yakin ingin menghapus data Lulus & DO untuk tahun ${selectedTahun}?`)) {
      try {
        await api.delete(`/tabel-2a3-kondisi-mahasiswa/${currentYearLulusDoData.id}`);
        await refresh();
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const payload = {
        id_tahun: formData.id_tahun,
        id_unit_prodi: formData.id_unit_prodi,
        jml_lulus: formData.jml_lulus,
        jml_do: formData.jml_do,
      };
      if (modalMode === 'add') {
        await api.post('/tabel-2a3-kondisi-mahasiswa', payload);
      } else {
        await api.put(`/tabel-2a3-kondisi-mahasiswa/${editingData.id}`, payload);
      }
      setIsModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err);
    }
  };

  const COLS_2A3 = useMemo(() => [
    { key: "kategori", label: "Kategori" }, { key: "ts", label: "TS" },
    { key: "ts_minus_1", label: "TS-1" }, { key: "ts_minus_2", label: "TS-2" },
    { key: "ts_minus_3", label: "TS-3" }, { key: "ts_minus_4", label: "TS-4" },
    { key: "jumlah", label: "Jumlah" },
  ], []);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2A3), [COLS_2A3]);
  const leaves = useMemo(() => flattenLeaves(COLS_2A3), [COLS_2A3]);

  const displayRows = useMemo(() => {
    if (!selectedTahun || !user?.unit_id) return [];
    const filteredData = mahasiswaConditions.filter(item => item.id_unit_prodi === user.unit_id);
    const aggregatedData = {};
    const categories = ["Mahasiswa Baru", "Mahasiswa Aktif pada saat TS", "Lulus pada saat TS", "Mengundurkan Diri/DO pada saat TS"];
    categories.forEach(category => {
      aggregatedData[category] = { kategori: category, ts: 0, ts_minus_1: 0, ts_minus_2: 0, ts_minus_3: 0, ts_minus_4: 0, jumlah: 0 };
    });
    filteredData.forEach(item => {
      const year = Number(item.id_tahun);
      const value = Number(item.jumlah) || 0;
      let key;
      if (item.jenis_mahasiswa === "baru") key = "Mahasiswa Baru";
      else if (item.jenis_mahasiswa === "aktif") key = "Mahasiswa Aktif pada saat TS";
      else if (item.jenis_mahasiswa === "lulus") key = "Lulus pada saat TS";
      else if (item.jenis_mahasiswa === "mengundurkan_diri") key = "Mengundurkan Diri/DO pada saat TS";
      if (key && aggregatedData[key]) {
        if (year === selectedTahun) aggregatedData[key].ts += value;
        else if (year === selectedTahun - 1) aggregatedData[key].ts_minus_1 += value;
        else if (year === selectedTahun - 2) aggregatedData[key].ts_minus_2 += value;
        else if (year === selectedTahun - 3) aggregatedData[key].ts_minus_3 += value;
        else if (year === selectedTahun - 4) aggregatedData[key].ts_minus_4 += value;
      }
    });
    Object.values(aggregatedData).forEach(row => {
      row.jumlah = row.ts + row.ts_minus_1 + row.ts_minus_2 + row.ts_minus_3 + row.ts_minus_4;
    });
    return Object.values(aggregatedData);
  }, [mahasiswaConditions, selectedTahun, user?.unit_id]);

  const renderBody = (rows, leaves) => rows.map((item, rowIndex) => (
    <TableRow key={`row-${rowIndex}`} className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10">
      {leaves.map((leaf) => {
        const val = item?.[leaf.key];
        const show = leaf.key === 'kategori' ? val : (Number.isFinite(Number(val)) ? Number(val) : 0);
        return <TableCell key={`cell-${leaf.key}-${rowIndex}`} className={`border align-middle ${leaf.key === "kategori" ? "text-left pl-4 font-medium" : "text-center"}`}>{show}</TableCell>;
      })}
    </TableRow>
  ));
  
  const renderSumRow = (rows, leaves) => {
    const totals = {};
    leaves.forEach(leaf => {
      if (leaf.key !== "kategori") {
        totals[leaf.key] = rows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
      }
    });
    return (
      <TableRow className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold">
        {leaves.map((leaf, i) => (
          <TableCell key={`sum-${i}`} className="text-center border align-middle">
            {leaf.key === "kategori" ? "Jumlah" : totals[leaf.key] ?? ""}
          </TableCell>
        ))}
      </TableRow>
    );
  };

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <>
      <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b">
          <h3 className="text-xl font-bold">Tabel 2.A.3 Kondisi Jumlah Mahasiswa</h3>
          <div className="flex items-center space-x-4">
            <select
              id="select-tahun"
              className="py-2 px-3 border border-gray-300 rounded-md shadow-sm bg-gray-700 text-white"
              value={selectedTahun || ''} onChange={(e) => setSelectedTahun(Number(e.target.value))} disabled={loading}
            >
              <option value="" disabled>Pilih Tahun</option>
              {tahunList.map((tahun) => <option key={tahun.id_tahun} value={tahun.id_tahun}>{tahun.tahun}</option>)}
            </select>
            {currentYearLulusDoData ? (
              <div className="flex items-center space-x-2">
                <Button onClick={handleOpenEditModal} variant="soft" disabled={loading}>Edit Data</Button>
                <Button onClick={handleHapus} variant="ghost" disabled={loading}>Hapus Data</Button>
              </div>
            ) : (
              <Button onClick={handleOpenAddModal} variant="primary" disabled={loading}>+ Tambah Data</Button>
            )}
          </div>
        </div>
        <Table className="min-w-full text-sm border-collapse border-0">
          <TableHeadGroup>
            {headerRows.map((cells, idx) => <TableRow key={`hdr-${idx}`} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">{cells}</TableRow>)}
          </TableHeadGroup>
          <TableBody>{renderBody(displayRows, leaves)}{renderSumRow(displayRows, leaves)}</TableBody>
        </Table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${modalMode === 'add' ? 'Tambah' : 'Edit'} Data Lulus & DO untuk Tahun ${selectedTahun}`}>
        <KondisiMahasiswaForm initialData={editingData} onSubmit={handleFormSubmit} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}

export default Tabel2A3;
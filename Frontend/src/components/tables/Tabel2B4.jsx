import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh, Button, Modal, InputField } from "../ui";
import { formatDecimal } from "../../lib/format";

// Helper functions for building table headers, copied from Tabel2A1.jsx for styling consistency.
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
        <TableTh
          key={`th:${keyPath}:${d}`}
          colSpan={cs}
          rowSpan={rs}
          className="text-center border font-semibold tracking-wide"
        >
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

// Form component for editing masa tunggu data
function MasaTungguForm({ initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    id_unit_prodi: '',
    id_tahun_lulus: '',
    jumlah_lulusan: 0,
    jumlah_terlacak: 0,
    rata_rata_waktu_tunggu_bulan: 0,
    ...initialData
  });

  useEffect(() => {
    setFormData({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Jumlah Lulusan" type="number" name="jumlah_lulusan"
        value={formData.jumlah_lulusan} onChange={handleChange} placeholder="Masukkan jumlah lulusan" required
      />
      <InputField
        label="Jumlah Terlacak" type="number" name="jumlah_terlacak"
        value={formData.jumlah_terlacak} onChange={handleChange} placeholder="Masukkan jumlah terlacak" required
      />
      <InputField
        label="Rata-rata Waktu Tunggu (Bulan)" type="number" step="0.1" name="rata_rata_waktu_tunggu_bulan"
        value={formData.rata_rata_waktu_tunggu_bulan} onChange={handleChange} placeholder="Masukkan rata-rata waktu tunggu" required
      />
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
        <Button type="submit" variant="primary">Simpan</Button>
      </div>
    </form>
  );
}

export function Tabel2B4() {
  const { user } = useAuth();
  const api = useApi();

  const [masaTungguData, setMasaTungguData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);
  
  // Modal and editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'add'

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mt, t] = await Promise.all([
        api.get("/tabel2b4-masa-tunggu"), // Endpoint untuk data masa tunggu
        api.get("/tahun-akademik"), // Endpoint untuk daftar tahun
      ]);
      setMasaTungguData(Array.isArray(mt) ? mt : []);
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);

      const years = [...mt]
        .map((x) => Number(x?.id_tahun_lulus))
        .filter((n) => Number.isFinite(n));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  // Handler functions
  const handleEdit = (item) => {
    // Find the actual data from masaTungguData
    const actualData = masaTungguData.find(d => 
      d.id_tahun_lulus === item.id_tahun_lulus && 
      (user?.role === "waket1" || d.id_unit_prodi === user?.unit_id)
    );
    
    if (actualData) {
      setEditingData(actualData);
      setModalMode('edit');
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (item) => {
    const actualData = masaTungguData.find(d => 
      d.id_tahun_lulus === item.id_tahun_lulus && 
      (user?.role === "waket1" || d.id_unit_prodi === user?.unit_id)
    );
    
    if (actualData && confirm(`Yakin ingin menghapus data masa tunggu untuk tahun ${item.id_tahun_lulus}?`)) {
      try {
        await api.delete(`/tabel2b4-masa-tunggu/${actualData.id}`);
        await refresh();
      } catch (err) {
        setError(err);
      }
    }
  };

  const handleAdd = () => {
    setEditingData({
      id_unit_prodi: user?.unit_id,
      id_tahun_lulus: selectedTahun,
      jumlah_lulusan: 0,
      jumlah_terlacak: 0,
      rata_rata_waktu_tunggu_bulan: 0
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'add') {
        await api.post('/tabel2b4-masa-tunggu', formData);
      } else {
        await api.put(`/tabel2b4-masa-tunggu/${editingData.id}`, formData);
      }
      setIsModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err);
    }
  };

  const COLS_2B4 = useMemo(() => [
    { key: "tahun_lulus_label", label: "Tahun Lulus" },
    { key: "jumlah_lulusan", label: "Jumlah Lulusan" },
    { key: "jumlah_terlacak", label: "Jumlah Lulusan yang Terlacak" },
    { key: "rata_rata_waktu_tunggu", label: "Rata-rata Waktu Tunggu (Bulan)" },
    { key: "aksi", label: "Aksi" },
  ], []);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2B4), [COLS_2B4]);
  const leaves = useMemo(() => flattenLeaves(COLS_2B4), [COLS_2B4]);

  const displayRows = useMemo(() => {
    if (!selectedTahun) return [];

    // Filter data based on user role
    const filteredData = masaTungguData.filter(item => {
      if (user?.role === "waket1") return true;
      return item.id_unit_prodi === user?.unit_id;
    });

    const yearsToShow = [];
    for (let i = 0; i <= 4; i++) { // TS, TS-1, TS-2, TS-3, TS-4
      yearsToShow.push(selectedTahun - i);
    }

    const rows = yearsToShow.map(year => {
      const dataForYear = filteredData.find(d => Number(d.id_tahun_lulus) === year);
      const tsLabel = year === selectedTahun ? "TS" : `TS-${selectedTahun - year}`;
      return {
        tahun_lulus_label: tsLabel,
        jumlah_lulusan: dataForYear?.jumlah_lulusan || 0,
        jumlah_terlacak: dataForYear?.jumlah_terlacak || 0,
        rata_rata_waktu_tunggu: dataForYear?.rata_rata_waktu_tunggu_bulan || 0,
        id_tahun_lulus: year,
      };
    });

    return rows.sort((a, b) => b.id_tahun_lulus - a.id_tahun_lulus);
  }, [masaTungguData, selectedTahun, user?.unit_id, user?.role]);

  const renderBody = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.id_tahun_lulus}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            
            // Handle action column
            if (leaf.key === "aksi") {
              return (
                <TableCell
                  key={cellKey}
                  className="text-center border align-middle whitespace-nowrap"
                >
                  <Button
                    variant="soft"
                    className="mr-2"
                    onClick={() => handleEdit(item)}
                    disabled={loading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(item)}
                    disabled={loading}
                  >
                    Hapus
                  </Button>
                </TableCell>
              );
            }
            
            const val = item?.[leaf.key];
            const num = typeof val === "number" ? val : Number(val);
            const show = Number.isFinite(num) ? formatDecimal(num) : val ?? 0;

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${leaf.key === "tahun_lulus_label" ? "text-left pl-4 font-medium text-gray-900 dark:text-white" : "text-center"}`}
              >
                {show}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  const renderSumRow = (rows, leaves) => {
    const totals = {};
    leaves.forEach((leaf) => {
      if (leaf.key === "tahun_lulus_label" || leaf.key === "rata_rata_waktu_tunggu") return; // Don't sum labels or average
      totals[leaf.key] = rows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
    });

    // Calculate average for rata_rata_waktu_tunggu
    const totalRataRata = rows.reduce((acc, r) => acc + (Number(r?.rata_rata_waktu_tunggu) || 0), 0);
    const countValidRataRata = rows.filter(r => Number.isFinite(Number(r?.rata_rata_waktu_tunggu)) && Number(r?.rata_rata_waktu_tunggu) !== 0).length;
    const averageRataRata = countValidRataRata > 0 ? (totalRataRata / countValidRataRata).toFixed(2) : 0;

    return (
      <TableRow className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold">
        {leaves.map((leaf, i) =>
          leaf.key === "tahun_lulus_label" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              Jumlah
            </TableCell>
          ) : leaf.key === "rata_rata_waktu_tunggu" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              {averageRataRata}
            </TableCell>
          ) : (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              {totals[leaf.key] ?? ""}
            </TableCell>
          )
        )}
      </TableRow>
    );
  };

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.B.4 Rata-rata Masa Tunggu Lulusan untuk Bekerja Pertama Kali</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="select-tahun" className="text-gray-700 dark:text-gray-300 font-medium">Pilih Tahun:</label>
            <select
              id="select-tahun"
              className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
              value={selectedTahun || ''}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
            >
              <option value="" disabled>Pilih Tahun</option>
              {tahunList.map((tahun) => (
                <option key={tahun.id_tahun} value={tahun.id_tahun}>
                  {tahun.tahun}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={loading || !selectedTahun}
          >
            + Tambah Data
          </Button>
        </div>
      </div>
      <Table className="min-w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          {headerRows.map((cells, idx) => (
            <TableRow
              key={`hdr:Tabel_2B4:${idx}`}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
            >
              {cells}
            </TableRow>
          ))}
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows, leaves)}{renderSumRow(displayRows, leaves)}</TableBody>
      </Table>
      
      {/* Modal for Edit/Add */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`${modalMode === 'add' ? 'Tambah' : 'Edit'} Data Masa Tunggu untuk Tahun ${selectedTahun}`}
      >
        <MasaTungguForm 
          initialData={editingData} 
          onSubmit={handleFormSubmit} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}

export default Tabel2B4;

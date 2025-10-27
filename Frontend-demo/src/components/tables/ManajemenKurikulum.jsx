import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh } from "../ui";

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

export function ManajemenKurikulum() {
  const { user } = useAuth();
  const api = useApi();

  // State untuk data
  const [tabel2b1Data, setTabel2b1Data] = useState({ columns: [], data: [] });
  const [tabel2b2Data, setTabel2b2Data] = useState({ columns: [], rows: [] });
  const [tabel2b3Data, setTabel2b3Data] = useState({ semesters: [], rows: [] });
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('2b1');

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data2b1, data2b2, data2b3] = await Promise.all([
        api.get("/pemetaan-2b1"),
        api.get("/pemetaan-2b2"),
        api.get("/pemetaan-2b3")
      ]);
      
      setTabel2b1Data(data2b1 || { columns: [], data: [] });
      setTabel2b2Data(data2b2 || { columns: [], rows: [] });
      setTabel2b3Data(data2b3 || { semesters: [], rows: [] });

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

  // Konfigurasi kolom untuk Tabel 2B1
  const COLS_2B1 = useMemo(() => [
    { key: "kode_mk", label: "Kode MK" },
    { key: "nama_mk", label: "Nama Mata Kuliah" },
    { key: "sks", label: "SKS" },
    { key: "semester", label: "Semester" },
    ...tabel2b1Data.columns.map(col => ({ key: `pl_${col}`, label: col }))
  ], [tabel2b1Data.columns]);

  // Konfigurasi kolom untuk Tabel 2B2
  const COLS_2B2 = useMemo(() => [
    { key: "kode_cpl", label: "CPL" },
    ...tabel2b2Data.columns.map(col => ({ key: `pl_${col}`, label: col }))
  ], [tabel2b2Data.columns]);

  // Konfigurasi kolom untuk Tabel 2B3
  const COLS_2B3 = useMemo(() => [
    { key: "kode_cpl", label: "CPL" },
    { key: "kode_cpmk", label: "CPMK" },
    ...tabel2b3Data.semesters.map(sem => ({ key: `sem_${sem}`, label: `Sem ${sem}` }))
  ], [tabel2b3Data.semesters]);

  const headerRows2b1 = useMemo(() => buildHeaderRows(COLS_2B1), [COLS_2B1]);
  const headerRows2b2 = useMemo(() => buildHeaderRows(COLS_2B2), [COLS_2B2]);
  const headerRows2b3 = useMemo(() => buildHeaderRows(COLS_2B3), [COLS_2B3]);

  const leaves2b1 = useMemo(() => flattenLeaves(COLS_2B1), [COLS_2B1]);
  const leaves2b2 = useMemo(() => flattenLeaves(COLS_2B2), [COLS_2B2]);
  const leaves2b3 = useMemo(() => flattenLeaves(COLS_2B3), [COLS_2B3]);

  // Render body untuk Tabel 2B1
  const renderBody2b1 = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-2b1-${item.id_mk}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let val = item?.[leaf.key];
            
            // Handle PL columns
            if (leaf.key.startsWith('pl_')) {
              const plCode = leaf.key.replace('pl_', '');
              val = item.profil_lulusan?.[plCode] ? '✓' : '';
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${
                  leaf.key === 'kode_mk' || leaf.key === 'nama_mk' 
                    ? "text-left pl-4 font-medium text-gray-900 dark:text-white" 
                    : "text-center"
                }`}
              >
                {val ?? ''}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  // Render body untuk Tabel 2B2
  const renderBody2b2 = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-2b2-${item.kode_cpl}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let val = item?.[leaf.key];
            
            // Handle PL columns
            if (leaf.key.startsWith('pl_')) {
              const plCode = leaf.key.replace('pl_', '');
              val = item.row?.[plCode] ? '✓' : '';
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${
                  leaf.key === 'kode_cpl' 
                    ? "text-left pl-4 font-medium text-gray-900 dark:text-white" 
                    : "text-center"
                }`}
              >
                {val ?? ''}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  // Render body untuk Tabel 2B3
  const renderBody2b3 = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-2b3-${item.kode_cpl}-${item.kode_cpmk}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let val = item?.[leaf.key];
            
            // Handle semester columns
            if (leaf.key.startsWith('sem_')) {
              const semester = leaf.key.replace('sem_', '');
              val = item.semester_map?.[semester]?.join(', ') || '';
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${
                  leaf.key === 'kode_cpl' || leaf.key === 'kode_cpmk'
                    ? "text-left pl-4 font-medium text-gray-900 dark:text-white" 
                    : "text-center"
                }`}
              >
                {val ?? ''}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error: {String(error?.message || error)}</div>;

  return (
    <div className="space-y-6">
      {/* Header dengan Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Manajemen Kurikulum
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Pengelolaan pemetaan kurikulum antara Mata Kuliah, CPL, CPMK, dan Profil Lulusan
          </p>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('2b1')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === '2b1'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Tabel 2B.1 - Isi Pembelajaran
            </button>
            <button
              onClick={() => setActiveTab('2b2')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === '2b2'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Tabel 2B.2 - CPL vs PL
            </button>
            <button
              onClick={() => setActiveTab('2b3')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === '2b3'
                  ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Tabel 2B.3 - CPL vs MK
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === '2b1' && (
            <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tabel 2.B.1 - Isi Pembelajaran (Mata Kuliah vs Profil Lulusan)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pemetaan mata kuliah terhadap profil lulusan melalui CPMK dan CPL
                </p>
              </div>
              <Table className="min-w-full text-sm border-collapse border-0">
                <TableHeadGroup>
                  {headerRows2b1.map((cells, idx) => (
                    <TableRow
                      key={`hdr:Tabel_2B1:${idx}`}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
                    >
                      {cells}
                    </TableRow>
                  ))}
                </TableHeadGroup>
                <TableBody>
                  {renderBody2b1(tabel2b1Data.data, leaves2b1)}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === '2b2' && (
            <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tabel 2.B.2 - Pemetaan CPL vs Profil Lulusan
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Matriks pemetaan Capaian Pembelajaran Lulusan (CPL) terhadap Profil Lulusan (PL)
                </p>
              </div>
              <Table className="min-w-full text-sm border-collapse border-0">
                <TableHeadGroup>
                  {headerRows2b2.map((cells, idx) => (
                    <TableRow
                      key={`hdr:Tabel_2B2:${idx}`}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
                    >
                      {cells}
                    </TableRow>
                  ))}
                </TableHeadGroup>
                <TableBody>
                  {renderBody2b2(tabel2b2Data.rows, leaves2b2)}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === '2b3' && (
            <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tabel 2.B.3 - Peta Pemenuhan CPL
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Distribusi mata kuliah per semester untuk memenuhi CPL melalui CPMK
                </p>
              </div>
              <Table className="min-w-full text-sm border-collapse border-0">
                <TableHeadGroup>
                  {headerRows2b3.map((cells, idx) => (
                    <TableRow
                      key={`hdr:Tabel_2B3:${idx}`}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
                    >
                      {cells}
                    </TableRow>
                  ))}
                </TableHeadGroup>
                <TableBody>
                  {renderBody2b3(tabel2b3Data.rows, leaves2b3)}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManajemenKurikulum;

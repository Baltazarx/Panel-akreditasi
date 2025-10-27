import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh, Button } from "../ui";
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

export function Tabel2B6() {
  const { user } = useAuth();
  const api = useApi();

  const [kepuasanPenggunaData, setKepuasanPenggunaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kp, t] = await Promise.all([
        api.get("/tabel2b6-kepuasan-pengguna"), // Endpoint for graduate user satisfaction data
        api.get("/tahun-akademik"), // Endpoint for year list
      ]);
      
      console.log("Fetched kepuasan pengguna data:", kp);
      console.log("User info:", user);
      
      // The API returns { data: [...], statistik: [...] }, so we need to extract the data array
      const kepuasanData = kp?.data || kp;
      setKepuasanPenggunaData(Array.isArray(kepuasanData) ? kepuasanData : []);
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);

      const years = Array.isArray(kepuasanData) ? [...kepuasanData]
        .map((x) => Number(x?.id_tahun))
        .filter((n) => Number.isFinite(n)) : [];
      const latest = years.length === 0 ? 2024 : Math.max(...years); // Default to 2024 since that's the latest data in DB
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

  const COLS_2B6 = useMemo(() => [
    { key: "no", label: "No" },
    { key: "jenis_kemampuan", label: "Jenis Kemampuan" },
    {
      label: "Tingkat Kepuasan Pengguna (%)",
      children: [
        { key: "sangat_baik", label: "Sangat Baik" },
        { key: "baik", label: "Baik" },
        { key: "cukup", label: "Cukup" },
        { key: "kurang", label: "Kurang" },
      ],
    },
    { key: "rencana_tindak_lanjut", label: "Rencana Tindak Lanjut oleh UPPS/PS" },
    { key: "aksi", label: "Aksi" },
  ], []);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2B6), [COLS_2B6]);
  const leaves = useMemo(() => flattenLeaves(COLS_2B6), [COLS_2B6]);


  const displayRows = useMemo(() => {
    console.log("displayRows - selectedTahun:", selectedTahun);
    console.log("displayRows - kepuasanPenggunaData:", kepuasanPenggunaData);
    console.log("displayRows - user:", user);
    
    if (!selectedTahun) return [];

    // Filter data based on user role
    const filteredData = kepuasanPenggunaData.filter(item => {
      if (user?.role === "waket1") return Number(item.id_tahun) === Number(selectedTahun);
      return Number(item.id_tahun) === Number(selectedTahun) && item.id_unit_prodi === user?.unit_id;
    });

    console.log("displayRows - filteredData:", filteredData);

    // Use actual data from database instead of fixed categories
    return filteredData.map((item, index) => ({
      no: index + 1,
      jenis_kemampuan: item.jenis_kemampuan,
      sangat_baik: item.persen_sangat_baik || 0,
      baik: item.persen_baik || 0,
      cukup: item.persen_cukup || 0,
      kurang: item.persen_kurang || 0,
      rencana_tindak_lanjut: item.rencana_tindak_lanjut || "",
    }));
  }, [kepuasanPenggunaData, selectedTahun, user?.unit_id, user?.role]);

  const renderBody = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.no}-${rowIndex}`;
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
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log("Edit item:", item);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // TODO: Implement delete functionality
                      console.log("Delete item:", item);
                    }}
                  >
                    Hapus
                  </Button>
                </TableCell>
              );
            }
            
            const val = item?.[leaf.key];
            const num = typeof val === "number" ? val : Number(val);
            let content = Number.isFinite(num) ? formatDecimal(num) : val ?? "";

            // For Rencana Tindak Lanjut, display text directly
            if (leaf.key === "rencana_tindak_lanjut") {
              content = item.rencana_tindak_lanjut || "";
            } else if (leaf.key === "jenis_kemampuan") {
                content = item.jenis_kemampuan;
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${leaf.key === "jenis_kemampuan" || leaf.key === "rencana_tindak_lanjut" ? "text-left pl-4 font-medium text-gray-900 dark:text-white" : "text-center"}`}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  const renderSumRow = (rows, leaves) => {
    const totals = {};
    leaves.forEach((leaf) => {
      if (["no", "jenis_kemampuan", "rencana_tindak_lanjut", "aksi"].includes(leaf.key)) return; // Don't sum these columns
      totals[leaf.key] = rows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
    });

    return (
      <TableRow className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold">
        {leaves.map((leaf, i) =>
          leaf.key === "no" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              Jumlah
            </TableCell>
          ) : leaf.key === "jenis_kemampuan" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-left pl-4 border align-middle">
              {/* Kosong untuk jenis kemampuan di baris jumlah */}
            </TableCell>
          ) : leaf.key === "rencana_tindak_lanjut" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-left pl-4 border align-middle">
              {/* Kosong untuk rencana tindak lanjut di baris jumlah */}
            </TableCell>
          ) : leaf.key === "aksi" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              {/* Kosong untuk kolom aksi di baris jumlah */}
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

  // Separate state for summary values below the table
  const [summaryValues, setSummaryValues] = useState({
    jumlah_alumni_lulusan: 0,
    jumlah_pengguna_responden: 0,
    jumlah_mahasiswa_aktif: 0,
  });

  const refreshSummary = async () => {
    try {
      // Filter data based on user role
      const currentYearData = kepuasanPenggunaData.filter(item => {
        if (user?.role === "waket1") return Number(item.id_tahun) === Number(selectedTahun);
        return Number(item.id_tahun) === Number(selectedTahun) && Number(item.id_unit_prodi) === Number(user?.unit_id);
      });
      
      // Since the database doesn't have these fields, we'll set them to 0 or calculate from available data
      // In a real implementation, these would come from other tables or be calculated differently
      setSummaryValues({
        jumlah_alumni_lulusan: 0, // Would need to be calculated from other tables
        jumlah_pengguna_responden: currentYearData.length, // Number of survey responses
        jumlah_mahasiswa_aktif: 0, // Would need to be calculated from other tables
      });
    } catch (e) {
      console.error("Failed to calculate summary data:", e);
    }
  };

  useEffect(() => {
    if (selectedTahun) {
      refreshSummary();
    }
  }, [selectedTahun, api]);

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.B.6 Kepuasan Pengguna Lulusan</h3>
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
      </div>
      <Table className="min-w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          {headerRows.map((cells, idx) => (
            <TableRow
              key={`hdr:Tabel_2B6:${idx}`}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
            >
              {cells}
            </TableRow>
          ))}
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows, leaves)}{renderSumRow(displayRows, leaves)}</TableBody>
      </Table>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">Rekapitulasi:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
            <span className="text-sm text-gray-700 dark:text-gray-300">Jumlah alumni/lulusan dalam 3 tahun terakhir:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryValues.jumlah_alumni_lulusan}</span>
          </div>
          <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
            <span className="text-sm text-gray-700 dark:text-gray-300">Jumlah pengguna lulusan sebagai responden:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryValues.jumlah_pengguna_responden}</span>
          </div>
          <div className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 shadow-sm">
            <span className="text-sm text-gray-700 dark:text-gray-300">Jumlah mahasiswa aktif pada tahun TS:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{summaryValues.jumlah_mahasiswa_aktif}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tabel2B6;

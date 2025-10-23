import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh } from "../ui";

// Helper functions for building table headers, copied from Tabel2A1.jsx for styling consistency.
// These are retained for consistency, although the primary header structure is manually built for Tabel2C.
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

export function Tabel2C() {
  const { user } = useAuth();
  const api = useApi();

  const [fleksibilitasData, setFleksibilitasData] = useState([]);
  const [mahasiswaAktifTotalData, setMahasiswaAktifTotalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [flex, mabaAktif, t] = await Promise.all([
        api.get("/tabel2c-fleksibilitas-pembelajaran"), // Corrected endpoint for flexibility data
        api.get("/tabel2a1-mahasiswa-baru-aktif"), // Corrected endpoint for active students
        api.get("/tahun-akademik"), // Corrected endpoint for year list
      ]);
      setFleksibilitasData(Array.isArray(flex) ? flex : []);
      setMahasiswaAktifTotalData(Array.isArray(mabaAktif) ? mabaAktif : []);
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);

      const years = [...(Array.isArray(flex) ? flex : []), ...(Array.isArray(mabaAktif) ? mabaAktif : [])]
        .map((x) => Number(x?.id_tahun))
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

  // Define the main categories for Bentuk Pembelajaran
  const learningCategories = useMemo(() => [
    "Micro-credensial",
    "RPL tipe A-2",
    "Pembelajaran di PS lain",
    "Pembelajaran di PT lain",
    "CBL/PBL",
  ], []);

  const displayRows = useMemo(() => {
    if (!selectedTahun || !user?.unit_id) return [];

    const filteredFlexData = fleksibilitasData.filter(
      (item) => Number(item.id_tahun) === Number(selectedTahun) && item.id_unit_prodi === user.unit_id
    );

    // Aggregate total active students for TS, TS-1, TS-2
    const getAggregateMabaAktif = (year) => {
        const recordsForYear = mahasiswaAktifTotalData.filter(
            (item) => Number(item.id_tahun) === year && item.id_unit_prodi === user.unit_id
        );
        return recordsForYear.reduce((sum, record) => sum + (record.jumlah_diterima || 0), 0); // Assuming jumlah_diterima is the active count
    };

    const rows = [];

    // Row: Jumlah Mahasiswa Aktif
    rows.push({
      type: "mahasiswa_aktif",
      label: "Jumlah Mahasiswa Aktif",
      ts_minus_4: getAggregateMabaAktif(selectedTahun - 4),
      ts_minus_3: getAggregateMabaAktif(selectedTahun - 3),
      ts_minus_2: getAggregateMabaAktif(selectedTahun - 2),
      ts_minus_1: getAggregateMabaAktif(selectedTahun - 1),
      ts: getAggregateMabaAktif(selectedTahun),
      link_bukti: "",
    });

    // Row: Bentuk Pembelajaran header
    rows.push({
      type: "bentuk_pembelajaran_header",
      label: "Bentuk Pembelajaran",
      sub_header_span: "Jumlah mahasiswa untuk setiap bentuk pembelajaran",
    });

    // Rows for each learning category
    const totals = { ts_minus_4: 0, ts_minus_3: 0, ts_minus_2: 0, ts_minus_1: 0, ts: 0 };
    learningCategories.forEach(category => {
      const dataForCategory = filteredFlexData.find(d => d.jenis_pembelajaran === category);
      const row = {
        type: "learning_category",
        label: category,
        ts_minus_4: dataForCategory?.jumlah_ts_minus_4 || 0,
        ts_minus_3: dataForCategory?.jumlah_ts_minus_3 || 0,
        ts_minus_2: dataForCategory?.jumlah_ts_minus_2 || 0,
        ts_minus_1: dataForCategory?.jumlah_ts_minus_1 || 0,
        ts: dataForCategory?.jumlah_ts || 0,
        link_bukti: dataForCategory?.link_bukti || "",
      };
      rows.push(row);

      totals.ts_minus_4 += row.ts_minus_4;
      totals.ts_minus_3 += row.ts_minus_3;
      totals.ts_minus_2 += row.ts_minus_2;
      totals.ts_minus_1 += row.ts_minus_1;
      totals.ts += row.ts;
    });

    // Row: Jumlah
    rows.push({
      type: "sum",
      label: "Jumlah",
      ts_minus_2: totals.ts_minus_2,
      ts_minus_1: totals.ts_minus_1,
      ts: totals.ts,
      link_bukti: "",
    });

    // Row: Persentase
    const totalMabaAktifTS = rows[0].ts; // Get from the first row (Jumlah Mahasiswa Aktif)
    const totalMabaAktifTS_1 = rows[0].ts_minus_1;
    const totalMabaAktifTS_2 = rows[0].ts_minus_2;
    const totalMabaAktifTS_3 = rows[0].ts_minus_3;
    const totalMabaAktifTS_4 = rows[0].ts_minus_4;

    rows.push({
      type: "percentage",
      label: "Persentase",
      ts_minus_4: totalMabaAktifTS_4 > 0 ? ((totals.ts_minus_4 / totalMabaAktifTS_4) * 100).toFixed(2) : 0,
      ts_minus_3: totalMabaAktifTS_3 > 0 ? ((totals.ts_minus_3 / totalMabaAktifTS_3) * 100).toFixed(2) : 0,
      ts_minus_2: totalMabaAktifTS_2 > 0 ? ((totals.ts_minus_2 / totalMabaAktifTS_2) * 100).toFixed(2) : 0,
      ts_minus_1: totalMabaAktifTS_1 > 0 ? ((totals.ts_minus_1 / totalMabaAktifTS_1) * 100).toFixed(2) : 0,
      ts: totalMabaAktifTS > 0 ? ((totals.ts / totalMabaAktifTS) * 100).toFixed(2) : 0,
      link_bukti: "",
    });

    return rows;
  }, [fleksibilitasData, mahasiswaAktifTotalData, selectedTahun, user?.unit_id, learningCategories]);


  const renderBody = (rows) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.type}-${item.label}-${rowIndex}`;
      const isHeaderRow = item.type === "bentuk_pembelajaran_header";
      const isSumOrPercentageRow = item.type === "sum" || item.type === "percentage";

      return (
        <TableRow
          key={rowKey}
          className={`
            ${isHeaderRow ? "bg-gray-200 dark:bg-gray-700 font-semibold text-gray-900 dark:text-white" : ""}
            ${isSumOrPercentageRow ? "bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold" : ""}
            ${!isHeaderRow && !isSumOrPercentageRow && (rowIndex % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-gray-50 dark:bg-white/10')}
            hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition
          `}
        >
          {item.type === "mahasiswa_aktif" && (
            <>
              <TableCell className="border text-left pl-4 font-medium text-gray-900 dark:text-white" rowSpan={1}>{item.label}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_4}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_3}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_2}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_1}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts}</TableCell>
              <TableCell className="border text-center align-middle">{item.link_bukti}</TableCell>
            </>
          )}

          {isHeaderRow && (
            <>
              <TableCell className="border text-left pl-4 font-semibold text-gray-900 dark:text-white" rowSpan={1}>{item.label}</TableCell>
              <TableCell colSpan={5} className="border text-center align-middle font-semibold text-gray-900 dark:text-white">{item.sub_header_span}</TableCell>
              <TableCell className="border text-center align-middle"></TableCell>
            </>
          )}

          {item.type === "learning_category" && (
            <>
              <TableCell className="border text-left pl-4 font-medium text-gray-900 dark:text-white">{item.label}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_4}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_3}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_2}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts_minus_1}</TableCell>
              <TableCell className="border text-center align-middle">{item.ts}</TableCell>
              <TableCell className="border text-center align-middle">
                {item.link_bukti ? <a href={item.link_bukti} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">Lihat Bukti</a> : "-"}
              </TableCell>
            </>
          )}

          {isSumOrPercentageRow && (
            <>
              <TableCell className="border text-center align-middle">{item.label}</TableCell>
              <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_4}%` : item.ts_minus_4}</TableCell>
              <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_3}%` : item.ts_minus_3}</TableCell>
              <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_2}%` : item.ts_minus_2}</TableCell>
              <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_1}%` : item.ts_minus_1}</TableCell>
              <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts}%` : item.ts}</TableCell>
              <TableCell className="border text-center align-middle"></TableCell>
            </>
          )}
        </TableRow>
      );
    });

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran</h3>
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
          <TableRow className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
            <TableTh className="text-center border font-semibold tracking-wide">TAHUN AKADEMIK</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-4</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-3</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-2</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-1</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">LINK BUKTI</TableTh>
          </TableRow>
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows)}</TableBody>
      </Table>
    </div>
  );
}

export default Tabel2C;

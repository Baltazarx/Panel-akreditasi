import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh } from "../ui";

// Helper functions for building table headers, copied from Tabel2A1.jsx for styling consistency.
// These are retained for consistency, although the primary header structure is manually built for Tabel2D.
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

export function Tabel2D() {
  const { user } = useAuth();
  const api = useApi();

  const [rekognisiData, setRekognisiData] = useState([]);
  const [kondisiMahasiswaData, setKondisiMahasiswaData] = useState([]); // Changed from mahasiswaAktifTotalData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rek, kondisi, t] = await Promise.all([
        api.get("/tabel2d-rekognisi-lulusan"), // Corrected endpoint for recognition data
        api.get("/tabel2a3-kondisi-mahasiswa"), // Corrected endpoint for student condition data
        api.get("/tahun-akademik"), // Corrected endpoint for year list
      ]);
      setRekognisiData(Array.isArray(rek) ? rek : []);
      setKondisiMahasiswaData(Array.isArray(kondisi) ? kondisi : []); // Changed from setMahasiswaAktifTotalData
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);

      const years = [...(Array.isArray(rek) ? rek : []), ...(Array.isArray(kondisi) ? kondisi : [])]
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

  // Define the main categories for Sumber Rekognisi
  const recognitionSources = useMemo(() => [
    "Masyarakat",
    "Dunia Usaha",
    "Dunia Industri",
    "Dunia Kerja",
  ], []);

  const displayRows = useMemo(() => {
    if (!selectedTahun || !user?.unit_id) return [];

    const filteredRekData = rekognisiData.filter(
      (item) => Number(item.id_tahun) === Number(selectedTahun) && item.id_unit_prodi === user.unit_id
    );

    // Group recognition data by source and year for easier access
    const groupedRekognisi = filteredRekData.reduce((acc, item) => {
        if (!acc[item.sumber_rekognisi]) {
            acc[item.sumber_rekognisi] = {};
        }
        acc[item.sumber_rekognisi][item.id_tahun] = item;
        return acc;
    }, {});

    // Aggregate total active students for TS, TS-1, TS
    const getAggregateJumlahLulusan = (year) => {
        const recordsForYear = kondisiMahasiswaData.filter(
            (item) =>
                Number(item.id_tahun) === year &&
                item.id_unit_prodi === user.unit_id
        );
        return recordsForYear.reduce((sum, record) => sum + (record.jml_lulus || 0), 0); // Menggunakan jml_lulus
    };

    const rows = [];

    // Rows for each recognition source
    const totalRekognisi = { ts_minus_4: 0, ts_minus_3: 0, ts_minus_2: 0, ts_minus_1: 0, ts: 0 };
    recognitionSources.forEach(source => {
      const row = {
        type: "recognition_source",
        sumber_rekognisi: source,
        ts_minus_4: groupedRekognisi[source]?.[selectedTahun - 4]?.jumlah_rekognisi || 0,
        ts_minus_3: groupedRekognisi[source]?.[selectedTahun - 3]?.jumlah_rekognisi || 0,
        ts_minus_2: groupedRekognisi[source]?.[selectedTahun - 2]?.jumlah_rekognisi || 0,
        ts_minus_1: groupedRekognisi[source]?.[selectedTahun - 1]?.jumlah_rekognisi || 0,
        ts: groupedRekognisi[source]?.[selectedTahun]?.jumlah_rekognisi || 0,
        link_bukti: groupedRekognisi[source]?.[selectedTahun]?.link_bukti || "",
      };
      rows.push(row);

      totalRekognisi.ts_minus_4 += row.ts_minus_4;
      totalRekognisi.ts_minus_3 += row.ts_minus_3;
      totalRekognisi.ts_minus_2 += row.ts_minus_2;
      totalRekognisi.ts_minus_1 += row.ts_minus_1;
      totalRekognisi.ts += row.ts;
    });

    // Row: Jumlah Rekognisi
    rows.push({
      type: "sum_rekognisi",
      sumber_rekognisi: "Jumlah Rekognisi",
      ts_minus_4: totalRekognisi.ts_minus_4,
      ts_minus_3: totalRekognisi.ts_minus_3,
      ts_minus_2: totalRekognisi.ts_minus_2,
      ts_minus_1: totalRekognisi.ts_minus_1,
      ts: totalRekognisi.ts,
      link_bukti: "",
    });

    // Row: Jumlah Lulusan
    const jumlahLulusan = {
        ts_minus_4: getAggregateJumlahLulusan(selectedTahun - 4),
        ts_minus_3: getAggregateJumlahLulusan(selectedTahun - 3),
        ts_minus_2: getAggregateJumlahLulusan(selectedTahun - 2),
        ts_minus_1: getAggregateJumlahLulusan(selectedTahun - 1),
        ts: getAggregateJumlahLulusan(selectedTahun),
    }
    rows.push({
      type: "jumlah_lulusan",
      sumber_rekognisi: "Jumlah Lulusan",
      ts_minus_4: jumlahLulusan.ts_minus_4,
      ts_minus_3: jumlahLulusan.ts_minus_3,
      ts_minus_2: jumlahLulusan.ts_minus_2,
      ts_minus_1: jumlahLulusan.ts_minus_1,
      ts: jumlahLulusan.ts,
      link_bukti: "",
    });

    // Row: Persentase
    rows.push({
      type: "percentage",
      sumber_rekognisi: "Persentase",
      ts_minus_4: jumlahLulusan.ts_minus_4 > 0 ? ((totalRekognisi.ts_minus_4 / jumlahLulusan.ts_minus_4) * 100).toFixed(2) : 0,
      ts_minus_3: jumlahLulusan.ts_minus_3 > 0 ? ((totalRekognisi.ts_minus_3 / jumlahLulusan.ts_minus_3) * 100).toFixed(2) : 0,
      ts_minus_2: jumlahLulusan.ts_minus_2 > 0 ? ((totalRekognisi.ts_minus_2 / jumlahLulusan.ts_minus_2) * 100).toFixed(2) : 0,
      ts_minus_1: jumlahLulusan.ts_minus_1 > 0 ? ((totalRekognisi.ts_minus_1 / jumlahLulusan.ts_minus_1) * 100).toFixed(2) : 0,
      ts: jumlahLulusan.ts > 0 ? ((totalRekognisi.ts / jumlahLulusan.ts) * 100).toFixed(2) : 0,
      link_bukti: "",
    });

    return rows;
  }, [rekognisiData, kondisiMahasiswaData, selectedTahun, user?.unit_id, recognitionSources]);


  const renderBody = (rows) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.type}-${item.sumber_rekognisi}-${rowIndex}`;
      const isSumOrPercentageRow = item.type === "sum_rekognisi" || item.type === "jumlah_lulusan" || item.type === "percentage";

      return (
        <TableRow
          key={rowKey}
          className={`
            ${isSumOrPercentageRow ? "bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold" : ""}
            ${!isSumOrPercentageRow && (rowIndex % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-gray-50 dark:bg-white/10')}
            hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition
          `}
        >
          <TableCell className={`border align-middle ${isSumOrPercentageRow ? "text-center" : "text-left pl-4 font-medium text-gray-900 dark:text-white"}`}
            colSpan={isSumOrPercentageRow ? 1 : 1}
          >
            {item.sumber_rekognisi}
          </TableCell>

          {/* {item.type === "recognition_source" && (
            <TableCell className="border text-left pl-4 font-medium text-gray-900 dark:text-white">
              {item.jenis_pengakuan}
            </TableCell>
          )} */}

          <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_4}%` : item.ts_minus_4}</TableCell>
          <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_3}%` : item.ts_minus_3}</TableCell>
          <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_2}%` : item.ts_minus_2}</TableCell>
          <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts_minus_1}%` : item.ts_minus_1}</TableCell>
          <TableCell className="border text-center align-middle">{item.type === "percentage" ? `${item.ts}%` : item.ts}</TableCell>

          <TableCell className="border text-center align-middle">
            {item.link_bukti ? <a href={item.link_bukti} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">Lihat Bukti</a> : "-"}
          </TableCell>
        </TableRow>
      );
    });

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.D Rekognisi dan Apresiasi Kompetensi Lulusan</h3>
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
            <TableTh className="text-center border font-semibold tracking-wide" rowSpan={2}>SUMBER REKOGNISI</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide" colSpan={5}>TAHUN AKADEMIK</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide" rowSpan={2}>LINK BUKTI</TableTh>
          </TableRow>
          <TableRow className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
            <TableTh className="text-center border font-semibold tracking-wide">TS-4</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-3</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-2</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS-1</TableTh>
            <TableTh className="text-center border font-semibold tracking-wide">TS</TableTh>
          </TableRow>
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows)}</TableBody>
      </Table>
    </div>
  );
}

export default Tabel2D;

import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh, Button, Modal, InputField } from "../ui";
import { PendaftaranForm } from "../forms/PendaftaranForm";
import { MabaAktifForm } from "../forms/MabaAktifForm";

export function Tabel2A1() {
  const { user } = useAuth();
  const api = useApi();

  const [pendaftaran, setPendaftaran] = useState([]);
  const [mabaAktif, setMabaAktif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMabaAktifModalOpen, setIsMabaAktifModalOpen] = useState(false);
  const [editingMabaAktifRow, setEditingMabaAktifRow] = useState(null);
  const [isMabaAktifEditModalOpen, setIsMabaAktifEditModalOpen] = useState(false);

  const [isAddIndividualMabaAktifModalOpen, setIsAddIndividualMabaAktifModalOpen] = useState(false);
  const [initialAddMabaAktifData, setInitialAddMabaAktifData] = useState(null);

  const [isDetailMabaAktifModalOpen, setIsDetailMabaAktifModalOpen] = useState(false);
  const [currentAggregatedMabaAktifRow, setCurrentAggregatedMabaAktifRow] = useState(null);

  const [selectedTahun, setSelectedTahun] = useState(null);
  const [tahunList, setTahunList] = useState([]);

  // --- create / refresh data
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, m, t] = await Promise.all([
        api.get("/tabel2a1-pendaftaran"),
        api.get("/tabel2a1-mahasiswa-baru-aktif"),
        api.get("/tahun-akademik"),
      ]);
      setPendaftaran(Array.isArray(p) ? p : []);
      setMabaAktif(Array.isArray(m) ? m : []);
      setTahunList(Array.isArray(t) ? t.sort((a, b) => a.id_tahun - b.id_tahun) : []);

      // Set selectedTahun ke latestTahun setelah tahunList dimuat
      const years = [...p, ...m]
        .map((x) => Number(x?.id_tahun))
        .filter((n) => Number.isFinite(n));
      const latest = years.length === 0 ? new Date().getFullYear() : Math.max(...years);
      setSelectedTahun(latest);

    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const handleAddSubmit = async (formData) => {
    try {
      // Tambahkan id_unit_prodi dari user yang sedang login
      const dataToSend = { ...formData, id_unit_prodi: user.unit_id, id_tahun: selectedTahun };
      await api.post("/tabel-2a1-pendaftaran", dataToSend);
      await refresh();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Failed to add data", e);
      setError(e);
    }
  };

  const handleAddMabaAktifSubmit = async (formData) => {
    try {
      const dataToSend = { ...formData, id_unit_prodi: user.unit_id, id_tahun: selectedTahun };
      await api.post("/tabel-2a1-mahasiswa-baru-aktif", dataToSend);
      await refresh();
      setIsMabaAktifModalOpen(false);
    } catch (e) {
      console.error("Failed to add new active student data", e);
      setError(e);
    }
  };

  const handleAddIndividualMabaAktif = async (formData) => {
    try {
      const dataToSend = { ...formData, id_unit_prodi: user.unit_id, id_tahun: initialAddMabaAktifData.id_tahun };
      delete dataToSend.daya_tampung; // Hapus daya_tampung agar tidak terkirim saat menambah data individual
      await api.post("/tabel-2a1-mahasiswa-baru-aktif", dataToSend);
      await refresh();
      setIsAddIndividualMabaAktifModalOpen(false);
      setInitialAddMabaAktifData(null);
    } catch (e) {
      console.error("Failed to add individual active student data", e);
      setError(e);
    }
  };

  const handleUpdateDayaTampung = async (id_unit_prodi, id_tahun, daya_tampung) => {
    try {
      setLoading(true);
      await api.put(
        "/tabel-2a1-mahasiswa-baru-aktif/daya-tampung",
        { id_unit_prodi, id_tahun, daya_tampung }
      );
      await refresh();
      setIsDetailMabaAktifModalOpen(false); // Tambahkan baris ini untuk menutup modal
    } catch (e) {
      console.error("Failed to update daya tampung", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const doEditMabaAktif = (row) => {
    setIsDetailMabaAktifModalOpen(false); // Tutup modal detail
    setEditingMabaAktifRow(row);
    setIsMabaAktifEditModalOpen(true);
  };

  const doDeleteMabaAktif = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      setLoading(true);
      await api.delete(`/tabel-2a1-mahasiswa-baru-aktif/${row.id}`);
      await refresh();
    } catch (e) {
      console.error("Failed to delete active student data", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const doDeleteMabaAktifAggregated = async (aggregatedRow) => {
    if (!confirm("Yakin hapus semua data mahasiswa aktif untuk tahun ini?")) return;
    try {
      setLoading(true);
      // Temukan semua catatan individual yang sesuai dengan id_unit_prodi dan id_tahun dari aggregatedRow
      const individualRecordsToDelete = mabaAktif.filter(
        (record) =>
          record.id_unit_prodi === aggregatedRow.id_unit_prodi &&
          record.id_tahun === aggregatedRow.id_tahun
      );

      // Hapus setiap catatan individual
      await Promise.all(
        individualRecordsToDelete.map((record) =>
          api.delete(`/tabel-2a1-mahasiswa-baru-aktif/${record.id}`)
        )
      );
      await refresh();
    } catch (e) {
      console.error("Failed to delete aggregated active student data", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const doEdit = (row) => {
    setEditingRow(row);
    setIsEditModalOpen(true);
  };

  const doDelete = async (row) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      setLoading(true);
      await api.delete(`/tabel-2a1-pendaftaran/${row.id}`);
      await refresh();
    } catch (e) {
      console.error("Failed to delete data", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // --- util role filter
  const filterByRole = (rows) => {
    if (user?.role === "waket-1") return rows;
    if (!user?.unit_id) return [];
    return rows.filter((x) => x.id_unit_prodi === user.unit_id);
  };

  // --- latest tahun across datasets (aman kalau ada string/number)
  const latestTahun = useMemo(() => {
    const years = [...pendaftaran, ...mabaAktif]
      .map((x) => Number(x?.id_tahun))
      .filter((n) => Number.isFinite(n));
    if (years.length === 0) return new Date().getFullYear();
    return Math.max(...years);
  }, [pendaftaran, mabaAktif]);

  // --- slicing keluaran: filter by selectedTahun saja
  const sliceByWindow = (rows) => {
    if (!selectedTahun) return [];
    const targetYears = [];
    for (let i = 0; i <= 4; i++) { // TS, TS-1, TS-2, TS-3, TS-4
      targetYears.push(Number(selectedTahun) - i);
    }
    return rows.filter((x) => targetYears.includes(Number(x.id_tahun)));
  };

  // Definisi pendaftaranRows (difilter tahun)
  const pendaftaranRows = useMemo(
    () => sliceByWindow(filterByRole(pendaftaran)).map(row => ({
      ...row,
      jumlah_pendaftar: row.pendaftar,
      calon_pendaftar_afirmasi: row.pendaftar_afirmasi,
      calon_pendaftar_kebutuhan_khusus: row.pendaftar_kebutuhan_khusus,
    })),
    [pendaftaran, user?.role, user?.unit_id, selectedTahun] // Dependensi termasuk selectedTahun
  );

  // Definisi mabaAktifRows (difilter tahun, diagregasi)
  const mabaAktifRows = useMemo(
    () => {
      const filtered = filterByRole(mabaAktif);
      const sliced = sliceByWindow(filtered);

      const aggregated = {};
      sliced.forEach(row => {
        const key = `${row.id_unit_prodi}-${row.id_tahun}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            id_unit_prodi: row.id_unit_prodi,
            id_tahun: row.id_tahun,
            daya_tampung: row.daya_tampung || 0, // Tambahkan daya_tampung
            maba_reguler_diterima: 0,
            maba_reguler_afirmasi: 0,
            maba_reguler_kebutuhan_khusus: 0,
            maba_rpl_diterima: 0,
            maba_rpl_afirmasi: 0,
            maba_rpl_kebutuhan_khusus: 0,
            aktif_reguler_diterima: 0,
            aktif_reguler_afirmasi: 0,
            aktif_reguler_kebutuhan_khusus: 0,
            aktif_rpl_diterima: 0,
            aktif_rpl_afirmasi: 0,
            aktif_rpl_kebutuhan_khusus: 0,
          };
        }

        const currentAgg = aggregated[key];
        if (row.jenis === 'baru') {
          if (row.jalur === 'reguler') {
            currentAgg.maba_reguler_diterima += (row.jumlah_diterima || 0);
            currentAgg.maba_reguler_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.maba_reguler_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          } else if (row.jalur === 'rpl') {
            currentAgg.maba_rpl_diterima += (row.jumlah_diterima || 0);
            currentAgg.maba_rpl_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.maba_rpl_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          }
        } else if (row.jenis === 'aktif') {
          if (row.jalur === 'reguler') {
            currentAgg.aktif_reguler_diterima += (row.jumlah_diterima || 0);
            currentAgg.aktif_reguler_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.aktif_reguler_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          } else if (row.jalur === 'rpl') {
            currentAgg.aktif_rpl_diterima += (row.jumlah_diterima || 0);
            currentAgg.aktif_rpl_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.aktif_rpl_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          }
        }
      });

      const mapped = Object.values(aggregated).filter(row => {
        return (
          row.maba_reguler_diterima > 0 || row.maba_reguler_afirmasi > 0 || row.maba_reguler_kebutuhan_khusus > 0 ||
          row.maba_rpl_diterima > 0 || row.maba_rpl_afirmasi > 0 || row.maba_rpl_kebutuhan_khusus > 0 ||
          row.aktif_reguler_diterima > 0 || row.aktif_reguler_afirmasi > 0 || row.aktif_reguler_kebutuhan_khusus > 0 ||
          row.aktif_rpl_diterima > 0 || row.aktif_rpl_afirmasi > 0 || row.aktif_rpl_kebutuhan_khusus > 0
        );
      });

      return mapped;
    },
    [mabaAktif, user?.role, user?.unit_id, selectedTahun] // Dependensi termasuk selectedTahun
  );

  // Definisi pendaftaranRowsUnfiltered (tidak difilter tahun)
  const pendaftaranRowsUnfiltered = useMemo(
    () => filterByRole(pendaftaran).map(row => ({
      ...row,
      jumlah_pendaftar: row.pendaftar,
      calon_pendaftar_afirmasi: row.pendaftar_afirmasi,
      calon_pendaftar_kebutuhan_khusus: row.pendaftar_kebutuhan_khusus,
    })),
    [pendaftaran, user?.role, user?.unit_id] // Tidak bergantung pada selectedTahun
  );

  // Definisi mabaAktifRowsUnfiltered (tidak difilter tahun, diagregasi)
  const mabaAktifRowsUnfiltered = useMemo(
    () => {
      const filtered = filterByRole(mabaAktif);

      const aggregated = {};
      filtered.forEach(row => {
        const key = `${row.id_unit_prodi}-${row.id_tahun}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            id_unit_prodi: row.id_unit_prodi,
            id_tahun: row.id_tahun,
            daya_tampung: row.daya_tampung || 0, // Tambahkan daya_tampung
            maba_reguler_diterima: 0,
            maba_reguler_afirmasi: 0,
            maba_reguler_kebutuhan_khusus: 0,
            maba_rpl_diterima: 0,
            maba_rpl_afirmasi: 0,
            maba_rpl_kebutuhan_khusus: 0,
            aktif_reguler_diterima: 0,
            aktif_reguler_afirmasi: 0,
            aktif_reguler_kebutuhan_khusus: 0,
            aktif_rpl_diterima: 0,
            aktif_rpl_afirmasi: 0,
            aktif_rpl_kebutuhan_khusus: 0,
          };
        }

        const currentAgg = aggregated[key];
        if (row.jenis === 'baru') {
          if (row.jalur === 'reguler') {
            currentAgg.maba_reguler_diterima += (row.jumlah_diterima || 0);
            currentAgg.maba_reguler_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.maba_reguler_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          } else if (row.jalur === 'rpl') {
            currentAgg.maba_rpl_diterima += (row.jumlah_diterima || 0);
            currentAgg.maba_rpl_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.maba_rpl_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          }
        } else if (row.jenis === 'aktif') {
          if (row.jalur === 'reguler') {
            currentAgg.aktif_reguler_diterima += (row.jumlah_diterima || 0);
            currentAgg.aktif_reguler_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.aktif_reguler_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          } else if (row.jalur === 'rpl') {
            currentAgg.aktif_rpl_diterima += (row.jumlah_diterima || 0);
            currentAgg.aktif_rpl_afirmasi += (row.jumlah_afirmasi || 0);
            currentAgg.aktif_rpl_kebutuhan_khusus += (row.jumlah_kebutuhan_khusus || 0);
          }
        }
      });

      const mapped = Object.values(aggregated).filter(row => {
        return (
          row.maba_reguler_diterima > 0 || row.maba_reguler_afirmasi > 0 || row.maba_reguler_kebutuhan_khusus > 0 ||
          row.maba_rpl_diterima > 0 || row.maba_rpl_afirmasi > 0 || row.maba_rpl_kebutuhan_khusus > 0 ||
          row.aktif_reguler_diterima > 0 || row.aktif_reguler_afirmasi > 0 || row.aktif_reguler_kebutuhan_khusus > 0 ||
          row.aktif_rpl_diterima > 0 || row.aktif_rpl_afirmasi > 0 || row.aktif_rpl_kebutuhan_khusus > 0
        );
      });

      return mapped;
    },
    [mabaAktif, user?.role, user?.unit_id] // Tidak bergantung pada selectedTahun
  );

  // Definisi gabunganRows (menggunakan versi unfiltered)
  const gabunganRows = useMemo(() => {
    const byKey = new Map();
    const k = (r) => `${r.id_unit_prodi}-${r.id_tahun}`;

    for (const r of pendaftaranRowsUnfiltered) {
      const mappedRow = {
        ...r,
        jumlah_pendaftar: r.pendaftar,
        calon_pendaftar_afirmasi: r.pendaftar_afirmasi,
        calon_pendaftar_kebutuhan_khusus: r.pendaftar_kebutuhan_khusus,
      };
      byKey.set(k(r), mappedRow);
    }

    for (const r of mabaAktifRowsUnfiltered) {
      const key = k(r);
      const current = byKey.get(key) || { id_unit_prodi: r.id_unit_prodi, id_tahun: r.id_tahun };

      current.daya_tampung = r.daya_tampung; // Tambahkan daya_tampung
      current.maba_reguler_diterima = r.maba_reguler_diterima;
      current.maba_reguler_afirmasi = r.maba_reguler_afirmasi;
      current.maba_reguler_kebutuhan_khusus = r.maba_reguler_kebutuhan_khusus;
      current.maba_rpl_diterima = r.maba_rpl_diterima;
      current.maba_rpl_afirmasi = r.maba_rpl_afirmasi;
      current.maba_rpl_kebutuhan_khusus = r.maba_rpl_kebutuhan_khusus;
      current.aktif_reguler_diterima = r.aktif_reguler_diterima;
      current.aktif_reguler_afirmasi = r.aktif_reguler_afirmasi;
      current.aktif_reguler_kebutuhan_khusus = r.aktif_reguler_kebutuhan_khusus;
      current.aktif_rpl_diterima = r.aktif_rpl_diterima;
      current.aktif_rpl_afirmasi = r.aktif_rpl_afirmasi;
      current.aktif_rpl_kebutuhan_khusus = r.aktif_rpl_kebutuhan_khusus;

      byKey.set(key, current);
    }

    return Array.from(byKey.values()).sort(
      (a, b) => Number(a.id_unit_prodi) - Number(b.id_unit_prodi) || Number(a.id_tahun) - Number(b.id_tahun)
    );
  }, [pendaftaranRowsUnfiltered, mabaAktifRowsUnfiltered]);

  // --- definisi kolom
  const trio = (prefix) => [
    { key: `${prefix}_diterima`, label: "Diterima" },
    { key: `${prefix}_afirmasi`, label: "Afirmasi" },
    { key: `${prefix}_kebutuhan_khusus`, label: "Kebutuhan Khusus" },
  ];

  const CALON = {
    label: "Jumlah Calon Mahasiswa",
    children: [
      { key: "jumlah_pendaftar", label: "Pendaftar" },
      { key: "calon_pendaftar_afirmasi", label: "Pendaftar Afirmasi" },
      { key: "calon_pendaftar_kebutuhan_khusus", label: "Pendaftar Kebutuhan Khusus" },
    ],
  };

  const BARU = {
    label: "Jumlah Mahasiswa Baru",
    children: [
      { label: "Reguler", children: trio("maba_reguler") },
      { label: "RPL", children: trio("maba_rpl") },
    ],
  };

  const AKTIF = {
    label: "Jumlah Mahasiswa Aktif",
    children: [
      { label: "Reguler", children: trio("aktif_reguler") },
      { label: "RPL", children: trio("aktif_rpl") },
    ],
  };

  const TS = { key: "tahun", label: "TS" };
  const DT = { key: "daya_tampung", label: "Daya Tampung" };
  const TAHUN_AKTUAL = { key: "id_tahun", label: "Tahun" };

  // komposisi untuk 3 tabel (tetap mengikuti permintaanmu)
  const COLS_PMB = [
    TAHUN_AKTUAL,
    TS,
    CALON,
    { key: "aksi", label: "Aksi" },
  ]; // pendaftaran saja
  const COLS_ALA = [TAHUN_AKTUAL, TS, DT, BARU, AKTIF, { key: "aksi", label: "Aksi" }]; // aktif saja
  const COLS_GAB = [TAHUN_AKTUAL, TS, DT, CALON, BARU, AKTIF]; // kombinasi

  // ====== util header rekursif + key unik path ======
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

  const tsLabel = (rowYear) => {
    const offset = Number(selectedTahun) - Number(rowYear);
    return offset === 0 ? "TS" : `TS-${offset}`;
  };

  const renderBody = (rows, leaves, cols) =>
    rows.map((item) => {
      // Buat kunci yang lebih unik untuk setiap baris
      const rowKey = item.id || `${item.id_unit_prodi}-${item.id_tahun}-${item.jenis || ''}-${item.jalur || ''}`;

      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            if (leaf.key === "tahun") {
              return (
                <TableCell key={cellKey} className="text-center border align-middle">
                  {tsLabel(item.id_tahun)}
                </TableCell>
              );
            } else if (leaf.key === "id_tahun") {
              return (
                <TableCell key={cellKey} className="text-center border align-middle">
                  {item.id_tahun}
                </TableCell>
              );
            } else if (leaf.key === "aksi") {
              // Logika aksi untuk Tabel 2.A.1 Data Mahasiswa (PMB)
              if (cols === COLS_PMB) {
                // Cek apakah ada data untuk tahun dan unit prodi ini di pendaftaranRows
                const hasPendaftaranData = pendaftaranRows.some(
                  (data) =>
                    Number(data.id_tahun) === Number(item.id_tahun) &&
                    data.id_unit_prodi === user.unit_id
                );

                return (
                  <TableCell
                    key={cellKey}
                    className="text-center border align-middle whitespace-nowrap"
                  >
                    {hasPendaftaranData ? (
                      <>
                        <Button
                          variant="soft"
                          className="mr-2"
                          onClick={() => doEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => doDelete(item)}>
                          Hapus
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedTahun(Number(item.id_tahun));
                          setIsModalOpen(true);
                        }}
                        disabled={!selectedTahun}
                      >
                        + Tambah
                      </Button>
                    )}
                  </TableCell>
                );
              } else if (cols === COLS_ALA) {
                // Logika aksi untuk Tabel 2.A.1 Data Mahasiswa (ALA)
                const hasMabaAktifData = mabaAktifRows.some(
                  (data) =>
                    Number(data.id_tahun) === Number(item.id_tahun) &&
                    data.id_unit_prodi === user.unit_id
                );

                return (
                  <TableCell
                    key={cellKey}
                    className="text-center border align-middle whitespace-nowrap"
                  >
                    {hasMabaAktifData ? (
                      <>
                        <Button
                          variant="soft"
                          className="mr-2"
                          onClick={() => {
                            setCurrentAggregatedMabaAktifRow(item);
                            setIsDetailMabaAktifModalOpen(true);
                          }}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => doDeleteMabaAktifAggregated(item)}
                        >
                          Hapus
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedTahun(Number(item.id_tahun));
                          setIsMabaAktifModalOpen(true);
                        }}
                        disabled={!selectedTahun}
                      >
                        + Tambah
                      </Button>
                    )}
                  </TableCell>
                );
              }
              return null; // Atau berikan fallback jika tidak sesuai dengan COLS_PMB atau COLS_ALA
            }
            // amanin nilai undefined/null → tampilkan 0 untuk numerik
            const val = item?.[leaf.key];
            const num = typeof val === "number" ? val : Number(val);
            const show = Number.isFinite(num) ? num : val ?? 0;
            return (
              <TableCell key={cellKey} className="text-center border align-middle">
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
      if (leaf.key === "tahun") return;
      totals[leaf.key] = rows.reduce((acc, r) => acc + (Number(r?.[leaf.key]) || 0), 0);
    });
    return (
      <TableRow className="bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white font-semibold">
        {leaves.map((leaf, i) =>
          leaf.key === "tahun" ? (
            <TableCell key={`sum:${leaf.__path}:${i}`} className="text-center border align-middle">
              Jumlah
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

  // builder generik satu tabel (rows disuplai sesuai jenis tabel)
  const TableBlock = ({ title, cols, rows, onAdd, doEdit, doDelete, tahunList = [], selectedTahun, onTahunChange, showYearDropdown = true }) => {
    const headerRows = useMemo(() => buildHeaderRows(cols), [cols]);
    const leaves = useMemo(() => flattenLeaves(cols), [cols]);

    const displayRows = useMemo(() => {
      if (!showYearDropdown) {
        // Jika dropdown tahun disembunyikan, tampilkan semua baris yang diberikan
        return rows.sort((a, b) => Number(b.id_tahun) - Number(a.id_tahun));
      }
      if (!selectedTahun) return [];

      const yearsToShow = [];
      for (let i = 0; i <= 4; i++) {
        yearsToShow.push(selectedTahun - i);
      }

      const baseRows = yearsToShow.map(year => {
        const baseRow = { id_tahun: year };
        // Inisialisasi semua leaf keys ke 0, kecuali 'tahun', 'id_tahun', 'aksi'
        leaves.forEach(leaf => {
          if (leaf.key !== 'tahun' && leaf.key !== 'id_tahun' && leaf.key !== 'aksi') {
            baseRow[leaf.key] = 0; 
          }
        });
        return baseRow;
      });

      const mergedRows = baseRows.map(baseRow => {
        const existingData = rows.find(r => Number(r.id_tahun) === Number(baseRow.id_tahun));
        if (existingData) {
          return { ...baseRow, ...existingData };
        }
        return baseRow;
      });

      return mergedRows.sort((a, b) => Number(b.id_tahun) - Number(a.id_tahun));
    }, [selectedTahun, rows, leaves, showYearDropdown]);

    return (
      <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {showYearDropdown && (
            <div className="flex items-center space-x-2">
              <select
                className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                value={selectedTahun || ''}
                onChange={(e) => onTahunChange(Number(e.target.value))}
              >
                <option value="" disabled>Pilih Tahun</option>
                {tahunList.map((tahun) => (
                  <option key={tahun.id_tahun} value={tahun.id_tahun}>
                    {tahun.tahun}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <Table className="w-full text-sm border-collapse border-0">
          <TableHeadGroup>
            {headerRows.map((cells, idx) => (
              <TableRow
                key={`hdr:${title}:${idx}`}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
              >
                {cells}
              </TableRow>
            ))}
          </TableHeadGroup>
          <TableBody>{renderBody(displayRows, leaves, cols)}{renderSumRow(displayRows, leaves)}</TableBody>
        </Table>
      </div>
    );
  };

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <>
      {/* PMB: pendaftaran */}
      <TableBlock
        title="Tabel 2.A.1 Data Mahasiswa (PMB)"
        cols={COLS_PMB}
        rows={pendaftaranRows}
        onAdd={() => setIsModalOpen(true)}
        doEdit={doEdit}
        doDelete={doDelete}
        tahunList={tahunList}
        selectedTahun={selectedTahun}
        onTahunChange={setSelectedTahun}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Data Pendaftaran">
        <PendaftaranForm onSubmit={handleAddSubmit} onClose={() => setIsModalOpen(false)} initialTahun={selectedTahun} />
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Data Pendaftaran">
        {editingRow && (
          <PendaftaranForm
            onSubmit={async (formData) => {
              try {
                await api.put(`/tabel-2a1-pendaftaran/${Number(editingRow.id)}`, formData);
                await refresh();
                setIsEditModalOpen(false);
                setEditingRow(null);
              } catch (e) {
                console.error("Failed to update data", e);
                setError(e);
              }
            }}
            initialData={editingRow}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* ALA: mahasiswa aktif */}
      <TableBlock
        title="Tabel 2.A.1 Data Mahasiswa (ALA)"
        cols={COLS_ALA}
        rows={mabaAktifRows}
        onAdd={() => setIsMabaAktifModalOpen(true)}
        doEdit={doEditMabaAktif}
        doDelete={doDeleteMabaAktif}
        tahunList={tahunList}
        selectedTahun={selectedTahun}
        onTahunChange={setSelectedTahun}
      />

      <Modal isOpen={isMabaAktifModalOpen} onClose={() => setIsMabaAktifModalOpen(false)} title="Tambah Data Mahasiswa Aktif">
        <MabaAktifForm onSubmit={handleAddMabaAktifSubmit} onClose={() => setIsMabaAktifModalOpen(false)} initialTahun={selectedTahun} isNewEntry={true} />
      </Modal>

      <Modal isOpen={isMabaAktifEditModalOpen} onClose={() => setIsMabaAktifEditModalOpen(false)} title="Edit Data Mahasiswa Aktif">
        {editingMabaAktifRow && (
          <MabaAktifForm
            onSubmit={async (formData) => {
              try {
                await api.put(`/tabel-2a1-mahasiswa-baru-aktif/${Number(editingMabaAktifRow.id)}`, formData);
                await refresh();
                setIsMabaAktifEditModalOpen(false);
                setEditingMabaAktifRow(null);
                setIsDetailMabaAktifModalOpen(true); // Buka kembali modal detail
              } catch (e) {
                console.error("Failed to update active student data", e);
                setError(e);
              }
            }}
            initialData={editingMabaAktifRow}
            onClose={() => {
              setIsMabaAktifEditModalOpen(false);
              setIsDetailMabaAktifModalOpen(true);
            }}
          />
        )}
      </Modal>

      {/* Modal Detail Mahasiswa Aktif */}
      <Modal isOpen={isDetailMabaAktifModalOpen} onClose={() => setIsDetailMabaAktifModalOpen(false)} title="Detail Mahasiswa Aktif">
        {currentAggregatedMabaAktifRow && (
          <MabaAktifDetailModalContent
            aggregatedRow={currentAggregatedMabaAktifRow}
            allMabaAktif={mabaAktif}
            onClose={() => setIsDetailMabaAktifModalOpen(false)}
            onEdit={doEditMabaAktif}
            onDelete={doDeleteMabaAktif}
            onAddIndividual={(data) => {
              setInitialAddMabaAktifData(data);
              setIsAddIndividualMabaAktifModalOpen(true);
            }}
            onUpdateDayaTampung={handleUpdateDayaTampung}
          />
        )}
      </Modal>

      <Modal isOpen={isAddIndividualMabaAktifModalOpen} onClose={() => setIsAddIndividualMabaAktifModalOpen(false)} title="Tambah Data Mahasiswa Aktif Individu">
        {initialAddMabaAktifData && (
          <MabaAktifForm
            onSubmit={handleAddIndividualMabaAktif}
            onClose={() => setIsAddIndividualMabaAktifModalOpen(false)}
            initialData={initialAddMabaAktifData}
            isNewEntry={false}
          />
        )}
      </Modal>

      {/* Gabungan */}
      <TableBlock
        title="Tabel 2.A.1 Data Mahasiswa (Gabungan)"
        cols={COLS_GAB}
        rows={gabunganRows}
        showYearDropdown={false}
      />
    </>
  );
}

// Komponen internal untuk konten Modal Detail Mahasiswa Aktif
function MabaAktifDetailModalContent({ aggregatedRow, allMabaAktif, onClose, onEdit, onDelete, onAddIndividual, onUpdateDayaTampung }) {
  const [editableDayaTampung, setEditableDayaTampung] = useState(aggregatedRow.daya_tampung);

  useEffect(() => {
    setEditableDayaTampung(aggregatedRow.daya_tampung);
  }, [aggregatedRow.daya_tampung]);

  const individualRecords = useMemo(() => {
    if (!aggregatedRow) return [];
    return allMabaAktif.filter(
      (record) =>
        record.id_unit_prodi === aggregatedRow.id_unit_prodi &&
        record.id_tahun === aggregatedRow.id_tahun
    );
  }, [aggregatedRow, allMabaAktif]);

  const possibleCombinations = useMemo(() => {
    const jenisOptions = ['baru', 'aktif'];
    const jalurOptions = ['reguler', 'rpl'];
    const combinations = [];
    jenisOptions.forEach(jenis => {
      jalurOptions.forEach(jalur => {
        combinations.push({ jenis, jalur });
      });
    });
    return combinations;
  }, []);

  const existingCombinations = useMemo(() => {
    return new Set(individualRecords.map(record => `${record.jenis}-${record.jalur}`));
  }, [individualRecords]);

  const missingCombinations = useMemo(() => {
    return possibleCombinations.filter(combo => {
      const key = `${combo.jenis}-${combo.jalur}`;
      return !existingCombinations.has(key);
    });
  }, [possibleCombinations, existingCombinations]);

  const handleDayaTampungChange = (e) => {
    setEditableDayaTampung(e.target.value);
  };

  const handleSaveDayaTampung = async () => {
    // Hanya panggil update jika nilai daya_tampung benar-benar berubah
    if (onUpdateDayaTampung && Number(editableDayaTampung) !== Number(aggregatedRow.daya_tampung)) {
      await onUpdateDayaTampung(aggregatedRow.id_unit_prodi, aggregatedRow.id_tahun, editableDayaTampung);
    } else {
      // Jika tidak ada perubahan, tutup modal saja tanpa memanggil API
      onClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-2 mb-4">
        <InputField
          label="Daya Tampung"
          type="number"
          name="daya_tampung"
          value={editableDayaTampung}
          onChange={handleDayaTampungChange}
          placeholder="Masukkan Daya Tampung"
          required
        />
        <Button onClick={handleSaveDayaTampung} variant="primary" className="h-10 px-4 py-2 flex-shrink-0">
          Simpan
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 overflow-hidden">
        <Table className="w-full text-sm border-collapse border-0">
          <TableHeadGroup>
            <TableRow className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0">
              <TableTh className="border font-semibold tracking-wide">Jenis Mahasiswa</TableTh>
              <TableTh className="border font-semibold tracking-wide">Jalur Pendaftaran</TableTh>
              <TableTh className="border font-semibold tracking-wide">Jumlah Diterima</TableTh>
              <TableTh className="border font-semibold tracking-wide">Jumlah Afirmasi</TableTh>
              <TableTh className="border font-semibold tracking-wide">Jumlah Kebutuhan Khusus</TableTh>
              <TableTh className="border font-semibold tracking-wide">Aksi</TableTh>
            </TableRow>
          </TableHeadGroup>
          <TableBody>{individualRecords.length === 0 && missingCombinations.length === 0 ?
              <TableRow>
                <TableCell colSpan="6" className="text-center py-4 text-gray-500">Tidak ada catatan individual.</TableCell>
              </TableRow>
            :
              <>
                {individualRecords.map((record, index) => (
                  <TableRow key={record.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-gray-50 dark:bg-white/10'} hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition`}>
                    <TableCell className="border text-center align-middle">{record.jenis}</TableCell>
                    <TableCell className="border text-center align-middle">{record.jalur}</TableCell>
                    <TableCell className="border text-center align-middle">{record.jumlah_diterima}</TableCell>
                    <TableCell className="border text-center align-middle">{record.jumlah_afirmasi}</TableCell>
                    <TableCell className="border text-center align-middle">{record.jumlah_kebutuhan_khusus}</TableCell>
                    <TableCell className="border whitespace-nowrap text-center align-middle">
                      <Button variant="soft" className="mr-2" onClick={() => {
                        onEdit(record);
                      }}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => onDelete(record)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {missingCombinations.map((combo, index) => (
                  <TableRow key={`${combo.jenis}-${combo.jalur}`} className={`${(individualRecords.length + index) % 2 === 0 ? 'bg-white dark:bg-white/5' : 'bg-gray-50 dark:bg-white/10'} hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition`}>
                    <TableCell className="border text-center align-middle text-gray-400">{combo.jenis} (belum ada)</TableCell>
                    <TableCell className="border text-center align-middle text-gray-400">{combo.jalur} (belum ada)</TableCell>
                    <TableCell className="border text-center align-middle text-gray-400">0</TableCell>
                    <TableCell className="border text-center align-middle text-gray-400">0</TableCell>
                    <TableCell className="border text-center align-middle text-gray-400">0</TableCell>
                    <TableCell className="border whitespace-nowrap text-center align-middle">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddIndividual({ ...combo, id_tahun: aggregatedRow.id_tahun, id_unit_prodi: aggregatedRow.id_unit_prodi })}
                      >
                        + Tambah
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            }</TableBody>
        </Table>
      </div>
      <Button onClick={onClose} className="w-full">Tutup</Button>
      <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-4 p-2 bg-indigo-50 dark:bg-gray-800 rounded-md shadow-sm text-center">
        Detail Mahasiswa Aktif untuk Tahun: {aggregatedRow.id_tahun}
      </p>
    </div>
  );
}

export default Tabel2A1;

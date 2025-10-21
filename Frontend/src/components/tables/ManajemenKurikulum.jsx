import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, Container, SectionTitle, Table, TableBody, TableCell, TableHeadGroup, TableRow, TableTh } from '../ui';
import MataKuliahForm from "../forms/MataKuliahForm";
import { Tabel2B3Form } from "../forms/Tabel2B3Form";
import { CplPlForm } from "../forms/CplPlForm"; // Import the new form
import { ProfilLulusanForm } from "../forms/ProfilLulusanForm"; // Import the new form
import { CplForm } from "../forms/CplForm"; // Import the new CplForm

// Helper functions (copied from Tabel2B1.jsx)
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

function Tabel2B1Content() {
  const { user } = useAuth();
  const api = useApi();

  const [isiPembelajaran, setIsiPembelajaran] = useState([]);
  const [profilLulusanList, setProfilLulusanList] = useState([]);
  const [cplList, setCplList] = useState([]); // Added state for CPL
  const [cpmkList, setCpmkList] = useState([]); // Added state for CPMK
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [selectedProdi, setSelectedProdi] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [cplMkMapping, setCplMkMapping] = useState([]); // Added state for CPL-MK mapping
  const [cplPlMapping, setCplPlMapping] = useState([]); // Added state for CPL-PL mapping
  const [cpmkCplMapping, setCpmkCplMapping] = useState([]); // Added state for CPMK-CPL mapping
  const [cpmkMkMapping, setCpmkMkMapping] = useState([]); // Added state for CPMK-MK mapping
  const [showCplPlForm, setShowCplPlForm] = useState(false); // New state for CplPlForm visibility
  const [showProfilLulusanForm, setShowProfilLulusanForm] = useState(false); // New state for ProfilLulusanForm visibility
  const [displayedProfilLulusan, setDisplayedProfilLulusan] = useState([]); // New state for filtered/sorted PLs
  const [maxPlCount, setMaxPlCount] = useState(0); // New state for max PL columns
  const [unitKerjaList, setUnitKerjaList] = useState([]); // New state for dynamic prodi dropdown

  const isWaketOrAdmin = ["superadmin", "waket-1", "waket-2"].includes(user?.role);
  const canPerformActions = isWaketOrAdmin; // Define canPerformActions here

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedProdi || !user) {
        setLoading(false);
        return;
      }

      let ip;

      // Always use selectedProdi for filtering mata kuliah data
      const apiUrl = `/mata-kuliah?id_unit_prodi=${selectedProdi}`;
      ip = await api.get(apiUrl);

      if (!ip) {
        console.error('Failed to fetch mata kuliah data, ip is:', ip);
        setLoading(false);
        return;
      }

      setIsiPembelajaran(Array.isArray(ip) ? ip : []);

      console.log("Tabel 2B1 - mata kuliah data received:", ip?.map(mk => ({
        id_mk: mk.id_mk,
        nama_mk: mk.nama_mk,
        prodi: mk.id_unit_prodi,
        selectedPls: mk.selectedPls,
        relatedCpls: mk.relatedCpls
      })));

      const [cpl, pl, cpmk, cplMkMapping, cplPlMapping, cpmkCplMapping, cpmkMkMapping, unitKerja] = await Promise.all([
        api.get(`/cpl?id_unit_prodi=${selectedProdi}`), // Added CPL fetching
        api.get(`/profil-lulusan?id_unit_prodi=${selectedProdi}`),
        api.get("/cpmk"),
        api.get(`/map-cpl-mk?id_unit_prodi=${selectedProdi}`),
        api.get(`/map-cpl-pl?id_unit_prodi=${selectedProdi}`),
        api.get("/map-cpmk-cpl"),
        api.get("/map-cpmk-mk"),
        api.get("/unit-kerja"), // Fetch unit kerja
      ]);


      let currentCpl = Array.isArray(cpl) ? cpl : [];
      let currentPls = Array.isArray(pl) ? pl : [];
      let currentCpmk = Array.isArray(cpmk) ? cpmk : [];

      setCplList(currentCpl);
      setProfilLulusanList(currentPls);
      setCpmkList(currentCpmk);
      setCplMkMapping(Array.isArray(cplMkMapping) ? cplMkMapping : []);
      setCplPlMapping(Array.isArray(cplPlMapping) ? cplPlMapping : []);
      setCpmkCplMapping(Array.isArray(cpmkCplMapping) ? cpmkCplMapping : []);
      setCpmkMkMapping(Array.isArray(cpmkMkMapping) ? cpmkMkMapping : []);
      setUnitKerjaList(Array.isArray(unitKerja) ? unitKerja.filter(unit => unit.nama_unit.startsWith('Prodi')) : []); // Filter for prodi units

    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    console.log("Edit MataKuliah: item data:", item);
    console.log("Edit MataKuliah: selectedPls:", item.selectedPls);
    console.log("Edit MataKuliah: current selectedProdi:", selectedProdi);
    console.log("Edit MataKuliah: item keys:", Object.keys(item));
    console.log("Edit MataKuliah: item kode_mk:", item.kode_mk);
    console.log("Edit MataKuliah: item nama_mk:", item.mata_kuliah);

    // Ensure the item has the correct prodi information
    const itemWithProdi = {
      ...item,
      // Make sure id_unit_prodi is included for the form
      id_unit_prodi: item.id_unit_prodi || selectedProdi
    };

    console.log("Edit MataKuliah: itemWithProdi:", itemWithProdi);

    setEditingItem(itemWithProdi);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus mata kuliah ini?")) {
      try {
        await api.delete(`/mata-kuliah/${id}`);
        refresh();
      } catch (error) {
        console.error("Gagal menghapus mata kuliah:", error);
        alert("Gagal menghapus mata kuliah. Silakan coba lagi.");
      }
    }
  };

  useEffect(() => {
    if (user && selectedProdi === null) {
      const initialProdi = user?.unit_id || user?.id_unit_prodi || 3;
      setSelectedProdi(initialProdi);
    } else if (selectedProdi !== null && user && api) {
      refresh();
    }
  }, [user, selectedProdi, api]);

  // Additional safety net for initial load
  useEffect(() => {
    if (user && api && selectedProdi === null) {
      const initialProdi = user?.unit_id || user?.id_unit_prodi || 3;
      setSelectedProdi(initialProdi);
    }
  }, [user, api, selectedProdi]);

  // Initialize displayedProfilLulusan when profilLulusanList changes
  useEffect(() => {
    if (profilLulusanList.length > 0 && selectedProdi) {
      const filteredAndSortedPls = profilLulusanList
        .filter(pl => Number(pl.id_unit_prodi) === Number(selectedProdi))
        .sort((a, b) => a.id_pl - b.id_pl);
      setDisplayedProfilLulusan(filteredAndSortedPls);
    }
  }, [profilLulusanList, selectedProdi]);

  // Effect to filter and sort profilLulusanList into displayedProfilLulusan
  useEffect(() => {
    let filteredAndSortedPls = profilLulusanList.sort((a, b) => a.id_pl - b.id_pl);

    filteredAndSortedPls = filteredAndSortedPls.filter(pl => Number(pl.id_unit_prodi) === Number(selectedProdi));

    setDisplayedProfilLulusan(filteredAndSortedPls);
  }, [profilLulusanList, selectedProdi]);

  // Effect to calculate maxPlCount
  useEffect(() => {
    let currentMax = 0;
    // Calculate max PL count for the selected prodi
    currentMax = displayedProfilLulusan.length;
    setMaxPlCount(currentMax);
  }, [profilLulusanList, selectedProdi, displayedProfilLulusan]);

  // Additional logging for debugging
  useEffect(() => {
    console.log("Tabel State updated:", {
      selectedProdi,
      profilLulusanListLength: profilLulusanList.length,
      displayedProfilLulusanLength: displayedProfilLulusan.length,
      maxPlCount
    });
  }, [selectedProdi, profilLulusanList.length, displayedProfilLulusan.length, maxPlCount]);

  const COLS_2B1 = useMemo(() => {
    const dynamicPLColumns = [];
    for (let i = 1; i <= maxPlCount; i++) {
      dynamicPLColumns.push({
        key: `pl_slot_${i}`,
        label: `PL${i}`,
      });
    }

    return [
      { key: "no", label: "No" },
      { key: "mata_kuliah", label: "Mata Kuliah" },
      { key: "sks", label: "SKS" },
      { key: "semester", label: "Semester" },
      {
        label: "Profil Lulusan (PL)",
        children: dynamicPLColumns.length > 0 ? dynamicPLColumns : [{ key: "placeholder_pl", label: "..." }],
      },
      ...(canPerformActions ? [{ key: "aksi", label: "Aksi" }] : []),
    ];
  }, [maxPlCount, canPerformActions]);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2B1), [COLS_2B1]);
  const leaves = useMemo(() => flattenLeaves(COLS_2B1), [COLS_2B1]);

  const filterAndMapData = useMemo(() => {
    // Wait for cplList to be loaded before processing
    if (cplList.length === 0) {
      console.log("Tabel 2B1 - Waiting for cplList to be loaded...");
      return [];
    }

    console.log("Tabel 2B1 - selectedProdi:", selectedProdi);
    console.log("Tabel 2B1 - isiPembelajaran length:", isiPembelajaran.length);

    const filteredData = isiPembelajaran.filter(
      (item) => Number(item.id_unit_prodi) === Number(selectedProdi)
    );

    const unfilteredData = isiPembelajaran.filter(
      (item) => Number(item.id_unit_prodi) !== Number(selectedProdi)
    );

    if (unfilteredData.length > 0) {
      console.warn("Tabel 2B1 - Found mata kuliah from other prodi:", unfilteredData.map(item => ({
        id_mk: item.id_mk,
        nama_mk: item.nama_mk,
        prodi: item.id_unit_prodi
      })));
    }

    console.log("Tabel 2B1 - filteredData length:", filteredData.length);

    const grouped = {};
    filteredData.forEach(item => {
      const key = `${item.id_mk}-${item.semester}`;
      if (!grouped[key]) {
        grouped[key] = {
          no: Object.keys(grouped).length + 1,
          id_mk: item.id_mk,
          kode_mk: item.kode_mk || "", // Handle missing kode_mk
          nama_mk: item.nama_mk,
          mata_kuliah: item.nama_mk, // Keep for display in table
          sks: item.sks,
          semester: item.semester,
          id_unit_prodi: item.id_unit_prodi,
          selectedPls: [], // This will now store actual plIds, not for direct rendering
        };
        for (let i = 1; i <= maxPlCount; i++) {
          grouped[key][`pl_slot_${i}`] = false;
        }
      }

      // Get prodi-specific profil lulusan and sort them by id_pl for consistent ordering
      // profilLulusanList should already be filtered by selectedProdi from the API call
      const prodiSpecificPls = profilLulusanList
        .filter(pl => Number(pl.id_unit_prodi) === Number(selectedProdi))
        .sort((a, b) => a.id_pl - b.id_pl);

      // Determine selected PLs based on CPL-MK and CPL-PL mappings
      // Filter cplList to only include CPL for the current prodi
      const prodiCplList = cplList.filter(cpl => Number(cpl.id_unit_prodi) === Number(selectedProdi));

      // Filter cplMkMapping to only include mappings for the current prodi
      const prodiCplMkMapping = cplMkMapping.filter(mapping => {
        // Check if this mapping is for the current prodi
        const cpl = prodiCplList.find(c => c.id_cpl === mapping.id_cpl);
        return cpl !== undefined;
      });

      const cplIdsForMk = prodiCplMkMapping
        .filter(mapping => mapping.id_mk === item.id_mk)
        .map(mapping => mapping.id_cpl);

      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`MataKuliah ${item.mata_kuliah}: prodiCplList=${prodiCplList.length}, prodiCplMkMapping=${prodiCplMkMapping.length}, cplIdsForMk=${cplIdsForMk.length}`);
      }


      cplIdsForMk.forEach(cplId => {
        // Filter cplPlMapping to only include mappings for the current prodi (similar to Tabel 2.B.2 logic)
        const prodiCplPlMapping = cplPlMapping.filter(mapping => {
          // Check if this mapping is for the current prodi
          const cpl = prodiCplList.find(c => c.id_cpl === mapping.id_cpl);
          const pl = prodiSpecificPls.find(p => p.id_pl === mapping.id_pl);
          return cpl && pl; // Since both are already filtered by prodi, just check if they exist
        });

        const plIdsForCpl = prodiCplPlMapping
          .filter(mapping => mapping.id_cpl === cplId)
          .map(mapping => mapping.id_pl);

        plIdsForCpl.forEach(linkedPlId => {
          // Find the index of this linked PL within the prodi-specific ordered PLs
          const plIndex = prodiSpecificPls.findIndex(pl => pl.id_pl === linkedPlId);

          if (plIndex !== -1 && (plIndex + 1) <= maxPlCount) {
            grouped[key][`pl_slot_${plIndex + 1}`] = true;
          }
          // Also add the actual linkedPlId to selectedPls for editing purposes
          if (!grouped[key].selectedPls.includes(linkedPlId)) {
            grouped[key].selectedPls.push(linkedPlId);
          }
        });
      });
    });

    return Object.values(grouped);
  }, [isiPembelajaran, profilLulusanList, cplList, selectedProdi, cplMkMapping, cplPlMapping, maxPlCount]);

  const renderBody = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.mata_kuliah}-${item.semester}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let content;
            if (leaf.key === "aksi") {
              content = (
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => handleEdit(item)} className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(item.id_mk)} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition">
                    Hapus
                  </Button>
                </div>
              );
            } else if (leaf.key.startsWith("pl_slot_")) {
              // Check the generic slot, not specific pl_id
              content = item[leaf.key] ? "✓" : "";
            } else {
              content = item[leaf.key];
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${leaf.key === "mata_kuliah" ? "text-left pl-4 font-medium text-gray-900 dark:text-white" : "text-center"}`}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
              </h3>
              <Button onClick={() => setShowForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </Button>
            </div>
            <MataKuliahForm
              onComplete={() => {
                setShowForm(false);
                setEditingItem(null);
                refresh();
              }}
              onClose={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              initialData={editingItem}
              isEditing={!!editingItem}
              initialProdi={selectedProdi || user?.unit_id || user?.id_unit_prodi || 3}
            />
          </div>
        </div>
      )}
      
      {showCplPlForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Pemetaan CPL-PL</h3>
              <Button onClick={() => setShowCplPlForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </Button>
            </div>
            <CplPlForm
              onComplete={() => {
                setShowCplPlForm(false);
                refresh();
              }}
              initialProdi={selectedProdi}
            />
          </div>
        </div>
      )}
      
      {showProfilLulusanForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Profil Lulusan</h3>
              <Button onClick={() => setShowProfilLulusanForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </Button>
            </div>
            <ProfilLulusanForm
              onComplete={() => {
                setShowProfilLulusanForm(false);
                refresh();
              }}
              initialProdi={selectedProdi}
              initialData={null} // Tidak ada data awal untuk "Tambah PL"
              isEditMode={false} // Selalu false untuk "Tambah PL"
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.B.1 Tabel Isi Pembelajaran</h3>
        <div className="flex items-center space-x-4">
          {/* Dropdown prodi hanya untuk waket/superadmin */}
          {isWaketOrAdmin && (
            <div className="flex items-center space-x-2">
              <label htmlFor="select-prodi" className="text-gray-700 dark:text-gray-300 font-medium">Prodi:</label>
              <select
                id="select-prodi"
                className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                value={selectedProdi?.toString() || ''}
                onChange={(e) => setSelectedProdi(Number(e.target.value))}
              >
                {unitKerjaList.map(unit => (
                  <option key={unit.id_unit} value={unit.id_unit}>{unit.nama_unit}</option>
                ))}
              </select>
            </div>
          )}
          <Button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            disabled={!selectedProdi}
          >
            Tambah Data
          </Button>
          <Button onClick={() => setShowProfilLulusanForm(true)} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition">Tambah PL</Button>
        </div>
      </div>

      <Table className="min-w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          {headerRows.map((cells, idx) => (
            <TableRow
              key={`hdr:Tabel_2B1:${idx}`}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
            >
              {cells}
            </TableRow>
          ))}
        </TableHeadGroup>
        <TableBody>{renderBody(filterAndMapData, leaves)}</TableBody>
      </Table>
    </div>
  );
}

function Tabel2B2Content() {
  const { user } = useAuth();
  const api = useApi();

  const [cplList, setCplList] = useState([]);
  const [profilLulusanList, setProfilLulusanList] = useState([]);
  const [cpmkList, setCpmkList] = useState([]); // Added state for CPMK
  const [cplPlMapping, setCplPlMapping] = useState([]);
  const [cplMkMapping, setCplMkMapping] = useState([]); // Added state for CPL-MK mapping
  const [cpmkCplMapping, setCpmkCplMapping] = useState([]); // Added state for CPMK-CPL mapping
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCplForm, setShowCplForm] = useState(false); // New state for CplForm visibility
  const [editingCplItem, setEditingCplItem] = useState(null); // State for editing CPL
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [displayedProfilLulusan, setDisplayedProfilLulusan] = useState([]); // New state for filtered/sorted PLs
  const [maxPlCount, setMaxPlCount] = useState(0); // New state for max PL columns
  const [showCplPlForm, setShowCplPlForm] = useState(false); // New state for CplPlForm visibility in Tabel2B2Content
  const [unitKerjaList, setUnitKerjaList] = useState([]); // New state for dynamic prodi dropdown
  const [editingCplPlData, setEditingCplPlData] = useState(null); // New state for editing CPL-PL mappings
  const [isCplPlFormEditMode, setIsCplPlFormEditMode] = useState(false); // New state to track form mode

  const isWaketOrAdmin = ["superadmin", "waket-1", "waket-2"].includes(user?.role);
  const canPerformActions = isWaketOrAdmin; // Define canPerformActions here

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedProdi || !user) {
        setLoading(false);
        return;
      }

      const cplApiUrl = `/cpl?id_unit_prodi=${selectedProdi}`;

      const [cpl, pl, cpmk, mapping, cpmkCplMapping, cplMkMapping, unitKerja] = await Promise.all([
        api.get(cplApiUrl), // Endpoint untuk daftar CPL
        api.get(`/profil-lulusan?id_unit_prodi=${selectedProdi}`), // Endpoint untuk daftar Profil Lulusan
        api.get("/cpmk"), // Endpoint untuk daftar CPMK
        api.get(`/map-cpl-pl?id_unit_prodi=${selectedProdi}`), // Filter pemetaan CPL-PL berdasarkan prodi
        api.get("/map-cpmk-cpl"), // Endpoint untuk pemetaan CPMK-CPL
        api.get(`/map-cpl-mk?id_unit_prodi=${selectedProdi}`), // Added CPL-MK mapping
        api.get("/unit-kerja"), // Fetch unit kerja
      ]);

      console.log("Tabel 2B2 - fetched CPL for prodi", selectedProdi, ":", cpl?.length || 0, "items");
      console.log("Tabel 2B2 - fetched PL for prodi", selectedProdi, ":", pl?.length || 0, "items");
      console.log("Tabel 2B2 - fetched CPL-PL mapping for prodi", selectedProdi, ":", mapping?.length || 0, "items");
      console.log("Tabel 2B2 - fetched CPL-MK mapping for prodi", selectedProdi, ":", cplMkMapping?.length || 0, "items");

      let processedCpl = Array.isArray(cpl) ? cpl : [];

      setCplList(processedCpl);

      let currentPls = Array.isArray(pl) ? pl : [];
      let currentCpmk = Array.isArray(cpmk) ? cpmk : [];

      setProfilLulusanList(currentPls);
      setCpmkList(currentCpmk);
      setCplPlMapping(Array.isArray(mapping) ? mapping : []);
      setCplMkMapping(Array.isArray(cplMkMapping) ? cplMkMapping : []);
      setCpmkCplMapping(Array.isArray(cpmkCplMapping) ? cpmkCplMapping : []);
      setUnitKerjaList(Array.isArray(unitKerja) ? unitKerja.filter(unit => unit.nama_unit.startsWith('Prodi')) : []); // Filter for prodi units

    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCpl = (item) => {
    if (item && item.id_cpl) {
      setEditingCplItem(item);
      setShowCplForm(true);
    } else {
      console.error("ManajemenKurikulum: Invalid CPL item for editing.", item);
      alert("Gagal membuka form edit. Data CPL tidak ditemukan atau tidak valid.");
    }
  };

  const handleEditCplPl = (cplId) => {
    const originalCplItem = cplList.find(c => c.id_cpl === cplId);
    if (originalCplItem && originalCplItem.id_cpl) {
      // Filter cplList to only include CPL for the current prodi
      const prodiCplList = cplList.filter(cpl => Number(cpl.id_unit_prodi) === Number(selectedProdi));

      // Filter cplPlMapping to only include mappings for the current prodi
      const filteredMapping = cplPlMapping.filter(map => {
        // Check if this mapping is for the current prodi
        const cpl = prodiCplList.find(c => c.id_cpl === map.id_cpl);
        const pl = profilLulusanList.find(p => p.id_pl === map.id_pl);
        return cpl && pl && cpl.id_unit_prodi === selectedProdi && pl.id_unit_prodi === selectedProdi;
      });

      // Fetch existing mappings for this CPL
      const existingPlMappings = filteredMapping
        .filter(mapping => mapping.id_cpl === cplId)
        .map(mapping => String(mapping.id_pl)); // Ensure string for SearchableSelect

      console.log("handleEditCplPl - cplId:", cplId);
      console.log("handleEditCplPl - originalCplItem.id_unit_prodi:", originalCplItem.id_unit_prodi);
      console.log("handleEditCplPl - selectedProdi:", selectedProdi);
      console.log("handleEditCplPl - filteredMapping for cplId:", filteredMapping.filter(m => m.id_cpl === cplId));
      console.log("handleEditCplPl - existingPlMappings:", existingPlMappings);

      // Combine original CPL item data with its existing PL mappings
      const editingData = {
        ...originalCplItem,
        id_pl: existingPlMappings, // Pass as an array of strings
      };

      setEditingCplPlData(editingData);
      setIsCplPlFormEditMode(true);
      setShowCplPlForm(true);
    } else {
      console.error("CplPlForm: Invalid CPL item for editing CPL-PL mapping.", { cplId, originalCplItem });
      alert("Gagal membuka form edit. Data CPL tidak ditemukan atau tidak valid.");
    }
  };

  const handleDeleteCpl = async (id_cpl) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus CPL ini? Semua pemetaan terkait juga akan terhapus.")) {
      try {
        await api.delete(`/cpl/${id_cpl}`);
        refresh();
        setEditingCplItem(null); // Clear editing item after deletion
        setShowCplForm(false); // Close the form if it was open for the deleted item
      } catch (error) {
        console.error("Gagal menghapus CPL:", error);
        alert("Gagal menghapus CPL. Silakan coba lagi.");
      }
    }
  };

  useEffect(() => {
    if (user && selectedProdi === null) {
      const initialProdi = user?.unit_id || user?.id_unit_prodi || 3;
      setSelectedProdi(initialProdi);
    } else if (selectedProdi !== null && user && api) {
      refresh();
    }
  }, [user, selectedProdi, api]);

  // Additional safety net for initial load
  useEffect(() => {
    if (user && api && selectedProdi === null) {
      const initialProdi = user?.unit_id || user?.id_unit_prodi || 3;
      setSelectedProdi(initialProdi);
    }
  }, [user, api, selectedProdi]);

  // Initialize displayedProfilLulusan when profilLulusanList changes
  useEffect(() => {
    if (profilLulusanList.length > 0 && selectedProdi) {
      const filteredAndSortedPls = profilLulusanList
        .filter(pl => Number(pl.id_unit_prodi) === Number(selectedProdi))
        .sort((a, b) => a.id_pl - b.id_pl);
      setDisplayedProfilLulusan(filteredAndSortedPls);
    }
  }, [profilLulusanList, selectedProdi]);

  // Effect to filter and sort profilLulusanList into displayedProfilLulusan
  useEffect(() => {
    let filteredAndSortedPls = profilLulusanList.sort((a, b) => a.id_pl - b.id_pl);

    filteredAndSortedPls = filteredAndSortedPls.filter(pl => Number(pl.id_unit_prodi) === Number(selectedProdi));

    setDisplayedProfilLulusan(filteredAndSortedPls);
  }, [profilLulusanList, selectedProdi]);

  // Effect to calculate maxPlCount
  useEffect(() => {
    let currentMax = 0;
    // Calculate max PL count for the selected prodi
    currentMax = displayedProfilLulusan.length;
    setMaxPlCount(currentMax);
  }, [profilLulusanList, selectedProdi, displayedProfilLulusan]);

  // Additional logging for debugging
  useEffect(() => {
    console.log("Tabel State updated:", {
      selectedProdi,
      profilLulusanListLength: profilLulusanList.length,
      displayedProfilLulusanLength: displayedProfilLulusan.length,
      maxPlCount
    });
  }, [selectedProdi, profilLulusanList.length, displayedProfilLulusan.length, maxPlCount]);

  const COLS_2B2 = useMemo(() => {
    const dynamicPLColumns = [];
    for (let i = 1; i <= maxPlCount; i++) {
      dynamicPLColumns.push({
        key: `pl_slot_${i}`,
        label: `PL${i}`,
      });
    }

    return [
      { key: "cpl", label: "CPL" },
      { key: "cpmk", label: "CPMK" },
      {
        label: "Profil Lulusan (PL)",
        children: dynamicPLColumns.length > 0 ? dynamicPLColumns : [{ key: "placeholder_pl", label: "..." }],
      },
      ...(canPerformActions ? [{ key: "aksi", label: "Aksi" }] : []),
    ];
  }, [maxPlCount, canPerformActions]);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2B2), [COLS_2B2]);
  const leaves = useMemo(() => flattenLeaves(COLS_2B2), [COLS_2B2]);

  const displayRows = useMemo(() => {
    // Wait for cplList to be loaded before processing
    if (cplList.length === 0) {
      console.log("Tabel 2B2 - Waiting for cplList to be loaded...");
      return [];
    }

    const currentProdiId = selectedProdi;

    // Filter cplList to only include CPL for the current prodi
    const prodiCplList = cplList.filter(cpl => Number(cpl.id_unit_prodi) === Number(currentProdiId));

    // Filter cplPlMapping to only include mappings for the current prodi (consistent filtering)
    const prodiCplPlMapping = cplPlMapping.filter(map => {
      // Check if this mapping is for the current prodi
      const cpl = prodiCplList.find(c => c.id_cpl === map.id_cpl);
      const pl = prodiSpecificPls.find(p => p.id_pl === map.id_pl);
      return cpl && pl; // Since both are already filtered by prodi, just check if they exist
    });

    const filteredCplList = prodiCplList;

    // Filter mappings based on selected prodi (already filtered above)
    const filteredMapping = prodiCplPlMapping;
    const mappedPairs = new Set(filteredMapping.map(map => `${map.id_cpl}-${map.id_pl}`));

    return filteredCplList.map(cpl => {
      const row = { cpl: cpl.kode_cpl || `CPL ${cpl.id_cpl}` };

      // Get CPMK codes for this CPL
      const cpmkCodes = cpmkCplMapping
        .filter(mapping => mapping.id_cpl === cpl.id_cpl)
        .map(mapping => {
          const cpmk = cpmkList.find(c => c.id_cpmk === mapping.id_cpmk);
          return cpmk ? cpmk.kode_cpmk : '';
        })
        .filter(code => code !== '')
        .join(', ');

      row.cpmk = cpmkCodes;

      // Get prodi-specific profil lulusan and sort them by id_pl for consistent ordering
      // profilLulusanList should already be filtered by selectedProdi from the API call
      const prodiSpecificPls = profilLulusanList
        .filter(pl => Number(pl.id_unit_prodi) === Number(currentProdiId))
        .sort((a, b) => a.id_pl - b.id_pl);


      for (let i = 1; i <= maxPlCount; i++) {
        row[`pl_slot_${i}`] = false;
      }

      // Filter mappings to only include those for the current prodi (consistent with Tabel 2.B.1 logic)
      const prodiFilteredMapping = filteredMapping.filter(map => {
        // Check if this mapping is for the current prodi
        const cpl = prodiCplList.find(c => c.id_cpl === map.id_cpl);
        const pl = prodiSpecificPls.find(p => p.id_pl === map.id_pl);
        return cpl && pl; // Since both are already filtered by prodi, just check if they exist
      });

      prodiFilteredMapping.filter(map => map.id_cpl === cpl.id_cpl).forEach(map => {
        const plIndex = prodiSpecificPls.findIndex(pl => pl.id_pl === map.id_pl);

        if (plIndex !== -1 && (plIndex + 1) <= maxPlCount) {
          row[`pl_slot_${plIndex + 1}`] = true;
        }
      });
      return row;
    });
  }, [cplList, profilLulusanList, cpmkList, cplPlMapping, cpmkCplMapping, maxPlCount, selectedProdi, cplMkMapping]);

  const renderBody = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.cpl}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let content;
            if (leaf.key === "aksi") {
              const originalCplItem = cplList.find(c => (c.kode_cpl || `CPL ${c.id_cpl}`) === item.cpl);
              content = originalCplItem && (
                <div className="flex justify-center space-x-2">
                  <Button onClick={() => handleEditCpl(originalCplItem)} className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition">
                    Edit
                  </Button>
                  <Button onClick={() => handleEditCplPl(originalCplItem.id_cpl)} className="px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-md transition">
                    Edit Pemetaan
                  </Button>
                  <Button onClick={() => handleDeleteCpl(originalCplItem.id_cpl)} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition">
                    Hapus
                  </Button>
                </div>
              );
            } else if (leaf.key.startsWith("pl_slot_")) { // Changed from pl_ to pl_slot_
              content = item[leaf.key] ? "✓" : "";
            } else {
              content = item[leaf.key];
            }

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${leaf.key === "cpl" || leaf.key === "cpmk" ? "text-left pl-4 font-medium text-gray-900 dark:text-white" : "text-center"}`}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.B.2 Pemetaan Capaian Pembelajaran Lulusan dan Profil Lulusan</h3>
        <div className="flex items-center space-x-4">
          {isWaketOrAdmin && (
            <div className="flex items-center space-x-2">
              <label htmlFor="select-prodi" className="text-gray-700 dark:text-gray-300 font-medium">Prodi:</label>
              <select
                id="select-prodi"
                className="py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                value={selectedProdi?.toString() || ''}
                onChange={(e) => setSelectedProdi(Number(e.target.value))}
              >
                {unitKerjaList.map(unit => (
                  <option key={unit.id_unit} value={unit.id_unit}>{unit.nama_unit}</option>
                ))}
              </select>
            </div>
          )}
          <Button onClick={() => {
            setShowCplForm(true);
            setEditingCplItem(null); // Reset editing item when adding new CPL
          }} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">Tambah Data CPL</Button>
          <Button onClick={() => {
            setEditingCplPlData(null); // Reset editing data when adding new
            setIsCplPlFormEditMode(false); // Set form to add mode
            setShowCplPlForm(true);
          }} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition">Tambah Pemetaan CPL-PL</Button>
        </div>
      </div>
      {showCplForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tambah CPL Baru</h3>
              <Button onClick={() => setShowCplForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </Button>
            </div>
            <CplForm
              onComplete={() => {
                setShowCplForm(false);
                setEditingCplItem(null);
                refresh();
              }}
              initialData={editingCplItem}
              isEditMode={!!editingCplItem}
              initialProdi={selectedProdi} // Pass current user's prodi ID
            />
          </div>
        </div>
      )}
      {showCplPlForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {isCplPlFormEditMode ? "Edit Pemetaan CPL-PL" : "Tambah Pemetaan CPL-PL"}
              </h3>
              <Button onClick={() => setShowCplPlForm(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                &times;
              </Button>
            </div>
            <CplPlForm
              onComplete={() => {
                setShowCplPlForm(false);
                setEditingCplPlData(null); // Reset editing CPL-PL data
                setIsCplPlFormEditMode(false); // Reset form mode
                refresh();
              }}
              initialProdi={selectedProdi}
              initialData={editingCplPlData} // Pass editing CPL-PL data
              isEditMode={isCplPlFormEditMode} // Use the form mode state
            />
          </div>
        </div>
      )}
      <Table className="min-w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          {headerRows.map((cells, idx) => (
            <TableRow
              key={`hdr:Tabel_2B2:${idx}`}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
            >
              {cells}
            </TableRow>
          ))}
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows, leaves)}</TableBody>
      </Table>
    </div>
  );
}

function Tabel2B3Content() {
  const { user } = useAuth();
  const api = useApi();

  const [cplList, setCplList] = useState([]);
  const [cpmkList, setCpmkList] = useState([]);
  const [mapCplMkList, setMapCplMkList] = useState([]);
  const [cpmkCplMapping, setCpmkCplMapping] = useState([]); // Added state for CPMK-CPL mapping
  const [cpmkMkMapping, setCpmkMkMapping] = useState([]); // Added state for CPMK-MK mapping
  const [mataKuliahList, setMataKuliahList] = useState([]); // To get MK details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cpl, cpmk, mapCplMk, cpmkCplMapping, cpmkMkMapping, mk] = await Promise.all([
        api.get("/cpl"),
        api.get("/cpmk"),
        api.get("/map-cpl-mk"),
        api.get("/map-cpmk-cpl"),
        api.get("/map-cpmk-mk"),
        api.get("/mata-kuliah"), // Assuming a /mata-kuliah endpoint exists
      ]);
      setCplList(Array.isArray(cpl) ? cpl : []);
      setCpmkList(Array.isArray(cpmk) ? cpmk : []);
      setMapCplMkList(Array.isArray(mapCplMk) ? mapCplMk : []);
      setCpmkCplMapping(Array.isArray(cpmkCplMapping) ? cpmkCplMapping : []);
      setCpmkMkMapping(Array.isArray(cpmkMkMapping) ? cpmkMkMapping : []);
      setMataKuliahList(Array.isArray(mk) ? mk : []);

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

  const COLS_2B3 = useMemo(() => {
    const semesterColumns = [];
    for (let i = 1; i <= 8; i++) {
      semesterColumns.push({ key: `semester_${i}`, label: `Semester ${i}` });
    }

    return [
      { key: "cpl", label: "CPL" },
      { key: "cpmk", label: "CPMK" },
      ...semesterColumns,
    ];
  }, []);

  const headerRows = useMemo(() => buildHeaderRows(COLS_2B3), [COLS_2B3]);
  const leaves = useMemo(() => flattenLeaves(COLS_2B3), [COLS_2B3]);

  const displayRows = useMemo(() => {
    if (!user?.unit_id) return [];

    const rows = [];
    cplList.forEach(cpl => {
      // Get CPMK codes for this CPL based on CPMK-CPL mapping
      const cpmkCodes = cpmkCplMapping
        .filter(mapping => mapping.id_cpl === cpl.id_cpl)
        .map(mapping => {
          const cpmk = cpmkList.find(c => c.id_cpmk === mapping.id_cpmk);
          return cpmk ? cpmk.kode_cpmk : '';
        })
        .filter(code => code !== '')
        .join(', ');

      const newRow = { cpl: cpl.kode_cpl || `CPL ${cpl.id_cpl}`, cpmk: cpmkCodes };
      for (let i = 1; i <= 8; i++) {
        newRow[`semester_${i}`] = "";
      }

      const relevantMkMappings = mapCplMkList.filter(
        (map) => map.id_cpl === cpl.id_cpl && map.id_unit_prodi === user.unit_id
      );

      relevantMkMappings.forEach(map => {
        const mataKuliah = mataKuliahList.find(mk => mk.id_mk === map.id_mk);
        if (mataKuliah && mataKuliah.semester) {
          const semesterKey = `semester_${mataKuliah.semester}`;
          if (newRow[semesterKey]) {
            newRow[semesterKey] += `, ${mataKuliah.kode_mk || mataKuliah.nama_mk}`;
          } else {
            newRow[semesterKey] = mataKuliah.kode_mk || mataKuliah.nama_mk;
          }
        }
      });
      rows.push(newRow);
    });
    return rows;
  }, [cplList, cpmkList, mapCplMkList, cpmkCplMapping, mataKuliahList, user?.unit_id]);

  const handleFormComplete = () => {
    setShowForm(false);
    setEditData(null);
    refresh();
  };

  const renderBody = (rows, leaves) =>
    rows.map((item, rowIndex) => {
      const rowKey = `row-${item.cpl}-${item.cpmk}-${rowIndex}`;
      return (
        <TableRow
          key={rowKey}
          className="odd:bg-white even:bg-gray-50 dark:odd:bg-white/5 dark:even:bg-white/10 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition"
        >
          {leaves.map((leaf) => {
            const cellKey = `td:${leaf.__path}:${rowKey}`;
            let content = item[leaf.key] || "";

            return (
              <TableCell
                key={cellKey}
                className={`border align-middle ${leaf.key === "cpl" || (leaf.key === "cpmk" && content) ? "text-left pl-4 font-medium text-gray-900 dark:text-white" : "text-center"}`}
              >
                {content}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });

  if (loading) return <div>Memuat data...</div>;
  if (error) return <div>Error: {String(error?.message || error)}</div>;

  return (
    <div className="w-full overflow-x-auto mb-10 rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tabel 2.B.3 Peta Pemenuhan CPL</h3>
        <div className="flex items-center space-x-2">
          <Button onClick={() => {
            setShowForm(true);
            setEditData(null);
          }} className="bg-green-500 hover:bg-green-600 text-white">Tambah Data</Button>
        </div>
      </div>
      {showForm && (
        <div className="p-4 bg-white dark:bg-gray-900">
          <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{editData ? "Edit Data" : "Tambah Data"}</h4>
          <Tabel2B3Form
            onComplete={handleFormComplete}
            initialData={editData}
            isEditMode={!!editData}
          />
        </div>
      )}
      <Table className="min-w-full text-sm border-collapse border-0">
        <TableHeadGroup>
          {headerRows.map((cells, idx) => (
            <TableRow
              key={`hdr:Tabel_2B3:${idx}`}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white sticky top-0"
            >
              {cells}
            </TableRow>
          ))}
        </TableHeadGroup>
        <TableBody>{renderBody(displayRows, leaves)}</TableBody>
      </Table>
    </div>
  );
}

export function ManajemenKurikulum() {
  const [activeTab, setActiveTab] = useState('2b1'); // Default active tab
  const { user } = useAuth();
  const api = useApi();


  const renderContent = () => {
    switch (activeTab) {
      case '2b1':
        return <Tabel2B1Content />;
      case '2b2':
        return <Tabel2B2Content />;
      case '2b3':
        return <Tabel2B3Content />;
      default:
        return <div>Pilih tabel untuk melihat konten.</div>;
    }
  };

  return (
    <Container>
      <SectionTitle title="Manajemen Kurikulum" />
      <div className="flex space-x-4 mb-6">
        <Button onClick={() => setActiveTab('2b1')} variant={activeTab === '2b1' ? 'primary' : 'soft'}>Tabel 2.B.1 Isi Pembelajaran</Button>
        <Button onClick={() => setActiveTab('2b2')} variant={activeTab === '2b2' ? 'primary' : 'soft'}>Tabel 2.B.2 Pemetaan CPL dan PL</Button>
        <Button onClick={() => setActiveTab('2b3')} variant={activeTab === '2b3' ? 'primary' : 'soft'}>Tabel 2.B.3 Peta Pemenuhan CPL</Button>
      </div>
      <div>
        {renderContent()}
      </div>
    </Container>
  );
}

export default ManajemenKurikulum;
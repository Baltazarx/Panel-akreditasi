import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth
import { Button, InputField, SearchableSelect } from "../ui"; // Import SearchableSelect

export function CplPlForm({ onComplete, initialProdi, initialData, isEditMode }) {
  const api = useApi();
  const { user } = useAuth(); // Get user from auth context

  console.log("CplPlForm - initialData received:", initialData);
  console.log("CplPlForm - isEditMode:", isEditMode);
  console.log("CplPlForm - initialProdi:", initialProdi);
  console.log("CplPlForm - initialData.id_pl:", initialData?.id_pl);
  console.log("CplPlForm - initialData.id_unit_prodi:", initialData?.id_unit_prodi);

  const [cplList, setCplList] = useState([]);
  const [profilLulusanList, setProfilLulusanList] = useState([]);
  const [unitKerjaList, setUnitKerjaList] = useState([]); // State for dynamic prodi dropdown in form
  const [selectedProdiInForm, setSelectedProdiInForm] = useState(
    isEditMode && initialData?.id_unit_prodi ? String(initialData.id_unit_prodi) : ""
  );
  const [selectedCpl, setSelectedCpl] = useState(initialData?.id_cpl ? String(initialData.id_cpl) : "");
  const [selectedPl, setSelectedPl] = useState(() =>
    isEditMode && initialData?.id_pl ? initialData.id_pl : []
  );
  const [existingMappedPl, setExistingMappedPl] = useState(() =>
    isEditMode && initialData?.id_pl ? initialData.id_pl : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filteredCplOptions, setFilteredCplOptions] = useState([]); // State for filtered CPL options
  const [filteredPlOptions, setFilteredPlOptions] = useState([]); // State for filtered PL options

  // Determine if the current user is a waket or superadmin
  const isWaketOrAdmin = ["superadmin", "waket-1", "waket-2"].includes(user?.role);

  // Helper function to compare arrays
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch unit kerja for prodi dropdown in form
        const unitKerja = await api.get("/unit-kerja");
        let fetchedUnitKerja = Array.isArray(unitKerja) ? unitKerja.filter(unit => unit.nama_unit.startsWith('Prodi')) : [];

        // Temporary: Add dummy data if fetchedUnitKerja is empty, for frontend testing
        if (fetchedUnitKerja.length === 0) {
          console.warn("CplPlForm: No unit_kerja fetched. Using dummy data for testing purposes.");
          fetchedUnitKerja = [
            { id_unit: 4, nama_unit: "Prodi TI" },
            { id_unit: 5, nama_unit: "Prodi MI" },
            // Add more dummy units if needed
          ];
        }
        // Add "Semua Prodi" option for waket/superadmin roles, or if it's not edit mode
        if (isWaketOrAdmin || !isEditMode) {
            fetchedUnitKerja = [{ id_unit: "", nama_unit: "Semua Prodi" }, ...fetchedUnitKerja];
        }
        setUnitKerjaList(fetchedUnitKerja);

        let currentProdiSelection = "";
        // Determine initial prodi selection
        if (isEditMode && initialData?.id_unit_prodi) {
            currentProdiSelection = String(initialData.id_unit_prodi);
            // setSelectedCpl is already initialized based on initialData.id_cpl
        } else if (!isWaketOrAdmin) {
            // For non-waket/superadmin, default to their unit
            currentProdiSelection = String(user?.unit_id || user?.id_unit_prodi || initialProdi || ""); // Ensure it's a string
        }
        // If in add mode and waket/superadmin, or if no specific prodi is determined, default to ""
        if (!isEditMode && isWaketOrAdmin) {
            currentProdiSelection = "";
        }
        // Only set if not already set by useState initialization
        if (!selectedProdiInForm) {
          setSelectedProdiInForm(currentProdiSelection);
        }

        // Fetch CPLs, filtered by selectedProdiInForm if available
        const cplEndpoint = currentProdiSelection ? `/cpl?id_unit_prodi=${currentProdiSelection}` : "/cpl";
        const cpl = await api.get(cplEndpoint);
        setCplList(Array.isArray(cpl) ? cpl : []);

        // Fetch Profil Lulusan, filtered by selectedProdiInForm if available
        const plEndpoint = currentProdiSelection ? `/profil-lulusan?id_unit_prodi=${currentProdiSelection}` : "/profil-lulusan";
        const pl = await api.get(plEndpoint);
        setProfilLulusanList(Array.isArray(pl) ? pl : []);

        if (isEditMode && initialData?.id_cpl && !initialData.id_pl) {
          // Fallback: fetch existing mappings from API if not provided in initialData
          const existingMappings = await api.get(`/map-cpl-pl?id_cpl=${initialData.id_cpl}`);
          const mappedPlIds = Array.isArray(existingMappings) ? existingMappings.map(m => m.id_pl) : [];
          setExistingMappedPl(mappedPlIds.map(String)); // Store as array of strings
        }

      } catch (e) {
        console.error("Failed to fetch data (initial):");
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api, isEditMode, initialData, user?.unit_id, user?.id_unit_prodi, initialProdi, selectedProdiInForm]); // Add selectedProdiInForm to dependencies

  // Effect to re-fetch CPL and PL lists when selectedProdiInForm changes
  useEffect(() => {
    const refetchFilteredData = async () => {
      if (loading) return; // Prevent re-fetching if already loading
      try {
        setLoading(true);
        const cplEndpoint = selectedProdiInForm ? `/cpl?id_unit_prodi=${selectedProdiInForm}` : "/cpl";
        const cpl = await api.get(cplEndpoint);
        setCplList(Array.isArray(cpl) ? cpl : []);

        const plEndpoint = selectedProdiInForm ? `/profil-lulusan?id_unit_prodi=${selectedProdiInForm}` : "/profil-lulusan";
        const pl = await api.get(plEndpoint);
        setProfilLulusanList(Array.isArray(pl) ? pl : []);
      } catch (e) {
        console.error("Failed to re-fetch filtered data:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    refetchFilteredData();
  }, [api, selectedProdiInForm]); // Re-fetch when selectedProdiInForm changes

  // Effect to filter CPL and PL lists when selectedProdiInForm or raw lists change
  useEffect(() => {
    const newFilteredCplOptions = cplList
      .filter(cpl => selectedProdiInForm === "" || String(cpl.id_unit_prodi) === selectedProdiInForm)
      .map(cpl => ({ value: String(cpl.id_cpl), label: cpl.kode_cpl || `CPL ${cpl.id_cpl}` }));
    setFilteredCplOptions(newFilteredCplOptions);

    const newFilteredPlOptions = profilLulusanList
      .filter(pl => selectedProdiInForm === "" || String(pl.id_unit_prodi) === selectedProdiInForm)
      .sort((a, b) => a.id_pl - b.id_pl) // Ensure consistent sorting
      .map(pl => ({ value: String(pl.id_pl), label: pl.kode_pl || `PL ${pl.id_pl}` }));
    setFilteredPlOptions(newFilteredPlOptions);

    console.log("CplPlForm - filteredPlOptions:", newFilteredPlOptions);
    console.log("CplPlForm - selectedPl after init:", selectedPl);
    console.log("CplPlForm - existingMappedPl after init:", existingMappedPl);

    // Reset selected CPL if it's no longer in the filtered list
    if (selectedCpl && !newFilteredCplOptions.some(option => option.value === String(selectedCpl))) {
      setSelectedCpl("");
    }
    // Only reset selected PLs if they are no longer in the filtered list AND we have initial data AND filtered options are ready
    if (selectedPl.length > 0 && initialData?.id_pl && newFilteredPlOptions.length > 0) {
      const filteredPlIds = selectedPl.filter(plId =>
        newFilteredPlOptions.some(option => option.value === String(plId))
      ).map(String);
      console.log("CplPlForm - filtering selectedPl, before:", selectedPl);
      console.log("CplPlForm - filteredPlOptions values:", newFilteredPlOptions.map(opt => opt.value));
      setSelectedPl(filteredPlIds);
      console.log("CplPlForm - filtering selectedPl, after:", filteredPlIds);
    }
  }, [selectedProdiInForm, cplList, profilLulusanList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cplIdForValidation = isEditMode ? initialData?.id_cpl : selectedCpl;
    if (!cplIdForValidation || selectedPl.length === 0 || !selectedProdiInForm) {
      setError("CPL, Profil Lulusan, dan Prodi harus dipilih.");
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        const cplId = initialData.id_cpl; // CPL ID being edited

        // Determine new mappings (selectedPl) and old mappings (existingMappedPl)
        const newPlSelections = selectedPl;
        const oldPlSelections = existingMappedPl;

        console.log("Edit mode - newPlSelections:", newPlSelections);
        console.log("Edit mode - oldPlSelections:", oldPlSelections);

        // Only proceed if there are actual changes
        const hasChanges = !arraysEqual(newPlSelections.sort(), oldPlSelections.sort());

        if (hasChanges) {
          // Mappings to delete (old ones that are no longer selected)
          const toDelete = oldPlSelections.filter(plId => !newPlSelections.includes(plId)).map(Number);

          // Mappings to create (new ones that weren't there before)
          const toCreate = newPlSelections.filter(plId => !oldPlSelections.includes(plId)).map(Number);

          console.log("Edit mode - toDelete:", toDelete);
          console.log("Edit mode - toCreate:", toCreate);

          // Perform deletions
          for (const plIdToDelete of toDelete) {
            await api.delete(`/map-cpl-pl/${cplId}/${plIdToDelete}`);
          }

          // Perform creations
          if (toCreate.length > 0) {
            const createPayload = toCreate.map(plId => ({
              id_cpl: cplId,
              id_pl: Number(plId),
            }));
            await api.post("/map-cpl-pl", createPayload);
          }
        }

        alert("Pemetaan CPL-PL berhasil diperbarui!");

      } else {
        // Create new mappings
        const payload = selectedPl.map(plId => ({ // selectedPl is already array of strings
          id_cpl: selectedCpl,
          id_pl: Number(plId),
          // id_unit_prodi is not part of map_cpl_pl table, it's inferred from CPL/PL
          // No need to send id_unit_prodi in the payload for map_cpl_pl directly
        }));
        await api.post("/map-cpl-pl", payload);
        alert("Pemetaan CPL-PL berhasil ditambahkan!");
      }
      onComplete();
    } catch (e) {
      console.error("Gagal menyimpan pemetaan CPL-PL:", e);
      setError("Gagal menyimpan pemetaan CPL-PL. Silakan coba lagi. " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const prodiOptions = unitKerjaList.map(unit => ({ value: String(unit.id_unit), label: unit.nama_unit }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-col">
        <label htmlFor="prodi-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prodi:
        </label>
        <SearchableSelect
          id="prodi-select"
          name="id_unit_prodi" // Ensure name prop is passed
          value={selectedProdiInForm}
          onChange={(event) => {
            setSelectedProdiInForm(String(event.target.value)); // Ensure value is always a string
          }} // Ensure value is always a string
          options={prodiOptions} // Use the logged prodiOptions
          placeholder="Pilih Prodi"
          disabled={loading || (isEditMode && !isWaketOrAdmin)} // Disable prodi selection in edit mode for consistency, unless waket/superadmin
        />
      </div>

      {!isEditMode && (
        <div className="flex flex-col">
          <label htmlFor="cpl-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            CPL:
          </label>
          <SearchableSelect
            id="cpl-select"
            name="id_cpl" // Added name prop
            value={selectedCpl}
            onChange={(event) => setSelectedCpl(Number(event.target.value))} // Correctly access value from event.target.value
            options={filteredCplOptions} // Use the filtered CPL options
            placeholder="Pilih CPL"
            disabled={loading || (isEditMode && !isWaketOrAdmin)} // Disable CPL selection in edit mode, unless waket/superadmin
          />
        </div>
      )}

      <div className="flex flex-col">
        <label htmlFor="pl-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Profil Lulusan:
        </label>
        <SearchableSelect
          id="pl-select"
          name="id_pl" // Added name prop
          value={selectedPl}
          onChange={(event) => setSelectedPl(event.target.value)} // selectedPl will now store strings
          options={filteredPlOptions} // Use the filtered PL options
          placeholder="Pilih Profil Lulusan"
          multiple={true} // Enable multiple selection
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : (isEditMode ? "Perbarui Pemetaan" : "Tambah Pemetaan")}
      </Button>
    </form>
  );
}

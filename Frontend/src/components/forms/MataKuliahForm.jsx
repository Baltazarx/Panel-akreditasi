import React, { useEffect, useMemo, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, InputField, SearchableSelect } from "../ui";

// Helper function to compare arrays
const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (String(a[i]) !== String(b[i])) return false;
  }
  return true;
};

export function MataKuliahForm({ onSubmit, initialData = {}, onClose, isEditing = false, onUpdate }) {
  const api = useApi();
  const { user } = useAuth();

  const isSuperadminOrWaket = ['superadmin', 'waket-1', 'waket-2'].includes(user?.role);

  const [formData, setFormData] = useState(() => {
    // Initialize form data based on whether we're editing or creating
    if (isEditing && initialData) {
      return {
        nama_mk: initialData.nama_mk || "",
        kode_mk: initialData.kode_mk || "",
        sks: initialData.sks || "",
        semester: initialData.semester || "",
        id_unit_prodi: initialData.id_unit_prodi || (isSuperadminOrWaket ? "" : user?.unit_id || ""),
        selectedPls: Array.isArray(initialData.selectedPls) ? initialData.selectedPls : [],
        id_mk: initialData.id_mk || null,
        // id_tahun: initialData.id_tahun || "", // Add id_tahun to form data
      };
    } else {
      return {
        nama_mk: "",
        kode_mk: "",
        sks: "",
        semester: "",
        id_unit_prodi: isSuperadminOrWaket ? "" : user?.unit_id || "",
        selectedPls: [],
        id_mk: null,
        // id_tahun: "", // Add id_tahun to form data
      };
    }
  });

  const [profilLulusanList, setProfilLulusanList] = useState([]);
  const [loadingPl, setLoadingPl] = useState(true);
  const [errorPl, setErrorPl] = useState(null);
  const [filteredPlList, setFilteredPlList] = useState([]); // <-- State baru untuk PL yang difilter

  const [cplList, setCplList] = useState([]);
  const [loadingCpl, setLoadingCpl] = useState(true);
  const [errorCpl, setErrorCpl] = useState(null);

  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [loadingUnit, setLoadingUnit] = useState(true);
  const [errorUnit, setErrorUnit] = useState(null);

  // Fetch Profil Lulusan
  useEffect(() => {
    // Skip fetching if we're editing and don't have a valid prodi yet
    if (isEditing && (!formData.id_unit_prodi || formData.id_unit_prodi === "")) {
      setLoadingPl(false);
      return;
    }

    const fetchProfilLulusan = async () => {
      try {
        // Use initialData.id_unit_prodi if editing, otherwise use formData.id_unit_prodi
        const targetProdi = isEditing ? (initialData?.id_unit_prodi || formData.id_unit_prodi) : formData.id_unit_prodi;

        // Filter by selected prodi if available, otherwise get all
        const prodiFilter = targetProdi && targetProdi !== 0
          ? `?id_unit_prodi=${targetProdi}`
          : '';

        console.log("Fetching PL for prodi:", targetProdi, "filter:", prodiFilter);
        console.log("Is editing:", isEditing, "initialData prodi:", initialData?.id_unit_prodi, "formData prodi:", formData.id_unit_prodi);

        const response = await api.get(`/profil-lulusan${prodiFilter}`);
        let fetchedPls = Array.isArray(response) ? response : [];

        setProfilLulusanList(fetchedPls);
      } catch (err) {
        console.error("Failed to fetch Profil Lulusan:", err);
        setErrorPl(err);
      } finally {
        setLoadingPl(false);
      }
    };

    // Set loading to true only if we're not editing or if we have a valid prodi
    if (!isEditing || (formData.id_unit_prodi && formData.id_unit_prodi !== "")) {
      setLoadingPl(true);
      fetchProfilLulusan();
    } else {
      setLoadingPl(false);
    }
  }, [api, formData.id_unit_prodi, isEditing, initialData?.id_unit_prodi]);

  // Filter Profil Lulusan berdasarkan Prodi yang dipilih (profilLulusanList already filtered by API)
  useEffect(() => {
    // profilLulusanList is already filtered by the API call based on formData.id_unit_prodi
    setFilteredPlList(profilLulusanList);

    // For editing mode, we need to be more careful about filtering selectedPls
    // Only filter if we're not in editing mode or if the mata kuliah's prodi matches current prodi
    if (!isEditing || !initialData?.id_unit_prodi || formData.id_unit_prodi === initialData.id_unit_prodi) {
      setFormData(prev => {
        const currentSelectedPls = Array.isArray(prev.selectedPls) ? prev.selectedPls : [];
        const newSelectedPls = currentSelectedPls.filter(selectedId =>
          profilLulusanList.some(pl => String(pl.id_pl) === String(selectedId))
        );
        // Only update if there's an actual change to avoid unnecessary re-renders
        if (!arraysEqual(currentSelectedPls, newSelectedPls)) {
          return { ...prev, selectedPls: newSelectedPls };
        }
        return prev;
      });
    }

  }, [formData.id_unit_prodi, profilLulusanList, isEditing, initialData?.id_unit_prodi]);

  // Effect to handle loading state for editing mode
  useEffect(() => {
    // For editing mode, set loading to false immediately since data is already available
    if (isEditing && initialData) {
      setLoadingPl(false);
    }
  }, [isEditing, initialData]);

  // Fetch CPL List
  useEffect(() => {
    const fetchCplList = async () => {
      try {
        const response = await api.get('/cpl');
        setCplList(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error("Failed to fetch CPL List:", err);
        setErrorCpl(err); // Menambahkan error state untuk CPL
      } finally {
        setLoadingCpl(false); // Menambahkan loading state untuk CPL
      }
    };
    fetchCplList();
  }, [api]); // CPL list is fetched, but no longer used in the form itself directly

  // Fetch Unit Kerja
  useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const response = await api.get('/unit-kerja');
        const prodiUnits = Array.isArray(response) 
          ? response.filter(unit => unit.id_unit === 4 || unit.id_unit === 5) // Filter for Prodi TI (4) and Prodi MI (5)
          : [];
        setUnitKerjaList(prodiUnits);
      } catch (err) {
        console.error("Failed to fetch Unit Kerja:", err);
        setErrorUnit(err);
      } finally {
        setLoadingUnit(false);
      }
    };
    fetchUnitKerja();
  }, [api]);

  // Effect to populate form data if in editing mode (for dynamic updates)
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("MataKuliahForm Edit: initialData received:", initialData);
      console.log("MataKuliahForm Edit: selectedPls from initialData:", initialData.selectedPls);
      console.log("MataKuliahForm Edit: mata kuliah prodi:", initialData.id_unit_prodi);

      // Update form data if initialData changes (for external updates)
      setFormData((prev) => {
        const newData = {
          nama_mk: initialData.nama_mk || prev.nama_mk || "",
          kode_mk: initialData.kode_mk || prev.kode_mk || "",
          sks: initialData.sks || prev.sks || "",
          semester: initialData.semester || prev.semester || "",
          id_unit_prodi: initialData.id_unit_prodi || prev.id_unit_prodi,
          selectedPls: initialData.selectedPls || prev.selectedPls || [],
          id_mk: initialData.id_mk || prev.id_mk || null,
        };

        // Only update if there's an actual change
        if (JSON.stringify(prev) !== JSON.stringify(newData)) {
          return newData;
        }
        return prev;
      });
    }
  }, [isEditing, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlChange = (event) => {
    const selectedValues = event.target.value;
    console.log("PL selection changed:", selectedValues);
    console.log("Available PLs for current prodi:", filteredPlList.map(pl => pl.id_pl));

    // Validate selected PLs exist in filteredPlList and convert to numbers
    const validPls = selectedValues
      .filter(plId => filteredPlList.some(pl => String(pl.id_pl) === String(plId)))
      .map(plId => Number(plId)); // Convert to numbers

    const invalidPls = selectedValues.filter(plId =>
      !filteredPlList.some(pl => String(pl.id_pl) === String(plId))
    );

    if (invalidPls.length > 0) {
      console.warn("Some selected PLs are not valid for current prodi:", invalidPls);
      // Instead of alert, just log the warning and filter out invalid ones
      console.log(`Filtering out ${invalidPls.length} invalid PL(s) for current prodi`);
    }

    console.log("Valid PLs after filtering and conversion:", validPls);

    setFormData((prev) => {
      return { ...prev, selectedPls: validPls };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    console.log("Submitting selectedPls:", formData.selectedPls);
    console.log("Submitting selectedPls types:", formData.selectedPls?.map(pl => `${pl} (${typeof pl})`));

    try {
      // Filter selectedPls to only include PLs that exist in filteredPlList
      const validSelectedPls = Array.isArray(formData.selectedPls)
        ? formData.selectedPls.filter(plId =>
            filteredPlList.some(pl => String(pl.id_pl) === String(plId))
          ).map(pl => Number(pl)) // Ensure all PLs are numbers
        : [];

      console.log("Original selectedPls:", formData.selectedPls);
      console.log("Filtered valid selectedPls:", validSelectedPls);
      console.log("Available PLs in filteredPlList:", filteredPlList.map(pl => pl.id_pl));

      const payload = {
        id_unit_prodi: formData.id_unit_prodi,
        kode_mk: formData.kode_mk,
        nama_mk: formData.nama_mk,
        sks: Number(formData.sks),
        semester: Number(formData.semester),
        selectedPls: validSelectedPls,
        // id_tahun: Number(formData.id_tahun), // id_tahun dihapus dari payload
      };
      if (isEditing) {
        await api.put(`/mata-kuliah/${formData.id_mk}`, payload);
        onUpdate();
      } else {
        await api.post('/mata-kuliah', payload);
        onSubmit();
      }
      onClose();
    } catch (error) {
      console.error("Gagal menambahkan mata kuliah:", error);
      alert(`Gagal menambahkan mata kuliah: ${error?.message || error}`);
    }
  };

  // For editing mode, don't wait for loading since data is already available
  if (loadingUnit && !isEditing) return <div>Memuat data...</div>;
  if (errorPl || errorUnit) return <div>Error: {String(errorPl?.message || errorUnit?.message || errorPl || errorUnit)}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSuperadminOrWaket && (
        <div>
          <label htmlFor="id_unit_prodi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prodi
          </label>
          <select
            id="id_unit_prodi"
            name="id_unit_prodi"
            value={formData.id_unit_prodi}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Pilih Prodi</option>
            {unitKerjaList.map((unit) => (
              <option key={unit.id_unit} value={unit.id_unit}>
                {unit.nama_unit}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tahun Akademik InputField dihapus */}
      {/* <div>
        <label htmlFor="id_tahun" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tahun Akademik
        </label>
        <select
          id="id_tahun"
          name="id_tahun"
          value={formData.id_tahun}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        >
          <option value="">Pilih Tahun Akademik</option>
          {tahunAkademikList.map((tahun) => (
            <option key={tahun.id_tahun} value={tahun.id_tahun}>
              {tahun.tahun}
            </option>
          ))}
        </select>
      </div> */}

      <InputField
        label="Kode Mata Kuliah"
        type="text"
        name="kode_mk"
        value={formData.kode_mk}
        onChange={handleChange}
        placeholder="Contoh: TI001"
        required
      />

      <InputField
        label="Nama Mata Kuliah"
        type="text"
        name="nama_mk"
        value={formData.nama_mk}
        onChange={handleChange}
        placeholder="Contoh: Kalkulus I"
        required
      />

      <InputField
        label="SKS"
        type="number"
        name="sks"
        value={formData.sks}
        onChange={handleChange}
        required
      />
      <InputField
        label="Semester"
        type="number"
        name="semester"
        value={formData.semester}
        onChange={handleChange}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pemetaan ke Profil Lulusan (PL)
        </label>
        <SearchableSelect
          multiple
          name="selectedPls"
          value={formData.selectedPls || []}
          onChange={handlePlChange}
          options={[
            // Add currently selected PLs that might not be in filteredPlList yet (for editing)
            ...(formData.selectedPls || []).map(selectedId => {
              const existingPl = filteredPlList.find(pl => String(pl.id_pl) === String(selectedId));
              if (existingPl) return null; // Already in filteredPlList

              // For editing mode, we might have selectedPls that aren't in filteredPlList yet
              // This is a fallback for when PL data is still loading
              return {
                value: selectedId,
                label: `PL ${selectedId} (Loading...)`
              };
            }).filter(Boolean),
            // Regular filtered PLs
            ...filteredPlList.map((pl) => ({
              value: pl.id_pl,
              label: `${pl.kode_pl} - ${pl.deskripsi_pl.substring(0, 50)}${pl.deskripsi_pl.length > 50 ? '...' : ''}`
            }))
          ]}
          placeholder="Pilih Profil Lulusan"
        />
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Dipilih: {formData.selectedPls?.length || 0} PL
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isEditing ? "Update Mata Kuliah" : "Tambah Mata Kuliah"}
      </Button>
      <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
        Batal
      </Button>
    </form>
  );
}





import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth"; // Import useAuth
import { Button, InputField, SearchableSelect } from "../ui"; // Import SearchableSelect

export function CplForm({ onComplete, initialData, isEditMode, initialProdi }) {
  const api = useApi();
  const { user } = useAuth(); // Get user from auth context

  const [kodeCpl, setKodeCpl] = useState(initialData?.kode_cpl || "");
  const [deskripsiCpl, setDeskripsiCpl] = useState(initialData?.deskripsi_cpl || "");
  const [unitKerjaList, setUnitKerjaList] = useState([]); // State for dynamic prodi dropdown in form
  const [selectedProdiInForm, setSelectedProdiInForm] = useState(initialData?.id_unit_prodi || initialProdi || (user?.unit_id || "")); // Use initialData, initialProdi, or user's prodi as default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canEditCpl, setCanEditCpl] = useState(true); // Default to true, will be set in useEffect

  useEffect(() => {
    // Set form fields if in edit mode
    if (isEditMode && initialData && initialData.id_cpl) {
      console.log("CplForm render - user object:", user); // Log user object before useEffect
      setKodeCpl(initialData.kode_cpl || "");
      setDeskripsiCpl(initialData.deskripsi_cpl || "");
      setSelectedProdiInForm(initialData.id_unit_prodi || "");
      // Check if the current user has permission to edit this CPL
      if (user?.role === "superadmin" || user?.role === "waket-1") {
        setCanEditCpl(true);
      } else {
        // For other roles, check if it's the same prodi
        const isSameProdi = Number(initialData.id_unit_prodi) === Number(user?.unit_id || ""); // Use user?.unit_id consistently
        setCanEditCpl(isSameProdi);
      }
    } else {
      // Reset form fields when not in edit mode (e.g., adding new CPL)
      // Or if in edit mode but initialData is invalid/missing id_cpl
      setKodeCpl("");
      setDeskripsiCpl("");
      setSelectedProdiInForm(initialProdi || (user?.unit_id || "")); // Simplified: removed user?.id_unit_prodi
      setCanEditCpl(true); // Allow editing for new CPLs or if not in edit mode
    }

    const fetchUnitKerja = async () => {
        try {
            const unitKerja = await api.get("/unit-kerja");
            setUnitKerjaList(Array.isArray(unitKerja) ? unitKerja.filter(unit => unit.nama_unit.startsWith('Prodi')) : []);
        } catch (e) {
            console.error("Failed to fetch unit kerja:", e);
        }
    };
    fetchUnitKerja();
  }, [initialData, isEditMode, api, initialProdi, user?.unit_id, user?.role]); // Removed user?.id_unit_prodi from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!kodeCpl || !deskripsiCpl || !selectedProdiInForm) {
      setError("Semua bidang harus diisi.");
      setLoading(false);
      return;
    }
    if (isEditMode && !canEditCpl) {
      setError("Anda tidak diizinkan untuk memperbarui CPL ini.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id_unit_prodi: selectedProdiInForm,
        kode_cpl: kodeCpl,
        deskripsi_cpl: deskripsiCpl,
      };

      if (isEditMode) {
        if (!initialData || !initialData.id_cpl) {
          setError("ID CPL untuk pembaruan tidak ditemukan.");
          setLoading(false);
          return;
        }
        
        await api.put(`/cpl/${initialData.id_cpl}`, payload);
        alert("Data CPL berhasil diperbarui!");
      } else {
        await api.post("/cpl", payload);
        alert("Data CPL berhasil ditambahkan!");
      }
      onComplete();
    } catch (e) {
      console.error("Gagal menyimpan data CPL:", e);
      setError("Gagal menyimpan data CPL. Silakan coba lagi. " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-col">
        <label htmlFor="prodi-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prodi:
        </label>
        <SearchableSelect
          id="prodi-select"
          value={selectedProdiInForm}
          onChange={(e) => setSelectedProdiInForm(Number(e.target.value))}
          options={unitKerjaList.map(unit => ({ value: unit.id_unit, label: unit.nama_unit }))}
          placeholder="Pilih Prodi"
          disabled={loading || isEditMode || !canEditCpl} // Disable prodi selection in edit mode or if no permission
        />
      </div>

      <InputField
        label="Kode CPL"
        value={kodeCpl}
        onChange={(e) => setKodeCpl(e.target.value)}
        placeholder="Contoh: CPL-TI-01"
        disabled={loading || !canEditCpl}
      />

      <InputField
        label="Deskripsi CPL"
        value={deskripsiCpl}
        onChange={(e) => setDeskripsiCpl(e.target.value)}
        placeholder="Deskripsi Capaian Pembelajaran Lulusan"
        textarea // Gunakan prop textarea untuk membuat input menjadi textarea
        disabled={loading || !canEditCpl}
      />

      <Button
        type="submit"
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        disabled={loading || !canEditCpl}
      >
        {loading ? "Menyimpan..." : (isEditMode ? "Perbarui CPL" : "Tambah CPL")}
      </Button>
    </form>
  );
}

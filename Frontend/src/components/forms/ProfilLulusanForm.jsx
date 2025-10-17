import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { Button, InputField } from "../ui";
import { useAuth } from "../../hooks/useAuth";

export function ProfilLulusanForm({ onComplete, initialData, isEditMode, initialProdi }) {
  const api = useApi();
  const { user } = useAuth();
  const [kodePl, setKodePl] = useState(initialData?.kode_pl || "");
  const [deskripsiPl, setDeskripsiPl] = useState(initialData?.deskripsi_pl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [selectedIdUnitProdi, setSelectedIdUnitProdi] = useState(initialProdi);

  // Effect to handle initial data for edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      setKodePl(initialData.kode_pl || "");
      setDeskripsiPl(initialData.deskripsi_pl || "");
      setSelectedIdUnitProdi(initialData.id_unit_prodi); // Set initial prodi for edit mode
    }
  }, [initialData, isEditMode, initialProdi]);

  // New effect to force null for superadmin/waket-1 in add mode once user is loaded
  useEffect(() => {
    if (user && !isEditMode && (user.role === "superadmin" || user.role === "waket-1")) {
      setSelectedIdUnitProdi(null); // Force selection
    }
  }, [isEditMode, user]);

  useEffect(() => {
    const fetchUnitKerja = async () => {
      try {
        const data = await api.get("/unit-kerja");
        const filteredData = data.filter(unit => [4, 5].includes(unit.id_unit)); // Filter only Prodi TI and MI
        setUnitKerjaList(filteredData);
      } catch (e) {
        console.error("ProfilLulusanForm: Gagal mengambil daftar unit kerja:", e);
        setError("Gagal mengambil daftar prodi.");
      }
    };
    const shouldShowDropdown = ["superadmin", "waket-1"].includes(user?.role); // Deklarasikan di sini
    if (shouldShowDropdown) {
      fetchUnitKerja();
    }
  }, [api, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!kodePl || !deskripsiPl) {
      setError("Kode Profil Lulusan dan Deskripsi tidak boleh kosong.");
      setLoading(false);
      return;
    }

    const prodiToSubmit = user?.role === "superadmin" || user?.role === "waket-1" ? selectedIdUnitProdi : initialProdi;
    if (!prodiToSubmit) {
      setError("Prodi harus dipilih.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id_unit_prodi: prodiToSubmit, // Use selectedIdUnitProdi or initialProdi
        kode_pl: kodePl,
        deskripsi_pl: deskripsiPl,
      };

      if (isEditMode) {
        await api.put(`/profil-lulusan/${initialData.id_pl}`, payload);
        alert("Data Profil Lulusan berhasil diperbarui!");
      } else {
        await api.post("/profil-lulusan", payload);
        alert("Data Profil Lulusan berhasil ditambahkan!");
      }
      onComplete();
    } catch (e) {
      console.error("Gagal menyimpan data Profil Lulusan:", e);
      setError(`Gagal menyimpan data Profil Lulusan. ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {user?.role === "superadmin" || user?.role === "waket-1" ? (
        <div className="relative z-10">
          <label htmlFor="prodi-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Prodi</label>
          <select
            id="prodi-select"
            name="id_unit_prodi"
            value={selectedIdUnitProdi || ""}
            onChange={(e) => setSelectedIdUnitProdi(Number(e.target.value))}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
            required
          >
            <option value="" disabled>Pilih Prodi</option>
            {unitKerjaList.map((unit) => (
              <option key={unit.id_unit} value={unit.id_unit}>
                {unit.nama_unit}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <InputField
        label="Kode Profil Lulusan"
        type="text"
        value={kodePl}
        onChange={(e) => setKodePl(e.target.value)}
        placeholder="Contoh: PL-TI-01"
        required
      />
      <InputField
        label="Deskripsi Profil Lulusan"
        type="textarea"
        value={deskripsiPl}
        onChange={(e) => setDeskripsiPl(e.target.value)}
        placeholder="Deskripsi Profil Lulusan"
        required
      />
      <Button type="submit" isLoading={loading} className="bg-indigo-600 text-white py-2 px-4 rounded-md">
        {isEditMode ? "Update Profil Lulusan" : "Tambah Profil Lulusan"}
      </Button>
      <Button type="button" onClick={onComplete} variant="soft" className="ml-2">
        Batal
      </Button>
    </form>
  );
}

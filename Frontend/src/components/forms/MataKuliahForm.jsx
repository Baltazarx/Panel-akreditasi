import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, InputField, SearchableSelect } from "../ui";

export function MataKuliahForm({ onComplete, onClose, initialData, isEditing, initialProdi }) {
  const api = useApi();
  const { user } = useAuth();

  const [kodeMk, setKodeMk] = useState(initialData?.kode_mk || "");
  const [namaMk, setNamaMk] = useState(initialData?.nama_mk || "");
  const [sks, setSks] = useState(initialData?.sks !== undefined ? String(initialData.sks) : "");
  const [semester, setSemester] = useState(initialData?.semester !== undefined ? String(initialData.semester) : "");
  const [idMk, setIdMk] = useState(initialData?.id_mk || null);
  const [unitKerjaList, setUnitKerjaList] = useState([]);
  const [profilLulusanList, setProfilLulusanList] = useState([]);
  const [selectedPls, setSelectedPls] = useState(initialData?.selectedPls || []);
  const [selectedProdiInForm, setSelectedProdiInForm] = useState(() => {
    if (initialData?.id_unit_prodi) return initialData.id_unit_prodi;
    if (initialProdi) return initialProdi;
    if (user?.unit_id) return user.unit_id;
    if (user?.id_unit_prodi) return user.id_unit_prodi;
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canEditMk, setCanEditMk] = useState(true);

  const fetchProfilLulusan = useCallback(async () => {
    try {
      if (selectedProdiInForm) {
        const profilLulusan = await api.get(`/profil-lulusan?id_unit_prodi=${selectedProdiInForm}`);
        setProfilLulusanList(Array.isArray(profilLulusan) ? profilLulusan : []);
      }
    } catch (e) {
      console.error("Failed to fetch profil lulusan:", e);
      setProfilLulusanList([]);
    }
  }, [selectedProdiInForm, api]);

  useEffect(() => {
    // Set form fields if in edit mode
    if (isEditing && initialData && initialData.id_mk) {
      setIdMk(initialData.id_mk || null);
      setKodeMk(initialData.kode_mk || "");
      setNamaMk(initialData.nama_mk || "");
      setSks(initialData.sks !== undefined ? String(initialData.sks) : "");
      setSemester(initialData.semester !== undefined ? String(initialData.semester) : "");
      setSelectedProdiInForm(initialData.id_unit_prodi || "");

      // Check if the current user has permission to edit this mata kuliah
      if (user?.role === "superadmin" || user?.role === "waket-1") {
        setCanEditMk(true);
      } else {
        // For other roles, check if it's the same prodi
        const isSameProdi = Number(initialData.id_unit_prodi) === Number(user?.unit_id || "");
        setCanEditMk(isSameProdi);
      }
    } else {
      // Reset form fields when not in edit mode
      setKodeMk("");
      setNamaMk("");
      setSks("");
      setSemester("");
      setSelectedPls([]);
      setProfilLulusanList([]);
      setSelectedProdiInForm(() => {
        if (initialProdi) return initialProdi;
        if (user?.unit_id) return user.unit_id;
        if (user?.id_unit_prodi) return user.id_unit_prodi;
        return "";
      });
      setCanEditMk(true);
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
  }, [initialData, isEditing, api, initialProdi, user?.unit_id, user?.role]);

  // Fetch profil lulusan when selectedProdiInForm changes or on mount
  useEffect(() => {
    if (selectedProdiInForm && typeof selectedProdiInForm === 'number' && selectedProdiInForm > 0) {
      fetchProfilLulusan();
    }
  }, [selectedProdiInForm, fetchProfilLulusan]);

  // Initial fetch of profil lulusan if prodi is already selected
  useEffect(() => {
    if (selectedProdiInForm && typeof selectedProdiInForm === 'number' && selectedProdiInForm > 0) {
      fetchProfilLulusan();
    }
  }, []); // Only run on mount

  // Update selectedPls when profilLulusanList changes and we're in edit mode
  useEffect(() => {
    if (isEditing && initialData && initialData.selectedPls && profilLulusanList.length > 0) {
      const validSelectedPls = initialData.selectedPls.filter(plId =>
        profilLulusanList.some(pl => pl.id_pl === plId)
      );
      if (validSelectedPls.length !== selectedPls.length || validSelectedPls.some(plId => !selectedPls.includes(plId))) {
        setSelectedPls(validSelectedPls);
      }
    }
  }, [profilLulusanList, isEditing, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!kodeMk || !namaMk || !sks || !semester || !selectedProdiInForm) {
      setError("Semua bidang harus diisi.");
      setLoading(false);
      return;
    }

    if (isEditing && !canEditMk) {
      setError("Anda tidak diizinkan untuk memperbarui mata kuliah ini.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        id_unit_prodi: selectedProdiInForm,
        kode_mk: kodeMk,
        nama_mk: namaMk,
        sks: Number(sks),
        semester: Number(semester),
        selectedPls: selectedPls, // Add selected PLs to payload
      };

      if (isEditing) {
        if (!initialData || !initialData.id_mk) {
          setError("ID mata kuliah untuk pembaruan tidak ditemukan.");
          setLoading(false);
          return;
        }

        await api.put(`/mata-kuliah/${initialData.id_mk}`, payload);
        alert("Data mata kuliah berhasil diperbarui!");
        onComplete();
      } else {
        await api.post("/mata-kuliah", payload);
        alert("Data mata kuliah berhasil ditambahkan!");
        onComplete();
      }
    } catch (e) {
      console.error("Gagal menyimpan data mata kuliah:", e);
      setError("Gagal menyimpan data mata kuliah. Silakan coba lagi. " + (e.message || e));
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
          disabled={loading || isEditing || !canEditMk}
        />
      </div>

      <InputField
        label="Kode Mata Kuliah"
        value={kodeMk}
        onChange={(e) => setKodeMk(e.target.value)}
        placeholder="Contoh: TI001"
        disabled={loading || !canEditMk}
      />

      <InputField
        label="Nama Mata Kuliah"
        value={namaMk}
        onChange={(e) => setNamaMk(e.target.value)}
        placeholder="Nama lengkap mata kuliah"
        disabled={loading || !canEditMk}
      />

      <InputField
        label="SKS"
        type="number"
        value={sks}
        onChange={(e) => setSks(e.target.value)}
        placeholder="Jumlah SKS"
        disabled={loading || !canEditMk}
      />

      <InputField
        label="Semester"
        type="number"
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        placeholder="Semester (1-8)"
        disabled={loading || !canEditMk}
      />

      <div className="flex flex-col">
        <label htmlFor="pl-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Profil Lulusan (PL) yang Terkait:
        </label>
        <SearchableSelect
          id="pl-select"
          value={selectedPls.filter(plId => profilLulusanList.some(pl => pl.id_pl === plId))}
          onChange={(e) => setSelectedPls(e.target.value)}
          options={profilLulusanList.map(pl => ({
            value: pl.id_pl,
            label: `${pl.kode_pl} - ${pl.deskripsi_pl}`
          }))}
          placeholder="Pilih Profil Lulusan"
          multiple={true}
          disabled={loading || !canEditMk || profilLulusanList.length === 0}
        />
        {profilLulusanList.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Tidak ada Profil Lulusan untuk prodi ini. Silakan tambahkan PL terlebih dahulu.
          </p>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          type="submit"
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
          disabled={loading || !canEditMk}
        >
          {loading ? "Menyimpan..." : (isEditing ? "Perbarui Mata Kuliah" : "Tambah Mata Kuliah")}
        </Button>

        <Button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
          disabled={loading}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}

export default MataKuliahForm;

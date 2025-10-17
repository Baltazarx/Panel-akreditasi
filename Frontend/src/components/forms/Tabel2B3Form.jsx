import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, InputField, Select } from "../ui";

export function Tabel2B3Form({ onComplete, initialData, isEditMode }) {
  const api = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cplList, setCplList] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [formData, setFormData] = useState({
    id_cpl: "",
    id_mk: "",
    id_tahun: "",
    id_unit_prodi: user?.unit_id || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id_cpl: initialData.id_cpl || "",
        id_mk: initialData.id_mk || "",
        id_tahun: initialData.id_tahun || "",
        id_unit_prodi: initialData.id_unit_prodi || user?.unit_id || "",
      });
    }
  }, [initialData, user?.unit_id]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [cplData, mkData, tahunData] = await Promise.all([
          api.get("/cpl"),
          api.get("/mata-kuliah"),
          api.get("/tahun"),
        ]);
        setCplList(Array.isArray(cplData) ? cplData : []);
        setMataKuliahList(Array.isArray(mkData) ? mkData : []);
        setTahunList(Array.isArray(tahunData) ? tahunData : []);
      } catch (e) {
        console.error("Gagal mengambil data dropdown:", e);
        setError(e);
      }
    };
    fetchDropdownData();
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData, id_cpl: Number(formData.id_cpl), id_mk: Number(formData.id_mk), id_tahun: Number(formData.id_tahun), id_unit_prodi: Number(formData.id_unit_prodi) };
      if (isEditMode) {
        await api.put(`/map-cpl-mk/${initialData.id_cpl}/${initialData.id_mk}`, payload);
      } else {
        await api.post("/map-cpl-mk", payload);
      }
      onComplete();
    } catch (e) {
      console.error("Gagal menyimpan data:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">Error: {error.message}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="CPL"
          type="select"
          id="id_cpl"
          name="id_cpl"
          value={formData.id_cpl}
          onChange={handleChange}
          disabled={loading || isEditMode}
          required
          options={cplList.map(cpl => ({ value: cpl.id_cpl, label: `${cpl.kode_cpl} - ${cpl.deskripsi_cpl}` }))}
          placeholder="Pilih CPL"
        />

        <InputField
          label="Mata Kuliah (CPMK)"
          type="select"
          id="id_mk"
          name="id_mk"
          value={formData.id_mk}
          onChange={handleChange}
          disabled={loading || isEditMode}
          required
          options={mataKuliahList.map(mk => ({ value: mk.id_mk, label: `${mk.kode_mk} - ${mk.nama_mk}` }))}
          placeholder="Pilih Mata Kuliah"
        />

        <InputField
          label="Tahun Akademik"
          type="select"
          id="id_tahun"
          name="id_tahun"
          value={formData.id_tahun}
          onChange={handleChange}
          disabled={loading || isEditMode}
          required
          options={tahunList.map(tahun => ({ value: tahun.id_tahun, label: tahun.tahun }))}
          placeholder="Pilih Tahun"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : isEditMode ? "Update Data" : "Tambah Data"}
      </Button>
    </form>
  );
}

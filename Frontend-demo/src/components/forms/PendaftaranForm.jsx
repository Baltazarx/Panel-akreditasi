import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { Button, InputField, Select } from "../ui";

export function PendaftaranForm({ onSubmit, initialData = {}, onClose, initialTahun }) {
  const api = useApi();
  const [formData, setFormData] = useState({
    pendaftar: "",
    pendaftar_afirmasi: "",
    pendaftar_kebutuhan_khusus: "",
    ...initialData,
    id_tahun: initialData.id_tahun || initialTahun || "", // Prioritaskan initialData, lalu initialTahun
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Jika id_tahun tidak disediakan melalui initialData atau initialTahun, tampilkan input tahun */}
      {!formData.id_tahun && (
        <InputField
          label="Tahun Akademik"
          type="number"
          name="id_tahun"
          value={formData.id_tahun}
          onChange={handleChange}
          placeholder="Masukkan Tahun Akademik"
          required
        />
      )}
      {/* Field daya_tampung dihapus */}
      {/* <InputField
        label="Daya Tampung"
        type="number"
        name="daya_tampung"
        value={formData.daya_tampung}
        onChange={handleChange}
        required
      /> */}
      <InputField
        label="Pendaftar"
        type="number"
        name="pendaftar"
        value={formData.pendaftar}
        onChange={handleChange}
        required
      />
      <InputField
        label="Pendaftar Afirmasi"
        type="number"
        name="pendaftar_afirmasi"
        value={formData.pendaftar_afirmasi}
        onChange={handleChange}
      />
      <InputField
        label="Pendaftar Kebutuhan Khusus"
        type="number"
        name="pendaftar_kebutuhan_khusus"
        value={formData.pendaftar_kebutuhan_khusus}
        onChange={handleChange}
      />
      <Button type="submit" className="w-full">
        Tambah
      </Button>
    </form>
  );
}

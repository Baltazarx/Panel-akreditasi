import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, InputField, Checkbox } from "../ui";

export function Tabel2A2Form({ onSubmit, initialData = {}, onClose, initialTahun }) {
  const api = useApi();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    id_tahun: initialData.id_tahun || initialTahun || "",
    nama_daerah_input: initialData.nama_daerah_input || "",
    jumlah_mahasiswa: initialData.jumlah_mahasiswa || "",
    link_bukti: initialData.link_bukti || "",
    is_afirmasi: initialData.is_afirmasi || false,
    is_kebutuhan_khusus: initialData.is_kebutuhan_khusus || false,
  });

  const [kabupatenKotaList, setKabupatenKotaList] = useState([]);
  const [searchKabupatenKota, setSearchKabupatenKota] = useState("");
  const [showKabupatenKotaSuggestions, setShowKabupatenKotaSuggestions] = useState(false);
  const [currentFoundKab, setCurrentFoundKab] = useState(null);
  
  const NAMA_KABUPATEN_KOTA_PS = "KABUPATEN BANYUWANGI";

  useEffect(() => {
    const fetchKabupatenKota = async () => {
      try {
        const response = await api.get(`/ref-kabupaten-kota?search=${searchKabupatenKota}`);
        setKabupatenKotaList(Array.isArray(response) ? response : []);
      } catch (e) {
        console.error("Gagal memuat data kabupaten/kota:", e);
      }
    };
    const delayDebounceFn = setTimeout(fetchKabupatenKota, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchKabupatenKota, api]);

  useEffect(() => {
    if (formData.nama_daerah_input) {
      const lowerCaseInput = formData.nama_daerah_input.toLowerCase();
      const foundKab = kabupatenKotaList.find(kab => kab.nama_kabupaten_kota.toLowerCase().includes(lowerCaseInput));
      setCurrentFoundKab(foundKab);
    } else {
      setCurrentFoundKab(null);
    }
  }, [formData.nama_daerah_input, kabupatenKotaList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "nama_daerah_input") {
        setSearchKabupatenKota(value);
      }
      return newFormData;
    });
  };

  const handleKabupatenKotaSelect = (value) => {
    setFormData((prev) => ({ ...prev, nama_daerah_input: value }));
    setSearchKabupatenKota("");
    setShowKabupatenKotaSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let categoryToSubmit = "Negara Lain";
    if (currentFoundKab) {
      if (currentFoundKab.nama_kabupaten_kota.toLowerCase() === NAMA_KABUPATEN_KOTA_PS.toLowerCase()) {
        categoryToSubmit = "Sama Kota/Kab";
      } else {
        categoryToSubmit = "Kota/Kab Lain";
      }
    }

    // Hanya membuat SATU objek data, sama seperti id=45
    const dataToSend = {
      id_tahun: formData.id_tahun,
      id_unit_prodi: user.unit_id,
      kategori_geografis: categoryToSubmit,
      nama_daerah_input: formData.nama_daerah_input,
      jumlah_mahasiswa: formData.jumlah_mahasiswa,
      link_bukti: formData.link_bukti,
      is_afirmasi: formData.is_afirmasi ? 1 : 0,
      is_kebutuhan_khusus: formData.is_kebutuhan_khusus ? 1 : 0,
    };
    
    onSubmit(dataToSend);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Isi form tidak ada perubahan, biarkan seperti sebelumnya */}
      <InputField
        label="Tahun Akademik"
        type="number" name="id_tahun" value={formData.id_tahun}
        required readOnly disabled
      />

      <div className="relative">
        <InputField
          label="Nama Kota/Kabupaten"
          type="text" name="nama_daerah_input" value={formData.nama_daerah_input}
          onChange={handleChange}
          placeholder="Masukkan Nama Kota/Kabupaten"
          required
          onFocus={() => setShowKabupatenKotaSuggestions(true)}
          onBlur={() => setTimeout(() => setShowKabupatenKotaSuggestions(false), 250)}
        />
        {showKabupatenKotaSuggestions && kabupatenKotaList.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
            {kabupatenKotaList.map(kab => (
                <li key={kab.id_kabupaten_kota}
                  className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-gray-900 dark:text-gray-100"
                  onClick={() => handleKabupatenKotaSelect(kab.nama_kabupaten_kota)}
                >
                  {kab.nama_kabupaten_kota}
                </li>
              ))}
          </ul>
        )}
      </div>
      
      <InputField
        label="Jumlah Mahasiswa"
        type="number" name="jumlah_mahasiswa" value={formData.jumlah_mahasiswa}
        onChange={handleChange}
        required
      />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Mahasiswa</label>
        <Checkbox
          label="Afirmasi"
          name="is_afirmasi"
          checked={formData.is_afirmasi}
          onChange={handleChange}
        />
        <Checkbox
          label="Berkebutuhan Khusus"
          name="is_kebutuhan_khusus"
          checked={formData.is_kebutuhan_khusus}
          onChange={handleChange}
        />
      </div>
      <InputField
        label="Link Bukti"
        type="url" name="link_bukti" value={formData.link_bukti}
        onChange={handleChange}
        placeholder="Masukkan URL Link Bukti"
      />
      <Button type="submit" className="w-full"> Simpan </Button>
    </form>
  );
}
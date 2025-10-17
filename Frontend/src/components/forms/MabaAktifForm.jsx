import { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";
import { Button, InputField } from "../ui";

export function MabaAktifForm({ onSubmit, initialData = {}, onClose, initialTahun, isNewEntry = false }) {
  const api = useApi();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    daya_tampung: initialData.daya_tampung !== undefined ? initialData.daya_tampung : "", // Tambahkan field daya_tampung kembali
    jenis: "", // 'baru' or 'aktif'
    jalur: "", // 'reguler' or 'rpl'
    jumlah_diterima: "",
    jumlah_afirmasi: "",
    jumlah_kebutuhan_khusus: "",
    ...initialData,
    id_tahun: initialData.id_tahun || initialTahun || "", // Prioritaskan initialData, lalu initialTahun
  });

  const [currentDayaTampung, setCurrentDayaTampung] = useState(0);
  const [existingNewStudents, setExistingNewStudents] = useState(0);
  const [loadingDayaTampung, setLoadingDayaTampung] = useState(false);
  const [errorDayaTampung, setErrorDayaTampung] = useState(null);

  useEffect(() => {
    if (isNewEntry && initialTahun && !initialData.id_tahun) {
      setFormData(prev => ({ ...prev, id_tahun: initialTahun }));
    }
    if (initialData.daya_tampung !== undefined) {
      setFormData(prev => ({ ...prev, daya_tampung: initialData.daya_tampung }));
    }
  }, [isNewEntry, initialTahun, initialData.id_tahun, initialData.daya_tampung]);

  // Fetch daya tampung and existing new students for validation
  useEffect(() => {
    const fetchValidationData = async () => {
      if (!formData.id_tahun || !user?.unit_id) return;

      setLoadingDayaTampung(true);
      setErrorDayaTampung(null);

      try {
        const response = await api.get(`/tabel-2a1-mahasiswa-baru-aktif`, {
          params: { id_tahun: formData.id_tahun, id_unit_prodi: user.unit_id }
        });

        let totalDayaTampung = 0;
        let totalExistingNewStudents = 0;

        if (Array.isArray(response) && response.length > 0) {
          // Assuming daya_tampung is consistent across records for the same year/unit
          totalDayaTampung = response[0].daya_tampung || 0;

          response.forEach(record => {
            if (record.jenis === 'baru' && record.id !== initialData.id) { // Exclude current editing record
              totalExistingNewStudents += (record.jumlah_diterima || 0) + (record.jumlah_afirmasi || 0) + (record.jumlah_kebutuhan_khusus || 0);
            }
          });
        } else if (isNewEntry && formData.daya_tampung) { // For new entries, if daya_tampung is set in form
            totalDayaTampung = Number(formData.daya_tampung);
        }

        setCurrentDayaTampung(totalDayaTampung);
        setExistingNewStudents(totalExistingNewStudents);
      } catch (e) {
        console.error("Failed to fetch validation data:", e);
        setErrorDayaTampung(e);
      } finally {
        setLoadingDayaTampung(false);
      }
    };
    fetchValidationData();
  }, [formData.id_tahun, user?.unit_id, initialData.id, formData.daya_tampung, isNewEntry, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.jenis === 'baru') {
      const currentEntryTotal =
        (Number(formData.jumlah_diterima) || 0) +
        (Number(formData.jumlah_afirmasi) || 0) +
        (Number(formData.jumlah_kebutuhan_khusus) || 0);

      const grandTotalNewStudents = existingNewStudents + currentEntryTotal;

      if (grandTotalNewStudents > currentDayaTampung) {
        alert(
          `Total jumlah mahasiswa baru (${grandTotalNewStudents}) melebihi daya tampung (${currentDayaTampung}).\n\nJumlah yang melebihi: ${grandTotalNewStudents - currentDayaTampung}`
        );
        return; // Prevent form submission
      }
    }

    const dataToSend = { ...formData, id_unit_prodi: user.unit_id };
    await onSubmit(dataToSend);
    onClose();
  };

  const jenisOptions = [
    { value: "baru", label: "Baru" },
    { value: "aktif", label: "Aktif" },
  ];

  const jalurOptions = [
    { value: "reguler", label: "Reguler" },
    { value: "rpl", label: "RPL" },
  ];

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

      {/* Tampilkan Daya Tampung saat ini jika ada */}
      {currentDayaTampung > 0 && formData.jenis === 'baru' && (
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daya Tampung Tahun {formData.id_tahun}</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
            {currentDayaTampung}
          </p>
        </div>
      )}

      {/* Tambahkan kembali InputField untuk Daya Tampung dengan logika bersyarat */}
      {isNewEntry && !initialData.daya_tampung && currentDayaTampung === 0 && (
        <InputField
          label="Daya Tampung"
          type="number"
          name="daya_tampung"
          value={formData.daya_tampung}
          onChange={handleChange}
          placeholder="Masukkan Daya Tampung"
          required
        />
      )}

      {initialData.jenis ? (
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Mahasiswa</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
            {formData.jenis === 'baru' ? 'Baru' : 'Aktif'}
          </p>
        </div>
      ) : (
        <InputField
          label="Jenis Mahasiswa"
          type="select"
          name="jenis"
          value={formData.jenis}
          onChange={handleChange}
          options={jenisOptions}
          placeholder="Pilih Jenis Mahasiswa"
          required
        />
      )}

      {initialData.jalur ? (
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jalur Penerimaan</label>
          <p className="p-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
            {formData.jalur === 'reguler' ? 'Reguler' : 'RPL'}
          </p>
        </div>
      ) : (
        <InputField
          label="Jalur Penerimaan"
          type="select"
          name="jalur"
          value={formData.jalur}
          onChange={handleChange}
          options={jalurOptions}
          placeholder="Pilih Jalur Penerimaan"
          required
        />
      )}

      <InputField
        label="Jumlah Diterima"
        type="number"
        name="jumlah_diterima"
        value={formData.jumlah_diterima}
        onChange={handleChange}
        required
      />
      <InputField
        label="Jumlah Afirmasi"
        type="number"
        name="jumlah_afirmasi"
        value={formData.jumlah_afirmasi}
        onChange={handleChange}
      />
      <InputField
        label="Jumlah Kebutuhan Khusus"
        type="number"
        name="jumlah_kebutuhan_khusus"
        value={formData.jumlah_kebutuhan_khusus}
        onChange={handleChange}
      />
      <Button type="submit" className="w-full">
        Simpan
      </Button>
    </form>
  );
}

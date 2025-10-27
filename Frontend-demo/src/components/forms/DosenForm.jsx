import React, { useState, useEffect } from 'react';
import { Button, Select } from "../ui";

const DosenForm = ({ initialData = {}, onSubmit, onClose, homebaseOptions = [], jabatanFungsionalOptions = [], pegawaiOptions = [] }) => {
  const [formData, setFormData] = useState(initialData);
  const [ptOption, setPtOption] = useState(initialData.pt === 'STIKOM PGRI Banyuwangi' ? 'default' : 'other');

  useEffect(() => {
    setFormData(initialData);
    setPtOption(initialData.pt === 'STIKOM PGRI Banyuwangi' ? 'default' : 'other');
  }, [JSON.stringify(initialData)]); // Deep comparison for initialData

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePtOptionChange = (e) => {
    const value = e.target.value;
    setPtOption(value);
    if (value === 'default') {
      setFormData(prev => ({ ...prev, pt: 'STIKOM PGRI Banyuwangi' }));
    } else {
      setFormData(prev => ({ ...prev, pt: '' })); // Clear when 'Lainnya' is selected
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="id_pegawai" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pegawai</label>
        <Select
          id="id_pegawai"
          name="id_pegawai"
          value={formData.id_pegawai || ''}
          onChange={handleChange}
          options={pegawaiOptions}
          placeholder="Pilih Pegawai"
          className="mt-1 block w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="nidn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">NIDN</label>
        <input
          type="text"
          id="nidn"
          name="nidn"
          value={formData.nidn || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
      <div>
        <label htmlFor="nuptk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">NUPTK</label>
        <input
          type="text"
          id="nuptk"
          name="nuptk"
          value={formData.nuptk || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label htmlFor="homebase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Homebase</label>
        <Select
          id="homebase"
          name="homebase"
          value={formData.homebase || ''}
          onChange={handleChange}
          options={homebaseOptions}
          placeholder="Pilih Homebase"
          className="mt-1 block w-full"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PT (Perguruan Tinggi)</label>
        <div className="mt-1 space-y-2"> {/* Changed from space-x-4 to space-y-2 for vertical layout */}
          <div className="flex items-center"> {/* Added a flex container for each radio button to align text */}
            <input
              type="radio"
              name="pt_option"
              value="default"
              checked={ptOption === 'default'}
              onChange={handlePtOptionChange}
              className="form-radio"
            />
            <label htmlFor="pt_default" className="ml-2 text-gray-900 dark:text-gray-100">STIKOM PGRI Banyuwangi</label>
          </div>
          <div className="flex items-center"> {/* Added a flex container for each radio button to align text */}
            <input
              type="radio"
              name="pt_option"
              value="other"
              checked={ptOption === 'other'}
              onChange={handlePtOptionChange}
              className="form-radio"
            />
            <label htmlFor="pt_other" className="ml-2 text-gray-900 dark:text-gray-100">Lainnya</label>
          </div>
        </div>
        {ptOption === 'other' && (
          <input
            type="text"
            id="pt"
            name="pt"
            value={formData.pt || ''}
            onChange={handleChange}
            className="mt-2 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        )}
      </div>
      <div>
        <label htmlFor="id_jafung" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jabatan Fungsional</label>
        <Select
          id="id_jafung"
          name="id_jafung"
          value={formData.id_jafung || ''}
          onChange={handleChange}
          options={jabatanFungsionalOptions}
          placeholder="Pilih Jabatan Fungsional"
          className="mt-1 block w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="beban_sks" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beban SKS</label>
        <input
          type="number"
          id="beban_sks"
          name="beban_sks"
          value={formData.beban_sks || '0'}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="soft" onClick={onClose}>Batal</Button>
        <Button type="submit" variant="primary">Simpan</Button>
      </div>
    </form>
  );
};

export default DosenForm;

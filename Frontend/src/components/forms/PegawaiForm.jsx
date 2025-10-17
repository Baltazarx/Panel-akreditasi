import React, { useState, useEffect } from 'react';
import { Button } from "../ui";

const PegawaiForm = ({ initialData = {}, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
        <input
          type="text"
          id="nama_lengkap"
          name="nama_lengkap"
          value={formData.nama_lengkap || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
      </div>
      <div>
        <label htmlFor="pendidikan_terakhir" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pendidikan Terakhir</label>
        <input
          type="text"
          id="pendidikan_terakhir"
          name="pendidikan_terakhir"
          value={formData.pendidikan_terakhir || ''}
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

export default PegawaiForm;

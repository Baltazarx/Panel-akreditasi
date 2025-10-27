import React, { useState, useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { Button, Card, SectionTitle, Badge, Select } from "../ui";
import * as Dialog from '@radix-ui/react-dialog';
import DosenForm from "../forms/DosenForm";

const DosenTable = () => {
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jabatanFungsionalOptions, setJabatanFungsionalOptions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDosen, setEditingDosen] = useState(null);
  const api = useApi();

  // Fetch data from API
  const fetchDosen = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/dosen"); // Assuming /dosen is your API endpoint
      setDosen(Array.isArray(response) ? response : []); // Ensure dosen is always an array
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJabatanFungsionalOptions = async () => {
    try {
      const response = await api.get("/ref-jabatan-fungsional");
      setJabatanFungsionalOptions(response.map(item => ({ value: item.id_jafung, label: item.nama_jafung })));
    } catch (err) {
      console.error("Failed to fetch jabatan fungsional options:", err);
    }
  };

  // New: Fetch Pegawai options
  const [pegawaiOptions, setPegawaiOptions] = useState([]);
  const fetchPegawaiOptions = async () => {
    try {
      const response = await api.get("/pegawai");
      setPegawaiOptions(response.map(item => ({ value: item.id_pegawai, label: item.nama_lengkap })));
    } catch (err) {
      console.error("Failed to fetch pegawai options:", err);
    }
  };

  // Basic CRUD operations
  const handleCreate = () => {
    // This will now be handled by the Dialog Trigger
    // alert("Create new dosen");
  };

  const handleEdit = (id) => {
    const dosenToEdit = dosen.find(d => d.id_dosen === id);
    setEditingDosen(dosenToEdit);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete dosen with ID: ${id}?`)) {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/dosen/${id}`);
        fetchDosen();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/dosen", formData);
      setShowCreateModal(false);
      fetchDosen();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/dosen/${formData.id_dosen}`, formData);
      setShowEditModal(false);
      fetchDosen();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosen();
    fetchJabatanFungsionalOptions();
    fetchPegawaiOptions(); // Call the new fetch function
  }, []);

  return (
    <div className="space-y-4">
      <SectionTitle title="Daftar Dosen"
        right={
          <div className="flex items-center gap-2 text-sm">
            <Badge>{dosen.length} baris</Badge>
            <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
              <Dialog.Trigger asChild>
                <Button variant="primary">
                  + Tambah Dosen
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-lg p-6 shadow-lg bg-white dark:bg-gray-800 z-50">
                  <Dialog.Title className="text-lg font-semibold mb-4">Tambah Dosen Baru</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Isi detail dosen baru di sini.
                  </Dialog.Description>
                  <DosenForm 
                    initialData={{}} // Pass a stable empty object for create mode
                    homebaseOptions={[{ value: "Manajemen Informatika", label: "Manajemen Informatika" }, { value: "Teknik Informatika", label: "Teknik Informatika" }]}
                    jabatanFungsionalOptions={jabatanFungsionalOptions}
                    pegawaiOptions={pegawaiOptions} // Pass pegawai options
                    onSubmit={handleCreateSubmit}
                    onClose={() => setShowCreateModal(false)}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={showEditModal} onOpenChange={setShowEditModal}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-lg p-6 shadow-lg bg-white dark:bg-gray-800 z-50">
                  <Dialog.Title className="text-lg font-semibold mb-4">Edit Dosen</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Ubah detail dosen di sini.
                  </Dialog.Description>
                  <DosenForm 
                    initialData={editingDosen}
                    homebaseOptions={[{ value: "Manajemen Informatika", label: "Manajemen Informatika" }, { value: "Teknik Informatika", label: "Teknik Informatika" }]}
                    jabatanFungsionalOptions={jabatanFungsionalOptions}
                    pegawaiOptions={pegawaiOptions} // Pass pegawai options
                    onSubmit={handleEditSubmit}
                    onClose={() => setShowEditModal(false)}
                  />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        }
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <Card className="p-4">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIDN</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NUPTK</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Homebase</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PT</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Jabatan Fungsional</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Beban SKS</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dosen.map((item) => (
                <tr key={item.id_dosen}>
                  <td className="px-4 py-2 whitespace-nowrap">{item.nama_lengkap}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.nidn}</td>
                  <td className="px-4 py-2">{item.nuptk}</td>
                  <td className="px-4 py-2">{item.homebase}</td>
                  <td className="px-4 py-2">{item.pt}</td>
                  <td className="px-4 py-2">{item.jabatan_fungsional}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{item.beban_sks}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button variant="soft" onClick={() => handleEdit(item.id_dosen)}>Edit</Button>
                      <Button variant="soft" onClick={() => handleDelete(item.id_dosen)}>Hapus</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default DosenTable;

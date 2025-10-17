import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { Button, Card, SectionTitle, Badge } from "../ui";
import * as Dialog from '@radix-ui/react-dialog';
import PegawaiForm from "../forms/PegawaiForm";

const PegawaiTable = () => {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState(null);
  const api = useApi();

  // Fetch data from API
  const fetchPegawai = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/pegawai"); // Assuming /pegawai is your API endpoint
      setPegawai(Array.isArray(response) ? response : []); // Ensure pegawai is always an array
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating new pegawai
  const handleCreateSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/pegawai", formData);
      setShowCreateModal(false); // Close modal on success
      fetchPegawai(); // Refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for updating existing pegawai
  const handleEditSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/pegawai/${formData.id_pegawai}`, formData);
      setShowEditModal(false); // Close modal on success
      fetchPegawai(); // Refresh data
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Basic CRUD operations
  const handleEdit = (id) => {
    const pegawaiToEdit = pegawai.find(p => p.id_pegawai === id);
    setEditingPegawai(pegawaiToEdit);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    // Logic to delete a pegawai
    alert(`Delete pegawai with ID: ${id}`);
  };

  React.useEffect(() => {
    fetchPegawai();
  }, []);

  return (
    <div className="space-y-4">
      <SectionTitle title="Daftar Pegawai"
        right={
          <div className="flex items-center gap-2 text-sm">
            <Badge>{pegawai.length} baris</Badge>
            <Dialog.Root open={showCreateModal} onOpenChange={setShowCreateModal}>
              <Dialog.Trigger asChild>
                <Button variant="primary">
                  + Tambah Pegawai
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg rounded-lg p-6 shadow-lg bg-white dark:bg-gray-800 z-50">
                  <Dialog.Title className="text-lg font-semibold mb-4">Tambah Pegawai Baru</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Isi detail pegawai baru di sini.
                  </Dialog.Description>
                  <PegawaiForm 
                    initialData={{}} // Pass a stable empty object for create mode
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
                  <Dialog.Title className="text-lg font-semibold mb-4">Edit Pegawai</Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Ubah detail pegawai di sini.
                  </Dialog.Description>
                  <PegawaiForm 
                    initialData={editingPegawai}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pendidikan Terakhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {pegawai.map((item) => (
                <tr key={item.id_pegawai}>
                  <td className="px-6 py-4 whitespace-nowrap">{item.nama_lengkap}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.pendidikan_terakhir}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Button variant="soft" onClick={() => handleEdit(item.id_pegawai)}>Edit</Button>
                      <Button variant="soft" onClick={() => handleDelete(item.id_pegawai)}>Hapus</Button>
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

export default PegawaiTable;

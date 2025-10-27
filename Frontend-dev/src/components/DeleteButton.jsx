"use client";
import Swal from "sweetalert2";

export default function DeleteButton({ onDelete }) {
  const handleDelete = () => {
    Swal.fire({
      title: "Yakin hapus data ini?",
      text: "Data yang dihapus tidak bisa dikembalikan lagi.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        if (onDelete) onDelete(); // trigger fungsi delete
        Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
    >
      Hapus Data
    </button>
  );
}

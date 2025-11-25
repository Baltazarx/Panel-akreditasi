"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api"; // Path disesuaikan
import { useAuth } from "../../../context/AuthContext";
import Swal from 'sweetalert2';

// ============================================================
// CPMK CRUD
// ============================================================
export default function CpmkCRUD({ role, maps, onDataChange }) {
  const { authUser } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Cek apakah user adalah superadmin (bisa melihat semua prodi)
  const userRole = authUser?.role || role;
  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());
  
  // Ambil id_unit_prodi dari authUser jika user adalah prodi user
  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;
  
  // === PERBAIKAN: State filter menyimpan id_unit_prodi ===
  const [selectedProdi, setSelectedProdi] = useState("");
  
  // Set selectedProdi untuk user prodi
  useEffect(() => {
    if (!isSuperAdmin && userProdiId && !selectedProdi) {
      // User prodi: set ke prodi mereka
      setSelectedProdi(String(userProdiId));
    } else if (isSuperAdmin && !selectedProdi) {
      // Superadmin: default ke "Semua Prodi" (empty string)
      setSelectedProdi("");
    }
  }, [isSuperAdmin, userProdiId, selectedProdi]);

  // === PERBAIKAN: Filter dilakukan di backend, bukan di frontend ===
  const fetchRows = async () => {
    setLoading(true);
    try {
      let url = "/cpmk";
      // Jika user prodi, selalu filter berdasarkan prodi mereka
      if (!isSuperAdmin && userProdiId) {
        url += `?id_unit_prodi=${userProdiId}`;
      } else if (selectedProdi) {
        // Superadmin memilih prodi tertentu
        url += `?id_unit_prodi=${selectedProdi}`;
      } else {
        // Superadmin memilih "Semua Prodi" = kirim semua prodi (TI dan MI)
        url += "?id_unit_prodi_in=4,5";
      }
      
      const result = await apiFetch(url);
      setRows(result);
    } catch (err) {
      console.error("Error fetching CPMK:", err);
      Swal.fire('Error', 'Gagal memuat data CPMK', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin dan selectedProdi sudah di-set (bisa empty string untuk "Semua Prodi")
    if ((!isSuperAdmin && userProdiId) || (isSuperAdmin && selectedProdi !== null && selectedProdi !== undefined)) {
      fetchRows();
    }
  }, [selectedProdi, isSuperAdmin, userProdiId]); // Fetch ulang ketika filter berubah

  // Ekstrak Prodi dari maps untuk filter
  const prodiList = Object.values(maps?.units || {}).filter(
    uk => uk.id_unit === 4 || uk.id_unit === 5 // Asumsi hanya TI (4) dan MI (5)
  );

  // Ambil daftar MK dari maps
  const mkList = Object.values(maps?.mata_kuliah || {});

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">Capaian Pembelajaran Mata Kuliah (CPMK)</h2>
        <div className="flex items-center gap-3">
          
          {/* === Dropdown filter hanya untuk superadmin === */}
          {isSuperAdmin && (
            <select
              value={selectedProdi}
              onChange={(e) => setSelectedProdi(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"
            >
              <option value="">Semua Prodi</option>
              {prodiList.map(prodi => (
                <option key={prodi.id_unit} value={prodi.id_unit}>{prodi.nama_unit}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Filter Info */}
      <div className="mb-3 text-sm text-slate-600">
        Menampilkan {rows.length} CPMK
        {selectedProdi && ` untuk ${prodiList.find(p => p.id_unit == selectedProdi)?.nama_unit || 'Prodi Terpilih'}`}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Kode CPMK</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Deskripsi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Unit Prodi</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase border border-white">Mata Kuliah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={row.id_cpmk} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>
                <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.id_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.kode_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.deskripsi_cpmk}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_unit_prodi}</td>
                <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
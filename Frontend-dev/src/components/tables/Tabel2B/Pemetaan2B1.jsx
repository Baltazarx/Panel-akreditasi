"use client";



import React, { useEffect, useState } from "react";

import { apiFetch } from "../../../lib/api"; // Path disesuaikan

import { roleCan } from "../../../lib/role"; // Path disesuaikan

import { useAuth } from "../../../context/AuthContext";

import Swal from 'sweetalert2';



// ============================================================

// 2B.1 PEMETAAN MK vs PL (LAPORAN)

// ============================================================

export default function Pemetaan2B1({ role, refreshTrigger }) {

  const { authUser } = useAuth();

  const [data, setData] = useState({ columns: [], data: [] });

  const [loading, setLoading] = useState(false);

  const canRead = roleCan(role, "pemetaan2b1", "R");



  // === BARU: Cek role SuperAdmin ===

  const userRole = authUser?.role || role;

  const isSuperAdmin = ['superadmin', 'waket1', 'waket2', 'tpm'].includes(userRole?.toLowerCase());

  

  // Ambil id_unit_prodi dari authUser jika user adalah prodi user

  const userProdiId = authUser?.id_unit_prodi || authUser?.unit;

  

  // === BARU: State untuk filter prodi ===

  // Asumsi ID: 4 = TI, 5 = MI. "" = Semua Prodi

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



  const fetchData = async () => {

    if (!canRead) return;

    setLoading(true);



    // === MODIFIKASI: Tambahkan query parameter jika filter aktif ===

    const queryParams = new URLSearchParams();

    // Jika user prodi, filter berdasarkan prodi mereka

    if (!isSuperAdmin && userProdiId) {

      queryParams.append("id_unit_prodi", String(userProdiId));

    } else if (isSuperAdmin && selectedProdi) {

      queryParams.append("id_unit_prodi", selectedProdi);

    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // =========================================================



    try {

      // === MODIFIKASI: Kirim request dengan query string ===

      const result = await apiFetch(`/pemetaan-2b1${queryString}`);

      setData(result);

    } catch (err) {

      console.error("Error fetching pemetaan 2B.1:", err);

      Swal.fire('Error', 'Gagal memuat data pemetaan 2B.1', 'error');

    } finally {

      setLoading(false);

    }

  };



  const handleExport = async () => {

    if (!canRead) return;



    // === MODIFIKASI: Tambahkan query parameter jika filter aktif ===

    const queryParams = new URLSearchParams();

    // Jika user prodi, filter berdasarkan prodi mereka

    if (!isSuperAdmin && userProdiId) {

      queryParams.append("id_unit_prodi", String(userProdiId));

    } else if (isSuperAdmin && selectedProdi) {

      queryParams.append("id_unit_prodi", selectedProdi);

    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // =========================================================



    try {

      // === MODIFIKASI: Kirim request dengan query string ===

      const response = await fetch(`/api/pemetaan-2b1/export${queryString}`, {

        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

      });

      if (response.ok) {

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;

        a.download = 'Tabel_2B1_Pemetaan_MK_vs_PL.xlsx';

        document.body.appendChild(a);

        a.click();

        window.URL.revokeObjectURL(url);

        document.body.removeChild(a);

        Swal.fire('Success', 'File Excel berhasil diunduh', 'success');

      } else {

        throw new Error('Gagal mengunduh file');

      }

    } catch (err) {

      Swal.fire('Error', 'Gagal mengexport data', 'error');

    }

  };



  // === MODIFIKASI: Tambahkan selectedProdi dan userProdiId sebagai dependency ===

  useEffect(() => {

    // Hanya fetch jika:
    // - User prodi dan userProdiId sudah ada, ATAU
    // - Superadmin (bisa fetch tanpa filter atau dengan filter)
    if ((!isSuperAdmin && userProdiId) || isSuperAdmin) {

      fetchData();

    }

  }, [refreshTrigger, canRead, selectedProdi, isSuperAdmin, userProdiId]); 

  // =========================================================



  if (!canRead) {

    return (

      <div className="text-center py-8">

        <p className="text-slate-500">Anda tidak memiliki akses untuk melihat data ini.</p>

      </div>

    );

  }



  return (

    <div>

      <div className="mb-4 flex justify-between items-center">

        <h2 className="text-lg font-semibold text-slate-800">Pemetaan Mata Kuliah vs Profil Lulusan</h2>

        

        {/* === BARU: Wrapper untuk filter dan tombol export === */}

        <div className="flex items-center gap-3">

          {/* Tampilkan filter HANYA jika superadmin */}

          {isSuperAdmin && (

            <select

              value={selectedProdi}

              onChange={(e) => setSelectedProdi(e.target.value)}

              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0384d6] focus:border-[#0384d6] bg-white text-black"

            >

              <option value="">Semua Prodi</option>

              <option value="4">Teknik Informatika (TI)</option>

              <option value="5">Manajemen Informatika (MI)</option>

            </select>

          )}

          

          <button

            onClick={handleExport}

            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"

          >

            📥 Export Excel

          </button>

        </div>

        {/* ================================================ */}

      </div>



      {loading ? (

        <div className="flex justify-center py-8">

          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0384d6]"></div>

        </div>

      ) : (

        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">

          <table className="w-full text-sm text-left">

            <thead className="bg-gradient-to-r from-[#043975] to-[#0384d6] text-white">

              <tr>

                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Kode MK</th>

                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Nama MK</th>

                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">SKS</th>

                <th className="px-4 py-3 text-xs font-semibold uppercase border border-white/20">Semester</th>

                {data.columns.map((col) => (

                  <th key={col} className="px-4 py-3 text-xs font-semibold uppercase border border-white/20 text-center">

                    {col}

                  </th>

                ))}

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-200">

              {data.data.map((row, idx) => (

                <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-[#eaf4ff]`}>

                  <td className="px-4 py-3 font-semibold text-slate-800 border border-slate-200">{row.kode_mk}</td>

                  <td className="px-4 py-3 text-slate-700 border border-slate-200">{row.nama_mk}</td>

                  <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.sks}</td>

                  <td className="px-4 py-3 text-slate-700 border border-slate-200 text-center">{row.semester}</td>

                  {data.columns.map((col) => (

                    <td key={col} className="px-4 py-3 text-center border border-slate-200">

                      {row.profil_lulusan && row.profil_lulusan[col] ? "✅" : ""}

                    </td>

                  ))}

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}
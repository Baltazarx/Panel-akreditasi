// lib/role.js

/**
 * ACCESS_MATRIX mendefinisikan izin akses frontend, MENCERMINKAN backend roles.js.
 * Digunakan oleh fungsi roleCan() untuk mengatur visibilitas UI.
 * Aksi ditulis dalam huruf kecil: c, r, u, d, h.
 */
export const ACCESS_MATRIX = {
  // ========== SUPERADMIN (dari backend - punya akses *) ==========
  'waket1': { '*': { c: true, r: true, u: true, d: true, h: true } },
  'waket2': { '*': { c: true, r: true, u: true, d: true, h: true } },
  'tpm':    { '*': { c: true, r: true, u: true, d: true, h: true } },
  'ketuastikom': { '*': { r: true } }, // Hanya read wildcard

  // ========== PRODI (sesuai aturan baru C1 + aturan Tabel 2B) ==========
  'prodi': {
    // ---- Tabel C1 ----
    'tabel_1a4':        { r: true }, // HANYA 1A4 yang bisa diakses Prodi (Read assumed)

    // ---- Tabel 2B ----
    'profil_lulusan':   { c: true, r: true, u: true, d: true },
    'cpl':              { c: true, r: true, u: true, d: true },
    'mata_kuliah':      { c: true, r: true, u: true, d: true },
    'cpmk':             { c: true, r: true, u: true, d: true },
    'pemetaan2b1':      { r: true },
    'pemetaan2b2':      { r: true, u: true },
    'pemetaan2b3':      { r: true },
    'pemetaanCpmkCpl':  { r: true, u: true },

    // ---- Tabel Prodi Lainnya (dari backend roles.js) ----
    'visi_misi':        { c: true, r: true, u: true, d: true },
    'isi_pembelajaran': { c: true, r: true, u: true, d: true },
    'beban_kerja_dosen':        { c: true, r: true, u: true, d: true },
    'mahasiswa_kondisi':        { c: true, r: true, u: true, d: true },
    'fleksibilitas_pembelajaran': { c: true, r: true, u: true, d: true },
    'bentuk_pembelajaran_master': { c: true, r: true, u: true, d: true },
    'rekognisi_lulusan':        { c: true, r: true, u: true, d: true },
    'sumber_rekognisi_master':  { c: true, r: true, u: true, d: true }
    // Resource prodi lain dari file asli Anda (seperti dosen, pegawai, dll.)
    // sebaiknya dihapus dari sini jika tidak ada di backend roles.js untuk prodi
    // 'dosen': { c: true, u: true, d: true, r: true, h: true }, // Contoh HAPUS jika tidak relevan
    // 'pegawai': { c: true, u: true, d: true, r: true, h: true }, // Contoh HAPUS jika tidak relevan
  },

  // ========== LPPM (sesuai aturan baru C1 + aturan backend) ==========
  'lppm': {
    'tabel_1a2':  { c: true, r: true, u: true, d: true }, // Asumsi CRUD tanpa H
    'tabel_1a3':  { c: true, r: true, u: true, d: true }, // Asumsi CRUD tanpa H
    'penelitian': { c: true, r: true, u: true, d: true }, // Dari backend roles.js
    'pkm':        { c: true, r: true, u: true, d: true }, // Dari backend roles.js
    'sumber_pendanaan_summary': { R: true },
  },

  // ========== KEPEGAWAIAN (sesuai aturan baru C1) ==========
  'kepegawaian': { // Menambahkan role ini jika belum ada
    'tabel_1a5': { c: true, r: true, u: true, d: true }, // Asumsi CRUD tanpa H
    'dosen': { c: true, r: true, u: true, d: true, h: true }, // Data Dosen
    'pegawai': { c: true, r: true, u: true, d: true, h: true }, // Data Pegawai
    'tendik': { c: true, r: true, u: true, d: true, h: true }, // Data Tenaga Kependidikan
  },

  // ========== SARPRAS (dari backend roles.js) ==========
  'sarpras': {
    'tabel_3a1_sarpras_penelitian': { c: true, r: true, u: true, d: true }, // Asumsi CRUD tanpa H
  },

  // Role lain dari file asli Anda (ala, pmb, kemahasiswaan) perlu ditinjau ulang
  // apakah mereka punya akses ke tabel C1 atau tidak sesuai aturan baru.
  // Untuk sementara, saya hapus akses C1 dari mereka di sini.
  'ala': {
    // Hapus/sesuaikan akses tabel C1 jika tidak relevan
    // Hapus/sesuaikan akses tabel 2B jika tidak relevan
     pemetaan2b1: { r: true }, // Contoh: biarkan jika ALA perlu lihat
     // ...
  },
  'pmb': {
    // Hapus/sesuaikan akses tabel C1 jika tidak relevan
    // Hapus/sesuaikan akses tabel 2B jika tidak relevan
     pemetaan2b1: { r: true }, // Contoh
     // ...
  },
  'kemahasiswaan': {
     // Hapus/sesuaikan akses tabel C1 jika tidak relevan
     // Hapus/sesuaikan akses tabel 2B jika tidak relevan
     pemetaan2b1: { r: true }, // Contoh
     // ...
  },
};

/**
 * Memeriksa apakah sebuah role memiliki izin untuk melakukan aksi tertentu pada tabel tertentu.
 * LOGIKA BARU: Prioritaskan izin spesifik, baru cek wildcard jika tidak ada izin spesifik.
 * @param {string} role - Role pengguna (misal: "prodi").
 * @param {string} tableKey - Kunci tabel yang ingin diakses (misal: "cpl").
 * @param {string} action - Aksi yang ingin dilakukan ("c", "r", "u", "d", "h"). Huruf kecil.
 * @returns {boolean} - True jika diizinkan, false jika ditolak.
 */
export function roleCan(role, tableKey, action) {
  // Debug input awal
  console.log(
    `roleCan - Input: role=${role}, tableKey=${tableKey}, action=${action}`
  );

  if (!role) {
    console.log("roleCan - No role provided, returning false");
    return false;
  }

  // Normalisasi input ke lowercase
  const roleLower = typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase();
  const actionLower = typeof action === 'string' ? action.toLowerCase() : String(action).toLowerCase();
  const tableKeyLower = typeof tableKey === 'string' ? tableKey.toLowerCase() : String(tableKey).toLowerCase();

  // Dapatkan izin untuk role tersebut
  const permissions = ACCESS_MATRIX[roleLower];

  // Jika role tidak ditemukan di matrix
  if (!permissions) {
    console.log(
      `roleCan - Role '${roleLower}' not found in ACCESS_MATRIX, returning false`
    );
    return false;
  }

  // ===== LOGIKA BARU =====
  // 1. Cek Izin Spesifik untuk Tabel Terlebih Dahulu
  const tablePermissions = permissions[tableKeyLower];
  if (tablePermissions && tablePermissions.hasOwnProperty(actionLower)) {
     // Ada izin spesifik (true atau false) yang didefinisikan untuk tabel & aksi ini. Gunakan itu.
     const hasSpecificPermission = !!tablePermissions[actionLower];
     console.log(
       `roleCan - Specific permission found for '${roleLower}' on '${tableKeyLower}' action '${actionLower}': ${hasSpecificPermission}`
     );
     return hasSpecificPermission;
  }

  // 2. JIKA TIDAK ADA Izin Spesifik, Baru Cek Izin Wildcard (*)
  const wildcardPermissions = permissions["*"];
  if (wildcardPermissions) {
     const hasWildcardPermission = !!wildcardPermissions[actionLower];
     console.log(
       `roleCan - No specific permission. Wildcard check for '${roleLower}' action '${actionLower}': ${hasWildcardPermission}`
     );
     return hasWildcardPermission;
  }

  // 3. Jika tidak ada izin spesifik DAN tidak ada izin wildcard yang relevan
  console.log(
      `roleCan - No specific or wildcard permission found for '${roleLower}' on '${tableKeyLower}' action '${actionLower}'. Returning false.`
  );
  return false;
  // ===== AKHIR LOGIKA BARU =====
}
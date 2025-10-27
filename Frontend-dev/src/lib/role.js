// lib/role.js

/**
 * ACCESS_MATRIX mendefinisikan semua izin akses untuk setiap role.
 * Role dan nama tabel sebaiknya ditulis dalam huruf kecil untuk konsistensi.
 *
 * Struktur:
 * {
 * nama_role: {
 * nama_tabel: { C: true, R: true, U: true, D: true },
 * "*": { ... } // Wildcard untuk memberikan izin ke semua tabel
 * }
 * }
 */
export const ACCESS_MATRIX = {
  admin: { "*": { c: true, u: true, d: true, r: true, h: true } },
  "waket1": { 
    "*": { c: true, u: true, d: true, r: true, h: true },
    "pimpinan_upps_ps": { c: true, u: true, d: true, r: true, h: true }
  },
  "waket2": { 
    "*": { c: true, u: true, d: true, r: true, h: true },
    "pimpinan_upps_ps": { c: true, u: true, d: true, r: true, h: true }
  },
  tpm: { 
    "*": { c: true, u: true, d: true, r: true, h: true },
    "pimpinan_upps_ps": { c: true, u: true, d: true, r: true, h: true }
  },
  prodi: {
    tabel_1a1: { c: true, u: true, d: true, r: true, h: true }, // Pimpinan UPPS/PS
    pimpinan_upps_ps: { c: true, u: true, d: true, r: true, h: true }, // Pimpinan UPPS/PS
    beban_kerja_dosen: { c: true, u: true, d: true, r: true, h: true },
    dosen: { c: true, u: true, d: true, r: true, h: true }, // Enable dosen untuk prodi
    pegawai: { c: true, u: true, d: true, r: true, h: true }, // Enable pegawai untuk prodi
    tabel_2a1_pendaftaran: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a1_mahasiswa_baru_aktif: { c: true, u: true, d: true, r: true, h: true },
    tahun: { r: true },
    pemetaan2b1: { r: true },
    pemetaan2b2: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b3: { r: true },
    pemetaanCpmkCpl: { c: true, u: true, d: true, r: true, h: true },
    cpmk: { c: true, u: true, d: true, r: true, h: true },
    cpl: { c: true, u: true, d: true, r: true, h: true },
    profil_lulusan: { c: true, u: true, d: true, r: true, h: true },
    mata_kuliah: { c: true, u: true, d: true, r: true, h: true },
  },
  lppm: {
    tabel_1a2: { c: true, u: true, d: true, r: true, h: true },
    tabel_1a3: { c: true, u: true, d: true, r: true, h: true },
  },
  ala: {
    tabel_2a1: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a1_pendaftaran: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a1_mahasiswa_baru_aktif: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a2_keragaman_asal: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a3_kondisi_mahasiswa: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b1: { r: true },
    pemetaan2b2: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b3: { r: true },
    pemetaanCpmkCpl: { c: true, u: true, d: true, r: true, h: true },
    cpmk: { c: true, u: true, d: true, r: true, h: true },
    cpl: { c: true, u: true, d: true, r: true, h: true },
    profil_lulusan: { c: true, u: true, d: true, r: true, h: true },
    mata_kuliah: { c: true, u: true, d: true, r: true, h: true },
  },
  pmb: {
    tabel_2a1: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a1_pendaftaran: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a1_mahasiswa_baru_aktif: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a2_keragaman_asal: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a3_kondisi_mahasiswa: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b1: { r: true },
    pemetaan2b2: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b3: { r: true },
    pemetaanCpmkCpl: { c: true, u: true, d: true, r: true, h: true },
    cpmk: { c: true, u: true, d: true, r: true, h: true },
    cpl: { c: true, u: true, d: true, r: true, h: true },
    profil_lulusan: { c: true, u: true, d: true, r: true, h: true },
    mata_kuliah: { c: true, u: true, d: true, r: true, h: true },
  },
  kemahasiswaan: {
    tabel_2a2_keragaman_asal: { c: true, u: true, d: true, r: true, h: true },
    tabel_2a3_kondisi_mahasiswa: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b1: { r: true },
    pemetaan2b2: { c: true, u: true, d: true, r: true, h: true },
    pemetaan2b3: { r: true },
    pemetaanCpmkCpl: { c: true, u: true, d: true, r: true, h: true },
    cpmk: { c: true, u: true, d: true, r: true, h: true },
    cpl: { c: true, u: true, d: true, r: true, h: true },
    profil_lulusan: { c: true, u: true, d: true, r: true, h: true },
    mata_kuliah: { c: true, u: true, d: true, r: true, h: true },
  },
  kepegawaian: {
    tabel_1a5: { c: true, u: true, d: true, r: true, h: true },
    tendik: { r: true },
  },
};

/**
 * Memeriksa apakah sebuah role memiliki izin untuk melakukan aksi tertentu pada tabel tertentu.
 * @param {string} role - Role pengguna (misal: "WAKET-1").
 * @param {string} tableKey - Kunci tabel yang ingin diakses (misal: "dosen").
 * @param {string} action - Aksi yang ingin dilakukan ("C", "R", "U", "D").
 * @returns {boolean} - True jika diizinkan, false jika ditolak.
 */
export function roleCan(role, tableKey, action) {
  // Log input awal untuk debugging
  console.log(
    `roleCan - Input: role=${role}, tableKey=${tableKey}, action=${action}`
  );

  if (!role) {
    console.log("roleCan - No role provided, returning false");
    return false;
  }

  // --- PERBAIKAN UTAMA ---
  // Ubah input role dan action menjadi huruf kecil agar tidak case-sensitive
  // Handle case where role might not be a string
  const roleLower = typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase();
  const actionLower = typeof action === 'string' ? action.toLowerCase() : String(action).toLowerCase();
  const tableKeyLower = typeof tableKey === 'string' ? tableKey.toLowerCase() : String(tableKey).toLowerCase();

  const permissions = ACCESS_MATRIX[roleLower];

  if (!permissions) {
    console.log(
      `roleCan - Role '${roleLower}' not found in ACCESS_MATRIX, returning false`
    );
    return false;
  }

  // Cek izin wildcard ("*") terlebih dahulu
  if (permissions["*"]) {
    const hasWildcardPermission = !!permissions["*"][actionLower];
    console.log(
      `roleCan - Wildcard check for '${roleLower}' on action '${actionLower}': ${hasWildcardPermission}`
    );
    return hasWildcardPermission;
  }

  // Cek izin spesifik untuk tabel
  const hasSpecificPermission = !!permissions[tableKeyLower]?.[actionLower];
  console.log(
    `roleCan - Specific check for '${roleLower}' on table '${tableKeyLower}' action '${actionLower}': ${hasSpecificPermission}`
  );
  return hasSpecificPermission;
}
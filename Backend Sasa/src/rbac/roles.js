// AccessMatrix berisi pemetaan role -> resource -> hak akses (CRUD)

export const AccessMatrix = {
  // ========== SUPERADMIN ==========
  // PERBAIKAN: Hapus tanda hubung '-' agar cocok dengan nama role di database/token
  'waket1': { '*': { C: true, R: true, U: true, D: true, H: true } },
  'waket2': { '*': { C: true, R: true, U: true, D: true, H: true } },
  'tpm':    { '*': { C: true, R: true, U: true, D: true, H: true } }, // TPM punya akses penuh
  'ketuastikom': { '*': { C: false, R: true, U: false, D: false } }, // read-only

  // ========== PRODI ==========
  'prodi': {
    // Master data
    'profil_lulusan': { C: true, R: true, U: true, D: true },
    'cpl':            { C: true, R: true, U: true, D: true },
    'mata_kuliah':    { C: true, R: true, U: true, D: true },
    'cpmk':           { C: true, R: true, U: true, D: true },
    'kurikulum':      { C: true, R: true, U: true, D: true },
    'visi_misi':      { C: true, R: true, U: true, D: true },

    // Pemetaan (Form Cerdas & Laporan)
    'pemetaan2b1':       { C: false, R: true, U: false, D: false }, // read-only
    'pemetaan2b2':       { C: false, R: true, U: true,  D: false }, // read, update
    'pemetaan2b3':       { C: false, R: true, U: false, D: false }, // read-only
    'pemetaanCpmkCpl':   { C: false, R: true, U: true,  D: false }, // read, update
    'isi_pembelajaran':  { C: true,  R: true, U: true,  D: true },
    
    // Data lain
    'beban_kerja_dosen': { C: true, R: true, U: true, D: true },
    'mahasiswa_kondisi': { C: true, R: true, U: true, D: true },
  },

  // ========== KEMAHASISWAAN ==========
  'kemahasiswaan': {
    'tabel_2b4_masa_tunggu': { C: true, R: true, U: true, D: true },
    'tabel_2b5_kesesuaian_kerja': { C: true, R: true, U: true, D: true },
    'tabel_2b6_kepuasan_pengguna': { C: true, R: true, U: true, D: true },
  },

  // ========== ROLE LAIN (Contoh) ==========
  'lppm': {
    'penelitian': { C: true, R: true, U: true, D: true },
    'pkm':        { C: true, R: true, U: true, D: true },
  },
  // ... (tambahkan role dan izin lain sesuai kebutuhan)
};


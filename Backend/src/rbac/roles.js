// roles.js BACKEND - Updated AccessMatrix

export const AccessMatrix = {
  // ========== SUPERADMIN (Sudah Punya Akses *) ==========
  'waket1': { '*': { C: true, R: true, U: true, D: true, H: true } },
  'waket2': { '*': { C: true, R: true, U: true, D: true, H: true } },
  'tpm':    { '*': { C: true, R: true, U: true, D: true, H: true } },
  'ketuastikom': { '*': { R: true } }, // Read-only wildcard

  // ========== PRODI ==========
  'prodi': {
    // ---- Tabel C1 ----
    'tabel_1a4':        { R: true }, // Sesuai permintaan (Hanya Read)

    // ---- Tabel 2B & Lainnya (dari sebelumnya) ----
    'profil_lulusan':   { C: true, R: true, U: true, D: true },
    'cpl':              { C: true, R: true, U: true, D: true },
    'mata_kuliah':      { C: true, R: true, U: true, D: true },
    'cpmk':             { C: true, R: true, U: true, D: true },
    'visi_misi':        { C: true, R: true, U: true, D: true },
    'pemetaan2b1':      { R: true },
    'pemetaan2b2':      { R: true, U: true },
    'pemetaan2b3':      { R: true },
    'pemetaanCpmkCpl':  { R: true, U: true },
    'isi_pembelajaran': { C: true, R: true, U: true, D: true },
    'beban_kerja_dosen':        { C: true, R: true, U: true, D: true },
    'mahasiswa_kondisi':        { C: true, R: true, U: true, D: true },
    'fleksibilitas_pembelajaran': { C: true, R: true, U: true, D: true },
    'bentuk_pembelajaran_master': { C: true, R: true, U: true, D: true },
    'rekognisi_lulusan':        { C: true, R: true, U: true, D: true },
    'sumber_rekognisi_master':  { C: true, R: true, U: true, D: true }
  },

  // ========== LPPM ==========
  'lppm': {
    'tabel_1a2':  { C: true, R: true, U: true, D: true },
    'tabel_1a3':  { C: true, R: true, U: true, D: true },
    'penelitian': { C: true, R: true, U: true, D: true },
    'pkm':        { C: true, R: true, U: true, D: true },

    // === TAMBAHAN: Izin Baca untuk API yang Gagal ===
    'sumber_pendanaan':           { R: true }, // Untuk API /sumber-pendanaan (jika keynya ini)
    'sumber_pendanaan_summary':   { R: true }, // Untuk API /sumber-pendanaan/summary (jika keynya ini)
    'penggunaan_dana':          { R: true }, // Untuk API /penggunaan-dana
    'penggunaan_dana_summary':  { R: true }, // Untuk API /penggunaan-dana/summary
  },

  // ========== KEPEGAWAIAN ==========
  'kepegawaian': { // Menambahkan role ini
    // ---- Tabel C1 ----
    'tabel_1a5': { C: true, R: true, U: true, D: true }, // Data Kepegawaian
    // Tambahkan resource lain untuk kepegawaian jika perlu
  },

  // ========== SARPRAS ==========
  'sarpras': {
    'tabel_3a1_sarpras_penelitian': { C: true, R: true, U: true, D: true },
    // Tambahkan resource lain untuk sarpras jika perlu
  }

  // Catatan: Akses untuk waket1/waket2/tpm ke tabel 1A1, 1A2, 1A3, 1A4, 1A5, 1B
  // sudah tercakup oleh wildcard '*' mereka.
};
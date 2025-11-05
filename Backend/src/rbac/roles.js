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

    // ---- Tabel 2A3 ----
    'tabel_2a3_kondisi_mahasiswa': { C: true, R: true, U: true, D: true },

    // ---- Tabel 2B & Lainnya (dari sebelumnya) ----
    'profil_lulusan':   { C: true, R: true, U: true, D: true },
    'cpl':              { C: true, R: true, U: true, D: true },
    'mata_kuliah':      { C: true, R: true, U: true, D: true },
    'cpmk':             { C: true, R: true, U: true, D: true },
    'visi_misi':        { C: true, R: true, U: true, D: true },
    'pemetaan2b1':      { R: true },
    'pemetaan2b2':      { R: true, U: true },
    'pemetaan2b3':      { R: true },
    'pemetaanCpmkCpl':  { C: true, R: true, U: true, D: true },
    'isi_pembelajaran': { C: true, R: true, U: true, D: true },
    'beban_kerja_dosen':        { C: true, R: true, U: true, D: true },
    'mahasiswa_kondisi':        { C: true, R: true, U: true, D: true },
    'fleksibilitas_pembelajaran': { C: true, R: true, U: true, D: true },
    'bentuk_pembelajaran_master': { C: true, R: true, U: true, D: true },
    'rekognisi_lulusan':        { C: true, R: true, U: true, D: true },
    'sumber_rekognisi_master':  { C: true, R: true, U: true, D: true },

    // === MASTER DATA: Izin Baca untuk useMaps hook ===
    'unit_kerja': { R: true },
    'pegawai': { R: true },
    'tahun_akademik': { R: true },
    'ref_jabatan_struktural': { R: true },
    'ref_jabatan_fungsional': { R: true },
    'tenaga_kependidikan': { R: true },
    'audit_mutu_internal': { R: true },
    'users': { R: true },
  },

  // ========== PRODI TI ==========
  'prodi_ti': {
    // ---- Tabel C1 ----
    'tabel_1a4':        { R: true }, // Sesuai permintaan (Hanya Read)

    // ---- Tabel 2A3 ----
    'tabel_2a3_kondisi_mahasiswa': { C: true, R: true, U: true, D: true },

    // ---- Tabel 2B & Lainnya (dari sebelumnya) ----
    'profil_lulusan':   { C: true, R: true, U: true, D: true },
    'cpl':              { C: true, R: true, U: true, D: true },
    'mata_kuliah':      { C: true, R: true, U: true, D: true },
    'cpmk':             { C: true, R: true, U: true, D: true },
    'visi_misi':        { C: true, R: true, U: true, D: true },
    'pemetaan2b1':      { R: true },
    'pemetaan2b2':      { R: true, U: true },
    'pemetaan2b3':      { R: true },
    'pemetaanCpmkCpl':  { C: true, R: true, U: true, D: true },
    'isi_pembelajaran': { C: true, R: true, U: true, D: true },
    'beban_kerja_dosen':        { C: true, R: true, U: true, D: true },
    'mahasiswa_kondisi':        { C: true, R: true, U: true, D: true },
    'fleksibilitas_pembelajaran': { C: true, R: true, U: true, D: true },
    'bentuk_pembelajaran_master': { C: true, R: true, U: true, D: true },
    'rekognisi_lulusan':        { C: true, R: true, U: true, D: true },
    'sumber_rekognisi_master':  { C: true, R: true, U: true, D: true },

    // === MASTER DATA: Izin Baca untuk useMaps hook ===
    'unit_kerja': { R: true },
    'pegawai': { R: true },
    'tahun_akademik': { R: true },
    'ref_jabatan_struktural': { R: true },
    'ref_jabatan_fungsional': { R: true },
    'tenaga_kependidikan': { R: true },
    'audit_mutu_internal': { R: true },
    'users': { R: true },
  },

  // ========== PRODI MI ==========
  'prodi_mi': {
    // ---- Tabel C1 ----
    'tabel_1a4':        { R: true }, // Sesuai permintaan (Hanya Read)

    // ---- Tabel 2A3 ----
    'tabel_2a3_kondisi_mahasiswa': { C: true, R: true, U: true, D: true },

    // ---- Tabel 2B & Lainnya (dari sebelumnya) ----
    'profil_lulusan':   { C: true, R: true, U: true, D: true },
    'cpl':              { C: true, R: true, U: true, D: true },
    'mata_kuliah':      { C: true, R: true, U: true, D: true },
    'cpmk':             { C: true, R: true, U: true, D: true },
    'visi_misi':        { C: true, R: true, U: true, D: true },
    'pemetaan2b1':      { R: true },
    'pemetaan2b2':      { R: true, U: true },
    'pemetaan2b3':      { R: true },
    'pemetaanCpmkCpl':  { C: true, R: true, U: true, D: true },
    'isi_pembelajaran': { C: true, R: true, U: true, D: true },
    'beban_kerja_dosen':        { C: true, R: true, U: true, D: true },
    'mahasiswa_kondisi':        { C: true, R: true, U: true, D: true },
    'fleksibilitas_pembelajaran': { C: true, R: true, U: true, D: true },
    'bentuk_pembelajaran_master': { C: true, R: true, U: true, D: true },
    'rekognisi_lulusan':        { C: true, R: true, U: true, D: true },
    'sumber_rekognisi_master':  { C: true, R: true, U: true, D: true },

    // === MASTER DATA: Izin Baca untuk useMaps hook ===
    'unit_kerja': { R: true },
    'pegawai': { R: true },
    'tahun_akademik': { R: true },
    'ref_jabatan_struktural': { R: true },
    'ref_jabatan_fungsional': { R: true },
    'tenaga_kependidikan': { R: true },
    'audit_mutu_internal': { R: true },
    'users': { R: true },
  },

  // ========== LPPM ==========
  'lppm': {
    'tabel_1a2':  { C: true, R: true, U: true, D: true },
    'tabel_1a3':  { C: true, R: true, U: true, D: true },
    'tabel_3a2_penelitian': { C: true, R: true, U: true, D: true },

    // === TAMBAHAN: Izin Baca untuk API yang Gagal ===
    'sumber_pendanaan':           { R: true }, // Untuk API /sumber-pendanaan (jika keynya ini)
    'sumber_pendanaan_summary':   { R: true }, // Untuk API /sumber-pendanaan/summary (jika keynya ini)
    'penggunaan_dana':          { R: true }, // Untuk API /penggunaan-dana
    'penggunaan_dana_summary':  { R: true }, // Untuk API /penggunaan-dana/summary
    
    // === MASTER DATA: Izin Baca untuk useMaps hook ===
    'unit_kerja': { R: true }, // Untuk dropdown unit kerja
    'pegawai': { R: true }, // Untuk dropdown pegawai
    'tahun_akademik': { R: true }, // Untuk dropdown tahun akademik
    'ref_jabatan_struktural': { R: true }, // Untuk dropdown jabatan struktural
    'ref_jabatan_fungsional': { R: true }, // Untuk dropdown jabatan fungsional
    'tenaga_kependidikan': { R: true }, // Untuk dropdown tendik
    'audit_mutu_internal': { R: true }, // Untuk data audit mutu internal
    'dosen': { R: true }, // Untuk dropdown dosen di form Tabel 3.A.2
    
    // === USER MANAGEMENT: Izin Baca untuk UserManagementPage ===
    'users': { R: true }, // Untuk UserManagementPage
  },

  // ========== KEPEGAWAIAN ==========
  'kepegawaian': { // Menambahkan role ini
    // ---- Tabel C1 ----
    'tabel_1a5': { C: true, R: true, U: true, D: true }, // Data Kepegawaian
    // ---- Master Data ----
    'dosen': { C: true, R: true, U: true, D: true, H: true }, // Data Dosen
    'pegawai': { C: true, R: true, U: true, D: true, H: true }, // Data Pegawai
    'tendik': { C: true, R: true, U: true, D: true, H: true }, // Data Tenaga Kependidikan
    // Tambahkan resource lain untuk kepegawaian jika perlu
  },

  // ========== SARPRAS ==========
  'sarpras': {
    'tabel_3a1_sarpras_penelitian': { C: true, R: true, U: true, D: true },
  },

  // ========== KEMAHASISWAAN ==========
  'kemahasiswaan': {
    // Tabel 2.B.4 sampai 2.B.6
    'tabel_2b4_masa_tunggu': { C: true, R: true, U: true, D: true },
    'tabel_2b5_kesesuaian_kerja': { C: true, R: true, U: true, D: true },
    'tabel_2b6_kepuasan_pengguna': { C: true, R: true, U: true, D: true },
    // === MASTER DATA: Izin Baca untuk useMaps hook dan dropdown ===
    'unit_kerja': { R: true },
    'pegawai': { R: true },
    'tahun_akademik': { R: true },
    'ref_jabatan_struktural': { R: true },
    'ref_jabatan_fungsional': { R: true },
    'tenaga_kependidikan': { R: true },
    'audit_mutu_internal': { R: true },
  }

  // Catatan: Akses untuk waket1/waket2/tpm ke tabel 1A1, 1A2, 1A3, 1A4, 1A5, 1B
  // sudah tercakup oleh wildcard '*' mereka.
};
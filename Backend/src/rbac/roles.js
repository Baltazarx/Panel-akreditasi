// src/rbac/roles.js
export const AccessMatrix = {
  // Superadmin
  'waket-1': { '*': { C: true, R: true, U: true, D: true } },
  'waket-2': { '*': { C: true, R: true, U: true, D: true } },
  tpm:       { '*': { C: true, R: true, U: true, D: true } },

  // Read-only global
  ketuastikom: { '*': { R: true } },

  // Unit spesifik (C1)
  lppm: {
    sumber_pendanaan:  { C: true, R: true, U: true, D: true }, // 1.A.2
    penggunaan_dana:   { C: true, R: true, U: true, D: true }, // 1.A.3
    tahun_akademik:    { R: true },
  },
  prodi: {
    beban_kerja_dosen:  { C: true, R: true, U: true, D: true }, // 1.A.4
    dosen:             { R: true },
    pegawai:           { R: true },
    unit_kerja:        { R: true },
    tahun_akademik:    { R: true },
    ref_jabatan_fungsional: { R: true },
    ref_jabatan_struktural: { R: true },
    rekap_seleksi_mahasiswa: { R: true },
    cpl:                       { C: true, R: true, U: true, D: true },
    cpmk:                      { C: true, R: true, U: true, D: true },
    kurikulum:                 { C: true, R: true, U: true, D: true },
    map_cpl_mk:                { C: true, R: true, U: true, D: true },
    map_cpl_pl:                { C: true, R: true, U: true, D: true },
    map_cpmk_cpl:              { C: true, R: true, U: true, D: true },
    map_cpmk_mk:               { C: true, R: true, U: true, D: true },
    mata_kuliah:               { C: true, R: true, U: true, D: true },
    profil_lulusan:            { C: true, R: true, U: true, D: true },
    tabel_2a1_mahasiswa_baru_aktif: { C: true, R: true, U: true, D: true },
    tabel_2a1_pendaftaran:    { C: true, R: true, U: true, D: true },
    tabel_2a2_keragaman_asal: { C: true, R: true, U: true, D: true },
    tabel_2a3_kondisi_mahasiswa: { C: true, R: true, U: true, D: true },
    tabel_2b4_masa_tunggu:    { C: true, R: true, U: true, D: true },
    tabel_2b5_kesesuaian_kerja: { C: true, R: true, U: true, D: true },
    tabel_2b6_kepuasan_pengguna: { C: true, R: true, U: true, D: true },
    tabel_2c_pembelajaran_luar_prodi: { C: true, R: true, U: true, D: true },
    tabel_2d_rekognisi_lulusan: { C: true, R: true, U: true, D: true },
    tabel_2b1_isi_pembelajaran: { R: true, U: true, D: true },
  },
  ala: {
    rekap_seleksi_mahasiswa: { R: true }, // 2.A.1 - Akses untuk ALA
    tahun_akademik: { R: true },
    unit_kerja:     { R: true },
    cpl:                       { R: true },
    kurikulum:                 { R: true },
    mata_kuliah:               { R: true },
    profil_lulusan:            { R: true },
    tabel_2a1_mahasiswa_baru_aktif: { R: true },
    tabel_2a1_pendaftaran:    { R: true },
    tabel_2a2_keragaman_asal: { R: true },
    tabel_2a3_kondisi_mahasiswa: { R: true },
    tabel_2b4_masa_tunggu:    { R: true },
    tabel_2b5_kesesuaian_kerja: { R: true },
    tabel_2b6_kepuasan_pengguna: { R: true },
    tabel_2c_pembelajaran_luar_prodi: { R: true },
    tabel_2d_rekognisi_lulusan: { R: true },
  },
  kepegawaian: {
    kualifikasi_tendik: { C: true, R: true, U: true, D: true }, // 1.A.5
    tendik:             { R: true },
    pegawai:            { R: true },
    dosen:              { R: true },
    unit_kerja:         { R: true },
    tahun_akademik:     { R: true },
  },

  // default
  user: {
    pegawai:        { R: true },
    tahun_akademik: { R: true },
    unit_kerja:     { R: true },
    cpl:                       { R: true },
    cpmk:                      { R: true },
    kurikulum:                 { R: true },
    mata_kuliah:               { R: true },
    profil_lulusan:            { R: true },
    tabel_2a1_mahasiswa_baru_aktif: { R: true },
    tabel_2a1_pendaftaran:    { R: true },
    tabel_2a2_keragaman_asal: { R: true },
    tabel_2a3_kondisi_mahasiswa: { R: true },
    tabel_2b4_masa_tunggu:    { R: true },
    tabel_2b5_kesesuaian_kerja: { R: true },
    tabel_2b6_kepuasan_pengguna: { R: true },
    tabel_2c_pembelajaran_luar_prodi: { R: true },
    tabel_2d_rekognisi_lulusan: { R: true },
  },
};

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 10 Nov 2025 pada 03.47
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tpm_c1`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_mutu_internal`
--

CREATE TABLE `audit_mutu_internal` (
  `id_ami` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `frekuensi_audit` int(11) DEFAULT NULL,
  `dokumen_spmi` text DEFAULT NULL,
  `laporan_audit_url` text DEFAULT NULL,
  `bukti_certified_url` text DEFAULT NULL,
  `jumlah_auditor_certified` int(11) DEFAULT NULL,
  `jumlah_auditor_noncertified` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `audit_mutu_internal`
--

INSERT INTO `audit_mutu_internal` (`id_ami`, `id_unit`, `id_tahun`, `frekuensi_audit`, `dokumen_spmi`, `laporan_audit_url`, `bukti_certified_url`, `jumlah_auditor_certified`, `jumlah_auditor_noncertified`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(5, 9, 2023, 12, 'ini dokumen', 'ini laporan', 'ini url', 12, 13, '2025-08-22 23:46:22', '2025-08-28 03:24:10', NULL, NULL),
(6, 2, 2022, 1, 'ini dokumen', 'link', NULL, 1, 1, '2025-09-26 08:15:56', '2025-09-26 08:16:27', '2025-09-26 15:16:28', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `beban_kerja_dosen`
--

CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `sks_pengajaran` float DEFAULT 0,
  `sks_penelitian` float DEFAULT 0,
  `sks_pkm` float DEFAULT 0,
  `sks_manajemen` float DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `beban_kerja_dosen`
--

INSERT INTO `beban_kerja_dosen` (`id_beban_kerja`, `id_dosen`, `id_tahun`, `sks_pengajaran`, `sks_penelitian`, `sks_pkm`, `sks_manajemen`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(9, 1, 2020, 3, 1, 1, 2.5, '2025-08-23 03:48:17', '2025-08-23 03:53:14', NULL, NULL),
(10, 1, 2021, 3, 1, 1, 2, '2025-09-26 08:13:00', '2025-09-26 08:13:22', '2025-09-26 15:13:22', 1),
(11, 2, 2025, 5, 2.5, 2, 4, '2025-09-30 13:31:52', '2025-09-30 13:31:52', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `bentuk_pembelajaran_master`
--

CREATE TABLE `bentuk_pembelajaran_master` (
  `id_bentuk` int(11) NOT NULL,
  `nama_bentuk` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bentuk_pembelajaran_master`
--

INSERT INTO `bentuk_pembelajaran_master` (`id_bentuk`, `nama_bentuk`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'Micro-credensial', '2025-10-20 07:46:55', '2025-10-20 07:46:55', NULL, NULL),
(2, 'RPL tipe A-2', '2025-10-20 07:46:55', '2025-10-20 07:46:55', NULL, NULL),
(3, 'Pembelajaran di PS lain', '2025-10-20 07:46:55', '2025-10-20 07:46:55', NULL, NULL),
(4, 'Pembelajaran di PT lain', '2025-10-20 07:46:55', '2025-10-20 07:46:55', NULL, NULL),
(5, 'CBL/PBL', '2025-10-20 07:46:55', '2025-10-20 07:46:55', NULL, NULL),
(6, 'Pertukaran Pelajar Nasional', '2025-10-22 02:42:15', '2025-10-22 02:42:15', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpl`
--

CREATE TABLE `cpl` (
  `id_cpl` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `kode_cpl` varchar(20) NOT NULL,
  `deskripsi_cpl` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cpl`
--

INSERT INTO `cpl` (`id_cpl`, `id_unit_prodi`, `kode_cpl`, `deskripsi_cpl`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'CPL-A', 'Menguasai algoritma dan struktur data.', NULL, NULL),
(2, 4, 'CPL-B', 'Menerapkan model Machine Learning.', NULL, NULL),
(3, 5, 'CPL-MI-A', 'Mampu merancang arsitektur sistem informasi.', NULL, NULL),
(4, 5, 'CPL-MI-B', 'Mampu mengelola proyek IT.', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cpmk`
--

CREATE TABLE `cpmk` (
  `id_cpmk` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `kode_cpmk` varchar(20) NOT NULL,
  `deskripsi_cpmk` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `cpmk`
--

INSERT INTO `cpmk` (`id_cpmk`, `id_unit_prodi`, `kode_cpmk`, `deskripsi_cpmk`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'CPMK-AI1', 'Mampu menjelaskan konsep dasar AI', NULL, NULL),
(2, 4, 'CPMK-AI2', 'Mampu membuat model regresi', NULL, NULL),
(3, 4, 'CPMK-BD1', 'Mampu merancang ERD', NULL, NULL),
(4, 4, 'CPMK-BD2', 'Mampu melakukan normalisasi', NULL, NULL),
(5, 5, 'CPMK-SIM1', 'Mampu menganalisis kebutuhan sistem', NULL, NULL),
(6, 5, 'CPMK-SIM2', 'Mampu mendesain alur proses bisnis', NULL, NULL),
(7, 5, 'CPMK-EB1', 'Mampu merancang model bisnis digital', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `dosen`
--

CREATE TABLE `dosen` (
  `id_dosen` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `nidn` varchar(20) DEFAULT NULL,
  `nuptk` varchar(20) DEFAULT NULL,
  `homebase` varchar(50) DEFAULT NULL,
  `pt` varchar(100) DEFAULT NULL,
  `id_jafung` int(11) DEFAULT NULL,
  `beban_sks` float DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `dosen`
--

INSERT INTO `dosen` (`id_dosen`, `id_pegawai`, `nidn`, `nuptk`, `homebase`, `pt`, `id_jafung`, `beban_sks`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, '0011223301', NULL, NULL, NULL, 3, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 2, '0022334402', NULL, NULL, NULL, 2, 0, '2025-08-21 23:54:41', '2025-09-30 13:26:21', '2025-09-30 20:26:21', 1),
(3, 3, '0033445503', NULL, NULL, NULL, 4, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(4, 8, '0044556604', '172839437291829382', 'Manajemen Informatika', 'STIKOM Banyuwangi', 1, 5.3, '2025-08-21 23:54:41', '2025-08-22 23:55:03', NULL, NULL),
(6, 10, '001123102130', '1234567890987654', 'Teknik Informatika', 'STIKOM Banyuwangi', 3, 10.5, '2025-08-22 23:50:41', '2025-09-30 14:12:36', '2025-09-30 21:12:36', 1),
(7, 11, '087', '806', 'Manajemen Informatika', 'STIKOM', 2, 3, '2025-08-25 09:08:14', '2025-09-30 13:01:55', '2025-09-30 20:01:56', 1),
(8, 9, '0123', '01234', 'Manajemen Informatika', 'STIKOM PGRI Banyuwangi', NULL, 3.5, '2025-08-26 06:36:24', '2025-09-30 13:43:39', '2025-09-30 20:43:39', 1),
(12, 12, '0044556615', '792010371', 'Teknik Informatika', 'STIKOM PGRI Banyuwangi', 1, 5.5, '2025-09-30 14:38:27', '2025-09-30 14:59:36', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `fleksibilitas_pembelajaran_detail`
--

CREATE TABLE `fleksibilitas_pembelajaran_detail` (
  `id_tahunan` int(11) NOT NULL,
  `id_bentuk` int(11) NOT NULL,
  `jumlah_mahasiswa_ikut` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `fleksibilitas_pembelajaran_detail`
--

INSERT INTO `fleksibilitas_pembelajaran_detail` (`id_tahunan`, `id_bentuk`, `jumlah_mahasiswa_ikut`) VALUES
(2, 1, 12),
(2, 3, 8),
(2, 5, 25),
(3, 2, 7),
(3, 4, 11),
(4, 1, 10),
(4, 6, 7);

-- --------------------------------------------------------

--
-- Struktur dari tabel `fleksibilitas_pembelajaran_tahunan`
--

CREATE TABLE `fleksibilitas_pembelajaran_tahunan` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jumlah_mahasiswa_aktif` int(11) DEFAULT 0,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `fleksibilitas_pembelajaran_tahunan`
--

INSERT INTO `fleksibilitas_pembelajaran_tahunan` (`id`, `id_unit_prodi`, `id_tahun`, `jumlah_mahasiswa_aktif`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(2, 4, 2022, 145, 'http://bukti-valid.com/ti/2022-2023', '2025-10-20 09:05:42', '2025-10-20 09:05:42', NULL, NULL),
(3, 5, 2023, 75, 'http://bukti-valid.com/mi/2022-2023', '2025-10-21 06:02:37', '2025-10-21 06:02:37', NULL, NULL),
(4, 4, 2023, 150, 'http://bukti-valid.com/ti/2023-2024', '2025-10-22 02:43:03', '2025-10-22 02:43:03', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `kualifikasi_tendik`
--

CREATE TABLE `kualifikasi_tendik` (
  `id_kualifikasi` int(11) NOT NULL,
  `id_tendik` int(11) NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kualifikasi_tendik`
--

INSERT INTO `kualifikasi_tendik` (`id_kualifikasi`, `id_tendik`, `jenjang_pendidikan`, `id_unit`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'S1', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 2, 'S1', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(3, 3, 'D3', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id_log` bigint(20) NOT NULL,
  `id_user` int(11) DEFAULT NULL,
  `aksi` varchar(50) NOT NULL,
  `nama_tabel` varchar(100) DEFAULT NULL,
  `id_record` int(11) DEFAULT NULL,
  `waktu_aksi` timestamp NULL DEFAULT current_timestamp(),
  `detail_perubahan` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `map_cpl_pl`
--

CREATE TABLE `map_cpl_pl` (
  `id_cpl` int(11) NOT NULL,
  `id_pl` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `map_cpl_pl`
--

INSERT INTO `map_cpl_pl` (`id_cpl`, `id_pl`) VALUES
(1, 1),
(1, 2),
(2, 1),
(3, 3),
(3, 4),
(4, 4);

-- --------------------------------------------------------

--
-- Struktur dari tabel `map_cpmk_cpl`
--

CREATE TABLE `map_cpmk_cpl` (
  `id_cpmk` int(11) NOT NULL,
  `id_cpl` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `map_cpmk_cpl`
--

INSERT INTO `map_cpmk_cpl` (`id_cpmk`, `id_cpl`) VALUES
(1, 1),
(2, 2),
(3, 1),
(4, 1),
(5, 3),
(6, 3),
(7, 4);

-- --------------------------------------------------------

--
-- Struktur dari tabel `map_cpmk_mk`
--

CREATE TABLE `map_cpmk_mk` (
  `id_cpmk` int(11) NOT NULL,
  `id_mk` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `map_cpmk_mk`
--

INSERT INTO `map_cpmk_mk` (`id_cpmk`, `id_mk`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 3),
(7, 4);

-- --------------------------------------------------------

--
-- Struktur dari tabel `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id_mk` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `kode_mk` varchar(20) NOT NULL,
  `nama_mk` varchar(255) NOT NULL,
  `sks` int(11) NOT NULL,
  `semester` int(11) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id_mk`, `id_unit_prodi`, `kode_mk`, `nama_mk`, `sks`, `semester`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'IF401', 'Dasar Kecerdasan Buatan', 3, 3, NULL, NULL),
(2, 4, 'IF201', 'Basis Data', 3, 2, NULL, NULL),
(3, 5, 'MI301', 'Sistem Informasi Manajemen', 3, 4, NULL, NULL),
(4, 5, 'MI402', 'E-Business', 3, 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pegawai`
--

CREATE TABLE `pegawai` (
  `id_pegawai` int(11) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pegawai`
--

INSERT INTO `pegawai` (`id_pegawai`, `nama_lengkap`, `pendidikan_terakhir`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'Dr. Budi Santoso, M.Kom.', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 'Citra Lestari, S.Kom., M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(3, 'Prof. Dr. Eka Pratama', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(4, 'Ani Wijaya, S.E.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(5, 'Dedi Firmansyah, S.Kom.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(6, 'Fajar Nugroho, A.Md.', 'D3', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(7, 'Gita Permata, S.Sos.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(8, 'Hendra Gunawan, M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(9, 'fufufafa', 'S2', '2025-08-22 16:45:03', '2025-09-30 10:08:00', '2025-09-30 17:08:00', 1),
(10, 'Dandi Ajusta Dharma Putra Samudra', 'S2', '2025-08-22 23:49:45', '2025-09-30 10:08:06', '2025-09-30 17:08:06', 1),
(11, 'Lupik', 'S2', '2025-08-25 09:06:18', '2025-09-30 10:07:58', '2025-09-30 17:07:58', 1),
(12, 'Rachman Yulianto, M.Kom', 'S2', '2025-09-30 14:26:54', '2025-09-30 14:26:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `penggunaan_dana`
--

CREATE TABLE `penggunaan_dana` (
  `id_penggunaan_dana` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jenis_penggunaan` varchar(255) NOT NULL,
  `jumlah_dana` int(11) NOT NULL,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `penggunaan_dana`
--

INSERT INTO `penggunaan_dana` (`id_penggunaan_dana`, `id_tahun`, `jenis_penggunaan`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2024, 'Penelitian Dosen', 120000000, 'https://drive.example.com/penggunaan.pdf', '2025-08-22 01:26:54', '2025-09-30 10:29:28', '2025-09-30 17:29:28', 1),
(2, 2025, 'Operasional', 1000000, 'link', '2025-08-22 06:57:15', '2025-09-30 10:29:31', '2025-09-30 17:29:32', 1),
(3, 2023, 'Pengembangan', 30000000, 'link', '2025-08-22 06:57:37', '2025-09-30 10:29:34', '2025-09-30 17:29:35', 1),
(4, 2025, 'Mangan Bakso', 1000000, 'link', '2025-08-22 07:36:16', '2025-09-29 06:32:39', '2025-09-29 13:32:40', 1),
(5, 2024, 'Operasional', 10000000, 'link', '2025-09-26 08:07:33', '2025-09-30 10:29:38', '2025-09-30 17:29:38', 1),
(6, 2025, 'Penelitian Dosen', 1000000, 'https://hduh.com', '2025-09-30 10:30:22', '2025-09-30 10:38:21', '2025-09-30 17:38:22', 1),
(7, 2025, 'Penelitian Dosen', 300000, 'https://djkdd.com', '2025-09-30 10:38:54', '2025-09-30 10:51:22', '2025-09-30 17:51:23', 1),
(8, 2020, 'Penelitian Bersama Dosen', 1300000, 'https://jsjsn.com', '2025-09-30 10:51:46', '2025-09-30 10:51:46', NULL, NULL),
(9, 2022, 'Penelitian Bersama Dosen', 1500000, 'https://dhdj.com', '2025-09-30 11:35:12', '2025-09-30 11:35:12', NULL, NULL),
(10, 2021, 'Penelitian Bersama Dosen', 2000000, 'https://jxhkjwxh.com', '2025-09-30 11:37:33', '2025-09-30 11:37:33', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pimpinan_upps_ps`
--

CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `id_jabatan` int(11) NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `tupoksi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pimpinan_upps_ps`
--

INSERT INTO `pimpinan_upps_ps` (`id_pimpinan`, `id_unit`, `id_pegawai`, `id_jabatan`, `periode_mulai`, `periode_selesai`, `tupoksi`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 1, 2, '2023-01-01', '2027-12-31', 'Bertanggung jawab atas bidang akademik.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 7, 2, 5, '2024-08-01', '2028-07-31', 'Mengelola kegiatan akademik dan operasional Program Studi Informatika.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(4, 5, 4, 4, '2024-12-29', '2025-12-29', 'mangan bakso', '2025-08-22 10:32:01', '2025-08-22 10:32:01', NULL, NULL),
(5, 9, 5, 5, '2024-10-11', '2029-10-11', 'afzsshayskiqsj', '2025-08-22 10:34:13', '2025-08-22 10:34:59', NULL, NULL),
(6, 1, 10, 4, '2032-12-29', '2033-12-29', 'Mangan baksoo', '2025-08-22 23:52:54', '2025-08-23 01:12:48', '2025-08-23 08:12:48', 1),
(7, 1, 10, 4, '2023-12-22', '2024-12-22', 'Mangan AFC', '2025-08-25 08:19:13', '2025-09-30 14:25:18', '2025-09-30 21:25:18', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `profil_lulusan`
--

CREATE TABLE `profil_lulusan` (
  `id_pl` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `kode_pl` varchar(20) NOT NULL,
  `deskripsi_pl` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `profil_lulusan`
--

INSERT INTO `profil_lulusan` (`id_pl`, `id_unit_prodi`, `kode_pl`, `deskripsi_pl`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'PL-1', 'Menjadi Analis Data yang handal.', NULL, NULL),
(2, 4, 'PL-2', 'Menjadi Pengembang AI yang inovatif.', NULL, NULL),
(3, 5, 'PL-MI-1', 'Menjadi Manajer Sistem Informasi.', NULL, NULL),
(4, 5, 'PL-MI-2', 'Menjadi Konsultan IT.', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ref_jabatan_fungsional`
--

CREATE TABLE `ref_jabatan_fungsional` (
  `id_jafung` int(11) NOT NULL,
  `nama_jafung` varchar(100) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ref_jabatan_fungsional`
--

INSERT INTO `ref_jabatan_fungsional` (`id_jafung`, `nama_jafung`, `deleted_at`, `deleted_by`) VALUES
(1, 'Asisten Ahli', NULL, NULL),
(2, 'Lektor', NULL, NULL),
(3, 'Lektor Kepala', NULL, NULL),
(4, 'Guru Besar (Profesor)', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ref_jabatan_struktural`
--

CREATE TABLE `ref_jabatan_struktural` (
  `id_jabatan` int(11) NOT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `sks_beban` float DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ref_jabatan_struktural`
--

INSERT INTO `ref_jabatan_struktural` (`id_jabatan`, `nama_jabatan`, `sks_beban`, `deleted_at`, `deleted_by`) VALUES
(1, 'Ketua STIKOM', 12, NULL, NULL),
(2, 'Wakil Ketua I', 10, NULL, NULL),
(3, 'Wakil Ketua II', 10, NULL, NULL),
(4, 'Kepala LPPM', 8, NULL, NULL),
(5, 'Ketua Program Studi', 4, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `ref_kabupaten_kota`
--

CREATE TABLE `ref_kabupaten_kota` (
  `id_kabupaten_kota` int(11) NOT NULL,
  `id_provinsi` int(11) NOT NULL,
  `nama_kabupaten_kota` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ref_kabupaten_kota`
--

INSERT INTO `ref_kabupaten_kota` (`id_kabupaten_kota`, `id_provinsi`, `nama_kabupaten_kota`) VALUES
(1101, 11, 'KABUPATEN SIMEULUE'),
(1102, 11, 'KABUPATEN ACEH SINGKIL'),
(1103, 11, 'KABUPATEN ACEH SELATAN'),
(1104, 11, 'KABUPATEN ACEH TENGGARA'),
(1105, 11, 'KABUPATEN ACEH TIMUR'),
(1106, 11, 'KABUPATEN ACEH TENGAH'),
(1107, 11, 'KABUPATEN ACEH BARAT'),
(1108, 11, 'KABUPATEN ACEH BESAR'),
(1109, 11, 'KABUPATEN PIDIE'),
(1110, 11, 'KABUPATEN BIREUEN'),
(1111, 11, 'KABUPATEN ACEH UTARA'),
(1112, 11, 'KABUPATEN ACEH BARAT DAYA'),
(1113, 11, 'KABUPATEN GAYO LUES'),
(1114, 11, 'KABUPATEN ACEH TAMIANG'),
(1115, 11, 'KABUPATEN NAGAN RAYA'),
(1116, 11, 'KABUPATEN ACEH JAYA'),
(1117, 11, 'KABUPATEN BENER MERIAH'),
(1118, 11, 'KABUPATEN PIDIE JAYA'),
(1171, 11, 'KOTA BANDA ACEH'),
(1172, 11, 'KOTA SABANG'),
(1173, 11, 'KOTA LANGSA'),
(1174, 11, 'KOTA LHOKSEUMAWE'),
(1175, 11, 'KOTA SUBULUSSALAM'),
(1201, 12, 'KABUPATEN NIAS'),
(1202, 12, 'KABUPATEN MANDAILING NATAL'),
(1203, 12, 'KABUPATEN TAPANULI SELATAN'),
(1204, 12, 'KABUPATEN TAPANULI TENGAH'),
(1205, 12, 'KABUPATEN TAPANULI UTARA'),
(1206, 12, 'KABUPATEN TOBA SAMOSIR'),
(1207, 12, 'KABUPATEN LABUHAN BATU'),
(1208, 12, 'KABUPATEN ASAHAN'),
(1209, 12, 'KABUPATEN SIMALUNGUN'),
(1210, 12, 'KABUPATEN DAIRI'),
(1211, 12, 'KABUPATEN KARO'),
(1212, 12, 'KABUPATEN DELI SERDANG'),
(1213, 12, 'KABUPATEN LANGKAT'),
(1214, 12, 'KABUPATEN NIAS SELATAN'),
(1215, 12, 'KABUPATEN HUMBANG HASUNDUTAN'),
(1216, 12, 'KABUPATEN PAKPAK BHARAT'),
(1217, 12, 'KABUPATEN SAMOSIR'),
(1218, 12, 'KABUPATEN SERDANG BEDAGAI'),
(1219, 12, 'KABUPATEN BATU BARA'),
(1220, 12, 'KABUPATEN PADANG LAWAS UTARA'),
(1221, 12, 'KABUPATEN PADANG LAWAS'),
(1222, 12, 'KABUPATEN LABUHAN BATU SELATAN'),
(1223, 12, 'KABUPATEN LABUHAN BATU UTARA'),
(1224, 12, 'KABUPATEN NIAS UTARA'),
(1225, 12, 'KABUPATEN NIAS BARAT'),
(1271, 12, 'KOTA SIBOLGA'),
(1272, 12, 'KOTA TANJUNG BALAI'),
(1273, 12, 'KOTA PEMATANG SIANTAR'),
(1274, 12, 'KOTA TEBING TINGGI'),
(1275, 12, 'KOTA MEDAN'),
(1276, 12, 'KOTA BINJAI'),
(1277, 12, 'KOTA PADANGSIDIMPUAN'),
(1278, 12, 'KOTA GUNUNGSITOLI'),
(1301, 13, 'KABUPATEN KEPULAUAN MENTAWAI'),
(1302, 13, 'KABUPATEN PESISIR SELATAN'),
(1303, 13, 'KABUPATEN SOLOK'),
(1304, 13, 'KABUPATEN SIJUNJUNG'),
(1305, 13, 'KABUPATEN TANAH DATAR'),
(1306, 13, 'KABUPATEN PADANG PARIAMAN'),
(1307, 13, 'KABUPATEN AGAM'),
(1308, 13, 'KABUPATEN LIMA PULUH KOTA'),
(1309, 13, 'KABUPATEN PASAMAN'),
(1310, 13, 'KABUPATEN SOLOK SELATAN'),
(1311, 13, 'KABUPATEN DHARMASRAYA'),
(1312, 13, 'KABUPATEN PASAMAN BARAT'),
(1371, 13, 'KOTA PADANG'),
(1372, 13, 'KOTA SOLOK'),
(1373, 13, 'KOTA SAWAH LUNTO'),
(1374, 13, 'KOTA PADANG PANJANG'),
(1375, 13, 'KOTA BUKITTINGGI'),
(1376, 13, 'KOTA PAYAKUMBUH'),
(1377, 13, 'KOTA PARIAMAN'),
(1401, 14, 'KABUPATEN KUANTAN SINGINGI'),
(1402, 14, 'KABUPATEN INDRAGIRI HULU'),
(1403, 14, 'KABUPATEN INDRAGIRI HILIR'),
(1404, 14, 'KABUPATEN PELALAWAN'),
(1405, 14, 'KABUPATEN S I A K'),
(1406, 14, 'KABUPATEN KAMPAR'),
(1407, 14, 'KABUPATEN ROKAN HULU'),
(1408, 14, 'KABUPATEN BENGKALIS'),
(1409, 14, 'KABUPATEN ROKAN HILIR'),
(1410, 14, 'KABUPATEN KEPULAUAN MERANTI'),
(1471, 14, 'KOTA PEKANBARU'),
(1473, 14, 'KOTA D U M A I'),
(1501, 15, 'KABUPATEN KERINCI'),
(1502, 15, 'KABUPATEN MERANGIN'),
(1503, 15, 'KABUPATEN SAROLANGUN'),
(1504, 15, 'KABUPATEN BATANG HARI'),
(1505, 15, 'KABUPATEN MUARO JAMBI'),
(1506, 15, 'KABUPATEN TANJUNG JABUNG TIMUR'),
(1507, 15, 'KABUPATEN TANJUNG JABUNG BARAT'),
(1508, 15, 'KABUPATEN TEBO'),
(1509, 15, 'KABUPATEN BUNGO'),
(1571, 15, 'KOTA JAMBI'),
(1572, 15, 'KOTA SUNGAI PENUH'),
(1601, 16, 'KABUPATEN OGAN KOMERING ULU'),
(1602, 16, 'KABUPATEN OGAN KOMERING ILIR'),
(1603, 16, 'KABUPATEN MUARA ENIM'),
(1604, 16, 'KABUPATEN LAHAT'),
(1605, 16, 'KABUPATEN MUSI RAWAS'),
(1606, 16, 'KABUPATEN MUSI BANYUASIN'),
(1607, 16, 'KABUPATEN BANYU ASIN'),
(1608, 16, 'KABUPATEN OGAN KOMERING ULU SELATAN'),
(1609, 16, 'KABUPATEN OGAN KOMERING ULU TIMUR'),
(1610, 16, 'KABUPATEN OGAN ILIR'),
(1611, 16, 'KABUPATEN EMPAT LAWANG'),
(1612, 16, 'KABUPATEN PENUKAL ABAB LEMATANG ILIR'),
(1613, 16, 'KABUPATEN MUSI RAWAS UTARA'),
(1671, 16, 'KOTA PALEMBANG'),
(1672, 16, 'KOTA PRABUMULIH'),
(1673, 16, 'KOTA PAGAR ALAM'),
(1674, 16, 'KOTA LUBUKLINGGAU'),
(1701, 17, 'KABUPATEN BENGKULU SELATAN'),
(1702, 17, 'KABUPATEN REJANG LEBONG'),
(1703, 17, 'KABUPATEN BENGKULU UTARA'),
(1704, 17, 'KABUPATEN KAUR'),
(1705, 17, 'KABUPATEN SELUMA'),
(1706, 17, 'KABUPATEN MUKOMUKO'),
(1707, 17, 'KABUPATEN LEBONG'),
(1708, 17, 'KABUPATEN KEPAHIANG'),
(1709, 17, 'KABUPATEN BENGKULU TENGAH'),
(1771, 17, 'KOTA BENGKULU'),
(1801, 18, 'KABUPATEN LAMPUNG BARAT'),
(1802, 18, 'KABUPATEN TANGGAMUS'),
(1803, 18, 'KABUPATEN LAMPUNG SELATAN'),
(1804, 18, 'KABUPATEN LAMPUNG TIMUR'),
(1805, 18, 'KABUPATEN LAMPUNG TENGAH'),
(1806, 18, 'KABUPATEN LAMPUNG UTARA'),
(1807, 18, 'KABUPATEN WAY KANAN'),
(1808, 18, 'KABUPATEN TULANGBAWANG'),
(1809, 18, 'KABUPATEN PESAWARAN'),
(1810, 18, 'KABUPATEN PRINGSEWU'),
(1811, 18, 'KABUPATEN MESUJI'),
(1812, 18, 'KABUPATEN TULANG BAWANG BARAT'),
(1813, 18, 'KABUPATEN PESISIR BARAT'),
(1871, 18, 'KOTA BANDAR LAMPUNG'),
(1872, 18, 'KOTA METRO'),
(1901, 19, 'KABUPATEN BANGKA'),
(1902, 19, 'KABUPATEN BELITUNG'),
(1903, 19, 'KABUPATEN BANGKA BARAT'),
(1904, 19, 'KABUPATEN BANGKA TENGAH'),
(1905, 19, 'KABUPATEN BANGKA SELATAN'),
(1906, 19, 'KABUPATEN BELITUNG TIMUR'),
(1971, 19, 'KOTA PANGKAL PINANG'),
(2101, 21, 'KABUPATEN KARIMUN'),
(2102, 21, 'KABUPATEN BINTAN'),
(2103, 21, 'KABUPATEN NATUNA'),
(2104, 21, 'KABUPATEN LINGGA'),
(2105, 21, 'KABUPATEN KEPULAUAN ANAMBAS'),
(2171, 21, 'KOTA B A T A M'),
(2172, 21, 'KOTA TANJUNG PINANG'),
(3101, 31, 'KABUPATEN KEPULAUAN SERIBU'),
(3171, 31, 'KOTA JAKARTA SELATAN'),
(3172, 31, 'KOTA JAKARTA TIMUR'),
(3173, 31, 'KOTA JAKARTA PUSAT'),
(3174, 31, 'KOTA JAKARTA BARAT'),
(3175, 31, 'KOTA JAKARTA UTARA'),
(3201, 32, 'KABUPATEN BOGOR'),
(3202, 32, 'KABUPATEN SUKABUMI'),
(3203, 32, 'KABUPATEN CIANJUR'),
(3204, 32, 'KABUPATEN BANDUNG'),
(3205, 32, 'KABUPATEN GARUT'),
(3206, 32, 'KABUPATEN TASIKMALAYA'),
(3207, 32, 'KABUPATEN CIAMIS'),
(3208, 32, 'KABUPATEN KUNINGAN'),
(3209, 32, 'KABUPATEN CIREBON'),
(3210, 32, 'KABUPATEN MAJALENGKA'),
(3211, 32, 'KABUPATEN SUMEDANG'),
(3212, 32, 'KABUPATEN INDRAMAYU'),
(3213, 32, 'KABUPATEN SUBANG'),
(3214, 32, 'KABUPATEN PURWAKARTA'),
(3215, 32, 'KABUPATEN KARAWANG'),
(3216, 32, 'KABUPATEN BEKASI'),
(3217, 32, 'KABUPATEN BANDUNG BARAT'),
(3218, 32, 'KABUPATEN PANGANDARAN'),
(3271, 32, 'KOTA BOGOR'),
(3272, 32, 'KOTA SUKABUMI'),
(3273, 32, 'KOTA BANDUNG'),
(3274, 32, 'KOTA CIREBON'),
(3275, 32, 'KOTA BEKASI'),
(3276, 32, 'KOTA DEPOK'),
(3277, 32, 'KOTA CIMAHI'),
(3278, 32, 'KOTA TASIKMALAYA'),
(3279, 32, 'KOTA BANJAR'),
(3301, 33, 'KABUPATEN CILACAP'),
(3302, 33, 'KABUPATEN BANYUMAS'),
(3303, 33, 'KABUPATEN PURBALINGGA'),
(3304, 33, 'KABUPATEN BANJARNEGARA'),
(3305, 33, 'KABUPATEN KEBUMEN'),
(3306, 33, 'KABUPATEN PURWOREJO'),
(3307, 33, 'KABUPATEN WONOSOBO'),
(3308, 33, 'KABUPATEN MAGELANG'),
(3309, 33, 'KABUPATEN BOYOLALI'),
(3310, 33, 'KABUPATEN KLATEN'),
(3311, 33, 'KABUPATEN SUKOHARJO'),
(3312, 33, 'KABUPATEN WONOGIRI'),
(3313, 33, 'KABUPATEN KARANGANYAR'),
(3314, 33, 'KABUPATEN SRAGEN'),
(3315, 33, 'KABUPATEN GROBOGAN'),
(3316, 33, 'KABUPATEN BLORA'),
(3317, 33, 'KABUPATEN REMBANG'),
(3318, 33, 'KABUPATEN PATI'),
(3319, 33, 'KABUPATEN KUDUS'),
(3320, 33, 'KABUPATEN JEPARA'),
(3321, 33, 'KABUPATEN DEMAK'),
(3322, 33, 'KABUPATEN SEMARANG'),
(3323, 33, 'KABUPATEN TEMANGGUNG'),
(3324, 33, 'KABUPATEN KENDAL'),
(3325, 33, 'KABUPATEN BATANG'),
(3326, 33, 'KABUPATEN PEKALONGAN'),
(3327, 33, 'KABUPATEN PEMALANG'),
(3328, 33, 'KABUPATEN TEGAL'),
(3329, 33, 'KABUPATEN BREBES'),
(3371, 33, 'KOTA MAGELANG'),
(3372, 33, 'KOTA SURAKARTA'),
(3373, 33, 'KOTA SALATIGA'),
(3374, 33, 'KOTA SEMARANG'),
(3375, 33, 'KOTA PEKALONGAN'),
(3376, 33, 'KOTA TEGAL'),
(3401, 34, 'KABUPATEN KULON PROGO'),
(3402, 34, 'KABUPATEN BANTUL'),
(3403, 34, 'KABUPATEN GUNUNG KIDUL'),
(3404, 34, 'KABUPATEN SLEMAN'),
(3471, 34, 'KOTA YOGYAKARTA'),
(3501, 35, 'KABUPATEN PACITAN'),
(3502, 35, 'KABUPATEN PONOROGO'),
(3503, 35, 'KABUPATEN TRENGGALEK'),
(3504, 35, 'KABUPATEN TULUNGAGUNG'),
(3505, 35, 'KABUPATEN BLITAR'),
(3506, 35, 'KABUPATEN KEDIRI'),
(3507, 35, 'KABUPATEN MALANG'),
(3508, 35, 'KABUPATEN LUMAJANG'),
(3509, 35, 'KABUPATEN JEMBER'),
(3510, 35, 'KABUPATEN BANYUWANGI'),
(3511, 35, 'KABUPATEN BONDOWOSO'),
(3512, 35, 'KABUPATEN SITUBONDO'),
(3513, 35, 'KABUPATEN PROBOLINGGO'),
(3514, 35, 'KABUPATEN PASURUAN'),
(3515, 35, 'KABUPATEN SIDOARJO'),
(3516, 35, 'KABUPATEN MOJOKERTO'),
(3517, 35, 'KABUPATEN JOMBANG'),
(3518, 35, 'KABUPATEN NGANJUK'),
(3519, 35, 'KABUPATEN MADIUN'),
(3520, 35, 'KABUPATEN MAGETAN'),
(3521, 35, 'KABUPATEN NGAWI'),
(3522, 35, 'KABUPATEN BOJONEGORO'),
(3523, 35, 'KABUPATEN TUBAN'),
(3524, 35, 'KABUPATEN LAMONGAN'),
(3525, 35, 'KABUPATEN GRESIK'),
(3526, 35, 'KABUPATEN BANGKALAN'),
(3527, 35, 'KABUPATEN SAMPANG'),
(3528, 35, 'KABUPATEN PAMEKASAN'),
(3529, 35, 'KABUPATEN SUMENEP'),
(3571, 35, 'KOTA KEDIRI'),
(3572, 35, 'KOTA BLITAR'),
(3573, 35, 'KOTA MALANG'),
(3574, 35, 'KOTA PROBOLINGGO'),
(3575, 35, 'KOTA PASURUAN'),
(3576, 35, 'KOTA MOJOKERTO'),
(3577, 35, 'KOTA MADIUN'),
(3578, 35, 'KOTA SURABAYA'),
(3579, 35, 'KOTA BATU'),
(3601, 36, 'KABUPATEN PANDEGLANG'),
(3602, 36, 'KABUPATEN LEBAK'),
(3603, 36, 'KABUPATEN TANGERANG'),
(3604, 36, 'KABUPATEN SERANG'),
(3671, 36, 'KOTA TANGERANG'),
(3672, 36, 'KOTA CILEGON'),
(3673, 36, 'KOTA SERANG'),
(3674, 36, 'KOTA TANGERANG SELATAN'),
(5101, 51, 'KABUPATEN JEMBRANA'),
(5102, 51, 'KABUPATEN TABANAN'),
(5103, 51, 'KABUPATEN BADUNG'),
(5104, 51, 'KABUPATEN GIANYAR'),
(5105, 51, 'KABUPATEN KLUNGKUNG'),
(5106, 51, 'KABUPATEN BANGLI'),
(5107, 51, 'KABUPATEN KARANG ASEM'),
(5108, 51, 'KABUPATEN BULELENG'),
(5171, 51, 'KOTA DENPASAR'),
(5201, 52, 'KABUPATEN LOMBOK BARAT'),
(5202, 52, 'KABUPATEN LOMBOK TENGAH'),
(5203, 52, 'KABUPATEN LOMBOK TIMUR'),
(5204, 52, 'KABUPATEN SUMBAWA'),
(5205, 52, 'KABUPATEN DOMPU'),
(5206, 52, 'KABUPATEN BIMA'),
(5207, 52, 'KABUPATEN SUMBAWA BARAT'),
(5208, 52, 'KABUPATEN LOMBOK UTARA'),
(5271, 52, 'KOTA MATARAM'),
(5272, 52, 'KOTA BIMA'),
(5301, 53, 'KABUPATEN SUMBA BARAT'),
(5302, 53, 'KABUPATEN SUMBA TIMUR'),
(5303, 53, 'KABUPATEN KUPANG'),
(5304, 53, 'KABUPATEN TIMOR TENGAH SELATAN'),
(5305, 53, 'KABUPATEN TIMOR TENGAH UTARA'),
(5306, 53, 'KABUPATEN BELU'),
(5307, 53, 'KABUPATEN ALOR'),
(5308, 53, 'KABUPATEN LEMBATA'),
(5309, 53, 'KABUPATEN FLORES TIMUR'),
(5310, 53, 'KABUPATEN SIKKA'),
(5311, 53, 'KABUPATEN ENDE'),
(5312, 53, 'KABUPATEN NGADA'),
(5313, 53, 'KABUPATEN MANGGARAI'),
(5314, 53, 'KABUPATEN ROTE NDAO'),
(5315, 53, 'KABUPATEN MANGGARAI BARAT'),
(5316, 53, 'KABUPATEN SUMBA TENGAH'),
(5317, 53, 'KABUPATEN SUMBA BARAT DAYA'),
(5318, 53, 'KABUPATEN NAGAKEO'),
(5319, 53, 'KABUPATEN MANGGARAI TIMUR'),
(5320, 53, 'KABUPATEN SABU RAIJUA'),
(5321, 53, 'KABUPATEN MALAKA'),
(5371, 53, 'KOTA KUPANG'),
(6101, 61, 'KABUPATEN SAMBAS'),
(6102, 61, 'KABUPATEN BENGKAYANG'),
(6103, 61, 'KABUPATEN LANDAK'),
(6104, 61, 'KABUPATEN MEMPAWAH'),
(6105, 61, 'KABUPATEN SANGGAU'),
(6106, 61, 'KABUPATEN KETAPANG'),
(6107, 61, 'KABUPATEN SINTANG'),
(6108, 61, 'KABUPATEN KAPUAS HULU'),
(6109, 61, 'KABUPATEN SEKADAU'),
(6110, 61, 'KABUPATEN MELAWI'),
(6111, 61, 'KABUPATEN KAYONG UTARA'),
(6112, 61, 'KABUPATEN KUBU RAYA'),
(6171, 61, 'KOTA PONTIANAK'),
(6172, 61, 'KOTA SINGKAWANG'),
(6201, 62, 'KABUPATEN KOTAWARINGIN BARAT'),
(6202, 62, 'KABUPATEN KOTAWARINGIN TIMUR'),
(6203, 62, 'KABUPATEN KAPUAS'),
(6204, 62, 'KABUPATEN BARITO SELATAN'),
(6205, 62, 'KABUPATEN BARITO UTARA'),
(6206, 62, 'KABUPATEN SUKAMARA'),
(6207, 62, 'KABUPATEN LAMANDAU'),
(6208, 62, 'KABUPATEN SERUYAN'),
(6209, 62, 'KABUPATEN KATINGAN'),
(6210, 62, 'KABUPATEN PULANG PISAU'),
(6211, 62, 'KABUPATEN GUNUNG MAS'),
(6212, 62, 'KABUPATEN BARITO TIMUR'),
(6213, 62, 'KABUPATEN MURUNG RAYA'),
(6271, 62, 'KOTA PALANGKA RAYA'),
(6301, 63, 'KABUPATEN TANAH LAUT'),
(6302, 63, 'KABUPATEN KOTA BARU'),
(6303, 63, 'KABUPATEN BANJAR'),
(6304, 63, 'KABUPATEN BARITO KUALA'),
(6305, 63, 'KABUPATEN TAPIN'),
(6306, 63, 'KABUPATEN HULU SUNGAI SELATAN'),
(6307, 63, 'KABUPATEN HULU SUNGAI TENGAH'),
(6308, 63, 'KABUPATEN HULU SUNGAI UTARA'),
(6309, 63, 'KABUPATEN TABALONG'),
(6310, 63, 'KABUPATEN TANAH BUMBU'),
(6311, 63, 'KABUPATEN BALANGAN'),
(6371, 63, 'KOTA BANJARMASIN'),
(6372, 63, 'KOTA BANJAR BARU'),
(6401, 64, 'KABUPATEN PASER'),
(6402, 64, 'KABUPATEN KUTAI BARAT'),
(6403, 64, 'KABUPATEN KUTAI KARTANEGARA'),
(6404, 64, 'KABUPATEN KUTAI TIMUR'),
(6405, 64, 'KABUPATEN BERAU'),
(6409, 64, 'KABUPATEN PENAJAM PASER UTARA'),
(6411, 64, 'KABUPATEN MAHAKAM HULU'),
(6471, 64, 'KOTA BALIKPAPAN'),
(6472, 64, 'KOTA SAMARINDA'),
(6474, 64, 'KOTA BONTANG'),
(6501, 65, 'KABUPATEN MALINAU'),
(6502, 65, 'KABUPATEN BULUNGAN'),
(6503, 65, 'KABUPATEN TANA TIDUNG'),
(6504, 65, 'KABUPATEN NUNUKAN'),
(6571, 65, 'KOTA TARAKAN'),
(7101, 71, 'KABUPATEN BOLAANG MONGONDOW'),
(7102, 71, 'KABUPATEN MINAHASA'),
(7103, 71, 'KABUPATEN KEPULAUAN SANGIHE'),
(7104, 71, 'KABUPATEN KEPULAUAN TALAUD'),
(7105, 71, 'KABUPATEN MINAHASA SELATAN'),
(7106, 71, 'KABUPATEN MINAHASA UTARA'),
(7107, 71, 'KABUPATEN BOLAANG MONGONDOW UTARA'),
(7108, 71, 'KABUPATEN SIAU TAGULANDANG BIARO'),
(7109, 71, 'KABUPATEN MINAHASA TENGGARA'),
(7110, 71, 'KABUPATEN BOLAANG MONGONDOW SELATAN'),
(7111, 71, 'KABUPATEN BOLAANG MONGONDOW TIMUR'),
(7171, 71, 'KOTA MANADO'),
(7172, 71, 'KOTA BITUNG'),
(7173, 71, 'KOTA TOMOHON'),
(7174, 71, 'KOTA KOTAMOBAGU'),
(7201, 72, 'KABUPATEN BANGGAI KEPULAUAN'),
(7202, 72, 'KABUPATEN BANGGAI'),
(7203, 72, 'KABUPATEN MOROWALI'),
(7204, 72, 'KABUPATEN POSO'),
(7205, 72, 'KABUPATEN DONGGALA'),
(7206, 72, 'KABUPATEN TOLI-TOLI'),
(7207, 72, 'KABUPATEN BUOL'),
(7208, 72, 'KABUPATEN PARIGI MOUTONG'),
(7209, 72, 'KABUPATEN TOJO UNA-UNA'),
(7210, 72, 'KABUPATEN SIGI'),
(7211, 72, 'KABUPATEN BANGGAI LAUT'),
(7212, 72, 'KABUPATEN MOROWALI UTARA'),
(7271, 72, 'KOTA PALU'),
(7301, 73, 'KABUPATEN KEPULAUAN SELAYAR'),
(7302, 73, 'KABUPATEN BULUKUMBA'),
(7303, 73, 'KABUPATEN BANTAENG'),
(7304, 73, 'KABUPATEN JENEPONTO'),
(7305, 73, 'KABUPATEN TAKALAR'),
(7306, 73, 'KABUPATEN GOWA'),
(7307, 73, 'KABUPATEN SINJAI'),
(7308, 73, 'KABUPATEN MAROS'),
(7309, 73, 'KABUPATEN PANGKAJENE DAN KEPULAUAN'),
(7310, 73, 'KABUPATEN BARRU'),
(7311, 73, 'KABUPATEN BONE'),
(7312, 73, 'KABUPATEN SOPPENG'),
(7313, 73, 'KABUPATEN WAJO'),
(7314, 73, 'KABUPATEN SIDENRENG RAPPANG'),
(7315, 73, 'KABUPATEN PINRANG'),
(7316, 73, 'KABUPATEN ENREKANG'),
(7317, 73, 'KABUPATEN LUWU'),
(7318, 73, 'KABUPATEN TANA TORAJA'),
(7322, 73, 'KABUPATEN LUWU UTARA'),
(7325, 73, 'KABUPATEN LUWU TIMUR'),
(7326, 73, 'KABUPATEN TORAJA UTARA'),
(7371, 73, 'KOTA MAKASSAR'),
(7372, 73, 'KOTA PAREPARE'),
(7373, 73, 'KOTA PALOPO'),
(7401, 74, 'KABUPATEN BUTON'),
(7402, 74, 'KABUPATEN MUNA'),
(7403, 74, 'KABUPATEN KONAWE'),
(7404, 74, 'KABUPATEN KOLAKA'),
(7405, 74, 'KABUPATEN KONAWE SELATAN'),
(7406, 74, 'KABUPATEN BOMBANA'),
(7407, 74, 'KABUPATEN WAKATOBI'),
(7408, 74, 'KABUPATEN KOLAKA UTARA'),
(7409, 74, 'KABUPATEN BUTON UTARA'),
(7410, 74, 'KABUPATEN KONAWE UTARA'),
(7411, 74, 'KABUPATEN KOLAKA TIMUR'),
(7412, 74, 'KABUPATEN KONAWE KEPULAUAN'),
(7413, 74, 'KABUPATEN MUNA BARAT'),
(7414, 74, 'KABUPATEN BUTON TENGAH'),
(7415, 74, 'KABUPATEN BUTON SELATAN'),
(7471, 74, 'KOTA KENDARI'),
(7472, 74, 'KOTA BAUBAU'),
(7501, 75, 'KABUPATEN BOALEMO'),
(7502, 75, 'KABUPATEN GORONTALO'),
(7503, 75, 'KABUPATEN POHUWATO'),
(7504, 75, 'KABUPATEN BONE BOLANGO'),
(7505, 75, 'KABUPATEN GORONTALO UTARA'),
(7571, 75, 'KOTA GORONTALO'),
(7601, 76, 'KABUPATEN MAJENE'),
(7602, 76, 'KABUPATEN POLEWALI MANDAR'),
(7603, 76, 'KABUPATEN MAMASA'),
(7604, 76, 'KABUPATEN MAMUJU'),
(7605, 76, 'KABUPATEN PASANGKAYU'),
(7606, 76, 'KABUPATEN MAMUJU TENGAH'),
(8101, 81, 'KABUPATEN KEPULAUAN TANIMBAR'),
(8102, 81, 'KABUPATEN MALUKU TENGGARA'),
(8103, 81, 'KABUPATEN MALUKU TENGAH'),
(8104, 81, 'KABUPATEN BURU'),
(8105, 81, 'KABUPATEN KEPULAUAN ARU'),
(8106, 81, 'KABUPATEN SERAM BAGIAN BARAT'),
(8107, 81, 'KABUPATEN SERAM BAGIAN TIMUR'),
(8108, 81, 'KABUPATEN KEPULAUAN ARU SELATAN'),
(8109, 81, 'KABUPATEN BURU SELATAN'),
(8171, 81, 'KOTA AMBON'),
(8172, 81, 'KOTA TUAL'),
(8201, 82, 'KABUPATEN HALMAHERA BARAT'),
(8202, 82, 'KABUPATEN HALMAHERA TENGAH'),
(8203, 82, 'KABUPATEN KEPULAUAN SULA'),
(8204, 82, 'KABUPATEN HALMAHERA SELATAN'),
(8205, 82, 'KABUPATEN HALMAHERA UTARA'),
(8206, 82, 'KABUPATEN HALMAHERA TIMUR'),
(8207, 82, 'KABUPATEN PULAU MOROTAI'),
(8208, 82, 'KABUPATEN PULAU TALIABU'),
(8271, 82, 'KOTA TERNATE'),
(8272, 82, 'KOTA TIDORE KEPULAUAN'),
(9101, 91, 'KABUPATEN FAKFAK'),
(9102, 91, 'KABUPATEN KAIMANA'),
(9103, 91, 'KABUPATEN TELUK WONDAMA'),
(9104, 91, 'KABUPATEN TELUK BINTUNI'),
(9105, 91, 'KABUPATEN MANOKWARI'),
(9106, 91, 'KABUPATEN SORONG SELATAN'),
(9107, 91, 'KABUPATEN SORONG'),
(9108, 91, 'KABUPATEN RAJA AMPAT'),
(9109, 91, 'KABUPATEN TAMBRAUW'),
(9110, 91, 'KABUPATEN MAYBRAT'),
(9111, 91, 'KABUPATEN MANOKWARI SELATAN'),
(9112, 91, 'KABUPATEN PEGUNUNGAN ARFAK'),
(9171, 91, 'KOTA SORONG'),
(9201, 92, 'KABUPATEN MERAUKE'),
(9202, 92, 'KABUPATEN JAYAWIJAYA'),
(9203, 92, 'KABUPATEN JAYAPURA'),
(9204, 92, 'KABUPATEN NABIRE'),
(9205, 92, 'KABUPATEN KEPULAUAN YAPEN'),
(9206, 92, 'KABUPATEN BIAK NUMFOR'),
(9207, 92, 'KABUPATEN PUNCAK JAYA'),
(9208, 92, 'KABUPATEN PANIAI'),
(9209, 92, 'KABUPATEN MIMIKA'),
(9210, 92, 'KABUPATEN SARMI'),
(9211, 92, 'KABUPATEN KEEROM'),
(9212, 92, 'KABUPATEN PEGUNUNGAN BINTANG'),
(9213, 92, 'KABUPATEN YAHUKIMO'),
(9214, 92, 'KABUPATEN TOLIKARA'),
(9215, 92, 'KABUPATEN WAROPEN'),
(9216, 92, 'KABUPATEN BOVEN DIGOEL'),
(9217, 92, 'KABUPATEN MAPPI'),
(9218, 92, 'KABUPATEN ASMAT'),
(9219, 92, 'KABUPATEN SUPIORI'),
(9220, 92, 'KABUPATEN MAMBERAMO RAYA'),
(9226, 92, 'KABUPATEN MAMBERAMO TENGAH'),
(9227, 92, 'KABUPATEN YALIMO'),
(9228, 92, 'KABUPATEN LANNY JAYA'),
(9229, 92, 'KABUPATEN NDUGA'),
(9230, 92, 'KABUPATEN PUNCAK'),
(9231, 92, 'KABUPATEN DOGIYAI'),
(9232, 92, 'KABUPATEN INTAN JAYA'),
(9233, 92, 'KABUPATEN DEIYAI'),
(9271, 92, 'KOTA JAYAPURA'),
(9301, 93, 'KABUPATEN JAYAWIJAYA'),
(9302, 93, 'KABUPATEN PEGUNUNGAN BINTANG'),
(9303, 93, 'KABUPATEN YAHUKIMO'),
(9304, 93, 'KABUPATEN TOLIKARA'),
(9305, 93, 'KABUPATEN MAMBERAMO TENGAH'),
(9306, 93, 'KABUPATEN YALIMO'),
(9307, 93, 'KABUPATEN LANNY JAYA'),
(9308, 93, 'KABUPATEN NDUGA'),
(9401, 94, 'KABUPATEN MERAUKE'),
(9402, 94, 'KABUPATEN BOVEN DIGOEL'),
(9403, 94, 'KABUPATEN MAPPI'),
(9404, 94, 'KABUPATEN ASMAT'),
(9501, 95, 'KABUPATEN NABIRE'),
(9502, 95, 'KABUPATEN PUNCAK JAYA'),
(9503, 95, 'KABUPATEN PANIAI'),
(9504, 95, 'KABUPATEN MIMIKA'),
(9505, 95, 'KABUPATEN PUNCAK'),
(9506, 95, 'KABUPATEN DOGIYAI'),
(9507, 95, 'KABUPATEN INTAN JAYA'),
(9508, 95, 'KABUPATEN DEIYAI'),
(9601, 96, 'KABUPATEN SORONG'),
(9602, 96, 'KABUPATEN SORONG SELATAN'),
(9603, 96, 'KABUPATEN RAJA AMPAT'),
(9604, 96, 'KABUPATEN TAMBRAUW'),
(9605, 96, 'KABUPATEN MAYBRAT'),
(9671, 96, 'KOTA SORONG');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ref_provinsi`
--

CREATE TABLE `ref_provinsi` (
  `id_provinsi` int(11) NOT NULL,
  `nama_provinsi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ref_provinsi`
--

INSERT INTO `ref_provinsi` (`id_provinsi`, `nama_provinsi`) VALUES
(11, 'ACEH'),
(12, 'SUMATERA UTARA'),
(13, 'SUMATERA BARAT'),
(14, 'RIAU'),
(15, 'JAMBI'),
(16, 'SUMATERA SELATAN'),
(17, 'BENGKULU'),
(18, 'LAMPUNG'),
(19, 'KEPULAUAN BANGKA BELITUNG'),
(21, 'KEPULAUAN RIAU'),
(31, 'DKI JAKARTA'),
(32, 'JAWA BARAT'),
(33, 'JAWA TENGAH'),
(34, 'DI YOGYAKARTA'),
(35, 'JAWA TIMUR'),
(36, 'BANTEN'),
(51, 'BALI'),
(52, 'NUSA TENGGARA BARAT'),
(53, 'NUSA TENGGARA TIMUR'),
(61, 'KALIMANTAN BARAT'),
(62, 'KALIMANTAN TENGAH'),
(63, 'KALIMANTAN SELATAN'),
(64, 'KALIMANTAN TIMUR'),
(65, 'KALIMANTAN UTARA'),
(71, 'SULAWESI UTARA'),
(72, 'SULAWESI TENGAH'),
(73, 'SULAWESI SELATAN'),
(74, 'SULAWESI TENGGARA'),
(75, 'GORONTALO'),
(76, 'SULAWESI BARAT'),
(81, 'MALUKU'),
(82, 'MALUKU UTARA'),
(91, 'PAPUA BARAT'),
(92, 'PAPUA'),
(93, 'PAPUA PEGUNUNGAN'),
(94, 'PAPUA SELATAN'),
(95, 'PAPUA TENGAH'),
(96, 'PAPUA BARAT DAYA');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekognisi_lulusan_detail`
--

CREATE TABLE `rekognisi_lulusan_detail` (
  `id_tahunan` int(11) NOT NULL,
  `id_sumber` int(11) NOT NULL,
  `jenis_pengakuan` text DEFAULT NULL COMMENT 'Teks deskripsi pengakuan/rekognisi',
  `link_bukti` text DEFAULT NULL,
  `jumlah_mahasiswa_rekognisi` int(11) DEFAULT 0 COMMENT 'Jumlah mahasiswa yg mendapat rekognisi ini'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `rekognisi_lulusan_tahunan`
--

CREATE TABLE `rekognisi_lulusan_tahunan` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jumlah_lulusan_ts` int(11) DEFAULT 0 COMMENT 'Jumlah lulusan pada tahun TS terkait, diambil dari tabel_2a3',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sumber_pendanaan`
--

CREATE TABLE `sumber_pendanaan` (
  `id_sumber` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `sumber_dana` varchar(255) NOT NULL,
  `jumlah_dana` int(11) NOT NULL,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sumber_pendanaan`
--

INSERT INTO `sumber_pendanaan` (`id_sumber`, `id_tahun`, `sumber_dana`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(10, 2025, 'SLOT1', 1000000, 'link', '2025-08-22 06:18:43', '2025-08-22 06:18:43', NULL, NULL),
(11, 2024, 'SLOT2', 2000000, 'LINK', '2025-08-22 06:19:09', '2025-08-22 06:19:09', NULL, NULL),
(12, 2023, 'SLOT3', 3000000, 'LINK', '2025-08-22 06:19:29', '2025-08-22 06:19:29', NULL, NULL),
(13, 2022, 'SLOT4', 3000000, 'LINK', '2025-08-22 06:20:00', '2025-08-22 06:20:00', NULL, NULL),
(16, 2025, 'SLOT1', 3000000, 'HGJHGJH', '2025-08-22 06:39:35', '2025-09-30 10:03:15', '2025-09-30 17:03:15', 1),
(17, 2026, 'SLOT1', 3000000, 'BVCBGFGF', '2025-08-22 06:40:08', '2025-09-30 10:03:19', '2025-09-30 17:03:20', 1),
(19, 2025, 'Hibah Pemerintah (Revisi)', 175000000, 'https://drive.test/hibah2025_revisi.pdf', '2025-09-19 03:46:52', '2025-09-19 05:27:53', '2025-09-19 12:27:53', 4),
(20, 2024, 'Hibah Penelitian', 1000000, 'https://hdhsh.com', '2025-09-30 10:06:26', '2025-09-30 10:06:26', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `sumber_rekognisi_master`
--

CREATE TABLE `sumber_rekognisi_master` (
  `id_sumber` int(11) NOT NULL,
  `nama_sumber` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `sumber_rekognisi_master`
--

INSERT INTO `sumber_rekognisi_master` (`id_sumber`, `nama_sumber`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'Masyarakat', '2025-10-23 03:27:24', '2025-10-23 03:27:24', NULL, NULL),
(2, 'Dunia Usaha', '2025-10-23 03:27:24', '2025-10-23 03:27:24', NULL, NULL),
(3, 'Dunia Industri', '2025-10-23 03:27:24', '2025-10-23 03:27:24', NULL, NULL),
(4, 'Dunia Kerja', '2025-10-23 03:27:24', '2025-10-23 03:27:24', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2a1_mahasiswa_baru_aktif`
--

CREATE TABLE `tabel_2a1_mahasiswa_baru_aktif` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jenis` enum('baru','aktif') NOT NULL,
  `jalur` enum('reguler','rpl') NOT NULL,
  `jumlah_total` int(11) DEFAULT 0,
  `jumlah_afirmasi` int(11) DEFAULT 0,
  `jumlah_kebutuhan_khusus` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2a1_mahasiswa_baru_aktif`
--

INSERT INTO `tabel_2a1_mahasiswa_baru_aktif` (`id`, `id_unit_prodi`, `id_tahun`, `jenis`, `jalur`, `jumlah_total`, `jumlah_afirmasi`, `jumlah_kebutuhan_khusus`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(3, 4, 2020, 'baru', 'reguler', 120, 4, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(4, 4, 2020, 'aktif', 'reguler', 400, 12, 3, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(5, 4, 2021, 'baru', 'reguler', 130, 5, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(6, 4, 2021, 'aktif', 'reguler', 410, 14, 4, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(7, 4, 2022, 'baru', 'reguler', 145, 6, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(8, 4, 2022, 'aktif', 'reguler', 420, 15, 4, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(9, 4, 2023, 'baru', 'reguler', 140, 7, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(10, 4, 2023, 'aktif', 'reguler', 425, 16, 3, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(11, 4, 2024, 'baru', 'reguler', 105, 6, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(12, 4, 2024, 'aktif', 'reguler', 120, 8, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(13, 5, 2020, 'baru', 'reguler', 90, 3, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(14, 5, 2020, 'aktif', 'reguler', 250, 8, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(15, 5, 2021, 'baru', 'reguler', 100, 4, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(16, 5, 2021, 'aktif', 'reguler', 260, 9, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(17, 5, 2022, 'baru', 'reguler', 110, 5, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(18, 5, 2022, 'aktif', 'reguler', 270, 10, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(19, 5, 2023, 'baru', 'reguler', 115, 6, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(20, 5, 2023, 'aktif', 'reguler', 280, 11, 2, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(21, 5, 2024, 'baru', 'reguler', 95, 5, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL),
(22, 5, 2024, 'aktif', 'reguler', 210, 7, 1, '2025-10-09 07:08:37', '2025-10-09 07:08:37', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2a1_pendaftaran`
--

CREATE TABLE `tabel_2a1_pendaftaran` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `daya_tampung` int(11) DEFAULT 0,
  `pendaftar` int(11) DEFAULT 0,
  `pendaftar_afirmasi` int(11) DEFAULT 0,
  `pendaftar_kebutuhan_khusus` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2a1_pendaftaran`
--

INSERT INTO `tabel_2a1_pendaftaran` (`id`, `id_unit_prodi`, `id_tahun`, `daya_tampung`, `pendaftar`, `pendaftar_afirmasi`, `pendaftar_kebutuhan_khusus`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 2024, 160, 130, 8, 2, '2025-10-03 09:26:23', '2025-10-03 09:27:44', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2a2_keragaman_asal`
--

CREATE TABLE `tabel_2a2_keragaman_asal` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `nama_daerah_input` varchar(255) NOT NULL,
  `kategori_geografis` enum('Sama Kota/Kab','Kota/Kab Lain','Provinsi Lain','Negara Lain') NOT NULL,
  `is_afirmasi` tinyint(1) NOT NULL DEFAULT 0,
  `is_kebutuhan_khusus` tinyint(1) NOT NULL DEFAULT 0,
  `jumlah_mahasiswa` int(11) DEFAULT 0,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2a2_keragaman_asal`
--

INSERT INTO `tabel_2a2_keragaman_asal` (`id`, `id_unit_prodi`, `id_tahun`, `nama_daerah_input`, `kategori_geografis`, `is_afirmasi`, `is_kebutuhan_khusus`, `jumlah_mahasiswa`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(2, 2, 2024, 'KABUPATEN BANYUWANGI', 'Kota/Kab Lain', 0, 0, 30, 'https://drive.google.com/file/abc123', '2025-10-06 06:37:18', '2025-10-06 06:37:18', NULL, NULL),
(3, 2, 2024, 'KABUPATEN BANYUWANGI', 'Kota/Kab Lain', 0, 0, 30, 'https://drive.google.com/file/abc123', '2025-10-06 09:12:19', '2025-10-06 09:12:19', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2a3_kondisi_mahasiswa`
--

CREATE TABLE `tabel_2a3_kondisi_mahasiswa` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jml_baru` int(11) DEFAULT 0,
  `jml_aktif` int(11) DEFAULT 0,
  `jml_lulus` int(11) DEFAULT 0,
  `jml_do` int(11) DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2a3_kondisi_mahasiswa`
--

INSERT INTO `tabel_2a3_kondisi_mahasiswa` (`id`, `id_unit_prodi`, `id_tahun`, `jml_baru`, `jml_aktif`, `jml_lulus`, `jml_do`, `deleted_at`, `deleted_by`) VALUES
(6, 1, 2024, 0, 0, 30, 5, NULL, NULL),
(7, 4, 2024, 105, 120, 30, 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2b4_masa_tunggu`
--

CREATE TABLE `tabel_2b4_masa_tunggu` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun_lulus` int(11) NOT NULL,
  `jumlah_lulusan` int(11) DEFAULT 0,
  `jumlah_terlacak` int(11) DEFAULT 0,
  `rata_rata_waktu_tunggu_bulan` float DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2b4_masa_tunggu`
--

INSERT INTO `tabel_2b4_masa_tunggu` (`id`, `id_unit_prodi`, `id_tahun_lulus`, `jumlah_lulusan`, `jumlah_terlacak`, `rata_rata_waktu_tunggu_bulan`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 2025, 100, 80, 2.6, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2b5_kesesuaian_kerja`
--

CREATE TABLE `tabel_2b5_kesesuaian_kerja` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun_lulus` int(11) NOT NULL,
  `jml_infokom` int(11) DEFAULT 0,
  `jml_non_infokom` int(11) DEFAULT 0,
  `jml_internasional` int(11) DEFAULT 0,
  `jml_nasional` int(11) DEFAULT 0,
  `jml_wirausaha` int(11) DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_2b6_kepuasan_pengguna`
--

CREATE TABLE `tabel_2b6_kepuasan_pengguna` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `jenis_kemampuan` varchar(255) NOT NULL,
  `persen_sangat_baik` float DEFAULT 0,
  `persen_baik` float DEFAULT 0,
  `persen_cukup` float DEFAULT 0,
  `persen_kurang` float DEFAULT 0,
  `rencana_tindak_lanjut` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_2b6_kepuasan_pengguna`
--

INSERT INTO `tabel_2b6_kepuasan_pengguna` (`id`, `id_unit_prodi`, `id_tahun`, `jenis_kemampuan`, `persen_sangat_baik`, `persen_baik`, `persen_cukup`, `persen_kurang`, `rencana_tindak_lanjut`, `deleted_at`, `deleted_by`) VALUES
(3, 4, 2025, 'Kerjasama Tim', 25, 25, 25, 25, 'Pertahankan', NULL, NULL),
(4, 4, 2025, 'Keahlian di Bidang Prodi', 30, 20, 30, 20, 'Pertahankan', NULL, NULL),
(5, 5, 2025, 'Keahlian di Bidang Prodi', 30, 20, 30, 20, 'lkdfns', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3a1_sarpras_penelitian`
--

CREATE TABLE `tabel_3a1_sarpras_penelitian` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL,
  `nama_sarpras` varchar(255) NOT NULL COMMENT 'Nama Prasarana (misal: nama laboratorium)',
  `daya_tampung` int(11) DEFAULT NULL COMMENT 'Daya Tampung (jika relevan)',
  `luas_ruang_m2` float DEFAULT NULL COMMENT 'Luas Ruang (m²)',
  `kepemilikan` enum('M','W') DEFAULT NULL COMMENT 'Milik sendiri (M), Sewa (W)',
  `lisensi` enum('L','P','T') DEFAULT NULL COMMENT 'Berlisensi (L), Public Domain (P), atau Tidak Berlisensi (T)',
  `perangkat_detail` text DEFAULT NULL COMMENT 'Detail perangkat (keras, lunak, bandwidth, dll)',
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_3a1_sarpras_penelitian`
--

INSERT INTO `tabel_3a1_sarpras_penelitian` (`id`, `id_unit_prodi`, `nama_sarpras`, `daya_tampung`, `luas_ruang_m2`, `kepemilikan`, `lisensi`, `perangkat_detail`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 11, 'Komputer', 30, 50, 'M', 'L', 'Hardware, Software', 'https://youtube.com', '2025-11-03 04:37:28', '2025-11-03 05:04:44', NULL, NULL),
(2, 11, 'Basis Data', 20, 100, 'W', 'T', 'Komputer, Kursi', 'https://youtube.com', '2025-11-03 05:05:24', '2025-11-03 05:05:24', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3a2_pendanaan`
--

CREATE TABLE `tabel_3a2_pendanaan` (
  `id_pendanaan` int(11) NOT NULL,
  `id_penelitian` int(11) NOT NULL COMMENT 'FK ke tabel_3a2_penelitian.id',
  `id_tahun` int(11) NOT NULL,
  `jumlah_dana` bigint(20) NOT NULL DEFAULT 0,
  `link_bukti` text DEFAULT NULL COMMENT 'Link bukti untuk dana di tahun ini',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_3a2_pendanaan`
--

INSERT INTO `tabel_3a2_pendanaan` (`id_pendanaan`, `id_penelitian`, `id_tahun`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`) VALUES
(3, 1, 2024, 10, 'https://youtube.com1', '2025-11-05 04:10:27', '2025-11-05 04:10:27'),
(4, 2, 2026, 11, 'https://youtube.com1', '2025-11-05 04:15:38', '2025-11-05 04:15:38'),
(6, 3, 2031, 1, 'https://youtube.com1', '2025-11-05 04:39:29', '2025-11-05 04:39:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3a2_penelitian`
--

CREATE TABLE `tabel_3a2_penelitian` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'FK ke unit_kerja.id_unit (Kemahasiswaan, dll.)',
  `link_roadmap` text DEFAULT NULL,
  `id_dosen_ketua` int(11) NOT NULL COMMENT 'FK ke tabel dosen.id_dosen',
  `judul_penelitian` text NOT NULL,
  `jml_mhs_terlibat` int(11) DEFAULT 0,
  `jenis_hibah` varchar(255) DEFAULT NULL,
  `sumber_dana` enum('L','N','I') DEFAULT NULL COMMENT 'L=Lokal, N=Nasional, I=Internasional',
  `durasi_tahun` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_3a2_penelitian`
--

INSERT INTO `tabel_3a2_penelitian` (`id`, `id_unit`, `link_roadmap`, `id_dosen_ketua`, `judul_penelitian`, `jml_mhs_terlibat`, `jenis_hibah`, `sumber_dana`, `durasi_tahun`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 'https://www.youtube.com/', 12, 'Testing', 2, 'Terapan', 'L', 1, '2025-11-04 09:28:58', '2025-11-05 04:06:18', NULL, NULL),
(2, 12, 'https://www.youtube.com/', 3, 'Tes 2', 1, 'Hibah Dasar', 'N', 2, '2025-11-05 04:15:38', '2025-11-05 04:15:38', NULL, NULL),
(3, 12, 'https://www.youtube1.com/', 1, 'Tes 3', 0, 'Hibah Dasar', 'I', 3, '2025-11-05 04:28:57', '2025-11-05 04:39:29', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3a3_dtpr_tahunan`
--

CREATE TABLE `tabel_3a3_dtpr_tahunan` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL COMMENT 'Tahun data (TS, TS-1, atau TS-2)',
  `jumlah_dtpr` int(11) DEFAULT 0,
  `link_bukti` text DEFAULT NULL COMMENT 'Link bukti untuk 1 baris/tahun ini',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_3a3_dtpr_tahunan`
--

INSERT INTO `tabel_3a3_dtpr_tahunan` (`id`, `id_unit`, `id_tahun`, `jumlah_dtpr`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 12, 2024, 15, 'https://example.com/bukti.pdf', '2025-11-05 06:55:47', '2025-11-05 06:55:47', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3a3_pengembangan`
--

CREATE TABLE `tabel_3a3_pengembangan` (
  `id_pengembangan` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL,
  `jenis_pengembangan` varchar(255) NOT NULL,
  `id_tahun` int(11) NOT NULL COMMENT 'Tahun pelaksanaan (bisa TS, TS-1, atau TS-2)',
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_3a3_pengembangan`
--

INSERT INTO `tabel_3a3_pengembangan` (`id_pengembangan`, `id_unit`, `id_dosen`, `jenis_pengembangan`, `id_tahun`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 12, 1, 'Tugas Belajar', 2024, 'https://example.com/bukti.pdf', '2025-11-05 07:07:07', '2025-11-05 07:07:07', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3c1_kerjasama_penelitian`
--

CREATE TABLE `tabel_3c1_kerjasama_penelitian` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Merujuk ke unit_kerja.id_unit (misal: LPPM)',
  `judul_kerjasama` text NOT NULL,
  `mitra_kerja_sama` varchar(255) NOT NULL,
  `sumber` enum('L','N','I') NOT NULL COMMENT 'L: Lokal/Wilayah, N: Nasional, I: Internasional',
  `durasi_tahun` int(11) DEFAULT NULL,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3c1_pendanaan_kerjasama`
--

CREATE TABLE `tabel_3c1_pendanaan_kerjasama` (
  `id_pendanaan` int(11) NOT NULL,
  `id_kerjasama` int(11) NOT NULL COMMENT 'Merujuk ke id tabel_3c1_kerjasama_penelitian',
  `id_tahun` int(11) NOT NULL COMMENT 'Merujuk ke id tahun_akademik (utk TS-2, TS-1, TS)',
  `jumlah_dana` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3c2_publikasi_penelitian`
--

CREATE TABLE `tabel_3c2_publikasi_penelitian` (
  `id` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL COMMENT 'Relasi ke tabel dosen.id_dosen',
  `judul_publikasi` text NOT NULL COMMENT 'Judul lengkap publikasi',
  `jenis_publikasi` enum('IB','I','S1','S2','S3','S4','T') NOT NULL COMMENT 'IB: Intl Bereputasi, I: Intl, S1-S4: Sinta, T: Tdk Terakreditasi',
  `id_tahun_terbit` int(11) NOT NULL COMMENT 'Relasi ke tahun_akademik.id_tahun',
  `link_bukti` text DEFAULT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Prodi/LPPM)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_3c3_hki`
--

CREATE TABLE `tabel_3c3_hki` (
  `id` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL COMMENT 'Relasi ke tabel dosen.id_dosen',
  `judul_hki` text NOT NULL COMMENT 'Judul lengkap HKI',
  `jenis_hki` varchar(255) NOT NULL COMMENT 'Jenis HKI (cth: Paten, Hak Cipta, dll)',
  `id_tahun_perolehan` int(11) NOT NULL COMMENT 'Relasi ke tahun_akademik.id_tahun',
  `link_bukti` text DEFAULT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Prodi/LPPM)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tahun_akademik`
--

CREATE TABLE `tahun_akademik` (
  `id_tahun` int(11) NOT NULL,
  `tahun` varchar(10) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tahun_akademik`
--

INSERT INTO `tahun_akademik` (`id_tahun`, `tahun`, `deleted_at`, `deleted_by`) VALUES
(2020, '2020/2021', NULL, NULL),
(2021, '2021/2022', NULL, NULL),
(2022, '2022/2023', NULL, NULL),
(2023, '2023/2024', NULL, NULL),
(2024, '2024/2025', NULL, NULL),
(2025, '2025/2026', NULL, NULL),
(2026, '2026/2027', NULL, NULL),
(2027, '2027/2028', NULL, NULL),
(2028, '2028/2029', NULL, NULL),
(2029, '2029/2030', NULL, NULL),
(2030, '2030/2031', NULL, NULL),
(2031, '2031/2032', NULL, NULL),
(2032, '2032/2033', NULL, NULL),
(2033, '2033/2034', NULL, NULL),
(2034, '2034/2035', NULL, NULL),
(2035, '2035/2036', NULL, NULL),
(2036, '2036/2037', NULL, NULL),
(2037, '2037/2038', NULL, NULL),
(2038, '2038/2039', NULL, NULL),
(2039, '2039/2040', NULL, NULL),
(2040, '2040/2041', NULL, NULL),
(2041, '2041/2042', NULL, NULL),
(2042, '2042/2043', NULL, NULL),
(2043, '2043/2044', NULL, NULL),
(2044, '2044/2045', NULL, NULL),
(2045, '2045/2046', NULL, NULL),
(2046, '2046/2047', NULL, NULL),
(2047, '2047/2048', NULL, NULL),
(2048, '2048/2049', NULL, NULL),
(2049, '2049/2050', NULL, NULL),
(2050, '2050/2051', NULL, NULL),
(2051, '2051/2052', NULL, NULL),
(2052, '2052/2053', NULL, NULL),
(2053, '2053/2054', NULL, NULL),
(2054, '2054/2055', NULL, NULL),
(2055, '2055/2056', NULL, NULL),
(2056, '2056/2057', NULL, NULL),
(2057, '2057/2058', NULL, NULL),
(2058, '2058/2059', NULL, NULL),
(2059, '2059/2060', NULL, NULL),
(2060, '2060/2061', NULL, NULL),
(2061, '2061/2062', NULL, NULL),
(2062, '2062/2063', NULL, NULL),
(2063, '2063/2064', NULL, NULL),
(2064, '2064/2065', NULL, NULL),
(2065, '2065/2066', NULL, NULL),
(2066, '2066/2067', NULL, NULL),
(2067, '2067/2068', NULL, NULL),
(2068, '2068/2069', NULL, NULL),
(2069, '2069/2070', NULL, NULL),
(2070, '2070/2071', NULL, NULL),
(2071, '2071/2072', NULL, NULL),
(2072, '2072/2073', NULL, NULL),
(2073, '2073/2074', NULL, NULL),
(2074, '2074/2075', NULL, NULL),
(2075, '2075/2076', NULL, NULL),
(2076, '2076/2077', NULL, NULL),
(2077, '2077/2078', NULL, NULL),
(2078, '2078/2079', NULL, NULL),
(2079, '2079/2080', NULL, NULL),
(2080, '2080/2081', NULL, NULL),
(2081, '2081/2082', NULL, NULL),
(2082, '2082/2083', NULL, NULL),
(2083, '2083/2084', NULL, NULL),
(2084, '2084/2085', NULL, NULL),
(2085, '2085/2086', NULL, NULL),
(2086, '2086/2087', NULL, NULL),
(2087, '2087/2088', NULL, NULL),
(2088, '2088/2089', NULL, NULL),
(2089, '2089/2090', NULL, NULL),
(2090, '2090/2091', NULL, NULL),
(2091, '2091/2092', NULL, NULL),
(2092, '2092/2093', NULL, NULL),
(2093, '2093/2094', NULL, NULL),
(2094, '2094/2095', NULL, NULL),
(2095, '2095/2096', NULL, NULL),
(2096, '2096/2097', NULL, NULL),
(2097, '2097/2098', NULL, NULL),
(2098, '2098/2099', NULL, NULL),
(2099, '2099/2100', NULL, NULL),
(2100, '2100/2101', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tenaga_kependidikan`
--

CREATE TABLE `tenaga_kependidikan` (
  `id_tendik` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `jenis_tendik` varchar(100) DEFAULT NULL,
  `nikp` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tenaga_kependidikan`
--

INSERT INTO `tenaga_kependidikan` (`id_tendik`, `id_pegawai`, `jenis_tendik`, `nikp`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'PUSTAKAWAN', 'KEP001', '2025-08-21 23:54:41', '2025-08-22 09:51:26', NULL, NULL),
(2, 5, 'Laboran/Teknisi', 'KEP002', '2025-08-21 23:54:41', '2025-08-22 09:51:26', NULL, NULL),
(3, 6, 'Administrasi', 'KEP003', '2025-08-21 23:54:41', '2025-08-22 09:51:26', NULL, NULL),
(4, 7, 'TUKANG TAMBAL BAN', 'KEP004', '2025-08-21 23:54:41', '2025-08-22 09:51:26', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `unit_kerja`
--

CREATE TABLE `unit_kerja` (
  `id_unit` int(11) NOT NULL,
  `nama_unit` varchar(100) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `unit_kerja`
--

INSERT INTO `unit_kerja` (`id_unit`, `nama_unit`, `deleted_at`, `deleted_by`) VALUES
(1, 'Ketua STIKOM', NULL, NULL),
(2, 'Wakil Ketua I', NULL, NULL),
(3, 'Wakil Ketua II ', NULL, NULL),
(4, 'Prodi TI', NULL, NULL),
(5, 'Prodi MI', NULL, NULL),
(6, 'ALA', NULL, NULL),
(7, 'PMB', NULL, NULL),
(8, 'Kemahasiswaan', NULL, NULL),
(9, 'TPM', NULL, NULL),
(10, 'Kepegawaian', NULL, NULL),
(11, 'Sarpras', NULL, NULL),
(12, 'LPPM', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_unit` int(11) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `id_pegawai`, `username`, `password`, `id_unit`, `role`, `is_active`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'waket1', '$2b$10$zPvCSBBYV0RNbGKRT.bW7OtKVTLwXUSMstPsZw6t0tjFuZN73sJma', 2, 'waket1', 1, '2025-08-21 23:54:41', '2025-09-29 09:31:32', NULL, NULL),
(2, 3, 'waket2', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 3, 'waket2', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(3, 2, 'prodi_ti', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 4, 'prodi', 1, '2025-08-21 23:54:41', '2025-09-30 11:53:05', NULL, NULL),
(4, 8, 'lppm', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 12, 'lppm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(5, 5, 'kepegawaian', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 10, 'kepegawaian', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(6, 7, 'tpm', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 9, 'tpm', 1, '2025-08-21 23:54:41', '2025-09-29 08:12:54', NULL, NULL),
(7, 6, 'prodi_mi', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 5, 'prodi', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(8, 4, 'sarpras', '$2b$10$ohecv6usneiCe.L0G258H.wBQWme11K4Dwk99RIspsatdJUyJnqMm', 11, 'SARPRAS', 1, '2025-10-29 06:19:51', '2025-10-29 06:19:51', NULL, NULL),
(9, 1, 'kemahasiswaan', '$2b$10$DIdZNEjirnWlE90bb7P/nu4dazkXzb8H5z4rxVKg1rrOGYkJuBWyu', 8, 'KEMAHASISWAAN', 1, '2025-11-03 05:14:47', '2025-11-03 05:14:47', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD PRIMARY KEY (`id_ami`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD PRIMARY KEY (`id_beban_kerja`),
  ADD UNIQUE KEY `unik_dosen_tahun` (`id_dosen`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `bentuk_pembelajaran_master`
--
ALTER TABLE `bentuk_pembelajaran_master`
  ADD PRIMARY KEY (`id_bentuk`);

--
-- Indeks untuk tabel `cpl`
--
ALTER TABLE `cpl`
  ADD PRIMARY KEY (`id_cpl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indeks untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  ADD PRIMARY KEY (`id_cpmk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indeks untuk tabel `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id_dosen`),
  ADD UNIQUE KEY `nidn` (`nidn`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jafung` (`id_jafung`);

--
-- Indeks untuk tabel `fleksibilitas_pembelajaran_detail`
--
ALTER TABLE `fleksibilitas_pembelajaran_detail`
  ADD PRIMARY KEY (`id_tahunan`,`id_bentuk`),
  ADD KEY `id_bentuk` (`id_bentuk`);

--
-- Indeks untuk tabel `fleksibilitas_pembelajaran_tahunan`
--
ALTER TABLE `fleksibilitas_pembelajaran_tahunan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD PRIMARY KEY (`id_kualifikasi`),
  ADD KEY `id_tendik` (`id_tendik`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_user` (`id_user`);

--
-- Indeks untuk tabel `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD PRIMARY KEY (`id_cpl`,`id_pl`),
  ADD KEY `id_pl` (`id_pl`);

--
-- Indeks untuk tabel `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD PRIMARY KEY (`id_cpmk`,`id_cpl`),
  ADD KEY `id_cpl` (`id_cpl`);

--
-- Indeks untuk tabel `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD PRIMARY KEY (`id_cpmk`,`id_mk`),
  ADD KEY `id_mk` (`id_mk`);

--
-- Indeks untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id_mk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indeks untuk tabel `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id_pegawai`);

--
-- Indeks untuk tabel `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD PRIMARY KEY (`id_penggunaan_dana`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD PRIMARY KEY (`id_pimpinan`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jabatan` (`id_jabatan`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD PRIMARY KEY (`id_pl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indeks untuk tabel `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  ADD PRIMARY KEY (`id_jafung`);

--
-- Indeks untuk tabel `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  ADD PRIMARY KEY (`id_jabatan`);

--
-- Indeks untuk tabel `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD PRIMARY KEY (`id_kabupaten_kota`),
  ADD KEY `id_provinsi` (`id_provinsi`);

--
-- Indeks untuk tabel `ref_provinsi`
--
ALTER TABLE `ref_provinsi`
  ADD PRIMARY KEY (`id_provinsi`);

--
-- Indeks untuk tabel `rekognisi_lulusan_detail`
--
ALTER TABLE `rekognisi_lulusan_detail`
  ADD PRIMARY KEY (`id_tahunan`,`id_sumber`),
  ADD KEY `id_sumber` (`id_sumber`);

--
-- Indeks untuk tabel `rekognisi_lulusan_tahunan`
--
ALTER TABLE `rekognisi_lulusan_tahunan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD PRIMARY KEY (`id_sumber`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `sumber_rekognisi_master`
--
ALTER TABLE `sumber_rekognisi_master`
  ADD PRIMARY KEY (`id_sumber`);

--
-- Indeks untuk tabel `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `idx_unit_prodi` (`id_unit_prodi`),
  ADD KEY `idx_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_pendaftaran` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kondisi` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_tunggu` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indeks untuk tabel `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kerja` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indeks untuk tabel `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kepuasan` (`id_unit_prodi`,`id_tahun`,`jenis_kemampuan`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_3a1_sarpras_penelitian`
--
ALTER TABLE `tabel_3a1_sarpras_penelitian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indeks untuk tabel `tabel_3a2_pendanaan`
--
ALTER TABLE `tabel_3a2_pendanaan`
  ADD PRIMARY KEY (`id_pendanaan`),
  ADD KEY `id_penelitian` (`id_penelitian`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_3a2_penelitian`
--
ALTER TABLE `tabel_3a2_penelitian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_dosen_ketua` (`id_dosen_ketua`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_3a3_dtpr_tahunan`
--
ALTER TABLE `tabel_3a3_dtpr_tahunan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_3a3_dtpr_tahunan_unit_idx` (`id_unit`),
  ADD KEY `fk_3a3_dtpr_tahunan_tahun_idx` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_3a3_pengembangan`
--
ALTER TABLE `tabel_3a3_pengembangan`
  ADD PRIMARY KEY (`id_pengembangan`),
  ADD KEY `fk_3a3_pengembangan_unit_idx` (`id_unit`),
  ADD KEY `fk_3a3_pengembangan_dosen_idx` (`id_dosen`),
  ADD KEY `fk_3a3_pengembangan_tahun_idx` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_3c1_kerjasama_penelitian`
--
ALTER TABLE `tabel_3c1_kerjasama_penelitian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_3c1_pendanaan_kerjasama`
--
ALTER TABLE `tabel_3c1_pendanaan_kerjasama`
  ADD PRIMARY KEY (`id_pendanaan`),
  ADD KEY `id_kerjasama` (`id_kerjasama`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_3c2_publikasi_penelitian`
--
ALTER TABLE `tabel_3c2_publikasi_penelitian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_3c2_id_dosen` (`id_dosen`),
  ADD KEY `idx_3c2_id_tahun_terbit` (`id_tahun_terbit`),
  ADD KEY `idx_3c2_id_unit` (`id_unit`),
  ADD KEY `idx_3c2_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_3c3_hki`
--
ALTER TABLE `tabel_3c3_hki`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_3c3_id_dosen` (`id_dosen`),
  ADD KEY `idx_3c3_id_tahun_perolehan` (`id_tahun_perolehan`),
  ADD KEY `idx_3c3_id_unit` (`id_unit`),
  ADD KEY `idx_3c3_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tahun_akademik`
--
ALTER TABLE `tahun_akademik`
  ADD PRIMARY KEY (`id_tahun`);

--
-- Indeks untuk tabel `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD PRIMARY KEY (`id_tendik`),
  ADD UNIQUE KEY `nikp` (`nikp`),
  ADD KEY `id_pegawai` (`id_pegawai`);

--
-- Indeks untuk tabel `unit_kerja`
--
ALTER TABLE `unit_kerja`
  ADD PRIMARY KEY (`id_unit`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_unit` (`id_unit`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  MODIFY `id_ami` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `bentuk_pembelajaran_master`
--
ALTER TABLE `bentuk_pembelajaran_master`
  MODIFY `id_bentuk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `cpl`
--
ALTER TABLE `cpl`
  MODIFY `id_cpl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  MODIFY `id_cpmk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `fleksibilitas_pembelajaran_tahunan`
--
ALTER TABLE `fleksibilitas_pembelajaran_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  MODIFY `id_kualifikasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id_mk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT untuk tabel `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  MODIFY `id_pl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  MODIFY `id_jafung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  MODIFY `id_jabatan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `rekognisi_lulusan_tahunan`
--
ALTER TABLE `rekognisi_lulusan_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  MODIFY `id_sumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT untuk tabel `sumber_rekognisi_master`
--
ALTER TABLE `sumber_rekognisi_master`
  MODIFY `id_sumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a1_sarpras_penelitian`
--
ALTER TABLE `tabel_3a1_sarpras_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a2_pendanaan`
--
ALTER TABLE `tabel_3a2_pendanaan`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a2_penelitian`
--
ALTER TABLE `tabel_3a2_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a3_dtpr_tahunan`
--
ALTER TABLE `tabel_3a3_dtpr_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a3_pengembangan`
--
ALTER TABLE `tabel_3a3_pengembangan`
  MODIFY `id_pengembangan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c1_kerjasama_penelitian`
--
ALTER TABLE `tabel_3c1_kerjasama_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c1_pendanaan_kerjasama`
--
ALTER TABLE `tabel_3c1_pendanaan_kerjasama`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c2_publikasi_penelitian`
--
ALTER TABLE `tabel_3c2_publikasi_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c3_hki`
--
ALTER TABLE `tabel_3c3_hki`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  MODIFY `id_tendik` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `unit_kerja`
--
ALTER TABLE `unit_kerja`
  MODIFY `id_unit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD CONSTRAINT `audit_mutu_internal_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `audit_mutu_internal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_1` FOREIGN KEY (`id_dosen`) REFERENCES `dosen` (`id_dosen`),
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `cpl`
--
ALTER TABLE `cpl`
  ADD CONSTRAINT `cpl_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  ADD CONSTRAINT `cpmk_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `fleksibilitas_pembelajaran_detail`
--
ALTER TABLE `fleksibilitas_pembelajaran_detail`
  ADD CONSTRAINT `fleksibilitas_pembelajaran_detail_ibfk_1` FOREIGN KEY (`id_tahunan`) REFERENCES `fleksibilitas_pembelajaran_tahunan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fleksibilitas_pembelajaran_detail_ibfk_2` FOREIGN KEY (`id_bentuk`) REFERENCES `bentuk_pembelajaran_master` (`id_bentuk`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `fleksibilitas_pembelajaran_tahunan`
--
ALTER TABLE `fleksibilitas_pembelajaran_tahunan`
  ADD CONSTRAINT `fleksibilitas_pembelajaran_tahunan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `fleksibilitas_pembelajaran_tahunan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_1` FOREIGN KEY (`id_tendik`) REFERENCES `tenaga_kependidikan` (`id_tendik`),
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD CONSTRAINT `map_cpl_pl_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpl_pl_ibfk_2` FOREIGN KEY (`id_pl`) REFERENCES `profil_lulusan` (`id_pl`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_2` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD CONSTRAINT `map_cpmk_mk_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD CONSTRAINT `penggunaan_dana_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_3` FOREIGN KEY (`id_jabatan`) REFERENCES `ref_jabatan_struktural` (`id_jabatan`);

--
-- Ketidakleluasaan untuk tabel `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD CONSTRAINT `profil_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD CONSTRAINT `ref_kabupaten_kota_ibfk_1` FOREIGN KEY (`id_provinsi`) REFERENCES `ref_provinsi` (`id_provinsi`);

--
-- Ketidakleluasaan untuk tabel `rekognisi_lulusan_detail`
--
ALTER TABLE `rekognisi_lulusan_detail`
  ADD CONSTRAINT `rekognisi_lulusan_detail_ibfk_1` FOREIGN KEY (`id_tahunan`) REFERENCES `rekognisi_lulusan_tahunan` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rekognisi_lulusan_detail_ibfk_2` FOREIGN KEY (`id_sumber`) REFERENCES `sumber_rekognisi_master` (`id_sumber`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `rekognisi_lulusan_tahunan`
--
ALTER TABLE `rekognisi_lulusan_tahunan`
  ADD CONSTRAINT `rekognisi_lulusan_tahunan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `rekognisi_lulusan_tahunan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_3a1_sarpras_penelitian`
--
ALTER TABLE `tabel_3a1_sarpras_penelitian`
  ADD CONSTRAINT `tabel_3a1_sarpras_penelitian_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `tabel_3a2_pendanaan`
--
ALTER TABLE `tabel_3a2_pendanaan`
  ADD CONSTRAINT `tabel_3a2_pendanaan_ibfk_1` FOREIGN KEY (`id_penelitian`) REFERENCES `tabel_3a2_penelitian` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tabel_3a2_pendanaan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tabel_3a2_penelitian`
--
ALTER TABLE `tabel_3a2_penelitian`
  ADD CONSTRAINT `tabel_3a2_penelitian_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tabel_3a2_penelitian_ibfk_2` FOREIGN KEY (`id_dosen_ketua`) REFERENCES `dosen` (`id_dosen`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tabel_3a3_dtpr_tahunan`
--
ALTER TABLE `tabel_3a3_dtpr_tahunan`
  ADD CONSTRAINT `fk_3a3_dtpr_tahunan_tahun` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_3a3_dtpr_tahunan_unit` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tabel_3a3_pengembangan`
--
ALTER TABLE `tabel_3a3_pengembangan`
  ADD CONSTRAINT `fk_3a3_pengembangan_dosen` FOREIGN KEY (`id_dosen`) REFERENCES `dosen` (`id_dosen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_3a3_pengembangan_tahun` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_3a3_pengembangan_unit` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tabel_3c1_kerjasama_penelitian`
--
ALTER TABLE `tabel_3c1_kerjasama_penelitian`
  ADD CONSTRAINT `tabel_3c1_kerjasama_penelitian_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `tabel_3c1_pendanaan_kerjasama`
--
ALTER TABLE `tabel_3c1_pendanaan_kerjasama`
  ADD CONSTRAINT `tabel_3c1_pendanaan_kerjasama_ibfk_1` FOREIGN KEY (`id_kerjasama`) REFERENCES `tabel_3c1_kerjasama_penelitian` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tabel_3c1_pendanaan_kerjasama_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Ketidakleluasaan untuk tabel `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD CONSTRAINT `tenaga_kependidikan_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 16, 2025 at 07:41 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.22

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
-- Table structure for table `audit_mutu_internal`
--

CREATE TABLE `audit_mutu_internal` (
  `id_ami` int NOT NULL,
  `id_unit` int NOT NULL,
  `id_tahun` int NOT NULL,
  `frekuensi_audit` int DEFAULT NULL,
  `dokumen_spmi` text,
  `laporan_audit_url` text,
  `bukti_certified_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `jumlah_auditor_certified` int DEFAULT NULL,
  `jumlah_auditor_noncertified` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_mutu_internal`
--

INSERT INTO `audit_mutu_internal` (`id_ami`, `id_unit`, `id_tahun`, `frekuensi_audit`, `dokumen_spmi`, `laporan_audit_url`, `bukti_certified_url`, `jumlah_auditor_certified`, `jumlah_auditor_noncertified`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(5, 9, 2023, 12, 'ini dokumen', 'ini laporan', 'ini url', 12, 13, '2025-08-22 23:46:22', '2025-08-28 03:24:10', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `beban_kerja_dosen`
--

CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int NOT NULL,
  `id_dosen` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sks_pengajaran` float DEFAULT '0',
  `sks_penelitian` float DEFAULT '0',
  `sks_pkm` float DEFAULT '0',
  `sks_manajemen` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `beban_kerja_dosen`
--

INSERT INTO `beban_kerja_dosen` (`id_beban_kerja`, `id_dosen`, `id_tahun`, `sks_pengajaran`, `sks_penelitian`, `sks_pkm`, `sks_manajemen`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(9, 1, 2020, 3, 1, 1, 2.5, '2025-08-23 03:48:17', '2025-08-23 03:53:14', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cpl`
--

CREATE TABLE `cpl` (
  `id_cpl` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_cpl` varchar(20) NOT NULL,
  `deskripsi_cpl` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cpl`
--

INSERT INTO `cpl` (`id_cpl`, `id_unit_prodi`, `kode_cpl`, `deskripsi_cpl`) VALUES
(201, 4, 'CPL-TI-S1', 'Mampu menerapkan prinsip-prinsip etika dan profesionalisme dalam bidang informatika.'),
(202, 4, 'CPL-TI-K1', 'Mampu merancang, mengimplementasikan, dan mengevaluasi solusi perangkat lunak menggunakan algoritma dan struktur data yang efisien.'),
(203, 4, 'CPL-TI-K2', 'Mampu merancang dan mengelola basis data serta sistem informasi untuk berbagai kebutuhan.'),
(204, 4, 'CPL-TI-K3', 'Mampu menganalisis dan merancang infrastruktur jaringan komputer yang aman dan andal.'),
(205, 5, 'CPL-MI-S1', 'Menunjukkan sikap profesional dan etika kerja dalam pengelolaan sistem informasi.'),
(206, 5, 'CPL-MI-K1', 'Mampu menganalisis kebutuhan sistem dan merancang solusi sistem informasi untuk organisasi.'),
(207, 5, 'CPL-MI-K2', 'Mampu merancang, mengimplementasikan, dan melakukan administrasi basis data.'),
(208, 5, 'CPL-MI-K3', 'Mampu mengelola proyek pengembangan sistem informasi secara efektif dan efisiensi.'),
(215, 5, 'CPL-MI-K4', 'Memasak Nasi Jagung'),
(216, 4, 'CPL-TI-06', 'Makan Nasi');

-- --------------------------------------------------------

--
-- Table structure for table `cpmk`
--

CREATE TABLE `cpmk` (
  `id_cpmk` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_cpmk` varchar(20) NOT NULL,
  `deskripsi_cpmk` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cpmk`
--

INSERT INTO `cpmk` (`id_cpmk`, `id_unit_prodi`, `kode_cpmk`, `deskripsi_cpmk`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'CPMK-TI-01', 'Mahasiswa mampu merancang algoritma dan struktur data dengan efisien.', NULL, NULL),
(2, 4, 'CPMK-TI-02', 'Mahasiswa mampu mengembangkan aplikasi berbasis web menggunakan framework modern.', NULL, NULL),
(3, 4, 'CPMK-TI-03', 'Mahasiswa mampu menerapkan prinsip keamanan informasi dalam sistem.', NULL, NULL),
(4, 5, 'CPMK-MI-01', 'Mahasiswa mampu melakukan analisis sistem informasi sederhana.', NULL, NULL),
(5, 5, 'CPMK-MI-02', 'Mahasiswa mampu mengelola basis data dan membuat laporan menggunakan SQL.', NULL, NULL),
(6, 5, 'CPMK-MI-03', 'Mahasiswa mampu mengembangkan aplikasi bisnis sederhana menggunakan spreadsheet.', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id_dosen` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `nidn` varchar(20) DEFAULT NULL,
  `nuptk` varchar(20) DEFAULT NULL,
  `homebase` varchar(50) DEFAULT NULL,
  `pt` varchar(100) DEFAULT NULL,
  `id_jafung` int DEFAULT NULL,
  `beban_sks` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id_dosen`, `id_pegawai`, `nidn`, `nuptk`, `homebase`, `pt`, `id_jafung`, `beban_sks`, `created_at`, `updated_at`) VALUES
(1, 1, '0011223301', NULL, NULL, NULL, 3, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(2, 2, '0022334402', NULL, NULL, NULL, 2, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(3, 3, '0033445503', NULL, NULL, NULL, 4, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 8, '0044556604', '172839437291829382', 'Manajemen Informatika', 'STIKOM Banyuwangi', 1, 5.3, '2025-08-21 23:54:41', '2025-08-22 23:55:03'),
(6, 10, '001123102130', '1234567890987654', 'Teknik Informatika', 'STIKOM Banyuwangi', 3, 10.5, '2025-08-22 23:50:41', '2025-08-22 23:50:41'),
(7, 11, '087', '806', 'Manajemen Informatika', 'STIKOM', 2, 3, '2025-08-25 09:08:14', '2025-08-25 09:08:14'),
(8, 9, '0123', '01234', 'Manajemen Informatika', 'STIKOM PGRI Banyuwangi', NULL, 3.5, '2025-08-26 06:36:24', '2025-08-26 06:36:33');

-- --------------------------------------------------------

--
-- Table structure for table `kualifikasi_tendik`
--

CREATE TABLE `kualifikasi_tendik` (
  `id_kualifikasi` int NOT NULL,
  `id_tendik` int NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `id_unit` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kualifikasi_tendik`
--

INSERT INTO `kualifikasi_tendik` (`id_kualifikasi`, `id_tendik`, `jenjang_pendidikan`, `id_unit`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'S1', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 2, 'S1', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(3, 3, 'D3', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kurikulum`
--

CREATE TABLE `kurikulum` (
  `id_kurikulum` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `nama_kurikulum` varchar(255) NOT NULL,
  `tahun_mulai_berlaku` year NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kurikulum`
--

INSERT INTO `kurikulum` (`id_kurikulum`, `id_unit_prodi`, `nama_kurikulum`, `tahun_mulai_berlaku`) VALUES
(1, 4, 'Kurikulum 2020 Merdeka Belajar TI', 2020),
(2, 4, 'Kurikulum 2024 Outcome-Based Education (OBE) TI', 2024),
(3, 5, 'Kurikulum 2021 Vokasi Terapan MI', 2021);

-- --------------------------------------------------------

--
-- Table structure for table `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id_log` bigint NOT NULL,
  `id_user` int DEFAULT NULL,
  `aksi` varchar(50) NOT NULL,
  `nama_tabel` varchar(100) DEFAULT NULL,
  `id_record` int DEFAULT NULL,
  `waktu_aksi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `detail_perubahan` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `map_cpl_mk`
--

CREATE TABLE `map_cpl_mk` (
  `id_cpl` int NOT NULL,
  `id_mk` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpl_mk`
--

INSERT INTO `map_cpl_mk` (`id_cpl`, `id_mk`) VALUES
(216, 304),
(202, 305),
(203, 305),
(204, 305),
(206, 308),
(207, 308),
(206, 309),
(207, 309),
(208, 309),
(216, 310),
(206, 311),
(207, 311),
(208, 311),
(215, 311),
(202, 312),
(203, 312),
(204, 312),
(216, 312);

-- --------------------------------------------------------

--
-- Table structure for table `map_cpl_pl`
--

CREATE TABLE `map_cpl_pl` (
  `id_cpl` int NOT NULL,
  `id_pl` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpl_pl`
--

INSERT INTO `map_cpl_pl` (`id_cpl`, `id_pl`) VALUES
(202, 101),
(203, 101),
(203, 102),
(204, 103),
(206, 104),
(215, 104),
(207, 105),
(215, 105),
(208, 106),
(215, 106),
(216, 117),
(216, 118),
(215, 119),
(215, 120);

-- --------------------------------------------------------

--
-- Table structure for table `map_cpmk_cpl`
--

CREATE TABLE `map_cpmk_cpl` (
  `id_cpmk` int NOT NULL,
  `id_cpl` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `map_cpmk_mk`
--

CREATE TABLE `map_cpmk_mk` (
  `id_cpmk` int NOT NULL,
  `id_mk` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpmk_mk`
--

INSERT INTO `map_cpmk_mk` (`id_cpmk`, `id_mk`) VALUES
(1, 301),
(1, 302),
(2, 303),
(2, 304),
(3, 305),
(4, 306),
(4, 307),
(5, 308),
(6, 309),
(3, 310);

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id_mk` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_mk` varchar(20) NOT NULL,
  `nama_mk` varchar(255) NOT NULL,
  `sks` int NOT NULL,
  `semester` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id_mk`, `id_unit_prodi`, `kode_mk`, `nama_mk`, `sks`, `semester`) VALUES
(301, 4, 'TI001', 'Algoritma & Pemrograman', 4, 1),
(302, 4, 'TI002', 'Struktur Data', 3, 2),
(303, 4, 'TI003', 'Basis Data', 3, 3),
(304, 4, 'TI004', 'Jaringan Komputer', 3, 4),
(305, 4, 'TI005', 'Keamanan Informasi', 3, 5),
(306, 5, 'MI001', 'Dasar-Dasar Pemrograman', 4, 1),
(307, 5, 'MI002', 'Analisis & Perancangan Sistem', 4, 2),
(308, 5, 'MI003', 'Administrasi Basis Data', 3, 3),
(309, 5, 'MI004', 'Manajemen Proyek TI', 3, 4),
(310, 4, 'MI005', 'Etika Profesi TI', 2, 5),
(311, 5, 'GEN-1760083991622', 'Mie Ayam', 3, 1),
(312, 4, 'GEN-1760327717951', 'Sego Goreng', 4, 2);

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id_pegawai` int NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id_pegawai`, `nama_lengkap`, `pendidikan_terakhir`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Budi Santoso, M.Kom.', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(2, 'Citra Lestari, S.Kom., M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(3, 'Prof. Dr. Eka Pratama', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 'Ani Wijaya, S.E.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 'Dedi Firmansyah, S.Kom.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(6, 'Fajar Nugroho, A.Md.', 'D3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(7, 'Gita Permata, S.Sos.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(8, 'Hendra Gunawan, M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(9, 'fufufafa', 'S2', '2025-08-22 16:45:03', '2025-08-22 16:46:32'),
(10, 'Dandi Ajusta Dharma Putra Samudra', 'S2', '2025-08-22 23:49:45', '2025-08-25 08:18:32'),
(11, 'Lupik', 'S2', '2025-08-25 09:06:18', '2025-08-27 05:30:45');

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan_dana`
--

CREATE TABLE `penggunaan_dana` (
  `id_penggunaan_dana` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis_penggunaan` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `penggunaan_dana`
--

INSERT INTO `penggunaan_dana` (`id_penggunaan_dana`, `id_tahun`, `jenis_penggunaan`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2024, 'Penelitian Dosen', 120000000, 'https://drive.example.com/penggunaan.pdf', '2025-08-22 01:26:54', '2025-08-22 01:26:54', NULL, NULL),
(2, 2025, 'Operasional', 1000000, 'link', '2025-08-22 06:57:15', '2025-08-22 06:57:15', NULL, NULL),
(3, 2023, 'Pengembangan', 30000000, 'link', '2025-08-22 06:57:37', '2025-08-22 06:57:37', NULL, NULL),
(4, 2025, 'Mangan Bakso', 1000000, 'link', '2025-08-22 07:36:16', '2025-08-22 07:36:16', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pimpinan_upps_ps`
--

CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int NOT NULL,
  `id_unit` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `id_jabatan` int NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `tupoksi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pimpinan_upps_ps`
--

INSERT INTO `pimpinan_upps_ps` (`id_pimpinan`, `id_unit`, `id_pegawai`, `id_jabatan`, `periode_mulai`, `periode_selesai`, `tupoksi`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 1, 2, '2023-01-01', '2027-12-31', 'Bertanggung jawab atas bidang akademik.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 7, 2, 5, '2024-08-01', '2028-07-31', 'Mengelola kegiatan akademik dan operasional Program Studi Informatika.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(4, 5, 4, 4, '2024-12-29', '2025-12-29', 'mangan bakso', '2025-08-22 10:32:01', '2025-08-22 10:32:01', NULL, NULL),
(5, 9, 5, 5, '2024-10-11', '2029-10-11', 'afzsshayskiqsj', '2025-08-22 10:34:13', '2025-08-22 10:34:59', NULL, NULL),
(6, 1, 10, 4, '2032-12-29', '2033-12-29', 'Mangan baksoo', '2025-08-22 23:52:54', '2025-08-23 01:12:48', '2025-08-23 08:12:48', 1),
(7, 1, 10, 4, '2023-12-22', '2024-12-22', 'Mangan AFC', '2025-08-25 08:19:13', '2025-08-25 08:19:13', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `profil_lulusan`
--

CREATE TABLE `profil_lulusan` (
  `id_pl` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_pl` varchar(20) NOT NULL,
  `deskripsi_pl` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `profil_lulusan`
--

INSERT INTO `profil_lulusan` (`id_pl`, `id_unit_prodi`, `kode_pl`, `deskripsi_pl`) VALUES
(101, 4, 'PL-TI-01', 'Software Engineer / Developer'),
(102, 4, 'PL-TI-02', 'Data Scientist / Analyst'),
(103, 4, 'PL-TI-03', 'Network & Security Administrator'),
(104, 5, 'PL-MI-01', 'System Analyst'),
(105, 5, 'PL-MI-02', 'Database Administrator'),
(106, 5, 'PL-MI-03', 'IT Project Manager'),
(117, 4, 'PL-TI-04', 'Mangan Gedang'),
(118, 4, 'PL-TI-05', 'Minum Air'),
(119, 5, 'PL-MI-04', 'Minum Es'),
(120, 5, 'PL-MI-05', 'Makan Lontong');

-- --------------------------------------------------------

--
-- Table structure for table `ref_jabatan_fungsional`
--

CREATE TABLE `ref_jabatan_fungsional` (
  `id_jafung` int NOT NULL,
  `nama_jafung` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_jabatan_fungsional`
--

INSERT INTO `ref_jabatan_fungsional` (`id_jafung`, `nama_jafung`) VALUES
(1, 'Asisten Ahli'),
(2, 'Lektor'),
(3, 'Lektor Kepala'),
(4, 'Guru Besar (Profesor)');

-- --------------------------------------------------------

--
-- Table structure for table `ref_jabatan_struktural`
--

CREATE TABLE `ref_jabatan_struktural` (
  `id_jabatan` int NOT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `sks_beban` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_jabatan_struktural`
--

INSERT INTO `ref_jabatan_struktural` (`id_jabatan`, `nama_jabatan`, `sks_beban`) VALUES
(1, 'Ketua STIKOM', 12),
(2, 'Wakil Ketua I', 10),
(3, 'Wakil Ketua II', 10),
(4, 'Kepala LPPM', 8),
(5, 'Ketua Program Studi', 4);

-- --------------------------------------------------------

--
-- Table structure for table `ref_kabupaten_kota`
--

CREATE TABLE `ref_kabupaten_kota` (
  `id_kabupaten_kota` int NOT NULL,
  `id_provinsi` int NOT NULL,
  `nama_kabupaten_kota` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_kabupaten_kota`
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
(1405, 14, 'KABUPATEN SIAK'),
(1406, 14, 'KABUPATEN KAMPAR'),
(1407, 14, 'KABUPATEN ROKAN HULU'),
(1408, 14, 'KABUPATEN BENGKALIS'),
(1409, 14, 'KABUPATEN ROKAN HILIR'),
(1410, 14, 'KABUPATEN KEPULAUAN MERANTI'),
(1471, 14, 'KOTA PEKANBARU'),
(1473, 14, 'KOTA DUMAI'),
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
(2171, 21, 'KOTA BATAM'),
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
-- Table structure for table `ref_provinsi`
--

CREATE TABLE `ref_provinsi` (
  `id_provinsi` int NOT NULL,
  `nama_provinsi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_provinsi`
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
(96, 'PAPUA BARAT DAYA');

-- --------------------------------------------------------

--
-- Table structure for table `sumber_pendanaan`
--

CREATE TABLE `sumber_pendanaan` (
  `id_sumber` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sumber_dana` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sumber_pendanaan`
--

INSERT INTO `sumber_pendanaan` (`id_sumber`, `id_tahun`, `sumber_dana`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(10, 2025, 'SLOT1', 1000000, 'link', '2025-08-22 06:18:43', '2025-08-22 06:18:43', NULL, NULL),
(11, 2024, 'SLOT2', 2000000, 'LINK', '2025-08-22 06:19:09', '2025-08-22 06:19:09', NULL, NULL),
(12, 2023, 'SLOT3', 3000000, 'LINK', '2025-08-22 06:19:29', '2025-08-22 06:19:29', NULL, NULL),
(13, 2022, 'SLOT4', 3000000, 'LINK', '2025-08-22 06:20:00', '2025-08-22 06:20:00', NULL, NULL),
(16, 2025, 'SLOT1', 3000000, 'HGJHGJH', '2025-08-22 06:39:35', '2025-08-22 06:39:35', NULL, NULL),
(17, 2026, 'SLOT1', 3000000, 'BVCBGFGF', '2025-08-22 06:40:08', '2025-08-22 06:40:08', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a1_mahasiswa_baru_aktif`
--

CREATE TABLE `tabel_2a1_mahasiswa_baru_aktif` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `daya_tampung` int NOT NULL DEFAULT '0',
  `jenis` enum('baru','aktif') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jalur` enum('reguler','rpl') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jumlah_diterima` int DEFAULT '0',
  `jumlah_afirmasi` int DEFAULT '0',
  `jumlah_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a1_mahasiswa_baru_aktif`
--

INSERT INTO `tabel_2a1_mahasiswa_baru_aktif` (`id`, `id_unit_prodi`, `id_tahun`, `daya_tampung`, `jenis`, `jalur`, `jumlah_diterima`, `jumlah_afirmasi`, `jumlah_kebutuhan_khusus`, `created_at`, `updated_at`) VALUES
(20, 2, 2025, 100, 'baru', 'reguler', 10, 10, 10, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(21, 2, 2025, 100, 'baru', 'rpl', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(22, 2, 2025, 100, 'aktif', 'reguler', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(23, 2, 2025, 100, 'aktif', 'rpl', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a1_pendaftaran`
--

CREATE TABLE `tabel_2a1_pendaftaran` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `pendaftar` int DEFAULT '0',
  `pendaftar_afirmasi` int DEFAULT '0',
  `pendaftar_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a1_pendaftaran`
--

INSERT INTO `tabel_2a1_pendaftaran` (`id`, `id_unit_prodi`, `id_tahun`, `pendaftar`, `pendaftar_afirmasi`, `pendaftar_kebutuhan_khusus`, `created_at`, `updated_at`) VALUES
(10, 2, 2025, 40, 45, 15, '2025-09-16 06:52:55', '2025-09-16 06:53:16');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a2_keragaman_asal`
--

CREATE TABLE `tabel_2a2_keragaman_asal` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `nama_daerah_input` varchar(255) NOT NULL,
  `kategori_geografis` enum('Sama Kota/Kab','Kota/Kab Lain','Provinsi Lain','Negara Lain') NOT NULL,
  `is_afirmasi` tinyint(1) NOT NULL DEFAULT '0',
  `is_kebutuhan_khusus` tinyint(1) NOT NULL DEFAULT '0',
  `jumlah_mahasiswa` int DEFAULT '0',
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a2_keragaman_asal`
--

INSERT INTO `tabel_2a2_keragaman_asal` (`id`, `id_unit_prodi`, `id_tahun`, `nama_daerah_input`, `kategori_geografis`, `is_afirmasi`, `is_kebutuhan_khusus`, `jumlah_mahasiswa`, `link_bukti`, `created_at`, `updated_at`) VALUES
(25, 2, 2025, 'KABUPATEN BANYUWANGI', 'Sama Kota/Kab', 0, 0, 200, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:55:03', '2025-09-23 08:55:03'),
(26, 2, 2025, 'KABUPATEN JEMBER', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:55:25', '2025-09-23 08:55:25'),
(27, 2, 2025, 'KOTA YOGYAKARTA', 'Kota/Kab Lain', 0, 0, 50, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:56:04', '2025-09-23 08:56:04'),
(28, 2, 2025, 'KABUPATEN BANTUL', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:57:38', '2025-09-23 08:57:38'),
(29, 2, 2025, 'JEPANG', 'Negara Lain', 0, 0, 1, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:58:09', '2025-09-23 08:58:09'),
(30, 2, 2025, 'KABUPATEN SEMARANG', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 09:00:47', '2025-09-23 09:00:47'),
(31, 2, 2025, 'KABUPATEN KLATEN', 'Kota/Kab Lain', 0, 0, 10, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 09:01:00', '2025-09-23 09:01:00'),
(48, 2, 2025, 'KABUPATEN JEMBER', 'Kota/Kab Lain', 1, 0, 10, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-29 03:56:40', '2025-09-29 03:56:40'),
(49, 2, 2025, 'KABUPATEN ACEH JAYA', 'Kota/Kab Lain', 0, 1, 2, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-29 03:56:55', '2025-09-29 03:56:55');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a3_kondisi_mahasiswa`
--

CREATE TABLE `tabel_2a3_kondisi_mahasiswa` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jml_lulus` int DEFAULT '0',
  `jml_do` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a3_kondisi_mahasiswa`
--

INSERT INTO `tabel_2a3_kondisi_mahasiswa` (`id`, `id_unit_prodi`, `id_tahun`, `jml_lulus`, `jml_do`) VALUES
(3, 2, 2025, 3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b4_masa_tunggu`
--

CREATE TABLE `tabel_2b4_masa_tunggu` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jumlah_lulusan` int DEFAULT '0',
  `jumlah_terlacak` int DEFAULT '0',
  `rata_rata_waktu_tunggu_bulan` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b5_kesesuaian_kerja`
--

CREATE TABLE `tabel_2b5_kesesuaian_kerja` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jumlah_lulusan` int DEFAULT '0',
  `jumlah_terlacak` int DEFAULT '0',
  `jml_infokom` int DEFAULT '0',
  `jml_non_infokom` int DEFAULT '0',
  `jml_internasional` int DEFAULT '0',
  `jml_nasional` int DEFAULT '0',
  `jml_wirausaha` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b6_kepuasan_pengguna`
--

CREATE TABLE `tabel_2b6_kepuasan_pengguna` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis_kemampuan` varchar(255) NOT NULL,
  `persen_sangat_baik` float DEFAULT '0',
  `persen_baik` float DEFAULT '0',
  `persen_cukup` float DEFAULT '0',
  `persen_kurang` float DEFAULT '0',
  `rencana_tindak_lanjut` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b6_rekap_jumlah`
--

CREATE TABLE `tabel_2b6_rekap_jumlah` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jumlah_alumni_3_tahun` int DEFAULT '0',
  `jumlah_pengguna_responden` int DEFAULT '0',
  `jumlah_mahasiswa_aktif_ts` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2c_pembelajaran_luar_prodi`
--

CREATE TABLE `tabel_2c_pembelajaran_luar_prodi` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `bentuk_pembelajaran` varchar(255) NOT NULL,
  `jumlah_mahasiswa` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2d_rekognisi_lulusan`
--

CREATE TABLE `tabel_2d_rekognisi_lulusan` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sumber_rekognisi` varchar(255) NOT NULL,
  `jumlah_rekognisi` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tahun_akademik`
--

CREATE TABLE `tahun_akademik` (
  `id_tahun` int NOT NULL,
  `tahun` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tahun_akademik`
--

INSERT INTO `tahun_akademik` (`id_tahun`, `tahun`) VALUES
(2020, '2020/2021'),
(2021, '2021/2022'),
(2022, '2022/2023'),
(2023, '2023/2024'),
(2024, '2024/2025'),
(2025, '2025/2026'),
(2026, '2026/2027'),
(2027, '2027/2028'),
(2028, '2028/2029'),
(2029, '2029/2030'),
(2030, '2030/2031'),
(2031, '2031/2032'),
(2032, '2032/2033'),
(2033, '2033/2034'),
(2034, '2034/2035'),
(2035, '2035/2036'),
(2036, '2036/2037'),
(2037, '2037/2038'),
(2038, '2038/2039'),
(2039, '2039/2040'),
(2040, '2040/2041'),
(2041, '2041/2042'),
(2042, '2042/2043'),
(2043, '2043/2044'),
(2044, '2044/2045'),
(2045, '2045/2046'),
(2046, '2046/2047'),
(2047, '2047/2048'),
(2048, '2048/2049'),
(2049, '2049/2050'),
(2050, '2050/2051'),
(2051, '2051/2052'),
(2052, '2052/2053'),
(2053, '2053/2054'),
(2054, '2054/2055'),
(2055, '2055/2056'),
(2056, '2056/2057'),
(2057, '2057/2058'),
(2058, '2058/2059'),
(2059, '2059/2060'),
(2060, '2060/2061'),
(2061, '2061/2062'),
(2062, '2062/2063'),
(2063, '2063/2064'),
(2064, '2064/2065'),
(2065, '2065/2066'),
(2066, '2066/2067'),
(2067, '2067/2068'),
(2068, '2068/2069'),
(2069, '2069/2070'),
(2070, '2070/2071'),
(2071, '2071/2072'),
(2072, '2072/2073'),
(2073, '2073/2074'),
(2074, '2074/2075'),
(2075, '2075/2076'),
(2076, '2076/2077'),
(2077, '2077/2078'),
(2078, '2078/2079'),
(2079, '2079/2080'),
(2080, '2080/2081'),
(2081, '2081/2082'),
(2082, '2082/2083'),
(2083, '2083/2084'),
(2084, '2084/2085'),
(2085, '2085/2086'),
(2086, '2086/2087'),
(2087, '2087/2088'),
(2088, '2088/2089'),
(2089, '2089/2090'),
(2090, '2090/2091'),
(2091, '2091/2092'),
(2092, '2092/2093'),
(2093, '2093/2094'),
(2094, '2094/2095'),
(2095, '2095/2096'),
(2096, '2096/2097'),
(2097, '2097/2098'),
(2098, '2098/2099'),
(2099, '2099/2100'),
(2100, '2100/2101');

-- --------------------------------------------------------

--
-- Table structure for table `tenaga_kependidikan`
--

CREATE TABLE `tenaga_kependidikan` (
  `id_tendik` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `jenis_tendik` varchar(100) DEFAULT NULL,
  `nikp` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tenaga_kependidikan`
--

INSERT INTO `tenaga_kependidikan` (`id_tendik`, `id_pegawai`, `jenis_tendik`, `nikp`, `created_at`, `updated_at`) VALUES
(1, 4, 'PUSTAKAWAN', 'KEP001', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(2, 5, 'Laboran/Teknisi', 'KEP002', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(3, 6, 'Administrasi', 'KEP003', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(4, 7, 'TUKANG TAMBAL BAN', 'KEP004', '2025-08-21 23:54:41', '2025-08-22 09:51:26');

-- --------------------------------------------------------

--
-- Table structure for table `unit_kerja`
--

CREATE TABLE `unit_kerja` (
  `id_unit` int NOT NULL,
  `nama_unit` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `unit_kerja`
--

INSERT INTO `unit_kerja` (`id_unit`, `nama_unit`) VALUES
(1, 'Ketua STIKOM'),
(2, 'Wakil Ketua I'),
(3, 'Wakil Ketua II '),
(4, 'Prodi TI'),
(5, 'Prodi MI'),
(6, 'ALA'),
(7, 'PMB'),
(8, 'Kemahasiswaan'),
(9, 'TPM'),
(10, 'Kepegawaian'),
(11, 'Sarpras');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_unit` int DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `id_pegawai`, `username`, `password`, `id_unit`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'waket1', '$2a$10$i2r/hCf8VW2uqqrGWDKk7Op0UZJGPY0pZrv/8q/gJe79gvYKxESA2', 2, 'waket-1', 1, '2025-08-21 23:54:41', '2025-08-21 23:59:37'),
(2, 3, 'waket2', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 3, 'waket-2', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 8, 'lppm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 4, 'lppm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 5, 'kepegawaian_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 6, 'kepegawaian', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(6, 7, 'tpm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 5, 'tpm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(7, 1, 'prodi_TI', '$2a$10$i2r/hCf8VW2uqqrGWDKk7Op0UZJGPY0pZrv/8q/gJe79gvYKxESA2', 4, 'prodi-ti', 1, '2025-08-28 04:36:24', '2025-08-28 04:45:18'),
(8, 1, 'prodi_MI', '123', 5, 'prodi-mi', 1, '2025-08-28 04:36:24', '2025-08-28 04:36:24'),
(9, 1, 'ALA', '123', 6, 'ALA', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52'),
(10, 2, 'PMB', '123', 7, 'PMB', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52'),
(11, 3, 'kepegawaian', '123', 8, 'kemahasiswaan', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD PRIMARY KEY (`id_ami`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD PRIMARY KEY (`id_beban_kerja`),
  ADD UNIQUE KEY `unik_dosen_tahun` (`id_dosen`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `cpl`
--
ALTER TABLE `cpl`
  ADD PRIMARY KEY (`id_cpl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD PRIMARY KEY (`id_cpmk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id_dosen`),
  ADD UNIQUE KEY `nidn` (`nidn`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jafung` (`id_jafung`);

--
-- Indexes for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD PRIMARY KEY (`id_kualifikasi`),
  ADD KEY `id_tendik` (`id_tendik`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `kurikulum`
--
ALTER TABLE `kurikulum`
  ADD PRIMARY KEY (`id_kurikulum`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `map_cpl_mk`
--
ALTER TABLE `map_cpl_mk`
  ADD PRIMARY KEY (`id_cpl`,`id_mk`),
  ADD KEY `id_mk` (`id_mk`);

--
-- Indexes for table `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD PRIMARY KEY (`id_cpl`,`id_pl`),
  ADD KEY `id_pl` (`id_pl`);

--
-- Indexes for table `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD PRIMARY KEY (`id_cpmk`,`id_cpl`),
  ADD KEY `id_cpl` (`id_cpl`);

--
-- Indexes for table `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD PRIMARY KEY (`id_cpmk`,`id_mk`),
  ADD KEY `id_mk` (`id_mk`);

--
-- Indexes for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id_mk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id_pegawai`);

--
-- Indexes for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD PRIMARY KEY (`id_penggunaan_dana`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD PRIMARY KEY (`id_pimpinan`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jabatan` (`id_jabatan`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD PRIMARY KEY (`id_pl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  ADD PRIMARY KEY (`id_jafung`);

--
-- Indexes for table `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  ADD PRIMARY KEY (`id_jabatan`);

--
-- Indexes for table `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD PRIMARY KEY (`id_kabupaten_kota`),
  ADD KEY `id_provinsi` (`id_provinsi`);

--
-- Indexes for table `ref_provinsi`
--
ALTER TABLE `ref_provinsi`
  ADD PRIMARY KEY (`id_provinsi`);

--
-- Indexes for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD PRIMARY KEY (`id_sumber`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_unit_prodi` (`id_unit_prodi`),
  ADD KEY `idx_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_pendaftaran` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kondisi` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_tunggu` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indexes for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kerja` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indexes for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kepuasan` (`id_unit_prodi`,`id_tahun`,`jenis_kemampuan`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_rekap_jumlah` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_pembelajaran` (`id_unit_prodi`,`id_tahun`,`bentuk_pembelajaran`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_rekognisi` (`id_unit_prodi`,`id_tahun`,`sumber_rekognisi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tahun_akademik`
--
ALTER TABLE `tahun_akademik`
  ADD PRIMARY KEY (`id_tahun`);

--
-- Indexes for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD PRIMARY KEY (`id_tendik`),
  ADD UNIQUE KEY `nikp` (`nikp`),
  ADD KEY `id_pegawai` (`id_pegawai`);

--
-- Indexes for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  ADD PRIMARY KEY (`id_unit`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_unit` (`id_unit`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  MODIFY `id_ami` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cpl`
--
ALTER TABLE `cpl`
  MODIFY `id_cpl` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

--
-- AUTO_INCREMENT for table `cpmk`
--
ALTER TABLE `cpmk`
  MODIFY `id_cpmk` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  MODIFY `id_kualifikasi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kurikulum`
--
ALTER TABLE `kurikulum`
  MODIFY `id_kurikulum` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id_mk` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  MODIFY `id_pl` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  MODIFY `id_jafung` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  MODIFY `id_jabatan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  MODIFY `id_sumber` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  MODIFY `id_tendik` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  MODIFY `id_unit` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD CONSTRAINT `audit_mutu_internal_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `audit_mutu_internal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_1` FOREIGN KEY (`id_dosen`) REFERENCES `dosen` (`id_dosen`),
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `cpl`
--
ALTER TABLE `cpl`
  ADD CONSTRAINT `cpl_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD CONSTRAINT `cpmk_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`) ON DELETE SET NULL;

--
-- Constraints for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_1` FOREIGN KEY (`id_tendik`) REFERENCES `tenaga_kependidikan` (`id_tendik`),
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Constraints for table `kurikulum`
--
ALTER TABLE `kurikulum`
  ADD CONSTRAINT `kurikulum_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Constraints for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `map_cpl_mk`
--
ALTER TABLE `map_cpl_mk`
  ADD CONSTRAINT `map_cpl_mk_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpl_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD CONSTRAINT `map_cpl_pl_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpl_pl_ibfk_2` FOREIGN KEY (`id_pl`) REFERENCES `profil_lulusan` (`id_pl`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_2` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD CONSTRAINT `map_cpmk_mk_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE;

--
-- Constraints for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD CONSTRAINT `penggunaan_dana_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_3` FOREIGN KEY (`id_jabatan`) REFERENCES `ref_jabatan_struktural` (`id_jabatan`);

--
-- Constraints for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD CONSTRAINT `profil_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD CONSTRAINT `ref_kabupaten_kota_ibfk_1` FOREIGN KEY (`id_provinsi`) REFERENCES `ref_provinsi` (`id_provinsi`);

--
-- Constraints for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  ADD CONSTRAINT `tabel_2b6_rekap_jumlah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b6_rekap_jumlah_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  ADD CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  ADD CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD CONSTRAINT `tenaga_kependidikan_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 16, 2025 at 07:41 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.22

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
-- Table structure for table `audit_mutu_internal`
--

CREATE TABLE `audit_mutu_internal` (
  `id_ami` int NOT NULL,
  `id_unit` int NOT NULL,
  `id_tahun` int NOT NULL,
  `frekuensi_audit` int DEFAULT NULL,
  `dokumen_spmi` text,
  `laporan_audit_url` text,
  `bukti_certified_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `jumlah_auditor_certified` int DEFAULT NULL,
  `jumlah_auditor_noncertified` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_mutu_internal`
--

INSERT INTO `audit_mutu_internal` (`id_ami`, `id_unit`, `id_tahun`, `frekuensi_audit`, `dokumen_spmi`, `laporan_audit_url`, `bukti_certified_url`, `jumlah_auditor_certified`, `jumlah_auditor_noncertified`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(5, 9, 2023, 12, 'ini dokumen', 'ini laporan', 'ini url', 12, 13, '2025-08-22 23:46:22', '2025-08-28 03:24:10', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `beban_kerja_dosen`
--

CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int NOT NULL,
  `id_dosen` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sks_pengajaran` float DEFAULT '0',
  `sks_penelitian` float DEFAULT '0',
  `sks_pkm` float DEFAULT '0',
  `sks_manajemen` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `beban_kerja_dosen`
--

INSERT INTO `beban_kerja_dosen` (`id_beban_kerja`, `id_dosen`, `id_tahun`, `sks_pengajaran`, `sks_penelitian`, `sks_pkm`, `sks_manajemen`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(9, 1, 2020, 3, 1, 1, 2.5, '2025-08-23 03:48:17', '2025-08-23 03:53:14', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cpl`
--

CREATE TABLE `cpl` (
  `id_cpl` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_cpl` varchar(20) NOT NULL,
  `deskripsi_cpl` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cpl`
--

INSERT INTO `cpl` (`id_cpl`, `id_unit_prodi`, `kode_cpl`, `deskripsi_cpl`) VALUES
(201, 4, 'CPL-TI-S1', 'Mampu menerapkan prinsip-prinsip etika dan profesionalisme dalam bidang informatika.'),
(202, 4, 'CPL-TI-K1', 'Mampu merancang, mengimplementasikan, dan mengevaluasi solusi perangkat lunak menggunakan algoritma dan struktur data yang efisien.'),
(203, 4, 'CPL-TI-K2', 'Mampu merancang dan mengelola basis data serta sistem informasi untuk berbagai kebutuhan.'),
(204, 4, 'CPL-TI-K3', 'Mampu menganalisis dan merancang infrastruktur jaringan komputer yang aman dan andal.'),
(205, 5, 'CPL-MI-S1', 'Menunjukkan sikap profesional dan etika kerja dalam pengelolaan sistem informasi.'),
(206, 5, 'CPL-MI-K1', 'Mampu menganalisis kebutuhan sistem dan merancang solusi sistem informasi untuk organisasi.'),
(207, 5, 'CPL-MI-K2', 'Mampu merancang, mengimplementasikan, dan melakukan administrasi basis data.'),
(208, 5, 'CPL-MI-K3', 'Mampu mengelola proyek pengembangan sistem informasi secara efektif dan efisiensi.'),
(215, 5, 'CPL-MI-K4', 'Memasak Nasi Jagung'),
(216, 4, 'CPL-TI-06', 'Makan Nasi');

-- --------------------------------------------------------

--
-- Table structure for table `cpmk`
--

CREATE TABLE `cpmk` (
  `id_cpmk` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_cpmk` varchar(20) NOT NULL,
  `deskripsi_cpmk` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cpmk`
--

INSERT INTO `cpmk` (`id_cpmk`, `id_unit_prodi`, `kode_cpmk`, `deskripsi_cpmk`, `deleted_at`, `deleted_by`) VALUES
(1, 4, 'CPMK-TI-01', 'Mahasiswa mampu merancang algoritma dan struktur data dengan efisien.', NULL, NULL),
(2, 4, 'CPMK-TI-02', 'Mahasiswa mampu mengembangkan aplikasi berbasis web menggunakan framework modern.', NULL, NULL),
(3, 4, 'CPMK-TI-03', 'Mahasiswa mampu menerapkan prinsip keamanan informasi dalam sistem.', NULL, NULL),
(4, 5, 'CPMK-MI-01', 'Mahasiswa mampu melakukan analisis sistem informasi sederhana.', NULL, NULL),
(5, 5, 'CPMK-MI-02', 'Mahasiswa mampu mengelola basis data dan membuat laporan menggunakan SQL.', NULL, NULL),
(6, 5, 'CPMK-MI-03', 'Mahasiswa mampu mengembangkan aplikasi bisnis sederhana menggunakan spreadsheet.', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id_dosen` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `nidn` varchar(20) DEFAULT NULL,
  `nuptk` varchar(20) DEFAULT NULL,
  `homebase` varchar(50) DEFAULT NULL,
  `pt` varchar(100) DEFAULT NULL,
  `id_jafung` int DEFAULT NULL,
  `beban_sks` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id_dosen`, `id_pegawai`, `nidn`, `nuptk`, `homebase`, `pt`, `id_jafung`, `beban_sks`, `created_at`, `updated_at`) VALUES
(1, 1, '0011223301', NULL, NULL, NULL, 3, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(2, 2, '0022334402', NULL, NULL, NULL, 2, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(3, 3, '0033445503', NULL, NULL, NULL, 4, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 8, '0044556604', '172839437291829382', 'Manajemen Informatika', 'STIKOM Banyuwangi', 1, 5.3, '2025-08-21 23:54:41', '2025-08-22 23:55:03'),
(6, 10, '001123102130', '1234567890987654', 'Teknik Informatika', 'STIKOM Banyuwangi', 3, 10.5, '2025-08-22 23:50:41', '2025-08-22 23:50:41'),
(7, 11, '087', '806', 'Manajemen Informatika', 'STIKOM', 2, 3, '2025-08-25 09:08:14', '2025-08-25 09:08:14'),
(8, 9, '0123', '01234', 'Manajemen Informatika', 'STIKOM PGRI Banyuwangi', NULL, 3.5, '2025-08-26 06:36:24', '2025-08-26 06:36:33');

-- --------------------------------------------------------

--
-- Table structure for table `kualifikasi_tendik`
--

CREATE TABLE `kualifikasi_tendik` (
  `id_kualifikasi` int NOT NULL,
  `id_tendik` int NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `id_unit` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kualifikasi_tendik`
--

INSERT INTO `kualifikasi_tendik` (`id_kualifikasi`, `id_tendik`, `jenjang_pendidikan`, `id_unit`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'S1', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 2, 'S1', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(3, 3, 'D3', 7, '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `kurikulum`
--

CREATE TABLE `kurikulum` (
  `id_kurikulum` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `nama_kurikulum` varchar(255) NOT NULL,
  `tahun_mulai_berlaku` year NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kurikulum`
--

INSERT INTO `kurikulum` (`id_kurikulum`, `id_unit_prodi`, `nama_kurikulum`, `tahun_mulai_berlaku`) VALUES
(1, 4, 'Kurikulum 2020 Merdeka Belajar TI', 2020),
(2, 4, 'Kurikulum 2024 Outcome-Based Education (OBE) TI', 2024),
(3, 5, 'Kurikulum 2021 Vokasi Terapan MI', 2021);

-- --------------------------------------------------------

--
-- Table structure for table `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id_log` bigint NOT NULL,
  `id_user` int DEFAULT NULL,
  `aksi` varchar(50) NOT NULL,
  `nama_tabel` varchar(100) DEFAULT NULL,
  `id_record` int DEFAULT NULL,
  `waktu_aksi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `detail_perubahan` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `map_cpl_mk`
--

CREATE TABLE `map_cpl_mk` (
  `id_cpl` int NOT NULL,
  `id_mk` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpl_mk`
--

INSERT INTO `map_cpl_mk` (`id_cpl`, `id_mk`) VALUES
(216, 304),
(202, 305),
(203, 305),
(204, 305),
(206, 308),
(207, 308),
(206, 309),
(207, 309),
(208, 309),
(216, 310),
(206, 311),
(207, 311),
(208, 311),
(215, 311),
(202, 312),
(203, 312),
(204, 312),
(216, 312);

-- --------------------------------------------------------

--
-- Table structure for table `map_cpl_pl`
--

CREATE TABLE `map_cpl_pl` (
  `id_cpl` int NOT NULL,
  `id_pl` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpl_pl`
--

INSERT INTO `map_cpl_pl` (`id_cpl`, `id_pl`) VALUES
(202, 101),
(203, 101),
(203, 102),
(204, 103),
(206, 104),
(215, 104),
(207, 105),
(215, 105),
(208, 106),
(215, 106),
(216, 117),
(216, 118),
(215, 119),
(215, 120);

-- --------------------------------------------------------

--
-- Table structure for table `map_cpmk_cpl`
--

CREATE TABLE `map_cpmk_cpl` (
  `id_cpmk` int NOT NULL,
  `id_cpl` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `map_cpmk_mk`
--

CREATE TABLE `map_cpmk_mk` (
  `id_cpmk` int NOT NULL,
  `id_mk` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `map_cpmk_mk`
--

INSERT INTO `map_cpmk_mk` (`id_cpmk`, `id_mk`) VALUES
(1, 301),
(1, 302),
(2, 303),
(2, 304),
(3, 305),
(4, 306),
(4, 307),
(5, 308),
(6, 309),
(3, 310);

-- --------------------------------------------------------

--
-- Table structure for table `mata_kuliah`
--

CREATE TABLE `mata_kuliah` (
  `id_mk` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_mk` varchar(20) NOT NULL,
  `nama_mk` varchar(255) NOT NULL,
  `sks` int NOT NULL,
  `semester` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mata_kuliah`
--

INSERT INTO `mata_kuliah` (`id_mk`, `id_unit_prodi`, `kode_mk`, `nama_mk`, `sks`, `semester`) VALUES
(301, 4, 'TI001', 'Algoritma & Pemrograman', 4, 1),
(302, 4, 'TI002', 'Struktur Data', 3, 2),
(303, 4, 'TI003', 'Basis Data', 3, 3),
(304, 4, 'TI004', 'Jaringan Komputer', 3, 4),
(305, 4, 'TI005', 'Keamanan Informasi', 3, 5),
(306, 5, 'MI001', 'Dasar-Dasar Pemrograman', 4, 1),
(307, 5, 'MI002', 'Analisis & Perancangan Sistem', 4, 2),
(308, 5, 'MI003', 'Administrasi Basis Data', 3, 3),
(309, 5, 'MI004', 'Manajemen Proyek TI', 3, 4),
(310, 4, 'MI005', 'Etika Profesi TI', 2, 5),
(311, 5, 'GEN-1760083991622', 'Mie Ayam', 3, 1),
(312, 4, 'GEN-1760327717951', 'Sego Goreng', 4, 2);

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id_pegawai` int NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id_pegawai`, `nama_lengkap`, `pendidikan_terakhir`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Budi Santoso, M.Kom.', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(2, 'Citra Lestari, S.Kom., M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(3, 'Prof. Dr. Eka Pratama', 'S3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 'Ani Wijaya, S.E.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 'Dedi Firmansyah, S.Kom.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(6, 'Fajar Nugroho, A.Md.', 'D3', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(7, 'Gita Permata, S.Sos.', 'S1', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(8, 'Hendra Gunawan, M.T.', 'S2', '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(9, 'fufufafa', 'S2', '2025-08-22 16:45:03', '2025-08-22 16:46:32'),
(10, 'Dandi Ajusta Dharma Putra Samudra', 'S2', '2025-08-22 23:49:45', '2025-08-25 08:18:32'),
(11, 'Lupik', 'S2', '2025-08-25 09:06:18', '2025-08-27 05:30:45');

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan_dana`
--

CREATE TABLE `penggunaan_dana` (
  `id_penggunaan_dana` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis_penggunaan` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `penggunaan_dana`
--

INSERT INTO `penggunaan_dana` (`id_penggunaan_dana`, `id_tahun`, `jenis_penggunaan`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2024, 'Penelitian Dosen', 120000000, 'https://drive.example.com/penggunaan.pdf', '2025-08-22 01:26:54', '2025-08-22 01:26:54', NULL, NULL),
(2, 2025, 'Operasional', 1000000, 'link', '2025-08-22 06:57:15', '2025-08-22 06:57:15', NULL, NULL),
(3, 2023, 'Pengembangan', 30000000, 'link', '2025-08-22 06:57:37', '2025-08-22 06:57:37', NULL, NULL),
(4, 2025, 'Mangan Bakso', 1000000, 'link', '2025-08-22 07:36:16', '2025-08-22 07:36:16', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pimpinan_upps_ps`
--

CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int NOT NULL,
  `id_unit` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `id_jabatan` int NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `tupoksi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pimpinan_upps_ps`
--

INSERT INTO `pimpinan_upps_ps` (`id_pimpinan`, `id_unit`, `id_pegawai`, `id_jabatan`, `periode_mulai`, `periode_selesai`, `tupoksi`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 1, 2, '2023-01-01', '2027-12-31', 'Bertanggung jawab atas bidang akademik.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(2, 7, 2, 5, '2024-08-01', '2028-07-31', 'Mengelola kegiatan akademik dan operasional Program Studi Informatika.', '2025-08-21 23:54:41', '2025-08-21 23:54:41', NULL, NULL),
(4, 5, 4, 4, '2024-12-29', '2025-12-29', 'mangan bakso', '2025-08-22 10:32:01', '2025-08-22 10:32:01', NULL, NULL),
(5, 9, 5, 5, '2024-10-11', '2029-10-11', 'afzsshayskiqsj', '2025-08-22 10:34:13', '2025-08-22 10:34:59', NULL, NULL),
(6, 1, 10, 4, '2032-12-29', '2033-12-29', 'Mangan baksoo', '2025-08-22 23:52:54', '2025-08-23 01:12:48', '2025-08-23 08:12:48', 1),
(7, 1, 10, 4, '2023-12-22', '2024-12-22', 'Mangan AFC', '2025-08-25 08:19:13', '2025-08-25 08:19:13', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `profil_lulusan`
--

CREATE TABLE `profil_lulusan` (
  `id_pl` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `kode_pl` varchar(20) NOT NULL,
  `deskripsi_pl` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `profil_lulusan`
--

INSERT INTO `profil_lulusan` (`id_pl`, `id_unit_prodi`, `kode_pl`, `deskripsi_pl`) VALUES
(101, 4, 'PL-TI-01', 'Software Engineer / Developer'),
(102, 4, 'PL-TI-02', 'Data Scientist / Analyst'),
(103, 4, 'PL-TI-03', 'Network & Security Administrator'),
(104, 5, 'PL-MI-01', 'System Analyst'),
(105, 5, 'PL-MI-02', 'Database Administrator'),
(106, 5, 'PL-MI-03', 'IT Project Manager'),
(117, 4, 'PL-TI-04', 'Mangan Gedang'),
(118, 4, 'PL-TI-05', 'Minum Air'),
(119, 5, 'PL-MI-04', 'Minum Es'),
(120, 5, 'PL-MI-05', 'Makan Lontong');

-- --------------------------------------------------------

--
-- Table structure for table `ref_jabatan_fungsional`
--

CREATE TABLE `ref_jabatan_fungsional` (
  `id_jafung` int NOT NULL,
  `nama_jafung` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_jabatan_fungsional`
--

INSERT INTO `ref_jabatan_fungsional` (`id_jafung`, `nama_jafung`) VALUES
(1, 'Asisten Ahli'),
(2, 'Lektor'),
(3, 'Lektor Kepala'),
(4, 'Guru Besar (Profesor)');

-- --------------------------------------------------------

--
-- Table structure for table `ref_jabatan_struktural`
--

CREATE TABLE `ref_jabatan_struktural` (
  `id_jabatan` int NOT NULL,
  `nama_jabatan` varchar(100) NOT NULL,
  `sks_beban` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_jabatan_struktural`
--

INSERT INTO `ref_jabatan_struktural` (`id_jabatan`, `nama_jabatan`, `sks_beban`) VALUES
(1, 'Ketua STIKOM', 12),
(2, 'Wakil Ketua I', 10),
(3, 'Wakil Ketua II', 10),
(4, 'Kepala LPPM', 8),
(5, 'Ketua Program Studi', 4);

-- --------------------------------------------------------

--
-- Table structure for table `ref_kabupaten_kota`
--

CREATE TABLE `ref_kabupaten_kota` (
  `id_kabupaten_kota` int NOT NULL,
  `id_provinsi` int NOT NULL,
  `nama_kabupaten_kota` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_kabupaten_kota`
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
(1405, 14, 'KABUPATEN SIAK'),
(1406, 14, 'KABUPATEN KAMPAR'),
(1407, 14, 'KABUPATEN ROKAN HULU'),
(1408, 14, 'KABUPATEN BENGKALIS'),
(1409, 14, 'KABUPATEN ROKAN HILIR'),
(1410, 14, 'KABUPATEN KEPULAUAN MERANTI'),
(1471, 14, 'KOTA PEKANBARU'),
(1473, 14, 'KOTA DUMAI'),
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
(2171, 21, 'KOTA BATAM'),
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
-- Table structure for table `ref_provinsi`
--

CREATE TABLE `ref_provinsi` (
  `id_provinsi` int NOT NULL,
  `nama_provinsi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ref_provinsi`
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
(96, 'PAPUA BARAT DAYA');

-- --------------------------------------------------------

--
-- Table structure for table `sumber_pendanaan`
--

CREATE TABLE `sumber_pendanaan` (
  `id_sumber` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sumber_dana` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sumber_pendanaan`
--

INSERT INTO `sumber_pendanaan` (`id_sumber`, `id_tahun`, `sumber_dana`, `jumlah_dana`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(10, 2025, 'SLOT1', 1000000, 'link', '2025-08-22 06:18:43', '2025-08-22 06:18:43', NULL, NULL),
(11, 2024, 'SLOT2', 2000000, 'LINK', '2025-08-22 06:19:09', '2025-08-22 06:19:09', NULL, NULL),
(12, 2023, 'SLOT3', 3000000, 'LINK', '2025-08-22 06:19:29', '2025-08-22 06:19:29', NULL, NULL),
(13, 2022, 'SLOT4', 3000000, 'LINK', '2025-08-22 06:20:00', '2025-08-22 06:20:00', NULL, NULL),
(16, 2025, 'SLOT1', 3000000, 'HGJHGJH', '2025-08-22 06:39:35', '2025-08-22 06:39:35', NULL, NULL),
(17, 2026, 'SLOT1', 3000000, 'BVCBGFGF', '2025-08-22 06:40:08', '2025-08-22 06:40:08', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a1_mahasiswa_baru_aktif`
--

CREATE TABLE `tabel_2a1_mahasiswa_baru_aktif` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `daya_tampung` int NOT NULL DEFAULT '0',
  `jenis` enum('baru','aktif') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jalur` enum('reguler','rpl') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jumlah_diterima` int DEFAULT '0',
  `jumlah_afirmasi` int DEFAULT '0',
  `jumlah_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a1_mahasiswa_baru_aktif`
--

INSERT INTO `tabel_2a1_mahasiswa_baru_aktif` (`id`, `id_unit_prodi`, `id_tahun`, `daya_tampung`, `jenis`, `jalur`, `jumlah_diterima`, `jumlah_afirmasi`, `jumlah_kebutuhan_khusus`, `created_at`, `updated_at`) VALUES
(20, 2, 2025, 100, 'baru', 'reguler', 10, 10, 10, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(21, 2, 2025, 100, 'baru', 'rpl', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(22, 2, 2025, 100, 'aktif', 'reguler', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06'),
(23, 2, 2025, 100, 'aktif', 'rpl', 100, 100, 100, '2025-09-29 07:46:43', '2025-09-29 08:57:06');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a1_pendaftaran`
--

CREATE TABLE `tabel_2a1_pendaftaran` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `pendaftar` int DEFAULT '0',
  `pendaftar_afirmasi` int DEFAULT '0',
  `pendaftar_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a1_pendaftaran`
--

INSERT INTO `tabel_2a1_pendaftaran` (`id`, `id_unit_prodi`, `id_tahun`, `pendaftar`, `pendaftar_afirmasi`, `pendaftar_kebutuhan_khusus`, `created_at`, `updated_at`) VALUES
(10, 2, 2025, 40, 45, 15, '2025-09-16 06:52:55', '2025-09-16 06:53:16');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a2_keragaman_asal`
--

CREATE TABLE `tabel_2a2_keragaman_asal` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `nama_daerah_input` varchar(255) NOT NULL,
  `kategori_geografis` enum('Sama Kota/Kab','Kota/Kab Lain','Provinsi Lain','Negara Lain') NOT NULL,
  `is_afirmasi` tinyint(1) NOT NULL DEFAULT '0',
  `is_kebutuhan_khusus` tinyint(1) NOT NULL DEFAULT '0',
  `jumlah_mahasiswa` int DEFAULT '0',
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a2_keragaman_asal`
--

INSERT INTO `tabel_2a2_keragaman_asal` (`id`, `id_unit_prodi`, `id_tahun`, `nama_daerah_input`, `kategori_geografis`, `is_afirmasi`, `is_kebutuhan_khusus`, `jumlah_mahasiswa`, `link_bukti`, `created_at`, `updated_at`) VALUES
(25, 2, 2025, 'KABUPATEN BANYUWANGI', 'Sama Kota/Kab', 0, 0, 200, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:55:03', '2025-09-23 08:55:03'),
(26, 2, 2025, 'KABUPATEN JEMBER', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:55:25', '2025-09-23 08:55:25'),
(27, 2, 2025, 'KOTA YOGYAKARTA', 'Kota/Kab Lain', 0, 0, 50, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:56:04', '2025-09-23 08:56:04'),
(28, 2, 2025, 'KABUPATEN BANTUL', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:57:38', '2025-09-23 08:57:38'),
(29, 2, 2025, 'JEPANG', 'Negara Lain', 0, 0, 1, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 08:58:09', '2025-09-23 08:58:09'),
(30, 2, 2025, 'KABUPATEN SEMARANG', 'Kota/Kab Lain', 0, 0, 5, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 09:00:47', '2025-09-23 09:00:47'),
(31, 2, 2025, 'KABUPATEN KLATEN', 'Kota/Kab Lain', 0, 0, 10, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-23 09:01:00', '2025-09-23 09:01:00'),
(48, 2, 2025, 'KABUPATEN JEMBER', 'Kota/Kab Lain', 1, 0, 10, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-29 03:56:40', '2025-09-29 03:56:40'),
(49, 2, 2025, 'KABUPATEN ACEH JAYA', 'Kota/Kab Lain', 0, 1, 2, 'https://www.youtube.com/?gl=ID&hl=id&app=desktop', '2025-09-29 03:56:55', '2025-09-29 03:56:55');

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2a3_kondisi_mahasiswa`
--

CREATE TABLE `tabel_2a3_kondisi_mahasiswa` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jml_lulus` int DEFAULT '0',
  `jml_do` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tabel_2a3_kondisi_mahasiswa`
--

INSERT INTO `tabel_2a3_kondisi_mahasiswa` (`id`, `id_unit_prodi`, `id_tahun`, `jml_lulus`, `jml_do`) VALUES
(3, 2, 2025, 3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b4_masa_tunggu`
--

CREATE TABLE `tabel_2b4_masa_tunggu` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jumlah_lulusan` int DEFAULT '0',
  `jumlah_terlacak` int DEFAULT '0',
  `rata_rata_waktu_tunggu_bulan` float DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b5_kesesuaian_kerja`
--

CREATE TABLE `tabel_2b5_kesesuaian_kerja` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jumlah_lulusan` int DEFAULT '0',
  `jumlah_terlacak` int DEFAULT '0',
  `jml_infokom` int DEFAULT '0',
  `jml_non_infokom` int DEFAULT '0',
  `jml_internasional` int DEFAULT '0',
  `jml_nasional` int DEFAULT '0',
  `jml_wirausaha` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b6_kepuasan_pengguna`
--

CREATE TABLE `tabel_2b6_kepuasan_pengguna` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis_kemampuan` varchar(255) NOT NULL,
  `persen_sangat_baik` float DEFAULT '0',
  `persen_baik` float DEFAULT '0',
  `persen_cukup` float DEFAULT '0',
  `persen_kurang` float DEFAULT '0',
  `rencana_tindak_lanjut` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2b6_rekap_jumlah`
--

CREATE TABLE `tabel_2b6_rekap_jumlah` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jumlah_alumni_3_tahun` int DEFAULT '0',
  `jumlah_pengguna_responden` int DEFAULT '0',
  `jumlah_mahasiswa_aktif_ts` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2c_pembelajaran_luar_prodi`
--

CREATE TABLE `tabel_2c_pembelajaran_luar_prodi` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `bentuk_pembelajaran` varchar(255) NOT NULL,
  `jumlah_mahasiswa` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tabel_2d_rekognisi_lulusan`
--

CREATE TABLE `tabel_2d_rekognisi_lulusan` (
  `id` int NOT NULL,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sumber_rekognisi` varchar(255) NOT NULL,
  `jumlah_rekognisi` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tahun_akademik`
--

CREATE TABLE `tahun_akademik` (
  `id_tahun` int NOT NULL,
  `tahun` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tahun_akademik`
--

INSERT INTO `tahun_akademik` (`id_tahun`, `tahun`) VALUES
(2020, '2020/2021'),
(2021, '2021/2022'),
(2022, '2022/2023'),
(2023, '2023/2024'),
(2024, '2024/2025'),
(2025, '2025/2026'),
(2026, '2026/2027'),
(2027, '2027/2028'),
(2028, '2028/2029'),
(2029, '2029/2030'),
(2030, '2030/2031'),
(2031, '2031/2032'),
(2032, '2032/2033'),
(2033, '2033/2034'),
(2034, '2034/2035'),
(2035, '2035/2036'),
(2036, '2036/2037'),
(2037, '2037/2038'),
(2038, '2038/2039'),
(2039, '2039/2040'),
(2040, '2040/2041'),
(2041, '2041/2042'),
(2042, '2042/2043'),
(2043, '2043/2044'),
(2044, '2044/2045'),
(2045, '2045/2046'),
(2046, '2046/2047'),
(2047, '2047/2048'),
(2048, '2048/2049'),
(2049, '2049/2050'),
(2050, '2050/2051'),
(2051, '2051/2052'),
(2052, '2052/2053'),
(2053, '2053/2054'),
(2054, '2054/2055'),
(2055, '2055/2056'),
(2056, '2056/2057'),
(2057, '2057/2058'),
(2058, '2058/2059'),
(2059, '2059/2060'),
(2060, '2060/2061'),
(2061, '2061/2062'),
(2062, '2062/2063'),
(2063, '2063/2064'),
(2064, '2064/2065'),
(2065, '2065/2066'),
(2066, '2066/2067'),
(2067, '2067/2068'),
(2068, '2068/2069'),
(2069, '2069/2070'),
(2070, '2070/2071'),
(2071, '2071/2072'),
(2072, '2072/2073'),
(2073, '2073/2074'),
(2074, '2074/2075'),
(2075, '2075/2076'),
(2076, '2076/2077'),
(2077, '2077/2078'),
(2078, '2078/2079'),
(2079, '2079/2080'),
(2080, '2080/2081'),
(2081, '2081/2082'),
(2082, '2082/2083'),
(2083, '2083/2084'),
(2084, '2084/2085'),
(2085, '2085/2086'),
(2086, '2086/2087'),
(2087, '2087/2088'),
(2088, '2088/2089'),
(2089, '2089/2090'),
(2090, '2090/2091'),
(2091, '2091/2092'),
(2092, '2092/2093'),
(2093, '2093/2094'),
(2094, '2094/2095'),
(2095, '2095/2096'),
(2096, '2096/2097'),
(2097, '2097/2098'),
(2098, '2098/2099'),
(2099, '2099/2100'),
(2100, '2100/2101');

-- --------------------------------------------------------

--
-- Table structure for table `tenaga_kependidikan`
--

CREATE TABLE `tenaga_kependidikan` (
  `id_tendik` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `jenis_tendik` varchar(100) DEFAULT NULL,
  `nikp` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tenaga_kependidikan`
--

INSERT INTO `tenaga_kependidikan` (`id_tendik`, `id_pegawai`, `jenis_tendik`, `nikp`, `created_at`, `updated_at`) VALUES
(1, 4, 'PUSTAKAWAN', 'KEP001', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(2, 5, 'Laboran/Teknisi', 'KEP002', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(3, 6, 'Administrasi', 'KEP003', '2025-08-21 23:54:41', '2025-08-22 09:51:26'),
(4, 7, 'TUKANG TAMBAL BAN', 'KEP004', '2025-08-21 23:54:41', '2025-08-22 09:51:26');

-- --------------------------------------------------------

--
-- Table structure for table `unit_kerja`
--

CREATE TABLE `unit_kerja` (
  `id_unit` int NOT NULL,
  `nama_unit` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `unit_kerja`
--

INSERT INTO `unit_kerja` (`id_unit`, `nama_unit`) VALUES
(1, 'Ketua STIKOM'),
(2, 'Wakil Ketua I'),
(3, 'Wakil Ketua II '),
(4, 'Prodi TI'),
(5, 'Prodi MI'),
(6, 'ALA'),
(7, 'PMB'),
(8, 'Kemahasiswaan'),
(9, 'TPM'),
(10, 'Kepegawaian'),
(11, 'Sarpras');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_unit` int DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `id_pegawai`, `username`, `password`, `id_unit`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'waket1', '$2a$10$i2r/hCf8VW2uqqrGWDKk7Op0UZJGPY0pZrv/8q/gJe79gvYKxESA2', 2, 'waket-1', 1, '2025-08-21 23:54:41', '2025-08-21 23:59:37'),
(2, 3, 'waket2', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 3, 'waket-2', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 8, 'lppm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 4, 'lppm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 5, 'kepegawaian_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 6, 'kepegawaian', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(6, 7, 'tpm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 5, 'tpm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(7, 1, 'prodi_TI', '$2a$10$i2r/hCf8VW2uqqrGWDKk7Op0UZJGPY0pZrv/8q/gJe79gvYKxESA2', 4, 'prodi-ti', 1, '2025-08-28 04:36:24', '2025-08-28 04:45:18'),
(8, 1, 'prodi_MI', '123', 5, 'prodi-mi', 1, '2025-08-28 04:36:24', '2025-08-28 04:36:24'),
(9, 1, 'ALA', '123', 6, 'ALA', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52'),
(10, 2, 'PMB', '123', 7, 'PMB', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52'),
(11, 3, 'kepegawaian', '123', 8, 'kemahasiswaan', 1, '2025-08-28 04:39:52', '2025-08-28 04:39:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD PRIMARY KEY (`id_ami`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD PRIMARY KEY (`id_beban_kerja`),
  ADD UNIQUE KEY `unik_dosen_tahun` (`id_dosen`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `cpl`
--
ALTER TABLE `cpl`
  ADD PRIMARY KEY (`id_cpl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD PRIMARY KEY (`id_cpmk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id_dosen`),
  ADD UNIQUE KEY `nidn` (`nidn`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jafung` (`id_jafung`);

--
-- Indexes for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD PRIMARY KEY (`id_kualifikasi`),
  ADD KEY `id_tendik` (`id_tendik`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `kurikulum`
--
ALTER TABLE `kurikulum`
  ADD PRIMARY KEY (`id_kurikulum`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `map_cpl_mk`
--
ALTER TABLE `map_cpl_mk`
  ADD PRIMARY KEY (`id_cpl`,`id_mk`),
  ADD KEY `id_mk` (`id_mk`);

--
-- Indexes for table `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD PRIMARY KEY (`id_cpl`,`id_pl`),
  ADD KEY `id_pl` (`id_pl`);

--
-- Indexes for table `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD PRIMARY KEY (`id_cpmk`,`id_cpl`),
  ADD KEY `id_cpl` (`id_cpl`);

--
-- Indexes for table `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD PRIMARY KEY (`id_cpmk`,`id_mk`),
  ADD KEY `id_mk` (`id_mk`);

--
-- Indexes for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD PRIMARY KEY (`id_mk`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id_pegawai`);

--
-- Indexes for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD PRIMARY KEY (`id_penggunaan_dana`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD PRIMARY KEY (`id_pimpinan`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jabatan` (`id_jabatan`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD PRIMARY KEY (`id_pl`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`);

--
-- Indexes for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  ADD PRIMARY KEY (`id_jafung`);

--
-- Indexes for table `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  ADD PRIMARY KEY (`id_jabatan`);

--
-- Indexes for table `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD PRIMARY KEY (`id_kabupaten_kota`),
  ADD KEY `id_provinsi` (`id_provinsi`);

--
-- Indexes for table `ref_provinsi`
--
ALTER TABLE `ref_provinsi`
  ADD PRIMARY KEY (`id_provinsi`);

--
-- Indexes for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD PRIMARY KEY (`id_sumber`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_unit_prodi` (`id_unit_prodi`),
  ADD KEY `idx_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_pendaftaran` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_prodi` (`id_unit_prodi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kondisi` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_tunggu` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indexes for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kerja` (`id_unit_prodi`,`id_tahun_lulus`),
  ADD KEY `id_tahun_lulus` (`id_tahun_lulus`);

--
-- Indexes for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_kepuasan` (`id_unit_prodi`,`id_tahun`,`jenis_kemampuan`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_rekap_jumlah` (`id_unit_prodi`,`id_tahun`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_pembelajaran` (`id_unit_prodi`,`id_tahun`,`bentuk_pembelajaran`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_rekognisi` (`id_unit_prodi`,`id_tahun`,`sumber_rekognisi`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tahun_akademik`
--
ALTER TABLE `tahun_akademik`
  ADD PRIMARY KEY (`id_tahun`);

--
-- Indexes for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD PRIMARY KEY (`id_tendik`),
  ADD UNIQUE KEY `nikp` (`nikp`),
  ADD KEY `id_pegawai` (`id_pegawai`);

--
-- Indexes for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  ADD PRIMARY KEY (`id_unit`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_unit` (`id_unit`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  MODIFY `id_ami` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `cpl`
--
ALTER TABLE `cpl`
  MODIFY `id_cpl` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

--
-- AUTO_INCREMENT for table `cpmk`
--
ALTER TABLE `cpmk`
  MODIFY `id_cpmk` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  MODIFY `id_kualifikasi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kurikulum`
--
ALTER TABLE `kurikulum`
  MODIFY `id_kurikulum` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id_mk` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=314;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  MODIFY `id_pl` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  MODIFY `id_jafung` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  MODIFY `id_jabatan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  MODIFY `id_sumber` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  MODIFY `id_tendik` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  MODIFY `id_unit` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  ADD CONSTRAINT `audit_mutu_internal_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `audit_mutu_internal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_1` FOREIGN KEY (`id_dosen`) REFERENCES `dosen` (`id_dosen`),
  ADD CONSTRAINT `beban_kerja_dosen_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `cpl`
--
ALTER TABLE `cpl`
  ADD CONSTRAINT `cpl_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `cpmk`
--
ALTER TABLE `cpmk`
  ADD CONSTRAINT `cpmk_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `dosen`
--
ALTER TABLE `dosen`
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`) ON DELETE SET NULL;

--
-- Constraints for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_1` FOREIGN KEY (`id_tendik`) REFERENCES `tenaga_kependidikan` (`id_tendik`),
  ADD CONSTRAINT `kualifikasi_tendik_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Constraints for table `kurikulum`
--
ALTER TABLE `kurikulum`
  ADD CONSTRAINT `kurikulum_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Constraints for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `map_cpl_mk`
--
ALTER TABLE `map_cpl_mk`
  ADD CONSTRAINT `map_cpl_mk_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpl_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpl_pl`
--
ALTER TABLE `map_cpl_pl`
  ADD CONSTRAINT `map_cpl_pl_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpl_pl_ibfk_2` FOREIGN KEY (`id_pl`) REFERENCES `profil_lulusan` (`id_pl`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpmk_cpl`
--
ALTER TABLE `map_cpmk_cpl`
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_cpl_ibfk_2` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE;

--
-- Constraints for table `map_cpmk_mk`
--
ALTER TABLE `map_cpmk_mk`
  ADD CONSTRAINT `map_cpmk_mk_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  ADD CONSTRAINT `map_cpmk_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE;

--
-- Constraints for table `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  ADD CONSTRAINT `mata_kuliah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD CONSTRAINT `penggunaan_dana_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_3` FOREIGN KEY (`id_jabatan`) REFERENCES `ref_jabatan_struktural` (`id_jabatan`);

--
-- Constraints for table `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  ADD CONSTRAINT `profil_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

--
-- Constraints for table `ref_kabupaten_kota`
--
ALTER TABLE `ref_kabupaten_kota`
  ADD CONSTRAINT `ref_kabupaten_kota_ibfk_1` FOREIGN KEY (`id_provinsi`) REFERENCES `ref_provinsi` (`id_provinsi`);

--
-- Constraints for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a1_pendaftaran_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2b6_rekap_jumlah`
--
ALTER TABLE `tabel_2b6_rekap_jumlah`
  ADD CONSTRAINT `tabel_2b6_rekap_jumlah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2b6_rekap_jumlah_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2c_pembelajaran_luar_prodi`
--
ALTER TABLE `tabel_2c_pembelajaran_luar_prodi`
  ADD CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tabel_2d_rekognisi_lulusan`
--
ALTER TABLE `tabel_2d_rekognisi_lulusan`
  ADD CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD CONSTRAINT `tenaga_kependidikan_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

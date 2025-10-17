-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 22, 2025 at 10:48 PM
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
  `bukti_certified_uri` text,
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

INSERT INTO `audit_mutu_internal` (`id_ami`, `id_unit`, `id_tahun`, `frekuensi_audit`, `dokumen_spmi`, `laporan_audit_url`, `bukti_certified_uri`, `jumlah_auditor_certified`, `jumlah_auditor_noncertified`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 7, 2024, 2, NULL, NULL, NULL, 3, NULL, '2025-08-21 23:54:41', '2025-08-22 09:21:01', '2025-08-22 16:21:01', 1),
(2, 2, 2022, 2, 'ini dokumen', 'ini url', 'ini sertifikat', 12, 12, '2025-08-22 09:20:56', '2025-08-22 11:45:23', NULL, NULL),
(3, 4, 2024, 3, '1', '1', NULL, 0, 2, '2025-08-22 10:01:26', '2025-08-22 10:01:40', '2025-08-22 17:01:40', 1);

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
(1, 1, 2024, 3, 1, 1, 2, '2025-08-21 23:54:41', '2025-08-22 09:06:37', '2025-08-22 16:06:38', 1),
(3, 4, 2023, 3, 2, 1, 2, '2025-08-22 08:15:54', '2025-08-22 09:06:40', '2025-08-22 16:06:40', 1),
(5, 4, 2024, 3, 1, 1, 2, '2025-08-22 08:21:40', '2025-08-22 09:06:41', '2025-08-22 16:06:42', 1),
(6, 4, 2022, 3, 1, 1, 2, '2025-08-22 09:06:51', '2025-08-22 10:39:32', '2025-08-22 17:39:33', 1),
(7, 1, 2021, 3, 1, 1, 2, '2025-08-22 09:12:22', '2025-08-22 09:12:22', NULL, NULL),
(8, 2, 2023, 9, 2, 0.5, 3, '2025-08-22 10:36:57', '2025-08-22 10:37:31', NULL, NULL);

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
(4, 8, '0044556604', NULL, NULL, NULL, 1, 0, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 9, '001123102123', '1111111111111111', 'Manajemen Informatika', 'STIKOM Banyuwangi', 2, 12.5, '2025-08-22 22:14:09', '2025-08-22 22:16:36');

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
(9, 'fufufafa', 'S2', '2025-08-22 16:45:03', '2025-08-22 16:46:32');

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
(3, 7, 8, 5, '2021-02-20', '2029-02-20', 'blablabla', '2025-08-22 05:38:58', '2025-08-22 05:39:07', '2025-08-22 12:39:08', 1),
(4, 5, 4, 4, '2024-12-29', '2025-12-29', 'mangan bakso', '2025-08-22 10:32:01', '2025-08-22 10:32:01', NULL, NULL),
(5, 9, 5, 5, '2024-10-11', '2029-10-11', 'afzsshayskiqsj', '2025-08-22 10:34:13', '2025-08-22 10:34:59', NULL, NULL);

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
(4, 'LPPM'),
(5, 'TPM'),
(6, 'Unit Usaha'),
(7, 'Prodi'),
(8, 'Administrasi Akademik'),
(9, 'Kemahasiswaan'),
(10, 'Pusat Karir'),
(11, 'Alumni'),
(12, 'Perpustakaan'),
(13, 'Sarpras'),
(14, 'Staf Sarpras'),
(15, 'Staf Maintenance'),
(16, 'SISFO'),
(17, 'Keuangan dan Administrasi Umum'),
(18, 'Humas dan Kerjasama');

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
(3, 2, 'prodi_if', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 7, 'prodi', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(4, 8, 'lppm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 4, 'lppm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(5, 5, 'kepegawaian_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 6, 'kepegawaian', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41'),
(6, 7, 'tpm_user', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 5, 'tpm', 1, '2025-08-21 23:54:41', '2025-08-21 23:54:41');

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
-- Indexes for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_user` (`id_user`);

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
-- Indexes for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD PRIMARY KEY (`id_sumber`),
  ADD KEY `id_tahun` (`id_tahun`),
  ADD KEY `deleted_at` (`deleted_at`);

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
  MODIFY `id_ami` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `kualifikasi_tendik`
--
ALTER TABLE `kualifikasi_tendik`
  MODIFY `id_kualifikasi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Constraints for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

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
-- Constraints for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

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

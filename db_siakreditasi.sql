-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 14 Jan 2026 pada 20.00
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
-- Database: `db_siakreditasi`
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
(7, 6, 2023, 2, 'Kebijakan dan Manual Mutu STIKOM 2023', 'https://tpm.stikom.ac.id/laporan/2023/ami-prodi-ti.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-internal-2023.pdf', 3, 1, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(8, 7, 2023, 2, 'Kebijakan dan Manual Mutu STIKOM 2023', 'https://tpm.stikom.ac.id/laporan/2023/ami-prodi-mi.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-internal-2023.pdf', 3, 1, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(9, 6, 2024, 2, 'Standar SPMI Pelaksanaan Pendidikan 2024', 'https://tpm.stikom.ac.id/laporan/2024/ami-prodi-ti-final.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-nasional-2024.pdf', 4, 2, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(10, 7, 2024, 2, 'Standar SPMI Pelaksanaan Pendidikan 2024', 'https://tpm.stikom.ac.id/laporan/2024/ami-prodi-mi-final.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-nasional-2024.pdf', 4, 2, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(11, 5, 2024, 1, 'Standar Mutu Penelitian & PkM LPPM', 'https://tpm.stikom.ac.id/laporan/2024/ami-lppm.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-nasional-2024.pdf', 2, 1, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(12, 6, 2025, 1, 'Standar Penjaminan Mutu Berbasis IPEPA', 'https://tpm.stikom.ac.id/laporan/2025/ami-semester-ganjil-ti.pdf', 'https://tpm.stikom.ac.id/sertifikat/certified-auditor-2025.pdf', 5, 0, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(13, 4, 2025, 1, 'Evaluasi Kinerja Unit Penjaminan Mutu', 'https://tpm.stikom.ac.id/laporan/2025/audit-internal-tpm.pdf', 'https://tpm.stikom.ac.id/sertifikat/certified-auditor-2025.pdf', 3, 0, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(14, 8, 2024, 1, 'Standar Layanan Administrasi Akademik 2024', 'https://tpm.stikom.ac.id/laporan/2024/audit-ala.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-2024.pdf', 2, 1, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(15, 9, 2024, 1, 'Standar Layanan Kemahasiswaan & Tracer Study', 'https://tpm.stikom.ac.id/laporan/2024/audit-kemahasiswaan.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-2024.pdf', 2, 2, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(16, 10, 2025, 1, 'Standar Mutu Layanan Perpustakaan & Koleksi', 'https://tpm.stikom.ac.id/laporan/2025/audit-perpustakaan.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-2025.pdf', 3, 0, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(17, 11, 2024, 1, 'Standar Pengelolaan Keuangan & Akuntabilitas', 'https://tpm.stikom.ac.id/laporan/2024/audit-keuangan.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-2024.pdf', 2, 1, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL),
(18, 12, 2025, 1, 'Standar Mutu SDM & Sarana Prasarana Pendidikan', 'https://tpm.stikom.ac.id/laporan/2025/audit-sarpras.pdf', 'https://tpm.stikom.ac.id/sertifikat/auditor-2025.pdf', 3, 0, '2026-01-09 18:07:44', '2026-01-09 18:07:44', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `beban_kerja_dosen`
--

CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL,
  `id_tahun` int(11) NOT NULL,
  `sks_pengajaran_ps_sendiri` float DEFAULT 0,
  `sks_pengajaran_ps_lain_pt_sendiri` float DEFAULT 0,
  `sks_pengajaran_pt_lain` float DEFAULT 0,
  `sks_penelitian` float DEFAULT 0,
  `sks_pkm` float DEFAULT 0,
  `sks_manajemen_pt_sendiri` float DEFAULT 0,
  `sks_manajemen_pt_lain` float DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `beban_kerja_dosen`
--

INSERT INTO `beban_kerja_dosen` (`id_beban_kerja`, `id_dosen`, `id_tahun`, `sks_pengajaran_ps_sendiri`, `sks_pengajaran_ps_lain_pt_sendiri`, `sks_pengajaran_pt_lain`, `sks_penelitian`, `sks_pkm`, `sks_manajemen_pt_sendiri`, `sks_manajemen_pt_lain`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(12, 1, 2023, 4, 0, 0, 2, 1, 6, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(13, 2, 2023, 6, 0, 0, 2, 1, 4, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(14, 3, 2023, 6, 0, 0, 1, 1, 4, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(15, 6, 2023, 8, 0, 0, 2, 2, 2, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(16, 9, 2023, 10, 0, 0, 3, 2, 0, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(17, 10, 2023, 12, 0, 0, 2, 1, 0, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(18, 1, 2024, 3, 0, 0, 2, 2, 10, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(19, 2, 2024, 5, 0, 0, 3, 1, 4, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(20, 4, 2024, 6, 0, 0, 2, 1, 8, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(21, 7, 2024, 8, 0, 0, 2, 2, 2, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(22, 13, 2024, 7, 0, 0, 4, 5, 5, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(23, 15, 2024, 12, 0, 0, 2, 1, 0, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(24, 3, 2025, 6, 0, 0, 2, 2, 4, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(25, 4, 2025, 6, 0, 0, 3, 1, 4, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(26, 6, 2025, 8, 0, 0, 4, 2, 2, 0, '2026-01-09 17:18:22', '2026-01-12 08:48:45', NULL, NULL),
(27, 14, 2025, 3, 1, 2, 2, 2, 3, 2, '2026-01-09 17:18:22', '2026-01-12 08:49:32', NULL, NULL);

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
-- Struktur dari tabel `berita`
--

CREATE TABLE `berita` (
  `id_berita` int(11) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `ringkasan` text NOT NULL,
  `konten` longtext NOT NULL,
  `prioritas` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `penulis` varchar(100) NOT NULL,
  `id_user` int(11) DEFAULT NULL COMMENT 'FK ke users.id_user (opsional)',
  `tanggal_publikasi` date NOT NULL,
  `waktu_baca` varchar(20) DEFAULT NULL COMMENT 'Estimasi waktu baca (contoh: "5 menit")',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(101, 6, 'CPL-TI-A', 'Mampu menerapkan siklus pengembangan perangkat lunak (SDLC) dengan standar industri.', NULL, NULL),
(102, 6, 'CPL-TI-B', 'Mampu melakukan hardening sistem operasi dan mitigasi serangan jaringan.', NULL, NULL),
(103, 6, 'CPL-TI-C', 'Mampu mengimplementasikan teknik machine learning untuk ekstraksi pengetahuan.', NULL, NULL),
(104, 6, 'CPL-TI-D', 'Mampu melakukan orkestrasi server menggunakan kontainerisasi (Docker/Kubernetes).', NULL, NULL),
(105, 6, 'CPL-TI-E', 'Mampu membangun sistem cerdas berbasis mikrokontroler dan protokol MQTT.', NULL, NULL),
(201, 7, 'CPL-MI-A', 'Mampu memodelkan proses bisnis organisasi menggunakan standar BPMN/UML.', NULL, NULL),
(202, 7, 'CPL-MI-B', 'Mampu melakukan backup, restore, dan optimasi query pada database enterprise.', NULL, NULL),
(203, 7, 'CPL-MI-C', 'Mampu menyusun dokumen perencanaan proyek (PMP) dan manajemen risiko.', NULL, NULL),
(204, 7, 'CPL-MI-D', 'Mampu merancang model bisnis canvas dan strategi digital marketing.', NULL, NULL),
(205, 7, 'CPL-MI-E', 'Mampu melakukan audit sistem informasi menggunakan framework COBIT/ITIL.', NULL, NULL);

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
(101, 6, 'CP-TI-1', 'Mahasiswa mampu mendesain arsitektur microservices.', NULL, NULL),
(102, 6, 'CP-TI-2', 'Mahasiswa mampu melakukan Penetration Testing sistem jaringan.', NULL, NULL),
(103, 6, 'CP-TI-3', 'Mahasiswa mampu membangun model klasifikasi dengan Python.', NULL, NULL),
(104, 6, 'CP-TI-4', 'Mahasiswa mampu melakukan deployment aplikasi pada platform AWS.', NULL, NULL),
(105, 6, 'CP-TI-5', 'Mahasiswa mampu menghubungkan sensor ke dashboard cloud.', NULL, NULL),
(201, 7, 'CP-MI-1', 'Mahasiswa mampu mendesain diagram alur kerja bisnis.', NULL, NULL),
(202, 7, 'CP-MI-2', 'Mahasiswa mampu mengelola user privilege dan keamanan data.', NULL, NULL),
(203, 7, 'CP-MI-3', 'Mahasiswa mampu menggunakan Jira/Trello untuk manajemen tim.', NULL, NULL),
(204, 7, 'CP-MI-4', 'Mahasiswa mampu menyusun pitch deck startup digital.', NULL, NULL),
(205, 7, 'CP-MI-5', 'Mahasiswa mampu menyusun laporan temuan audit sistem.', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `dosen`
--

CREATE TABLE `dosen` (
  `id_dosen` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `nidn` varchar(20) DEFAULT NULL,
  `nuptk` varchar(20) DEFAULT NULL,
  `id_unit_homebase` int(11) DEFAULT NULL,
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

INSERT INTO `dosen` (`id_dosen`, `id_pegawai`, `nidn`, `nuptk`, `id_unit_homebase`, `pt`, `id_jafung`, `beban_sks`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, '0701018001', NULL, 6, NULL, 3, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(2, 2, '0701018002', NULL, 6, NULL, 3, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(3, 3, '0701018003', NULL, 7, NULL, 3, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(4, 4, '0701018004', '-', 6, 'STIKOM PGRI Banyuwangi', 1, 0, '2025-12-17 21:37:18', '2026-01-12 07:10:12', NULL, NULL),
(5, 5, '0701018005', NULL, 7, NULL, 4, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(6, 6, '0701018006', NULL, 6, NULL, 3, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(7, 7, '0701018007', NULL, 7, NULL, 3, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(8, 28, '0701018028', NULL, 7, NULL, 4, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(9, 29, '0701018029', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(10, 30, '0701018030', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(11, 31, '0701018038', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(12, 32, '0701018039', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(13, 33, '0701018040', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(14, 34, '0701018041', NULL, 7, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL),
(15, 35, '0701018042', NULL, 6, NULL, 2, 0, '2025-12-17 21:37:18', '2026-01-09 11:55:04', NULL, NULL);

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
(2, 6, 2022, 145, 'http://bukti-valid.com/ti/2022-2023', '2025-10-20 09:05:42', '2026-01-10 08:49:15', NULL, NULL),
(3, 7, 2023, 75, 'http://bukti-valid.com/mi/2022-2023', '2025-10-21 06:02:37', '2026-01-10 08:49:15', NULL, NULL),
(4, 6, 2023, 150, 'http://bukti-valid.com/ti/2023-2024', '2025-10-22 02:43:03', '2026-01-10 08:49:15', NULL, NULL);

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
(101, 101),
(102, 102),
(103, 103),
(104, 104),
(201, 201),
(202, 202),
(203, 203),
(204, 204);

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
(101, 101),
(102, 102),
(103, 103),
(104, 104),
(105, 105),
(201, 201),
(202, 202),
(203, 203),
(204, 204),
(205, 205);

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
(101, 101),
(102, 102),
(103, 103),
(104, 104),
(105, 105),
(201, 201),
(202, 202),
(203, 203),
(204, 204),
(205, 205);

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
(101, 6, 'MK-TI-401', 'Rekayasa Perangkat Lunak Lanjut', 4, 4, NULL, NULL),
(102, 6, 'MK-TI-502', 'Keamanan Jaringan Komputer', 3, 5, NULL, NULL),
(103, 6, 'MK-TI-603', 'Big Data & Kecerdasan Buatan', 3, 6, NULL, NULL),
(104, 6, 'MK-TI-404', 'Teknologi Cloud Computing', 3, 4, NULL, NULL),
(105, 6, 'MK-TI-505', 'Embedded Systems & IoT', 3, 5, NULL, NULL),
(201, 7, 'MK-MI-201', 'Analisis Proses Bisnis', 3, 2, NULL, NULL),
(202, 7, 'MK-MI-302', 'Administrasi Basis Data', 3, 3, NULL, NULL),
(203, 7, 'MK-MI-503', 'Manajemen Proyek Sistem Informasi', 3, 5, NULL, NULL),
(204, 7, 'MK-MI-404', 'Kewirausahaan Teknologi', 3, 4, NULL, NULL),
(205, 7, 'MK-MI-605', 'Audit Tata Kelola SI', 3, 6, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pegawai`
--

CREATE TABLE `pegawai` (
  `id_pegawai` int(11) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `nikp` varchar(50) DEFAULT NULL COMMENT 'Nomor Induk Kepegawaian',
  `id_unit` int(11) DEFAULT NULL COMMENT 'Unit Kerja Pegawai (Relasi ke unit_kerja)',
  `id_jabatan` int(11) DEFAULT NULL COMMENT 'Jabatan Struktural (Relasi ke ref_jabatan_struktural)',
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `pegawai`
--

INSERT INTO `pegawai` (`id_pegawai`, `nama_lengkap`, `nikp`, `id_unit`, `id_jabatan`, `pendidikan_terakhir`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'Rachman Yulianto, M.Kom', '20250001', 1, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(2, 'Yoyon Arie Budi Suprio, M.Kom', '20250002', 2, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(3, 'Sulaibatul Aslamiyah, M.Kom', '20250003', 3, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(4, 'Agus Eko Musantono, M.Kom', '20250004', 4, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(5, 'Djuniharto, M.Kom', '20250005', 5, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(6, 'Pelsri Ramadar Noor Saputra, M.Kom', '20250006', 6, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(7, 'M. Taufiq, M.Kom', '20250007', 7, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(8, 'Pringgodani, S.Kom', '20250008', 8, 1, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(9, 'Abdul Haris, M.Kom', '20250009', 9, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(10, 'Tintin Harlina, M.Kom', '20250010', 10, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(11, 'Nujulul Fitria, S.Kom', '20250011', 11, 1, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(12, 'Faruk Alfiyan, M.Kom', '20250012', 12, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(13, 'Arif Hadi Sumitro, M.Kom', '20250013', 13, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(14, 'Kanda Mubarag, M.', '20250014', 14, 1, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(15, 'Rudi Setiadi', '20250015', 15, 1, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(17, 'Khairul Fajar, S.Kom', '20250017', 4, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(18, 'Mirsa Khamilawati, S.Kom', '20250018', 5, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(19, 'Rina Permata Sari, S.Kom', '20250019', 6, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(20, 'Olivia Primastuti, S.M', '20250020', 8, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(21, 'Krida Maharsi Draniswara, S.Kom', '20250021', 9, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(22, 'Eko Setiawan, Amd.Kom', '20250022', 13, 2, 'D3', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(23, 'Catur Sulastriono, Amd.Kom', '20250023', 13, 2, 'D3', '2025-12-17 21:36:57', '2026-01-14 17:44:11', NULL, NULL),
(24, 'Iman Santoso, M.M', '20250024', 15, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(25, 'Dwi Sanda Hermawan, S.Kom', '20250025', 15, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(26, 'Natasya Yasmin Kinanti, S.Kom', '20250026', 14, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(27, 'Amira Dhisa Fakhira, S.KM', '20250027', 12, 2, 'S1', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(28, 'Chairul Anam, M.M', '20250028', 7, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(29, 'Dwi Arraziqi, M.Kom', '20250029', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(30, 'Dwi Yulian Rachmanto Lingke, M.Kom', '20250030', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(31, 'Hadiq, M.Kom', '20250038', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(32, 'Ir. Moch. Najib, M.M', '20250039', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(33, 'Rudi Hartono, M.Kom', '20250040', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(34, 'Solehatin, M.Kom', '20250041', 7, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(35, 'Sony Panca Budiarto, M.Kom', '20250042', 6, 2, 'S2', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(43, 'Saibul Bahri', '20250043', 17, 1, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(44, 'Abdul Hadi', '20250044', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(45, 'Agus Wastu Hari W', '20250045', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(46, 'Subali', '20250046', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(47, 'Adi Saputra', '20250047', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(48, 'Ahmad Muizzun Nuha', '20250048', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(49, 'Dewa Adinantira Putra', '20250049', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL),
(50, 'Ibnu Mas\'ud', '20250050', 17, 2, 'SMA', '2025-12-17 21:36:57', '2025-12-17 21:36:57', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pegawai_unit`
--

CREATE TABLE `pegawai_unit` (
  `id` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL COMMENT 'FK ke pegawai.id_pegawai',
  `id_unit` int(11) NOT NULL COMMENT 'FK ke unit_kerja.id_unit',
  `is_primary` tinyint(1) DEFAULT 0 COMMENT '1 = Unit utama, 0 = Unit tambahan',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Tabel relasi many-to-many antara pegawai dan unit kerja';

--
-- Dumping data untuk tabel `pegawai_unit`
--

INSERT INTO `pegawai_unit` (`id`, `id_pegawai`, `id_unit`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-12-17 21:36:57', '2026-01-14 05:43:39'),
(2, 2, 2, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(3, 3, 3, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(4, 4, 4, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(5, 5, 5, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(6, 6, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(7, 7, 7, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(8, 8, 8, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(9, 9, 9, 1, '2026-01-14 16:29:57', '2026-01-14 16:56:42'),
(10, 10, 10, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(11, 11, 11, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(12, 12, 12, 1, '2025-12-17 21:36:57', '2026-01-14 15:09:03'),
(13, 13, 13, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(14, 14, 14, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(15, 15, 15, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(16, 17, 4, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(17, 18, 5, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(18, 19, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(19, 20, 8, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(20, 21, 9, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(21, 22, 13, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(22, 23, 13, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(23, 24, 15, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(24, 25, 15, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(25, 26, 14, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(26, 27, 12, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(27, 28, 7, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(28, 29, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(29, 30, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(30, 31, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(31, 32, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(32, 33, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(33, 34, 7, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(34, 35, 6, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(35, 43, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(36, 44, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(37, 45, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(38, 46, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(39, 47, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(40, 48, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(41, 49, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(42, 50, 17, 1, '2025-12-17 21:36:57', '2025-12-17 21:36:57'),
(68, 12, 18, 0, '2026-01-14 15:09:03', '2026-01-14 15:09:03');

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
(11, 2023, 'Biaya Operasional Pendidikan (Gaji & Honor)', 1500000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(12, 2023, 'Biaya Penelitian Dosen', 120000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(13, 2023, 'Biaya Pengabdian kepada Masyarakat', 80000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(14, 2023, 'Investasi Sarana (Laboratorium Komputer)', 350000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(15, 2024, 'Biaya Operasional Pendidikan', 1650000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(16, 2024, 'Biaya Penelitian Dosen & Mahasiswa', 145000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(17, 2024, 'Pengembangan SDM (Sertifikasi Dosen)', 60000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(18, 2024, 'Pemeliharaan Gedung & Fasilitas Kampus', 200000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(19, 2025, 'Biaya Operasional Semester Ganjil', 800000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(20, 2025, 'Pengembangan Sistem Informasi (SIAKAD)', 150000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL),
(21, 2025, 'Biaya Kegiatan Kemahasiswaan & Ormawa', 45000000, 'http://localhost:3001/tables', '2026-01-09 17:04:09', '2026-01-09 17:05:41', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `pimpinan_upps_ps`
--

CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
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

INSERT INTO `pimpinan_upps_ps` (`id_pimpinan`, `id_unit`, `id_pegawai`, `periode_mulai`, `periode_selesai`, `tupoksi`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 1, '2026-01-01', '2030-01-01', 'Bertanggung jawab penuh atas penyelenggaraan pendidikan, penelitian, dan pengabdian masyarakat, serta membina tenaga kependidikan, mahasiswa, dan hubungan dengan lingkungan.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(2, 2, 2, '2026-01-01', '2030-01-01', 'Membantu Ketua dalam memimpin pelaksanaan pendidikan, penelitian, dan pengabdian kepada masyarakat (Tridarma) serta pengelolaan sistem administrasi akademik.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(3, 3, 3, '2026-01-01', '2030-01-01', 'Membantu Ketua dalam pelaksanaan kegiatan di bidang perencanaan, pengelolaan keuangan, SDM, serta sarana dan prasarana administrasi umum.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(4, 4, 4, '2026-01-01', '2030-01-01', 'Merencanakan, melaksanakan, dan mengevaluasi sistem penjaminan mutu internal (SPMI) serta menyiapkan dokumen akreditasi unit pengelola dan program studi.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(5, 5, 5, '2026-01-01', '2030-01-01', 'Mengelola dan mengoordinasikan kegiatan penelitian dan pengabdian kepada masyarakat oleh dosen, serta memfasilitasi publikasi ilmiah dan HKI.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(6, 6, 6, '2026-01-01', '2030-01-01', 'Menyusun kurikulum, mengelola proses belajar mengajar, mengevaluasi capaian pembelajaran (CPL), dan melakukan pembinaan akademik kepada mahasiswa di tingkat program studi.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(7, 7, 7, '2026-01-01', '2030-01-01', 'Menyusun kurikulum, mengelola proses belajar mengajar, mengevaluasi capaian pembelajaran (CPL), dan melakukan pembinaan akademik kepada mahasiswa di tingkat program studi.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(8, 8, 8, '2026-01-01', '2030-01-01', 'Mengelola administrasi pendaftaran mahasiswa, kartu rencana studi (KRS), jadwal perkuliahan, hingga proses yudisium dan ijazah.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(9, 9, 9, '2026-01-01', '2030-01-01', 'Membina kegiatan organisasi mahasiswa, mengelola beasiswa, memfasilitasi pengembangan minat dan bakat, serta mengelola hubungan dengan alumni.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(10, 10, 10, '2026-01-01', '2030-01-01', 'Mengelola pengadaan bahan pustaka, layanan sirkulasi, digitalisasi karya ilmiah, dan penyediaan referensi untuk mendukung kurikulum pendidikan.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(11, 11, 11, '2026-01-01', '2030-01-01', 'Mengelola arus kas (cash flow), penagihan biaya pendidikan mahasiswa, penggajian pegawai, serta penyusunan laporan keuangan tahunan institusi.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(12, 12, 12, '2026-01-01', '2030-01-01', 'Mengelola administrasi karir pegawai, melaksanakan pengadaan aset, serta memelihara fasilitas gedung untuk mendukung kenyamanan pembelajaran.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(13, 13, 13, '2026-01-01', '2030-01-01', 'Membangun dan memelihara sistem informasi manajemen (SIM), infrastruktur jaringan internet, server, serta memberikan dukungan teknis IT di seluruh unit kerja.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(14, 14, 14, '2026-01-01', '2030-01-01', 'Mengelola komunikasi publik, menjalin kemitraan strategis dengan mitra industri/instansi, serta mengoordinasikan dokumen kerjasama (MoU/MoA).', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(15, 15, 15, '2026-01-01', '2030-01-01', 'Menyusun strategi pemasaran institusi, melaksanakan branding kampus, serta menyelenggarakan kegiatan sosialisasi untuk menjaring mahasiswa baru.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL),
(16, 1, 1, '2026-01-01', '2030-01-01', 'Mengelola unit-unit bisnis internal (seperti kantin, toko, atau jasa konsultasi) untuk mendukung kemandirian finansial institusi.', '2026-01-09 15:27:46', '2026-01-14 04:27:23', NULL, NULL),
(17, 17, 43, '2026-01-01', '2030-01-01', 'Menjamin keamanan aset dan lingkungan kampus selama 24 jam serta memastikan kebersihan dan sterilisasi seluruh area kerja dan ruang kelas.', '2026-01-09 15:27:46', '2026-01-09 15:27:46', NULL, NULL);

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
(101, 6, 'PL-TI-01', 'Software Engineer: Ahli dalam merancang dan mengembangkan sistem perangkat lunak kompleks.', NULL, NULL),
(102, 6, 'PL-TI-02', 'Network Security Expert: Spesialis dalam mengamankan infrastruktur jaringan dan audit keamanan siber.', NULL, NULL),
(103, 6, 'PL-TI-03', 'Data Scientist: Ahli pengolah data besar menggunakan model statistik dan algoritma cerdas.', NULL, NULL),
(104, 6, 'PL-TI-04', 'Cloud Architect: Profesional yang mampu merancang arsitektur komputasi awan (Cloud Infrastructure).', NULL, NULL),
(105, 6, 'PL-TI-05', 'IoT Developer: Pengembang sistem terintegrasi perangkat keras dan lunak berbasis internet.', NULL, NULL),
(201, 7, 'PL-MI-01', 'Business Systems Analyst: Analis yang menjembatani kebutuhan bisnis dengan solusi sistem informasi.', NULL, NULL),
(202, 7, 'PL-MI-02', 'Database Administrator: Tenaga ahli pengelola integritas dan performa basis data organisasi.', NULL, NULL),
(203, 7, 'PL-MI-03', 'IT Project Manager: Pemimpin proyek yang mengelola alur kerja dan tim pengembangan sistem.', NULL, NULL),
(204, 7, 'PL-MI-04', 'Digital Technopreneur: Wirausahawan yang mampu menciptakan dan mengelola start-up digital.', NULL, NULL),
(205, 7, 'PL-MI-05', 'IT Quality Assurance: Ahli penjamin kualitas sistem dan audit tata kelola TI.', NULL, NULL);

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
(1, 'Tenaga Pengajar', NULL, NULL),
(2, 'Asisten Ahli', NULL, NULL),
(3, 'Lektor', NULL, NULL),
(4, 'Lektor Kepala', NULL, NULL),
(5, 'Guru Besar', NULL, NULL);

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
(1, 'Ketua', 0, NULL, NULL),
(2, 'Staff', 0, NULL, NULL);

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

--
-- Dumping data untuk tabel `rekognisi_lulusan_detail`
--

INSERT INTO `rekognisi_lulusan_detail` (`id_tahunan`, `id_sumber`, `jenis_pengakuan`, `link_bukti`, `jumlah_mahasiswa_rekognisi`) VALUES
(1, 1, 'Penghargaan Inovasi Teknologi', NULL, 3),
(1, 3, 'Sertifikat Kompetensi Desain Produk', NULL, 3),
(2, 2, 'Sertifikat Kompetensi Web Developer', NULL, 2),
(3, 4, 'Penghargaan Tenaga Profesional', NULL, 2);

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

--
-- Dumping data untuk tabel `rekognisi_lulusan_tahunan`
--

INSERT INTO `rekognisi_lulusan_tahunan` (`id`, `id_unit_prodi`, `id_tahun`, `jumlah_lulusan_ts`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 6, 2025, 97, '2026-01-09 14:02:56', '2026-01-11 14:49:17', NULL, NULL),
(2, 6, 2024, 101, '2026-01-09 14:06:54', '2026-01-11 14:49:17', NULL, NULL),
(3, 6, 2023, 63, '2026-01-09 14:06:54', '2026-01-11 14:49:17', NULL, NULL);

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
(21, 2023, 'Hibah Penelitian Kemendikbudristek', 150000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(22, 2023, 'Dana Yayasan (SPP Mahasiswa)', 2147483647, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(23, 2023, 'Kerjasama Industri (PT Telkom)', 75000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(24, 2024, 'Hibah PKM Wilayah Jawa Timur', 45000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(25, 2024, 'Dana Yayasan (Operasional Kampus)', 2147483647, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(26, 2024, 'Pendanaan Sertifikasi Kompetensi Industri', 120000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(27, 2025, 'Hibah Kompetisi Kampus Merdeka (PKKM)', 300000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 17:00:18', NULL, NULL),
(28, 2025, 'Donasi Alumni & CSR Bank Jatim', 50000000, 'http://localhost:3001/tables', '2026-01-09 16:56:58', '2026-01-09 16:59:09', NULL, NULL);

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
(31, 6, 2025, 'baru', 'reguler', 155, 8, 3, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(32, 6, 2025, 'baru', 'rpl', 25, 2, 0, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(33, 6, 2025, 'aktif', 'reguler', 460, 22, 6, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(34, 6, 2025, 'aktif', 'rpl', 40, 4, 1, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(35, 7, 2025, 'baru', 'reguler', 115, 6, 2, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(36, 7, 2025, 'baru', 'rpl', 15, 1, 0, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(37, 7, 2025, 'aktif', 'reguler', 305, 14, 4, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(38, 7, 2025, 'aktif', 'rpl', 28, 2, 1, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(39, 6, 2023, 'baru', 'reguler', 140, 7, 2, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(40, 6, 2023, 'baru', 'rpl', 20, 1, 0, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(41, 6, 2023, 'aktif', 'reguler', 440, 20, 5, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(42, 6, 2023, 'aktif', 'rpl', 40, 4, 1, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(43, 7, 2023, 'baru', 'reguler', 100, 4, 1, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(44, 7, 2023, 'baru', 'rpl', 10, 0, 0, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(45, 7, 2023, 'aktif', 'reguler', 285, 12, 3, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(46, 7, 2023, 'aktif', 'rpl', 25, 2, 1, '2026-01-09 19:01:24', '2026-01-09 19:01:24', NULL, NULL),
(47, 6, 2024, 'baru', 'reguler', 145, 6, 2, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(48, 6, 2024, 'baru', 'rpl', 22, 2, 1, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(49, 6, 2024, 'aktif', 'reguler', 450, 21, 5, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(50, 6, 2024, 'aktif', 'rpl', 35, 3, 1, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(51, 7, 2024, 'baru', 'reguler', 105, 5, 1, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(52, 7, 2024, 'baru', 'rpl', 12, 0, 0, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(53, 7, 2024, 'aktif', 'reguler', 295, 13, 4, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL),
(54, 7, 2024, 'aktif', 'rpl', 26, 2, 1, '2026-01-09 19:03:38', '2026-01-09 19:03:38', NULL, NULL);

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
(3, 6, 2025, 200, 312, 15, 5, '2026-01-09 18:17:26', '2026-01-09 18:17:26', NULL, NULL),
(4, 7, 2025, 150, 198, 10, 3, '2026-01-09 18:17:26', '2026-01-09 18:17:26', NULL, NULL),
(5, 6, 2023, 180, 245, 12, 4, '2026-01-09 18:17:26', '2026-01-09 18:17:26', NULL, NULL),
(6, 7, 2023, 120, 160, 8, 2, '2026-01-09 18:17:26', '2026-01-09 18:17:26', NULL, NULL),
(9, 6, 2024, 190, 280, 14, 5, '2026-01-09 19:04:10', '2026-01-09 19:04:10', NULL, NULL),
(10, 7, 2024, 130, 180, 9, 2, '2026-01-09 19:04:10', '2026-01-09 19:04:10', NULL, NULL),
(11, 4, 2025, 10, 2, 2, 2, '2026-01-12 04:03:08', '2026-01-12 04:03:08', NULL, NULL);

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
(15, 2, 2025, 'KABUPATEN BULELENG', 'Kota/Kab Lain', 0, 0, 1, 'http://localhost:3001/tables#tab=2a2', '2025-12-22 09:24:24', '2025-12-22 09:24:24', NULL, NULL),
(16, 2, 2025, 'BALI', 'Provinsi Lain', 0, 0, 1, 'http://localhost:3001/tables#tab=2a2', '2025-12-22 09:24:24', '2025-12-22 09:24:24', NULL, NULL),
(17, 2, 2025, 'KABUPATEN BANYUWANGI', 'Sama Kota/Kab', 0, 0, 72, 'http://localhost:3001/tables#tab=2a2', '2025-12-22 09:24:49', '2026-01-09 12:10:52', NULL, NULL),
(18, 2, 2025, 'KABUPATEN SUMENEP', 'Kota/Kab Lain', 0, 0, 1, NULL, '2026-01-09 12:14:07', '2026-01-09 12:14:07', NULL, NULL),
(19, 2, 2025, 'KABUPATEN PATI', 'Kota/Kab Lain', 0, 0, 1, NULL, '2026-01-09 12:14:29', '2026-01-09 12:14:29', NULL, NULL),
(20, 2, 2025, 'JAWA TENGAH', 'Provinsi Lain', 0, 0, 1, NULL, '2026-01-09 12:14:29', '2026-01-09 12:14:29', NULL, NULL),
(21, 2, 2024, 'KABUPATEN BANYUWANGI', 'Sama Kota/Kab', 0, 0, 73, NULL, '2026-01-09 12:15:22', '2026-01-09 12:15:22', NULL, NULL),
(22, 2, 2024, 'KABUPATEN JEMBER', 'Kota/Kab Lain', 0, 0, 1, NULL, '2026-01-09 12:15:40', '2026-01-09 12:15:40', NULL, NULL),
(26, 2, 2023, 'KABUPATEN BANYUWANGI', 'Sama Kota/Kab', 0, 0, 95, NULL, '2026-01-09 12:31:17', '2026-01-09 12:31:17', NULL, NULL),
(27, 2, 2023, 'KABUPATEN JEMBRANA', 'Kota/Kab Lain', 0, 0, 1, NULL, '2026-01-09 12:31:46', '2026-01-09 12:31:46', NULL, NULL),
(28, 2, 2023, 'BALI', 'Provinsi Lain', 0, 0, 1, NULL, '2026-01-09 12:31:47', '2026-01-09 12:31:47', NULL, NULL);

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
(8, 2, 2025, 0, 0, 0, 0, NULL, NULL),
(9, 6, 2023, 165, 480, 75, 4, NULL, NULL),
(10, 7, 2023, 110, 310, 55, 2, NULL, NULL),
(11, 6, 2024, 175, 490, 80, 6, NULL, NULL),
(12, 7, 2024, 125, 320, 58, 3, NULL, NULL),
(13, 6, 2025, 180, 500, 85, 5, NULL, NULL),
(14, 7, 2025, 130, 333, 60, 3, NULL, NULL);

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
(1, 6, 2025, 63, 57, 6, NULL, NULL),
(2, 6, 2024, 101, 94, 0, NULL, NULL),
(3, 6, 2023, 97, 85, 12, NULL, NULL);

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

--
-- Dumping data untuk tabel `tabel_2b5_kesesuaian_kerja`
--

INSERT INTO `tabel_2b5_kesesuaian_kerja` (`id`, `id_unit_prodi`, `id_tahun_lulus`, `jml_infokom`, `jml_non_infokom`, `jml_internasional`, `jml_nasional`, `jml_wirausaha`, `deleted_at`, `deleted_by`) VALUES
(4, 6, 2025, 12, 12, 3, 54, 9, NULL, NULL),
(5, 6, 2024, 64, 64, 5, 89, 11, NULL, NULL),
(6, 6, 2023, 44, 44, 0, 85, 6, NULL, NULL);

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
(1, 6, 2024, 'Kerjasama Tim', 22, 70, 3, 5, NULL, NULL, NULL),
(2, 6, 2024, 'Keahlian di Bidang Prodi', 35, 41, 18, 6, NULL, NULL, NULL),
(3, 6, 2024, 'Kemampuan Berbahasa Asing (Inggris)', 2, 16, 64, 18, NULL, NULL, NULL),
(4, 6, 2024, 'Kemampuan Berkomunikasi', 50, 25, 13, 12, NULL, NULL, NULL),
(5, 6, 2024, 'Pengembangan Diri', 80, 17, 3, 0, NULL, NULL, NULL),
(6, 6, 2024, 'Kepemimpinan', 30, 12, 57, 1, NULL, NULL, NULL),
(7, 6, 2024, 'Etos Kerja', 93, 5, 2, 0, NULL, NULL, NULL);

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
(3, 6, 'Laboratorium Riset Artificial Intelligence', 25, 80.5, 'M', 'L', '20 PC High-End RTX 3060, 2 Server GPU, Fiber Optic 100Mbps, Software Lisensi MATLAB & Python Environment.', 'https://sarpras.stikom.ac.id/aset/lab-ai-2025.pdf', '2026-01-09 19:08:37', '2026-01-09 19:08:37', NULL, NULL),
(4, 7, 'Laboratorium Pengembangan Sistem Informasi', 30, 90, 'M', 'L', '30 Unit PC Core i7, Lisensi Oracle Database, Visual Studio Enterprise, Mikrotik Routerboard.', 'https://sarpras.stikom.ac.id/aset/lab-si-2025.pdf', '2026-01-09 19:08:37', '2026-01-09 19:08:37', NULL, NULL),
(5, 12, 'Data Center & Server Room', 5, 20, 'M', 'L', 'Rack Server Dell PowerEdge, UPS 10KVA, Cooling System Precision, Firewall Fortinet.', 'https://sisfo.stikom.ac.id/aset/server-room.pdf', '2026-01-09 19:08:37', '2026-01-09 19:08:37', NULL, NULL),
(6, 10, 'Ruang Riset Mandiri Perpustakaan', 15, 45, 'M', 'P', 'Akses E-Journal IEEE, ScienceDirect, ProQuest, 5 Terminal Komputer, WiFi 50Mbps.', 'https://perpustakaan.stikom.ac.id/fasilitas/ruang-riset.pdf', '2026-01-09 19:08:37', '2026-01-09 19:08:37', NULL, NULL),
(7, 6, 'Lab Komputasi Cerdas', 25, 60, 'M', 'L', '20 Unit Workstation Core i9, GPU RTX 4080, Lisensi NVIDIA CUDA, MATLAB, & ArcGIS.', NULL, '2026-01-09 19:14:48', '2026-01-09 19:14:48', NULL, NULL);

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
(23, 6, 2022, 10000000, 'https://stikom.ac.id/bukti/dana-penelitian-2022-1.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06'),
(24, 7, 2022, 10000000, 'https://stikom.ac.id/bukti/dana-penelitian-2022-2.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06'),
(25, 8, 2023, 12000000, 'https://stikom.ac.id/bukti/dana-penelitian-2023-1.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06'),
(26, 9, 2023, 12000000, 'https://stikom.ac.id/bukti/dana-penelitian-2023-2.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06'),
(27, 10, 2024, 15000000, 'https://stikom.ac.id/bukti/dana-penelitian-2024-1.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06'),
(28, 11, 2024, 15000000, 'https://stikom.ac.id/bukti/dana-penelitian-2024-2.pdf', '2026-01-09 19:54:06', '2026-01-09 19:54:06');

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
(6, 7, 'https://stikom.ac.id/roadmap-penelitian.pdf', 3, 'Perancangan Website Sebagai Media Penjualan Dengan Metode Rapid Application Development', 1, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL),
(7, 6, 'https://stikom.ac.id/roadmap-penelitian.pdf', 13, 'Penerapan Metode Rapid Application Development Dalam Rancang Bangun Sistem Pariwisata Terintregitas Di Pokdarwis Gombengsari Banyuwangi', 1, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL),
(8, 7, 'https://stikom.ac.id/roadmap-penelitian.pdf', 14, 'Aplikasi Cek Kecocokan Tanah Menggunakan Mikrokontroler Berbasis Android Pada Tanaman Buah Jeruk Banyuwangi', 2, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL),
(9, 6, 'https://stikom.ac.id/roadmap-penelitian.pdf', 1, 'Pengembangan Aplikasi Augmented Reality Untuk Pengenalan Huruf dan Angka Pada Anak Usia Dini', 1, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL),
(10, 6, 'https://stikom.ac.id/roadmap-penelitian.pdf', 1, 'Penerapan Pendekatan Design Thinking Dalam Pengembangan Prototipe UI/UX E-Katalog Produk UMKM Banyuwangi Berbasis Website', 2, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL),
(11, 6, 'https://stikom.ac.id/roadmap-penelitian.pdf', 13, 'Perancangan Website Sebagai Media Informasi Pada Yayasan Pendidikan Darul Ilmi Banyuwangi', 1, 'Penelitian Dosen Pemula', 'L', 1, '2026-01-09 19:50:29', '2026-01-09 19:50:29', NULL, NULL);

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
(2, 6, 2023, 12, 'https://kepegawaian.stikom.ac.id/sk/2023/dtpr-ti.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL),
(3, 6, 2024, 14, 'https://kepegawaian.stikom.ac.id/sk/2024/dtpr-ti.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL),
(4, 6, 2025, 15, 'https://kepegawaian.stikom.ac.id/sk/2025/dtpr-ti.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL),
(5, 7, 2023, 7, 'https://kepegawaian.stikom.ac.id/sk/2023/dtpr-mi.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL),
(6, 7, 2024, 8, 'https://kepegawaian.stikom.ac.id/sk/2024/dtpr-mi.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL),
(7, 7, 2025, 10, 'https://kepegawaian.stikom.ac.id/sk/2025/dtpr-mi.pdf', '2026-01-09 19:30:20', '2026-01-09 19:30:20', NULL, NULL);

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
(2, 6, 1, 'Sertifikasi Internasional Mikrotik Certified Network Associate (MTCNA)', 2023, 'https://stikom.ac.id/bukti/dosen1-2023.pdf', '2026-01-09 19:30:30', '2026-01-09 19:30:30', NULL, NULL),
(3, 6, 4, 'Pelatihan Auditor Mutu Internal Nasional (AIMS)', 2024, 'https://stikom.ac.id/bukti/dosen4-2024.pdf', '2026-01-09 19:30:30', '2026-01-09 19:30:30', NULL, NULL),
(4, 6, 6, 'Studi Lanjut S3 Ilmu Komputer di Universitas Gadjah Mada', 2025, 'https://kepegawaian.stikom.ac.id/sk/s3-pelsri.pdf', '2026-01-09 19:30:30', '2026-01-09 19:30:30', NULL, NULL),
(5, 7, 3, 'Sertifikasi BNSP Skema System Analyst', 2024, 'https://stikom.ac.id/bukti/dosen3-2024.pdf', '2026-01-09 19:30:30', '2026-01-09 19:30:30', NULL, NULL),
(6, 7, 14, 'Workshop Kurikulum Berbasis Outcome (OBE) Nasional', 2025, 'https://stikom.ac.id/bukti/dosen14-2025.pdf', '2026-01-09 19:30:30', '2026-01-09 19:30:30', NULL, NULL);

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

--
-- Dumping data untuk tabel `tabel_3c1_kerjasama_penelitian`
--

INSERT INTO `tabel_3c1_kerjasama_penelitian` (`id`, `id_unit`, `judul_kerjasama`, `mitra_kerja_sama`, `sumber`, `durasi_tahun`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 'Program Magang Mahasiswa dan Rekrutmen Bidang Logistik Pelabuhan', 'PT Pelindo', 'N', 1, '', '2026-01-09 15:01:12', '2026-01-09 15:01:12', NULL, NULL),
(2, 2, 'Riset Bersama Manajemen Pariwisata Bahari Berkelanjutan', 'Dinas Pariwisata', 'L', 1, '', '2026-01-09 15:03:51', '2026-01-09 15:03:51', NULL, NULL);

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

--
-- Dumping data untuk tabel `tabel_3c1_pendanaan_kerjasama`
--

INSERT INTO `tabel_3c1_pendanaan_kerjasama` (`id_pendanaan`, `id_kerjasama`, `id_tahun`, `jumlah_dana`) VALUES
(4, 1, 2024, 10000000),
(5, 2, 2025, 5000000);

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

--
-- Dumping data untuk tabel `tabel_3c2_publikasi_penelitian`
--

INSERT INTO `tabel_3c2_publikasi_penelitian` (`id`, `id_dosen`, `judul_publikasi`, `jenis_publikasi`, `id_tahun_terbit`, `link_bukti`, `id_unit`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 3, 'Penerapan Metode Rapid Application Development (RAD) Pada Transformasi Digital Penjualan Kue Khas Banyuwangi', 'S4', 2022, 'https://ejournal.stikom-bwi.ac.id/index.php/jti/article/view/101', 7, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(2, 6, 'Pengembangan Sistem Aplikasi Kegiatan MERDEKA BELAJAR - KAMPUS MERDEKA di STIKOM PGRI Banyuwangi', 'S3', 2022, 'https://ejournal.stikom-bwi.ac.id/index.php/jti/article/view/102', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(3, 7, 'Pemanfaatan Computer Vision Untuk Pengenalan Wajah Pada Aplikasi Android', 'S3', 2022, 'https://jurnal-nasional.com/index.php/inf/article/view/201', 7, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(4, 1, 'Analisis Keamanan Jaringan Wireless Menggunakan Metode PPDIOO Pada Instansi Pemerintah', 'S2', 2023, 'https://sinta.kemdikbud.go.id/journals/detail?id=501', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(5, 13, 'Sistem Informasi Geografis Dalam Pemetaan Sebaran UMKM Laundry Di Wilayah Kabupaten Banyuwangi', 'S4', 2023, 'https://jurnal-gis.id/index.php/jgs/article/view/401', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(6, 14, 'Aplikasi Cek Kecocokan Tanah Menggunakan Mikrokontroler Berbasis Android Pada Tanaman Buah Jeruk', 'S3', 2023, 'https://ejournal.stikom-bwi.ac.id/index.php/jti/article/view/105', 7, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(7, 4, 'Tantangan Dan Peluang Penerapan Digital Transformation Menggunakan RACE Planning Framework Pada Startup Digital', 'S2', 2024, 'https://jurnal-ti.org/index.php/jti/article/view/301', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(8, 15, 'Penerapan Algoritma K-Means Untuk Klasterisasi Data Prestasi Mahasiswa Berbasis Web', 'S3', 2024, 'https://ejournal.stikom-bwi.ac.id/index.php/jti/article/view/505', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL),
(9, 12, 'Penerapan Metode Rapid Application Development Dalam Rancang Bangun Sistem Pariwisata Terintegrasi', 'I', 2024, 'https://international-journal.com/index.php/ij/article/view/701', 6, '2026-01-09 20:03:26', NULL, NULL, NULL, NULL, NULL);

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

--
-- Dumping data untuk tabel `tabel_3c3_hki`
--

INSERT INTO `tabel_3c3_hki` (`id`, `id_dosen`, `judul_hki`, `jenis_hki`, `id_tahun_perolehan`, `link_bukti`, `id_unit`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 3, 'Program Komputer: Sistem Transformasi Digital Penjualan Kue Khas Banyuwangi', 'Hak Cipta', 2022, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202201', 7, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(2, 6, 'Program Komputer: Sistem Aplikasi Kegiatan Merdeka Belajar Kampus Merdeka (MBKM)', 'Hak Cipta', 2022, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202202', 6, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(3, 7, 'Program Komputer: Aplikasi Pengenalan Wajah Berbasis Computer Vision di Android', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202301', 7, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(4, 13, 'Program Komputer: Sistem Informasi Geografis Pemetaan Sebaran UMKM Laundry', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202302', 6, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(5, 1, 'Program Komputer: Media Pembelajaran Augmented Reality Huruf Dan Angka Anak Usia Dini', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202303', 6, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(6, 14, 'Alat Deteksi Kematangan Buah Jeruk Berbasis Pengolahan Citra Digital', 'Paten Sederhana', 2024, 'https://pdaki.dgip.go.id/detail/S002024001', 7, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL),
(7, 4, 'Program Komputer: Prototipe UI/UX E-Katalog Produk UMKM Menggunakan Design Thinking', 'Hak Cipta', 2024, 'https://e-hakcipta.dgip.go.id/index.php/register/EC00202401', 6, '2026-01-09 20:05:42', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4a1_sarpras_pkm`
--

CREATE TABLE `tabel_4a1_sarpras_pkm` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Sarpras)',
  `nama_sarpras` varchar(255) NOT NULL,
  `daya_tampung` int(11) DEFAULT NULL,
  `luas_ruang_m2` float DEFAULT NULL,
  `kepemilikan` enum('M','W') DEFAULT NULL COMMENT 'M: Milik Sendiri, W: Sewa',
  `lisensi` enum('L','P','T') DEFAULT NULL COMMENT 'L: Berlisensi, P: Public Domain, T: Tdk Berlisensi',
  `perangkat_detail` text DEFAULT NULL COMMENT 'Isi: perangkat keras, lunak, bandwidth, dll.',
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4a1_sarpras_pkm`
--

INSERT INTO `tabel_4a1_sarpras_pkm` (`id`, `id_unit`, `nama_sarpras`, `daya_tampung`, `luas_ruang_m2`, `kepemilikan`, `lisensi`, `perangkat_detail`, `link_bukti`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 12, 'Laboratorium Komputer & Multimedia', 30, 80.5, 'M', 'L', '30 Unit PC High-End (Core i7, 16GB RAM), Pen Tablet, Software Adobe Creative Cloud Berlisensi, High Speed Internet 100Mbps.', 'https://sarpras.stikom-bwi.ac.id/bukti/lab-multimedia.pdf', '2026-01-09 20:09:56', 1, NULL, NULL, NULL, NULL),
(3, 6, 'Laboratorium Jaringan & Keamanan Sistem', 25, 75, 'M', 'L', 'Router MikroTik (RB4011), Switch Cisco, Server Dell PowerEdge, Tools Audit Jaringan, Bandwidth Dedicated 1:1.', 'https://sarpras.stikom-bwi.ac.id/bukti/lab-jaringan.pdf', '2026-01-09 20:09:56', 1, NULL, NULL, NULL, NULL),
(4, 7, 'Laboratorium Rekayasa Perangkat Lunak', 30, 90, 'M', 'L', '30 Unit Workstation, Lisensi Windows 11 Enterprise, Visual Studio, Database Oracle, Tools DevOps (Docker, Jenkins).', 'https://sarpras.stikom-bwi.ac.id/bukti/lab-rpl.pdf', '2026-01-09 20:09:56', 1, NULL, NULL, NULL, NULL),
(5, 12, 'Pusat Inovasi & Pengabdian Masyarakat', 20, 50, 'M', 'P', 'Smart TV 65 Inch untuk Presentasi, Proyektor 4000 Lumens, Sound System, Perangkat IoT (Arduino, Raspberry Pi, Sensor Tanah).', 'https://sarpras.stikom-bwi.ac.id/bukti/pusat-inovasi.pdf', '2026-01-09 20:09:56', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4a2_pendanaan_pkm`
--

CREATE TABLE `tabel_4a2_pendanaan_pkm` (
  `id_pendanaan` int(11) NOT NULL,
  `id_pkm` int(11) NOT NULL COMMENT 'Relasi ke tabel_4a2_pkm.id (Induk)',
  `id_tahun` int(11) NOT NULL COMMENT 'Relasi ke tahun_akademik.id_tahun',
  `jumlah_dana` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4a2_pendanaan_pkm`
--

INSERT INTO `tabel_4a2_pendanaan_pkm` (`id_pendanaan`, `id_pkm`, `id_tahun`, `jumlah_dana`) VALUES
(1, 1, 2022, 5000000),
(2, 2, 2022, 5000000),
(3, 3, 2023, 7500000),
(4, 4, 2023, 7500000),
(5, 5, 2024, 8000000),
(6, 6, 2024, 8000000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4a2_pkm`
--

CREATE TABLE `tabel_4a2_pkm` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (LPPM)',
  `link_roadmap` text DEFAULT NULL,
  `id_dosen_ketua` int(11) NOT NULL COMMENT 'Relasi ke dosen.id_dosen',
  `judul_pkm` text NOT NULL,
  `jml_mhs_terlibat` int(11) DEFAULT 0,
  `jenis_hibah_pkm` varchar(255) DEFAULT NULL,
  `sumber_dana` enum('L','N','I') DEFAULT NULL COMMENT 'L: Lokal, N: Nasional, I: Internasional',
  `durasi_tahun` int(11) DEFAULT NULL,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4a2_pkm`
--

INSERT INTO `tabel_4a2_pkm` (`id`, `id_unit`, `link_roadmap`, `id_dosen_ketua`, `judul_pkm`, `jml_mhs_terlibat`, `jenis_hibah_pkm`, `sumber_dana`, `durasi_tahun`, `link_bukti`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 7, 'https://stikom.ac.id/roadmap-pkm.pdf', 14, 'Pendampingan Penggunaan Media Pembelajaran Multimedia Di SMK Negeri 1 Banyuwangi', 2, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL),
(2, 7, 'https://stikom.ac.id/roadmap-pkm.pdf', 7, 'Persiapan Dan Implementasi Rapot Digital Madrasah Pada Kelompok Kerja Madrasah Kecamatan Giri', 2, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL),
(3, 6, 'https://stikom.ac.id/roadmap-pkm.pdf', 2, 'Pelatihan Dasar Jaringan Komputer Bagi Guru SMP Mata Pelajaran Informatika Di MGMP TIK SMP Banyuwangi', 1, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL),
(4, 6, 'https://stikom.ac.id/roadmap-pkm.pdf', 2, 'Pelatihan Manajemen Dan Keamanan Jaringan Berbasis Mikrotik Di SMK Nurut Taqwa', 1, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL),
(5, 6, 'https://stikom.ac.id/roadmap-pkm.pdf', 15, 'Pembuatan Landing Page Digital Marketing Produk UMKM Jamur Tiram Sunawan Di Kabupaten Banyuwangi', 1, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL),
(6, 6, 'https://stikom.ac.id/roadmap-pkm.pdf', 13, 'Pemanfaatan Desain Poster Sebagai Sarana Publikasi Kedai Es Koffie Cap Lyon', 1, 'PkM Dana Mandiri', 'L', 1, 'https://stikom.ac.id/bukti-pkm.pdf', '2026-01-09 19:50:38', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4c1_kerjasama_pkm`
--

CREATE TABLE `tabel_4c1_kerjasama_pkm` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (LPPM)',
  `judul_kerjasama` text NOT NULL,
  `mitra_kerja_sama` varchar(255) NOT NULL,
  `sumber` enum('L','N','I') NOT NULL COMMENT 'L: Lokal, N: Nasional, I: Internasional',
  `durasi_tahun` int(11) DEFAULT NULL,
  `link_bukti` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4c1_kerjasama_pkm`
--

INSERT INTO `tabel_4c1_kerjasama_pkm` (`id`, `id_unit`, `judul_kerjasama`, `mitra_kerja_sama`, `sumber`, `durasi_tahun`, `link_bukti`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 2, 'Pengembangan Ekowisata dan Konservasi di Taman Nasional Alas Purwo', 'Dinas Pariwisata', 'L', 2, '', '2026-01-09 14:37:18', 2, NULL, NULL, NULL, NULL),
(2, 2, 'Penyaluran Beasiswa Pendidikan untuk Mahasiswa Berprestasi', 'Dinas Pendidikan', 'N', 3, '', '2026-01-09 14:39:41', 2, '2026-01-09 14:40:06', 2, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4c1_pendanaan_pkm`
--

CREATE TABLE `tabel_4c1_pendanaan_pkm` (
  `id_pendanaan` int(11) NOT NULL,
  `id_kerjasama_pkm` int(11) NOT NULL COMMENT 'Relasi ke tabel_4c1_kerjasama_pkm.id (Induk)',
  `id_tahun` int(11) NOT NULL COMMENT 'Relasi ke tahun_akademik.id_tahun',
  `jumlah_dana` bigint(20) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4c1_pendanaan_pkm`
--

INSERT INTO `tabel_4c1_pendanaan_pkm` (`id_pendanaan`, `id_kerjasama_pkm`, `id_tahun`, `jumlah_dana`) VALUES
(1, 1, 2024, 2000000),
(3, 2, 2025, 10000000);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4c2_diseminasi_pkm`
--

CREATE TABLE `tabel_4c2_diseminasi_pkm` (
  `id` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL COMMENT 'Relasi ke tabel dosen.id_dosen',
  `judul_pkm` text NOT NULL COMMENT 'Judul PkM yang didiseminasi',
  `jenis_diseminasi` enum('L','N','I') NOT NULL COMMENT 'L: Lokal, N: Nasional, I: Internasional',
  `id_tahun_diseminasi` int(11) NOT NULL COMMENT 'Relasi ke tahun_akademik.id_tahun',
  `link_bukti` text DEFAULT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Prodi/LPPM)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_4c2_diseminasi_pkm`
--

INSERT INTO `tabel_4c2_diseminasi_pkm` (`id`, `id_dosen`, `judul_pkm`, `jenis_diseminasi`, `id_tahun_diseminasi`, `link_bukti`, `id_unit`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 15, 'Pendampingan Dan Pembuatan Landingpage Serta Media Sosial Untuk Promosi Banana88 Trans And Travel', 'N', 2023, 'https://jurnal.stikom-bwi.ac.id/index.php/sinergi/article/view/201', 6, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(2, 12, 'Pemanfaatan Sistem Informasi Digital Untuk Pembuatan Surat Tugas Dan Pengajuan Cuti Di Pengadilan Agama Banyuwangi', 'N', 2024, 'https://jurnal.stikom-bwi.ac.id/index.php/petik/article/view/305', 6, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(3, 10, 'Pendampingan Pembuatan Website Untuk Sistem Informasi Panti Asuhan Budi Mulya', 'N', 2024, 'https://jurnal.stikom-bwi.ac.id/index.php/abdira/article/view/402', 6, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(4, 3, 'Pelatihan Penggunaan Aplikasi Pencatatan Infaq Masjid Agung Baiturrahman Banyuwangi', 'L', 2023, 'https://stikom-bwi.ac.id/berita/pkm-masjid-baiturrahman', 7, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(5, 14, 'Pendampingan Penggunaan Media Pembelajaran Multimedia Di SMK Negeri 1 Banyuwangi', 'N', 2022, 'https://jurnal-pkm.org/index.php/jpkm/article/view/501', 7, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(6, 1, 'Pelatihan Pembuatan Desain User Interface Aplikasi Mobile Kepada Siswa Jurusan DKV di SMKN 1 Banyuwangi', 'L', 2023, 'https://stikom-bwi.ac.id/berita/pkm-smkn1-dkv', 6, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL),
(7, 7, 'Persiapan Dan Implementasi Rapot Digital Madrasah Pada Kelompok Kerja Madrasah Kecamatan Giri', 'N', 2022, 'https://jurnal-edukasi.id/index.php/jed/article/view/602', 7, '2026-01-09 20:13:27', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_4c3_hki_pkm`
--

CREATE TABLE `tabel_4c3_hki_pkm` (
  `id` int(11) NOT NULL,
  `id_dosen` int(11) NOT NULL COMMENT 'Relasi ke tabel dosen.id_dosen',
  `judul_hki` text NOT NULL COMMENT 'Judul lengkap HKI PkM',
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

--
-- Dumping data untuk tabel `tabel_4c3_hki_pkm`
--

INSERT INTO `tabel_4c3_hki_pkm` (`id`, `id_dosen`, `judul_hki`, `jenis_hki`, `id_tahun_perolehan`, `link_bukti`, `id_unit`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 14, 'Modul Pelatihan: Media Pembelajaran Multimedia Interaktif Untuk Guru SMK', 'Hak Cipta', 2022, 'https://e-hakcipta.dgip.go.id/register/PKM2022001', 7, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(2, 7, 'Program Komputer: Sistem Rapot Digital Madrasah (RDM) Terintegrasi', 'Hak Cipta', 2022, 'https://e-hakcipta.dgip.go.id/register/PKM2022002', 7, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(3, 2, 'Video Karya Sinematografi: Panduan Konfigurasi Jaringan Mikrotik Untuk Pemula', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/register/PKM2023001', 6, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(4, 12, 'Program Komputer: Sistem Informasi Pengajuan Cuti Digital Pengadilan Agama', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/register/PKM2023002', 6, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(5, 10, 'Karya Tulis: Panduan Tata Kelola Administrasi Digital Panti Asuhan', 'Hak Cipta', 2023, 'https://e-hakcipta.dgip.go.id/register/PKM2023003', 6, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(6, 15, 'Karya Seni Rupa: Desain Landing Page Digital Marketing Produk UMKM Jamur Tiram', 'Hak Cipta', 2024, 'https://e-hakcipta.dgip.go.id/register/PKM2024001', 6, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL),
(7, 6, 'Buku Panduan: Manajemen Desain Produk Seni Kriya Bagi Pelaku UMKM Souvenir', 'Hak Cipta', 2024, 'https://e-hakcipta.dgip.go.id/register/PKM2024002', 6, '2026-01-09 20:15:23', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_5_1_sistem_tata_kelola`
--

CREATE TABLE `tabel_5_1_sistem_tata_kelola` (
  `id` int(11) NOT NULL,
  `jenis_tata_kelola` varchar(255) NOT NULL COMMENT 'Jenis Tata Kelola (Pendidikan, Keuangan, SDM, Sarana Prasarana, Sistem Penjaminan Mutu, dll)',
  `nama_sistem_informasi` varchar(255) NOT NULL COMMENT 'Nama Sistem Informasi',
  `akses` enum('Lokal','Internet') DEFAULT NULL COMMENT 'Akses: Lokal atau Internet',
  `id_unit_pengelola` int(11) NOT NULL COMMENT 'FK ke unit_kerja.id_unit (Unit Kerja Pengelola)',
  `link_bukti` text DEFAULT NULL COMMENT 'Link Bukti',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_5_1_sistem_tata_kelola`
--

INSERT INTO `tabel_5_1_sistem_tata_kelola` (`id`, `jenis_tata_kelola`, `nama_sistem_informasi`, `akses`, `id_unit_pengelola`, `link_bukti`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 'Pendidikan', 'SIAKAD (Sistem Informasi Akademik)', 'Internet', 13, 'https://siakad.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(2, 'Keuangan', 'SI-Keuangan (Sistem Informasi Pengelolaan Dana)', 'Internet', 11, 'https://keuangan.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(3, 'SDM', 'SIMPEG (Sistem Informasi Manajemen Kepegawaian)', 'Internet', 18, 'https://simpeg.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(4, 'Sarana Prasarana', 'Sistem Manajemen Aset & Inventaris', 'Lokal', 12, 'https://sarpras-lokal.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(5, 'Sistem Penjaminan Mutu', 'E-SPMI (Audit Mutu Internal & Standar Mutu)', 'Internet', 4, 'https://tpm.stikom-bwi.ac.id/spmi', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(6, 'Penelitian & Pengabdian Masyarakat', 'SIMLITABMAS STIKOM Banyuwangi', 'Internet', 5, 'https://lppm.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL),
(7, 'Perpustakaan', 'SLiMS (Senayan Library Management System)', 'Internet', 10, 'https://perpus.stikom-bwi.ac.id', '2026-01-09 20:17:54', '2026-01-09 20:17:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_5_2_sarpras_pendidikan`
--

CREATE TABLE `tabel_5_2_sarpras_pendidikan` (
  `id` int(11) NOT NULL,
  `id_unit` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Sarpras)',
  `nama_sarpras` varchar(255) NOT NULL COMMENT 'Nama Prasarana (misal: ruang kelas, laboratorium, perpustakaan/ruang baca, dsb)',
  `daya_tampung` int(11) DEFAULT NULL COMMENT 'Daya Tampung (jika relevan)',
  `luas_ruang_m2` float DEFAULT NULL COMMENT 'Luas Ruang (m²)',
  `kepemilikan` enum('M','W') DEFAULT NULL COMMENT 'M: Milik Sendiri, W: Sewa',
  `lisensi` enum('L','P','T') DEFAULT NULL COMMENT 'L: Berlisensi, P: Public Domain, T: Tdk Berlisensi',
  `perangkat_detail` text DEFAULT NULL COMMENT 'Perangkat keras, perangkat lunak, bandwidth, device, tool dan bahan pustaka, dll.',
  `link_bukti` text DEFAULT NULL COMMENT 'Link Bukti',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_5_2_sarpras_pendidikan`
--

INSERT INTO `tabel_5_2_sarpras_pendidikan` (`id`, `id_unit`, `nama_sarpras`, `daya_tampung`, `luas_ruang_m2`, `kepemilikan`, `lisensi`, `perangkat_detail`, `link_bukti`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 12, 'Ruang Kelas Teori A.101', 40, 64, 'M', 'L', 'Smart Projector, AC 2 PK, Sound System, Kursi Kuliah Ergonomis, Whiteboard, WiFi 50Mbps.', 'https://sarpras.stikom-bwi.ac.id/fasilitas/kelas-a101.pdf', '2026-01-09 20:18:55', 1, NULL, NULL, NULL, NULL),
(2, 6, 'Laboratorium Rekayasa Perangkat Lunak', 30, 80, 'M', 'L', '30 Unit PC Core i7 Gen 12, RAM 16GB, SSD 512GB, Lisensi Windows 11 Enterprise, Visual Studio, Docker, Tools DevOps.', 'https://sarpras.stikom-bwi.ac.id/fasilitas/lab-rpl.pdf', '2026-01-09 20:18:55', 1, NULL, NULL, NULL, NULL),
(3, 7, 'Laboratorium Sistem Informasi Bisnis', 25, 75, 'M', 'L', '25 Unit PC, Lisensi Oracle Database 19c, SAP ERP Student Version, Microsoft Visio, Enterprise Architect Tools.', 'https://sarpras.stikom-bwi.ac.id/fasilitas/lab-si.pdf', '2026-01-09 20:18:55', 1, NULL, NULL, NULL, NULL),
(4, 10, 'Perpustakaan Pusat & Digital Library', 50, 120, 'M', 'P', '10 Terminal Komputer Akses Jurnal, Koleksi Buku Teks (3.000 Judul), Akses E-Journal IEEE & ScienceDirect, Software SLiMS.', 'https://perpus.stikom-bwi.ac.id/profil/sarana.pdf', '2026-01-09 20:18:55', 1, NULL, NULL, NULL, NULL),
(5, 10, 'Ruang Baca & Diskusi Mandiri', 20, 45, 'M', 'P', 'Meja Diskusi Kelompok, Stop Kontak di Setiap Meja, WiFi Dedicated 100Mbps, Smart TV untuk Presentasi Mandiri.', 'https://perpus.stikom-bwi.ac.id/profil/ruang-baca.pdf', '2026-01-09 20:18:55', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `tabel_6_kesesuaian_visi_misi`
--

CREATE TABLE `tabel_6_kesesuaian_visi_misi` (
  `id` int(11) NOT NULL,
  `id_unit_prodi` int(11) NOT NULL COMMENT 'Relasi ke unit_kerja.id_unit (Program Studi)',
  `visi_pt` text DEFAULT NULL COMMENT 'Visi Perguruan Tinggi (PT)',
  `visi_upps` text DEFAULT NULL COMMENT 'Visi UPPS',
  `visi_keilmuan_ps` text DEFAULT NULL COMMENT 'Visi Keilmuan Program Studi (PS)',
  `misi_pt` text DEFAULT NULL COMMENT 'Misi Perguruan Tinggi (PT)',
  `misi_upps` text DEFAULT NULL COMMENT 'Misi UPPS',
  `link_bukti` text DEFAULT NULL COMMENT 'Link Bukti (VMTS, rencana pengembangan strategis, pengakuan/apresiasi)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL COMMENT 'Relasi ke users.id_user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tabel_6_kesesuaian_visi_misi`
--

INSERT INTO `tabel_6_kesesuaian_visi_misi` (`id`, `id_unit_prodi`, `visi_pt`, `visi_upps`, `visi_keilmuan_ps`, `misi_pt`, `misi_upps`, `link_bukti`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 6, 'Menjadi Sekolah Tinggi Ilmu Komputer yang Mampu Bersaing di Tingkat Nasional Berbasis Inovasi Melalui Proses Pendidikan, Penelitian dan Pengabdian Kepada Masyarakat', 'Menjadi Program Studi Yang Mampu Bersaing Di Tingkat Nasional dalam bidang Rekayasa Perangkat Lunak yang menghasilkan lulusan berjiwa technopreneurship pada tahun 2025', 'Menjadi Program Studi Yang Mampu Bersaing Di Tingkat Nasional dalam bidang manajemen informatika pada tahun 2025 dengan menghasilkan lulusan yang terampil dan profesional', 'a. Membentuk moral yang ber-KeTuhanan Yang Maha Esa sebagai pilar kekuatan kampus.\r\nb. Menyelenggarakan Pendidikan berstandar nasional serta membangun karakter bangsa dalam mengembangkan ilmu pengetahuan dan teknologi, seni budaya, untuk menyiapkan intelektual berkarakter, berjiwa dan berkemampuan entrepreneur melalui penciptaan yang inovatif yang berkualitas.\r\nc. Memotivasi dosen melakukan penelitian dan pengabdian kepada masyarakat berorientasi pada diseminasi dan publikasi.\r\nd. Meningkatkan kapasitas sumberdaya manusia baik dosen maupun tenaga kependidikan.\r\ne. Meningkatkan jaringan Kerjasama', 'a. Menyelenggarakan Pendidikan tinggi di bidang informatika yang berkualitas dalam rangka mendukung terciptanya jiwa technopreneurship\r\nb. Melaksanakan kegiatan penelitian guna menghasilkan karya ilmiah dalam bidang informatika yang bertaraf nasional\r\nc. Melaksanakan pengabdian masyarakat untuk memberikan solusi praktis terhadap permasalahan di masyarakat dalam upaya meningkatkan kualitas hidup', NULL, '2026-01-09 15:06:35', NULL, NULL, NULL, NULL, NULL);

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
(2018, '2018/2019', NULL, NULL),
(2019, '2019/2020', NULL, NULL),
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tenaga_kependidikan`
--

INSERT INTO `tenaga_kependidikan` (`id_tendik`, `id_pegawai`, `jenis_tendik`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 8, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(2, 9, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(3, 10, 'Pustakawan', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(4, 11, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(5, 12, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(6, 13, 'Pranata Komputer', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(7, 14, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(8, 15, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(10, 17, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(11, 18, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(12, 19, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(13, 20, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(14, 21, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(15, 22, 'Teknisi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(16, 23, 'Teknisi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(17, 24, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(18, 25, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(19, 26, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(20, 27, 'Administrasi', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(21, 43, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(22, 44, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(23, 45, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(24, 46, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(25, 47, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(26, 48, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(27, 49, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL),
(28, 50, 'Lainnya', '2025-12-17 21:37:35', '2025-12-17 21:37:35', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `unit_kerja`
--

CREATE TABLE `unit_kerja` (
  `id_unit` int(11) NOT NULL,
  `nama_unit` varchar(100) NOT NULL,
  `kode_role` varchar(50) DEFAULT NULL COMMENT 'Kode role untuk sistem (misal: lppm, prodi, waket1)',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `unit_kerja`
--

INSERT INTO `unit_kerja` (`id_unit`, `nama_unit`, `kode_role`, `deleted_at`, `deleted_by`) VALUES
(1, 'Ketua STIKOM', 'ketua', NULL, NULL),
(2, 'Wakil Ketua I', 'waket1', NULL, NULL),
(3, 'Wakil Ketua II', 'waket2', NULL, NULL),
(4, 'TPM', 'tpm', NULL, NULL),
(5, 'LPPM', 'lppm', NULL, NULL),
(6, 'Prodi Teknik Informatika', 'prodi', NULL, NULL),
(7, 'Prodi Manajemen Informatika', 'prodi', NULL, NULL),
(8, 'Administrasi Akademik', 'ala', NULL, NULL),
(9, 'Kemahasiswaan & Alumni', 'kemahasiswaan', NULL, NULL),
(10, 'Perpustakaan', 'perpustakaan', NULL, NULL),
(11, 'Administrasi Umum & Keuangan', 'keuangan', NULL, NULL),
(12, 'Sarpras', 'sarpras', NULL, NULL),
(13, 'Sisfo & Maintenance', 'sisfo', NULL, NULL),
(14, 'Humas & Kerjasama', 'kerjasama', NULL, NULL),
(15, 'UPT Promosi & Publikasi', 'promosi', NULL, NULL),
(16, 'UPT Unit Usaha', 'unit_usaha', NULL, NULL),
(17, 'Keamanan & Kebersihan', 'umum', NULL, NULL),
(18, 'Kepegawaian', 'kepegawaian', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `id_pegawai` int(11) NOT NULL,
  `id_unit` int(11) DEFAULT NULL COMMENT 'Unit kerja untuk user ini',
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `id_pegawai`, `id_unit`, `username`, `password`, `is_active`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 1, 'ketua', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(2, 2, 2, 'waket1', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(3, 3, 3, 'waket2', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(4, 4, 4, 'tpm', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(5, 5, 5, 'lppm', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(6, 6, 6, 'kaprodi_ti', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(7, 7, 7, 'kaprodi_mi', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(8, 8, 8, 'ala', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(9, 9, 9, 'kemahasiswaan', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(10, 11, 11, 'keuangan', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(11, 12, 12, 'sarpras', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(12, 13, 13, 'sisfo', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(13, 14, 14, 'kerjasama', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(14, 15, 15, 'promosi', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 1, '2025-12-17 21:38:35', '2026-01-14 15:33:00', NULL, NULL),
(18, 12, 18, 'kepegawaian', '$2b$10$r8Jm8UvNVdoMGwpJOrKllOQPt7CFsv1ZODfsEpr8UzwhyIvVNb8xi', 1, '2026-01-14 15:38:54', '2026-01-14 15:38:54', NULL, NULL);

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
-- Indeks untuk tabel `berita`
--
ALTER TABLE `berita`
  ADD PRIMARY KEY (`id_berita`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_prioritas` (`prioritas`),
  ADD KEY `idx_tanggal_publikasi` (`tanggal_publikasi`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `deleted_by` (`deleted_by`);

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
  ADD KEY `id_jafung` (`id_jafung`),
  ADD KEY `fk_dosen_homebase` (`id_unit_homebase`);

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
  ADD PRIMARY KEY (`id_pegawai`),
  ADD KEY `idx_pegawai_unit` (`id_unit`),
  ADD KEY `idx_pegawai_jabatan` (`id_jabatan`);

--
-- Indeks untuk tabel `pegawai_unit`
--
ALTER TABLE `pegawai_unit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_pegawai_unit` (`id_pegawai`,`id_unit`) USING BTREE,
  ADD KEY `idx_pegawai` (`id_pegawai`),
  ADD KEY `idx_unit` (`id_unit`),
  ADD KEY `idx_primary` (`is_primary`);

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
-- Indeks untuk tabel `tabel_4a1_sarpras_pkm`
--
ALTER TABLE `tabel_4a1_sarpras_pkm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_4a1_id_unit` (`id_unit`),
  ADD KEY `idx_4a1_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_4a2_pendanaan_pkm`
--
ALTER TABLE `tabel_4a2_pendanaan_pkm`
  ADD PRIMARY KEY (`id_pendanaan`),
  ADD KEY `idx_4a2_pendanaan_id_pkm` (`id_pkm`),
  ADD KEY `idx_4a2_pendanaan_id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_4a2_pkm`
--
ALTER TABLE `tabel_4a2_pkm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_4a2_id_unit` (`id_unit`),
  ADD KEY `idx_4a2_id_dosen_ketua` (`id_dosen_ketua`),
  ADD KEY `idx_4a2_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_4c1_kerjasama_pkm`
--
ALTER TABLE `tabel_4c1_kerjasama_pkm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_4c1_id_unit` (`id_unit`),
  ADD KEY `idx_4c1_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_4c1_pendanaan_pkm`
--
ALTER TABLE `tabel_4c1_pendanaan_pkm`
  ADD PRIMARY KEY (`id_pendanaan`),
  ADD KEY `idx_4c1_pendanaan_id_kerjasama_pkm` (`id_kerjasama_pkm`),
  ADD KEY `idx_4c1_pendanaan_id_tahun` (`id_tahun`);

--
-- Indeks untuk tabel `tabel_4c2_diseminasi_pkm`
--
ALTER TABLE `tabel_4c2_diseminasi_pkm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_4c2_id_dosen` (`id_dosen`),
  ADD KEY `idx_4c2_id_tahun` (`id_tahun_diseminasi`),
  ADD KEY `idx_4c2_id_unit` (`id_unit`),
  ADD KEY `idx_4c2_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_4c3_hki_pkm`
--
ALTER TABLE `tabel_4c3_hki_pkm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_4c3_id_dosen` (`id_dosen`),
  ADD KEY `idx_4c3_id_tahun_perolehan` (`id_tahun_perolehan`),
  ADD KEY `idx_4c3_id_unit` (`id_unit`),
  ADD KEY `idx_4c3_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_5_1_sistem_tata_kelola`
--
ALTER TABLE `tabel_5_1_sistem_tata_kelola`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit_pengelola` (`id_unit_pengelola`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_5_2_sarpras_pendidikan`
--
ALTER TABLE `tabel_5_2_sarpras_pendidikan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `tabel_6_kesesuaian_visi_misi`
--
ALTER TABLE `tabel_6_kesesuaian_visi_misi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unik_prodi` (`id_unit_prodi`),
  ADD KEY `deleted_at` (`deleted_at`);

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
  ADD KEY `fk_users_unit_kerja` (`id_unit`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `audit_mutu_internal`
--
ALTER TABLE `audit_mutu_internal`
  MODIFY `id_ami` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `bentuk_pembelajaran_master`
--
ALTER TABLE `bentuk_pembelajaran_master`
  MODIFY `id_bentuk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `berita`
--
ALTER TABLE `berita`
  MODIFY `id_berita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `cpl`
--
ALTER TABLE `cpl`
  MODIFY `id_cpl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT untuk tabel `cpmk`
--
ALTER TABLE `cpmk`
  MODIFY `id_cpmk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT untuk tabel `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `fleksibilitas_pembelajaran_tahunan`
--
ALTER TABLE `fleksibilitas_pembelajaran_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `mata_kuliah`
--
ALTER TABLE `mata_kuliah`
  MODIFY `id_mk` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT untuk tabel `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT untuk tabel `pegawai_unit`
--
ALTER TABLE `pegawai_unit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT untuk tabel `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT untuk tabel `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT untuk tabel `profil_lulusan`
--
ALTER TABLE `profil_lulusan`
  MODIFY `id_pl` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT untuk tabel `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  MODIFY `id_jafung` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `ref_jabatan_struktural`
--
ALTER TABLE `ref_jabatan_struktural`
  MODIFY `id_jabatan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `rekognisi_lulusan_tahunan`
--
ALTER TABLE `rekognisi_lulusan_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  MODIFY `id_sumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT untuk tabel `sumber_rekognisi_master`
--
ALTER TABLE `sumber_rekognisi_master`
  MODIFY `id_sumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a1_mahasiswa_baru_aktif`
--
ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a1_pendaftaran`
--
ALTER TABLE `tabel_2a1_pendaftaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a2_keragaman_asal`
--
ALTER TABLE `tabel_2a2_keragaman_asal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT untuk tabel `tabel_2a3_kondisi_mahasiswa`
--
ALTER TABLE `tabel_2a3_kondisi_mahasiswa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b4_masa_tunggu`
--
ALTER TABLE `tabel_2b4_masa_tunggu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b5_kesesuaian_kerja`
--
ALTER TABLE `tabel_2b5_kesesuaian_kerja`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tabel_2b6_kepuasan_pengguna`
--
ALTER TABLE `tabel_2b6_kepuasan_pengguna`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a1_sarpras_penelitian`
--
ALTER TABLE `tabel_3a1_sarpras_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a2_pendanaan`
--
ALTER TABLE `tabel_3a2_pendanaan`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a2_penelitian`
--
ALTER TABLE `tabel_3a2_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a3_dtpr_tahunan`
--
ALTER TABLE `tabel_3a3_dtpr_tahunan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_3a3_pengembangan`
--
ALTER TABLE `tabel_3a3_pengembangan`
  MODIFY `id_pengembangan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c1_kerjasama_penelitian`
--
ALTER TABLE `tabel_3c1_kerjasama_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c1_pendanaan_kerjasama`
--
ALTER TABLE `tabel_3c1_pendanaan_kerjasama`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c2_publikasi_penelitian`
--
ALTER TABLE `tabel_3c2_publikasi_penelitian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT untuk tabel `tabel_3c3_hki`
--
ALTER TABLE `tabel_3c3_hki`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_4a1_sarpras_pkm`
--
ALTER TABLE `tabel_4a1_sarpras_pkm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `tabel_4a2_pendanaan_pkm`
--
ALTER TABLE `tabel_4a2_pendanaan_pkm`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tabel_4a2_pkm`
--
ALTER TABLE `tabel_4a2_pkm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tabel_4c1_kerjasama_pkm`
--
ALTER TABLE `tabel_4c1_kerjasama_pkm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `tabel_4c1_pendanaan_pkm`
--
ALTER TABLE `tabel_4c1_pendanaan_pkm`
  MODIFY `id_pendanaan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `tabel_4c2_diseminasi_pkm`
--
ALTER TABLE `tabel_4c2_diseminasi_pkm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_4c3_hki_pkm`
--
ALTER TABLE `tabel_4c3_hki_pkm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_5_1_sistem_tata_kelola`
--
ALTER TABLE `tabel_5_1_sistem_tata_kelola`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `tabel_5_2_sarpras_pendidikan`
--
ALTER TABLE `tabel_5_2_sarpras_pendidikan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `tabel_6_kesesuaian_visi_misi`
--
ALTER TABLE `tabel_6_kesesuaian_visi_misi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  MODIFY `id_tendik` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT untuk tabel `unit_kerja`
--
ALTER TABLE `unit_kerja`
  MODIFY `id_unit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
-- Ketidakleluasaan untuk tabel `berita`
--
ALTER TABLE `berita`
  ADD CONSTRAINT `berita_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_4` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_dosen_homebase` FOREIGN KEY (`id_unit_homebase`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Ketidakleluasaan untuk tabel `pegawai`
--
ALTER TABLE `pegawai`
  ADD CONSTRAINT `fk_pegawai_jabatan` FOREIGN KEY (`id_jabatan`) REFERENCES `ref_jabatan_struktural` (`id_jabatan`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pegawai_unit` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pegawai_unit`
--
ALTER TABLE `pegawai_unit`
  ADD CONSTRAINT `fk_pegawai_unit_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pegawai_unit_unit` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`);

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
-- Ketidakleluasaan untuk tabel `tabel_5_1_sistem_tata_kelola`
--
ALTER TABLE `tabel_5_1_sistem_tata_kelola`
  ADD CONSTRAINT `tabel_5_1_sistem_tata_kelola_ibfk_1` FOREIGN KEY (`id_unit_pengelola`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `tabel_5_2_sarpras_pendidikan`
--
ALTER TABLE `tabel_5_2_sarpras_pendidikan`
  ADD CONSTRAINT `tabel_5_2_sarpras_pendidikan_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `tabel_6_kesesuaian_visi_misi`
--
ALTER TABLE `tabel_6_kesesuaian_visi_misi`
  ADD CONSTRAINT `tabel_6_kesesuaian_visi_misi_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`);

--
-- Ketidakleluasaan untuk tabel `tenaga_kependidikan`
--
ALTER TABLE `tenaga_kependidikan`
  ADD CONSTRAINT `tenaga_kependidikan_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_unit_kerja` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

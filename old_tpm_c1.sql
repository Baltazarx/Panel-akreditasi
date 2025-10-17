-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 21, 2025 at 04:54 AM
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
-- Table structure for table `beban_kerja_dosen`
--

CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int NOT NULL,
  `id_dosen` int DEFAULT NULL,
  `id_tahun` int DEFAULT NULL,
  `sks_pengajaran` int NOT NULL,
  `sks_penelitian` int NOT NULL,
  `sks_pkm` int NOT NULL,
  `sks_manajemen` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `beban_kerja_dosen`
--

INSERT INTO `beban_kerja_dosen` (`id_beban_kerja`, `id_dosen`, `id_tahun`, `sks_pengajaran`, `sks_penelitian`, `sks_pkm`, `sks_manajemen`) VALUES
(4, 1, 1, 4, 5, 6, 7);

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id_dosen` int NOT NULL,
  `id_pegawai` int DEFAULT NULL,
  `nidn` varchar(50) NOT NULL,
  `nuptk` varchar(50) DEFAULT NULL,
  `homebase` varchar(100) DEFAULT NULL,
  `pt` varchar(100) DEFAULT NULL,
  `id_jafung` int DEFAULT NULL,
  `beban_sks` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id_dosen`, `id_pegawai`, `nidn`, `nuptk`, `homebase`, `pt`, `id_jafung`, `beban_sks`) VALUES
(1, 1, '0011223344', NULL, NULL, NULL, 2, 12),
(2, 2, '0055667788', NULL, NULL, NULL, 1, 10);

-- --------------------------------------------------------

--
-- Table structure for table `pegawai`
--

CREATE TABLE `pegawai` (
  `id_pegawai` int NOT NULL,
  `id_unit` int DEFAULT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `nikp` varchar(50) NOT NULL,
  `jenjang_pendidikan` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pegawai`
--

INSERT INTO `pegawai` (`id_pegawai`, `id_unit`, `nama_lengkap`, `pendidikan_terakhir`, `nikp`, `jenjang_pendidikan`) VALUES
(1, 1, 'Budi Santoso', 'S2', '123456', 'Magister'),
(2, 2, 'Ani Wijaya', 'S1', '789012', 'Sarjana'),
(3, 3, 'Citra Lestari', 'S3', '345678', 'Doktor'),
(4, 4, 'Dedi Firmansyah', 'S1', '987654', 'Sarjana'),
(5, 5, 'Eka Pratama', 'S2', '112233', 'Magister');

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan_dana`
--

CREATE TABLE `penggunaan_dana` (
  `id_penggunaan_dana` int NOT NULL,
  `id_tahun` int DEFAULT NULL,
  `jenis_penggunaan` varchar(100) NOT NULL,
  `jumlah_dana` varchar(50) NOT NULL,
  `link_bukti` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pimpinan_upps_ps`
--

CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int NOT NULL,
  `id_unit` int DEFAULT NULL,
  `id_pegawai` int DEFAULT NULL,
  `periode_mulai` int NOT NULL,
  `periode_selesai` int NOT NULL,
  `tupoksi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `pimpinan_upps_ps`
--

INSERT INTO `pimpinan_upps_ps` (`id_pimpinan`, `id_unit`, `id_pegawai`, `periode_mulai`, `periode_selesai`, `tupoksi`) VALUES
(13, 2, 1, 2015, 2016, 'Jogo kandang');

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
(3, 'Guru Besar');

-- --------------------------------------------------------

--
-- Table structure for table `sumber_pendanaan`
--

CREATE TABLE `sumber_pendanaan` (
  `id_sumber` int NOT NULL,
  `id_tahun` int DEFAULT NULL,
  `sumber_dana` varchar(100) NOT NULL,
  `jumlah_dana` varchar(50) NOT NULL,
  `link_bukti` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sumber_pendanaan`
--

INSERT INTO `sumber_pendanaan` (`id_sumber`, `id_tahun`, `sumber_dana`, `jumlah_dana`, `link_bukti`) VALUES
(3, 2, 'Mahasiswa (SPP)', '30000000', 'link');

-- --------------------------------------------------------

--
-- Table structure for table `tahun_akademik`
--

CREATE TABLE `tahun_akademik` (
  `id_tahun` int NOT NULL,
  `tahun` varchar(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tahun_akademik`
--

INSERT INTO `tahun_akademik` (`id_tahun`, `tahun`) VALUES
(1, '2023/2024'),
(2, '2024/2025'),
(3, '2025/2026'),
(4, '2026/2027'),
(5, '2027/2028'),
(6, '2028/2029'),
(7, '2029/2030'),
(8, '2030/2031'),
(9, '2031/2032'),
(10, '2032/2033'),
(11, '2033/2034'),
(12, '2034/2035'),
(13, '2035/2036'),
(14, '2036/2037'),
(15, '2037/2038'),
(16, '2038/2039'),
(17, '2039/2040'),
(18, '2040/2041'),
(19, '2041/2042'),
(20, '2042/2043'),
(21, '2043/2044'),
(22, '2044/2045'),
(23, '2045/2046'),
(24, '2046/2047'),
(25, '2047/2048'),
(26, '2048/2049'),
(27, '2049/2050'),
(28, '2050/2051'),
(29, '2051/2052'),
(30, '2052/2053'),
(31, '2053/2054'),
(32, '2054/2055'),
(33, '2055/2056'),
(34, '2056/2057'),
(35, '2057/2058'),
(36, '2058/2059'),
(37, '2059/2060'),
(38, '2060/2061'),
(39, '2061/2062'),
(40, '2062/2063'),
(41, '2063/2064'),
(42, '2064/2065'),
(43, '2065/2066'),
(44, '2066/2067'),
(45, '2067/2068'),
(46, '2068/2069'),
(47, '2069/2070'),
(48, '2070/2071'),
(49, '2071/2072'),
(50, '2072/2073'),
(51, '2073/2074'),
(52, '2074/2075'),
(53, '2075/2076'),
(54, '2076/2077'),
(55, '2077/2078'),
(56, '2078/2079'),
(57, '2079/2080'),
(58, '2080/2081'),
(59, '2081/2082'),
(60, '2082/2083'),
(61, '2083/2084'),
(62, '2084/2085'),
(63, '2085/2086'),
(64, '2086/2087'),
(65, '2087/2088'),
(66, '2088/2089'),
(67, '2089/2090'),
(68, '2090/2091'),
(69, '2091/2092'),
(70, '2092/2093'),
(71, '2093/2094'),
(72, '2094/2095'),
(73, '2095/2096'),
(74, '2096/2097'),
(75, '2097/2098'),
(76, '2098/2099'),
(77, '2099/2100'),
(78, '2100/2101'),
(79, '2101/2102'),
(80, '2102/2103'),
(81, '2103/2104'),
(82, '2104/2105'),
(83, '2105/2106'),
(84, '2106/2107'),
(85, '2107/2108'),
(86, '2108/2109'),
(87, '2109/2110'),
(88, '2110/2111'),
(89, '2111/2112'),
(90, '2112/2113'),
(91, '2113/2114'),
(92, '2114/2115'),
(93, '2115/2116'),
(94, '2116/2117'),
(95, '2117/2118'),
(96, '2118/2119'),
(97, '2119/2120'),
(98, '2120/2121'),
(99, '2121/2122'),
(100, '2122/2123');

-- --------------------------------------------------------

--
-- Table structure for table `tendik`
--

CREATE TABLE `tendik` (
  `id_tendik` int NOT NULL,
  `id_pegawai` int DEFAULT NULL,
  `jenis_tendik` varchar(100) NOT NULL,
  `id_unit` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Table structure for table `unit_spmi`
--

CREATE TABLE `unit_spmi` (
  `id_spmi` int NOT NULL,
  `id_unit` int DEFAULT NULL,
  `id_tahun` int DEFAULT NULL,
  `dokumen_spmi` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `jumlah_auditor_certified` int NOT NULL,
  `jumlah_auditor_noncertified` int NOT NULL,
  `frekuensi_tahun` int NOT NULL,
  `bukti_certified_uri` varchar(255) NOT NULL,
  `laporan_audit_uri` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_unit` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `username`, `password`, `id_unit`, `is_active`) VALUES
(1, 'WAKET1', '$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG', 2, 1),
(2, 'PRODI', '$2a$10$i2r/hCf8VW2uqqrGWDKk7Op0UZJGPY0pZrv/8q/gJe79gvYKxESA2', 7, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  ADD PRIMARY KEY (`id_beban_kerja`),
  ADD KEY `id_dosen` (`id_dosen`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id_dosen`),
  ADD KEY `id_pegawai` (`id_pegawai`),
  ADD KEY `id_jafung` (`id_jafung`);

--
-- Indexes for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD PRIMARY KEY (`id_pegawai`),
  ADD KEY `id_unit` (`id_unit`);

--
-- Indexes for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  ADD PRIMARY KEY (`id_penggunaan_dana`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  ADD PRIMARY KEY (`id_pimpinan`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_pegawai` (`id_pegawai`);

--
-- Indexes for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  ADD PRIMARY KEY (`id_jafung`);

--
-- Indexes for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD PRIMARY KEY (`id_sumber`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `tahun_akademik`
--
ALTER TABLE `tahun_akademik`
  ADD PRIMARY KEY (`id_tahun`);

--
-- Indexes for table `tendik`
--
ALTER TABLE `tendik`
  ADD PRIMARY KEY (`id_tendik`),
  ADD KEY `fk_tendik_unit` (`id_unit`),
  ADD KEY `fk_tendik_pegawai` (`id_pegawai`);

--
-- Indexes for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  ADD PRIMARY KEY (`id_unit`);

--
-- Indexes for table `unit_spmi`
--
ALTER TABLE `unit_spmi`
  ADD PRIMARY KEY (`id_spmi`),
  ADD KEY `id_unit` (`id_unit`),
  ADD KEY `id_tahun` (`id_tahun`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_unit` (`id_unit`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `beban_kerja_dosen`
--
ALTER TABLE `beban_kerja_dosen`
  MODIFY `id_beban_kerja` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id_dosen` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pegawai`
--
ALTER TABLE `pegawai`
  MODIFY `id_pegawai` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `penggunaan_dana`
--
ALTER TABLE `penggunaan_dana`
  MODIFY `id_penggunaan_dana` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pimpinan_upps_ps`
--
ALTER TABLE `pimpinan_upps_ps`
  MODIFY `id_pimpinan` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ref_jabatan_fungsional`
--
ALTER TABLE `ref_jabatan_fungsional`
  MODIFY `id_jafung` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  MODIFY `id_sumber` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tahun_akademik`
--
ALTER TABLE `tahun_akademik`
  MODIFY `id_tahun` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `tendik`
--
ALTER TABLE `tendik`
  MODIFY `id_tendik` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `unit_kerja`
--
ALTER TABLE `unit_kerja`
  MODIFY `id_unit` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `unit_spmi`
--
ALTER TABLE `unit_spmi`
  MODIFY `id_spmi` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  ADD CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`);

--
-- Constraints for table `pegawai`
--
ALTER TABLE `pegawai`
  ADD CONSTRAINT `pegawai_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);

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
  ADD CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`);

--
-- Constraints for table `sumber_pendanaan`
--
ALTER TABLE `sumber_pendanaan`
  ADD CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `tendik`
--
ALTER TABLE `tendik`
  ADD CONSTRAINT `fk_tendik_pegawai` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  ADD CONSTRAINT `fk_tendik_unit` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `unit_spmi`
--
ALTER TABLE `unit_spmi`
  ADD CONSTRAINT `unit_spmi_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  ADD CONSTRAINT `unit_spmi_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

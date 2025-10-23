-- MySQL dump 10.13  Distrib 8.0.35, for Win64 (x86_64)
--
-- Host: localhost    Database: tpm_c1
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_mutu_internal`
--

DROP TABLE IF EXISTS `audit_mutu_internal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_mutu_internal` (
  `id_ami` int NOT NULL AUTO_INCREMENT,
  `id_unit` int NOT NULL,
  `id_tahun` int NOT NULL,
  `frekuensi_audit` int DEFAULT NULL,
  `dokumen_spmi` text,
  `laporan_audit_url` text,
  `bukti_certified_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `jumlah_auditor_certified` int DEFAULT NULL,
  `jumlah_auditor_noncertified` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_ami`),
  KEY `id_unit` (`id_unit`),
  KEY `id_tahun` (`id_tahun`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `audit_mutu_internal_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `audit_mutu_internal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_mutu_internal`
--

LOCK TABLES `audit_mutu_internal` WRITE;
/*!40000 ALTER TABLE `audit_mutu_internal` DISABLE KEYS */;
INSERT INTO `audit_mutu_internal` VALUES (5,9,2023,12,'ini dokumen','ini laporan','ini url',12,13,'2025-08-22 23:46:22','2025-08-28 03:24:10',NULL,NULL),(6,2,2022,1,'ini dokumen','link',NULL,1,1,'2025-09-26 08:15:56','2025-09-26 08:16:27','2025-09-26 15:16:28',1);
/*!40000 ALTER TABLE `audit_mutu_internal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beban_kerja_dosen`
--

DROP TABLE IF EXISTS `beban_kerja_dosen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beban_kerja_dosen` (
  `id_beban_kerja` int NOT NULL AUTO_INCREMENT,
  `id_dosen` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sks_pengajaran` float DEFAULT '0',
  `sks_penelitian` float DEFAULT '0',
  `sks_pkm` float DEFAULT '0',
  `sks_manajemen` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_beban_kerja`),
  UNIQUE KEY `unik_dosen_tahun` (`id_dosen`,`id_tahun`),
  KEY `id_tahun` (`id_tahun`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `beban_kerja_dosen_ibfk_1` FOREIGN KEY (`id_dosen`) REFERENCES `dosen` (`id_dosen`),
  CONSTRAINT `beban_kerja_dosen_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beban_kerja_dosen`
--

LOCK TABLES `beban_kerja_dosen` WRITE;
/*!40000 ALTER TABLE `beban_kerja_dosen` DISABLE KEYS */;
INSERT INTO `beban_kerja_dosen` VALUES (9,1,2020,3,1,1,2.5,'2025-08-23 03:48:17','2025-08-23 03:53:14',NULL,NULL),(10,1,2021,3,1,1,2,'2025-09-26 08:13:00','2025-09-26 08:13:22','2025-09-26 15:13:22',1),(11,2,2025,5,2.5,2,4,'2025-09-30 13:31:52','2025-09-30 13:31:52',NULL,NULL);
/*!40000 ALTER TABLE `beban_kerja_dosen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpl`
--

DROP TABLE IF EXISTS `cpl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpl` (
  `id_cpl` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `kode_cpl` varchar(20) NOT NULL,
  `deskripsi_cpl` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_cpl`),
  KEY `id_unit_prodi` (`id_unit_prodi`),
  CONSTRAINT `cpl_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpl`
--

LOCK TABLES `cpl` WRITE;
/*!40000 ALTER TABLE `cpl` DISABLE KEYS */;
INSERT INTO `cpl` VALUES (1,4,'CPL-A','Menguasai algoritma dan struktur data.',NULL,NULL),(2,4,'CPL-B','Menerapkan model Machine Learning.',NULL,NULL),(3,5,'CPL-MI-A','Mampu merancang arsitektur sistem informasi.',NULL,NULL),(4,5,'CPL-MI-B','Mampu mengelola proyek IT.',NULL,NULL);
/*!40000 ALTER TABLE `cpl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cpmk`
--

DROP TABLE IF EXISTS `cpmk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpmk` (
  `id_cpmk` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `kode_cpmk` varchar(20) NOT NULL,
  `deskripsi_cpmk` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_cpmk`),
  KEY `id_unit_prodi` (`id_unit_prodi`),
  CONSTRAINT `cpmk_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cpmk`
--

LOCK TABLES `cpmk` WRITE;
/*!40000 ALTER TABLE `cpmk` DISABLE KEYS */;
INSERT INTO `cpmk` VALUES (1,4,'CPMK-AI1','Mampu menjelaskan konsep dasar AI',NULL,NULL),(2,4,'CPMK-AI2','Mampu membuat model regresi',NULL,NULL),(3,4,'CPMK-BD1','Mampu merancang ERD',NULL,NULL),(4,4,'CPMK-BD2','Mampu melakukan normalisasi',NULL,NULL),(5,5,'CPMK-SIM1','Mampu menganalisis kebutuhan sistem',NULL,NULL),(6,5,'CPMK-SIM2','Mampu mendesain alur proses bisnis',NULL,NULL),(7,5,'CPMK-EB1','Mampu merancang model bisnis digital',NULL,NULL);
/*!40000 ALTER TABLE `cpmk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dosen`
--

DROP TABLE IF EXISTS `dosen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dosen` (
  `id_dosen` int NOT NULL AUTO_INCREMENT,
  `id_pegawai` int NOT NULL,
  `nidn` varchar(20) DEFAULT NULL,
  `nuptk` varchar(20) DEFAULT NULL,
  `homebase` varchar(50) DEFAULT NULL,
  `pt` varchar(100) DEFAULT NULL,
  `id_jafung` int DEFAULT NULL,
  `beban_sks` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_dosen`),
  UNIQUE KEY `nidn` (`nidn`),
  KEY `id_pegawai` (`id_pegawai`),
  KEY `id_jafung` (`id_jafung`),
  CONSTRAINT `dosen_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  CONSTRAINT `dosen_ibfk_2` FOREIGN KEY (`id_jafung`) REFERENCES `ref_jabatan_fungsional` (`id_jafung`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dosen`
--

LOCK TABLES `dosen` WRITE;
/*!40000 ALTER TABLE `dosen` DISABLE KEYS */;
INSERT INTO `dosen` VALUES (1,1,'0011223301',NULL,NULL,NULL,3,0,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(2,2,'0022334402',NULL,NULL,NULL,2,0,'2025-08-21 23:54:41','2025-09-30 13:26:21','2025-09-30 20:26:21',1),(3,3,'0033445503',NULL,NULL,NULL,4,0,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(4,8,'0044556604','172839437291829382','Manajemen Informatika','STIKOM Banyuwangi',1,5.3,'2025-08-21 23:54:41','2025-08-22 23:55:03',NULL,NULL),(6,10,'001123102130','1234567890987654','Teknik Informatika','STIKOM Banyuwangi',3,10.5,'2025-08-22 23:50:41','2025-09-30 14:12:36','2025-09-30 21:12:36',1),(7,11,'087','806','Manajemen Informatika','STIKOM',2,3,'2025-08-25 09:08:14','2025-09-30 13:01:55','2025-09-30 20:01:56',1),(8,9,'0123','01234','Manajemen Informatika','STIKOM PGRI Banyuwangi',NULL,3.5,'2025-08-26 06:36:24','2025-09-30 13:43:39','2025-09-30 20:43:39',1),(12,12,'0044556615','792010371','Teknik Informatika','STIKOM PGRI Banyuwangi',1,5.5,'2025-09-30 14:38:27','2025-09-30 14:59:36',NULL,NULL);
/*!40000 ALTER TABLE `dosen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kualifikasi_tendik`
--

DROP TABLE IF EXISTS `kualifikasi_tendik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kualifikasi_tendik` (
  `id_kualifikasi` int NOT NULL AUTO_INCREMENT,
  `id_tendik` int NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `id_unit` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_kualifikasi`),
  KEY `id_tendik` (`id_tendik`),
  KEY `id_unit` (`id_unit`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `kualifikasi_tendik_ibfk_1` FOREIGN KEY (`id_tendik`) REFERENCES `tenaga_kependidikan` (`id_tendik`),
  CONSTRAINT `kualifikasi_tendik_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kualifikasi_tendik`
--

LOCK TABLES `kualifikasi_tendik` WRITE;
/*!40000 ALTER TABLE `kualifikasi_tendik` DISABLE KEYS */;
INSERT INTO `kualifikasi_tendik` VALUES (1,1,'S1',1,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(2,2,'S1',7,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(3,3,'D3',7,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL);
/*!40000 ALTER TABLE `kualifikasi_tendik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_aktivitas`
--

DROP TABLE IF EXISTS `log_aktivitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_aktivitas` (
  `id_log` bigint NOT NULL AUTO_INCREMENT,
  `id_user` int DEFAULT NULL,
  `aksi` varchar(50) NOT NULL,
  `nama_tabel` varchar(100) DEFAULT NULL,
  `id_record` int DEFAULT NULL,
  `waktu_aksi` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `detail_perubahan` text,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `log_aktivitas_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_aktivitas`
--

LOCK TABLES `log_aktivitas` WRITE;
/*!40000 ALTER TABLE `log_aktivitas` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_aktivitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `map_cpl_pl`
--

DROP TABLE IF EXISTS `map_cpl_pl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `map_cpl_pl` (
  `id_cpl` int NOT NULL,
  `id_pl` int NOT NULL,
  PRIMARY KEY (`id_cpl`,`id_pl`),
  KEY `id_pl` (`id_pl`),
  CONSTRAINT `map_cpl_pl_ibfk_1` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE,
  CONSTRAINT `map_cpl_pl_ibfk_2` FOREIGN KEY (`id_pl`) REFERENCES `profil_lulusan` (`id_pl`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map_cpl_pl`
--

LOCK TABLES `map_cpl_pl` WRITE;
/*!40000 ALTER TABLE `map_cpl_pl` DISABLE KEYS */;
INSERT INTO `map_cpl_pl` VALUES (1,1),(2,1),(1,2),(3,3),(3,4),(4,4);
/*!40000 ALTER TABLE `map_cpl_pl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `map_cpmk_cpl`
--

DROP TABLE IF EXISTS `map_cpmk_cpl`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `map_cpmk_cpl` (
  `id_cpmk` int NOT NULL,
  `id_cpl` int NOT NULL,
  PRIMARY KEY (`id_cpmk`,`id_cpl`),
  KEY `id_cpl` (`id_cpl`),
  CONSTRAINT `map_cpmk_cpl_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  CONSTRAINT `map_cpmk_cpl_ibfk_2` FOREIGN KEY (`id_cpl`) REFERENCES `cpl` (`id_cpl`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map_cpmk_cpl`
--

LOCK TABLES `map_cpmk_cpl` WRITE;
/*!40000 ALTER TABLE `map_cpmk_cpl` DISABLE KEYS */;
INSERT INTO `map_cpmk_cpl` VALUES (1,1),(3,1),(4,1),(2,2),(5,3),(6,3),(7,4);
/*!40000 ALTER TABLE `map_cpmk_cpl` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `map_cpmk_mk`
--

DROP TABLE IF EXISTS `map_cpmk_mk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `map_cpmk_mk` (
  `id_cpmk` int NOT NULL,
  `id_mk` int NOT NULL,
  PRIMARY KEY (`id_cpmk`,`id_mk`),
  KEY `id_mk` (`id_mk`),
  CONSTRAINT `map_cpmk_mk_ibfk_1` FOREIGN KEY (`id_cpmk`) REFERENCES `cpmk` (`id_cpmk`) ON DELETE CASCADE,
  CONSTRAINT `map_cpmk_mk_ibfk_2` FOREIGN KEY (`id_mk`) REFERENCES `mata_kuliah` (`id_mk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `map_cpmk_mk`
--

LOCK TABLES `map_cpmk_mk` WRITE;
/*!40000 ALTER TABLE `map_cpmk_mk` DISABLE KEYS */;
INSERT INTO `map_cpmk_mk` VALUES (1,1),(2,1),(3,2),(4,2),(5,3),(6,3),(7,4);
/*!40000 ALTER TABLE `map_cpmk_mk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mata_kuliah`
--

DROP TABLE IF EXISTS `mata_kuliah`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mata_kuliah` (
  `id_mk` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `kode_mk` varchar(20) NOT NULL,
  `nama_mk` varchar(255) NOT NULL,
  `sks` int NOT NULL,
  `semester` int NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_mk`),
  KEY `id_unit_prodi` (`id_unit_prodi`),
  CONSTRAINT `mata_kuliah_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mata_kuliah`
--

LOCK TABLES `mata_kuliah` WRITE;
/*!40000 ALTER TABLE `mata_kuliah` DISABLE KEYS */;
INSERT INTO `mata_kuliah` VALUES (1,4,'IF401','Dasar Kecerdasan Buatan',3,3,NULL,NULL),(2,4,'IF201','Basis Data',3,2,NULL,NULL),(3,5,'MI301','Sistem Informasi Manajemen',3,4,NULL,NULL),(4,5,'MI402','E-Business',3,5,NULL,NULL);
/*!40000 ALTER TABLE `mata_kuliah` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pegawai`
--

DROP TABLE IF EXISTS `pegawai`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pegawai` (
  `id_pegawai` int NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(255) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_pegawai`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pegawai`
--

LOCK TABLES `pegawai` WRITE;
/*!40000 ALTER TABLE `pegawai` DISABLE KEYS */;
INSERT INTO `pegawai` VALUES (1,'Dr. Budi Santoso, M.Kom.','S3','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(2,'Citra Lestari, S.Kom., M.T.','S2','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(3,'Prof. Dr. Eka Pratama','S3','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(4,'Ani Wijaya, S.E.','S1','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(5,'Dedi Firmansyah, S.Kom.','S1','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(6,'Fajar Nugroho, A.Md.','D3','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(7,'Gita Permata, S.Sos.','S1','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(8,'Hendra Gunawan, M.T.','S2','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(9,'fufufafa','S2','2025-08-22 16:45:03','2025-09-30 10:08:00','2025-09-30 17:08:00',1),(10,'Dandi Ajusta Dharma Putra Samudra','S2','2025-08-22 23:49:45','2025-09-30 10:08:06','2025-09-30 17:08:06',1),(11,'Lupik','S2','2025-08-25 09:06:18','2025-09-30 10:07:58','2025-09-30 17:07:58',1),(12,'Rachman Yulianto, M.Kom','S2','2025-09-30 14:26:54','2025-09-30 14:26:54',NULL,NULL);
/*!40000 ALTER TABLE `pegawai` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `penggunaan_dana`
--

DROP TABLE IF EXISTS `penggunaan_dana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `penggunaan_dana` (
  `id_penggunaan_dana` int NOT NULL AUTO_INCREMENT,
  `id_tahun` int NOT NULL,
  `jenis_penggunaan` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_penggunaan_dana`),
  KEY `id_tahun` (`id_tahun`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `penggunaan_dana_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `penggunaan_dana`
--

LOCK TABLES `penggunaan_dana` WRITE;
/*!40000 ALTER TABLE `penggunaan_dana` DISABLE KEYS */;
INSERT INTO `penggunaan_dana` VALUES (1,2024,'Penelitian Dosen',120000000,'https://drive.example.com/penggunaan.pdf','2025-08-22 01:26:54','2025-09-30 10:29:28','2025-09-30 17:29:28',1),(2,2025,'Operasional',1000000,'link','2025-08-22 06:57:15','2025-09-30 10:29:31','2025-09-30 17:29:32',1),(3,2023,'Pengembangan',30000000,'link','2025-08-22 06:57:37','2025-09-30 10:29:34','2025-09-30 17:29:35',1),(4,2025,'Mangan Bakso',1000000,'link','2025-08-22 07:36:16','2025-09-29 06:32:39','2025-09-29 13:32:40',1),(5,2024,'Operasional',10000000,'link','2025-09-26 08:07:33','2025-09-30 10:29:38','2025-09-30 17:29:38',1),(6,2025,'Penelitian Dosen',1000000,'https://hduh.com','2025-09-30 10:30:22','2025-09-30 10:38:21','2025-09-30 17:38:22',1),(7,2025,'Penelitian Dosen',300000,'https://djkdd.com','2025-09-30 10:38:54','2025-09-30 10:51:22','2025-09-30 17:51:23',1),(8,2020,'Penelitian Bersama Dosen',1300000,'https://jsjsn.com','2025-09-30 10:51:46','2025-09-30 10:51:46',NULL,NULL),(9,2022,'Penelitian Bersama Dosen',1500000,'https://dhdj.com','2025-09-30 11:35:12','2025-09-30 11:35:12',NULL,NULL),(10,2021,'Penelitian Bersama Dosen',2000000,'https://jxhkjwxh.com','2025-09-30 11:37:33','2025-09-30 11:37:33',NULL,NULL);
/*!40000 ALTER TABLE `penggunaan_dana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pimpinan_upps_ps`
--

DROP TABLE IF EXISTS `pimpinan_upps_ps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pimpinan_upps_ps` (
  `id_pimpinan` int NOT NULL AUTO_INCREMENT,
  `id_unit` int NOT NULL,
  `id_pegawai` int NOT NULL,
  `id_jabatan` int NOT NULL,
  `periode_mulai` date NOT NULL,
  `periode_selesai` date DEFAULT NULL,
  `tupoksi` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_pimpinan`),
  KEY `id_unit` (`id_unit`),
  KEY `id_pegawai` (`id_pegawai`),
  KEY `id_jabatan` (`id_jabatan`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `pimpinan_upps_ps_ibfk_1` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `pimpinan_upps_ps_ibfk_2` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`),
  CONSTRAINT `pimpinan_upps_ps_ibfk_3` FOREIGN KEY (`id_jabatan`) REFERENCES `ref_jabatan_struktural` (`id_jabatan`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pimpinan_upps_ps`
--

LOCK TABLES `pimpinan_upps_ps` WRITE;
/*!40000 ALTER TABLE `pimpinan_upps_ps` DISABLE KEYS */;
INSERT INTO `pimpinan_upps_ps` VALUES (1,2,1,2,'2023-01-01','2027-12-31','Bertanggung jawab atas bidang akademik.','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(2,7,2,5,'2024-08-01','2028-07-31','Mengelola kegiatan akademik dan operasional Program Studi Informatika.','2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(4,5,4,4,'2024-12-29','2025-12-29','mangan bakso','2025-08-22 10:32:01','2025-08-22 10:32:01',NULL,NULL),(5,9,5,5,'2024-10-11','2029-10-11','afzsshayskiqsj','2025-08-22 10:34:13','2025-08-22 10:34:59',NULL,NULL),(6,1,10,4,'2032-12-29','2033-12-29','Mangan baksoo','2025-08-22 23:52:54','2025-08-23 01:12:48','2025-08-23 08:12:48',1),(7,1,10,4,'2023-12-22','2024-12-22','Mangan AFC','2025-08-25 08:19:13','2025-09-30 14:25:18','2025-09-30 21:25:18',1);
/*!40000 ALTER TABLE `pimpinan_upps_ps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profil_lulusan`
--

DROP TABLE IF EXISTS `profil_lulusan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profil_lulusan` (
  `id_pl` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `kode_pl` varchar(20) NOT NULL,
  `deskripsi_pl` text NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_pl`),
  KEY `id_unit_prodi` (`id_unit_prodi`),
  CONSTRAINT `profil_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profil_lulusan`
--

LOCK TABLES `profil_lulusan` WRITE;
/*!40000 ALTER TABLE `profil_lulusan` DISABLE KEYS */;
INSERT INTO `profil_lulusan` VALUES (1,4,'PL-1','Menjadi Analis Data yang handal.',NULL,NULL),(2,4,'PL-2','Menjadi Pengembang AI yang inovatif.',NULL,NULL),(3,5,'PL-MI-1','Menjadi Manajer Sistem Informasi.',NULL,NULL),(4,5,'PL-MI-2','Menjadi Konsultan IT.',NULL,NULL);
/*!40000 ALTER TABLE `profil_lulusan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ref_jabatan_fungsional`
--

DROP TABLE IF EXISTS `ref_jabatan_fungsional`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_jabatan_fungsional` (
  `id_jafung` int NOT NULL AUTO_INCREMENT,
  `nama_jafung` varchar(100) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_jafung`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_jabatan_fungsional`
--

LOCK TABLES `ref_jabatan_fungsional` WRITE;
/*!40000 ALTER TABLE `ref_jabatan_fungsional` DISABLE KEYS */;
INSERT INTO `ref_jabatan_fungsional` VALUES (1,'Asisten Ahli',NULL,NULL),(2,'Lektor',NULL,NULL),(3,'Lektor Kepala',NULL,NULL),(4,'Guru Besar (Profesor)',NULL,NULL);
/*!40000 ALTER TABLE `ref_jabatan_fungsional` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ref_jabatan_struktural`
--

DROP TABLE IF EXISTS `ref_jabatan_struktural`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_jabatan_struktural` (
  `id_jabatan` int NOT NULL AUTO_INCREMENT,
  `nama_jabatan` varchar(100) NOT NULL,
  `sks_beban` float DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_jabatan`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_jabatan_struktural`
--

LOCK TABLES `ref_jabatan_struktural` WRITE;
/*!40000 ALTER TABLE `ref_jabatan_struktural` DISABLE KEYS */;
INSERT INTO `ref_jabatan_struktural` VALUES (1,'Ketua STIKOM',12,NULL,NULL),(2,'Wakil Ketua I',10,NULL,NULL),(3,'Wakil Ketua II',10,NULL,NULL),(4,'Kepala LPPM',8,NULL,NULL),(5,'Ketua Program Studi',4,NULL,NULL);
/*!40000 ALTER TABLE `ref_jabatan_struktural` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ref_kabupaten_kota`
--

DROP TABLE IF EXISTS `ref_kabupaten_kota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_kabupaten_kota` (
  `id_kabupaten_kota` int NOT NULL,
  `id_provinsi` int NOT NULL,
  `nama_kabupaten_kota` varchar(255) NOT NULL,
  PRIMARY KEY (`id_kabupaten_kota`),
  KEY `id_provinsi` (`id_provinsi`),
  CONSTRAINT `ref_kabupaten_kota_ibfk_1` FOREIGN KEY (`id_provinsi`) REFERENCES `ref_provinsi` (`id_provinsi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_kabupaten_kota`
--

LOCK TABLES `ref_kabupaten_kota` WRITE;
/*!40000 ALTER TABLE `ref_kabupaten_kota` DISABLE KEYS */;
INSERT INTO `ref_kabupaten_kota` VALUES (1101,11,'KABUPATEN SIMEULUE'),(1102,11,'KABUPATEN ACEH SINGKIL'),(1103,11,'KABUPATEN ACEH SELATAN'),(1104,11,'KABUPATEN ACEH TENGGARA'),(1105,11,'KABUPATEN ACEH TIMUR'),(1106,11,'KABUPATEN ACEH TENGAH'),(1107,11,'KABUPATEN ACEH BARAT'),(1108,11,'KABUPATEN ACEH BESAR'),(1109,11,'KABUPATEN PIDIE'),(1110,11,'KABUPATEN BIREUEN'),(1111,11,'KABUPATEN ACEH UTARA'),(1112,11,'KABUPATEN ACEH BARAT DAYA'),(1113,11,'KABUPATEN GAYO LUES'),(1114,11,'KABUPATEN ACEH TAMIANG'),(1115,11,'KABUPATEN NAGAN RAYA'),(1116,11,'KABUPATEN ACEH JAYA'),(1117,11,'KABUPATEN BENER MERIAH'),(1118,11,'KABUPATEN PIDIE JAYA'),(1171,11,'KOTA BANDA ACEH'),(1172,11,'KOTA SABANG'),(1173,11,'KOTA LANGSA'),(1174,11,'KOTA LHOKSEUMAWE'),(1175,11,'KOTA SUBULUSSALAM'),(1201,12,'KABUPATEN NIAS'),(1202,12,'KABUPATEN MANDAILING NATAL'),(1203,12,'KABUPATEN TAPANULI SELATAN'),(1204,12,'KABUPATEN TAPANULI TENGAH'),(1205,12,'KABUPATEN TAPANULI UTARA'),(1206,12,'KABUPATEN TOBA SAMOSIR'),(1207,12,'KABUPATEN LABUHAN BATU'),(1208,12,'KABUPATEN ASAHAN'),(1209,12,'KABUPATEN SIMALUNGUN'),(1210,12,'KABUPATEN DAIRI'),(1211,12,'KABUPATEN KARO'),(1212,12,'KABUPATEN DELI SERDANG'),(1213,12,'KABUPATEN LANGKAT'),(1214,12,'KABUPATEN NIAS SELATAN'),(1215,12,'KABUPATEN HUMBANG HASUNDUTAN'),(1216,12,'KABUPATEN PAKPAK BHARAT'),(1217,12,'KABUPATEN SAMOSIR'),(1218,12,'KABUPATEN SERDANG BEDAGAI'),(1219,12,'KABUPATEN BATU BARA'),(1220,12,'KABUPATEN PADANG LAWAS UTARA'),(1221,12,'KABUPATEN PADANG LAWAS'),(1222,12,'KABUPATEN LABUHAN BATU SELATAN'),(1223,12,'KABUPATEN LABUHAN BATU UTARA'),(1224,12,'KABUPATEN NIAS UTARA'),(1225,12,'KABUPATEN NIAS BARAT'),(1271,12,'KOTA SIBOLGA'),(1272,12,'KOTA TANJUNG BALAI'),(1273,12,'KOTA PEMATANG SIANTAR'),(1274,12,'KOTA TEBING TINGGI'),(1275,12,'KOTA MEDAN'),(1276,12,'KOTA BINJAI'),(1277,12,'KOTA PADANGSIDIMPUAN'),(1278,12,'KOTA GUNUNGSITOLI'),(1301,13,'KABUPATEN KEPULAUAN MENTAWAI'),(1302,13,'KABUPATEN PESISIR SELATAN'),(1303,13,'KABUPATEN SOLOK'),(1304,13,'KABUPATEN SIJUNJUNG'),(1305,13,'KABUPATEN TANAH DATAR'),(1306,13,'KABUPATEN PADANG PARIAMAN'),(1307,13,'KABUPATEN AGAM'),(1308,13,'KABUPATEN LIMA PULUH KOTA'),(1309,13,'KABUPATEN PASAMAN'),(1310,13,'KABUPATEN SOLOK SELATAN'),(1311,13,'KABUPATEN DHARMASRAYA'),(1312,13,'KABUPATEN PASAMAN BARAT'),(1371,13,'KOTA PADANG'),(1372,13,'KOTA SOLOK'),(1373,13,'KOTA SAWAH LUNTO'),(1374,13,'KOTA PADANG PANJANG'),(1375,13,'KOTA BUKITTINGGI'),(1376,13,'KOTA PAYAKUMBUH'),(1377,13,'KOTA PARIAMAN'),(1401,14,'KABUPATEN KUANTAN SINGINGI'),(1402,14,'KABUPATEN INDRAGIRI HULU'),(1403,14,'KABUPATEN INDRAGIRI HILIR'),(1404,14,'KABUPATEN PELALAWAN'),(1405,14,'KABUPATEN S I A K'),(1406,14,'KABUPATEN KAMPAR'),(1407,14,'KABUPATEN ROKAN HULU'),(1408,14,'KABUPATEN BENGKALIS'),(1409,14,'KABUPATEN ROKAN HILIR'),(1410,14,'KABUPATEN KEPULAUAN MERANTI'),(1471,14,'KOTA PEKANBARU'),(1473,14,'KOTA D U M A I'),(1501,15,'KABUPATEN KERINCI'),(1502,15,'KABUPATEN MERANGIN'),(1503,15,'KABUPATEN SAROLANGUN'),(1504,15,'KABUPATEN BATANG HARI'),(1505,15,'KABUPATEN MUARO JAMBI'),(1506,15,'KABUPATEN TANJUNG JABUNG TIMUR'),(1507,15,'KABUPATEN TANJUNG JABUNG BARAT'),(1508,15,'KABUPATEN TEBO'),(1509,15,'KABUPATEN BUNGO'),(1571,15,'KOTA JAMBI'),(1572,15,'KOTA SUNGAI PENUH'),(1601,16,'KABUPATEN OGAN KOMERING ULU'),(1602,16,'KABUPATEN OGAN KOMERING ILIR'),(1603,16,'KABUPATEN MUARA ENIM'),(1604,16,'KABUPATEN LAHAT'),(1605,16,'KABUPATEN MUSI RAWAS'),(1606,16,'KABUPATEN MUSI BANYUASIN'),(1607,16,'KABUPATEN BANYU ASIN'),(1608,16,'KABUPATEN OGAN KOMERING ULU SELATAN'),(1609,16,'KABUPATEN OGAN KOMERING ULU TIMUR'),(1610,16,'KABUPATEN OGAN ILIR'),(1611,16,'KABUPATEN EMPAT LAWANG'),(1612,16,'KABUPATEN PENUKAL ABAB LEMATANG ILIR'),(1613,16,'KABUPATEN MUSI RAWAS UTARA'),(1671,16,'KOTA PALEMBANG'),(1672,16,'KOTA PRABUMULIH'),(1673,16,'KOTA PAGAR ALAM'),(1674,16,'KOTA LUBUKLINGGAU'),(1701,17,'KABUPATEN BENGKULU SELATAN'),(1702,17,'KABUPATEN REJANG LEBONG'),(1703,17,'KABUPATEN BENGKULU UTARA'),(1704,17,'KABUPATEN KAUR'),(1705,17,'KABUPATEN SELUMA'),(1706,17,'KABUPATEN MUKOMUKO'),(1707,17,'KABUPATEN LEBONG'),(1708,17,'KABUPATEN KEPAHIANG'),(1709,17,'KABUPATEN BENGKULU TENGAH'),(1771,17,'KOTA BENGKULU'),(1801,18,'KABUPATEN LAMPUNG BARAT'),(1802,18,'KABUPATEN TANGGAMUS'),(1803,18,'KABUPATEN LAMPUNG SELATAN'),(1804,18,'KABUPATEN LAMPUNG TIMUR'),(1805,18,'KABUPATEN LAMPUNG TENGAH'),(1806,18,'KABUPATEN LAMPUNG UTARA'),(1807,18,'KABUPATEN WAY KANAN'),(1808,18,'KABUPATEN TULANGBAWANG'),(1809,18,'KABUPATEN PESAWARAN'),(1810,18,'KABUPATEN PRINGSEWU'),(1811,18,'KABUPATEN MESUJI'),(1812,18,'KABUPATEN TULANG BAWANG BARAT'),(1813,18,'KABUPATEN PESISIR BARAT'),(1871,18,'KOTA BANDAR LAMPUNG'),(1872,18,'KOTA METRO'),(1901,19,'KABUPATEN BANGKA'),(1902,19,'KABUPATEN BELITUNG'),(1903,19,'KABUPATEN BANGKA BARAT'),(1904,19,'KABUPATEN BANGKA TENGAH'),(1905,19,'KABUPATEN BANGKA SELATAN'),(1906,19,'KABUPATEN BELITUNG TIMUR'),(1971,19,'KOTA PANGKAL PINANG'),(2101,21,'KABUPATEN KARIMUN'),(2102,21,'KABUPATEN BINTAN'),(2103,21,'KABUPATEN NATUNA'),(2104,21,'KABUPATEN LINGGA'),(2105,21,'KABUPATEN KEPULAUAN ANAMBAS'),(2171,21,'KOTA B A T A M'),(2172,21,'KOTA TANJUNG PINANG'),(3101,31,'KABUPATEN KEPULAUAN SERIBU'),(3171,31,'KOTA JAKARTA SELATAN'),(3172,31,'KOTA JAKARTA TIMUR'),(3173,31,'KOTA JAKARTA PUSAT'),(3174,31,'KOTA JAKARTA BARAT'),(3175,31,'KOTA JAKARTA UTARA'),(3201,32,'KABUPATEN BOGOR'),(3202,32,'KABUPATEN SUKABUMI'),(3203,32,'KABUPATEN CIANJUR'),(3204,32,'KABUPATEN BANDUNG'),(3205,32,'KABUPATEN GARUT'),(3206,32,'KABUPATEN TASIKMALAYA'),(3207,32,'KABUPATEN CIAMIS'),(3208,32,'KABUPATEN KUNINGAN'),(3209,32,'KABUPATEN CIREBON'),(3210,32,'KABUPATEN MAJALENGKA'),(3211,32,'KABUPATEN SUMEDANG'),(3212,32,'KABUPATEN INDRAMAYU'),(3213,32,'KABUPATEN SUBANG'),(3214,32,'KABUPATEN PURWAKARTA'),(3215,32,'KABUPATEN KARAWANG'),(3216,32,'KABUPATEN BEKASI'),(3217,32,'KABUPATEN BANDUNG BARAT'),(3218,32,'KABUPATEN PANGANDARAN'),(3271,32,'KOTA BOGOR'),(3272,32,'KOTA SUKABUMI'),(3273,32,'KOTA BANDUNG'),(3274,32,'KOTA CIREBON'),(3275,32,'KOTA BEKASI'),(3276,32,'KOTA DEPOK'),(3277,32,'KOTA CIMAHI'),(3278,32,'KOTA TASIKMALAYA'),(3279,32,'KOTA BANJAR'),(3301,33,'KABUPATEN CILACAP'),(3302,33,'KABUPATEN BANYUMAS'),(3303,33,'KABUPATEN PURBALINGGA'),(3304,33,'KABUPATEN BANJARNEGARA'),(3305,33,'KABUPATEN KEBUMEN'),(3306,33,'KABUPATEN PURWOREJO'),(3307,33,'KABUPATEN WONOSOBO'),(3308,33,'KABUPATEN MAGELANG'),(3309,33,'KABUPATEN BOYOLALI'),(3310,33,'KABUPATEN KLATEN'),(3311,33,'KABUPATEN SUKOHARJO'),(3312,33,'KABUPATEN WONOGIRI'),(3313,33,'KABUPATEN KARANGANYAR'),(3314,33,'KABUPATEN SRAGEN'),(3315,33,'KABUPATEN GROBOGAN'),(3316,33,'KABUPATEN BLORA'),(3317,33,'KABUPATEN REMBANG'),(3318,33,'KABUPATEN PATI'),(3319,33,'KABUPATEN KUDUS'),(3320,33,'KABUPATEN JEPARA'),(3321,33,'KABUPATEN DEMAK'),(3322,33,'KABUPATEN SEMARANG'),(3323,33,'KABUPATEN TEMANGGUNG'),(3324,33,'KABUPATEN KENDAL'),(3325,33,'KABUPATEN BATANG'),(3326,33,'KABUPATEN PEKALONGAN'),(3327,33,'KABUPATEN PEMALANG'),(3328,33,'KABUPATEN TEGAL'),(3329,33,'KABUPATEN BREBES'),(3371,33,'KOTA MAGELANG'),(3372,33,'KOTA SURAKARTA'),(3373,33,'KOTA SALATIGA'),(3374,33,'KOTA SEMARANG'),(3375,33,'KOTA PEKALONGAN'),(3376,33,'KOTA TEGAL'),(3401,34,'KABUPATEN KULON PROGO'),(3402,34,'KABUPATEN BANTUL'),(3403,34,'KABUPATEN GUNUNG KIDUL'),(3404,34,'KABUPATEN SLEMAN'),(3471,34,'KOTA YOGYAKARTA'),(3501,35,'KABUPATEN PACITAN'),(3502,35,'KABUPATEN PONOROGO'),(3503,35,'KABUPATEN TRENGGALEK'),(3504,35,'KABUPATEN TULUNGAGUNG'),(3505,35,'KABUPATEN BLITAR'),(3506,35,'KABUPATEN KEDIRI'),(3507,35,'KABUPATEN MALANG'),(3508,35,'KABUPATEN LUMAJANG'),(3509,35,'KABUPATEN JEMBER'),(3510,35,'KABUPATEN BANYUWANGI'),(3511,35,'KABUPATEN BONDOWOSO'),(3512,35,'KABUPATEN SITUBONDO'),(3513,35,'KABUPATEN PROBOLINGGO'),(3514,35,'KABUPATEN PASURUAN'),(3515,35,'KABUPATEN SIDOARJO'),(3516,35,'KABUPATEN MOJOKERTO'),(3517,35,'KABUPATEN JOMBANG'),(3518,35,'KABUPATEN NGANJUK'),(3519,35,'KABUPATEN MADIUN'),(3520,35,'KABUPATEN MAGETAN'),(3521,35,'KABUPATEN NGAWI'),(3522,35,'KABUPATEN BOJONEGORO'),(3523,35,'KABUPATEN TUBAN'),(3524,35,'KABUPATEN LAMONGAN'),(3525,35,'KABUPATEN GRESIK'),(3526,35,'KABUPATEN BANGKALAN'),(3527,35,'KABUPATEN SAMPANG'),(3528,35,'KABUPATEN PAMEKASAN'),(3529,35,'KABUPATEN SUMENEP'),(3571,35,'KOTA KEDIRI'),(3572,35,'KOTA BLITAR'),(3573,35,'KOTA MALANG'),(3574,35,'KOTA PROBOLINGGO'),(3575,35,'KOTA PASURUAN'),(3576,35,'KOTA MOJOKERTO'),(3577,35,'KOTA MADIUN'),(3578,35,'KOTA SURABAYA'),(3579,35,'KOTA BATU'),(3601,36,'KABUPATEN PANDEGLANG'),(3602,36,'KABUPATEN LEBAK'),(3603,36,'KABUPATEN TANGERANG'),(3604,36,'KABUPATEN SERANG'),(3671,36,'KOTA TANGERANG'),(3672,36,'KOTA CILEGON'),(3673,36,'KOTA SERANG'),(3674,36,'KOTA TANGERANG SELATAN'),(5101,51,'KABUPATEN JEMBRANA'),(5102,51,'KABUPATEN TABANAN'),(5103,51,'KABUPATEN BADUNG'),(5104,51,'KABUPATEN GIANYAR'),(5105,51,'KABUPATEN KLUNGKUNG'),(5106,51,'KABUPATEN BANGLI'),(5107,51,'KABUPATEN KARANG ASEM'),(5108,51,'KABUPATEN BULELENG'),(5171,51,'KOTA DENPASAR'),(5201,52,'KABUPATEN LOMBOK BARAT'),(5202,52,'KABUPATEN LOMBOK TENGAH'),(5203,52,'KABUPATEN LOMBOK TIMUR'),(5204,52,'KABUPATEN SUMBAWA'),(5205,52,'KABUPATEN DOMPU'),(5206,52,'KABUPATEN BIMA'),(5207,52,'KABUPATEN SUMBAWA BARAT'),(5208,52,'KABUPATEN LOMBOK UTARA'),(5271,52,'KOTA MATARAM'),(5272,52,'KOTA BIMA'),(5301,53,'KABUPATEN SUMBA BARAT'),(5302,53,'KABUPATEN SUMBA TIMUR'),(5303,53,'KABUPATEN KUPANG'),(5304,53,'KABUPATEN TIMOR TENGAH SELATAN'),(5305,53,'KABUPATEN TIMOR TENGAH UTARA'),(5306,53,'KABUPATEN BELU'),(5307,53,'KABUPATEN ALOR'),(5308,53,'KABUPATEN LEMBATA'),(5309,53,'KABUPATEN FLORES TIMUR'),(5310,53,'KABUPATEN SIKKA'),(5311,53,'KABUPATEN ENDE'),(5312,53,'KABUPATEN NGADA'),(5313,53,'KABUPATEN MANGGARAI'),(5314,53,'KABUPATEN ROTE NDAO'),(5315,53,'KABUPATEN MANGGARAI BARAT'),(5316,53,'KABUPATEN SUMBA TENGAH'),(5317,53,'KABUPATEN SUMBA BARAT DAYA'),(5318,53,'KABUPATEN NAGAKEO'),(5319,53,'KABUPATEN MANGGARAI TIMUR'),(5320,53,'KABUPATEN SABU RAIJUA'),(5321,53,'KABUPATEN MALAKA'),(5371,53,'KOTA KUPANG'),(6101,61,'KABUPATEN SAMBAS'),(6102,61,'KABUPATEN BENGKAYANG'),(6103,61,'KABUPATEN LANDAK'),(6104,61,'KABUPATEN MEMPAWAH'),(6105,61,'KABUPATEN SANGGAU'),(6106,61,'KABUPATEN KETAPANG'),(6107,61,'KABUPATEN SINTANG'),(6108,61,'KABUPATEN KAPUAS HULU'),(6109,61,'KABUPATEN SEKADAU'),(6110,61,'KABUPATEN MELAWI'),(6111,61,'KABUPATEN KAYONG UTARA'),(6112,61,'KABUPATEN KUBU RAYA'),(6171,61,'KOTA PONTIANAK'),(6172,61,'KOTA SINGKAWANG'),(6201,62,'KABUPATEN KOTAWARINGIN BARAT'),(6202,62,'KABUPATEN KOTAWARINGIN TIMUR'),(6203,62,'KABUPATEN KAPUAS'),(6204,62,'KABUPATEN BARITO SELATAN'),(6205,62,'KABUPATEN BARITO UTARA'),(6206,62,'KABUPATEN SUKAMARA'),(6207,62,'KABUPATEN LAMANDAU'),(6208,62,'KABUPATEN SERUYAN'),(6209,62,'KABUPATEN KATINGAN'),(6210,62,'KABUPATEN PULANG PISAU'),(6211,62,'KABUPATEN GUNUNG MAS'),(6212,62,'KABUPATEN BARITO TIMUR'),(6213,62,'KABUPATEN MURUNG RAYA'),(6271,62,'KOTA PALANGKA RAYA'),(6301,63,'KABUPATEN TANAH LAUT'),(6302,63,'KABUPATEN KOTA BARU'),(6303,63,'KABUPATEN BANJAR'),(6304,63,'KABUPATEN BARITO KUALA'),(6305,63,'KABUPATEN TAPIN'),(6306,63,'KABUPATEN HULU SUNGAI SELATAN'),(6307,63,'KABUPATEN HULU SUNGAI TENGAH'),(6308,63,'KABUPATEN HULU SUNGAI UTARA'),(6309,63,'KABUPATEN TABALONG'),(6310,63,'KABUPATEN TANAH BUMBU'),(6311,63,'KABUPATEN BALANGAN'),(6371,63,'KOTA BANJARMASIN'),(6372,63,'KOTA BANJAR BARU'),(6401,64,'KABUPATEN PASER'),(6402,64,'KABUPATEN KUTAI BARAT'),(6403,64,'KABUPATEN KUTAI KARTANEGARA'),(6404,64,'KABUPATEN KUTAI TIMUR'),(6405,64,'KABUPATEN BERAU'),(6409,64,'KABUPATEN PENAJAM PASER UTARA'),(6411,64,'KABUPATEN MAHAKAM HULU'),(6471,64,'KOTA BALIKPAPAN'),(6472,64,'KOTA SAMARINDA'),(6474,64,'KOTA BONTANG'),(6501,65,'KABUPATEN MALINAU'),(6502,65,'KABUPATEN BULUNGAN'),(6503,65,'KABUPATEN TANA TIDUNG'),(6504,65,'KABUPATEN NUNUKAN'),(6571,65,'KOTA TARAKAN'),(7101,71,'KABUPATEN BOLAANG MONGONDOW'),(7102,71,'KABUPATEN MINAHASA'),(7103,71,'KABUPATEN KEPULAUAN SANGIHE'),(7104,71,'KABUPATEN KEPULAUAN TALAUD'),(7105,71,'KABUPATEN MINAHASA SELATAN'),(7106,71,'KABUPATEN MINAHASA UTARA'),(7107,71,'KABUPATEN BOLAANG MONGONDOW UTARA'),(7108,71,'KABUPATEN SIAU TAGULANDANG BIARO'),(7109,71,'KABUPATEN MINAHASA TENGGARA'),(7110,71,'KABUPATEN BOLAANG MONGONDOW SELATAN'),(7111,71,'KABUPATEN BOLAANG MONGONDOW TIMUR'),(7171,71,'KOTA MANADO'),(7172,71,'KOTA BITUNG'),(7173,71,'KOTA TOMOHON'),(7174,71,'KOTA KOTAMOBAGU'),(7201,72,'KABUPATEN BANGGAI KEPULAUAN'),(7202,72,'KABUPATEN BANGGAI'),(7203,72,'KABUPATEN MOROWALI'),(7204,72,'KABUPATEN POSO'),(7205,72,'KABUPATEN DONGGALA'),(7206,72,'KABUPATEN TOLI-TOLI'),(7207,72,'KABUPATEN BUOL'),(7208,72,'KABUPATEN PARIGI MOUTONG'),(7209,72,'KABUPATEN TOJO UNA-UNA'),(7210,72,'KABUPATEN SIGI'),(7211,72,'KABUPATEN BANGGAI LAUT'),(7212,72,'KABUPATEN MOROWALI UTARA'),(7271,72,'KOTA PALU'),(7301,73,'KABUPATEN KEPULAUAN SELAYAR'),(7302,73,'KABUPATEN BULUKUMBA'),(7303,73,'KABUPATEN BANTAENG'),(7304,73,'KABUPATEN JENEPONTO'),(7305,73,'KABUPATEN TAKALAR'),(7306,73,'KABUPATEN GOWA'),(7307,73,'KABUPATEN SINJAI'),(7308,73,'KABUPATEN MAROS'),(7309,73,'KABUPATEN PANGKAJENE DAN KEPULAUAN'),(7310,73,'KABUPATEN BARRU'),(7311,73,'KABUPATEN BONE'),(7312,73,'KABUPATEN SOPPENG'),(7313,73,'KABUPATEN WAJO'),(7314,73,'KABUPATEN SIDENRENG RAPPANG'),(7315,73,'KABUPATEN PINRANG'),(7316,73,'KABUPATEN ENREKANG'),(7317,73,'KABUPATEN LUWU'),(7318,73,'KABUPATEN TANA TORAJA'),(7322,73,'KABUPATEN LUWU UTARA'),(7325,73,'KABUPATEN LUWU TIMUR'),(7326,73,'KABUPATEN TORAJA UTARA'),(7371,73,'KOTA MAKASSAR'),(7372,73,'KOTA PAREPARE'),(7373,73,'KOTA PALOPO'),(7401,74,'KABUPATEN BUTON'),(7402,74,'KABUPATEN MUNA'),(7403,74,'KABUPATEN KONAWE'),(7404,74,'KABUPATEN KOLAKA'),(7405,74,'KABUPATEN KONAWE SELATAN'),(7406,74,'KABUPATEN BOMBANA'),(7407,74,'KABUPATEN WAKATOBI'),(7408,74,'KABUPATEN KOLAKA UTARA'),(7409,74,'KABUPATEN BUTON UTARA'),(7410,74,'KABUPATEN KONAWE UTARA'),(7411,74,'KABUPATEN KOLAKA TIMUR'),(7412,74,'KABUPATEN KONAWE KEPULAUAN'),(7413,74,'KABUPATEN MUNA BARAT'),(7414,74,'KABUPATEN BUTON TENGAH'),(7415,74,'KABUPATEN BUTON SELATAN'),(7471,74,'KOTA KENDARI'),(7472,74,'KOTA BAUBAU'),(7501,75,'KABUPATEN BOALEMO'),(7502,75,'KABUPATEN GORONTALO'),(7503,75,'KABUPATEN POHUWATO'),(7504,75,'KABUPATEN BONE BOLANGO'),(7505,75,'KABUPATEN GORONTALO UTARA'),(7571,75,'KOTA GORONTALO'),(7601,76,'KABUPATEN MAJENE'),(7602,76,'KABUPATEN POLEWALI MANDAR'),(7603,76,'KABUPATEN MAMASA'),(7604,76,'KABUPATEN MAMUJU'),(7605,76,'KABUPATEN PASANGKAYU'),(7606,76,'KABUPATEN MAMUJU TENGAH'),(8101,81,'KABUPATEN KEPULAUAN TANIMBAR'),(8102,81,'KABUPATEN MALUKU TENGGARA'),(8103,81,'KABUPATEN MALUKU TENGAH'),(8104,81,'KABUPATEN BURU'),(8105,81,'KABUPATEN KEPULAUAN ARU'),(8106,81,'KABUPATEN SERAM BAGIAN BARAT'),(8107,81,'KABUPATEN SERAM BAGIAN TIMUR'),(8108,81,'KABUPATEN KEPULAUAN ARU SELATAN'),(8109,81,'KABUPATEN BURU SELATAN'),(8171,81,'KOTA AMBON'),(8172,81,'KOTA TUAL'),(8201,82,'KABUPATEN HALMAHERA BARAT'),(8202,82,'KABUPATEN HALMAHERA TENGAH'),(8203,82,'KABUPATEN KEPULAUAN SULA'),(8204,82,'KABUPATEN HALMAHERA SELATAN'),(8205,82,'KABUPATEN HALMAHERA UTARA'),(8206,82,'KABUPATEN HALMAHERA TIMUR'),(8207,82,'KABUPATEN PULAU MOROTAI'),(8208,82,'KABUPATEN PULAU TALIABU'),(8271,82,'KOTA TERNATE'),(8272,82,'KOTA TIDORE KEPULAUAN'),(9101,91,'KABUPATEN FAKFAK'),(9102,91,'KABUPATEN KAIMANA'),(9103,91,'KABUPATEN TELUK WONDAMA'),(9104,91,'KABUPATEN TELUK BINTUNI'),(9105,91,'KABUPATEN MANOKWARI'),(9106,91,'KABUPATEN SORONG SELATAN'),(9107,91,'KABUPATEN SORONG'),(9108,91,'KABUPATEN RAJA AMPAT'),(9109,91,'KABUPATEN TAMBRAUW'),(9110,91,'KABUPATEN MAYBRAT'),(9111,91,'KABUPATEN MANOKWARI SELATAN'),(9112,91,'KABUPATEN PEGUNUNGAN ARFAK'),(9171,91,'KOTA SORONG'),(9201,92,'KABUPATEN MERAUKE'),(9202,92,'KABUPATEN JAYAWIJAYA'),(9203,92,'KABUPATEN JAYAPURA'),(9204,92,'KABUPATEN NABIRE'),(9205,92,'KABUPATEN KEPULAUAN YAPEN'),(9206,92,'KABUPATEN BIAK NUMFOR'),(9207,92,'KABUPATEN PUNCAK JAYA'),(9208,92,'KABUPATEN PANIAI'),(9209,92,'KABUPATEN MIMIKA'),(9210,92,'KABUPATEN SARMI'),(9211,92,'KABUPATEN KEEROM'),(9212,92,'KABUPATEN PEGUNUNGAN BINTANG'),(9213,92,'KABUPATEN YAHUKIMO'),(9214,92,'KABUPATEN TOLIKARA'),(9215,92,'KABUPATEN WAROPEN'),(9216,92,'KABUPATEN BOVEN DIGOEL'),(9217,92,'KABUPATEN MAPPI'),(9218,92,'KABUPATEN ASMAT'),(9219,92,'KABUPATEN SUPIORI'),(9220,92,'KABUPATEN MAMBERAMO RAYA'),(9226,92,'KABUPATEN MAMBERAMO TENGAH'),(9227,92,'KABUPATEN YALIMO'),(9228,92,'KABUPATEN LANNY JAYA'),(9229,92,'KABUPATEN NDUGA'),(9230,92,'KABUPATEN PUNCAK'),(9231,92,'KABUPATEN DOGIYAI'),(9232,92,'KABUPATEN INTAN JAYA'),(9233,92,'KABUPATEN DEIYAI'),(9271,92,'KOTA JAYAPURA'),(9301,93,'KABUPATEN JAYAWIJAYA'),(9302,93,'KABUPATEN PEGUNUNGAN BINTANG'),(9303,93,'KABUPATEN YAHUKIMO'),(9304,93,'KABUPATEN TOLIKARA'),(9305,93,'KABUPATEN MAMBERAMO TENGAH'),(9306,93,'KABUPATEN YALIMO'),(9307,93,'KABUPATEN LANNY JAYA'),(9308,93,'KABUPATEN NDUGA'),(9401,94,'KABUPATEN MERAUKE'),(9402,94,'KABUPATEN BOVEN DIGOEL'),(9403,94,'KABUPATEN MAPPI'),(9404,94,'KABUPATEN ASMAT'),(9501,95,'KABUPATEN NABIRE'),(9502,95,'KABUPATEN PUNCAK JAYA'),(9503,95,'KABUPATEN PANIAI'),(9504,95,'KABUPATEN MIMIKA'),(9505,95,'KABUPATEN PUNCAK'),(9506,95,'KABUPATEN DOGIYAI'),(9507,95,'KABUPATEN INTAN JAYA'),(9508,95,'KABUPATEN DEIYAI'),(9601,96,'KABUPATEN SORONG'),(9602,96,'KABUPATEN SORONG SELATAN'),(9603,96,'KABUPATEN RAJA AMPAT'),(9604,96,'KABUPATEN TAMBRAUW'),(9605,96,'KABUPATEN MAYBRAT'),(9671,96,'KOTA SORONG');
/*!40000 ALTER TABLE `ref_kabupaten_kota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ref_provinsi`
--

DROP TABLE IF EXISTS `ref_provinsi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_provinsi` (
  `id_provinsi` int NOT NULL,
  `nama_provinsi` varchar(255) NOT NULL,
  PRIMARY KEY (`id_provinsi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_provinsi`
--

LOCK TABLES `ref_provinsi` WRITE;
/*!40000 ALTER TABLE `ref_provinsi` DISABLE KEYS */;
INSERT INTO `ref_provinsi` VALUES (11,'ACEH'),(12,'SUMATERA UTARA'),(13,'SUMATERA BARAT'),(14,'RIAU'),(15,'JAMBI'),(16,'SUMATERA SELATAN'),(17,'BENGKULU'),(18,'LAMPUNG'),(19,'KEPULAUAN BANGKA BELITUNG'),(21,'KEPULAUAN RIAU'),(31,'DKI JAKARTA'),(32,'JAWA BARAT'),(33,'JAWA TENGAH'),(34,'DI YOGYAKARTA'),(35,'JAWA TIMUR'),(36,'BANTEN'),(51,'BALI'),(52,'NUSA TENGGARA BARAT'),(53,'NUSA TENGGARA TIMUR'),(61,'KALIMANTAN BARAT'),(62,'KALIMANTAN TENGAH'),(63,'KALIMANTAN SELATAN'),(64,'KALIMANTAN TIMUR'),(65,'KALIMANTAN UTARA'),(71,'SULAWESI UTARA'),(72,'SULAWESI TENGAH'),(73,'SULAWESI SELATAN'),(74,'SULAWESI TENGGARA'),(75,'GORONTALO'),(76,'SULAWESI BARAT'),(81,'MALUKU'),(82,'MALUKU UTARA'),(91,'PAPUA BARAT'),(92,'PAPUA'),(93,'PAPUA PEGUNUNGAN'),(94,'PAPUA SELATAN'),(95,'PAPUA TENGAH'),(96,'PAPUA BARAT DAYA');
/*!40000 ALTER TABLE `ref_provinsi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sumber_pendanaan`
--

DROP TABLE IF EXISTS `sumber_pendanaan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sumber_pendanaan` (
  `id_sumber` int NOT NULL AUTO_INCREMENT,
  `id_tahun` int NOT NULL,
  `sumber_dana` varchar(255) NOT NULL,
  `jumlah_dana` int NOT NULL,
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_sumber`),
  KEY `id_tahun` (`id_tahun`),
  KEY `deleted_at` (`deleted_at`),
  CONSTRAINT `sumber_pendanaan_ibfk_1` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sumber_pendanaan`
--

LOCK TABLES `sumber_pendanaan` WRITE;
/*!40000 ALTER TABLE `sumber_pendanaan` DISABLE KEYS */;
INSERT INTO `sumber_pendanaan` VALUES (10,2025,'SLOT1',1000000,'link','2025-08-22 06:18:43','2025-08-22 06:18:43',NULL,NULL),(11,2024,'SLOT2',2000000,'LINK','2025-08-22 06:19:09','2025-08-22 06:19:09',NULL,NULL),(12,2023,'SLOT3',3000000,'LINK','2025-08-22 06:19:29','2025-08-22 06:19:29',NULL,NULL),(13,2022,'SLOT4',3000000,'LINK','2025-08-22 06:20:00','2025-08-22 06:20:00',NULL,NULL),(16,2025,'SLOT1',3000000,'HGJHGJH','2025-08-22 06:39:35','2025-09-30 10:03:15','2025-09-30 17:03:15',1),(17,2026,'SLOT1',3000000,'BVCBGFGF','2025-08-22 06:40:08','2025-09-30 10:03:19','2025-09-30 17:03:20',1),(19,2025,'Hibah Pemerintah (Revisi)',175000000,'https://drive.test/hibah2025_revisi.pdf','2025-09-19 03:46:52','2025-09-19 05:27:53','2025-09-19 12:27:53',4),(20,2024,'Hibah Penelitian',1000000,'https://hdhsh.com','2025-09-30 10:06:26','2025-09-30 10:06:26',NULL,NULL);
/*!40000 ALTER TABLE `sumber_pendanaan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2a1_mahasiswa_baru_aktif`
--

DROP TABLE IF EXISTS `tabel_2a1_mahasiswa_baru_aktif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2a1_mahasiswa_baru_aktif` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis` enum('baru','aktif') NOT NULL,
  `jalur` enum('reguler','rpl') NOT NULL,
  `jumlah_total` int DEFAULT '0',
  `jumlah_afirmasi` int DEFAULT '0',
  `jumlah_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_tahun` (`id_tahun`),
  KEY `idx_unit_prodi` (`id_unit_prodi`),
  KEY `idx_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2a1_mahasiswa_baru_aktif_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2a1_mahasiswa_baru_aktif`
--

LOCK TABLES `tabel_2a1_mahasiswa_baru_aktif` WRITE;
/*!40000 ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif` DISABLE KEYS */;
INSERT INTO `tabel_2a1_mahasiswa_baru_aktif` VALUES (3,4,2020,'baru','reguler',120,4,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(4,4,2020,'aktif','reguler',400,12,3,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(5,4,2021,'baru','reguler',130,5,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(6,4,2021,'aktif','reguler',410,14,4,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(7,4,2022,'baru','reguler',145,6,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(8,4,2022,'aktif','reguler',420,15,4,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(9,4,2023,'baru','reguler',140,7,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(10,4,2023,'aktif','reguler',425,16,3,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(11,4,2024,'baru','reguler',105,6,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(12,4,2024,'aktif','reguler',120,8,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(13,5,2020,'baru','reguler',90,3,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(14,5,2020,'aktif','reguler',250,8,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(15,5,2021,'baru','reguler',100,4,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(16,5,2021,'aktif','reguler',260,9,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(17,5,2022,'baru','reguler',110,5,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(18,5,2022,'aktif','reguler',270,10,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(19,5,2023,'baru','reguler',115,6,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(20,5,2023,'aktif','reguler',280,11,2,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(21,5,2024,'baru','reguler',95,5,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL),(22,5,2024,'aktif','reguler',210,7,1,'2025-10-09 07:08:37','2025-10-09 07:08:37',NULL,NULL);
/*!40000 ALTER TABLE `tabel_2a1_mahasiswa_baru_aktif` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2a1_pendaftaran`
--

DROP TABLE IF EXISTS `tabel_2a1_pendaftaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2a1_pendaftaran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `daya_tampung` int DEFAULT '0',
  `pendaftar` int DEFAULT '0',
  `pendaftar_afirmasi` int DEFAULT '0',
  `pendaftar_kebutuhan_khusus` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_pendaftaran` (`id_unit_prodi`,`id_tahun`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2a1_pendaftaran_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2a1_pendaftaran_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2a1_pendaftaran`
--

LOCK TABLES `tabel_2a1_pendaftaran` WRITE;
/*!40000 ALTER TABLE `tabel_2a1_pendaftaran` DISABLE KEYS */;
INSERT INTO `tabel_2a1_pendaftaran` VALUES (1,1,2024,160,130,8,2,'2025-10-03 09:26:23','2025-10-03 09:27:44',NULL,NULL);
/*!40000 ALTER TABLE `tabel_2a1_pendaftaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2a2_keragaman_asal`
--

DROP TABLE IF EXISTS `tabel_2a2_keragaman_asal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2a2_keragaman_asal` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `nama_daerah_input` varchar(255) NOT NULL,
  `kategori_geografis` enum('Sama Kota/Kab','Kota/Kab Lain','Provinsi Lain','Negara Lain') NOT NULL,
  `is_afirmasi` tinyint(1) NOT NULL DEFAULT '0',
  `is_kebutuhan_khusus` tinyint(1) NOT NULL DEFAULT '0',
  `jumlah_mahasiswa` int DEFAULT '0',
  `link_bukti` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_unit_prodi` (`id_unit_prodi`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2a2_keragaman_asal_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2a2_keragaman_asal`
--

LOCK TABLES `tabel_2a2_keragaman_asal` WRITE;
/*!40000 ALTER TABLE `tabel_2a2_keragaman_asal` DISABLE KEYS */;
INSERT INTO `tabel_2a2_keragaman_asal` VALUES (2,2,2024,'KABUPATEN BANYUWANGI','Kota/Kab Lain',0,0,30,'https://drive.google.com/file/abc123','2025-10-06 06:37:18','2025-10-06 06:37:18',NULL,NULL),(3,2,2024,'KABUPATEN BANYUWANGI','Kota/Kab Lain',0,0,30,'https://drive.google.com/file/abc123','2025-10-06 09:12:19','2025-10-06 09:12:19',NULL,NULL);
/*!40000 ALTER TABLE `tabel_2a2_keragaman_asal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2a3_kondisi_mahasiswa`
--

DROP TABLE IF EXISTS `tabel_2a3_kondisi_mahasiswa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2a3_kondisi_mahasiswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jml_baru` int DEFAULT '0',
  `jml_aktif` int DEFAULT '0',
  `jml_lulus` int DEFAULT '0',
  `jml_do` int DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_kondisi` (`id_unit_prodi`,`id_tahun`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2a3_kondisi_mahasiswa_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2a3_kondisi_mahasiswa`
--

LOCK TABLES `tabel_2a3_kondisi_mahasiswa` WRITE;
/*!40000 ALTER TABLE `tabel_2a3_kondisi_mahasiswa` DISABLE KEYS */;
INSERT INTO `tabel_2a3_kondisi_mahasiswa` VALUES (6,1,2024,0,0,30,5,NULL,NULL),(7,4,2024,105,120,30,5,NULL,NULL);
/*!40000 ALTER TABLE `tabel_2a3_kondisi_mahasiswa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2b4_masa_tunggu`
--

DROP TABLE IF EXISTS `tabel_2b4_masa_tunggu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2b4_masa_tunggu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jumlah_lulusan` int DEFAULT '0',
  `jumlah_terlacak` int DEFAULT '0',
  `rata_rata_waktu_tunggu_bulan` float DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_tunggu` (`id_unit_prodi`,`id_tahun_lulus`),
  KEY `id_tahun_lulus` (`id_tahun_lulus`),
  CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2b4_masa_tunggu_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2b4_masa_tunggu`
--

LOCK TABLES `tabel_2b4_masa_tunggu` WRITE;
/*!40000 ALTER TABLE `tabel_2b4_masa_tunggu` DISABLE KEYS */;
/*!40000 ALTER TABLE `tabel_2b4_masa_tunggu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2b5_kesesuaian_kerja`
--

DROP TABLE IF EXISTS `tabel_2b5_kesesuaian_kerja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2b5_kesesuaian_kerja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun_lulus` int NOT NULL,
  `jml_infokom` int DEFAULT '0',
  `jml_non_infokom` int DEFAULT '0',
  `jml_internasional` int DEFAULT '0',
  `jml_nasional` int DEFAULT '0',
  `jml_wirausaha` int DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_kerja` (`id_unit_prodi`,`id_tahun_lulus`),
  KEY `id_tahun_lulus` (`id_tahun_lulus`),
  CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2b5_kesesuaian_kerja_ibfk_2` FOREIGN KEY (`id_tahun_lulus`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2b5_kesesuaian_kerja`
--

LOCK TABLES `tabel_2b5_kesesuaian_kerja` WRITE;
/*!40000 ALTER TABLE `tabel_2b5_kesesuaian_kerja` DISABLE KEYS */;
/*!40000 ALTER TABLE `tabel_2b5_kesesuaian_kerja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2b6_kepuasan_pengguna`
--

DROP TABLE IF EXISTS `tabel_2b6_kepuasan_pengguna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2b6_kepuasan_pengguna` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `jenis_kemampuan` varchar(255) NOT NULL,
  `persen_sangat_baik` float DEFAULT '0',
  `persen_baik` float DEFAULT '0',
  `persen_cukup` float DEFAULT '0',
  `persen_kurang` float DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_kepuasan` (`id_unit_prodi`,`id_tahun`,`jenis_kemampuan`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2b6_kepuasan_pengguna_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2b6_kepuasan_pengguna`
--

LOCK TABLES `tabel_2b6_kepuasan_pengguna` WRITE;
/*!40000 ALTER TABLE `tabel_2b6_kepuasan_pengguna` DISABLE KEYS */;
/*!40000 ALTER TABLE `tabel_2b6_kepuasan_pengguna` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2c_pembelajaran_luar_prodi`
--

DROP TABLE IF EXISTS `tabel_2c_pembelajaran_luar_prodi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2c_pembelajaran_luar_prodi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `bentuk_pembelajaran` varchar(255) NOT NULL,
  `jumlah_mahasiswa` int DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_pembelajaran` (`id_unit_prodi`,`id_tahun`,`bentuk_pembelajaran`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2c_pembelajaran_luar_prodi_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2c_pembelajaran_luar_prodi`
--

LOCK TABLES `tabel_2c_pembelajaran_luar_prodi` WRITE;
/*!40000 ALTER TABLE `tabel_2c_pembelajaran_luar_prodi` DISABLE KEYS */;
/*!40000 ALTER TABLE `tabel_2c_pembelajaran_luar_prodi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabel_2d_rekognisi_lulusan`
--

DROP TABLE IF EXISTS `tabel_2d_rekognisi_lulusan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tabel_2d_rekognisi_lulusan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_unit_prodi` int NOT NULL,
  `id_tahun` int NOT NULL,
  `sumber_rekognisi` varchar(255) NOT NULL,
  `jumlah_rekognisi` int DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unik_rekognisi` (`id_unit_prodi`,`id_tahun`,`sumber_rekognisi`),
  KEY `id_tahun` (`id_tahun`),
  CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_1` FOREIGN KEY (`id_unit_prodi`) REFERENCES `unit_kerja` (`id_unit`),
  CONSTRAINT `tabel_2d_rekognisi_lulusan_ibfk_2` FOREIGN KEY (`id_tahun`) REFERENCES `tahun_akademik` (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabel_2d_rekognisi_lulusan`
--

LOCK TABLES `tabel_2d_rekognisi_lulusan` WRITE;
/*!40000 ALTER TABLE `tabel_2d_rekognisi_lulusan` DISABLE KEYS */;
/*!40000 ALTER TABLE `tabel_2d_rekognisi_lulusan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tahun_akademik`
--

DROP TABLE IF EXISTS `tahun_akademik`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tahun_akademik` (
  `id_tahun` int NOT NULL,
  `tahun` varchar(10) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tahun_akademik`
--

LOCK TABLES `tahun_akademik` WRITE;
/*!40000 ALTER TABLE `tahun_akademik` DISABLE KEYS */;
INSERT INTO `tahun_akademik` VALUES (2020,'2020/2021',NULL,NULL),(2021,'2021/2022',NULL,NULL),(2022,'2022/2023',NULL,NULL),(2023,'2023/2024',NULL,NULL),(2024,'2024/2025',NULL,NULL),(2025,'2025/2026',NULL,NULL),(2026,'2026/2027',NULL,NULL),(2027,'2027/2028',NULL,NULL),(2028,'2028/2029',NULL,NULL),(2029,'2029/2030',NULL,NULL),(2030,'2030/2031',NULL,NULL),(2031,'2031/2032',NULL,NULL),(2032,'2032/2033',NULL,NULL),(2033,'2033/2034',NULL,NULL),(2034,'2034/2035',NULL,NULL),(2035,'2035/2036',NULL,NULL),(2036,'2036/2037',NULL,NULL),(2037,'2037/2038',NULL,NULL),(2038,'2038/2039',NULL,NULL),(2039,'2039/2040',NULL,NULL),(2040,'2040/2041',NULL,NULL),(2041,'2041/2042',NULL,NULL),(2042,'2042/2043',NULL,NULL),(2043,'2043/2044',NULL,NULL),(2044,'2044/2045',NULL,NULL),(2045,'2045/2046',NULL,NULL),(2046,'2046/2047',NULL,NULL),(2047,'2047/2048',NULL,NULL),(2048,'2048/2049',NULL,NULL),(2049,'2049/2050',NULL,NULL),(2050,'2050/2051',NULL,NULL),(2051,'2051/2052',NULL,NULL),(2052,'2052/2053',NULL,NULL),(2053,'2053/2054',NULL,NULL),(2054,'2054/2055',NULL,NULL),(2055,'2055/2056',NULL,NULL),(2056,'2056/2057',NULL,NULL),(2057,'2057/2058',NULL,NULL),(2058,'2058/2059',NULL,NULL),(2059,'2059/2060',NULL,NULL),(2060,'2060/2061',NULL,NULL),(2061,'2061/2062',NULL,NULL),(2062,'2062/2063',NULL,NULL),(2063,'2063/2064',NULL,NULL),(2064,'2064/2065',NULL,NULL),(2065,'2065/2066',NULL,NULL),(2066,'2066/2067',NULL,NULL),(2067,'2067/2068',NULL,NULL),(2068,'2068/2069',NULL,NULL),(2069,'2069/2070',NULL,NULL),(2070,'2070/2071',NULL,NULL),(2071,'2071/2072',NULL,NULL),(2072,'2072/2073',NULL,NULL),(2073,'2073/2074',NULL,NULL),(2074,'2074/2075',NULL,NULL),(2075,'2075/2076',NULL,NULL),(2076,'2076/2077',NULL,NULL),(2077,'2077/2078',NULL,NULL),(2078,'2078/2079',NULL,NULL),(2079,'2079/2080',NULL,NULL),(2080,'2080/2081',NULL,NULL),(2081,'2081/2082',NULL,NULL),(2082,'2082/2083',NULL,NULL),(2083,'2083/2084',NULL,NULL),(2084,'2084/2085',NULL,NULL),(2085,'2085/2086',NULL,NULL),(2086,'2086/2087',NULL,NULL),(2087,'2087/2088',NULL,NULL),(2088,'2088/2089',NULL,NULL),(2089,'2089/2090',NULL,NULL),(2090,'2090/2091',NULL,NULL),(2091,'2091/2092',NULL,NULL),(2092,'2092/2093',NULL,NULL),(2093,'2093/2094',NULL,NULL),(2094,'2094/2095',NULL,NULL),(2095,'2095/2096',NULL,NULL),(2096,'2096/2097',NULL,NULL),(2097,'2097/2098',NULL,NULL),(2098,'2098/2099',NULL,NULL),(2099,'2099/2100',NULL,NULL),(2100,'2100/2101',NULL,NULL);
/*!40000 ALTER TABLE `tahun_akademik` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenaga_kependidikan`
--

DROP TABLE IF EXISTS `tenaga_kependidikan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenaga_kependidikan` (
  `id_tendik` int NOT NULL AUTO_INCREMENT,
  `id_pegawai` int NOT NULL,
  `jenis_tendik` varchar(100) DEFAULT NULL,
  `nikp` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_tendik`),
  UNIQUE KEY `nikp` (`nikp`),
  KEY `id_pegawai` (`id_pegawai`),
  CONSTRAINT `tenaga_kependidikan_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenaga_kependidikan`
--

LOCK TABLES `tenaga_kependidikan` WRITE;
/*!40000 ALTER TABLE `tenaga_kependidikan` DISABLE KEYS */;
INSERT INTO `tenaga_kependidikan` VALUES (1,4,'PUSTAKAWAN','KEP001','2025-08-21 23:54:41','2025-08-22 09:51:26',NULL,NULL),(2,5,'Laboran/Teknisi','KEP002','2025-08-21 23:54:41','2025-08-22 09:51:26',NULL,NULL),(3,6,'Administrasi','KEP003','2025-08-21 23:54:41','2025-08-22 09:51:26',NULL,NULL),(4,7,'TUKANG TAMBAL BAN','KEP004','2025-08-21 23:54:41','2025-08-22 09:51:26',NULL,NULL);
/*!40000 ALTER TABLE `tenaga_kependidikan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_kerja`
--

DROP TABLE IF EXISTS `unit_kerja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_kerja` (
  `id_unit` int NOT NULL AUTO_INCREMENT,
  `nama_unit` varchar(100) NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_unit`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_kerja`
--

LOCK TABLES `unit_kerja` WRITE;
/*!40000 ALTER TABLE `unit_kerja` DISABLE KEYS */;
INSERT INTO `unit_kerja` VALUES (1,'Ketua STIKOM',NULL,NULL),(2,'Wakil Ketua I',NULL,NULL),(3,'Wakil Ketua II ',NULL,NULL),(4,'Prodi TI',NULL,NULL),(5,'Prodi MI',NULL,NULL),(6,'ALA',NULL,NULL),(7,'PMB',NULL,NULL),(8,'Kemahasiswaan',NULL,NULL),(9,'TPM',NULL,NULL),(10,'Kepegawaian',NULL,NULL),(11,'Sarpras',NULL,NULL),(12,'LPPM',NULL,NULL);
/*!40000 ALTER TABLE `unit_kerja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `id_pegawai` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_unit` int DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `username` (`username`),
  KEY `id_pegawai` (`id_pegawai`),
  KEY `id_unit` (`id_unit`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai` (`id_pegawai`) ON DELETE CASCADE,
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`id_unit`) REFERENCES `unit_kerja` (`id_unit`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'waket1','$2b$10$zPvCSBBYV0RNbGKRT.bW7OtKVTLwXUSMstPsZw6t0tjFuZN73sJma',2,'waket1',1,'2025-08-21 23:54:41','2025-09-29 09:31:32',NULL,NULL),(2,3,'waket2','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',3,'waket2',1,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(3,2,'prodi_ti','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',4,'prodi',1,'2025-08-21 23:54:41','2025-09-30 11:53:05',NULL,NULL),(4,8,'lppm','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',12,'lppm',1,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(5,5,'kepegawaian','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',10,'kepegawaian',1,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL),(6,7,'tpm','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',9,'tpm',1,'2025-08-21 23:54:41','2025-09-29 08:12:54',NULL,NULL),(7,6,'prodi_mi','$2a$10$9diXzH2UIw9kVoyQuxaN/u/7QvBgS/9BajNAt84IvaEN41jxV5zqG',5,'prodi',1,'2025-08-21 23:54:41','2025-08-21 23:54:41',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-20  8:50:27

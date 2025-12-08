-- ============================================================
-- TABEL BERITA & PENGUMUMAN
-- ============================================================
-- Deskripsi: Tabel untuk menyimpan berita dan pengumuman
-- Tanggal: 2025-01-XX
-- ============================================================

CREATE TABLE `berita` (
  `id_berita` int(11) NOT NULL,
  
  -- Konten Berita
  `judul` varchar(255) NOT NULL,
  `ringkasan` text NOT NULL,
  `konten` longtext NOT NULL,
  
  -- Klasifikasi
  `prioritas` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  
  -- Informasi Penulis
  `penulis` varchar(100) NOT NULL,
  `id_user` int(11) DEFAULT NULL COMMENT 'FK ke users.id_user (opsional)',
  
  -- Tanggal & Waktu
  `tanggal_publikasi` date NOT NULL,
  `waktu_baca` varchar(20) DEFAULT NULL COMMENT 'Estimasi waktu baca (contoh: "5 menit")',
  
  -- Timestamps
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  
  -- Soft Delete & Audit Trail
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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

-- --------------------------------------------------------

--
-- AUTO_INCREMENT untuk tabel `berita`
--

ALTER TABLE `berita`
  MODIFY `id_berita` int(11) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Ketidakleluasaan untuk tabel `berita`
--

ALTER TABLE `berita`
  ADD CONSTRAINT `berita_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `berita_ibfk_4` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;


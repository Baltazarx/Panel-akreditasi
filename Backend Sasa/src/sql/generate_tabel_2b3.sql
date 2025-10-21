SELECT
  cpl.id_cpl,
  cpl.kode_cpl,
  cpl.deskripsi_cpl,
  GROUP_CONCAT(DISTINCT mk.kode_mk ORDER BY mk.semester ASC SEPARATOR ', ') AS mata_kuliah_terkait
FROM cpl
LEFT JOIN map_cpl_mk mcm ON cpl.id_cpl = mcm.id_cpl
LEFT JOIN mata_kuliah mk ON mcm.id_mk = mk.id_mk
WHERE cpl.id_unit_prodi = ?
GROUP BY cpl.id_cpl
ORDER BY cpl.kode_cpl ASC;

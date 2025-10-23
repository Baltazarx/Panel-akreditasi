SELECT
  cpl.id_cpl,
  cpl.kode_cpl,
  cpl.deskripsi_cpl,
  GROUP_CONCAT(DISTINCT pl.kode_pl ORDER BY pl.kode_pl SEPARATOR ', ') AS profil_lulusan_terkait
FROM cpl
LEFT JOIN map_cpl_pl mcp ON cpl.id_cpl = mcp.id_cpl
LEFT JOIN profil_lulusan pl ON mcp.id_pl = pl.id_pl
WHERE cpl.id_unit_prodi = ?
GROUP BY cpl.id_cpl
ORDER BY cpl.kode_cpl ASC;

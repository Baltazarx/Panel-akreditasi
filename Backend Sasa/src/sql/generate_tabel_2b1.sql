SELECT 
  mk.id_mk,
  mk.kode_mk,
  mk.nama_mk,
  mk.sks,
  mk.semester,
  GROUP_CONCAT(DISTINCT pl.kode_pl ORDER BY pl.kode_pl SEPARATOR ', ') AS profil_lulusan_terkait
FROM mata_kuliah mk
LEFT JOIN map_cpl_mk mcm ON mk.id_mk = mcm.id_mk
LEFT JOIN cpl ON mcm.id_cpl = cpl.id_cpl
LEFT JOIN map_cpl_pl mcp ON cpl.id_cpl = mcp.id_cpl
LEFT JOIN profil_lulusan pl ON mcp.id_pl = pl.id_pl
WHERE mk.id_unit_prodi = ?
GROUP BY mk.id_mk
ORDER BY mk.semester ASC;

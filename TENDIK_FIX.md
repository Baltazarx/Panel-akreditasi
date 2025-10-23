# Tendik API Fix

## Issue Found

The `/api/tendik` endpoint was returning 500 Internal Server Error due to a SQL query issue.

## Problem

The `tendik.controller.js` was trying to select `p.id_unit` from the `pegawai` table, but the `pegawai` table doesn't have an `id_unit` column.

### ❌ Before (Broken)
```sql
SELECT 
  tk.*,
  p.nama_lengkap,
  p.pendidikan_terakhir,
  p.id_unit  -- ❌ This column doesn't exist
FROM tenaga_kependidikan tk
JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
```

### ✅ After (Fixed)
```sql
SELECT 
  tk.*,
  p.nama_lengkap,
  p.pendidikan_terakhir
FROM tenaga_kependidikan tk
JOIN pegawai p ON tk.id_pegawai = p.id_pegawai
```

## Database Schema

The `pegawai` table structure:
```sql
CREATE TABLE `pegawai` (
  `id_pegawai` int NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(255) NOT NULL,
  `pendidikan_terakhir` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_pegawai`)
)
```

**Note:** No `id_unit` column exists in the `pegawai` table.

## Result

- ✅ `/api/tendik` now works correctly
- ✅ useMaps hook will load tendik data without errors
- ✅ Components using useMaps will work properly

## Components Affected

These components use useMaps and will now work:
- Tabel1A1.jsx
- Tabel1A2.jsx
- Tabel1A3.jsx
- Tabel1A4.jsx
- Tabel1A5.jsx
- Tabel1B.jsx


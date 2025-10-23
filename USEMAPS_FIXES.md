# useMaps Hook API Fixes

## Issues Found

The `useMaps` hook was calling non-existent API endpoints:

### ❌ Removed Non-Existent Routes
- `/api/tahun` → Should be `/api/tahun-akademik`
- `/api/tenaga-kependidikan` → Should be `/api/tendik`
- `/api/ref-jenis-unit-spmi` → Route doesn't exist
- `/api/ref-jenis-penggunaan` → Route doesn't exist

### ✅ Fixed Routes
- `/api/tahun-akademik` ✅ (exists in backend)
- `/api/tendik` ✅ (exists in backend)
- `/api/unit-kerja` ✅ (exists in backend)
- `/api/pegawai` ✅ (exists in backend)
- `/api/ref-jabatan-struktural` ✅ (exists in backend)

## Changes Made

### Updated useMaps.js
1. **Removed non-existent API calls:**
   - `unit_spmi_jenis` - No backend route
   - `ref_jenis_penggunaan` - No backend route

2. **Fixed existing API calls:**
   - `/api/tahun` → `/api/tahun-akademik`
   - `/api/tenaga-kependidikan` → `/api/tendik`

3. **Simplified state structure:**
   ```javascript
   // Before
   { units:{}, pegawai:{}, tahun:{}, tendik:{}, unit_spmi_jenis:{}, ref_jenis_penggunaan:{}, ref_jabatan_struktural:{} }
   
   // After
   { units:{}, pegawai:{}, tahun:{}, tendik:{}, ref_jabatan_struktural:{} }
   ```

## Backend Routes Verified

✅ **Existing routes used by useMaps:**
- `/api/unit-kerja` - Unit kerja data
- `/api/pegawai` - Pegawai data  
- `/api/tahun-akademik` - Tahun akademik data
- `/api/ref-jabatan-struktural` - Jabatan struktural data
- `/api/tendik` - Tenaga kependidikan data

## Result

- ✅ No more 404 errors from useMaps
- ✅ All API calls match existing backend routes
- ✅ Simplified hook with only necessary data
- ✅ Components using useMaps will work correctly

## Components Using useMaps

These components will now work without API errors:
- Tabel1A1.jsx
- Tabel1A2.jsx  
- Tabel1A3.jsx
- Tabel1A4.jsx
- Tabel1A5.jsx
- Tabel1B.jsx


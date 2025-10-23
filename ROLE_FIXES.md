# Backend Role & Authentication Fixes

## Issues Found and Fixed

### 1. Role Name Mismatch
**Problem:** Controller checking for `waket-1`, `waket-2` but database has `waket1`, `waket2`

**Fix:** Updated `Backend/src/controllers/dosen.controller.js`
```javascript
// Before:
const superRoles = new Set(['waket-1', 'waket-2', 'tpm', 'ketuastikom']);

// After:
const superRoles = new Set(['waket1', 'waket2', 'tpm', 'ketuastikom']);
```

### 2. User Field Name Mismatch
**Problem:** Login sets `id_unit_prodi` but controller looks for `id_unit`

**Fix:** Updated `Backend/src/controllers/dosen.controller.js`
```javascript
// Before:
const { role, id_unit } = req.user || {};
params.push(id_unit);

// After:
const { role, id_unit_prodi } = req.user || {};
params.push(id_unit_prodi);
```

## Database Data Available

From `si_akreditasi_new2.sql`:
- **Users:** waket1, waket2, prodi_ti, prodi_mi, lppm, tpm, kepegawaian
- **Ref Jabatan Fungsional:** Asisten Ahli, Lektor, Lektor Kepala, Guru Besar (Profesor)
- **Dosen:** 8 records with various data

## Expected Results

After these fixes:
1. ✅ `/api/dosen` should return data (not 500 error)
2. ✅ `/api/ref-jabatan-fungsional` should return data (not 404 error)
3. ✅ Frontend should show dosen data in the table
4. ✅ Dropdown options should load correctly

## Test Accounts

Use these accounts to test:
- Username: `waket1` (super admin - sees all data)
- Username: `prodi_ti` (scoped to unit 4)
- Username: `tpm` (super admin)

## Next Steps

Restart the backend server:
```bash
cd Backend
npm run dev
```

The Dosen table should now show data instead of being empty.


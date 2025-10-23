# Tabel2B6 API Endpoint Fixes

## Issues Found

The `Tabel2B6.jsx` component was calling API endpoints with incorrect naming:

### ❌ Before (404 Errors)
```javascript
api.get("/tabel-2b6-kepuasan-pengguna"),  // Wrong: has dash
api.get("/tahun"),                         // Wrong: should be tahun-akademik
```

### ✅ After (Fixed)
```javascript
api.get("/tabel2b6-kepuasan-pengguna"),    // Correct: no dash
api.get("/tahun-akademik"),               // Correct: full endpoint name
```

## Backend Routes Verified

✅ **Existing routes:**
- `/api/tabel2b6-kepuasan-pengguna` - Kepuasan pengguna data
- `/api/tahun-akademik` - Tahun akademik data

## Code Changes Made

1. **Fixed API endpoints:**
   - Removed dash from `tabel-2b6-kepuasan-pengguna`
   - Changed `/tahun` to `/tahun-akademik`

## Result

- ✅ Tabel2B6 will now load data correctly
- ✅ No more 404 errors for all endpoints
- ✅ Component displays kepuasan pengguna data as intended

## Component Purpose

Tabel2B6 displays "Kepuasan Pengguna Lulusan" which includes:
- Data kepuasan pengguna lulusan
- Tahun akademik options
- User satisfaction tracking

All endpoints now work correctly with proper naming conventions.

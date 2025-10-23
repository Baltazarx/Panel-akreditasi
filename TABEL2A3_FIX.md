# Tabel2A3 API Endpoint Fixes

## Issues Found

The `Tabel2A3.jsx` component was calling API endpoints with incorrect naming:

### ❌ Before (404 Errors)
```javascript
api.get(`/tabel-2a3-kondisi-mahasiswa?timestamp=${new Date().getTime()}`),  // Wrong: has dash
api.get("/tahun"),                                                           // Wrong: should be tahun-akademik
```

### ✅ After (Fixed)
```javascript
api.get(`/tabel2a3-kondisi-mahasiswa?timestamp=${new Date().getTime()}`),   // Correct: no dash
api.get("/tahun-akademik"),                                                 // Correct: full endpoint name
```

## Backend Routes Verified

✅ **Existing routes:**
- `/api/tabel2a3-kondisi-mahasiswa` - Kondisi mahasiswa data
- `/api/tahun-akademik` - Tahun akademik data

## Code Changes Made

1. **Fixed API endpoints:**
   - Removed dash from `tabel-2a3-kondisi-mahasiswa`
   - Changed `/tahun` to `/tahun-akademik`

## Result

- ✅ Tabel2A3 will now load data correctly
- ✅ No more 404 errors for all endpoints
- ✅ Component displays kondisi mahasiswa data as intended

## Component Purpose

Tabel2A3 displays "Kondisi Mahasiswa" which includes:
- Data mahasiswa baru, aktif, lulus, dan drop out
- Tahun akademik options
- Mahasiswa condition tracking

All endpoints now work correctly with proper naming conventions.


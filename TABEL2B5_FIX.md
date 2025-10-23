# Tabel2B5 API Endpoint Fixes

## Issues Found

The `Tabel2B5.jsx` component was calling API endpoints with incorrect naming:

### ❌ Before (404 Errors)
```javascript
api.get("/tabel-2b5-kesesuaian-kerja"),  // Wrong: has dash
api.get("/tahun"),                       // Wrong: should be tahun-akademik
```

### ✅ After (Fixed)
```javascript
api.get("/tabel2b5-kesesuaian-kerja"),   // Correct: no dash
api.get("/tahun-akademik"),              // Correct: full endpoint name
```

## Backend Routes Verified

✅ **Existing routes:**
- `/api/tabel2b5-kesesuaian-kerja` - Kesesuaian kerja data
- `/api/tahun-akademik` - Tahun akademik data

## Code Changes Made

1. **Fixed API endpoints:**
   - Removed dash from `tabel-2b5-kesesuaian-kerja`
   - Changed `/tahun` to `/tahun-akademik`

## Result

- ✅ Tabel2B5 will now load data correctly
- ✅ No more 404 errors for all endpoints
- ✅ Component displays kesesuaian kerja data as intended

## Component Purpose

Tabel2B5 displays "Kesesuaian Kerja Lulusan" which includes:
- Data kesesuaian kerja lulusan
- Tahun akademik options
- Job suitability tracking

All endpoints now work correctly with proper naming conventions.

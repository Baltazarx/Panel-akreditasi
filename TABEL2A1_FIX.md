# Tabel2A1 API Endpoint Fixes

## Issues Found

The `Tabel2A1.jsx` component was calling API endpoints with incorrect naming:

### ❌ Before (404 Errors)
```javascript
api.get("/tabel-2a1-pendaftaran"),           // Wrong: has dash
api.get("/tabel-2a1-mahasiswa-baru-aktif"),  // Wrong: has dash  
api.get("/tahun"),                          // Wrong: should be tahun-akademik
```

### ✅ After (Fixed)
```javascript
api.get("/tabel2a1-pendaftaran"),            // Correct: no dash
api.get("/tabel2a1-mahasiswa-baru-aktif"),  // Correct: no dash
api.get("/tahun-akademik"),                  // Correct: full endpoint name
```

## Backend Routes Verified

✅ **Existing routes:**
- `/api/tabel2a1-pendaftaran` - Pendaftaran data
- `/api/tabel2a1-mahasiswa-baru-aktif` - Mahasiswa baru/aktif data  
- `/api/tahun-akademik` - Tahun akademik data

## Server.js Routes
```javascript
app.use('/api/tabel2a1-pendaftaran', tabel2a1PendaftaranRouter);
app.use('/api/tabel2a1-mahasiswa-baru-aktif', tabel2a1MahasiswaBaruAktifRouter);
app.use('/api/tahun-akademik', tahunRouter);
```

## Result

- ✅ Tabel2A1 will now load data correctly
- ✅ No more 404 errors for all three endpoints
- ✅ Component displays mahasiswa data as intended
- ✅ All API calls match existing backend routes

## Component Purpose

Tabel2A1 displays "Data Mahasiswa" which includes:
- Pendaftaran data
- Mahasiswa baru/aktif data
- Tahun akademik options

All endpoints now work correctly.


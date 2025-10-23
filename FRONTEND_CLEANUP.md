# Frontend Cleanup - Aligned with Backend

## Removed Unused Components

### Tables
- ❌ `ManajemenKurikulum.jsx` - No matching backend route

### Forms  
- ❌ `CplForm.jsx` - Not used by any table
- ❌ `CplPlForm.jsx` - Not used by any table  
- ❌ `MataKuliahForm.jsx` - Not used by any table
- ❌ `ProfilLulusanForm.jsx` - Not used by any table
- ❌ `Tabel2B3Form.jsx` - Not used by any table

### Hooks
- ❌ `useTsYear.js` - Not imported anywhere

## Kept Components (Used by Tables)

### Tables (16 components)
✅ `PegawaiTable.jsx` - Uses `PegawaiForm`
✅ `DosenTable.jsx` - Uses `DosenForm`  
✅ `Tabel1A1.jsx` - Uses `useMaps`
✅ `Tabel1A2.jsx` - Uses `useMaps`
✅ `Tabel1A3.jsx` - Uses `useMaps`
✅ `Tabel1A4.jsx` - Uses `useMaps`
✅ `Tabel1A5.jsx` - Uses `useMaps`
✅ `Tabel1B.jsx` - Uses `useMaps`
✅ `Tabel2A1.jsx` - Uses `PendaftaranForm`, `MabaAktifForm`
✅ `Tabel2A2.jsx` - Uses `Tabel2A2Form`
✅ `Tabel2A3.jsx` - No dependencies
✅ `Tabel2B4.jsx` - No dependencies
✅ `Tabel2B5.jsx` - No dependencies
✅ `Tabel2B6.jsx` - No dependencies
✅ `Tabel2C.jsx` - No dependencies
✅ `Tabel2D.jsx` - No dependencies

### Forms (5 components)
✅ `DosenForm.jsx` - Used by DosenTable
✅ `PegawaiForm.jsx` - Used by PegawaiTable
✅ `PendaftaranForm.jsx` - Used by Tabel2A1
✅ `MabaAktifForm.jsx` - Used by Tabel2A1
✅ `Tabel2A2Form.jsx` - Used by Tabel2A2

### Hooks (3 components)
✅ `useApi.js` - Used by all tables
✅ `useAuth.js` - Used by App.jsx
✅ `useMaps.js` - Used by Tabel1A1-1A5, Tabel1B

## Updated App.jsx

### Removed
- ❌ `ManajemenKurikulum` import and tab

### Reorganized Tabs
- **Master Data**: Pegawai, Dosen
- **C1 - Standar 1**: Tabel1A1-1A5, Tabel1B  
- **C2 - Standar 2**: Tabel2A1-2A3, Tabel2B4-2B6, Tabel2C-2D

## Backend Routes Covered

All frontend components now match existing backend routes:

### Master Data
- `/api/pegawai` ✅
- `/api/dosen` ✅
- `/api/ref-jabatan-fungsional` ✅
- `/api/ref-jabatan-struktural` ✅

### C1 Routes  
- `/api/pimpinan-upps-ps` ✅
- `/api/sumber-pendanaan` ✅
- `/api/penggunaan-dana` ✅
- `/api/beban-kerja-dosen` ✅
- `/api/kualifikasi-tendik` ✅
- `/api/audit-mutu-internal` ✅

### C2 Routes
- `/api/tabel2a1-pendaftaran` ✅
- `/api/tabel2a1-mahasiswa-baru-aktif` ✅
- `/api/tabel2a2-keragaman-asal` ✅
- `/api/tabel2a3-kondisi-mahasiswa` ✅
- `/api/tabel2b4-masa-tunggu` ✅
- `/api/tabel2b5-kesesuaian-kerja` ✅
- `/api/tabel2b6-kepuasan-pengguna` ✅
- `/api/tabel2c-bentuk-pembelajaran` ✅
- `/api/tabel2c-fleksibilitas-pembelajaran` ✅
- `/api/tabel2d-rekognisi-lulusan` ✅
- `/api/tabel2d-sumber-rekognisi` ✅

## Result

Frontend is now clean and aligned with backend:
- ✅ No unused components
- ✅ All components have matching backend routes
- ✅ Organized by functionality
- ✅ Reduced bundle size


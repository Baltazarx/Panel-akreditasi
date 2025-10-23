# Perbaikan Tabel 2.A.1 - Data Mahasiswa

## Masalah yang Ditemukan

### 1. **Endpoint API Salah**
- **Sebelum**: `/tabel-2a1-pendaftaran` dan `/tabel-2a1-mahasiswa-baru-aktif`
- **Sesudah**: `/tabel2a1-pendaftaran` dan `/tabel2a1-mahasiswa-baru-aktif`
- **Penyebab**: Route di server didaftarkan tanpa tanda hubung

### 2. **Field Mapping Salah**
- **Sebelum**: `row.jumlah_diterima`
- **Sesudah**: `row.jumlah_total`
- **Penyebab**: Database menggunakan field `jumlah_total` bukan `jumlah_diterima`

### 3. **Data Database Lengkap**
Berdasarkan database `si_akreditasi_new2.sql`, data yang tersedia:

#### **Tabel `tabel_2a1_mahasiswa_baru_aktif`**:
- **Prodi TI (id_unit=4)**: Data untuk tahun 2020-2024
- **Prodi MI (id_unit=5)**: Data untuk tahun 2020-2024
- **Field**: `id_unit_prodi`, `id_tahun`, `jenis` (baru/aktif), `jalur` (reguler/rpl), `jumlah_total`, `jumlah_afirmasi`, `jumlah_kebutuhan_khusus`

#### **Tabel `tabel_2a1_pendaftaran`**:
- **Data tersedia**: 1 record untuk unit 1, tahun 2024
- **Field**: `id_unit_prodi`, `id_tahun`, `daya_tampung`, `pendaftar`, `pendaftar_afirmasi`, `pendaftar_kebutuhan_khusus`

## Perbaikan yang Dilakukan

### 1. **Endpoint API**
```javascript
// Sebelum
await api.post("/tabel-2a1-pendaftaran", dataToSend);
await api.post("/tabel-2a1-mahasiswa-baru-aktif", dataToSend);

// Sesudah
await api.post("/tabel2a1-pendaftaran", dataToSend);
await api.post("/tabel2a1-mahasiswa-baru-aktif", dataToSend);
```

### 2. **Field Mapping**
```javascript
// Sebelum
currentAgg.maba_reguler_diterima += (row.jumlah_diterima || 0);

// Sesudah
currentAgg.maba_reguler_diterima += (row.jumlah_total || 0);
```

### 3. **Detail Modal**
```javascript
// Sebelum
<TableCell>{record.jumlah_diterima}</TableCell>

// Sesudah
<TableCell>{record.jumlah_total}</TableCell>
```

## Data yang Seharusnya Muncul

### **Prodi TI (id_unit=4)**:
- **2020**: Baru=120, Aktif=400
- **2021**: Baru=130, Aktif=410
- **2022**: Baru=145, Aktif=420
- **2023**: Baru=140, Aktif=425
- **2024**: Baru=105, Aktif=120

### **Prodi MI (id_unit=5)**:
- **2020**: Baru=90, Aktif=250
- **2021**: Baru=100, Aktif=260
- **2022**: Baru=110, Aktif=270
- **2023**: Baru=115, Aktif=280
- **2024**: Baru=95, Aktif=210

## Status Perbaikan

✅ **Endpoint API** - Diperbaiki
✅ **Field Mapping** - Diperbaiki
✅ **Detail Modal** - Diperbaiki
✅ **Linter Errors** - Tidak ada

## Catatan

- Data di database sudah lengkap untuk kedua prodi (TI dan MI)
- Data mencakup 5 tahun (2020-2024)
- Setiap tahun memiliki data untuk mahasiswa baru dan aktif
- Data afirmasi dan kebutuhan khusus juga tersedia
- Perbaikan ini akan membuat data muncul dengan lengkap di frontend

# Format Angka Desimal - Perbaikan

## Ringkasan
Telah ditambahkan format angka desimal yang konsisten di seluruh aplikasi dengan menggunakan koma (,) sebagai pemisah desimal dan menampilkan maksimal 1 digit di belakang koma.

## Perubahan yang Dilakukan

### 1. File Utility Baru
- **`Frontend/src/lib/format.js`** - File utility berisi fungsi format angka:
  - `formatDecimal(value)` - Format dengan 1 digit desimal
  - `formatDecimal2(value)` - Format dengan 2 digit desimal  
  - `formatPercentage(value)` - Format persentase dengan 1 digit desimal

### 2. Tabel yang Diperbaiki
- **Tabel1A4.jsx** - Rata-rata Beban DTPR (EWMP)
- **Tabel2B4.jsx** - Masa Tunggu Lulusan
- **Tabel2B5.jsx** - Kesesuaian Kerja
- **Tabel2B6.jsx** - Kepuasan Pengguna

### 3. Format yang Diterapkan
- Angka bulat: `5` (tanpa desimal)
- Angka desimal: `1,7` (koma sebagai pemisah)
- Persentase: `85,5%` (format khusus untuk persentase)

## Contoh Sebelum dan Sesudah

### Sebelum:
```
1.6666666666666667
2.5
13.5
```

### Sesudah:
```
1,7
2,5
13,5
```

## Implementasi
Fungsi `formatDecimal` secara otomatis:
1. Mengecek apakah angka adalah bilangan bulat
2. Jika bulat, tampilkan tanpa desimal
3. Jika desimal, format dengan 1 digit dan ganti titik dengan koma

## Penggunaan
```javascript
import { formatDecimal } from "../../lib/format";

// Di dalam komponen
const formattedValue = formatDecimal(1.6666666666666667); // "1,7"
```

## Status
✅ **Selesai** - Format angka desimal telah diterapkan di tabel-tabel utama yang menampilkan data numerik.

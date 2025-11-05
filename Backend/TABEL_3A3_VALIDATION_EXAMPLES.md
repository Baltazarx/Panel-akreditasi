# Tabel 3.A.3 - Contoh Validasi Data

## Validasi Summary (Jumlah DTPR)

### ✅ Valid Request - Create Summary

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://drive.google.com/file/d/abc123-bukti.pdf"
}
```

**Response (201 Created):**
```json
{
  "message": "Data summary DTPR berhasil dibuat",
  "id": 1
}
```

### ✅ Valid Request - UPSERT (Update jika sudah ada)

**Request (Create):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://drive.google.com/file/d/abc123-bukti.pdf"
}
```

**Response (201 Created):**
```json
{
  "message": "Data summary DTPR berhasil dibuat",
  "id": 1
}
```

**Request (Update - menggunakan unit dan tahun yang sama):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 18,
  "link_bukti": "https://drive.google.com/file/d/def456-bukti-updated.pdf"
}
```

**Response (200 OK):**
```json
{
  "message": "Data summary DTPR berhasil diperbarui",
  "id": 1
}
```

### ❌ Invalid Request - Missing Required Field

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "jumlah_dtpr": 15
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit dan Tahun wajib diisi."
}
```

### ❌ Invalid Request - Missing All Required Fields

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "jumlah_dtpr": 15
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit dan Tahun wajib diisi."
}
```

### ✅ Valid Request - Optional Fields Default

**Request (tanpa jumlah_dtpr dan link_bukti):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024
}
```

**Response (201 Created):**
```json
{
  "message": "Data summary DTPR berhasil dibuat",
  "id": 1
}
```

**Note**: `jumlah_dtpr` akan default ke `0`, `link_bukti` akan default ke `null`.

## Validasi Detail (Pengembangan DTPR)

### ✅ Valid Request - Create Detail

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Response (201 Created):**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 1
}
```

### ✅ Valid Request - Multiple Entries (Same Dosen, Different Types)

**Request 1:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Request 2 (Same Dosen, Different Jenis):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Pelatihan",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/def456-pelatihan.pdf"
}
```

**Response (Both 201 Created):**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 2
}
```

**Note**: Sistem mengizinkan dosen yang sama memiliki beberapa jenis pengembangan dalam tahun yang sama. Ini valid karena dosen bisa mengikuti berbagai jenis pengembangan.

### ✅ Valid Request - Same Dosen, Same Type, Different Year

**Request 1:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2023,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar-2023.pdf"
}
```

**Request 2 (Same Dosen, Same Type, Different Year):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/def456-tugas-belajar-2024.pdf"
}
```

**Response (Both 201 Created):**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 2
}
```

**Note**: Sistem mengizinkan dosen yang sama memiliki jenis pengembangan yang sama di tahun yang berbeda. Ini valid sesuai dengan keterangan LKPS.

### ❌ Invalid Request - Missing Required Field (id_unit)

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi."
}
```

### ❌ Invalid Request - Missing Required Field (id_dosen)

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi."
}
```

### ❌ Invalid Request - Missing Required Field (jenis_pengembangan)

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi."
}
```

### ❌ Invalid Request - Missing Required Field (id_tahun)

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar.pdf"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi."
}
```

### ✅ Valid Request - Optional Field (link_bukti)

**Request (tanpa link_bukti):**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024
}
```

**Response (201 Created):**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 1
}
```

**Note**: `link_bukti` akan default ke `null`.

## Validasi PIVOT Query Parameters

### ✅ Valid Request - List Summary dengan PIVOT

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response (200 OK):**
```json
{
  "id_unit": 12,
  "nama_unit_prodi": "LPPM",
  "jumlah_ts_2": 10,
  "jumlah_ts_1": 12,
  "jumlah_ts": 15,
  "link_bukti_ts_2": "https://drive.google.com/file/d/abc123-bukti-2022.pdf",
  "link_bukti_ts_1": "https://drive.google.com/file/d/def456-bukti-2023.pdf",
  "link_bukti_ts": "https://drive.google.com/file/d/ghi789-bukti-2024.pdf"
}
```

### ❌ Invalid Request - Missing PIVOT Parameter (id_tahun_ts)

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response (400 Bad Request):**
```json
{
  "error": "Query parameter id_tahun_ts wajib ada.",
  "details": "Query parameter id_tahun_ts wajib ada."
}
```

### ❌ Invalid Request - Missing PIVOT Parameter (id_tahun_ts_1)

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_2=2022&id_unit=12
```

**Response (400 Bad Request):**
```json
{
  "error": "Query parameter id_tahun_ts_1 wajib ada.",
  "details": "Query parameter id_tahun_ts_1 wajib ada."
}
```

### ❌ Invalid Request - Missing PIVOT Parameter (id_tahun_ts_2)

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_unit=12
```

**Response (400 Bad Request):**
```json
{
  "error": "Query parameter id_tahun_ts_2 wajib ada.",
  "details": "Query parameter id_tahun_ts_2 wajib ada."
}
```

### ✅ Valid Request - PIVOT dengan Filter Optional

**Request (dengan filter id_unit):**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Request (tanpa filter id_unit):**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022
```

**Note**: Filter `id_unit` adalah optional. Jika tidak ada, akan menampilkan data untuk semua unit (sesuai permission user).

## Validasi Foreign Key

### ❌ Invalid Request - Invalid id_unit

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 999,
  "id_tahun": 2024,
  "jumlah_dtpr": 15
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Gagal menyimpan data summary DTPR",
  "details": "Cannot add or update a child row: a foreign key constraint fails..."
}
```

### ❌ Invalid Request - Invalid id_dosen

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 999,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Gagal membuat data pengembangan",
  "details": "Cannot add or update a child row: a foreign key constraint fails..."
}
```

### ❌ Invalid Request - Invalid id_tahun

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 9999,
  "jumlah_dtpr": 15
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Gagal menyimpan data summary DTPR",
  "details": "Cannot add or update a child row: a foreign key constraint fails..."
}
```

## Validasi Update

### ✅ Valid Request - Update Summary

**Request:**
```http
PUT /api/tabel-3a3-pengembangan-dtpr/summary/1
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 18,
  "link_bukti": "https://drive.google.com/file/d/updated-bukti.pdf"
}
```

**Response (200 OK):**
```json
{
  "message": "Data summary DTPR berhasil diperbarui",
  "id": 1
}
```

### ❌ Invalid Request - Update dengan ID Tidak Ada

**Request:**
```http
PUT /api/tabel-3a3-pengembangan-dtpr/summary/999
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 18
}
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan."
}
```

### ✅ Valid Request - Update Detail

**Request:**
```http
PUT /api/tabel-3a3-pengembangan-dtpr/detail/1
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/updated-bukti.pdf"
}
```

**Response (200 OK):**
```json
{
  "message": "Data pengembangan DTPR berhasil diperbarui"
}
```

## Validasi Soft Delete

### ✅ Valid Request - Soft Delete Summary

**Request:**
```http
DELETE /api/tabel-3a3-pengembangan-dtpr/summary/1
```

**Response (200 OK):**
```json
{
  "message": "Data summary berhasil dihapus (soft delete)"
}
```

**Note**: Data tidak benar-benar dihapus, hanya `deleted_at` yang di-set ke timestamp saat ini.

### ❌ Invalid Request - Soft Delete dengan ID Tidak Ada

**Request:**
```http
DELETE /api/tabel-3a3-pengembangan-dtpr/summary/999
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan."
}
```

## Validasi Export

### ✅ Valid Request - Export Excel

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/export?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response:**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename=Tabel_3A3_Pengembangan_DTPR.xlsx`
- **Body**: Excel file binary

### ❌ Invalid Request - Export tanpa Parameter Tahun

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/export?id_unit=12
```

**Response (400 Bad Request):**
```json
{
  "error": "Gagal mengekspor data",
  "details": "Query parameter id_tahun_ts wajib ada."
}
```

## Notes

- **Required Fields Summary**: `id_unit`, `id_tahun`
- **Required Fields Detail**: `id_unit`, `id_dosen`, `jenis_pengembangan`, `id_tahun`
- **Optional Fields**: `jumlah_dtpr` (default: 0), `link_bukti` (default: null)
- **UPSERT Logic**: Summary menggunakan UPSERT - jika sudah ada data untuk `id_unit` dan `id_tahun`, akan melakukan update otomatis
- **Multiple Entries**: Detail mengizinkan multiple entries untuk dosen yang sama dengan jenis pengembangan yang berbeda atau tahun yang berbeda
- **Foreign Key Validation**: Semua foreign key (`id_unit`, `id_dosen`, `id_tahun`) akan divalidasi oleh database
- **PIVOT Parameters**: Semua endpoint PIVOT memerlukan 3 parameter tahun: `id_tahun_ts`, `id_tahun_ts_1`, `id_tahun_ts_2`


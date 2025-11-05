# Tabel 3.A.3 - Pengembangan DTPR di Bidang Penelitian API

## Endpoints

### Base URL: `/api/tabel-3a3-pengembangan-dtpr`

## Deskripsi

Tabel 3.A.3 mencatat pengembangan DTPR (Dosen Tetap Program Studi) di bidang penelitian untuk periode 3 tahun akademik (TS-2, TS-1, TS). Tabel ini terdiri dari dua bagian:

1. **Summary (Jumlah Dosen DTPR)**: Menampilkan jumlah total DTPR per tahun (TS-2, TS-1, TS)
2. **Detail (Pengembangan DTPR)**: Menampilkan detail pengembangan per dosen dan jenis pengembangan per tahun

## Endpoint Summary (Jumlah DTPR)

### 1. List Summary DTPR
- **GET** `/api/tabel-3a3-pengembangan-dtpr/summary`
- **Description**: Mendapatkan data summary jumlah DTPR. Mendukung dua mode:
  - **PIVOT Mode**: Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2) -> data di-pivot untuk 3 tahun
  - **RAW Mode**: Jika tidak ada parameter tahun -> semua data mentah tanpa pivot
- **Query Parameters** (Optional - untuk PIVOT mode):
  - `id_tahun_ts` (optional): ID tahun akademik untuk TS (Tahun Sekarang) - jika ada, akan aktifkan PIVOT mode
  - `id_tahun_ts_1` (optional): ID tahun akademik untuk TS-1 (1 tahun sebelum TS) - jika ada, akan aktifkan PIVOT mode
  - `id_tahun_ts_2` (optional): ID tahun akademik untuk TS-2 (2 tahun sebelum TS) - jika ada, akan aktifkan PIVOT mode
- **Query Parameters** (Optional - untuk filtering):
  - `id_unit` (optional): Filter berdasarkan unit
  - `order_by` (optional): Sorting (default: `id DESC`)
  - `include_deleted` (optional): Include soft deleted data (default: false)
- **Response (PIVOT Mode)**: Object tunggal dengan data summary yang sudah di-pivot
  ```json
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "jumlah_ts_2": 10,
    "jumlah_ts_1": 12,
    "jumlah_ts": 15,
    "link_bukti_ts_2": "https://example.com/bukti-ts2.pdf",
    "link_bukti_ts_1": "https://example.com/bukti-ts1.pdf",
    "link_bukti_ts": "https://example.com/bukti-ts.pdf"
  }
  ```
- **Response (RAW Mode)**: Array of objects dengan semua data mentah
  ```json
  [
    {
      "id": 1,
      "id_unit": 12,
      "nama_unit_prodi": "LPPM",
      "id_tahun": 2024,
      "jumlah_dtpr": 15,
      "link_bukti": "https://example.com/bukti-2024.pdf",
      "created_at": "2025-11-05T10:00:00.000Z",
      "updated_at": "2025-11-05T10:00:00.000Z",
      "deleted_at": null
    },
    {
      "id": 2,
      "id_unit": 12,
      "nama_unit_prodi": "LPPM",
      "id_tahun": 2023,
      "jumlah_dtpr": 12,
      "link_bukti": "https://example.com/bukti-2023.pdf",
      "created_at": "2025-11-05T10:00:00.000Z",
      "updated_at": "2025-11-05T10:00:00.000Z",
      "deleted_at": null
    }
  ]
  ```
- **Note**: 
  - **PIVOT Mode**: Jika tidak ada data, akan mengembalikan struktur kosong dengan nilai default 0 untuk jumlah dan null untuk link bukti
  - **RAW Mode**: Jika tidak ada data, akan mengembalikan array kosong `[]`
  - **Mode Detection**: Endpoint akan otomatis mendeteksi mode berdasarkan keberadaan parameter tahun. Jika ketiga parameter (`id_tahun_ts`, `id_tahun_ts_1`, `id_tahun_ts_2`) ada, akan menggunakan PIVOT mode. Jika tidak ada, akan menggunakan RAW mode.

### 2. Get Summary by ID
- **GET** `/api/tabel-3a3-pengembangan-dtpr/summary/:id`
- **Description**: Mendapatkan detail data summary berdasarkan ID
- **Response**: Object dengan detail data summary
  ```json
  {
    "id": 1,
    "id_unit": 12,
    "id_tahun": 2024,
    "jumlah_dtpr": 15,
    "link_bukti": "https://example.com/bukti.pdf",
    "nama_unit_prodi": "LPPM",
    "created_at": "2025-11-05T10:00:00.000Z",
    "updated_at": "2025-11-05T10:00:00.000Z",
    "deleted_at": null
  }
  ```

### 3. Save Summary (Create/Update)
- **POST** `/api/tabel-3a3-pengembangan-dtpr/summary`
- **PUT** `/api/tabel-3a3-pengembangan-dtpr/summary/:id`
- **Description**: Membuat atau mengupdate data summary DTPR. Jika sudah ada data untuk `id_unit` dan `id_tahun`, akan melakukan update otomatis.
- **Body**:
  ```json
  {
    "id_unit": 12,
    "id_tahun": 2024,
    "jumlah_dtpr": 15,
    "link_bukti": "https://example.com/bukti.pdf"
  }
  ```
- **Required Fields**:
  - `id_unit`: ID unit kerja (required)
  - `id_tahun`: ID tahun akademik (required)
- **Optional Fields**:
  - `jumlah_dtpr`: Jumlah DTPR (default: 0)
  - `link_bukti`: Link bukti dokumen (default: null)
- **Response**: Object dengan pesan sukses dan ID
  ```json
  {
    "message": "Data summary DTPR berhasil dibuat",
    "id": 1
  }
  ```
- **Note**: Endpoint ini menggunakan **UPSERT** logic - jika sudah ada data untuk unit dan tahun yang sama, akan melakukan update otomatis

### 4. Soft Delete Summary
- **DELETE** `/api/tabel-3a3-pengembangan-dtpr/summary/:id`
- **Description**: Soft delete data summary (menandai sebagai deleted)
- **Response**:
  ```json
  {
    "message": "Data summary berhasil dihapus (soft delete)"
  }
  ```

## Endpoint Detail (Pengembangan DTPR)

### 5. List Detail Pengembangan
- **GET** `/api/tabel-3a3-pengembangan-dtpr/detail`
- **Description**: Mendapatkan data detail pengembangan DTPR. Mendukung dua mode:
  - **PIVOT Mode**: Jika ada parameter tahun (id_tahun_ts, id_tahun_ts_1, id_tahun_ts_2) -> data di-pivot untuk 3 tahun
  - **RAW Mode**: Jika tidak ada parameter tahun -> semua data mentah tanpa pivot
- **Query Parameters** (Optional - untuk PIVOT mode):
  - `id_tahun_ts` (optional): ID tahun akademik untuk TS - jika ada, akan aktifkan PIVOT mode
  - `id_tahun_ts_1` (optional): ID tahun akademik untuk TS-1 - jika ada, akan aktifkan PIVOT mode
  - `id_tahun_ts_2` (optional): ID tahun akademik untuk TS-2 - jika ada, akan aktifkan PIVOT mode
- **Query Parameters** (Optional - untuk filtering):
  - `id_unit` (optional): Filter berdasarkan unit
  - `id_dosen` (optional): Filter berdasarkan dosen
  - `jenis_pengembangan` (optional): Filter berdasarkan jenis pengembangan
  - `order_by` (optional): Sorting (default: `id_pengembangan DESC`)
  - `include_deleted` (optional): Include soft deleted data (default: false)
- **Response (PIVOT Mode)**: Array of objects dengan data detail yang sudah di-pivot
  ```json
  [
    {
      "id_unit": 12,
      "nama_unit_prodi": "LPPM",
      "id_dosen": 1,
      "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
      "jenis_pengembangan": "Tugas Belajar",
      "jumlah_ts_2": 1,
      "jumlah_ts_1": 0,
      "jumlah_ts": 1,
      "link_bukti_ts_2": "https://example.com/bukti-ts2.pdf",
      "link_bukti_ts_1": null,
      "link_bukti_ts": "https://example.com/bukti-ts.pdf",
      "link_bukti": "https://example.com/bukti-ts.pdf"
    }
  ]
  ```
- **Response (RAW Mode)**: Array of objects dengan semua data mentah
  ```json
  [
    {
      "id_pengembangan": 1,
      "id_unit": 12,
      "nama_unit_prodi": "LPPM",
      "id_dosen": 1,
      "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
      "jenis_pengembangan": "Tugas Belajar",
      "id_tahun": 2024,
      "link_bukti": "https://example.com/bukti-2024.pdf",
      "created_at": "2025-11-05T10:00:00.000Z",
      "updated_at": "2025-11-05T10:00:00.000Z",
      "deleted_at": null
    }
  ]
  ```
- **Note**: 
  - **PIVOT Mode**: Data di-group berdasarkan kombinasi `id_unit`, `id_dosen`, dan `jenis_pengembangan`. Jumlah (`jumlah_ts_2`, `jumlah_ts_1`, `jumlah_ts`) adalah COUNT dari pengembangan per tahun.
  - **RAW Mode**: Menampilkan semua data tanpa grouping atau pivot
  - **Mode Detection**: Endpoint akan otomatis mendeteksi mode berdasarkan keberadaan parameter tahun. Jika ketiga parameter (`id_tahun_ts`, `id_tahun_ts_1`, `id_tahun_ts_2`) ada, akan menggunakan PIVOT mode. Jika tidak ada, akan menggunakan RAW mode.

### 6. Get Detail by ID
- **GET** `/api/tabel-3a3-pengembangan-dtpr/detail/:id`
- **Description**: Mendapatkan detail data pengembangan berdasarkan ID
- **Response**: Object dengan detail data pengembangan
  ```json
  {
    "id_pengembangan": 1,
    "id_unit": 12,
    "id_dosen": 1,
    "jenis_pengembangan": "Tugas Belajar",
    "id_tahun": 2024,
    "link_bukti": "https://example.com/bukti.pdf",
    "nama_unit_prodi": "LPPM",
    "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
    "created_at": "2025-11-05T10:00:00.000Z",
    "updated_at": "2025-11-05T10:00:00.000Z",
    "deleted_at": null
  }
  ```

### 7. Create Detail Pengembangan
- **POST** `/api/tabel-3a3-pengembangan-dtpr/detail`
- **Description**: Membuat data detail pengembangan DTPR baru
- **Body**:
  ```json
  {
    "id_unit": 12,
    "id_dosen": 1,
    "jenis_pengembangan": "Tugas Belajar",
    "id_tahun": 2024,
    "link_bukti": "https://example.com/bukti.pdf"
  }
  ```
- **Required Fields**:
  - `id_unit`: ID unit kerja (required)
  - `id_dosen`: ID dosen (required)
  - `jenis_pengembangan`: Jenis pengembangan (required)
  - `id_tahun`: ID tahun akademik (required)
- **Optional Fields**:
  - `link_bukti`: Link bukti dokumen (default: null)
- **Response**: Object dengan pesan sukses dan ID
  ```json
  {
    "message": "Data pengembangan DTPR berhasil dibuat",
    "id": 1
  }
  ```

### 8. Update Detail Pengembangan
- **PUT** `/api/tabel-3a3-pengembangan-dtpr/detail/:id`
- **Description**: Mengupdate data detail pengembangan
- **Body**: Same as create (semua field required)
- **Response**:
  ```json
  {
    "message": "Data pengembangan DTPR berhasil diperbarui"
  }
  ```

### 9. Soft Delete Detail
- **DELETE** `/api/tabel-3a3-pengembangan-dtpr/detail/:id`
- **Description**: Soft delete data detail pengembangan
- **Response**:
  ```json
  {
    "message": "Data pengembangan berhasil dihapus (soft delete)"
  }
  ```

## Export Function

### 10. Export Excel
- **GET** `/api/tabel-3a3-pengembangan-dtpr/export`
- **Description**: Export data ke format Excel (.xlsx) dengan format sesuai struktur tabel LKPS
- **Query Parameters** (WAJIB):
  - `id_tahun_ts` (required): ID tahun akademik untuk TS
  - `id_tahun_ts_1` (required): ID tahun akademik untuk TS-1
  - `id_tahun_ts_2` (required): ID tahun akademik untuk TS-2
- **Query Parameters** (Optional):
  - `id_unit` (optional): Filter berdasarkan unit
  - `include_deleted` (optional): Include soft deleted data
- **Response**: Excel file (.xlsx)
- **File Format**:
  - Header: "Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian"
  - Summary Row: Jumlah Dosen DTPR untuk TS-2, TS-1, TS
  - Detail Rows: Jenis Pengembangan, Nama DTPR, Jumlah per tahun (TS-2, TS-1, TS), Link Bukti

## Authentication & Authorization

- Semua endpoint memerlukan authentication (`requireAuth`)
- Permission berdasarkan role:
  - **Superadmin** (waket1, waket2, tpm): Full access (CRUDH)
  - **LPPM**: CRUD access untuk tabel 3.A.3 (tidak bisa hard delete)
  - **Role lain**: Sesuai konfigurasi di `roles.js`

## Database Schema

### Tabel: `tabel_3a3_dtpr_tahunan` (Summary)

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key (AUTO_INCREMENT) |
| id_unit | int | ID unit kerja (FK ke unit_kerja.id_unit) |
| id_tahun | int | Tahun akademik (FK ke tahun_akademik.id_tahun) |
| jumlah_dtpr | int | Jumlah DTPR untuk tahun tersebut |
| link_bukti | text | Link bukti dokumen |
| created_at | timestamp | Timestamp pembuatan |
| updated_at | timestamp | Timestamp update |
| deleted_at | datetime | Timestamp soft delete |
| deleted_by | int | User yang melakukan soft delete |

**Indexes:**
- PRIMARY KEY (`id`)
- KEY `fk_3a3_dtpr_tahunan_unit_idx` (`id_unit`)
- KEY `fk_3a3_dtpr_tahunan_tahun_idx` (`id_tahun`)

**Foreign Keys:**
- `fk_3a3_dtpr_tahunan_unit`: `id_unit` → `unit_kerja.id_unit` ON UPDATE CASCADE
- `fk_3a3_dtpr_tahunan_tahun`: `id_tahun` → `tahun_akademik.id_tahun` ON UPDATE CASCADE

### Tabel: `tabel_3a3_pengembangan` (Detail)

| Field | Type | Description |
|-------|------|-------------|
| id_pengembangan | int | Primary key (AUTO_INCREMENT) |
| id_unit | int | ID unit kerja (FK ke unit_kerja.id_unit) |
| id_dosen | int | ID dosen (FK ke dosen.id_dosen) |
| jenis_pengembangan | varchar(255) | Jenis pengembangan (e.g., "Tugas Belajar", "Pelatihan", dll.) |
| id_tahun | int | Tahun pelaksanaan (FK ke tahun_akademik.id_tahun) |
| link_bukti | text | Link bukti dokumen |
| created_at | timestamp | Timestamp pembuatan |
| updated_at | timestamp | Timestamp update |
| deleted_at | datetime | Timestamp soft delete |
| deleted_by | int | User yang melakukan soft delete |

**Indexes:**
- PRIMARY KEY (`id_pengembangan`)
- KEY `fk_3a3_pengembangan_unit_idx` (`id_unit`)
- KEY `fk_3a3_pengembangan_dosen_idx` (`id_dosen`)
- KEY `fk_3a3_pengembangan_tahun_idx` (`id_tahun`)

**Foreign Keys:**
- `fk_3a3_pengembangan_unit`: `id_unit` → `unit_kerja.id_unit` ON UPDATE CASCADE
- `fk_3a3_pengembangan_dosen`: `id_dosen` → `dosen.id_dosen` ON UPDATE CASCADE
- `fk_3a3_pengembangan_tahun`: `id_tahun` → `tahun_akademik.id_tahun` ON UPDATE CASCADE

## Contoh Request & Response

### Example 1: List Summary dengan PIVOT

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response:**
```json
{
  "id_unit": 12,
  "nama_unit_prodi": "LPPM",
  "jumlah_ts_2": 10,
  "jumlah_ts_1": 12,
  "jumlah_ts": 15,
  "link_bukti_ts_2": "https://drive.google.com/bukti-ts2.pdf",
  "link_bukti_ts_1": "https://drive.google.com/bukti-ts1.pdf",
  "link_bukti_ts": "https://drive.google.com/bukti-ts.pdf"
}
```

### Example 2: List Detail dengan PIVOT

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/detail?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response:**
```json
[
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "id_dosen": 1,
    "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
    "jenis_pengembangan": "Tugas Belajar",
    "jumlah_ts_2": 1,
    "jumlah_ts_1": 0,
    "jumlah_ts": 1,
    "link_bukti_ts_2": "https://drive.google.com/bukti-ts2.pdf",
    "link_bukti_ts_1": null,
    "link_bukti_ts": "https://drive.google.com/bukti-ts.pdf",
    "link_bukti": "https://drive.google.com/bukti-ts.pdf"
  },
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "id_dosen": 1,
    "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
    "jenis_pengembangan": "Pelatihan",
    "jumlah_ts_2": 0,
    "jumlah_ts_1": 1,
    "jumlah_ts": 0,
    "link_bukti_ts_2": null,
    "link_bukti_ts_1": "https://drive.google.com/bukti-ts1.pdf",
    "link_bukti_ts": null,
    "link_bukti": "https://drive.google.com/bukti-ts1.pdf"
  }
]
```

### Example 3: Create Summary

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://drive.google.com/bukti-2024.pdf"
}
```

**Response:**
```json
{
  "message": "Data summary DTPR berhasil dibuat",
  "id": 1
}
```

### Example 4: Create Detail Pengembangan

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/bukti-tugas-belajar.pdf"
}
```

**Response:**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 1
}
```

## Validasi Data

### Aturan Validasi Summary:
- `id_unit` dan `id_tahun` wajib diisi
- Jika sudah ada data untuk kombinasi `id_unit` dan `id_tahun`, akan melakukan update otomatis (UPSERT)
- `jumlah_dtpr` default ke 0 jika tidak diisi

### Aturan Validasi Detail:
- `id_unit`, `id_dosen`, `jenis_pengembangan`, dan `id_tahun` wajib diisi
- Data dapat diinput untuk setiap kombinasi dosen, jenis pengembangan, dan tahun
- Tidak ada constraint unique, sehingga dosen yang sama dapat memiliki beberapa jenis pengembangan dalam tahun yang sama

## Keterangan Penting

### Keterangan dari LKPS:
> **"Pengisian data tidak berulang, jika dosen dikirim tugas belajar di tahun TS-3, maka tidak lagi dihitung di TS-2."**

Ini berarti:
- Jika dosen sudah dikirim tugas belajar di tahun TS-3 (3 tahun sebelum TS), maka tidak perlu dihitung lagi di TS-2
- Sistem tidak melakukan validasi otomatis untuk ini, namun user harus memastikan konsistensi data saat input

### PIVOT Logic:
- **Summary**: Menggunakan `SUM(jumlah_dtpr)` untuk setiap tahun (TS-2, TS-1, TS)
- **Detail**: Menggunakan `COUNT` untuk menghitung jumlah pengembangan per dosen per jenis per tahun
- Data di-group berdasarkan kombinasi `id_unit`, `id_dosen`, dan `jenis_pengembangan`
- Hanya menampilkan data yang memiliki tahun dalam rentang TS-2 sampai TS (filter `id_tahun IN (TS-2, TS-1, TS)`)

### Filter Tahun:
- Semua endpoint PIVOT (list summary dan detail) memerlukan 3 query parameter tahun: `id_tahun_ts`, `id_tahun_ts_1`, `id_tahun_ts_2`
- Data yang ditampilkan hanya yang memiliki tahun dalam rentang tersebut
- Jika data pengembangan memiliki tahun di luar rentang (misal: TS-3 atau TS+1), tidak akan ditampilkan

## Error Handling

### Error Response Format:
```json
{
  "error": "Error message",
  "details": "Detailed error message (optional)"
}
```

### Common Errors:

1. **Missing Required Parameters:**
   ```json
   {
     "error": "Query parameter id_tahun_ts wajib ada."
   }
   ```

2. **Validation Error:**
   ```json
   {
     "error": "Unit dan Tahun wajib diisi."
   }
   ```

3. **Not Found:**
   ```json
   {
     "error": "Data tidak ditemukan"
   }
   ```

4. **Database Error:**
   ```json
   {
     "error": "Gagal menyimpan data summary DTPR",
     "details": "SQL error message"
   }
   ```

## Notes

- Data summary dan detail disimpan terpisah di tabel yang berbeda
- Summary menggunakan UPSERT logic (create jika belum ada, update jika sudah ada)
- Detail menggunakan standard CRUD (harus specify ID untuk update)
- Export Excel menggabungkan data summary dan detail dalam satu file
- Soft delete menggunakan field `deleted_at` (data tidak benar-benar dihapus dari database)
- Field `deleted_at` digunakan untuk filter default (data yang di-soft delete tidak ditampilkan kecuali `include_deleted=1`)


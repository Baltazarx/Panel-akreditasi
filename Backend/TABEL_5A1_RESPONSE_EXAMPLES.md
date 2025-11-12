# Tabel 5.A.1 - Sistem Tata Kelola Response Examples

Dokumentasi ini berisi contoh response untuk setiap endpoint pada Tabel 5.A.1 Sistem Tata Kelola API.

## 1. List Data (GET /api/tabel-5-1-sistem-tata-kelola)

### Success Response (200)

```json
[
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 2,
    "jenis_tata_kelola": "Keuangan",
    "nama_sistem_informasi": "Sistem Keuangan Terpadu",
    "akses": "Lokal",
    "id_unit_pengelola": 10,
    "nama_unit_pengelola": "Kepegawaian",
    "link_bukti": "https://example.com/bukti-keuangan.pdf",
    "created_at": "2025-11-12T11:00:00.000Z",
    "updated_at": "2025-11-12T11:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 3,
    "jenis_tata_kelola": "SDM",
    "nama_sistem_informasi": "Sistem Manajemen Sumber Daya Manusia",
    "akses": "Internet",
    "id_unit_pengelola": 10,
    "nama_unit_pengelola": "Kepegawaian",
    "link_bukti": "https://example.com/bukti-sdm.pdf",
    "created_at": "2025-11-12T12:00:00.000Z",
    "updated_at": "2025-11-12T12:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 4,
    "jenis_tata_kelola": "Sarana Prasarana",
    "nama_sistem_informasi": "Sistem Manajemen Sarana Prasarana",
    "akses": "Lokal",
    "id_unit_pengelola": 11,
    "nama_unit_pengelola": "Sarpras",
    "link_bukti": "https://example.com/bukti-sarpras.pdf",
    "created_at": "2025-11-12T13:00:00.000Z",
    "updated_at": "2025-11-12T13:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 5,
    "jenis_tata_kelola": "Sistem Penjaminan Mutu",
    "nama_sistem_informasi": "Sistem Penjaminan Mutu Internal",
    "akses": "Internet",
    "id_unit_pengelola": 9,
    "nama_unit_pengelola": "TPM",
    "link_bukti": "https://example.com/bukti-spmi.pdf",
    "created_at": "2025-11-12T14:00:00.000Z",
    "updated_at": "2025-11-12T14:00:00.000Z",
    "deleted_at": null
  }
]
```

### Empty Response (200)

Jika tidak ada data:

```json
[]
```

### Error Response (500)

```json
{
  "error": "Gagal mengambil daftar Sistem Tata Kelola",
  "details": "ER_NO_SUCH_TABLE: Table 'database.tabel_5a1_sistem_tata_kelola' doesn't exist"
}
```

## 2. Get by ID (GET /api/tabel-5-1-sistem-tata-kelola/:id)

### Success Response (200)

```json
{
  "id": 1,
  "jenis_tata_kelola": "Pendidikan",
  "nama_sistem_informasi": "Sistem Informasi Akademik",
  "akses": "Internet",
      "id_unit_pengelola": 2,
      "nama_unit_pengelola": "Wakil Ketua I",
  "link_bukti": "https://example.com/bukti-siakad.pdf",
  "created_at": "2025-11-12T10:00:00.000Z",
  "updated_at": "2025-11-12T10:00:00.000Z",
  "deleted_at": null
}
```

### Error Response (404)

```json
{
  "error": "Data Sistem Tata Kelola tidak ditemukan"
}
```

## 3. Create Data (POST /api/tabel-5-1-sistem-tata-kelola)

### Success Response (201)

```json
{
  "message": "Data Sistem Tata Kelola berhasil dibuat",
  "id": 6,
  "data": {
    "id": 6,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem E-Learning",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-elearning.pdf",
    "created_at": "2025-11-12T15:00:00.000Z",
    "updated_at": "2025-11-12T15:00:00.000Z",
    "deleted_at": null
  }
}
```

### Error Response - Missing Required Field (400)

```json
{
  "error": "Input tidak lengkap. (jenis_tata_kelola) wajib diisi."
}
```

atau

```json
{
  "error": "Input tidak lengkap. (nama_sistem_informasi) wajib diisi."
}
```

### Error Response - Invalid Foreign Key (500)

```json
{
  "error": "Gagal membuat data Sistem Tata Kelola",
  "details": "Cannot add or update a child row: a foreign key constraint fails"
}
```

## 4. Update Data (PUT /api/tabel-5-1-sistem-tata-kelola/:id)

### Success Response (200)

```json
{
  "message": "Data Sistem Tata Kelola berhasil diperbarui",
  "data": {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik (Updated)",
    "akses": "Lokal",
    "id_unit_pengelola": 3,
    "nama_unit_pengelola": "Wakil Ketua II",
    "link_bukti": "https://example.com/bukti-siakad-updated.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T16:00:00.000Z",
    "deleted_at": null
  }
}
```

### Error Response - Not Found (404)

```json
{
  "error": "Data Sistem Tata Kelola tidak ditemukan."
}
```

### Error Response - Missing Required Field (400)

```json
{
  "error": "Input tidak lengkap. (jenis_tata_kelola) wajib diisi."
}
```

## 5. Soft Delete (DELETE /api/tabel-5-1-sistem-tata-kelola/:id)

### Success Response (200)

```json
{
  "message": "Data berhasil dihapus (soft delete)"
}
```

### Error Response (404)

```json
{
  "error": "Data Sistem Tata Kelola tidak ditemukan."
}
```

## 6. Restore Data (POST /api/tabel-5-1-sistem-tata-kelola/:id/restore)

### Success Response (200)

```json
{
  "ok": true,
  "restored": true,
  "message": "Data Sistem Tata Kelola berhasil dipulihkan"
}
```

### Error Response - Already Restored (404)

```json
{
  "error": "Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus."
}
```

### Error Response - Invalid ID (400)

```json
{
  "error": "ID tidak valid."
}
```

## 7. Hard Delete (DELETE /api/tabel-5-1-sistem-tata-kelola/:id/hard)

### Success Response (200)

```json
{
  "message": "Data berhasil dihapus secara permanen (hard delete)."
}
```

### Error Response (404)

```json
{
  "error": "Data Sistem Tata Kelola tidak ditemukan."
}
```

## 8. List Data dengan Filter

### Filter by Jenis Tata Kelola

**Request:**
```
GET /api/tabel-5-1-sistem-tata-kelola?jenis_tata_kelola=Pendidikan
```

**Response (200):**
```json
[
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 6,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem E-Learning",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-elearning.pdf",
    "created_at": "2025-11-12T15:00:00.000Z",
    "updated_at": "2025-11-12T15:00:00.000Z",
    "deleted_at": null
  }
]
```

### Filter by Akses

**Request:**
```
GET /api/tabel-5-1-sistem-tata-kelola?akses=Internet
```

**Response (200):**
```json
[
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 3,
    "jenis_tata_kelola": "SDM",
    "nama_sistem_informasi": "Sistem Manajemen Sumber Daya Manusia",
    "akses": "Internet",
    "id_unit_pengelola": 10,
    "nama_unit_pengelola": "Kepegawaian",
    "link_bukti": "https://example.com/bukti-sdm.pdf",
    "created_at": "2025-11-12T12:00:00.000Z",
    "updated_at": "2025-11-12T12:00:00.000Z",
    "deleted_at": null
  }
]
```

### Filter by Unit Pengelola

**Request:**
```
GET /api/tabel-5-1-sistem-tata-kelola?id_unit_pengelola=2
```

**Response (200):**
```json
[
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  }
]
```

### Filter dengan Multiple Parameters

**Request:**
```
GET /api/tabel-5-1-sistem-tata-kelola?jenis_tata_kelola=Pendidikan&akses=Internet&order_by=nama_sistem_informasi ASC
```

**Response (200):**
```json
[
  {
    "id": 6,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem E-Learning",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-elearning.pdf",
    "created_at": "2025-11-12T15:00:00.000Z",
    "updated_at": "2025-11-12T15:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  }
]
```

### Include Deleted Data

**Request:**
```
GET /api/tabel-5-1-sistem-tata-kelola?include_deleted=true
```

**Response (200):**
```json
[
  {
    "id": 1,
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "nama_unit_pengelola": "Wakil Ketua I",
    "link_bukti": "https://example.com/bukti-siakad.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "updated_at": "2025-11-12T10:00:00.000Z",
    "deleted_at": null
  },
  {
    "id": 7,
    "jenis_tata_kelola": "Keuangan",
    "nama_sistem_informasi": "Sistem Keuangan Lama",
    "akses": "Lokal",
    "id_unit_pengelola": 10,
    "nama_unit_pengelola": "Kepegawaian",
    "link_bukti": "https://example.com/bukti-lama.pdf",
    "created_at": "2025-11-12T09:00:00.000Z",
    "updated_at": "2025-11-12T09:00:00.000Z",
    "deleted_at": "2025-11-12T10:30:00.000Z"
  }
]
```

## 9. Export Excel Response

### Success Response

Response berupa file Excel dengan:
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename=Tabel_5_1_Sistem_Tata_Kelola.xlsx`
- **File Content**: Excel file dengan format:
  - Header row dengan styling (bold, center, gray background)
  - Data rows dengan nomor urut
  - Kolom: No, Jenis Tata Kelola, Nama Sistem Informasi, Akses (Lokal/Internet), Unit Kerja/SDM Pengelola, Link Bukti

### Error Response (500)

```json
{
  "error": "Gagal mengekspor data Sistem Tata Kelola",
  "details": "Error message details"
}
```

## Catatan Penting

1. **Timestamp Format**: Semua timestamp menggunakan format ISO 8601 (UTC)
2. **NULL Values**: Field yang NULL akan ditampilkan sebagai `null` dalam JSON
3. **Foreign Key Relations**: 
   - `nama_unit_pengelola` akan otomatis diambil dari relasi `unit_kerja` berdasarkan `id_unit_pengelola`
   - `id_unit_pengelola` wajib diisi (NOT NULL)
4. **Soft Delete**: Data yang di-soft delete akan memiliki `deleted_at` yang tidak NULL
5. **Default Sorting**: Jika tidak ada `order_by`, data akan diurutkan berdasarkan `id ASC`


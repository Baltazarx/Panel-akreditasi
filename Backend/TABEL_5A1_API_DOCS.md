# Tabel 5.A.1 - Sistem Tata Kelola API

## Endpoints

### Base URL: `/api/tabel-5-1-sistem-tata-kelola`

## Deskripsi

Tabel 5.A.1 mencatat sistem tata kelola yang digunakan di institusi sesuai dengan LKPS. Tabel ini mencakup informasi tentang jenis tata kelola, nama sistem informasi, akses (Lokal/Internet), unit kerja atau SDM pengelola, dan link bukti.

## Struktur Data

### Kolom Tabel

| Kolom | Tipe | Deskripsi | Wajib |
|-------|------|-----------|-------|
| `id` | int(11) | Primary key (AUTO_INCREMENT) | - |
| `jenis_tata_kelola` | varchar(255) | Jenis Tata Kelola (Pendidikan, Keuangan, SDM, Sarana Prasarana, Sistem Penjaminan Mutu, dll) | ✅ |
| `nama_sistem_informasi` | varchar(255) | Nama Sistem Informasi | ✅ |
| `akses` | enum('Lokal','Internet') | Akses: Lokal atau Internet | ❌ |
| `id_unit_pengelola` | int(11) | FK ke unit_kerja.id_unit (Unit Kerja Pengelola) | ✅ |
| `link_bukti` | text | Link Bukti | ❌ |
| `created_at` | timestamp | Waktu pembuatan | - |
| `updated_at` | timestamp | Waktu update terakhir | - |
| `deleted_at` | datetime | Waktu soft delete (NULL jika tidak dihapus) | - |
| `deleted_by` | int(11) | ID user yang menghapus | - |

### Catatan Penting

- **Unit Kerja Pengelola**: Kolom `id_unit_pengelola` wajib diisi (NOT NULL). Kolom "Unit Kerja/SDM Pengelola" di LKPS diisi dari `nama_unit` yang diambil dari relasi `unit_kerja`.
- **Jenis Tata Kelola**: Contoh nilai: "Pendidikan", "Keuangan", "SDM", "Sarana Prasarana", "Sistem Penjaminan Mutu", dll.
- **Akses**: Hanya menerima nilai "Lokal" atau "Internet" (case-sensitive).

## CRUD Operations

### 1. List Data (GET)

- **Endpoint**: `GET /api/tabel-5-1-sistem-tata-kelola`
- **Description**: Mendapatkan daftar semua data sistem tata kelola
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `R` (Read)
- **Query Parameters** (Optional):
  - `id_unit_pengelola` (optional): Filter berdasarkan unit pengelola
  - `jenis_tata_kelola` (optional): Filter berdasarkan jenis tata kelola
  - `akses` (optional): Filter berdasarkan akses (Lokal/Internet)
  - `order_by` (optional): Sorting (default: `id ASC`)
    - Contoh: `order_by=jenis_tata_kelola ASC, nama_sistem_informasi DESC`
  - `include_deleted` (optional): Include soft deleted data (default: false)
    - Set `include_deleted=true` untuk menampilkan data yang sudah di-soft delete

- **Response Success (200)**:
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
    }
  ]
  ```

- **Response Error (500)**:
  ```json
  {
    "error": "Gagal mengambil daftar Sistem Tata Kelola",
    "details": "Error message details"
  }
  ```

### 2. Get by ID (GET)

- **Endpoint**: `GET /api/tabel-5a1-sistem-tata-kelola/:id`
- **Description**: Mendapatkan detail data sistem tata kelola berdasarkan ID
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `R` (Read)
- **Path Parameters**:
  - `id` (required): ID data yang ingin diambil

- **Response Success (200)**:
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

- **Response Error (404)**:
  ```json
  {
    "error": "Data Sistem Tata Kelola tidak ditemukan"
  }
  ```

### 3. Create Data (POST)

- **Endpoint**: `POST /api/tabel-5a1-sistem-tata-kelola`
- **Description**: Membuat data sistem tata kelola baru
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `C` (Create)
- **Request Body**:
  ```json
  {
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "link_bukti": "https://example.com/bukti-siakad.pdf"
  }
  ```

- **Field Validation**:
  - `jenis_tata_kelola` (required): Harus diisi, tidak boleh kosong
  - `nama_sistem_informasi` (required): Harus diisi, tidak boleh kosong
  - `akses` (optional): Hanya menerima "Lokal" atau "Internet"
  - `id_unit_pengelola` (required): Harus valid ID dari tabel `unit_kerja` (WAJIB diisi)
  - `link_bukti` (optional): URL atau text

- **Response Success (201)**:
  ```json
  {
    "message": "Data Sistem Tata Kelola berhasil dibuat",
    "id": 1,
    "data": {
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
  }
  ```

- **Response Error (400)**:
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
  atau
  ```json
  {
    "error": "Input tidak lengkap. (id_unit_pengelola) wajib diisi."
  }
  ```

- **Response Error (500)**:
  ```json
  {
    "error": "Gagal membuat data Sistem Tata Kelola",
    "details": "Error message details"
  }
  ```

### 4. Update Data (PUT)

- **Endpoint**: `PUT /api/tabel-5a1-sistem-tata-kelola/:id`
- **Description**: Mengupdate data sistem tata kelola yang sudah ada
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `U` (Update)
- **Path Parameters**:
  - `id` (required): ID data yang ingin diupdate
- **Request Body**: Same as create (semua field wajib diisi untuk validasi)
  ```json
  {
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik (Updated)",
    "akses": "Lokal",
    "id_unit_pengelola": 3,
    "link_bukti": "https://example.com/bukti-siakad-updated.pdf"
  }
  ```

- **Response Success (200)**:
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
      "updated_at": "2025-11-12T12:00:00.000Z",
      "deleted_at": null
    }
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Sistem Tata Kelola tidak ditemukan."
  }
  ```

### 5. Soft Delete (DELETE)

- **Endpoint**: `DELETE /api/tabel-5a1-sistem-tata-kelola/:id`
- **Description**: Menghapus data secara soft delete (menandai sebagai deleted, data tidak benar-benar dihapus)
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `D` (Delete)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dihapus

- **Response Success (200)**:
  ```json
  {
    "message": "Data berhasil dihapus (soft delete)"
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Sistem Tata Kelola tidak ditemukan."
  }
  ```

### 6. Restore Data (POST)

- **Endpoint**: `POST /api/tabel-5a1-sistem-tata-kelola/:id/restore`
- **Description**: Mengembalikan data yang sudah di-soft delete
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `U` (Update)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dipulihkan

- **Response Success (200)**:
  ```json
  {
    "ok": true,
    "restored": true,
    "message": "Data Sistem Tata Kelola berhasil dipulihkan"
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus."
  }
  ```

### 7. Hard Delete (DELETE)

- **Endpoint**: `DELETE /api/tabel-5a1-sistem-tata-kelola/:id/hard`
- **Description**: Menghapus data secara permanen dari database (HATI-HATI: tidak bisa dikembalikan)
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `H` (Hard Delete)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dihapus permanen

- **Response Success (200)**:
  ```json
  {
    "message": "Data berhasil dihapus secara permanen (hard delete)."
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Sistem Tata Kelola tidak ditemukan."
  }
  ```

### 8. Export Excel (GET)

- **Endpoint**: `GET /api/tabel-5a1-sistem-tata-kelola/export`
- **Description**: Mengekspor data sistem tata kelola ke format Excel (.xlsx)
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_5_1_sistem_tata_kelola` dengan permission `R` (Read)
- **Query Parameters** (Optional): Same as List Data untuk filtering
  - `id_unit_pengelola` (optional)
  - `jenis_tata_kelola` (optional)
  - `akses` (optional)
  - `order_by` (optional)
  - `include_deleted` (optional)

- **Response**: File Excel dengan nama `Tabel_5_1_Sistem_Tata_Kelola.xlsx`
- **Format Excel**:
  - Header: No, Jenis Tata Kelola, Nama Sistem Informasi, Akses (Lokal/Internet), Unit Kerja/SDM Pengelola, Link Bukti
  - Data diurutkan sesuai parameter `order_by` atau default `id ASC`
  - Kolom "Unit Kerja/SDM Pengelola" akan menampilkan nama unit dari `unit_kerja` berdasarkan `id_unit_pengelola`

## Contoh Penggunaan

### Contoh 1: Membuat Data Baru

```bash
curl -X POST http://localhost:3000/api/tabel-5-1-sistem-tata-kelola \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik",
    "akses": "Internet",
    "id_unit_pengelola": 2,
    "link_bukti": "https://example.com/bukti-siakad.pdf"
  }'
```

### Contoh 2: Mengambil Data dengan Filter

```bash
curl -X GET "http://localhost:3000/api/tabel-5-1-sistem-tata-kelola?jenis_tata_kelola=Pendidikan&akses=Internet&order_by=nama_sistem_informasi ASC" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Contoh 3: Update Data

```bash
curl -X PUT http://localhost:3000/api/tabel-5-1-sistem-tata-kelola/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jenis_tata_kelola": "Pendidikan",
    "nama_sistem_informasi": "Sistem Informasi Akademik (Updated)",
    "akses": "Lokal",
    "id_unit_pengelola": 3,
    "link_bukti": "https://example.com/bukti-updated.pdf"
  }'
```

### Contoh 4: Soft Delete

```bash
curl -X DELETE http://localhost:3000/api/tabel-5-1-sistem-tata-kelola/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Contoh 5: Restore Data

```bash
curl -X POST http://localhost:3000/api/tabel-5-1-sistem-tata-kelola/1/restore \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Contoh 6: Export Excel

```bash
curl -X GET "http://localhost:3000/api/tabel-5-1-sistem-tata-kelola/export?jenis_tata_kelola=Pendidikan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o Tabel_5_1_Sistem_Tata_Kelola.xlsx
```

## Error Handling

### Common Error Codes

- **400 Bad Request**: Input tidak valid atau tidak lengkap
- **401 Unauthorized**: Token tidak valid atau tidak ada
- **403 Forbidden**: User tidak memiliki permission untuk akses resource ini
- **404 Not Found**: Data tidak ditemukan
- **500 Internal Server Error**: Error dari server (cek details untuk informasi lebih lanjut)

### Error Response Format

```json
{
  "error": "Error message",
  "details": "Detailed error message (optional)"
}
```

## Notes

1. **Soft Delete vs Hard Delete**:
   - Soft delete: Data ditandai sebagai deleted dengan `deleted_at`, data masih ada di database dan bisa dipulihkan
   - Hard delete: Data benar-benar dihapus dari database, tidak bisa dikembalikan

2. **Unit Kerja Pengelola**:
   - Harus diisi dari `id_unit_pengelola` (WAJIB, NOT NULL)
   - Nama unit akan otomatis diambil dari relasi `unit_kerja`

3. **Akses**:
   - Hanya menerima nilai "Lokal" atau "Internet" (case-sensitive)
   - Bisa NULL jika tidak diisi

4. **Filtering**:
   - Semua query parameters bersifat optional
   - Bisa dikombinasikan untuk filtering yang lebih spesifik
   - Default sorting: `id ASC`

5. **Export Excel**:
   - File Excel akan otomatis di-download dengan nama `Tabel_5A1_Sistem_Tata_Kelola.xlsx`
   - Format mengikuti struktur tabel LKPS
   - Kolom "Unit Kerja/SDM Pengelola" akan menampilkan nama unit dari `unit_kerja`
   - Mendukung filtering sama seperti endpoint List Data


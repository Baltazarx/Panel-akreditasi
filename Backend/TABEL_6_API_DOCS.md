# Tabel 6 - Kesesuaian Visi, Misi API

## Endpoints

### Base URL: `/api/tabel-6-kesesuaian-visi-misi`

## Deskripsi

Tabel 6 mencatat kesesuaian visi dan misi untuk Perguruan Tinggi (PT), UPPS, dan Program Studi (PS) sesuai dengan LKPS. Tabel ini mencakup informasi tentang visi dan misi PT, UPPS, dan visi keilmuan PS, serta link bukti yang dapat berupa VMTS, rencana pengembangan strategis UPPS/PS, dan pengakuan/apresiasi oleh masyarakat dan DUDIKA.

## Struktur Data

### Kolom Tabel

| Kolom | Tipe | Deskripsi | Wajib |
|-------|------|-----------|-------|
| `id` | int(11) | Primary key (AUTO_INCREMENT) | - |
| `id_unit_prodi` | int(11) | FK ke unit_kerja.id_unit (Program Studi) | ✅ |
| `visi_pt` | text | Visi Perguruan Tinggi (PT) | ❌ |
| `visi_upps` | text | Visi UPPS | ❌ |
| `visi_keilmuan_ps` | text | Visi Keilmuan Program Studi (PS) | ❌ |
| `misi_pt` | text | Misi Perguruan Tinggi (PT) | ❌ |
| `misi_upps` | text | Misi UPPS | ❌ |
| `link_bukti` | text | Link Bukti (VMTS, rencana pengembangan strategis, pengakuan/apresiasi) | ❌ |
| `created_at` | timestamp | Waktu pembuatan | - |
| `created_by` | int(11) | ID user yang membuat | - |
| `updated_at` | timestamp | Waktu update terakhir | - |
| `updated_by` | int(11) | ID user yang mengupdate | - |
| `deleted_at` | datetime | Waktu soft delete (NULL jika tidak dihapus) | - |
| `deleted_by` | int(11) | ID user yang menghapus | - |

### Catatan Penting

- **Satu Record per Prodi**: Tabel ini memiliki UNIQUE constraint pada `id_unit_prodi`, sehingga setiap program studi hanya dapat memiliki satu record.
- **Link Bukti**: Dapat berisi link ke dokumen VMTS, rencana pengembangan strategis UPPS/PS, atau dokumen pengakuan/apresiasi oleh masyarakat dan DUDIKA.
- **Visi dan Misi**: Semua field visi dan misi bersifat optional, namun disarankan untuk mengisi semua field untuk kelengkapan data.

## CRUD Operations

### 1. List Data (GET)

- **Endpoint**: `GET /api/tabel-6-kesesuaian-visi-misi`
- **Description**: Mendapatkan daftar semua data kesesuaian visi misi
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `R` (Read)
- **Query Parameters** (Optional):
  - `id_unit_prodi` (optional): Filter berdasarkan program studi
  - `order_by` (optional): Sorting (default: `id ASC`)
    - Contoh: `order_by=id_unit_prodi ASC`
  - `include_deleted` (optional): Include soft deleted data (default: false)
    - Set `include_deleted=true` untuk menampilkan data yang sudah di-soft delete

- **Response Success (200)**:
  ```json
  [
    {
      "id": 1,
      "id_unit_prodi": 4,
      "nama_prodi": "Prodi TI",
      "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
      "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
      "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
      "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
      "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
      "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf",
      "created_at": "2025-11-12T10:00:00.000Z",
      "created_by": 3,
      "updated_at": "2025-11-12T10:00:00.000Z",
      "updated_by": 3,
      "deleted_at": null,
      "deleted_by": null
    }
  ]
  ```

- **Response Error (500)**:
  ```json
  {
    "error": "Gagal mengambil daftar Kesesuaian Visi Misi",
    "details": "Error message details"
  }
  ```

### 2. Get by ID (GET)

- **Endpoint**: `GET /api/tabel-6-kesesuaian-visi-misi/:id`
- **Description**: Mendapatkan detail data kesesuaian visi misi berdasarkan ID
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `R` (Read)
- **Path Parameters**:
  - `id` (required): ID data yang ingin diambil

- **Response Success (200)**:
  ```json
  {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": "2025-11-12T10:00:00.000Z",
    "updated_by": 3,
    "deleted_at": null,
    "deleted_by": null
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Kesesuaian Visi Misi tidak ditemukan"
  }
  ```

### 3. Get by Prodi (GET)

- **Endpoint**: `GET /api/tabel-6-kesesuaian-visi-misi/prodi/:id_unit_prodi`
- **Description**: Mendapatkan data kesesuaian visi misi berdasarkan Program Studi
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `R` (Read)
- **Path Parameters**:
  - `id_unit_prodi` (required): ID unit kerja (Program Studi)

- **Response Success (200)**:
  ```json
  {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": "2025-11-12T10:00:00.000Z",
    "updated_by": 3,
    "deleted_at": null,
    "deleted_by": null
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Kesesuaian Visi Misi untuk prodi ini tidak ditemukan"
  }
  ```

### 4. Create (POST)

- **Endpoint**: `POST /api/tabel-6-kesesuaian-visi-misi`
- **Description**: Membuat data kesesuaian visi misi baru
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `C` (Create)
- **Request Body**:
  ```json
  {
    "id_unit_prodi": 4,
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf"
  }
  ```

- **Field Validation**:
  - `id_unit_prodi` (required): Harus diisi dan harus unik (belum ada data untuk prodi tersebut)
  - Semua field lainnya optional

- **Response Success (201)**:
  ```json
  {
    "message": "Data Kesesuaian Visi Misi berhasil dibuat",
    "id": 1,
    "data": {
      "id": 1,
      "id_unit_prodi": 4,
      "nama_prodi": "Prodi TI",
      "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
      "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
      "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
      "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
      "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
      "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf",
      "created_at": "2025-11-12T10:00:00.000Z",
      "created_by": 3,
      "updated_at": null,
      "updated_by": null,
      "deleted_at": null,
      "deleted_by": null
    }
  }
  ```

- **Response Error (400)**:
  ```json
  {
    "error": "Input tidak lengkap. (id_unit_prodi) wajib diisi."
  }
  ```

- **Response Error (400) - Duplicate**:
  ```json
  {
    "error": "Data Kesesuaian Visi Misi untuk prodi ini sudah ada. Gunakan UPDATE untuk memperbarui data."
  }
  ```

### 5. Update (PUT)

- **Endpoint**: `PUT /api/tabel-6-kesesuaian-visi-misi/:id`
- **Description**: Memperbarui data kesesuaian visi misi
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `U` (Update)
- **Path Parameters**:
  - `id` (required): ID data yang ingin diupdate
- **Request Body** (semua field optional, hanya kirim field yang ingin diupdate):
  ```json
  {
    "visi_pt": "Visi PT yang diperbarui",
    "misi_pt": "Misi PT yang diperbarui",
    "link_bukti": "https://drive.google.com/file/d/xyz789/vmts-updated.pdf"
  }
  ```

- **Response Success (200)**:
  ```json
  {
    "message": "Data Kesesuaian Visi Misi berhasil diperbarui",
    "data": {
      "id": 1,
      "id_unit_prodi": 4,
      "nama_prodi": "Prodi TI",
      "visi_pt": "Visi PT yang diperbarui",
      "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
      "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
      "misi_pt": "Misi PT yang diperbarui",
      "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
      "link_bukti": "https://drive.google.com/file/d/xyz789/vmts-updated.pdf",
      "created_at": "2025-11-12T10:00:00.000Z",
      "created_by": 3,
      "updated_at": "2025-11-12T11:00:00.000Z",
      "updated_by": 3,
      "deleted_at": null,
      "deleted_by": null
    }
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data Kesesuaian Visi Misi tidak ditemukan atau tidak ada perubahan."
  }
  ```

### 6. Soft Delete (DELETE)

- **Endpoint**: `DELETE /api/tabel-6-kesesuaian-visi-misi/:id`
- **Description**: Menghapus data kesesuaian visi misi (soft delete)
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `D` (Delete)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dihapus

- **Response Success (200)**:
  ```json
  {
    "message": "Data Kesesuaian Visi Misi berhasil dihapus (soft delete)"
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data tidak ditemukan."
  }
  ```

### 7. Restore (POST)

- **Endpoint**: `POST /api/tabel-6-kesesuaian-visi-misi/:id/restore`
- **Description**: Memulihkan data yang sudah di-soft delete
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `U` (Update)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dipulihkan

- **Response Success (200)**:
  ```json
  {
    "ok": true,
    "restored": true,
    "message": "Data Kesesuaian Visi Misi berhasil dipulihkan"
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus."
  }
  ```

### 8. Hard Delete (DELETE)

- **Endpoint**: `DELETE /api/tabel-6-kesesuaian-visi-misi/:id/hard`
- **Description**: Menghapus data secara permanen dari database
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `H` (Hard Delete)
- **Path Parameters**:
  - `id` (required): ID data yang ingin dihapus permanen

- **Response Success (200)**:
  ```json
  {
    "message": "Data Kesesuaian Visi Misi berhasil dihapus secara permanen (hard delete)."
  }
  ```

- **Response Error (404)**:
  ```json
  {
    "error": "Data tidak ditemukan."
  }
  ```

### 9. Export Excel (GET)

- **Endpoint**: `GET /api/tabel-6-kesesuaian-visi-misi/export`
- **Description**: Mengekspor data kesesuaian visi misi ke file Excel
- **Authentication**: Required (Bearer token)
- **Permission**: `tabel_6_kesesuaian_visi_misi` dengan permission `R` (Read)
- **Query Parameters** (Optional):
  - `id_unit_prodi` (optional)
  - `order_by` (optional)
  - `include_deleted` (optional)

- **Response**: File Excel dengan nama `Tabel_6_Kesesuaian_Visi_Misi.xlsx`
- **Format Excel**:
  - Header: Program Studi, Visi PT, Visi UPPS, Visi Keilmuan PS, Misi PT, Misi UPPS, Link Bukti
  - Data diurutkan sesuai parameter `order_by` atau default `id ASC`

## Contoh Penggunaan

### Contoh 1: Membuat Data Baru

```bash
curl -X POST http://localhost:3000/api/tabel-6-kesesuaian-visi-misi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_unit_prodi": 4,
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian yang bermanfaat\n3. Melakukan pengabdian kepada masyarakat",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama dengan industri",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf"
  }'
```

### Contoh 2: Mengambil Data Berdasarkan Prodi

```bash
curl -X GET "http://localhost:3000/api/tabel-6-kesesuaian-visi-misi/prodi/4" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Contoh 3: Update Data

```bash
curl -X PUT http://localhost:3000/api/tabel-6-kesesuaian-visi-misi/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "visi_pt": "Visi PT yang diperbarui",
    "misi_pt": "Misi PT yang diperbarui"
  }'
```

### Contoh 4: Export Excel

```bash
curl -X GET "http://localhost:3000/api/tabel-6-kesesuaian-visi-misi/export?id_unit_prodi=4" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o Tabel_6_Kesesuaian_Visi_Misi.xlsx
```

## Error Handling

### Common Error Codes

- **400 Bad Request**: 
  - Field wajib tidak diisi
  - Data duplikat untuk prodi yang sama
  - ID tidak valid

- **401 Unauthorized**: Token tidak valid atau tidak ada

- **403 Forbidden**: User tidak memiliki permission untuk akses resource ini

- **404 Not Found**: Data tidak ditemukan

- **500 Internal Server Error**: Error dari database atau server

## Catatan Penting

1. **Satu Record per Prodi**: Setiap program studi hanya dapat memiliki satu record. Jika mencoba membuat data baru untuk prodi yang sudah ada, akan mendapat error 400.

2. **Update vs Create**: Gunakan CREATE untuk membuat data baru, dan UPDATE untuk memperbarui data yang sudah ada.

3. **Soft Delete**: Data yang dihapus menggunakan DELETE endpoint akan di-soft delete (tidak dihapus permanen). Data dapat dipulihkan menggunakan endpoint RESTORE.

4. **Hard Delete**: Hanya user dengan permission `H` (Hard Delete) yang dapat menghapus data secara permanen.

5. **Link Bukti**: Dapat berisi link ke dokumen VMTS, rencana pengembangan strategis, atau dokumen pengakuan/apresiasi.


# Tabel 2.B.4 - Rata-rata Masa Tunggu Lulusan API

## Endpoints

### Base URL: `/api/tabel2b4-masa-tunggu`

### CRUD Operations

#### 1. List Data
- **GET** `/api/tabel2b4-masa-tunggu`
- **Description**: Mendapatkan daftar data masa tunggu lulusan
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun_lulus` (optional): Filter berdasarkan tahun lulus
  - `order_by` (optional): Sorting (default: `id_tahun_lulus DESC, id_unit_prodi ASC`)
- **Response**: Array of objects dengan data masa tunggu

#### 2. Get by ID
- **GET** `/api/tabel2b4-masa-tunggu/:id`
- **Description**: Mendapatkan detail data berdasarkan ID
- **Response**: Object dengan detail data masa tunggu

#### 3. Create Data
- **POST** `/api/tabel2b4-masa-tunggu`
- **Description**: Membuat data masa tunggu lulusan baru
- **Body**:
  ```json
  {
    "id_unit_prodi": 4,
    "id_tahun_lulus": 2024,
    "jumlah_lulusan": 50,
    "jumlah_terlacak": 45,
    "rata_rata_waktu_tunggu_bulan": 3.5
  }
  ```
- **Response**: Object data yang baru dibuat

#### 4. Update Data
- **PUT** `/api/tabel2b4-masa-tunggu/:id`
- **Description**: Mengupdate data masa tunggu lulusan
- **Body**: Same as create (semua field optional)
- **Response**: Object data yang sudah diupdate

#### 5. Soft Delete
- **DELETE** `/api/tabel2b4-masa-tunggu/:id`
- **Description**: Soft delete data (menandai sebagai deleted)
- **Response**: `{ "ok": true, "softDeleted": true }`

#### 6. Restore Data
- **POST** `/api/tabel2b4-masa-tunggu/:id/restore`
- **Description**: Mengembalikan data yang sudah di-soft delete
- **Response**: `{ "ok": true, "restored": true }`

#### 7. Hard Delete
- **DELETE** `/api/tabel2b4-masa-tunggu/:id/hard-delete`
- **Description**: Menghapus data secara permanen (hanya untuk superadmin)
- **Response**: `{ "ok": true, "hardDeleted": true }`

### Summary & Statistics

#### 8. Summary Data
- **GET** `/api/tabel2b4-masa-tunggu/summary/data`
- **Description**: Mendapatkan ringkasan data untuk dashboard/statistik
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun_lulus` (optional): Filter berdasarkan tahun lulus
- **Response**: Array of summary objects dengan total per kategori

### Integration Functions

#### 9. Get Data for Tabel 2B5
- **GET** `/api/tabel2b4-masa-tunggu/for-tabel2b5/data`
- **Description**: Mendapatkan data untuk digunakan di tabel 2.B.5 (Kesesuaian Bidang Kerja)
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun_lulus` (optional): Filter berdasarkan tahun lulus
- **Response**: Array of objects dengan data yang bisa digunakan untuk tabel 2.B.5

### Export Functions

#### 10. Export Excel/CSV
- **GET** `/api/tabel2b4-masa-tunggu/export`
- **POST** `/api/tabel2b4-masa-tunggu/export`
- **Description**: Export data ke format Excel/CSV
- **Query Parameters**: Same as list endpoint

#### 11. Export Word Document
- **GET** `/api/tabel2b4-masa-tunggu/export-doc`
- **POST** `/api/tabel2b4-masa-tunggu/export-doc`
- **Description**: Export data ke format Word document

#### 12. Export PDF
- **GET** `/api/tabel2b4-masa-tunggu/export-pdf`
- **POST** `/api/tabel2b4-masa-tunggu/export-pdf`
- **Description**: Export data ke format PDF

## Authentication & Authorization

- Semua endpoint memerlukan authentication (`requireAuth`)
- Permission berdasarkan role:
  - **Superadmin** (waket1, waket2, tpm): Full access (CRUDH)
  - **Kemahasiswaan**: CRUD access untuk tabel 2.B.4 (tidak bisa hard delete)
  - **Role lain**: Sesuai konfigurasi di `roles.js`

## Database Schema

Tabel: `tabel_2b4_masa_tunggu`

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| id_unit_prodi | int | ID unit prodi (FK ke unit_kerja) |
| id_tahun_lulus | int | Tahun lulus (FK ke tahun_akademik) |
| jumlah_lulusan | int | Jumlah lulusan total |
| jumlah_terlacak | int | Jumlah lulusan yang berhasil dilacak |
| rata_rata_waktu_tunggu_bulan | float | Rata-rata waktu tunggu dalam bulan |
| deleted_at | datetime | Timestamp soft delete |
| deleted_by | int | User yang melakukan soft delete |

## Integration dengan Tabel 2.B.5

Tabel 2.B.4 ini berfungsi sebagai **data source** untuk tabel 2.B.5 (Kesesuaian Bidang Kerja Lulusan). Data dari tabel ini bisa digunakan untuk:

- Mengetahui jumlah lulusan yang terlacak untuk dijadikan dasar perhitungan di tabel 2.B.5
- Memvalidasi konsistensi data antara kedua tabel
- Menyediakan informasi tambahan tentang masa tunggu kerja lulusan

## Notes

- Data otomatis ter-filter berdasarkan unit prodi jika user login sebagai kemahasiswaan (khusus untuk role kemahasiswaan)
- Field `id_unit_prodi` dan `id_tahun_lulus` wajib diisi saat create
- Semua field jumlah default ke 0 jika tidak diisi
- Export memerlukan parameter tahun (`requireYear: true`)
- Data dari tabel ini bisa digunakan untuk mengisi tabel 2.B.5 melalui endpoint `/for-tabel2b5/data`

# Tabel 2.B.5 - Kesesuaian Bidang Kerja Lulusan API

## Endpoints

### Base URL: `/api/tabel2b5-kesesuaian-kerja`

### CRUD Operations

#### 1. List Data
- **GET** `/api/tabel2b5-kesesuaian-kerja`
- **Description**: Mendapatkan daftar data kesesuaian bidang kerja lulusan
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun_lulus` (optional): Filter berdasarkan tahun lulus
  - `order_by` (optional): Sorting (default: `id_tahun_lulus DESC, id_unit_prodi ASC`)
- **Response**: Array of objects dengan data kesesuaian kerja (termasuk data dari tabel 2.B.4)

#### 2. Get by ID
- **GET** `/api/tabel2b5-kesesuaian-kerja/:id`
- **Description**: Mendapatkan detail data berdasarkan ID
- **Response**: Object dengan detail data kesesuaian kerja (termasuk data dari tabel 2.B.4)

#### 3. Create Data
- **POST** `/api/tabel2b5-kesesuaian-kerja`
- **Description**: Membuat data kesesuaian bidang kerja lulusan baru
- **Body**:
  ```json
  {
    "id_unit_prodi": 4,
    "id_tahun_lulus": 2024,
    "jml_infokom": 25,
    "jml_non_infokom": 5,
    "jml_internasional": 3,
    "jml_nasional": 20,
    "jml_wirausaha": 7
  }
  ```
- **Response**: Object data yang baru dibuat (termasuk data dari tabel 2.B.4)

#### 4. Update Data
- **PUT** `/api/tabel2b5-kesesuaian-kerja/:id`
- **Description**: Mengupdate data kesesuaian bidang kerja lulusan
- **Body**: Same as create (semua field optional)
- **Response**: Object data yang sudah diupdate (termasuk data dari tabel 2.B.4)

#### 5. Soft Delete
- **DELETE** `/api/tabel2b5-kesesuaian-kerja/:id`
- **Description**: Soft delete data (menandai sebagai deleted)
- **Response**: `{ "ok": true, "softDeleted": true }`

#### 6. Restore Data
- **POST** `/api/tabel2b5-kesesuaian-kerja/:id/restore`
- **Description**: Mengembalikan data yang sudah di-soft delete
- **Response**: `{ "ok": true, "restored": true }`

#### 7. Hard Delete
- **DELETE** `/api/tabel2b5-kesesuaian-kerja/:id/hard-delete`
- **Description**: Menghapus data secara permanen (hanya untuk superadmin)
- **Response**: `{ "ok": true, "hardDeleted": true }`

### Summary & Statistics

#### 8. Summary Data
- **GET** `/api/tabel2b5-kesesuaian-kerja/summary/data`
- **Description**: Mendapatkan ringkasan data untuk dashboard/statistik
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun_lulus` (optional): Filter berdasarkan tahun lulus
- **Response**: Array of summary objects dengan total per kategori

#### 9. Validasi Jumlah
- **GET** `/api/tabel2b5-kesesuaian-kerja/validate/jumlah`
- **Description**: Validasi apakah total jumlah tidak melebihi jumlah terlacak di tabel 2.B.4
- **Query Parameters**:
  - `id_unit_prodi` (required): ID unit prodi
  - `id_tahun_lulus` (required): Tahun lulus
  - `jml_infokom` (optional): Jumlah bidang Infokom
  - `jml_non_infokom` (optional): Jumlah bidang Non-Infokom
  - `jml_internasional` (optional): Jumlah lingkup Internasional
  - `jml_nasional` (optional): Jumlah lingkup Nasional
  - `jml_wirausaha` (optional): Jumlah wirausaha
- **Response**: Object dengan status validasi
- **Example Response**:
  ```json
  {
    "jumlah_terlacak": 45,
    "total_input": 30,
    "valid": true,
    "message": "Valid! Total 30 tidak melebihi jumlah terlacak 45"
  }
  ```

### Export Functions

#### 10. Export Excel/CSV
- **GET** `/api/tabel2b5-kesesuaian-kerja/export`
- **POST** `/api/tabel2b5-kesesuaian-kerja/export`
- **Description**: Export data ke format Excel/CSV
- **Query Parameters**: Same as list endpoint

#### 11. Export Word Document
- **GET** `/api/tabel2b5-kesesuaian-kerja/export-doc`
- **POST** `/api/tabel2b5-kesesuaian-kerja/export-doc`
- **Description**: Export data ke format Word document

#### 12. Export PDF
- **GET** `/api/tabel2b5-kesesuaian-kerja/export-pdf`
- **POST** `/api/tabel2b5-kesesuaian-kerja/export-pdf`
- **Description**: Export data ke format PDF

## Authentication & Authorization

- Semua endpoint memerlukan authentication (`requireAuth`)
- Permission berdasarkan role:
  - **Superadmin** (waket1, waket2, tpm): Full access (CRUDH)
  - **Kemahasiswaan**: CRUD access untuk tabel 2.B.5 (tidak bisa hard delete)
  - **Role lain**: Sesuai konfigurasi di `roles.js`

## Integration dengan Tabel 2.B.4

Tabel 2.B.5 sekarang **terintegrasi** dengan tabel 2.B.4 (Masa Tunggu Lulusan). Data dari tabel 2.B.4 otomatis diambil dan ditampilkan di response tabel 2.B.5:

### Data yang Diambil dari Tabel 2.B.4:
- `jumlah_lulusan` - Jumlah lulusan total
- `jumlah_terlacak` - Jumlah lulusan yang berhasil dilacak  
- `rata_rata_waktu_tunggu_bulan` - Rata-rata waktu tunggu dalam bulan

### Cara Kerja:
- Data diambil berdasarkan `id_unit_prodi` dan `id_tahun_lulus` yang sama
- Jika tidak ada data di tabel 2.B.4, field tersebut akan bernilai `NULL`
- Data ditampilkan di semua endpoint (list, detail, create, update, summary)

## Validasi Data

### **Validasi Jumlah Terlacak**
Tabel 2.B.5 memiliki validasi ketat untuk memastikan konsistensi data dengan tabel 2.B.4:

#### **Aturan Validasi:**
- Total jumlah di tabel 2.B.5 (`jml_infokom` + `jml_non_infokom` + `jml_internasional` + `jml_nasional` + `jml_wirausaha`) **TIDAK BOLEH** melebihi `jumlah_terlacak` di tabel 2.B.4
- Validasi dilakukan saat **create** dan **update** data
- Jika validasi gagal, request akan ditolak dengan error message yang jelas

#### **Contoh Validasi:**
- Tabel 2.B.4: `jumlah_terlacak = 45`
- Tabel 2.B.5: `jml_infokom=25 + jml_non_infokom=5 + jml_internasional=3 + jml_nasional=20 + jml_wirausaha=7 = 60`
- **Hasil**: ❌ **GAGAL** - Total 60 > 45 (jumlah terlacak)

#### **Error Response:**
```json
{
  "error": "Total jumlah (60) tidak boleh lebih dari jumlah terlacak di tabel 2.B.4 (45)."
}
```

#### **Endpoint Validasi:**
Gunakan endpoint `/validate/jumlah` untuk mengecek validasi sebelum submit data.

## Database Schema

Tabel: `tabel_2b5_kesesuaian_kerja`

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| id_unit_prodi | int | ID unit prodi (FK ke unit_kerja) |
| id_tahun_lulus | int | Tahun lulus (FK ke tahun_akademik) |
| jml_infokom | int | Jumlah lulusan yang bekerja di bidang Infokom |
| jml_non_infokom | int | Jumlah lulusan yang bekerja di bidang Non-Infokom |
| jml_internasional | int | Jumlah lulusan yang bekerja di lingkup Multinasional/Internasional |
| jml_nasional | int | Jumlah lulusan yang bekerja di lingkup Nasional |
| jml_wirausaha | int | Jumlah lulusan yang berwirausaha |
| deleted_at | datetime | Timestamp soft delete |
| deleted_by | int | User yang melakukan soft delete |

### Data Tambahan dari Tabel 2.B.4:
| Field | Type | Description |
|-------|------|-------------|
| jumlah_lulusan | int | Jumlah lulusan total (dari tabel 2.B.4) |
| jumlah_terlacak | int | Jumlah lulusan yang terlacak (dari tabel 2.B.4) |
| rata_rata_waktu_tunggu_bulan | float | Rata-rata waktu tunggu dalam bulan (dari tabel 2.B.4) |

## Notes

- Data otomatis ter-filter berdasarkan unit prodi jika user login sebagai kemahasiswaan (khusus untuk role kemahasiswaan)
- Field `id_unit_prodi` dan `id_tahun_lulus` wajib diisi saat create
- Semua field jumlah default ke 0 jika tidak diisi
- Export memerlukan parameter tahun (`requireYear: true`)

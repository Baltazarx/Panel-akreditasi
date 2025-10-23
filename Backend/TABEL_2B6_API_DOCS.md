# Tabel 2.B.6 - Kepuasan Pengguna Lulusan API

## Endpoints

### Base URL: `/api/tabel2b6-kepuasan-pengguna`

### CRUD Operations

#### 1. List Data
- **GET** `/api/tabel2b6-kepuasan-pengguna`
- **Description**: Mendapatkan daftar data kepuasan pengguna lulusan dengan data statistik tambahan
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun` (optional): Filter berdasarkan tahun akademik
  - `jenis_kemampuan` (optional): Filter berdasarkan jenis kemampuan
  - `order_by` (optional): Sorting (default: `id_tahun DESC, id_unit_prodi ASC`)
- **Response**: Object dengan `data` (array) dan `statistik` (object/array)
  - Jika ada filter `id_unit_prodi` & `id_tahun`: `statistik` berupa object tunggal
  - Jika tidak ada filter: `statistik` berupa array untuk semua kombinasi unit prodi & tahun

#### 2. Get by ID
- **GET** `/api/tabel2b6-kepuasan-pengguna/:id`
- **Description**: Mendapatkan detail data berdasarkan ID dengan data statistik tambahan
- **Response**: Object dengan detail data kepuasan pengguna + statistik

#### 3. Create Data
- **POST** `/api/tabel2b6-kepuasan-pengguna`
- **Description**: Membuat data kepuasan pengguna lulusan baru
- **Body**:
  ```json
  {
    "id_unit_prodi": 4,
    "id_tahun": 2024,
    "jenis_kemampuan": "Kerjasama Tim",
    "persen_sangat_baik": 40.5,
    "persen_baik": 35.2,
    "persen_cukup": 20.1,
    "persen_kurang": 4.2
  }
  ```
- **Response**: Object data yang baru dibuat

#### 4. Update Data
- **PUT** `/api/tabel2b6-kepuasan-pengguna/:id`
- **Description**: Mengupdate data kepuasan pengguna lulusan
- **Body**: Same as create (semua field optional)
- **Response**: Object data yang sudah diupdate

#### 5. Soft Delete
- **DELETE** `/api/tabel2b6-kepuasan-pengguna/:id`
- **Description**: Soft delete data (menandai sebagai deleted)
- **Response**: `{ "ok": true, "softDeleted": true }`

#### 6. Restore Data
- **POST** `/api/tabel2b6-kepuasan-pengguna/:id/restore`
- **Description**: Mengembalikan data yang sudah di-soft delete
- **Response**: `{ "ok": true, "restored": true }`

#### 7. Hard Delete
- **DELETE** `/api/tabel2b6-kepuasan-pengguna/:id/hard-delete`
- **Description**: Menghapus data secara permanen (hanya untuk superadmin)
- **Response**: `{ "ok": true, "hardDeleted": true }`

### Summary & Statistics

#### 8. Summary Data
- **GET** `/api/tabel2b6-kepuasan-pengguna/summary/data`
- **Description**: Mendapatkan ringkasan data untuk dashboard/statistik
- **Query Parameters**:
  - `id_unit_prodi` (optional): Filter berdasarkan unit prodi
  - `id_tahun` (optional): Filter berdasarkan tahun akademik
- **Response**: Array of summary objects dengan rata-rata per kategori

#### 9. Get Jenis Kemampuan Tersedia
- **GET** `/api/tabel2b6-kepuasan-pengguna/available/jenis-kemampuan`
- **Description**: Mendapatkan daftar jenis kemampuan yang tersedia
- **Response**: Array of strings dengan daftar jenis kemampuan
- **Example Response**:
  ```json
  [
    "Kerjasama Tim",
    "Keahlian di Bidang Prodi",
    "Kemampuan Berbahasa Asing (Inggris)",
    "Kemampuan Berkomunikasi",
    "Pengembangan Diri",
    "Kepemimpinan",
    "Etos Kerja"
  ]
  ```

#### 10. Get Data Statistik Tambahan
- **GET** `/api/tabel2b6-kepuasan-pengguna/statistik/data`
- **Description**: Mendapatkan data statistik tambahan (alumni, responden, mahasiswa aktif)
- **Query Parameters**:
  - `id_unit_prodi` (required): ID unit prodi
  - `id_tahun` (required): Tahun akademik
- **Response**: Object dengan data statistik
- **Example Response**:
  ```json
  {
    "jumlah_alumni_3_tahun": 150,
    "jumlah_mahasiswa_aktif_ts": 120,
    "jumlah_responden": 7,
    "tahun_akademik": 2024,
    "unit_prodi": 4
  }
  ```

### Export Functions

#### 11. Export Excel/CSV
- **GET** `/api/tabel2b6-kepuasan-pengguna/export`
- **POST** `/api/tabel2b6-kepuasan-pengguna/export`
- **Description**: Export data ke format Excel/CSV
- **Query Parameters**: Same as list endpoint

#### 12. Export Word Document
- **GET** `/api/tabel2b6-kepuasan-pengguna/export-doc`
- **POST** `/api/tabel2b6-kepuasan-pengguna/export-doc`
- **Description**: Export data ke format Word document

#### 13. Export PDF
- **GET** `/api/tabel2b6-kepuasan-pengguna/export-pdf`
- **POST** `/api/tabel2b6-kepuasan-pengguna/export-pdf`
- **Description**: Export data ke format PDF

## Authentication & Authorization

- Semua endpoint memerlukan authentication (`requireAuth`)
- Permission berdasarkan role:
  - **Superadmin** (waket1, waket2, tpm): Full access (CRUDH)
  - **Kemahasiswaan**: CRUD access untuk tabel 2.B.6 (tidak bisa hard delete)
  - **Role lain**: Sesuai konfigurasi di `roles.js`

## Data Statistik Tambahan

Tabel 2.B.6 menyediakan endpoint khusus untuk mendapatkan data statistik tambahan yang diperlukan untuk melengkapi informasi kepuasan pengguna:

### **Sumber Data Statistik:**

#### 1. **Jumlah Alumni/Lulusan dalam 3 Tahun Terakhir**
- **Sumber**: `tabel_2a3_kondisi_mahasiswa` (field `jml_lulus`)
- **Perhitungan**: SUM dari 3 tahun terakhir (tahun TS-2 sampai TS)
- **Contoh**: Jika tahun TS = 2024, maka dihitung dari tahun 2022, 2023, 2024

#### 2. **Jumlah Mahasiswa Aktif pada Tahun TS**
- **Sumber**: `tabel_2a1_mahasiswa_baru_aktif` (field `jumlah_total` dengan `jenis = 'aktif'`)
- **Perhitungan**: SUM dari mahasiswa aktif pada tahun tertentu
- **Filter**: Hanya mahasiswa dengan jenis 'aktif'

#### 3. **Jumlah Responden**
- **Sumber**: `tabel_2b6_kepuasan_pengguna` (field `jenis_kemampuan`)
- **Perhitungan**: COUNT DISTINCT dari jenis kemampuan yang sudah diisi
- **Logika**: Setiap jenis kemampuan yang sudah diisi = 1 responden

### **Endpoint Statistik:**
```
GET /api/tabel2b6-kepuasan-pengguna/statistik/data?id_unit_prodi=4&id_tahun=2024
```

### **Response Format:**
```json
{
  "jumlah_alumni_3_tahun": 150,
  "jumlah_mahasiswa_aktif_ts": 120,
  "jumlah_responden": 7,
  "tahun_akademik": 2024,
  "unit_prodi": 4
}
```

## Validasi Data

### **Validasi Persentase**
Tabel 2.B.6 memiliki validasi untuk memastikan konsistensi data persentase:

#### **Aturan Validasi:**
- Total persentase (`persen_sangat_baik` + `persen_baik` + `persen_cukup` + `persen_kurang`) **TIDAK BOLEH** lebih dari 100%
- Validasi dilakukan saat **create** dan **update** data
- Jika validasi gagal, request akan ditolak dengan error message yang jelas

#### **Contoh Validasi:**
- Input: `persen_sangat_baik=40.5 + persen_baik=35.2 + persen_cukup=20.1 + persen_kurang=4.2 = 100.0`
- **Hasil**: ✅ **VALID** - Total 100.0% = 100%

#### **Error Response:**
```json
{
  "error": "Total persentase (105.5%) tidak boleh lebih dari 100%."
}
```

## Database Schema

Tabel: `tabel_2b6_kepuasan_pengguna`

| Field | Type | Description |
|-------|------|-------------|
| id | int | Primary key |
| id_unit_prodi | int | ID unit prodi (FK ke unit_kerja) |
| id_tahun | int | Tahun akademik (FK ke tahun_akademik) |
| jenis_kemampuan | varchar(255) | Jenis kemampuan yang dinilai |
| persen_sangat_baik | float | Persentase kepuasan "Sangat Baik" |
| persen_baik | float | Persentase kepuasan "Baik" |
| persen_cukup | float | Persentase kepuasan "Cukup" |
| persen_kurang | float | Persentase kepuasan "Kurang" |
| deleted_at | datetime | Timestamp soft delete |
| deleted_by | int | User yang melakukan soft delete |

## Jenis Kemampuan yang Tersedia

Sistem menyediakan 7 jenis kemampuan standar yang dapat dinilai:

1. **Kerjasama Tim** - Kemampuan bekerja dalam tim
2. **Keahlian di Bidang Prodi** - Keahlian sesuai bidang program studi
3. **Kemampuan Berbahasa Asing (Inggris)** - Kemampuan berbahasa Inggris
4. **Kemampuan Berkomunikasi** - Kemampuan komunikasi verbal dan non-verbal
5. **Pengembangan Diri** - Kemampuan pengembangan diri dan pembelajaran
6. **Kepemimpinan** - Kemampuan memimpin dan mengelola
7. **Etos Kerja** - Semangat dan disiplin kerja

## Notes

- Data otomatis ter-filter berdasarkan unit prodi jika user login sebagai kemahasiswaan (khusus untuk role kemahasiswaan)
- Field `id_unit_prodi`, `id_tahun`, dan `jenis_kemampuan` wajib diisi saat create
- Semua field persentase default ke 0 jika tidak diisi
- Total persentase tidak boleh melebihi 100%
- Export memerlukan parameter tahun (`requireYear: true`)
- Setiap kombinasi `id_unit_prodi`, `id_tahun`, dan `jenis_kemampuan` harus unik

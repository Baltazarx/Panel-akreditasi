# Tabel 3.A.3 - Contoh Response API

## Summary Endpoints

### 1. List Summary (PIVOT) - Success Response

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

**Response (200 OK - No Data):**
```json
{
  "id_unit": null,
  "nama_unit_prodi": null,
  "jumlah_ts_2": 0,
  "jumlah_ts_1": 0,
  "jumlah_ts": 0,
  "link_bukti_ts_2": null,
  "link_bukti_ts_1": null,
  "link_bukti_ts": null
}
```

**Response (400 Bad Request - Missing Parameter):**
```json
{
  "error": "Query parameter id_tahun_ts wajib ada.",
  "details": "Query parameter id_tahun_ts wajib ada."
}
```

### 2. Get Summary by ID - Success Response

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/summary/1
```

**Response (200 OK):**
```json
{
  "id": 1,
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://drive.google.com/file/d/abc123-bukti-2024.pdf",
  "nama_unit_prodi": "LPPM",
  "created_at": "2025-11-05T10:00:00.000Z",
  "updated_at": "2025-11-05T10:00:00.000Z",
  "deleted_at": null,
  "deleted_by": null
}
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan"
}
```

### 3. Save Summary (Create) - Success Response

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/summary
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://drive.google.com/file/d/abc123-bukti-2024.pdf"
}
```

**Response (201 Created):**
```json
{
  "message": "Data summary DTPR berhasil dibuat",
  "id": 1
}
```

**Response (400 Bad Request - Missing Field):**
```json
{
  "error": "Unit dan Tahun wajib diisi."
}
```

### 4. Save Summary (Update) - Success Response

**Request:**
```http
PUT /api/tabel-3a3-pengembangan-dtpr/summary/1
Content-Type: application/json

{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 18,
  "link_bukti": "https://drive.google.com/file/d/abc123-bukti-2024-updated.pdf"
}
```

**Response (200 OK):**
```json
{
  "message": "Data summary DTPR berhasil diperbarui",
  "id": 1
}
```

**Note**: Endpoint `POST /summary` juga dapat melakukan update jika sudah ada data untuk `id_unit` dan `id_tahun` yang sama.

### 5. Soft Delete Summary - Success Response

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

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan."
}
```

## Detail Endpoints

### 6. List Detail (PIVOT) - Success Response

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/detail?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response (200 OK):**
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
    "link_bukti_ts_2": "https://drive.google.com/file/d/abc123-tugas-belajar-2022.pdf",
    "link_bukti_ts_1": null,
    "link_bukti_ts": "https://drive.google.com/file/d/def456-tugas-belajar-2024.pdf",
    "link_bukti": "https://drive.google.com/file/d/def456-tugas-belajar-2024.pdf"
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
    "link_bukti_ts_1": "https://drive.google.com/file/d/ghi789-pelatihan-2023.pdf",
    "link_bukti_ts": null,
    "link_bukti": "https://drive.google.com/file/d/ghi789-pelatihan-2023.pdf"
  },
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "id_dosen": 3,
    "nama_dtpr": "Prof. Dr. Eka Pratama",
    "jenis_pengembangan": "Tugas Belajar",
    "jumlah_ts_2": 0,
    "jumlah_ts_1": 1,
    "jumlah_ts": 0,
    "link_bukti_ts_2": null,
    "link_bukti_ts_1": "https://drive.google.com/file/d/jkl012-tugas-belajar-2023.pdf",
    "link_bukti_ts": null,
    "link_bukti": "https://drive.google.com/file/d/jkl012-tugas-belajar-2023.pdf"
  }
]
```

**Response (200 OK - Empty Array):**
```json
[]
```

**Response (400 Bad Request - Missing Parameter):**
```json
{
  "error": "Query parameter id_tahun_ts_1 wajib ada.",
  "details": "Query parameter id_tahun_ts_1 wajib ada."
}
```

### 7. Get Detail by ID - Success Response

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/detail/1
```

**Response (200 OK):**
```json
{
  "id_pengembangan": 1,
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar-2024.pdf",
  "nama_unit_prodi": "LPPM",
  "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
  "created_at": "2025-11-05T10:00:00.000Z",
  "updated_at": "2025-11-05T10:00:00.000Z",
  "deleted_at": null,
  "deleted_by": null
}
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan"
}
```

### 8. Create Detail - Success Response

**Request:**
```http
POST /api/tabel-3a3-pengembangan-dtpr/detail
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar-2024.pdf"
}
```

**Response (201 Created):**
```json
{
  "message": "Data pengembangan DTPR berhasil dibuat",
  "id": 1
}
```

**Response (400 Bad Request - Missing Field):**
```json
{
  "error": "Unit, Dosen, Jenis Pengembangan, dan Tahun wajib diisi."
}
```

### 9. Update Detail - Success Response

**Request:**
```http
PUT /api/tabel-3a3-pengembangan-dtpr/detail/1
Content-Type: application/json

{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://drive.google.com/file/d/abc123-tugas-belajar-2024-updated.pdf"
}
```

**Response (200 OK):**
```json
{
  "message": "Data pengembangan DTPR berhasil diperbarui"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan."
}
```

### 10. Soft Delete Detail - Success Response

**Request:**
```http
DELETE /api/tabel-3a3-pengembangan-dtpr/detail/1
```

**Response (200 OK):**
```json
{
  "message": "Data pengembangan berhasil dihapus (soft delete)"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Data tidak ditemukan."
}
```

## Export Endpoint

### 11. Export Excel - Success Response

**Request:**
```http
GET /api/tabel-3a3-pengembangan-dtpr/export?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022&id_unit=12
```

**Response:**
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename=Tabel_3A3_Pengembangan_DTPR.xlsx`
- **Body**: Excel file binary

**Excel File Structure:**
```
Row 1: [Merged Cell A1:E1] "Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian"
Row 2: [A2:A3] "Tahun Akademik" | [B2:D2] "Jumlah Dosen DTPR" | [E2:E3] "Link Bukti"
Row 3: [B3] "TS-2" | [C3] "TS-1" | [D3] "TS"
Row 4: [B4] "10" | [C4] "12" | [D4] "15" | [E4] "https://drive.google.com/..."
Row 5: [A5] "Jenis Pengembangan DTPR" | [B5] "Nama DTPR" | [C5:E5] "Jumlah" | [F5] "Link Bukti"
Row 6: [C6] "TS-2" | [D6] "TS-1" | [E6] "TS"
Row 7+: [A] Jenis | [B] Nama DTPR | [C] Jumlah TS-2 | [D] Jumlah TS-1 | [E] Jumlah TS | [F] Link Bukti
```

**Response (400 Bad Request - Missing Parameter):**
```json
{
  "error": "Gagal mengekspor data",
  "details": "Query parameter id_tahun_ts wajib ada."
}
```

## Error Response Examples

### Generic Error (500 Internal Server Error)
```json
{
  "error": "Gagal mengambil data summary DTPR",
  "details": "SQL error message or detailed error"
}
```

### Database Error (500 Internal Server Error)
```json
{
  "error": "Gagal menyimpan data summary DTPR",
  "details": "Duplicate entry '12-2024' for key 'unik_unit_tahun'"
}
```

### Validation Error (400 Bad Request)
```json
{
  "error": "Unit dan Tahun wajib diisi."
}
```

### Not Found Error (404 Not Found)
```json
{
  "error": "Data tidak ditemukan"
}
```

## Contoh Data Lengkap

### Scenario: Data untuk Unit LPPM (id_unit=12)

#### Summary Data:
- **TS-2 (2022)**: 10 DTPR
- **TS-1 (2023)**: 12 DTPR  
- **TS (2024)**: 15 DTPR

#### Detail Data:

**Dosen 1 (Dr. Budi Santoso, M.Kom.):**
- Tugas Belajar: TS-2 (1x), TS-1 (0x), TS (1x)
- Pelatihan: TS-2 (0x), TS-1 (1x), TS (0x)

**Dosen 3 (Prof. Dr. Eka Pratama):**
- Tugas Belajar: TS-2 (0x), TS-1 (1x), TS (0x)
- Seminar: TS-2 (0x), TS-1 (0x), TS (2x)

**Response untuk List Detail akan menghasilkan:**
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
    "link_bukti": "https://drive.google.com/..."
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
    "link_bukti": "https://drive.google.com/..."
  },
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "id_dosen": 3,
    "nama_dtpr": "Prof. Dr. Eka Pratama",
    "jenis_pengembangan": "Tugas Belajar",
    "jumlah_ts_2": 0,
    "jumlah_ts_1": 1,
    "jumlah_ts": 0,
    "link_bukti": "https://drive.google.com/..."
  },
  {
    "id_unit": 12,
    "nama_unit_prodi": "LPPM",
    "id_dosen": 3,
    "nama_dtpr": "Prof. Dr. Eka Pratama",
    "jenis_pengembangan": "Seminar",
    "jumlah_ts_2": 0,
    "jumlah_ts_1": 0,
    "jumlah_ts": 2,
    "link_bukti": "https://drive.google.com/..."
  }
]
```

## Notes

- **PIVOT Logic**: Data di-group berdasarkan kombinasi `id_unit`, `id_dosen`, dan `jenis_pengembangan`. Jumlah (`jumlah_ts_2`, `jumlah_ts_1`, `jumlah_ts`) adalah COUNT dari pengembangan per tahun.
- **Link Bukti**: Field `link_bukti` dalam response detail adalah hasil dari `COALESCE(link_bukti_ts, link_bukti_ts_1, link_bukti_ts_2)`, memberikan prioritas pada tahun TS.
- **Empty Response**: Jika tidak ada data, summary akan mengembalikan struktur dengan nilai default (0 untuk jumlah, null untuk link), sedangkan detail akan mengembalikan array kosong `[]`.
- **Filter Tahun**: Hanya data yang memiliki `id_tahun` dalam rentang TS-2 sampai TS yang ditampilkan. Data dengan tahun di luar rentang ini tidak akan muncul.


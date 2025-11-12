# Tabel 6 - Kesesuaian Visi, Misi Response Examples

Dokumentasi ini berisi contoh response untuk setiap endpoint pada Tabel 6 Kesesuaian Visi, Misi API.

## 1. List Data (GET /api/tabel-6-kesesuaian-visi-misi)

### Success Response (200)

```json
[
  {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi dan komunikasi, serta menghasilkan lulusan yang berkarakter, kompeten, dan siap bersaing di era digital",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi dengan fokus pada pengembangan software dan sistem informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan masyarakat\n2. Melakukan penelitian yang bermanfaat untuk pengembangan ilmu pengetahuan dan teknologi\n3. Melakukan pengabdian kepada masyarakat melalui penerapan ilmu pengetahuan dan teknologi",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts-stikom-2024.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": "2025-11-12T10:00:00.000Z",
    "updated_by": 3,
    "deleted_at": null,
    "deleted_by": null
  },
  {
    "id": 2,
    "id_unit_prodi": 5,
    "nama_prodi": "Prodi MI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi dan komunikasi, serta menghasilkan lulusan yang berkarakter, kompeten, dan siap bersaing di era digital",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang manajemen sistem informasi dengan fokus pada analisis bisnis dan pengembangan sistem",
    "misi_pt": "1. Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan masyarakat\n2. Melakukan penelitian yang bermanfaat untuk pengembangan ilmu pengetahuan dan teknologi\n3. Melakukan pengabdian kepada masyarakat melalui penerapan ilmu pengetahuan dan teknologi",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
    "link_bukti": "https://drive.google.com/file/d/xyz789/vmts-stikom-2024.pdf",
    "created_at": "2025-11-12T11:00:00.000Z",
    "created_by": 7,
    "updated_at": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null
  }
]
```

### Empty Response (200)

```json
[]
```

### Error Response (500)

```json
{
  "error": "Gagal mengambil daftar Kesesuaian Visi Misi",
  "details": "Error message dari database"
}
```

---

## 2. Get by ID (GET /api/tabel-6-kesesuaian-visi-misi/:id)

### Success Response (200)

```json
{
  "id": 1,
  "id_unit_prodi": 4,
  "nama_prodi": "Prodi TI",
  "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi dan komunikasi, serta menghasilkan lulusan yang berkarakter, kompeten, dan siap bersaing di era digital",
  "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
  "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi dengan fokus pada pengembangan software dan sistem informasi",
  "misi_pt": "1. Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan masyarakat\n2. Melakukan penelitian yang bermanfaat untuk pengembangan ilmu pengetahuan dan teknologi\n3. Melakukan pengabdian kepada masyarakat melalui penerapan ilmu pengetahuan dan teknologi",
  "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
  "link_bukti": "https://drive.google.com/file/d/abc123/vmts-stikom-2024.pdf",
  "created_at": "2025-11-12T10:00:00.000Z",
  "created_by": 3,
  "updated_at": "2025-11-12T10:00:00.000Z",
  "updated_by": 3,
  "deleted_at": null,
  "deleted_by": null
}
```

### Error Response (404)

```json
{
  "error": "Data Kesesuaian Visi Misi tidak ditemukan"
}
```

---

## 3. Get by Prodi (GET /api/tabel-6-kesesuaian-visi-misi/prodi/:id_unit_prodi)

### Success Response (200)

```json
{
  "id": 1,
  "id_unit_prodi": 4,
  "nama_prodi": "Prodi TI",
  "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi dan komunikasi, serta menghasilkan lulusan yang berkarakter, kompeten, dan siap bersaing di era digital",
  "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
  "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi dengan fokus pada pengembangan software dan sistem informasi",
  "misi_pt": "1. Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan masyarakat\n2. Melakukan penelitian yang bermanfaat untuk pengembangan ilmu pengetahuan dan teknologi\n3. Melakukan pengabdian kepada masyarakat melalui penerapan ilmu pengetahuan dan teknologi",
  "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
  "link_bukti": "https://drive.google.com/file/d/abc123/vmts-stikom-2024.pdf",
  "created_at": "2025-11-12T10:00:00.000Z",
  "created_by": 3,
  "updated_at": "2025-11-12T10:00:00.000Z",
  "updated_by": 3,
  "deleted_at": null,
  "deleted_by": null
}
```

### Error Response (404)

```json
{
  "error": "Data Kesesuaian Visi Misi untuk prodi ini tidak ditemukan"
}
```

---

## 4. Create (POST /api/tabel-6-kesesuaian-visi-misi)

### Success Response (201)

```json
{
  "message": "Data Kesesuaian Visi Misi berhasil dibuat",
  "id": 1,
  "data": {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi dan komunikasi, serta menghasilkan lulusan yang berkarakter, kompeten, dan siap bersaing di era digital",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi dengan fokus pada pengembangan software dan sistem informasi",
    "misi_pt": "1. Menyelenggarakan pendidikan tinggi yang berkualitas dan relevan dengan kebutuhan masyarakat\n2. Melakukan penelitian yang bermanfaat untuk pengembangan ilmu pengetahuan dan teknologi\n3. Melakukan pengabdian kepada masyarakat melalui penerapan ilmu pengetahuan dan teknologi",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts-stikom-2024.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null
  }
}
```

### Error Response (400) - Field Wajib Kosong

```json
{
  "error": "Input tidak lengkap. (id_unit_prodi) wajib diisi."
}
```

### Error Response (400) - Duplicate Entry

```json
{
  "error": "Data Kesesuaian Visi Misi untuk prodi ini sudah ada. Gunakan UPDATE untuk memperbarui data."
}
```

### Error Response (500)

```json
{
  "error": "Gagal membuat data Kesesuaian Visi Misi",
  "details": "Error message dari database"
}
```

---

## 5. Update (PUT /api/tabel-6-kesesuaian-visi-misi/:id)

### Success Response (200)

```json
{
  "message": "Data Kesesuaian Visi Misi berhasil diperbarui",
  "data": {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Visi PT yang diperbarui - Menjadi perguruan tinggi yang unggul dan terdepan",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi dan komunikasi di wilayah Jawa Timur",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten di bidang teknologi informasi dengan fokus pada pengembangan software dan sistem informasi",
    "misi_pt": "Misi PT yang diperbarui - 1. Pendidikan berkualitas\n2. Penelitian bermanfaat\n3. Pengabdian masyarakat",
    "misi_upps": "1. Mengembangkan kurikulum yang relevan dengan perkembangan teknologi terkini\n2. Meningkatkan kualitas dan kuantitas dosen melalui program pengembangan SDM\n3. Membangun kerjasama dengan industri dan instansi terkait\n4. Menciptakan lingkungan akademik yang kondusif untuk pembelajaran",
    "link_bukti": "https://drive.google.com/file/d/xyz789/vmts-stikom-2024-updated.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": "2025-11-12T12:00:00.000Z",
    "updated_by": 3,
    "deleted_at": null,
    "deleted_by": null
  }
}
```

### Success Response (200) - Restore

```json
{
  "message": "Data Kesesuaian Visi Misi berhasil dipulihkan",
  "data": {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_prodi": "Prodi TI",
    "visi_pt": "Menjadi perguruan tinggi yang unggul dalam bidang teknologi informasi",
    "visi_upps": "Menjadi unit yang terdepan dalam pengembangan teknologi informasi",
    "visi_keilmuan_ps": "Menjadi program studi yang menghasilkan lulusan kompeten",
    "misi_pt": "1. Menyelenggarakan pendidikan berkualitas\n2. Melakukan penelitian\n3. Melakukan pengabdian",
    "misi_upps": "1. Mengembangkan kurikulum\n2. Meningkatkan kualitas dosen\n3. Membangun kerjasama",
    "link_bukti": "https://drive.google.com/file/d/abc123/vmts.pdf",
    "created_at": "2025-11-12T10:00:00.000Z",
    "created_by": 3,
    "updated_at": "2025-11-12T13:00:00.000Z",
    "updated_by": 3,
    "deleted_at": null,
    "deleted_by": null
  }
}
```

### Error Response (404)

```json
{
  "error": "Data Kesesuaian Visi Misi tidak ditemukan atau tidak ada perubahan."
}
```

### Error Response (400) - Duplicate Entry

```json
{
  "error": "Data Kesesuaian Visi Misi untuk prodi ini sudah ada."
}
```

---

## 6. Soft Delete (DELETE /api/tabel-6-kesesuaian-visi-misi/:id)

### Success Response (200)

```json
{
  "message": "Data Kesesuaian Visi Misi berhasil dihapus (soft delete)"
}
```

### Error Response (404)

```json
{
  "error": "Data tidak ditemukan."
}
```

---

## 7. Restore (POST /api/tabel-6-kesesuaian-visi-misi/:id/restore)

### Success Response (200)

```json
{
  "ok": true,
  "restored": true,
  "message": "Data Kesesuaian Visi Misi berhasil dipulihkan"
}
```

### Error Response (404)

```json
{
  "error": "Tidak ada data yang dapat dipulihkan. Data mungkin sudah dipulihkan atau tidak dihapus."
}
```

### Error Response (400)

```json
{
  "error": "ID tidak valid."
}
```

---

## 8. Hard Delete (DELETE /api/tabel-6-kesesuaian-visi-misi/:id/hard)

### Success Response (200)

```json
{
  "message": "Data Kesesuaian Visi Misi berhasil dihapus secara permanen (hard delete)."
}
```

### Error Response (404)

```json
{
  "error": "Data tidak ditemukan."
}
```

---

## 9. Export Excel (GET /api/tabel-6-kesesuaian-visi-misi/export)

### Success Response

Response berupa file Excel dengan:
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename=Tabel_6_Kesesuaian_Visi_Misi.xlsx`
- **File Content**: Excel file dengan format:
  - Header row dengan styling (bold, center, gray background)
  - Data rows dengan nomor urut
  - Kolom: Program Studi, Visi PT, Visi UPPS, Visi Keilmuan PS, Misi PT, Misi UPPS, Link Bukti

### Error Response (500)

```json
{
  "error": "Gagal mengekspor data Kesesuaian Visi Misi",
  "details": "Error message dari database"
}
```

---

## Catatan Penting

1. **Foreign Key Relations**: 
   - `id_unit_prodi` merujuk ke `unit_kerja.id_unit`
   - `nama_prodi` diambil dari `unit_kerja.nama_unit` melalui LEFT JOIN
   - `created_by` dan `updated_by` merujuk ke `users.id_user`

2. **Unique Constraint**: 
   - Setiap `id_unit_prodi` hanya dapat memiliki satu record
   - Jika mencoba membuat data baru untuk prodi yang sudah ada, akan mendapat error 400

3. **Soft Delete**: 
   - Data yang dihapus menggunakan DELETE endpoint akan memiliki `deleted_at` yang diisi
   - Data dengan `deleted_at IS NOT NULL` tidak akan muncul di list default (kecuali menggunakan `include_deleted=true`)

4. **Text Fields**: 
   - Field `visi_pt`, `visi_upps`, `visi_keilmuan_ps`, `misi_pt`, `misi_upps` menggunakan tipe TEXT, sehingga dapat menampung teks panjang
   - Teks dapat menggunakan newline character (`\n`) untuk baris baru

5. **Link Bukti**: 
   - Dapat berisi link ke dokumen VMTS, rencana pengembangan strategis, atau dokumen pengakuan/apresiasi
   - Disarankan menggunakan link yang dapat diakses publik atau link Google Drive dengan sharing yang tepat


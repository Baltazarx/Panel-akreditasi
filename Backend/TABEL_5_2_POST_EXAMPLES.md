# Contoh POST Request untuk Tabel 5.2 Sarana dan Prasarana Pendidikan

## Endpoint
```
POST /api/tabel-5-2-sarpras-pendidikan
```

## Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN
```

---

## Contoh 1: Ruang Kelas (Minimal - Hanya Field Wajib)

```json
{
  "nama_sarpras": "Ruang Kelas A101"
}
```

**Response (201 Created):**
```json
{
  "message": "Data Sarpras Pendidikan berhasil dibuat",
  "id": 1,
  "data": {
    "id": 1,
    "id_unit": 11,
    "nama_sarpras": "Ruang Kelas A101",
    "daya_tampung": null,
    "luas_ruang_m2": null,
    "kepemilikan": null,
    "lisensi": null,
    "perangkat_detail": null,
    "link_bukti": null,
    "created_at": "2025-11-12T10:30:00.000Z",
    "created_by": 8,
    "updated_at": null,
    "updated_by": null,
    "deleted_at": null,
    "deleted_by": null
  }
}
```

---

## Contoh 2: Laboratorium Komputer (Lengkap)

```json
{
  "nama_sarpras": "Laboratorium Komputer Jaringan",
  "daya_tampung": 40,
  "luas_ruang_m2": 80.5,
  "kepemilikan": "M",
  "lisensi": "L",
  "perangkat_detail": "40 unit komputer, 1 server, switch 24 port, router, software Windows 10, Microsoft Office, Cisco Packet Tracer",
  "link_bukti": "https://drive.google.com/file/d/abc123/lab-komputer.pdf"
}
```

**Catatan:**
- `kepemilikan`: `"M"` = Milik Sendiri, `"W"` = Sewa
- `lisensi`: `"L"` = Berlisensi, `"P"` = Public Domain, `"T"` = Tidak Berlisensi

---

## Contoh 3: Perpustakaan/Ruang Baca

```json
{
  "nama_sarpras": "Perpustakaan Digital",
  "daya_tampung": 100,
  "luas_ruang_m2": 150.0,
  "kepemilikan": "M",
  "lisensi": "P",
  "perangkat_detail": "20 unit komputer, 5 tablet, WiFi, koleksi buku digital, e-journal, database online",
  "link_bukti": "https://drive.google.com/file/d/xyz789/perpustakaan-digital.pdf"
}
```

---

## Contoh 4: Ruang Studio (Sewa)

```json
{
  "nama_sarpras": "Studio Produksi Video",
  "daya_tampung": 15,
  "luas_ruang_m2": 60.0,
  "kepemilikan": "W",
  "lisensi": "L",
  "perangkat_detail": "Kamera profesional, lighting equipment, green screen, editing software Adobe Premiere Pro (berlisensi)",
  "link_bukti": "https://drive.google.com/file/d/def456/studio-video.pdf"
}
```

---

## Contoh 5: Laboratorium dengan Perangkat Open Source

```json
{
  "nama_sarpras": "Laboratorium Pemrograman",
  "daya_tampung": 30,
  "luas_ruang_m2": 70.0,
  "kepemilikan": "M",
  "lisensi": "P",
  "perangkat_detail": "30 unit komputer, Linux Ubuntu, Visual Studio Code, Git, MySQL, PostgreSQL, Node.js, Python, Java JDK",
  "link_bukti": "https://drive.google.com/file/d/ghi789/lab-pemrograman.pdf"
}
```

---

## Contoh 6: Ruang Workshop (Tanpa Lisensi)

```json
{
  "nama_sarpras": "Workshop Hardware",
  "daya_tampung": 20,
  "luas_ruang_m2": 50.0,
  "kepemilikan": "M",
  "lisensi": "T",
  "perangkat_detail": "Multimeter, oscilloscope, soldering tools, komponen elektronik, breadboard, power supply",
  "link_bukti": "https://drive.google.com/file/d/jkl012/workshop-hardware.pdf"
}
```

---

## Contoh Menggunakan cURL

### Contoh 1: Minimal
```bash
curl -X POST http://localhost:3000/api/tabel-5-2-sarpras-pendidikan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama_sarpras": "Ruang Kelas A101"
  }'
```

### Contoh 2: Lengkap
```bash
curl -X POST http://localhost:3000/api/tabel-5-2-sarpras-pendidikan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nama_sarpras": "Laboratorium Komputer Jaringan",
    "daya_tampung": 40,
    "luas_ruang_m2": 80.5,
    "kepemilikan": "M",
    "lisensi": "L",
    "perangkat_detail": "40 unit komputer, 1 server, switch 24 port, router, software Windows 10, Microsoft Office, Cisco Packet Tracer",
    "link_bukti": "https://drive.google.com/file/d/abc123/lab-komputer.pdf"
  }'
```

---

## Contoh Menggunakan JavaScript (Fetch API)

```javascript
const createSarprasPendidikan = async () => {
  const response = await fetch('http://localhost:3000/api/tabel-5-2-sarpras-pendidikan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      nama_sarpras: "Laboratorium Komputer Jaringan",
      daya_tampung: 40,
      luas_ruang_m2: 80.5,
      kepemilikan: "M",
      lisensi: "L",
      perangkat_detail: "40 unit komputer, 1 server, switch 24 port, router, software Windows 10, Microsoft Office, Cisco Packet Tracer",
      link_bukti: "https://drive.google.com/file/d/abc123/lab-komputer.pdf"
    })
  });

  const data = await response.json();
  console.log(data);
};
```

---

## Field yang Dapat Dikirim

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `nama_sarpras` | string | ✅ **WAJIB** | Nama prasarana (ruang kelas, laboratorium, perpustakaan, dll) |
| `daya_tampung` | integer | ❌ Optional | Daya tampung (jumlah orang) |
| `luas_ruang_m2` | float | ❌ Optional | Luas ruang dalam meter persegi |
| `kepemilikan` | enum | ❌ Optional | `"M"` = Milik Sendiri, `"W"` = Sewa |
| `lisensi` | enum | ❌ Optional | `"L"` = Berlisensi, `"P"` = Public Domain, `"T"` = Tidak Berlisensi |
| `perangkat_detail` | text | ❌ Optional | Detail perangkat (hardware, software, bandwidth, device, tool, bahan pustaka, dll) |
| `link_bukti` | text | ❌ Optional | Link bukti dokumen |

**Catatan:**
- `id_unit` **TIDAK** perlu dikirim, karena otomatis diambil dari `req.user.id_unit` (user yang login)
- `created_by` **TIDAK** perlu dikirim, karena otomatis diambil dari `req.user.id_user`
- Field audit lainnya (`created_at`, `updated_at`, `deleted_at`, dll) diatur otomatis oleh database

---

## Error Response

### Error 400: Field Wajib Kosong
```json
{
  "error": "Input tidak lengkap. (nama_sarpras) wajib diisi."
}
```

### Error 400: Unit Kerja Tidak Ditemukan
```json
{
  "error": "Unit kerja (Sarpras) tidak ditemukan dari data user."
}
```

### Error 401: Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### Error 403: Forbidden (Tidak Ada Permission)
```json
{
  "error": "Forbidden: Anda tidak memiliki akses untuk membuat data ini"
}
```

### Error 500: Server Error
```json
{
  "error": "Gagal membuat data Sarpras Pendidikan",
  "details": "Error message dari database"
}
```

---

## Tips

1. **Nama Prasarana**: Gunakan nama yang jelas dan deskriptif, misal:
   - "Ruang Kelas A101"
   - "Laboratorium Komputer Jaringan"
   - "Perpustakaan Digital"
   - "Studio Produksi Video"

2. **Perangkat Detail**: Jelaskan secara lengkap:
   - Hardware: jumlah dan spesifikasi
   - Software: nama dan versi
   - Bandwidth: jika relevan
   - Device/Tool: peralatan pendukung
   - Bahan pustaka: jika ada

3. **Link Bukti**: Gunakan link yang dapat diakses publik atau link Google Drive dengan sharing yang tepat

4. **Kepemilikan**: 
   - `"M"` untuk prasarana yang dimiliki sendiri
   - `"W"` untuk prasarana yang disewa

5. **Lisensi**:
   - `"L"` untuk software/perangkat berlisensi (berbayar)
   - `"P"` untuk software/perangkat open source atau public domain
   - `"T"` untuk perangkat yang tidak memerlukan lisensi (hardware fisik, tool, dll)


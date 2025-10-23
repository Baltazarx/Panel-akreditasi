# Contoh Response Tabel 2.B.5 dengan Data dari Tabel 2.B.4

## Response List Data

```json
[
  {
    "id": 1,
    "id_unit_prodi": 4,
    "nama_unit_prodi": "Prodi TI",
    "id_tahun_lulus": 2024,
    "tahun_lulus": "2024/2025",
    "jml_infokom": 25,
    "jml_non_infokom": 5,
    "jml_internasional": 3,
    "jml_nasional": 20,
    "jml_wirausaha": 7,
    "deleted_at": null,
    // Data dari tabel 2.B.4
    "jumlah_lulusan": 50,
    "jumlah_terlacak": 45,
    "rata_rata_waktu_tunggu_bulan": 3.5
  },
  {
    "id": 2,
    "id_unit_prodi": 5,
    "nama_unit_prodi": "Prodi MI",
    "id_tahun_lulus": 2024,
    "tahun_lulus": "2024/2025",
    "jml_infokom": 20,
    "jml_non_infokom": 8,
    "jml_internasional": 2,
    "jml_nasional": 18,
    "jml_wirausaha": 8,
    "deleted_at": null,
    // Data dari tabel 2.B.4
    "jumlah_lulusan": 40,
    "jumlah_terlacak": 38,
    "rata_rata_waktu_tunggu_bulan": 2.8
  }
]
```

## Response Detail Data

```json
{
  "id": 1,
  "id_unit_prodi": 4,
  "nama_unit_prodi": "Prodi TI",
  "id_tahun_lulus": 2024,
  "tahun_lulus": "2024/2025",
  "jml_infokom": 25,
  "jml_non_infokom": 5,
  "jml_internasional": 3,
  "jml_nasional": 20,
  "jml_wirausaha": 7,
  "deleted_at": null,
  // Data dari tabel 2.B.4
  "jumlah_lulusan": 50,
  "jumlah_terlacak": 45,
  "rata_rata_waktu_tunggu_bulan": 3.5
}
```

## Response Summary Data

```json
[
  {
    "nama_unit_prodi": "Prodi TI",
    "tahun_lulus": "2024/2025",
    "total_infokom": 25,
    "total_non_infokom": 5,
    "total_internasional": 3,
    "total_nasional": 20,
    "total_wirausaha": 7,
    "jumlah_data": 1,
    // Data dari tabel 2.B.4
    "total_jumlah_lulusan": 50,
    "total_jumlah_terlacak": 45,
    "rata_rata_tunggu_keseluruhan": 3.5
  }
]
```

## Catatan Penting

1. **Data dari Tabel 2.B.4**: Field `jumlah_lulusan`, `jumlah_terlacak`, dan `rata_rata_waktu_tunggu_bulan` diambil dari tabel 2.B.4 berdasarkan `id_unit_prodi` dan `id_tahun_lulus` yang sama.

2. **Jika Tidak Ada Data**: Jika tidak ada data di tabel 2.B.4 untuk kombinasi `id_unit_prodi` dan `id_tahun_lulus` tertentu, field tersebut akan bernilai `NULL`.

3. **Konsistensi Data**: Pastikan data di tabel 2.B.4 sudah diisi terlebih dahulu untuk mendapatkan informasi lengkap di tabel 2.B.5.

4. **Export**: Data dari tabel 2.B.4 juga akan ikut ter-export dalam file Excel, Word, dan PDF.

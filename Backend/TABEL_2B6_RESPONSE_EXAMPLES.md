# Contoh Response Tabel 2.B.6 Kepuasan Pengguna Lulusan

## Response List Data (Dengan Statistik)

```json
{
  "data": [
    {
      "id": 1,
      "id_unit_prodi": 4,
      "nama_unit_prodi": "Prodi TI",
      "id_tahun": 2024,
      "tahun_akademik": "2024/2025",
      "jenis_kemampuan": "Kerjasama Tim",
      "persen_sangat_baik": 40.5,
      "persen_baik": 35.2,
      "persen_cukup": 20.1,
      "persen_kurang": 4.2,
      "deleted_at": null
    },
    {
      "id": 2,
      "id_unit_prodi": 4,
      "nama_unit_prodi": "Prodi TI",
      "id_tahun": 2024,
      "tahun_akademik": "2024/2025",
      "jenis_kemampuan": "Keahlian di Bidang Prodi",
      "persen_sangat_baik": 45.8,
      "persen_baik": 32.1,
      "persen_cukup": 18.5,
      "persen_kurang": 3.6,
      "deleted_at": null
    }
  ],
  "statistik": {
    "jumlah_alumni_3_tahun": 150,
    "jumlah_mahasiswa_aktif_ts": 120,
    "jumlah_responden": 7,
    "tahun_akademik": 2024,
    "unit_prodi": 4
  }
}
```

## Response List Data (Tanpa Filter - Multiple Statistik)

Jika tidak ada filter `id_unit_prodi` dan `id_tahun`, response akan berupa object dengan array statistik untuk semua kombinasi:

```json
{
  "data": [
    {
      "id": 1,
      "id_unit_prodi": 4,
      "nama_unit_prodi": "Prodi TI",
      "id_tahun": 2024,
      "tahun_akademik": "2024/2025",
      "jenis_kemampuan": "Kerjasama Tim",
      "persen_sangat_baik": 40.5,
      "persen_baik": 35.2,
      "persen_cukup": 20.1,
      "persen_kurang": 4.2,
      "deleted_at": null
    },
    {
      "id": 2,
      "id_unit_prodi": 5,
      "nama_unit_prodi": "Prodi MI",
      "id_tahun": 2024,
      "tahun_akademik": "2024/2025",
      "jenis_kemampuan": "Kerjasama Tim",
      "persen_sangat_baik": 38.2,
      "persen_baik": 40.1,
      "persen_cukup": 18.7,
      "persen_kurang": 3.0,
      "deleted_at": null
    }
  ],
  "statistik": [
    {
      "jumlah_alumni_3_tahun": 150,
      "jumlah_mahasiswa_aktif_ts": 120,
      "jumlah_responden": 7,
      "tahun_akademik": 2024,
      "unit_prodi": 4
    },
    {
      "jumlah_alumni_3_tahun": 100,
      "jumlah_mahasiswa_aktif_ts": 80,
      "jumlah_responden": 6,
      "tahun_akademik": 2024,
      "unit_prodi": 5
    }
  ]
}
```

## Response Detail Data (Dengan Statistik)

```json
{
  "id": 1,
  "id_unit_prodi": 4,
  "nama_unit_prodi": "Prodi TI",
  "id_tahun": 2024,
  "tahun_akademik": "2024/2025",
  "jenis_kemampuan": "Kerjasama Tim",
  "persen_sangat_baik": 40.5,
  "persen_baik": 35.2,
  "persen_cukup": 20.1,
  "persen_kurang": 4.2,
  "deleted_at": null,
  "statistik": {
    "jumlah_alumni_3_tahun": 150,
    "jumlah_mahasiswa_aktif_ts": 120,
    "jumlah_responden": 7,
    "tahun_akademik": 2024,
    "unit_prodi": 4
  }
}
```

## Response Summary Data

```json
[
  {
    "nama_unit_prodi": "Prodi TI",
    "tahun_akademik": "2024/2025",
    "rata_sangat_baik": 42.15,
    "rata_baik": 33.65,
    "rata_cukup": 19.3,
    "rata_kurang": 3.9,
    "jumlah_kemampuan": 7
  },
  {
    "nama_unit_prodi": "Prodi MI",
    "tahun_akademik": "2024/2025",
    "rata_sangat_baik": 39.8,
    "rata_baik": 36.2,
    "rata_cukup": 20.1,
    "rata_kurang": 3.9,
    "jumlah_kemampuan": 7
  }
]
```

## Response Jenis Kemampuan Tersedia

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

## Response Data Statistik Tambahan

```json
{
  "jumlah_alumni_3_tahun": 150,
  "jumlah_mahasiswa_aktif_ts": 120,
  "jumlah_responden": 7,
  "tahun_akademik": 2024,
  "unit_prodi": 4
}
```

### Penjelasan Data Statistik:

- **jumlah_alumni_3_tahun**: Total alumni/lulusan dalam 3 tahun terakhir (2022-2024)
- **jumlah_mahasiswa_aktif_ts**: Jumlah mahasiswa aktif pada tahun TS (2024)
- **jumlah_responden**: Jumlah jenis kemampuan yang sudah diisi (setiap jenis = 1 responden)
- **tahun_akademik**: Tahun yang diminta
- **unit_prodi**: Unit prodi yang diminta

### Behavior Statistik:

1. **Dengan Filter Spesifik** (`id_unit_prodi` & `id_tahun`): 
   - `statistik` berupa **object tunggal**
   - Berisi statistik untuk unit prodi dan tahun yang difilter

2. **Tanpa Filter** (read semua data):
   - `statistik` berupa **array**
   - Berisi statistik untuk semua kombinasi unit prodi & tahun yang ada di data
   - Setiap item array = statistik untuk 1 kombinasi unit prodi & tahun

3. **Tidak Ada Data**:
   - `statistik` berupa `null`

## Contoh Request Create

```json
POST /api/tabel2b6-kepuasan-pengguna
{
  "id_unit_prodi": 4,
  "id_tahun": 2024,
  "jenis_kemampuan": "Kepemimpinan",
  "persen_sangat_baik": 35.0,
  "persen_baik": 42.5,
  "persen_cukup": 18.0,
  "persen_kurang": 4.5
}
```

## Contoh Request Update

```json
PUT /api/tabel2b6-kepuasan-pengguna/1
{
  "persen_sangat_baik": 45.0,
  "persen_baik": 38.0,
  "persen_cukup": 15.0,
  "persen_kurang": 2.0
}
```

## Error Response - Validasi Persentase

```json
{
  "error": "Total persentase (105.5%) tidak boleh lebih dari 100%."
}
```

## Error Response - Field Wajib

```json
{
  "error": "Field `id_unit_prodi`, `id_tahun`, dan `jenis_kemampuan` wajib diisi."
}
```

## Catatan Penting

1. **Validasi Persentase**: Total semua persentase tidak boleh melebihi 100%
2. **Jenis Kemampuan**: Harus sesuai dengan daftar yang tersedia
3. **Unik**: Kombinasi `id_unit_prodi`, `id_tahun`, dan `jenis_kemampuan` harus unik
4. **Role Kemahasiswaan**: Data otomatis ter-filter berdasarkan unit prodi user
5. **Export**: Data dapat diekspor dalam format Excel, Word, dan PDF
6. **Summary**: Menampilkan rata-rata persentase per unit prodi dan tahun

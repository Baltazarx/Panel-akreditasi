# Penjelasan Summary vs Detail untuk Tabel 3.A.3

## 📊 Struktur Tabel 3.A.3 (Berdasarkan Image LKPS)

Tabel 3.A.3 memiliki struktur **2 level**:

### 🎯 **LEVEL 1: SUMMARY (Jumlah DTPR)**
Baris pertama yang menunjukkan **jumlah total DTPR** untuk 3 tahun:

```
┌─────────────────┬─────────┬─────────┬─────────┬──────────────┐
│ Tahun Akademik  │   TS-2  │   TS-1  │   TS    │  Link Bukti  │
├─────────────────┼─────────┼─────────┼─────────┼──────────────┤
│ Jumlah Dosen    │   10    │   12    │   15    │  [Link]      │
│ DTPR            │         │         │         │              │
└─────────────────┴─────────┴─────────┴─────────┴──────────────┘
```

**Endpoint**: `/api/tabel-3a3-pengembangan-dtpr/summary`
**Tabel Database**: `tabel_3a3_dtpr_tahunan`

**Penjelasan**:
- Menyimpan **jumlah total DTPR** untuk setiap tahun (TS-2, TS-1, TS)
- Setiap record = 1 unit × 1 tahun
- Contoh: Unit LPPM tahun 2024 punya 15 DTPR
- **Input**: User isi jumlah DTPR per tahun (misal: 2024 = 15, 2023 = 12, 2022 = 10)

### 📋 **LEVEL 2: DETAIL (Pengembangan DTPR)**
Baris-baris detail yang menunjukkan **pengembangan per dosen dan jenis**:

```
┌──────────────────────┬──────────────┬─────────┬─────────┬─────────┬──────────────┐
│ Jenis Pengembangan   │  Nama DTPR   │  TS-2   │  TS-1   │  TS     │  Link Bukti  │
├──────────────────────┼──────────────┼─────────┼─────────┼─────────┼──────────────┤
│ Tugas Belajar        │ Dr. Budi...  │   1     │   0     │   1     │  [Link]      │
│ Pelatihan           │ Dr. Budi...  │   0     │   1     │   0     │  [Link]      │
│ Tugas Belajar        │ Prof. Eka... │   0     │   1     │   0     │  [Link]      │
│ Seminar             │ Prof. Eka...  │   0     │   0     │   2     │  [Link]      │
└──────────────────────┴──────────────┴─────────┴─────────┴─────────┴──────────────┘
```

**Endpoint**: `/api/tabel-3a3-pengembangan-dtpr/detail`
**Tabel Database**: `tabel_3a3_pengembangan`

**Penjelasan**:
- Menyimpan **detail pengembangan** per dosen × jenis pengembangan × tahun
- Setiap record = 1 dosen × 1 jenis pengembangan × 1 tahun
- Contoh: "Dr. Budi Santoso" melakukan "Tugas Belajar" di tahun 2024
- **Input**: User isi untuk setiap dosen yang melakukan pengembangan tertentu di tahun tertentu

---

## 🔍 Perbedaan Detail

### **SUMMARY (tabel_3a3_dtpr_tahunan)**

| Aspek | Penjelasan |
|-------|------------|
| **Tujuan** | Menyimpan jumlah total DTPR per tahun |
| **Tingkat Data** | Agregat (summary) |
| **Jumlah Record** | 1-3 record per unit (satu per tahun: TS-2, TS-1, TS) |
| **Field** | `id_unit`, `id_tahun`, `jumlah_dtpr`, `link_bukti` |
| **Pivot Logic** | `SUM(jumlah_dtpr)` per tahun |
| **Tabel LKPS** | Baris "Jumlah Dosen DTPR" |
| **Input User** | "Berapa jumlah DTPR di tahun 2024?" → Jawab: 15 |

**Contoh Data**:
```json
[
  { "id_unit": 12, "id_tahun": 2024, "jumlah_dtpr": 15, "link_bukti": "..." },
  { "id_unit": 12, "id_tahun": 2023, "jumlah_dtpr": 12, "link_bukti": "..." },
  { "id_unit": 12, "id_tahun": 2022, "jumlah_dtpr": 10, "link_bukti": "..." }
]
```

### **DETAIL (tabel_3a3_pengembangan)**

| Aspek | Penjelasan |
|-------|------------|
| **Tujuan** | Menyimpan detail pengembangan per dosen dan jenis |
| **Tingkat Data** | Detail/Transaksi |
| **Jumlah Record** | Banyak record (setiap pengembangan = 1 record) |
| **Field** | `id_unit`, `id_dosen`, `jenis_pengembangan`, `id_tahun`, `link_bukti` |
| **Pivot Logic** | `COUNT(*)` per dosen × jenis per tahun |
| **Tabel LKPS** | Baris-baris detail di bawah "Jenis Pengembangan DTPR" |
| **Input User** | "Siapa dosen yang melakukan Tugas Belajar di tahun 2024?" → Jawab: "Dr. Budi Santoso" |

**Contoh Data**:
```json
[
  { "id_dosen": 1, "jenis_pengembangan": "Tugas Belajar", "id_tahun": 2024, "link_bukti": "..." },
  { "id_dosen": 1, "jenis_pengembangan": "Pelatihan", "id_tahun": 2023, "link_bukti": "..." },
  { "id_dosen": 3, "jenis_pengembangan": "Tugas Belajar", "id_tahun": 2023, "link_bukti": "..." },
  { "id_dosen": 3, "jenis_pengembangan": "Seminar", "id_tahun": 2024, "link_bukti": "..." },
  { "id_dosen": 3, "jenis_pengembangan": "Seminar", "id_tahun": 2024, "link_bukti": "..." }
]
```

---

## 🎨 Mapping ke Tabel LKPS

### **Bagian yang Menggunakan SUMMARY**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Tahun Akademik                                                   │
│ ┌─────────────────┬─────────┬─────────┬─────────┬────────────┐ │
│ │ Jumlah Dosen    │   TS-2  │   TS-1  │   TS    │ Link Bukti │ │ ← SUMMARY
│ │ DTPR            │   10    │   12    │   15    │  [Link]    │ │
│ └─────────────────┴─────────┴─────────┴─────────┴────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Endpoint**: `GET /api/tabel-3a3-pengembangan-dtpr/summary?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022`

**Response (PIVOT Mode)**:
```json
{
  "id_unit": 12,
  "nama_unit_prodi": "LPPM",
  "jumlah_ts_2": 10,
  "jumlah_ts_1": 12,
  "jumlah_ts": 15,
  "link_bukti_ts_2": "...",
  "link_bukti_ts_1": "...",
  "link_bukti_ts": "..."
}
```

### **Bagian yang Menggunakan DETAIL**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Jenis Pengembangan │ Nama DTPR │ Jumlah │ Jumlah │ Jumlah │    │
│                    │            │ TS-2   │ TS-1   │ TS     │    │
├────────────────────┼────────────┼────────┼────────┼────────┤    │
│ Tugas Belajar      │ Dr. Budi   │   1    │   0    │   1    │ ←  │ DETAIL
│ Pelatihan         │ Dr. Budi   │   0    │   1    │   0    │ ←  │ DETAIL
│ Tugas Belajar      │ Prof. Eka  │   0    │   1    │   0    │ ←  │ DETAIL
│ Seminar           │ Prof. Eka  │   0    │   0    │   2    │ ←  │ DETAIL
└────────────────────┴────────────┴────────┴────────┴────────┘    │
```

**Endpoint**: `GET /api/tabel-3a3-pengembangan-dtpr/detail?id_tahun_ts=2024&id_tahun_ts_1=2023&id_tahun_ts_2=2022`

**Response (PIVOT Mode)**:
```json
[
  {
    "id_dosen": 1,
    "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
    "jenis_pengembangan": "Tugas Belajar",
    "jumlah_ts_2": 1,
    "jumlah_ts_1": 0,
    "jumlah_ts": 1,
    "link_bukti": "..."
  },
  {
    "id_dosen": 1,
    "nama_dtpr": "Dr. Budi Santoso, M.Kom.",
    "jenis_pengembangan": "Pelatihan",
    "jumlah_ts_2": 0,
    "jumlah_ts_1": 1,
    "jumlah_ts": 0,
    "link_bukti": "..."
  }
]
```

---

## 🔄 Alur Pengisian Data

### **Step 1: Isi SUMMARY (Jumlah DTPR)**
User mengisi jumlah total DTPR untuk setiap tahun:

```
POST /api/tabel-3a3-pengembangan-dtpr/summary
{
  "id_unit": 12,
  "id_tahun": 2024,
  "jumlah_dtpr": 15,
  "link_bukti": "https://..."
}
```

Ini akan membuat 3 record (satu per tahun):
- Tahun 2024: 15 DTPR
- Tahun 2023: 12 DTPR  
- Tahun 2022: 10 DTPR

### **Step 2: Isi DETAIL (Pengembangan per Dosen)**
User mengisi detail pengembangan untuk setiap dosen:

```
POST /api/tabel-3a3-pengembangan-dtpr/detail
{
  "id_unit": 12,
  "id_dosen": 1,
  "jenis_pengembangan": "Tugas Belajar",
  "id_tahun": 2024,
  "link_bukti": "https://..."
}
```

Ini akan membuat banyak record, contoh:
- Dr. Budi - Tugas Belajar - 2024
- Dr. Budi - Pelatihan - 2023
- Prof. Eka - Tugas Belajar - 2023
- Prof. Eka - Seminar - 2024
- Prof. Eka - Seminar - 2024 (bisa multiple untuk jenis yang sama)

---

## 📈 Contoh Skenario Lengkap

### **Data di Database**:

**SUMMARY** (`tabel_3a3_dtpr_tahunan`):
- Record 1: Unit LPPM, Tahun 2024, Jumlah DTPR = 15
- Record 2: Unit LPPM, Tahun 2023, Jumlah DTPR = 12
- Record 3: Unit LPPM, Tahun 2022, Jumlah DTPR = 10

**DETAIL** (`tabel_3a3_pengembangan`):
- Record 1: Dr. Budi, Tugas Belajar, 2024
- Record 2: Dr. Budi, Pelatihan, 2023
- Record 3: Prof. Eka, Tugas Belajar, 2023
- Record 4: Prof. Eka, Seminar, 2024
- Record 5: Prof. Eka, Seminar, 2024 (kedua kalinya)

### **Tampilan di Tabel LKPS**:

**Summary Row** (dari endpoint `/summary`):
```
Jumlah Dosen DTPR | TS-2: 10 | TS-1: 12 | TS: 15 | Link Bukti
```

**Detail Rows** (dari endpoint `/detail`):
```
Tugas Belajar     | Dr. Budi        | TS-2: 1 | TS-1: 0 | TS: 1 | Link
Pelatihan        | Dr. Budi        | TS-2: 0 | TS-1: 1 | TS: 0 | Link
Tugas Belajar    | Prof. Eka       | TS-2: 0 | TS-1: 1 | TS: 0 | Link
Seminar          | Prof. Eka       | TS-2: 0 | TS-1: 0 | TS: 2 | Link
```

**Penjelasan**:
- **Summary**: Menunjukkan total DTPR (10, 12, 15) untuk 3 tahun
- **Detail**: Menunjukkan siapa dosen yang melakukan pengembangan apa di tahun berapa
- **Jumlah di Detail**: 
  - TS-2: 1 (Dr. Budi - Tugas Belajar)
  - TS-1: 1 (Dr. Budi - Pelatihan) + 1 (Prof. Eka - Tugas Belajar) = 2 total, tapi di group per dosen × jenis
  - TS: 1 (Dr. Budi - Tugas Belajar) + 2 (Prof. Eka - Seminar) = 3 total, tapi di group per dosen × jenis

---

## ⚠️ Catatan Penting

### **Konsistensi Data**:
- **SUMMARY** harus konsisten dengan **DETAIL**
- Jika SUMMARY menunjukkan 15 DTPR di tahun 2024, maka DETAIL harus menunjukkan pengembangan untuk 15 DTPR tersebut
- Namun, sistem tidak melakukan validasi otomatis untuk konsistensi ini

### **Keterangan LKPS**:
> "Pengisian data tidak berulang, jika dosen dikirim tugas belajar di tahun TS-3, maka tidak lagi dihitung di TS-2."

Ini berarti:
- Jika dosen sudah dikirim tugas belajar di tahun TS-3 (3 tahun sebelum TS), tidak perlu dihitung lagi di TS-2
- Sistem tidak melakukan validasi otomatis untuk ini, user harus memastikan konsistensi data

### **Jumlah di Detail (PIVOT Mode)**:
- `jumlah_ts_2`, `jumlah_ts_1`, `jumlah_ts` adalah **COUNT** dari record pengembangan per dosen × jenis per tahun
- Contoh: Jika Prof. Eka melakukan Seminar 2 kali di tahun 2024, maka `jumlah_ts` akan menjadi 2

---

## 🎯 Kesimpulan

| | SUMMARY | DETAIL |
|---|---|---|
| **Apa yang disimpan** | Jumlah total DTPR per tahun | Detail pengembangan per dosen × jenis × tahun |
| **Tabel Database** | `tabel_3a3_dtpr_tahunan` | `tabel_3a3_pengembangan` |
| **Endpoint** | `/summary` | `/detail` |
| **Tabel LKPS** | Baris "Jumlah Dosen DTPR" | Baris-baris detail di bawah |
| **Jumlah Record** | Sedikit (1-3 per unit) | Banyak (setiap pengembangan = 1 record) |
| **Input User** | "Berapa jumlah DTPR?" | "Siapa melakukan apa di tahun berapa?" |

**Gunakan SUMMARY untuk**: Mengisi baris summary "Jumlah Dosen DTPR" di tabel LKPS
**Gunakan DETAIL untuk**: Mengisi baris-baris detail pengembangan per dosen di tabel LKPS


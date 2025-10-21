# Contoh Penggunaan Validasi Tabel 2.B.5

## Endpoint Validasi

### **URL**: `GET /api/tabel2b5-kesesuaian-kerja/validate/jumlah`

## Contoh Request

### **Validasi yang BERHASIL:**
```
GET /api/tabel2b5-kesesuaian-kerja/validate/jumlah?id_unit_prodi=4&id_tahun_lulus=2024&jml_infokom=25&jml_non_infokom=5&jml_internasional=3&jml_nasional=20&jml_wirausaha=7
```

**Response:**
```json
{
  "jumlah_terlacak": 45,
  "total_input": 30,
  "valid": true,
  "message": "Valid! Total 30 tidak melebihi jumlah terlacak 45"
}
```

### **Validasi yang GAGAL:**
```
GET /api/tabel2b5-kesesuaian-kerja/validate/jumlah?id_unit_prodi=4&id_tahun_lulus=2024&jml_infokom=25&jml_non_infokom=5&jml_internasional=3&jml_nasional=20&jml_wirausaha=7
```

**Response:**
```json
{
  "jumlah_terlacak": 45,
  "total_input": 60,
  "valid": false,
  "message": "Tidak valid! Total 60 melebihi jumlah terlacak 45"
}
```

### **Data Tidak Ditemukan di Tabel 2.B.4:**
```
GET /api/tabel2b5-kesesuaian-kerja/validate/jumlah?id_unit_prodi=999&id_tahun_lulus=2024&jml_infokom=25
```

**Response:**
```json
{
  "error": "Data tidak ditemukan di tabel 2.B.4 untuk unit prodi dan tahun lulus tersebut.",
  "jumlah_terlacak": 0,
  "total_input": 0,
  "valid": false
}
```

## Contoh Error saat Create/Update

### **Create Data yang Melebihi Batas:**
```json
POST /api/tabel2b5-kesesuaian-kerja
{
  "id_unit_prodi": 4,
  "id_tahun_lulus": 2024,
  "jml_infokom": 30,
  "jml_non_infokom": 10,
  "jml_internasional": 5,
  "jml_nasional": 25,
  "jml_wirausaha": 10
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Total jumlah (80) tidak boleh lebih dari jumlah terlacak di tabel 2.B.4 (45)."
}
```

## Cara Kerja Validasi

1. **Ambil Data dari Tabel 2.B.4**: Sistem mengambil `jumlah_terlacak` berdasarkan `id_unit_prodi` dan `id_tahun_lulus`

2. **Hitung Total Input**: Menjumlahkan semua field jumlah di tabel 2.B.5
   ```
   total = jml_infokom + jml_non_infokom + jml_internasional + jml_nasional + jml_wirausaha
   ```

3. **Bandingkan**: 
   - Jika `total <= jumlah_terlacak` → ✅ **VALID**
   - Jika `total > jumlah_terlacak` → ❌ **TIDAK VALID**

4. **Response**: Memberikan feedback yang jelas tentang status validasi

## Tips untuk Frontend

1. **Validasi Real-time**: Panggil endpoint validasi setiap kali user mengubah input
2. **Tampilkan Batas**: Tampilkan `jumlah_terlacak` dari tabel 2.B.4 sebagai informasi
3. **Progress Bar**: Buat progress bar yang menunjukkan berapa persen dari batas yang sudah digunakan
4. **Warning**: Berikan warning jika mendekati batas maksimal

## Contoh Implementasi Frontend

```javascript
// Validasi real-time
const validateJumlah = async (formData) => {
  const params = new URLSearchParams({
    id_unit_prodi: formData.id_unit_prodi,
    id_tahun_lulus: formData.id_tahun_lulus,
    jml_infokom: formData.jml_infokom || 0,
    jml_non_infokom: formData.jml_non_infokom || 0,
    jml_internasional: formData.jml_internasional || 0,
    jml_nasional: formData.jml_nasional || 0,
    jml_wirausaha: formData.jml_wirausaha || 0
  });
  
  const response = await fetch(`/api/tabel2b5-kesesuaian-kerja/validate/jumlah?${params}`);
  const result = await response.json();
  
  if (!result.valid) {
    alert(result.message);
    return false;
  }
  
  return true;
};
```

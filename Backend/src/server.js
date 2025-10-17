// src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config as appConfig } from './config.js';

// AUTH
import { loginRouter } from './auth/login.route.js';

// C1 ROUTERS
import { pimpinanUppsPsRouter }                            from './routes/pimpinanUppsPs.route.js';   // 1.A.1
import { sumberPendanaanRouter }                           from './routes/sumberPendanaan.route.js';  // 1.A.2
import { penggunaanDanaRouter }                            from './routes/penggunaanDana.route.js';   // 1.A.3
import { bebanKerjaDosenRouter }                           from './routes/bebanKerjaDosen.route.js';  // 1.A.4
import kualifikasiTendikRouter from './routes/kualifikasiTendik.route.js';// 1.A.5
import { auditMutuInternalRouter } from './routes/auditMutuInternal.route.js'; // 1.B
import { unitKerjaRouter }         from './routes/unitKerja.route.js';
import { pegawaiRouter }           from './routes/pegawai.route.js';
import { dosenRouter }             from './routes/dosen.route.js'; // Import dosenRouter
import { tahunRouter }             from './routes/tahun.route.js';
import { tendikRouter }            from './routes/tendik.route.js';
import { refJabatanStrukturalRouter } from './routes/refJabatanStruktural.route.js';
import { refJabatanFungsionalRouter } from './routes/refJabatanFungsional.route.js';
import { jumlahTendikByPendidikanRouter } from './routes/jumlahTendikByPendidikan.route.js';
import { cplRouter } from './routes/cpl.route.js';
import { cpmkRouter } from './routes/cpmk.route.js';
import { kurikulumRouter } from './routes/kurikulum.route.js';
import { logAktivitasRouter } from './routes/logAktivitas.route.js';
import { mapCplMkRouter } from './routes/mapCplMk.route.js';
import { mapCplPlRouter } from './routes/mapCplPl.route.js';
import { mapCpmkCplRouter } from './routes/mapCpmkCpl.route.js';
import { mapCpmkMkRouter } from './routes/mapCpmkMk.route.js';
import mataKuliahRouter from './routes/mataKuliah.route.js';
import profilLulusanRouter from './routes/profilLulusan.route.js';
import { tabel2a1MahasiswaBaruAktifRouter } from './routes/tabel2a1MahasiswaBaruAktif.route.js';
import { tabel2a1PendaftaranRouter } from './routes/tabel2a1Pendaftaran.route.js';
import { tabel2a2KeragamanAsalRouter } from './routes/tabel2a2KeragamanAsal.route.js';
import { tabel2a3KondisiMahasiswaRouter } from './routes/tabel2a3KondisiMahasiswa.route.js';
import { tabel2b4MasaTungguRouter } from './routes/tabel2b4MasaTunggu.route.js';
import { tabel2b5KesesuaianKerjaRouter } from './routes/tabel2b5KesesuaianKerja.route.js';
import { tabel2b6KepuasanPenggunaRouter } from './routes/tabel2b6KepuasanPengguna.route.js';
import { tabel2cPembelajaranLuarProdiRouter } from './routes/tabel2cPembelajaranLuarProdi.route.js';
import { tabel2dRekognisiLulusanRouter } from './routes/tabel2dRekognisiLulusan.route.js';
import { refKabupatenKotaRouter } from './routes/refKabupatenKota.route.js'; // Import new router
import { refProvinsiRouter } from './routes/refProvinsi.route.js';
import tabel2b1IsiPembelajaranRouter from "./routes/tabel2b1IsiPembelajaran.route.js";
import tabel2b6RekapJumlahRoutes from './routes/tabel2b6RekapJumlah.route.js';


const app = express();

// ===== Middlewares =====
app.use(express.json());
app.use(cookieParser());

// Middleware logging global (sementara untuk debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} - REQUEST RECEIVED`);
  next();
});

// CORS (sesuaikan origin FE-mu; untuk test Thunder Client boleh true)
const ALLOW_ORIGIN = process.env.FRONTEND_ORIGIN || true; // true = reflect origin (dev)
app.use(cors({
  origin: ALLOW_ORIGIN,
  credentials: true,
}));

// ===== Healthcheck =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// ===== Routes =====
app.use('/api', loginRouter);

app.use('/api/pimpinan-upps-ps',    pimpinanUppsPsRouter);    // 1.A.1
app.use('/api/sumber-pendanaan',    sumberPendanaanRouter);   // 1.A.2
app.use('/api/penggunaan-dana',     penggunaanDanaRouter);    // 1.A.3
app.use('/api/ref-jenis-penggunaan', penggunaanDanaRouter);
app.use('/api/beban-kerja-dosen',   bebanKerjaDosenRouter);   // 1.A.4
app.use('/api/kualifikasi-tendik',  kualifikasiTendikRouter); // 1.A.5
app.use('/api/audit-mutu-internal', auditMutuInternalRouter); // 1.B
app.use('/api/unit-kerja',          unitKerjaRouter);
app.use('/api/ref-jenis-unit-spmi', unitKerjaRouter);
app.use('/api/pegawai',             pegawaiRouter);
app.use('/api/dosen',               dosenRouter); // Use dosenRouter
app.use('/api/tahun',               tahunRouter);
app.use('/api/tenaga-kependidikan', tendikRouter);
app.use('/api/ref-jabatan-struktural', refJabatanStrukturalRouter);
app.use('/api/jabatan-fungsional', refJabatanFungsionalRouter);
app.use('/api/ref-kabupaten-kota', refKabupatenKotaRouter); // New route for ref_kabupaten_kota
app.use('/api/ref-provinsi', refProvinsiRouter);
app.use('/api/jumlah-tendik-by-pendidikan', jumlahTendikByPendidikanRouter);
app.use('/api/cpl', cplRouter);
app.use('/api/cpmk', cpmkRouter);
app.use('/api/kurikulum', kurikulumRouter);
app.use('/api/log-aktivitas', logAktivitasRouter);
app.use('/api/map-cpl-mk', mapCplMkRouter);
app.use('/api/map-cpl-pl', mapCplPlRouter);
app.use('/api/map-cpmk-cpl', mapCpmkCplRouter);
app.use('/api/map-cpmk-mk', mapCpmkMkRouter);
app.use('/api/mata-kuliah', mataKuliahRouter);
app.use('/api/profil-lulusan', profilLulusanRouter);
console.log("Backend: Attaching tabel2a1MahasiswaBaruAktifRouter");
app.use('/api/tabel-2a1-mahasiswa-baru-aktif', tabel2a1MahasiswaBaruAktifRouter);
app.use('/api/tabel-2a1-pendaftaran', tabel2a1PendaftaranRouter);
app.use('/api/tabel-2a2-keragaman-asal', tabel2a2KeragamanAsalRouter);
app.use('/api/tabel-2a3-kondisi-mahasiswa', tabel2a3KondisiMahasiswaRouter);
app.use('/api/tabel-2b4-masa-tunggu', tabel2b4MasaTungguRouter);
app.use('/api/tabel-2b5-kesesuaian-kerja', tabel2b5KesesuaianKerjaRouter);
app.use('/api/tabel-2b6-kepuasan-pengguna', tabel2b6KepuasanPenggunaRouter);
app.use('/api/tabel-2c-pembelajaran-luar-prodi', tabel2cPembelajaranLuarProdiRouter);
app.use('/api/tabel-2d-rekognisi-lulusan', tabel2dRekognisiLulusanRouter);
app.use('/api/v1/tabel-2b6-rekap-jumlah', tabel2b6RekapJumlahRoutes);
app.use("/api/tabel-2b1-isi-pembelajaran", tabel2b1IsiPembelajaranRouter);

// ===== 404 fallback =====
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ===== Error handler global =====
app.use((err, req, res, next) => {
  console.error('[ERR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ===== Start server =====
const PORT = process.env.PORT || appConfig?.port || 3000;
app.listen(PORT, () => {
  console.log(`API ready on http://localhost:${PORT}`);
});

export default app;

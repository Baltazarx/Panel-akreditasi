import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config as appConfig } from './config.js';

// ===== MIDDLEWARE AUTH =====
import { requireAuth } from './auth/auth.middleware.js';
import { normalizeRole } from './auth/normalizeRole.middleware.js';

// ===== ROUTERS =====
import { loginRouter } from './auth/login.route.js';
import pimpinanUppsPsRouter from './routes/1.A.1PimpinanUppsPs.route.js';
import sumberPendanaanRouter from './routes/1.A.2SumberPendanaan.route.js';
import penggunaanDanaRouter from './routes/1.A.3PenggunaanDana.route.js';
import bebanKerjaDosenRouter from './routes/1.A.4BebanKerjaDosen.route.js';
import kualifikasiTendikRouter from './routes/1.A.5KualifikasiTendik.route.js';
import auditMutuInternalRouter from './routes/1.BAuditMutuInternal.route.js';
import dosenRouter from './routes/dosen.route.js';
import pegawaiRouter from './routes/pegawai.route.js';
import refJabatanFungsionalRouter from './routes/refJabatanFungsional.route.js';
import refJabatanStrukturalRouter from './routes/refJabatanStruktural.route.js';
import tahunRouter from './routes/tahun.route.js';
import tendikRouter from './routes/tendik.route.js';
import unitKerjaRouter from './routes/unitKerja.route.js';
import usersRouter from './routes/users.route.js';

// ===== C2 ROUTES =====
import tabel2a1PendaftaranRouter from './routes/tabel2a1Pendaftaran.route.js';
import tabel2a1MahasiswaBaruAktifRouter from './routes/tabel2a1MahasiswaBaruAktif.route.js';
import tabel2a2KeragamanAsalRouter from './routes/tabel2a2KeragamanAsal.route.js';
import tabel2a3KondisiMahasiswaRouter from './routes/tabel2a3KondisiMahasiswa.route.js';
import tabel2b4MasaTungguRouter from './routes/tabel2b4MasaTunggu.route.js';
import tabel2b5KesesuaianKerjaRouter from './routes/tabel2b5KesesuaianKerja.route.js';
import tabel2b6KepuasanPenggunaRouter from './routes/tabel2b6KepuasanPengguna.route.js';
import tabel2cBentukPembelajaranRouter from './routes/tabel2cBentukPembelajaran.route.js';
import tabel2cFleksibilitasPembelajaranRouter from './routes/tabel2cFleksibilitasPembelajaran.route.js';
import tabel2dRekognisiLulusanRouter from './routes/tabel2dRekognisiLulusan.route.js';
import tabel2dSumberRekognisiRouter from './routes/tabel2dSumberRekognisi.route.js';
import cplRouter from './routes/cpl.route.js';
import profilLulusanRouter from './routes/profilLulusan.route.js';
import mataKuliahRouter from './routes/mataKuliah.route.js';
import cpmkRouter from './routes/cpmk.route.js';
// ===== C2B – PEMETAAN KURIKULUM =====
import pemetaan2b1Router from './routes/pemetaan2b1.route.js';
import pemetaan2b2Router from './routes/pemetaan2b2.route.js';
import pemetaan2b3Router from './routes/pemetaan2b3.route.js';
import pemetaanCpmkCplRoutes from './routes/pemetaanCpmkCpl.route.js';
// TODO: import route lain setelah dikonversi

const app = express();

// ===== MIDDLEWARES =====
app.use(express.json());
app.use(cookieParser());

// Simple logger (dev only)
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// ===== CORS =====
const ALLOW_ORIGIN = process.env.FRONTEND_ORIGIN?.split(",") || [
  "http://localhost:5173", // vite default
  "http://localhost:3001"  // vite custom port
];

app.use(
  cors({
    origin: ALLOW_ORIGIN,
    credentials: true,
  })
);

// ===== ROOT =====
app.get('/', (req, res) => {
  res.send(
    '✅ Backend API Akreditasi STIKOM PGRI Banyuwangi sudah jalan. Gunakan endpoint /api/* untuk akses data.'
  );
});

// ===== HEALTHCHECK =====
app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

// ===== ROUTES =====
// route login ga butuh auth
app.use('/api', loginRouter);

// semua route setelah ini wajib auth + role normalize
app.use('/api', requireAuth, normalizeRole);

// ===== C1 =====
app.use('/api/pimpinan-upps-ps', pimpinanUppsPsRouter);
app.use('/api/sumber-pendanaan', sumberPendanaanRouter);
app.use('/api/penggunaan-dana', penggunaanDanaRouter);
app.use('/api/beban-kerja-dosen', bebanKerjaDosenRouter);
app.use('/api/kualifikasi-tendik', kualifikasiTendikRouter);
app.use('/api/audit-mutu-internal', auditMutuInternalRouter);

// ===== MASTER DATA =====
app.use('/api/dosen', dosenRouter);
app.use('/api/pegawai', pegawaiRouter);
app.use('/api/ref-jabatan-fungsional', refJabatanFungsionalRouter);
app.use('/api/ref-jabatan-struktural', refJabatanStrukturalRouter);
app.use('/api/tahun-akademik', tahunRouter);
app.use('/api/tendik', tendikRouter);
app.use('/api/unit-kerja', unitKerjaRouter);
app.use('/api/users', usersRouter);

// ===== C2 ====
app.use('/api/tabel2a1-pendaftaran', tabel2a1PendaftaranRouter);
app.use('/api/tabel2a1-mahasiswa-baru-aktif', tabel2a1MahasiswaBaruAktifRouter);
app.use('/api/tabel2a2-keragaman-asal', tabel2a2KeragamanAsalRouter);
app.use('/api/tabel2a3-kondisi-mahasiswa', tabel2a3KondisiMahasiswaRouter);
app.use('/api/tabel2b4-masa-tunggu', tabel2b4MasaTungguRouter);
app.use('/api/tabel2b5-kesesuaian-kerja', tabel2b5KesesuaianKerjaRouter);
app.use('/api/tabel2b6-kepuasan-pengguna', tabel2b6KepuasanPenggunaRouter);
app.use('/api/tabel2c-bentuk-pembelajaran', tabel2cBentukPembelajaranRouter);
app.use('/api/tabel2c-fleksibilitas-pembelajaran', tabel2cFleksibilitasPembelajaranRouter);
app.use('/api/tabel2d-rekognisi-lulusan', tabel2dRekognisiLulusanRouter);
app.use('/api/tabel2d-sumber-rekognisi', tabel2dSumberRekognisiRouter);
app.use('/api/cpl', cplRouter);
app.use('/api/profil-lulusan', profilLulusanRouter);
app.use('/api/mata-kuliah', mataKuliahRouter);
app.use('/api/cpmk', cpmkRouter);
app.use('/api/pemetaan-2b1', pemetaan2b1Router);
app.use('/api/pemetaan-2b2', pemetaan2b2Router);
app.use('/api/pemetaan-2b3', pemetaan2b3Router);
app.use('/api/pemetaan-cpmk-cpl', pemetaanCpmkCplRoutes);



// ===== 404 FALLBACK =====
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ===== ERROR HANDLER =====
app.use((err, _req, res, _next) => {
  console.error('[ERR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || appConfig?.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API ready on http://localhost:${PORT}`);
});

export default app;

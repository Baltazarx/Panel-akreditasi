import { AccessMatrix } from './roles.js';

/**
 * Middleware untuk cek izin akses berdasarkan role/unit & resourceKey
 * Usage:
 * router.get('/', requireAuth, permit('sumber_pendanaan', 'R'), handler)
 * router.post('/', requireAuth, permit('sumber_pendanaan', 'C'), handler)
 * router.delete('/:id/hard', requireAuth, permit('sumber_pendanaan', 'H'), handler)
 */
export function permit(resourceKey, action = 'R') {
  return (req, res, next) => {
    // =======================================================
    // === DEBUGGING: Cek apa isi req.user dari requireAuth ===
    // =======================================================
    console.log('DEBUG [permit]: req.user yang diterima ->', req.user);
    // =======================================================

    const user = req.user;

    if (!user) {
      // Jika req.user kosong, berarti requireAuth gagal menempelkan data
      return res.status(401).json({ error: 'Unauthorized: Data user tidak ditemukan dari token.' });
    }

    const role = user.role?.toLowerCase();
    if (!role) {
      return res.status(403).json({ error: 'Forbidden: Role tidak ditemukan di dalam token user.' });
    }

    // ==== BATASAN HARD DELETE ====
    // Aksi H (Hard Delete) hanya boleh dilakukan oleh WAKET1 / WAKET2 / TPM
    if (action === 'H' && !['waket-1', 'waket-2', 'tpm'].includes(role)) {
      return res.status(403).json({
        error: 'Forbidden: Hanya (WAKET1/WAKET2/TPM) yang boleh melakukan hard delete.',
      });
    }

    // Ambil aturan role dari AccessMatrix
    const roleAccess = AccessMatrix[role] || {};
    const resourceAccess = roleAccess[resourceKey] || roleAccess['*'];

    if (!resourceAccess || resourceAccess[action] !== true) {
      console.error(`DEBUG [permit]: Gagal! Role '${role}' minta aksi '${action}' di resource '${resourceKey}'`);
      return res.status(403).json({ error: 'Forbidden: No access' });
    }

    // Jika berhasil, lanjut ke handler berikutnya
    next();
  };
}

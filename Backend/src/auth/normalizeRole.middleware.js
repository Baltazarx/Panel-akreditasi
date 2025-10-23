// Middleware untuk normalisasi role (biar case-insensitive)
export const normalizeRole = (req, _res, next) => {
  if (req.user && req.user.role) {
    req.user.role = req.user.role.toLowerCase();
  }
  next();
};

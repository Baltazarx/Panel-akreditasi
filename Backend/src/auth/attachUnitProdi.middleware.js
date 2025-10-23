// src/auth/attachUnitProdi.middleware.js
export const attachUnitProdi = (req, _res, next) => {
  if (!req.body.id_unit_prodi && req.user) {
    const { role, id_unit_prodi } = req.user;

    // otomatis isi jika role prodi
    if (role === 'prodi') {
      req.body.id_unit_prodi = id_unit_prodi;
    }
  }
  next();
};

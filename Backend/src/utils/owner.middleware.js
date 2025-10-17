// src/utils/owner.middleware.js
import { AccessMatrix } from '../rbac/roles.js';

export function requireOwnerOrWaket(fetchRowById) {
  return async (req, res, next) => {
    const { id } = req.params;
    const row = await fetchRowById(id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    const userRole = req.user.role;
    const hasWildcardDeletePermission = AccessMatrix[userRole] && AccessMatrix[userRole]["*"] && AccessMatrix[userRole]["*"]['D'];

    const isOwner = row.created_by && row.created_by === req.user.id_user;

    if (isOwner || hasWildcardDeletePermission) {
      req._row = row;
      return next();
    }
    return res.status(403).json({ error: 'Delete allowed only by creator or authorized roles' });
  };
}

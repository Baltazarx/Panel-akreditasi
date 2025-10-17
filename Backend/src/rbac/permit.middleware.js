import { AccessMatrix } from './roles.js';

export function permit(resourceKey) {
  return (req, res, next) => {
    console.log(`Permit Middleware: userRole=${req.user?.role}, resourceKey=${resourceKey}, method=${req.method}`);
    const userRole = req.user?.role;
    if (!userRole) return res.status(401).json({ error: 'Unauthorized: No role found' });

    const method = req.method.toUpperCase();
    const action =
      method === 'GET' ? 'R' :
      method === 'POST' ? 'C' :
      method === 'PUT' ? 'U' :
      method === 'DELETE' ? 'D' : null;

    if (!action) return res.status(405).json({ error: 'Method Not Allowed' });

    const rolePermissions = AccessMatrix[userRole];
    if (!rolePermissions) return res.status(403).json({ error: 'Forbidden: Role permissions not defined' });

    // wildcard
    if (rolePermissions['*']?.[action]) return next();
    // specific resource
    if (rolePermissions[resourceKey]?.[action]) return next();
    if (resourceKey === 'cpl' && method === 'PUT') {
      console.log(`Permit Middleware: CPL PUT Request Denied - userRole=${userRole}, resourceKey=${resourceKey}, action=${action}`);
    }
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  };
}

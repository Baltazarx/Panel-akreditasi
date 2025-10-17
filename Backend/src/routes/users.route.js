import { Router } from 'express';
import { crudFactory } from '../utils/crudFactory.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { permit } from '../rbac/permit.middleware.js';
import bcrypt from 'bcryptjs';

export const usersRouter = Router();

const usersCrud = crudFactory({
  table: 'users',
  idCol: 'id_user',
  allowedCols: ['username', 'password', 'id_unit', 'is_active'],
  resourceKey: 'users',
});

// Custom create to hash password
usersRouter.post('/', requireAuth, permit('users'), async (req, res) => {
  const { password } = req.body;
  if (password) {
    req.body.password = await bcrypt.hash(password, 10);
  }
  return usersCrud.create(req, res);
});

// Custom update to hash password if provided
usersRouter.put('/:id', requireAuth, permit('users'), async (req, res) => {
  const { password } = req.body;
  if (password) {
    req.body.password = await bcrypt.hash(password, 10);
  }
  return usersCrud.update(req, res);
});

usersRouter.get('/', requireAuth, permit('users'), usersCrud.list);
usersRouter.get('/:id', requireAuth, permit('users'), usersCrud.getById);
usersRouter.delete('/:id', requireAuth, permit('users'), usersCrud.remove);

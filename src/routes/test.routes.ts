import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();

router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.get('/admin', authMiddleware, isAdmin, (req, res) => {
  res.json({ message: 'Welcome admin' });
});

export default router;

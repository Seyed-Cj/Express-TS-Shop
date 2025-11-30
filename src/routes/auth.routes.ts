import { Router } from 'express';
import { login, logout, refreshToken, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Signup
router.post('/register', register);

// Login
router.post('/login', login);

// refresh token
router.post("/refresh", refreshToken);

// logout
router.post("/logout", authMiddleware, logout);

export default router;

import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { comparePassword, generateTokens, hashPassword } from '../utils/auth';
import z from 'zod';

const userRepo = AppDataSource.getRepository(User);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parse.error.issues });
    }

    const { email, password } = parse.data;

    const exists = await userRepo.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'User already exists.' });

    const user = userRepo.create({
      email,
      password: await hashPassword(password),
    });
    await userRepo.save(user);

    const { accessToken, refreshToken } = await generateTokens(user, userRepo);

    return res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parse.error.issues });
    }

    const { email, password } = parse.data;

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = await generateTokens(user, userRepo);

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const schema = z.object({ refreshToken: z.string() });
  const parse = schema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ message: 'Validation failed', errors: parse.error.issues });

  try {
    const decoded = (await import('jsonwebtoken')).verify(
      parse.data.refreshToken,
      process.env.JWT_REFRESH_SECRET as string,
    ) as any;

    const user = await userRepo.findOne({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== parse.data.refreshToken)
      return res.status(401).json({ message: 'Invalid refresh token.' });

    const { accessToken } = await generateTokens(user, userRepo, false);

    return res.json({ accessToken });
  } catch (err) {
    console.error('RefreshToken error:', err);
    return res.status(401).json({ message: 'Refresh token expired or invalid.' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (user) {
      user.refreshToken = null;
      await userRepo.save(user);
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

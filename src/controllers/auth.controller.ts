import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken } from '../utils/auth';
import jwt from 'jsonwebtoken';

const userRepo = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: 'Email or password required .' });

  const exists = await userRepo.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: 'User already exists .' });

  const user = userRepo.create({
    email,
    password: await hashPassword(password),
  });

  await userRepo.save(user);

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  user.refreshToken = refreshToken;
  await userRepo.save(user);

  return res.status(201).json({ accessToken, refreshToken });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepo.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'please register' });

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id });
  user.refreshToken = refreshToken;
  await userRepo.save(user);

  return res.status(200).json({ accessToken, refreshToken });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: 'refresh token required .' });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as any;

    const user = await userRepo.findOne({ where: { id: decoded.id } });
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ message: 'Invalid refresh token .' });

    const newAccesssToken = signAccessToken({
      id: user.id,
      role: user.role
    });

    return res.json({ accessToken: newAccesssToken })
  } catch {
    return res.status(401).json({ message: 'Refresh token expired or invalid .' });
  }
}

export const logout = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = req.user.id;

  try {
    const user = await userRepo.findOne({ where: { id: userId } });

    if (user) {
      user.refreshToken = null;
      await userRepo.save(user);
    }

    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
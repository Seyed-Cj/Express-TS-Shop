import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

const SALT_ROUNDS = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15m' });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

export const generateTokens = async (
  user: User,
  userRepo: Repository<User>,
  saveRefresh = true,
) => {
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  let refreshToken: string | undefined;

  if (saveRefresh) {
    refreshToken = signRefreshToken({ id: user.id });
    user.refreshToken = refreshToken;
    await userRepo.save(user);
  }

  return { accessToken, refreshToken };
};

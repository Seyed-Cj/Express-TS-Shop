import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUND = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUND);

export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15min' });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

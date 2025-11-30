import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { comparePassword, hashPassword, signToken } from '../utils/auth';

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

  const token = signToken({ id: user.id, role: user.role });
  return res.status(201).json({ token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userRepo.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'please register' });

  const isValid = await comparePassword(password, user.password);
  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, role: user.role });
  return res.status(201).json({ token });
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: 'No token provided .' });

  const token = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Invalid token format .' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token is not valid .' });
  }
};

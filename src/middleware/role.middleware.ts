import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Access denied .' });

  next();
};

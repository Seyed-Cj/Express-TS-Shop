import express from 'express';
import logger from './middleware/logger.middleware';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';

const app = express();

export const morganStream = {
  write(message: string) {
    const trimmedMessage = message.trim();
    logger.info(trimmedMessage);
  },
};

app.use(express.json());

app.use(morgan('combined', { stream: morganStream }));

app.use('/api/auth', authRoutes);

export default app;

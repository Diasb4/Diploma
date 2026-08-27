import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { topicsRouter } from './routes/topics.js';
import { professorsRouter } from './routes/professors.js';
import { applicationsRouter } from './routes/applications.js';
import { similarityRouter } from './routes/similarity.js';
import { roadmapRouter } from './routes/roadmap.js';
import { notificationsRouter } from './routes/notifications.js';
import { exportRouter } from './routes/export.js';
import { rateLimit } from './middleware/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5000')
    .split(',').map((origin) => origin.trim()).filter(Boolean);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Origin is not allowed'));
    },
    credentials: false
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', rateLimit());

  app.use('/api/auth', authRouter);
  app.use('/api/topics', topicsRouter);
  app.use('/api/professors', professorsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/similarity', similarityRouter);
  app.use('/api/roadmap', roadmapRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/export', exportRouter);
  app.get('/api/health', (req, res) => res.json({
    status: 'ok', system: 'AITU Diploma API', version: '3.0.0', timestamp: new Date().toISOString()
  }));

  const distPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ error: 'API endpoint not found.' });
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'), (error) => {
      if (error) res.status(503).send('<!doctype html><html lang="ru"><head><title>AITU Diploma API</title></head><body><h1>AITU Diploma API работает</h1></body></html>');
    });
  });

  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(error);
    console.error(error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  });
  return app;
};

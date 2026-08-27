import { NextFunction, Request, Response } from 'express';
import { AuthPayload } from '../types.js';
import { verifySessionToken } from '../services/session.js';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Требуется действующая сессия AITU.' });
    return;
  }
  req.auth = payload;
  next();
};

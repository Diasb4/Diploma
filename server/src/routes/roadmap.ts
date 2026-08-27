import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { requireAuth } from '../middleware/auth.js';

export const roadmapRouter = Router();

/**
 * GET /api/roadmap
 */
roadmapRouter.get('/', (req: Request, res: Response): void => {
  res.json(db.milestones);
});

/**
 * PUT /api/roadmap/:id/status
 */
roadmapRouter.put('/:id/status', requireAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status, progress } = req.body;

  const milestone = db.milestones.find(m => m.id === id);
  if (!milestone) {
    res.status(404).json({ error: 'Этап не найден' });
    return;
  }

  if (status && ['completed', 'in_progress', 'pending'].includes(status)) milestone.status = status;
  if (progress !== undefined && Number(progress) >= 0 && Number(progress) <= 100) milestone.progress = Number(progress);

  db.save();

  res.json(milestone);
});

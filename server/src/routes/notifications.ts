import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

/**
 * GET /api/notifications/:studentId
 */
notificationsRouter.get('/:studentId', requireAuth, (req: Request, res: Response): void => {
  const { studentId } = req.params;
  if (studentId !== req.auth!.studentId) {
    res.status(403).json({ error: 'Нет доступа к этим уведомлениям.' });
    return;
  }
  const list = db.notifications.filter(n => n.studentId === studentId || n.studentId === 'all');
  res.json(list);
});

/**
 * PUT /api/notifications/:id/read
 */
notificationsRouter.put('/:id/read', requireAuth, (req: Request, res: Response): void => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif && (notif.studentId === req.auth!.studentId || notif.studentId === 'all')) {
    notif.isRead = true;
    db.save();
  }
  res.json({ success: true });
});

/**
 * POST /api/notifications/mark-all-read
 */
notificationsRouter.post('/mark-all-read', requireAuth, (req: Request, res: Response): void => {
  const studentId = req.auth!.studentId;
  db.notifications.forEach(n => {
    if (n.studentId === studentId || n.studentId === 'all') {
      n.isRead = true;
    }
  });
  db.save();
  res.json({ success: true });
});

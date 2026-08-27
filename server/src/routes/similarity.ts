import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { similarityEngine } from '../services/similarityEngine.js';

export const similarityRouter = Router();

/**
 * POST /api/similarity/check
 */
similarityRouter.post('/check', (req: Request, res: Response): void => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Пожалуйста, введите формулировку темы.' });
    return;
  }

  const result = similarityEngine.checkTopicSimilarity(title, description || '', db.topics);
  res.json(result);
});


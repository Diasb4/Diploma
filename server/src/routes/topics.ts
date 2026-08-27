import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { similarityEngine } from '../services/similarityEngine.js';
import { Topic } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';

export const topicsRouter = Router();

/**
 * GET /api/topics
 * Search, filter and sort topics
 */
topicsRouter.get('/', (req: Request, res: Response): void => {
  let list = [...db.topics];
  const { school, track, difficulty, language, onlyAvailable, search, sortBy } = req.query;

  if (school && school !== 'ALL') {
    list = list.filter(t => t.school === school);
  }
  if (track && track !== 'ALL') {
    list = list.filter(t => t.track === track);
  }
  if (difficulty && difficulty !== 'ALL') {
    list = list.filter(t => t.difficulty === difficulty);
  }
  if (language && language !== 'ALL') {
    list = list.filter(t => t.languages?.includes(String(language)));
  }
  if (onlyAvailable === 'true') {
    list = list.filter(t => t.availableSlots > 0);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.techStack?.some(tech => tech.toLowerCase().includes(q)) ||
      t.supervisorName?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === 'title_asc') {
    list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  } else if (sortBy === 'school') {
    list.sort((a, b) => a.school.localeCompare(b.school));
  } else if (sortBy === 'slots_desc') {
    list.sort((a, b) => b.availableSlots - a.availableSlots);
  }

  res.json({
    total: list.length,
    topics: list
  });
});

/**
 * GET /api/topics/:id
 */
topicsRouter.get('/:id', (req: Request, res: Response): void => {
  const topic = db.topics.find(t => t.id === req.params.id || t.code === req.params.id);
  if (!topic) {
    res.status(404).json({ error: 'Тема не найдена' });
    return;
  }
  res.json(topic);
});

/**
 * POST /api/topics/propose
 * Propose a student custom topic with anti-duplicate validation
 */
topicsRouter.post('/propose', requireAuth, (req: Request, res: Response): void => {
  const { title, description, school, track, supervisorName, techStack, expectedResults, studentId } = req.body;

  if (typeof title !== 'string' || title.trim().length < 10 || typeof description !== 'string' || description.trim().length < 30 || typeof school !== 'string') {
    res.status(400).json({ error: 'Пожалуйста, заполните название темы, описание и выберите школу.' });
    return;
  }

  // Check similarity
  const simResult = similarityEngine.checkTopicSimilarity(title, description, db.topics);

  if (simResult.verdict === 'DUPLICATE') {
    res.status(409).json({
      error: 'Тема отклонена из-за высокого уровня совпадения с существующими проектами.',
      similarity: simResult
    });
    return;
  }

  const customId = crypto.randomUUID();
  const customCode = `${school}-C${crypto.randomInt(100, 1000)}`;

  const newTopic: Topic = {
    id: customId,
    code: customCode,
    title: title.trim(),
    description: description.trim(),
    school,
    track: track || 'Custom Initiative / Startup',
    difficulty: 'Средний',
    languages: ['RU', 'EN'],
    techStack: Array.isArray(techStack) ? techStack : ['Full-Stack', 'Cloud'],
    expectedResults: Array.isArray(expectedResults) ? expectedResults : ['Прототип системы', 'Документация'],
    maxStudents: 3,
    availableSlots: 2, // 1 slot occupied by proposer
    supervisorName: supervisorName || 'На согласовании кафедры',
    isCustom: true,
    status: 'pending'
  };

  db.topics.unshift(newTopic);

  // Add notification
  const notificationStudentId = req.auth?.studentId || studentId;
  if (notificationStudentId) {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      studentId: notificationStudentId,
      title: 'Инициативная тема зарегистрирована',
      message: `Ваша тема «${title}» (${customCode}) передана на согласование выпускающей школе.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  db.save();

  res.status(201).json({
    topic: newTopic,
    similarity: simResult,
    message: 'Тема успешно отправлена на утверждение кафедре AITU!'
  });
});

import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createSessionToken } from '../services/session.js';
import { db } from '../services/storage.js';
import { StudentUser } from '../types.js';

export const authRouter = Router();
const schools = new Set(['SIS', 'SAIDS', 'SSE', 'SCY', 'SCI', 'SDPA', 'SGED']);

authRouter.post('/login', (req: Request, res: Response): void => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@astanait\.edu\.kz$/.test(email)) {
    res.status(400).json({ error: 'Используйте корпоративную почту @astanait.edu.kz.' });
    return;
  }

  let student = db.students.find((item) => item.email.toLowerCase() === email);
  if (!student) {
    const requestedSchool = String(req.body.school || 'SIS').toUpperCase();
    student = {
      id: crypto.randomUUID(),
      email,
      fullName: String(req.body.fullName || email.split('@')[0].replace(/[._-]+/g, ' ')).trim(),
      studentId: String(req.body.studentId || crypto.randomInt(220000000, 229999999)),
      school: schools.has(requestedSchool) ? requestedSchool : 'SIS',
      track: String(req.body.track || 'Software Engineering'),
      gpa: 0,
      skills: [],
      bio: '',
      createdAt: new Date().toISOString()
    } satisfies StudentUser;
    db.students.push(student);
    db.save();
  }

  const token = createSessionToken({ userId: student.id, studentId: student.studentId, email: student.email });
  res.json({ token, user: student });
});

authRouter.get('/profile', requireAuth, (req: Request, res: Response): void => {
  const student = db.students.find((item) => item.id === req.auth!.userId);
  if (!student) {
    res.status(404).json({ error: 'Профиль не найден.' });
    return;
  }
  res.json(student);
});

authRouter.put('/profile', requireAuth, (req: Request, res: Response): void => {
  const student = db.students.find((item) => item.id === req.auth!.userId);
  if (!student) {
    res.status(404).json({ error: 'Профиль не найден.' });
    return;
  }
  const { fullName, gpa, skills, bio, githubUrl, linkedinUrl, track, school } = req.body;
  if (typeof fullName === 'string' && fullName.trim().length >= 2) student.fullName = fullName.trim();
  if (gpa !== undefined && Number(gpa) >= 0 && Number(gpa) <= 4) student.gpa = Number(gpa);
  if (Array.isArray(skills)) student.skills = skills.map(String).map((value) => value.trim()).filter(Boolean).slice(0, 20);
  if (typeof bio === 'string') student.bio = bio.trim().slice(0, 1000);
  if (typeof githubUrl === 'string') student.githubUrl = githubUrl.trim();
  if (typeof linkedinUrl === 'string') student.linkedinUrl = linkedinUrl.trim();
  if (typeof track === 'string' && track.trim()) student.track = track.trim();
  if (typeof school === 'string' && schools.has(school)) student.school = school;
  db.save();
  res.json(student);
});

// Backward-compatible profile URL used by early clients, now protected.
authRouter.get('/profile/:id', requireAuth, (req: Request, res: Response): void => {
  if (req.params.id !== req.auth!.userId && req.params.id !== req.auth!.studentId) {
    res.status(403).json({ error: 'Нет доступа к этому профилю.' });
    return;
  }
  const student = db.students.find((item) => item.id === req.auth!.userId);
  res.json(student);
});

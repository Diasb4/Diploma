import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { lockManager } from '../services/mutex.js';
import { Application, TeamMember } from '../types.js';
import { requireAuth } from '../middleware/auth.js';
import crypto from 'crypto';

export const applicationsRouter = Router();

/**
 * POST /api/applications/reserve
 * Atomic slot reservation with Race Condition Prevention & Cross-School validation
 */
applicationsRouter.post('/reserve', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { topicId, members, projectDescription } = req.body;

  if (!topicId || !Array.isArray(members) || members.length === 0) {
    res.status(400).json({ error: 'Необходимо указать тему и хотя бы одного участника команды.' });
    return;
  }

  if (members.length > 3) {
    res.status(400).json({ error: 'Максимальный размер команды в AITU — 3 студента.' });
    return;
  }

  const validMembers = members.every((member: unknown) => {
    if (!member || typeof member !== 'object') return false;
    const value = member as Record<string, unknown>;
    return ['fullName', 'studentId', 'school', 'track', 'email', 'role'].every((key) => typeof value[key] === 'string' && String(value[key]).trim());
  });
  if (!validMembers) {
    res.status(400).json({ error: 'Заполните обязательные поля каждого участника команды.' });
    return;
  }

  // Acquire Lock on the specific topic to prevent race condition
  try {
    const result = await lockManager.acquire(`topic:${topicId}`, async () => {
      const topic = db.topics.find(t => t.id === topicId);
      if (!topic) {
        throw { status: 404, message: 'Тема не найдена в каталоге.' };
      }

      // Check available slots
      if (topic.availableSlots < members.length) {
        throw {
          status: 409,
          message: `Недостаточно свободных мест по данной теме. Доступно: ${topic.availableSlots}, запрошено мест: ${members.length}.`
        };
      }

      const captain = members[0] as TeamMember;
      if (!captain || !captain.fullName || !captain.studentId) {
        throw { status: 400, message: 'Укажите полные данные капитана команды.' };
      }
      if (captain.studentId !== req.auth!.studentId && captain.email.toLowerCase() !== req.auth!.email.toLowerCase()) {
        throw { status: 403, message: 'Капитан заявки должен совпадать с текущим профилем.' };
      }

      // Rule: Captain must belong to the topic's school
      if (captain.school !== topic.school) {
        throw {
          status: 400,
          message: `Правило AITU: Капитан команды (${captain.fullName}) обязан быть студентом выпускающей школы темы (${topic.school}). Текущая школа капитана: ${captain.school}.`
        };
      }

      // Check if any member already has an active reservation
      const memberIds = new Set(members.map((m: TeamMember) => m.studentId));
      for (const app of db.applications) {
        if (app.status !== 'REJECTED') {
          const conflicting = app.members.find(m => memberIds.has(m.studentId));
          if (conflicting) {
            throw {
              status: 409,
              message: `Студент ${conflicting.fullName} (ID: ${conflicting.studentId}) уже зарегистрирован в заявке ${app.topicCode}.`
            };
          }
        }
      }

      // Decrement available slots atomically
      topic.availableSlots -= members.length;

      // Calculate cross-school approvals
      const schools = Array.from(new Set(members.map((m: TeamMember) => m.school)));
      const isCrossSchool = schools.length > 1;

      const appId = `APP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      const verificationCode = `AITU-${topic.school}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      const newApp: Application = {
        id: appId,
        topicId: topic.id,
        topicTitle: topic.title,
        topicCode: topic.code,
        school: topic.school,
        supervisorName: topic.supervisorName,
        supervisorEmail: topic.supervisorEmail,
        members,
        projectDescription: projectDescription || '',
        status: isCrossSchool ? 'PENDING_DEANERY' : 'PENDING_SUPERVISOR',
        crossSchoolValidation: {
          isCrossSchool,
          participatingSchools: schools,
          approvalsRequired: schools,
          approvalsReceived: [topic.school]
        },
        submittedAt: new Date().toISOString(),
        verificationCode
      };

      db.applications.unshift(newApp);

      // Trigger notifications for all members
      for (const m of members) {
        db.notifications.unshift({
          id: `notif-res-${Date.now()}-${m.studentId}`,
          studentId: m.studentId,
          title: 'Тема забронирована',
          message: `Вы забронировали тему «${topic.title}» (${topic.code}). Код верификации: ${verificationCode}.`,
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      db.save();

      return {
        application: newApp,
        remainingSlots: topic.availableSlots
      };
    });

    res.status(201).json(result);
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'Ошибка при бронировании темы.';
    res.status(status).json({ error: message });
  }
});

/**
 * GET /api/applications/my/:studentId
 */
applicationsRouter.get('/my/:studentId', requireAuth, (req: Request, res: Response): void => {
  const { studentId } = req.params;
  if (studentId !== req.auth!.studentId && studentId.toLowerCase() !== req.auth!.email.toLowerCase()) {
    res.status(403).json({ error: 'Нет доступа к заявкам другого студента.' });
    return;
  }
  const userApps = db.applications.filter(app =>
    app.members.some(m => m.studentId === studentId || m.email?.toLowerCase() === studentId.toLowerCase())
  );
  res.json(userApps);
});

/**
 * DELETE /api/applications/:id
 * Atomic cancellation of application and slot restore
 */
applicationsRouter.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }

    const app = db.applications[appIndex];
    if (!app.members.some((member) => member.studentId === req.auth!.studentId || member.email.toLowerCase() === req.auth!.email.toLowerCase())) {
      res.status(403).json({ error: 'Отменить заявку может только участник команды.' });
      return;
    }

    await lockManager.acquire(`topic:${app.topicId}`, async () => {
      const topic = db.topics.find(t => t.id === app.topicId);
      if (topic) {
        // Restore slots
        topic.availableSlots = Math.min(topic.maxStudents, topic.availableSlots + app.members.length);
      }
      db.applications.splice(appIndex, 1);
      db.save();
    });

    res.json({ message: 'Бронирование успешно отменено. Слоты возвращены в общий доступ.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Не удалось отменить заявку.' });
  }
});

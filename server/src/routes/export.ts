import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';
import { requireAuth } from '../middleware/auth.js';

export const exportRouter = Router();

/**
 * GET /api/export/gost-document/:appId
 * Formats official AITU GOST document data for printing/PDF
 */
exportRouter.get('/gost-document/:appId', requireAuth, (req: Request, res: Response): void => {
  const { appId } = req.params;
  const app = db.applications.find(a => a.id === appId);

  if (!app) {
    res.status(404).json({ error: 'Заявка не найдена' });
    return;
  }
  if (!app.members.some((member) => member.studentId === req.auth!.studentId)) {
    res.status(403).json({ error: 'Нет доступа к документу этой заявки.' });
    return;
  }

  const documentData = {
    university: 'ТОО «Astana IT University»',
    docType: 'ЗАЯВЛЕНИЕ / ЛИСТ СОГЛАСОВАНИЯ ДИПЛОМНОГО ПРОЕКТА',
    academicYear: '2025–2026',
    applicationId: app.id,
    verificationCode: app.verificationCode,
    submittedDate: new Date(app.submittedAt).toLocaleDateString('ru-RU'),
    topic: {
      code: app.topicCode,
      title: app.topicTitle,
      school: app.school,
      supervisor: app.supervisorName,
      supervisorEmail: app.supervisorEmail || `${app.supervisorName.toLowerCase().replace(/\s+/g, '.')}@astanait.edu.kz`
    },
    team: app.members.map((m, idx) => ({
      number: idx + 1,
      role: m.role,
      fullName: m.fullName,
      studentId: m.studentId,
      school: m.school,
      track: m.track,
      email: m.email
    })),
    signaturesRequired: [
      { role: 'Научный руководитель', name: app.supervisorName, status: 'Согласовано электронно' },
      { role: `Декан школы ${app.school}`, name: `Деканат ${app.school}`, status: 'На утверждении' }
    ],
    qrUrl: `https://aitu.edu.kz/verify/diploma?code=${app.verificationCode}`,
    officialNotice: 'Настоящий проектный документ сформирован в студенческом приложении AITU Diploma SuperApp для предварительного согласования темы.'
  };

  res.json(documentData);
});

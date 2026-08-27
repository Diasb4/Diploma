import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { Application, AppNotification, GanttMilestone, Professor, StudentUser, Topic } from '../types.js';

interface PersistedState {
  customTopics: Topic[];
  topicAvailability: Record<string, number>;
  applications: Application[];
  students: StudentUser[];
  notifications: AppNotification[];
  milestones: GanttMilestone[];
}

const supervisorFallbacks: Record<string, { name: string; email: string; telegram: string }> = {
  SIS: { name: 'Серик Ахметов', email: 's.akhmetov@astanait.edu.kz', telegram: '@akhmetov_aitu' },
  SAIDS: { name: 'Мурат Ибраев', email: 'm.ibrayev@astanait.edu.kz', telegram: '@ibrayev_ml' },
  SSE: { name: 'Алия Касымова', email: 'a.kassymova@astanait.edu.kz', telegram: '@kassymova_dev' },
  SCY: { name: 'Бахыт Нурланов', email: 'b.nurlanov@astanait.edu.kz', telegram: '@nurlanov_sec' },
  SCI: { name: 'Данияр Сейтжанов', email: 'd.seitzhanov@astanait.edu.kz', telegram: '@seitzhanov_media' },
  SDPA: { name: 'Гульнар Омарова', email: 'g.omarova@astanait.edu.kz', telegram: '@omarova_gov' },
  SGED: { name: 'Ерлан Жумабаев', email: 'e.zhumabayev@astanait.edu.kz', telegram: '@zhumabayev_stem' }
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return value.split(/[,;]|\s{2,}/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const initialMilestones = (): GanttMilestone[] => [
  {
    id: 'gantt-m1', phaseId: 1, phaseName: 'Выбор темы', title: 'Выбор темы и согласование руководителя',
    description: 'Зафиксируйте тему, состав команды и получите согласие научного руководителя.',
    startDate: '2025-09-01', endDate: '2025-10-15', status: 'completed', progress: 100, weight: 15,
    requirements: ['Согласие руководителя', 'Лист согласования', 'Состав команды до 3 человек']
  },
  {
    id: 'gantt-m2', phaseId: 2, phaseName: 'Техническое задание', title: 'ТЗ и первая предварительная защита',
    description: 'Подготовьте техническое задание, архитектуру и прототип решения.',
    startDate: '2025-10-16', endDate: '2025-12-25', status: 'in_progress', progress: 60, weight: 25,
    requirements: ['Утверждённое ТЗ', 'Архитектурный прототип', 'Презентация для школы']
  },
  {
    id: 'gantt-m3', phaseId: 3, phaseName: 'Разработка', title: 'MVP, эксперименты и тестирование',
    description: 'Реализуйте продукт, проверьте гипотезы и подготовьте черновик пояснительной записки.',
    startDate: '2026-01-10', endDate: '2026-04-15', status: 'pending', progress: 15, weight: 35,
    requirements: ['Рабочий продукт', 'Тестовое покрытие выше 70%', 'Черновик записки', 'Публикация или патент']
  },
  {
    id: 'gantt-m4', phaseId: 4, phaseName: 'Защита', title: 'Нормоконтроль и финальная защита',
    description: 'Пройдите проверку текста, рецензирование и представьте проект комиссии.',
    startDate: '2026-04-16', endDate: '2026-06-15', status: 'pending', progress: 0, weight: 25,
    requirements: ['Оригинальность не ниже 75%', 'Отзыв руководителя', 'Внешняя рецензия', 'Финальная защита']
  }
];

export class DataStorage {
  public topics: Topic[] = [];
  public professors: Professor[] = [];
  public applications: Application[] = [];
  public students: StudentUser[] = [];
  public notifications: AppNotification[] = [];
  public milestones: GanttMilestone[] = [];
  private readonly statePath: string;
  private readonly database: DatabaseSync;

  constructor(statePath = process.env.DATA_FILE || path.resolve(process.cwd(), 'data/runtime-state.sqlite')) {
    this.statePath = path.resolve(statePath);
    fs.mkdirSync(path.dirname(this.statePath), { recursive: true });
    this.database = new DatabaseSync(this.statePath);
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    this.initData();
  }

  private initData() {
    const dataDir = path.resolve(process.cwd(), 'data');
    const professorsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'professors.json'), 'utf8')) as any[];
    this.professors = professorsRaw.map((p, index) => ({
      id: String(p.id || `prof-${index + 1}`),
      name: String(p.name || 'Преподаватель AITU'),
      position: String(p.position || 'Преподаватель'),
      department: String(p.department || 'Astana IT University'),
      email: String(p.email || `prof.${index + 1}@astanait.edu.kz`),
      telegram: p.telegram ? String(p.telegram) : undefined,
      phone: p.phone ? String(p.phone) : undefined,
      office: p.office ? String(p.office) : undefined,
      freeSlots: Number.isFinite(Number(p.freeSlots)) ? Number(p.freeSlots) : (index % 4 === 0 ? 0 : (index % 3) + 1),
      totalSlots: Number(p.totalSlots || 5),
      interests: toList(p.interests),
      courses: toList(p.courses),
      topicsCount: Number(p.topicsCount || (index % 4) + 1)
    }));

    const topicsDocument = JSON.parse(fs.readFileSync(path.join(dataDir, 'topics.json'), 'utf8')) as { topics?: any[] };
    this.topics = (topicsDocument.topics || []).map((raw, index) => {
      const school = String(raw.school || raw.school_id || 'SIS');
      const fallback = supervisorFallbacks[school] || supervisorFallbacks.SIS;
      const maxStudents = Number(raw.maxStudents || raw.team_size_max || 3);
      return {
        id: String(raw.id || `topic-${index + 1}`),
        code: String(raw.code || raw.id || `${school}-${index + 1}`),
        title: String(raw.title || 'Тема дипломного проекта'),
        description: String(raw.description || ''),
        school,
        track: String(raw.track || 'Общее направление'),
        difficulty: ['Базовый', 'Средний', 'Продвинутый'].includes(raw.difficulty) ? raw.difficulty : 'Средний',
        languages: toList(raw.languages || raw.language || 'RU'),
        techStack: toList(raw.techStack || raw.technologies),
        expectedResults: toList(raw.expectedResults || raw.expected_outcomes),
        maxStudents,
        availableSlots: Number.isFinite(Number(raw.availableSlots)) ? Number(raw.availableSlots) : maxStudents,
        supervisorName: String(raw.supervisorName || fallback.name),
        supervisorEmail: String(raw.supervisorEmail || fallback.email),
        supervisorTelegram: String(raw.supervisorTelegram || fallback.telegram),
        isCustom: Boolean(raw.isCustom),
        status: raw.status || 'approved'
      } satisfies Topic;
    });

    const demoStudent: StudentUser = {
      id: 'student-demo-2026', email: 'student.2026@astanait.edu.kz', fullName: 'Диас Касымов',
      studentId: '220107042', school: 'SIS', track: 'Software Engineering', gpa: 3.84,
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      bio: 'Студент AITU. Интересуюсь распределёнными системами и облачными вычислениями.',
      createdAt: new Date().toISOString()
    };
    this.students = [demoStudent];
    this.milestones = initialMilestones();
    this.notifications = [{
      id: 'notif-1', studentId: demoStudent.studentId, title: 'Каталог готов к работе',
      message: 'Выберите тему, проверьте состав команды и отправьте заявку руководителю.',
      type: 'info', isRead: false, createdAt: new Date().toISOString()
    }];

    this.loadPersistedState();
  }

  private loadPersistedState() {
    try {
      const row = this.database.prepare('SELECT payload FROM app_state WHERE id = 1').get() as { payload?: string } | undefined;
      if (!row?.payload) return;
      const state = JSON.parse(row.payload) as Partial<PersistedState>;
      const customTopics = state.customTopics || [];
      this.topics = [...customTopics, ...this.topics.filter((topic) => !customTopics.some((custom) => custom.id === topic.id))];
      for (const topic of this.topics) {
        const savedSlots = state.topicAvailability?.[topic.id];
        if (Number.isFinite(savedSlots)) topic.availableSlots = Number(savedSlots);
      }
      if (Array.isArray(state.applications)) this.applications = state.applications;
      if (Array.isArray(state.students) && state.students.length) this.students = state.students;
      if (Array.isArray(state.notifications)) this.notifications = state.notifications;
      if (Array.isArray(state.milestones) && state.milestones.length) this.milestones = state.milestones;
    } catch (error) {
      console.error('Не удалось прочитать постоянное хранилище', error);
    }
  }

  public save() {
    const state: PersistedState = {
      customTopics: this.topics.filter((topic) => topic.isCustom),
      topicAvailability: Object.fromEntries(this.topics.map((topic) => [topic.id, topic.availableSlots])),
      applications: this.applications,
      students: this.students,
      notifications: this.notifications,
      milestones: this.milestones
    };
    this.database.prepare(`
      INSERT INTO app_state (id, payload, updated_at)
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
    `).run(JSON.stringify(state), new Date().toISOString());
  }

  public close() {
    this.database.close();
  }
}

export const db = new DataStorage();

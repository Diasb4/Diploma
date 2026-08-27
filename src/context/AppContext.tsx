import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../services/api';
import {
  Application,
  AppNotification,
  AppView,
  Milestone,
  Professor,
  SimilarityResult,
  StudentUser,
  TeamMember,
  Theme,
  ToastMessage,
  Topic
} from '../types';

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSchool: string;
  setSelectedSchool: (school: string) => void;
  studentSchool: string | null;
  setStudentSchool: (school: string | null) => void;
  isSchoolModalOpen: boolean;
  setIsSchoolModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  onlyAvailable: boolean;
  setOnlyAvailable: (value: boolean) => void;
  bookmarkedOnly: boolean;
  setBookmarkedOnly: (value: boolean) => void;
  topicSort: string;
  setTopicSort: (value: string) => void;
  professorSort: string;
  setProfessorSort: (value: string) => void;
  topics: Topic[];
  professors: Professor[];
  filteredTopics: Topic[];
  filteredProfessors: Professor[];
  bookmarkedIds: Set<string>;
  toggleBookmark: (id: string) => void;
  selectedTopic: Topic | null;
  setSelectedTopic: (topic: Topic | null) => void;
  selectedProfessor: Professor | null;
  setSelectedProfessor: (professor: Professor | null) => void;
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
  error: string | null;
  refreshCatalogs: () => Promise<void>;
  token: string | null;
  user: StudentUser | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<StudentUser>) => Promise<void>;
  applications: Application[];
  notifications: AppNotification[];
  milestones: Milestone[];
  reserveTopic: (topicId: string, members: TeamMember[], description: string) => Promise<void>;
  cancelApplication: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateMilestone: (id: string, progress: number, status: Milestone['status']) => Promise<void>;
  checkSimilarity: (title: string, description: string) => Promise<SimilarityResult>;
  proposeTopic: (payload: Record<string, unknown>) => Promise<void>;
  exportApplication: (id: string) => Promise<void>;
  toasts: ToastMessage[];
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const getSavedSession = () => {
  try {
    const token = localStorage.getItem('aitu_token');
    const user = JSON.parse(localStorage.getItem('aitu_user') || 'null') as StudentUser | null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedSession = useMemo(getSavedSession, []);
  const [activeView, setActiveViewState] = useState<AppView>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(() => localStorage.getItem('aitu_student_school') || 'ALL');
  const [studentSchool, setStudentSchoolState] = useState<string | null>(() => localStorage.getItem('aitu_student_school'));
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(() => !localStorage.getItem('aitu_student_school'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [topicSort, setTopicSort] = useState('school');
  const [professorSort, setProfessorSort] = useState('name');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(savedSession.token);
  const [user, setUser] = useState<StudentUser | null>(savedSession.user);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('aitu_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('aitu_bookmarked_topics') || '[]')); }
    catch { return new Set(); }
  });

  const showToast = useCallback((text: string, tone: ToastMessage['tone'] = 'info') => {
    const id = Date.now();
    setToasts((current) => [...current, { id, text, tone }].slice(-3));
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const refreshCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [topicResponse, professorResponse, roadmapResponse] = await Promise.all([
        api.getTopics(), api.getProfessors(), api.getRoadmap()
      ]);
      setTopics(topicResponse.topics);
      setProfessors(professorResponse.professors);
      setMilestones(roadmapResponse);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Не удалось загрузить данные.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPrivateData = useCallback(async (currentToken: string, currentUser: StudentUser) => {
    try {
      const [applicationList, notificationList] = await Promise.all([
        api.getApplications(currentToken, currentUser.studentId),
        api.getNotifications(currentToken, currentUser.studentId)
      ]);
      setApplications(applicationList);
      setNotifications(notificationList);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        localStorage.removeItem('aitu_token');
        localStorage.removeItem('aitu_user');
        setToken(null);
        setUser(null);
        showToast('Сессия завершена. Войдите снова.', 'error');
      }
    }
  }, [showToast]);

  useEffect(() => { void refreshCatalogs(); }, [refreshCatalogs]);
  useEffect(() => {
    if (token && user) void loadPrivateData(token, user);
    else {
      setApplications([]);
      setNotifications([]);
    }
  }, [token, user, loadPrivateData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('aitu_theme', theme);
  }, [theme]);

  const setActiveView = (view: AppView) => {
    setActiveViewState(view);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setStudentSchool = (school: string | null) => {
    setStudentSchoolState(school);
    setSelectedSchool(school || 'ALL');
    if (school) localStorage.setItem('aitu_student_school', school);
    else localStorage.removeItem('aitu_student_school');
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('aitu_bookmarked_topics', JSON.stringify([...next]));
      return next;
    });
  };

  const login = async (email: string) => {
    const result = await api.login(email, studentSchool ? { school: studentSchool } : undefined);
    setToken(result.token);
    setUser(result.user);
    setStudentSchool(result.user.school);
    localStorage.setItem('aitu_token', result.token);
    localStorage.setItem('aitu_user', JSON.stringify(result.user));
    setIsAuthModalOpen(false);
    showToast(`Вход выполнен: ${result.user.fullName}`, 'success');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aitu_token');
    localStorage.removeItem('aitu_user');
    setActiveViewState('topics');
    showToast('Вы вышли из профиля.');
  };

  const updateProfile = async (profile: Partial<StudentUser>) => {
    if (!token) throw new Error('Сначала войдите в профиль.');
    const updated = await api.updateProfile(token, profile);
    setUser(updated);
    localStorage.setItem('aitu_user', JSON.stringify(updated));
    setStudentSchool(updated.school);
    showToast('Профиль сохранён.', 'success');
  };

  const reserveTopic = async (topicId: string, members: TeamMember[], description: string) => {
    if (!token || !user) {
      setIsAuthModalOpen(true);
      throw new Error('Для бронирования войдите через почту AITU.');
    }
    await api.reserve(token, topicId, members, description);
    await Promise.all([refreshCatalogs(), loadPrivateData(token, user)]);
    setSelectedTopic(null);
    setActiveViewState('applications');
    showToast('Заявка отправлена руководителю.', 'success');
  };

  const cancelApplication = async (id: string) => {
    if (!token || !user) return;
    await api.cancelApplication(token, id);
    await Promise.all([refreshCatalogs(), loadPrivateData(token, user)]);
    showToast('Заявка отменена, места возвращены.', 'success');
  };

  const markAllNotificationsRead = async () => {
    if (!token) return;
    await api.markAllNotificationsRead(token);
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
  };

  const updateMilestone = async (id: string, progress: number, status: Milestone['status']) => {
    if (!token) {
      setIsAuthModalOpen(true);
      throw new Error('Войдите, чтобы обновлять прогресс.');
    }
    const updated = await api.updateMilestone(token, id, progress, status);
    setMilestones((current) => current.map((item) => item.id === id ? updated : item));
    showToast('Прогресс обновлён.', 'success');
  };

  const checkSimilarity = (title: string, description: string) => api.checkSimilarity(title, description);

  const proposeTopic = async (payload: Record<string, unknown>) => {
    if (!token) {
      setIsAuthModalOpen(true);
      throw new Error('Войдите, чтобы отправить инициативную тему.');
    }
    await api.proposeTopic(token, payload);
    await refreshCatalogs();
    showToast('Инициативная тема отправлена на рассмотрение.', 'success');
  };

  const exportApplication = async (id: string) => {
    if (!token) return;
    const documentData = await api.exportApplication(token, id);
    const url = URL.createObjectURL(new Blob([JSON.stringify(documentData, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `aitu-application-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = topics.filter((topic) => {
      if (selectedSchool !== 'ALL' && topic.school !== selectedSchool) return false;
      if (onlyAvailable && topic.availableSlots <= 0) return false;
      if (bookmarkedOnly && !bookmarkedIds.has(topic.id)) return false;
      if (!query) return true;
      return [topic.title, topic.description, topic.school, topic.track, topic.supervisorName, ...topic.techStack]
        .some((value) => value.toLowerCase().includes(query));
    });
    return [...list].sort((a, b) => {
      if (topicSort === 'title') return a.title.localeCompare(b.title, 'ru');
      if (topicSort === 'slots') return b.availableSlots - a.availableSlots;
      return a.school.localeCompare(b.school) || a.title.localeCompare(b.title, 'ru');
    });
  }, [topics, selectedSchool, onlyAvailable, bookmarkedOnly, bookmarkedIds, searchQuery, topicSort]);

  const filteredProfessors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = professors.filter((professor) => {
      if (onlyAvailable && professor.freeSlots <= 0) return false;
      if (!query) return true;
      return [professor.name, professor.department, professor.position, professor.email, ...professor.interests]
        .some((value) => value.toLowerCase().includes(query));
    });
    return [...list].sort((a, b) => professorSort === 'slots'
      ? b.freeSlots - a.freeSlots
      : a.name.localeCompare(b.name, 'ru'));
  }, [professors, onlyAvailable, searchQuery, professorSort]);

  return (
    <AppContext.Provider value={{
      activeView, setActiveView, searchQuery, setSearchQuery, selectedSchool, setSelectedSchool,
      studentSchool, setStudentSchool, isSchoolModalOpen, setIsSchoolModalOpen, isAuthModalOpen,
      setIsAuthModalOpen, onlyAvailable, setOnlyAvailable, bookmarkedOnly, setBookmarkedOnly,
      topicSort, setTopicSort, professorSort, setProfessorSort, topics, professors, filteredTopics,
      filteredProfessors, bookmarkedIds, toggleBookmark, selectedTopic, setSelectedTopic,
      selectedProfessor, setSelectedProfessor, theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark'),
      loading, error, refreshCatalogs, token, user, login, logout, updateProfile, applications,
      notifications, milestones, reserveTopic, cancelApplication, markAllNotificationsRead,
      updateMilestone, checkSimilarity, proposeTopic, exportApplication, toasts, dismissToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

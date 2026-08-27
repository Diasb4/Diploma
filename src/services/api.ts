import { Application, AppNotification, Milestone, Professor, SimilarityResult, StudentUser, TeamMember, Topic } from '../types';

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

const request = async <T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error || `Ошибка HTTP ${response.status}`, response.status, body);
  return body as T;
};

export const api = {
  getTopics: () => request<{ total: number; topics: Topic[] }>('/topics?sortBy=school'),
  getProfessors: () => request<{ total: number; professors: Professor[] }>('/professors?limit=500'),
  login: (email: string, profile?: Partial<StudentUser>) => request<{ token: string; user: StudentUser }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, ...profile })
  }),
  updateProfile: (token: string, profile: Partial<StudentUser>) => request<StudentUser>('/auth/profile', {
    method: 'PUT', body: JSON.stringify(profile)
  }, token),
  getApplications: (token: string, studentId: string) => request<Application[]>(`/applications/my/${encodeURIComponent(studentId)}`, {}, token),
  reserve: (token: string, topicId: string, members: TeamMember[], projectDescription: string) => request<{ application: Application; remainingSlots: number }>('/applications/reserve', {
    method: 'POST', body: JSON.stringify({ topicId, members, projectDescription })
  }, token),
  cancelApplication: (token: string, applicationId: string) => request<{ message: string }>(`/applications/${encodeURIComponent(applicationId)}`, { method: 'DELETE' }, token),
  getNotifications: (token: string, studentId: string) => request<AppNotification[]>(`/notifications/${encodeURIComponent(studentId)}`, {}, token),
  markAllNotificationsRead: (token: string) => request<{ success: boolean }>('/notifications/mark-all-read', { method: 'POST', body: '{}' }, token),
  getRoadmap: () => request<Milestone[]>('/roadmap'),
  updateMilestone: (token: string, id: string, progress: number, status: Milestone['status']) => request<Milestone>(`/roadmap/${id}/status`, {
    method: 'PUT', body: JSON.stringify({ progress, status })
  }, token),
  checkSimilarity: (title: string, description: string) => request<SimilarityResult>('/similarity/check', {
    method: 'POST', body: JSON.stringify({ title, description })
  }),
  proposeTopic: (token: string, payload: Record<string, unknown>) => request<{ topic: Topic; similarity: SimilarityResult; message: string }>('/topics/propose', {
    method: 'POST', body: JSON.stringify(payload)
  }, token),
  exportApplication: (token: string, id: string) => request<Record<string, unknown>>(`/export/gost-document/${encodeURIComponent(id)}`, {}, token)
};

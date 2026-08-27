export interface StudentUser {
  id: string;
  email: string;
  fullName: string;
  studentId: string;
  school: string;
  track: string;
  gpa: number;
  skills: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  code: string;
  title: string;
  description: string;
  school: string;
  track: string;
  difficulty: 'Базовый' | 'Средний' | 'Продвинутый';
  languages: string[];
  techStack: string[];
  expectedResults: string[];
  maxStudents: number;
  availableSlots: number;
  supervisorName: string;
  supervisorEmail?: string;
  supervisorTelegram?: string;
  isCustom?: boolean;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Professor {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  telegram?: string;
  phone?: string;
  office?: string;
  freeSlots: number;
  totalSlots: number;
  interests: string[];
  courses: string[];
  topicsCount: number;
}

export interface TeamMember {
  fullName: string;
  studentId: string;
  school: string;
  track: string;
  email: string;
  role: 'Капитан' | 'ML/AI Engineer' | 'Frontend Dev' | 'Backend Dev' | 'Data Analyst' | 'Cybersecurity' | 'Embedded/IoT';
}

export interface Application {
  id: string;
  topicId: string;
  topicTitle: string;
  topicCode: string;
  school: string;
  supervisorName: string;
  supervisorEmail?: string;
  members: TeamMember[];
  projectDescription?: string;
  status: 'PENDING_SUPERVISOR' | 'PENDING_DEANERY' | 'APPROVED' | 'REJECTED';
  crossSchoolValidation: {
    isCrossSchool: boolean;
    participatingSchools: string[];
    approvalsRequired: string[];
    approvalsReceived: string[];
  };
  submittedAt: string;
  approvedAt?: string;
  verificationCode: string;
}

export interface AppNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface GanttMilestone {
  id: string;
  phaseId: number;
  phaseName: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress: number;
  weight: number;
  requirements: string[];
}

export interface AuthPayload {
  userId: string;
  studentId: string;
  email: string;
  expiresAt: number;
}

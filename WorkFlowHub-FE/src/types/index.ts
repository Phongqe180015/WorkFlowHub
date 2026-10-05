export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  status: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'REVIEW';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  category?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  progress?: number;
  dueDate?: string;
  projectId?: number;
}

export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  status: string;
  progressPercent: number;
  totalTasks: number;
  daysRemaining: number;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLog {
  id: number;
  userName: string;
  action: string;
  target: string;
  timeAgo: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileSize: string;
  uploaderName: string;
  downloadUrl?: string;
}

export interface Comment {
  id: number;
  userName: string;
  time: string;
  content: string;
  isSelf?: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  subtitle?: string;
  time: string;
  initials: string;
}

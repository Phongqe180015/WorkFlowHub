export interface ApiResponse<T> {
  success?: boolean;
  status?: string;
  code?: string;
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
  avatar?: string | null;
  status: string;
  role?: string;
  roleId?: number;
  roleName?: string;
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
  currentUserRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subtask {
  id: number | string;
  taskId?: number;
  title: string;
  isCompleted: boolean;
  createdAt?: string;
}

export interface Task {
  id: number;
  taskCode?: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'REVIEW' | string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  category?: string;
  assigneeId?: number | null;
  assigneeName?: string;
  assigneeAvatar?: string;
  sprintId?: number | null;
  sprintName?: string;
  progress?: number;
  dueDate?: string;
  projectId?: number;
  projectName?: string;
  parentTaskId?: number | null;
  subtasks?: Subtask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskPayload {
  projectId: number;
  sprintId?: number | null;
  assigneeId?: number | null;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  taskCode?: string;
  parentTaskId?: number | null;
}

export interface Role {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  projectId: number;
  projectName?: string;
  userId: number;
  userName?: string;
  userEmail?: string;
  roleId?: number;
  roleName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  ownerId: number;
}

export interface CreateProjectMemberPayload {
  projectId: number;
  userId: number;
  roleId?: number;
}

export interface CreateSprintPayload {
  projectId: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Sprint {
  id: number;
  projectId?: number;
  name: string;
  goal?: string;
  status: string;
  progressPercent?: number;
  totalTasks?: number;
  daysRemaining?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
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

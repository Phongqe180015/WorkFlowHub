import type { 
  ApiResponse, 
  AuthResponse, 
  User, 
  PageResponse, 
  Project, 
  ProjectMember, 
  Sprint, 
  Role, 
  CreateProjectPayload, 
  CreateProjectMemberPayload,
  CreateSprintPayload,
  Task,
  CreateTaskPayload,
  CreateSubtaskPayload,
  UpdateSubtaskPayload,
  ActivityLog
} from '../types';

const ERROR_CODE_TRANSLATIONS: Record<string, string> = {
  bad_request_data_missed_field: 'Vui lòng điền đầy đủ các thông tin bắt buộc.',
  bad_request_data_length_invalid: 'Độ dài ký tự nhập vào không hợp lệ hoặc vượt quá giới hạn.',
};

const ENV_API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = ENV_API_URL ? `${ENV_API_URL.replace(/\/$/, '')}/api/v1` : '/api/v1';

export class ApiClient {
  public static getToken(): string | null {
    return localStorage.getItem('workflowhub_token');
  }

  public static setToken(token: string) {
    localStorage.setItem('workflowhub_token', token);
  }

  public static removeToken() {
    localStorage.removeItem('workflowhub_token');
    localStorage.removeItem('workflowhub_refresh_token');
    localStorage.removeItem('workflowhub_user');
    localStorage.removeItem('workflowhub_role');
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${BASE_URL}${cleanEndpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Yêu cầu thất bại (${response.status})`;
      try {
        const errorData = await response.json();
        const rawMsg = errorData.message || errorData.error;
        if (rawMsg) {
          errorMessage = ERROR_CODE_TRANSLATIONS[rawMsg] || rawMsg;
        }
      } catch {
        // Body is not json
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return {} as T;
  }

  public static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public static post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Dedicated Authentication Service mapped directly to Backend APIs
export const AuthService = {
  /**
   * POST /api/v1/auth/login
   */
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const res = await ApiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (res.data?.accessToken) {
      ApiClient.setToken(res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('workflowhub_refresh_token', res.data.refreshToken);
      }
      localStorage.setItem('workflowhub_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  /**
   * POST /api/v1/auth/register
   */
  async register(data: { email: string; password: string; name: string }): Promise<ApiResponse<User>> {
    return ApiClient.post<ApiResponse<User>>('/auth/register', data);
  },

  /**
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      return await ApiClient.post<ApiResponse<void>>('/auth/logout');
    } catch (error) {
      console.warn('API logout failed on server, clearing client session anyway:', error);
      return {
        data: undefined as unknown as void,
        timestamp: new Date().toISOString(),
      };
    } finally {
      ApiClient.removeToken();
    }
  },

  /**
   * POST /api/v1/auth/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    return ApiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
  },
};

export const RoleService = {
  /**
   * GET /api/v1/roles
   */
  async getRoles(page = 0, size = 100): Promise<Role[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Role>>>(`/roles?page=${page}&size=${size}`);
      const content = res.data?.content || (Array.isArray(res.data) ? res.data : []);
      return content;
    } catch (err) {
      console.warn('Failed to fetch roles from API, using fallback roles:', err);
      return [
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'User' },
        { id: 3, name: 'PROJECT_MANAGER' },
        { id: 4, name: 'DEVELOPER' },
        { id: 5, name: 'TESTER' },
        { id: 6, name: 'VIEWER' },
      ];
    }
  },

  /**
   * Lọc và ẩn 2 role: USER và ADMIN
   */
  filterAssignableRoles(roles: Role[]): Role[] {
    return roles.filter((r) => {
      const name = (r.name || '').trim().toUpperCase();
      return name !== 'USER' && name !== 'ADMIN';
    });
  },
};

export const ProjectService = {
  /**
   * GET /api/v1/projects
   */
  async getProjects(search?: string, page = 0, size = 50): Promise<Project[]> {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
      const res = await ApiClient.get<ApiResponse<PageResponse<Project>>>(`/projects${query}`);
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch projects:', err);
      return [];
    }
  },

  /**
   * GET /api/v1/projects/my-project
   */
  async getMyProjects(page = 0, size = 50): Promise<Project[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Project>>>(`/projects/my-project?page=${page}&size=${size}`);
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch my projects:', err);
      return [];
    }
  },

  /**
   * GET /api/v1/projects/{id}
   */
  async getProjectById(id: number): Promise<Project> {
    const res = await ApiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },

  /**
   * POST /api/v1/projects
   */
  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const res = await ApiClient.post<ApiResponse<Project>>('/projects', payload);
    return res.data;
  },

  /**
   * PUT /api/v1/projects/{id}
   */
  async updateProject(id: number, payload: Partial<CreateProjectPayload>): Promise<Project> {
    const res = await ApiClient.put<ApiResponse<Project>>(`/projects/${id}`, payload);
    return res.data;
  },

  /**
   * DELETE /api/v1/projects/{id}
   */
  async deleteProject(id: number): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/projects/${id}`);
  },
};

export const ProjectMemberService = {
  /**
   * GET /api/v1/project-members?search=projectId=={id}
   */
  async getMembersByProjectId(projectId: number): Promise<ProjectMember[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<ProjectMember>>>(
        `/project-members?search=projectId==${projectId}&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch members for projectId=${projectId}:`, err);
      return [];
    }
  },

  /**
   * POST /api/v1/project-members
   */
  async addMember(payload: CreateProjectMemberPayload): Promise<ProjectMember> {
    const res = await ApiClient.post<ApiResponse<ProjectMember>>('/project-members', payload);
    return res.data;
  },

  /**
   * PUT /api/v1/project-members/projects/{projectId}/users/{userId}
   */
  async updateMemberRole(projectId: number, userId: number, roleId: number): Promise<ProjectMember> {
    const res = await ApiClient.put<ApiResponse<ProjectMember>>(
      `/project-members/projects/${projectId}/users/${userId}`,
      { roleId }
    );
    return res.data;
  },

  /**
   * DELETE /api/v1/project-members/projects/{projectId}/users/{userId}
   */
  async removeMember(projectId: number, userId: number): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/project-members/projects/${projectId}/users/${userId}`);
  },
};

export const SprintService = {
  /**
   * GET /api/v1/sprints?search=projectId=={id}
   */
  async getSprintsByProjectId(projectId: number): Promise<Sprint[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Sprint>>>(
        `/sprints?search=projectId==${projectId}&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch sprints for projectId=${projectId}:`, err);
      return [];
    }
  },

  /**
   * POST /api/v1/sprints
   */
  async createSprint(payload: CreateSprintPayload): Promise<Sprint> {
    const res = await ApiClient.post<ApiResponse<Sprint>>('/sprints', payload);
    return res.data;
  },

  /**
   * PUT /api/v1/sprints/{id}
   */
  async updateSprint(id: number, payload: Partial<CreateSprintPayload>): Promise<Sprint> {
    const res = await ApiClient.put<ApiResponse<Sprint>>(`/sprints/${id}`, payload);
    return res.data;
  },

  /**
   * DELETE /api/v1/sprints/{id}
   */
  async deleteSprint(id: number): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/sprints/${id}`);
  },
};

export const UserService = {
  /**
   * GET /api/v1/users
   */
  async getUsers(search?: string, page = 0, size = 100): Promise<User[]> {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
      const res = await ApiClient.get<ApiResponse<PageResponse<User>>>(`/users${query}`);
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch users:', err);
      return [];
    }
  },

  /**
   * PUT /api/v1/users/{id}
   */
  async updateUserRole(id: number, roleId: number): Promise<User> {
    const res = await ApiClient.put<ApiResponse<User>>(`/users/${id}`, { roleId });
    return res.data;
  },
};

export const TaskService = {
  /**
   * GET /api/v1/tasks?search=projectId=={id}
   */
  async getTasksByProjectId(projectId: number): Promise<Task[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Task>>>(
        `/tasks?search=projectId==${projectId}&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch tasks for projectId=${projectId}:`, err);
      return [];
    }
  },

  /**
   * GET /api/v1/tasks?search=sprintId=={id}
   */
  async getTasksBySprintId(sprintId: number): Promise<Task[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Task>>>(
        `/tasks?search=sprintId==${sprintId}&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch tasks for sprintId=${sprintId}:`, err);
      return [];
    }
  },

  /**
   * GET /api/v1/tasks?search=assigneeId=={userId}
   */
  async getMyTasks(userId: number): Promise<Task[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Task>>>(
        `/tasks?search=assigneeId==${userId}&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch tasks for assigneeId=${userId}:`, err);
      return [];
    }
  },

  /**
   * GET /api/v1/tasks
   */
  async getAllTasks(search?: string, page = 0, size = 100): Promise<Task[]> {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&page=${page}&size=${size}` : `?page=${page}&size=${size}`;
      const res = await ApiClient.get<ApiResponse<PageResponse<Task>>>(`/tasks${query}`);
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
      return [];
    }
  },

  /**
   * POST /api/v1/tasks
   */
  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const res = await ApiClient.post<ApiResponse<Task>>('/tasks', payload);
    return res.data;
  },

  /**
   * GET /api/v1/tasks/{id}
   */
  async getTaskById(id: number): Promise<Task> {
    const res = await ApiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  /**
   * PUT /api/v1/tasks/{id}
   */
  async updateTask(id: number, payload: Partial<CreateTaskPayload>): Promise<Task> {
    const res = await ApiClient.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return res.data;
  },

  /**
   * DELETE /api/v1/tasks/{id} (Soft delete)
   */
  async deleteTask(id: number): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/tasks/${id}`);
  },

  /**
   * PUT /api/v1/tasks/{id}/restore
   */
  async restoreTask(id: number): Promise<Task> {
    const res = await ApiClient.put<ApiResponse<Task>>(`/tasks/${id}/restore`);
    return res.data;
  },

  /**
   * DELETE /api/v1/tasks/{id}/permanent
   */
  async permanentDeleteTask(id: number): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/tasks/${id}/permanent`);
  },

  /**
   * GET /api/v1/tasks?search=projectId=={id};isDeleted==true
   */
  async getTrashTasks(projectId: number): Promise<Task[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<Task>>>(
        `/tasks?search=projectId==${projectId};isDeleted==true&page=0&size=100`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn(`Failed to fetch trash tasks for projectId=${projectId}:`, err);
      return [];
    }
  },
};

export const SubtaskApiService = {
  /**
   * GET /api/v1/subtasks/task/{taskId}
   */
  async getSubtasksByTaskId(taskId: number): Promise<any[]> {
    try {
      const res = await ApiClient.get<ApiResponse<any[]>>(`/subtasks/task/${taskId}`);
      return res.data || [];
    } catch (err) {
      console.warn(`Failed to fetch subtasks for taskId=${taskId}:`, err);
      return [];
    }
  },

  /**
   * GET /api/v1/subtasks/{id}
   */
  async getSubtaskById(id: number | string): Promise<any> {
    const res = await ApiClient.get<ApiResponse<any>>(`/subtasks/${id}`);
    return res.data;
  },

  /**
   * POST /api/v1/subtasks
   */
  async createSubtask(payload: CreateSubtaskPayload): Promise<any> {
    const res = await ApiClient.post<ApiResponse<any>>('/subtasks', payload);
    return res.data;
  },

  /**
   * PUT /api/v1/subtasks/{id}
   */
  async updateSubtask(id: number | string, payload: UpdateSubtaskPayload): Promise<any> {
    const res = await ApiClient.put<ApiResponse<any>>(`/subtasks/${id}`, payload);
    return res.data;
  },

  /**
   * DELETE /api/v1/subtasks/{id}
   */
  async deleteSubtask(id: number | string): Promise<void> {
    await ApiClient.delete<ApiResponse<void>>(`/subtasks/${id}`);
  },
};

export const ActivityLogService = {
  /**
   * GET /api/v1/activity-logs
   */
  async getActivityLogs(page = 0, size = 20): Promise<ActivityLog[]> {
    try {
      const res = await ApiClient.get<ApiResponse<PageResponse<ActivityLog>>>(
        `/activity-logs?page=${page}&size=${size}`
      );
      return res.data?.content || (Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to fetch activity logs:', err);
      return [];
    }
  },
};


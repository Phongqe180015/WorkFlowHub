import type { ApiResponse, AuthResponse, User } from '../types';

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
        errorMessage = errorData.message || errorData.error || errorMessage;
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
        status: 'error',
        message: 'Logout API error',
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

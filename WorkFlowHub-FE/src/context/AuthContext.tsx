import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { AuthService } from '../services/api';
import { TokenStorage } from '../utils/tokenStorage';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

export type RoleType = 'ADMIN' | 'USER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';

interface AuthContextType {
  user: User | null;
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  token: string | null;
  login: (token: string, user: User, rememberMe?: boolean) => void;
  logout: (reason?: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 15 minutes of inactivity before auto-logout
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Reads from sessionStorage or localStorage, automatically checks JWT 'exp'
    return TokenStorage.getToken();
  });

  const [user, setUser] = useState<User | null>(() => {
    const validToken = TokenStorage.getToken();
    if (!validToken) return null;
    return TokenStorage.getUser<User>();
  });

  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    const validToken = TokenStorage.getToken();
    if (!validToken) return 'USER';

    const savedRole = TokenStorage.getRole();
    if (savedRole) {
      return savedRole as RoleType;
    }
    const savedUser = TokenStorage.getUser<User>();
    if (savedUser) {
      const rawRole = (savedUser.roleName || (savedUser as any).role || 'USER').toUpperCase();
      return rawRole === 'ADMIN' ? 'ADMIN' : 'USER';
    }
    return 'USER';
  });

  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const clearSessionExpiredMessage = useCallback(() => {
    setSessionExpiredMessage(null);
  }, []);

  const logout = useCallback(async (reason?: string) => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      TokenStorage.clear();
      setToken(null);
      setUser(null);
      setCurrentRole('USER');
      if (reason) {
        setSessionExpiredMessage(reason);
      }
    }
  }, []);

  // Idle Timeout: auto-logout after 15 minutes without user activity
  useIdleTimeout({
    enabled: !!token && !!user,
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: () => {
      logout('Phiên làm việc đã tự động kết thúc do bạn không thao tác trong 15 phút.');
    },
  });

  // Listen for 401 Unauthorized events from ApiClient interceptor
  useEffect(() => {
    const handleAuthExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      logout(message);
    };

    window.addEventListener('workflowhub:auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('workflowhub:auth_expired', handleAuthExpired);
    };
  }, [logout]);

  // Handle OAuth Redirect URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const refreshTokenParam = params.get('refreshToken');
    const userParam = params.get('user');

    if (tokenParam && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        // Default OAuth redirect: session storage (no permanent persistence on reboot)
        login(tokenParam, parsedUser, false);
        if (refreshTokenParam) {
          sessionStorage.setItem('workflowhub_refresh_token', refreshTokenParam);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to parse OAuth redirect params:', err);
      }
    }
  }, []);

  useEffect(() => {
    TokenStorage.saveRole(currentRole);
  }, [currentRole]);

  const login = (newToken: string, newUser: User, rememberMe = false) => {
    const rawRole = (newUser.roleName || (newUser as any).role || 'USER').toUpperCase();
    const normalizedRole: RoleType = rawRole === 'ADMIN' ? 'ADMIN' : 'USER';

    TokenStorage.saveAuth(newToken, newUser, null, rememberMe);

    setToken(newToken);
    setUser(newUser);
    setCurrentRole(normalizedRole);
    setSessionExpiredMessage(null);
  };

  const isAdmin = (user?.roleName || currentRole || '').toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        setCurrentRole,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAdmin,
        sessionExpiredMessage,
        clearSessionExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

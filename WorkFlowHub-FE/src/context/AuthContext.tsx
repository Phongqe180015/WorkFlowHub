import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { AuthService } from '../services/api';

export type RoleType = 'ADMIN' | 'USER' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';

interface AuthContextType {
  user: User | null;
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('workflowhub_token');
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('workflowhub_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    const savedRole = localStorage.getItem('workflowhub_role');
    if (savedRole) {
      return savedRole as RoleType;
    }
    const savedUser = localStorage.getItem('workflowhub_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const rawRole = (parsed.roleName || parsed.role || 'USER').toUpperCase();
        return rawRole === 'ADMIN' ? 'ADMIN' : 'USER';
      } catch {
        // ignore
      }
    }
    return 'USER';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const refreshTokenParam = params.get('refreshToken');
    const userParam = params.get('user');

    if (tokenParam && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        if (refreshTokenParam) {
          localStorage.setItem('workflowhub_refresh_token', refreshTokenParam);
        }
        login(tokenParam, parsedUser);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Failed to parse OAuth redirect params:', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workflowhub_role', currentRole);
  }, [currentRole]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    // Lấy roleName từ backend (ví dụ: 'Admin' hoặc 'User')
    const rawRole = (newUser.roleName || newUser.role || 'USER').toUpperCase();
    const normalizedRole: RoleType = rawRole === 'ADMIN' ? 'ADMIN' : 'USER';

    setCurrentRole(normalizedRole);
    localStorage.setItem('workflowhub_token', newToken);
    localStorage.setItem('workflowhub_user', JSON.stringify(newUser));
    localStorage.setItem('workflowhub_role', normalizedRole);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setToken(null);
      setUser(null);
      setCurrentRole('USER');
      localStorage.removeItem('workflowhub_token');
      localStorage.removeItem('workflowhub_refresh_token');
      localStorage.removeItem('workflowhub_user');
      localStorage.removeItem('workflowhub_role');
    }
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

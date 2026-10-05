import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { AuthService } from '../services/api';

export type RoleType = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER' | 'VIEWER';

interface AuthContextType {
  user: User | null;
  currentRole: RoleType;
  setCurrentRole: (role: RoleType) => void;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('workflowhub_user');
    return saved ? JSON.parse(saved) : {
      id: 1,
      name: 'Minh Trần',
      email: 'minh@workflowhub.vn',
      role: 'ADMIN',
      status: 'active',
      avatar: 'MI',
    };
  });

  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    return (localStorage.getItem('workflowhub_role') as RoleType) || 'ADMIN';
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('workflowhub_token');
  });

  useEffect(() => {
    localStorage.setItem('workflowhub_role', currentRole);
  }, [currentRole]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (newUser.role) {
      setCurrentRole(newUser.role as RoleType);
    }
    localStorage.setItem('workflowhub_token', newToken);
    localStorage.setItem('workflowhub_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('workflowhub_token');
      localStorage.removeItem('workflowhub_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        setCurrentRole,
        token,
        login,
        logout,
        isAuthenticated: !!token,
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

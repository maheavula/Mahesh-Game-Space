import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { apiClient } from '../services/apiClient.js';
import { useToast } from './ToastContext.js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<{ authenticated: boolean; user: User | null }>('/api/system/session');
      if (res.authenticated && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiClient.post<{ user: User }>('/api/auth/login', { email, password: pass });
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const signup = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await apiClient.post<{ user: User }>('/api/auth/signup', { name, email, password: pass, phone });
    setUser(res.user);
    showToast(`Account created successfully! Welcome to Mahesh Game Space.`, 'success');
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      showToast('Logged out safely.', 'info');
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatarUrl?: string }) => {
    const res = await apiClient.put<{ user: User }>('/api/auth/profile', data);
    setUser(res.user);
    showToast('Profile details updated.', 'success');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        updateProfile,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as authApi from '../lib/api/auth';
import { registerRefreshHandler, setAccessToken } from '../lib/api/client';
import { AuthResponse } from '../types/api';

export type UserRole = 'patient' | 'radiologist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  plan?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: Exclude<UserRole, 'admin'>) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'admin'>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const applyAuth = (auth: AuthResponse) => {
    setToken(auth.access_token);
    setAccessToken(auth.access_token);
    setUser(auth.user);
  };

  const login: AuthContextType['login'] = async (email, password, role) => {
    const auth = await authApi.login({ email, password, role });
    applyAuth(auth);
  };

  const adminLogin: AuthContextType['adminLogin'] = async (email, password) => {
    const auth = await authApi.adminLogin({ email, password });
    applyAuth(auth);
  };

  const register: AuthContextType['register'] = async (payload) => {
    const auth = await authApi.register(payload);
    applyAuth(auth);
  };

  const refreshSession: AuthContextType['refreshSession'] = async () => {
    try {
      const auth = await authApi.refresh();
      applyAuth(auth);
      return true;
    } catch {
      setToken(null);
      setAccessToken(null);
      setUser(null);
      return false;
    }
  };

  const logout: AuthContextType['logout'] = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setToken(null);
      setAccessToken(null);
    }
  };

  useEffect(() => {
    registerRefreshHandler(refreshSession);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, adminLogin, register, logout, refreshSession }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function getDashboardPath(role: UserRole): string {
  if (role === 'patient') return '/patient/home';
  if (role === 'radiologist') return '/radiologist/home';
  if (role === 'admin') return '/admin/overview';
  return '/login';
}

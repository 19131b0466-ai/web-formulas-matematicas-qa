'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clearAuth, getAccessToken, getStoredUser, login as apiLogin } from '@/lib/api';

type User = { id: string; email: string; role: string };

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getAccessToken();
    const stored = getStoredUser();
    if (token && stored) setUser(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const isLogin = pathname === '/login';
    if (!user && !isLogin) router.replace('/login');
    if (user && isLogin) router.replace('/dashboard');
  }, [ready, user, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin(email, password);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

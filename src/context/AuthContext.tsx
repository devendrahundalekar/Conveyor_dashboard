import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CONFIG } from '../config';

const KEY = 'conveyor_user';

interface AuthValue {
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function readUser(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Prototype authentication: checks credentials in the browser.
 * Replace login() with a call to your backend when you have one.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(readUser);

  const login = useCallback((username: string, password: string) => {
    const ok = username.trim() === CONFIG.AUTH.username && password === CONFIG.AUTH.password;
    if (ok) {
      try {
        localStorage.setItem(KEY, username.trim());
      } catch {
        /* storage unavailable – session lasts until reload */
      }
      setUser(username.trim());
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

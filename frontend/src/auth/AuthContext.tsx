import { createContext } from 'preact';
import { useContext, useState, useCallback, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { User } from '@/types/auth';
import { login as loginRequest } from '@/api/auth';
import {
  setIdToken,
  clearIdToken,
  setUnauthorizedHandler,
} from './session';

const STORAGE_KEY = 'jualanapp.user';

interface AuthContextValue {
  user: User | null;
  /** Exchange a Google ID token for a user and persist the session. */
  loginWithGoogle(idToken: string): Promise<User>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const loggedIn = await loginRequest(idToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    setIdToken(idToken);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  /** Bersihkan user + token tersimpan. Dipakai logout & saat sesi habis (401). */
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    clearIdToken();
    setUser(null);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    window.google?.accounts?.id.disableAutoSelect();
  }, [clearSession]);

  // Saat backend balas 401, bersihkan sesi → RequireAuth mengarahkan ke /login.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

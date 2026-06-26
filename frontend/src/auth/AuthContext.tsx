import { createContext } from 'preact';
import { useContext, useState, useCallback, useEffect } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { User } from '@/types/auth';
import { login as loginRequest } from '@/api/auth';
import {
  setIdToken,
  clearIdToken,
  setAsUser,
  clearAsUser,
  setUnauthorizedHandler,
} from './session';

const STORAGE_KEY = 'jualanapp.user';
const IMPERSONATE_KEY = 'jualanapp.impersonating';

interface AuthContextValue {
  /** User efektif: target impersonasi bila aktif, selain itu user asli. */
  user: User | null;
  /** User asli yang login (admin) — selalu identitas pemilik id_token. */
  realUser: User | null;
  /** Apakah sedang mengimpersonasi user lain. */
  isImpersonating: boolean;
  /** Exchange a Google ID token for a user and persist the session. */
  loginWithGoogle(idToken: string): Promise<User>;
  /** Mulai impersonasi seorang user (hanya bermakna bila realUser admin). */
  impersonate(target: User): void;
  /** Hentikan impersonasi, kembali menjadi user asli. */
  stopImpersonating(): void;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ComponentChildren }) {
  const [realUser, setRealUser] = useState<User | null>(() =>
    readStored<User>(STORAGE_KEY),
  );
  const [impersonating, setImpersonating] = useState<User | null>(() =>
    readStored<User>(IMPERSONATE_KEY),
  );

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const loggedIn = await loginRequest(idToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    setIdToken(idToken);
    setRealUser(loggedIn);
    return loggedIn;
  }, []);

  const impersonate = useCallback((target: User) => {
    localStorage.setItem(IMPERSONATE_KEY, JSON.stringify(target));
    setAsUser(String(target.id));
    setImpersonating(target);
  }, []);

  const stopImpersonating = useCallback(() => {
    localStorage.removeItem(IMPERSONATE_KEY);
    clearAsUser();
    setImpersonating(null);
  }, []);

  /** Bersihkan seluruh sesi (termasuk impersonasi). Dipakai logout & 401. */
  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IMPERSONATE_KEY);
    clearIdToken();
    clearAsUser();
    setRealUser(null);
    setImpersonating(null);
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

  const user = impersonating ?? realUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        realUser,
        isImpersonating: impersonating != null,
        loginWithGoogle,
        impersonate,
        stopImpersonating,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

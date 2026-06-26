import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import type { ComponentChildren } from 'preact';
import { useAuth } from './AuthContext';

/** Renders children only when authenticated; otherwise redirects to /login. */
export function RequireAuth({ children }: { children: ComponentChildren }) {
  const { user } = useAuth();
  const { route } = useLocation();

  useEffect(() => {
    if (!user) route('/login', true);
  }, [user]);

  if (!user) return null;
  return <>{children}</>;
}

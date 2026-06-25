import type { ComponentChildren } from 'preact';
import { useAuth } from './AuthContext';
import { normalizeRole, can } from './permissions';
import type { Menu, Action } from './permissions';
import { NoAccess } from '@/pages/NoAccess';

interface RequireAccessProps {
  menu: Menu;
  action?: Action;
  children: ComponentChildren;
}

/**
 * Render children hanya bila role user mengizinkan `action` pada `menu`.
 * Bila tidak, tampilkan NoAccess (tanpa redirect → tak ada risiko loop).
 * Auth-nya sendiri ditangani RequireAuth di lapisan luar.
 */
export function RequireAccess({ menu, action = 'view', children }: RequireAccessProps) {
  const { user } = useAuth();
  if (!user) return null;
  const role = normalizeRole(user.role);
  if (!can(role, menu, action)) return <NoAccess />;
  return <>{children}</>;
}

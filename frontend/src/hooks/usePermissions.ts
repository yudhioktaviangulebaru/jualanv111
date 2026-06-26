import { useAuth } from '@/auth/AuthContext';
import { normalizeRole, can } from '@/auth/permissions';
import type { Menu, Action, Role } from '@/auth/permissions';

interface Permissions {
  role: Role;
  /** Apakah user saat ini boleh `action` pada `menu`. */
  can: (menu: Menu, action?: Action) => boolean;
}

/** Hak akses user yang sedang login, terikat ke role-nya. */
export function usePermissions(): Permissions {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  return {
    role,
    can: (menu, action = 'view') => can(role, menu, action),
  };
}

import { useLocation } from 'preact-iso';
import { RiSpyLine, RiCloseLine } from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';
import { roleLabel } from '@/auth/permissions';

/**
 * Bilah peringatan saat admin sedang mengimpersonasi user lain. Selalu tampil
 * di atas konten agar admin sadar konteksnya dan bisa keluar kapan saja.
 */
export function ImpersonationBanner() {
  const { isImpersonating, user, stopImpersonating } = useAuth();
  const { route } = useLocation();

  if (!isImpersonating || !user) return null;

  return (
    <div class="flex flex-wrap items-center gap-2 border-b border-amber-500/30 bg-amber-500/15 px-5 py-2 text-sm text-amber-700 dark:text-amber-300">
      <RiSpyLine size={18} className="shrink-0" />
      <span>
        Sedang sebagai{' '}
        <strong>{user.name || user.email}</strong>{' '}
        <span class="opacity-80">({roleLabel(user.role)})</span>
      </span>
      <button
        type="button"
        class="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-500/40 px-2.5 py-1 font-medium hover:bg-amber-500/20"
        onClick={() => {
          stopImpersonating();
          route('/');
        }}
      >
        <RiCloseLine size={16} />
        Keluar impersonasi
      </button>
    </div>
  );
}

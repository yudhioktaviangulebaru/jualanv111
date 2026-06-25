import { RiLock2Line } from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';
import { buttonClass, Card } from '@/components/ui';

/** Ditampilkan saat user login tapi tidak punya hak akses ke halaman. */
export function NoAccess() {
  const { logout } = useAuth();
  return (
    <div class="mx-auto max-w-lg">
      <Card class="p-8 text-center">
        <div class="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/15 text-red-400">
          <RiLock2Line size={28} />
        </div>
        <h2 class="m-0 mb-1 text-xl font-semibold">Akses ditolak</h2>
        <p class="m-0 mb-6 text-muted">
          Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
        <button class={buttonClass('outline')} onClick={logout}>
          Keluar
        </button>
      </Card>
    </div>
  );
}

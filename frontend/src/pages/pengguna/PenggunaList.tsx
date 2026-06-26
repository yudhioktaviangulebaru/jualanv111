import { useState, useMemo } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import {
  RiAddLine,
  RiSearchLine,
  RiEyeLine,
  RiUserSharedLine,
} from '@remixicon/react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/auth/AuthContext';
import { roleLabel, normalizeRole } from '@/auth/permissions';
import {
  buttonClass,
  inputClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

export function PenggunaList() {
  const { data, loading, error, reload } = useUsers();
  const { realUser, impersonate } = useAuth();
  const { route } = useLocation();
  const isAdmin = normalizeRole(realUser?.role) === 'admin';
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (u) =>
        String(u.name ?? '').toLowerCase().includes(term) ||
        String(u.email).toLowerCase().includes(term),
    );
  }, [data, q]);

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">Pengguna</h2>
          <p class="m-0 text-muted">
            {isAdmin
              ? 'Kelola seluruh akun pengguna lintas toko.'
              : 'Kelola akun pengguna pada toko Anda.'}
          </p>
        </div>
        <a href="/pengguna/create" class={buttonClass('primary')}>
          <RiAddLine size={18} />
          Tambah Pengguna
        </a>
      </div>

      <div class="relative mb-4 max-w-xs">
        <RiSearchLine
          size={18}
          className="pointer-events-none absolute top-2.5 left-3 text-muted"
        />
        <input
          class={`${inputClass} pl-9`}
          placeholder="Cari nama / email…"
          value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
        />
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            message={q ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna.'}
          >
            {!q && (
              <a href="/pengguna/create" class={buttonClass('primary')}>
                <RiAddLine size={18} />
                Tambah Pengguna
              </a>
            )}
          </EmptyState>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">Nama</th>
                  <th class="px-4 py-3 font-medium">Email</th>
                  <th class="px-4 py-3 font-medium">Role</th>
                  {isAdmin && <th class="px-4 py-3 font-medium">Toko</th>}
                  <th class="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    class="border-b border-line last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td class="px-4 py-3">
                      <a
                        href={`/pengguna/${u.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        {u.name || '-'}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-muted">{u.email}</td>
                    <td class="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    {isAdmin && (
                      <td
                        class="max-w-[14rem] truncate px-4 py-3 text-muted"
                        title={u.worksheet_url}
                      >
                        {u.worksheet_url || '—'}
                      </td>
                    )}
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-1">
                        <a
                          href={`/pengguna/${u.id}`}
                          title="Lihat"
                          class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-ink dark:hover:bg-white/5"
                        >
                          <RiEyeLine size={18} />
                        </a>
                        {isAdmin && normalizeRole(u.role) !== 'admin' && (
                          <button
                            type="button"
                            title={`Impersonate ${u.name || u.email}`}
                            class="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-indigo-500/10 hover:text-indigo-500"
                            onClick={() => {
                              impersonate(u);
                              route('/');
                            }}
                          >
                            <RiUserSharedLine size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function RoleBadge({ role }: { role?: string }) {
  return (
    <span class="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-500 capitalize">
      {role ? roleLabel(role) : '-'}
    </span>
  );
}

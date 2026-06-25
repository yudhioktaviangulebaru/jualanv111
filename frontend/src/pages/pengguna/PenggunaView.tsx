import type { ComponentChildren } from 'preact';
import { RiArrowLeftLine } from '@remixicon/react';
import { useUser } from '@/hooks/useUsers';
import { formatDate } from '@/lib/format';
import { Card, Spinner, ErrorState } from '@/components/ui';
import { RoleBadge } from './PenggunaList';

export function PenggunaView({ id }: { id?: string }) {
  const { data: user, loading, error, reload } = useUser(id);

  return (
    <div class="mx-auto max-w-2xl">
      <a
        href="/pengguna"
        class="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink hover:no-underline"
      >
        <RiArrowLeftLine size={16} />
        Kembali ke daftar
      </a>

      <Card class="p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : user ? (
          <>
            <div class="mb-6 flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  class="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div class="grid h-14 w-14 place-items-center rounded-full bg-indigo-500/15 text-lg font-semibold text-indigo-500">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 class="m-0 text-2xl font-semibold">{user.name || '-'}</h2>
                <p class="m-0 text-sm text-muted">{user.email}</p>
              </div>
            </div>

            <dl class="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              <Detail label="Role" value={<RoleBadge role={user.role} />} />
              <Detail label="ID" value={`#${user.id}`} />
              <Detail label="Dibuat" value={formatDate(user.created_at)} />
              <Detail label="Diperbarui" value={formatDate(user.updated_at)} />
            </dl>
          </>
        ) : null}
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: ComponentChildren }) {
  return (
    <div class="bg-surface px-4 py-3">
      <dt class="text-xs text-muted">{label}</dt>
      <dd class="m-0 mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

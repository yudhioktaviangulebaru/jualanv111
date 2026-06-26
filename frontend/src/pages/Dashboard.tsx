import { useMemo } from 'preact/hooks';
import {
  RiBox3Line,
  RiStore2Line,
  RiGroupLine,
  RiUserStarLine,
  RiCashLine,
} from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { normalizeRole } from '@/auth/permissions';
import { Card, Spinner, ErrorState } from '@/components/ui';
import type { RemixIcon } from '@/config/nav';

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === 'admin';
  const firstName = (user?.name ?? user?.email ?? '').split(' ')[0];

  return (
    <div>
      <div class="mb-6">
        <h2 class="m-0 mb-1 text-2xl font-semibold">Halo, {firstName} 👋</h2>
        <p class="m-0 text-muted">
          {isAdmin
            ? 'Ringkasan seluruh toko pada platform.'
            : 'Ringkasan toko kamu hari ini.'}
        </p>
      </div>

      {isAdmin ? <AdminStats /> : <OwnerStats />}
    </div>
  );
}

/** Dashboard admin platform: jumlah owner, kasir, dan toko (distinct worksheet). */
function AdminStats() {
  const { data, loading, error, reload } = useUsers();

  const counts = useMemo(() => {
    const users = data ?? [];
    const stores = new Set<string>();
    let owner = 0;
    let kasir = 0;
    for (const u of users) {
      const role = normalizeRole(u.role);
      if (role === 'owner') owner += 1;
      else if (role === 'kasir') kasir += 1;
      // Toko = worksheet_url unik milik user non-admin.
      if (role !== 'admin' && u.worksheet_url) stores.add(String(u.worksheet_url));
    }
    return { owner, kasir, toko: stores.size };
  }, [data]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      <StatCard label="Owner" value={counts.owner} icon={RiUserStarLine} href="/pengguna" />
      <StatCard label="Kasir" value={counts.kasir} icon={RiCashLine} href="/pengguna" />
      <StatCard label="Toko" value={counts.toko} icon={RiStore2Line} />
    </div>
  );
}

/** Dashboard owner: pintasan menu toko (placeholder angka). */
function OwnerStats() {
  return (
    <>
      <div class="mb-7 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        <StatCard label="Produk" value="—" icon={RiBox3Line} href="/produk" />
        <StatCard label="Gudang" value="—" icon={RiStore2Line} href="/gudang" />
        <StatCard label="Pengguna" value="—" icon={RiGroupLine} href="/pengguna" />
      </div>

      <Card class="p-6">
        <h3 class="mt-0 mb-3 text-lg">Aktivitas terbaru</h3>
        <p class="text-muted">Belum ada data untuk ditampilkan.</p>
      </Card>
    </>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: number | string;
  icon: RemixIcon;
  href?: string;
}) {
  const inner = (
    <>
      <div class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-500">
        <Icon size={24} />
      </div>
      <div>
        <div class="text-2xl leading-tight font-bold tabular-nums">{value}</div>
        <div class="text-sm text-muted">{label}</div>
      </div>
    </>
  );

  const base =
    'flex items-center gap-4 rounded-lg border border-line bg-surface p-5 text-ink no-underline transition';

  return href ? (
    <a href={href} class={`${base} hover:-translate-y-0.5 hover:border-indigo-500`}>
      {inner}
    </a>
  ) : (
    <div class={base}>{inner}</div>
  );
}

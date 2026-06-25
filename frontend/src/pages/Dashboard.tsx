import { RiBox3Line, RiStore2Line, RiGroupLine } from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';

const STATS = [
  { label: 'Produk', value: '—', icon: RiBox3Line, href: '/produk' },
  { label: 'Gudang', value: '—', icon: RiStore2Line, href: '/gudang' },
  { label: 'Pengguna', value: '—', icon: RiGroupLine, href: '/pengguna' },
];

export function Dashboard() {
  const { user } = useAuth();
  const firstName = (user?.name ?? user?.email ?? '').split(' ')[0];

  return (
    <div>
      <div class="mb-6">
        <h2 class="m-0 mb-1 text-2xl font-semibold">Halo, {firstName} 👋</h2>
        <p class="m-0 text-muted">Ringkasan toko kamu hari ini.</p>
      </div>

      <div class="mb-7 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {STATS.map(({ label, value, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            class="flex items-center gap-4 rounded-lg border border-line bg-surface p-5 text-ink no-underline transition hover:-translate-y-0.5 hover:border-indigo-500"
          >
            <div class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-500">
              <Icon size={24} />
            </div>
            <div>
              <div class="text-2xl leading-tight font-bold">{value}</div>
              <div class="text-sm text-muted">{label}</div>
            </div>
          </a>
        ))}
      </div>

      <div class="rounded-lg border border-line bg-surface p-6">
        <h3 class="mt-0 mb-3 text-lg">Aktivitas terbaru</h3>
        <p class="text-muted">Belum ada data untuk ditampilkan.</p>
      </div>
    </div>
  );
}

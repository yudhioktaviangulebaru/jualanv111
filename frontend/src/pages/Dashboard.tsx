import { useMemo, useState } from 'preact/hooks';
import {
  RiBox3Line,
  RiStore2Line,
  RiGroupLine,
  RiUserStarLine,
  RiCashLine,
  RiMoneyDollarCircleLine,
  RiInboxLine,
} from '@remixicon/react';
import { useAuth } from '@/auth/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useTransactions } from '@/hooks/useTransactions';
import { useStockIns } from '@/hooks/useStockIns';
import { useAsync } from '@/hooks/useAsync';
import { listProducts } from '@/api/product';
import { listWarehouses } from '@/api/warehouse';
import { normalizeRole } from '@/auth/permissions';
import { rupiah, formatDate } from '@/lib/format';
import { Card, Spinner, ErrorState, EmptyState } from '@/components/ui';
import { MonthlyBarChart, MONTHS } from '@/components/MonthlyBarChart';
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
      if (role !== 'admin' && u.worksheet_url) stores.add(String(u.worksheet_url));
    }
    return { owner, kasir, toko: stores.size };
  }, [data]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
      <StatCard label="Owner" value={counts.owner} icon={RiUserStarLine} href="/pengguna" tone="indigo" />
      <StatCard label="Kasir" value={counts.kasir} icon={RiCashLine} href="/pengguna" tone="emerald" />
      <StatCard label="Toko" value={counts.toko} icon={RiStore2Line} tone="amber" />
    </div>
  );
}

type Metric = 'penjualan' | 'stockin';

/** Dashboard owner: counts, total penjualan/stockin, chart bulanan, & transaksi terakhir. */
function OwnerStats() {
  const products = useAsync(listProducts, []);
  const warehouses = useAsync(listWarehouses, []);
  const users = useUsers();
  const trx = useTransactions();
  const stockins = useStockIns();

  const totalPenjualan = useMemo(
    () => (trx.data ?? []).reduce((s, t) => s + (Number(t.subtotal) || 0), 0),
    [trx.data],
  );
  const totalStockIn = useMemo(
    () => (stockins.data ?? []).reduce((s, t) => s + (Number(t.total) || 0), 0),
    [stockins.data],
  );

  // --- Chart bulanan ---
  const [metric, setMetric] = useState<Metric>('penjualan');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  /** Tahun yang tersedia dari data (gabungan penjualan + stockin) + tahun ini. */
  const years = useMemo(() => {
    const set = new Set<number>([now.getFullYear()]);
    for (const t of trx.data ?? []) {
      const d = new Date(t.date);
      if (!Number.isNaN(d.getTime())) set.add(d.getFullYear());
    }
    for (const s of stockins.data ?? []) {
      const d = new Date(s.created_at ?? '');
      if (!Number.isNaN(d.getTime())) set.add(d.getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [trx.data, stockins.data]);

  /** 12 nilai (Jan..Des) untuk metric & tahun terpilih. */
  const monthly = useMemo(() => {
    const arr = new Array(12).fill(0);
    if (metric === 'penjualan') {
      for (const t of trx.data ?? []) {
        const d = new Date(t.date);
        if (!Number.isNaN(d.getTime()) && d.getFullYear() === year) {
          arr[d.getMonth()] += Number(t.subtotal) || 0;
        }
      }
    } else {
      for (const s of stockins.data ?? []) {
        const d = new Date(s.created_at ?? '');
        if (!Number.isNaN(d.getTime()) && d.getFullYear() === year) {
          arr[d.getMonth()] += Number(s.total) || 0;
        }
      }
    }
    return arr;
  }, [metric, year, trx.data, stockins.data]);

  const lastTrx = useMemo(
    () =>
      [...(trx.data ?? [])]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [trx.data],
  );

  const metricLabel = metric === 'penjualan' ? 'Penjualan' : 'Stock In';
  const chartLoading = metric === 'penjualan' ? trx.loading : stockins.loading;

  return (
    <div class="flex flex-col gap-7">
      {/* Kartu ringkasan */}
      <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard
          label="Produk"
          value={products.loading ? '—' : products.data?.length ?? 0}
          icon={RiBox3Line}
          href="/produk"
          tone="sky"
        />
        <StatCard
          label="Gudang"
          value={warehouses.loading ? '—' : warehouses.data?.length ?? 0}
          icon={RiStore2Line}
          href="/gudang"
          tone="violet"
        />
        <StatCard
          label="Pengguna"
          value={users.loading ? '—' : users.data?.length ?? 0}
          icon={RiGroupLine}
          href="/pengguna"
          tone="amber"
        />
        <StatCard
          label="Total Penjualan"
          value={trx.loading ? '—' : rupiah(totalPenjualan)}
          icon={RiMoneyDollarCircleLine}
          href="/transaksi"
          tone="emerald"
        />
        <StatCard
          label="Total Stock In"
          value={stockins.loading ? '—' : rupiah(totalStockIn)}
          icon={RiInboxLine}
          href="/stock-in"
          tone="rose"
        />
      </div>

      {/* Chart bulanan */}
      <Card class="p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="m-0 text-lg font-semibold">Grafik bulanan</h3>
            <p class="m-0 text-sm text-muted">
              {metricLabel} {MONTHS[month]} {year}:{' '}
              <span class="font-semibold text-ink">{rupiah(monthly[month])}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="inline-flex overflow-hidden rounded-lg border border-line">
              <MetricButton active={metric === 'penjualan'} onClick={() => setMetric('penjualan')}>
                Penjualan
              </MetricButton>
              <MetricButton active={metric === 'stockin'} onClick={() => setMetric('stockin')}>
                Stock In
              </MetricButton>
            </div>
            <select
              class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500"
              value={String(year)}
              onChange={(e) => setYear(Number((e.target as HTMLSelectElement).value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chartLoading ? (
          <Spinner />
        ) : (
          <MonthlyBarChart
            values={monthly}
            selected={month}
            onSelect={setMonth}
            colorClass={metric === 'penjualan' ? 'fill-indigo-500' : 'fill-emerald-500'}
          />
        )}
      </Card>

      {/* Transaksi terakhir */}
      <Card class="p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h3 class="m-0 text-lg font-semibold">Transaksi terakhir</h3>
          <a
            href="/transaksi"
            class="text-sm text-indigo-500 hover:no-underline"
          >
            Lihat semua
          </a>
        </div>
        {trx.loading ? (
          <Spinner />
        ) : trx.error ? (
          <ErrorState message={trx.error} onRetry={trx.reload} />
        ) : lastTrx.length === 0 ? (
          <EmptyState message="Belum ada transaksi." />
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-3 py-2.5 font-medium">Tanggal</th>
                  <th class="px-3 py-2.5 font-medium">No</th>
                  <th class="px-3 py-2.5 font-medium">Pembayaran</th>
                  <th class="px-3 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {lastTrx.map((t) => (
                  <tr key={t.id} class="border-b border-line last:border-0">
                    <td class="px-3 py-2.5 text-muted">{formatDate(t.date)}</td>
                    <td class="px-3 py-2.5">
                      <a
                        href={`/transaksi/${t.id}`}
                        class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                      >
                        #{t.id}
                      </a>
                    </td>
                    <td class="px-3 py-2.5">{t.payment_type || '—'}</td>
                    <td class="px-3 py-2.5 text-right font-medium tabular-nums">
                      {rupiah(t.subtotal)}
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

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`cursor-pointer px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-indigo-500 text-white' : 'bg-canvas text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

type Tone = 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

/** Kelas warna lengkap per tone (ditulis literal agar terbaca JIT Tailwind). */
const TONES: Record<Tone, { chip: string; hover: string }> = {
  indigo: { chip: 'bg-indigo-500/15 text-indigo-500', hover: 'hover:border-indigo-500' },
  emerald: { chip: 'bg-emerald-500/15 text-emerald-500', hover: 'hover:border-emerald-500' },
  amber: { chip: 'bg-amber-500/15 text-amber-500', hover: 'hover:border-amber-500' },
  sky: { chip: 'bg-sky-500/15 text-sky-500', hover: 'hover:border-sky-500' },
  rose: { chip: 'bg-rose-500/15 text-rose-500', hover: 'hover:border-rose-500' },
  violet: { chip: 'bg-violet-500/15 text-violet-500', hover: 'hover:border-violet-500' },
};

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = 'indigo',
}: {
  label: string;
  value: number | string;
  icon: RemixIcon;
  href?: string;
  tone?: Tone;
}) {
  const t = TONES[tone];
  const inner = (
    <>
      <div class={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${t.chip}`}>
        <Icon size={24} />
      </div>
      <div class="min-w-0">
        <div class="truncate text-2xl leading-tight font-bold tabular-nums">{value}</div>
        <div class="text-sm text-muted">{label}</div>
      </div>
    </>
  );

  const base =
    'flex items-center gap-4 rounded-lg border border-line bg-surface p-5 text-ink no-underline transition';

  return href ? (
    <a href={href} class={`${base} hover:-translate-y-0.5 ${t.hover}`}>
      {inner}
    </a>
  ) : (
    <div class={base}>{inner}</div>
  );
}

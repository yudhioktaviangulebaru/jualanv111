import { useMemo, useState } from 'preact/hooks';
import { RiPrinterLine } from '@remixicon/react';
import { useTransactions } from '@/hooks/useTransactions';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/auth/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { rupiah, formatDate } from '@/lib/format';
import { printReceipt } from '@/lib/receipt';
import {
  buttonClass,
  inputClass,
  Card,
  Spinner,
  ErrorState,
  EmptyState,
} from '@/components/ui';

/** Tanggal hari ini (YYYY-MM-DD) untuk input[type=date]. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Apakah ISO date jatuh pada hari `ymd` (YYYY-MM-DD) menurut waktu lokal. */
function isOnDay(iso: string, ymd: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === ymd;
}

function isTunai(paymentType: string): boolean {
  return paymentType.trim().toLowerCase() === 'tunai';
}

interface Closing {
  cashierId: string;
  name: string;
  count: number;
  total: number;
  tunai: number;
}

/**
 * Laporan / closing kasir dari transaksi yang sudah tercatat (tanpa backend
 * tambahan). Owner melihat seluruh kasir; kasir hanya melihat miliknya sendiri.
 */
export function LaporanKasir() {
  const { data: trx, loading, error, reload } = useTransactions();
  const { data: users } = useUsers();
  const { user } = useAuth();
  const { role } = usePermissions();

  const isOwner = role === 'admin';
  const [day, setDay] = useState(today());

  /** Nama kasir per id (dari daftar user satu worksheet). */
  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users ?? []) {
      map.set(String(u.id), u.name || u.email || `Kasir #${u.id}`);
    }
    return map;
  }, [users]);

  const rows = useMemo<Closing[]>(() => {
    const list = (trx ?? []).filter((t) => isOnDay(t.date, day));
    const byCashier = new Map<string, Closing>();

    for (const t of list) {
      const cashierId = String(t.cashier_id);
      // Kasir hanya boleh melihat closing miliknya sendiri.
      if (!isOwner && cashierId !== String(user?.id)) continue;

      const entry = byCashier.get(cashierId) ?? {
        cashierId,
        name:
          nameById.get(cashierId) ??
          (cashierId === String(user?.id)
            ? user?.name || user?.email || 'Saya'
            : `Kasir #${cashierId}`),
        count: 0,
        total: 0,
        tunai: 0,
      };
      const amount = Number(t.subtotal) || 0;
      entry.count += 1;
      entry.total += amount;
      if (isTunai(t.payment_type)) entry.tunai += amount;
      byCashier.set(cashierId, entry);
    }

    return [...byCashier.values()].sort((a, b) => b.total - a.total);
  }, [trx, day, isOwner, nameById, user?.id, user?.name, user?.email]);

  const grand = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          count: acc.count + r.count,
          total: acc.total + r.total,
          tunai: acc.tunai + r.tunai,
        }),
        { count: 0, total: 0, tunai: 0 },
      ),
    [rows],
  );

  const printSummary = () => {
    printReceipt({
      storeName: isOwner ? 'LAPORAN KASIR' : 'CLOSING KASIR',
      date: new Date(`${day}T00:00:00`).toISOString(),
      cashier: isOwner ? undefined : user?.name || user?.email || undefined,
      paymentType: '-',
      total: grand.total,
      items: rows.map((r) => ({ name: r.name, qty: r.count, price: r.total / (r.count || 1) })),
    });
  };

  return (
    <div>
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="m-0 mb-1 text-2xl font-semibold">
            {isOwner ? 'Laporan Kasir' : 'Closing Saya'}
          </h2>
          <p class="m-0 text-muted">
            {isOwner
              ? 'Ringkasan penjualan per kasir.'
              : 'Ringkasan penjualanmu untuk closing.'}
          </p>
        </div>
        <div class="flex items-end gap-2">
          <div>
            <label class="mb-1 block text-xs text-muted" for="day">
              Tanggal
            </label>
            <input
              id="day"
              type="date"
              class={inputClass}
              value={day}
              max={today()}
              onInput={(e) => setDay((e.target as HTMLInputElement).value)}
            />
          </div>
          <button
            type="button"
            class={buttonClass('outline')}
            onClick={printSummary}
            disabled={rows.length === 0}
          >
            <RiPrinterLine size={16} />
            Cetak
          </button>
        </div>
      </div>

      <Card>
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          <EmptyState message={`Belum ada penjualan pada ${formatDate(`${day}T00:00:00`)}.`} />
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="border-b border-line text-muted">
                <tr>
                  <th class="px-4 py-3 font-medium">Kasir</th>
                  <th class="px-4 py-3 text-right font-medium">Transaksi</th>
                  <th class="px-4 py-3 text-right font-medium">Tunai</th>
                  <th class="px-4 py-3 text-right font-medium">Non-tunai</th>
                  <th class="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.cashierId} class="border-b border-line last:border-0">
                    <td class="px-4 py-3 font-medium">{r.name}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{r.count}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{rupiah(r.tunai)}</td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {rupiah(r.total - r.tunai)}
                    </td>
                    <td class="px-4 py-3 text-right font-semibold tabular-nums">
                      {rupiah(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot class="border-t border-line">
                <tr>
                  <td class="px-4 py-3 font-semibold">Total</td>
                  <td class="px-4 py-3 text-right font-semibold tabular-nums">
                    {grand.count}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold tabular-nums">
                    {rupiah(grand.tunai)}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold tabular-nums">
                    {rupiah(grand.total - grand.tunai)}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold tabular-nums">
                    {rupiah(grand.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

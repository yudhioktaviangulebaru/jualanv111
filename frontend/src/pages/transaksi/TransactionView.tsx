import {
  RiArrowLeftLine,
  RiBox3Line,
  RiDeleteBinLine,
  RiPrinterLine,
} from '@remixicon/react';
import { useTransaction } from '@/hooks/useTransactions';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/auth/AuthContext';
import { rupiah, formatDate } from '@/lib/format';
import { printReceipt } from '@/lib/receipt';
import { buttonClass, Card, Spinner, ErrorState, EmptyState } from '@/components/ui';

export function TransactionView({ id }: { id?: string }) {
  const { data: trx, loading, error, reload } = useTransaction(id);
  const { can } = usePermissions();
  const { user } = useAuth();

  return (
    <div>
      <a
        href="/transaksi"
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
        ) : trx ? (
          <>
            <div class="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 class="m-0 text-2xl font-semibold">Penjualan #{trx.id}</h2>
                <p class="m-0 text-sm text-muted">{formatDate(trx.date)}</p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class={buttonClass('outline', 'px-3 py-1.5')}
                  onClick={() =>
                    printReceipt({
                      transactionId: trx.id,
                      date: trx.date,
                      cashier: user?.name || user?.email || undefined,
                      paymentType: trx.payment_type,
                      total: Number(trx.subtotal),
                      items: trx.details.map((d) => ({
                        name: d.product?.name || d.product_name || `Stok #${d.stock_id}`,
                        qty: Number(d.qty),
                        price: Number(d.price),
                      })),
                    })
                  }
                >
                  <RiPrinterLine size={16} />
                  Cetak struk
                </button>
                {can('cashier', 'delete') && (
                  <a
                    href={`/transaksi/${trx.id}/delete`}
                    class={buttonClass('danger', 'px-3 py-1.5')}
                  >
                    <RiDeleteBinLine size={16} />
                    Hapus
                  </a>
                )}
              </div>
            </div>

            <dl class="mb-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              <Detail label="Tanggal" value={formatDate(trx.date)} />
              <Detail label="Total" value={rupiah(trx.subtotal)} />
              <Detail label="Metode pembayaran" value={trx.payment_type || '—'} />
              <Detail
                label="Status bayar"
                value={trx.has_payment === 'TRUE' ? 'Sudah dibayar' : 'Belum dibayar'}
              />
              <Detail label="Jumlah item" value={String(trx.details.length)} />
              <Detail label="Dibuat" value={formatDate(trx.created_at)} />
            </dl>

            <h3 class="m-0 mb-3 text-lg font-semibold">Detail</h3>
            {trx.details.length === 0 ? (
              <EmptyState message="Tidak ada detail." />
            ) : (
              <div class="overflow-x-auto rounded-lg border border-line">
                <table class="w-full text-left text-sm">
                  <thead class="border-b border-line text-muted">
                    <tr>
                      <th class="px-4 py-3 font-medium">Produk</th>
                      <th class="px-4 py-3 text-right font-medium">Qty</th>
                      <th class="px-4 py-3 text-right font-medium">Harga</th>
                      <th class="px-4 py-3 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trx.details.map((d) => (
                      <tr key={d.id} class="border-b border-line last:border-0">
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-2">
                            <RiBox3Line size={18} className="shrink-0 text-muted" />
                            {d.product ? (
                              <a
                                href={`/produk/${d.product.id}`}
                                class="font-medium text-ink hover:text-indigo-500 hover:no-underline"
                              >
                                {d.product.name}
                              </a>
                            ) : (
                              <span class="text-muted">
                                {d.product_name || `Stok #${d.stock_id}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td class="px-4 py-3 text-right tabular-nums">
                          {Number(d.qty)}
                        </td>
                        <td class="px-4 py-3 text-right tabular-nums">
                          {rupiah(d.price)}
                        </td>
                        <td class="px-4 py-3 text-right tabular-nums">
                          {rupiah(Number(d.total) || Number(d.qty) * Number(d.price))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div class="bg-surface px-4 py-3">
      <dt class="text-xs text-muted">{label}</dt>
      <dd class="m-0 mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

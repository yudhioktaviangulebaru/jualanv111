import { RiArrowLeftLine, RiBox3Line } from '@remixicon/react';
import { useStockIn } from '@/hooks/useStockIns';
import { rupiah, formatDate } from '@/lib/format';
import { Card, Spinner, ErrorState, EmptyState } from '@/components/ui';

export function StockInView({ id }: { id?: string }) {
  const { data: stockIn, loading, error, reload } = useStockIn(id);

  return (
    <div class="mx-auto max-w-3xl">
      <a
        href="/stock-in"
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
        ) : stockIn ? (
          <>
            <div class="mb-6">
              <h2 class="m-0 text-2xl font-semibold">
                {stockIn.invoice_number || `Stock In #${stockIn.id}`}
              </h2>
              <p class="m-0 text-sm text-muted">ID #{stockIn.id}</p>
            </div>

            <dl class="mb-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              <Detail label="Invoice" value={stockIn.invoice_number || '-'} />
              <Detail label="Supplier" value={stockIn.supplier || '-'} />
              <Detail label="Total" value={rupiah(stockIn.total)} />
              <Detail label="Dibuat" value={formatDate(stockIn.created_at)} />
            </dl>

            <h3 class="m-0 mb-3 text-lg font-semibold">Detail</h3>
            {stockIn.details.length === 0 ? (
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
                    {stockIn.details.map((d) => (
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
                              <span class="text-muted">Stok #{d.stock_id}</span>
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
                          {rupiah(Number(d.qty) * Number(d.price))}
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

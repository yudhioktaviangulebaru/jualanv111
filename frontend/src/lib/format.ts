/** Format angka jadi Rupiah (tanpa desimal). */
export function rupiah(value: number | string | undefined | null): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

/** Format tanggal ISO jadi format Indonesia. */
export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

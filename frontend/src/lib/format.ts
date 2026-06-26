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

/** Format Rupiah ringkas untuk label chart (mis. 1,2 jt / 3,4 M). */
export function rupiahCompact(value: number | string | undefined | null): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return '-';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)} rb`;
  return String(Math.round(n));
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

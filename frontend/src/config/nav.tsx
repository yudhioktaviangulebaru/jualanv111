import {
  RiDashboardLine,
  RiBox3Line,
  RiStore2Line,
  RiInboxLine,
  RiGroupLine,
  RiShoppingCart2Line,
  RiFileChartLine,
} from '@remixicon/react';

import type { Menu } from '@/auth/permissions';

/** Tipe komponen ikon Remix (tree-shakeable, tanpa font). */
export type RemixIcon = typeof RiDashboardLine;

export interface NavItem {
  path: string;
  /** Kunci menu untuk pengecekan hak akses (lihat auth/permissions.ts). */
  menu: Menu;
  label: string;
  icon: RemixIcon;
}

/** Sidebar menu, sejalan dengan resource backend (engine.js). */
export const NAV_ITEMS: NavItem[] = [
  { path: '/', menu: 'dashboard', label: 'Dashboard', icon: RiDashboardLine },
  { path: '/produk', menu: 'produk', label: 'Produk', icon: RiBox3Line },
  { path: '/gudang', menu: 'gudang', label: 'Gudang', icon: RiStore2Line },
  { path: '/stock-in', menu: 'stock-in', label: 'Stock In', icon: RiInboxLine },
  { path: '/transaksi', menu: 'cashier', label: 'Penjualan', icon: RiShoppingCart2Line },
  { path: '/laporan', menu: 'laporan', label: 'Laporan Kasir', icon: RiFileChartLine },
  { path: '/pengguna', menu: 'pengguna', label: 'Pengguna', icon: RiGroupLine },
];

/** Judul halaman untuk navbar berdasarkan path aktif. */
export function titleForPath(path: string): string {
  return NAV_ITEMS.find((i) => i.path === path)?.label ?? 'JualanApp';
}

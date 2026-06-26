/**
 * auth/permissions.ts
 * Hak akses berbasis role (RBAC) — logika murni, tanpa dependensi React.
 *
 * Empat role berbeda (lihat .task.md):
 *   admin  -> superadmin platform: kelola SEMUA user (termasuk owner),
 *             dashboard lintas toko (count owner/kasir/toko). Akses excel utama.
 *   owner  -> pemilik toko: hanya tokonya sendiri (worksheet-nya). Kelola user
 *             kasir & gudang, lihat laporan kasir, dan seluruh menu toko.
 *   kasir  -> cek stok, transaksi penjualan, closing miliknya sendiri.
 *   gudang -> cek stok, stock in.
 *   guest  -> tidak ada akses (role tak dikenal diperlakukan sebagai guest).
 */

export type Role = 'admin' | 'owner' | 'kasir' | 'gudang' | 'guest';
export type Menu =
  | 'dashboard'
  | 'produk'
  | 'gudang'
  | 'stock-in'
  | 'pengguna'
  | 'cashier'
  | 'laporan';
export type Action = 'view' | 'create' | 'edit' | 'delete';

/** Label tampilan role. */
export function roleLabel(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'admin':
      return 'Admin';
    case 'owner':
      return 'Owner';
    case 'kasir':
      return 'Kasir';
    case 'gudang':
      return 'Gudang';
    default:
      return 'Guest';
  }
}

/**
 * Role yang boleh dibuat oleh `role` saat menambah user.
 * - admin → owner, kasir, gudang
 * - owner → kasir, gudang
 * - lainnya → tidak boleh menambah user
 */
export function creatableRoles(role: Role): Array<{ value: Role; label: string }> {
  const all: Array<{ value: Role; label: string }> = [
    { value: 'owner', label: 'Owner' },
    { value: 'kasir', label: 'Kasir' },
    { value: 'gudang', label: 'Gudang' },
  ];
  if (role === 'admin') return all;
  if (role === 'owner') return all.filter((r) => r.value !== 'owner');
  return [];
}

/** Normalisasi nilai role mentah dari backend → Role yang dikenal. */
export function normalizeRole(role: string | null | undefined): Role {
  switch ((role ?? '').trim().toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'owner':
      return 'owner';
    case 'kasir':
      return 'kasir';
    case 'gudang':
      return 'gudang';
    default:
      return 'guest';
  }
}

type ActionSet = ReadonlySet<Action>;
const ALL: ActionSet = new Set<Action>(['view', 'create', 'edit', 'delete']);

/** Hak akses eksplisit tiap role. Menu yang tidak tercantum = tidak boleh. */
const ACL: Record<Role, Partial<Record<Menu, ActionSet>>> = {
  // Platform: hanya dashboard lintas toko & manajemen seluruh user.
  admin: {
    dashboard: new Set<Action>(['view']),
    pengguna: ALL,
  },
  // Pemilik toko: seluruh menu toko + kelola user (kasir/gudang).
  owner: {
    dashboard: new Set<Action>(['view']),
    produk: ALL,
    gudang: ALL,
    'stock-in': new Set<Action>(['view', 'create']),
    cashier: new Set<Action>(['view', 'create', 'delete']),
    laporan: new Set<Action>(['view']),
    pengguna: ALL,
  },
  kasir: {
    // Transaksi (tanpa hapus), cek produk & stok, closing sendiri.
    cashier: new Set<Action>(['view', 'create']),
    produk: new Set<Action>(['view']),
    gudang: new Set<Action>(['view']),
    laporan: new Set<Action>(['view']),
  },
  gudang: {
    'stock-in': new Set<Action>(['view', 'create']),
    produk: new Set<Action>(['view', 'create']),
    gudang: new Set<Action>(['view']),
  },
  guest: {},
};

/** Apakah `role` boleh melakukan `action` pada `menu`. */
export function can(role: Role, menu: Menu, action: Action = 'view'): boolean {
  return ACL[role]?.[menu]?.has(action) ?? false;
}

/** Apakah `role` boleh membuka (view) sebuah menu. */
export function canViewMenu(role: Role, menu: Menu): boolean {
  return can(role, menu, 'view');
}

/**
 * auth/permissions.ts
 * Hak akses berbasis role (RBAC) — logika murni, tanpa dependensi React.
 *
 * Sumber: tabel hak akses pada .task.md.
 *   admin  -> semua menu & aksi (*)
 *   kasir  -> Cashier (penuh), Product (hanya view)
 *   gudang -> Stock In (view + create), Product (view + create)
 *   guest  -> tidak ada akses
 *
 * Role tak dikenal (mis. 'user') diperlakukan sebagai guest.
 */

export type Role = 'admin' | 'kasir' | 'gudang' | 'guest';
export type Menu =
  | 'dashboard'
  | 'produk'
  | 'gudang'
  | 'stock-in'
  | 'pengguna'
  | 'cashier';
export type Action = 'view' | 'create' | 'edit' | 'delete';

/** Pilihan role saat membuat user (label tampilan). */
export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'kasir', label: 'Kasir' },
  { value: 'gudang', label: 'Gudang' },
  { value: 'guest', label: 'Guest' },
];

/** Normalisasi nilai role mentah dari backend → Role yang dikenal. */
export function normalizeRole(role: string | null | undefined): Role {
  switch ((role ?? '').trim().toLowerCase()) {
    case 'admin':
      return 'admin';
    case 'kasir':
      return 'kasir';
    case 'gudang':
      return 'gudang';
    default:
      return 'guest';
  }
}

type ActionSet = ReadonlySet<Action>;

/** Hak akses tiap role non-admin. Menu yang tidak tercantum = tidak boleh. */
const NON_ADMIN: Record<Exclude<Role, 'admin'>, Partial<Record<Menu, ActionSet>>> =
  {
    kasir: {
      // Kasir boleh lihat & buat transaksi, TAPI tidak boleh menghapus
      // (transaksi yang sudah tercatat hanya bisa dihapus admin).
      cashier: new Set<Action>(['view', 'create']),
      produk: new Set<Action>(['view']),
    },
    gudang: {
      'stock-in': new Set<Action>(['view', 'create']),
      produk: new Set<Action>(['view', 'create']),
    },
    guest: {},
  };

/** Apakah `role` boleh melakukan `action` pada `menu`. */
export function can(role: Role, menu: Menu, action: Action = 'view'): boolean {
  if (role === 'admin') return true;
  return NON_ADMIN[role]?.[menu]?.has(action) ?? false;
}

/** Apakah `role` boleh membuka (view) sebuah menu. */
export function canViewMenu(role: Role, menu: Menu): boolean {
  return can(role, menu, 'view');
}

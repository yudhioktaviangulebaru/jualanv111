/**
 * auth/permissions.ts
 * Hak akses berbasis role (RBAC) — logika murni, tanpa dependensi React.
 *
 * Sumber: tabel hak akses pada .task.md.
 *   admin (Owner) -> semua menu & aksi (*); hanya bisa menambah kasir & gudang
 *   kasir         -> Cashier (penuh), Product (view), Gudang/cek stok (view),
 *                    Laporan kasir (view — closing miliknya sendiri)
 *   gudang        -> Stock In (view + create), Product (view + create),
 *                    Gudang/cek stok (view)
 *   guest         -> tidak ada akses
 *
 * Catatan: peran tertinggi disimpan sebagai 'admin' di backend, tetapi
 * ditampilkan sebagai "Owner" di UI (lihat roleLabel).
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
  | 'cashier'
  | 'laporan';
export type Action = 'view' | 'create' | 'edit' | 'delete';

/**
 * Pilihan role saat Owner membuat user. Owner hanya boleh menambah kasir &
 * gudang — bukan Owner lain maupun guest (lihat .task.md / UserController).
 */
export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: 'kasir', label: 'Kasir' },
  { value: 'gudang', label: 'Gudang' },
];

/** Label tampilan role — 'admin' disebut "Owner" di UI. */
export function roleLabel(role: string | null | undefined): string {
  switch (normalizeRole(role)) {
    case 'admin':
      return 'Owner';
    case 'kasir':
      return 'Kasir';
    case 'gudang':
      return 'Gudang';
    default:
      return 'Guest';
  }
}

/** Normalisasi nilai role mentah dari backend → Role yang dikenal. */
export function normalizeRole(role: string | null | undefined): Role {
  switch ((role ?? '').trim().toLowerCase()) {
    case 'admin':
    case 'owner':
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
      // (transaksi yang sudah tercatat hanya bisa dihapus Owner).
      cashier: new Set<Action>(['view', 'create']),
      produk: new Set<Action>(['view']),
      // Cek stok lewat menu Gudang (hanya lihat).
      gudang: new Set<Action>(['view']),
      // Closing/laporan untuk dirinya sendiri (difilter di halaman).
      laporan: new Set<Action>(['view']),
    },
    gudang: {
      'stock-in': new Set<Action>(['view', 'create']),
      produk: new Set<Action>(['view', 'create']),
      // Cek stok lewat menu Gudang (hanya lihat).
      gudang: new Set<Action>(['view']),
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

/** User record returned by the backend after Google login. */
export interface User {
  id: string | number;
  email: string;
  name?: string;
  picture?: string;
  google_id?: string;
  /** Role hak akses (admin, kasir, gudang, guest, …). */
  role?: string;
  /** URL worksheet milik user; data dikelola di worksheet ini. */
  worksheet_url?: string;
  created_at?: string;
  updated_at?: string;
}

/** Field yang dikirim saat membuat user baru. */
export interface UserInput {
  name: string;
  email: string;
  role: string;
  /** Diisi otomatis dari user yang mendaftarkan; tidak tampil di form. */
  worksheet_url?: string;
}

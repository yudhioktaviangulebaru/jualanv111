/**
 * Penyimpanan sesi (Google id_token) — satu sumber kebenaran yang dipakai
 * bersama oleh AuthContext (React) dan api/client.ts (non-React).
 *
 * Token dipersist di localStorage agar bertahan saat reload, dan dilampirkan
 * otomatis ke tiap request oleh api client.
 */

const TOKEN_KEY = 'jualanapp.id_token';
const AS_USER_KEY = 'jualanapp.as_user';

/** Ambil id_token tersimpan, atau null bila belum login. */
export function getIdToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Simpan id_token (dipanggil saat login berhasil). */
export function setIdToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* abaikan: storage tidak tersedia */
  }
}

/** Hapus id_token (logout / sesi habis). */
export function clearIdToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan */
  }
}

/**
 * Id user yang sedang diimpersonasi admin. Dilampirkan sebagai `as_user` ke tiap
 * request; backend hanya menurutinya bila pemilik token asli berrole admin.
 */
export function getAsUser(): string | null {
  try {
    return localStorage.getItem(AS_USER_KEY);
  } catch {
    return null;
  }
}

/** Set target impersonasi (id user). */
export function setAsUser(id: string): void {
  try {
    localStorage.setItem(AS_USER_KEY, id);
  } catch {
    /* abaikan */
  }
}

/** Hentikan impersonasi. */
export function clearAsUser(): void {
  try {
    localStorage.removeItem(AS_USER_KEY);
  } catch {
    /* abaikan */
  }
}

/**
 * Handler yang dipanggil saat backend menolak request karena token
 * invalid/kedaluwarsa (HTTP 401). AuthContext mendaftarkan handler ini untuk
 * membersihkan sesi sehingga RequireAuth mengarahkan ulang ke /login.
 */
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Daftarkan (atau lepas dengan null) handler 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

/** Beri tahu bahwa sesi tidak lagi sah (dipanggil oleh api client pada 401). */
export function notifyUnauthorized(): void {
  unauthorizedHandler?.();
}

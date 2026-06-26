/**
 * Konfigurasi statis aplikasi.
 *
 * Nilai di-hardcode di sini supaya build TIDAK bergantung pada file .env —
 * deploy langsung jalan tanpa perlu menyiapkan env apa pun. Kalau suatu saat
 * butuh override (mis. saat dev), set VITE_* di .env dan nilainya dipakai.
 */

/** URL backend Google Apps Script (link /exec hasil deploy web app). */
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  'https://script.google.com/macros/s/AKfycbz5KOFsuqc_6b1HD9rEzHt3lEZ8yO05XcER3kkbgtDazULx4wueR9N2-vbrMdgLesKW/exec';

/** Google OAuth 2.0 Client ID (Web application). */
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '459824806751-3o20vb8avu0r8dgh9iij02jj8vpcsc6s.apps.googleusercontent.com';

import { useCallback, useState } from 'preact/hooks';
import { listUsers, getUser, createUser } from '@/api/user';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { normalizeRole } from '@/auth/permissions';
import { useAsync } from './useAsync';
import type { User, UserInput } from '@/types/auth';

/**
 * Daftar user. Admin (platform) melihat SELURUH user lintas toko; role lain
 * hanya melihat user yang berbagi worksheet_url dengannya (tokonya sendiri).
 * Tabel users bersifat global, jadi penyaringan dilakukan di sisi frontend.
 */
export function useUsers() {
  const { user } = useAuth();
  const worksheet = user?.worksheet_url;
  const isAdmin = normalizeRole(user?.role) === 'admin';
  const fetcher = useCallback(async () => {
    const all = await listUsers();
    if (isAdmin) return all;
    return all.filter((u) => String(u.worksheet_url) === String(worksheet));
  }, [worksheet, isAdmin]);
  return useAsync<User[]>(fetcher, [worksheet, isAdmin]);
}

/** Satu user berdasarkan id. */
export function useUser(id: string | number | undefined) {
  const fetcher = useCallback(() => getUser(id ?? ''), [id]);
  return useAsync<User>(fetcher, [id]);
}

/**
 * Mutasi: buat user baru.
 * - Bila form sudah menyertakan worksheet_url (kasus admin memilih toko), pakai
 *   itu apa adanya.
 * - Bila tidak (kasus owner menambah kasir/gudang), isi otomatis dari worksheet
 *   user yang mendaftarkan. Backend tetap menjadi sumber kebenaran final.
 */
export function useCreateUser() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: UserInput) => {
      setSubmitting(true);
      setError(null);
      try {
        const worksheet_url = input.worksheet_url ?? user?.worksheet_url;
        return await createUser({ ...input, worksheet_url });
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Gagal menyimpan pengguna.');
        throw e;
      } finally {
        setSubmitting(false);
      }
    },
    [user?.worksheet_url],
  );

  return { create, submitting, error };
}

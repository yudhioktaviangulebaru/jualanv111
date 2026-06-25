import { useCallback, useState } from 'preact/hooks';
import { listUsers, getUser, createUser } from '@/api/user';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { useAsync } from './useAsync';
import type { User, UserInput } from '@/types/auth';

/**
 * Daftar user yang berbagi worksheet_url dengan user yang sedang login.
 * (Tabel users bersifat global, jadi penyaringan dilakukan di sisi frontend.)
 */
export function useUsers() {
  const { user } = useAuth();
  const worksheet = user?.worksheet_url;
  const fetcher = useCallback(async () => {
    const all = await listUsers();
    return all.filter((u) => String(u.worksheet_url) === String(worksheet));
  }, [worksheet]);
  return useAsync<User[]>(fetcher, [worksheet]);
}

/** Satu user berdasarkan id. */
export function useUser(id: string | number | undefined) {
  const fetcher = useCallback(() => getUser(id ?? ''), [id]);
  return useAsync<User>(fetcher, [id]);
}

/**
 * Mutasi: buat user baru. worksheet_url otomatis mengikuti user yang
 * mendaftarkan (tidak ditampilkan di form).
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
        return await createUser({ ...input, worksheet_url: user?.worksheet_url });
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

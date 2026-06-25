import { api } from './client';
import type { User, UserInput } from '@/types/auth';

/** GET semua user (action: user). Tabel users global — filter per worksheet di UI. */
export function listUsers(): Promise<User[]> {
  return api.get<User[]>('user');
}

/** GET satu user (action: user&id). */
export function getUser(id: string | number): Promise<User> {
  return api.get<User>('user', { id });
}

/**
 * POST buat user baru. Backend hanya mengizinkan admin, dan untuk role non-admin
 * akan menimpa worksheet_url dengan milik admin pemanggil.
 */
export function createUser(input: UserInput): Promise<User> {
  return api.post<User>('user', { ...input });
}

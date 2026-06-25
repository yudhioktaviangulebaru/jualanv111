import { api } from './client';
import type { User } from '@/types/auth';

/**
 * Exchange a Google ID token for the application user record.
 * Backend: POST { action:"login", id_token } -> { user }
 */
export async function login(idToken: string): Promise<User> {
  const { user } = await api.post<{ user: User }>('login', {
    id_token: idToken,
  });
  return user;
}

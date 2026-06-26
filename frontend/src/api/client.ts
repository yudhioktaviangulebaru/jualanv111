/**
 * Minimal API client for the Google Apps Script backend.
 *
 * The GAS web app exposes a single endpoint that routes by an `action` field
 * (see backend/server/engine.js). Every response uses the envelope:
 *
 *   { message: "SUCCESS" | "FAIL", code: number, data: ... }
 *
 * On failure, `data` is `{ error: string }`. GET maps to index/show, POST to
 * store/update/delete.
 *
 * Set the deployed web app URL via VITE_BACKEND_URL in your .env file.
 */

import { getIdToken, getAsUser, notifyUnauthorized } from '@/auth/session';
import { BACKEND_URL } from '@/config/app';

const BASE_URL = BACKEND_URL;

/**
 * Action publik yang TIDAK dilampiri id_token: `login` (token belum ada saat
 * login) dan `ping` (tidak butuh autentikasi).
 */
const PUBLIC_ACTIONS = new Set(['login', 'ping']);

interface ApiEnvelope<T> {
  message: 'SUCCESS' | 'FAIL';
  code: number;
  data: T | { error: string };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Params = Record<string, string | number>;

/** Parse the JSON envelope and either return data or throw an ApiError. */
async function unwrap<T>(res: Response): Promise<T> {
  let envelope: ApiEnvelope<T>;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(`Invalid response (HTTP ${res.status})`, res.status);
  }

  if (envelope.message !== 'SUCCESS') {
    // Token invalid/kedaluwarsa: beri tahu agar sesi dibersihkan & redirect login.
    if (envelope.code === 401) notifyUnauthorized();
    const error =
      envelope.data && typeof envelope.data === 'object' && 'error' in envelope.data
        ? envelope.data.error
        : 'Unknown API error';
    throw new ApiError(error, envelope.code);
  }

  return envelope.data as T;
}

function requireBaseUrl(): string {
  if (!BASE_URL) throw new ApiError('VITE_BACKEND_URL is not configured', 0);
  return BASE_URL;
}

/** GET an action with query params → maps to index (list) / show (with id). */
async function get<T>(action: string, params: Params = {}): Promise<T> {
  const url = new URL(requireBaseUrl());
  url.searchParams.set('action', action);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const token = getIdToken();
  if (token && !PUBLIC_ACTIONS.has(action)) {
    url.searchParams.set('id_token', token);
    const asUser = getAsUser();
    if (asUser) url.searchParams.set('as_user', asUser);
  }

  let res: Response;
  try {
    res = await fetch(url, { method: 'GET' });
  } catch (err) {
    throw new ApiError(err instanceof Error ? err.message : 'Network error', 0);
  }
  return unwrap<T>(res);
}

/**
 * POST an action with a JSON payload.
 *
 * Uses `text/plain` to avoid a CORS preflight against the Apps Script
 * endpoint (GAS rejects preflight OPTIONS requests).
 */
async function post<T>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const token = getIdToken();
  const asUser = token ? getAsUser() : null;
  const body =
    token && !PUBLIC_ACTIONS.has(action)
      ? { action, id_token: token, ...(asUser ? { as_user: asUser } : {}), ...payload }
      : { action, ...payload };

  let res: Response;
  try {
    res = await fetch(requireBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(err instanceof Error ? err.message : 'Network error', 0);
  }
  return unwrap<T>(res);
}

export const api = {
  /** GET an action (list / detail). */
  get,
  /** POST an action with a JSON payload (create / update / delete). */
  post,
};

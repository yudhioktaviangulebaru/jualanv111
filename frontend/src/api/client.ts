/**
 * Minimal API client for the Google Apps Script backend.
 *
 * The GAS web app exposes a single endpoint that routes by an `action`
 * parameter (see backend/server/http.js). Set the deployed web app URL via
 * VITE_API_BASE_URL in your .env file.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  action: string,
  payload: Record<string, unknown> = {},
  init: RequestInit = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not configured', 0);
  }

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
    ...init,
  });

  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.statusText}`, res.status);
  }

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.message ?? 'Unknown API error', res.status);
  }

  return json.data as T;
}

export const api = {
  /** Call a backend action with an optional JSON payload. */
  call: request,
};

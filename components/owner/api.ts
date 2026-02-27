import type { ListResponse, PaginationMeta } from './types';

interface ApiFailureShape {
  error?: {
    code?: string;
    details?: unknown;
    message?: string;
  };
  ok?: false;
}

interface ApiSuccessShape<T> {
  data: T;
  meta?: Record<string, unknown>;
  ok: true;
}

type ApiShape<T> = ApiFailureShape | ApiSuccessShape<T>;

export class OwnerApiError extends Error {
  code?: string;
  details?: unknown;
  status: number;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'OwnerApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function jsonHeaders(headers?: HeadersInit) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(headers ?? {})
  };
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: jsonHeaders(init?.headers)
  });

  const payload = (await response.json().catch(() => null)) as ApiShape<T> | null;

  if (response.status === 401) {
    throw new OwnerApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (!response.ok || !payload || !('ok' in payload) || payload.ok !== true) {
    const message =
      payload && 'error' in payload && payload.error?.message
        ? payload.error.message
        : 'Request failed.';
    const code = payload && 'error' in payload ? payload.error?.code : undefined;
    const details = payload && 'error' in payload ? payload.error?.details : undefined;
    throw new OwnerApiError(message, response.status, code, details);
  }

  return payload.data;
}

export async function apiRequestWithMeta<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: jsonHeaders(init?.headers)
  });

  const payload = (await response.json().catch(() => null)) as ApiShape<T> | null;

  if (response.status === 401) {
    throw new OwnerApiError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  if (!response.ok || !payload || !('ok' in payload) || payload.ok !== true) {
    const message =
      payload && 'error' in payload && payload.error?.message
        ? payload.error.message
        : 'Request failed.';
    const code = payload && 'error' in payload ? payload.error?.code : undefined;
    const details = payload && 'error' in payload ? payload.error?.details : undefined;
    throw new OwnerApiError(message, response.status, code, details);
  }

  return {
    data: payload.data,
    meta: payload.meta
  };
}

function parsePagination(meta?: Record<string, unknown>): PaginationMeta | undefined {
  if (!meta || typeof meta !== 'object') return undefined;
  const candidate = meta.pagination as PaginationMeta | undefined;
  if (!candidate) return undefined;
  return candidate;
}

export async function fetchList<T>(
  endpoint: string,
  query?: Record<string, string | number | boolean | undefined>
): Promise<ListResponse<T>> {
  const url = new URL(endpoint, 'http://local-owner-api');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }

  const response = await apiRequestWithMeta<T[]>(`${url.pathname}${url.search}`);
  return {
    items: response.data ?? [],
    pagination: parsePagination(response.meta)
  };
}

export function encodeBody(body: Record<string, unknown>) {
  return JSON.stringify(body);
}

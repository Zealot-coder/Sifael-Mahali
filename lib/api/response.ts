export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export function success<T>(data: T, meta?: Record<string, unknown>): ApiSuccess<T> {
  return { ok: true, data, ...(meta ? { meta } : {}) };
}

export function failure(
  code: string,
  message: string,
  details?: unknown
): ApiErrorBody {
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {})
    }
  };
}

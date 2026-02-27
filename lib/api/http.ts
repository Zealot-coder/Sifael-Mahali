import { NextResponse } from 'next/server';
import { failure, success } from './response';

type ApiSuccessOptions = {
  status?: number;
  meta?: Record<string, unknown>;
} & Record<string, unknown>;

export function apiSuccess<T>(
  data: T,
  options?: ApiSuccessOptions
) {
  const status = options?.status ?? 200;
  const explicitMeta = options?.meta;
  const extraOptions = { ...(options ?? {}) };
  delete extraOptions.meta;
  delete extraOptions.status;
  const inferredMeta =
    Object.keys(extraOptions).length > 0 ? (extraOptions as Record<string, unknown>) : undefined;

  return NextResponse.json(success(data, explicitMeta ?? inferredMeta), {
    status
  });
}

export function apiError(
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return NextResponse.json(failure(code, message, details), { status });
}

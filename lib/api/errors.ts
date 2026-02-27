import type { PostgrestError } from '@supabase/supabase-js';
import { ZodError } from 'zod';

export interface NormalizedError {
  code: string;
  message: string;
  details?: unknown;
}

function isPostgrestError(error: unknown): error is PostgrestError {
  if (!error || typeof error !== 'object') return false;
  return (
    'code' in error &&
    'message' in error &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request payload.',
      details: error.flatten()
    };
  }

  if (isPostgrestError(error)) {
    return {
      code: error.code || 'DB_ERROR',
      message: error.message,
      details: error.details ?? undefined
    };
  }

  if (error instanceof Error) {
    return { code: 'INTERNAL_ERROR', message: error.message };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.'
  };
}

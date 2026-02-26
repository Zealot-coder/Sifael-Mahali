interface NormalizedError {
  code: string;
  message: string;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return { code: 'INTERNAL_ERROR', message: error.message };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.'
  };
}

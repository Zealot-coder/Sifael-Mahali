'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        boundary: 'root'
      }
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 text-text">
      <section className="w-full max-w-lg rounded-2xl border border-line/50 bg-surface/85 p-6 text-center shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Unexpected Error</p>
        <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-[-0.02em]">
          Something Went Wrong
        </h1>
        <p className="mt-4 text-sm text-muted">
          A runtime error occurred while rendering this view. Please retry.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}

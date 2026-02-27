'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        boundary: 'global'
      }
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-bg text-text antialiased">
        <main className="flex min-h-screen items-center justify-center px-4">
          <section className="w-full max-w-lg rounded-2xl border border-line/50 bg-surface/85 p-6 text-center shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Fatal Error</p>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-[-0.02em]">
              Application Failed
            </h1>
            <p className="mt-4 text-sm text-muted">A fatal rendering error occurred.</p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Reload App
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

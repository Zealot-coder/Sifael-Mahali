'use client';

import { type FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface OwnerLoginFormProps {
  nextPath?: string;
}

export default function OwnerLoginForm({ nextPath }: OwnerLoginFormProps) {
  const router = useRouter();

  const safeNextPath = useMemo(() => {
    const next = nextPath;
    if (!next) return '/owner';
    if (!next.startsWith('/owner')) return '/owner';
    if (next === '/owner/login') return '/owner';
    return next;
  }, [nextPath]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.replace(safeNextPath);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to sign in. Check Supabase environment configuration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-20 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-2xl border border-line/50 bg-surface/80 p-6 shadow-glow backdrop-blur-xl">
        <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.04em]">
          Owner Login
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with your Supabase owner account to access the dashboard.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="owner-email"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Email
            </label>
            <input
              id="owner-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-3 text-sm outline-none transition focus:border-brand/70"
              placeholder="owner@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="owner-password"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Password
            </label>
            <input
              id="owner-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-3 text-sm outline-none transition focus:border-brand/70"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110 disabled:opacity-70"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

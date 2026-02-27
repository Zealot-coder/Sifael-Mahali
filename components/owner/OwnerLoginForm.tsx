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
    <div className="owner-shell px-4 py-20 text-text sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="owner-aurora absolute left-[-8%] top-[12%] h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="owner-aurora absolute right-[-10%] bottom-[8%] h-80 w-80 rounded-full bg-accent/16 blur-3xl" />
      </div>
      <div className="owner-card relative mx-auto max-w-md p-6">
        <span className="owner-pill mb-3">Owner Access</span>
        <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.03em]">
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
            className="inline-flex rounded-xl border border-brand/55 bg-brand/20 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-emerald-100 transition hover:bg-brand/30 disabled:opacity-70"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

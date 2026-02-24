'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PortfolioContent } from '@/content/content';
import { cn } from '@/lib/cn';

type OwnerResponse = {
  ok: boolean;
  storage?: 'kv' | 'file';
  content?: PortfolioContent;
  error?: string;
};

const SECTION_ORDER: Array<keyof PortfolioContent | 'all'> = [
  'all',
  'site',
  'hero',
  'about',
  'projects',
  'experience',
  'education',
  'skills',
  'certifications',
  'contact',
  'footer',
  'navigation',
  'dataStatus'
];

function sectionLabel(section: keyof PortfolioContent | 'all') {
  if (section === 'all') return 'Full Content JSON';
  return section.charAt(0).toUpperCase() + section.slice(1);
}

function safeStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function OwnerDashboard() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [storage, setStorage] = useState<'kv' | 'file' | 'unknown'>('unknown');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState<keyof PortfolioContent | 'all'>('all');
  const [editorText, setEditorText] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isParsingError, setIsParsingError] = useState(false);

  const sectionValue = useMemo(() => {
    if (!content) return null;
    return activeSection === 'all' ? content : content[activeSection];
  }, [content, activeSection]);

  const refreshEditorText = useCallback(
    (
      nextSection: keyof PortfolioContent | 'all',
      nextContent: PortfolioContent
    ) => {
      const value = nextSection === 'all' ? nextContent : nextContent[nextSection];
      setEditorText(safeStringify(value));
      setIsDirty(false);
      setIsParsingError(false);
    },
    []
  );

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/owner/content', {
        credentials: 'include'
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setContent(null);
        return;
      }

      const payload = (await response.json()) as OwnerResponse;
      if (!payload.ok || !payload.content) {
        setError(payload.error ?? 'Unable to load content.');
        return;
      }

      setContent(payload.content);
      setStorage(payload.storage ?? 'unknown');
      setIsAuthenticated(true);
      refreshEditorText(activeSection, payload.content);
    } catch {
      setError('Unable to load content.');
    } finally {
      setLoading(false);
    }
  }, [activeSection, refreshEditorText]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const login = async () => {
    if (!password.trim()) {
      setError('Enter your owner password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'Login failed.');
        return;
      }

      setPassword('');
      await loadContent();
    } catch {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/owner/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setContent(null);
    setEditorText('');
    setIsDirty(false);
    setSuccess('');
    setError('');
  };

  const switchSection = (nextSection: keyof PortfolioContent | 'all') => {
    if (!content) return;
    setActiveSection(nextSection);
    refreshEditorText(nextSection, content);
    setSuccess('');
    setError('');
  };

  const saveChanges = async () => {
    if (!content) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const parsed = JSON.parse(editorText) as unknown;

      const nextContent: PortfolioContent =
        activeSection === 'all'
          ? (parsed as PortfolioContent)
          : {
              ...content,
              [activeSection]: parsed
            };

      const response = await fetch('/api/owner/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content: nextContent })
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setError('Session expired. Login again.');
        return;
      }

      const payload = (await response.json()) as { ok?: boolean; error?: string; storage?: 'kv' | 'file' };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? 'Unable to save content.');
        return;
      }

      setContent(nextContent);
      setStorage(payload.storage ?? storage);
      setIsDirty(false);
      setIsParsingError(false);
      setSuccess('Changes saved. Portfolio updated.');
    } catch {
      setIsParsingError(true);
      setError('Invalid JSON. Fix syntax before saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg px-4 py-20 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border border-line/50 bg-surface/80 p-6 shadow-glow backdrop-blur-xl">
          <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.04em]">
            Owner Login
          </h1>
          <p className="mt-2 text-sm text-muted">
            Private dashboard for managing all portfolio sections.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-3 text-sm outline-none transition focus:border-brand/70"
            placeholder="Enter OWNER_PASSWORD"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void login();
            }}
          />

          {error ? (
            <p className="mt-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => void login()}
            disabled={loading}
            className="mt-4 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-line/50 bg-surface/80 p-5 shadow-glow backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.04em]">
                Owner Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted">
                Storage: <span className="font-semibold uppercase text-accent">{storage}</span>
                {storage === 'file'
                  ? ' (local file mode)'
                  : ' (persistent Vercel KV mode)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadContent()}
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
              >
                Reload
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-line/50 bg-surface/80 p-3 shadow-glow backdrop-blur-xl">
            <nav className="space-y-1">
              {SECTION_ORDER.map((section) => {
                const isActive = activeSection === section;
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => switchSection(section)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] transition sm:text-sm',
                      isActive
                        ? 'bg-brand/20 text-brand'
                        : 'text-muted hover:bg-surfaceAlt/60 hover:text-text'
                    )}
                  >
                    {sectionLabel(section)}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="rounded-2xl border border-line/50 bg-surface/80 p-4 shadow-glow backdrop-blur-xl sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold uppercase tracking-[0.04em]">
                {sectionLabel(activeSection)}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!content) return;
                    refreshEditorText(activeSection, content);
                    setSuccess('Section reset to last saved version.');
                  }}
                  className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => void saveChanges()}
                  disabled={loading || !isDirty}
                  className="rounded-xl bg-brand px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <p className="mb-3 text-xs text-muted">
              JSON editor mode supports full add, edit, and delete functionality for any field.
            </p>

            <textarea
              value={editorText}
              onChange={(event) => {
                setEditorText(event.target.value);
                setIsDirty(true);
                setIsParsingError(false);
                setSuccess('');
              }}
              className={cn(
                'h-[62vh] w-full rounded-xl border bg-[#0c0a08] px-4 py-3 font-mono text-xs leading-relaxed text-[#ffd5b8] outline-none transition sm:text-sm',
                isParsingError ? 'border-brand/70' : 'border-line/60 focus:border-brand/70'
              )}
              spellCheck={false}
            />

            {error ? (
              <p className="mt-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent">
                {success}
              </p>
            ) : null}

            <div className="mt-3 text-xs text-muted">
              Current loaded section size: {safeStringify(sectionValue).length.toLocaleString()} chars
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PortfolioContent } from '@/content/content';
import { cn } from '@/lib/utils/cn';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const redirectToLogin = useCallback(() => {
    router.replace('/owner/login?next=%2Fowner');
  }, [router]);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/owner/content', {
        credentials: 'include'
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as OwnerResponse;
      if (!payload.ok || !payload.content) {
        setError(payload.error ?? 'Unable to load content.');
        return;
      }

      setContent(payload.content);
      setStorage(payload.storage ?? 'unknown');
      refreshEditorText(activeSection, payload.content);
    } catch {
      setError('Unable to load content.');
    } finally {
      setLoading(false);
    }
  }, [activeSection, redirectToLogin, refreshEditorText]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/owner/logout', { method: 'POST' });
    } finally {
      setLoading(false);
      redirectToLogin();
    }
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
        redirectToLogin();
        return;
      }

      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        storage?: 'kv' | 'file';
      };
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

  if (!content) {
    return (
      <div className="min-h-screen bg-bg px-4 py-20 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-line/50 bg-surface/80 p-6 shadow-glow backdrop-blur-xl">
          <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.04em]">
            Owner Dashboard
          </h1>
          {loading ? (
            <p className="mt-3 text-sm text-muted">Loading secure dashboard session...</p>
          ) : null}
          {error ? (
            <p className="mt-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void loadContent()}
            className="mt-4 rounded-xl border border-line/60 bg-surfaceAlt/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
          >
            Retry
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

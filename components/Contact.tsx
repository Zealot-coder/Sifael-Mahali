'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { PortfolioContent } from '@/content/content';
import Reveal from './motion/Reveal';
import SectionHeading from './SectionHeading';

type FormValues = {
  name: string;
  email: string;
  message: string;
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

const INITIAL_FORM: FormValues = {
  name: '',
  email: '',
  message: ''
};

interface ContactProps {
  contact: PortfolioContent['contact'];
}

export default function Contact({ contact }: ContactProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_FORM);
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fallbackMailto = useMemo(() => {
    const subject = encodeURIComponent('Portfolio inquiry');
    return `mailto:${contact.email}?subject=${subject}`;
  }, [contact.email]);

  useEffect(() => {
    if (state !== 'success') return;
    const timer = window.setTimeout(() => setState('idle'), 5000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Unable to send message.');
      }

      setState('success');
      setValues(INITIAL_FORM);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send message.';
      setErrorMessage(message);
      setState('error');
    }
  };

  return (
    <section id="contact" className="section-shell">
      <Reveal>
        <SectionHeading
          eyebrow="Contact"
          title="Let's Build Something Secure And Useful"
          description="Use the form or fallback mailto link. Social links are editable in content.ts."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="glass-card p-6 sm:p-8">
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-text">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  value={values.name}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-line/50 bg-surfaceAlt/50 px-4 py-3 text-sm text-text outline-none transition focus:border-brand/60"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-text">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={values.email}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-line/50 bg-surfaceAlt/50 px-4 py-3 text-sm text-text outline-none transition focus:border-brand/60"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-text">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={values.message}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, message: event.target.value }))
                  }
                  className="w-full rounded-xl border border-line/50 bg-surfaceAlt/50 px-4 py-3 text-sm text-text outline-none transition focus:border-brand/60"
                  placeholder="Tell me about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={state === 'submitting'}
                className="inline-flex items-center rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div aria-live="polite" className="mt-4 text-sm">
              {state === 'success' ? (
                <p className="rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-accent">
                  Message sent successfully.
                </p>
              ) : null}

              {state === 'error' ? (
                <p className="rounded-lg border border-brand/50 bg-brand/10 px-3 py-2 text-brand">
                  {errorMessage} Use{' '}
                  <a href={fallbackMailto} className="underline">
                    mailto fallback
                  </a>
                  .
                </p>
              ) : null}
            </div>
          </article>

          <article className="glass-card p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold text-text">Direct Links</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {contact.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-line/40 bg-surfaceAlt/40 px-4 py-3 text-muted transition hover:border-brand/50 hover:text-text"
                  >
                    <span>{social.label}</span>
                    <span>{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>

            <a
              href={fallbackMailto}
              className="mt-4 inline-flex rounded-xl border border-line/50 bg-surfaceAlt/70 px-4 py-3 text-sm font-medium text-text transition hover:border-brand/60 hover:text-brand"
            >
              Email: {contact.email}
            </a>
          </article>
        </div>
      </Reveal>
    </section>
  );
}

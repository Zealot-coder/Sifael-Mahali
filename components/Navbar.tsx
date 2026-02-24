'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { portfolioContent } from '@/content/content';
import { cn } from '@/lib/cn';
import { useActiveSection } from '@/lib/use-active-section';

function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('theme');
    const nextLight = saved === 'light';
    document.documentElement.classList.toggle('light', nextLight);
    setIsLight(nextLight);
  }, []);

  const toggleTheme = () => {
    const nextLight = !isLight;
    setIsLight(nextLight);
    document.documentElement.classList.toggle('light', nextLight);
    window.localStorage.setItem('theme', nextLight ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line/50 bg-surfaceAlt/70 text-muted transition hover:border-brand/60 hover:text-text"
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

export default function Navbar() {
  const links = portfolioContent.navigation;
  const sectionIds = useMemo(
    () => links.map((item) => item.href.replace('#', '')),
    [links]
  );
  const activeSection = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all',
        scrolled ? 'px-2 pt-2' : 'px-0 pt-0'
      )}
    >
      <nav
        className={cn(
          'mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border border-line/40 bg-bg/70 px-3 py-2 backdrop-blur-xl',
          scrolled && 'shadow-glow'
        )}
      >
        <a
          href="#home"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line/50 bg-surfaceAlt/70 font-display text-sm font-bold tracking-widest text-text"
          aria-label="Go to top"
        >
          SM
        </a>

        <div className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((item) => {
            const id = item.href.slice(1);
            const isActive = activeSection === id;

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand/20 text-brand'
                    : 'text-muted hover:bg-surfaceAlt/70 hover:text-text'
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        <ThemeToggle />
      </nav>
    </header>
  );
}

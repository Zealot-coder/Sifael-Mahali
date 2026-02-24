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
        'fixed inset-x-0 top-0 z-50 px-4 transition-all sm:px-6 lg:px-8',
        scrolled ? 'pt-2' : 'pt-4'
      )}
    >
      <nav
        className={cn(
          'mx-auto flex max-w-7xl items-center gap-3 border-b border-line/60 pb-3',
          scrolled &&
            'rounded-2xl border border-line/45 bg-bg/72 px-3 py-3 shadow-glow backdrop-blur-xl'
        )}
      >
        <a
          href="#home"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-text transition hover:text-brand"
          aria-label="Go to top"
        >
          Sifael Mahali
        </a>

        <div className="scrollbar-none flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {links.map((item) => {
            const id = item.href.slice(1);
            const isActive = activeSection === id;

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-sm',
                  isActive
                    ? 'bg-brand/20 text-brand'
                    : 'text-muted hover:text-text'
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

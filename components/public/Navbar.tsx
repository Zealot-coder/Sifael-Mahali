'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useActiveSection } from '@/lib/hooks/use-active-section';
import { cn } from '@/lib/utils/cn';

interface NavbarProps {
  navigation: Array<{ href: string; label: string }>;
  contact: { email: string; phone?: string; socials: Array<{ label: string; url: string }> };
  siteName: string;
}

function ThemeToggle({ className }: { className?: string }) {
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
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line/50 bg-surfaceAlt/70 text-muted transition hover:border-brand/60 hover:text-text',
        className
      )}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

const menuPanelTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1]
};

const menuListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.07
    }
  }
};

const menuItemVariants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] } }
};

export default function Navbar({ navigation, contact, siteName }: NavbarProps) {
  const links = navigation;
  const primarySocial = contact.socials[0];
  const sectionIds = useMemo(
    () =>
      links
        .filter((item) => item.href.startsWith('#'))
        .map((item) => item.href.replace('#', '')),
    [links]
  );
  const activeSection = useActiveSection(sectionIds);
  const activeLabel =
    links.find((item) => item.href.replace('#', '') === activeSection)?.label ?? 'Home';
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [isMenuOpen]);

  return (
    <>
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
            {siteName}
          </a>

          <div className="absolute left-1/2 top-[14px] -translate-x-1/2 sm:top-[19px]">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="group flex flex-col items-center gap-2"
              aria-expanded={isMenuOpen}
              aria-controls="portfolio-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className={cn(
                  'h-[5px] rounded-full bg-text transition-all duration-500',
                  isMenuOpen
                    ? 'w-24 bg-brand'
                    : 'w-16 group-hover:w-20'
                )}
              />
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:text-[11px]">
                {isMenuOpen ? <X size={12} /> : <Menu size={12} />}
                {isMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:inline">
              {activeLabel}
            </span>
            <a
              href="#contact"
              data-analytics-event="contact_open"
              data-analytics-label="navbar_contact_link"
              className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-text transition hover:text-brand sm:inline"
            >
              Contact
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            id="portfolio-menu"
            className="fixed inset-2 z-[75] overflow-hidden rounded-2xl border border-line/45 bg-surface/90 p-6 shadow-glow backdrop-blur-2xl sm:inset-3 sm:p-8"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, clipPath: 'inset(0 0 100% 0 round 1rem)' }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, clipPath: 'inset(0 0 0% 0 round 1rem)' }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, clipPath: 'inset(0 0 100% 0 round 1rem)' }
            }
            transition={menuPanelTransition}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(var(--brand)/0.22),transparent_30%),radial-gradient(circle_at_85%_82%,rgb(var(--accent)/0.18),transparent_32%)]" />

            <div className="relative flex h-full flex-col">
              <div className="mb-8 flex items-center justify-between border-b border-line/50 pb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  Navigation
                </p>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line/50 bg-surfaceAlt/70 text-muted transition hover:border-brand/60 hover:text-text"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              <motion.ul
                className="grid flex-1 content-center gap-2 sm:gap-3"
                variants={menuListVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {links.map((item) => {
                  const id = item.href.replace('#', '');
                  const isActive = activeSection === id;

                  return (
                    <motion.li key={item.href} variants={menuItemVariants}>
                      <a
                        href={item.href}
                        data-analytics-event={
                          item.href.includes('contact') ? 'contact_open' : undefined
                        }
                        data-analytics-label={
                          item.href.includes('contact') ? 'menu_contact_link' : undefined
                        }
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          'inline-flex items-baseline gap-2 font-display text-4xl font-semibold uppercase leading-[0.9] tracking-[-0.03em] transition sm:text-6xl lg:text-7xl',
                          isActive ? 'text-brand' : 'text-text hover:text-brand'
                        )}
                      >
                        <span className="text-sm font-semibold tracking-[0.2em] text-muted sm:text-base">
                          0{links.findIndex((link) => link.href === item.href) + 1}
                        </span>
                        {item.label}
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-4 border-t border-line/50 pt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:text-sm"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.45 }}
              >
                <a
                  href={`mailto:${contact.email}`}
                  className="transition hover:text-brand"
                >
                  {contact.email}
                </a>
                {contact.phone ? (
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="transition hover:text-brand"
                  >
                    {contact.phone}
                  </a>
                ) : null}
                {primarySocial?.url ? (
                  <a
                    href={primarySocial.url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-brand"
                  >
                    {primarySocial.label}
                  </a>
                ) : null}
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

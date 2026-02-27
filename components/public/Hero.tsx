'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';

const HeroScene = dynamic(() => import('@/components/public/three/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-[-12%] top-[-18%] h-[48vh] w-[48vh] rounded-full bg-brand/25 blur-3xl" />
      <div className="absolute bottom-[-24%] left-[-8%] h-[42vh] w-[42vh] rounded-full bg-accent/20 blur-3xl" />
    </div>
  )
});

interface HeroProps {
  hero: {
    availability: string;
    description: string;
    name: string;
    openToWork?: boolean;
    primaryCta: { href: string; label: string };
    secondaryCta: { href: string; label: string };
    tagline: string;
  };
}

export default function Hero({ hero }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const nameWords = hero.name.split(' ').filter(Boolean);
  const taglineWords = hero.tagline.split(' ').filter(Boolean);
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.82, ease: [0.22, 1, 0.36, 1] };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-end overflow-hidden pt-28"
    >
      <HeroScene />
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="inline-flex border border-brand/45 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
        >
          {hero.availability}
        </motion.p>
        {hero.openToWork ? (
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: reduceMotion ? 0 : 0.08 }}
            className="ml-2 inline-flex border border-accent/45 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
          >
            Open To Work
          </motion.span>
        ) : null}

        <h1 className="mt-6 max-w-5xl font-display text-5xl font-semibold uppercase leading-[0.88] tracking-[-0.04em] text-text sm:text-7xl md:text-8xl">
          {nameWords.map((word, index) => (
            <span key={`${word}-${index}`} className="mr-[0.22em] inline-block overflow-hidden">
              <motion.span
                initial={reduceMotion ? false : { y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.78,
                  ease: [0.22, 1, 0.36, 1],
                  delay: reduceMotion ? 0 : 0.08 + index * 0.085
                }}
                className="inline-block"
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.46 }}
          className="mt-4 max-w-3xl text-sm font-semibold uppercase tracking-[0.14em] text-accent sm:text-base"
        >
          {taglineWords.map((word, index) => (
            <span key={`${word}-${index}`} className="mr-[0.34em] inline-block">
              {word}
            </span>
          ))}
        </motion.p>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.56 }}
          className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base"
        >
          {hero.description}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.68 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <a href={hero.primaryCta.href} className="cta-primary">
            {hero.primaryCta.label}
            <ArrowRight size={16} />
          </a>
          <a href={hero.secondaryCta.href} className="cta-secondary">
            {hero.secondaryCta.label}
            <Download size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

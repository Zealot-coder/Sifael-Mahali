'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { portfolioContent } from '@/content/content';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), {
  ssr: false,
  loading: () => (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute right-[-12%] top-[-18%] h-[48vh] w-[48vh] rounded-full bg-brand/25 blur-3xl" />
      <div className="absolute bottom-[-24%] left-[-8%] h-[42vh] w-[42vh] rounded-full bg-accent/20 blur-3xl" />
    </div>
  )
});

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const { hero } = portfolioContent;
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-28"
    >
      <HeroScene />
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:32px_32px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="inline-flex rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
        >
          {hero.availability}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.05 }}
          className="mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.05] text-text sm:text-6xl md:text-7xl"
        >
          {hero.name}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-4 max-w-3xl text-lg font-medium text-accent sm:text-xl"
        >
          {hero.tagline}
        </motion.p>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-6 max-w-2xl text-sm leading-relaxed text-muted sm:text-base"
        >
          {hero.description}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <a
            href={hero.primaryCta.href}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {hero.primaryCta.label}
            <ArrowRight size={16} />
          </a>
          <a
            href={hero.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-xl border border-line/60 bg-surfaceAlt/70 px-5 py-3 text-sm font-semibold text-text transition hover:border-brand/60 hover:text-brand"
          >
            {hero.secondaryCta.label}
            <Download size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

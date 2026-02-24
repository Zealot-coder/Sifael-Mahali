'use client';

import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { portfolioContent } from '@/content/content';
import { cn } from '@/lib/cn';

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
  const marqueeText = `${hero.name} - ${hero.name} - ${hero.name} - ${hero.name} - `;
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] };

  return (
    <section
      id="home"
      className="relative isolate flex min-h-screen items-end overflow-hidden pt-28"
    >
      <HeroScene />
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[length:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 overflow-hidden">
        <div
          className={cn(
            'hero-marquee flex w-[200%] whitespace-nowrap font-display text-[22vw] font-semibold uppercase leading-[0.8] tracking-[-0.05em] text-text/8',
            reduceMotion && 'animate-none'
          )}
        >
          <span className="pr-10">{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="inline-flex border border-brand/45 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand"
        >
          {hero.availability}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.05 }}
          className="mt-6 max-w-5xl font-display text-5xl font-semibold uppercase leading-[0.88] tracking-[-0.04em] text-text sm:text-7xl md:text-8xl"
        >
          {hero.name}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-4 max-w-3xl text-sm font-semibold uppercase tracking-[0.14em] text-accent sm:text-base"
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

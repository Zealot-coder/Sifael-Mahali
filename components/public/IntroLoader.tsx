'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function IntroLoader() {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setHidden(true);
      return;
    }

    const durationMs = 1400;
    const start = performance.now();
    let frame = 0;
    let dismissTimer = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setCount(Math.round(progress * 100));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      } else {
        dismissTimer = window.setTimeout(() => setHidden(true), 260);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(dismissTimer);
    };
  }, [reduceMotion]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-end bg-gradient-to-b from-brand to-accent px-4 pb-4 sm:px-8 sm:pb-8">
      <span className="intro-pulse font-display text-[34vw] font-light leading-[0.72] tracking-[-0.06em] text-black sm:text-[26vw]">
        {count}
      </span>
    </div>
  );
}

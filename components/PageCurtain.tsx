'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function PageCurtain() {
  const reduceMotion = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setHidden(true);
      return;
    }

    const timer = window.setTimeout(() => setHidden(true), 2600);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  if (hidden || reduceMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[110]">
      <motion.div
        className="absolute inset-0 origin-bottom bg-gradient-to-b from-brand to-accent"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ delay: 1.42, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0 origin-top bg-gradient-to-t from-[#0c0704] via-[#170d07] to-[#251308]"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ delay: 1.62, duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

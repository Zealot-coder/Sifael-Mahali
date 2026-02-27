'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { OwnerToast } from './types';

interface OwnerToastViewportProps {
  toasts: OwnerToast[];
}

function toastStyles(kind: OwnerToast['kind']) {
  if (kind === 'success') {
    return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
  }
  if (kind === 'error') {
    return 'border-rose-400/50 bg-rose-500/15 text-rose-100';
  }
  return 'border-lime-400/50 bg-lime-500/15 text-lime-100';
}

export default function OwnerToastViewport({ toasts }: OwnerToastViewportProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] w-full max-w-sm space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -6 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm shadow-glow backdrop-blur-lg',
              toastStyles(toast.kind)
            )}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

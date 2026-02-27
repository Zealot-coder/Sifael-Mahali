'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface OwnerPanelProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}

export default function OwnerPanel({
  actions,
  children,
  className,
  description,
  title
}: OwnerPanelProps) {
  return (
    <section
      className={cn(
        'owner-card p-4 sm:p-5',
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold uppercase tracking-[0.04em] sm:text-xl">
            {title}
          </h2>
          {description ? <p className="mt-1 text-xs text-muted sm:text-sm">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

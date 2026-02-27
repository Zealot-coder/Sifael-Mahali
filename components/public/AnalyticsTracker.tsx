'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { type AnalyticsEventType, trackEvent } from '@/lib/analytics/client';

function parseMeta(raw: string | null) {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
    return parsed as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent('page_view', { pagePath: pathname });
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const source = target?.closest('[data-analytics-event]');
      if (!source) return;

      const eventType = source.getAttribute('data-analytics-event') as AnalyticsEventType | null;
      if (!eventType) return;

      const analyticsPath = source.getAttribute('data-analytics-path') ?? pathname;
      const analyticsLabel = source.getAttribute('data-analytics-label');
      const metadata = {
        ...parseMeta(source.getAttribute('data-analytics-meta')),
        ...(analyticsLabel ? { label: analyticsLabel } : {})
      };

      trackEvent(eventType, {
        metadata,
        pagePath: analyticsPath
      });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  return null;
}


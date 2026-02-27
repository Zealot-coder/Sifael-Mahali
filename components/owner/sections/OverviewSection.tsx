'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchList } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';

interface OverviewSectionProps {
  onUnauthorized: () => void;
}

interface OverviewMetric {
  key: string;
  label: string;
  total: number;
}

const metricConfigs = [
  { endpoint: '/api/projects', key: 'projects', label: 'Projects' },
  { endpoint: '/api/experience', key: 'experience', label: 'Experience' },
  { endpoint: '/api/skills', key: 'skills', label: 'Skills' },
  { endpoint: '/api/certifications', key: 'certifications', label: 'Certifications' },
  { endpoint: '/api/testimonials', key: 'testimonials', label: 'Testimonials' },
  { endpoint: '/api/blog', key: 'blog', label: 'Blog Posts' },
  { endpoint: '/api/contact', key: 'messages', label: 'Messages' }
] as const;

export default function OverviewSection({ onUnauthorized }: OverviewSectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<OverviewMetric[]>([]);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await Promise.all(
        metricConfigs.map(async (metric) => {
          const result = await fetchList<Record<string, unknown>>(metric.endpoint, {
            page: 1,
            pageSize: 1
          });
          return {
            key: metric.key,
            label: metric.label,
            total: result.pagination?.total ?? result.items.length
          } satisfies OverviewMetric;
        })
      );
      setMetrics(rows);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load dashboard overview metrics.';
      if (message.toLowerCase().includes('unauthorized')) {
        onUnauthorized();
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const totalRecords = useMemo(
    () => metrics.reduce((sum, metric) => sum + metric.total, 0),
    [metrics]
  );

  return (
    <OwnerPanel
      title="Overview"
      description="Portfolio data health and module-level record counts."
      actions={
        <button
          type="button"
          onClick={() => void loadOverview()}
          className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
        >
          Refresh
        </button>
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.key}
            className="rounded-xl border border-line/50 bg-surfaceAlt/50 px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {metric.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-text">{metric.total.toLocaleString()}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-line/50 bg-surfaceAlt/40 px-4 py-3 text-sm text-muted">
        {isLoading ? 'Loading module totals...' : `Tracked records across modules: ${totalRecords}`}
      </div>
    </OwnerPanel>
  );
}

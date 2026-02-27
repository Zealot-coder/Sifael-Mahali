'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';

interface AggregateRow {
  count: number;
  key: string;
}

interface AnalyticsPayload {
  days: number;
  series: {
    byDay: AggregateRow[];
    byType: AggregateRow[];
    topPages: AggregateRow[];
  };
  totals: {
    byType: Record<string, number>;
    events: number;
  };
}

interface AnalyticsSectionProps {
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

const eventTypeOptions = ['all', 'page_view', 'project_view', 'cv_download', 'contact_open'] as const;
type EventTypeOption = (typeof eventTypeOptions)[number];

function normalizeWidth(value: number, max: number) {
  if (max <= 0) return 2;
  return Math.max(2, Math.round((value / max) * 100));
}

export default function AnalyticsSection({ onToast, onUnauthorized }: AnalyticsSectionProps) {
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');
  const [eventType, setEventType] = useState<EventTypeOption>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({
        days: String(days)
      });
      if (eventType !== 'all') {
        query.set('eventType', eventType);
      }
      const data = await apiRequest<AnalyticsPayload>(`/api/analytics?${query.toString()}`);
      setPayload(data);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to load analytics.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsLoading(false);
    }
  }, [days, eventType, onToast, onUnauthorized]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const maxDayCount = useMemo(
    () => Math.max(0, ...(payload?.series.byDay.map((item) => item.count) ?? [0])),
    [payload]
  );
  const maxPageCount = useMemo(
    () => Math.max(0, ...(payload?.series.topPages.map((item) => item.count) ?? [0])),
    [payload]
  );

  return (
    <OwnerPanel
      title="Analytics"
      description="Traffic and engagement events from privacy-safe portfolio tracking."
      actions={
        <button
          type="button"
          onClick={() => void loadAnalytics()}
          className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
        >
          Reload
        </button>
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      <div className="mb-3 flex flex-wrap gap-2">
        {[7, 30, 90].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setDays(value)}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              days === value
                ? 'border-brand/60 bg-brand/20 text-brand'
                : 'border-line/60 bg-surfaceAlt/40 text-muted'
            }`}
          >
            {value}d
          </button>
        ))}
        {eventTypeOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setEventType(option)}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              eventType === option
                ? 'border-accent/60 bg-accent/20 text-accent'
                : 'border-line/60 bg-surfaceAlt/40 text-muted'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading analytics...</p>
      ) : payload ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-line/50 bg-surfaceAlt/35 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Total Events</p>
              <p className="mt-1 text-2xl font-semibold text-text">
                {payload.totals.events.toLocaleString()}
              </p>
            </article>
            <article className="rounded-xl border border-line/50 bg-surfaceAlt/35 px-4 py-3 sm:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted">By Type</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {payload.series.byType.map((item) => (
                  <div key={item.key} className="rounded-lg border border-line/30 bg-surface/30 px-3 py-2">
                    <p className="text-xs text-muted">{item.key}</p>
                    <p className="text-lg font-semibold text-text">{item.count}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-line/50 bg-surfaceAlt/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Daily Events
              </p>
              <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                {payload.series.byDay.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>{item.key}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surfaceAlt/70">
                      <div
                        className="h-full rounded-full bg-brand/85"
                        style={{ width: `${normalizeWidth(item.count, maxDayCount)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line/50 bg-surfaceAlt/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Top Pages
              </p>
              <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                {payload.series.topPages.map((item) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span className="truncate">{item.key}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surfaceAlt/70">
                      <div
                        className="h-full rounded-full bg-accent/85"
                        style={{ width: `${normalizeWidth(item.count, maxPageCount)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </OwnerPanel>
  );
}

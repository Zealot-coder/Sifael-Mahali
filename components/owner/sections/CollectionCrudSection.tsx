'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, fetchList, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';
import { cn } from '@/lib/utils/cn';

interface CollectionCrudSectionProps<TItem extends { id: string }> {
  defaultPayload: Record<string, unknown>;
  description: string;
  endpoint: string;
  itemSubtitle?: (item: TItem) => string;
  itemTitle: (item: TItem) => string;
  listQuery?: Record<string, string | number | boolean | undefined>;
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
  title: string;
  topActions?: ReactNode;
}

function safeStringify(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function stripSystemFields(item: Record<string, unknown>) {
  const output = { ...item };
  delete output.id;
  delete output.created_at;
  delete output.updated_at;
  delete output.deleted_at;
  delete output.view_count;
  return output;
}

export default function CollectionCrudSection<TItem extends { id: string }>({
  defaultPayload,
  description,
  endpoint,
  itemSubtitle,
  itemTitle,
  listQuery,
  onToast,
  onUnauthorized,
  title,
  topActions
}: CollectionCrudSectionProps<TItem>) {
  const [editor, setEditor] = useState(safeStringify(defaultPayload));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<TItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchList<TItem>(endpoint, {
        page: 1,
        pageSize: 200,
        ...(listQuery ?? {})
      });
      setItems(response.items);

      if (selectedId) {
        const stillExists = response.items.some((item) => item.id === selectedId);
        if (!stillExists) {
          setSelectedId(null);
          setEditor(safeStringify(defaultPayload));
        }
      }
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error instanceof Error ? error.message : 'Unable to load records.');
    } finally {
      setIsLoading(false);
    }
  }, [defaultPayload, endpoint, listQuery, onUnauthorized, selectedId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const selectItem = (item: TItem) => {
    setSelectedId(item.id);
    setEditor(safeStringify(stripSystemFields(item as Record<string, unknown>)));
    setError('');
  };

  const resetToTemplate = () => {
    setSelectedId(null);
    setEditor(safeStringify(defaultPayload));
    setError('');
  };

  const createItem = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const parsed = JSON.parse(editor) as Record<string, unknown>;
      const created = await apiRequest<TItem>(endpoint, {
        body: JSON.stringify(parsed),
        method: 'POST'
      });
      setItems((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setEditor(safeStringify(stripSystemFields(created as Record<string, unknown>)));
      onToast('success', `${title}: record created.`);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to create record.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = async () => {
    if (!selectedId) {
      const message = 'Select a record first.';
      setError(message);
      onToast('info', message);
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const parsed = JSON.parse(editor) as Record<string, unknown>;
      const updated = await apiRequest<TItem>(endpoint, {
        body: JSON.stringify({
          ...parsed,
          id: selectedId
        }),
        method: 'PATCH'
      });
      setItems((prev) => prev.map((item) => (item.id === selectedId ? updated : item)));
      setEditor(safeStringify(stripSystemFields(updated as Record<string, unknown>)));
      onToast('success', `${title}: record updated.`);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to update record.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteItem = async () => {
    if (!selectedId) {
      const message = 'Select a record first.';
      setError(message);
      onToast('info', message);
      return;
    }

    const previous = items;
    setItems((prev) => prev.filter((item) => item.id !== selectedId));
    const deletingId = selectedId;
    setSelectedId(null);
    setEditor(safeStringify(defaultPayload));
    setIsSubmitting(true);
    setError('');

    try {
      await apiRequest<{ id: string }>(`${endpoint}?id=${encodeURIComponent(deletingId)}`, {
        method: 'DELETE'
      });
      onToast('success', `${title}: record deleted.`);
    } catch (error) {
      setItems(previous);
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to delete record.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OwnerPanel
      title={title}
      description={description}
      actions={
        <>
          {topActions}
          <button
            type="button"
            onClick={() => void loadItems()}
            className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
          >
            Reload
          </button>
        </>
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Records ({items.length})
            </p>
            {isLoading ? <span className="text-xs text-muted">Loading...</span> : null}
          </div>
          <div className="max-h-[54vh] space-y-1 overflow-y-auto pr-1">
            {items.map((item) => {
              const active = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-left transition',
                    active
                      ? 'border-brand/60 bg-brand/10'
                      : 'border-line/30 bg-surface/40 hover:border-brand/40'
                  )}
                >
                  <p className="truncate text-sm font-semibold text-text">{itemTitle(item)}</p>
                  {itemSubtitle ? (
                    <p className="truncate text-xs text-muted">{itemSubtitle(item)}</p>
                  ) : null}
                </button>
              );
            })}
            {items.length === 0 && !isLoading ? (
              <p className="rounded-lg border border-line/30 px-3 py-4 text-sm text-muted">
                No records found.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-line/50 bg-surfaceAlt/20 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              {selectedItem ? `Editing: ${itemTitle(selectedItem)}` : 'Create New Record'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetToTemplate}
                className="rounded-lg border border-line/60 bg-surfaceAlt/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
              >
                New Template
              </button>
              <button
                type="button"
                onClick={() => void createItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-70"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => void updateItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-accent/50 bg-accent/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffe0bf] transition hover:bg-accent/25 disabled:opacity-70"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => void deleteItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-brand/55 bg-brand/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffd2b4] transition hover:bg-brand/25 disabled:opacity-70"
              >
                Delete
              </button>
            </div>
          </div>

          <textarea
            value={editor}
            onChange={(event) => setEditor(event.target.value)}
            spellCheck={false}
            className="h-[52vh] w-full rounded-xl border border-line/50 bg-[#0c0a08] px-3 py-3 font-mono text-xs text-[#ffd9be] outline-none transition focus:border-brand/60"
          />
        </div>
      </div>
    </OwnerPanel>
  );
}

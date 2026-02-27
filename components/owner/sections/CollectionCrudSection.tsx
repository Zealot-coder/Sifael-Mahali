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

const PAGE_SIZE = 50;
const PAGE_LIMIT = 8;

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
      const allItems: TItem[] = [];
      let page = 1;

      while (page <= PAGE_LIMIT) {
        const response = await fetchList<TItem>(endpoint, {
          page,
          pageSize: PAGE_SIZE,
          ...(listQuery ?? {})
        });
        allItems.push(...response.items);
        const totalPages = response.pagination?.totalPages ?? 1;
        if (page >= totalPages) break;
        page += 1;
      }

      setItems(allItems);

      if (selectedId) {
        const stillExists = allItems.some((item) => item.id === selectedId);
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
            className="owner-action"
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

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Record Browser ({items.length})
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
        </section>

        <section className="space-y-4">
          <article className="rounded-xl border border-line/50 bg-surfaceAlt/25 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Step 1: Context
            </p>
            <p className="mt-1 text-sm text-text">
              {selectedItem ? `Editing ${itemTitle(selectedItem)}` : 'Creating a new record'}
            </p>
            <p className="mt-1 text-xs text-muted">
              Choose an existing record from the browser or start from template.
            </p>
            <button
              type="button"
              onClick={resetToTemplate}
              className="owner-action mt-3"
            >
              New Template
            </button>
          </article>

          <article className="rounded-xl border border-line/50 bg-surfaceAlt/25 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Step 2: CRUD Actions
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                onClick={() => void createItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-70"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => void updateItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-accent/50 bg-accent/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-lime-100 transition hover:bg-accent/25 disabled:opacity-70"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => void deleteItem()}
                disabled={isSubmitting}
                className="rounded-lg border border-rose-500/55 bg-rose-500/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-70"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => void loadItems()}
                className="owner-action"
              >
                Reload
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-line/50 bg-surfaceAlt/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Step 3: JSON Editor
            </p>
            <p className="mt-1 text-xs text-muted">
              Edit the payload below, then run Create, Update, or Delete.
            </p>

            <textarea
              value={editor}
              onChange={(event) => setEditor(event.target.value)}
              spellCheck={false}
              className="mt-3 h-[50vh] w-full rounded-xl border border-line/50 bg-[#04110b] px-3 py-3 font-mono text-xs text-emerald-100 outline-none transition focus:border-brand/60"
            />
          </article>
        </section>
      </div>
    </OwnerPanel>
  );
}


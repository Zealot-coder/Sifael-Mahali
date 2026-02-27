'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, fetchList, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';
import type { Database } from '@/types/supabase';

type MessageRow = Database['public']['Tables']['contact_messages']['Row'];
type MessageStatus = MessageRow['status'];

interface MessagesSectionProps {
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

const statuses: MessageStatus[] = ['unread', 'read', 'replied', 'archived'];

export default function MessagesSection({ onToast, onUnauthorized }: MessagesSectionProps) {
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | MessageStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [notesDraft, setNotesDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMessage = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? null,
    [messages, selectedId]
  );

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchList<MessageRow>('/api/contact', {
        page: 1,
        pageSize: 150,
        ...(filter !== 'all' ? { status: filter } : {})
      });
      setMessages(response.items);
      if (selectedId) {
        const fresh = response.items.find((item) => item.id === selectedId);
        if (fresh) {
          setNotesDraft(fresh.notes ?? '');
        }
      }
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error instanceof Error ? error.message : 'Unable to load contact messages.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, onUnauthorized, selectedId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const selectMessage = (message: MessageRow) => {
    setSelectedId(message.id);
    setNotesDraft(message.notes ?? '');
    setError('');
  };

  const patchMessage = async (id: string, payload: Record<string, unknown>, successLabel: string) => {
    setIsSaving(true);
    try {
      const updated = await apiRequest<MessageRow>('/api/contact', {
        body: JSON.stringify({ id, ...payload }),
        method: 'PATCH'
      });
      setMessages((prev) => prev.map((message) => (message.id === id ? updated : message)));
      if (selectedId === id) {
        setNotesDraft(updated.notes ?? '');
      }
      onToast('success', successLabel);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to update message.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const setStatusOptimistic = async (status: MessageStatus) => {
    if (!selectedMessage) {
      onToast('info', 'Select a message first.');
      return;
    }

    const previous = messages;
    setMessages((prev) =>
      prev.map((message) => (message.id === selectedMessage.id ? { ...message, status } : message))
    );

    try {
      await patchMessage(
        selectedMessage.id,
        { status, ...(status === 'replied' ? { replied_at: new Date().toISOString() } : {}) },
        `Message marked as ${status}.`
      );
    } catch {
      setMessages(previous);
    }
  };

  const saveNotes = async () => {
    if (!selectedMessage) {
      onToast('info', 'Select a message first.');
      return;
    }
    await patchMessage(selectedMessage.id, { notes: notesDraft }, 'Message notes saved.');
  };

  return (
    <OwnerPanel
      title="Messages Inbox"
      description="Review incoming contact messages and manage follow-up status."
      actions={
        <button
          type="button"
          onClick={() => void loadMessages()}
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

      <div className="mb-3 flex flex-wrap gap-1">
        {(['all', ...statuses] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              filter === status
                ? 'border-brand/60 bg-brand/20 text-brand'
                : 'border-line/60 bg-surfaceAlt/40 text-muted'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Messages ({messages.length})
            </p>
            {isLoading ? <span className="text-xs text-muted">Loading...</span> : null}
          </div>
          <div className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">
            {messages.map((message) => (
              <button
                key={message.id}
                type="button"
                onClick={() => selectMessage(message)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selectedId === message.id
                    ? 'border-brand/60 bg-brand/10'
                    : 'border-line/30 bg-surface/40 hover:border-brand/40'
                }`}
              >
                <p className="truncate text-sm font-semibold text-text">{message.name}</p>
                <p className="truncate text-xs text-muted">{message.email}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-accent">
                  {message.status}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line/50 bg-surfaceAlt/20 p-3">
          {selectedMessage ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-line/40 bg-surfaceAlt/40 px-3 py-2 text-sm text-muted">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted">From</p>
                  <p className="text-text">{selectedMessage.name}</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-accent hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="rounded-lg border border-line/40 bg-surfaceAlt/40 px-3 py-2 text-sm text-muted">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Subject</p>
                  <p className="text-text">{selectedMessage.subject ?? 'No subject'}</p>
                </div>
              </div>

              <div className="mt-2 rounded-lg border border-line/40 bg-[#04110b] px-3 py-3 text-sm text-emerald-100">
                {selectedMessage.message}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => void setStatusOptimistic(status)}
                    disabled={isSaving}
                    className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                      selectedMessage.status === status
                        ? 'border-brand/60 bg-brand/20 text-brand'
                        : 'border-line/60 bg-surfaceAlt/50 text-muted'
                    }`}
                  >
                    Mark {status}
                  </button>
                ))}
              </div>

              <textarea
                value={notesDraft}
                onChange={(event) => setNotesDraft(event.target.value)}
                placeholder="Owner notes..."
                className="mt-2 h-24 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <button
                type="button"
                onClick={() => void saveNotes()}
                disabled={isSaving}
                className="mt-2 rounded-xl bg-brand px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-70"
              >
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">Select a message to review details and reply state.</p>
          )}
        </div>
      </div>
    </OwnerPanel>
  );
}


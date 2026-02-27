'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest, fetchList, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';
import type { Database } from '@/types/supabase';

type SettingRow = Database['public']['Tables']['site_settings']['Row'];

interface SettingsSectionProps {
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

interface SettingsFormState {
  description: string;
  key: string;
  valueText: string;
}

const blankForm: SettingsFormState = {
  description: '',
  key: '',
  valueText: '{}'
};

function toForm(item: SettingRow): SettingsFormState {
  return {
    description: item.description ?? '',
    key: item.key,
    valueText: JSON.stringify(item.value, null, 2)
  };
}

export default function SettingsSection({ onToast, onUnauthorized }: SettingsSectionProps) {
  const [error, setError] = useState('');
  const [form, setForm] = useState<SettingsFormState>(blankForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingRow[]>([]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchList<SettingRow>('/api/settings', {
        page: 1,
        pageSize: 200
      });
      setSettings(response.items);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error instanceof Error ? error.message : 'Unable to load settings.');
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const selectSetting = (item: SettingRow) => {
    setSelectedKey(item.key);
    setForm(toForm(item));
    setError('');
  };

  const resetForm = () => {
    setSelectedKey(null);
    setForm(blankForm);
    setError('');
  };

  const saveSetting = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const value = JSON.parse(form.valueText) as unknown;
      const saved = await apiRequest<SettingRow>('/api/settings', {
        body: JSON.stringify({
          description: form.description || null,
          key: form.key.trim(),
          value
        }),
        method: 'POST'
      });
      setSettings((prev) => {
        const exists = prev.some((item) => item.key === saved.key);
        if (!exists) return [saved, ...prev];
        return prev.map((item) => (item.key === saved.key ? saved : item));
      });
      setSelectedKey(saved.key);
      setForm(toForm(saved));
      onToast('success', 'Setting saved.');
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to save setting.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteSetting = async () => {
    if (!selectedKey) {
      onToast('info', 'Select a setting first.');
      return;
    }
    const previous = settings;
    setSettings((prev) => prev.filter((item) => item.key !== selectedKey));
    const deletingKey = selectedKey;
    resetForm();
    setIsSubmitting(true);
    try {
      await apiRequest<{ deleted: boolean; key: string }>(
        `/api/settings?key=${encodeURIComponent(deletingKey)}`,
        { method: 'DELETE' }
      );
      onToast('success', 'Setting deleted.');
    } catch (error) {
      setSettings(previous);
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to delete setting.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OwnerPanel
      title="Settings"
      description="Manage dynamic site settings used across hero CTA, feature toggles, and integrations."
      actions={
        <button
          type="button"
          onClick={() => void loadSettings()}
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

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Keys ({settings.length})
            </p>
            {isLoading ? <span className="text-xs text-muted">Loading...</span> : null}
          </div>
          <div className="max-h-[52vh] space-y-1 overflow-y-auto pr-1">
            {settings.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectSetting(item)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selectedKey === item.key
                    ? 'border-brand/60 bg-brand/10'
                    : 'border-line/30 bg-surface/40 hover:border-brand/40'
                }`}
              >
                <p className="truncate text-sm font-semibold text-text">{item.key}</p>
                <p className="truncate text-xs text-muted">{item.description ?? 'No description'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line/50 bg-surfaceAlt/20 p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-line/60 bg-surfaceAlt/50 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
            >
              New Setting
            </button>
            <button
              type="button"
              onClick={() => void saveSetting()}
              disabled={isSubmitting}
              className="rounded-lg border border-accent/50 bg-accent/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffe0bf] transition hover:bg-accent/25 disabled:opacity-70"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => void deleteSetting()}
              disabled={isSubmitting}
              className="rounded-lg border border-brand/55 bg-brand/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ffd2b4] transition hover:bg-brand/25 disabled:opacity-70"
            >
              Delete
            </button>
          </div>

          <input
            value={form.key}
            onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
            placeholder="setting_key"
            className="w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
          />
          <input
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                description: event.target.value
              }))
            }
            placeholder="Description"
            className="mt-2 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
          />
          <textarea
            value={form.valueText}
            onChange={(event) => setForm((prev) => ({ ...prev, valueText: event.target.value }))}
            spellCheck={false}
            placeholder='{"text":"View Projects","href":"#projects"}'
            className="mt-2 h-[42vh] w-full rounded-xl border border-line/60 bg-[#0d0a08] px-3 py-2 font-mono text-xs text-[#ffd8bc] outline-none transition focus:border-brand/70"
          />
        </div>
      </div>
    </OwnerPanel>
  );
}

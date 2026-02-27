'use client';

import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ProfileSectionProps {
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

interface ProfileFormState {
  avatar_url: string;
  bio: string;
  cv_url: string;
  email: string;
  full_name: string;
  headline: string;
  highlightsText: string;
  id: string;
  location: string;
  open_to_work: boolean;
  phone: string;
  seo_description: string;
  seo_title: string;
  socialLinksText: string;
  techStackText: string;
}

function socialLinksToText(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '{}';
  }
  return JSON.stringify(value, null, 2);
}

function listToText(values: string[] | null) {
  return (values ?? []).join('\n');
}

function toStringValue(value: string | null) {
  return value ?? '';
}

function parseListInput(value: string) {
  return value
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapProfileToForm(profile: ProfileRow): ProfileFormState {
  return {
    avatar_url: toStringValue(profile.avatar_url),
    bio: profile.bio ?? '',
    cv_url: toStringValue(profile.cv_url),
    email: profile.email ?? '',
    full_name: profile.full_name ?? '',
    headline: profile.headline ?? '',
    highlightsText: listToText(profile.highlights),
    id: profile.id,
    location: profile.location ?? '',
    open_to_work: profile.open_to_work,
    phone: toStringValue(profile.phone),
    seo_description: toStringValue(profile.seo_description),
    seo_title: toStringValue(profile.seo_title),
    socialLinksText: socialLinksToText(profile.social_links),
    techStackText: listToText(profile.tech_stack)
  };
}

export default function ProfileSection({ onToast, onUnauthorized }: ProfileSectionProps) {
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<'avatar_url' | 'cv_url' | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const profile = await apiRequest<ProfileRow | null>('/api/profile');
      if (!profile) {
        setForm(null);
        setError('No profile row found. Seed a profile first.');
        return;
      }
      setForm(mapProfileToForm(profile));
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error instanceof Error ? error.message : 'Unable to load profile.');
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const previewData = useMemo(() => {
    if (!form) return null;
    return {
      full_name: form.full_name || '(No name)',
      headline: form.headline || '(No headline)',
      highlights: parseListInput(form.highlightsText),
      tech_stack: parseListInput(form.techStackText)
    };
  }, [form]);

  const setField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const saveProfile = async () => {
    if (!form) return;
    setIsSaving(true);
    setError('');
    try {
      const socialLinks = JSON.parse(form.socialLinksText) as Record<string, string>;
      const payload = {
        avatar_url: form.avatar_url || null,
        bio: form.bio,
        cv_url: form.cv_url || null,
        email: form.email,
        full_name: form.full_name,
        headline: form.headline,
        highlights: parseListInput(form.highlightsText),
        id: form.id,
        location: form.location,
        open_to_work: form.open_to_work,
        phone: form.phone || null,
        seo_description: form.seo_description || null,
        seo_title: form.seo_title || null,
        social_links: socialLinks,
        tech_stack: parseListInput(form.techStackText)
      };

      const updated = await apiRequest<ProfileRow>('/api/profile', {
        body: JSON.stringify(payload),
        method: 'PATCH'
      });
      setForm(mapProfileToForm(updated));
      onToast('success', 'Profile updated.');
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save profile. Check JSON formatting.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadFile = async (
    event: ChangeEvent<HTMLInputElement>,
    field: 'avatar_url' | 'cv_url'
  ) => {
    if (!form) return;
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'portfolio-assets';
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
      const path = `owner-uploads/${field}/${Date.now()}-${sanitizedName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      setField(field, data.publicUrl);
      onToast('success', `${field === 'avatar_url' ? 'Avatar' : 'CV'} uploaded.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'File upload failed.';
      setError(message);
      onToast('error', message);
    } finally {
      setUploadingField(null);
      event.target.value = '';
    }
  };

  return (
    <OwnerPanel
      title="Profile Editor"
      description="Update profile fields and preview the public-facing identity."
      actions={
        <>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text transition hover:border-brand/60"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => void saveProfile()}
            disabled={isSaving || !form}
            className="rounded-xl bg-brand px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:brightness-110 disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </>
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted">Loading profile...</p>
      ) : form ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.full_name}
                onChange={(event) => setField('full_name', event.target.value)}
                placeholder="Full name"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <input
                value={form.headline}
                onChange={(event) => setField('headline', event.target.value)}
                placeholder="Headline"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <input
                value={form.email}
                onChange={(event) => setField('email', event.target.value)}
                placeholder="Email"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <input
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                placeholder="Location"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <input
                value={form.phone}
                onChange={(event) => setField('phone', event.target.value)}
                placeholder="Phone"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
              />
              <label className="flex items-center gap-2 rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.open_to_work}
                  onChange={(event) => setField('open_to_work', event.target.checked)}
                />
                Open to work
              </label>
            </div>

            <textarea
              value={form.bio}
              onChange={(event) => setField('bio', event.target.value)}
              placeholder="Bio"
              className="h-32 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <textarea
                value={form.techStackText}
                onChange={(event) => setField('techStackText', event.target.value)}
                placeholder="Tech stack (comma or new line separated)"
                className="h-28 rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs outline-none transition focus:border-brand/70"
              />
              <textarea
                value={form.highlightsText}
                onChange={(event) => setField('highlightsText', event.target.value)}
                placeholder="Highlights (comma or new line separated)"
                className="h-28 rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs outline-none transition focus:border-brand/70"
              />
            </div>

            <textarea
              value={form.socialLinksText}
              onChange={(event) => setField('socialLinksText', event.target.value)}
              placeholder='{"linkedin":"...","github":"..."}'
              className="h-24 w-full rounded-xl border border-line/60 bg-[#04110b] px-3 py-2 font-mono text-xs text-emerald-100 outline-none transition focus:border-brand/70"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.avatar_url}
                onChange={(event) => setField('avatar_url', event.target.value)}
                placeholder="Avatar URL"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs outline-none transition focus:border-brand/70"
              />
              <input
                value={form.cv_url}
                onChange={(event) => setField('cv_url', event.target.value)}
                placeholder="CV URL"
                className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs outline-none transition focus:border-brand/70"
              />
              <label className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs text-muted">
                Upload Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void uploadFile(event, 'avatar_url')}
                  className="mt-1 block text-[11px]"
                />
              </label>
              <label className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-xs text-muted">
                Upload CV
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => void uploadFile(event, 'cv_url')}
                  className="mt-1 block text-[11px]"
                />
              </label>
            </div>

            <div className="text-xs text-muted">
              {uploadingField
                ? `Uploading ${uploadingField === 'avatar_url' ? 'avatar' : 'CV'}...`
                : 'Storage upload uses bucket `portfolio-assets` (or NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET).'}
            </div>
          </div>

          <div className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Live Preview
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.04em] text-text">
              {previewData?.full_name}
            </h3>
            <p className="mt-1 text-sm text-accent">{previewData?.headline}</p>
            <p className="mt-3 text-sm text-muted">{form.bio}</p>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Tech Stack
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {previewData?.tech_stack.slice(0, 12).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line/60 bg-surfaceAlt/60 px-2 py-0.5 text-[10px] text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Highlights
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted">
                {previewData?.highlights.slice(0, 5).map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </OwnerPanel>
  );
}


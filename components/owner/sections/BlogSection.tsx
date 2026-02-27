'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest, fetchList, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import type { ToastKind } from '@/components/owner/types';
import type { Database } from '@/types/supabase';

type BlogRow = Database['public']['Tables']['blog_posts']['Row'];

interface BlogSectionProps {
  onToast: (kind: ToastKind, message: string) => void;
  onUnauthorized: () => void;
}

interface BlogFormState {
  content: string;
  cover_image_url: string;
  excerpt: string;
  id?: string;
  is_published: boolean;
  reading_time_minutes: number;
  slug: string;
  tagsText: string;
  title: string;
}

const blankForm: BlogFormState = {
  content: '## New Article\n\nWrite your MDX content here.',
  cover_image_url: '',
  excerpt: '',
  is_published: false,
  reading_time_minutes: 5,
  slug: '',
  tagsText: '',
  title: ''
};

function toForm(item: BlogRow): BlogFormState {
  return {
    content: item.content ?? '',
    cover_image_url: item.cover_image_url ?? '',
    excerpt: item.excerpt ?? '',
    id: item.id,
    is_published: item.is_published,
    reading_time_minutes: item.reading_time_minutes ?? 5,
    slug: item.slug ?? '',
    tagsText: (item.tags ?? []).join(', '),
    title: item.title ?? ''
  };
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BlogSection({ onToast, onUnauthorized }: BlogSectionProps) {
  const [error, setError] = useState('');
  const [form, setForm] = useState<BlogFormState>(blankForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId]
  );

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchList<BlogRow>('/api/blog', {
        includeDeleted: true,
        page: 1,
        pageSize: 200
      });
      setPosts(response.items);
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setError(error instanceof Error ? error.message : 'Unable to load blog posts.');
    } finally {
      setIsLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const setField = <K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectPost = (post: BlogRow) => {
    setSelectedId(post.id);
    setForm(toForm(post));
    setError('');
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(blankForm);
    setError('');
  };

  const createPost = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        excerpt: form.excerpt,
        is_published: form.is_published,
        reading_time_minutes: form.reading_time_minutes,
        slug: form.slug,
        tags: parseTags(form.tagsText),
        title: form.title
      };
      const created = await apiRequest<BlogRow>('/api/blog', {
        body: JSON.stringify(payload),
        method: 'POST'
      });
      setPosts((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setForm(toForm(created));
      onToast('success', 'Blog post created.');
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to create blog post.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePost = async () => {
    if (!selectedId) {
      const message = 'Select a blog post first.';
      setError(message);
      onToast('info', message);
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        excerpt: form.excerpt,
        id: selectedId,
        is_published: form.is_published,
        reading_time_minutes: form.reading_time_minutes,
        slug: form.slug,
        tags: parseTags(form.tagsText),
        title: form.title
      };
      const updated = await apiRequest<BlogRow>('/api/blog', {
        body: JSON.stringify(payload),
        method: 'PATCH'
      });
      setPosts((prev) => prev.map((post) => (post.id === selectedId ? updated : post)));
      setForm(toForm(updated));
      onToast('success', 'Blog post updated.');
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to update blog post.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async () => {
    if (!selectedId) {
      const message = 'Select a blog post first.';
      setError(message);
      onToast('info', message);
      return;
    }
    const previous = posts;
    setPosts((prev) => prev.filter((post) => post.id !== selectedId));
    const deletingId = selectedId;
    resetForm();
    setIsSubmitting(true);
    try {
      await apiRequest<{ id: string }>(`/api/blog?id=${encodeURIComponent(deletingId)}`, {
        method: 'DELETE'
      });
      onToast('success', 'Blog post deleted.');
    } catch (error) {
      setPosts(previous);
      if (error instanceof OwnerApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to delete blog post.';
      setError(message);
      onToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OwnerPanel
      title="Blog"
      description="Create and manage blog posts using MDX-compatible content."
      actions={
        <button
          type="button"
          onClick={() => void loadPosts()}
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

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-line/50 bg-surfaceAlt/35 p-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Posts ({posts.length})
            </p>
            {isLoading ? <span className="text-xs text-muted">Loading...</span> : null}
          </div>
          <div className="max-h-[54vh] space-y-1 overflow-y-auto pr-1">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => selectPost(post)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  selectedId === post.id
                    ? 'border-brand/60 bg-brand/10'
                    : 'border-line/30 bg-surface/40 hover:border-brand/40'
                }`}
              >
                <p className="truncate text-sm font-semibold text-text">{post.title}</p>
                <p className="truncate text-xs text-muted">
                  {post.slug} | {post.is_published ? 'Published' : 'Draft'}
                </p>
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
              New Post
            </button>
            <button
              type="button"
              onClick={() => void createPost()}
              disabled={isSubmitting}
              className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-70"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => void updatePost()}
              disabled={isSubmitting}
              className="rounded-lg border border-accent/50 bg-accent/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-lime-100 transition hover:bg-accent/25 disabled:opacity-70"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => void deletePost()}
              disabled={isSubmitting}
              className="rounded-lg border border-brand/55 bg-brand/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-brand/25 disabled:opacity-70"
            >
              Delete
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={form.title}
              onChange={(event) => setField('title', event.target.value)}
              placeholder="Title"
              className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />
            <input
              value={form.slug}
              onChange={(event) => setField('slug', event.target.value)}
              placeholder="slug"
              className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />
            <input
              value={form.cover_image_url}
              onChange={(event) => setField('cover_image_url', event.target.value)}
              placeholder="Cover image URL"
              className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />
            <input
              value={form.tagsText}
              onChange={(event) => setField('tagsText', event.target.value)}
              placeholder="Tags (comma separated)"
              className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />
            <input
              type="number"
              min={1}
              max={180}
              value={form.reading_time_minutes}
              onChange={(event) => setField('reading_time_minutes', Number(event.target.value))}
              placeholder="Reading time"
              className="rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
            />
            <label className="flex items-center gap-2 rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) => setField('is_published', event.target.checked)}
              />
              Publish post
            </label>
          </div>

          <textarea
            value={form.excerpt}
            onChange={(event) => setField('excerpt', event.target.value)}
            placeholder="Excerpt"
            className="mt-2 h-20 w-full rounded-xl border border-line/60 bg-surfaceAlt/60 px-3 py-2 text-sm outline-none transition focus:border-brand/70"
          />

          <textarea
            value={form.content}
            onChange={(event) => setField('content', event.target.value)}
            spellCheck={false}
            placeholder="MDX content"
            className="mt-2 h-[40vh] w-full rounded-xl border border-line/60 bg-[#04110b] px-3 py-2 font-mono text-xs text-emerald-100 outline-none transition focus:border-brand/70"
          />

          <p className="mt-2 text-xs text-muted">
            Use markdown/MDX syntax. Full MDX rendering and public blog pages are enabled in later phases.
          </p>
          {selectedPost ? (
            <p className="mt-1 text-xs text-muted">Editing ID: {selectedPost.id}</p>
          ) : null}
        </div>
      </div>
    </OwnerPanel>
  );
}


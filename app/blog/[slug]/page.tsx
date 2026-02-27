import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnalyticsTracker from '@/components/public/AnalyticsTracker';
import Footer from '@/components/public/Footer';
import Navbar from '@/components/public/Navbar';
import { getPublicPortfolioData, getPublishedBlogSlugs } from '@/lib/public-content';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];

function formatDate(value: string | null) {
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderMarkdownBlocks(content: string) {
  return content
    .split(/\n{2,}/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith('### ')) {
        return (
          <h3 key={`h3-${index}`} className="mt-6 font-display text-xl font-semibold text-text">
            {block.replace(/^###\s+/, '')}
          </h3>
        );
      }
      if (block.startsWith('## ')) {
        return (
          <h2 key={`h2-${index}`} className="mt-8 font-display text-2xl font-semibold text-text">
            {block.replace(/^##\s+/, '')}
          </h2>
        );
      }
      if (block.startsWith('# ')) {
        return (
          <h1 key={`h1-${index}`} className="mt-8 font-display text-3xl font-semibold text-text">
            {block.replace(/^#\s+/, '')}
          </h1>
        );
      }
      return (
        <p key={`p-${index}`} className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted sm:text-base">
          {block}
        </p>
      );
    });
}

async function getBlogPost(slug: string): Promise<BlogPostRow | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  if (!post) {
    return {
      title: 'Post Not Found'
    };
  }
  return {
    title: post.title,
    description: post.excerpt || post.title
  };
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogSlugs();
  return posts.map((post) => ({
    slug: post.slug
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [content, post] = await Promise.all([getPublicPortfolioData(), getBlogPost(params.slug)]);
  if (!post) notFound();
  const blogNavigation = content.navigation.map((item: { href: string; label: string }) => ({
    ...item,
    href: `/${item.href}`
  }));

  return (
    <>
      <Navbar
        navigation={blogNavigation}
        contact={content.contact}
        siteName={content.site.name}
      />
      <AnalyticsTracker />
      <main id="main-content" className="relative z-10 overflow-x-clip pt-28">
        <article className="section-shell">
          <Link
            href="/blog"
            className="inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-brand transition hover:text-accent"
          >
            Back to blog
          </Link>

          <p className="mt-6 text-xs uppercase tracking-[0.14em] text-accent">
            {formatDate(post.published_at)} | {post.reading_time_minutes} min read
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold uppercase tracking-[-0.03em] text-text sm:text-6xl">
            {post.title}
          </h1>
          {post.excerpt ? <p className="mt-4 max-w-3xl text-muted">{post.excerpt}</p> : null}

          <div className="mt-4 flex flex-wrap gap-1">
            {(post.tags ?? []).slice(0, 8).map((tag: string) => (
              <span key={`${post.id}-${tag}`} className="pill">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line/50 bg-surface/70 p-5 sm:p-8">
            {renderMarkdownBlocks(post.content)}
          </div>
        </article>
      </main>
      <Footer
        footer={content.footer}
        contact={content.contact}
        navigation={blogNavigation}
        site={content.site}
      />
    </>
  );
}

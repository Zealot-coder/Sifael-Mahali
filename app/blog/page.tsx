import Link from 'next/link';
import type { Metadata } from 'next';
import AnalyticsTracker from '@/components/public/AnalyticsTracker';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { getPublicPortfolioData } from '@/lib/public-content';

function formatDate(value: string | null) {
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicPortfolioData();
  return {
    title: 'Blog',
    description: `Articles and build notes from ${content.site.name}.`
  };
}

export default async function BlogPage() {
  const content = await getPublicPortfolioData();
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
        <section className="section-shell">
          <p className="inline-flex border border-brand/45 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            Blog
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold uppercase tracking-[-0.03em] text-text sm:text-6xl">
            Security Notes And Engineering Logs
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Published posts from the owner dashboard.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {content.blogPosts.map((post) => (
              <article key={post.id} className="glass-card p-6">
                <p className="text-xs uppercase tracking-[0.12em] text-accent">
                  {formatDate(post.publishedAt)} | {post.readingTimeMinutes} min
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold text-text">{post.title}</h2>
                <p className="mt-2 text-sm text-muted">{post.excerpt || 'No excerpt available.'}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.slice(0, 5).map((tag) => (
                    <span key={`${post.id}-${tag}`} className="pill">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-brand transition hover:text-accent"
                >
                  Read article
                </Link>
              </article>
            ))}
            {content.blogPosts.length === 0 ? (
              <div className="glass-card p-6 text-sm text-muted">No published posts yet.</div>
            ) : null}
          </div>
        </section>
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

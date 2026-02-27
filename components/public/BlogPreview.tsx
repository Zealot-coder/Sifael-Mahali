'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { PublicBlogPost } from '@/lib/public-content';
import Reveal from './motion/Reveal';
import SectionHeading from './SectionHeading';

interface BlogPreviewProps {
  posts: PublicBlogPost[];
}

function formatPublishedAt(value: string | null) {
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogPreview({ posts }: BlogPreviewProps) {
  const reduceMotion = useReducedMotion();
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="section-shell">
      <Reveal>
        <SectionHeading
          eyebrow="Blog"
          title="Security Notes And Build Logs"
          description="Selected posts from the owner dashboard. Read full writeups in the blog."
        />
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.slice(0, 6).map((post, index) => (
          <motion.article
            key={post.id}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: reduceMotion ? 0 : 0.04 * index,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card p-6"
          >
            <p className="text-xs uppercase tracking-[0.12em] text-accent">
              {formatPublishedAt(post.publishedAt)} | {post.readingTimeMinutes} min read
            </p>
            <h3 className="mt-3 font-display text-xl font-semibold text-text">{post.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt || 'No excerpt yet.'}</p>
            <div className="mt-4 flex flex-wrap gap-1">
              {post.tags.slice(0, 4).map((tag) => (
                <span key={`${post.id}-${tag}`} className="pill">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-4 inline-flex text-sm font-semibold text-brand transition hover:text-accent"
            >
              Read post
            </Link>
          </motion.article>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/blog"
          className="cta-secondary"
        >
          View all blog posts
        </Link>
      </div>
    </section>
  );
}

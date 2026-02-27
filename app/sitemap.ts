import type { MetadataRoute } from 'next';
import { getPublishedBlogSlugs } from '@/lib/public-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sifael-mahali-portfolio.vercel.app';
  const posts = await getPublishedBlogSlugs();

  const blogRoutes = posts.map((post) => ({
    changeFrequency: 'weekly' as const,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    priority: 0.7,
    url: `${url}/blog/${post.slug}`
  }));

  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${url}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    ...blogRoutes
  ];
}

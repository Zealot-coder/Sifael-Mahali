import type { Metadata, Viewport } from 'next';
import { Manrope, Syne } from 'next/font/google';
import { getPublicPortfolioData } from '@/lib/public-content';
import './globals.css';

const fontSans = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

const fontDisplay = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sifael-mahali-portfolio.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicPortfolioData();
  const ogImage = `/api/og?title=${encodeURIComponent(content.site.name)}&subtitle=${encodeURIComponent(
    content.hero.tagline
  )}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: content.site.title,
      template: `%s | ${content.site.name}`
    },
    description: content.site.description,
    keywords: content.site.keywords,
    openGraph: {
      type: 'website',
      url: siteUrl,
      title: content.site.title,
      description: content.site.description,
      siteName: `${content.site.name} Portfolio`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${content.site.name} Portfolio`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: content.site.title,
      description: content.site.description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: '#04100b'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontDisplay.variable} bg-bg text-text antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}

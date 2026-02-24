import type { Metadata, Viewport } from 'next';
import { Manrope, Syne } from 'next/font/google';
import { portfolioContent } from '@/content/content';
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: portfolioContent.site.title,
    template: '%s | Sifael Mahali'
  },
  description: portfolioContent.site.description,
  keywords: portfolioContent.site.keywords,
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: portfolioContent.site.title,
    description: portfolioContent.site.description,
    siteName: 'Sifael Mahali Portfolio',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Sifael Mahali Portfolio'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioContent.site.title,
    description: portfolioContent.site.description,
    images: ['/og-image.svg']
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: '#090603'
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

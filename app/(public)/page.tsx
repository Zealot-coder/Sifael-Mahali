import dynamic from 'next/dynamic';
import AppBackgroundMarquee from '@/components/public/AppBackgroundMarquee';
import AnalyticsTracker from '@/components/public/AnalyticsTracker';
import Footer from '@/components/public/Footer';
import Hero from '@/components/public/Hero';
import IntroLoader from '@/components/public/IntroLoader';
import Navbar from '@/components/public/Navbar';
import PageCurtain from '@/components/public/PageCurtain';
import { getPublicPortfolioData } from '@/lib/public-content';

const About = dynamic(() => import('@/components/public/About'));
const Projects = dynamic(() => import('@/components/public/Projects'));
const Experience = dynamic(() => import('@/components/public/Experience'));
const Skills = dynamic(() => import('@/components/public/Skills'));
const Contact = dynamic(() => import('@/components/public/Contact'));
const Testimonials = dynamic(() => import('@/components/public/Testimonials'));
const BlogPreview = dynamic(() => import('@/components/public/BlogPreview'));

export default async function HomePage() {
  const content = await getPublicPortfolioData();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        name: content.site.name,
        description: content.site.description,
        jobTitle: content.hero.tagline,
        email: content.contact.email,
        sameAs: content.contact.socials.map((item) => item.url),
        knowsAbout: content.site.keywords
      },
      {
        '@type': 'WebSite',
        name: `${content.site.name} Portfolio`,
        description: content.site.description,
        url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sifael-mahali-portfolio.vercel.app'
      }
    ]
  };

  return (
    <>
      <IntroLoader />
      <PageCurtain />
      <AppBackgroundMarquee name={content.site.name} />
      <Navbar
        navigation={content.navigation}
        contact={content.contact}
        siteName={content.site.name}
      />
      <AnalyticsTracker />
      <main id="main-content" className="relative z-10 overflow-x-clip">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Hero hero={content.hero} />
        <About about={content.about} dataStatus={content.dataStatus} />
        <Projects
          projects={content.projects}
          projectCategories={content.projectCategories}
        />
        <Experience
          experience={content.experience}
          education={content.education}
        />
        <Skills skills={content.skills} certifications={content.certifications} />
        <Testimonials testimonials={content.testimonials} />
        <BlogPreview posts={content.blogPosts} />
        <Contact contact={content.contact} />
      </main>
      <Footer
        footer={content.footer}
        contact={content.contact}
        navigation={content.navigation}
        site={content.site}
      />
    </>
  );
}

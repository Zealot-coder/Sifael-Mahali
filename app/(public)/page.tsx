import dynamic from 'next/dynamic';
import AppBackgroundMarquee from '@/components/public/AppBackgroundMarquee';
import Footer from '@/components/public/Footer';
import Hero from '@/components/public/Hero';
import IntroLoader from '@/components/public/IntroLoader';
import Navbar from '@/components/public/Navbar';
import PageCurtain from '@/components/public/PageCurtain';
import { getPortfolioContent } from '@/lib/portfolio-store';

const About = dynamic(() => import('@/components/public/About'));
const Projects = dynamic(() => import('@/components/public/Projects'));
const Experience = dynamic(() => import('@/components/public/Experience'));
const Skills = dynamic(() => import('@/components/public/Skills'));
const Contact = dynamic(() => import('@/components/public/Contact'));

export default async function HomePage() {
  const content = await getPortfolioContent();

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
      <main id="main-content" className="relative z-10 overflow-x-clip">
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

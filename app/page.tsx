import dynamic from 'next/dynamic';
import AppBackgroundMarquee from '@/components/AppBackgroundMarquee';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import IntroLoader from '@/components/IntroLoader';
import Navbar from '@/components/Navbar';
import PageCurtain from '@/components/PageCurtain';
import { getPortfolioContent } from '@/lib/portfolio-store';

const About = dynamic(() => import('@/components/About'));
const Projects = dynamic(() => import('@/components/Projects'));
const Experience = dynamic(() => import('@/components/Experience'));
const Skills = dynamic(() => import('@/components/Skills'));
const Contact = dynamic(() => import('@/components/Contact'));

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

import dynamic from 'next/dynamic';
import AppBackgroundMarquee from '@/components/AppBackgroundMarquee';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import IntroLoader from '@/components/IntroLoader';
import Navbar from '@/components/Navbar';
import PageCurtain from '@/components/PageCurtain';

const About = dynamic(() => import('@/components/About'));
const Projects = dynamic(() => import('@/components/Projects'));
const Experience = dynamic(() => import('@/components/Experience'));
const Skills = dynamic(() => import('@/components/Skills'));
const Contact = dynamic(() => import('@/components/Contact'));

export default function HomePage() {
  return (
    <>
      <IntroLoader />
      <PageCurtain />
      <AppBackgroundMarquee />
      <Navbar />
      <main id="main-content" className="relative z-10 overflow-x-clip">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

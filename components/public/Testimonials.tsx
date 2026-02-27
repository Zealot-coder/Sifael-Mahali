'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { PublicTestimonial } from '@/lib/public-content';
import Reveal from './motion/Reveal';
import SectionHeading from './SectionHeading';

interface TestimonialsProps {
  testimonials: PublicTestimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const reduceMotion = useReducedMotion();
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section-shell">
      <Reveal>
        <SectionHeading
          eyebrow="Testimonials"
          title="What Collaborators Say"
          description="Recommendations and references from peers and mentors."
        />
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item, index) => (
          <motion.article
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{
              duration: 0.6,
              delay: reduceMotion ? 0 : 0.04 * index,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="glass-card p-6"
          >
            <p className="text-sm leading-relaxed text-muted">{item.content}</p>
            <div className="mt-5 border-t border-line/40 pt-4">
              <p className="text-sm font-semibold text-text">{item.authorName}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-accent">
                {[item.authorTitle, item.relationship].filter(Boolean).join(' | ')}
              </p>
              {item.authorLinkedinUrl ? (
                <a
                  href={item.authorLinkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-muted underline-offset-2 transition hover:text-brand hover:underline"
                >
                  View LinkedIn
                </a>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PortfolioContent } from '@/content/content';
import Reveal from './motion/Reveal';
import SectionHeading from './SectionHeading';

interface SkillsProps {
  skills: PortfolioContent['skills'];
  certifications: PortfolioContent['certifications'];
}

export default function Skills({ skills, certifications }: SkillsProps) {
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState(skills[0]?.category ?? 'Skills');

  const activeSkills = useMemo(
    () => skills.find((item) => item.category === activeCategory)?.items ?? [],
    [activeCategory, skills]
  );

  return (
    <section id="skills" className="section-shell">
      <Reveal>
        <SectionHeading
          eyebrow="Skills"
          title="Core Capabilities"
          description="Explore capability groups with tabbed categories and animated proficiency bars."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap gap-2">
            {skills.map((group) => (
              <button
                key={group.category}
                type="button"
                onClick={() => setActiveCategory(group.category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  activeCategory === group.category
                    ? 'border-brand/60 bg-brand/20 text-brand'
                    : 'border-line/50 bg-surfaceAlt/50 text-muted hover:border-brand/40 hover:text-text'
                }`}
              >
                {group.category}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeSkills.map((skill) => (
              <div key={`${activeCategory}-${skill.name}`}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-text">{skill.name}</span>
                  <span className="text-muted">{skill.level}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surfaceAlt/80">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {certifications.length > 0 ? (
        <Reveal delay={0.11}>
          <div className="mt-6 glass-card p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold text-text">
              Certifications and Achievements
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {certifications.map((cert) => (
                <li key={cert.name} className="rounded-xl border border-line/40 bg-surfaceAlt/40 p-3">
                  {cert.name} | {cert.issuer} | {cert.issueDate}
                  {cert.credentialId ? ` | Credential ID: ${cert.credentialId}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}

import { portfolioContent } from '@/content/content';
import Reveal from './motion/Reveal';
import SectionHeading from './SectionHeading';

export default function Skills() {
  return (
    <section id="skills" className="section-shell">
      <Reveal>
        <SectionHeading
          eyebrow="Skills"
          title="Core Capabilities"
          description="Proficiency bars are lightweight visual indicators and easy to tune from content.ts."
        />
      </Reveal>

      <Reveal delay={0.05}>
        <div className="grid gap-6 md:grid-cols-2">
          {portfolioContent.skills.map((group) => (
            <article key={group.category} className="glass-card p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold text-text">{group.category}</h3>
              <ul className="mt-4 space-y-4">
                {group.items.map((skill) => (
                  <li key={`${group.category}-${skill.name}`}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-text">{skill.name}</span>
                      <span className="text-muted">{skill.level}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surfaceAlt/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Reveal>

      {portfolioContent.certifications.length > 0 ? (
        <Reveal delay={0.11}>
          <div className="mt-6 glass-card p-6 sm:p-8">
            <h3 className="font-display text-xl font-semibold text-text">
              Certifications and Achievements
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {portfolioContent.certifications.map((cert) => (
                <li key={cert.name} className="rounded-xl border border-line/40 bg-surfaceAlt/40 p-3">
                  {cert.name} | {cert.issuer} | {cert.year}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}

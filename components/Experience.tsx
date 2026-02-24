import { portfolioContent } from '@/content/content';
import SectionHeading from './SectionHeading';

export default function Experience() {
  return (
    <section id="experience" className="section-shell">
      <SectionHeading
        eyebrow="Experience"
        title="Work and education timeline"
        description="Structured to mirror LinkedIn chronology. Replace placeholders with exact entries."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="glass-card p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-text">Experience</h3>
          <ol className="mt-6 space-y-6 border-l border-line/50 pl-5">
            {portfolioContent.experience.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border border-brand/60 bg-bg" />
                <p className="text-xs uppercase tracking-[0.14em] text-accent">
                  {item.start} - {item.end}
                </p>
                <h4 className="mt-1 text-base font-semibold text-text">{item.role}</h4>
                <p className="text-sm text-muted">{item.organization}</p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {item.achievements.map((point) => (
                    <li key={point} className="rounded-lg border border-line/30 bg-surfaceAlt/40 p-2">
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </article>

        <article className="glass-card p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-text">Education</h3>
          <ol className="mt-6 space-y-6 border-l border-line/50 pl-5">
            {portfolioContent.education.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border border-accent/70 bg-bg" />
                <p className="text-xs uppercase tracking-[0.14em] text-accent">
                  {item.start} - {item.end}
                </p>
                <h4 className="mt-1 text-base font-semibold text-text">{item.degree}</h4>
                <p className="text-sm text-muted">{item.institution}</p>
                <p className="mt-2 text-sm text-muted">{item.notes}</p>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}

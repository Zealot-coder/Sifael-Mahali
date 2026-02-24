import { portfolioContent } from '@/content/content';
import SectionHeading from './SectionHeading';

export default function About() {
  const { about, dataStatus } = portfolioContent;

  return (
    <section id="about" className="section-shell">
      <SectionHeading
        eyebrow="About"
        title="Secure Engineering, Clean Product Thinking"
        description="I build digital products with performance, trust, and usability at the center."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="glass-card p-6 sm:p-8">
          <p className="text-base leading-relaxed text-text/90">{about.bio}</p>
          <p className="mt-4 text-xs text-muted">{dataStatus.note}</p>
        </article>

        <article className="glass-card p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-text">
            Highlights
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {about.highlights.map((item) => (
              <li key={item} className="rounded-xl border border-line/40 bg-surfaceAlt/40 p-3">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-6 glass-card p-6 sm:p-8">
        <h3 className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-text">
          Tech Stack
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {about.techStack.map((tech) => (
            <span key={tech} className="pill">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

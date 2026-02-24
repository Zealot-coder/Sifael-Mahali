import { portfolioContent } from '@/content/content';
import Reveal from './motion/Reveal';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line/50 pt-12">
      <Reveal className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div>
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-4 text-sm uppercase tracking-[0.12em] text-muted">
              <p>
                {portfolioContent.footer.location}
                <br />
                {portfolioContent.footer.timezone}
              </p>
              <a
                href={`mailto:${portfolioContent.contact.email}`}
                className="inline-block text-text transition hover:text-brand"
              >
                {portfolioContent.contact.email}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4 text-right text-sm font-semibold uppercase tracking-[0.12em]">
              {portfolioContent.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-muted transition hover:text-brand"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-line/50 py-5 text-xs uppercase tracking-[0.16em] text-muted">
            Copyright {year} {portfolioContent.site.name}. All rights reserved.
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="pointer-events-none select-none overflow-hidden font-display text-[15vw] font-semibold uppercase leading-[0.75] tracking-[-0.05em] text-brand/30 sm:text-[11vw]">
          {portfolioContent.site.name}
        </p>
      </Reveal>
    </footer>
  );
}

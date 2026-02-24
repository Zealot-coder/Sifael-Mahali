import { portfolioContent } from '@/content/content';

export default function AppBackgroundMarquee() {
  const name = portfolioContent.site.name;
  const line = `${name}   ${name}   ${name}   ${name}   ${name}   `;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute left-[-12%] top-[14vh] w-[230%] whitespace-nowrap font-display text-[18vw] font-semibold uppercase leading-[0.8] tracking-[-0.06em] text-brand/8 motion-reduce:animate-none sm:text-[14vw]">
        <div className="animate-marquee">{line + line}</div>
      </div>

      <div className="absolute bottom-[8vh] left-[-20%] w-[230%] whitespace-nowrap font-display text-[16vw] font-semibold uppercase leading-[0.8] tracking-[-0.06em] text-text/5 motion-reduce:animate-none sm:text-[12vw]">
        <div className="animate-marquee [animation-duration:32s] [animation-direction:reverse]">
          {line + line}
        </div>
      </div>
    </div>
  );
}

interface AppBackgroundMarqueeProps {
  name: string;
}

export default function AppBackgroundMarquee({ name }: AppBackgroundMarqueeProps) {
  const line = `${name}   ${name}   ${name}   ${name}   ${name}   `;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]"
    >
      <div className="absolute left-[-10%] top-[18vh] w-[220%] whitespace-nowrap font-display text-[14vw] font-semibold uppercase leading-[0.78] tracking-[-0.06em] text-brand/4 motion-reduce:animate-none sm:text-[11vw]">
        <div className="animate-marquee">{line + line}</div>
      </div>

      <div className="absolute bottom-[10vh] left-[-18%] hidden w-[220%] whitespace-nowrap font-display text-[13vw] font-semibold uppercase leading-[0.78] tracking-[-0.06em] text-text/4 motion-reduce:animate-none sm:block sm:text-[10vw]">
        <div className="animate-marquee [animation-duration:32s] [animation-direction:reverse]">
          {line + line}
        </div>
      </div>

      <div className="absolute inset-0 bg-bg/55" />
    </div>
  );
}

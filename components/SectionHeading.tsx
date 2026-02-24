interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description
}: SectionHeadingProps) {
  return (
    <div className="mb-8">
      <p className="mb-3 inline-flex rounded-full border border-line/50 bg-surfaceAlt/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-semibold leading-tight text-text sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

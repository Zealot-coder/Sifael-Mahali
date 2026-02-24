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
    <div className="mb-10">
      <p className="mb-4 inline-flex border border-line/60 bg-surfaceAlt/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand">
        {eyebrow}
      </p>
      <h2 className="max-w-5xl font-display text-4xl font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-text sm:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

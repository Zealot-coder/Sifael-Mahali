import { portfolioContent } from '@/content/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line/40 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          Copyright {year} {portfolioContent.site.name}. All rights reserved.
        </p>
        <p>
          {portfolioContent.footer.location} | {portfolioContent.footer.timezone}
        </p>
      </div>
    </footer>
  );
}

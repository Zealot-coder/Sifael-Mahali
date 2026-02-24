'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Project, ProjectCategory, portfolioContent } from '@/content/content';
import { cn } from '@/lib/cn';
import SectionHeading from './SectionHeading';

type FilterOption = 'All' | ProjectCategory;
type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  updated_at: string;
  archived: boolean;
  fork: boolean;
};

const SECURITY_TERMS = [
  'security',
  'cyber',
  'ctf',
  'forensic',
  'threat',
  'pentest',
  'vulnerability',
  'incident',
  'network',
  'siem',
  'osint'
];

const BACKEND_TERMS = [
  'api',
  'backend',
  'server',
  'spring',
  'java',
  'node',
  'python',
  'auth',
  'database'
];

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function repoCategories(repo: GitHubRepo): ProjectCategory[] {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  const categories: ProjectCategory[] = [];

  if (includesAny(haystack, SECURITY_TERMS)) categories.push('Security');
  if (includesAny(haystack, ['ai', 'ml', 'llm', 'neural'])) categories.push('AI');
  if (includesAny(haystack, ['mobile', 'android', 'ios', 'react-native', 'flutter']))
    categories.push('Mobile');
  if (categories.length === 0 || includesAny(haystack, BACKEND_TERMS))
    categories.push('Web');

  return [...new Set(categories)];
}

function repoScore(repo: GitHubRepo) {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  let score = 0;
  if (includesAny(haystack, SECURITY_TERMS)) score += 40;
  if (includesAny(haystack, BACKEND_TERMS)) score += 25;
  score += Math.min(20, repo.stargazers_count * 2);
  return score;
}

export default function Projects() {
  const reducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [githubProjects, setGithubProjects] = useState<Project[]>([]);
  const revealInitial = reducedMotion ? false : { opacity: 0, y: 28 };

  const filters = useMemo<FilterOption[]>(
    () => ['All', ...portfolioContent.projectCategories],
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadGitHubProjects = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/users/Zealot-coder/repos?per_page=100&sort=updated',
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/vnd.github+json'
            }
          }
        );

        if (!response.ok) return;

        const repositories = (await response.json()) as GitHubRepo[];

        const mapped = repositories
          .filter((repo) => !repo.fork && !repo.archived)
          .sort((a, b) => repoScore(b) - repoScore(a))
          .slice(0, 8)
          .map((repo) => {
            const categories = repoCategories(repo);
            const stack = [
              repo.language ?? '',
              ...(repo.topics ?? []).slice(0, 4),
              'GitHub API'
            ].filter(Boolean);
            const title = repo.name.replace(/[-_]/g, ' ');
            const lastUpdated = new Date(repo.updated_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short'
            });
            const imageText = encodeURIComponent(repo.name);

            return {
              id: `gh-${repo.id}`,
              title: title.replace(/\b\w/g, (char) => char.toUpperCase()),
              shortDescription:
                repo.description ??
                'GitHub repository imported dynamically. Add extended case-study context.',
              longDescription: `${
                repo.description ??
                'Repository imported dynamically from GitHub. Add architecture notes, security decisions, and outcomes.'
              }\n\nStars: ${repo.stargazers_count} • Last Updated: ${lastUpdated}`,
              categories,
              stack: [...new Set(stack)].slice(0, 5),
              githubUrl: repo.html_url,
              liveUrl: repo.homepage ?? '',
              screenshots: [
                `https://placehold.co/1200x675/140b06/f44e00?text=${imageText}`,
                `https://placehold.co/1200x675/140b06/ff8c29?text=${imageText}+Preview`
              ],
              source: 'github' as const,
              stars: repo.stargazers_count,
              updatedAt: lastUpdated
            };
          });

        setGithubProjects(mapped);
      } catch {
        // Silent fallback: component already has manual projects.
      }
    };

    void loadGitHubProjects();
    return () => controller.abort();
  }, []);

  const allProjects = useMemo(
    () => [...githubProjects, ...portfolioContent.projects],
    [githubProjects]
  );

  const filteredProjects =
    activeFilter === 'All'
      ? allProjects
      : allProjects.filter((project) => project.categories.includes(activeFilter));

  useEffect(() => {
    if (!selectedProject) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [selectedProject]);

  return (
    <section id="projects" className="section-shell">
      <motion.div
        initial={revealInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          eyebrow="Projects"
          title="Recent Builds And Security-Driven Experiments"
          description="Filter by domain, then open a card to view details, stack, and media placeholders."
        />
      </motion.div>

      <motion.div
        className="mb-6 flex flex-wrap gap-2"
        initial={revealInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: reducedMotion ? 0 : 0.05 }}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-sm',
                isActive
                  ? 'border-brand/60 bg-brand/20 text-brand'
                  : 'border-line/50 bg-surfaceAlt/50 text-muted hover:border-brand/40 hover:text-text'
              )}
            >
              {filter}
            </button>
          );
        })}
      </motion.div>

      <div className="mt-10 flex flex-col gap-8">
        {filteredProjects.map((project, index) => (
          <motion.button
            key={project.id}
            type="button"
            onClick={() => setSelectedProject(project)}
            className={cn(
              'group relative h-[68vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-line/45 bg-surface text-left shadow-glow transition hover:border-brand/60 md:sticky md:top-24',
              index % 2 === 0 ? 'md:w-[78%] md:self-start' : 'md:w-[78%] md:self-end'
            )}
            initial={revealInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.82,
              ease: [0.22, 1, 0.36, 1],
              delay: reducedMotion ? 0 : 0.05 + index * 0.04
            }}
          >
            <Image
              src={project.screenshots[0]}
              alt={`${project.title} preview`}
              fill
              sizes="(max-width: 768px) 100vw, 78vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg/90" />

            <div className="absolute left-0 top-0 flex w-full flex-wrap items-start justify-between gap-3 p-6">
              <p className="rounded-md border border-line/60 bg-black/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent backdrop-blur-sm">
                {project.categories.join(' | ')}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                {project.source === 'github' ? (
                  <span className="rounded-md border border-brand/50 bg-brand/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand backdrop-blur-sm">
                    GitHub Live
                  </span>
                ) : null}
                {project.stack.slice(0, 3).map((tech) => (
                  <span
                    key={`${project.id}-${tech}`}
                    className="rounded-md border border-line/60 bg-black/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text/85 backdrop-blur-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute bottom-0 w-full p-6 sm:p-8">
              <h3 className="font-display text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-text sm:text-4xl">
                {project.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text/80 sm:text-base">
                {project.shortDescription}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            className="fixed inset-0 z-[80]"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? {} : { opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              aria-label="Close project details"
              onClick={() => setSelectedProject(null)}
            />
            <motion.article
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-title"
              className="absolute left-1/2 top-1/2 max-h-[88vh] w-[min(980px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-line/40 bg-surface p-6 shadow-glow sm:p-8"
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? {} : { opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                    {selectedProject.categories.join(' | ')}
                  </p>
                  <h3 id="project-title" className="mt-2 font-display text-2xl font-semibold text-text">
                    {selectedProject.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="rounded-xl border border-line/50 bg-surfaceAlt/70 p-2 text-muted transition hover:border-brand/60 hover:text-text"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-muted">{selectedProject.longDescription}</p>

              {selectedProject.isPlaceholder ? (
                <p className="mt-3 rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-xs text-brand">
                  Placeholder project. Replace with exact LinkedIn or GitHub project data.
                </p>
              ) : null}

              {selectedProject.source === 'github' ? (
                <p className="mt-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
                  Synced from GitHub API. Stars: {selectedProject.stars ?? 0}
                  {selectedProject.updatedAt ? ` | Updated: ${selectedProject.updatedAt}` : ''}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedProject.stack.map((tech) => (
                  <span key={`${selectedProject.id}-modal-${tech}`} className="pill">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedProject.githubUrl ? (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-line/50 bg-surfaceAlt/70 px-4 py-2 text-sm font-medium text-text transition hover:border-brand/60 hover:text-brand"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                ) : (
                  <span className="pill">Add your GitHub link here</span>
                )}

                {selectedProject.liveUrl ? (
                  <a
                    href={selectedProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-line/50 bg-surfaceAlt/70 px-4 py-2 text-sm font-medium text-text transition hover:border-brand/60 hover:text-brand"
                  >
                    <ExternalLink size={16} />
                    Live Demo
                  </a>
                ) : (
                  <span className="pill">Add live link here</span>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {selectedProject.screenshots.map((shot, idx) => (
                  <div
                    key={`${selectedProject.id}-shot-${idx}`}
                    className="relative aspect-video overflow-hidden rounded-xl border border-line/40 bg-surfaceAlt/50"
                  >
                    <Image
                      src={shot}
                      alt={`${selectedProject.title} screenshot ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

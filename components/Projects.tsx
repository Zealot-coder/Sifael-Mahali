'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Project, ProjectCategory, portfolioContent } from '@/content/content';
import { cn } from '@/lib/cn';
import SectionHeading from './SectionHeading';

type FilterOption = 'All' | ProjectCategory;

export default function Projects() {
  const reducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [githubProjects, setGithubProjects] = useState<Project[]>([]);
  const [githubMeta, setGithubMeta] = useState<{
    source: string;
    rateLimited: boolean;
    error?: string;
  }>({
    source: 'loading',
    rateLimited: false
  });
  const revealInitial = reducedMotion ? false : { opacity: 0, y: 28 };

  const filters = useMemo<FilterOption[]>(
    () => ['All', ...portfolioContent.projectCategories],
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadGitHubProjects = async () => {
      try {
        const response = await fetch('/api/github-projects', {
          signal: controller.signal
        });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          ok?: boolean;
          projects?: Project[];
          source?: string;
          rateLimited?: boolean;
          error?: string;
        };

        if (Array.isArray(payload.projects)) {
          setGithubProjects(payload.projects);
        }

        setGithubMeta({
          source: payload.source ?? 'unknown',
          rateLimited: Boolean(payload.rateLimited),
          error: payload.error
        });
      } catch {
        setGithubMeta({
          source: 'unavailable',
          rateLimited: false,
          error: 'Unable to fetch GitHub projects.'
        });
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
          description="Pinned repositories are loaded from GitHub GraphQL when configured, then merged with case-study projects."
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

      {githubMeta.rateLimited ? (
        <div className="mb-6 rounded-xl border border-brand/40 bg-brand/10 px-4 py-3 text-xs font-medium text-brand sm:text-sm">
          GitHub API rate limit reached. Showing local case-study projects as fallback.
        </div>
      ) : null}

      {githubMeta.source === 'graphql-pinned' ? (
        <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs font-medium text-accent sm:text-sm">
          Pinned repositories are being synced from GitHub GraphQL.
        </div>
      ) : null}

      {githubMeta.error && githubProjects.length === 0 ? (
        <div className="mb-6 rounded-xl border border-line/50 bg-surfaceAlt/55 px-4 py-3 text-xs text-muted sm:text-sm">
          {githubMeta.error}
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-8">
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-line/50 bg-surfaceAlt/50 px-6 py-8 text-sm text-muted">
            No projects matched this filter yet. Try another category or add more projects.
          </div>
        ) : (
          filteredProjects.map((project, index) => (
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
                  {project.isPinned ? (
                    <span className="rounded-md border border-accent/50 bg-accent/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent backdrop-blur-sm">
                      Pinned
                    </span>
                  ) : null}
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
                {project.source === 'github' ? (
                  <div className="mb-2 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text/75">
                    {project.language ? (
                      <span className="rounded-md border border-line/50 bg-black/25 px-2 py-1">
                        {project.language}
                      </span>
                    ) : null}
                    <span className="rounded-md border border-line/50 bg-black/25 px-2 py-1">
                      Stars {project.stars ?? 0}
                    </span>
                    {project.updatedAt ? (
                      <span className="rounded-md border border-line/50 bg-black/25 px-2 py-1">
                        Updated {project.updatedAt}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <h3 className="font-display text-3xl font-semibold uppercase leading-[0.92] tracking-[-0.02em] text-text sm:text-4xl">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-text/80 sm:text-base">
                  {project.shortDescription}
                </p>
              </div>
            </motion.button>
          ))
        )}
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
                  {selectedProject.isPinned ? 'Pinned Repository | ' : ''}
                  Synced from GitHub API. Stars: {selectedProject.stars ?? 0}
                  {selectedProject.language ? ` | Language: ${selectedProject.language}` : ''}
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

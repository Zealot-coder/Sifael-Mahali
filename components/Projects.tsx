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

  const filters = useMemo<FilterOption[]>(
    () => ['All', ...portfolioContent.projectCategories],
    []
  );

  const filteredProjects =
    activeFilter === 'All'
      ? portfolioContent.projects
      : portfolioContent.projects.filter((project) =>
          project.categories.includes(activeFilter)
        );

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
      <SectionHeading
        eyebrow="Projects"
        title="Recent Builds And Security-Driven Experiments"
        description="Filter by domain, then open a card to view details, stack, and media placeholders."
      />

      <div className="mb-6 flex flex-wrap gap-2">
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
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {filteredProjects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => setSelectedProject(project)}
            className={cn(
              'group relative h-[68vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-line/45 bg-surface text-left shadow-glow transition hover:border-brand/60 md:sticky md:top-24',
              index % 2 === 0 ? 'md:w-[78%] md:self-start' : 'md:w-[78%] md:self-end'
            )}
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
          </button>
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

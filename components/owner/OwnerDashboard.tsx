'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BadgeCheck,
  BookOpenText,
  Briefcase,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Settings2,
  Sparkles,
  UserCircle2,
  Wrench
} from 'lucide-react';
import { apiRequest, OwnerApiError } from '@/components/owner/api';
import OwnerPanel from '@/components/owner/OwnerPanel';
import OwnerToastViewport from '@/components/owner/OwnerToastViewport';
import AnalyticsSection from '@/components/owner/sections/AnalyticsSection';
import BlogSection from '@/components/owner/sections/BlogSection';
import CollectionCrudSection from '@/components/owner/sections/CollectionCrudSection';
import MessagesSection from '@/components/owner/sections/MessagesSection';
import OverviewSection from '@/components/owner/sections/OverviewSection';
import ProfileSection from '@/components/owner/sections/ProfileSection';
import SettingsSection from '@/components/owner/sections/SettingsSection';
import type { OwnerSection, OwnerSectionId, OwnerToast, ToastKind } from '@/components/owner/types';
import { cn } from '@/lib/utils/cn';
import type { Database } from '@/types/supabase';

type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ExperienceRow = Database['public']['Tables']['experiences']['Row'];
type SkillRow = Database['public']['Tables']['skills']['Row'];
type CertificationRow = Database['public']['Tables']['certifications']['Row'];
type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];

const ownerSections: OwnerSection[] = [
  { id: 'overview', label: 'Overview', description: 'Snapshot and health indicators' },
  { id: 'profile', label: 'Profile', description: 'Identity and hero profile data' },
  { id: 'projects', label: 'Projects', description: 'Portfolio projects CRUD + GitHub sync' },
  { id: 'experience', label: 'Experience', description: 'Work and education timeline entries' },
  { id: 'skills', label: 'Skills', description: 'Skill catalog and proficiency data' },
  {
    id: 'certifications',
    label: 'Certifications',
    description: 'Certificates, issuers, and credential links'
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    description: 'Social proof and recommendations'
  },
  { id: 'blog', label: 'Blog', description: 'Article content and publish state' },
  { id: 'messages', label: 'Messages', description: 'Contact inbox management' },
  { id: 'analytics', label: 'Analytics', description: 'Engagement and traffic analytics' },
  { id: 'settings', label: 'Settings', description: 'Dynamic configuration values' }
];

const ownerSectionIcons: Record<OwnerSectionId, typeof LayoutDashboard> = {
  analytics: Activity,
  blog: BookOpenText,
  certifications: BadgeCheck,
  experience: Briefcase,
  messages: Mail,
  overview: LayoutDashboard,
  profile: UserCircle2,
  projects: FolderKanban,
  settings: Settings2,
  skills: Wrench,
  testimonials: GraduationCap
};

const projectTemplate = {
  categories: ['web'],
  demo_url: null,
  description: 'Short project description',
  display_order: 0,
  is_pinned: false,
  long_description: 'Detailed project case-study notes',
  repo_url: null,
  slug: 'new-project',
  status: 'published',
  tech_stack: ['TypeScript', 'Next.js'],
  thumbnail_url: null,
  title: 'New Project'
};

const experienceTemplate = {
  bullets: ['Key result or impact'],
  description: 'Role summary',
  display_order: 0,
  end_date: null,
  is_current: true,
  location: 'Dar es Salaam, Tanzania',
  location_type: 'on-site',
  organization: 'Organization Name',
  skills: ['Skill A', 'Skill B'],
  start_date: '2025-01-01',
  title: 'Role Title',
  type: 'work'
};

const skillTemplate = {
  category: 'cybersecurity',
  display_order: 0,
  icon_name: null,
  is_featured: false,
  name: 'New Skill',
  proficiency: 70
};

const certificationTemplate = {
  credential_id: null,
  credential_url: null,
  description: null,
  display_order: 0,
  expiry_date: null,
  issue_date: '2026-01-01',
  issuer: 'Issuer Name',
  issuer_logo_url: null,
  name: 'Certification Name'
};

const testimonialTemplate = {
  author_avatar_url: null,
  author_linkedin_url: null,
  author_name: 'Full Name',
  author_title: 'Role / Company',
  content: 'Recommendation text...',
  display_order: 0,
  is_featured: false,
  relationship: 'Worked together'
};

export default function OwnerDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<OwnerSectionId>('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [toasts, setToasts] = useState<OwnerToast[]>([]);

  const activeSectionMeta = useMemo(
    () => ownerSections.find((section) => section.id === activeSection),
    [activeSection]
  );

  const handleUnauthorized = useCallback(() => {
    router.replace('/owner/login?next=%2Fowner');
  }, [router]);

  const pushToast = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3400);
  }, []);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/owner/logout', {
        credentials: 'include',
        method: 'POST'
      });
    } finally {
      setIsLoggingOut(false);
      handleUnauthorized();
    }
  };

  const syncGithubProjects = async () => {
    setIsSyncingGithub(true);
    try {
      const result = await apiRequest<{ skipped?: boolean; synced: number }>('/api/projects/sync-github', {
        body: JSON.stringify({ limit: 12 }),
        method: 'POST'
      });
      if (result.skipped) {
        pushToast('info', 'GitHub sync finished with no importable repos.');
      } else {
        pushToast('success', `GitHub sync completed: ${result.synced} project(s).`);
      }
    } catch (error) {
      if (error instanceof OwnerApiError && error.status === 401) {
        handleUnauthorized();
        return;
      }
      pushToast('error', error instanceof Error ? error.message : 'GitHub sync failed.');
    } finally {
      setIsSyncingGithub(false);
    }
  };

  const renderActiveSection = () => {
    if (activeSection === 'overview') {
      return <OverviewSection onUnauthorized={handleUnauthorized} />;
    }

    if (activeSection === 'profile') {
      return <ProfileSection onToast={pushToast} onUnauthorized={handleUnauthorized} />;
    }

    if (activeSection === 'projects') {
      return (
        <CollectionCrudSection<ProjectRow>
          title="Projects"
          description="Create, edit, archive, and remove portfolio projects."
          endpoint="/api/projects"
          listQuery={{ includeDeleted: true }}
          defaultPayload={projectTemplate}
          itemTitle={(item) => item.title}
          itemSubtitle={(item) => `${item.slug} | ${item.status}`}
          onToast={pushToast}
          onUnauthorized={handleUnauthorized}
          topActions={
            <button
              type="button"
              onClick={() => void syncGithubProjects()}
              disabled={isSyncingGithub}
              className="owner-action-accent disabled:opacity-70"
            >
              {isSyncingGithub ? 'Syncing...' : 'Sync GitHub'}
            </button>
          }
        />
      );
    }

    if (activeSection === 'experience') {
      return (
        <CollectionCrudSection<ExperienceRow>
          title="Experience"
          description="Manage work and education timeline items."
          endpoint="/api/experience"
          defaultPayload={experienceTemplate}
          itemTitle={(item) => item.title}
          itemSubtitle={(item) => `${item.organization} | ${item.type}`}
          onToast={pushToast}
          onUnauthorized={handleUnauthorized}
        />
      );
    }

    if (activeSection === 'skills') {
      return (
        <CollectionCrudSection<SkillRow>
          title="Skills"
          description="Update skills by category with proficiency levels."
          endpoint="/api/skills"
          defaultPayload={skillTemplate}
          itemTitle={(item) => item.name}
          itemSubtitle={(item) => `${item.category} | ${item.proficiency}%`}
          onToast={pushToast}
          onUnauthorized={handleUnauthorized}
        />
      );
    }

    if (activeSection === 'certifications') {
      return (
        <CollectionCrudSection<CertificationRow>
          title="Certifications"
          description="Track certifications, issuers, and credential metadata."
          endpoint="/api/certifications"
          defaultPayload={certificationTemplate}
          itemTitle={(item) => item.name}
          itemSubtitle={(item) => `${item.issuer} | ${item.issue_date ?? 'No date'}`}
          onToast={pushToast}
          onUnauthorized={handleUnauthorized}
        />
      );
    }

    if (activeSection === 'testimonials') {
      return (
        <CollectionCrudSection<TestimonialRow>
          title="Testimonials"
          description="Manage recommendation quotes and featured visibility."
          endpoint="/api/testimonials"
          defaultPayload={testimonialTemplate}
          itemTitle={(item) => item.author_name}
          itemSubtitle={(item) => item.author_title || item.relationship}
          onToast={pushToast}
          onUnauthorized={handleUnauthorized}
        />
      );
    }

    if (activeSection === 'blog') {
      return <BlogSection onToast={pushToast} onUnauthorized={handleUnauthorized} />;
    }

    if (activeSection === 'messages') {
      return <MessagesSection onToast={pushToast} onUnauthorized={handleUnauthorized} />;
    }

    if (activeSection === 'analytics') {
      return <AnalyticsSection onToast={pushToast} onUnauthorized={handleUnauthorized} />;
    }

    if (activeSection === 'settings') {
      return <SettingsSection onToast={pushToast} onUnauthorized={handleUnauthorized} />;
    }

    return (
      <OwnerPanel title="Unknown Section" description="Select a valid owner dashboard section.">
        <p className="text-sm text-muted">Section not found.</p>
      </OwnerPanel>
    );
  };

  return (
    <div className="owner-shell text-text">
      <OwnerToastViewport toasts={toasts} />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="owner-aurora absolute -left-20 top-6 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
        <div className="owner-aurora absolute -right-10 bottom-8 h-80 w-80 rounded-full bg-accent/14 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-[1460px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="owner-chrome p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="owner-pill mb-2">
                <Sparkles size={12} className="mr-1.5 text-brand" />
                Secure Control Center
              </p>
              <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.03em] sm:text-3xl">
                Owner Dashboard
              </h1>
              <p className="mt-1 text-sm text-muted">
                {activeSectionMeta?.label}: {activeSectionMeta?.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="owner-action"
              >
                View Site
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                disabled={isLoggingOut}
                className="owner-action-danger disabled:opacity-70"
              >
                {isLoggingOut ? 'Logging Out...' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="owner-card h-fit p-3 lg:sticky lg:top-5">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Modules
            </p>
            <nav className="space-y-1">
              {ownerSections.map((section) => {
                const active = section.id === activeSection;
                const Icon = ownerSectionIcons[section.id] ?? LayoutDashboard;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full rounded-2xl border px-3 py-2 text-left transition',
                      active
                        ? 'border-brand/45 bg-brand/16 shadow-[0_0_0_1px_rgb(var(--brand)_/_0.28),0_0_24px_rgb(var(--brand)_/_0.16)]'
                        : 'border-transparent hover:border-brand/30 hover:bg-surfaceAlt/55'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          'mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-lg border text-muted',
                          active ? 'border-brand/55 bg-brand/15 text-brand' : 'border-line/45 bg-surfaceAlt/40'
                        )}
                      >
                        <Icon size={14} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text">
                          {section.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">{section.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main>{renderActiveSection()}</main>
        </div>
      </div>
    </div>
  );
}

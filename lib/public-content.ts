import { unstable_noStore as noStore } from 'next/cache';
import { getPortfolioContent } from '@/lib/portfolio-store';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Project, ProjectCategory } from '@/content/content';
import type { Database, Json } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProjectRow = Database['public']['Tables']['projects']['Row'];
type ExperienceRow = Database['public']['Tables']['experiences']['Row'];
type SkillRow = Database['public']['Tables']['skills']['Row'];
type CertificationRow = Database['public']['Tables']['certifications']['Row'];
type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];
type BlogRow = Database['public']['Tables']['blog_posts']['Row'];
type SettingRow = Database['public']['Tables']['site_settings']['Row'];

type HeroCta = { href: string; text: string };

export interface PublicTestimonial {
  authorLinkedinUrl: string | null;
  authorName: string;
  authorTitle: string;
  content: string;
  id: string;
  relationship: string;
}

export interface PublicBlogPost {
  excerpt: string;
  id: string;
  publishedAt: string | null;
  readingTimeMinutes: number;
  slug: string;
  tags: string[];
  title: string;
}

export interface PublicPortfolioData {
  about: {
    bio: string;
    highlights: string[];
    techStack: string[];
  };
  blogPosts: PublicBlogPost[];
  certifications: {
    credentialId?: string;
    issueDate: string;
    issuer: string;
    name: string;
  }[];
  contact: {
    email: string;
    socials: Array<{ handle: string; label: string; url: string }>;
  };
  dataStatus: {
    linkedInUrl: string;
    note: string;
    source: string;
  };
  education: {
    degree: string;
    end: string;
    fieldOfStudy?: string;
    id: string;
    institution: string;
    notes: string;
    start: string;
  }[];
  experience: {
    achievements: string[];
    employmentType?: string;
    end: string;
    id: string;
    location?: string;
    locationType?: string;
    organization: string;
    role: string;
    skillsUsed?: string[];
    start: string;
  }[];
  footer: {
    location: string;
    timezone: string;
  };
  hero: {
    availability: string;
    description: string;
    name: string;
    openToWork: boolean;
    primaryCta: { href: string; label: string };
    secondaryCta: { href: string; label: string };
    tagline: string;
  };
  navigation: Array<{ href: `#${string}`; label: string }>;
  profileId: string | null;
  projectCategories: ProjectCategory[];
  projects: Project[];
  site: {
    description: string;
    keywords: string[];
    name: string;
    title: string;
  };
  skills: {
    category: string;
    items: { level: number; name: string }[];
  }[];
  testimonials: PublicTestimonial[];
}

function toMonthYear(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function toDateLabel(date: string | null) {
  if (!date) return 'Present';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function toSlugText(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function normalizeProjectScreenshot(url: string) {
  return url
    .replace('/140b06/f44e00', '/03110a/22c55e')
    .replace('/140b06/ff8c29', '/03110a/84cc16')
    .replace('/140b06/fd9f45', '/03110a/38d07a');
}

function parseStringArray(values: string[] | null | undefined) {
  return (values ?? []).filter((value) => typeof value === 'string' && value.trim().length > 0);
}

function jsonRecord(value: Json): Record<string, Json> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, Json>;
}

function categoryToTitleCase(category: string): ProjectCategory {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'security' || normalized === 'cybersecurity') return 'Security';
  if (normalized === 'mobile') return 'Mobile';
  if (normalized === 'ai' || normalized === 'ml') return 'AI';
  return 'Web';
}

function categoriesFromRows(projects: ProjectRow[]): ProjectCategory[] {
  const set = new Set<ProjectCategory>();
  projects.forEach((project) => {
    parseStringArray(project.categories).forEach((category) => {
      set.add(categoryToTitleCase(category));
    });
  });
  if (set.size === 0) {
    return ['Security', 'Web', 'AI', 'Mobile'];
  }
  return [...set];
}

function getSettingMap(settings: SettingRow[]) {
  const map = new Map<string, Json>();
  settings.forEach((row) => map.set(row.key, row.value));
  return map;
}

function parseCta(value: Json | undefined, fallback: HeroCta): HeroCta {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const record = value as Record<string, unknown>;
  const text = typeof record.text === 'string' && record.text.trim() ? record.text : fallback.text;
  const href = typeof record.href === 'string' && record.href.trim() ? record.href : fallback.href;
  return { href, text };
}

function inferTimezoneFromLocation(location: string) {
  if (location.toLowerCase().includes('tanzania')) {
    return 'EAT (UTC+03:00)';
  }
  return 'UTC';
}

function mapProjects(rows: ProjectRow[]): Project[] {
  return rows.map((row) => {
    const screenshot = row.thumbnail_url
      ? normalizeProjectScreenshot(row.thumbnail_url)
      : `https://placehold.co/1200x675/03110a/22c55e?text=${encodeURIComponent(
          toSlugText(row.slug)
        )}`;

    const categories = parseStringArray(row.categories).map(categoryToTitleCase);

    return {
      categories: categories.length > 0 ? categories : ['Web'],
      githubUrl: row.repo_url ?? '',
      id: row.id,
      isPinned: row.is_pinned,
      isPlaceholder: false,
      liveUrl: row.demo_url ?? '',
      longDescription:
        row.long_description ??
        row.description ??
        'Project details will be expanded with architecture and security notes.',
      screenshots: [screenshot],
      shortDescription: row.description,
      source: row.is_github_synced ? 'github' : 'manual',
      stack: parseStringArray(row.tech_stack),
      title: row.title,
      updatedAt: toDateLabel(row.updated_at)
    };
  });
}

function fromFallback(): Promise<PublicPortfolioData> {
  return getPortfolioContent().then((content) => ({
    about: content.about,
    blogPosts: [],
    certifications: content.certifications,
    contact: content.contact,
    dataStatus: content.dataStatus,
    education: content.education,
    experience: content.experience,
    footer: content.footer,
    hero: {
      ...content.hero,
      openToWork: content.hero.availability.toLowerCase().includes('open')
    },
    navigation: content.navigation,
    profileId: null,
    projectCategories: content.projectCategories,
    projects: content.projects,
    site: content.site,
    skills: content.skills,
    testimonials: []
  }));
}

export async function getPublicPortfolioData(): Promise<PublicPortfolioData> {
  noStore();
  try {
    const supabase = createSupabaseServerClient();
    const [
      profileResponse,
      projectsResponse,
      experiencesResponse,
      skillsResponse,
      certificationsResponse,
      testimonialsResponse,
      blogResponse,
      settingsResponse
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: true }).limit(1).maybeSingle(),
      supabase
        .from('projects')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('experiences')
        .select('*')
        .order('display_order', { ascending: true })
        .order('start_date', { ascending: false }),
      supabase
        .from('skills')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true }),
      supabase
        .from('certifications')
        .select('*')
        .order('display_order', { ascending: true })
        .order('issue_date', { ascending: false }),
      supabase
        .from('testimonials')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true }),
      supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*')
    ]);

    const errors = [
      profileResponse.error,
      projectsResponse.error,
      experiencesResponse.error,
      skillsResponse.error,
      certificationsResponse.error,
      testimonialsResponse.error,
      blogResponse.error,
      settingsResponse.error
    ].filter(Boolean);

    if (errors.length > 0) {
      return fromFallback();
    }

    const profile = profileResponse.data as ProfileRow | null;
    if (!profile) {
      return fromFallback();
    }

    const projects = (projectsResponse.data ?? []) as ProjectRow[];
    const experiences = (experiencesResponse.data ?? []) as ExperienceRow[];
    const skillRows = (skillsResponse.data ?? []) as SkillRow[];
    const certificationRows = (certificationsResponse.data ?? []) as CertificationRow[];
    const testimonialRows = (testimonialsResponse.data ?? []) as TestimonialRow[];
    const blogRows = (blogResponse.data ?? []) as BlogRow[];
    const settings = (settingsResponse.data ?? []) as SettingRow[];
    const settingMap = getSettingMap(settings);
    const socialMap = jsonRecord(profile.social_links);
    const fallbackContent = await getPortfolioContent();

    const linkedInUrl =
      typeof socialMap.linkedin === 'string'
        ? socialMap.linkedin
        : fallbackContent.dataStatus.linkedInUrl;
    const githubUrl = typeof socialMap.github === 'string' ? socialMap.github : '';

    const primaryCta = parseCta(settingMap.get('hero_cta_primary'), {
      href: '#projects',
      text: 'View Projects'
    });
    const secondaryCta = parseCta(settingMap.get('hero_cta_secondary'), {
      href: '/cv',
      text: 'Download CV'
    });

    const mappedProjects = mapProjects(projects);
    const mappedExperience = experiences
      .filter((item) => item.type === 'work')
      .map((item) => ({
        achievements: parseStringArray(item.bullets),
        end: item.is_current ? 'Present' : toMonthYear(item.end_date),
        employmentType: '',
        id: item.id,
        location: item.location ?? undefined,
        locationType: item.location_type ?? undefined,
        organization: item.organization,
        role: item.title,
        skillsUsed: parseStringArray(item.skills),
        start: toMonthYear(item.start_date)
      }));

    const mappedEducation = experiences
      .filter((item) => item.type === 'education')
      .map((item) => ({
        degree: item.title,
        end: item.is_current ? 'Present' : toMonthYear(item.end_date),
        fieldOfStudy: '',
        id: item.id,
        institution: item.organization,
        notes: item.description ?? '',
        start: toMonthYear(item.start_date)
      }));

    const skillGroups = skillRows.reduce<Record<string, SkillRow[]>>((acc, row) => {
      const key = row.category || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});

    const mappedSkills = Object.entries(skillGroups).map(([category, rows]) => ({
      category: toSlugText(category),
      items: rows.map((row) => ({
        level: row.proficiency,
        name: row.name
      }))
    }));

    const mappedCertifications = certificationRows.map((row) => ({
      ...(row.credential_id ? { credentialId: row.credential_id } : {}),
      issueDate: toMonthYear(row.issue_date),
      issuer: row.issuer,
      name: row.name
    }));

    const mappedTestimonials = testimonialRows.map((row) => ({
      authorLinkedinUrl: row.author_linkedin_url,
      authorName: row.author_name,
      authorTitle: row.author_title,
      content: row.content,
      id: row.id,
      relationship: row.relationship
    }));

    const mappedBlogPosts = blogRows.map((row) => ({
      excerpt: row.excerpt,
      id: row.id,
      publishedAt: row.published_at,
      readingTimeMinutes: row.reading_time_minutes,
      slug: row.slug,
      tags: parseStringArray(row.tags),
      title: row.title
    }));

    const skillKeywords = skillRows.map((item) => item.name);
    const keywords = [...new Set([...fallbackContent.site.keywords, ...skillKeywords])].slice(0, 24);

    const navigation = [
      { label: 'Home', href: '#home' as const },
      { label: 'About', href: '#about' as const },
      { label: 'Projects', href: '#projects' as const },
      { label: 'Experience', href: '#experience' as const },
      { label: 'Skills', href: '#skills' as const },
      ...(mappedTestimonials.length > 0 ? [{ label: 'Testimonials', href: '#testimonials' as const }] : []),
      ...(mappedBlogPosts.length > 0 ? [{ label: 'Blog', href: '#blog' as const }] : []),
      { label: 'Contact', href: '#contact' as const }
    ];

    const timezoneSetting = settingMap.get('location_timezone');
    const timezone =
      typeof timezoneSetting === 'string' && timezoneSetting.trim()
        ? timezoneSetting
        : inferTimezoneFromLocation(profile.location);

    return {
      about: {
        bio: profile.bio,
        highlights: parseStringArray(profile.highlights),
        techStack: parseStringArray(profile.tech_stack)
      },
      blogPosts: mappedBlogPosts,
      certifications: mappedCertifications,
      contact: {
        email: profile.email,
        socials: [
          ...(linkedInUrl
            ? [
                {
                  handle: '/in/sifael-mahali-166447311',
                  label: 'LinkedIn',
                  url: linkedInUrl
                }
              ]
            : []),
          ...(githubUrl
            ? [
                {
                  handle: '@Zealot-coder',
                  label: 'GitHub',
                  url: githubUrl
                }
              ]
            : [])
        ]
      },
      dataStatus: {
        linkedInUrl,
        note: 'Public site data is loaded from Supabase and owner dashboard updates.',
        source: 'Supabase'
      },
      education: mappedEducation,
      experience: mappedExperience,
      footer: {
        location: profile.location,
        timezone
      },
      hero: {
        availability: profile.open_to_work
          ? 'Open to work'
          : 'Focused on learning and current commitments',
        description: profile.bio,
        name: profile.full_name.toUpperCase(),
        openToWork: profile.open_to_work,
        primaryCta: { href: primaryCta.href, label: primaryCta.text },
        secondaryCta: { href: secondaryCta.href, label: secondaryCta.text },
        tagline: profile.headline
      },
      navigation,
      profileId: profile.id,
      projectCategories: categoriesFromRows(projects),
      projects: mappedProjects,
      site: {
        description: profile.seo_description || profile.bio,
        keywords,
        name: profile.full_name.toUpperCase(),
        title:
          profile.seo_title ||
          `${profile.full_name} | ${profile.headline || 'Cybersecurity Portfolio'}`
      },
      skills: mappedSkills,
      testimonials: mappedTestimonials
    };
  } catch {
    return fromFallback();
  }
}

export async function getPublishedBlogSlugs() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

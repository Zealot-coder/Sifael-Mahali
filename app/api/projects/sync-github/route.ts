import { type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  apiSuccess,
  normalizeError,
  readJsonBody,
  requireOwner,
  statusFromErrorCode
} from '@/lib/api';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils/slugify';

export const runtime = 'nodejs';

type RestRepoResponse = {
  archived: boolean;
  description: string | null;
  fork: boolean;
  homepage: string | null;
  html_url: string;
  language: string | null;
  name: string;
  stargazers_count: number;
  topics?: string[];
  updated_at: string;
};

const syncSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

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

const WEB_TERMS = [
  'api',
  'backend',
  'frontend',
  'fullstack',
  'web',
  'next',
  'react',
  'spring'
];

function toTitleCase(name: string) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function scoreRepo(repo: RestRepoResponse) {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  let score = 0;
  if (includesAny(haystack, SECURITY_TERMS)) score += 40;
  if (includesAny(haystack, WEB_TERMS)) score += 20;
  score += Math.min(20, repo.stargazers_count * 2);
  return score;
}

function categorizeRepo(repo: RestRepoResponse) {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${(repo.topics ?? []).join(' ')}`.toLowerCase();
  const categories = new Set<string>();
  if (includesAny(haystack, SECURITY_TERMS)) categories.add('security');
  if (includesAny(haystack, ['ai', 'ml', 'llm'])) categories.add('ai');
  if (includesAny(haystack, ['mobile', 'android', 'ios', 'flutter', 'react-native'])) {
    categories.add('mobile');
  }
  if (categories.size === 0 || includesAny(haystack, WEB_TERMS)) {
    categories.add('web');
  }
  return [...categories];
}

async function fetchRepos(username: string, token?: string) {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const repositories = (await response.json()) as RestRepoResponse[];
  return repositories.filter((repo) => !repo.archived && !repo.fork);
}

export async function POST(request: NextRequest) {
  const owner = await requireOwner();
  if (owner.errorResponse) return owner.errorResponse;

  try {
    const queryLimit = request.nextUrl.searchParams.get('limit');
    const body = await readJsonBody(request);
    const { limit } = syncSchema.parse({
      limit: queryLimit ?? body.limit
    });
    const username = process.env.GITHUB_USERNAME ?? 'Zealot-coder';
    const token = process.env.GITHUB_TOKEN;
    const repositories = await fetchRepos(username, token);
    const ranked = repositories.sort((a, b) => scoreRepo(b) - scoreRepo(a)).slice(0, limit);
    const supabase = createSupabaseServerClient();
    const candidateSlugs = ranked.map((repo) => slugify(repo.name)).filter(Boolean);

    const { data: existingRows, error: existingError } = await supabase
      .from('projects')
      .select('slug, is_github_synced')
      .in('slug', candidateSlugs);
    if (existingError) throw existingError;

    const existingBySlug = new Map(
      (existingRows ?? []).map((row) => [row.slug, row.is_github_synced])
    );
    const payload = ranked
      .map((repo, index) => {
        const slug = slugify(repo.name);
        if (!slug) return null;
        const existing = existingBySlug.get(slug);
        if (existing === false) return null;

        const techStack = [repo.language ?? '', ...(repo.topics ?? []).slice(0, 6)]
          .filter(Boolean)
          .slice(0, 8);
        const categories = categorizeRepo(repo);
        return {
          categories,
          demo_url: repo.homepage,
          description:
            repo.description ??
            'Synced from GitHub. Add project details and case-study outcomes here.',
          display_order: index,
          github_repo_name: repo.name,
          is_github_synced: true,
          is_pinned: false,
          long_description:
            repo.description ??
            'Project synchronized from GitHub. Add architecture, security decisions, and impact metrics.',
          repo_url: repo.html_url,
          slug,
          status: 'published' as const,
          tech_stack: techStack,
          title: toTitleCase(repo.name)
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (payload.length === 0) {
      return apiSuccess({
        skipped: true,
        reason: 'No sync-safe repositories found.',
        synced: 0,
        username
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .upsert(payload, { onConflict: 'slug' })
      .select('id, slug, title, github_repo_name, updated_at');

    if (error) throw error;

    return apiSuccess({
      skippedManualProjectSlugs: candidateSlugs.length - payload.length,
      synced: data?.length ?? payload.length,
      syncedProjects: data ?? [],
      username
    });
  } catch (error) {
    const normalized = normalizeError(error);
    return apiError(
      statusFromErrorCode(normalized.code),
      normalized.code,
      normalized.message,
      normalized.details
    );
  }
}

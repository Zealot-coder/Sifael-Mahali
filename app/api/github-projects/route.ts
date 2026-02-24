import { NextResponse } from 'next/server';
import type { Project, ProjectCategory } from '@/content/content';

export const runtime = 'nodejs';

type GitHubRepo = {
  id: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepageUrl: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  updatedAt: string;
  archived: boolean;
  fork: boolean;
};

type RestRepoResponse = {
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

type GraphqlRepoNode = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  updatedAt: string;
  isArchived: boolean;
  isFork: boolean;
  primaryLanguage: { name: string } | null;
  repositoryTopics?: { nodes: Array<{ topic: { name: string } }> };
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

const GITHUB_GRAPHQL_QUERY = `
query PinnedRepos($login: String!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          id
          name
          description
          url
          homepageUrl
          stargazerCount
          updatedAt
          isArchived
          isFork
          primaryLanguage { name }
          repositoryTopics(first: 10) {
            nodes {
              topic { name }
            }
          }
        }
      }
    }
  }
}
`;

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function repoCategories(repo: GitHubRepo): ProjectCategory[] {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${repo.topics.join(' ')}`.toLowerCase();
  const categories: ProjectCategory[] = [];

  if (includesAny(haystack, SECURITY_TERMS)) categories.push('Security');
  if (includesAny(haystack, ['ai', 'ml', 'llm', 'neural'])) categories.push('AI');
  if (includesAny(haystack, ['mobile', 'android', 'ios', 'react-native', 'flutter'])) {
    categories.push('Mobile');
  }
  if (categories.length === 0 || includesAny(haystack, BACKEND_TERMS)) categories.push('Web');

  return [...new Set(categories)];
}

function repoScore(repo: GitHubRepo) {
  const haystack =
    `${repo.name} ${repo.description ?? ''} ${repo.topics.join(' ')}`.toLowerCase();
  let score = 0;
  if (includesAny(haystack, SECURITY_TERMS)) score += 40;
  if (includesAny(haystack, BACKEND_TERMS)) score += 25;
  score += Math.min(20, repo.stars * 2);
  return score;
}

function toTitleCase(name: string) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeGraphqlRepo(node: GraphqlRepoNode): GitHubRepo {
  return {
    id: node.id,
    name: node.name,
    description: node.description,
    htmlUrl: node.url,
    homepageUrl: node.homepageUrl,
    language: node.primaryLanguage?.name ?? null,
    topics: node.repositoryTopics?.nodes.map((topicNode) => topicNode.topic.name) ?? [],
    stars: node.stargazerCount,
    updatedAt: node.updatedAt,
    archived: node.isArchived,
    fork: node.isFork
  };
}

function normalizeRestRepo(repo: RestRepoResponse): GitHubRepo {
  return {
    id: String(repo.id),
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    homepageUrl: repo.homepage,
    language: repo.language,
    topics: repo.topics ?? [],
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    archived: repo.archived,
    fork: repo.fork
  };
}

function isRateLimitMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('rate limit') ||
    normalized.includes('api rate limit exceeded') ||
    normalized.includes('x-ratelimit-remaining')
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown GitHub API error';
}

function repoToProject(repo: GitHubRepo, isPinned: boolean): Project {
  const categories = repoCategories(repo);
  const stack = [repo.language ?? '', ...repo.topics.slice(0, 4), 'GitHub API']
    .filter(Boolean)
    .slice(0, 5);
  const lastUpdated = new Date(repo.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short'
  });
  const imageText = encodeURIComponent(repo.name);

  return {
    id: `gh-${repo.id}`,
    title: toTitleCase(repo.name),
    shortDescription:
      repo.description ??
      'GitHub repository imported dynamically. Add extended case-study context.',
    longDescription: `${
      repo.description ??
      'Repository imported dynamically from GitHub. Add architecture notes, security decisions, and outcomes.'
    }\n\nStars: ${repo.stars} | Language: ${repo.language ?? 'N/A'} | Last Updated: ${lastUpdated}`,
    categories,
    stack,
    githubUrl: repo.htmlUrl,
    liveUrl: repo.homepageUrl ?? '',
    screenshots: [
      `https://placehold.co/1200x675/140b06/f44e00?text=${imageText}`,
      `https://placehold.co/1200x675/140b06/ff8c29?text=${imageText}+Preview`
    ],
    source: 'github',
    isPinned,
    language: repo.language ?? undefined,
    stars: repo.stars,
    updatedAt: lastUpdated,
    isPlaceholder: false
  };
}

async function fetchPinnedRepos(username: string, token: string): Promise<GitHubRepo[]> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: GITHUB_GRAPHQL_QUERY,
      variables: { login: username }
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const message = `GitHub GraphQL request failed with status ${response.status}`;
    throw new Error(message);
  }

  const payload = (await response.json()) as {
    data?: { user?: { pinnedItems?: { nodes?: Array<GraphqlRepoNode | null> } } };
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  const nodes = payload.data?.user?.pinnedItems?.nodes ?? [];
  return nodes
    .filter((node): node is GraphqlRepoNode => Boolean(node))
    .map(normalizeGraphqlRepo)
    .filter((repo) => !repo.archived && !repo.fork);
}

async function fetchRestRepos(username: string, token?: string): Promise<GitHubRepo[]> {
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
    const remaining = response.headers.get('x-ratelimit-remaining');
    let message = `GitHub REST request failed with status ${response.status}`;
    if (remaining === '0') {
      message += ' | x-ratelimit-remaining=0';
    }
    throw new Error(message);
  }

  const repositories = (await response.json()) as RestRepoResponse[];
  return repositories
    .map(normalizeRestRepo)
    .filter((repo) => !repo.archived && !repo.fork);
}

export async function GET() {
  const username = process.env.GITHUB_USERNAME ?? 'Zealot-coder';
  const token = process.env.GITHUB_TOKEN;
  const warnings: string[] = [];
  let rateLimited = false;
  let pinnedRepos: GitHubRepo[] = [];
  let restRepos: GitHubRepo[] = [];

  if (token) {
    try {
      pinnedRepos = await fetchPinnedRepos(username, token);
    } catch (error) {
      const message = getErrorMessage(error);
      warnings.push(`Pinned fetch failed: ${message}`);
      if (isRateLimitMessage(message)) rateLimited = true;
    }
  }

  try {
    restRepos = await fetchRestRepos(username, token);
  } catch (error) {
    const message = getErrorMessage(error);
    warnings.push(`Repo fetch failed: ${message}`);
    if (isRateLimitMessage(message)) rateLimited = true;

    if (pinnedRepos.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          source: 'unavailable',
          projects: [] as Project[],
          rateLimited,
          error: message,
          warnings
        },
        { status: 200 }
      );
    }
  }

  const pinnedIds = new Set(pinnedRepos.map((repo) => repo.id));
  const rankedRest = restRepos
    .filter((repo) => !pinnedIds.has(repo.id))
    .sort((a, b) => repoScore(b) - repoScore(a));

  const combined = [...pinnedRepos, ...rankedRest].slice(0, 8);
  const projects = combined.map((repo) => repoToProject(repo, pinnedIds.has(repo.id)));

  return NextResponse.json({
    ok: true,
    source: token && pinnedRepos.length > 0 ? 'graphql-pinned' : 'rest-fallback',
    projects,
    rateLimited,
    warnings
  });
}

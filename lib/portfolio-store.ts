import { promises as fs } from 'node:fs';
import path from 'node:path';
import { unstable_noStore as noStore } from 'next/cache';
import {
  portfolioContent as defaultPortfolioContent,
  type PortfolioContent
} from '@/content/content';

const CONTENT_KEY = 'portfolio:content:v1';
const LOCAL_CONTENT_PATH = path.join(process.cwd(), 'content', 'portfolio-content.local.json');

export type ContentStorageMode = 'kv' | 'file';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isKVConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function getDefaultContent() {
  return deepClone(defaultPortfolioContent);
}

function normalizeContent(candidate: unknown): PortfolioContent {
  const defaults = getDefaultContent();
  if (!candidate || typeof candidate !== 'object') return defaults;

  const value = candidate as Partial<PortfolioContent>;
  return {
    ...defaults,
    ...value,
    site: { ...defaults.site, ...(value.site ?? {}) },
    dataStatus: { ...defaults.dataStatus, ...(value.dataStatus ?? {}) },
    hero: { ...defaults.hero, ...(value.hero ?? {}) },
    about: { ...defaults.about, ...(value.about ?? {}) },
    contact: {
      ...defaults.contact,
      ...(value.contact ?? {}),
      socials: value.contact?.socials ?? defaults.contact.socials
    },
    footer: { ...defaults.footer, ...(value.footer ?? {}) },
    navigation: value.navigation ?? defaults.navigation,
    projects: value.projects ?? defaults.projects,
    experience: value.experience ?? defaults.experience,
    education: value.education ?? defaults.education,
    skills: value.skills ?? defaults.skills,
    certifications: value.certifications ?? defaults.certifications,
    projectCategories: value.projectCategories ?? defaults.projectCategories
  };
}

async function readFromKV() {
  const { kv } = await import('@vercel/kv');
  return kv.get<PortfolioContent>(CONTENT_KEY);
}

async function writeToKV(content: PortfolioContent) {
  const { kv } = await import('@vercel/kv');
  await kv.set(CONTENT_KEY, content);
}

async function readFromFile() {
  try {
    const raw = await fs.readFile(LOCAL_CONTENT_PATH, 'utf8');
    return JSON.parse(raw) as PortfolioContent;
  } catch {
    return null;
  }
}

async function writeToFile(content: PortfolioContent) {
  await fs.writeFile(LOCAL_CONTENT_PATH, JSON.stringify(content, null, 2), 'utf8');
}

export function getContentStorageMode(): ContentStorageMode {
  return isKVConfigured() ? 'kv' : 'file';
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  noStore();

  if (isKVConfigured()) {
    try {
      const kvContent = await readFromKV();
      if (kvContent) return normalizeContent(kvContent);
    } catch {
      // Fallback to file/default if KV is temporarily unavailable.
    }
  }

  const fileContent = await readFromFile();
  if (fileContent) return normalizeContent(fileContent);

  return getDefaultContent();
}

export async function savePortfolioContent(
  nextContent: PortfolioContent
): Promise<{ storage: ContentStorageMode }> {
  const normalized = normalizeContent(nextContent);

  if (isKVConfigured()) {
    await writeToKV(normalized);
    return { storage: 'kv' };
  }

  await writeToFile(normalized);
  return { storage: 'file' };
}

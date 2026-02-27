begin;

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  email text not null unique,
  phone text,
  avatar_url text,
  cv_url text,
  cv_version integer not null default 1 check (cv_version >= 1),
  open_to_work boolean not null default true,
  social_links jsonb not null default '{}'::jsonb,
  tech_stack text[] not null default '{}'::text[],
  highlights text[] not null default '{}'::text[],
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  long_description text,
  thumbnail_url text,
  demo_url text,
  repo_url text,
  tech_stack text[] not null default '{}'::text[],
  categories text[] not null default '{}'::text[],
  is_pinned boolean not null default false,
  is_github_synced boolean not null default false,
  github_repo_name text,
  display_order integer not null default 0,
  view_count integer not null default 0 check (view_count >= 0),
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('work', 'education')),
  title text not null,
  organization text not null,
  org_logo_url text,
  location text,
  location_type text check (location_type in ('on-site', 'remote', 'hybrid')),
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  bullets text[] not null default '{}'::text[],
  skills text[] not null default '{}'::text[],
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, title, organization, start_date),
  check (end_date is null or end_date >= start_date)
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  proficiency integer not null default 70 check (proficiency between 0 and 100),
  icon_name text,
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, category)
);

create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issuer_logo_url text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, issuer, issue_date),
  check (expiry_date is null or issue_date is null or expiry_date >= issue_date)
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null default '',
  content text not null default '',
  cover_image_url text,
  tags text[] not null default '{}'::text[],
  reading_time_minutes integer not null default 5 check (reading_time_minutes >= 1),
  is_published boolean not null default false,
  published_at timestamptz,
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_title text not null default '',
  author_avatar_url text,
  author_linkedin_url text,
  content text not null,
  relationship text not null default '',
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  ip_address text,
  user_agent text,
  replied_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'project_view', 'cv_download', 'contact_open')),
  page_path text not null default '/',
  referrer text,
  country_code text check (country_code is null or char_length(country_code) = 2),
  device_type text check (device_type is null or device_type in ('desktop', 'mobile', 'tablet')),
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_projects_set_updated_at on public.projects;
create trigger trg_projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_experiences_set_updated_at on public.experiences;
create trigger trg_experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

drop trigger if exists trg_skills_set_updated_at on public.skills;
create trigger trg_skills_set_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists trg_certifications_set_updated_at on public.certifications;
create trigger trg_certifications_set_updated_at
before update on public.certifications
for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_set_updated_at on public.blog_posts;
create trigger trg_blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_testimonials_set_updated_at on public.testimonials;
create trigger trg_testimonials_set_updated_at
before update on public.testimonials
for each row execute function public.set_updated_at();

drop trigger if exists trg_contact_messages_set_updated_at on public.contact_messages;
create trigger trg_contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists trg_analytics_events_set_updated_at on public.analytics_events;
create trigger trg_analytics_events_set_updated_at
before update on public.analytics_events
for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_set_updated_at on public.site_settings;
create trigger trg_site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create index if not exists idx_projects_status_deleted_order
  on public.projects (status, deleted_at, display_order);
create index if not exists idx_projects_is_pinned
  on public.projects (is_pinned);
create index if not exists idx_projects_categories_gin
  on public.projects using gin (categories);
create index if not exists idx_projects_tech_stack_gin
  on public.projects using gin (tech_stack);
create index if not exists idx_projects_created_at
  on public.projects (created_at desc);

create index if not exists idx_experiences_type_order
  on public.experiences (type, display_order, start_date desc);
create index if not exists idx_experiences_is_current
  on public.experiences (is_current);

create index if not exists idx_skills_category_order
  on public.skills (category, display_order);
create index if not exists idx_skills_is_featured
  on public.skills (is_featured);

create index if not exists idx_certifications_issue_date
  on public.certifications (issue_date desc);
create index if not exists idx_certifications_display_order
  on public.certifications (display_order);

create index if not exists idx_blog_posts_published
  on public.blog_posts (is_published, published_at desc);
create index if not exists idx_blog_posts_tags_gin
  on public.blog_posts using gin (tags);

create index if not exists idx_testimonials_featured_order
  on public.testimonials (is_featured, display_order);

create index if not exists idx_contact_messages_status_created_at
  on public.contact_messages (status, created_at desc);
create index if not exists idx_contact_messages_email
  on public.contact_messages (email);

create index if not exists idx_analytics_events_type_created_at
  on public.analytics_events (event_type, created_at desc);
create index if not exists idx_analytics_events_page_path
  on public.analytics_events (page_path);
create index if not exists idx_analytics_events_session_id
  on public.analytics_events (session_id);
create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);

commit;

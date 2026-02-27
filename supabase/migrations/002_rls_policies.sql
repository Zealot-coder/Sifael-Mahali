begin;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.skills enable row level security;
alter table public.certifications enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_messages enable row level security;
alter table public.analytics_events enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists profiles_public_read on public.profiles;
drop policy if exists profiles_owner_all on public.profiles;
create policy profiles_public_read
  on public.profiles
  for select
  to public
  using (true);
create policy profiles_owner_all
  on public.profiles
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists projects_public_read on public.projects;
drop policy if exists projects_owner_read on public.projects;
drop policy if exists projects_owner_all on public.projects;
create policy projects_public_read
  on public.projects
  for select
  to anon
  using (status = 'published' and deleted_at is null);
create policy projects_owner_read
  on public.projects
  for select
  to authenticated
  using (true);
create policy projects_owner_all
  on public.projects
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists experiences_public_read on public.experiences;
drop policy if exists experiences_owner_all on public.experiences;
create policy experiences_public_read
  on public.experiences
  for select
  to public
  using (true);
create policy experiences_owner_all
  on public.experiences
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists skills_public_read on public.skills;
drop policy if exists skills_owner_all on public.skills;
create policy skills_public_read
  on public.skills
  for select
  to public
  using (true);
create policy skills_owner_all
  on public.skills
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists certifications_public_read on public.certifications;
drop policy if exists certifications_owner_all on public.certifications;
create policy certifications_public_read
  on public.certifications
  for select
  to public
  using (true);
create policy certifications_owner_all
  on public.certifications
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists blog_posts_public_read on public.blog_posts;
drop policy if exists blog_posts_owner_read on public.blog_posts;
drop policy if exists blog_posts_owner_all on public.blog_posts;
create policy blog_posts_public_read
  on public.blog_posts
  for select
  to anon
  using (is_published = true and deleted_at is null);
create policy blog_posts_owner_read
  on public.blog_posts
  for select
  to authenticated
  using (true);
create policy blog_posts_owner_all
  on public.blog_posts
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists testimonials_public_read on public.testimonials;
drop policy if exists testimonials_owner_all on public.testimonials;
create policy testimonials_public_read
  on public.testimonials
  for select
  to public
  using (true);
create policy testimonials_owner_all
  on public.testimonials
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists site_settings_public_read on public.site_settings;
drop policy if exists site_settings_owner_all on public.site_settings;
create policy site_settings_public_read
  on public.site_settings
  for select
  to public
  using (true);
create policy site_settings_owner_all
  on public.site_settings
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists contact_messages_no_read on public.contact_messages;
drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_no_read
  on public.contact_messages
  for select
  to public
  using (false);
create policy contact_messages_public_insert
  on public.contact_messages
  for insert
  to public
  with check (true);

drop policy if exists analytics_events_no_read on public.analytics_events;
drop policy if exists analytics_events_public_insert on public.analytics_events;
create policy analytics_events_no_read
  on public.analytics_events
  for select
  to public
  using (false);
create policy analytics_events_public_insert
  on public.analytics_events
  for insert
  to public
  with check (true);

commit;

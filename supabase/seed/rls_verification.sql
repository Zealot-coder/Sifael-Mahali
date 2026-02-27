-- Run manually in Supabase SQL editor after migrations.
-- Expected behavior is documented inline.

-- 1) Public content should be readable for anon role.
set local role anon;
select count(*) as public_profiles from public.profiles;
select count(*) as public_projects from public.projects;
select count(*) as public_experiences from public.experiences;
select count(*) as public_skills from public.skills;
select count(*) as public_certifications from public.certifications;
select count(*) as public_testimonials from public.testimonials;
select count(*) as public_site_settings from public.site_settings;

-- 2) Sensitive tables should NOT be readable for anon role.
-- These two queries should fail with permission denied / RLS rejection.
select count(*) as should_fail_contact_messages from public.contact_messages;
select count(*) as should_fail_analytics_events from public.analytics_events;

reset role;

-- 3) Anon insert should work for contact and analytics events.
set local role anon;
insert into public.contact_messages (name, email, message)
values ('RLS Probe', 'probe@example.com', 'Testing anonymous contact insert policy')
returning id, created_at;

insert into public.analytics_events (event_type, page_path, session_id, metadata)
values ('page_view', '/', 'rls-test-session', '{"source":"rls_verification"}'::jsonb)
returning id, created_at;
reset role;

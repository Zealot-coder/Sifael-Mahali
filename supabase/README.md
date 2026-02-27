# Supabase Workspace

Project name: `SIFAEL MAHALI PORTFOLIO`

Dashboard reference:
- `https://supabase.com/dashboard/project/mnclxezauapsuewhioms`

Expected local structure:
- `supabase/config.toml` local Supabase runtime configuration
- `supabase/migrations/` SQL migrations
- `supabase/seed/` seed data files

Current SQL assets:
- `migrations/001_initial_schema.sql` core schema + indexes + timestamp triggers
- `migrations/002_rls_policies.sql` Row Level Security policies
- `seed/seed.sql` initial portfolio data seed
- `seed/rls_verification.sql` manual policy validation queries

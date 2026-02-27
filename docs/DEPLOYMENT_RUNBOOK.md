# Deployment Runbook

Production target: Vercel + Supabase (`mnclxezauapsuewhioms`)

## Environment Variables
| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Client + Server | Canonical site URL for metadata and links |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server | Public API key with RLS controls |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | Privileged DB/API operations from backend routes |
| `RESEND_API_KEY` | Optional | Server only | Contact email delivery |
| `CONTACT_TO_EMAIL` | Yes | Server only | Contact destination mailbox |
| `CONTACT_FROM_EMAIL` | Yes | Server only | Verified sender identity |
| `GITHUB_USERNAME` | Optional | Server only | GitHub sync source account |
| `GITHUB_TOKEN` | Optional | Server only | Higher-rate GitHub API access |
| `SENTRY_DSN` | Optional | Server + Edge | Sentry backend error ingestion |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Client | Sentry browser error ingestion |
| `SENTRY_ENVIRONMENT` | Recommended | Client + Server | Telemetry environment tag |
| `SENTRY_RELEASE` | Recommended | Client + Server | Release correlation identifier |
| `SENTRY_TRACES_SAMPLE_RATE` | Recommended | Client + Server | Tracing sample rate (0..1) |
| `SENTRY_AUTH_TOKEN` | Optional | CI/Build only | Source map upload auth |
| `SENTRY_ORG` | Optional | CI/Build only | Sentry organization slug |
| `SENTRY_PROJECT` | Optional | CI/Build only | Sentry project slug |

## Migration Discipline
Rules:
1. Never edit or delete an already-applied migration in `supabase/migrations`.
2. Add only forward migrations with unique prefixes (`001_name.sql` or timestamp format).
3. Keep migration files lexicographically ordered.
4. Include RLS policy changes in migrations, never manual dashboard-only changes.
5. If production hotfix SQL is executed manually, immediately codify it as a repo migration.

Validation:
- `npm run migrations:check` runs locally and in CI.

Apply flow:
1. Link project:
   - `npx supabase link --project-ref mnclxezauapsuewhioms --password <db-password>`
2. Push schema and policies:
   - `npx supabase db push --include-all --include-seed --yes`
3. Verify:
   - `supabase/seed/rls_verification.sql` in SQL editor.

## Vercel Deployment Steps
1. Push to `main`.
2. Vercel imports and builds from latest commit.
3. Ensure all required env vars are set for Production environment.
4. Redeploy after any env change.

## Release Checklist
1. `npm run migrations:check`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. Verify owner auth (`/owner/login`) and logout flow.
6. Verify public data render (`/`, `/blog`, `/cv`).
7. Verify contact form submit + fallback path.
8. Verify analytics ingestion and owner analytics visibility.
9. Verify Sentry receives test exception (if configured).

## Rollback Strategy
App rollback:
1. In Vercel, redeploy previous successful deployment.
2. Confirm health on `/` and `/owner/login`.

Database rollback:
1. Prefer forward-fix migration to restore compatibility.
2. If urgent, execute targeted SQL revert manually.
3. Immediately commit a migration capturing the revert for reproducibility.

Notes:
- Do not rotate to invalid Supabase keys during rollback.
- Do not disable RLS as a rollback shortcut.

## Production Readiness Audit
- Build stability: CI gates `migrations:check`, `typecheck`, `lint`, `build`.
- Security: RLS, secure headers, rate limiting, honeypot, sanitized markdown.
- Observability: Sentry client/server/edge with payload redaction.
- SEO: metadata, OG route, robots, sitemap.
- Performance: deferred 3D mount and optimized image strategy.

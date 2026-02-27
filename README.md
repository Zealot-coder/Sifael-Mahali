# Sifael Mahali Portfolio

Interactive, SEO-ready Next.js portfolio with motion, a lightweight 3D hero, and an editable content layer.

## Architecture Overview (Phase 1)
- App Router foundation is structured with route groups:
  - public routes in `app/(public)/`
  - owner routes in `app/owner/`
  - APIs in `app/api/`
- Public UI modules are separated from owner UI modules:
  - `components/public/`
  - `components/owner/`
  - shared primitives reserved for `components/ui/`
- Supabase local and hosted configuration is prepared:
  - `supabase/config.toml`
  - SSR clients in `lib/supabase/`
- Strict TypeScript and lint quality gates are enforced:
  - `tsconfig.json` (`strict: true`)
  - scripts: `typecheck`, `lint`, `build`, `check`
- CI pipeline is in place at `.github/workflows/ci.yml`.

## Foundation Folder Layout
```text
app/
  (public)/
  owner/
  api/
components/
  public/
  owner/
  ui/
lib/
  supabase/
  validations/
  security/
  observability/
  api/
  hooks/
  utils/
supabase/
types/
docs/
styles/
```

## Supabase Configuration
- Local Supabase config lives at `supabase/config.toml`.
- Hosted project: `mnclxezauapsuewhioms` (`SIFAEL MAHALI PORTFOLIO`).
- SSR utilities:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `lib/supabase/middleware.ts`

## Quick Start
1. Install dependencies:
   - `npm install`
2. Configure environment:
   - `Copy-Item .env.example .env.local`
3. Update placeholders in `content/content.ts`.
4. Run development server:
   - `npm run dev`
5. Build and run production:
   - `npm run build`
   - `npm run start`

## Engineering Scripts
- `npm run typecheck`
- `npm run lint`
- `npm run lint:fix`
- `npm run build`
- `npm run check` (typecheck + lint + build)
- `npm run migrations:check`
- `npm run supabase:start`
- `npm run supabase:stop`
- `npm run supabase:status`
- `npm run supabase:types`

## CI/CD
- Workflow file: `.github/workflows/ci.yml`
- Current pipeline stages:
  - install (`npm ci`)
  - migration validation (`npm run migrations:check`)
  - typecheck
  - lint
  - build
- Deployment + rollback runbook:
  - `docs/DEPLOYMENT_RUNBOOK.md`

## Local Supabase Setup
Prerequisites:
- Docker Desktop (running)

1. Start local Supabase services:
   - `npm run supabase:start`
2. Check local service status and keys:
   - `npm run supabase:status`
3. Populate `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (typically `http://127.0.0.1:54321`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (local anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (local service-role key, server-only)
4. Generate DB types after schema changes:
   - `npm run supabase:types`
5. Run app:
   - `npm run dev`

## Phase 2: Database + RLS
Schema and policy files:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/seed/seed.sql`
- `supabase/seed/rls_verification.sql`

Reset and apply locally:
- `npm run supabase:start`
- `npx supabase db reset`
- `npm run supabase:status`

RLS verification:
- Open Supabase SQL editor (local or hosted).
- Run SQL in `supabase/seed/rls_verification.sql`.
- Confirm anonymous reads fail on `contact_messages` and `analytics_events`.

Rollback:
- `npx supabase migration repair --status reverted 001_initial_schema 002_rls_policies`
- `npx supabase db reset`

## Phase 3: Auth + Session
- Owner authentication now uses Supabase Auth with SSR cookie sessions.
- Session cookies are managed by `@supabase/ssr` as httpOnly secure cookies in production.
- Protected routes:
  - `/owner/*` requires authenticated owner session.
  - `/owner/login` redirects to `/owner` when already authenticated.
- Owner logout endpoint:
  - `POST /api/owner/logout` signs out Supabase session server-side.
- Owner content API security:
  - `GET/PUT /api/owner/content` validates Supabase session via `auth.getUser()`.

Manual auth test flow:
1. Open `/owner` while signed out; confirm redirect to `/owner/login`.
2. Sign in with Supabase owner email/password.
3. Confirm redirect to `/owner` and dashboard loads.
4. Click Logout; confirm redirect back to `/owner/login`.

## Phase 6: Public Site (Supabase-backed)
- Public rendering now resolves data from Supabase tables (with local content fallback if unavailable).
- Added conditional public sections:
  - Testimonials
  - Blog preview
- Added blog routes:
  - `/blog`
  - `/blog/[slug]`
- Added CV download route:
  - `/cv` (redirects to direct URL or signed storage URL)
- SEO updates:
  - Dynamic metadata from live content
  - JSON-LD on homepage
  - Dynamic OG image endpoint usage (`/api/og`)
  - Sitemap includes blog URLs

## Phase 7: Analytics System
- Public client-side analytics is now instrumented with privacy-safe events:
  - `page_view`
  - `project_view`
  - `cv_download`
  - `contact_open`
- Session IDs are generated client-side and rotated with TTL.
- Analytics ingestion hardening:
  - server-side payload sanitization for path/referrer/session/country/device
  - metadata key/value filtering to reduce PII risk
- Owner analytics dashboard now includes:
  - total events
  - unique sessions
  - daily trend and breakdown by event type/page
- RLS posture remains enforced:
  - anonymous inserts allowed
  - anonymous reads blocked on `analytics_events`

## Phase 8: Performance + Hardening
- Security headers are configured in `next.config.mjs`:
  - `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
  - production CSP + HSTS
- Runtime hardening:
  - rate limiting for `POST /api/contact` and `POST /api/analytics`
  - contact form honeypot field (`website`) with silent bot drop
  - markdown input sanitization before blog create/update
- Rendering hardening:
  - blog post markdown is sanitized before rendering blocks
  - root error boundaries added via `app/error.tsx` and `app/global-error.tsx`
- Performance updates:
  - hero 3D scene mount is deferred until idle time to protect initial LCP
  - image optimization tuning (`AVIF/WebP`, cache TTL, tuned quality)

## Phase 9: Observability
- Added Sentry SDK integration for:
  - browser runtime (`instrumentation-client.ts`)
  - Node.js runtime (`sentry.server.config.ts`)
  - edge runtime (`sentry.edge.config.ts`)
- Added instrumentation bootstrap (`instrumentation.ts`) for runtime registration.
- App error boundaries now report exceptions to Sentry:
  - `app/error.tsx`
  - `app/global-error.tsx`
- Event payload scrubbing is enforced before sending telemetry:
  - header/cookie/token/password-like fields are redacted
  - user email/ip and sensitive request payload keys are removed
- Environment isolation is supported through explicit Sentry env vars:
  - `SENTRY_DSN` (server/edge)
  - `NEXT_PUBLIC_SENTRY_DSN` (client)
  - `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE`

## Phase 10: CI/CD + Deployment
- CI hardened for mainline release quality gates:
  - migration discipline checks
  - typecheck, lint, and build on push/PR
- Added formal deployment runbook:
  - environment variable table
  - migration discipline and verification flow
  - Vercel deploy checklist
  - rollback strategy and production readiness audit
- Runbook location:
  - `docs/DEPLOYMENT_RUNBOOK.md`

## Hosted Supabase Setup
1. In Supabase Dashboard project `mnclxezauapsuewhioms`, copy Project URL + API keys.
2. Configure env vars in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL` (hosted URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret key)
3. Redeploy after env updates.

## Security Rules
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Never prefix service-role key with `NEXT_PUBLIC_`.
- Never expose service-role key in client components, browser bundles, or public logs.
- Keep secrets only in `.env.local` and Vercel project env settings.
- `contact_messages` and `analytics_events` are insert-only for anon; no anon SELECT.
- Sentry secret/config variables are isolated by scope (`SENTRY_*` server vs `NEXT_PUBLIC_*` client).
- Sensitive telemetry fields are redacted before event delivery.

## Formatting Conventions
- Use `.editorconfig` defaults (UTF-8, LF, 2 spaces for TS/JS/JSON/YAML/MD).
- Prefer `import type` for type-only imports.
- Keep imports consistent and deduplicated (enforced by ESLint).

## Definition Of Done (DoD)
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Basic smoke run in local dev (`npm run dev`), verify:
  - [ ] `/` renders without runtime errors.
  - [ ] `/owner` renders and login screen appears.
  - [ ] At least one section anchor navigation works.

## Notes
- Contact API uses Resend when environment variables are configured.
- If API email is not configured, users still have a mailto fallback in the Contact section.
- For pinned GitHub repositories via GraphQL, set:
  - `GITHUB_USERNAME` (default: `Zealot-coder`)
  - `GITHUB_TOKEN` (GitHub personal access token with read access)
- Owner dashboard is available at `/owner` with full JSON CRUD editing.
- Content persistence mode:
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN` configured: persistent Vercel KV mode.
  - No KV variables: local file mode (`content/portfolio-content.local.json`, local/dev only).
- `content/portfolio-content.local.json` is gitignored and created automatically after first save in owner dashboard.
- Public site data source priority:
  - Supabase tables (primary)
  - local/KV content fallback (secondary)

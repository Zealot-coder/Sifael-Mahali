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
- CI draft is in place at `.github/workflows/ci.yml`.

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
- `npm run supabase:start`
- `npm run supabase:stop`
- `npm run supabase:status`
- `npm run supabase:types`

## CI Draft
- Workflow file: `.github/workflows/ci.yml`
- Current pipeline stages:
  - install (`npm ci`)
  - typecheck
  - lint
  - build

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
- Set `OWNER_PASSWORD` to enable owner login.
- Set `OWNER_SESSION_SECRET` for stronger session signing in production.
- Content persistence mode:
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN` configured: persistent Vercel KV mode.
  - No KV variables: local file mode (`content/portfolio-content.local.json`, local/dev only).
- `content/portfolio-content.local.json` is gitignored and created automatically after first save in owner dashboard.

# Sifael Mahali Portfolio

Interactive, SEO-ready Next.js portfolio with motion, a lightweight 3D hero, and an editable content layer.

## Architecture Audit Snapshot
- App Router is active (`app/`), with route handlers under `app/api/*`.
- Owner JSON editor exists at `/owner` (`components/owner/OwnerDashboard.tsx`).
- Content storage currently supports Vercel KV with local file fallback (`lib/portfolio-store.ts`).
- Default static source remains `content/content.ts`.

## Supabase-Oriented Structure (Scaffolded)
- `lib/supabase/`
- `lib/validations/`
- `components/public/`
- `components/owner/`
- `types/`
- `supabase/`

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

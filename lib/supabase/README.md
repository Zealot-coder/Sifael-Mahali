# Supabase Lib Layer

This directory contains Supabase client factories and data-access helpers.

Recommended split:
- `server.ts` for server components, route handlers, and server actions.
- `browser.ts` (or `client.ts`) for browser usage.
- `queries/*` for domain-specific data functions.

No runtime Supabase logic is introduced in this hygiene-only pass.

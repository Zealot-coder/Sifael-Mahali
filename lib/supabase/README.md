# Supabase Lib Layer

This directory contains Supabase client factories and data-access helpers.

Current files:
- `client.ts` browser client (`createSupabaseBrowserClient`)
- `server.ts` server and service-role clients
- `middleware.ts` session update helper for Next middleware
- `index.ts` exports

Security note:
- Service role key usage is restricted to server-only modules.

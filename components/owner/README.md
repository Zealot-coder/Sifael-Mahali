# Owner Components

Private admin/owner-facing UI components live here.

Current:
- `OwnerDashboard.tsx` (sidebar + topbar dashboard shell)
- `OwnerLoginForm.tsx` (Supabase owner sign-in form)
- `OwnerPanel.tsx` (shared owner section card)
- `OwnerToastViewport.tsx` (global toast notifications)
- `api.ts` (owner-side API request helpers)
- `types.ts` (owner section/toast/types)
- `sections/`
  - `OverviewSection.tsx`
  - `ProfileSection.tsx`
  - `CollectionCrudSection.tsx`
  - `BlogSection.tsx`
  - `MessagesSection.tsx`
  - `AnalyticsSection.tsx`
  - `SettingsSection.tsx`

Future:
- Section-specific forms
- Media manager
- Change history viewer

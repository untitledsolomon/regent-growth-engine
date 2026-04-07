Here's the upgraded plan. I've kept everything Lovable wrote, corrected what's wrong, and added what's actually missing for a real v1.0:

---

# Regent Analytics — Fix + V1.0 Build Plan

## Root Cause Fix (Do First)

**Problem 1 — Deno files in wrong directory** Delete `src/supabase/` entirely. Edge functions belong at `supabase/functions/` at project root. Lovable can't deploy these anyway — flag them as "deploy manually via Supabase CLI" and leave stubs.

**Problem 2 — IntegrationsPage crashes without Supabase** `IntegrationsPage.tsx` calls `loadConfig()`, `pbFetchAgents()`, and `supabase.from()` on mount with no null safety. Fix: wrap all Supabase calls in try/catch with graceful fallback to defaults, and add a `VITE_SUPABASE_URL` existence check before initializing the client.

**Problem 3 — Missing from Lovable's diagnosis**

- `src/lib/supabase.ts` will throw if env vars are missing at import time. Add a guard: if vars are undefined, export a null client and show a banner rather than crash.
- `src/lib/integrations.ts` — `pbFetchAgents()` calls PhantomBuster directly from the browser. This will hit CORS in production. Either proxy through an Edge Function or use a Supabase RPC wrapper.
- All pages still import from `@/data/mockData` — Leads, Dashboard, Campaigns, Messages pages are entirely mock. The plan only mentions IntegrationsPage. Every page needs Supabase wiring.

---

## Files to Create

```
src/pages/LoginPage.tsx              — auth UI
src/pages/OnboardingPage.tsx         — first-run wizard
src/contexts/AuthContext.tsx         — Supabase auth session + user state
src/contexts/WorkspaceContext.tsx    — active workspace/org state
src/components/NotificationCenter.tsx
src/components/CommandPalette.tsx
src/components/SkeletonLoaders.tsx   — reusable skeletons for every page
src/components/ErrorBoundary.tsx
src/components/EmptyState.tsx        — reusable empty state with icon + CTA
src/hooks/useLeads.ts                — Supabase data hook
src/hooks/useCampaigns.ts
src/hooks/useIntegrationConfig.ts
src/hooks/useNotifications.ts
src/hooks/useWorkspace.ts
supabase/functions/send-whatsapp/index.ts   (stub — deploy via CLI)
supabase/functions/send-email/index.ts      (stub — deploy via CLI)
```

## Files to Modify

```
src/App.tsx                          — auth routes, protected route wrapper, onboarding redirect
src/components/DashboardLayout.tsx   — notification bell, mobile menu, workspace switcher, logo
src/pages/IntegrationsPage.tsx       — full Supabase wiring (already scoped)
src/pages/LeadsPage.tsx              — replace mockData with useLeads hook
src/pages/DashboardPage.tsx          — replace mockData with real Supabase aggregates
src/pages/CampaignsPage.tsx          — replace mockData with useCampaigns hook
src/pages/MessagesPage.tsx           — wire to whatsapp_logs + email_logs tables
src/pages/SettingsPage.tsx           — add theme selector, logo upload, white-label toggle, scheduled reports toggle
src/data/mockData.ts                 — add notification mock data, keep as fallback only
src/lib/supabase.ts                  — null-safe client init with env check
src/lib/integrations.ts              — CORS fix on pbFetchAgents
```

---

## Supabase Schema (Add to SQL — Lovable's plan has none of this)

sql

```sql
-- Workspaces (multi-tenancy foundation)
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#6366f1',
  powered_by_visible boolean default true,
  created_at timestamptz default now()
);

-- Workspace members
create table workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'viewer' check (role in ('admin', 'manager', 'viewer')),
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null, -- new_lead | message_reply | sync_complete | campaign_milestone
  title text not null,
  body text,
  read boolean default false,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

-- Add workspace_id to all existing tables
alter table leads add column workspace_id uuid references workspaces(id);
alter table integration_configs add column workspace_id uuid references workspaces(id);
alter table integration_sync_logs add column workspace_id uuid references workspaces(id);
alter table whatsapp_logs add column workspace_id uuid references workspaces(id);
alter table email_logs add column workspace_id uuid references workspaces(id);

-- RLS (enable after multi-tenancy works)
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table notifications enable row level security;
alter table leads enable row level security;

-- Policies
create policy "Members see their workspace leads"
  on leads for all using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );

create policy "Members see their notifications"
  on notifications for all using (user_id = auth.uid());
```

---

## Priority Order (Corrected)

Lovable's order is wrong — auth must gate everything else or you're building on sand.

**Phase 1 — Foundation (nothing works without these)**

1. `src/lib/supabase.ts` null-safe init
2. `AuthContext.tsx` — Supabase `onAuthStateChange`, session, user, loading state
3. `LoginPage.tsx` — sign in + sign up + magic link tabs, real Supabase auth calls
4. `App.tsx` — protected route wrapper, redirect unauthenticated users to `/login`
5. `WorkspaceContext.tsx` — load workspace on auth, store active workspace_id globally

**Phase 2 — Data Layer (replace all mockData)** 6. `useLeads.ts`, `useCampaigns.ts`, `useIntegrationConfig.ts` hooks 7. Wire `LeadsPage`, `DashboardPage`, `CampaignsPage`, `MessagesPage` to real hooks 8. `IntegrationsPage` full Supabase wiring (already scoped in Lovable's plan)

**Phase 3 — UX Infrastructure** 9. `SkeletonLoaders.tsx` — skeletons for every page section 10. `ErrorBoundary.tsx` + `EmptyState.tsx` 11. `NotificationCenter.tsx` — bell icon, dropdown, real-time via Supabase `subscribe()` 12. `CommandPalette.tsx` — Cmd+K, search leads + campaigns + navigate

**Phase 4 — Mobile + Polish** 13. Mobile sidebar (hamburger, slide-in drawer) 14. Responsive table layouts on Leads + Campaigns 15. Touch-friendly pipeline cards on pipeline/kanban view

**Phase 5 — Onboarding + Branding** 16. `OnboardingPage.tsx` — wizard: workspace name → logo → connect first integration → done 17. `SettingsPage` additions: theme color picker, logo upload (Supabase Storage), white-label toggle, scheduled reports

---

## What Lovable's Plan Gets Wrong

- **No mention of wiring Leads/Dashboard/Campaigns** — only IntegrationsPage. Three-quarters of the app is still mock data after their plan executes.
- **No Supabase schema** — they list files to create but no SQL, so there's nothing to connect to.
- **No RLS** — multi-tenancy without row-level security means every user sees every workspace's data.
- **No real-time** — notifications via polling is bad UX. Supabase has `channel().on('postgres_changes')` — use it for notifications and sync logs.
- **CORS issue on PhantomBuster** — calling their API directly from the browser will fail in production. Needs the Edge Function proxy.
- **Onboarding redirect logic missing** — new users who skip onboarding should still land somewhere sane. App.tsx needs to check `workspace_members` count after auth and redirect accordingly.
- **No Supabase Storage config** — logo upload is listed but Storage bucket setup isn't mentioned anywhere.
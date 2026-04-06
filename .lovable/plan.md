

## Plan: Dedicated Integrations Page with Metrics + Remaining Gaps

### Overview
Break integrations out of Settings into their own top-level page (`/integrations`) with per-integration detail panels, mock metrics, sync history, and status monitoring. Then address remaining gaps across the app.

---

### 1. Integrations Page (`/integrations`)

Create `src/pages/IntegrationsPage.tsx` as a full-featured page with three integration cards that expand into detailed views:

**PhantomBuster Section**
- Connection status indicator (connected/disconnected)
- API key configuration field
- "Sync Now" button with mock loading state
- Sync history table (last 5 syncs with timestamp, leads imported, status)
- Metrics: total leads imported, last sync time, average leads per sync, sync success rate
- Phantom selector (mock list of phantoms: "LinkedIn Sales Navigator", "LinkedIn Profile Scraper", etc.)
- Auto-sync toggle with interval selector (hourly/daily/weekly)

**WhatsApp Business Section**
- Connection status + phone number display
- Metrics: messages sent today, delivery rate, read rate, reply rate
- Recent delivery log (last 10 messages with status)
- Rate limit indicator (mock: 250/1000 messages used today)
- QR code placeholder for device linking

**Zoho Mail / SMTP Section**
- Connection status + configured email display
- Test connection button (mock)
- Metrics: emails sent today, bounce rate, open rate
- SMTP configuration (host, port, TLS toggle, from email)
- Domain verification status (mock)

**Layout**: Tab-based or card grid at top, clicking an integration opens a detailed panel below. Each card shows: icon, name, status badge, key metric.

### 2. Mock Data for Integrations

Add to `mockData.ts`:
- `IntegrationSyncLog[]` — timestamp, source, leadsCount, status, duration
- `IntegrationMetrics` — per-integration stats objects
- `PhantomConfig[]` — list of available phantoms

### 3. Sidebar + Routing Updates

- Add "Integrations" nav item to `AppSidebar.tsx` (use `Plug` icon, placed between Analytics and Settings)
- Add route `/integrations` in `App.tsx`
- Remove integration cards from `SettingsPage.tsx`, keep only Profile + Notifications there
- Add a "Manage Integrations" link button in Settings that navigates to `/integrations`

### 4. Settings Page Cleanup

Simplify `SettingsPage.tsx` to just:
- Profile section
- Notification preferences
- A link/button to `/integrations` for integration management

### 5. Remaining Gaps to Address

**a. Pagination on Leads table** — add simple prev/next pagination (20 per page) to `LeadsPage.tsx`

**b. Empty states polish** — add illustrated empty states for Campaigns (no campaigns yet), Messages (no messages), and Pipeline (no leads in stage)

**c. Source filter on Leads** — add a source dropdown filter alongside the existing status filter

**d. Dashboard quick actions** — add a row of quick action buttons on the dashboard: "Add Lead", "New Campaign", "Compose Message", "Import CSV" that link to the respective pages/dialogs

**e. Breadcrumb/page context** — the PageHeader already exists but lacks breadcrumb navigation for nested views

---

### Files to Create
- `src/pages/IntegrationsPage.tsx`

### Files to Modify
- `src/data/mockData.ts` — add integration sync logs, metrics, phantom configs
- `src/App.tsx` — add `/integrations` route
- `src/components/AppSidebar.tsx` — add Integrations nav item
- `src/pages/SettingsPage.tsx` — remove integration sections, add link to integrations page
- `src/pages/LeadsPage.tsx` — add pagination + source filter
- `src/pages/DashboardPage.tsx` — add quick action buttons

### Technical Notes
- All integration data is mock/client-side state
- Integration metrics use the same `glass` card styling as the rest of the app
- Sync history uses the existing table pattern from LeadsPage
- Each integration detail section is a collapsible or tabbed panel within the page


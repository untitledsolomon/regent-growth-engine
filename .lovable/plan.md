

## Plan: Full Visual Redesign to LeadEngine Design System

### Problem
1. **Runtime crash**: `src/lib/org.ts` calls `supabase.auth.getUser()` without null-checking `supabase`, causing "Cannot read properties of null (reading 'auth')".
2. **Visual mismatch**: Current app uses Space Grotesk + dark sidebar theme. The reference design uses Plus Jakarta Sans + Inter, a light slate sidebar, indigo primary (#4648d4), Material Design-inspired surfaces, and a completely different layout language.

### Design System Extraction from Reference

The uploaded HTML contains 9 distinct page designs. Core design tokens:

- **Fonts**: Plus Jakarta Sans (headlines, 600-800 weight), Inter (body/labels, 300-600)
- **Primary**: `#4648d4` (indigo), container `#6063ee`
- **Tertiary**: `#9e00b5` (purple), used for accents/CTAs
- **Surfaces**: `#f7f9fb` (background), `#ffffff` (cards), `#f2f4f6` (container-low), `#eceef0` (container), `#e6e8ea` (container-high)
- **Text**: `#191c1e` (on-surface), `#464554` (on-surface-variant), `#767586` (outline)
- **Signature gradient**: `linear-gradient(135deg, #4648d4 0%, #6063ee 100%)`
- **Border radius**: Cards use `rounded-2xl` / `rounded-3xl`, buttons `rounded-xl`, pills `rounded-full`
- **Sidebar**: Light bg (slate-50), active item has `border-r-2 border-indigo-600 bg-white` styling
- **Top bar**: `bg-white/80 backdrop-blur-xl`, search in rounded-full input
- **Cards**: White bg, `border border-outline-variant/5`, `shadow-sm`, large padding (p-6/p-8)
- **Active nav**: Filled icon, indigo text, right border accent, white/light bg

### Pages from Reference (mapped to existing routes)

| Reference Page | Route | Key Layout Features |
|---|---|---|
| Login | `/login` | Split layout: left abstract mesh gradient panel, right form panel |
| Dashboard | `/` | Quick actions, 5 stat cards (2xl rounded), performance chart, funnel, campaign bars, activity feed, AI insights bento |
| Pipeline | `/pipeline` | Kanban columns with drag cards, deal values, time indicators |
| AI Insights | (new or sub-page) | Hero banner with gradient, NL query bar, insight cards with border-l-4 accents |
| Analytics | `/analytics` | Revenue/conversion/response tiles, SVG charts, channel distribution, date range picker |
| Messages | `/messages` | 3-column: conversation list, chat window, lead detail sidebar |
| Lead Profile | `/leads/:id` or drawer | Profile header with avatar, client details card, tasks, documents grid, activity timeline |
| Campaigns | `/campaigns` | Campaign list rows with stats, create campaign dialog with template preview |
| Integrations | `/integrations` | Hero section, filter pills, bento grid marketplace cards |

### Implementation Plan

**Phase 1: Fix crash + Update design tokens**
- Fix `src/lib/org.ts` to null-check supabase
- Rewrite `src/index.css` with new color variables matching the reference palette
- Update `tailwind.config.ts` with new font families, colors, border radius
- Add Plus Jakarta Sans font import

**Phase 2: Core layout components**
- Rewrite `AppSidebar.tsx`: Light bg (slate-50), indigo active state with right-border accent, Material Symbols-style lucide icons, "LeadEngine" branding, bottom section with Settings/Profile/Switch Agency, "Convert Lead" CTA button
- Rewrite `DashboardLayout.tsx`: White/80 backdrop-blur header, rounded-full search input, "New Campaign" + "Add Lead" buttons in header, notification bell with dot, user avatar
- Update `CommandPalette.tsx` to match the NL query bar style

**Phase 3: Rewrite all pages**
- `LoginPage.tsx`: Split layout with abstract mesh gradient left panel (stats overlay), form right panel with rounded-xl inputs, signature-gradient submit button, social login buttons
- `DashboardPage.tsx`: 5 stat cards in new card style (icon in colored bg, change badge), performance trend chart area, funnel overview with progress bars + insight callout, campaign performance bars, recent activity with colored icon circles, AI insights bento section
- `PipelinePage.tsx`: Kanban columns with colored dot headers, cards with source badges (INBOUND/PRIORITY), deal values, drag indicators
- `LeadsPage.tsx`: Table with new surface styling, lead profile drawer matching reference (avatar, details card, tasks, documents, activity timeline)
- `CampaignsPage.tsx`: Campaign list rows with icon + stats (Sent/Opened/Replied/Conversion), status badges, create campaign dialog matching reference
- `MessagesPage.tsx`: 3-column layout (conversation list with avatars + channel icons, active chat window with message bubbles, lead detail sidebar)
- `AnalyticsPage.tsx`: Performance tiles with sparklines, date range picker, channel distribution chart, conversion funnel
- `IntegrationsPage.tsx`: Hero section with gradient image, filter pill row, bento grid marketplace cards with icons and status badges, bottom banner
- `SettingsPage.tsx`: Clean card-based settings matching surface styling

**Phase 4: Component updates**
- `StatCard` in `DashboardWidgets.tsx`: New layout with icon in colored bg square, change badge pill
- `StatusBadge.tsx`: Use new color tokens
- All dialogs/drawers: Use rounded-2xl/3xl, signature-gradient primary buttons

### Files to Modify
- `src/lib/org.ts` — null-check fix
- `src/index.css` — complete rewrite of CSS variables
- `tailwind.config.ts` — new fonts, colors, radius
- `src/components/AppSidebar.tsx` — light sidebar redesign
- `src/components/DashboardLayout.tsx` — new header layout
- `src/components/DashboardWidgets.tsx` — new stat card design
- `src/pages/LoginPage.tsx` — split layout redesign
- `src/pages/DashboardPage.tsx` — full redesign
- `src/pages/PipelinePage.tsx` — kanban redesign
- `src/pages/LeadsPage.tsx` — table + profile redesign
- `src/pages/CampaignsPage.tsx` — list + dialog redesign
- `src/pages/MessagesPage.tsx` — 3-column chat redesign
- `src/pages/AnalyticsPage.tsx` — tiles + charts redesign
- `src/pages/IntegrationsPage.tsx` — marketplace redesign
- `src/pages/SettingsPage.tsx` — clean card layout
- `src/components/StatusBadge.tsx` — new badge colors

### Technical Notes
- Replace Google Fonts import: swap Space Grotesk for Plus Jakarta Sans, keep Inter
- All mock data and hooks remain unchanged — only the visual layer changes
- Material Symbols from reference will be replaced with equivalent Lucide React icons (already installed)
- The signature-gradient class will be added as a Tailwind utility


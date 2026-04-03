

## Plan: Complete Functionality & Missing Features

### What's Missing

1. **Settings page** — currently redirects to `/` (no actual page)
2. **PhantomBuster integration** — CSV import exists but no dedicated PhantomBuster workflow with pre-configured column mappings for PB's export format
3. **Lead detail view** — no way to see full lead info, activity timeline, or message history per lead
4. **Notification/activity system** — no activity feed or recent actions tracking
5. **Dark mode toggle** — CSS variables exist for dark mode but no toggle UI
6. **Delete lead functionality** — can edit but not delete
7. **Campaign detail view** — no way to see which leads are in a campaign or drill into performance
8. **Template CRUD** — templates are read-only, can't create/edit/delete
9. **Bulk actions on leads** — no select-all, bulk status change, bulk delete
10. **Search in messages** — no filtering/search in message history
11. **Export functionality** — no way to export leads or reports

### Implementation Plan

#### 1. Settings Page
- Create `src/pages/SettingsPage.tsx` with sections: Profile, Integrations (PhantomBuster API key field, WhatsApp config, Zoho Mail SMTP config), Notifications preferences, and a dark mode toggle
- All settings stored in local state with mock defaults
- Update `App.tsx` route from `Navigate` to actual `SettingsPage`

#### 2. PhantomBuster Integration Section
- Add a dedicated "PhantomBuster" panel inside Settings with API key input (mock) and a "Sync Now" button
- Enhance the CSV import dialog with a "PhantomBuster" preset that auto-maps PB-specific columns (`firstName`, `lastName`, `companyName`, `linkedinProfile`, `emailAddress`, `phoneNumber`)
- Add LinkedIn profile URL field to `Lead` interface and display it in lead detail
- Show "PhantomBuster" as a source badge throughout the app

#### 3. Lead Detail Drawer
- Create `src/components/LeadDetailDrawer.tsx` using Sheet component
- Shows full contact info, score gauge, status with ability to change, tags, message history for that lead, and an activity timeline (mock)
- Click a lead row in LeadsPage or Pipeline card to open it

#### 4. Dark Mode Toggle
- Add a theme toggle button in the sidebar footer (sun/moon icon)
- Toggle `.dark` class on `<html>` element
- Persist preference in `localStorage`

#### 5. Template Management
- Add Create/Edit/Delete template functionality in MessagesPage templates tab
- Create `src/components/TemplateDialog.tsx` for add/edit with name, channel, body fields
- Add delete confirmation

#### 6. Bulk Lead Actions
- Add checkbox column to leads table
- "Select All" checkbox in header
- Floating action bar when leads are selected: bulk status change, bulk delete, bulk add to campaign

#### 7. Lead Delete + Confirmation
- Add delete button to lead edit dialog and lead detail drawer
- Use AlertDialog for confirmation

#### 8. Campaign Detail View
- Create `src/components/CampaignDetailDrawer.tsx`
- Click a campaign card to see: assigned leads list, performance metrics, message history for that campaign, ability to add/remove leads

#### 9. Activity Feed on Dashboard
- Add a "Recent Activity" card to DashboardPage showing latest actions (lead added, status changed, message sent, campaign created)
- Mock activity data in `mockData.ts`

#### 10. Message Search & Filters
- Add search input and channel filter (WhatsApp/Email/All) to MessagesPage history tab

#### 11. Export Leads
- Add "Export CSV" button to LeadsPage that generates and downloads a CSV of current filtered leads

### Files to Create
- `src/pages/SettingsPage.tsx`
- `src/components/LeadDetailDrawer.tsx`
- `src/components/CampaignDetailDrawer.tsx`
- `src/components/TemplateDialog.tsx`
- `src/components/ThemeToggle.tsx`

### Files to Modify
- `src/App.tsx` — add SettingsPage route
- `src/data/mockData.ts` — add activity feed data, LinkedIn URL to Lead
- `src/components/AppSidebar.tsx` — add dark mode toggle
- `src/pages/LeadsPage.tsx` — add bulk actions, delete, click-to-detail, export CSV
- `src/pages/CampaignsPage.tsx` — add click-to-detail drawer
- `src/pages/MessagesPage.tsx` — add search/filter, template CRUD
- `src/pages/DashboardPage.tsx` — add recent activity feed
- `src/pages/PipelinePage.tsx` — add click-to-detail on pipeline cards
- `src/components/CSVImportDialog.tsx` — add PhantomBuster preset mapping


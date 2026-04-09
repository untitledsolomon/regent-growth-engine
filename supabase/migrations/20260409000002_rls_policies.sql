-- ============================================================
-- Regent Growth Engine — Row-Level Security Policies
-- Migration: 20260409000002
-- ============================================================

-- Helper: check if the calling user is a member of a given org.
-- SECURITY DEFINER so it can access org_members without recursive RLS.
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
  );
$$;

-- Helper: same check, but requires owner or admin role.
CREATE OR REPLACE FUNCTION is_org_admin(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;

-- ============================================================
-- Enable RLS
-- ============================================================
ALTER TABLE organisations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE phantom_configs      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- organisations policies
-- ============================================================
CREATE POLICY "org_select_members"
  ON organisations FOR SELECT
  USING (is_org_member(id));

-- Any authenticated user may create an organisation (e.g. during onboarding).
CREATE POLICY "org_insert_authenticated"
  ON organisations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners/admins may update their org.
CREATE POLICY "org_update_admins"
  ON organisations FOR UPDATE
  USING (is_org_admin(id));

-- ============================================================
-- org_members policies
-- ============================================================
-- A user can always see their own membership row.
-- All members of an org can see other members.
CREATE POLICY "org_members_select"
  ON org_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_org_member(org_id)
  );

-- A user may insert their own membership row (for onboarding self-join).
CREATE POLICY "org_members_insert_self"
  ON org_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Owners/admins may add, update, or remove any member.
CREATE POLICY "org_members_admin_all"
  ON org_members FOR ALL
  USING (is_org_admin(org_id));

-- ============================================================
-- leads policies
-- ============================================================
CREATE POLICY "leads_select"
  ON leads FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "leads_insert"
  ON leads FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "leads_update"
  ON leads FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "leads_delete_admins"
  ON leads FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- campaigns policies
-- ============================================================
CREATE POLICY "campaigns_select"
  ON campaigns FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "campaigns_insert"
  ON campaigns FOR INSERT
  WITH CHECK (is_org_member(org_id));

CREATE POLICY "campaigns_update"
  ON campaigns FOR UPDATE
  USING (is_org_member(org_id));

CREATE POLICY "campaigns_delete_admins"
  ON campaigns FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- campaign_leads policies (inherit via parent campaigns)
-- ============================================================
CREATE POLICY "campaign_leads_select"
  ON campaign_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_leads.campaign_id
        AND is_org_member(c.org_id)
    )
  );

CREATE POLICY "campaign_leads_insert"
  ON campaign_leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_leads.campaign_id
        AND is_org_member(c.org_id)
    )
  );

CREATE POLICY "campaign_leads_update"
  ON campaign_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_leads.campaign_id
        AND is_org_member(c.org_id)
    )
  );

CREATE POLICY "campaign_leads_delete"
  ON campaign_leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c
      WHERE c.id = campaign_leads.campaign_id
        AND is_org_admin(c.org_id)
    )
  );

-- ============================================================
-- notifications policies
-- ============================================================
-- Users see notifications addressed to them, or org-wide (user_id IS NULL).
CREATE POLICY "notifications_select"
  ON notifications FOR SELECT
  USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND is_org_member(org_id))
  );

CREATE POLICY "notifications_insert"
  ON notifications FOR INSERT
  WITH CHECK (is_org_member(org_id));

-- Users may mark their own (or org-wide) notifications read.
CREATE POLICY "notifications_update"
  ON notifications FOR UPDATE
  USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND is_org_member(org_id))
  );

-- ============================================================
-- integration_sync_logs policies
-- ============================================================
CREATE POLICY "sync_logs_select"
  ON integration_sync_logs FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "sync_logs_insert"
  ON integration_sync_logs FOR INSERT
  WITH CHECK (is_org_member(org_id));

-- Admins may delete old log entries.
CREATE POLICY "sync_logs_delete_admins"
  ON integration_sync_logs FOR DELETE
  USING (is_org_admin(org_id));

-- ============================================================
-- phantom_configs policies
-- ============================================================
CREATE POLICY "phantom_configs_select"
  ON phantom_configs FOR SELECT
  USING (is_org_member(org_id));

-- Only owners/admins may create, update, or delete phantom configs
-- (they hold encrypted API keys).
CREATE POLICY "phantom_configs_admin_all"
  ON phantom_configs FOR ALL
  USING (is_org_admin(org_id));

-- ============================================================
-- Regent Growth Engine — Initial Schema
-- Migration: 20260409000001
-- ============================================================

-- Trigger helper: update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- organisations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS organisations (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  slug                TEXT        NOT NULL UNIQUE,
  logo_url            TEXT,
  primary_color       TEXT        NOT NULL DEFAULT '#4648d4',
  powered_by_visible  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organisations_slug ON organisations(slug);

CREATE TRIGGER trg_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- org_members
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('owner', 'admin', 'manager', 'viewer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, org_id)
);

CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id  ON org_members(org_id);

-- --------------------------------------------------------
-- leads
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  business        TEXT,
  email           TEXT,
  phone           TEXT,
  source          TEXT        CHECK (source IN ('phantombuster', 'linkedin', 'referral', 'website', 'cold-outreach')),
  score           INTEGER     DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  status          TEXT        NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new', 'contacted', 'follow-up', 'interested', 'closed')),
  tags            TEXT[]      NOT NULL DEFAULT '{}',
  linkedin_url    TEXT,
  last_contacted  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_org_id     ON leads(org_id);
CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_source     ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- campaigns
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  channel      TEXT        NOT NULL CHECK (channel IN ('whatsapp', 'email', 'both')),
  status       TEXT        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  leads_count  INTEGER     NOT NULL DEFAULT 0,
  sent         INTEGER     NOT NULL DEFAULT 0,
  delivered    INTEGER     NOT NULL DEFAULT 0,
  replied      INTEGER     NOT NULL DEFAULT 0,
  conversions  INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_org_id     ON campaigns(org_id);
CREATE INDEX idx_campaigns_status     ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- campaign_leads  (junction)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_leads (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID        NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id      UUID        NOT NULL REFERENCES leads(id)     ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'sent', 'delivered', 'replied', 'converted', 'unsubscribed')),
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, lead_id)
);

CREATE INDEX idx_campaign_leads_campaign_id ON campaign_leads(campaign_id);
CREATE INDEX idx_campaign_leads_lead_id     ON campaign_leads(lead_id);

-- --------------------------------------------------------
-- notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  type        TEXT        NOT NULL
                          CHECK (type IN ('new_lead', 'message_reply', 'sync_complete', 'campaign_milestone')),
  title       TEXT        NOT NULL,
  body        TEXT,
  read        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_org_id     ON notifications(org_id);
CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_read       ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- --------------------------------------------------------
-- integration_sync_logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  source       TEXT        NOT NULL,
  leads_count  INTEGER     NOT NULL DEFAULT 0,
  status       TEXT        NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  duration     TEXT,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_org_id    ON integration_sync_logs(org_id);
CREATE INDEX idx_sync_logs_timestamp ON integration_sync_logs(timestamp DESC);

-- --------------------------------------------------------
-- phantom_configs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS phantom_configs (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name                 TEXT        NOT NULL,
  type                 TEXT        NOT NULL CHECK (type IN ('scraper', 'action')),
  phantom_id           TEXT,
  api_key_encrypted    TEXT,
  webhook_url          TEXT,
  enabled              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phantom_configs_org_id ON phantom_configs(org_id);

CREATE TRIGGER trg_phantom_configs_updated_at
  BEFORE UPDATE ON phantom_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

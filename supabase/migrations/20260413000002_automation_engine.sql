-- Migration: Automation Engine Tables
-- Description: Adds tables for automation rules (triggers and actions).

-- 1. Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  trigger_type  TEXT        NOT NULL CHECK (trigger_type IN ('new_lead', 'lead_status_change', 'no_contact_24h')),
  action_type   TEXT        NOT NULL CHECK (action_type IN ('send_whatsapp', 'send_email', 'notify_admin')),
  config        JSONB       NOT NULL DEFAULT '{}'::jsonb, -- Store templates, IDs, etc.
  enabled       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_org_id ON automation_rules(org_id);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_rules_admin_all"
  ON automation_rules FOR ALL
  USING (is_org_admin(org_id));

-- 2. Automation Logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  rule_id     UUID        NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  lead_id     UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL CHECK (status IN ('success', 'failed')),
  error       TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_automation_logs_rule_id ON automation_logs(rule_id);
CREATE INDEX idx_automation_logs_lead_id ON automation_logs(lead_id);

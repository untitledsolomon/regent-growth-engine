-- Migration: API Keys and Lead Flexibility
-- Description: Adds api_keys table for scoped access and relaxes leads source constraints.

-- 1. Relax leads source constraint and add metadata
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  key_secret    TEXT        NOT NULL UNIQUE, -- The actual key (e.g. reg_...)
  scopes        TEXT[]      NOT NULL DEFAULT '{leads:write}',
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key_secret ON api_keys(key_secret);
CREATE INDEX idx_api_keys_org_id     ON api_keys(org_id);

-- 3. Enable RLS on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Only org admins can manage API keys
CREATE POLICY "api_keys_admin_all"
  ON api_keys FOR ALL
  USING (is_org_admin(org_id));

-- 4. Add helper function to verify API key and return org_id/scopes
CREATE OR REPLACE FUNCTION verify_api_key(p_key TEXT)
RETURNS TABLE (org_id UUID, scopes TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE key_secret = p_key
  RETURNING api_keys.org_id, api_keys.scopes;
END;
$$;

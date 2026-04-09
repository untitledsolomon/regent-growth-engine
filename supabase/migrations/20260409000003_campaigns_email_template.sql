-- Add email template fields to campaigns table for real outreach delivery
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS subject        TEXT,
  ADD COLUMN IF NOT EXISTS message_html   TEXT,
  ADD COLUMN IF NOT EXISTS message_text   TEXT,
  ADD COLUMN IF NOT EXISTS from_name      TEXT,
  ADD COLUMN IF NOT EXISTS from_email     TEXT;

COMMENT ON COLUMN campaigns.subject       IS 'Email subject line (required for email/both channel)';
COMMENT ON COLUMN campaigns.message_html  IS 'HTML email body with optional {{name}}, {{business}} placeholders';
COMMENT ON COLUMN campaigns.message_text  IS 'Plain-text fallback body';
COMMENT ON COLUMN campaigns.from_name     IS 'Sender display name (defaults to org name)';
COMMENT ON COLUMN campaigns.from_email    IS 'Sender email address (must be a verified Resend domain)';

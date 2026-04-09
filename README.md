# Regent Growth Engine

A lead management and campaign automation platform for Regent agency, powered by Supabase + React.

---

## Agent Integration Guide

Regent agents (CTO, CMO, etc.) can interact with the platform programmatically via **Supabase Edge Functions**.

### Base URL

```
https://<your-supabase-project-ref>.supabase.co/functions/v1
```

### Authentication

All endpoints require one of the following in the request header:

| Method | Header | Value |
|---|---|---|
| Agent (service-level, bypasses RLS) | `x-agent-api-key` | `<AGENT_API_KEY>` from Supabase env |
| Agent (alternative) | `Authorization` | `Bearer <SUPABASE_SERVICE_ROLE_KEY>` |
| Browser (user-scoped) | `Authorization` | `Bearer <user-jwt>` |

> **Security note:** The `AGENT_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must never be exposed client-side. Store them in agent secrets / environment variables only.

---

### Endpoints

#### Leads

| Method | Path | Description |
|---|---|---|
| `POST` | `/leads` | Create a single lead |
| `GET` | `/leads` | Query leads (filter by status, source) |
| `PATCH` | `/leads/:id` | Update lead status, score, or any field |
| `POST` | `/leads/import` | Bulk-import an array of leads |

**Create a lead**
```bash
curl -X POST https://<ref>.supabase.co/functions/v1/leads \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "<org-uuid>",
    "name": "Jane Smith",
    "business": "Acme Corp",
    "email": "jane@acme.com",
    "source": "linkedin",
    "status": "new"
  }'
```

**Query leads by status**
```bash
curl "https://<ref>.supabase.co/functions/v1/leads?status=new&limit=20" \
  -H "x-agent-api-key: $AGENT_API_KEY"
```

**Update a lead**
```bash
curl -X PATCH "https://<ref>.supabase.co/functions/v1/leads/<lead-uuid>" \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "status": "contacted", "score": 72 }'
```

**Bulk import leads (e.g. from PhantomBuster)**
```bash
curl -X POST https://<ref>.supabase.co/functions/v1/leads/import \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    { "org_id": "<org-uuid>", "name": "Lead A", "source": "phantombuster", "status": "new" },
    { "org_id": "<org-uuid>", "name": "Lead B", "source": "linkedin",      "status": "new" }
  ]'
```

---

#### Campaigns

| Method | Path | Description |
|---|---|---|
| `POST` | `/campaigns` | Create a campaign (optionally attach lead_ids) |
| `POST` | `/campaigns/:id/send` | Execute a campaign (transitions to active, queues sends) |

**Create a campaign**
```bash
curl -X POST https://<ref>.supabase.co/functions/v1/campaigns \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "<org-uuid>",
    "name": "Q2 WhatsApp Blast",
    "channel": "whatsapp",
    "lead_ids": ["<lead-uuid-1>", "<lead-uuid-2>"]
  }'
```

**Send / execute a campaign**
```bash
curl -X POST "https://<ref>.supabase.co/functions/v1/campaigns/<campaign-uuid>/send" \
  -H "x-agent-api-key: $AGENT_API_KEY"
```

---

#### Analytics

| Method | Path | Description |
|---|---|---|
| `GET` | `/analytics/summary` | Pipeline health — lead counts, campaign stats, conversion rate |

**Get analytics summary**
```bash
curl "https://<ref>.supabase.co/functions/v1/analytics/summary" \
  -H "x-agent-api-key: $AGENT_API_KEY"
```

**Response shape**
```json
{
  "total_leads": 142,
  "new_leads": 38,
  "contacted": 55,
  "follow_up": 21,
  "interested": 18,
  "closed": 10,
  "total_campaigns": 6,
  "active_campaigns": 2,
  "total_sent": 500,
  "total_delivered": 487,
  "total_replied": 61,
  "total_conversions": 10,
  "conversion_rate": 7.04,
  "reply_rate": 12.2,
  "leads_by_source": { "linkedin": 80, "phantombuster": 45, "referral": 17 },
  "recent_leads": [...]
}
```

---

### Deployment

#### 1. Deploy Edge Functions

```bash
supabase functions deploy leads
supabase functions deploy campaigns
supabase functions deploy analytics
```

#### 2. Set environment variables

In the Supabase dashboard under **Settings → Edge Functions → Secrets**, add:

| Secret | Value |
|---|---|
| `AGENT_API_KEY` | A strong random secret shared with your agents |

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the Supabase runtime.

#### 3. Run database migrations

```bash
supabase db push
```

Or apply `supabase/migrations/` manually via the Supabase SQL editor.

---

### End-to-End Test (Agent Smoke Test)

```bash
# 1. Create a lead
LEAD=$(curl -s -X POST https://<ref>.supabase.co/functions/v1/leads \
  -H "x-agent-api-key: $AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"org_id":"<org-uuid>","name":"Test Lead","source":"linkedin","status":"new"}')
LEAD_ID=$(echo $LEAD | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# 2. Retrieve it
curl "https://<ref>.supabase.co/functions/v1/leads?status=new" \
  -H "x-agent-api-key: $AGENT_API_KEY"

# 3. Check analytics
curl "https://<ref>.supabase.co/functions/v1/analytics/summary" \
  -H "x-agent-api-key: $AGENT_API_KEY"
```

---

## Local Development

```bash
npm install
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

For Edge Functions locally:

```bash
supabase start
supabase functions serve
```

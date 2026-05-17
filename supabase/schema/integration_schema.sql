-- ═══════════════════════════════════════════════════════════════════════════════
-- Simulation Integration Infrastructure — Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- for text search on names

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE integration_status     AS ENUM ('pending','active','suspended','revoked');
CREATE TYPE integration_tier       AS ENUM ('standard','professional','enterprise');
CREATE TYPE api_key_env            AS ENUM ('live','test');
CREATE TYPE sim_delivery           AS ENUM ('api','iframe','sdk','webhook_only');
CREATE TYPE sim_auth_type          AS ENUM ('api_key','oauth2','jwt','hmac','none');
CREATE TYPE sim_category           AS ENUM ('finance','marketing','engineering','business','leadership','custom');
CREATE TYPE sim_difficulty         AS ENUM ('beginner','intermediate','advanced','expert');
CREATE TYPE session_status         AS ENUM ('initiated','running','completed','failed','abandoned','timeout');
CREATE TYPE completion_status      AS ENUM ('completed','failed','abandoned','partial');
CREATE TYPE event_severity         AS ENUM ('info','warning','error','critical');

-- ── Company Integrations (one row per registered company / tenant) ─────────────

CREATE TABLE IF NOT EXISTS company_integrations (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        TEXT          NOT NULL UNIQUE,          -- slug: "vodafone-egypt"
  company_name      TEXT          NOT NULL,
  contact_email     TEXT          NOT NULL,
  logo_url          TEXT,
  base_url          TEXT,                                   -- Their server base URL
  status            integration_status DEFAULT 'pending',
  tier              integration_tier   DEFAULT 'standard',
  rate_limit_per_min INT          DEFAULT 100,
  ip_whitelist      TEXT[]        DEFAULT '{}',
  allowed_origins   TEXT[]        DEFAULT '{}',
  metadata          JSONB         DEFAULT '{}',
  created_at        TIMESTAMPTZ   DEFAULT now(),
  updated_at        TIMESTAMPTZ   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ci_status      ON company_integrations(status);
CREATE INDEX IF NOT EXISTS idx_ci_tier        ON company_integrations(tier);

-- ── API Keys ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash     TEXT        NOT NULL UNIQUE,   -- SHA-256 of full key; never store raw
  key_prefix   TEXT        NOT NULL,          -- First 16 chars for display: "sk_live_ab12cd34"
  company_id   TEXT        NOT NULL REFERENCES company_integrations(company_id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  environment  api_key_env DEFAULT 'live',
  permissions  TEXT[]      DEFAULT ARRAY['simulations:read','simulations:write'],
  is_active    BOOLEAN     DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ak_company    ON api_keys(company_id);
CREATE INDEX IF NOT EXISTS idx_ak_active     ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_ak_expires    ON api_keys(expires_at) WHERE expires_at IS NOT NULL;

-- ── Simulation Endpoints ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulation_endpoints (
  id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id        TEXT           NOT NULL,              -- company-scoped slug
  company_id           TEXT           NOT NULL REFERENCES company_integrations(company_id) ON DELETE CASCADE,
  name                 TEXT           NOT NULL,
  name_ar              TEXT,
  description          TEXT           NOT NULL DEFAULT '',
  description_ar       TEXT,
  endpoint_url         TEXT           NOT NULL,
  delivery             sim_delivery   DEFAULT 'api',
  method               TEXT           DEFAULT 'POST',
  auth_type            sim_auth_type  DEFAULT 'api_key',
  auth_config          JSONB          DEFAULT '{}',          -- e.g. {"header":"X-Api-Key"}
  category             sim_category   DEFAULT 'business',
  difficulty           sim_difficulty DEFAULT 'intermediate',
  estimated_duration_mins INT         DEFAULT 30,
  xp_reward            INT            DEFAULT 100,
  contract_version     TEXT           DEFAULT '1.0',
  tags                 TEXT[]         DEFAULT '{}',
  is_active            BOOLEAN        DEFAULT true,
  is_sandbox           BOOLEAN        DEFAULT false,
  thumbnail_url        TEXT,
  metadata             JSONB          DEFAULT '{}',
  created_at           TIMESTAMPTZ    DEFAULT now(),
  UNIQUE(company_id, simulation_id)
);

CREATE INDEX IF NOT EXISTS idx_se_company   ON simulation_endpoints(company_id);
CREATE INDEX IF NOT EXISTS idx_se_category  ON simulation_endpoints(category);
CREATE INDEX IF NOT EXISTS idx_se_active    ON simulation_endpoints(is_active);

-- ── Webhook Configurations ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_configs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     TEXT        NOT NULL REFERENCES company_integrations(company_id) ON DELETE CASCADE,
  target_url     TEXT        NOT NULL,
  events         TEXT[]      DEFAULT ARRAY['session.completed','score.updated'],
  secret_hash    TEXT        NOT NULL,     -- SHA-256 of raw HMAC secret
  secret_prefix  TEXT        NOT NULL,     -- First 14 chars: "whsec_ab12cd34"
  is_active      BOOLEAN     DEFAULT true,
  retry_count    INT         DEFAULT 3,
  timeout_ms     INT         DEFAULT 10000,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wc_company ON webhook_configs(company_id);

-- ── Webhook Delivery Log ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id    UUID        NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type    TEXT        NOT NULL,
  payload       JSONB       NOT NULL,
  status_code   INT,
  response_body TEXT,
  attempt_count INT         DEFAULT 1,
  succeeded_at  TIMESTAMPTZ,
  failed_at     TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wd_webhook  ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_wd_status   ON webhook_deliveries(succeeded_at, failed_at);

-- ── Simulation Sessions ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS simulation_sessions (
  id                     UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id             TEXT           NOT NULL UNIQUE,   -- public ID: "sess_abc123"
  user_id                TEXT           NOT NULL,          -- Supabase auth.users.id
  simulation_id          TEXT           NOT NULL,
  company_id             TEXT           NOT NULL REFERENCES company_integrations(company_id),
  status                 session_status DEFAULT 'initiated',
  started_at             TIMESTAMPTZ    DEFAULT now(),
  completed_at           TIMESTAMPTZ,
  duration_seconds       INT,
  external_session_token TEXT,                             -- Token from company server
  final_score            INT,
  xp_awarded             INT,
  raw_result             JSONB,                            -- Full contract result JSON
  created_at             TIMESTAMPTZ    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ss_user_id    ON simulation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ss_company    ON simulation_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_ss_status     ON simulation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ss_started_at ON simulation_sessions(started_at DESC);

-- ── Simulation Results (validated contract data) ──────────────────────────────

CREATE TABLE IF NOT EXISTS simulation_results (
  id                   UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           TEXT               NOT NULL UNIQUE REFERENCES simulation_sessions(session_id),
  user_id              TEXT               NOT NULL,
  simulation_id        TEXT               NOT NULL,
  company_id           TEXT               NOT NULL,
  contract_version     TEXT               NOT NULL DEFAULT '1.0',
  completion_status    completion_status  NOT NULL,
  duration_seconds     INT,
  score_accuracy       INT,
  score_speed          INT,
  score_decision       INT,
  score_overall        INT,
  kpi_metrics          JSONB              DEFAULT '[]',
  decision_log         JSONB              DEFAULT '[]',
  behavioral_analytics JSONB              DEFAULT '{}',
  event_timeline       JSONB              DEFAULT '[]',
  final_score          INT                NOT NULL,
  xp_awarded           INT,
  validated            BOOLEAN            DEFAULT false,
  validation_errors    TEXT[]             DEFAULT '{}',
  created_at           TIMESTAMPTZ        DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sr_user_id   ON simulation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_sr_company   ON simulation_results(company_id);
CREATE INDEX IF NOT EXISTS idx_sr_score     ON simulation_results(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_sr_created   ON simulation_results(created_at DESC);

-- ── Integration Events (Audit Log) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS integration_events (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    TEXT,
  event_type    TEXT           NOT NULL,
  severity      event_severity DEFAULT 'info',
  request_path  TEXT,
  status_code   INT,
  duration_ms   INT,
  ip_address    TEXT,
  user_agent    TEXT,
  error_message TEXT,
  metadata      JSONB          DEFAULT '{}',
  created_at    TIMESTAMPTZ    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ie_company    ON integration_events(company_id);
CREATE INDEX IF NOT EXISTS idx_ie_type       ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ie_severity   ON integration_events(severity);
CREATE INDEX IF NOT EXISTS idx_ie_created    ON integration_events(created_at DESC);

-- Auto-delete events older than 90 days (keep storage bounded)
-- Set up a pg_cron job or Supabase scheduled function for this.

-- ── Analytics Materialized View ───────────────────────────────────────────────

CREATE MATERIALIZED VIEW IF NOT EXISTS company_analytics_summary AS
SELECT
  ss.company_id,
  ci.company_name,
  COUNT(*)                                              AS total_sessions,
  COUNT(*) FILTER (WHERE ss.status = 'completed')       AS completed_sessions,
  ROUND(
    COUNT(*) FILTER (WHERE ss.status = 'completed')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                     AS completion_rate,
  ROUND(AVG(ss.final_score) FILTER (WHERE ss.final_score IS NOT NULL), 1) AS avg_final_score,
  ROUND(AVG(ss.duration_seconds)::NUMERIC, 0)           AS avg_duration_seconds,
  COUNT(DISTINCT ss.user_id)                            AS total_participants,
  COUNT(DISTINCT ss.simulation_id)                      AS active_simulations,
  SUM(ss.xp_awarded)                                    AS total_xp_awarded,
  MAX(ss.completed_at)                                  AS last_activity_at
FROM simulation_sessions ss
JOIN company_integrations ci USING (company_id)
GROUP BY ss.company_id, ci.company_name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cas_company ON company_analytics_summary(company_id);

-- Refresh command (run periodically or on demand):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY company_analytics_summary;

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Supabase RLS — companies can only read their own data via the anon key.
-- Backend API routes use the service_role key which bypasses RLS.

ALTER TABLE company_integrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys              ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_endpoints  ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_configs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events    ENABLE ROW LEVEL SECURITY;

-- Public read of active simulation endpoints (for discovery)
CREATE POLICY "public_read_active_simulations"
  ON simulation_endpoints FOR SELECT
  USING (is_active = true AND is_sandbox = false);

-- Users can only read their own sessions
CREATE POLICY "users_own_sessions"
  ON simulation_sessions FOR SELECT
  USING (user_id = auth.uid()::text);

-- Users can only read their own results
CREATE POLICY "users_own_results"
  ON simulation_results FOR SELECT
  USING (user_id = auth.uid()::text);

-- ── Helper functions ──────────────────────────────────────────────────────────

-- Auto-update updated_at on company_integrations
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ci_updated_at
  BEFORE UPDATE ON company_integrations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Function: award XP to a user after a completed session
CREATE OR REPLACE FUNCTION award_simulation_xp(
  p_user_id    TEXT,
  p_session_id TEXT,
  p_xp         INT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update session
  UPDATE simulation_sessions
  SET xp_awarded = p_xp, status = 'completed'
  WHERE session_id = p_session_id;

  -- Could also update a user_stats table here
END;
$$;

-- Function: get platform-wide analytics snapshot
CREATE OR REPLACE FUNCTION get_platform_analytics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_companies',     (SELECT COUNT(*) FROM company_integrations WHERE status = 'active'),
    'total_simulations',   (SELECT COUNT(*) FROM simulation_endpoints  WHERE is_active = true),
    'total_sessions',      (SELECT COUNT(*) FROM simulation_sessions),
    'completed_sessions',  (SELECT COUNT(*) FROM simulation_sessions WHERE status = 'completed'),
    'total_participants',  (SELECT COUNT(DISTINCT user_id) FROM simulation_sessions),
    'avg_score',           (SELECT ROUND(AVG(final_score)::NUMERIC, 1) FROM simulation_results),
    'total_xp_awarded',    (SELECT COALESCE(SUM(xp_awarded), 0) FROM simulation_sessions)
  ) INTO result;
  RETURN result;
END;
$$;

-- ── Seed: demo company integrations ──────────────────────────────────────────
-- Run this ONLY in development / sandbox environments.

/*
INSERT INTO company_integrations (company_id, company_name, contact_email, base_url, status, tier)
VALUES
  ('mckinsey-cairo',   'McKinsey Cairo',    'tech@mckinsey-egypt.com',  'https://sims.mckinsey-cairo.com',  'active', 'enterprise'),
  ('vodafone-egypt',   'Vodafone Egypt',    'api@vodafone.com.eg',      'https://talent.vodafone.com.eg',    'active', 'professional'),
  ('cib-bank',         'CIB Egypt',         'digital@cib.com.eg',       'https://assess.cib.com.eg',         'active', 'professional'),
  ('pg-mena',          'P&G MENA',          'talent@pg.com',            'https://sims.pg-mena.com',          'active', 'enterprise'),
  ('microsoft-egypt',  'Microsoft Egypt',   'recruit@microsoft.com',    'https://careers.microsoft.com/sims','pending','enterprise');
*/

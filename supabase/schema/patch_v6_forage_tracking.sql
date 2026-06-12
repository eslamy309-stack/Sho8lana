-- ============================================================
--  Sho8lana — Patch v6: Forage Activity Tracking & Sync
--  Links Forage job-simulation activity to sho8lana accounts.
--  Safe to re-run. Paste into Supabase SQL Editor.
-- ============================================================
--
--  Design notes
--  ------------
--  theforage.com exposes no public API/webhook/SSO, so completions cannot be
--  pushed automatically. These tables track everything we DO control:
--    • a tracked launch  (server-side, when the user clicks "Start on Forage")
--    • return detection + self-reported progress / time / status
--    • certificate submission (best-effort server-side verification)
--    • an HMAC webhook ingestion path (for a future data partnership / automation)
--
--  History is append-only: every signal is an immutable row in forage_events,
--  and each (re)launch creates a NEW forage_attempts row — prior attempts are
--  never overwritten.
-- ============================================================

-- ── Extensions (no-op if already present) ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enum: lifecycle status ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forage_status') THEN
    CREATE TYPE forage_status AS ENUM ('launched','in_progress','completed','abandoned');
  END IF;
END$$;

-- ── Attempts: one row per user × program × attempt_number ─────────────────────
CREATE TABLE IF NOT EXISTS forage_attempts (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_token        TEXT          NOT NULL UNIQUE,        -- opaque tracking id "fa_…"
  user_id              UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id           TEXT          NOT NULL,               -- matches FORAGE_PROGRAMS.id
  company              TEXT          NOT NULL DEFAULT '',     -- denormalized snapshot
  title                TEXT          NOT NULL DEFAULT '',
  attempt_number       INT           NOT NULL DEFAULT 1,
  status               forage_status NOT NULL DEFAULT 'launched',
  progress_pct         INT           NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  score                NUMERIC(5,2),
  time_spent_seconds   INT           NOT NULL DEFAULT 0,
  launched_at          TIMESTAMPTZ   DEFAULT now(),
  opened_at            TIMESTAMPTZ,
  last_activity_at     TIMESTAMPTZ   DEFAULT now(),
  completed_at         TIMESTAMPTZ,
  certificate_url      TEXT,
  certificate_verified BOOLEAN       NOT NULL DEFAULT false,
  certificate_issued_to TEXT,
  certificate_issued_at TIMESTAMPTZ,
  forage_feedback      JSONB         DEFAULT '{}',
  source               TEXT          NOT NULL DEFAULT 'launch',  -- launch|self_report|webhook|admin
  metadata             JSONB         DEFAULT '{}',
  created_at           TIMESTAMPTZ   DEFAULT now(),
  UNIQUE (user_id, program_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_fa_user        ON forage_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_fa_program     ON forage_attempts(program_id);
CREATE INDEX IF NOT EXISTS idx_fa_status      ON forage_attempts(status);
CREATE INDEX IF NOT EXISTS idx_fa_activity    ON forage_attempts(last_activity_at DESC);

-- ── Events: append-only activity timeline ────────────────────────────────────
CREATE TABLE IF NOT EXISTS forage_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_token      TEXT        NOT NULL REFERENCES forage_attempts(attempt_token) ON DELETE CASCADE,
  user_id            UUID        NOT NULL,
  program_id         TEXT        NOT NULL,
  event_type         TEXT        NOT NULL,   -- simulation.launched|opened|progress.updated|...
  progress_pct       INT,
  score              NUMERIC(5,2),
  time_spent_seconds INT,
  source             TEXT        NOT NULL DEFAULT 'self_report',
  payload            JSONB       DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fe_attempt ON forage_events(attempt_token);
CREATE INDEX IF NOT EXISTS idx_fe_user    ON forage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_fe_created ON forage_events(created_at DESC);

-- ── View: latest attempt per user × program (for activity UI + dashboard) ─────
-- security_invoker => the view enforces the querying user's RLS, never the
-- view owner's, so it can't become an accidental data-leak surface.
CREATE OR REPLACE VIEW forage_user_latest
WITH (security_invoker = true) AS
SELECT DISTINCT ON (user_id, program_id)
  user_id, program_id, attempt_token, company, title, attempt_number, status,
  progress_pct, score, time_spent_seconds, launched_at, last_activity_at,
  completed_at, certificate_verified
FROM forage_attempts
ORDER BY user_id, program_id, attempt_number DESC;

-- ── RPC: analytics snapshot (mirrors get_platform_analytics) ─────────────────
CREATE OR REPLACE FUNCTION get_forage_analytics()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attempts',     (SELECT COUNT(*) FROM forage_attempts),
    'active_now',         (SELECT COUNT(*) FROM forage_attempts
                             WHERE status IN ('launched','in_progress')
                             AND last_activity_at > now() - interval '30 minutes'),
    'in_progress',        (SELECT COUNT(*) FROM forage_attempts WHERE status IN ('launched','in_progress')),
    'completed',          (SELECT COUNT(*) FROM forage_attempts WHERE status = 'completed'),
    'abandoned',          (SELECT COUNT(*) FROM forage_attempts WHERE status = 'abandoned'),
    'distinct_users',     (SELECT COUNT(DISTINCT user_id) FROM forage_attempts),
    'distinct_programs',  (SELECT COUNT(DISTINCT program_id) FROM forage_attempts),
    'verified_certs',     (SELECT COUNT(*) FROM forage_attempts WHERE certificate_verified),
    'avg_progress',       (SELECT ROUND(AVG(progress_pct)::NUMERIC, 1) FROM forage_attempts),
    'avg_score',          (SELECT ROUND(AVG(score)::NUMERIC, 1) FROM forage_attempts WHERE score IS NOT NULL),
    'completion_rate',    (SELECT ROUND(
                             COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC
                             / NULLIF(COUNT(*), 0) * 100, 1) FROM forage_attempts),
    'last_activity_at',   (SELECT MAX(last_activity_at) FROM forage_attempts)
  ) INTO result;
  RETURN result;
END;$$;

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Users read only their own activity; super_admins read everything (admin
-- dashboard reads via the anon client + a logged-in super_admin session, like
-- the other admin views). Service-role API routes bypass RLS entirely.

ALTER TABLE forage_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forage_events   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forage_attempts_select_own"   ON forage_attempts;
DROP POLICY IF EXISTS "forage_attempts_admin_all"    ON forage_attempts;
DROP POLICY IF EXISTS "forage_events_select_own"     ON forage_events;
DROP POLICY IF EXISTS "forage_events_admin_all"      ON forage_events;

CREATE POLICY "forage_attempts_select_own" ON forage_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "forage_attempts_admin_all" ON forage_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.role = 'super_admin'
    )
  );

CREATE POLICY "forage_events_select_own" ON forage_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "forage_events_admin_all" ON forage_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE (p.id = auth.uid() OR p.user_id = auth.uid())
        AND p.role = 'super_admin'
    )
  );

-- ── Realtime: stream attempt/event changes to the admin dashboard ────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'forage_attempts'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE forage_attempts;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'forage_events'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE forage_events;
    END IF;
  END IF;
END$$;

-- ── Done ─────────────────────────────────────────────────────────────────────
SELECT 'patch_v6_forage_tracking: all objects created successfully' AS result;

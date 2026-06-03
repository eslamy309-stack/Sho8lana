-- ═══════════════════════════════════════════════════════════════════════════
--  Sho8lana — Complete Database Setup
--  ONE FILE. Safe to re-run on an existing database.
--  Paste into: Supabase Dashboard → SQL Editor → New query → Run
--
--  Sections:
--    1. Extensions
--    2. Schema additions (columns, tables)
--    3. Indexes
--    4. Helper functions
--    5. Automation triggers (new user, new job, new application, status change)
--    6. Row Level Security
--    7. Realtime
--    8. Seed data (25 companies + 35 jobs)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. Schema additions ───────────────────────────────────────────────────────

-- profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role         TEXT    NOT NULL DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills       TEXT[]  NOT NULL DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kpi_score    INT     NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp           INT     NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier         TEXT    NOT NULL DEFAULT 'bronze';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription TEXT    NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enabled  BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visibility   TEXT    NOT NULL DEFAULT 'recruiter';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_job_ids JSONB  DEFAULT '[]';

-- companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS local_id    INTEGER UNIQUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_emoji  TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS location    TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS industry    TEXT;

-- jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS local_id     INTEGER UNIQUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title_ar     TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary       TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source       TEXT DEFAULT 'company';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS featured     BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;    -- plain text (seed-friendly)
-- If an older patch created requirements as text[], convert to plain text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'requirements' AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN requirements TYPE TEXT
      USING array_to_string(requirements, '; ');
  END IF;
END $$;

-- applications
ALTER TABLE applications ALTER COLUMN job_id DROP NOT NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS external_job_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS external_url    TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source          TEXT DEFAULT 'company';

-- ── Notifications table (student + company in-app, real-time) ─────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT        NOT NULL,          -- new_application | status_change | new_job | welcome | general
  title        TEXT        NOT NULL,
  body         TEXT        NOT NULL,
  read         BOOLEAN     NOT NULL DEFAULT false,
  action_screen TEXT,                         -- which screen to open on tap
  related_id   UUID,                          -- job_id or application_id
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ── admin_notifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          BIGSERIAL   PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  type        TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  body        TEXT        NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  read        BOOLEAN     NOT NULL DEFAULT false,
  metadata    JSONB
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- ── platform_settings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT 'true',
  label      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO platform_settings (key, value, label) VALUES
  ('registrations_enabled',           'true',  'Allow new student registrations'),
  ('company_onboarding_enabled',      'true',  'Allow new company onboarding'),
  ('simulation_publishing_enabled',   'true',  'Allow companies to publish simulations'),
  ('internship_applications_enabled', 'true',  'Allow students to submit applications'),
  ('maintenance_mode',                'false', 'Maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- ── audit_logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL   PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id     UUID,
  action      TEXT        NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  metadata    JSONB,
  ip_address  TEXT
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address TEXT;


-- ── 3. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_applications_user_applied
  ON applications (user_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
  ON applications (job_id);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id
  ON jobs (company_id);

CREATE INDEX IF NOT EXISTS idx_jobs_local_id
  ON jobs (local_id) WHERE local_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_local_id
  ON companies (local_id) WHERE local_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_owner_id
  ON companies (owner_id) WHERE owner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, created_at DESC) WHERE read = false;


-- ── 4. Helper functions ───────────────────────────────────────────────────────

-- Auto-update updated_at on any table that has it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at     ON profiles;
DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── 5. Automation triggers ────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- 5a. NEW USER → auto-create profile + welcome notification
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, user_id, name, email, avatar_url, auth_provider, role)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider',
    'student'
  )
  ON CONFLICT (id) DO UPDATE SET
    email         = EXCLUDED.email,
    avatar_url    = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    auth_provider = EXCLUDED.auth_provider,
    updated_at    = NOW();

  -- In-app welcome notification
  INSERT INTO notifications (user_id, type, title, body, action_screen)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome to Sho8lana! 🎉',
    'Complete your profile to start applying and get discovered by top Egyptian companies.',
    'onboard'
  );

  -- Admin alert
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES (
    'student_registered',
    'New Student Registered',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ) || ' just signed up.',
    'profile',
    NEW.id::TEXT
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5b. NEW JOB POSTED → notify admin + notify company owner
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_job()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_company_name TEXT;
  v_owner_id     UUID;
BEGIN
  SELECT name, owner_id INTO v_company_name, v_owner_id
  FROM companies WHERE id = NEW.company_id;

  -- Admin alert
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES (
    'job_posted',
    'New Job Posted',
    COALESCE(v_company_name, 'A company') || ' posted: ' || NEW.title,
    'job',
    NEW.id::TEXT
  );

  -- Notify the company owner so they know it's live
  IF v_owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, action_screen, related_id)
    VALUES (
      v_owner_id,
      'job_live',
      'Your job is live ✅',
      '"' || NEW.title || '" is now visible to students and accepting applications.',
      'companyPortal',
      NEW.id
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_job failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_job ON jobs;
CREATE TRIGGER trg_new_job
  AFTER INSERT ON jobs
  FOR EACH ROW EXECUTE FUNCTION handle_new_job();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5c. NEW APPLICATION → increment job counter + notify company + notify admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_company_id   UUID;
  v_owner_id     UUID;
  v_company_name TEXT;
  v_job_title    TEXT;
  v_applicant    TEXT;
BEGIN
  -- Resolve job info (works for both seeded jobs and future company-posted jobs)
  IF NEW.job_id IS NOT NULL THEN
    SELECT j.company_id, j.title, c.owner_id, c.name
    INTO v_company_id, v_job_title, v_owner_id, v_company_name
    FROM jobs j
    JOIN companies c ON c.id = j.company_id
    WHERE j.id = NEW.job_id;

    -- Increment applicant counter on the job
    UPDATE jobs SET applicants = applicants + 1 WHERE id = NEW.job_id;
  END IF;

  -- Fallback: use denormalised fields from the application row itself
  v_job_title    := COALESCE(v_job_title,    NEW.job_title);
  v_company_name := COALESCE(v_company_name, NEW.company);

  -- Get the student's name
  SELECT COALESCE(name, email) INTO v_applicant
  FROM profiles WHERE id = NEW.user_id;

  -- Notify the company owner (if we have one) — works for any future posted job
  IF v_owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, body, action_screen, related_id)
    VALUES (
      v_owner_id,
      'new_application',
      'New applicant for ' || COALESCE(v_job_title, 'your posting'),
      COALESCE(v_applicant, 'A student') || ' applied for ' || COALESCE(v_job_title, 'your position') || '.',
      'companyPortal',
      NEW.id
    );
  END IF;

  -- Admin alert
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES (
    'application_submitted',
    'New Application',
    COALESCE(v_applicant, 'A student') || ' applied for ' ||
      COALESCE(v_job_title, 'a position') || ' at ' || COALESCE(v_company_name, 'a company') || '.',
    'application',
    NEW.id::TEXT
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_application failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_application ON applications;
CREATE TRIGGER trg_new_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_new_application();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5d. APPLICATION STATUS CHANGE → notify student + admin
--     Works for every future company that updates an application status
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_application_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_title        TEXT;
  v_body         TEXT;
  v_action       TEXT;
BEGIN
  -- Only fire when status actually changed
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Build a human-readable message per status
  CASE NEW.status
    WHEN 'reviewing' THEN
      v_title  := 'Application under review 👀';
      v_body   := COALESCE(NEW.company, 'The company') || ' is reviewing your application for ' || COALESCE(NEW.job_title, 'the position') || '.';
      v_action := 'tracker';
    WHEN 'shortlisted' THEN
      v_title  := 'You''ve been shortlisted! 🌟';
      v_body   := 'Great news! ' || COALESCE(NEW.company, 'The company') || ' shortlisted you for ' || COALESCE(NEW.job_title, 'the position') || '.';
      v_action := 'tracker';
    WHEN 'interview' THEN
      v_title  := 'Interview invitation 🎯';
      v_body   := COALESCE(NEW.company, 'The company') || ' has invited you to interview for ' || COALESCE(NEW.job_title, 'the position') || '. Check your email for details.';
      v_action := 'tracker';
    WHEN 'accepted' THEN
      v_title  := 'Offer accepted 🎉';
      v_body   := 'Congratulations! ' || COALESCE(NEW.company, 'The company') || ' accepted your application for ' || COALESCE(NEW.job_title, 'the position') || '.';
      v_action := 'tracker';
    WHEN 'rejected' THEN
      v_title  := 'Application update';
      v_body   := 'Your application for ' || COALESCE(NEW.job_title, 'the position') || ' at ' || COALESCE(NEW.company, 'the company') || ' was not selected this time. Keep going!';
      v_action := 'tracker';
    ELSE
      v_title  := 'Application update';
      v_body   := 'Your application for ' || COALESCE(NEW.job_title, 'a position') || ' has been updated to: ' || NEW.status || '.';
      v_action := 'tracker';
  END CASE;

  -- In-app notification for the student
  INSERT INTO notifications (user_id, type, title, body, action_screen, related_id)
  VALUES (NEW.user_id, 'status_change', v_title, v_body, v_action, NEW.id);

  -- Admin alert
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
  VALUES (
    'application_status_change',
    'Status Changed → ' || NEW.status,
    COALESCE(NEW.job_title, 'Application') || ' moved from ' || OLD.status || ' to ' || NEW.status,
    'application',
    NEW.id::TEXT,
    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'user_id', NEW.user_id)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_application_status_change failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_change ON applications;
CREATE TRIGGER trg_application_status_change
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_status_change();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5e. APPLICATION DELETED / WITHDRAWN → decrement job counter
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_application_deleted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.job_id IS NOT NULL THEN
    UPDATE jobs SET applicants = GREATEST(0, applicants - 1) WHERE id = OLD.job_id;
  END IF;
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_application_deleted failed: %', SQLERRM;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_deleted ON applications;
CREATE TRIGGER trg_application_deleted
  AFTER DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_application_deleted();


-- ─────────────────────────────────────────────────────────────────────────────
-- 5f. NEW COMPANY REGISTERED → notify admin
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_company()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES (
    'company_registered',
    'New Company Registered',
    COALESCE(NEW.name, 'A company') || ' just joined the platform.',
    'company',
    NEW.id::TEXT
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_company failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_company ON companies;
CREATE TRIGGER trg_new_company
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION handle_new_company();


-- ── 6. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications  ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies (safe re-run)
DROP POLICY IF EXISTS "profiles_select_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_select_company"          ON profiles;
DROP POLICY IF EXISTS "companies_all_owner"              ON companies;
DROP POLICY IF EXISTS "companies_select_authenticated"   ON companies;
DROP POLICY IF EXISTS "jobs_select_public"               ON jobs;
DROP POLICY IF EXISTS "jobs_insert_owner"                ON jobs;
DROP POLICY IF EXISTS "jobs_update_owner"                ON jobs;
DROP POLICY IF EXISTS "jobs_delete_owner"                ON jobs;
DROP POLICY IF EXISTS "applications_select_own"          ON applications;
DROP POLICY IF EXISTS "applications_insert_own"          ON applications;
DROP POLICY IF EXISTS "applications_update_own"          ON applications;
DROP POLICY IF EXISTS "applications_select_company"      ON applications;
DROP POLICY IF EXISTS "applications_update_company"      ON applications;
DROP POLICY IF EXISTS "notifications_select_own"         ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"         ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own"         ON notifications;
DROP POLICY IF EXISTS "admin_notifications_super_admin"  ON admin_notifications;
DROP POLICY IF EXISTS "super_admin_all_notifications"    ON admin_notifications;
DROP POLICY IF EXISTS "platform_settings_read_all"       ON platform_settings;
DROP POLICY IF EXISTS "platform_settings_admin_write"    ON platform_settings;
DROP POLICY IF EXISTS "audit_logs_admin"                 ON audit_logs;

-- PROFILES
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Companies can read profiles of students who applied to their jobs
CREATE POLICY "profiles_select_company"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN companies c ON c.id = j.company_id
      WHERE a.user_id = profiles.id
        AND c.owner_id = auth.uid()
    )
  );

-- COMPANIES
CREATE POLICY "companies_all_owner"
  ON companies FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "companies_select_authenticated"
  ON companies FOR SELECT USING (auth.role() = 'authenticated');

-- JOBS — public read, owner write
CREATE POLICY "jobs_select_public"
  ON jobs FOR SELECT USING (true);

CREATE POLICY "jobs_insert_owner"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "jobs_update_owner"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "jobs_delete_owner"
  ON jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()
    )
  );

-- APPLICATIONS — students own their rows, companies can read+update status for their jobs
CREATE POLICY "applications_select_own"
  ON applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "applications_insert_own"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_own"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Company recruiters can read applications to their jobs
CREATE POLICY "applications_select_company"
  ON applications FOR SELECT
  USING (
    job_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.owner_id = auth.uid()
    )
  );

-- Company recruiters can update status on applications to their jobs
CREATE POLICY "applications_update_company"
  ON applications FOR UPDATE
  USING (
    job_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.owner_id = auth.uid()
    )
  );

-- NOTIFICATIONS — each user sees and manages only their own
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ADMIN NOTIFICATIONS — super_admin only
CREATE POLICY "admin_notifications_super_admin"
  ON admin_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- PLATFORM SETTINGS
CREATE POLICY "platform_settings_read_all"
  ON platform_settings FOR SELECT USING (true);

CREATE POLICY "platform_settings_admin_write"
  ON platform_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

-- AUDIT LOGS
CREATE POLICY "audit_logs_admin"
  ON audit_logs FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );


-- ── 7. Realtime ───────────────────────────────────────────────────────────────
-- Students get instant in-app pings when their application status changes.
-- Companies get instant pings when a new student applies.
-- Enable publication for both tables.

DO $$
BEGIN
  -- notifications (student bell updates)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  -- applications (company portal live refresh)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE applications;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Realtime setup skipped: %', SQLERRM;
END;
$$;


-- ── 8. Seed data ──────────────────────────────────────────────────────────────
-- 25 companies + 35 jobs.
-- Uses local_id as the idempotency key so re-running is safe.
-- Any FUTURE job posted through the company portal will be auto-handled
-- by the triggers above — no need to touch this seed again.

-- ── Companies ─────────────────────────────────────────────────────────────────
INSERT INTO companies (id, name, industry, location, logo_emoji, website, local_id) VALUES
  (uuid_generate_v4(), 'Vodafone Egypt',                'Telecom',      'Smart Village',    '🔴', 'vodafone.com.eg',       1),
  (uuid_generate_v4(), 'CIB Egypt',                     'Banking',      'New Cairo',        '🏦', 'cibeg.com',             2),
  (uuid_generate_v4(), 'P&G Egypt',                     'FMCG',         '6th October',      '🧴', 'pg.com',                3),
  (uuid_generate_v4(), 'Microsoft Egypt',               'Technology',   'Smart Village',    '💻', 'microsoft.com/en-eg',   4),
  (uuid_generate_v4(), 'McKinsey Cairo',                'Consulting',   'New Cairo',        '📊', 'mckinsey.com',          5),
  (uuid_generate_v4(), 'Fawry',                         'Fintech',      'Maadi',            '💳', 'fawry.com',             6),
  (uuid_generate_v4(), 'Orange Egypt',                  'Telecom',      'Smart Village',    '🟠', 'orange.eg',             7),
  (uuid_generate_v4(), 'Nestlé Egypt',                  'FMCG',         '6th October',      '☕', 'nestle-eg.com',         8),
  (uuid_generate_v4(), 'Unilever Egypt',                'FMCG',         '6th October',      '🌿', 'unilever.com.eg',       9),
  (uuid_generate_v4(), 'EFG Hermes',                    'Finance',      'New Cairo',        '📈', 'efghermes.com',        10),
  (uuid_generate_v4(), 'Amazon Egypt',                  'E-Commerce',   'New Capital',      '📦', 'amazon.eg',            11),
  (uuid_generate_v4(), 'IBM Egypt',                     'Technology',   'New Cairo',        '🔷', 'ibm.com/eg',           12),
  (uuid_generate_v4(), 'Bupa Egypt (GlobeMed)',          'Healthcare',   'Heliopolis',       '🏥', 'bupaegypt.com',        13),
  (uuid_generate_v4(), 'Coca-Cola Egypt',               'FMCG',         'Maadi',            '🥤', 'coca-colaegypt.com',   14),
  (uuid_generate_v4(), 'Deloitte Egypt',                'Consulting',   'New Cairo',        '🟢', 'deloitte.com/eg',      15),
  (uuid_generate_v4(), 'PwC Egypt',                     'Consulting',   'Maadi',            '🔴', 'pwc.com/eg',           16),
  (uuid_generate_v4(), 'Egyptian Media Production City','Media',        '6th October',      '📺', 'empc-eg.com',          17),
  (uuid_generate_v4(), 'Majid Al Futtaim Egypt',        'Retail',       'New Cairo',        '🛍️','majidalfuttaim.com',   18),
  (uuid_generate_v4(), 'Careem Egypt',                  'Technology',   'Nasr City',        '🚗', 'careem.com',           19),
  (uuid_generate_v4(), 'Valeo Egypt',                   'Automotive',   'New Capital',      '⚙️', 'valeo.com',            20),
  (uuid_generate_v4(), 'Mentor Graphics Egypt',         'Technology',   'Smart Village',    '🖥️','mentor.com',           21),
  (uuid_generate_v4(), 'NBE (National Bank of Egypt)',  'Banking',      'Downtown Cairo',   '🏛️','nbe.com.eg',           22),
  (uuid_generate_v4(), 'Banque Misr',                   'Banking',      'Downtown Cairo',   '🏦', 'banquemisr.com',       23),
  (uuid_generate_v4(), 'Breadfast',                     'E-Commerce',   'Heliopolis',       '🍞', 'breadfast.com',        24),
  (uuid_generate_v4(), 'Paymob',                        'Fintech',      'Maadi',            '📲', 'paymob.com',           25)
ON CONFLICT (local_id) DO UPDATE SET
  name       = EXCLUDED.name,
  industry   = EXCLUDED.industry,
  location   = EXCLUDED.location,
  logo_emoji = EXCLUDED.logo_emoji,
  website    = EXCLUDED.website;

-- ── Jobs ──────────────────────────────────────────────────────────────────────
-- NOTE: trg_new_job fires on each INSERT below and will:
--   • notify the (currently NULL) owner_id — no-op until owner is set
--   • log each job to admin_notifications
-- This is intentional and harmless during seeding.

INSERT INTO jobs (id, company_id, title, title_ar, location, type, salary, source, industry, description, requirements, featured, local_id, created_at)
SELECT
  uuid_generate_v4(), c.id,
  v.title, v.title_ar, v.location, v.type, v.salary, v.source, v.industry,
  v.description, v.requirements, v.featured, v.local_id, now() - v.age
FROM companies c
JOIN (VALUES

  -- Vodafone Egypt (company local_id=1)
  (1,'Marketing Intern','متدرب تسويق','Smart Village','internship','EGP 5,000/mo','linkedin','Telecom',
   'Join Vodafone''s marketing team working on real campaigns reaching millions of Egyptian subscribers.',
   'Marketing or Business student; Strong English; Basic analytics knowledge',
   true, 1, interval '2 days'),

  -- CIB Egypt (company local_id=2)
  (1,'Financial Analyst Intern','متدرب محلل مالي','New Cairo','internship','EGP 6,000/mo','company','Banking',
   'Work alongside CIB''s finance team analyzing real portfolios and building financial models.',
   'Finance or Accounting major; Advanced Excel; GPA 3.0+',
   true, 2, interval '1 day'),

  -- Microsoft Egypt (company local_id=4)
  (4,'Software Engineering Intern','متدرب هندسة برمجيات','Smart Village','internship','EGP 8,000/mo','linkedin','Technology',
   'Build real features used by millions at Microsoft Egypt with cutting-edge cloud and AI technologies.',
   'CS or Engineering major; Python/JS proficiency; Problem-solving skills',
   true, 3, interval '5 hours'),

  -- McKinsey Cairo (company local_id=5)
  (5,'Business Analyst Intern','متدرب محلل أعمال','New Cairo','internship','EGP 10,000/mo','linkedin','Consulting',
   'Work on real client engagements at McKinsey. Analyze complex business problems.',
   'Top university student; GPA 3.5+; Exceptional analytical skills',
   true, 4, interval '12 hours'),

  -- P&G Egypt (company local_id=3)
  (3,'Supply Chain Intern','متدرب سلسلة إمداد','6th October','internship','EGP 4,500/mo','wuzzuf','FMCG',
   'Support P&G''s supply chain operations across Egypt.',
   'Business or Engineering student; Analytical mindset',
   false, 5, interval '3 days'),

  -- Fawry (company local_id=6)
  (6,'Product Management Intern','متدرب إدارة منتجات','Maadi','internship','EGP 6,000/mo','wuzzuf','Fintech',
   'Shape Egypt''s leading fintech platform at Fawry.',
   'Business or CS student; User-centric mindset',
   false, 6, interval '2 days'),

  -- Orange Egypt (company local_id=7)
  (7,'Data Analytics Intern','متدرب تحليل بيانات','Smart Village','internship','EGP 5,500/mo','company','Telecom',
   'Analyze customer data patterns for Orange Egypt. Build dashboards.',
   'Data Science or CS; SQL proficiency',
   false, 7, interval '4 days'),

  -- Nestlé Egypt (company local_id=8)
  (8,'Brand Management Intern','متدرب إدارة العلامة','6th October','internship','EGP 4,000/mo','wuzzuf','FMCG',
   'Assist Nestlé''s brand team with market research and campaign analytics.',
   'Marketing major; Creative thinker',
   false, 8, interval '7 days'),

  -- Unilever Egypt (company local_id=9)
  (9,'HR Operations Intern','متدرب عمليات الموارد البشرية','6th October','internship','EGP 4,500/mo','company','FMCG',
   'Support Unilever Egypt''s HR team with recruitment, onboarding, and employee engagement.',
   'HR or Business student; Strong communication; Excel',
   false, 9, interval '3 days'),

  (9,'Sales & Distribution Intern','متدرب مبيعات وتوزيع','6th October','internship','EGP 4,000/mo','wuzzuf','FMCG',
   'Learn real sales operations, distributor management, and territory planning at Unilever.',
   'Business or Marketing student; Willingness to be field-based',
   false, 10, interval '5 days'),

  -- EFG Hermes (company local_id=10)
  (10,'Investment Banking Intern','متدرب بنك استثماري','New Cairo','internship','EGP 8,000/mo','linkedin','Finance',
   'Join EFG Hermes investment banking team. Work on real M&A and capital markets transactions.',
   'Finance or Economics major; Financial modeling; GPA 3.3+',
   true, 11, interval '6 hours'),

  (10,'Equity Research Intern','متدرب بحوث الأسهم','New Cairo','internship','EGP 7,000/mo','company','Finance',
   'Research Egyptian and MENA listed companies for EFG Hermes research division.',
   'Finance/Economics student; Bloomberg familiarity a plus',
   false, 12, interval '2 days'),

  -- Amazon Egypt (company local_id=11)
  (11,'Operations Excellence Intern','متدرب تحسين العمليات','New Capital','internship','EGP 6,500/mo','linkedin','E-Commerce',
   'Improve fulfillment center operations at Amazon Egypt using Lean and Six Sigma principles.',
   'Engineering or Operations student; Analytical; Data-driven mindset',
   true, 13, interval '1 day'),

  (11,'E-Commerce Category Intern','متدرب فئة تجارة إلكترونية','New Capital','internship','EGP 5,500/mo','company','E-Commerce',
   'Manage a product category at Amazon Egypt. Work with vendors and optimize listings.',
   'Business student; Detail-oriented; Basic Excel',
   false, 14, interval '3 days'),

  -- IBM Egypt (company local_id=12)
  (12,'Cloud Solutions Intern','متدرب حلول السحابة','New Cairo','internship','EGP 7,000/mo','linkedin','Technology',
   'Work on IBM Cloud deployments and enterprise client implementations across Egypt.',
   'CS or IT student; Cloud basics; Python familiarity',
   false, 15, interval '2 days'),

  -- Coca-Cola Egypt (company local_id=14)
  (14,'Commercial Operations Intern','متدرب العمليات التجارية','Maadi','internship','EGP 5,000/mo','wuzzuf','FMCG',
   'Learn Coca-Cola Egypt''s go-to-market strategy and distributor ecosystem firsthand.',
   'Business student; Enthusiastic about FMCG; Driver''s license a plus',
   false, 16, interval '4 days'),

  -- Deloitte Egypt (company local_id=15)
  (15,'Audit & Assurance Intern','متدرب تدقيق وتأكيد','New Cairo','internship','EGP 5,500/mo','linkedin','Consulting',
   'Gain hands-on audit experience at Deloitte Egypt working on Big Four-quality engagements.',
   'Accounting or Finance major; GPA 3.0+; Attention to detail',
   true, 17, interval '1 day'),

  (15,'Management Consulting Intern','متدرب استشارات إدارية','New Cairo','internship','EGP 7,000/mo','company','Consulting',
   'Work on strategy and transformation projects for top Egyptian and multinational clients.',
   'Business/Engineering student; GPA 3.5+; Structured thinking',
   true, 18, interval '3 days'),

  -- PwC Egypt (company local_id=16)
  (16,'Tax Advisory Intern','متدرب الاستشارات الضريبية','Maadi','internship','EGP 5,000/mo','company','Consulting',
   'Join PwC Egypt''s tax team. Learn Egyptian tax law and advise real business clients.',
   'Accounting/Law/Finance student; Analytical; Strong Arabic & English',
   false, 19, interval '5 days'),

  -- Majid Al Futtaim (company local_id=18)
  (18,'Retail Operations Intern','متدرب عمليات التجزئة','New Cairo','internship','EGP 4,500/mo','wuzzuf','Retail',
   'Work inside Mall of Egypt or City Centre learning retail operations from the ground up.',
   'Business student; Customer-first mindset; Presentable',
   false, 20, interval '7 days'),

  -- Careem Egypt (company local_id=19)
  (19,'Growth & Marketing Intern','متدرب النمو والتسويق','Nasr City','internship','EGP 5,000/mo','linkedin','Technology',
   'Run growth experiments at Careem Egypt. A/B test campaigns and analyze driver acquisition.',
   'Marketing/Business student; Data curiosity; Growth mindset',
   false, 21, interval '2 days'),

  -- Valeo Egypt (company local_id=20)
  (20,'Embedded Systems Intern','متدرب أنظمة مدمجة','New Capital','internship','EGP 7,000/mo','company','Automotive',
   'Work on cutting-edge automotive embedded systems at Valeo''s Egypt R&D center.',
   'Electronics or CS student; C/C++ proficiency; RTOS knowledge a plus',
   true, 22, interval '3 days'),

  -- Paymob (company local_id=25)
  (25,'Merchant Success Intern','متدرب نجاح التجار','Maadi','internship','EGP 4,500/mo','wuzzuf','Fintech',
   'Help merchants integrate and succeed on Paymob''s payment gateway.',
   'Business/CS student; Excellent communication; Problem-solver',
   false, 23, interval '1 day'),

  -- Breadfast (company local_id=24)
  (24,'Operations Intern','متدرب عمليات','Heliopolis','internship','EGP 4,000/mo','company','E-Commerce',
   'Work at the heart of Breadfast operations — delivery routing, rider management, fulfilment.',
   'Any major; Detail-oriented; Morning person',
   false, 24, interval '2 days'),

  -- CIB Egypt full-time (company local_id=2)
  (2,'Junior Corporate Banker','موظف مصرفي مؤسسي مبتدئ','New Cairo','full-time','EGP 12,000/mo','linkedin','Banking',
   'Join CIB corporate banking as a junior banker. Manage client portfolios and structure credit facilities.',
   'Finance/Accounting grad; 1 year experience or strong internship; CFA Level 1 a plus',
   true, 25, interval '1 day'),

  -- Microsoft Egypt full-time (company local_id=4)
  (4,'Junior Software Engineer','مهندس برمجيات مبتدئ','Smart Village','full-time','EGP 18,000/mo','linkedin','Technology',
   'Build Microsoft products used by millions of Egyptians. Mentorship from senior engineers.',
   'CS degree or equivalent; JavaScript/TypeScript; Problem-solving skills',
   true, 26, interval '6 hours'),

  -- McKinsey Cairo full-time (company local_id=5)
  (5,'Associate Consultant','مستشار مشارك','New Cairo','full-time','EGP 22,000/mo','linkedin','Consulting',
   'McKinsey Cairo''s 2026 Associate Consultant class. Shape Egypt''s largest organizations.',
   'Top-university grad (any field); GPA 3.7+; Exceptional problem-solving',
   true, 27, interval '2 days'),

  -- Deloitte Egypt full-time (company local_id=15)
  (15,'Junior Auditor','مدقق مبتدئ','New Cairo','full-time','EGP 9,000/mo','company','Consulting',
   'Start your Big Four career at Deloitte Egypt''s audit practice.',
   'Accounting grad; ACCA/CPA pursuing a plus; Attention to detail',
   false, 28, interval '3 days'),

  -- Fawry full-time (company local_id=6)
  (6,'Junior Product Manager','مدير منتجات مبتدئ','Maadi','full-time','EGP 14,000/mo','wuzzuf','Fintech',
   'Own a product area at Fawry. Define roadmaps, run sprints, and ship features to 40M+ users.',
   'CS or Business grad; 1 year PM or tech experience; Data-driven decision maker',
   false, 29, interval '1 day'),

  -- Paymob full-time (company local_id=25)
  (25,'Sales Account Executive','مدير حسابات مبيعات','Maadi','full-time','EGP 10,000/mo','company','Fintech',
   'Sell Paymob''s payment solutions to Egyptian merchants and e-commerce businesses.',
   'Business grad; Strong communication; Results-driven personality',
   false, 30, interval '5 days'),

  -- Mentor Graphics Egypt (company local_id=21)
  (21,'VLSI Design Intern','متدرب تصميم VLSI','Smart Village','internship','EGP 8,000/mo','company','Technology',
   'Work on chip design at Siemens EDA (Mentor Graphics) Egypt — one of the best R&D centers in MENA.',
   'Electronics/CS student; Digital design; VHDL or Verilog',
   false, 31, interval '2 days'),

  -- NBE (company local_id=22)
  (22,'Retail Banking Intern','متدرب مصرفية التجزئة','Downtown Cairo','internship','EGP 3,500/mo','company','Banking',
   'Rotate through NBE''s retail banking branches and learn operations from Egypt''s oldest bank.',
   'Any finance/business student; Customer-oriented; Professional appearance',
   false, 32, interval '7 days'),

  -- Bupa Egypt (company local_id=13)
  (13,'Healthcare Operations Intern','متدرب عمليات رعاية صحية','Heliopolis','internship','EGP 4,000/mo','wuzzuf','Healthcare',
   'Work inside a leading health insurance company. Learn claims processing and provider networks.',
   'Healthcare management or Business student; Organized; Detail-oriented',
   false, 33, interval '4 days'),

  -- EMPC (company local_id=17)
  (17,'Media Production Intern','متدرب إنتاج إعلامي','6th October','internship','EGP 3,000/mo','company','Media',
   'Work at EMPC — the largest media city in the Middle East. Support production teams on real projects.',
   'Media/Film student; Adobe Creative Suite; Portfolio preferred',
   false, 34, interval '6 days'),

  -- Vodafone Egypt second job (company local_id=1)
  (1,'Corporate Communications Intern','متدرب اتصالات مؤسسية','Smart Village','internship','EGP 4,500/mo','linkedin','Telecom',
   'Shape Vodafone Egypt''s corporate narrative. Write press releases, manage media relations.',
   'Communications or Journalism student; Excellent English; Strong writing skills',
   false, 35, interval '3 days')

) AS v(company_local_id, title, title_ar, location, type, salary, source, industry,
       description, requirements, featured, local_id, age)
ON (c.local_id = v.company_local_id)
ON CONFLICT (local_id) DO UPDATE SET
  title       = EXCLUDED.title,
  salary      = EXCLUDED.salary,
  source      = EXCLUDED.source,
  featured    = EXCLUDED.featured,
  description = EXCLUDED.description;

-- ── Final check ───────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM companies WHERE local_id IS NOT NULL) AS companies_seeded,
  (SELECT COUNT(*) FROM jobs     WHERE local_id IS NOT NULL) AS jobs_seeded,
  'setup.sql applied successfully 🚀' AS status;

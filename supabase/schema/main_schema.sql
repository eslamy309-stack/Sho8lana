-- ============================================================
--  Sho8lana — Main Database Schema
--  Safe to run from scratch OR re-run on existing database.
--  Drops all policies first to avoid "already exists" errors.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  logo_url                TEXT,
  industry                TEXT,
  size                    TEXT,
  website                 TEXT,
  description             TEXT,
  subscription_plan       TEXT NOT NULL DEFAULT 'free',
  subscription_status     TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id      TEXT,
  subscription_updated_at TIMESTAMPTZ,
  owner_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT,
  email                TEXT,
  university           TEXT,
  major                TEXT,
  gpa                  NUMERIC(3,2),
  phone                TEXT,
  location             TEXT,
  graduation_year      INT,
  bio                  TEXT,
  linkedin_url         TEXT,
  portfolio_url        TEXT,
  github_username      TEXT,
  avatar_url           TEXT,
  auth_provider        TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  role                 TEXT NOT NULL DEFAULT 'student',
  company_id           UUID REFERENCES companies(id) ON DELETE SET NULL,
  xp                   INT NOT NULL DEFAULT 0,
  tier                 TEXT NOT NULL DEFAULT 'bronze',
  kpi_score            INT NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_ar        TEXT,
  location        TEXT,
  salary          TEXT,
  type            TEXT CHECK (type IN ('internship', 'full-time', 'part-time')),
  industry        TEXT,
  description     TEXT,
  description_ar  TEXT,
  requirements    TEXT[],
  requirements_ar TEXT[],
  skills          TEXT[],
  deadline        TIMESTAMPTZ,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  source          TEXT,
  applicants      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id       UUID REFERENCES jobs(id) ON DELETE CASCADE,
  job_title    TEXT,
  company      TEXT,
  company_logo TEXT,
  cover_note   TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'applied',
  applied_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  track       TEXT,
  xp_reward   INT NOT NULL DEFAULT 0,
  time_limit  TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at     ON profiles;
DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY — enable on all tables
-- ============================================================
ALTER TABLE companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP ALL EXISTING POLICIES (old names + new names)
-- ============================================================

-- profiles — drop any name that may have been created before
DROP POLICY IF EXISTS "own profile"           ON profiles;
DROP POLICY IF EXISTS "own profile update"    ON profiles;
DROP POLICY IF EXISTS "own profile insert"    ON profiles;
DROP POLICY IF EXISTS "profiles_select_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON profiles;
DROP POLICY IF EXISTS "profiles_select_all"   ON profiles;

-- companies
DROP POLICY IF EXISTS "companies_all_owner"              ON companies;
DROP POLICY IF EXISTS "companies_select_authenticated"   ON companies;
DROP POLICY IF EXISTS "company owner"                    ON companies;
DROP POLICY IF EXISTS "read companies"                   ON companies;

-- jobs
DROP POLICY IF EXISTS "jobs_select_public"  ON jobs;
DROP POLICY IF EXISTS "jobs_insert_owner"   ON jobs;
DROP POLICY IF EXISTS "jobs_update_owner"   ON jobs;
DROP POLICY IF EXISTS "jobs_delete_owner"   ON jobs;
DROP POLICY IF EXISTS "read jobs"           ON jobs;
DROP POLICY IF EXISTS "insert job"          ON jobs;
DROP POLICY IF EXISTS "update job"          ON jobs;
DROP POLICY IF EXISTS "delete job"          ON jobs;

-- applications
DROP POLICY IF EXISTS "applications_select_own"     ON applications;
DROP POLICY IF EXISTS "applications_insert_own"     ON applications;
DROP POLICY IF EXISTS "applications_update_own"     ON applications;
DROP POLICY IF EXISTS "applications_select_company" ON applications;
DROP POLICY IF EXISTS "own applications"            ON applications;
DROP POLICY IF EXISTS "insert application"          ON applications;
DROP POLICY IF EXISTS "company read applications"   ON applications;

-- simulations
DROP POLICY IF EXISTS "simulations_select_public" ON simulations;
DROP POLICY IF EXISTS "simulations_all_owner"     ON simulations;
DROP POLICY IF EXISTS "read simulations"          ON simulations;
DROP POLICY IF EXISTS "manage simulations"        ON simulations;

-- ============================================================
-- CREATE POLICIES
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- ── COMPANIES ─────────────────────────────────────────────
CREATE POLICY "companies_all_owner"
  ON companies FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "companies_select_authenticated"
  ON companies FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── JOBS ──────────────────────────────────────────────────
CREATE POLICY "jobs_select_public"
  ON jobs FOR SELECT
  USING (TRUE);

CREATE POLICY "jobs_insert_owner"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
        AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "jobs_update_owner"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
        AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "jobs_delete_owner"
  ON jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- ── APPLICATIONS ──────────────────────────────────────────
CREATE POLICY "applications_select_own"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "applications_insert_own"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_update_own"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_select_company"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON companies.id = jobs.company_id
      WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
    )
  );

-- ── SIMULATIONS ───────────────────────────────────────────
CREATE POLICY "simulations_select_public"
  ON simulations FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "simulations_all_owner"
  ON simulations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = simulations.company_id
        AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = simulations.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN UP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, user_id, name, email, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET
    email        = EXCLUDED.email,
    avatar_url   = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    auth_provider = EXCLUDED.auth_provider,
    updated_at   = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

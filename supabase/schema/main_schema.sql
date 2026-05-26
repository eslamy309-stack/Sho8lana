-- ============================================================
-- Sho8lana Main Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES
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

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID REFERENCES companies(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  title_ar         TEXT,
  location         TEXT,
  salary           TEXT,
  type             TEXT CHECK (type IN ('internship', 'full-time', 'part-time')),
  industry         TEXT,
  description      TEXT,
  description_ar   TEXT,
  requirements     TEXT[],
  requirements_ar  TEXT[],
  skills           TEXT[],
  deadline         TIMESTAMPTZ,
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  source           TEXT,
  applicants       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
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

-- ============================================================
-- SIMULATIONS
-- ============================================================
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
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Attach trigger to applications
DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations  ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES policies ----

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for onboarding)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---- COMPANIES policies ----

-- Company owner can manage their company
CREATE POLICY "companies_all_owner"
  ON companies FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Anyone authenticated can read companies (for job listings etc.)
CREATE POLICY "companies_select_authenticated"
  ON companies FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---- JOBS policies ----

-- Anyone can read public jobs
CREATE POLICY "jobs_select_public"
  ON jobs FOR SELECT
  USING (TRUE);

-- Company owners can insert jobs for their company
CREATE POLICY "jobs_insert_owner"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
        AND companies.owner_id = auth.uid()
    )
  );

-- Company owners can update/delete their own jobs
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

-- ---- APPLICATIONS policies ----

-- Users can read their own applications
CREATE POLICY "applications_select_own"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "applications_insert_own"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "applications_update_own"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Company owners can read applications for their jobs
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

-- ---- SIMULATIONS policies ----

-- Anyone can read public simulations
CREATE POLICY "simulations_select_public"
  ON simulations FOR SELECT
  USING (is_public = TRUE);

-- Company owners can manage their simulations
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

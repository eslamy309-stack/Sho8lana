-- ============================================================
--  Sho8lana — Launch Patch v2
--  Run AFTER main_schema.sql + admin_schema.sql
--  Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards
-- ============================================================

-- ── 1. Student visibility / privacy control ───────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'recruiter'
  CHECK (visibility IN ('private', 'recruiter', 'public'));

-- Drop old blanket select policy and replace with visibility-aware one
DROP POLICY IF EXISTS "profiles_select_own"       ON profiles;
DROP POLICY IF EXISTS "profiles_select_public"    ON profiles;
DROP POLICY IF EXISTS "profiles_select_recruiter" ON profiles;

-- Own profile: always readable
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR auth.uid() = user_id);

-- Public profiles: anyone authenticated can read
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (visibility = 'public' AND auth.role() = 'authenticated');

-- Recruiter-visible profiles: authenticated users (companies) can read
CREATE POLICY "profiles_select_recruiter"
  ON profiles FOR SELECT
  USING (visibility = 'recruiter' AND auth.role() = 'authenticated');

-- ── 2. Company approval enforcement ──────────────────────
-- Companies must be 'active' before their jobs are visible
DROP POLICY IF EXISTS "jobs_select_public"          ON jobs;
DROP POLICY IF EXISTS "jobs_select_active_company"  ON jobs;

CREATE POLICY "jobs_select_active_company"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = jobs.company_id
        AND companies.status = 'active'
    )
  );

-- Simulations from pending companies stay hidden from public
DROP POLICY IF EXISTS "simulations_select_public"       ON simulations;
DROP POLICY IF EXISTS "simulations_select_active_co"    ON simulations;

CREATE POLICY "simulations_select_active_co"
  ON simulations FOR SELECT
  USING (
    is_public = TRUE
    AND EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = simulations.company_id
        AND companies.status = 'active'
    )
  );

-- ── 3. Prevent pending companies from reading applications ─
-- Company owners can only see applications to their jobs when active
DROP POLICY IF EXISTS "applications_select_company"         ON applications;
DROP POLICY IF EXISTS "applications_select_active_company"  ON applications;

CREATE POLICY "applications_select_active_company"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN companies ON companies.id = jobs.company_id
      WHERE jobs.id = applications.job_id
        AND companies.owner_id = auth.uid()
        AND companies.status = 'active'
    )
  );

-- ── 4. Performance indexes ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON profiles (visibility);
CREATE INDEX IF NOT EXISTS idx_companies_status    ON companies (status);
CREATE INDEX IF NOT EXISTS idx_companies_owner     ON companies (owner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company        ON jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline       ON jobs (deadline);
CREATE INDEX IF NOT EXISTS idx_applications_job    ON applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user   ON applications (user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_company ON simulations (company_id);
CREATE INDEX IF NOT EXISTS idx_simulations_public  ON simulations (is_public);

-- ── 5. Auto-approve trigger for first company (owner's own company) ──
-- Companies created by a super_admin are auto-approved
CREATE OR REPLACE FUNCTION auto_approve_if_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = NEW.owner_id
      AND profiles.role = 'super_admin'
  ) THEN
    NEW.status := 'active';
    NEW.approved_at := now();
    NEW.approved_by := 'system';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_admin_company ON companies;
CREATE TRIGGER trg_auto_approve_admin_company
  BEFORE INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION auto_approve_if_admin();

-- ── 6. Notification: company approval status changed ─────
CREATE OR REPLACE FUNCTION notify_company_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
    VALUES (
      'company_status_change',
      'Company Status Updated',
      'Company "' || NEW.name || '" status changed from ' || OLD.status || ' → ' || NEW.status || '.',
      'company', NEW.id::TEXT,
      jsonb_build_object('company_name', NEW.name, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_company_status ON companies;
CREATE TRIGGER trg_notify_company_status
  AFTER UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION notify_company_status_change();

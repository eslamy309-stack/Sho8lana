-- ═══════════════════════════════════════════════════════════════════════════
--  Sho8lana — Admin Control Center Fix
--  Paste into: Supabase Dashboard → SQL Editor → Run
--
--  Fixes:
--    1. is_admin() helper so super_admin bypasses RLS on all tables
--    2. Admin read-all RLS policies (students, companies, applications, logs)
--    3. Companies schema additions (status, approved_at, etc.)
--    4. Bulk-approve all 25 seeded companies
--    5. audit_logs table with correct schema
--    6. Improved handle_new_user trigger (includes student name + email)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. is_admin() — SECURITY DEFINER so it always sees real role ───────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
$$;

-- ── 2. Admin RLS policies ──────────────────────────────────────────────────

-- profiles: admin can read all students
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT USING (is_admin());

-- profiles: admin can update (suspend/ban)
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- companies: admin can do everything
DROP POLICY IF EXISTS "admin_all_companies" ON companies;
CREATE POLICY "admin_all_companies" ON companies
  FOR ALL USING (is_admin());

-- applications: admin can read all
DROP POLICY IF EXISTS "admin_read_all_applications" ON applications;
CREATE POLICY "admin_read_all_applications" ON applications
  FOR SELECT USING (is_admin());

-- notifications: admin can insert notifications for any user
DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (is_admin());

-- ── 3. Companies schema additions ─────────────────────────────────────────
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status            TEXT        NOT NULL DEFAULT 'pending';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS approved_at       TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS approved_by       TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS subscription_plan TEXT        NOT NULL DEFAULT 'starter';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email             TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS description       TEXT;

-- ── 4. Bulk-approve the 25 seeded companies ────────────────────────────────
-- These are well-known Egyptian companies added by the platform — pre-approved.
UPDATE companies
SET    status = 'active',
       approved_at = now(),
       approved_by = 'system_seed'
WHERE  local_id IS NOT NULL;

-- ── 5. audit_logs table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGSERIAL   PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  actor_role    TEXT        DEFAULT 'admin',
  action        TEXT        NOT NULL,   -- company_approval | user_update | admin_action | security_event …
  resource_type TEXT,                   -- company | profile | application | simulation
  resource_id   TEXT,
  description   TEXT,
  ip_address    TEXT,
  metadata      JSONB
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admin can read logs
DROP POLICY IF EXISTS "admin_all_audit_logs" ON audit_logs;
CREATE POLICY "admin_all_audit_logs" ON audit_logs
  FOR ALL USING (is_admin());

-- Anyone (authenticated or service) can insert — so client-side admin actions land here
DROP POLICY IF EXISTS "anyone_insert_audit_logs" ON audit_logs;
CREATE POLICY "anyone_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ── 6. Improved handle_new_user trigger ───────────────────────────────────
-- Now includes student name + email in the admin notification body.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name     TEXT := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    split_part(NEW.email, '@', 1)
  );
  v_provider TEXT := COALESCE(NEW.app_metadata->>'provider', 'email');
BEGIN
  -- Create profile row
  INSERT INTO profiles (id, email, name, auth_provider, created_at)
  VALUES (NEW.id, NEW.email, v_name, v_provider, now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = CASE WHEN profiles.name = '' OR profiles.name IS NULL THEN EXCLUDED.name ELSE profiles.name END;

  -- Welcome notification for the student
  INSERT INTO notifications (user_id, type, title, body, action_screen)
  VALUES (NEW.id, 'welcome', 'Welcome to Sho8lana! 🎉',
    'Your account is ready. Complete your profile to start applying for internships.',
    'profile');

  -- Admin notification with name + email
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
  VALUES (
    'student_registered',
    'New Student Registered',
    v_name || ' (' || COALESCE(NEW.email, '') || ') just joined the platform.',
    'user',
    NEW.id::TEXT,
    jsonb_build_object(
      'email',    NEW.email,
      'name',     v_name,
      'provider', v_provider
    )
  );

  RETURN NEW;
END;
$$;

-- Re-create the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Verification ──────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role = 'student')          AS students_visible,
  (SELECT COUNT(*) FROM companies WHERE status = 'active')        AS active_companies,
  (SELECT COUNT(*) FROM companies WHERE status = 'pending')       AS pending_companies,
  (SELECT COUNT(*) FROM audit_logs)                               AS audit_log_entries,
  'admin_fix.sql applied successfully ✅'                         AS status;

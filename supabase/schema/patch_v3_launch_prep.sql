-- ============================================================
--  Sho8lana — Launch Prep Patch v3
--  Run AFTER main_schema.sql + admin_schema.sql + patch_v2_launch.sql
--  Safe to re-run: all statements use IF NOT EXISTS / IF EXISTS guards
-- ============================================================

-- ── 1. Add skills array column to profiles ────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN (skills);

-- ── 2. Platform kill-switch settings table ───────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT 'true',
  label      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_read_all"    ON platform_settings;
DROP POLICY IF EXISTS "platform_settings_admin_write" ON platform_settings;

-- Anyone (including unauthenticated) can read settings — used by client for kill switches
CREATE POLICY "platform_settings_read_all"
  ON platform_settings FOR SELECT USING (true);

-- Only super_admin can modify
CREATE POLICY "platform_settings_admin_write"
  ON platform_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
  );

-- Seed default kill-switch values (safe to re-run)
INSERT INTO platform_settings (key, value, label) VALUES
  ('registrations_enabled',          'true',  'Allow new student registrations'),
  ('company_onboarding_enabled',     'true',  'Allow new company onboarding'),
  ('simulation_publishing_enabled',  'true',  'Allow companies to publish simulations'),
  ('internship_applications_enabled','true',  'Allow students to submit applications'),
  ('maintenance_mode',               'false', 'Maintenance mode (shows maintenance page)')
ON CONFLICT (key) DO NOTHING;

-- ── 3. Platform reset function ────────────────────────────
-- Call: SELECT perform_platform_reset(); (MANUAL — does not run automatically)
-- Deletes all non-admin test data; preserves super_admin accounts and schema.
CREATE OR REPLACE FUNCTION perform_platform_reset()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Collect super_admin IDs so we can preserve them
  SELECT ARRAY_AGG(id) INTO admin_ids
  FROM profiles WHERE role = 'super_admin';

  -- Clear activity tables first (FK order)
  DELETE FROM admin_notifications;
  DELETE FROM document_files;
  DELETE FROM applications;
  DELETE FROM simulation_submissions;
  DELETE FROM jobs;
  DELETE FROM simulations;

  -- Remove companies (admins have no company by default)
  DELETE FROM companies;

  -- Remove non-admin profiles
  IF admin_ids IS NOT NULL THEN
    DELETE FROM profiles WHERE id <> ALL(admin_ids);
  ELSE
    DELETE FROM profiles;
  END IF;

  -- Re-seed kill switches to enabled
  UPDATE platform_settings SET value = 'true'  WHERE key <> 'maintenance_mode';
  UPDATE platform_settings SET value = 'false' WHERE key = 'maintenance_mode';

  RETURN 'Platform reset complete. ' ||
         COALESCE(array_length(admin_ids, 1), 0)::TEXT ||
         ' super_admin account(s) preserved.';
END;
$$;

-- ── 4. Ensure admin_logs table has an ip_address column ──
-- (guards against missing column referenced in AuditLogView)
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- ── 5. Ensure handle_new_user trigger produces a role ─────
-- Recreate the trigger function to guarantee role='student' is set
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

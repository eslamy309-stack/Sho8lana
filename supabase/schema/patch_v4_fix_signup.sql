-- ============================================================
--  Sho8lana — Patch v4: Fix "Database error saving new user"
--  Safe to re-run. Paste this entire file into Supabase SQL Editor.
-- ============================================================

-- ── 1. Ensure all columns the trigger or app code references exist ────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'recruiter';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS skills TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS kpi_score INT NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'bronze';

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- ── 2. Ensure admin_notifications table exists ────────────────────────────
--  The trg_notify_new_student trigger inserts here — if missing, signup crashes.

CREATE TABLE IF NOT EXISTS admin_notifications (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  entity_type TEXT,
  entity_id   TEXT,
  read        BOOLEAN NOT NULL DEFAULT false,
  metadata    JSONB
);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_all_notifications" ON admin_notifications;
CREATE POLICY "super_admin_all_notifications" ON admin_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- ── 3. Recreate handle_new_user with explicit role + exception safety ─────
--  Old version relied on DEFAULT for role and could fail silently.

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
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block signup
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 4. Ensure notify_new_student function and trigger exist ───────────────

CREATE OR REPLACE FUNCTION notify_new_student()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES (
    'student_registered',
    'New Student Registered',
    'A new student just joined the platform.',
    'profile',
    NEW.id::TEXT
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_new_student failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_student ON profiles;
CREATE TRIGGER trg_notify_new_student
  AFTER INSERT ON profiles
  FOR EACH ROW WHEN (NEW.role = 'student')
  EXECUTE FUNCTION notify_new_student();

-- ── 5. platform_settings kill-switch table ────────────────────────────────

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

INSERT INTO platform_settings (key, value, label) VALUES
  ('registrations_enabled',          'true',  'Allow new student registrations'),
  ('company_onboarding_enabled',     'true',  'Allow new company onboarding'),
  ('simulation_publishing_enabled',  'true',  'Allow companies to publish simulations'),
  ('internship_applications_enabled','true',  'Allow students to submit applications'),
  ('maintenance_mode',               'false', 'Maintenance mode (shows maintenance page)')
ON CONFLICT (key) DO NOTHING;

-- ── 6. Ensure audit_logs has ip_address column ────────────────────────────

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- ── Done ─────────────────────────────────────────────────────────────────
SELECT 'patch_v4_fix_signup: all fixes applied successfully' AS result;

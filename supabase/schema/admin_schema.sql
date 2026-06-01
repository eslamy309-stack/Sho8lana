-- ══════════════════════════════════════════════════════════
--  Sho8lana — Super Admin Schema
--  Run this in your Supabase SQL editor AFTER main_schema.sql
--  Safe to re-run: uses IF NOT EXISTS + DROP IF EXISTS guards
-- ══════════════════════════════════════════════════════════

-- ── 1. Add columns to existing tables ───────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
  CHECK (role IN ('student', 'company_recruiter', 'company_admin', 'super_admin'));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));

ALTER TABLE companies ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- ── 2. Audit Logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email   TEXT,
  actor_role    TEXT NOT NULL DEFAULT 'system',
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     TEXT,
  description   TEXT NOT NULL,
  metadata      JSONB,
  ip_address    INET,
  user_agent    TEXT
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_read_audit"    ON audit_logs;
DROP POLICY IF EXISTS "service_role_insert_audit" ON audit_logs;

CREATE POLICY "super_admin_read_audit" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "service_role_insert_audit" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ── 3. Admin Notifications ───────────────────────────────
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

-- ── 4. Support Tickets ───────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1;

CREATE TABLE IF NOT EXISTS support_tickets (
  id           BIGSERIAL PRIMARY KEY,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ticket_ref   TEXT NOT NULL UNIQUE DEFAULT 'TKT-' || LPAD(nextval('ticket_seq')::TEXT, 4, '0'),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT NOT NULL,
  user_name    TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'question' CHECK (category IN ('bug','question','billing','account','other')),
  priority     TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to  TEXT,
  resolved_at  TIMESTAMPTZ,
  replies      JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_create_tickets"   ON support_tickets;
DROP POLICY IF EXISTS "users_read_own_tickets" ON support_tickets;
DROP POLICY IF EXISTS "admin_all_tickets"      ON support_tickets;

CREATE POLICY "users_create_tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_read_own_tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_all_tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ── 5. Simulation Submissions ────────────────────────────
CREATE TABLE IF NOT EXISTS simulation_submissions (
  id               BIGSERIAL PRIMARY KEY,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  company_id       TEXT NOT NULL,
  company_name     TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  category         TEXT NOT NULL,
  duration_mins    INT NOT NULL DEFAULT 30,
  questions        JSONB NOT NULL DEFAULT '[]',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      TEXT,
  rejection_reason TEXT
);

ALTER TABLE simulation_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_submit_sims" ON simulation_submissions;
DROP POLICY IF EXISTS "admin_manage_sims"     ON simulation_submissions;

CREATE POLICY "companies_submit_sims" ON simulation_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_manage_sims" ON simulation_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ── 6. Auto-notification triggers ────────────────────────

CREATE OR REPLACE FUNCTION notify_new_student()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES ('student_registered', 'New Student Registered',
          'A new student just joined the platform.', 'profile', NEW.id::TEXT);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_student ON profiles;
CREATE TRIGGER trg_notify_new_student
  AFTER INSERT ON profiles
  FOR EACH ROW WHEN (NEW.role = 'student')
  EXECUTE FUNCTION notify_new_student();

CREATE OR REPLACE FUNCTION notify_new_company()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
  VALUES ('company_registered', 'New Company Registered',
          'Company "' || NEW.name || '" is pending approval.',
          'company', NEW.id::TEXT,
          jsonb_build_object('company_name', NEW.name, 'plan', NEW.subscription_plan));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_company ON companies;
CREATE TRIGGER trg_notify_new_company
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE FUNCTION notify_new_company();

CREATE OR REPLACE FUNCTION notify_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF OLD.subscription_plan <> NEW.subscription_plan AND NEW.subscription_status = 'active' THEN
    INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
    VALUES ('subscription', 'Subscription Purchased',
            'Company "' || NEW.name || '" upgraded to ' || NEW.subscription_plan || ' plan.',
            'company', NEW.id::TEXT,
            jsonb_build_object('plan', NEW.subscription_plan, 'company', NEW.name));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_subscription ON companies;
CREATE TRIGGER trg_notify_subscription
  AFTER UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION notify_subscription();

CREATE OR REPLACE FUNCTION notify_sim_submitted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id, metadata)
  VALUES ('sim_submitted', 'Simulation Submitted for Review',
          '"' || NEW.title || '" by ' || NEW.company_name || ' awaits approval.',
          'simulation', NEW.id::TEXT,
          jsonb_build_object('title', NEW.title, 'company', NEW.company_name));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_sim ON simulation_submissions;
CREATE TRIGGER trg_notify_sim
  AFTER INSERT ON simulation_submissions
  FOR EACH ROW EXECUTE FUNCTION notify_sim_submitted();

CREATE OR REPLACE FUNCTION notify_application()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, body, entity_type, entity_id)
  VALUES ('application', 'New Internship Application',
          'A student applied to "' || NEW.job_title || '" at ' || NEW.company || '.',
          'application', NEW.id::TEXT);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application ON applications;
CREATE TRIGGER trg_notify_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application();

-- ── 7. updated_at triggers ────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_support_updated_at ON support_tickets;
CREATE TRIGGER trg_support_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sim_updated_at ON simulation_submissions;
CREATE TRIGGER trg_sim_updated_at
  BEFORE UPDATE ON simulation_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── 8. Indexes ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor   ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action  ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_notifs_created     ON admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifs_read        ON admin_notifications (read);
CREATE INDEX IF NOT EXISTS idx_tickets_status     ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_user       ON support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_sims_status        ON simulation_submissions (status);

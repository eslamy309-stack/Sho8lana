-- ============================================================
--  Sho8lana — Patch v5: Applications Workflow Fix
--  Safe to re-run. Paste into Supabase SQL Editor.
-- ============================================================

-- ── 1. Make job_id nullable so external jobs (LinkedIn/Wuzzuf) can be saved ─

ALTER TABLE applications ALTER COLUMN job_id DROP NOT NULL;

-- ── 2. Add external job tracking fields ──────────────────────────────────────

ALTER TABLE applications ADD COLUMN IF NOT EXISTS external_job_id TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS external_url     TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS source           TEXT DEFAULT 'company';

-- ── 3. Add subscription tier to profiles (free / pro) ────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription TEXT NOT NULL DEFAULT 'free';

-- ── 4. RLS: companies can read applications to their own job postings ─────────

DROP POLICY IF EXISTS "applications_select_company" ON applications;
CREATE POLICY "applications_select_company" ON applications FOR SELECT
  USING (
    job_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id
        AND c.owner_id = auth.uid()
    )
  );

-- ── 5. Index to speed up per-user application count (plan enforcement) ───────

CREATE INDEX IF NOT EXISTS idx_applications_user_applied
  ON applications (user_id, applied_at DESC);

-- ── Done ─────────────────────────────────────────────────────────────────────
SELECT 'patch_v5_applications: all fixes applied successfully' AS result;

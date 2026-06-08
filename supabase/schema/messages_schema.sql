-- ─────────────────────────────────────────────────────────────────────────────
-- Sho8lana — Messages / Chat schema
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Conversations (each conversation is between a student and a company
--       and optionally tied to a specific job/application) ────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  company_id    UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  job_id        UUID             REFERENCES jobs(id)       ON DELETE SET NULL,
  job_title     TEXT,
  company_name  TEXT,
  student_name  TEXT,
  last_message  TEXT,
  last_at       TIMESTAMPTZ DEFAULT NOW(),
  unread_student  INT NOT NULL DEFAULT 0,
  unread_company  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, company_id, job_id)
);

CREATE INDEX IF NOT EXISTS conv_student_idx ON conversations(student_id, last_at DESC);
CREATE INDEX IF NOT EXISTS conv_company_idx ON conversations(company_id, last_at DESC);

-- ── 2. Messages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id)    ON DELETE CASCADE,
  content         TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS msg_conv_idx ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS msg_sender_idx ON messages(sender_id);

-- ── 3. Row-level security ────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;

-- Conversations: visible to student or company
DROP POLICY IF EXISTS "conv_select" ON conversations;
CREATE POLICY "conv_select" ON conversations
  FOR SELECT USING (student_id = auth.uid() OR company_id = auth.uid());

DROP POLICY IF EXISTS "conv_insert" ON conversations;
CREATE POLICY "conv_insert" ON conversations
  FOR INSERT WITH CHECK (student_id = auth.uid() OR company_id = auth.uid());

DROP POLICY IF EXISTS "conv_update" ON conversations;
CREATE POLICY "conv_update" ON conversations
  FOR UPDATE USING (student_id = auth.uid() OR company_id = auth.uid());

-- Messages: visible to participants of the conversation
DROP POLICY IF EXISTS "msg_select" ON messages;
CREATE POLICY "msg_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.student_id = auth.uid() OR c.company_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "msg_insert" ON messages;
CREATE POLICY "msg_insert" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.student_id = auth.uid() OR c.company_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "msg_update" ON messages;
CREATE POLICY "msg_update" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.student_id = auth.uid() OR c.company_id = auth.uid())
    )
  );

-- ── 4. Enable Realtime on messages table ─────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

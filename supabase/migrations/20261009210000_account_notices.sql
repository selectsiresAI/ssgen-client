-- account_notices: aviso em popup dirigido a contas especificas (ex.: incidente resolvido)
CREATE TABLE IF NOT EXISTS account_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info', 'incident_resolved', 'warning')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS account_notices_user_open_idx
  ON account_notices (user_id) WHERE dismissed_at IS NULL;

ALTER TABLE account_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notices"
  ON account_notices FOR SELECT
  USING (auth.uid() = user_id);

-- usuario so pode marcar o proprio aviso como lido
CREATE POLICY "Users dismiss own notices"
  ON account_notices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

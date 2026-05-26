CREATE TABLE ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'website',
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_company TEXT,
  contact_city TEXT,
  contact_intent TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_chat_sessions_created_at ON ai_chat_sessions(created_at DESC);

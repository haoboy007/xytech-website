CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 允许匿名用户插入留言
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anonymous_insert" ON public.messages
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "allow_anonymous_select" ON public.messages
  FOR SELECT TO anon
  USING (true);
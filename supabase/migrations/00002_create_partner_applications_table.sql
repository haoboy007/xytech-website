
CREATE TABLE partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL,
  city text NOT NULL,
  intention text,
  created_at timestamptz DEFAULT now()
);

-- 创建 helper 函数
CREATE OR REPLACE FUNCTION can_insert_partner_applications()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION can_select_partner_applications(app_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT false;
$$;

-- 启用 RLS
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- 插入策略：任何人都可以提交申请
CREATE POLICY "anyone_can_insert_partner_applications"
  ON partner_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (can_insert_partner_applications());

-- 选择策略：仅管理员可读（此处禁止公开读取）
CREATE POLICY "no_public_select_partner_applications"
  ON partner_applications
  FOR SELECT
  TO anon, authenticated
  USING (can_select_partner_applications(id));

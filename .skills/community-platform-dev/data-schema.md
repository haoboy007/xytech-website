# 圈层平台数据库设计范式

> 基于齐鲁汇 35+ 张表、36 个页面的实践经验总结

## 核心表设计原则

### 1. 用户与身份体系

```sql
-- 用户基础表（与 Supabase Auth 联动）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  native_place TEXT,        -- 籍贯/同乡属性
  location TEXT,
  industry TEXT,
  bio TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户认证体系
CREATE TABLE user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type TEXT CHECK (verification_type IN ('personal', 'enterprise')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  real_name TEXT,
  id_card_front_url TEXT,
  id_card_back_url TEXT,
  company_name TEXT,
  business_license_url TEXT,
  contact_phone TEXT,
  reject_reason TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,    -- 有效期管理
  is_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关注关系
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

### 2. 信息发布体系（帖子/动态/资讯）

```sql
-- 内容分类表（话题/标签）
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 帖子/动态表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id),
  content TEXT NOT NULL,
  images TEXT[],           -- 多图存储URL数组
  location TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,    -- 置顶
  is_featured BOOLEAN DEFAULT FALSE,  -- 精选
  audit_status TEXT DEFAULT 'pending' CHECK (audit_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表（一级，可扩展为嵌套）
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表（去重）
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 资讯/公告表
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT,
  source_url TEXT,         -- 外链原文
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. 私信系统

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 会话列表视图/函数（聚合最新消息）
CREATE OR REPLACE FUNCTION get_conversations(p_user_id UUID)
RETURNS TABLE(
  partner_id UUID,
  partner_nickname TEXT,
  partner_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (partner)
    partner,
    p.nickname,
    p.avatar_url,
    m.content,
    m.created_at,
    (SELECT COUNT(*) FROM messages WHERE sender_id = partner AND receiver_id = p_user_id AND is_read = FALSE)
  FROM (
    SELECT receiver_id AS partner, created_at, content FROM messages WHERE sender_id = p_user_id
    UNION ALL
    SELECT sender_id AS partner, created_at, content FROM messages WHERE receiver_id = p_user_id
  ) m
  JOIN profiles p ON p.id = m.partner
  ORDER BY partner, m.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### 4. 活动系统

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  max_participants INTEGER,
  fee DECIMAL(10,2) DEFAULT 0,
  images TEXT[],
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'ended')),
  audit_status TEXT DEFAULT 'pending',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'cancelled')),
  checkin_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

### 5. 积分系统

```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,      -- 连续签到天数
  last_signin_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('earn', 'spend', 'adjust')),
  amount INTEGER NOT NULL,
  reason TEXT,
  related_id UUID,                    -- 关联业务ID
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  points_cost INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,            -- -1 表示不限量
  is_enabled BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES point_products(id),
  points_used INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'completed', 'refunded')),
  address TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE point_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'once', 'achievement')),
  points_reward INTEGER NOT NULL,
  action_type TEXT,                   -- 'post', 'comment', 'share', 'signin' 等
  max_times INTEGER DEFAULT 1,        -- 每日/总计可完成次数
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. 通知系统

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('system', 'like', 'comment', 'follow', 'message', 'audit', 'event', 'points')),
  title TEXT NOT NULL,
  content TEXT,
  related_id UUID,                    -- 关联业务ID
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. 系统配置

```sql
CREATE TABLE system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## RLS 策略设计模式

所有用户表必须启用 RLS：

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ...

-- 通用模式：用户只能读写自己的数据
CREATE POLICY "Users can read own data" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可读写全部
CREATE POLICY "Admin full access" ON profiles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- 公开数据（如已审核的帖子）允许所有人读取
CREATE POLICY "Public can read approved posts" ON posts
  FOR SELECT USING (audit_status = 'approved');
```

## 索引设计建议

```sql
-- 高频查询字段
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_topic_id ON posts(topic_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_audit_status ON posts(audit_status);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_verifications_status ON user_verifications(status);
CREATE INDEX idx_verifications_type ON user_verifications(verification_type);
CREATE INDEX idx_verifications_expires ON user_verifications(expires_at) WHERE status = 'approved';
```

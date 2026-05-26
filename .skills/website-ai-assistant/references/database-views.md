# 数据库分析与统计

创建数据分析视图和函数，用于访客统计、地理位置分布、留资转化分析。

## 基础表结构

```sql
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'website',
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_company TEXT,
  contact_city TEXT,
  contact_intent TEXT,
  client_ip TEXT,           -- 脱敏后的IP段，如 "192.168.1.xxx"
  client_location TEXT,     -- 地理位置，如 "中国 · 北京市 · 北京"
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 数据分析视图

### 1. 地理位置汇总统计

```sql
CREATE OR REPLACE VIEW ai_chat_geo_stats AS
SELECT 
  COALESCE(client_location, '未知') AS location,
  COUNT(*) AS total_sessions,
  COUNT(contact_phone) AS has_phone_count,
  COUNT(contact_email) AS has_email_count,
  MAX(created_at) AS last_visit_at
FROM ai_chat_sessions
GROUP BY client_location
ORDER BY total_sessions DESC;
```

**用途**：查看哪些地区的访客最多、留资转化率如何。

**查询示例**：
```sql
SELECT * FROM ai_chat_geo_stats LIMIT 10;
```

### 2. 省市拆分日报

```sql
CREATE OR REPLACE VIEW ai_chat_geo_breakdown AS
WITH parsed AS (
  SELECT 
    id,
    CASE 
      WHEN client_location LIKE '%·%' THEN SPLIT_PART(client_location, ' · ', 1)
      ELSE '未知'
    END AS country,
    CASE 
      WHEN client_location LIKE '%·%' THEN SPLIT_PART(client_location, ' · ', 2)
      ELSE COALESCE(client_location, '未知')
    END AS province,
    CASE 
      WHEN client_location LIKE '%·%·%' THEN SPLIT_PART(client_location, ' · ', 3)
      ELSE NULL
    END AS city,
    contact_phone,
    contact_email,
    created_at
  FROM ai_chat_sessions
)
SELECT 
  country,
  province,
  city,
  COUNT(*) AS visit_count,
  COUNT(contact_phone) AS leads_count,
  DATE_TRUNC('day', created_at)::date AS visit_date
FROM parsed
GROUP BY country, province, city, DATE_TRUNC('day', created_at)::date
ORDER BY visit_date DESC, visit_count DESC;
```

**用途**：按省/市/日维度分析流量和留资趋势。

### 3. 每日访客统计

```sql
CREATE OR REPLACE VIEW ai_chat_daily_stats AS
SELECT 
  DATE_TRUNC('day', created_at)::date AS visit_date,
  COUNT(*) AS total_visits,
  COUNT(DISTINCT client_ip) AS unique_ips,
  COUNT(contact_phone) AS phone_leads,
  COUNT(contact_email) AS email_leads,
  COUNT(CASE WHEN client_location IS NOT NULL THEN 1 END) AS located_count,
  STRING_AGG(DISTINCT client_location, '、') FILTER (WHERE client_location IS NOT NULL) AS locations
FROM ai_chat_sessions
GROUP BY DATE_TRUNC('day', created_at)::date
ORDER BY visit_date DESC;
```

**用途**：每日概览，包括独立IP数、留资数、定位成功率。

### 4. 热门意向关键词

```sql
CREATE OR REPLACE VIEW ai_chat_intent_stats AS
SELECT 
  COALESCE(contact_intent, '未填写') AS intent,
  COUNT(*) AS count,
  MAX(created_at) AS last_at
FROM ai_chat_sessions
WHERE contact_intent IS NOT NULL AND contact_intent != ''
GROUP BY contact_intent
ORDER BY count DESC;
```

**用途**：分析用户最关注的产品/服务方向。

## 查询函数

### 最近N天地理分布

```sql
CREATE OR REPLACE FUNCTION get_geo_stats_days(days_count INT)
RETURNS TABLE(
  location TEXT,
  visit_count BIGINT,
  lead_count BIGINT,
  first_visit TIMESTAMPTZ,
  last_visit TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(acs.client_location, '未知')::TEXT AS location,
    COUNT(*)::BIGINT AS visit_count,
    COUNT(acs.contact_phone)::BIGINT AS lead_count,
    MIN(acs.created_at) AS first_visit,
    MAX(acs.created_at) AS last_visit
  FROM ai_chat_sessions acs
  WHERE acs.created_at >= NOW() - (days_count || ' days')::INTERVAL
  GROUP BY acs.client_location
  ORDER BY visit_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**调用示例**：
```sql
SELECT * FROM get_geo_stats_days(7);  -- 最近7天
```

## Supabase Dashboard 中使用

1. 打开 Supabase Dashboard → SQL Editor
2. 粘贴上述SQL并执行
3. 切换到 Table Editor → Views，即可看到创建的视图
4. 直接点击视图查看数据，或写查询语句

## 典型分析场景

### 场景1：今日留资概览

```sql
SELECT 
  contact_name,
  contact_phone,
  contact_intent,
  client_location,
  created_at
FROM ai_chat_sessions
WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NOW())
  AND (contact_phone IS NOT NULL OR contact_email IS NOT NULL)
ORDER BY created_at DESC;
```

### 场景2：转化率分析

```sql
SELECT 
  DATE_TRUNC('week', created_at)::date AS week,
  COUNT(*) AS total_chats,
  COUNT(contact_phone) AS phone_leads,
  COUNT(contact_email) AS email_leads,
  ROUND(COUNT(contact_phone)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS phone_conversion_rate
FROM ai_chat_sessions
GROUP BY DATE_TRUNC('week', created_at)::date
ORDER BY week DESC
LIMIT 12;
```

### 场景3：高频问题分析（需解析messages JSONB）

```sql
SELECT 
  m.content AS user_question,
  COUNT(*) AS frequency
FROM ai_chat_sessions,
     LATERAL jsonb_array_elements(messages) AS m
WHERE m->>'role' = 'user'
GROUP BY m->>'content'
ORDER BY frequency DESC
LIMIT 20;
```

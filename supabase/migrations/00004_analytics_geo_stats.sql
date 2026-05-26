-- ============================================
-- 访客地理位置统计分析视图和函数
-- ============================================

-- 1. 按地理位置汇总统计视图
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

-- 2. 按省份/城市拆分统计视图
CREATE OR REPLACE VIEW ai_chat_geo_breakdown AS
WITH parsed AS (
  SELECT 
    id,
    CASE 
      WHEN client_location LIKE '%·%' THEN 
        SPLIT_PART(client_location, ' · ', 1)
      ELSE '未知'
    END AS country,
    CASE 
      WHEN client_location LIKE '%·%' THEN 
        SPLIT_PART(client_location, ' · ', 2)
      ELSE COALESCE(client_location, '未知')
    END AS province,
    CASE 
      WHEN client_location LIKE '%·%·%' THEN 
        SPLIT_PART(client_location, ' · ', 3)
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

-- 3. 每日访客统计视图
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

-- 4. 热门意向关键词统计
CREATE OR REPLACE VIEW ai_chat_intent_stats AS
SELECT 
  COALESCE(contact_intent, '未填写') AS intent,
  COUNT(*) AS count,
  MAX(created_at) AS last_at
FROM ai_chat_sessions
WHERE contact_intent IS NOT NULL AND contact_intent != ''
GROUP BY contact_intent
ORDER BY count DESC;

-- 5. 查询函数：获取最近N天的地理位置分布
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
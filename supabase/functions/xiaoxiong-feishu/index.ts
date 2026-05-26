import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IP地理位置查询结果缓存（单次请求生命周期内）
const geoCache = new Map<string, { location: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟缓存

/**
 * IP地址脱敏处理：隐藏最后一段，保护用户隐私
 * 192.168.1.123 → 192.168.1.xxx
 */
function maskIp(ip: string): string {
  if (!ip || ip === "unknown") return "";
  // IPv4: 隐藏最后一段
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  // IPv6: 隐藏后半部分
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return parts.slice(0, 4).join(":") + ":****";
  }
  return ip;
}

/**
 * 多服务商IP地理位置查询（主备容灾）
 * 策略：ip-api.com(中文) → ipapi.co(英文备) → 本地规则兜底
 */
async function queryGeoLocation(ip: string): Promise<string> {
  if (!ip || ip === "unknown") return "";

  // 检查缓存
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log("Geo cache hit for IP:", maskIp(ip));
    return cached.location;
  }

  // 策略1: ip-api.com（免费，中文，45次/分钟限制）
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const resp = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country&lang=zh-CN`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    const data = await resp.json();
    if (data.status === "success") {
      const parts = [data.country, data.regionName, data.city].filter(Boolean);
      const location = parts.join(" · ");
      geoCache.set(ip, { location, timestamp: Date.now() });
      return location;
    }
  } catch (err) {
    console.log("ip-api.com failed:", (err as Error).message);
  }

  // 策略2: ipapi.co（备选，英文）
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(
      `https://ipapi.co/${ip}/json/?fields=country_name,region,city`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    const data = await resp.json();
    if (data.city && data.country_name) {
      const parts = [data.country_name, data.region, data.city].filter(Boolean);
      const location = parts.join(" · ");
      geoCache.set(ip, { location, timestamp: Date.now() });
      return location;
    }
  } catch (err) {
    console.log("ipapi.co failed:", (err as Error).message);
  }

  // 策略3: 内网/保留地址识别
  if (ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("127.")) {
    return "内网/本地访问";
  }

  return "";
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let body: {
    messages?: Array<{ role: string; content: string }>;
    contact?: {
      name?: string;
      phone?: string;
      email?: string;
      company?: string;
      city?: string;
      intent?: string;
    };
    source?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date().toISOString();
  const sessionId = crypto.randomUUID();

  // 获取用户真实IP（考虑多级代理）
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  // 取X-Forwarded-For第一个（最原始客户端IP）
  const clientIp = forwarded?.split(",")[0]?.trim()
    || realIp
    || "unknown";

  console.log("Client IP:", maskIp(clientIp), "| Forwarded:", forwarded, "| RealIP:", realIp);

  // 查询地理位置（带缓存和多服务商容灾）
  const clientLocation = await queryGeoLocation(clientIp);
  console.log("Client location:", clientLocation || "未识别");

  // IP脱敏存储
  const maskedIp = maskIp(clientIp);

  // 1. 保存到数据库（存储脱敏IP）
  try {
    const { error: dbError } = await supabase.from("ai_chat_sessions").insert({
      id: sessionId,
      source: body.source || "website",
      contact_name: body.contact?.name || null,
      contact_phone: body.contact?.phone || null,
      contact_email: body.contact?.email || null,
      contact_company: body.contact?.company || null,
      contact_city: body.contact?.city || null,
      contact_intent: body.contact?.intent || null,
      client_ip: maskedIp || null,
      client_location: clientLocation || null,
      messages: body.messages || [],
      created_at: now,
    });
    if (dbError) console.error("DB insert error:", dbError);
  } catch (err) {
    console.error("DB insert exception:", err);
  }

  // 2. 推送到飞书（如果配置了 webhook）
  const feishuWebhook = Deno.env.get("FEISHU_WEBHOOK_URL");
  console.log("Feishu webhook:", feishuWebhook ? "已配置" : "未配置");

  if (feishuWebhook) {
    try {
      const msgLines: string[] = [];
      msgLines.push("🤖 **小雄AI助手 - 新的客户对话**");
      msgLines.push("");

      if (body.contact?.name) msgLines.push(`👤 **姓名**：${body.contact.name}`);
      if (body.contact?.phone) msgLines.push(`📱 **电话**：${body.contact.phone}`);
      if (body.contact?.email) msgLines.push(`📧 **邮箱**：${body.contact.email}`);
      if (body.contact?.company) msgLines.push(`🏢 **公司**：${body.contact.company}`);
      if (body.contact?.city) msgLines.push(`📍 **意向城市**：${body.contact.city}`);
      if (body.contact?.intent) msgLines.push(`💡 **意向**：${body.contact.intent}`);

      msgLines.push("");
      msgLines.push("**📊 访客信息：**");
      msgLines.push(`🌐 **IP段**：${maskedIp || "未知"}`);
      if (clientLocation) msgLines.push(`📍 **地理位置**：${clientLocation}`);

      if (body.messages && body.messages.length > 0) {
        msgLines.push("");
        msgLines.push("**💬 对话记录：**");
        for (const m of body.messages.slice(-10)) {
          const role = m.role === "user" ? "👤客户" : "🤖小雄";
          const content = m.content.length > 200 ? m.content.slice(0, 200) + "..." : m.content;
          msgLines.push(`${role}：${content}`);
        }
      }

      msgLines.push("");
      msgLines.push(`⏰ **时间**：${now}`);
      msgLines.push(`🔗 **来源**：${body.source || "website"}`);

      const textContent = msgLines.join("\n");
      console.log("Sending to Feishu, text length:", textContent.length);

      const feishuResp = await fetch(feishuWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "text",
          content: { text: textContent },
        }),
      });

      const feishuResult = await feishuResp.text();
      console.log("Feishu response:", feishuResp.status, feishuResult);
    } catch (err) {
      console.error("Feishu webhook error:", err);
    }
  }

  return new Response(
    JSON.stringify({ success: true, session_id: sessionId }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

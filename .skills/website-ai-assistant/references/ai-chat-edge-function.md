# Edge Function：AI对话（ai-chat）

将大模型API（DeepSeek/文心/OpenAI等）包装为SSE流式响应的Edge Function，供前端直接调用。

## 文件位置

`supabase/functions/ai-chat/index.ts`

## 完整代码

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * 系统提示词 - 定义AI助手的人格、知识库和行为准则
 * 使用时替换为企业的实际信息
 */
const SYSTEM_PROMPT = `你是[企业名称]的AI智能助手[助手名称]。

## 你的身份定位
- 名字：[助手名称]
- 身份：[企业名称]AI智能助手
- 语气：热情、专业、真诚
- 风格：像一位经验丰富的商务顾问在跟客户聊天

## 企业核心知识库
[在此填入企业背景、业务领域、核心产品、联系方式等]

## 工作准则
1. 倾听优先：先了解客户需求，再精准推荐
2. 价值引导：用数据和案例说话
3. 留资引导：在合适的时机自然邀请用户留下联系方式
4. 专业边界：不懂的问题诚实回答，不瞎编
`;

serve(async (req: Request): Promise<Response> => {
  // 处理预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let messages: Array<{ role: string; content: string }>;

  try {
    const body = await req.json();
    messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Missing or invalid messages");
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Invalid request body: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 注入系统提示词（必须放在 messages 开头）
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  // 读取大模型 API Key
  const apiKey = Deno.env.get("AI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: missing AI_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ===== 平台配置区域（根据使用的大模型修改） =====
  // 以下以 DeepSeek 为例，其他平台只需修改这三处：

  const upstreamUrl = "https://api.deepseek.com/v1/chat/completions";
  const modelName = "deepseek-chat";
  const authHeader = `Bearer ${apiKey}`;

  // 如需文心一言，改为：
  // const upstreamUrl = "https://api.baidu.com/...";
  // const modelName = "ERNIE-4.5-Turbo";
  // const authHeader = `Bearer ${apiKey}`;

  // 如需 OpenAI，改为：
  // const upstreamUrl = "https://api.openai.com/v1/chat/completions";
  // const modelName = "gpt-4o";
  // const authHeader = `Bearer ${apiKey}`;
  // =================================================

  const upstream = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,
    },
    body: JSON.stringify({
      model: modelName,
      messages: fullMessages,
      stream: true,
      temperature: 0.7,
    }),
  });

  // 处理限流/欠费
  if (upstream.status === 429 || upstream.status === 402) {
    const errText = await upstream.text();
    return new Response(errText, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ error: `Upstream error: ${upstream.status}` }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 直接透传 SSE 流，不做任何消费
  return new Response(upstream.body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
```

## 部署步骤

```bash
# 1. 保存文件到 supabase/functions/ai-chat/index.ts

# 2. 注册 API Key（在 Supabase Dashboard → Project Settings → Edge Functions）
supabase secrets set AI_API_KEY=sk-xxxxxxxxxx

# 3. 部署
supabase functions deploy ai-chat
```

## 关键设计说明

### 为什么直接透传 body？

上游API返回的是SSE流，如果我们用 `await upstream.json()` 或 `await upstream.text()` 消费响应体，会导致流式传输失效。正确做法是直接透传 `upstream.body`（ReadableStream），让前端自行消费。

### 为什么不用 ky/axios 处理 SSE？

ky 的 `afterResponse` hook 会尝试读取 response body，与 SSE 流冲突，可能导致 502/503 错误。**始终使用标准 `fetch` + `ReadableStream.getReader()`** 处理流式响应。

### CORS 配置

Edge Function 必须返回 `Access-Control-Allow-Origin: *` 头，因为前端从浏览器直接调用，跨域限制严格。

## 故障排查

| 错误 | 原因 | 解决 |
|------|------|------|
| 502 Bad Gateway | 上游API拒绝连接 | 检查API Key有效性、余额、模型名称 |
| 429 Too Many Requests | 触发限流 | 降低调用频率，或升级套餐 |
| 空响应 | stream=true 但消费了body | 确认没有调用 `upstream.json()` |
| 跨域错误 | CORS头缺失 | 检查OPTIONS处理和响应头 |

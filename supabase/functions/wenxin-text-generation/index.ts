import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是"小雄"，雄元科技（XYTECH）的AI智能助手，同时也是国内顶尖的营销高手。你的核心使命是：让每一位访问雄元科技官网的潜在客户，都能感受到雄元科技的科技实力与真诚服务，并最终建立联系。

## 你的身份定位
- 名字：小雄
- 身份：雄元科技AI智能助手 + 国内顶尖营销顾问
- 语气：热情、专业、真诚、略带营销高手的话术魅力，绝不机械和冰冷
- 风格：像一位经验丰富的商务顾问在跟客户微信聊天，自然流畅，善用emoji增加亲和力

## 雄元科技核心知识库

### 企业背景
- 公司名称：北京雄元科技有限公司
- 母公司：中国雄元集团有限公司（前身为中国齐鲁创服集团，2022年更名）
- 起源：2006年，前身为中国齐鲁创服集团（2015年成立），2022年6月更名为中国雄元集团有限公司
- 总部：北京市西城区广义街4号华星大厦
- 办事处：北京、济南、廊坊等地
- 使命：响应"青年强则国家强"号召，致力做全球青年四创四新综合服务平台；为地方提供绿色低碳循环高质量可持续发展综合解决方案；共建清洁美丽世界
- 愿景："国之未来，雄元所向"——"成为全球科技创新引领者，做用户心中最信赖的朋友"
- 核心理念："创新引领 稳健发展" / "稳中求进，行稳致远"
- 团队规模：80+人技术研发团队，100+家合作企业，4大业务领域，3+个省份办事处

### 业务领域
1. **环保能源科技**：绿色低碳循环高质量可持续发展综合解决方案；软硬结合光伏支架、可溯源原料收储运管理系统、AI辅助售电决策系统
2. **AI人工智能应用（XYAI）**：AI+行业产业智能体SaaS平台，为中小企业和大型集团提供从诊断到落地的一站式AI赋能服务
   - 核心优势：平均运营成本降低40%+，人效提升3倍，无需自建AI技术团队
   - 四层产品体系：认知层（行业知识图谱）、执行层（业务流程自动化）、决策层（智能决策辅助）、进化层（持续优化自学习）
   - 六大行业方案：智能制造、智慧零售、智慧物流、智能碳排放管理、智慧光伏运维、智能售电及虚拟电厂
   - AI智能体硬件：AI智能政务服务、AI智能宠物、AI智能手伴
3. **生命科学**：抗衰老机制研究及药物研发，现代生命科学和生物技术产业
4. **高新软硬科技**：智能仿真宠物，具身机器人、低空经济等

### 联系方式
- 地址：北京市西城区广义街4号华星大厦216室
- 电话：18301592576
- 邮箱：hezuo@cnxy.tech
- XYAI官网：ai.cnxy.tech

## 营销高手工作准则

1. **倾听优先**：先了解客户需求，再精准推荐解决方案，不要一上来就推销
2. **价值引导**：用数据和案例说话，比如"我们的XYAI平台已帮助100+家企业平均降低运营成本40%+"
3. **情感连接**：适当使用emoji（😊✨🚀💡等），让对话有温度
4. **留资引导**：在合适的时机，自然地邀请用户留下联系方式，例如：
   - "您的需求我大概了解了，方便留个电话吗？我让专业的商务经理跟您详细沟通"
   - "我可以帮您整理一份针对性的解决方案，您方便留个邮箱或微信吗？"
   - "感觉您对这块很有想法，咱们加个联系方式，后续有最新方案我第一时间推送给您"
5. **不放弃原则**：如果用户暂时没有留资意愿，保持友好，提供有价值的信息，建立信任
6. **专业边界**：不懂的问题诚实回答"这个我需要让更专业的同事来解答"，不瞎编

## 对话示例风格
- 用户：你们做什么的？
- 小雄：嗨！😊 我是小雄，雄元科技的AI助手。我们专注四大领域：环保能源、AI智能体（XYAI平台）、生命科学和高新科技。简单说，我们帮企业用AI和绿色科技降本增效！您是对哪块感兴趣呀？💡

- 用户：XYAI平台是什么？
- 小雄：XYAI是我们自主研发的AI+行业产业智能体SaaS平台✨，核心价值是"让每家企业都用得起AI"。我们有四层架构：认知层帮企业构建行业知识大脑🧠，执行层自动处理重复工作⚡，决策层用数据辅助决策📊，进化层让AI越用越聪明🚀。目前覆盖智能制造、智慧零售、智慧物流等六大行业，平均帮企业降低运营成本40%+，人效提升3倍！您是什么行业的？我可以帮您看看适不适合👀`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let messages: Array<{ role: string; content: string }>;
  let enableThinking = false;

  try {
    const body = await req.json();
    messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Missing or invalid messages");
    }
    if (body.enable_thinking !== undefined) {
      enableThinking = Boolean(body.enable_thinking);
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Invalid request body: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 注入系统提示词（放在 messages 开头）
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error: missing DEEPSEEK_API_KEY" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const upstream = await fetch(
    "https://api.deepseek.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: fullMessages,
        stream: true,
        temperature: 0.7,
      }),
    }
  );

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

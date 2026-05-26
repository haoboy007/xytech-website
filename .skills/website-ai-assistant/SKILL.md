---
name: website-ai-assistant
description: >
  为网站快速搭建AI智能助手（浮动聊天窗口），支持AI对话、访客留资、飞书/钉钉群机器人推送、IP地理位置定位。
  当用户提到以下需求时触发：网站AI客服、智能助手、浮动聊天机器人、在线客服、访客留资、AI对话组件、
  网站嵌入聊天窗口、飞书推送访客信息、网站智能客服系统、AI销售助手。
  适用于企业官网、产品页面、营销落地页等需要AI互动和线索收集的场景。
  技术栈：React + TypeScript + Supabase Edge Functions + SSE流式响应。
---

# 网站智能助手 Skill

## 概述

本技能帮助开发者为网站快速搭建一个**浮动AI智能助手**，具备以下核心能力：

| 能力 | 说明 |
|------|------|
| 🤖 AI对话 | 基于大模型（DeepSeek/文心等）的流式对话 |
| 📝 访客留资 | 对话中收集姓名、电话、邮箱等联系方式 |
| 📤 群机器人推送 | 留资自动推送到飞书/钉钉群 |
| 🌐 IP定位 | 自动识别访客IP和地理位置 |
| 🔒 隐私保护 | IP脱敏存储，符合数据合规要求 |

## 前置条件

- React + TypeScript 项目（Vite/Next.js 均可）
- Supabase 项目（用于 Edge Functions 和数据存储）
- 大模型 API Key（DeepSeek/文心/OpenAI 等）
- （可选）飞书/钉钉群机器人 Webhook 地址

## 快速开始（3步搭建）

### Step 1: 创建数据库表

在 Supabase SQL Editor 中执行：

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
  client_ip TEXT,
  client_location TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: 部署 Edge Functions

复制参考文件中的两个 Edge Function 到项目：

1. `references/ai-chat-edge-function.md` → `supabase/functions/ai-chat/index.ts`
2. `references/lead-push-edge-function.md` → `supabase/functions/lead-push/index.ts`

然后注册环境变量并部署：

```bash
# 注册 secrets
supabase secrets set AI_API_KEY=your-api-key
supabase secrets set FEISHU_WEBHOOK_URL=https://open.feishu.cn/...  # 可选

# 部署
supabase functions deploy ai-chat
supabase functions deploy lead-push
```

### Step 3: 集成前端组件

1. 安装依赖：
```bash
npm install @supabase/supabase-js eventsource-parser lucide-react
```

2. 复制 `references/frontend-component.md` 中的代码到 `src/components/AIAssistant.tsx`

3. 在应用入口引入：
```tsx
import AIAssistant from "@/components/AIAssistant";

function App() {
  return (
    <>
      <YourPages />
      <AIAssistant />
    </>
  );
}
```

## 定制化配置

### 1. 修改AI人格（系统提示词）

在 `ai-chat` Edge Function 中修改 `SYSTEM_PROMPT` 常量：
- 企业名称、产品、联系方式
- 对话风格（专业/活泼/销售导向）
- 留资引导话术

### 2. 修改留资字段

编辑两处：
- **前端**: `AIAssistant.tsx` 中的 `contact` state 和表单输入项
- **后端**: `lead-push` Edge Function 中的 `contact` 类型和数据库插入字段

### 3. 更换大模型

在 `ai-chat` Edge Function 中修改：
- `upstreamUrl`：API 端点地址
- `model`：模型名称
- `Authorization` header：对应平台的鉴权方式

### 4. 更换推送渠道

默认支持飞书，如需钉钉：
- 修改 `lead-push` Edge Function 中的 `fetch` 目标地址和消息格式
- 钉钉格式参考：`{ "msgtype": "text", "text": { "content": "..." } }`

## 技术架构

```
┌─────────────────┐     SSE流式     ┌────────────────────┐
│  AIAssistant    │ ◄────────────► │  ai-chat Edge Fn   │
│  (React组件)    │                │  (大模型API转发)   │
└─────────────────┘                └────────────────────┘
         │
         │ 留资提交
         ▼
┌─────────────────┐     推送        ┌────────────────────┐
│  lead-push      │ ─────────────► │  飞书/钉钉群机器人  │
│  Edge Function  │                │                    │
└─────────────────┘                └────────────────────┘
         │
         │ 存储
         ▼
┌─────────────────┐
│  ai_chat_sessions │
│  (Supabase DB)  │
└─────────────────┘
```

## 参考文件说明

| 文件 | 用途 |
|------|------|
| `references/frontend-component.md` | 前端 React 组件完整代码 |
| `references/ai-chat-edge-function.md` | AI对话 Edge Function 代码 |
| `references/lead-push-edge-function.md` | 留资推送 Edge Function 代码 |
| `references/database-views.md` | 数据分析视图和统计函数 |

## 注意事项

- **隐私合规**：IP地址默认脱敏存储（如 `192.168.1.xxx`），符合最小必要原则
- **缓存策略**：地理位置查询有5分钟内存缓存，避免重复请求
- **超时控制**：IP定位2.5秒超时，不影响主流程
- **CORS**：Edge Function 已配置跨域头，支持前端直接调用
- **流式响应**：使用标准 `fetch` + `ReadableStream` + `eventsource-parser`，避免与 HTTP 客户端库冲突

## 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| AI回复显示"遇到小问题" | Edge Function 502/503 | 检查大模型API Key是否正确、余额是否充足 |
| 飞书没收到推送 | Webhook未配置或群机器人被禁言 | 检查 `FEISHU_WEBHOOK_URL` secret，确认群机器人状态 |
| 定位不准确 | IP为CDN节点IP | 检查 `X-Forwarded-For` 头配置，确保取第一个IP |
| 前端构建报错 `eventsource-parser` | 缺少依赖 | `npm install eventsource-parser` |

## 扩展建议

- **聊天记录持久化**：当前存于内存，可接入 Supabase Realtime 实现多设备同步
- **人工接管**：添加"转人工"按钮，接入客服系统
- **多语言**：系统提示词中加入多语言指示，根据访客IP自动切换
- **敏感词过滤**：在 Edge Function 中添加内容审核层

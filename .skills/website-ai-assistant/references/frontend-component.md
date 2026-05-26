# 前端组件模板：AIAssistant.tsx

完整的浮动AI聊天助手 React 组件，包含：聊天界面、留资表单、SSE流式响应。

## 依赖

```bash
npm install @supabase/supabase-js eventsource-parser lucide-react
# 可选动画库
npm install motion/react
```

## 组件代码

```tsx
// src/components/AIAssistant.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Phone,
  Mail,
  Building2,
  MapPin,
  UserRound,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const AI_CHAT_URL = `${supabaseUrl}/functions/v1/ai-chat`;
const LEAD_PUSH_URL = `${supabaseUrl}/functions/v1/lead-push`;

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "嗨！👋 我是您的AI助手。\n\n我能帮您了解我们的产品服务，有什么可以帮您的吗？💡",
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    city: "",
    intent: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(AI_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("响应体为空");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf8");
      let buffer = "";
      let fullContent = "";

      // 使用 eventsource-parser 解析 SSE 流
      const { createParser } = await import("eventsource-parser");
      const parser = createParser({
        onEvent: (event) => {
          if (!event.data) return;
          for (const chunk of event.data.split("\n")) {
            const line = chunk.trim();
            if (!line) continue;
            try {
              const parsed = JSON.parse(line);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setStreamingContent(fullContent);
              }
            } catch {
              // 忽略解析失败的行
            }
          }
        },
      });

      // 读取流
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          parser.feed(line + "\n");
        }
      }
      // 处理剩余缓冲
      if (buffer) parser.feed(buffer);

      setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "抱歉，我遇到了一点小问题，您可以刷新页面再试试 😅" },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming, messages, supabaseAnonKey]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 提交留资信息
  const handleContactSubmit = async () => {
    if (!contact.name && !contact.phone && !contact.email) {
      setShowContactForm(false);
      return;
    }

    try {
      await fetch(LEAD_PUSH_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          contact: {
            name: contact.name || undefined,
            phone: contact.phone || undefined,
            email: contact.email || undefined,
            company: contact.company || undefined,
            city: contact.city || undefined,
            intent: contact.intent || undefined,
          },
          source: "website-ai-assistant",
        }),
      });
      setContactSubmitted(true);
      setTimeout(() => {
        setShowContactForm(false);
        setContactSubmitted(false);
        setContact({ name: "", phone: "", email: "", company: "", city: "", intent: "" });
      }, 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setContactSubmitted(true);
    }
  };

  const quickReplies = [
    "你们公司是做什么的？",
    "产品有什么优势？",
    "怎么联系你们？",
    "可以介绍一下业务吗？",
  ];

  return (
    <>
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg hover:bg-cyan-600 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* 头部 */}
          <div className="bg-cyan-500 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">AI智能助手</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-cyan-600 rounded p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-cyan-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-cyan-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={line ? "" : "h-2"}>
                      {line}
                    </p>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* 流式输出 */}
            {isStreaming && streamingContent && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-white border border-gray-200 shadow-sm px-3 py-2 text-sm text-gray-800">
                  {streamingContent}
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-cyan-600 animate-spin" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3 py-2 text-sm text-gray-400">
                  思考中...
                </div>
              </div>
            )}

            {/* 快捷回复 */}
            {!isStreaming && messages.length < 3 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      setInput(reply);
                      // 延迟触发发送，让setState生效
                      setTimeout(() => handleSend(), 0);
                    }}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题..."
                disabled={isStreaming}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="w-10 h-10 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowContactForm(true)}
              className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              留下您的联系方式，我们尽快联系您
            </button>
          </div>
        </div>
      )}

      {/* 留资弹窗 */}
      {showContactForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-[360px] max-w-[calc(100vw-40px)] shadow-2xl">
            {contactSubmitted ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-cyan-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">提交成功！</h3>
                <p className="text-sm text-gray-500 mt-2">我们会尽快与您联系</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">留下联系方式</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <UserRound className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="姓名"
                      value={contact.name}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="电话"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="邮箱"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="公司名称"
                      value={contact.company}
                      onChange={(e) => setContact({ ...contact, company: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="所在城市"
                      value={contact.city}
                      onChange={(e) => setContact({ ...contact, city: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="您的需求/意向"
                    value={contact.intent}
                    onChange={(e) => setContact({ ...contact, intent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-300"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleContactSubmit}
                    className="flex-1 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600"
                  >
                    提交
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
```

## 使用说明

1. 复制代码到 `src/components/AIAssistant.tsx`
2. 确保环境变量已配置：`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
3. 修改 `WELCOME_MESSAGE` 中的欢迎语为企业定制内容
4. 修改 `quickReplies` 为企业常见的FAQ快捷入口
5. （可选）使用 Tailwind CSS 或替换为其他样式方案

## 自定义样式

组件使用 Tailwind CSS 类名。如需替换为其他方案：
- 所有 `className` 属性中的 Tailwind 类替换为对应方案的样式
- 保持结构不变（悬浮按钮、聊天窗口、消息列表、输入区、留资弹窗）

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
import { sendStreamRequest } from "@/lib/sse";
import { supabase } from "@/db/supabase";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "嗨！👋 我是**小雄**，雄元科技的AI智能助手。\n\n我能帮您了解雄元科技的业务、XYAI智能体平台、合伙人招募等信息。有什么可以帮您的吗？💡",
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
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const allMessages = [...messages, userMsg];
    abortRef.current = new AbortController();

    let accumulated = "";

    await sendStreamRequest({
      functionUrl: `${supabaseUrl}/functions/v1/wenxin-text-generation`,
      requestBody: {
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
      supabaseAnonKey,
      onData: (data) => {
        if (data === "[DONE]") return;
        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content ?? "";
          accumulated += chunk;
          setStreamingContent(accumulated);
        } catch {
          // 跳过无法解析的帧
        }
      },
      onComplete: () => {
        setMessages((prev) => [...prev, { role: "assistant", content: accumulated }]);
        setStreamingContent("");
        setIsStreaming(false);
        // 对话3轮后自动显示留资表单
        if (allMessages.length >= 5) {
          setTimeout(() => setShowContactForm(true), 800);
        }
      },
      onError: (error) => {
        console.error("Stream error:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "抱歉，我遇到了一点小问题，您可以刷新页面再试试 😅" },
        ]);
        setStreamingContent("");
        setIsStreaming(false);
      },
      signal: abortRef.current.signal,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleContactSubmit = async () => {
    if (!contact.name && !contact.phone && !contact.email) {
      setShowContactForm(false);
      return;
    }

    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/xiaoxiong-feishu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseAnonKey}`,
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
      if (!resp.ok) {
        console.error("Feishu push failed:", resp.status, await resp.text());
      }
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
    "XYAI平台有什么优势？",
    "怎么成为合伙人？",
    "可以介绍一下你们的业务吗？",
  ];

  return (
    <>
      {/* 悬浮按钮 */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center cursor-pointer"
            aria-label="打开AI助手"
          >
            <MessageCircle size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] md:w-[400px] h-[500px] max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                  <Bot size={18} className="text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">小雄 AI助手</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles size={10} className="text-primary" />
                    雄元科技智能客服
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-secondary"
                        : "bg-primary"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={14} className="text-secondary-foreground" />
                    ) : (
                      <Bot size={14} className="text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* 流式内容 */}
              {isStreaming && streamingContent && (
                <div className="flex gap-2.5 flex-row">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-primary">
                    <Bot size={14} className="text-primary-foreground" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap bg-muted text-foreground">
                    {streamingContent}
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
                  </div>
                </div>
              )}

              {/* 快速回复 */}
              {messages.length === 1 && !isStreaming && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {quickReplies.map((text) => (
                    <button
                      key={text}
                      onClick={() => {
                        setInput(text);
                        setTimeout(() => handleSend(), 50);
                      }}
                      className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground/80 rounded-full border border-border/50 transition-colors cursor-pointer"
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}

              {/* 留资引导 */}
              {messages.length >= 3 && !showContactForm && !contactSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center pt-2"
                >
                  <button
                    onClick={() => setShowContactForm(true)}
                    className="px-4 py-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors cursor-pointer font-medium"
                  >
                    💬 留下联系方式，获取专属方案
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入您的问题..."
                  disabled={isStreaming}
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-muted rounded-full border border-border focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                  aria-label="发送"
                >
                  {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center leading-tight">
                对话内容将同步至企业协作平台，便于商务顾问回访跟进
              </p>
            </div>

            {/* 留资表单弹窗 */}
            <AnimatePresence>
              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 z-10"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-[320px] bg-card border border-border rounded-xl p-5 shadow-xl"
                  >
                    {!contactSubmitted ? (
                      <>
                        <div className="text-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                            <Sparkles size={20} className="text-primary" />
                          </div>
                          <h3 className="text-base font-semibold text-foreground">留下联系方式</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            让专业顾问为您提供一对一方案
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">
                            信息将同步至企业协作平台，用于回访跟进
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="relative">
                            <UserRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="您的姓名"
                              value={contact.name}
                              onChange={(e) => setContact((p) => ({ ...p, name: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="tel"
                              placeholder="手机号码"
                              value={contact.phone}
                              onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="email"
                              placeholder="邮箱（选填）"
                              value={contact.email}
                              onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="relative">
                            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="公司名称（选填）"
                              value={contact.company}
                              onChange={(e) => setContact((p) => ({ ...p, company: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="relative">
                            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="所在城市（选填）"
                              value={contact.city}
                              onChange={(e) => setContact((p) => ({ ...p, city: e.target.value }))}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <textarea
                            placeholder="您的需求或意向（选填）"
                            value={contact.intent}
                            onChange={(e) => setContact((p) => ({ ...p, intent: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          />
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setShowContactForm(false)}
                            className="flex-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            稍后再说
                          </button>
                          <button
                            onClick={handleContactSubmit}
                            className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium"
                          >
                            提交
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                          <Sparkles size={24} className="text-green-600" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">提交成功！</h3>
                        <p className="text-xs text-muted-foreground mt-2">
                          我们的商务顾问会尽快与您联系
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          对话记录已推送至协作平台，顾问将参考上下文回访
                        </p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

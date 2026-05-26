# AI 智能助手集成方案

> 基于百度文心一言多模态大模型的 H5 内嵌 AI 助手实践

## 架构设计

```
用户提问 → 前端 UI → Edge Function → 百度文心 API → SSE 流式返回 → 前端渲染
```

## Edge Function 实现

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const WENXIN_API_URL = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.5-turbo';

serve(async (req) => {
  const { messages, system_prompt } = await req.json();
  
  // 获取 access_token（缓存或实时获取）
  const accessToken = await getAccessToken();
  
  // 添加系统提示词，限定为山东同乡助手
  const fullMessages = [
    { role: 'system', content: system_prompt || '你是齐鲁汇AI助手，专为全球山东同乡提供咨询服务。请用亲切、地道的山东风格回答，涉及商业、文化、政策等问题时提供专业建议。' },
    ...messages
  ];
  
  const response = await fetch(`${WENXIN_API_URL}?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: fullMessages,
      stream: true,
      temperature: 0.8,
      max_output_tokens: 2048
    })
  });
  
  // 直接透传 SSE 流
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
});
```

## 前端实现

### 页面结构

```tsx
// AIAssistantPage.tsx
export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('/functions/v1/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      
      // SSE 流式读取
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              if (data.result) {
                assistantContent += data.result;
                setMessages(prev => {
                  const last = [...prev];
                  last[last.length - 1] = { role: 'assistant', content: assistantContent };
                  return last;
                });
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err) {
      toast.error('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* 消息列表 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <Bot className="w-12 h-12 mx-auto mb-4" />
            <p>你好！我是齐鲁汇AI助手</p>
            <p className="text-xs mt-2">可以问我关于山东文化、商业政策、同乡活动等问题</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-md' 
                : 'bg-muted text-foreground rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2.5 rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 快捷问题 */}
      {messages.length < 3 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {quickQuestions.map(q => (
            <button key={q} onClick={() => setInput(q)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80">
              {q}
            </button>
          ))}
        </div>
      )}
      
      {/* 输入框 */}
      <div className="border-t p-4 flex gap-2">
        <Input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="输入问题..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <Button onClick={sendMessage} disabled={loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

### 快捷问题预设

```ts
const quickQuestions = [
  '山东有哪些招商引资优惠政策？',
  '如何加入山东同乡会？',
  '推荐几个济南的创业园区',
  '山东特色文化有哪些？',
  '青岛有哪些适合创业的行业？'
];
```

## 多场景 AI 集成

### 1. 帖子智能摘要

```tsx
// 在帖子详情页添加 AI 摘要按钮
const [aiSummary, setAiSummary] = useState('');

const generateSummary = async () => {
  const response = await fetch('/functions/v1/ai-chat', {
    method: 'POST',
    body: JSON.stringify({
      messages: [{ role: 'user', content: `请为以下内容生成一句话摘要：${post.content}` }],
      system_prompt: '你是一个内容摘要助手，请用简洁的语言概括要点。'
    })
  });
  // ... 解析结果
};
```

### 2. 智能推荐

```tsx
// 首页推荐算法（结合AI）
const getRecommendations = async (userId: string) => {
  const userProfile = await getUserProfile(userId);
  const recentPosts = await getRecentPosts();
  
  // 使用 AI 分析用户兴趣
  const prompt = `用户资料：${JSON.stringify(userProfile)}。请从以下帖子中推荐最相关的5条：${JSON.stringify(recentPosts)}`;
  
  const response = await callAI(prompt);
  return parseRecommendations(response);
};
```

### 3. 客服自动回复

```ts
// Edge Function：自动回复常见问题
export async function autoReply(message: string): Promise<string | null> {
  const faq = {
    '积分': '积分可以通过每日签到、完成任务、发布内容获得。积分商城可兑换好礼。',
    '认证': '个人认证需上传身份证，企业认证需上传营业执照，审核通过后获得认证标识。',
    '活动': '在"活动"页面浏览最新同乡活动，点击即可报名。'
  };
  
  // 简单关键词匹配
  for (const [keyword, reply] of Object.entries(faq)) {
    if (message.includes(keyword)) return reply;
  }
  
  // 无匹配时返回 null，转人工/AI
  return null;
}
```

## 性能优化

1. **消息历史限制**：只传递最近 10 轮对话，避免 token 超限
2. **响应缓存**：常见问题的 AI 回复缓存 1 小时
3. **打字机效果**：SSE 流式输出，用户体验更佳
4. **中断机制**：用户可点击停止生成

```tsx
const abortController = useRef<AbortController | null>(null);

const sendMessage = async () => {
  abortController.current = new AbortController();
  const response = await fetch('/functions/v1/ai-chat', {
    signal: abortController.current.signal
  });
};

const stopGenerating = () => {
  abortController.current?.abort();
};
```

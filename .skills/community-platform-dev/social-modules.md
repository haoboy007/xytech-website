# 高级社交模块扩展参考

> 群聊、直播、短视频等进阶社交功能的数据库设计与前端模式

## 1. 群聊系统

### 数据模型

```sql
-- 群组表
CREATE TABLE chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 200,
  is_public BOOLEAN DEFAULT FALSE,    -- 是否公开可搜索
  category TEXT,                       -- 同乡群/行业群/活动群
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 群成员表
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  nickname_in_group TEXT,             -- 群内昵称
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_message_id UUID,
  UNIQUE(group_id, user_id)
);

-- 群消息表（复用一对一messages表结构，添加group_id）
-- 方案A：扩展messages表添加group_id（推荐）
ALTER TABLE messages ADD COLUMN group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' 
  CHECK (message_type IN ('text', 'image', 'file', 'system'));

-- 方案B：独立group_messages表
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES chat_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  reply_to UUID REFERENCES group_messages(id),  -- 回复某条消息
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 群消息已读追踪
CREATE TABLE group_message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES group_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);
```

### 群聊会话列表（RPC函数）

```sql
CREATE OR REPLACE FUNCTION get_group_conversations(p_user_id UUID)
RETURNS TABLE(
  group_id UUID,
  group_name TEXT,
  group_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.avatar_url,
    gm.content,
    gm.created_at,
    (SELECT COUNT(*) FROM group_messages gm2 
     WHERE gm2.group_id = g.id 
     AND gm2.created_at > COALESCE(
       (SELECT last_read_at FROM group_message_reads 
        WHERE message_id = gm.id AND user_id = p_user_id), 
       '1970-01-01'
     )),
    (SELECT COUNT(*) FROM group_members WHERE group_id = g.id)
  FROM chat_groups g
  JOIN group_members m ON m.group_id = g.id AND m.user_id = p_user_id
  LEFT JOIN LATERAL (
    SELECT content, created_at, id
    FROM group_messages
    WHERE group_id = g.id
    ORDER BY created_at DESC
    LIMIT 1
  ) gm ON true
  ORDER BY gm.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

### 前端群聊页面

```tsx
// ChatGroupPage.tsx
export default function ChatGroupPage() {
  const { id: groupId } = Taro.useRouter().params;
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [input, setInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  
  // 实时订阅群消息
  useEffect(() => {
    const channel = supabase
      .channel(`group:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as GroupMessage]);
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [groupId]);

  const sendMessage = async () => {
    await supabase.from('group_messages').insert({
      group_id: groupId,
      sender_id: userId,
      content: input
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 群聊头部 */}
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <div className="flex items-center gap-2">
          <Avatar src={group?.avatar_url} />
          <div>
            <h2 className="text-sm font-semibold">{group?.name}</h2>
            <p className="text-[10px] text-muted-foreground">{members.length}人</p>
          </div>
        </div>
        <button onClick={() => setShowMembers(true)}>
          <Users className="w-5 h-5" />
        </button>
      </div>
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}>
            <Avatar src={msg.sender?.avatar_url} className="w-8 h-8" />
            <div className={`max-w-[70%] rounded-2xl px-3 py-2 ${
              msg.sender_id === userId ? 'bg-primary text-white' : 'bg-muted'
            }`}>
              {msg.sender_id !== userId && (
                <p className="text-[10px] text-muted-foreground">{msg.sender?.nickname}</p>
              )}
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* 输入框 */}
      <div className="border-t p-3 flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="输入消息..." />
        <Button onClick={sendMessage}><Send className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
```

## 2. 直播系统

### 数据模型

```sql
CREATE TABLE live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  streamer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  -- 直播平台信息（使用第三方服务如腾讯云、声网）
  platform TEXT DEFAULT 'tencent',  -- tencent / agora / 自建
  room_id TEXT,                      -- 第三方平台房间ID
  push_url TEXT,                     -- 推流地址（主播端）
  pull_url TEXT,                     -- 拉流地址（观众端）
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended')),
  scheduled_at TIMESTAMPTZ,          -- 预约直播时间
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  -- 回放
  replay_url TEXT,
  is_replay_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 直播观众
CREATE TABLE live_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(stream_id, user_id)
);

-- 直播评论（弹幕）
CREATE TABLE live_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 直播礼物
CREATE TABLE live_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gift_type TEXT,                    -- 礼物类型
  gift_value INTEGER DEFAULT 0,      -- 积分/金币价值
  message TEXT,                      -- 附言
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 直播状态管理

```ts
// 直播状态自动流转
// Edge Function：定时检查，将超时的直播标记为 ended
export async function checkLiveStatus() {
  const { data } = await supabase
    .from('live_streams')
    .update({ status: 'ended', ended_at: new Date().toISOString() })
    .eq('status', 'live')
    .lt('started_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()); // 4小时超时
}
```

### 前端直播页面

```tsx
// LiveStreamPage.tsx
export default function LiveStreamPage() {
  const { id } = Taro.useRouter().params;
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [isLive, setIsLive] = useState(false);
  
  // 实时订阅弹幕
  useEffect(() => {
    const channel = supabase
      .channel(`live:${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'live_comments',
        filter: `stream_id=eq.${id}`
      }, (payload) => {
        setComments(prev => [...prev.slice(-50), payload.new as LiveComment]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  return (
    <div className="relative h-screen bg-black">
      {/* 视频播放器 */}
      <LivePlayer src={stream?.pull_url} className="absolute inset-0" />
      
      {/* 顶部信息 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <Avatar src={stream?.streamer?.avatar_url} />
          <div>
            <p className="text-white text-sm font-semibold">{stream?.streamer?.nickname}</p>
            <p className="text-white/70 text-xs">{stream?.viewer_count} 人观看</p>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
            stream?.status === 'live' ? 'bg-red-500 text-white' : 'bg-gray-500'
          }`}>
            {stream?.status === 'live' ? 'LIVE' : '回放'}
          </span>
        </div>
      </div>
      
      {/* 弹幕区 */}
      <div className="absolute bottom-20 left-4 right-4 h-40 overflow-hidden">
        <div className="space-y-1">
          {comments.map(c => (
            <div key={c.id} className="flex items-center gap-1 text-white text-sm">
              <span className="text-primary font-medium">{c.user?.nickname}</span>
              <span className="text-white/80">{c.content}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 底部操作 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex gap-3">
        <Input 
          className="flex-1 bg-white/20 text-white placeholder:text-white/50"
          placeholder="发送弹幕..."
        />
        <Button onClick={sendComment}><Send className="w-4 h-4" /></Button>
        <Button variant="ghost" onClick={toggleLike}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>
      </div>
    </div>
  );
}
```

### 直播集成方案

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 腾讯云直播 | SDK完善，微信小程序原生支持 | 按量付费 | 快速上线 |
| 声网Agora | 全球低延迟，互动性强 | 集成复杂 | 跨平台需求 |
| 微信小程序直播组件 | 微信原生，体验好 | 需申请资质 | 微信生态 |

## 3. 短视频系统

### 数据模型

```sql
CREATE TABLE short_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  video_url TEXT NOT NULL,           -- 视频文件URL
  cover_image TEXT,                  -- 封面图
  duration INTEGER,                  -- 时长（秒）
  width INTEGER,
  height INTEGER,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  -- 审核
  audit_status TEXT DEFAULT 'pending',
  -- 推荐算法字段
  score FLOAT DEFAULT 0,             -- 综合得分（热榜排序）
  category TEXT,                     -- 分类标签
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 视频点赞
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES short_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- 视频评论
CREATE TABLE video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES short_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户视频观看记录（用于推荐）
CREATE TABLE video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES short_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  watch_duration INTEGER DEFAULT 0,  -- 实际观看秒数
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

-- 视频收藏
CREATE TABLE video_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES short_videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);
```

### 推荐算法（简化版）

```sql
-- 综合得分计算（每小时更新一次）
UPDATE short_videos SET score = 
  view_count * 1 +
  like_count * 3 +
  comment_count * 5 +
  share_count * 10 +
  (CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 50 ELSE 0 END)
WHERE audit_status = 'approved';

-- 个性化推荐（协同过滤简化版）
CREATE OR REPLACE FUNCTION recommend_videos(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(video_id UUID, score FLOAT) AS $$
BEGIN
  RETURN QUERY
  WITH user_interests AS (
    -- 获取用户感兴趣的视频类别
    SELECT v.category, COUNT(*) as cnt
    FROM video_views vw
    JOIN short_videos v ON v.id = vw.video_id
    WHERE vw.user_id = p_user_id
    GROUP BY v.category
    ORDER BY cnt DESC
    LIMIT 3
  ),
  similar_users AS (
    -- 找到兴趣相似的用户
    SELECT vw.user_id, COUNT(*) as common_videos
    FROM video_views vw
    WHERE vw.video_id IN (
      SELECT video_id FROM video_views WHERE user_id = p_user_id
    )
    AND vw.user_id != p_user_id
    GROUP BY vw.user_id
    ORDER BY common_videos DESC
    LIMIT 20
  )
  SELECT DISTINCT ON (sv.id)
    sv.id,
    sv.score + COALESCE(
      (SELECT 100 FROM user_interests ui WHERE ui.category = sv.category),
      0
    ) as rec_score
  FROM short_videos sv
  WHERE sv.audit_status = 'approved'
    AND sv.id NOT IN (SELECT video_id FROM video_views WHERE user_id = p_user_id)
  ORDER BY rec_score DESC, sv.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### 前端短视频Feed

```tsx
// ShortVideoPage.tsx
export default function ShortVideoPage() {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // 预加载策略
  useEffect(() => {
    const loadVideos = async () => {
      const { data } = await supabase.rpc('recommend_videos', { p_user_id: userId, p_limit: 10 });
      setVideos(data || []);
    };
    loadVideos();
  }, []);

  // 滚动切换视频
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = window.innerHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      // 上报观看数据
      reportWatch(videos[newIndex].id, watchDuration);
    }
  };

  const currentVideo = videos[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
      onScroll={handleScroll}
    >
      {videos.map((video, index) => (
        <div key={video.id} className="h-screen snap-start relative">
          {/* 视频播放器 */}
          <video
            src={video.video_url}
            poster={video.cover_image}
            className="w-full h-full object-cover"
            loop
            playsInline
            autoPlay={index === currentIndex}
            muted={false}
          />
          
          {/* 右侧操作栏 */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center">
            <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center">
              <Heart className={`w-8 h-8 ${video.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              <span className="text-white text-xs mt-1">{video.like_count}</span>
            </button>
            <button onClick={() => showComments(video.id)} className="flex flex-col items-center">
              <MessageCircle className="w-8 h-8 text-white" />
              <span className="text-white text-xs mt-1">{video.comment_count}</span>
            </button>
            <button onClick={() => shareVideo(video.id)} className="flex flex-col items-center">
              <Share2 className="w-8 h-8 text-white" />
              <span className="text-white text-xs mt-1">{video.share_count}</span>
            </button>
          </div>
          
          {/* 底部信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Avatar src={video.user?.avatar_url} className="w-8 h-8" />
              <span className="text-white text-sm font-medium">{video.user?.nickname}</span>
              <Button size="sm" variant="outline" className="text-white border-white text-xs h-6">
                + 关注
              </Button>
            </div>
            <p className="text-white text-sm">{video.description}</p>
            <p className="text-white/60 text-xs mt-1">
              <Music className="w-3 h-3 inline mr-1" />
              原创音乐
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 视频上传与处理

```ts
// 视频上传流程
async function uploadShortVideo(file: File) {
  // 1. 上传到 Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('videos')
    .upload(`shorts/${Date.now()}.mp4`, file);
  
  if (uploadError) throw uploadError;
  
  // 2. 获取视频时长和尺寸（客户端获取或使用Edge Function）
  const { duration, width, height } = await getVideoInfo(file);
  
  // 3. 生成封面图（第一帧）
  const coverUrl = await generateVideoCover(file);
  
  // 4. 创建视频记录
  const { data: video } = await supabase.from('short_videos').insert({
    user_id: userId,
    video_url: uploadData.path,
    cover_image: coverUrl,
    duration,
    width,
    height,
    audit_status: 'pending'  // 先审核后发布
  }).select().single();
  
  return video;
}

// Edge Function：视频转码/压缩（大文件）
// supabase/functions/video-process/index.ts
export async function processVideo(req: Request) {
  const { videoPath } = await req.json();
  
  // 使用 FFmpeg.wasm 或调用第三方转码服务
  // 生成多分辨率版本（360p/720p/1080p）
  // 生成封面图
  // 提取视频元数据
}
```

## 4. 通用实时通信架构

以上所有高级社交模块（群聊、直播弹幕、短视频互动）都依赖 Supabase Realtime：

```ts
// 统一的实时频道管理
class RealtimeChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  
  subscribe(channelName: string, table: string, filter: string, callback: Function) {
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table,
        filter
      }, (payload) => callback(payload.new))
      .subscribe();
    
    this.channels.set(channelName, channel);
    return channel;
  }
  
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }
  
  unsubscribeAll() {
    this.channels.forEach((ch) => supabase.removeChannel(ch));
    this.channels.clear();
  }
}

export const realtimeManager = new RealtimeChannelManager();
```

## 开发优先级建议

| 模块 | 开发难度 | 用户价值 | 推荐优先级 |
|------|---------|---------|-----------|
| 群聊 | 中 | 高 | P1（已有1对1私信基础） |
| 短视频Feed | 高 | 高 | P2（需要推荐算法+视频处理） |
| 直播 | 高 | 中 | P2（需第三方直播服务） |
| 直播回放 | 低 | 中 | P3（依赖直播先完成） |
| 短视频合拍 | 高 | 中 | P3 |
| 群聊@功能 | 低 | 高 | P1 |

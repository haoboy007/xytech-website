# 活动系统设计规范

> 基于活动发布、报名、签到、收藏的完整闭环实践

## 核心实体

```sql
-- 活动表
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,           -- 地址文字描述
  latitude FLOAT,          -- 地图坐标
  longitude FLOAT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  max_participants INTEGER, -- 0 或 null 表示不限
  fee DECIMAL(10,2) DEFAULT 0,
  images TEXT[],           -- 活动封面图
  status TEXT DEFAULT 'upcoming',
  audit_status TEXT DEFAULT 'pending',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 报名表
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered',  -- registered / checked_in / cancelled
  checkin_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

## 活动状态自动流转

```sql
-- 定时任务或触发器更新活动状态
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS VOID AS $$
BEGIN
  UPDATE events SET status = 'ongoing'
  WHERE status = 'upcoming' AND start_time <= NOW();
  
  UPDATE events SET status = 'ended'
  WHERE status = 'ongoing' AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;
```

## 活动列表筛选

```tsx
// EventsPage.tsx
const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'ended'>('all');

const filteredEvents = events.filter(e => {
  if (filter === 'upcoming' && e.status !== 'upcoming') return false;
  if (filter === 'ongoing' && e.status !== 'ongoing') return false;
  if (filter === 'ended' && e.status !== 'ended') return false;
  return true;
});

// 标签页
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '报名中' },
  { key: 'ongoing', label: '进行中' },
  { key: 'ended', label: '已结束' },
];
```

## 活动详情页结构

```tsx
// EventDetailPage.tsx
export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrations, setRegistrations] = useState(0);

  const handleRegister = async () => {
    try {
      await registerForEvent(id!);
      setIsRegistered(true);
      setRegistrations(prev => prev + 1);
      toast.success('报名成功');
    } catch (err) {
      toast.error('报名失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 封面图 */}
      <img src={event?.images?.[0]} className="w-full h-48 object-cover" />
      
      {/* 基本信息 */}
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">{event?.title}</h1>
        
        {/* 时间地点 */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event?.start_time)} - {formatDate(event?.end_time)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>已报名 {registrations} / {event?.max_participants || '不限'} 人</span>
          </div>
          {event?.fee > 0 && (
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              <span>费用: ¥{event?.fee}</span>
            </div>
          )}
        </div>
        
        {/* 活动描述 */}
        <div className="prose prose-sm max-w-none">
          {event?.description}
        </div>
        
        {/* 报名按钮 */}
        <Button 
          className="w-full" 
          disabled={isRegistered || event?.status === 'ended'}
          onClick={handleRegister}
        >
          {isRegistered ? '已报名' : event?.status === 'ended' ? '已结束' : '立即报名'}
        </Button>
      </div>
    </div>
  );
}
```

## 活动签到（QR码）

```tsx
// 活动签到页面（管理员）
export default function EventCheckinPage() {
  const [scanning, setScanning] = useState(false);
  
  const handleCheckin = async (userId: string) => {
    try {
      await checkinUser(eventId, userId);
      toast.success('签到成功');
    } catch (err) {
      toast.error('签到失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">活动签到</h2>
      
      {/* QR 码扫描区域 */}
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">对准用户 QR 码进行扫描</p>
        <Button className="mt-4" onClick={() => setScanning(true)}>
          开始扫描
        </Button>
      </div>
      
      {/* 手动输入 */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">或输入用户ID手动签到</p>
        <Input placeholder="输入用户ID" />
        <Button onClick={() => handleCheckin(inputValue)}>确认签到</Button>
      </div>
      
      {/* 已签到列表 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">已签到 ({checkedInCount})</h3>
        {checkedInList.map(u => (
          <div key={u.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm">{u.nickname}</span>
            <span className="text-xs text-muted-foreground">{formatTime(u.checkin_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### QR 码生成逻辑

```ts
// 用户端：生成报名凭证 QR 码
import QRCode from 'qrcode';

export async function generateEventQRCode(eventId: string, userId: string) {
  // 签名防伪造
  const payload = JSON.stringify({ event_id: eventId, user_id: userId, timestamp: Date.now() });
  const token = await signPayload(payload);  // Edge Function 签名
  const qrData = `${window.location.origin}/checkin?token=${token}`;
  return await QRCode.toDataURL(qrData);
}
```

```ts
// Edge Function：验证签到
// supabase/functions/event-checkin/index.ts
export async function verifyCheckin(token: string) {
  const payload = await verifyToken(token);
  const { event_id, user_id } = payload;
  
  // 检查是否已报名
  const { data: reg } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', event_id)
    .eq('user_id', user_id)
    .single();
  
  if (!reg) return { error: '未报名' };
  if (reg.status === 'checked_in') return { error: '已签到' };
  
  // 更新签到状态
  await supabase
    .from('event_registrations')
    .update({ status: 'checked_in', checkin_at: new Date().toISOString() })
    .eq('id', reg.id);
  
  return { success: true, user_id };
}
```

## 活动收藏

```tsx
const [isFavorited, setIsFavorited] = useState(false);

const toggleFavorite = async () => {
  if (isFavorited) {
    await removeFavorite(eventId);
    setIsFavorited(false);
  } else {
    await addFavorite(eventId);
    setIsFavorited(true);
  }
};

<Button variant="ghost" size="sm" onClick={toggleFavorite}>
  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
</Button>
```

## 后台管理

```tsx
// AdminPage 中活动管理
const renderEvents = () => (
  <div className="space-y-5">
    <SectionHeader icon={<PartyPopper />} title="活动管理" count={events.length} />
    
    {/* 新增按钮 */}
    <Button onClick={() => setShowCreateEvent(true)}>
      <Plus className="w-4 h-4 mr-1" /> 发布活动
    </Button>
    
    {/* 活动列表 */}
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.id} className="bg-card rounded-xl border border-border p-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold">{e.title}</h4>
              <p className="text-xs text-muted-foreground">
                {formatDate(e.start_time)} · {e.location}
              </p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                e.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                e.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {e.status === 'upcoming' ? '报名中' : e.status === 'ongoing' ? '进行中' : '已结束'}
              </span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => viewRegistrations(e.id)}>
                报名名单 ({e.registration_count})
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteEvent(e.id)}>
                删除
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

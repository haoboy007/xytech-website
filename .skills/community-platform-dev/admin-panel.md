# 管理后台设计规范

> 基于 9 个管理模块、35+ 张表的 AdminPage 实践经验

## 核心设计原则

1. **一页管全部**：单页面 Admin，底部 Tab 切换，移动端友好
2. **统计前置**：每个模块顶部展示核心统计数字
3. **操作内联**：列表项内直接提供审核/删除/编辑按钮
4. **搜索+筛选**：每个列表模块标配搜索框和状态筛选

## 底部 Tab 导航设计

```tsx
const tabs = [
  { key: "overview",  label: "概览", icon: <LayoutDashboard /> },
  { key: "content",   label: "内容", icon: <Newspaper /> },
  { key: "verifications", label: "认证", icon: <BadgeCheck /> },
  { key: "users",     label: "用户", icon: <Users /> },
  { key: "finance",   label: "财务", icon: <Wallet /> },
  { key: "points",    label: "积分", icon: <Coins /> },
  { key: "settings",  label: "设置", icon: <Settings /> },
];
```

## 概览页设计模式

### 统计卡片网格

```tsx
// 4-6 个核心指标卡片
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {stats.map(s => (
    <div className={`${s.bg} border ${s.border} rounded-xl p-3 flex flex-col items-center`}>
      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
      <p className="text-[11px] text-muted-foreground">{s.label}</p>
    </div>
  ))}
</div>
```

### 数据趋势图表

```tsx
// 使用 recharts 或自定义 CSS 图表
// 推荐：简单的柱状图/折线图即可
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={200}>
  <BarChart data={dailyStats}>
    <XAxis dataKey="date" tick={{fontSize: 10}} />
    <YAxis tick={{fontSize: 10}} />
    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

## 内容审核模块

### 审核列表项设计

```tsx
// 每个内容项显示：标题/内容摘要 + 状态标签 + 操作按钮
<div className="bg-card rounded-xl border border-border p-3">
  <div className="flex items-start justify-between gap-2">
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-semibold truncate">{item.title}</h4>
      <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusClass}`}>
        {statusLabel}
      </span>
    </div>
    <div className="flex gap-1 shrink-0">
      <Button size="sm" onClick={() => approve(item.id)}>通过</Button>
      <Button size="sm" variant="destructive" onClick={() => reject(item.id)}>拒绝</Button>
    </div>
  </div>
</div>
```

### 批量操作模式

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const toggleSelect = (id: string) => {
  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
};

// 顶部批量操作栏
{selectedIds.length > 0 && (
  <div className="sticky top-14 bg-background border-b p-2 flex items-center gap-2 z-30">
    <span>已选 {selectedIds.length} 项</span>
    <Button onClick={batchApprove}>批量通过</Button>
    <Button variant="destructive" onClick={batchReject}>批量拒绝</Button>
  </div>
)}
```

## 认证中心设计

### 认证列表必须包含

1. **统计卡片**：待审核数、已通过数、个人认证数、企业认证数
2. **到期预警**：30天内到期的认证醒目提示
3. **筛选标签**：全部/待审核/已通过/已拒绝/个人认证/企业认证
4. **搜索**：按用户昵称/姓名/企业名搜索
5. **列表项**：用户信息 + 状态标签 + 类型标签 + 到期时间 + 操作按钮
6. **详情弹窗**：完整认证信息 + 材料图片预览 + 有效期显示 + 通过/拒绝按钮

### 认证有效期管理

```tsx
// 详情中展示有效期状态
{selectedVerification.status === 'approved' && selectedVerification.expires_at && (
  <div className={`rounded-lg p-2.5 text-xs ${
    new Date(selectedVerification.expires_at) < new Date() ? 'bg-red-50 text-red-700' :
    new Date(selectedVerification.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'bg-amber-50 text-amber-700' :
    'bg-green-50 text-green-700'
  }`}>
    有效期至: {new Date(selectedVerification.expires_at).toLocaleDateString("zh-CN")}
    {new Date(selectedVerification.expires_at) < new Date() ? ' (已过期)' :
     new Date(selectedVerification.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? ' (即将到期)' : ' (正常)'}
  </div>
)}
```

## 积分管理模块

### 积分统计

- 总积分发放量 / 消耗量 / 用户持有量
- 每日积分变动趋势图
- 热门商品兑换排行
- 热门任务完成排行

### 订单管理

```tsx
// 订单状态流转：pending -> shipped -> completed / refunded
const orderStatusConfig = {
  pending:  { label: '待发货',  action: '发货', next: 'shipped' },
  shipped:  { label: '已发货',  action: '完成', next: 'completed' },
  completed:{ label: '已完成',  action: null,   next: null },
  refunded: { label: '已退款',  action: null,   next: null },
};
```

### 积分调整

```tsx
// 后台为用户手动增减积分
const handleAdjustPoints = async (userId: string, delta: number, reason: string) => {
  await adjustUserPoints(userId, delta, reason);
  toast.success(delta > 0 ? `已增加 ${delta} 积分` : `已扣除 ${Math.abs(delta)} 积分`);
};
```

## 管理后台 API 模式

```ts
// api.ts 中按模块分组管理后台专用 API

// === Admin APIs ===
export async function getAllPostsForAdmin() { /* 返回所有帖子含待审核 */ }
export async function updatePostAuditStatus(id: string, status: 'approved' | 'rejected', note?: string) {}
export async function updatePostPin(id: string, pinned: boolean) {}
export async function updatePostFeature(id: string, featured: boolean) {}

export async function getAllVerifications() { /* 返回所有认证申请 */ }
export async function updateVerificationStatus(id: string, status: 'approved' | 'rejected', reason?: string) {
  // 通过时自动设置有效期
  const updates: any = { status, reject_reason: reason || null, verified_at: status === 'approved' ? new Date().toISOString() : null };
  if (status === 'approved') {
    const { data: rec } = await supabase.from("user_verifications").select("verification_type").eq("id", id).maybeSingle();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + (rec?.verification_type === 'enterprise' ? 1 : 3));
    updates.expires_at = expires.toISOString();
  }
  await supabase.from("user_verifications").update(updates).eq("id", id);
}

export async function searchUsersWithPoints(query?: string) { /* 用户搜索含积分信息 */ }
export async function adjustUserPoints(userId: string, delta: number, reason: string) {
  await supabase.rpc('adjust_user_points', { p_user_id: userId, p_delta: delta, p_reason: reason });
}

export async function getPointStats() { /* 积分汇总统计 */ }
export async function getPointDailyStats(days: number = 30) { /* 每日积分变动 */ }

export async function getSystemConfigs() {}
export async function updateSystemConfig(key: string, value: string) {}
```

## 权限控制

```tsx
// 路由守卫
const { user, isAdmin } = useAuth();
if (!isAdmin) return <Navigate to="/" />;

// 页面内按钮级权限
{isAdmin && <Button onClick={deleteItem}>删除</Button>}
```
